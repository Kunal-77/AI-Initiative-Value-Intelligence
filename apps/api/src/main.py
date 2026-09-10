import time
import logging
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.database import Base, engine
import src.identity.models
import src.initiatives.models
import src.measurements.models
import src.personal.models

from src.identity.routes import router as identity_router
from src.initiatives.routes import router as initiatives_router, reviews_evidence_router
from src.initiatives.approvals_financials_routes import router as approvals_financials_router
from src.measurements.routes import router as measurements_router
from src.personal.routes import router as personal_router

logger = logging.getLogger("aivi.api")
start_time = time.time()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is initialized on startup
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.warning(f"Database table initialization warning: {e}")
    yield

app = FastAPI(
    title="AI Initiative Value Intelligence API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
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

@app.get("/health/db")
def get_db_health():
    from sqlalchemy import text
    from src.core.database import SessionLocal
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "database": "unreachable",
                "detail": str(e)
            }
        )
    finally:
        db.close()
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
    )

# Mount domain routing modules
app.include_router(identity_router, prefix="/api/v1", tags=["Identity"])
app.include_router(initiatives_router, prefix="/api/v1")
app.include_router(approvals_financials_router, prefix="/api/v1")
app.include_router(reviews_evidence_router, prefix="/api/v1")
app.include_router(measurements_router, prefix="/api/v1")
app.include_router(personal_router, prefix="/api/v1")
