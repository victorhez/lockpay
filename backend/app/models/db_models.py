from sqlalchemy import Column, String, Float, DateTime, Boolean, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    kyc_tier = Column(Integer, default=0)
    payout_bank_name = Column(String, nullable=True)
    payout_account_number = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    deals_buyer = relationship("Deal", foreign_keys="Deal.buyer_id", back_populates="buyer")
    deals_seller = relationship("Deal", foreign_keys="Deal.seller_id", back_populates="seller")
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    reviews = relationship("Review", back_populates="reviewer")


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    wallet_id = Column(String, ForeignKey("wallets.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    wallet = relationship("Wallet", back_populates="transactions")


class Deal(Base):
    __tablename__ = "deals"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    vertical = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="NGN")
    buyer_id = Column(String, ForeignKey("users.id"), nullable=False)
    seller_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="created")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expiry_date = Column(DateTime(timezone=True))
    virtual_account_number = Column(String)
    virtual_account_bank = Column(String)
    nominal_account_reference = Column(String)
    buyer_confirmed_rendered = Column(Boolean, default=False)
    seller_confirmed_rendered = Column(Boolean, default=False)

    # Relationships
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="deals_buyer")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="deals_seller")
    disputes = relationship("Dispute", back_populates="deal")
    visits = relationship("DealVisit", back_populates="deal")
    activities = relationship("DealActivity", back_populates="deal")
    reviews = relationship("Review", back_populates="deal")


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String, primary_key=True, index=True)
    deal_id = Column(String, ForeignKey("deals.id"), nullable=False)
    initiator_id = Column(String, ForeignKey("users.id"), nullable=False)
    reason = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolution = Column(Text)

    # Relationships
    deal = relationship("Deal", back_populates="disputes")


class DealVisit(Base):
    __tablename__ = "deal_visits"

    id = Column(String, primary_key=True, index=True)
    deal_id = Column(String, ForeignKey("deals.id"), nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    visited_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    deal = relationship("Deal", back_populates="visits")


class DealActivity(Base):
    __tablename__ = "deal_activities"

    id = Column(String, primary_key=True, index=True)
    deal_id = Column(String, ForeignKey("deals.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    activity_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    deal = relationship("Deal", back_populates="activities")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, index=True)
    deal_id = Column(String, ForeignKey("deals.id"), nullable=False)
    reviewer_id = Column(String, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(String, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    deal = relationship("Deal", back_populates="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews")
