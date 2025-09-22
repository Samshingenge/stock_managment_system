from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from pydantic import BaseModel, Field
from uuid import UUID
import logging

from ..database import get_db
from ..models.supplier import Supplier
from ..models.product import Product
from .auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    website: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    website: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None
    status: Optional[str] = Field(None, regex="^(active|inactive)$")

class SupplierResponse(BaseModel):
    id: UUID
    name: str
    contact_person: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    website: Optional[str]
    notes: Optional[str]
    status: str
    created_at: str
    updated_at: str
    product_count: Optional[int] = None

    class Config:
        from_attributes = True

class SupplierListResponse(BaseModel):
    suppliers: List[SupplierResponse]
    total: int
    page: int
    per_page: int
    pages: int

@router.get("/", response_model=SupplierListResponse)
async def get_suppliers(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in name, contact person, or email"),
    status: Optional[str] = Query(None, regex="^(active|inactive)$", description="Filter by status"),
    sort_by: str = Query("name", regex="^(name|contact_person|email|created_at|updated_at)$", description="Sort field"),
    sort_order: str = Query("asc", regex="^(asc|desc)$", description="Sort order"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get paginated list of suppliers with optional filtering and sorting"""
    
    try:
        # Build base query
        query = db.query(Supplier)
        
        # Apply status filter
        if status:
            query = query.filter(Supplier.status == status)
        
        # Apply search filter
        if search:
            search_filter = or_(
                Supplier.name.ilike(f"%{search}%"),
                Supplier.contact_person.ilike(f"%{search}%"),
                Supplier.email.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        sort_column = getattr(Supplier, sort_by)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Apply pagination
        offset = (page - 1) * per_page
        suppliers = query.offset(offset).limit(per_page).all()
        
        # Add product count for each supplier
        supplier_responses = []
        for supplier in suppliers:
            supplier_dict = {
                "id": supplier.id,
                "name": supplier.name,
                "contact_person": supplier.contact_person,
                "email": supplier.email,
                "phone": supplier.phone,
                "address": supplier.address,
                "website": supplier.website,
                "notes": supplier.notes,
                "status": supplier.status,
                "created_at": supplier.created_at.isoformat(),
                "updated_at": supplier.updated_at.isoformat(),
                "product_count": len(supplier.products) if supplier.products else 0
            }
            supplier_responses.append(SupplierResponse(**supplier_dict))
        
        pages = (total + per_page - 1) // per_page
        
        return SupplierListResponse(
            suppliers=supplier_responses,
            total=total,
            page=page,
            per_page=per_page,
            pages=pages
        )
        
    except Exception as e:
        logger.error(f"Error fetching suppliers: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get supplier by ID"""
    
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    supplier_dict = {
        "id": supplier.id,
        "name": supplier.name,
        "contact_person": supplier.contact_person,
        "email": supplier.email,
        "phone": supplier.phone,
        "address": supplier.address,
        "website": supplier.website,
        "notes": supplier.notes,
        "status": supplier.status,
        "created_at": supplier.created_at.isoformat(),
        "updated_at": supplier.updated_at.isoformat(),
        "product_count": len(supplier.products) if supplier.products else 0
    }
    
    return SupplierResponse(**supplier_dict)

@router.post("/", response_model=SupplierResponse)
async def create_supplier(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new supplier"""
    
    try:
        # Check if supplier name already exists
        existing_supplier = db.query(Supplier).filter(Supplier.name == supplier_data.name).first()
        if existing_supplier:
            raise HTTPException(status_code=400, detail="Supplier with this name already exists")
        
        # Check if email already exists (if provided)
        if supplier_data.email:
            existing_email = db.query(Supplier).filter(Supplier.email == supplier_data.email).first()
            if existing_email:
                raise HTTPException(status_code=400, detail="Supplier with this email already exists")
        
        # Create new supplier
        supplier = Supplier(**supplier_data.dict())
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
        
        supplier_dict = {
            "id": supplier.id,
            "name": supplier.name,
            "contact_person": supplier.contact_person,
            "email": supplier.email,
            "phone": supplier.phone,
            "address": supplier.address,
            "website": supplier.website,
            "notes": supplier.notes,
            "status": supplier.status,
            "created_at": supplier.created_at.isoformat(),
            "updated_at": supplier.updated_at.isoformat(),
            "product_count": 0
        }
        
        logger.info(f"Created new supplier: {supplier.name} (ID: {supplier.id})")
        return SupplierResponse(**supplier_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating supplier: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: UUID,
    supplier_data: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update supplier by ID"""
    
    try:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        # Check name uniqueness if name is being updated
        if supplier_data.name and supplier_data.name != supplier.name:
            existing_supplier = db.query(Supplier).filter(
                Supplier.name == supplier_data.name,
                Supplier.id != supplier_id
            ).first()
            if existing_supplier:
                raise HTTPException(status_code=400, detail="Supplier with this name already exists")
        
        # Check email uniqueness if email is being updated
        if supplier_data.email and supplier_data.email != supplier.email:
            existing_email = db.query(Supplier).filter(
                Supplier.email == supplier_data.email,
                Supplier.id != supplier_id
            ).first()
            if existing_email:
                raise HTTPException(status_code=400, detail="Supplier with this email already exists")
        
        # Update supplier fields
        update_data = supplier_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(supplier, field, value)
        
        db.commit()
        db.refresh(supplier)
        
        supplier_dict = {
            "id": supplier.id,
            "name": supplier.name,
            "contact_person": supplier.contact_person,
            "email": supplier.email,
            "phone": supplier.phone,
            "address": supplier.address,
            "website": supplier.website,
            "notes": supplier.notes,
            "status": supplier.status,
            "created_at": supplier.created_at.isoformat(),
            "updated_at": supplier.updated_at.isoformat(),
            "product_count": len(supplier.products) if supplier.products else 0
        }
        
        logger.info(f"Updated supplier: {supplier.name} (ID: {supplier.id})")
        return SupplierResponse(**supplier_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating supplier {supplier_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{supplier_id}")
async def delete_supplier(
    supplier_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete supplier by ID"""
    
    try:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        # Check if supplier has associated products
        product_count = db.query(Product).filter(Product.supplier_id == supplier_id).count()
        if product_count > 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot delete supplier. {product_count} products are associated with this supplier. Please reassign or delete products first."
            )
        
        db.delete(supplier)
        db.commit()
        
        logger.info(f"Deleted supplier: {supplier.name} (ID: {supplier.id})")
        return {"message": "Supplier deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting supplier {supplier_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{supplier_id}/products", response_model=List[dict])
async def get_supplier_products(
    supplier_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all products for a specific supplier"""
    
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    products = db.query(Product).filter(Product.supplier_id == supplier_id).all()
    
    product_list = []
    for product in products:
        product_dict = {
            "id": str(product.id),
            "name": product.name,
            "sku": product.sku,
            "category": product.category,
            "unit_price": float(product.unit_price) if product.unit_price else 0.0,
            "current_stock": product.current_stock,
            "min_stock_level": product.min_stock_level,
            "status": product.status,
            "inventory_value": product.inventory_value,
            "is_low_stock": product.is_low_stock,
            "stock_status": product.stock_status
        }
        product_list.append(product_dict)
    
    return product_list