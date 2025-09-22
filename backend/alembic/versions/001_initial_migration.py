"""Initial migration - Create suppliers, products, and stock_transactions tables

Revision ID: 001
Revises: 
Create Date: 2024-09-20 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # Create suppliers table
    op.create_table('suppliers',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('contact_person', sa.String(length=255), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('website', sa.String(length=500), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='active', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.CheckConstraint("status IN ('active', 'inactive')", name='suppliers_status_check'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('name')
    )
    
    # Create products table
    op.create_table('products',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('sku', sa.String(length=100), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('unit_price', sa.DECIMAL(precision=10, scale=2), server_default='0.00', nullable=False),
        sa.Column('min_stock_level', sa.Integer(), server_default='0', nullable=True),
        sa.Column('current_stock', sa.Integer(), server_default='0', nullable=True),
        sa.Column('supplier_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='active', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.CheckConstraint("status IN ('active', 'inactive', 'discontinued')", name='products_status_check'),
        sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sku')
    )
    
    # Create stock_transactions table
    op.create_table('stock_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('transaction_type', sa.Enum('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', name='transactiontype'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.DECIMAL(precision=10, scale=2), nullable=True),
        sa.Column('total_amount', sa.DECIMAL(precision=12, scale=2), nullable=True),
        sa.Column('reference_number', sa.String(length=255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('transaction_date', sa.Date(), nullable=False),
        sa.Column('previous_stock', sa.Integer(), nullable=False),
        sa.Column('new_stock', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.CheckConstraint('quantity > 0', name='stock_transactions_quantity_check'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for better performance
    op.create_index('idx_products_category', 'products', ['category'])
    op.create_index('idx_products_status', 'products', ['status'])
    op.create_index('idx_products_supplier_id', 'products', ['supplier_id'])
    op.create_index('idx_products_current_stock', 'products', ['current_stock'])
    op.create_index('idx_suppliers_status', 'suppliers', ['status'])
    op.create_index('idx_stock_transactions_product_id', 'stock_transactions', ['product_id'])
    op.create_index('idx_stock_transactions_type', 'stock_transactions', ['transaction_type'])
    op.create_index('idx_stock_transactions_date', 'stock_transactions', ['transaction_date'])
    op.create_index('idx_stock_transactions_created', 'stock_transactions', ['created_at'])
    
    # Create trigger to automatically update updated_at timestamp
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)
    
    # Apply triggers to tables
    op.execute("""
        CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    op.execute("""
        CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    op.execute("""
        CREATE TRIGGER update_stock_transactions_updated_at BEFORE UPDATE ON stock_transactions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade() -> None:
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS update_stock_transactions_updated_at ON stock_transactions")
    op.execute("DROP TRIGGER IF EXISTS update_products_updated_at ON products")
    op.execute("DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers")
    
    # Drop function
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column()")
    
    # Drop indexes
    op.drop_index('idx_stock_transactions_created', table_name='stock_transactions')
    op.drop_index('idx_stock_transactions_date', table_name='stock_transactions')
    op.drop_index('idx_stock_transactions_type', table_name='stock_transactions')
    op.drop_index('idx_stock_transactions_product_id', table_name='stock_transactions')
    op.drop_index('idx_suppliers_status', table_name='suppliers')
    op.drop_index('idx_products_current_stock', table_name='products')
    op.drop_index('idx_products_supplier_id', table_name='products')
    op.drop_index('idx_products_status', table_name='products')
    op.drop_index('idx_products_category', table_name='products')
    
    # Drop tables
    op.drop_table('stock_transactions')
    op.drop_table('products')
    op.drop_table('suppliers')
    
    # Drop enum type
    op.execute("DROP TYPE IF EXISTS transactiontype")
    
    # Note: We don't drop the UUID extension as it might be used by other parts of the system