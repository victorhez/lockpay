from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    ESCROW_HOLD = "escrow_hold"
    ESCROW_RELEASE = "escrow_release"
    ESCROW_REFUND = "escrow_refund"
    PLATFORM_FEE = "platform_fee"


class WalletBase(BaseModel):
    user_id: str


class Wallet(WalletBase):
    id: str
    balance: float = 0.0
    currency: str = "NGN"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    wallet_id: str
    amount: float
    type: TransactionType
    reference: Optional[str] = None
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class Transaction(TransactionBase):
    id: str
    status: str = "completed"
    created_at: datetime

    class Config:
        from_attributes = True
