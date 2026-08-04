# Deployment Guide — Production Setup

## 1. Prerequisites
- Node.js v20.x or higher & npm v10.x
- Python 3.10+ & `venv`
- PostgreSQL 15+ database (e.g. Supabase, AWS RDS, or GCP Cloud SQL)
- Clerk Authentication API Keys

---

## 2. Environment Variables Configuration

### Web Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Python API Backend (`apps/api/.env`)
```env
DATABASE_URL=postgresql+psycopg://postgres:password@db.supabase.com:6543/postgres?sslmode=require
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...
```

---

## 3. Build & Production Start Commands

### Web App (Next.js)
```bash
cd apps/web
npm install
npm run build
npm run start
```

### Backend (FastAPI)
```bash
cd apps/api
.\venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn src.main:app --host 0.0.0.0 --port 8000
```
