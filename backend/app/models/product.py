"""
Product model for Stock Management System
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, CheckConstraint, Text
from sqlalchemy.types import DECIMAL as Decimal
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, column_property
from sqlalchemy.sql import func
from sqlalchemy import select
import uuid

from app.database import Base


class Product(Base):
    """Product model"""
    
    __tablename__ = "products"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic information
    name = Column(String(255), nullable=False, index=True)
    sku = Column(String(100), unique=True, index=True)
    category = Column(String(100), index=True)
    description = Column(Text)
    
    # Pricing and inventory
    unit_price = Column(Decimal(10, 2), nullable=False, default=0.00)
    min_stock_level = Column(Integer, default=0)
    current_stock = Column(Integer, default=0, index=True)
    
    # Foreign keys
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id", ondelete="SET NULL"), index=True)
    
    # Status
    status = Column(String(20), default="active", index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    transactions = relationship("StockTransaction", back_populates="product", lazy="dynamic")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive', 'discontinued')", name="check_product_status"),
        CheckConstraint("unit_price >= 0", name="check_unit_price_positive"),
        CheckConstraint("current_stock >= 0", name="check_current_stock_positive"),
        CheckConstraint("min_stock_level >= 0", name="check_min_stock_positive"),
    )
    
    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name}, sku={self.sku}, stock={self.current_stock})>"
    
    @property
    def inventory_value(self):
        """Calculate total inventory value"""
        return (self.current_stock or 0) * (self.unit_price or 0)
    
    @property
    def is_low_stock(self):
        """Check if product has low stock"""
        return (self.current_stock or 0) <= (self.min_stock_level or 0)
    
    @property
    def is_out_of_stock(self):
        """Check if product is out of stock"""
        return (self.current_stock or 0) == 0
    
    @property
    def stock_status(self):
        """Get stock status string"""
        if self.is_out_of_stock:
            return "out_of_stock"
        elif self.is_low_stock:
            return "low_stock"
        else:
            return "good"
    
    @property
    def is_active(self):
        """Check if product is active"""
        return self.status == 'active'
    
    def update_stock(self, quantity_change: int):
        """Update current stock with validation"""
        new_stock = (self.current_stock or 0) + quantity_change
        if new_stock < 0:
            raise ValueError(f"Insufficient stock. Current: {self.current_stock}, Change: {quantity_change}")
        self.current_stock = new_stock
        return new_stock
    
    def can_fulfill_order(self, quantity: int) -> bool:
        """Check if product can fulfill an order"""
        return (self.current_stock or 0) >= quantity
    
    def get_recent_transactions(self, limit: int = 10):
        """Get recent transactions for this product"""
        return self.transactions.order_by(
            self.transactions.property.mapper.class_.transaction_date.desc()
        ).limit(limit)