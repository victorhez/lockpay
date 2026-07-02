from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
import uuid

from ...models.dispute import Dispute, DisputeCreate, DisputeUpdate, DisputeStatus
from ...models.common import SuccessResponse
from ...models.db_models import Dispute as DBDispute
from ...core.database import get_db

router = APIRouter()


@router.post("/", response_model=SuccessResponse[Dispute], status_code=status.HTTP_201_CREATED)
def create_dispute(dispute: DisputeCreate, db: Session = Depends(get_db)):
    dispute_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    new_db_dispute = DBDispute(
        id=dispute_id,
        deal_id=dispute.deal_id,
        initiator_id=dispute.initiator_id,
        reason=dispute.reason,
        description=dispute.description,
        status=DisputeStatus.OPEN.value,
        created_at=now,
        updated_at=now
    )
    db.add(new_db_dispute)
    db.commit()
    db.refresh(new_db_dispute)
    new_dispute = Dispute(
        id=new_db_dispute.id,
        deal_id=new_db_dispute.deal_id,
        initiator_id=new_db_dispute.initiator_id,
        reason=new_db_dispute.reason,
        description=new_db_dispute.description,
        status=new_db_dispute.status,
        created_at=new_db_dispute.created_at,
        updated_at=new_db_dispute.updated_at,
        resolution=new_db_dispute.resolution
    )
    return SuccessResponse[Dispute](
        data=new_dispute,
        message="Dispute created successfully"
    )


@router.get("/", response_model=SuccessResponse[List[Dispute]])
def list_disputes(db: Session = Depends(get_db)):
    db_disputes = db.query(DBDispute).all()
    disputes = [
        Dispute(
            id=d.id,
            deal_id=d.deal_id,
            initiator_id=d.initiator_id,
            reason=d.reason,
            description=d.description,
            status=d.status,
            created_at=d.created_at,
            updated_at=d.updated_at,
            resolution=d.resolution
        )
        for d in db_disputes
    ]
    return SuccessResponse[List[Dispute]](
        data=disputes,
        message="Disputes retrieved successfully"
    )


@router.get("/deal/{deal_id}", response_model=SuccessResponse[List[Dispute]])
def get_disputes_by_deal(deal_id: str, db: Session = Depends(get_db)):
    db_disputes = db.query(DBDispute).filter(DBDispute.deal_id == deal_id).all()
    disputes = [
        Dispute(
            id=d.id,
            deal_id=d.deal_id,
            initiator_id=d.initiator_id,
            reason=d.reason,
            description=d.description,
            status=d.status,
            created_at=d.created_at,
            updated_at=d.updated_at,
            resolution=d.resolution
        )
        for d in db_disputes
    ]
    return SuccessResponse[List[Dispute]](
        data=disputes,
        message="Disputes by deal retrieved successfully"
    )


@router.get("/{dispute_id}", response_model=SuccessResponse[Dispute])
def get_dispute(dispute_id: str, db: Session = Depends(get_db)):
    db_dispute = db.query(DBDispute).filter(DBDispute.id == dispute_id).first()
    if not db_dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    dispute = Dispute(
        id=db_dispute.id,
        deal_id=db_dispute.deal_id,
        initiator_id=db_dispute.initiator_id,
        reason=db_dispute.reason,
        description=db_dispute.description,
        status=db_dispute.status,
        created_at=db_dispute.created_at,
        updated_at=db_dispute.updated_at,
        resolution=db_dispute.resolution
    )
    return SuccessResponse[Dispute](
        data=dispute,
        message="Dispute retrieved successfully"
    )


@router.put("/{dispute_id}", response_model=SuccessResponse[Dispute])
def update_dispute(dispute_id: str, dispute_update: DisputeUpdate, db: Session = Depends(get_db)):
    db_dispute = db.query(DBDispute).filter(DBDispute.id == dispute_id).first()
    if not db_dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    update_data = dispute_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(db_dispute, key):
            setattr(db_dispute, key, value)
    db_dispute.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_dispute)
    dispute = Dispute(
        id=db_dispute.id,
        deal_id=db_dispute.deal_id,
        initiator_id=db_dispute.initiator_id,
        reason=db_dispute.reason,
        description=db_dispute.description,
        status=db_dispute.status,
        created_at=db_dispute.created_at,
        updated_at=db_dispute.updated_at,
        resolution=db_dispute.resolution
    )
    return SuccessResponse[Dispute](
        data=dispute,
        message="Dispute updated successfully"
    )
