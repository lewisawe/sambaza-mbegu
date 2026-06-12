from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db import driver


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    driver.close()


app = FastAPI(title="Sambaza Mbegu", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Original routes
from app.routes import seeds, farmers, stats, ai  # noqa: E402
app.include_router(seeds.router, prefix="/api/seeds", tags=["seeds"])
app.include_router(farmers.router, prefix="/api/farmers", tags=["farmers"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(ai.router, prefix="/api/seeds", tags=["ai"])

# Seed Exchange routes
from app.routes import auth, listings, exchanges, verification, analytics, sms, ussd, whatsapp  # noqa: E402
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(listings.router, prefix="/api/listings", tags=["listings"])
app.include_router(exchanges.router, prefix="/api/exchanges", tags=["exchanges"])
app.include_router(verification.router, prefix="/api/verification", tags=["verification"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(sms.router, prefix="/api/sms", tags=["sms"])
app.include_router(ussd.router, prefix="/api/ussd", tags=["ussd"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["whatsapp"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
