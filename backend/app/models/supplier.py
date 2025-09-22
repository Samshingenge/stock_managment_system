"""
Supplier model for Stock Management System
"""
from sqlalchemy import Column, String, DateTime, CheckConstraint, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Supplier(Base):
    """Supplier model"""
    
    __tablename__ = "suppliers"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic information
    name = Column(String(255), nullable=False, index=True)
    contact_person = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(Text)
    payment_terms = Column(String(255))
    
    # Status
    status = Column(String(20), default="active", index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="supplier", lazy="dynamic")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive')", name="check_supplier_status"),
    )
    
    def __repr__(self):
        return f"<Supplier(id={self.id}, name={self.name}, status={self.status})>"
    
    @property
    def product_count(self):
        """Get count of products from this supplier"""
        return self.products.filter_by(status='active').count()
    
    @property
    def is_active(self):
        """Check if supplier is active"""
        return self.status == 'active'