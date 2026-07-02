from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime, timezone

from ...models.dispute import Dispute, DisputeCreate, DisputeUpdate, DisputeStatus
from ...models.common import SuccessResponse

router = APIRouter()

fake_disputes_db: dict = {}


@router.post("/", response_model=SuccessResponse[Dispute], status_code=status.HTTP_201_CREATED)
def create_dispute(dispute: DisputeCreate):
    dispute_id = str(len(fake_disputes_db) + 1)
    now = datetime.now(timezone.utc)
    new_dispute = Dispute(
        id=dispute_id,
        **dispute.model_dump(),
        status=DisputeStatus.OPEN,
        created_at=now,
        updated_at=now
    )
    fake_disputes_db[dispute_id] = new_dispute
    return SuccessResponse[Dispute](
        data=new_dispute,
        message="Dispute created successfully"
    )


@router.get("/", response_model=SuccessResponse[List[Dispute]])
def list_disputes():
    return SuccessResponse[List[Dispute]](
        data=list(fake_disputes_db.values()),
        message="Disputes retrieved successfully"
    )


@router.get("/deal/{deal_id}", response_model=SuccessResponse[List[Dispute]])
def get_disputes_by_deal(deal_id: str):
    return SuccessResponse[List[Dispute]](
        data=[d for d in fake_disputes_db.values() if d.deal_id == deal_id],
        message="Disputes by deal retrieved successfully"
    )


@router.get("/{dispute_id}", response_model=SuccessResponse[Dispute])
def get_dispute(dispute_id: str):
    dispute = fake_disputes_db.get(dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    return SuccessResponse[Dispute](
        data=dispute,
        message="Dispute retrieved successfully"
    )


@router.put("/{dispute_id}", response_model=SuccessResponse[Dispute])
def update_dispute(dispute_id: str, dispute_update: DisputeUpdate):
    dispute = fake_disputes_db.get(dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    update_data = dispute_update.model_dump(exclude_unset=True)
    updated_dispute = dispute.model_copy(update=update_data)
    updated_dispute.updated_at = datetime.now(timezone.utc)
    fake_disputes_db[dispute_id] = updated_dispute
    return SuccessResponse[Dispute](
        data=updated_dispute,
        message="Dispute updated successfully"
    )
