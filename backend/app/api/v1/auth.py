from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from ...models.user import User, UserCreate, UserLogin
from ...models.common import SuccessResponse
from ...core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

# In-memory storage for demo purposes
fake_users_db: dict = {}


@router.post("/register", response_model=SuccessResponse[User])
def register(user: UserCreate):
    if user.email in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = get_password_hash(user.password)
    user_id = str(len(fake_users_db) + 1)
    new_user = User(
        id=user_id,
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        role=user.role,
        is_active=True,
        kyc_tier=0
    )
    fake_users_db[user.email] = {
        "hashed_password": hashed_password,
        "user": new_user
    }
    return SuccessResponse[User](
        data=new_user,
        message="User registered successfully"
    )


@router.post("/login", response_model=SuccessResponse[dict])
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user_record = fake_users_db.get(form_data.username)
    if not user_record or not verify_password(form_data.password, user_record["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": form_data.username})
    return SuccessResponse[dict](
        data={"access_token": access_token, "token_type": "bearer", "user": user_record["user"]},
        message="Login successful"
    )
