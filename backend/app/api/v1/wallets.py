from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime, timezone

from ...models.wallet import Wallet, Transaction, TransactionCreate, TransactionType
from ...models.common import SuccessResponse

router = APIRouter()

fake_wallets_db: dict = {}
fake_transactions_db: dict = {}


@router.post("/", response_model=SuccessResponse[Wallet], status_code=status.HTTP_201_CREATED)
def create_wallet(user_id: str):
    for wallet in fake_wallets_db.values():
        if wallet.user_id == user_id:
            raise HTTPException(status_code=400, detail="Wallet already exists for this user")
    wallet_id = str(len(fake_wallets_db) + 1)
    now = datetime.now(timezone.utc)
    new_wallet = Wallet(
        id=wallet_id,
        user_id=user_id,
        balance=0.0,
        created_at=now,
        updated_at=now
    )
    fake_wallets_db[wallet_id] = new_wallet
    return SuccessResponse[Wallet](
        data=new_wallet,
        message="Wallet created successfully"
    )


@router.get("/user/{user_id}", response_model=SuccessResponse[Wallet])
def get_wallet_by_user(user_id: str):
    for wallet in fake_wallets_db.values():
        if wallet.user_id == user_id:
            return SuccessResponse[Wallet](
                data=wallet,
                message="Wallet retrieved successfully"
            )
    raise HTTPException(status_code=404, detail="Wallet not found")


@router.get("/{wallet_id}", response_model=SuccessResponse[Wallet])
def get_wallet(wallet_id: str):
    wallet = fake_wallets_db.get(wallet_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return SuccessResponse[Wallet](
        data=wallet,
        message="Wallet retrieved successfully"
    )


@router.get("/{wallet_id}/transactions", response_model=SuccessResponse[List[Transaction]])
def get_wallet_transactions(wallet_id: str):
    return SuccessResponse[List[Transaction]](
        data=[t for t in fake_transactions_db.values() if t.wallet_id == wallet_id],
        message="Transactions retrieved successfully"
    )


@router.post("/{wallet_id}/transactions", response_model=SuccessResponse[Transaction], status_code=status.HTTP_201_CREATED)
def create_transaction(wallet_id: str, transaction: TransactionCreate):
    wallet = fake_wallets_db.get(wallet_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    transaction_id = str(len(fake_transactions_db) + 1)
    now = datetime.now(timezone.utc)
    new_transaction = Transaction(
        id=transaction_id,
        **transaction.model_dump(),
        wallet_id=wallet_id,
        created_at=now
    )
    fake_transactions_db[transaction_id] = new_transaction
    return SuccessResponse[Transaction](
        data=new_transaction,
        message="Transaction created successfully"
    )
