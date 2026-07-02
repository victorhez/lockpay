import httpx
import hmac
import hashlib
import base64
import json
from typing import Dict, Optional, Any
from datetime import datetime
from .config import settings


class NombaClient:
    def __init__(self):
        self.base_url = settings.NOMBA_BASE_URL
        self.environment = settings.ENVIRONMENT
        if self.environment == "live":
            self.client_id = settings.NOMBA_LIVE_CLIENT_ID
            self.private_key = settings.NOMBA_LIVE_PRIVATE_KEY
        else:
            self.client_id = settings.NOMBA_TEST_CLIENT_ID
            self.private_key = settings.NOMBA_TEST_PRIVATE_KEY
        self.parent_account_id = settings.NOMBA_PARENT_ACCOUNT_ID
        self.sub_account_id = settings.NOMBA_SUB_ACCOUNT_ID
        self._token: Optional[str] = None
        self._token_expiry: Optional[datetime] = None

    async def _get_access_token(self) -> str:
        if self._token and self._token_expiry and datetime.now() < self._token_expiry:
            return self._token

        payload = {"grant_type": "client_credentials", "client_id": self.client_id}

        headers = {
            "accept": "application/json",
            "content-type": "application/json"
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/oauth2/token",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            self._token = data["access_token"]
            # Set token expiry a bit earlier to avoid edge cases
            self._token_expiry = datetime.fromtimestamp(data["expires_at"] - 300)
            return self._token

    async def _make_request(self, method: str, endpoint: str, payload: Optional[Dict] = None) -> Dict:
        token = await self._get_access_token()
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {token}",
            "accountId": self.parent_account_id
        }

        if self.sub_account_id:
            headers["subAccountId"] = self.sub_account_id

        url = f"{self.base_url}{endpoint}"

        async with httpx.AsyncClient() as client:
            if method.upper() == "GET":
                response = await client.get(url, headers=headers)
            elif method.upper() == "POST":
                response = await client.post(url, headers=headers, json=payload)
            elif method.upper() == "PUT":
                response = await client.put(url, headers=headers, json=payload)
            elif method.upper() == "DELETE":
                response = await client.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            response.raise_for_status()
            return response.json()

    async def create_virtual_account(
        self,
        account_ref: str,
        expected_amount: float,
        expiry_date: datetime,
        customer_name: Optional[str] = None,
        customer_email: Optional[str] = None
    ) -> Dict[str, Any]:
        payload = {
            "accountRef": account_ref,
            "expectedAmount": expected_amount,
            "expiryDate": expiry_date.isoformat(),
        }
        if customer_name:
            payload["customerName"] = customer_name
        if customer_email:
            payload["customerEmail"] = customer_email

        return await self._make_request("POST", "/v1/virtual-accounts", payload)

    async def get_virtual_account(self, account_ref: str) -> Dict[str, Any]:
        return await self._make_request("GET", f"/v1/virtual-accounts/{account_ref}")

    async def split_payment(
        self,
        transaction_reference: str,
        splits: list,
        currency: str = "NGN"
    ) -> Dict[str, Any]:
        payload = {
            "transactionReference": transaction_reference,
            "splits": splits,
            "currency": currency
        }
        return await self._make_request("POST", "/v1/payments/split", payload)

    async def initiate_payment(
        self,
        amount: float,
        email: str,
        currency: str = "NGN",
        reference: Optional[str] = None,
        callback_url: Optional[str] = None
    ) -> Dict[str, Any]:
        payload = {
            "amount": amount,
            "email": email,
            "currency": currency
        }
        if reference:
            payload["reference"] = reference
        if callback_url:
            payload["callbackUrl"] = callback_url

        return await self._make_request("POST", "/v1/payments/initiate", payload)

    def verify_webhook(self, payload: str, signature: str) -> bool:
        if not settings.NOMBA_WEBHOOK_SECRET:
            return True  # Allow all in dev if no secret set

        computed_signature = hmac.new(
            settings.NOMBA_WEBHOOK_SECRET.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(computed_signature, signature)


nomba_client = NombaClient()
