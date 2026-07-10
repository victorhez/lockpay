from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from ...models.user import User, UserRole, UserUpdate
from ...models.common import SuccessResponse
from ...models.db_models import User as DBUser
from ...core.database import get_db
from ...core.security import get_current_user

router = APIRouter()


@router.get("/me", response_model=SuccessResponse[User])
async def get_current_user_info(current_user: DBUser = Depends(get_current_user)):
    user = User(
        id=current_user.id,
        email=current_user.email,
        phone=current_user.phone,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        kyc_tier=current_user.kyc_tier,
        payout_bank_name=current_user.payout_bank_name,
        payout_account_number=current_user.payout_account_number
    )
    return SuccessResponse[User](
        data=user,
        message="User retrieved successfully"
    )


@router.put("/me", response_model=SuccessResponse[User])
async def update_current_user_info(
    user_update: UserUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(current_user)
    user = User(
        id=current_user.id,
        email=current_user.email,
        phone=current_user.phone,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        kyc_tier=current_user.kyc_tier,
        payout_bank_name=current_user.payout_bank_name,
        payout_account_number=current_user.payout_account_number
    )
    return SuccessResponse[User](
        data=user,
        message="User updated successfully"
    )


@router.get("/", response_model=SuccessResponse[List[User]])
def list_users(db: Session = Depends(get_db)):
    db_users = db.query(DBUser).all()
    users = [
        User(
            id=u.id,
            email=u.email,
            phone=u.phone,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active,
            kyc_tier=u.kyc_tier,
            payout_bank_name=u.payout_bank_name,
            payout_account_number=u.payout_account_number
        )
        for u in db_users
    ]
    return SuccessResponse[List[User]](
        data=users,
        message="Users retrieved successfully"
    )


@router.get("/{user_id}", response_model=SuccessResponse[User])
def get_user(user_id: str, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    user = User(
        id=db_user.id,
        email=db_user.email,
        phone=db_user.phone,
        full_name=db_user.full_name,
        role=db_user.role,
        is_active=db_user.is_active,
        kyc_tier=db_user.kyc_tier,
        payout_bank_name=db_user.payout_bank_name,
        payout_account_number=db_user.payout_account_number
    )
    return SuccessResponse[User](
        data=user,
        message="User retrieved successfully"
    )


@router.get("/email/{email}", response_model=SuccessResponse[User])
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    user = User(
        id=db_user.id,
        email=db_user.email,
        phone=db_user.phone,
        full_name=db_user.full_name,
        role=db_user.role,
        is_active=db_user.is_active,
        kyc_tier=db_user.kyc_tier,
        payout_bank_name=db_user.payout_bank_name,
        payout_account_number=db_user.payout_account_number
    )
    return SuccessResponse[User](
        data=user,
        message="User retrieved successfully"
    )


@router.get("/role/{role}", response_model=SuccessResponse[List[User]])
def get_users_by_role(role: UserRole, db: Session = Depends(get_db)):
    db_users = db.query(DBUser).filter(DBUser.role == role.value).all()
    users = [
        User(
            id=u.id,
            email=u.email,
            phone=u.phone,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active,
            kyc_tier=u.kyc_tier,
            payout_bank_name=u.payout_bank_name,
            payout_account_number=u.payout_account_number
        )
        for u in db_users
    ]
    return SuccessResponse[List[User]](
        data=users,
        message="Users by role retrieved successfully"
    )
