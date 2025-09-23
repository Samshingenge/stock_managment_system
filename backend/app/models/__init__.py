"""
SQLAlchemy models for Stock Management System
"""
from .product import Product
from .supplier import Supplier  
from .transaction import StockTransaction

# Simple User model for authentication
from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    active: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

__all__ = ["Product", "Supplier", "StockTransaction", "User", "UserInDB"]
