from fastapi import APIRouter, HTTPException, status
from typing import List

from ...models.user import User, UserRole
from ...models.common import SuccessResponse

router = APIRouter()

# In-memory storage from auth
from .auth import fake_users_db


@router.get("/", response_model=SuccessResponse[List[User]])
def list_users():
    return SuccessResponse[List[User]](
        data=[record["user"] for record in fake_users_db.values()],
        message="Users retrieved successfully"
    )


@router.get("/{user_id}", response_model=SuccessResponse[User])
def get_user(user_id: str):
    for record in fake_users_db.values():
        if record["user"].id == user_id:
            return SuccessResponse[User](
                data=record["user"],
                message="User retrieved successfully"
            )
    raise HTTPException(status_code=404, detail="User not found")


@router.get("/role/{role}", response_model=SuccessResponse[List[User]])
def get_users_by_role(role: UserRole):
    return SuccessResponse[List[User]](
        data=[record["user"] for record in fake_users_db.values() if record["user"].role == role],
        message="Users by role retrieved successfully"
    )
