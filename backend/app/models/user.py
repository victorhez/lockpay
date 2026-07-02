from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    BUYER = "buyer"
    SELLER = "seller"
    FREELANCER = "freelancer"
    CLIENT = "client"
    VERIFIER = "verifier"
    ADMIN = "admin"


class UserBase(BaseModel):
    email: EmailStr
    phone: str
    full_name: str
    role: UserRole = UserRole.BUYER


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: str
    is_active: bool = True
    kyc_tier: int = 0

    class Config:
        from_attributes = True
