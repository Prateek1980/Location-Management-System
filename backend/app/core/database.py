from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import get_required_env

# DATABASE CONFIGURATION
DATABASE_URL = get_required_env("DATABASE_URL")

# SQLALCHEMY SETUP
engine = create_engine(DATABASE_URL)

# CREATE A DB SESSION FACTORY
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# BASE CLASS FOR MODELS
Base = declarative_base()
