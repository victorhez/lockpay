from fastapi import APIRouter, Request, HTTPException, status
from ...core.config import settings

router = APIRouter()


@router.post("/nomba")
async def handle_nomba_webhook(request: Request):
    # Verify webhook signature here in production
    # For now, just log the payload
    payload = await request.json()
    print(f"Received Nomba webhook: {payload}")

    # Process the webhook (e.g., update deal status, handle refunds, etc.)
    return {"status": "success"}
