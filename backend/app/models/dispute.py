from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DisputeStatus(str, Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    CLOSED = "closed"


class DisputeBase(BaseModel):
    deal_id: str
    initiator_id: str
    reason: str
    description: str
    evidence_urls: Optional[List[str]] = None


class DisputeCreate(DisputeBase):
    pass


class DisputeUpdate(BaseModel):
    status: Optional[DisputeStatus] = None
    resolution: Optional[str] = None


class Dispute(DisputeBase):
    id: str
    status: DisputeStatus = DisputeStatus.OPEN
    created_at: datetime
    updated_at: datetime
    resolution: Optional[str] = None

    class Config:
        from_attributes = True
