import resend
from .config import settings

if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY


async def send_deal_invitation(
    to_email: str,
    deal_id: str,
    deal_title: str,
    inviter_name: str,
    amount: float,
    currency: str = "NGN"
):
    if not settings.RESEND_API_KEY:
        print(f"[DEVELOPMENT] Would send invitation email to {to_email} for deal {deal_id}")
        return

    deal_link = f"{settings.FRONTEND_URL}/deals/{deal_id}"

    params = {
        "from": settings.FROM_EMAIL,
        "to": [to_email],
        "subject": f"You've been invited to a deal on LockPay: {deal_title}",
        "html": f"""
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Hi there!</h1>
            <p>{inviter_name} has invited you to a deal on LockPay:</p>
            <h3>{deal_title}</h3>
            <p>Amount: {currency} {amount:,.2f}</p>
            <p><a href="{deal_link}" style="display: inline-block; padding: 10px 20px; background-color: #a3ff6b; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">View Deal</a></p>
            <p>Don't have an account? Sign up at {settings.FRONTEND_URL}/sign-up</p>
        </div>
        """
    }

    try:
        email = resend.Emails.send(params)
        print(f"Sent invitation email to {to_email}, id: {email['id']}")
    except Exception as e:
        print(f"Failed to send email: {e}")


async def send_deal_status_update(
    to_email: str,
    deal_id: str,
    deal_title: str,
    status: str,
    user_name: str
):
    if not settings.RESEND_API_KEY:
        print(f"[DEVELOPMENT] Would send status update email to {to_email} for deal {deal_id}")
        return

    deal_link = f"{settings.FRONTEND_URL}/deals/{deal_id}"

    params = {
        "from": settings.FROM_EMAIL,
        "to": [to_email],
        "subject": f"Deal Status Update: {deal_title} is now {status}",
        "html": f"""
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Hi {user_name}!</h1>
            <p>Your deal "{deal_title}" has been updated to status: {status}</p>
            <p><a href="{deal_link}" style="display: inline-block; padding: 10px 20px; background-color: #a3ff6b; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">View Deal</a></p>
        </div>
        """
    }

    try:
        email = resend.Emails.send(params)
        print(f"Sent status update email to {to_email}, id: {email['id']}")
    except Exception as e:
        print(f"Failed to send email: {e}")
