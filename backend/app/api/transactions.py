from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc, and_, func
from pydantic import BaseModel, Field, validator
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal
import logging

from ..database import get_db
from ..models.transaction import StockTransaction, TransactionType
from ..models.product import Product
from ..models.supplier import Supplier
from .auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class TransactionCreate(BaseModel):
    product_id: UUID
    transaction_type: TransactionType
    quantity: int = Field(..., gt=0)
    unit_price: Optional[Decimal] = Field(None, ge=0)
    total_amount: Optional[Decimal] = Field(None, ge=0)
    reference_number: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None

    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be positive')
        return v

class TransactionUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)
    unit_price: Optional[Decimal] = Field(None, ge=0)
    total_amount: Optional[Decimal] = Field(None, ge=0)
    reference_number: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None

class TransactionResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    product_sku: Optional[str]
    supplier_name: Optional[str]
    transaction_type: str
    quantity: int
    unit_price: Optional[Decimal]
    total_amount: Optional[Decimal]
    reference_number: Optional[str]
    notes: Optional[str]
    previous_stock: int
    new_stock: int
    transaction_date: str
    created_at: str

    class Config:
        from_attributes = True

class TransactionListResponse(BaseModel):
    transactions: List[TransactionResponse]
    total: int
    page: int
    per_page: int
    pages: int

class TransactionSummary(BaseModel):
    total_transactions: int
    total_stock_in: int
    total_stock_out: int
    total_adjustments: int
    total_value_in: Decimal
    total_value_out: Decimal
    net_stock_change: int
    net_value_change: Decimal

@router.get("/", response_model=TransactionListResponse)
async def get_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in product name, SKU, or reference number"),
    transaction_type: Optional[TransactionType] = Query(None, description="Filter by transaction type"),
    product_id: Optional[UUID] = Query(None, description="Filter by product ID"),
    start_date: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    sort_by: str = Query("transaction_date", pattern="^(transaction_date|product_name|quantity|total_amount|created_at)$", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    
    current_user = None
):
    """Get paginated list of stock transactions with optional filtering and sorting"""
    
    try:
        # Build base query with joins
        query = db.query(StockTransaction).options(
            joinedload(StockTransaction.product).joinedload(Product.supplier)
        )
        
        # Apply product filter
        if product_id:
            query = query.filter(StockTransaction.product_id == product_id)
        
        # Apply transaction type filter
        if transaction_type:
            query = query.filter(StockTransaction.transaction_type == transaction_type)
        
        # Apply date range filters
        if start_date:
            query = query.filter(StockTransaction.transaction_date >= start_date)
        if end_date:
            query = query.filter(StockTransaction.transaction_date <= end_date)
        
        # Apply search filter
        if search:
            search_filter = or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
                StockTransaction.reference_number.ilike(f"%{search}%")
            )
            query = query.join(Product).filter(search_filter)
        elif not product_id:  # Only join if not already joined via search
            query = query.join(Product)
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        if sort_by == "product_name":
            sort_column = Product.name
        elif sort_by == "transaction_date":
            sort_column = StockTransaction.transaction_date
        else:
            sort_column = getattr(StockTransaction, sort_by)
        
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Apply pagination
        offset = (page - 1) * per_page
        transactions = query.offset(offset).limit(per_page).all()
        
        # Build response
        transaction_responses = []
        for transaction in transactions:
            transaction_dict = {
                "id": transaction.id,
                "product_id": transaction.product_id,
                "product_name": transaction.product.name,
                "product_sku": transaction.product.sku,
                "supplier_name": transaction.product.supplier.name if transaction.product.supplier else None,
                "transaction_type": transaction.transaction_type.value,
                "quantity": transaction.quantity,
                "unit_price": transaction.unit_price,
                "total_amount": transaction.total_amount,
                "reference_number": transaction.reference_number,
                "notes": transaction.notes,
                "previous_stock": transaction.previous_stock,
                "new_stock": transaction.new_stock,
                "transaction_date": transaction.transaction_date.isoformat(),
                "created_at": transaction.created_at.isoformat()
            }
            transaction_responses.append(TransactionResponse(**transaction_dict))
        
        pages = (total + per_page - 1) // per_page
        
        return TransactionListResponse(
            transactions=transaction_responses,
            total=total,
            page=page,
            per_page=per_page,
            pages=pages
        )
        
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: UUID,
    
    current_user = None
):
    """Get transaction by ID"""
    
    transaction = db.query(StockTransaction).options(
        joinedload(StockTransaction.product).joinedload(Product.supplier)
    ).filter(StockTransaction.id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    transaction_dict = {
        "id": transaction.id,
        "product_id": transaction.product_id,
        "product_name": transaction.product.name,
        "product_sku": transaction.product.sku,
        "supplier_name": transaction.product.supplier.name if transaction.product.supplier else None,
        "transaction_type": transaction.transaction_type.value,
        "quantity": transaction.quantity,
        "unit_price": transaction.unit_price,
        "total_amount": transaction.total_amount,
        "reference_number": transaction.reference_number,
        "notes": transaction.notes,
        "previous_stock": transaction.previous_stock,
        "new_stock": transaction.new_stock,
        "transaction_date": transaction.transaction_date.isoformat(),
        "created_at": transaction.created_at.isoformat()
    }
    
    return TransactionResponse(**transaction_dict)

@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    transaction_data: TransactionCreate,
    
    current_user = None
):
    """Create a new stock transaction"""
    
    try:
        # Get product and verify it exists
        product = db.query(Product).filter(Product.id == transaction_data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Validate stock out transaction
        if transaction_data.transaction_type == TransactionType.STOCK_OUT:
            if product.current_stock < transaction_data.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient stock. Available: {product.current_stock}, Requested: {transaction_data.quantity}"
                )
        
        # Calculate values
        unit_price = transaction_data.unit_price or product.unit_price or Decimal('0')
        total_amount = transaction_data.total_amount or (unit_price * transaction_data.quantity)
        
        # Store previous stock level
        previous_stock = product.current_stock
        
        # Calculate new stock level
        if transaction_data.transaction_type == TransactionType.STOCK_IN:
            new_stock = previous_stock + transaction_data.quantity
        elif transaction_data.transaction_type == TransactionType.STOCK_OUT:
            new_stock = previous_stock - transaction_data.quantity
        else:  # ADJUSTMENT
            new_stock = transaction_data.quantity  # For adjustments, quantity is the new absolute value
        
        # Create transaction
        transaction = StockTransaction(
            product_id=transaction_data.product_id,
            transaction_type=transaction_data.transaction_type,
            quantity=transaction_data.quantity,
            unit_price=unit_price,
            total_amount=total_amount,
            reference_number=transaction_data.reference_number,
            notes=transaction_data.notes,
            previous_stock=previous_stock,
            new_stock=new_stock,
            transaction_date=datetime.utcnow().date()
        )
        
        db.add(transaction)
        
        # Update product stock
        product.current_stock = new_stock
        
        db.commit()
        db.refresh(transaction)
        
        # Load product and supplier for response
        transaction = db.query(StockTransaction).options(
            joinedload(StockTransaction.product).joinedload(Product.supplier)
        ).filter(StockTransaction.id == transaction.id).first()
        
        transaction_dict = {
            "id": transaction.id,
            "product_id": transaction.product_id,
            "product_name": transaction.product.name,
            "product_sku": transaction.product.sku,
            "supplier_name": transaction.product.supplier.name if transaction.product.supplier else None,
            "transaction_type": transaction.transaction_type.value,
            "quantity": transaction.quantity,
            "unit_price": transaction.unit_price,
            "total_amount": transaction.total_amount,
            "reference_number": transaction.reference_number,
            "notes": transaction.notes,
            "previous_stock": transaction.previous_stock,
            "new_stock": transaction.new_stock,
            "transaction_date": transaction.transaction_date.isoformat(),
            "created_at": transaction.created_at.isoformat()
        }
        
        logger.info(f"Created new transaction: {transaction.transaction_type.value} for product {product.name} (ID: {transaction.id})")
        return TransactionResponse(**transaction_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating transaction: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: UUID,
    transaction_data: TransactionUpdate,
    
    current_user = None
):
    """Update transaction by ID (limited fields only)"""
    
    try:
        transaction = db.query(StockTransaction).filter(StockTransaction.id == transaction_id).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Get product for validation
        product = db.query(Product).filter(Product.id == transaction.product_id).first()
        
        # If quantity is being updated, validate and recalculate stock
        if transaction_data.quantity and transaction_data.quantity != transaction.quantity:
            # Revert previous stock change
            product.current_stock = transaction.previous_stock
            
            # Validate new quantity for stock out
            if transaction.transaction_type == TransactionType.STOCK_OUT:
                if product.current_stock < transaction_data.quantity:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Insufficient stock for updated quantity. Available: {product.current_stock}, Requested: {transaction_data.quantity}"
                    )
            
            # Apply new stock change
            if transaction.transaction_type == TransactionType.STOCK_IN:
                new_stock = product.current_stock + transaction_data.quantity
            elif transaction.transaction_type == TransactionType.STOCK_OUT:
                new_stock = product.current_stock - transaction_data.quantity
            else:  # ADJUSTMENT
                new_stock = transaction_data.quantity
            
            # Update transaction and product
            transaction.quantity = transaction_data.quantity
            transaction.new_stock = new_stock
            product.current_stock = new_stock
            
            # Recalculate total_amount if unit_price exists
            if transaction.unit_price:
                transaction.total_amount = transaction.unit_price * transaction_data.quantity
        
        # Update other fields
        if transaction_data.unit_price is not None:
            transaction.unit_price = transaction_data.unit_price
            if transaction.quantity:
                transaction.total_amount = transaction_data.unit_price * transaction.quantity
        
        if transaction_data.total_amount is not None:
            transaction.total_amount = transaction_data.total_amount
        
        if transaction_data.reference_number is not None:
            transaction.reference_number = transaction_data.reference_number
        
        if transaction_data.notes is not None:
            transaction.notes = transaction_data.notes
        
        db.commit()
        db.refresh(transaction)
        
        # Load with relationships for response
        transaction = db.query(StockTransaction).options(
            joinedload(StockTransaction.product).joinedload(Product.supplier)
        ).filter(StockTransaction.id == transaction_id).first()
        
        transaction_dict = {
            "id": transaction.id,
            "product_id": transaction.product_id,
            "product_name": transaction.product.name,
            "product_sku": transaction.product.sku,
            "supplier_name": transaction.product.supplier.name if transaction.product.supplier else None,
            "transaction_type": transaction.transaction_type.value,
            "quantity": transaction.quantity,
            "unit_price": transaction.unit_price,
            "total_amount": transaction.total_amount,
            "reference_number": transaction.reference_number,
            "notes": transaction.notes,
            "previous_stock": transaction.previous_stock,
            "new_stock": transaction.new_stock,
            "transaction_date": transaction.transaction_date.isoformat(),
            "created_at": transaction.created_at.isoformat()
        }
        
        logger.info(f"Updated transaction: {transaction.id}")
        return TransactionResponse(**transaction_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating transaction {transaction_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: UUID,
    
    current_user = None
):
    """Delete transaction by ID and revert stock changes"""
    
    try:
        transaction = db.query(StockTransaction).filter(StockTransaction.id == transaction_id).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Get product to revert stock changes
        product = db.query(Product).filter(Product.id == transaction.product_id).first()
        if product:
            # Revert the stock change by setting it back to previous stock
            product.current_stock = transaction.previous_stock
        
        db.delete(transaction)
        db.commit()
        
        logger.info(f"Deleted transaction: {transaction_id} and reverted stock changes")
        return {"message": "Transaction deleted successfully and stock changes reverted"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting transaction {transaction_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/summary/stats", response_model=TransactionSummary)
async def get_transaction_summary(
    start_date: Optional[date] = Query(None, description="Start date for summary (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date for summary (YYYY-MM-DD)"),
    product_id: Optional[UUID] = Query(None, description="Filter by product ID"),
    
    current_user = None
):
    """Get transaction summary statistics"""
    
    try:
        # Build base query
        query = db.query(StockTransaction)
        
        # Apply filters
        if product_id:
            query = query.filter(StockTransaction.product_id == product_id)
        if start_date:
            query = query.filter(StockTransaction.transaction_date >= start_date)
        if end_date:
            query = query.filter(StockTransaction.transaction_date <= end_date)
        
        # Get all transactions matching filters
        transactions = query.all()
        
        # Calculate statistics
        total_transactions = len(transactions)
        total_stock_in = sum(t.quantity for t in transactions if t.transaction_type == TransactionType.STOCK_IN)
        total_stock_out = sum(t.quantity for t in transactions if t.transaction_type == TransactionType.STOCK_OUT)
        total_adjustments = len([t for t in transactions if t.transaction_type == TransactionType.ADJUSTMENT])
        
        total_value_in = sum(t.total_amount or Decimal('0') for t in transactions if t.transaction_type == TransactionType.STOCK_IN)
        total_value_out = sum(t.total_amount or Decimal('0') for t in transactions if t.transaction_type == TransactionType.STOCK_OUT)
        
        net_stock_change = total_stock_in - total_stock_out
        net_value_change = total_value_in - total_value_out
        
        return TransactionSummary(
            total_transactions=total_transactions,
            total_stock_in=total_stock_in,
            total_stock_out=total_stock_out,
            total_adjustments=total_adjustments,
            total_value_in=total_value_in,
            total_value_out=total_value_out,
            net_stock_change=net_stock_change,
            net_value_change=net_value_change
        )
        
    except Exception as e:
        logger.error(f"Error calculating transaction summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")