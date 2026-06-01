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

from app.routes import seeds, farmers, stats  # noqa: E402

app.include_router(seeds.router, prefix="/api/seeds", tags=["seeds"])
app.include_router(farmers.router, prefix="/api/farmers", tags=["farmers"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])

@app.get("/api/health")
async def health():
    return {"status": "ok"}
