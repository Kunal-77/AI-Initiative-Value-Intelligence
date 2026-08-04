import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.identity.routes import router as identity_router
from src.initiatives.routes import router as initiatives_router, reviews_evidence_router
from src.measurements.routes import router as measurements_router

start_time = time.time()

app = FastAPI(
    title="AI Initiative Value Intelligence API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Setup
# In development, Next.js typically runs on port 3000.
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(reviews_evidence_router, prefix="/api/v1")
app.include_router(measurements_router, prefix="/api/v1")
