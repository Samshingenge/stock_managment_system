"""
Stock Transaction model for Stock Management System
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, CheckConstraint, Text
from sqlalchemy.types import DECIMAL as Decimal
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base
from enum import Enum

class TransactionType(str, Enum):
    """Transaction types"""
    IN = "in"
    OUT = "out"
    ADJUSTMENT = "adjustment"
    RETURN = "return"
    TRANSFER = "transfer"



class StockTransaction(Base):
    """Stock transaction model"""
    
    __tablename__ = "stock_transactions"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign keys
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Transaction details
    transaction_type = Column(String(20), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Decimal(10, 2), nullable=False)
    total_amount = Column(Decimal(12, 2), nullable=False)
    
    # Reference and notes
    reference_number = Column(String(255), index=True)
    notes = Column(Text)
    created_by = Column(String(255), default="system")
    
    # Timestamps
    transaction_date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="transactions")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("transaction_type IN ('stock_in', 'stock_out', 'adjustment')", name="check_transaction_type"),
        CheckConstraint("unit_price >= 0", name="check_unit_price_positive"),
    )
    
    def __repr__(self):
        return f"<StockTransaction(id={self.id}, type={self.transaction_type}, quantity={self.quantity}, product_id={self.product_id})>"
    
    @property
    def is_stock_in(self):
        """Check if transaction is stock in"""
        return self.transaction_type == 'stock_in'
    
    @property
    def is_stock_out(self):
        """Check if transaction is stock out"""
        return self.transaction_type == 'stock_out'
    
    @property
    def is_adjustment(self):
        """Check if transaction is an adjustment"""
        return self.transaction_type == 'adjustment'
    
    @property
    def signed_quantity(self):
        """Get quantity with appropriate sign based on transaction type"""
        if self.transaction_type == 'stock_out':
            return -abs(self.quantity)
        else:
            return abs(self.quantity)
    
    @property
    def display_type(self):
        """Get user-friendly transaction type"""
        type_mapping = {
            'stock_in': 'Stock In',
            'stock_out': 'Stock Out',
            'adjustment': 'Adjustment'
        }
        return type_mapping.get(self.transaction_type, self.transaction_type)
    
    def calculate_total(self):
        """Calculate and update total amount"""
        self.total_amount = abs(self.quantity) * self.unit_price
        return self.total_amount
    
    @classmethod
    def create_stock_in(cls, product_id: str, quantity: int, unit_price: float, 
                       reference_number: str = None, notes: str = None, created_by: str = "system"):
        """Create a stock in transaction"""
        transaction = cls(
            product_id=product_id,
            transaction_type='stock_in',
            quantity=abs(quantity),  # Ensure positive
            unit_price=unit_price,
            reference_number=reference_number,
            notes=notes,
            created_by=created_by
        )
        transaction.calculate_total()
        return transaction
    
    @classmethod
    def create_stock_out(cls, product_id: str, quantity: int, unit_price: float,
                        reference_number: str = None, notes: str = None, created_by: str = "system"):
        """Create a stock out transaction"""
        transaction = cls(
            product_id=product_id,
            transaction_type='stock_out',
            quantity=abs(quantity),  # Store as positive, sign handled in signed_quantity
            unit_price=unit_price,
            reference_number=reference_number,
            notes=notes,
            created_by=created_by
        )
        transaction.calculate_total()
        return transaction
    
    @classmethod
    def create_adjustment(cls, product_id: str, quantity: int, unit_price: float,
                         reference_number: str = None, notes: str = None, created_by: str = "system"):
        """Create an adjustment transaction"""
        transaction = cls(
            product_id=product_id,
            transaction_type='adjustment',
            quantity=quantity,  # Can be positive or negative
            unit_price=unit_price,
            reference_number=reference_number,
            notes=notes,
            created_by=created_by
        )
        transaction.calculate_total()
        return transaction