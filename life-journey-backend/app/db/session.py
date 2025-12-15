from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.db import base  # noqa: F401 ensure models are imported before metadata creation
from app.models.base import Base


engine_kwargs: dict = {
  "echo": settings.environment == "development",
  "pool_pre_ping": True,
}

if settings.database_url.startswith("sqlite"):
  engine_kwargs["connect_args"] = {"check_same_thread": False}
  engine_kwargs["poolclass"] = NullPool

engine = create_engine(settings.database_url, **engine_kwargs)

if engine.url.get_backend_name() == "sqlite":
  Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()
