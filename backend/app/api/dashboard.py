from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date, timedelta
from decimal import Decimal
import logging

from ..database import get_db
from ..models.product import Product
from ..models.supplier import Supplier
from ..models.transaction import StockTransaction, TransactionType
from .auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class DashboardStats(BaseModel):
    total_products: int
    total_suppliers: int
    total_stock_value: Decimal
    low_stock_products: int
    out_of_stock_products: int
    total_transactions_today: int
    total_transactions_this_month: int
    stock_in_today: int
    stock_out_today: int
    stock_in_this_month: int
    stock_out_this_month: int

class ProductStockAlert(BaseModel):
    id: UUID
    name: str
    sku: Optional[str]
    current_stock: int
    min_stock_level: int
    supplier_name: Optional[str]
    unit_price: Decimal
    stock_status: str

class RecentTransaction(BaseModel):
    id: UUID
    product_name: str
    product_sku: Optional[str]
    transaction_type: str
    quantity: int
    total_amount: Optional[Decimal]
    transaction_date: str
    reference_number: Optional[str]

class CategoryStats(BaseModel):
    category: str
    product_count: int
    total_stock: int
    total_value: Decimal

class MonthlyTrend(BaseModel):
    month: str
    stock_in: int
    stock_out: int
    net_change: int
    transactions_count: int

class TopProduct(BaseModel):
    id: UUID
    name: str
    sku: Optional[str]
    category: Optional[str]
    total_transactions: int
    total_quantity: int
    current_stock: int
    supplier_name: Optional[str]

class DashboardResponse(BaseModel):
    stats: DashboardStats
    stock_alerts: List[ProductStockAlert]
    recent_transactions: List[RecentTransaction]
    category_stats: List[CategoryStats]
    monthly_trends: List[MonthlyTrend]
    top_products: List[TopProduct]

@router.get("/", response_model=DashboardResponse)
async def get_dashboard_data(
    days_back: int = Query(30, ge=1, le=365, description="Days to look back for trends"),
    limit_alerts: int = Query(10, ge=1, le=50, description="Limit for stock alerts"),
    limit_transactions: int = Query(10, ge=1, le=50, description="Limit for recent transactions"),
    limit_products: int = Query(10, ge=1, le=50, description="Limit for top products"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get comprehensive dashboard data including statistics, alerts, and trends"""
    
    try:
        # Calculate date ranges
        today = date.today()
        start_of_month = today.replace(day=1)
        start_date = today - timedelta(days=days_back)
        
        # 1. Basic Statistics
        total_products = db.query(Product).filter(Product.status == 'active').count()
        total_suppliers = db.query(Supplier).filter(Supplier.status == 'active').count()
        
        # Calculate total stock value
        products = db.query(Product).filter(Product.status == 'active').all()
        total_stock_value = sum((p.current_stock or 0) * (p.unit_price or 0) for p in products)
        
        # Stock level alerts
        low_stock_products = db.query(Product).filter(
            and_(
                Product.status == 'active',
                Product.current_stock <= Product.min_stock_level,
                Product.current_stock > 0
            )
        ).count()
        
        out_of_stock_products = db.query(Product).filter(
            and_(
                Product.status == 'active',
                Product.current_stock == 0
            )
        ).count()
        
        # Transaction counts
        total_transactions_today = db.query(StockTransaction).filter(
            StockTransaction.transaction_date == today
        ).count()
        
        total_transactions_this_month = db.query(StockTransaction).filter(
            StockTransaction.transaction_date >= start_of_month
        ).count()
        
        # Stock movement today
        stock_in_today = db.query(func.sum(StockTransaction.quantity)).filter(
            and_(
                StockTransaction.transaction_date == today,
                StockTransaction.transaction_type == TransactionType.STOCK_IN
            )
        ).scalar() or 0
        
        stock_out_today = db.query(func.sum(StockTransaction.quantity)).filter(
            and_(
                StockTransaction.transaction_date == today,
                StockTransaction.transaction_type == TransactionType.STOCK_OUT
            )
        ).scalar() or 0
        
        # Stock movement this month
        stock_in_this_month = db.query(func.sum(StockTransaction.quantity)).filter(
            and_(
                StockTransaction.transaction_date >= start_of_month,
                StockTransaction.transaction_type == TransactionType.STOCK_IN
            )
        ).scalar() or 0
        
        stock_out_this_month = db.query(func.sum(StockTransaction.quantity)).filter(
            and_(
                StockTransaction.transaction_date >= start_of_month,
                StockTransaction.transaction_type == TransactionType.STOCK_OUT
            )
        ).scalar() or 0
        
        stats = DashboardStats(
            total_products=total_products,
            total_suppliers=total_suppliers,
            total_stock_value=Decimal(str(total_stock_value)),
            low_stock_products=low_stock_products,
            out_of_stock_products=out_of_stock_products,
            total_transactions_today=total_transactions_today,
            total_transactions_this_month=total_transactions_this_month,
            stock_in_today=stock_in_today,
            stock_out_today=stock_out_today,
            stock_in_this_month=stock_in_this_month,
            stock_out_this_month=stock_out_this_month
        )
        
        # 2. Stock Alerts (low stock and out of stock products)
        stock_alert_products = db.query(Product).outerjoin(Supplier).filter(
            and_(
                Product.status == 'active',
                or_(
                    Product.current_stock <= Product.min_stock_level,
                    Product.current_stock == 0
                )
            )
        ).order_by(Product.current_stock.asc()).limit(limit_alerts).all()
        
        stock_alerts = []
        for product in stock_alert_products:
            alert = ProductStockAlert(
                id=product.id,
                name=product.name,
                sku=product.sku,
                current_stock=product.current_stock,
                min_stock_level=product.min_stock_level,
                supplier_name=product.supplier.name if product.supplier else None,
                unit_price=product.unit_price or Decimal('0'),
                stock_status=product.stock_status
            )
            stock_alerts.append(alert)
        
        # 3. Recent Transactions
        recent_trans = db.query(StockTransaction).join(Product).order_by(
            desc(StockTransaction.created_at)
        ).limit(limit_transactions).all()
        
        recent_transactions = []
        for trans in recent_trans:
            transaction = RecentTransaction(
                id=trans.id,
                product_name=trans.product.name,
                product_sku=trans.product.sku,
                transaction_type=trans.transaction_type.value,
                quantity=trans.quantity,
                total_amount=trans.total_amount,
                transaction_date=trans.transaction_date.isoformat(),
                reference_number=trans.reference_number
            )
            recent_transactions.append(transaction)
        
        # 4. Category Statistics
        category_results = db.query(
            Product.category,
            func.count(Product.id).label('product_count'),
            func.sum(Product.current_stock).label('total_stock'),
            func.sum(Product.current_stock * Product.unit_price).label('total_value')
        ).filter(
            Product.status == 'active'
        ).group_by(Product.category).having(
            Product.category.isnot(None)
        ).all()
        
        category_stats = []
        for cat_result in category_results:
            category = CategoryStats(
                category=cat_result.category or 'Uncategorized',
                product_count=cat_result.product_count,
                total_stock=cat_result.total_stock or 0,
                total_value=Decimal(str(cat_result.total_value or 0))
            )
            category_stats.append(category)
        
        # 5. Monthly Trends (last N months based on days_back)
        monthly_results = db.query(
            func.date_trunc('month', StockTransaction.transaction_date).label('month'),
            func.sum(func.case(
                (StockTransaction.transaction_type == TransactionType.STOCK_IN, StockTransaction.quantity),
                else_=0
            )).label('stock_in'),
            func.sum(func.case(
                (StockTransaction.transaction_type == TransactionType.STOCK_OUT, StockTransaction.quantity),
                else_=0
            )).label('stock_out'),
            func.count(StockTransaction.id).label('transactions_count')
        ).filter(
            StockTransaction.transaction_date >= start_date
        ).group_by(
            func.date_trunc('month', StockTransaction.transaction_date)
        ).order_by(
            func.date_trunc('month', StockTransaction.transaction_date)
        ).all()
        
        monthly_trends = []
        for month_result in monthly_results:
            stock_in = month_result.stock_in or 0
            stock_out = month_result.stock_out or 0
            trend = MonthlyTrend(
                month=month_result.month.strftime('%Y-%m'),
                stock_in=stock_in,
                stock_out=stock_out,
                net_change=stock_in - stock_out,
                transactions_count=month_result.transactions_count
            )
            monthly_trends.append(trend)
        
        # 6. Top Products by Transaction Activity
        top_product_results = db.query(
            Product.id,
            Product.name,
            Product.sku,
            Product.category,
            Product.current_stock,
            Supplier.name.label('supplier_name'),
            func.count(StockTransaction.id).label('total_transactions'),
            func.sum(StockTransaction.quantity).label('total_quantity')
        ).outerjoin(StockTransaction).outerjoin(Supplier).filter(
            and_(
                Product.status == 'active',
                or_(
                    StockTransaction.transaction_date >= start_date,
                    StockTransaction.id.is_(None)
                )
            )
        ).group_by(
            Product.id, Product.name, Product.sku, Product.category, 
            Product.current_stock, Supplier.name
        ).order_by(
            desc('total_transactions')
        ).limit(limit_products).all()
        
        top_products = []
        for prod_result in top_product_results:
            top_product = TopProduct(
                id=prod_result.id,
                name=prod_result.name,
                sku=prod_result.sku,
                category=prod_result.category,
                total_transactions=prod_result.total_transactions or 0,
                total_quantity=prod_result.total_quantity or 0,
                current_stock=prod_result.current_stock,
                supplier_name=prod_result.supplier_name
            )
            top_products.append(top_product)
        
        return DashboardResponse(
            stats=stats,
            stock_alerts=stock_alerts,
            recent_transactions=recent_transactions,
            category_stats=category_stats,
            monthly_trends=monthly_trends,
            top_products=top_products
        )
        
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/stats/inventory-value")
async def get_inventory_value_breakdown(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get inventory value breakdown by category and supplier"""
    
    try:
        # By Category
        category_values = db.query(
            Product.category,
            func.count(Product.id).label('product_count'),
            func.sum(Product.current_stock * Product.unit_price).label('total_value'),
            func.sum(Product.current_stock).label('total_stock')
        ).filter(
            Product.status == 'active'
        ).group_by(Product.category).all()
        
        # By Supplier
        supplier_values = db.query(
            Supplier.name,
            func.count(Product.id).label('product_count'),
            func.sum(Product.current_stock * Product.unit_price).label('total_value'),
            func.sum(Product.current_stock).label('total_stock')
        ).join(Product).filter(
            and_(
                Product.status == 'active',
                Supplier.status == 'active'
            )
        ).group_by(Supplier.name).all()
        
        return {
            "by_category": [
                {
                    "category": cat.category or "Uncategorized",
                    "product_count": cat.product_count,
                    "total_value": float(cat.total_value or 0),
                    "total_stock": cat.total_stock or 0
                }
                for cat in category_values
            ],
            "by_supplier": [
                {
                    "supplier": sup.name,
                    "product_count": sup.product_count,
                    "total_value": float(sup.total_value or 0),
                    "total_stock": sup.total_stock or 0
                }
                for sup in supplier_values
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching inventory value breakdown: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/stats/transaction-trends")
async def get_transaction_trends(
    days: int = Query(30, ge=7, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get detailed transaction trends over time"""
    
    try:
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        # Daily transaction trends
        daily_trends = db.query(
            StockTransaction.transaction_date,
            StockTransaction.transaction_type,
            func.count(StockTransaction.id).label('count'),
            func.sum(StockTransaction.quantity).label('total_quantity'),
            func.sum(StockTransaction.total_amount).label('total_amount')
        ).filter(
            StockTransaction.transaction_date >= start_date
        ).group_by(
            StockTransaction.transaction_date,
            StockTransaction.transaction_type
        ).order_by(
            StockTransaction.transaction_date,
            StockTransaction.transaction_type
        ).all()
        
        # Organize data by date
        trends_by_date = {}
        for trend in daily_trends:
            date_str = trend.transaction_date.isoformat()
            if date_str not in trends_by_date:
                trends_by_date[date_str] = {
                    "date": date_str,
                    "stock_in": {"count": 0, "quantity": 0, "amount": 0.0},
                    "stock_out": {"count": 0, "quantity": 0, "amount": 0.0},
                    "adjustment": {"count": 0, "quantity": 0, "amount": 0.0}
                }
            
            type_key = trend.transaction_type.value.lower().replace('_', '_')
            trends_by_date[date_str][type_key] = {
                "count": trend.count,
                "quantity": trend.total_quantity or 0,
                "amount": float(trend.total_amount or 0)
            }
        
        return {
            "trends": list(trends_by_date.values()),
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching transaction trends: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")