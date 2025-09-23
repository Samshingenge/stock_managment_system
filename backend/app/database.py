"""
Database configuration and session management
"""
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator
import logging
import os

from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add detailed logging for debugging
def log_environment_info():
    """Log environment information for debugging"""
    logger.info("=== ENVIRONMENT DEBUG INFO ===")
    logger.info(f"DATABASE_URL from settings: {settings.DATABASE_URL}")
    logger.info(f"DATABASE_URL from env: {os.getenv('DATABASE_URL', 'NOT SET')}")
    logger.info(f"DB_HOST: {os.getenv('DB_HOST', 'NOT SET')}")
    logger.info(f"DB_PORT: {os.getenv('DB_PORT', 'NOT SET')}")
    logger.info(f"DB_NAME: {os.getenv('DB_NAME', 'NOT SET')}")
    logger.info(f"DB_USER: {os.getenv('DB_USER', 'NOT SET')}")
    logger.info(f"DB_PASSWORD: {'*' * len(os.getenv('DB_PASSWORD', '')) if os.getenv('DB_PASSWORD') else 'NOT SET'}")
    logger.info(f"DEBUG mode: {settings.DEBUG}")
    logger.info("=== END ENVIRONMENT DEBUG INFO ===")

# Log environment info first
log_environment_info()

# Create SQLAlchemy engine
logger.info(f"Creating database engine with URL: {settings.DATABASE_URL.replace(settings.DATABASE_URL.split('://')[1].split('@')[0], '***')}")
try:
    engine = create_engine(
        settings.DATABASE_URL,
        # Connection pool settings
        pool_size=20,
        max_overflow=0,
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=300,    # Recycle connections every 5 minutes
        echo=settings.DEBUG, # Log SQL queries in debug mode
    )
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    raise

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Metadata for reflection
metadata = MetaData()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency that provides database session
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database tables
    """
    logger.info("Starting database initialization...")
    try:
        # Import all models to register them with Base
        logger.info("Importing models...")
        from app.models import product, supplier, transaction
        logger.info("Models imported successfully")

        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")

    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise


def check_db_connection() -> bool:
    """
    Check if database connection is working
    """
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            return result.fetchone() is not None
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return False


def get_db_info() -> dict:
    """
    Get database information
    """
    try:
        with engine.connect() as connection:
            # Get database version
            version_result = connection.execute("SELECT version()")
            version = version_result.fetchone()[0] if version_result.rowcount > 0 else "Unknown"
            
            # Get current database name
            db_result = connection.execute("SELECT current_database()")
            db_name = db_result.fetchone()[0] if db_result.rowcount > 0 else "Unknown"
            
            # Get current user
            user_result = connection.execute("SELECT current_user")
            user = user_result.fetchone()[0] if user_result.rowcount > 0 else "Unknown"
            
            return {
                "version": version,
                "database": db_name,
                "user": user,
                "url": settings.DATABASE_URL.replace(
                    settings.DATABASE_URL.split("://")[1].split("@")[0], "***"
                )  # Hide credentials
            }
    except Exception as e:
        logger.error(f"Error getting database info: {e}")
        return {"error": str(e)}


# Database health check
def health_check() -> dict:
    """
    Database health check for monitoring
    """
    try:
        is_connected = check_db_connection()
        info = get_db_info() if is_connected else {}
        
        return {
            "database": {
                "status": "healthy" if is_connected else "unhealthy",
                "connected": is_connected,
                **info
            }
        }
    except Exception as e:
        return {
            "database": {
                "status": "error",
                "connected": False,
                "error": str(e)
            }
        }