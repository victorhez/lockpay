from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
import uuid

from ...models.wallet import Wallet, Transaction, TransactionCreate
from ...models.common import SuccessResponse
from ...models.db_models import Wallet as DBWallet, Transaction as DBTransaction, User as DBUser
from ...core.database import get_db

router = APIRouter()


@router.post("/", response_model=SuccessResponse[Wallet], status_code=status.HTTP_201_CREATED)
def create_wallet(user_id: str, db: Session = Depends(get_db)):
    existing_user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    existing_wallet = db.query(DBWallet).filter(DBWallet.user_id == user_id).first()
    if existing_wallet:
        raise HTTPException(status_code=400, detail="Wallet already exists for this user")
    wallet_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    new_db_wallet = DBWallet(
        id=wallet_id,
        user_id=user_id,
        balance=0.0,
        created_at=now,
        updated_at=now
    )
    db.add(new_db_wallet)
    db.commit()
    db.refresh(new_db_wallet)
    new_wallet = Wallet(
        id=new_db_wallet.id,
        user_id=new_db_wallet.user_id,
        balance=new_db_wallet.balance,
        created_at=new_db_wallet.created_at,
        updated_at=new_db_wallet.updated_at
    )
    return SuccessResponse[Wallet](
        data=new_wallet,
        message="Wallet created successfully"
    )


@router.get("/user/{user_id}", response_model=SuccessResponse[Wallet])
def get_wallet_by_user(user_id: str, db: Session = Depends(get_db)):
    db_wallet = db.query(DBWallet).filter(DBWallet.user_id == user_id).first()
    if not db_wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    wallet = Wallet(
        id=db_wallet.id,
        user_id=db_wallet.user_id,
        balance=db_wallet.balance,
        created_at=db_wallet.created_at,
        updated_at=db_wallet.updated_at
    )
    return SuccessResponse[Wallet](
        data=wallet,
        message="Wallet retrieved successfully"
    )


@router.get("/{wallet_id}", response_model=SuccessResponse[Wallet])
def get_wallet(wallet_id: str, db: Session = Depends(get_db)):
    db_wallet = db.query(DBWallet).filter(DBWallet.id == wallet_id).first()
    if not db_wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    wallet = Wallet(
        id=db_wallet.id,
        user_id=db_wallet.user_id,
        balance=db_wallet.balance,
        created_at=db_wallet.created_at,
        updated_at=db_wallet.updated_at
    )
    return SuccessResponse[Wallet](
        data=wallet,
        message="Wallet retrieved successfully"
    )


@router.get("/{wallet_id}/transactions", response_model=SuccessResponse[List[Transaction]])
def get_wallet_transactions(wallet_id: str, db: Session = Depends(get_db)):
    db_transactions = db.query(DBTransaction).filter(DBTransaction.wallet_id == wallet_id).all()
    transactions = [
        Transaction(
            id=t.id,
            wallet_id=t.wallet_id,
            amount=t.amount,
            type=t.type,
            description=t.description,
            created_at=t.created_at
        )
        for t in db_transactions
    ]
    return SuccessResponse[List[Transaction]](
        data=transactions,
        message="Transactions retrieved successfully"
    )


@router.post("/{wallet_id}/transactions", response_model=SuccessResponse[Transaction], status_code=status.HTTP_201_CREATED)
def create_transaction(wallet_id: str, transaction: TransactionCreate, db: Session = Depends(get_db)):
    db_wallet = db.query(DBWallet).filter(DBWallet.id == wallet_id).first()
    if not db_wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    transaction_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    new_db_transaction = DBTransaction(
        id=transaction_id,
        wallet_id=wallet_id,
        amount=transaction.amount,
        type=transaction.type.value if hasattr(transaction.type, "value") else str(transaction.type),
        description=transaction.description,
        created_at=now
    )
    db.add(new_db_transaction)
    db.commit()
    db.refresh(new_db_transaction)
    new_transaction = Transaction(
        id=new_db_transaction.id,
        wallet_id=new_db_transaction.wallet_id,
        amount=new_db_transaction.amount,
        type=new_db_transaction.type,
        description=new_db_transaction.description,
        created_at=new_db_transaction.created_at
    )
    return SuccessResponse[Transaction](
        data=new_transaction,
        message="Transaction created successfully"
    )
