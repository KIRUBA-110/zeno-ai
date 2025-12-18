"""
Database Setup - SQLAlchemy with SQLite
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Create data directory if it doesn't exist
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Database URL
DATABASE_URL = f"sqlite+aiosqlite:///{os.path.join(DATA_DIR, 'chats.db')}"
SYNC_DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'chats.db')}"

# Async engine for FastAPI
async_engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True
)

# Sync engine for table creation
sync_engine = create_engine(
    SYNC_DATABASE_URL,
    echo=False,
    future=True
)

# Session factory
AsyncSessionLocal = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def init_db():
    """Initialize database tables"""
    from app import models  # Import models to register them
    Base.metadata.create_all(bind=sync_engine)
