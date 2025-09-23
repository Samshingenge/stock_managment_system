"""
Products API endpoints for Stock Management System
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.database import get_db
from app.models.product import Product
from app.models.supplier import Supplier
from app.api.auth import get_current_user_dependency

router = APIRouter()

# Pydantic models for request/response
from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime


class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    unit_price: Decimal = Field(..., ge=0, )
    min_stock_level: Optional[int] = Field(0, ge=0)
    current_stock: Optional[int] = Field(0, ge=0)
    supplier_id: Optional[UUID] = None
    status: Optional[str] = Field("active", pattern="^(active|inactive|discontinued)$")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    unit_price: Optional[Decimal] = Field(None, ge=0, )
    min_stock_level: Optional[int] = Field(None, ge=0)
    current_stock: Optional[int] = Field(None, ge=0)
    supplier_id: Optional[UUID] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive|discontinued)$")


class SupplierInfo(BaseModel):
    id: UUID
    name: str
    contact_person: Optional[str] = None


class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    inventory_value: Optional[Decimal] = None
    is_low_stock: Optional[bool] = None
    stock_status: Optional[str] = None
    supplier: Optional[SupplierInfo] = None
    
    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    per_page: int
    pages: int
    has_next: bool
    has_prev: bool


@router.get("/", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    supplier_id: Optional[UUID] = Query(None),
    low_stock_only: bool = Query(False),
    sort_by: Optional[str] = Query("name"),
    sort_order: Optional[str] = Query("asc"),
    current_user=None
):
    """Get paginated list of products with filtering options"""
    
    query = db.query(Product)
    
    # Apply filters
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.sku.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if category:
        query = query.filter(Product.category == category)
    
    if status:
        query = query.filter(Product.status == status)
    
    if supplier_id:
        query = query.filter(Product.supplier_id == supplier_id)
    
    if low_stock_only:
        query = query.filter(Product.current_stock <= Product.min_stock_level)
    
    # Apply sorting
    if sort_by and hasattr(Product, sort_by):
        order_column = getattr(Product, sort_by)
        if sort_order.lower() == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    products = query.offset(offset).limit(per_page).all()
    
    # Calculate pagination info
    pages = (total + per_page - 1) // per_page
    has_next = page < pages
    has_prev = page > 1
    
    # Convert to response format
    product_responses = []
    for product in products:
        product_dict = {
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "category": product.category,
            "description": product.description,
            "unit_price": product.unit_price,
            "min_stock_level": product.min_stock_level,
            "current_stock": product.current_stock,
            "supplier_id": product.supplier_id,
            "status": product.status,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
            "inventory_value": product.inventory_value,
            "is_low_stock": product.is_low_stock,
            "stock_status": product.stock_status,
        }
        
        # Add supplier info if available
        if product.supplier:
            product_dict["supplier"] = {
                "id": product.supplier.id,
                "name": product.supplier.name,
                "contact_person": product.supplier.contact_person
            }
        
        product_responses.append(ProductResponse(**product_dict))
    
    return ProductListResponse(
        items=product_responses,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
        has_next=has_next,
        has_prev=has_prev
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: UUID,
    
    current_user=None
):
    """Get single product by ID"""
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Prepare response
    product_dict = {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "category": product.category,
        "description": product.description,
        "unit_price": product.unit_price,
        "min_stock_level": product.min_stock_level,
        "current_stock": product.current_stock,
        "supplier_id": product.supplier_id,
        "status": product.status,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
        "inventory_value": product.inventory_value,
        "is_low_stock": product.is_low_stock,
        "stock_status": product.stock_status,
    }
    
    # Add supplier info if available
    if product.supplier:
        product_dict["supplier"] = {
            "id": product.supplier.id,
            "name": product.supplier.name,
            "contact_person": product.supplier.contact_person
        }
    
    return ProductResponse(**product_dict)


@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    product: ProductCreate,
    
    current_user=None
):
    """Create new product"""
    
    # Check if SKU already exists
    if product.sku:
        existing_product = db.query(Product).filter(Product.sku == product.sku).first()
        if existing_product:
            raise HTTPException(status_code=400, detail="SKU already exists")
    
    # Check if supplier exists
    if product.supplier_id:
        supplier = db.query(Supplier).filter(Supplier.id == product.supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=400, detail="Supplier not found")
    
    # Create new product
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Prepare response
    product_dict = {
        "id": db_product.id,
        "name": db_product.name,
        "sku": db_product.sku,
        "category": db_product.category,
        "description": db_product.description,
        "unit_price": db_product.unit_price,
        "min_stock_level": db_product.min_stock_level,
        "current_stock": db_product.current_stock,
        "supplier_id": db_product.supplier_id,
        "status": db_product.status,
        "created_at": db_product.created_at,
        "updated_at": db_product.updated_at,
        "inventory_value": db_product.inventory_value,
        "is_low_stock": db_product.is_low_stock,
        "stock_status": db_product.stock_status,
    }
    
    # Add supplier info if available
    if db_product.supplier:
        product_dict["supplier"] = {
            "id": db_product.supplier.id,
            "name": db_product.supplier.name,
            "contact_person": db_product.supplier.contact_person
        }
    
    return ProductResponse(**product_dict)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    product: ProductUpdate,
    
    current_user=None
):
    """Update existing product"""
    
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check SKU uniqueness if being updated
    if product.sku and product.sku != db_product.sku:
        existing_product = db.query(Product).filter(
            Product.sku == product.sku,
            Product.id != product_id
        ).first()
        if existing_product:
            raise HTTPException(status_code=400, detail="SKU already exists")
    
    # Check if supplier exists
    if product.supplier_id:
        supplier = db.query(Supplier).filter(Supplier.id == product.supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=400, detail="Supplier not found")
    
    # Update product
    update_data = product.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    
    # Prepare response
    product_dict = {
        "id": db_product.id,
        "name": db_product.name,
        "sku": db_product.sku,
        "category": db_product.category,
        "description": db_product.description,
        "unit_price": db_product.unit_price,
        "min_stock_level": db_product.min_stock_level,
        "current_stock": db_product.current_stock,
        "supplier_id": db_product.supplier_id,
        "status": db_product.status,
        "created_at": db_product.created_at,
        "updated_at": db_product.updated_at,
        "inventory_value": db_product.inventory_value,
        "is_low_stock": db_product.is_low_stock,
        "stock_status": db_product.stock_status,
    }
    
    # Add supplier info if available
    if db_product.supplier:
        product_dict["supplier"] = {
            "id": db_product.supplier.id,
            "name": db_product.supplier.name,
            "contact_person": db_product.supplier.contact_person
        }
    
    return ProductResponse(**product_dict)


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: UUID,
    
    current_user=None
):
    """Delete product"""
    
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if product has transactions (optional: prevent deletion if has transactions)
    # transaction_count = db_product.transactions.count()
    # if transaction_count > 0:
    #     raise HTTPException(status_code=400, detail="Cannot delete product with existing transactions")
    
    db.delete(db_product)
    db.commit()
    
    return None


@router.get("/categories/list")
async def get_categories(
    
    current_user=None
):
    """Get list of all product categories"""
    
    categories = db.query(Product.category).filter(
        Product.category.isnot(None),
        Product.status == 'active'
    ).distinct().all()
    
    category_list = [cat[0] for cat in categories if cat[0]]
    
    return {"categories": sorted(category_list)}


@router.get("/low-stock/list")
async def get_low_stock_products(
    threshold: Optional[int] = Query(None, description="Custom threshold override"),
    
    current_user=None
):
    """Get products with low stock levels"""
    
    if threshold is not None:
        query = db.query(Product).filter(
            Product.current_stock <= threshold,
            Product.status == 'active'
        )
    else:
        query = db.query(Product).filter(
            Product.current_stock <= Product.min_stock_level,
            Product.status == 'active'
        )
    
    products = query.all()
    
    low_stock_items = []
    total_shortage_value = 0
    
    for product in products:
        shortage = max(0, (product.min_stock_level or 0) - (product.current_stock or 0))
        reorder_value = shortage * (product.unit_price or 0)
        total_shortage_value += reorder_value
        
        # Determine priority
        if product.current_stock == 0:
            priority = "critical"
        elif shortage > (product.min_stock_level or 0) * 0.5:
            priority = "high"
        elif shortage > 0:
            priority = "medium"
        else:
            priority = "low"
        
        low_stock_items.append({
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "current_stock": product.current_stock,
            "min_stock_level": product.min_stock_level,
            "shortage": shortage,
            "unit_price": product.unit_price,
            "reorder_value": reorder_value,
            "priority": priority
        })
    
    # Sort by priority
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    low_stock_items.sort(key=lambda x: priority_order.get(x["priority"], 4))
    
    return {
        "items": low_stock_items,
        "total_items": len(low_stock_items),
        "total_shortage_value": total_shortage_value
    }