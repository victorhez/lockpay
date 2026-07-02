# LockPay Backend

## Getting Started

1. Install dependencies:
```bash
cd backend
python3 -m pip install -r requirements.txt
```

2. Create a `.env` file (optional, uses defaults from config.py):
```env
SECRET_KEY=your-secret-key
NOMBA_SECRET_KEY=your-nomba-secret-key
NOMBA_PUBLIC_KEY=your-nomba-public-key
NOMBA_WEBHOOK_SECRET=your-webhook-secret
```

3. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000
API docs are at http://localhost:8000/docs
