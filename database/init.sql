-- Stock Management System Database Initialization
-- This script creates the database schema for the stock management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database schema
-- Note: Using public schema for simplicity, in production consider a dedicated schema

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
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
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS stock_transactions (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_current_stock ON products(current_stock);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON stock_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON stock_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_description_gin ON products USING gin(to_tsvector('english', description));

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_date_product ON stock_transactions(transaction_date, product_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_category ON products(current_stock, category) WHERE status = 'active';

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON stock_transactions;
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON stock_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create materialized view for dashboard statistics
DROP MATERIALIZED VIEW IF EXISTS dashboard_stats;
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'active') as total_products,
    SUM(current_stock * unit_price) FILTER (WHERE status = 'active') as total_inventory_value,
    COUNT(*) FILTER (WHERE current_stock <= min_stock_level AND status = 'active') as low_stock_count,
    COUNT(*) FILTER (WHERE current_stock = 0 AND status = 'active') as out_of_stock_count,
    CURRENT_TIMESTAMP as last_updated
FROM products;

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get stock status for a product
CREATE OR REPLACE FUNCTION get_stock_status(current_stock INTEGER, min_stock_level INTEGER)
RETURNS VARCHAR(20) AS $$
BEGIN
    IF current_stock = 0 THEN
        RETURN 'out_of_stock';
    ELSIF current_stock <= min_stock_level THEN
        RETURN 'low_stock';
    ELSE
        RETURN 'good';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate inventory value for a product
CREATE OR REPLACE FUNCTION calculate_inventory_value(current_stock INTEGER, unit_price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN current_stock * unit_price;
END;
$$ LANGUAGE plpgsql;

-- View for product summary with calculated fields
CREATE OR REPLACE VIEW product_summary AS
SELECT 
    p.*,
    s.name as supplier_name,
    s.contact_person as supplier_contact,
    get_stock_status(p.current_stock, p.min_stock_level) as stock_status,
    calculate_inventory_value(p.current_stock, p.unit_price) as inventory_value,
    (
        SELECT COUNT(*) 
        FROM stock_transactions st 
        WHERE st.product_id = p.id 
        AND st.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
    ) as transactions_last_30_days,
    (
        SELECT MAX(st.transaction_date) 
        FROM stock_transactions st 
        WHERE st.product_id = p.id
    ) as last_transaction_date
FROM products p
LEFT JOIN suppliers s ON p.supplier_id = s.id;

-- View for transaction summary with product details
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    st.*,
    p.name as product_name,
    p.sku as product_sku,
    p.category as product_category,
    s.name as supplier_name
FROM stock_transactions st
JOIN products p ON st.product_id = p.id
LEFT JOIN suppliers s ON p.supplier_id = s.id;

-- Grant necessary permissions (adjust for your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO stockuser;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO stockuser;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO stockuser;

-- Initial refresh of materialized views
SELECT refresh_dashboard_stats();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Stock Management System database initialized successfully!';
    RAISE NOTICE 'Database includes: % suppliers table, % products table, % transactions table', 
                 (SELECT 'suppliers'), (SELECT 'products'), (SELECT 'stock_transactions');
END $$;