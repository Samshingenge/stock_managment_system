/**
 * Excel Export functionality for Stock Management System
 * Uses SheetJS library for client-side Excel generation
 */

// Main export function
function exportToExcel(products = [], transactions = [], suppliers = []) {
    try {
        showSpinner();
        
        // Create new workbook
        const workbook = XLSX.utils.book_new();
        
        // Create worksheets
        createProductsWorksheet(workbook, products);
        createTransactionsWorksheet(workbook, transactions);
        createSuppliersWorksheet(workbook, suppliers);
        createSummaryWorksheet(workbook, products, transactions);
        createInventoryReportWorksheet(workbook, products);
        createLowStockReportWorksheet(workbook, products);
        
        // Generate filename with current date
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const filename = `Stock_Management_Report_${dateStr}_${timeStr}.xlsx`;
        
        // Write and download the file
        XLSX.writeFile(workbook, filename);
        
        showToast('Excel report exported successfully', 'success');
        
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showToast('Failed to export Excel report: ' + error.message, 'error');
    } finally {
        hideSpinner();
    }
}

// Create Products worksheet
function createProductsWorksheet(workbook, products) {
    const worksheetData = [];
    
    // Add headers
    worksheetData.push([
        'Product ID',
        'Name',
        'SKU',
        'Category',
        'Description',
        'Unit Price',
        'Current Stock',
        'Min Stock Level',
        'Inventory Value',
        'Status',
        'Supplier ID',
        'Created Date',
        'Last Updated'
    ]);
    
    // Add data rows
    products.forEach(product => {
        const inventoryValue = (product.current_stock || 0) * (product.unit_price || 0);
        
        worksheetData.push([
            product.id || '',
            product.name || '',
            product.sku || '',
            product.category || '',
            product.description || '',
            product.unit_price || 0,
            product.current_stock || 0,
            product.min_stock_level || 0,
            inventoryValue,
            product.status || 'active',
            product.supplier_id || '',
            formatDateForExcel(product.created_at),
            formatDateForExcel(product.updated_at)
        ]);
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = [
        { wch: 15 }, // Product ID
        { wch: 25 }, // Name
        { wch: 15 }, // SKU
        { wch: 15 }, // Category
        { wch: 30 }, // Description
        { wch: 12 }, // Unit Price
        { wch: 12 }, // Current Stock
        { wch: 15 }, // Min Stock Level
        { wch: 15 }, // Inventory Value
        { wch: 10 }, // Status
        { wch: 15 }, // Supplier ID
        { wch: 18 }, // Created Date
        { wch: 18 }  // Last Updated
    ];
    worksheet['!cols'] = columnWidths;
    
    // Apply formatting to headers
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellRef]) {
            worksheet[cellRef].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "E2E8F0" } }
            };
        }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
}

// Create Transactions worksheet
function createTransactionsWorksheet(workbook, transactions) {
    const worksheetData = [];
    
    // Add headers
    worksheetData.push([
        'Transaction ID',
        'Product ID',
        'Product Name',
        'Transaction Type',
        'Quantity',
        'Unit Price',
        'Total Amount',
        'Reference Number',
        'Notes',
        'Created By',
        'Transaction Date'
    ]);
    
    // Get products for lookup
    const products = app.products || [];
    const productMap = {};
    products.forEach(product => {
        productMap[product.id] = product.name;
    });
    
    // Add data rows
    transactions.forEach(transaction => {
        const productName = productMap[transaction.product_id] || 'Unknown Product';
        
        worksheetData.push([
            transaction.id || '',
            transaction.product_id || '',
            productName,
            (transaction.transaction_type || '').replace('_', ' ').toUpperCase(),
            transaction.quantity || 0,
            transaction.unit_price || 0,
            transaction.total_amount || 0,
            transaction.reference_number || '',
            transaction.notes || '',
            transaction.created_by || '',
            formatDateForExcel(transaction.transaction_date)
        ]);
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = [
        { wch: 15 }, // Transaction ID
        { wch: 15 }, // Product ID
        { wch: 25 }, // Product Name
        { wch: 15 }, // Transaction Type
        { wch: 10 }, // Quantity
        { wch: 12 }, // Unit Price
        { wch: 15 }, // Total Amount
        { wch: 20 }, // Reference Number
        { wch: 30 }, // Notes
        { wch: 15 }, // Created By
        { wch: 18 }  // Transaction Date
    ];
    worksheet['!cols'] = columnWidths;
    
    // Apply formatting to headers
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellRef]) {
            worksheet[cellRef].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "E2E8F0" } }
            };
        }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
}

// Create Suppliers worksheet
function createSuppliersWorksheet(workbook, suppliers) {
    const worksheetData = [];
    
    // Add headers
    worksheetData.push([
        'Supplier ID',
        'Company Name',
        'Contact Person',
        'Email',
        'Phone',
        'Address',
        'Payment Terms',
        'Status',
        'Created Date',
        'Last Updated'
    ]);
    
    // Add data rows
    suppliers.forEach(supplier => {
        worksheetData.push([
            supplier.id || '',
            supplier.name || '',
            supplier.contact_person || '',
            supplier.email || '',
            supplier.phone || '',
            supplier.address || '',
            supplier.payment_terms || '',
            supplier.status || 'active',
            formatDateForExcel(supplier.created_at),
            formatDateForExcel(supplier.updated_at)
        ]);
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = [
        { wch: 15 }, // Supplier ID
        { wch: 25 }, // Company Name
        { wch: 20 }, // Contact Person
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 30 }, // Address
        { wch: 20 }, // Payment Terms
        { wch: 10 }, // Status
        { wch: 18 }, // Created Date
        { wch: 18 }  // Last Updated
    ];
    worksheet['!cols'] = columnWidths;
    
    // Apply formatting to headers
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellRef]) {
            worksheet[cellRef].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "E2E8F0" } }
            };
        }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
}

// Create Summary worksheet
function createSummaryWorksheet(workbook, products, transactions) {
    const worksheetData = [];
    
    // Calculate summary statistics
    const stats = calculateSummaryStats(products, transactions);
    
    // Add title
    worksheetData.push(['STOCK MANAGEMENT SUMMARY REPORT']);
    worksheetData.push(['Generated on: ' + new Date().toLocaleString()]);
    worksheetData.push([]);
    
    // Add overview section
    worksheetData.push(['OVERVIEW']);
    worksheetData.push(['Total Products', stats.totalProducts]);
    worksheetData.push(['Total Suppliers', stats.totalSuppliers]);
    worksheetData.push(['Total Transactions', stats.totalTransactions]);
    worksheetData.push(['Total Inventory Value', '$' + stats.totalInventoryValue.toFixed(2)]);
    worksheetData.push([]);
    
    // Add stock levels section
    worksheetData.push(['STOCK LEVELS']);
    worksheetData.push(['Total Stock Units', stats.totalStockUnits]);
    worksheetData.push(['Low Stock Items', stats.lowStockItems]);
    worksheetData.push(['Out of Stock Items', stats.outOfStockItems]);
    worksheetData.push([]);
    
    // Add transaction summary
    worksheetData.push(['TRANSACTION SUMMARY (Last 30 Days)']);
    worksheetData.push(['Stock In Transactions', stats.stockInCount]);
    worksheetData.push(['Stock Out Transactions', stats.stockOutCount]);
    worksheetData.push(['Total Stock In Value', '$' + stats.totalStockInValue.toFixed(2)]);
    worksheetData.push(['Total Stock Out Value', '$' + stats.totalStockOutValue.toFixed(2)]);
    worksheetData.push([]);
    
    // Add category breakdown
    worksheetData.push(['INVENTORY BY CATEGORY']);
    worksheetData.push(['Category', 'Products', 'Total Stock', 'Total Value']);
    
    Object.keys(stats.categoryBreakdown).forEach(category => {
        const categoryData = stats.categoryBreakdown[category];
        worksheetData.push([
            category,
            categoryData.products,
            categoryData.stock,
            '$' + categoryData.value.toFixed(2)
        ]);
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    worksheet['!cols'] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 }
    ];
    
    // Apply formatting to title
    if (worksheet['A1']) {
        worksheet['A1'].s = {
            font: { bold: true, sz: 16 },
            alignment: { horizontal: 'center' }
        };
    }
    
    // Merge title cell
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
}

// Create Inventory Report worksheet
function createInventoryReportWorksheet(workbook, products) {
    const worksheetData = [];
    
    // Add headers
    worksheetData.push([
        'Product Name',
        'SKU',
        'Category',
        'Current Stock',
        'Min Stock Level',
        'Stock Status',
        'Unit Price',
        'Inventory Value',
        'Reorder Needed'
    ]);
    
    // Add data rows
    products.forEach(product => {
        const currentStock = product.current_stock || 0;
        const minStock = product.min_stock_level || 0;
        const unitPrice = product.unit_price || 0;
        const inventoryValue = currentStock * unitPrice;
        
        let stockStatus = 'Good';
        let reorderNeeded = 'No';
        
        if (currentStock === 0) {
            stockStatus = 'Out of Stock';
            reorderNeeded = 'Urgent';
        } else if (currentStock <= minStock) {
            stockStatus = 'Low Stock';
            reorderNeeded = 'Yes';
        }
        
        worksheetData.push([
            product.name || '',
            product.sku || '',
            product.category || 'Uncategorized',
            currentStock,
            minStock,
            stockStatus,
            unitPrice,
            inventoryValue,
            reorderNeeded
        ]);
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    worksheet['!cols'] = [
        { wch: 25 }, // Product Name
        { wch: 15 }, // SKU
        { wch: 15 }, // Category
        { wch: 12 }, // Current Stock
        { wch: 15 }, // Min Stock Level
        { wch: 12 }, // Stock Status
        { wch: 12 }, // Unit Price
        { wch: 15 }, // Inventory Value
        { wch: 15 }  // Reorder Needed
    ];
    
    // Apply conditional formatting for low stock items
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let row = 1; row <= range.e.r; row++) {
        const stockStatusCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 5 })];
        if (stockStatusCell) {
            if (stockStatusCell.v === 'Out of Stock') {
                stockStatusCell.s = { fill: { fgColor: { rgb: "FEE2E2" } } };
            } else if (stockStatusCell.v === 'Low Stock') {
                stockStatusCell.s = { fill: { fgColor: { rgb: "FEF3C7" } } };
            }
        }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Report");
}

// Create Low Stock Report worksheet
function createLowStockReportWorksheet(workbook, products) {
    const lowStockProducts = products.filter(product => {
        const currentStock = product.current_stock || 0;
        const minStock = product.min_stock_level || 0;
        return currentStock <= minStock;
    });
    
    const worksheetData = [];
    
    // Add headers
    worksheetData.push([
        'Product Name',
        'SKU',
        'Category',
        'Current Stock',
        'Min Stock Level',
        'Shortage',
        'Unit Price',
        'Reorder Value (Min Level)',
        'Priority'
    ]);
    
    // Add data rows
    lowStockProducts.forEach(product => {
        const currentStock = product.current_stock || 0;
        const minStock = product.min_stock_level || 0;
        const shortage = Math.max(0, minStock - currentStock);
        const unitPrice = product.unit_price || 0;
        const reorderValue = shortage * unitPrice;
        
        let priority = 'Low';
        if (currentStock === 0) {
            priority = 'Critical';
        } else if (shortage > minStock * 0.5) {
            priority = 'High';
        } else if (shortage > 0) {
            priority = 'Medium';
        }
        
        worksheetData.push([
            product.name || '',
            product.sku || '',
            product.category || 'Uncategorized',
            currentStock,
            minStock,
            shortage,
            unitPrice,
            reorderValue,
            priority
        ]);
    });
    
    // Sort by priority (Critical, High, Medium, Low)
    const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    worksheetData.slice(1).sort((a, b) => priorityOrder[a[8]] - priorityOrder[b[8]]);
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    worksheet['!cols'] = [
        { wch: 25 }, // Product Name
        { wch: 15 }, // SKU
        { wch: 15 }, // Category
        { wch: 12 }, // Current Stock
        { wch: 15 }, // Min Stock Level
        { wch: 10 }, // Shortage
        { wch: 12 }, // Unit Price
        { wch: 18 }, // Reorder Value
        { wch: 10 }  // Priority
    ];
    
    // Apply conditional formatting for priority levels
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let row = 1; row <= range.e.r; row++) {
        const priorityCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 8 })];
        if (priorityCell) {
            switch (priorityCell.v) {
                case 'Critical':
                    priorityCell.s = { fill: { fgColor: { rgb: "FEE2E2" } }, font: { bold: true } };
                    break;
                case 'High':
                    priorityCell.s = { fill: { fgColor: { rgb: "FED7AA" } } };
                    break;
                case 'Medium':
                    priorityCell.s = { fill: { fgColor: { rgb: "FEF3C7" } } };
                    break;
            }
        }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Low Stock Alert");
}

// Calculate summary statistics
function calculateSummaryStats(products, transactions) {
    const stats = {
        totalProducts: products.length,
        totalSuppliers: (app.suppliers || []).length,
        totalTransactions: transactions.length,
        totalInventoryValue: 0,
        totalStockUnits: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        stockInCount: 0,
        stockOutCount: 0,
        totalStockInValue: 0,
        totalStockOutValue: 0,
        categoryBreakdown: {}
    };
    
    // Calculate product-related stats
    products.forEach(product => {
        const currentStock = product.current_stock || 0;
        const minStock = product.min_stock_level || 0;
        const unitPrice = product.unit_price || 0;
        const category = product.category || 'Uncategorized';
        
        stats.totalInventoryValue += currentStock * unitPrice;
        stats.totalStockUnits += currentStock;
        
        if (currentStock === 0) {
            stats.outOfStockItems++;
        } else if (currentStock <= minStock) {
            stats.lowStockItems++;
        }
        
        // Category breakdown
        if (!stats.categoryBreakdown[category]) {
            stats.categoryBreakdown[category] = {
                products: 0,
                stock: 0,
                value: 0
            };
        }
        
        stats.categoryBreakdown[category].products++;
        stats.categoryBreakdown[category].stock += currentStock;
        stats.categoryBreakdown[category].value += currentStock * unitPrice;
    });
    
    // Calculate transaction stats (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    transactions.forEach(transaction => {
        if (transaction.transaction_date >= thirtyDaysAgo) {
            if (transaction.transaction_type === 'stock_in') {
                stats.stockInCount++;
                stats.totalStockInValue += transaction.total_amount || 0;
            } else if (transaction.transaction_type === 'stock_out') {
                stats.stockOutCount++;
                stats.totalStockOutValue += transaction.total_amount || 0;
            }
        }
    });
    
    return stats;
}

// Helper function to format dates for Excel
function formatDateForExcel(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Export specific data types
function exportProductsOnly() {
    if (!app.products || app.products.length === 0) {
        showToast('No products to export', 'warning');
        return;
    }
    
    const workbook = XLSX.utils.book_new();
    createProductsWorksheet(workbook, app.products);
    
    const filename = `Products_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    showToast('Products exported successfully', 'success');
}

function exportTransactionsOnly() {
    if (!app.transactions || app.transactions.length === 0) {
        showToast('No transactions to export', 'warning');
        return;
    }
    
    const workbook = XLSX.utils.book_new();
    createTransactionsWorksheet(workbook, app.transactions);
    
    const filename = `Transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    showToast('Transactions exported successfully', 'success');
}

function exportLowStockReport() {
    if (!app.products || app.products.length === 0) {
        showToast('No products to analyze', 'warning');
        return;
    }
    
    const workbook = XLSX.utils.book_new();
    createLowStockReportWorksheet(workbook, app.products);
    
    const filename = `Low_Stock_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    showToast('Low stock report exported successfully', 'success');
}

// Make functions globally available
window.excelExport = {
    exportToExcel,
    exportProductsOnly,
    exportTransactionsOnly,
    exportLowStockReport
};