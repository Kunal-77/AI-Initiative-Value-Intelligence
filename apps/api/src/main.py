import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.identity.routes import router as identity_router
from src.initiatives.routes import router as initiatives_router, reviews_evidence_router
from src.initiatives.approvals_financials_routes import router as approvals_financials_router
from src.measurements.routes import router as measurements_router
from src.personal.routes import router as personal_router

start_time = time.time()

app = FastAPI(
    title="AI Initiative Value Intelligence API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Setup
# Dynamic origins from environment config with Vercel deployment regex support
origins = settings.get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
def get_root():
    return {
        "service": "AI Initiative Value Intelligence API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
def get_health():
    uptime_seconds = int(time.time() - start_time)
    return {
        "status": "healthy",
        "uptime": f"{uptime_seconds}s",
        "version": "1.0.0"
    }

# Mount domain routing modules
app.include_router(identity_router, prefix="/api/v1", tags=["Identity"])
app.include_router(initiatives_router, prefix="/api/v1")
app.include_router(approvals_financials_router, prefix="/api/v1")
app.include_router(reviews_evidence_router, prefix="/api/v1")
app.include_router(measurements_router, prefix="/api/v1")
app.include_router(personal_router, prefix="/api/v1")
