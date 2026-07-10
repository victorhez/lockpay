from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import uuid

from ...models.user import User, UserCreate
from ...models.common import SuccessResponse
from ...models.db_models import User as DBUser
from ...core.security import get_password_hash, verify_password, create_access_token
from ...core.database import get_db

router = APIRouter()


@router.post("/register", response_model=SuccessResponse[User])
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = get_password_hash(user.password)
    user_id = str(uuid.uuid4())
    new_db_user = DBUser(
        id=user_id,
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        hashed_password=hashed_password,
        is_active=True,
        kyc_tier=0
    )
    db.add(new_db_user)
    db.commit()
    db.refresh(new_db_user)

    # Create a wallet for the user
    from ...models.db_models import Wallet as DBWallet
    wallet_id = str(uuid.uuid4())
    new_wallet = DBWallet(
        id=wallet_id,
        user_id=user_id,
        balance=0.0
    )
    db.add(new_wallet)
    db.commit()

    new_user = User(
        id=new_db_user.id,
        email=new_db_user.email,
        phone=new_db_user.phone,
        full_name=new_db_user.full_name,
        role=new_db_user.role,
        is_active=new_db_user.is_active,
        kyc_tier=new_db_user.kyc_tier,
        payout_bank_name=new_db_user.payout_bank_name,
        payout_account_number=new_db_user.payout_account_number
    )
    return SuccessResponse[User](
        data=new_user,
        message="User registered successfully"
    )


@router.post("/login", response_model=SuccessResponse[dict])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.email == form_data.username).first()
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
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
    access_token = create_access_token(data={"sub": db_user.email})
    return SuccessResponse[dict](
        data={"access_token": access_token, "token_type": "bearer", "user": user},
        message="Login successful"
    )
