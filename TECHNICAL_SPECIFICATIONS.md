# 🏗️ Full-Stack Stock Management System - Technical Specifications

## 📋 Project Overview

**Objective**: Transform the current static stock management dashboard into a full-stack application with PostgreSQL, FastAPI (Python), React.js, and Docker while preserving the exact UI/UX design.

**Technology Stack**:
- **Frontend**: React.js 18+ with TypeScript
- **Backend**: Python 3.11+ with FastAPI
- **Database**: PostgreSQL 15+
- **Containerization**: Docker & Docker Compose
- **Styling**: Tailwind CSS (maintain current design)
- **Charts**: Chart.js / React-Chartjs-2
- **Export**: React-Excel-Export libraries

---

## 🗄️ Database Design (PostgreSQL)

### Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    payment_terms VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    description TEXT,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    min_stock_level INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock transactions table
CREATE TABLE stock_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'adjustment')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    reference_number VARCHAR(255),
    notes TEXT,
    created_by VARCHAR(255) DEFAULT 'system',
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_transactions_product ON stock_transactions(product_id);
CREATE INDEX idx_transactions_type ON stock_transactions(transaction_type);
CREATE INDEX idx_transactions_date ON stock_transactions(transaction_date);
CREATE INDEX idx_suppliers_status ON suppliers(status);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON stock_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Sample Data Insertion

```sql
-- Insert sample suppliers
INSERT INTO suppliers (id, name, contact_person, email, phone, address, payment_terms, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ABC Electronics Ltd', 'John Smith', 'john@abcelectronics.com', '+1-555-0101', '123 Industrial Ave, Tech City, TC 12345', 'Net 30 Days', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Global Parts Supply', 'Maria Garcia', 'maria@globalparts.com', '+1-555-0202', '456 Commerce St, Business District, BD 67890', 'Net 15 Days', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Tech Components Inc', 'David Lee', 'david@techcomponents.com', '+1-555-0303', '789 Innovation Blvd, Silicon Valley, SV 11111', 'COD', 'active');

-- Insert sample products
INSERT INTO products (id, name, sku, category, description, unit_price, min_stock_level, current_stock, supplier_id, status) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'USB Cable Type-C', 'USB-TC-001', 'Electronics', 'High-quality USB cable for data transfer and charging', 12.99, 50, 150, '550e8400-e29b-41d4-a716-446655440001', 'active'),
('650e8400-e29b-41d4-a716-446655440002', 'Bluetooth Headphones', 'BT-HP-002', 'Electronics', 'Wireless Bluetooth headphones with noise cancellation', 89.99, 30, 25, '550e8400-e29b-41d4-a716-446655440001', 'active'),
('650e8400-e29b-41d4-a716-446655440003', 'Phone Case', 'PC-UNI-003', 'Accessories', 'Protective phone case for various smartphone models', 19.99, 100, 200, '550e8400-e29b-41d4-a716-446655440002', 'active'),
('650e8400-e29b-41d4-a716-446655440004', 'Power Bank 10000mAh', 'PB-10K-004', 'Electronics', 'Portable power bank with fast charging capability', 45.99, 20, 5, '550e8400-e29b-41d4-a716-446655440002', 'active'),
('650e8400-e29b-41d4-a716-446655440005', 'HDMI Cable 6ft', 'HDMI-6-005', 'Cables', 'HDMI cable for high-definition video and audio transmission', 24.99, 25, 75, '550e8400-e29b-41d4-a716-446655440003', 'active'),
('650e8400-e29b-41d4-a716-446655440006', 'Wireless Mouse', 'WM-ERG-006', 'Electronics', 'Compact wireless mouse with ergonomic design', 34.99, 15, 0, '550e8400-e29b-41d4-a716-446655440003', 'active');
```

---

## 🔧 Backend Architecture (FastAPI)

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py              # Configuration settings
│   ├── database.py            # Database connection setup
│   ├── models/
│   │   ├── __init__.py
│   │   ├── product.py         # SQLAlchemy Product model
│   │   ├── supplier.py        # SQLAlchemy Supplier model
│   │   └── transaction.py     # SQLAlchemy Transaction model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── product.py         # Pydantic Product schemas
│   │   ├── supplier.py        # Pydantic Supplier schemas
│   │   └── transaction.py     # Pydantic Transaction schemas
│   ├── api/
│   │   ├── __init__.py
│   │   ├── products.py        # Product endpoints
│   │   ├── suppliers.py       # Supplier endpoints
│   │   ├── transactions.py    # Transaction endpoints
│   │   └── dashboard.py       # Dashboard analytics endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── product_service.py # Product business logic
│   │   ├── supplier_service.py# Supplier business logic
│   │   └── stock_service.py   # Stock operations logic
│   └── utils/
│       ├── __init__.py
│       ├── dependencies.py    # FastAPI dependencies
│       └── exceptions.py      # Custom exceptions
├── alembic/                   # Database migrations
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### Core Dependencies (requirements.txt)

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.7
alembic==1.12.1
pydantic==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dateutil==2.8.2
openpyxl==3.1.2
fastapi-pagination==0.12.12
```

### FastAPI Models (SQLAlchemy)

**app/models/product.py**
```python
from sqlalchemy import Column, String, Decimal, Integer, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True)
    category = Column(String(100))
    description = Column(String)
    unit_price = Column(Decimal(10, 2), nullable=False, default=0.00)
    min_stock_level = Column(Integer, default=0)
    current_stock = Column(Integer, default=0)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id", ondelete="SET NULL"))
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    transactions = relationship("StockTransaction", back_populates="product")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive', 'discontinued')", name="check_product_status"),
    )
```

**app/models/supplier.py**
```python
from sqlalchemy import Column, String, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .product import Base
import uuid

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    contact_person = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(String)
    payment_terms = Column(String(255))
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="supplier")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive')", name="check_supplier_status"),
    )
```

**app/models/transaction.py**
```python
from sqlalchemy import Column, String, Integer, Decimal, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .product import Base
import uuid

class StockTransaction(Base):
    __tablename__ = "stock_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    transaction_type = Column(String(20), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Decimal(10, 2), nullable=False)
    total_amount = Column(Decimal(12, 2), nullable=False)
    reference_number = Column(String(255))
    notes = Column(String)
    created_by = Column(String(255), default="system")
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="transactions")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("transaction_type IN ('stock_in', 'stock_out', 'adjustment')", name="check_transaction_type"),
    )
```

### Pydantic Schemas

**app/schemas/product.py**
```python
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime
from uuid import UUID

class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    unit_price: Decimal = Field(..., ge=0, decimal_places=2)
    min_stock_level: Optional[int] = Field(0, ge=0)
    current_stock: Optional[int] = Field(0, ge=0)
    supplier_id: Optional[UUID] = None
    status: Optional[str] = Field("active", regex="^(active|inactive|discontinued)$")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    unit_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    min_stock_level: Optional[int] = Field(None, ge=0)
    current_stock: Optional[int] = Field(None, ge=0)
    supplier_id: Optional[UUID] = None
    status: Optional[str] = Field(None, regex="^(active|inactive|discontinued)$")

class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    inventory_value: Optional[Decimal] = None
    is_low_stock: Optional[bool] = None

class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    per_page: int
    pages: int
```

### API Endpoints

**app/api/products.py**
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from ..database import get_db
from ..schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from ..services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("/", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    low_stock_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get paginated list of products with filtering options"""
    service = ProductService(db)
    return await service.get_products(
        page=page,
        per_page=per_page,
        search=search,
        category=category,
        status=status,
        low_stock_only=low_stock_only
    )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: UUID, db: Session = Depends(get_db)):
    """Get single product by ID"""
    service = ProductService(db)
    product = await service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create new product"""
    service = ProductService(db)
    return await service.create_product(product)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update existing product"""
    service = ProductService(db)
    updated_product = await service.update_product(product_id, product)
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated_product

@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: UUID, db: Session = Depends(get_db)):
    """Delete product"""
    service = ProductService(db)
    success = await service.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
```

**app/api/transactions.py**
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime

from ..database import get_db
from ..schemas.transaction import StockTransactionCreate, StockTransactionResponse, TransactionListResponse
from ..services.stock_service import StockService

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("/", response_model=TransactionListResponse)
async def get_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    product_id: Optional[UUID] = Query(None),
    transaction_type: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of stock transactions"""
    service = StockService(db)
    return await service.get_transactions(
        page=page,
        per_page=per_page,
        product_id=product_id,
        transaction_type=transaction_type,
        date_from=date_from,
        date_to=date_to
    )

@router.post("/stock-in", response_model=StockTransactionResponse, status_code=201)
async def process_stock_in(
    transaction: StockTransactionCreate,
    db: Session = Depends(get_db)
):
    """Process stock in transaction"""
    service = StockService(db)
    return await service.process_stock_in(transaction)

@router.post("/stock-out", response_model=StockTransactionResponse, status_code=201)
async def process_stock_out(
    transaction: StockTransactionCreate,
    db: Session = Depends(get_db)
):
    """Process stock out transaction"""
    service = StockService(db)
    return await service.process_stock_out(transaction)
```

**app/api/dashboard.py**
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..database import get_db
from ..services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    service = DashboardService(db)
    return await service.get_dashboard_stats()

@router.get("/chart-data/stock-levels")
async def get_stock_levels_chart_data(db: Session = Depends(get_db)):
    """Get stock levels by category for charts"""
    service = DashboardService(db)
    return await service.get_stock_levels_by_category()

@router.get("/chart-data/transaction-trends")
async def get_transaction_trends_chart_data(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get transaction trends for charts"""
    service = DashboardService(db)
    return await service.get_transaction_trends(days)

@router.get("/low-stock-products")
async def get_low_stock_products(db: Session = Depends(get_db)):
    """Get products with low stock levels"""
    service = DashboardService(db)
    return await service.get_low_stock_products()
```

### Service Layer Example

**app/services/stock_service.py**
```python
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal

from ..models.transaction import StockTransaction
from ..models.product import Product
from ..schemas.transaction import StockTransactionCreate
from ..utils.exceptions import InsufficientStockError, ProductNotFoundError

class StockService:
    def __init__(self, db: Session):
        self.db = db
    
    async def process_stock_in(self, transaction_data: StockTransactionCreate) -> StockTransaction:
        """Process stock in transaction and update product stock"""
        
        # Get product
        product = self.db.query(Product).filter(Product.id == transaction_data.product_id).first()
        if not product:
            raise ProductNotFoundError("Product not found")
        
        # Create transaction
        transaction = StockTransaction(
            product_id=transaction_data.product_id,
            transaction_type="stock_in",
            quantity=transaction_data.quantity,
            unit_price=transaction_data.unit_price,
            total_amount=transaction_data.quantity * transaction_data.unit_price,
            reference_number=transaction_data.reference_number,
            notes=transaction_data.notes,
            created_by=transaction_data.created_by or "system"
        )
        
        # Update product stock
        product.current_stock += transaction_data.quantity
        
        # Save changes
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        self.db.refresh(product)
        
        return transaction
    
    async def process_stock_out(self, transaction_data: StockTransactionCreate) -> StockTransaction:
        """Process stock out transaction with validation"""
        
        # Get product
        product = self.db.query(Product).filter(Product.id == transaction_data.product_id).first()
        if not product:
            raise ProductNotFoundError("Product not found")
        
        # Check stock availability
        if product.current_stock < transaction_data.quantity:
            raise InsufficientStockError(
                f"Insufficient stock. Available: {product.current_stock}, Requested: {transaction_data.quantity}"
            )
        
        # Create transaction
        transaction = StockTransaction(
            product_id=transaction_data.product_id,
            transaction_type="stock_out",
            quantity=transaction_data.quantity,
            unit_price=transaction_data.unit_price,
            total_amount=transaction_data.quantity * transaction_data.unit_price,
            reference_number=transaction_data.reference_number,
            notes=transaction_data.notes,
            created_by=transaction_data.created_by or "system"
        )
        
        # Update product stock
        product.current_stock -= transaction_data.quantity
        
        # Save changes
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        self.db.refresh(product)
        
        return transaction
```

---

## ⚛️ Frontend Architecture (React.js)

### Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Pagination.tsx
│   │   ├── layout/
│   │   │   ├── Navigation.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── StockLevelsChart.tsx
│   │   │   ├── TransactionTrendsChart.tsx
│   │   │   └── RecentTransactions.tsx
│   │   ├── products/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductModal.tsx
│   │   │   └── ProductFilters.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── StockInModal.tsx
│   │   │   ├── StockOutModal.tsx
│   │   │   └── TransactionHistory.tsx
│   │   └── suppliers/
│   │       ├── SupplierList.tsx
│   │       ├── SupplierForm.tsx
│   │       └── SupplierModal.tsx
│   ├── hooks/
│   │   ├── useApi.ts
│   │   ├── useProducts.ts
│   │   ├── useTransactions.ts
│   │   ├── useSuppliers.ts
│   │   └── useDashboard.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── productService.ts
│   │   ├── transactionService.ts
│   │   ├── supplierService.ts
│   │   └── dashboardService.ts
│   ├── types/
│   │   ├── product.ts
│   │   ├── transaction.ts
│   │   ├── supplier.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validation.ts
│   │   ├── exportUtils.ts
│   │   └── constants.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── ToastContext.tsx
│   │   └── AppContext.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   ├── Transactions.tsx
│   │   ├── Suppliers.tsx
│   │   └── Reports.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── Dockerfile
```

### Key Dependencies (package.json)

```json
{
  "name": "stock-management-frontend",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "yup": "^1.3.0",
    "react-chartjs-2": "^5.2.0",
    "chart.js": "^4.4.0",
    "date-fns": "^2.30.0",
    "react-hot-toast": "^2.4.0",
    "lucide-react": "^0.292.0",
    "clsx": "^2.0.0",
    "react-excel-export": "^1.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

### React Component Examples

**src/components/dashboard/DashboardStats.tsx**
```tsx
import React from 'react';
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import LoadingSpinner from '../common/LoadingSpinner';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const DashboardStats: React.FC = () => {
  const { data: stats, isLoading, error } = useDashboard();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error loading dashboard stats</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Products"
        value={stats?.totalProducts || 0}
        icon={<Package className="text-2xl" />}
        color="text-blue-500"
      />
      <StatsCard
        title="Stock In (Today)"
        value={stats?.stockInToday || 0}
        icon={<TrendingUp className="text-2xl" />}
        color="text-green-500"
      />
      <StatsCard
        title="Stock Out (Today)"
        value={stats?.stockOutToday || 0}
        icon={<TrendingDown className="text-2xl" />}
        color="text-red-500"
      />
      <StatsCard
        title="Low Stock Items"
        value={stats?.lowStockCount || 0}
        icon={<AlertTriangle className="text-2xl" />}
        color="text-yellow-500"
      />
    </div>
  );
};

export default DashboardStats;
```

**src/hooks/useProducts.ts**
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { Product, ProductCreate, ProductUpdate } from '../types/product';
import { toast } from 'react-hot-toast';

export const useProducts = (filters?: any) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProductCreate) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdate }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete product');
    },
  });
};
```

**src/services/productService.ts**
```tsx
import { api } from './api';
import { Product, ProductCreate, ProductUpdate, ProductListResponse } from '../types/product';

export const productService = {
  async getProducts(params?: any): Promise<ProductListResponse> {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: ProductCreate): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: ProductUpdate): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
```

---

## 🐳 Docker Configuration

### Docker Compose Setup

**docker-compose.yml**
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: stock_management_db
    environment:
      POSTGRES_DB: stock_management
      POSTGRES_USER: stockuser
      POSTGRES_PASSWORD: stockpass123
      POSTGRES_HOST_AUTH_METHOD: trust
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - stock_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U stockuser -d stock_management"]
      interval: 30s
      timeout: 10s
      retries: 3

  # FastAPI Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: stock_management_api
    environment:
      DATABASE_URL: postgresql://stockuser:stockpass123@postgres:5432/stock_management
      SECRET_KEY: your-secret-key-here
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - stock_network
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: stock_management_frontend
    environment:
      REACT_APP_API_URL: http://localhost:8000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - stock_network
    command: npm start

  # Nginx Reverse Proxy (Production)
  nginx:
    image: nginx:alpine
    container_name: stock_management_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    networks:
      - stock_network
    profiles:
      - production

volumes:
  postgres_data:

networks:
  stock_network:
    driver: bridge
```

### Backend Dockerfile

**backend/Dockerfile**
```dockerfile
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

**frontend/Dockerfile**
```dockerfile
# Multi-stage build
FROM node:18-alpine as base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Development stage
FROM base as development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Build stage
FROM base as build
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine as production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Configuration

**backend/.env**
```env
# Database
DATABASE_URL=postgresql://stockuser:stockpass123@postgres:5432/stock_management

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**frontend/.env**
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_APP_NAME=Stock Management System
REACT_APP_VERSION=1.0.0
```

---

## 🚀 Implementation Steps

### Phase 1: Database & Backend Setup
1. **Database Setup**
   ```bash
   # Create PostgreSQL database
   docker-compose up postgres -d
   
   # Run database migrations
   cd backend
   alembic upgrade head
   
   # Insert sample data
   python scripts/insert_sample_data.py
   ```

2. **FastAPI Backend Development**
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   
   # Run development server
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # Access API docs at http://localhost:8000/docs
   ```

### Phase 2: Frontend Development
1. **React Setup**
   ```bash
   # Create React app with TypeScript
   npx create-react-app frontend --template typescript
   cd frontend
   
   # Install dependencies
   npm install
   
   # Configure Tailwind CSS
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   
   # Start development server
   npm start
   ```

2. **Component Development Order**
   - Setup routing and layout components
   - Implement common components (Modal, Toast, Spinner)
   - Build dashboard components with charts
   - Create product management components
   - Add transaction processing components
   - Implement supplier management
   - Add export functionality

### Phase 3: Integration & Testing
1. **API Integration**
   - Configure Axios interceptors
   - Implement React Query for data fetching
   - Add error handling and loading states
   - Test all CRUD operations

2. **Docker Integration**
   ```bash
   # Build and run all services
   docker-compose up --build
   
   # Access applications:
   # Frontend: http://localhost:3000
   # Backend API: http://localhost:8000
   # API Docs: http://localhost:8000/docs
   ```

### Phase 4: Production Deployment
1. **Production Configuration**
   - Configure Nginx reverse proxy
   - Setup SSL certificates
   - Environment variable configuration
   - Database connection pooling

2. **Deploy with Docker**
   ```bash
   # Production deployment
   docker-compose --profile production up -d
   ```

---

## 📊 Data Migration Strategy

### From Current Static System to Full-Stack

**Migration Script (Python)**
```python
import json
import asyncpg
from datetime import datetime

async def migrate_data():
    # Connect to PostgreSQL
    conn = await asyncpg.connect("postgresql://stockuser:stockpass123@localhost/stock_management")
    
    # Read current static data (if available)
    with open('current_data.json', 'r') as f:
        data = json.load(f)
    
    # Migrate suppliers
    for supplier in data.get('suppliers', []):
        await conn.execute("""
            INSERT INTO suppliers (id, name, contact_person, email, phone, address, payment_terms, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """, supplier['id'], supplier['name'], supplier['contact_person'], 
            supplier['email'], supplier['phone'], supplier['address'], 
            supplier['payment_terms'], supplier['status'])
    
    # Migrate products
    for product in data.get('products', []):
        await conn.execute("""
            INSERT INTO products (id, name, sku, category, description, unit_price, 
                                min_stock_level, current_stock, supplier_id, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """, product['id'], product['name'], product['sku'], product['category'],
            product['description'], product['unit_price'], product['min_stock_level'],
            product['current_stock'], product['supplier_id'], product['status'])
    
    # Migrate transactions
    for transaction in data.get('transactions', []):
        await conn.execute("""
            INSERT INTO stock_transactions (id, product_id, transaction_type, quantity,
                                         unit_price, total_amount, reference_number, 
                                         notes, created_by, transaction_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """, transaction['id'], transaction['product_id'], transaction['transaction_type'],
            transaction['quantity'], transaction['unit_price'], transaction['total_amount'],
            transaction['reference_number'], transaction['notes'], transaction['created_by'],
            datetime.fromisoformat(transaction['transaction_date']))
    
    await conn.close()
    print("Data migration completed successfully!")

# Run migration
import asyncio
asyncio.run(migrate_data())
```

---

## 🔒 Security Considerations

### Authentication & Authorization
```python
# JWT Token implementation
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception
```

### Input Validation
```python
# Comprehensive validation with Pydantic
from pydantic import validator, Field
from decimal import Decimal

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    unit_price: Decimal = Field(..., ge=0, decimal_places=2)
    
    @validator('sku')
    def validate_sku(cls, v):
        if v and not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('SKU must contain only alphanumeric characters, hyphens, and underscores')
        return v
```

---

## 📈 Performance Optimization

### Database Optimization
```sql
-- Additional indexes for performance
CREATE INDEX CONCURRENTLY idx_products_name_gin ON products USING gin(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY idx_transactions_date_product ON stock_transactions(transaction_date, product_id);
CREATE INDEX CONCURRENTLY idx_products_stock_category ON products(current_stock, category) WHERE status = 'active';

-- Materialized view for dashboard stats
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'active') as total_products,
    SUM(current_stock * unit_price) FILTER (WHERE status = 'active') as total_inventory_value,
    COUNT(*) FILTER (WHERE current_stock <= min_stock_level AND status = 'active') as low_stock_count
FROM products;

-- Refresh materialized view periodically
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_stats;
END;
$$ LANGUAGE plpgsql;
```

### React Performance
```tsx
// Memoization and optimization
import React, { memo, useMemo, useCallback } from 'react';

const ProductList = memo(() => {
  const memoizedProducts = useMemo(() => 
    products?.filter(product => product.status === 'active'),
    [products]
  );
  
  const handleProductClick = useCallback((productId: string) => {
    // Handle click logic
  }, []);
  
  return (
    <div>
      {memoizedProducts?.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          onClick={handleProductClick}
        />
      ))}
    </div>
  );
});
```

---

## 📋 Testing Strategy

### Backend Testing
```python
# FastAPI test example
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_product():
    product_data = {
        "name": "Test Product",
        "sku": "TEST-001",
        "unit_price": 19.99,
        "category": "Test Category"
    }
    response = client.post("/api/products/", json=product_data)
    assert response.status_code == 201
    assert response.json()["name"] == "Test Product"

def test_stock_in_operation():
    transaction_data = {
        "product_id": "test-product-id",
        "quantity": 100,
        "unit_price": 10.00,
        "reference_number": "PO-001"
    }
    response = client.post("/api/transactions/stock-in", json=transaction_data)
    assert response.status_code == 201
```

### Frontend Testing
```tsx
// React Testing Library example
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryProvider } from '@tanstack/react-query';
import ProductList from '../components/products/ProductList';

test('renders product list correctly', () => {
  const queryClient = new QueryClient();
  
  render(
    <QueryProvider client={queryClient}>
      <ProductList />
    </QueryProvider>
  );
  
  expect(screen.getByText('Product Inventory')).toBeInTheDocument();
});
```

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] Database schema created and migrated
- [ ] Environment variables configured
- [ ] SSL certificates setup (production)
- [ ] CORS settings configured
- [ ] API documentation complete
- [ ] Performance testing completed
- [ ] Security audit completed

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring setup (logs, metrics)
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team training completed

This comprehensive specification maintains the exact design and functionality you love while providing a complete roadmap for building a production-ready, full-stack stock management system.