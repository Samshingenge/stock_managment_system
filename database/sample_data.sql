-- Sample Data for Stock Management System
-- This script inserts sample data to demonstrate the system functionality

-- Insert sample suppliers
INSERT INTO suppliers (id, name, contact_person, email, phone, address, payment_terms, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ABC Electronics Ltd', 'John Smith', 'john@abcelectronics.com', '+1-555-0101', '123 Industrial Ave, Tech City, TC 12345', 'Net 30 Days', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Global Parts Supply', 'Maria Garcia', 'maria@globalparts.com', '+1-555-0202', '456 Commerce St, Business District, BD 67890', 'Net 15 Days', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Tech Components Inc', 'David Lee', 'david@techcomponents.com', '+1-555-0303', '789 Innovation Blvd, Silicon Valley, SV 11111', 'COD', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'Digital Warehouse Co', 'Sarah Johnson', 'sarah@digitalwarehouse.com', '+1-555-0404', '321 Storage Lane, Logistics Park, LP 22222', 'Net 45 Days', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 'Premium Supplies Ltd', 'Michael Brown', 'michael@premiumsupplies.com', '+1-555-0505', '654 Quality Street, Enterprise Zone, EZ 33333', 'Net 30 Days', 'inactive')
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, name, sku, category, description, unit_price, min_stock_level, current_stock, supplier_id, status) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'USB Cable Type-C', 'USB-TC-001', 'Electronics', 'High-quality USB cable for data transfer and charging', 12.99, 50, 150, '550e8400-e29b-41d4-a716-446655440001', 'active'),
('650e8400-e29b-41d4-a716-446655440002', 'Bluetooth Headphones', 'BT-HP-002', 'Electronics', 'Wireless Bluetooth headphones with noise cancellation', 89.99, 30, 25, '550e8400-e29b-41d4-a716-446655440001', 'active'),
('650e8400-e29b-41d4-a716-446655440003', 'Phone Case', 'PC-UNI-003', 'Accessories', 'Protective phone case for various smartphone models', 19.99, 100, 200, '550e8400-e29b-41d4-a716-446655440002', 'active'),
('650e8400-e29b-41d4-a716-446655440004', 'Power Bank 10000mAh', 'PB-10K-004', 'Electronics', 'Portable power bank with fast charging capability', 45.99, 20, 5, '550e8400-e29b-41d4-a716-446655440002', 'active'),
('650e8400-e29b-41d4-a716-446655440005', 'HDMI Cable 6ft', 'HDMI-6-005', 'Cables', 'HDMI cable for high-definition video and audio transmission', 24.99, 25, 75, '550e8400-e29b-41d4-a716-446655440003', 'active'),
('650e8400-e29b-41d4-a716-446655440006', 'Wireless Mouse', 'WM-ERG-006', 'Electronics', 'Compact wireless mouse with ergonomic design', 34.99, 15, 0, '550e8400-e29b-41d4-a716-446655440003', 'active'),
('650e8400-e29b-41d4-a716-446655440007', 'Laptop Stand', 'LS-ADJ-007', 'Accessories', 'Adjustable laptop stand for better ergonomics', 59.99, 10, 35, '550e8400-e29b-41d4-a716-446655440004', 'active'),
('650e8400-e29b-41d4-a716-446655440008', 'Webcam HD', 'WC-HD-008', 'Electronics', '1080p HD webcam with built-in microphone', 79.99, 15, 8, '550e8400-e29b-41d4-a716-446655440004', 'active'),
('650e8400-e29b-41d4-a716-446655440009', 'Ethernet Cable Cat6', 'ETH-C6-009', 'Cables', '50ft Cat6 Ethernet cable for high-speed networking', 18.99, 30, 120, '550e8400-e29b-41d4-a716-446655440003', 'active'),
('650e8400-e29b-41d4-a716-446655440010', 'Keyboard Wireless', 'KB-WL-010', 'Electronics', 'Wireless mechanical keyboard with backlit keys', 129.99, 12, 18, '550e8400-e29b-41d4-a716-446655440001', 'active'),
('650e8400-e29b-41d4-a716-446655440011', 'Monitor 24 inch', 'MON-24-011', 'Electronics', '24-inch LED monitor with 1080p resolution', 199.99, 5, 12, '550e8400-e29b-41d4-a716-446655440004', 'active'),
('650e8400-e29b-41d4-a716-446655440012', 'Speaker Bluetooth', 'SPK-BT-012', 'Electronics', 'Portable Bluetooth speaker with premium sound quality', 69.99, 20, 45, '550e8400-e29b-41d4-a716-446655440002', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample stock transactions (covering last 30 days)
INSERT INTO stock_transactions (id, product_id, transaction_type, quantity, unit_price, total_amount, reference_number, notes, created_by, transaction_date) VALUES
-- Initial stock setup (30 days ago)
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'stock_in', 200, 12.99, 2598.00, 'INV-2024-001', 'Initial stock setup', 'Admin', CURRENT_TIMESTAMP - INTERVAL '30 days'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'stock_in', 50, 89.99, 4499.50, 'INV-2024-002', 'Initial stock setup', 'Admin', CURRENT_TIMESTAMP - INTERVAL '30 days'),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'stock_in', 200, 19.99, 3998.00, 'INV-2024-003', 'Initial stock setup', 'Admin', CURRENT_TIMESTAMP - INTERVAL '29 days'),

-- Regular transactions (various dates)
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'stock_out', 50, 12.99, 649.50, 'SO-2024-001', 'Sold to retail customer', 'User', CURRENT_TIMESTAMP - INTERVAL '25 days'),
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002', 'stock_out', 25, 89.99, 2249.75, 'SO-2024-002', 'Bulk sale to corporate client', 'User', CURRENT_TIMESTAMP - INTERVAL '23 days'),
('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440004', 'stock_in', 30, 45.99, 1379.70, 'INV-2024-004', 'Restocked from supplier', 'Admin', CURRENT_TIMESTAMP - INTERVAL '20 days'),

-- Recent transactions (last week)
('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440004', 'stock_out', 25, 45.99, 1149.75, 'SO-2024-003', 'Holiday season sales', 'User', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440005', 'stock_in', 100, 24.99, 2499.00, 'INV-2024-005', 'Regular stock replenishment', 'Admin', CURRENT_TIMESTAMP - INTERVAL '6 days'),
('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440005', 'stock_out', 25, 24.99, 624.75, 'SO-2024-004', 'Sold to electronics store', 'User', CURRENT_TIMESTAMP - INTERVAL '5 days'),

-- Very recent transactions (last 3 days)
('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440006', 'stock_in', 40, 34.99, 1399.60, 'INV-2024-006', 'New product batch', 'Admin', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440006', 'stock_out', 40, 34.99, 1399.60, 'SO-2024-005', 'Complete sellout - popular item', 'User', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440007', 'stock_in', 50, 59.99, 2999.50, 'INV-2024-007', 'New accessory line', 'Admin', CURRENT_TIMESTAMP - INTERVAL '2 days'),

-- Today's transactions
('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440007', 'stock_out', 15, 59.99, 899.85, 'SO-2024-006', 'Morning sales', 'User', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440008', 'stock_in', 25, 79.99, 1999.75, 'INV-2024-008', 'Webcam restock', 'Admin', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
('750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440008', 'stock_out', 17, 79.99, 1359.83, 'SO-2024-007', 'Remote work demand', 'User', CURRENT_TIMESTAMP - INTERVAL '4 hours'),

-- Additional transactions for more variety
('750e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440009', 'stock_in', 150, 18.99, 2848.50, 'INV-2024-009', 'Networking cable bulk order', 'Admin', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('750e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440009', 'stock_out', 30, 18.99, 569.70, 'SO-2024-008', 'Office setup project', 'User', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('750e8400-e29b-41d4-a716-446655440018', '650e8400-e29b-41d4-a716-446655440010', 'stock_in', 30, 129.99, 3899.70, 'INV-2024-010', 'Premium keyboard stock', 'Admin', CURRENT_TIMESTAMP - INTERVAL '12 days'),
('750e8400-e29b-41d4-a716-446655440019', '650e8400-e29b-41d4-a716-446655440010', 'stock_out', 12, 129.99, 1559.88, 'SO-2024-009', 'Gaming setup sales', 'User', CURRENT_TIMESTAMP - INTERVAL '8 days'),
('750e8400-e29b-41d4-a716-446655440020', '650e8400-e29b-41d4-a716-446655440011', 'stock_in', 20, 199.99, 3999.80, 'INV-2024-011', 'Monitor shipment', 'Admin', CURRENT_TIMESTAMP - INTERVAL '18 days'),
('750e8400-e29b-41d4-a716-446655440021', '650e8400-e29b-41d4-a716-446655440011', 'stock_out', 8, 199.99, 1599.92, 'SO-2024-010', 'Office upgrades', 'User', CURRENT_TIMESTAMP - INTERVAL '14 days'),
('750e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440012', 'stock_in', 60, 69.99, 4199.40, 'INV-2024-012', 'Speaker promotion stock', 'Admin', CURRENT_TIMESTAMP - INTERVAL '21 days'),
('750e8400-e29b-41d4-a716-446655440023', '650e8400-e29b-41d4-a716-446655440012', 'stock_out', 15, 69.99, 1049.85, 'SO-2024-011', 'Audio equipment sale', 'User', CURRENT_TIMESTAMP - INTERVAL '16 days'),

-- Some adjustments (inventory corrections)
('750e8400-e29b-41d4-a716-446655440024', '650e8400-e29b-41d4-a716-446655440002', 'adjustment', -2, 89.99, -179.98, 'ADJ-2024-001', 'Damaged items removed from inventory', 'Warehouse Manager', CURRENT_TIMESTAMP - INTERVAL '9 days'),
('750e8400-e29b-41d4-a716-446655440025', '650e8400-e29b-41d4-a716-446655440003', 'adjustment', 5, 19.99, 99.95, 'ADJ-2024-002', 'Found items during inventory count', 'Warehouse Manager', CURRENT_TIMESTAMP - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Refresh materialized views after inserting data
SELECT refresh_dashboard_stats();

-- Display summary of inserted data
DO $$
DECLARE
    supplier_count INTEGER;
    product_count INTEGER;
    transaction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO supplier_count FROM suppliers;
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO transaction_count FROM stock_transactions;
    
    RAISE NOTICE 'Sample data inserted successfully!';
    RAISE NOTICE 'Suppliers: %', supplier_count;
    RAISE NOTICE 'Products: %', product_count;
    RAISE NOTICE 'Transactions: %', transaction_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Low stock products: %', (SELECT COUNT(*) FROM products WHERE current_stock <= min_stock_level AND status = 'active');
    RAISE NOTICE 'Out of stock products: %', (SELECT COUNT(*) FROM products WHERE current_stock = 0 AND status = 'active');
    RAISE NOTICE 'Total inventory value: $%', (SELECT ROUND(SUM(current_stock * unit_price), 2) FROM products WHERE status = 'active');
END $$;