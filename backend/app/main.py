from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from .config import settings
from .database import Base, SessionLocal, engine
from .routers import ai, controls, reports, risks


def _migrate() -> None:
    """Add columns introduced after the first release to pre-existing tables.

    Explicit, idempotent ALTERs for tables that Base.metadata.create_all cannot
    evolve in place. New deployments get the full schema from create_all.
    """
    inspector = inspect(engine)
    if "ai_risks" not in inspector.get_table_names():
        return
    existing = {c["name"] for c in inspector.get_columns("ai_risks")}
    with engine.begin() as conn:
        if "taxonomy" not in existing:
            conn.execute(
                text(
                    "ALTER TABLE ai_risks ADD COLUMN taxonomy "
                    "VARCHAR(24) NOT NULL DEFAULT 'ai_rmf'"
                )
            )
        if "owasp_llm_id" not in existing:
            conn.execute(
                text(
                    "ALTER TABLE ai_risks ADD COLUMN owasp_llm_id UUID "
                    "REFERENCES owasp_llm_categories(id)"
                )
            )


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _migrate()
    if settings.seed_on_startup:
        db = SessionLocal()
        try:
            from .seed import seed_all

            seed_all(db)
        finally:
            db.close()
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risks.router)
app.include_router(controls.router)
app.include_router(ai.router)
app.include_router(reports.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "app": settings.app_name, "environment": settings.environment}