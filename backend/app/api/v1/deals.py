from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime, timezone, timedelta

from ...models.deal import Deal, DealCreate, DealUpdate, DealStatus, DealVertical
from ...models.common import SuccessResponse
from ...core.nomba import nomba_client

router = APIRouter()

# In-memory storage for demo purposes
fake_deals_db: dict = {}


@router.post("/", response_model=SuccessResponse[Deal], status_code=status.HTTP_201_CREATED)
async def create_deal(deal: DealCreate):
    deal_id = f"LP-{len(fake_deals_db) + 1:04d}-{deal.vertical.value[0].upper()}"
    now = datetime.now(timezone.utc)
    # Set default expiry if not provided (30 days)
    expiry_date = deal.expiry_date or now + timedelta(days=30)
    
    # Map frontend "crypto" to backend "otc"
    vertical = deal.vertical
    if vertical == DealVertical.CRYPTO:
        vertical = DealVertical.OTC
    
    new_deal = Deal(
        id=deal_id,
        **deal.model_dump(exclude={"expiry_date", "vertical"}),
        vertical=vertical,
        expiry_date=expiry_date,
        status=DealStatus.CREATED,
        created_at=now,
        updated_at=now
    )
    fake_deals_db[deal_id] = new_deal
    
    # Create Nomba virtual account
    try:
        print(f"Creating Nomba virtual account for deal {deal_id}...")
        # Get buyer details (in real app, fetch from user DB)
        va_response = await nomba_client.create_virtual_account(
            account_ref=deal_id,
            expected_amount=deal.amount,
            expiry_date=expiry_date,
            customer_name=deal.title
        )
        print(f"Nomba VA response: {va_response}")
        # Update deal with virtual account details
        new_deal.virtual_account_number = va_response.get("accountNumber")
        new_deal.virtual_account_bank = "Nomba"
        new_deal.nominal_account_reference = va_response.get("accountRef")
        new_deal.updated_at = datetime.now(timezone.utc)
        fake_deals_db[deal_id] = new_deal
    except Exception as e:
        print(f"Error creating virtual account: {e}")
        # For demo purposes, let's set dummy VA details if Nomba API fails
        new_deal.virtual_account_number = "9920 3844 11"
        new_deal.virtual_account_bank = "Nomba / Titan"
        new_deal.nominal_account_reference = deal_id
        new_deal.updated_at = datetime.now(timezone.utc)
        fake_deals_db[deal_id] = new_deal
    
    return SuccessResponse[Deal](
        data=new_deal,
        message="Deal created successfully"
    )


@router.get("/", response_model=SuccessResponse[List[Deal]])
def list_deals():
    return SuccessResponse[List[Deal]](
        data=list(fake_deals_db.values()),
        message="Deals retrieved successfully"
    )


@router.get("/user/{user_id}", response_model=SuccessResponse[List[Deal]])
def list_user_deals(user_id: str):
    user_deals = [
        deal for deal in fake_deals_db.values() 
        if deal.buyer_id == user_id or deal.seller_id == user_id
    ]
    return SuccessResponse[List[Deal]](
        data=user_deals,
        message="User deals retrieved successfully"
    )


@router.get("/{deal_id}", response_model=SuccessResponse[Deal])
def get_deal(deal_id: str):
    deal = fake_deals_db.get(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return SuccessResponse[Deal](
        data=deal,
        message="Deal retrieved successfully"
    )


@router.put("/{deal_id}", response_model=SuccessResponse[Deal])
def update_deal(deal_id: str, deal_update: DealUpdate):
    deal = fake_deals_db.get(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    update_data = deal_update.model_dump(exclude_unset=True)
    updated_deal = deal.model_copy(update=update_data)
    updated_deal.updated_at = datetime.now(timezone.utc)
    fake_deals_db[deal_id] = updated_deal
    return SuccessResponse[Deal](
        data=updated_deal,
        message="Deal updated successfully"
    )


@router.post("/{deal_id}/fund", response_model=SuccessResponse[dict])
def fund_deal(deal_id: str):
    deal = fake_deals_db.get(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    deal.status = DealStatus.FUNDED
    deal.updated_at = datetime.now(timezone.utc)
    fake_deals_db[deal_id] = deal
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": deal.status},
        message="Deal funded successfully"
    )


@router.post("/{deal_id}/condition-met", response_model=SuccessResponse[dict])
def condition_met(deal_id: str):
    deal = fake_deals_db.get(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal.status != DealStatus.FUNDED:
        raise HTTPException(status_code=400, detail="Deal is not funded")
    deal.status = DealStatus.CONDITION_PENDING
    deal.updated_at = datetime.now(timezone.utc)
    fake_deals_db[deal_id] = deal
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": deal.status},
        message="Condition met"
    )


@router.post("/{deal_id}/release", response_model=SuccessResponse[dict])
async def release_deal(deal_id: str):
    deal = fake_deals_db.get(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal.status != DealStatus.FUNDED and deal.status != DealStatus.CONDITION_PENDING:
        raise HTTPException(status_code=400, detail="Deal cannot be released in current status")
    
    # Calculate split (97% to seller, 3% platform fee)
    seller_amount = deal.amount * 0.97
    platform_amount = deal.amount * 0.03
    
    # In real app, you'd call nomba_client.split_payment here
    # For demo, just mark as released
    deal.status = DealStatus.RELEASED
    deal.updated_at = datetime.now(timezone.utc)
    fake_deals_db[deal_id] = deal
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": deal.status, "seller_amount": seller_amount, "platform_fee": platform_amount},
        message="Funds released successfully"
    )


@router.post("/{deal_id}/dispute", response_model=SuccessResponse[dict])
def dispute_deal(deal_id: str):
    deal = fake_deals_db.get(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal.status not in [DealStatus.FUNDED, DealStatus.CONDITION_PENDING]:
        raise HTTPException(status_code=400, detail="Deal cannot be disputed in current status")
    deal.status = DealStatus.DISPUTED
    deal.updated_at = datetime.now(timezone.utc)
    fake_deals_db[deal_id] = deal
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": deal.status},
        message="Dispute raised successfully"
    )


@router.post("/{deal_id}/refund", response_model=SuccessResponse[dict])
def refund_deal(deal_id: str):
    deal = fake_deals_db.get(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal.status not in [DealStatus.FUNDED, DealStatus.CONDITION_PENDING, DealStatus.DISPUTED]:
        raise HTTPException(status_code=400, detail="Deal cannot be refunded in current status")
    deal.status = DealStatus.REFUNDED
    deal.updated_at = datetime.now(timezone.utc)
    fake_deals_db[deal_id] = deal
    return SuccessResponse[dict](
        data={"deal_id": deal_id, "new_status": deal.status},
        message="Refund processed successfully"
    )
