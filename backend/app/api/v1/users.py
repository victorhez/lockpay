from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from sqlalchemy.orm import Session

from ...models.user import User, UserRole
from ...models.common import SuccessResponse
from ...models.db_models import User as DBUser
from ...core.database import get_db

router = APIRouter()


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
            kyc_tier=u.kyc_tier
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
        kyc_tier=db_user.kyc_tier
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
            kyc_tier=u.kyc_tier
        )
        for u in db_users
    ]
    return SuccessResponse[List[User]](
        data=users,
        message="Users by role retrieved successfully"
    )
