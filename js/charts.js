/**
 * Charts and Analytics for Stock Management System
 */

let dashboardCharts = {};
let reportCharts = {};

// Initialize dashboard charts
function initializeDashboardCharts(products, transactions) {
    try {
        initStockLevelsChart(products);
        initTransactionTrendsChart(transactions);
    } catch (error) {
        console.error('Error initializing dashboard charts:', error);
    }
}

// Initialize report charts
function initializeReportCharts(products, transactions) {
    try {
        initInventoryValueChart(products);
        initStockMovementChart(transactions);
    } catch (error) {
        console.error('Error initializing report charts:', error);
    }
}

// Stock Levels Overview Chart
function initStockLevelsChart(products) {
    const canvas = document.getElementById('stockLevelsChart');
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (dashboardCharts.stockLevels) {
        dashboardCharts.stockLevels.destroy();
    }

    const ctx = canvas.getContext('2d');

    // Prepare data
    const categories = {};
    const lowStockItems = [];
    
    products.forEach(product => {
        const category = product.category || 'Uncategorized';
        if (!categories[category]) {
            categories[category] = {
                totalStock: 0,
                totalProducts: 0,
                totalValue: 0
            };
        }
        
        const currentStock = product.current_stock || 0;
        const unitPrice = product.unit_price || 0;
        
        categories[category].totalStock += currentStock;
        categories[category].totalProducts += 1;
        categories[category].totalValue += currentStock * unitPrice;
        
        // Check for low stock
        if (currentStock <= (product.min_stock_level || 0)) {
            lowStockItems.push(product);
        }
    });

    const labels = Object.keys(categories);
    const stockData = labels.map(label => categories[label].totalStock);
    const colors = generateRandomColors(labels.length);

    dashboardCharts.stockLevels = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stock by Category',
                data: stockData,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('50%', '40%')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const category = categories[label];
                            return [
                                `${label}: ${value} units`,
                                `Products: ${category.totalProducts}`,
                                `Value: ${formatCurrency(category.totalValue)}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// Transaction Trends Chart
function initTransactionTrendsChart(transactions) {
    const canvas = document.getElementById('transactionTrendsChart');
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (dashboardCharts.transactionTrends) {
        dashboardCharts.transactionTrends.destroy();
    }

    const ctx = canvas.getContext('2d');

    // Get last 7 days data
    const days = [];
    const stockInData = [];
    const stockOutData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayStart = date.getTime();
        const dayEnd = dayStart + (24 * 60 * 60 * 1000) - 1;
        
        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Calculate stock in for this day
        const dayStockIn = transactions
            .filter(t => t.transaction_type === 'stock_in' && 
                        t.transaction_date >= dayStart && 
                        t.transaction_date <= dayEnd)
            .reduce((sum, t) => sum + (t.quantity || 0), 0);
        
        // Calculate stock out for this day
        const dayStockOut = transactions
            .filter(t => t.transaction_type === 'stock_out' && 
                        t.transaction_date >= dayStart && 
                        t.transaction_date <= dayEnd)
            .reduce((sum, t) => sum + (t.quantity || 0), 0);
        
        stockInData.push(dayStockIn);
        stockOutData.push(dayStockOut);
    }

    dashboardCharts.transactionTrends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Stock In',
                data: stockInData,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Stock Out',
                data: stockOutData,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} units`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Inventory Value by Category Chart
function initInventoryValueChart(products) {
    const canvas = document.getElementById('inventoryValueChart');
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (reportCharts.inventoryValue) {
        reportCharts.inventoryValue.destroy();
    }

    const ctx = canvas.getContext('2d');

    // Calculate inventory value by category
    const categories = {};
    
    products.forEach(product => {
        const category = product.category || 'Uncategorized';
        const currentStock = product.current_stock || 0;
        const unitPrice = product.unit_price || 0;
        const value = currentStock * unitPrice;
        
        if (!categories[category]) {
            categories[category] = 0;
        }
        
        categories[category] += value;
    });

    const labels = Object.keys(categories);
    const values = labels.map(label => categories[label]);
    const colors = generateRandomColors(labels.length);

    reportCharts.inventoryValue = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Inventory Value',
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('50%', '40%')),
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Value: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Stock Movement Analysis Chart
function initStockMovementChart(transactions) {
    const canvas = document.getElementById('stockMovementChart');
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (reportCharts.stockMovement) {
        reportCharts.stockMovement.destroy();
    }

    const ctx = canvas.getContext('2d');

    // Get last 30 days data
    const days = [];
    const netMovementData = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayStart = date.getTime();
        const dayEnd = dayStart + (24 * 60 * 60 * 1000) - 1;
        
        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Calculate net movement for this day
        const dayStockIn = transactions
            .filter(t => t.transaction_type === 'stock_in' && 
                        t.transaction_date >= dayStart && 
                        t.transaction_date <= dayEnd)
            .reduce((sum, t) => sum + (t.quantity || 0), 0);
        
        const dayStockOut = transactions
            .filter(t => t.transaction_type === 'stock_out' && 
                        t.transaction_date >= dayStart && 
                        t.transaction_date <= dayEnd)
            .reduce((sum, t) => sum + (t.quantity || 0), 0);
        
        netMovementData.push(dayStockIn - dayStockOut);
    }

    reportCharts.stockMovement = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Net Stock Movement',
                data: netMovementData,
                backgroundColor: netMovementData.map(value => 
                    value >= 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'
                ),
                borderColor: netMovementData.map(value => 
                    value >= 0 ? '#10B981' : '#EF4444'
                ),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return `Net Movement: ${value > 0 ? '+' : ''}${value} units`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + ' units';
                        }
                    }
                }
            }
        }
    });
}

// Product Performance Chart
function initProductPerformanceChart(products, transactions) {
    // Get top 10 products by transaction volume
    const productMovement = {};
    
    transactions.forEach(transaction => {
        if (!productMovement[transaction.product_id]) {
            productMovement[transaction.product_id] = {
                totalIn: 0,
                totalOut: 0,
                totalValue: 0
            };
        }
        
        if (transaction.transaction_type === 'stock_in') {
            productMovement[transaction.product_id].totalIn += transaction.quantity || 0;
        } else if (transaction.transaction_type === 'stock_out') {
            productMovement[transaction.product_id].totalOut += transaction.quantity || 0;
        }
        
        productMovement[transaction.product_id].totalValue += transaction.total_amount || 0;
    });
    
    // Get top products by movement
    const topProducts = Object.keys(productMovement)
        .sort((a, b) => {
            const aMovement = productMovement[a].totalIn + productMovement[a].totalOut;
            const bMovement = productMovement[b].totalIn + productMovement[b].totalOut;
            return bMovement - aMovement;
        })
        .slice(0, 10);
    
    return topProducts.map(productId => {
        const product = products.find(p => p.id === productId);
        return {
            id: productId,
            name: product ? product.name : 'Unknown Product',
            movement: productMovement[productId]
        };
    });
}

// Utility function to generate chart colors
function generateChartColors(count) {
    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    
    return result;
}

// Export chart data for Excel
function getChartDataForExport() {
    const chartData = {};
    
    // Export stock levels data
    if (dashboardCharts.stockLevels) {
        const chart = dashboardCharts.stockLevels;
        chartData.stockLevels = {
            labels: chart.data.labels,
            data: chart.data.datasets[0].data
        };
    }
    
    // Export transaction trends data
    if (dashboardCharts.transactionTrends) {
        const chart = dashboardCharts.transactionTrends;
        chartData.transactionTrends = {
            labels: chart.data.labels,
            stockIn: chart.data.datasets[0].data,
            stockOut: chart.data.datasets[1].data
        };
    }
    
    // Export inventory value data
    if (reportCharts.inventoryValue) {
        const chart = reportCharts.inventoryValue;
        chartData.inventoryValue = {
            labels: chart.data.labels,
            data: chart.data.datasets[0].data
        };
    }
    
    // Export stock movement data
    if (reportCharts.stockMovement) {
        const chart = reportCharts.stockMovement;
        chartData.stockMovement = {
            labels: chart.data.labels,
            data: chart.data.datasets[0].data
        };
    }
    
    return chartData;
}

// Refresh all charts
function refreshAllCharts(products, transactions) {
    if (dashboardCharts.stockLevels) {
        initStockLevelsChart(products);
    }
    
    if (dashboardCharts.transactionTrends) {
        initTransactionTrendsChart(transactions);
    }
    
    if (reportCharts.inventoryValue) {
        initInventoryValueChart(products);
    }
    
    if (reportCharts.stockMovement) {
        initStockMovementChart(transactions);
    }
}

// Destroy all charts (useful for cleanup)
function destroyAllCharts() {
    Object.values(dashboardCharts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    
    Object.values(reportCharts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    
    dashboardCharts = {};
    reportCharts = {};
}

// Chart configuration defaults
Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
Chart.defaults.color = '#6B7280';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(17, 24, 39, 0.9)';
Chart.defaults.plugins.tooltip.titleColor = '#F9FAFB';
Chart.defaults.plugins.tooltip.bodyColor = '#F9FAFB';
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.legend.labels.color = '#6B7280';

// Export functions globally
window.chartFunctions = {
    initializeDashboardCharts,
    initializeReportCharts,
    initStockLevelsChart,
    initTransactionTrendsChart,
    initInventoryValueChart,
    initStockMovementChart,
    initProductPerformanceChart,
    getChartDataForExport,
    refreshAllCharts,
    destroyAllCharts
};