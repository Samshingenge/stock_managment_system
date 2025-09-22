# 📚 API Documentation - Stock Management System

## Complete FastAPI Backend Specification

This document provides comprehensive API documentation for the stock management system backend built with FastAPI and PostgreSQL.

---

## 🏗️ API Architecture Overview

### Base Information
- **Base URL**: `http://localhost:8000/api` (development)
- **Production URL**: `https://api.your-domain.com/api`
- **API Version**: v1
- **Authentication**: JWT Bearer Token
- **Content Type**: `application/json`
- **Documentation**: Available at `/docs` (Swagger UI) and `/redoc`

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "errors": null,
  "metadata": {
    "timestamp": "2025-01-20T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "data": null,
  "message": "Error occurred",
  "errors": [
    {
      "field": "name",
      "message": "This field is required",
      "code": "REQUIRED_FIELD"
    }
  ],
  "metadata": {
    "timestamp": "2025-01-20T10:30:00Z",
    "request_id": "uuid-here"
  }
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
**Description**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response** (200):
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

**Error Responses**:
- `401`: Invalid credentials
- `422`: Validation error

### POST /auth/refresh
**Description**: Refresh expired JWT token

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "access_token": "new-jwt-token",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### POST /auth/logout
**Description**: Invalidate current token

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Successfully logged out"
}
```

---

## 📦 Products API

### GET /products
**Description**: Retrieve paginated list of products with filtering options

**Query Parameters**:
- `page` (int, optional): Page number (default: 1)
- `per_page` (int, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search in name, SKU, or description
- `category` (string, optional): Filter by category
- `status` (string, optional): Filter by status (active, inactive, discontinued)
- `supplier_id` (uuid, optional): Filter by supplier
- `low_stock_only` (bool, optional): Show only low stock items
- `sort_by` (string, optional): Sort field (name, sku, category, price, stock)
- `sort_order` (string, optional): Sort order (asc, desc)

**Example Request**:
```
GET /products?page=1&per_page=20&search=usb&category=Electronics&sort_by=name&sort_order=asc
```

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "USB Cable Type-C",
      "sku": "USB-TC-001",
      "category": "Electronics",
      "description": "High-quality USB cable for data transfer and charging",
      "unit_price": 12.99,
      "min_stock_level": 50,
      "current_stock": 150,
      "supplier_id": "uuid",
      "status": "active",
      "created_at": "2025-01-14T10:30:00Z",
      "updated_at": "2025-01-14T10:30:00Z",
      "inventory_value": 1948.50,
      "is_low_stock": false,
      "supplier": {
        "id": "uuid",
        "name": "ABC Electronics Ltd"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 20,
  "pages": 5,
  "has_next": true,
  "has_prev": false
}
```

### GET /products/{product_id}
**Description**: Retrieve single product by ID

**Path Parameters**:
- `product_id` (uuid): Product identifier

**Response** (200):
```json
{
  "id": "uuid",
  "name": "USB Cable Type-C",
  "sku": "USB-TC-001",
  "category": "Electronics",
  "description": "High-quality USB cable for data transfer and charging",
  "unit_price": 12.99,
  "min_stock_level": 50,
  "current_stock": 150,
  "supplier_id": "uuid",
  "status": "active",
  "created_at": "2025-01-14T10:30:00Z",
  "updated_at": "2025-01-14T10:30:00Z",
  "inventory_value": 1948.50,
  "is_low_stock": false,
  "supplier": {
    "id": "uuid",
    "name": "ABC Electronics Ltd",
    "contact_person": "John Smith",
    "email": "john@abcelectronics.com"
  },
  "recent_transactions": [
    {
      "id": "uuid",
      "transaction_type": "stock_in",
      "quantity": 100,
      "transaction_date": "2025-01-14T10:30:00Z"
    }
  ]
}
```

**Error Responses**:
- `404`: Product not found

### POST /products
**Description**: Create new product

**Request Body**:
```json
{
  "name": "USB Cable Type-C",
  "sku": "USB-TC-001",
  "category": "Electronics",
  "description": "High-quality USB cable for data transfer and charging",
  "unit_price": 12.99,
  "min_stock_level": 50,
  "current_stock": 150,
  "supplier_id": "uuid",
  "status": "active"
}
```

**Validation Rules**:
- `name`: Required, 1-255 characters
- `sku`: Optional, unique, alphanumeric with hyphens/underscores
- `unit_price`: Required, >= 0, max 2 decimal places
- `min_stock_level`: Optional, >= 0
- `current_stock`: Optional, >= 0
- `status`: Must be one of: active, inactive, discontinued

**Response** (201):
```json
{
  "id": "uuid",
  "name": "USB Cable Type-C",
  "sku": "USB-TC-001",
  "category": "Electronics",
  "description": "High-quality USB cable for data transfer and charging",
  "unit_price": 12.99,
  "min_stock_level": 50,
  "current_stock": 150,
  "supplier_id": "uuid",
  "status": "active",
  "created_at": "2025-01-14T10:30:00Z",
  "updated_at": "2025-01-14T10:30:00Z",
  "inventory_value": 1948.50,
  "is_low_stock": false
}
```

**Error Responses**:
- `400`: Duplicate SKU
- `422`: Validation error

### PUT /products/{product_id}
**Description**: Update existing product (full update)

**Path Parameters**:
- `product_id` (uuid): Product identifier

**Request Body**: Same as POST /products

**Response** (200): Same as POST response

**Error Responses**:
- `404`: Product not found
- `400`: Duplicate SKU
- `422`: Validation error

### PATCH /products/{product_id}
**Description**: Partially update product

**Path Parameters**:
- `product_id` (uuid): Product identifier

**Request Body** (all fields optional):
```json
{
  "name": "Updated USB Cable Type-C",
  "current_stock": 200
}
```

**Response** (200): Updated product object

### DELETE /products/{product_id}
**Description**: Delete product (soft delete)

**Path Parameters**:
- `product_id` (uuid): Product identifier

**Response** (204): No content

**Error Responses**:
- `404`: Product not found
- `400`: Cannot delete product with existing transactions

### GET /products/categories
**Description**: Get list of all product categories

**Response** (200):
```json
{
  "categories": [
    {
      "name": "Electronics",
      "count": 45,
      "total_value": 12500.00
    },
    {
      "name": "Accessories",
      "count": 23,
      "total_value": 3400.00
    }
  ]
}
```

### GET /products/low-stock
**Description**: Get products with low stock levels

**Query Parameters**:
- `threshold` (int, optional): Custom threshold (default: uses min_stock_level)

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Bluetooth Headphones",
      "sku": "BT-HP-002",
      "current_stock": 25,
      "min_stock_level": 30,
      "shortage": 5,
      "unit_price": 89.99,
      "reorder_value": 449.95,
      "priority": "medium"
    }
  ],
  "total_items": 3,
  "total_shortage_value": 1234.50
}
```

---

## 📊 Stock Transactions API

### GET /transactions
**Description**: Retrieve paginated list of stock transactions

**Query Parameters**:
- `page` (int, optional): Page number (default: 1)
- `per_page` (int, optional): Items per page (default: 10, max: 100)
- `product_id` (uuid, optional): Filter by product
- `transaction_type` (string, optional): Filter by type (stock_in, stock_out, adjustment)
- `date_from` (datetime, optional): Start date filter (ISO format)
- `date_to` (datetime, optional): End date filter (ISO format)
- `reference_number` (string, optional): Filter by reference number
- `created_by` (string, optional): Filter by creator
- `sort_by` (string, optional): Sort field (date, amount, quantity)
- `sort_order` (string, optional): Sort order (asc, desc)

**Example Request**:
```
GET /transactions?product_id=uuid&transaction_type=stock_in&date_from=2025-01-01T00:00:00Z&sort_by=date&sort_order=desc
```

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "transaction_type": "stock_in",
      "quantity": 100,
      "unit_price": 12.99,
      "total_amount": 1299.00,
      "reference_number": "PO-2025-001",
      "notes": "Initial stock setup",
      "created_by": "admin",
      "transaction_date": "2025-01-14T10:30:00Z",
      "created_at": "2025-01-14T10:30:00Z",
      "updated_at": "2025-01-14T10:30:00Z",
      "product": {
        "id": "uuid",
        "name": "USB Cable Type-C",
        "sku": "USB-TC-001"
      }
    }
  ],
  "total": 250,
  "page": 1,
  "per_page": 10,
  "pages": 25,
  "summary": {
    "total_stock_in": 15000,
    "total_stock_out": 8500,
    "net_movement": 6500,
    "total_value": 125000.00
  }
}
```

### GET /transactions/{transaction_id}
**Description**: Retrieve single transaction by ID

**Path Parameters**:
- `transaction_id` (uuid): Transaction identifier

**Response** (200):
```json
{
  "id": "uuid",
  "product_id": "uuid",
  "transaction_type": "stock_in",
  "quantity": 100,
  "unit_price": 12.99,
  "total_amount": 1299.00,
  "reference_number": "PO-2025-001",
  "notes": "Initial stock setup",
  "created_by": "admin",
  "transaction_date": "2025-01-14T10:30:00Z",
  "created_at": "2025-01-14T10:30:00Z",
  "updated_at": "2025-01-14T10:30:00Z",
  "product": {
    "id": "uuid",
    "name": "USB Cable Type-C",
    "sku": "USB-TC-001",
    "category": "Electronics"
  }
}
```

### POST /transactions/stock-in
**Description**: Process stock in transaction

**Request Body**:
```json
{
  "product_id": "uuid",
  "quantity": 100,
  "unit_price": 12.99,
  "reference_number": "PO-2025-001",
  "notes": "Received from supplier ABC Electronics",
  "created_by": "admin",
  "transaction_date": "2025-01-14T10:30:00Z"
}
```

**Validation Rules**:
- `product_id`: Required, must exist
- `quantity`: Required, > 0
- `unit_price`: Required, >= 0
- `reference_number`: Optional, max 255 characters
- `notes`: Optional, max 1000 characters
- `transaction_date`: Optional, defaults to current time

**Response** (201):
```json
{
  "id": "uuid",
  "product_id": "uuid",
  "transaction_type": "stock_in",
  "quantity": 100,
  "unit_price": 12.99,
  "total_amount": 1299.00,
  "reference_number": "PO-2025-001",
  "notes": "Received from supplier ABC Electronics",
  "created_by": "admin",
  "transaction_date": "2025-01-14T10:30:00Z",
  "created_at": "2025-01-14T10:30:00Z",
  "updated_at": "2025-01-14T10:30:00Z",
  "product_updated": {
    "previous_stock": 150,
    "new_stock": 250,
    "stock_change": 100
  }
}
```

**Error Responses**:
- `404`: Product not found
- `422`: Validation error

### POST /transactions/stock-out
**Description**: Process stock out transaction with stock validation

**Request Body**:
```json
{
  "product_id": "uuid",
  "quantity": 50,
  "unit_price": 12.99,
  "reference_number": "SO-2025-001",
  "notes": "Sold to customer XYZ",
  "created_by": "sales_user",
  "transaction_date": "2025-01-14T14:30:00Z"
}
```

**Response** (201): Same structure as stock-in response

**Error Responses**:
- `400`: Insufficient stock
- `404`: Product not found
- `422`: Validation error

### POST /transactions/adjustment
**Description**: Process stock adjustment (correction)

**Request Body**:
```json
{
  "product_id": "uuid",
  "quantity": -5,
  "unit_price": 12.99,
  "reference_number": "ADJ-2025-001",
  "notes": "Inventory count adjustment - damaged items removed",
  "adjustment_reason": "damaged",
  "created_by": "warehouse_manager"
}
```

**Validation Rules**:
- `adjustment_reason`: Required for adjustments (damaged, lost, found, correction)

### PUT /transactions/{transaction_id}
**Description**: Update existing transaction (limited fields)

**Path Parameters**:
- `transaction_id` (uuid): Transaction identifier

**Request Body**:
```json
{
  "reference_number": "Updated-PO-2025-001",
  "notes": "Updated notes"
}
```

**Note**: Only reference_number and notes can be updated. Quantity and pricing changes require reversal transactions.

### DELETE /transactions/{transaction_id}
**Description**: Reverse/cancel transaction

**Path Parameters**:
- `transaction_id` (uuid): Transaction identifier

**Request Body**:
```json
{
  "reversal_reason": "Incorrect entry",
  "notes": "Transaction entered in error"
}
```

**Response** (200):
```json
{
  "original_transaction": {
    "id": "uuid",
    "status": "reversed"
  },
  "reversal_transaction": {
    "id": "uuid",
    "transaction_type": "stock_out",
    "quantity": -100,
    "notes": "Reversal of transaction uuid - Incorrect entry"
  },
  "product_updated": {
    "previous_stock": 250,
    "new_stock": 150,
    "stock_change": -100
  }
}
```

---

## 🏢 Suppliers API

### GET /suppliers
**Description**: Retrieve paginated list of suppliers

**Query Parameters**:
- `page` (int, optional): Page number (default: 1)
- `per_page` (int, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search in name, contact_person, or email
- `status` (string, optional): Filter by status (active, inactive)
- `sort_by` (string, optional): Sort field (name, email, created_at)
- `sort_order` (string, optional): Sort order (asc, desc)

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "ABC Electronics Ltd",
      "contact_person": "John Smith",
      "email": "john@abcelectronics.com",
      "phone": "+1-555-0101",
      "address": "123 Industrial Ave, Tech City, TC 12345",
      "payment_terms": "Net 30 Days",
      "status": "active",
      "created_at": "2025-01-14T10:30:00Z",
      "updated_at": "2025-01-14T10:30:00Z",
      "product_count": 15,
      "total_transactions": 45,
      "total_value": 25000.00
    }
  ],
  "total": 25,
  "page": 1,
  "per_page": 10,
  "pages": 3
}
```

### GET /suppliers/{supplier_id}
**Description**: Retrieve single supplier by ID

**Path Parameters**:
- `supplier_id` (uuid): Supplier identifier

**Response** (200):
```json
{
  "id": "uuid",
  "name": "ABC Electronics Ltd",
  "contact_person": "John Smith",
  "email": "john@abcelectronics.com",
  "phone": "+1-555-0101",
  "address": "123 Industrial Ave, Tech City, TC 12345",
  "payment_terms": "Net 30 Days",
  "status": "active",
  "created_at": "2025-01-14T10:30:00Z",
  "updated_at": "2025-01-14T10:30:00Z",
  "products": [
    {
      "id": "uuid",
      "name": "USB Cable Type-C",
      "sku": "USB-TC-001",
      "current_stock": 150,
      "unit_price": 12.99
    }
  ],
  "recent_transactions": [
    {
      "id": "uuid",
      "transaction_type": "stock_in",
      "quantity": 100,
      "total_amount": 1299.00,
      "transaction_date": "2025-01-14T10:30:00Z"
    }
  ],
  "statistics": {
    "total_products": 15,
    "active_products": 12,
    "total_transactions": 45,
    "total_value_last_30_days": 15000.00,
    "average_order_value": 333.33
  }
}
```

### POST /suppliers
**Description**: Create new supplier

**Request Body**:
```json
{
  "name": "ABC Electronics Ltd",
  "contact_person": "John Smith",
  "email": "john@abcelectronics.com",
  "phone": "+1-555-0101",
  "address": "123 Industrial Ave, Tech City, TC 12345",
  "payment_terms": "Net 30 Days",
  "status": "active"
}
```

**Validation Rules**:
- `name`: Required, 1-255 characters, unique
- `email`: Optional, valid email format
- `phone`: Optional, valid phone format
- `status`: Must be one of: active, inactive

**Response** (201): Created supplier object

### PUT /suppliers/{supplier_id}
**Description**: Update existing supplier

**Path Parameters**:
- `supplier_id` (uuid): Supplier identifier

**Request Body**: Same as POST /suppliers

**Response** (200): Updated supplier object

### DELETE /suppliers/{supplier_id}
**Description**: Delete supplier (soft delete)

**Path Parameters**:
- `supplier_id` (uuid): Supplier identifier

**Response** (204): No content

**Error Responses**:
- `400`: Cannot delete supplier with associated products

---

## 📊 Dashboard & Analytics API

### GET /dashboard/stats
**Description**: Get comprehensive dashboard statistics

**Query Parameters**:
- `period` (string, optional): Time period (today, week, month, year, all)

**Response** (200):
```json
{
  "overview": {
    "total_products": 156,
    "active_products": 142,
    "total_suppliers": 12,
    "active_suppliers": 11
  },
  "inventory": {
    "total_inventory_value": 125000.50,
    "total_stock_units": 5420,
    "low_stock_items": 8,
    "out_of_stock_items": 2,
    "categories": {
      "Electronics": {
        "count": 85,
        "value": 75000.00
      },
      "Accessories": {
        "count": 45,
        "value": 35000.00
      }
    }
  },
  "transactions": {
    "period": "today",
    "stock_in": {
      "count": 15,
      "quantity": 450,
      "value": 5500.00
    },
    "stock_out": {
      "count": 23,
      "quantity": 320,
      "value": 4200.00
    },
    "net_movement": {
      "quantity": 130,
      "value": 1300.00
    }
  },
  "alerts": {
    "low_stock": 8,
    "out_of_stock": 2,
    "high_value_transactions": 3,
    "new_products_week": 5
  }
}
```

### GET /dashboard/chart-data/stock-levels
**Description**: Get stock levels data for charts

**Response** (200):
```json
{
  "by_category": [
    {
      "category": "Electronics",
      "total_stock": 2500,
      "total_value": 75000.00,
      "product_count": 85
    },
    {
      "category": "Accessories", 
      "total_stock": 1800,
      "total_value": 35000.00,
      "product_count": 45
    }
  ],
  "by_status": [
    {
      "status": "Good",
      "count": 120,
      "percentage": 84.5
    },
    {
      "status": "Low Stock",
      "count": 18,
      "percentage": 12.7
    },
    {
      "status": "Out of Stock",
      "count": 4,
      "percentage": 2.8
    }
  ]
}
```

### GET /dashboard/chart-data/transaction-trends
**Description**: Get transaction trends for charts

**Query Parameters**:
- `days` (int, optional): Number of days (default: 7, max: 365)

**Response** (200):
```json
{
  "period": {
    "start_date": "2025-01-14",
    "end_date": "2025-01-20",
    "days": 7
  },
  "daily_data": [
    {
      "date": "2025-01-14",
      "stock_in": {
        "count": 8,
        "quantity": 250,
        "value": 3200.00
      },
      "stock_out": {
        "count": 12,
        "quantity": 180,
        "value": 2400.00
      },
      "net_movement": 70,
      "net_value": 800.00
    }
  ],
  "totals": {
    "stock_in_total": 1750,
    "stock_out_total": 1260,
    "net_movement": 490,
    "total_value": 5600.00
  }
}
```

### GET /dashboard/recent-activities
**Description**: Get recent system activities

**Query Parameters**:
- `limit` (int, optional): Number of activities (default: 10, max: 50)

**Response** (200):
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "stock_transaction",
      "action": "stock_in",
      "description": "Added 100 units of USB Cable Type-C",
      "user": "admin",
      "timestamp": "2025-01-20T10:30:00Z",
      "details": {
        "product_id": "uuid",
        "product_name": "USB Cable Type-C",
        "quantity": 100,
        "value": 1299.00
      }
    },
    {
      "id": "uuid", 
      "type": "product",
      "action": "created",
      "description": "Created new product: Wireless Headphones",
      "user": "admin",
      "timestamp": "2025-01-20T09:15:00Z",
      "details": {
        "product_id": "uuid",
        "product_name": "Wireless Headphones"
      }
    }
  ],
  "total": 150,
  "has_more": true
}
```

---

## 📋 Reports API

### GET /reports/inventory-report
**Description**: Generate comprehensive inventory report

**Query Parameters**:
- `format` (string, optional): Response format (json, csv, excel)
- `category` (string, optional): Filter by category
- `status` (string, optional): Filter by status
- `low_stock_only` (bool, optional): Include only low stock items

**Response** (200):
```json
{
  "report_metadata": {
    "generated_at": "2025-01-20T10:30:00Z",
    "generated_by": "admin",
    "filters_applied": {
      "category": null,
      "status": null,
      "low_stock_only": false
    },
    "total_products": 156
  },
  "summary": {
    "total_inventory_value": 125000.50,
    "total_stock_units": 5420,
    "categories_count": 8,
    "low_stock_items": 8,
    "out_of_stock_items": 2
  },
  "products": [
    {
      "id": "uuid",
      "name": "USB Cable Type-C",
      "sku": "USB-TC-001",
      "category": "Electronics",
      "current_stock": 150,
      "min_stock_level": 50,
      "unit_price": 12.99,
      "inventory_value": 1948.50,
      "stock_status": "Good",
      "supplier_name": "ABC Electronics Ltd",
      "last_transaction_date": "2025-01-20T10:30:00Z",
      "days_since_last_transaction": 0
    }
  ]
}
```

### GET /reports/transaction-report
**Description**: Generate transaction report

**Query Parameters**:
- `date_from` (date): Start date
- `date_to` (date): End date
- `transaction_type` (string, optional): Filter by type
- `product_id` (uuid, optional): Filter by product
- `format` (string, optional): Response format

**Response** (200):
```json
{
  "report_metadata": {
    "generated_at": "2025-01-20T10:30:00Z", 
    "period": {
      "start_date": "2025-01-01",
      "end_date": "2025-01-20"
    },
    "total_transactions": 450
  },
  "summary": {
    "stock_in": {
      "count": 180,
      "total_quantity": 15000,
      "total_value": 185000.00
    },
    "stock_out": {
      "count": 250,
      "total_quantity": 12000,
      "total_value": 155000.00
    },
    "adjustments": {
      "count": 20,
      "total_quantity": -150,
      "total_value": -1800.00
    }
  },
  "transactions": [
    {
      "id": "uuid",
      "date": "2025-01-20T10:30:00Z",
      "type": "stock_in",
      "product_name": "USB Cable Type-C",
      "sku": "USB-TC-001",
      "quantity": 100,
      "unit_price": 12.99,
      "total_amount": 1299.00,
      "reference_number": "PO-2025-001",
      "created_by": "admin"
    }
  ]
}
```

### POST /reports/export
**Description**: Export report data in various formats

**Request Body**:
```json
{
  "report_type": "inventory", 
  "format": "excel",
  "filters": {
    "category": "Electronics",
    "date_from": "2025-01-01",
    "date_to": "2025-01-20"
  },
  "options": {
    "include_charts": true,
    "include_summary": true,
    "email_delivery": {
      "enabled": true,
      "recipients": ["admin@company.com"]
    }
  }
}
```

**Response** (200):
```json
{
  "export_id": "uuid",
  "status": "processing",
  "download_url": null,
  "estimated_completion": "2025-01-20T10:35:00Z",
  "format": "excel",
  "file_size_estimate": "2.5MB"
}
```

### GET /reports/export/{export_id}
**Description**: Check export status and download

**Path Parameters**:
- `export_id` (uuid): Export job identifier

**Response** (200):
```json
{
  "export_id": "uuid",
  "status": "completed",
  "download_url": "/api/reports/download/uuid",
  "completed_at": "2025-01-20T10:33:00Z",
  "file_size": "2.3MB",
  "expires_at": "2025-01-21T10:33:00Z"
}
```

---

## 🔍 Search & Filtering API

### GET /search
**Description**: Global search across all entities

**Query Parameters**:
- `q` (string): Search query
- `type` (string, optional): Entity type (products, suppliers, transactions, all)
- `limit` (int, optional): Results limit (default: 20)

**Response** (200):
```json
{
  "query": "usb",
  "total_results": 25,
  "results": {
    "products": [
      {
        "id": "uuid",
        "type": "product",
        "name": "USB Cable Type-C",
        "sku": "USB-TC-001",
        "match_fields": ["name", "sku"],
        "relevance_score": 0.95
      }
    ],
    "suppliers": [
      {
        "id": "uuid",
        "type": "supplier", 
        "name": "USB Components Ltd",
        "match_fields": ["name"],
        "relevance_score": 0.80
      }
    ],
    "transactions": [
      {
        "id": "uuid",
        "type": "transaction",
        "reference_number": "USB-PO-001", 
        "product_name": "USB Cable Type-C",
        "match_fields": ["reference_number"],
        "relevance_score": 0.75
      }
    ]
  }
}
```

---

## ⚠️ Error Codes Reference

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Unprocessable Entity
- `429`: Too Many Requests
- `500`: Internal Server Error

### Custom Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `DUPLICATE_SKU`: SKU already exists
- `INSUFFICIENT_STOCK`: Not enough stock available
- `PRODUCT_NOT_FOUND`: Product does not exist
- `SUPPLIER_NOT_FOUND`: Supplier does not exist
- `TRANSACTION_NOT_FOUND`: Transaction does not exist
- `INVALID_TRANSACTION_TYPE`: Unknown transaction type
- `CANNOT_DELETE_REFERENCED`: Cannot delete entity with references
- `EXPORT_GENERATION_FAILED`: Report export failed
- `AUTHENTICATION_REQUIRED`: Valid authentication token required
- `PERMISSION_DENIED`: Insufficient permissions for action

---

## 📝 Rate Limiting

### Rate Limit Headers
All API responses include rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
X-RateLimit-Window: 3600
```

### Rate Limit Tiers
- **Authentication endpoints**: 5 requests/minute
- **Standard endpoints**: 100 requests/minute  
- **Search endpoints**: 50 requests/minute
- **Export endpoints**: 10 requests/minute
- **Bulk operations**: 20 requests/minute

---

## 🔒 Security Headers

All API responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY  
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 📋 Testing Examples

### cURL Examples

**Login**:
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

**Create Product**:
```bash
curl -X POST "http://localhost:8000/api/products" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "USB Cable Type-C",
    "sku": "USB-TC-001", 
    "unit_price": 12.99,
    "category": "Electronics"
  }'
```

**Process Stock In**:
```bash
curl -X POST "http://localhost:8000/api/transactions/stock-in" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "uuid",
    "quantity": 100,
    "unit_price": 12.99,
    "reference_number": "PO-001"
  }'
```

This comprehensive API documentation provides all the endpoints, request/response formats, validation rules, and examples needed to implement the frontend React application and integrate with the FastAPI backend.