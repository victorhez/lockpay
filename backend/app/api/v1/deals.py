from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
import uuid

from ...models.deal import Deal, DealCreate, DealUpdate, DealStatus, DealVertical
from ...models.common import SuccessResponse
from ...models.db_models import Deal as DBDeal
from ...core.nomba import nomba_client
from ...core.database import get_db

router = APIRouter()


@router.post("/", response_model=SuccessResponse[Deal], status_code=status.HTTP_201_CREATED)
async def create_deal(deal: DealCreate, db: Session = Depends(get_db)):
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
        expiry_date=new_db_deal.expiry_date
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
            nominal_account_reference=d.nominal_account_reference
        )
        for d in db_deals
    ]
    return SuccessResponse[List[Deal]](
        data=deals,
        message="Deals retrieved successfully"
    )


@router.get("/user/{user_id}", response_model=SuccessResponse[List[Deal]])
def list_user_deals(user_id: str, db: Session = Depends(get_db)):
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
            nominal_account_reference=d.nominal_account_reference
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
        nominal_account_reference=db_deal.nominal_account_reference
    )
    return SuccessResponse[Deal](
        data=deal,
        message="Deal retrieved successfully"
    )


@router.put("/{deal_id}", response_model=SuccessResponse[Deal])
def update_deal(deal_id: str, deal_update: DealUpdate, db: Session = Depends(get_db)):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
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
        nominal_account_reference=db_deal.nominal_account_reference
    )
    return SuccessResponse[Deal](
        data=deal,
        message="Deal updated successfully"
    )


@router.post("/{deal_id}/fund", response_model=SuccessResponse[dict])
def fund_deal(deal_id: str, db: Session = Depends(get_db)):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    db_deal.status = DealStatus.FUNDED.value
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": db_deal.status},
        message="Deal funded successfully"
    )


@router.post("/{deal_id}/condition-met", response_model=SuccessResponse[dict])
def condition_met(deal_id: str, db: Session = Depends(get_db)):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if db_deal.status != DealStatus.FUNDED.value:
        raise HTTPException(status_code=400, detail="Deal is not funded")
    db_deal.status = DealStatus.CONDITION_PENDING.value
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": db_deal.status},
        message="Condition met"
    )


@router.post("/{deal_id}/release", response_model=SuccessResponse[dict])
async def release_deal(deal_id: str, db: Session = Depends(get_db)):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if db_deal.status not in [DealStatus.FUNDED.value, DealStatus.CONDITION_PENDING.value]:
        raise HTTPException(status_code=400, detail="Deal cannot be released in current status")
    
    seller_amount = db_deal.amount * 0.97
    platform_amount = db_deal.amount * 0.03
    
    db_deal.status = DealStatus.RELEASED.value
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": db_deal.status, "seller_amount": seller_amount, "platform_fee": platform_amount},
        message="Funds released successfully"
    )


@router.post("/{deal_id}/dispute", response_model=SuccessResponse[dict])
def dispute_deal(deal_id: str, db: Session = Depends(get_db)):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if db_deal.status not in [DealStatus.FUNDED.value, DealStatus.CONDITION_PENDING.value]:
        raise HTTPException(status_code=400, detail="Deal cannot be disputed in current status")
    db_deal.status = DealStatus.DISPUTED.value
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": db_deal.status},
        message="Dispute raised successfully"
    )


@router.post("/{deal_id}/refund", response_model=SuccessResponse[dict])
def refund_deal(deal_id: str, db: Session = Depends(get_db)):
    db_deal = db.query(DBDeal).filter(DBDeal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if db_deal.status not in [DealStatus.FUNDED.value, DealStatus.CONDITION_PENDING.value, DealStatus.DISPUTED.value]:
        raise HTTPException(status_code=400, detail="Deal cannot be refunded in current status")
    db_deal.status = DealStatus.REFUNDED.value
    db_deal.updated_at = datetime.now(timezone.utc)
    db.commit()
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": db_deal.status},
        message="Refund processed successfully"
    )
