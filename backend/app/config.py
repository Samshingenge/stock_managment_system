"""
Configuration settings for Stock Management System
"""
import os
from typing import List, Optional
from pydantic import BaseSettings, validator


class Settings(BaseSettings):
    """Application configuration settings"""
    
    # Database settings
    DATABASE_URL: str = "postgresql://stockuser:stockpass123@localhost:5432/stock_management"
    
    # Security settings
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application settings
    APP_NAME: str = "Stock Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # API settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # Pagination defaults
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # File upload settings
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    UPLOAD_FOLDER: str = "uploads"
    
    # Logging settings
    LOG_LEVEL: str = "INFO"
    
    # Security headers
    SECURE_HEADERS: bool = True
    
    # Rate limiting (requests per minute)
    RATE_LIMIT_GENERAL: int = 100
    RATE_LIMIT_AUTH: int = 10
    RATE_LIMIT_EXPORT: int = 5
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str]) -> str:
        if v:
            return v
        # Fallback to individual components if DATABASE_URL not set
        db_user = os.getenv("DB_USER", "stockuser")
        db_password = os.getenv("DB_PASSWORD", "stockpass123")
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME", "stock_management")
        return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()

# Export commonly used settings
DATABASE_URL = settings.DATABASE_URL
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES