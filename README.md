# LockPay

A secure escrow platform built for Nigerian P2P transactions, powered by Nomba APIs.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TanStack Router + React Query + Tailwind
- **Backend**: FastAPI (Python) + SQLAlchemy ORM + SQLite
- **Hosting Options**:
  - Frontend: Vercel (Free)
  - Backend: Render (Free)

## Database Choice Explanation

We're using **SQLite** for this project! Here's why:
- Perfect for MVP and early-stage projects
- Zero configuration needed (file-based DB)
- Free, no database hosting costs
- Works perfectly with free hosting platforms (Render, etc.)
- Easy to migrate to PostgreSQL later if needed

## Local Development Setup

### 1. Environment Variables

First, copy the example env files:
```bash
cp .env.example .env
cd backend
cp .env.example .env
# Edit backend/.env with your actual Nomba credentials
```

### 2. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run the App

#### Frontend
```bash
npm run dev
```
Frontend will be available at: http://localhost:5173

#### Backend
```bash
cd backend
uvicorn app.main:app --reload
```
Backend will be available at: http://localhost:8000

## Deployment Guide

### Frontend on Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variable:
   - `VITE_API_BASE_URL` = Your backend URL (e.g., https://lockpay-backend.onrender.com/api/v1)
4. Deploy!

### Backend on Render

1. Push your code to GitHub
2. Go to [Render.com](https://render.com) and create a new "Web Service"
3. Connect your GitHub repo
4. Configure service:
   - **Name**: lockpay-backend
   - **Runtime**: Python
   - **Plan**: Free
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add the environment variables from `backend/.env.example` in Render dashboard:
   - `SECRET_KEY` (generate a strong one with `openssl rand -hex 32`)
   - All Nomba credentials
   - `CORS_ORIGINS` (add your Vercel frontend URL)
6. Deploy!

### Important Notes

- Keep all `.env` files out of Git (already in .gitignore!)
- Always use environment variables for secrets
- For production, consider upgrading to PostgreSQL (Render offers free small PostgreSQL instances)

## Features

- User authentication (sign-up, login)
- Deal creation with escrow via Nomba virtual accounts
- Deal lifecycle management (fund, confirm, release, dispute)
- Responsive UI for mobile and desktop
- Proper error handling and validation
- Secure key management via environment variables
