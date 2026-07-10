from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime


class DealStatus(str, Enum):
    CREATED = "created"
    FUNDED = "funded"
    CONDITION_PENDING = "condition_pending"
    RELEASED = "released"
    DISPUTED = "disputed"
    REFUNDED = "refunded"
    EXPIRED = "expired"


class DealVertical(str, Enum):
    RENTAL = "rental"
    LAND = "land"
    MARKETPLACE = "marketplace"
    FREELANCE = "freelance"
    OTC = "otc"
    CRYPTO = "crypto"  # Map frontend "crypto" to "otc" internally


class Milestone(BaseModel):
    id: str
    description: str
    amount: float
    is_approved: bool = False
    approved_at: Optional[datetime] = None


class DocumentChecklistItem(BaseModel):
    id: str
    name: str
    is_verified: bool = False


class DealBase(BaseModel):
    title: str
    description: str
    vertical: DealVertical
    amount: float
    currency: str = "NGN"
    buyer_id: str
    seller_id: str
    verifier_id: Optional[str] = None
    milestones: Optional[List[Milestone]] = None
    checklist: Optional[List[DocumentChecklistItem]] = None
    expiry_date: Optional[datetime] = None


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[DealStatus] = None


class Deal(DealBase):
    id: str
    status: DealStatus = DealStatus.CREATED
    created_at: datetime
    updated_at: datetime
    virtual_account_number: Optional[str] = None
    virtual_account_bank: Optional[str] = None
    nominal_account_reference: Optional[str] = None
    buyer_confirmed_rendered: bool = False
    seller_confirmed_rendered: bool = False

    class Config:
        from_attributes = True
