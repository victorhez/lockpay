from fastapi import APIRouter, HTTPException, status, Depends, Request
from typing import List
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
import uuid

from ...models.deal import Deal, DealCreate, DealUpdate, DealStatus, DealVertical
from ...models.common import SuccessResponse
from ...models.db_models import (
    Deal as DBDeal, 
    User as DBUser, 
    DealVisit as DBDealVisit, 
    DealActivity as DBDealActivity,
    Review as DBReview
)
from ...models.analytics import DealVisit, DealActivity, Review, ReviewCreate
from ...core.nomba import nomba_client
from ...core.database import get_db
from ...core.security import get_current_user
from ...core.email import send_deal_invitation, send_deal_status_update

router = APIRouter()


def create_deal_activity(
    db: Session, 
    deal_id: str, 
    activity_type: str, 
    description: str, 
    user_id: str | None = None
):
    activity = DBDealActivity(
        id=str(uuid.uuid4()),
        deal_id=deal_id,
        user_id=user_id,
        activity_type=activity_type,
        description=description
    )
    db.add(activity)
    db.commit()


@router.post("/", response_model=SuccessResponse[Deal], status_code=status.HTTP_201_CREATED)
async def create_deal(
    deal: DealCreate, 
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    deal_id = f"LP-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc)
    expiry_date = deal.expiry_date or now + timedelta(days=30)
    
    vertical = deal.vertical
    if vertical == DealVertical.CRYPTO:
        vertical = DealVertical.OTC
    
    new_db_deal = DBDeal(
        id=deal_id,
        title=deal.title,
        description=deal.description,
        vertical=vertical.value if hasattr(vertical, "value") else str(vertical),
        amount=deal.amount,
        currency=deal.currency or "NGN",
        buyer_id=deal.buyer_id,
        seller_id=deal.seller_id,
        status=DealStatus.CREATED.value,
        expiry_date=expiry_date,
        created_at=now,
        updated_at=now
    )
    db.add(new_db_deal)
    db.commit()
    db.refresh(new_db_deal)
    
    # Create deal activity
    create_deal_activity(db, deal_id, "DEAL_CREATED", f"Deal created by {current_user.full_name}", current_user.id)
    
    # Get counterparty to send email
    counterparty_id = deal.seller_id if current_user.id == deal.buyer_id else deal.buyer_id
    counterparty = db.query(DBUser).filter(DBUser.id == counterparty_id).first()
    if counterparty:
        await send_deal_invitation(
            counterparty.email,
            deal_id,
            deal.title,
            current_user.full_name,
            deal.amount,
            deal.currency or "NGN"
        )
    
    new_deal = Deal(
        id=new_db_deal.id,
        title=new_db_deal.title,
        description=new_db_deal.description,
        vertical=new_db_deal.vertical,
        amount=new_db_deal.amount,
        currency=new_db_deal.currency,
        buyer_id=new_db_deal.buyer_id,
        seller_id=new_db_deal.seller_id,
        status=new_db_deal.status,
        created_at=new_db_deal.created_at,
        updated_at=new_db_deal.updated_at,
        expiry_date=new_db_deal.expiry_date,
        virtual_account_number=new_db_deal.virtual_account_number,
        virtual_account_bank=new_db_deal.virtual_account_bank,
        nominal_account_reference=new_db_deal.nominal_account_reference,
        buyer_confirmed_rendered=new_db_deal.buyer_confirmed_rendered,
        seller_confirmed_rendered=new_db_deal.seller_confirmed_rendered
    )
    
    try:
        print(f"Creating Nomba virtual account for deal {deal_id}...")
        va_response = await nomba_client.create_virtual_account(
            account_ref=deal_id,
            expected_amount=deal.amount,
            expiry_date=expiry_date,
            customer_name=deal.title
        )
        print(f"Nomba VA response: {va_response}")
        new_db_deal.virtual_account_number = va_response.get("accountNumber")
        new_db_deal.virtual_account_bank = "Nomba"
        new_db_deal.nominal_account_reference = va_response.get("accountRef")
        new_db_deal.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(new_db_deal)
        new_deal.virtual_account_number = new_db_deal.virtual_account_number
        new_deal.virtual_account_bank = new_db_deal.virtual_account_bank
        new_deal.nominal_account_reference = new_db_deal.nominal_account_reference
        new_deal.updated_at = new_db_deal.updated_at
        create_deal_activity(db, deal_id, "VA_CREATED", "Virtual account created successfully")
    except Exception as e:
        print(f"Error creating virtual account: {e}")
        new_db_deal.virtual_account_number = "9920 3844 11"
        new_db_deal.virtual_account_bank = "Nomba / Titan"
        new_db_deal.nominal_account_reference = deal_id
        new_db_deal.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(new_db_deal)
        new_deal.virtual_account_number = new_db_deal.virtual_account_number
        new_deal.virtual_account_bank = new_db_deal.virtual_account_bank
        new_deal.nominal_account_reference = new_db_deal.nominal_account_reference
        new_deal.updated_at = new_db_deal.updated_at
    
    return SuccessResponse[Deal](
        data=new_deal,
        message="Deal created successfully"
    )


@router.get("/", response_model=SuccessResponse[List[Deal]])
def list_deals(db: Session = Depends(get_db)):
    db_deals = db.query(DBDeal).all()
    deals = [
        Deal(
            id=d.id,
            title=d.title,
            description=d.description,
            vertical=d.vertical,
            amount=d.amount,
            currency=d.currency,
            buyer_id=d.buyer_id,
            seller_id=d.seller_id,
            status=d.status,
            created_at=d.created_at,
            updated_at=d.updated_at,
            expiry_date=d.expiry_date,
            virtual_account_number=d.virtual_account_number,
            virtual_account_bank=d.virtual_account_bank,
            nominal_account_reference=d.nominal_account_reference,
            buyer_confirmed_rendered=d.buyer_confirmed_rendered,
            seller_confirmed_rendered=d.seller_confirmed_rendered
        )
        for d in db_deals
    ]
    return SuccessResponse[List[Deal]](
        data=deals,
        message="Deals retrieved successfully"
    )


@router.get("/user/{user_id}", response_model=SuccessResponse[List[Deal]])
def list_user_deals(
    user_id: str, 
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_deals = db.query(DBDeal).filter(
        (DBDeal.buyer_id == user_id) | (DBDeal.seller_id == user_id)
    ).all()
    deals = [
        Deal(
            id=d.id,
            title=d.title,
            description=d.description,
            vertical=d.vertical,
            amount=d.amount,
            currency=d.currency,
            buyer_id=d.buyer_id,
            seller_id=d.seller_id,
            status=d.status,
            created_at=d.created_at,
            updated_at=d.updated_at,
            expiry_date=d.expiry_date,
            virtual_account_number=d.virtual_account_number,
            virtual_account_bank=d.virtual_account_bank,
            nominal_account_reference=d.nominal_account_reference,
            buyer_confirmed_rendered=d.buyer_confirmed_rendered,
            seller_confirmed_rendered=d.seller_confirmed_rendered
        )
        for d in db_deals
    ]
    return SuccessResponse[List[Deal]](
        data=deals,
        message="User deals retrieved successfully"
    )


@router.get("/{deal_id}", response_model=SuccessResponse[Deal])
def get_deal(deal_id: str, db: Session = Depends(get_db)):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    deal = Deal(
        id=db_deal.id,
        title=db_deal.title,
        description=db_deal.description,
        vertical=db_deal.vertical,
        amount=db_deal.amount,
        currency=db_deal.currency,
        buyer_id=db_deal.buyer_id,
        seller_id=db_deal.seller_id,
        status=db_deal.status,
        created_at=db_deal.created_at,
        updated_at=db_deal.updated_at,
        expiry_date=db_deal.expiry_date,
        virtual_account_number=db_deal.virtual_account_number,
        virtual_account_bank=db_deal.virtual_account_bank,
        nominal_account_reference=db_deal.nominal_account_reference,
        buyer_confirmed_rendered=db_deal.buyer_confirmed_rendered,
        seller_confirmed_rendered=db_deal.seller_confirmed_rendered
    )
    return SuccessResponse[Deal](
        data=deal,
        message="Deal retrieved successfully"
    )


@router.post("/{deal_id}/visit", response_model=SuccessResponse[DealVisit])
async def track_deal_visit(
    deal_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    visit_id = str(uuid.uuid4())
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    new_visit = DBDealVisit(
        id=visit_id,
        deal_id=deal_id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(new_visit)
    db.commit()
    db.refresh(new_visit)
    
    return SuccessResponse[DealVisit](
        data=DealVisit(
            id=new_visit.id,
            deal_id=new_visit.deal_id,
            ip_address=new_visit.ip_address,
            user_agent=new_visit.user_agent,
            visited_at=new_visit.visited_at
        ),
        message="Visit tracked successfully"
    )


@router.get("/{deal_id}/analytics", response_model=SuccessResponse[dict])
def get_deal_analytics(
    deal_id: str,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if current_user.id not in [db_deal.buyer_id, db_deal.seller_id]:
        raise HTTPException(status_code=403, detail="You're not authorized to view this deal's analytics")
    
    # Get visits
    visits = db.query(DBDealVisit).filter(DBDealVisit.deal_id == deal_id).all()
    # Get activities
    activities = db.query(DBDealActivity).filter(DBDealActivity.deal_id == deal_id).order_by(DBDealActivity.created_at.desc()).all()
    # Get reviews
    reviews = db.query(DBReview).filter(DBReview.deal_id == deal_id).all()
    
    return SuccessResponse[dict](
        data={
            "visits_count": len(visits),
            "activities": [
                DealActivity(
                    id=a.id,
                    deal_id=a.deal_id,
                    user_id=a.user_id,
                    activity_type=a.activity_type,
                    description=a.description,
                    created_at=a.created_at
                )
                for a in activities
            ],
            "reviews": [
                Review(
                    id=r.id,
                    deal_id=r.deal_id,
                    reviewer_id=r.reviewer_id,
                    reviewee_id=r.reviewee_id,
                    rating=r.rating,
                    comment=r.comment,
                    created_at=r.created_at
                )
                for r in reviews
            ]
        },
        message="Analytics retrieved successfully"
    )


@router.post("/{deal_id}/confirm-rendered", response_model=SuccessResponse[Deal])
def confirm_service_rendered(
    deal_id: str,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if current_user.id == db_deal.buyer_id:
        db_deal.buyer_confirmed_rendered = True
        create_deal_activity(db, deal_id, "BUYER_CONFIRMED", "Buyer confirmed service/goods rendered", current_user.id)
    elif current_user.id == db_deal.seller_id:
        db_deal.seller_confirmed_rendered = True
        create_deal_activity(db, deal_id, "SELLER_CONFIRMED", "Seller confirmed service/goods rendered", current_user.id)
    else:
        raise HTTPException(status_code=403, detail="You're not part of this deal")
    
    # If both confirmed, automatically release funds
    if db_deal.buyer_confirmed_rendered and db_deal.seller_confirmed_rendered:
        db_deal.status = DealStatus.RELEASED.value
        create_deal_activity(db, deal_id, "FUNDS_RELEASED", "Both parties confirmed, funds released to seller")
    
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_deal)
    
    deal = Deal(
        id=db_deal.id,
        title=db_deal.title,
        description=db_deal.description,
        vertical=db_deal.vertical,
        amount=db_deal.amount,
        currency=db_deal.currency,
        buyer_id=db_deal.buyer_id,
        seller_id=db_deal.seller_id,
        status=db_deal.status,
        created_at=db_deal.created_at,
        updated_at=db_deal.updated_at,
        expiry_date=db_deal.expiry_date,
        virtual_account_number=db_deal.virtual_account_number,
        virtual_account_bank=db_deal.virtual_account_bank,
        nominal_account_reference=db_deal.nominal_account_reference,
        buyer_confirmed_rendered=db_deal.buyer_confirmed_rendered,
        seller_confirmed_rendered=db_deal.seller_confirmed_rendered
    )
    
    return SuccessResponse[Deal](
        data=deal,
        message="Confirmation received successfully"
    )


@router.post("/{deal_id}/reviews", response_model=SuccessResponse[Review])
def create_review(
    deal_id: str,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if db_deal.status != DealStatus.RELEASED.value:
        raise HTTPException(status_code=400, detail="Can only review completed deals")
    
    if current_user.id not in [db_deal.buyer_id, db_deal.seller_id]:
        raise HTTPException(status_code=403, detail="You're not part of this deal")
    
    # Check if user already reviewed
    existing_review = db.query(DBReview).filter(
        DBReview.deal_id == deal_id,
        DBReview.reviewer_id == current_user.id
    ).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="You've already reviewed this deal")
    
    reviewee_id = db_deal.seller_id if current_user.id == db_deal.buyer_id else db_deal.buyer_id
    
    new_review = DBReview(
        id=str(uuid.uuid4()),
        deal_id=deal_id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    create_deal_activity(
        db, 
        deal_id, 
        "REVIEW_ADDED", 
        f"{current_user.full_name} left a {review_data.rating}-star review", 
        current_user.id
    )
    
    return SuccessResponse[Review](
        data=Review(
            id=new_review.id,
            deal_id=new_review.deal_id,
            reviewer_id=new_review.reviewer_id,
            reviewee_id=new_review.reviewee_id,
            rating=new_review.rating,
            comment=new_review.comment,
            created_at=new_review.created_at
        ),
        message="Review added successfully"
    )


@router.put("/{deal_id}", response_model=SuccessResponse[Deal])
def update_deal(
    deal_id: str, 
    deal_update: DealUpdate, 
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if current_user.id not in [db_deal.buyer_id, db_deal.seller_id]:
        raise HTTPException(status_code=403, detail="You're not part of this deal")
    
    update_data = deal_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(db_deal, key):
            setattr(db_deal, key, value)
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_deal)
    
    deal = Deal(
        id=db_deal.id,
        title=db_deal.title,
        description=db_deal.description,
        vertical=db_deal.vertical,
        amount=db_deal.amount,
        currency=db_deal.currency,
        buyer_id=db_deal.buyer_id,
        seller_id=db_deal.seller_id,
        status=db_deal.status,
        created_at=db_deal.created_at,
        updated_at=db_deal.updated_at,
        expiry_date=db_deal.expiry_date,
        virtual_account_number=db_deal.virtual_account_number,
        virtual_account_bank=db_deal.virtual_account_bank,
        nominal_account_reference=db_deal.nominal_account_reference,
        buyer_confirmed_rendered=db_deal.buyer_confirmed_rendered,
        seller_confirmed_rendered=db_deal.seller_confirmed_rendered
    )
    
    return SuccessResponse[Deal](
        data=deal,
        message="Deal updated successfully"
    )


@router.post("/{deal_id}/fund", response_model=SuccessResponse[dict])
def fund_deal(
    deal_id: str, 
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if current_user.id != db_deal.buyer_id:
        raise HTTPException(status_code=403, detail="Only buyer can mark as funded")
    
    db_deal.status = DealStatus.FUNDED.value
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    create_deal_activity(db, deal_id, "DEAL_FUNDED", "Buyer marked deal as funded", current_user.id)
    
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": db_deal.status},
        message="Deal funded successfully"
    )


@router.post("/{deal_id}/condition-met", response_model=SuccessResponse[dict])
def condition_met(
    deal_id: str, 
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if current_user.id not in [db_deal.buyer_id, db_deal.seller_id]:
        raise HTTPException(status_code=403, detail="You're not part of this deal")
    
    if db_deal.status != DealStatus.FUNDED.value:
        raise HTTPException(status_code=400, detail="Deal is not funded")
    
    db_deal.status = DealStatus.CONDITION_PENDING.value
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    create_deal_activity(db, deal_id, "CONDITION_PENDING", "Conditions pending confirmation", current_user.id)
    
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": db_deal.status},
        message="Condition met"
    )


@router.post("/{deal_id}/release", response_model=SuccessResponse[dict])
async def release_deal(
    deal_id: str, 
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if current_user.id not in [db_deal.buyer_id, db_deal.seller_id]:
        raise HTTPException(status_code=403, detail="You're not part of this deal")
    
    if db_deal.status not in [DealStatus.FUNDED.value, DealStatus.CONDITION_PENDING.value]:
        raise HTTPException(status_code=400, detail="Deal cannot be released in current status")
    
    seller_amount = db_deal.amount * 0.97
    platform_amount = db_deal.amount * 0.03
    
    db_deal.status = DealStatus.RELEASED.value
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    create_deal_activity(db, deal_id, "FUNDS_RELEASED", f"Funds released by {current_user.full_name}", current_user.id)
    
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": db_deal.status, "seller_amount": seller_amount, "platform_fee": platform_amount},
        message="Funds released successfully"
    )


@router.post("/{deal_id}/dispute", response_model=SuccessResponse[dict])
def dispute_deal(
    deal_id: str, 
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if current_user.id not in [db_deal.buyer_id, db_deal.seller_id]:
        raise HTTPException(status_code=403, detail="You're not part of this deal")
    
    if db_deal.status not in [DealStatus.FUNDED.value, DealStatus.CONDITION_PENDING.value]:
        raise HTTPException(status_code=400, detail="Deal cannot be disputed in current status")
    
    db_deal.status = DealStatus.DISPUTED.value
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    create_deal_activity(db, deal_id, "DISPUTE_RAISED", f"Dispute raised by {current_user.full_name}", current_user.id)
    
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": db_deal.status},
        message="Dispute raised successfully"
    )


@router.post("/{deal_id}/refund", response_model=SuccessResponse[dict])
def refund_deal(
    deal_id: str, 
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if current_user.id not in [db_deal.buyer_id, db_deal.seller_id]:
        raise HTTPException(status_code=403, detail="You're not part of this deal")
    
    if db_deal.status not in [DealStatus.FUNDED.value, DealStatus.CONDITION_PENDING.value, DealStatus.DISPUTED.value]:
        raise HTTPException(status_code=400, detail="Deal cannot be refunded in current status")
    
    db_deal.status = DealStatus.REFUNDED.value
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    create_deal_activity(db, deal_id, "REFUND_PROCESSED", "Refund processed", current_user.id)
    
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": db_deal.status},
        message="Refund processed successfully"
    )
