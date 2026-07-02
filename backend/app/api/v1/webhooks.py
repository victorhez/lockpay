from fastapi import APIRouter, Request, HTTPException, status
from ...core.nomba import nomba_client

router = APIRouter()


@router.post("/nomba")
async def handle_nomba_webhook(request: Request):
    # Get raw body for signature verification
    raw_body = await request.body()
    payload_str = raw_body.decode("utf-8")

    # Get headers from Nomba
    signature = request.headers.get("nomba-signature", "")
    timestamp = request.headers.get("nomba-timestamp", "")

    # Verify the webhook signature using Nomba's verification method
    if not nomba_client.verify_webhook(payload_str, signature, timestamp):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid webhook signature"
        )

    # Parse and log the payload
    import json
    payload = json.loads(payload_str)
    print(f"Received Nomba webhook: {payload}")

    # TODO: Process webhook processing here (e.g., update deal status when payment_success)
    event_type = payload.get("event_type")
    if event_type == "payment_success":
        # Extract transaction = payload["data"]["transaction"]
        print(f"Processing successful payment!")

    return {"status": "success"}
