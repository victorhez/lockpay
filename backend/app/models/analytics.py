from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DealVisitBase(BaseModel):
    deal_id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class DealVisitCreate(DealVisitBase):
    pass


class DealVisit(DealVisitBase):
    id: str
    visited_at: datetime

    class Config:
        from_attributes = True


class DealActivityBase(BaseModel):
    deal_id: str
    user_id: Optional[str] = None
    activity_type: str
    description: Optional[str] = None


class DealActivityCreate(DealActivityBase):
    pass


class DealActivity(DealActivityBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewBase(BaseModel):
    deal_id: str
    reviewer_id: str
    reviewee_id: str
    rating: int
    comment: Optional[str] = None


class ReviewCreate(BaseModel):
    deal_id: str
    rating: int
    comment: Optional[str] = None


class Review(ReviewBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
