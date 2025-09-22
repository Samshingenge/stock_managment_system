/**
 * Main Application Logic for Stock Management System
 */

class StockManagementApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.products = [];
        this.transactions = [];
        this.suppliers = [];
        this.dashboardStats = {};
        
        this.init();
    }

    async init() {
        console.log('Initializing Stock Management App...');
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load initial data
        await this.loadInitialData();
        
        // Initialize dashboard
        this.showDashboard();
        
        console.log('App initialized successfully');
    }

    initEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.id.replace('Tab', '');
                this.switchTab(tabId);
            });
        });

        // Quick action buttons
        document.getElementById('addProductBtn').addEventListener('click', () => this.openProductModal());
        document.getElementById('stockInBtn').addEventListener('click', () => this.openStockInModal());
        document.getElementById('stockOutBtn').addEventListener('click', () => this.openStockOutModal());
        document.getElementById('viewReportsBtn').addEventListener('click', () => this.switchTab('reports'));

        // Modal buttons
        document.getElementById('addProductModalBtn').addEventListener('click', () => this.openProductModal());
        document.getElementById('stockInModalBtn').addEventListener('click', () => this.openStockInModal());
        document.getElementById('stockOutModalBtn').addEventListener('click', () => this.openStockOutModal());
        document.getElementById('addSupplierModalBtn').addEventListener('click', () => this.openSupplierModal());

        // Export button
        document.getElementById('exportExcelBtn').addEventListener('click', () => this.exportToExcel());

        // Alerts button
        document.getElementById('alertsBtn').addEventListener('click', () => this.showLowStockAlerts());

        // Toast close button
        document.getElementById('toastClose').addEventListener('click', () => hideToast());

        // Auto-refresh dashboard every 30 seconds
        setInterval(() => {
            if (this.currentTab === 'dashboard') {
                this.refreshDashboard();
            }
        }, 30000);
    }

    async loadInitialData() {
        try {
            showSpinner();
            
            // Load dashboard stats
            this.dashboardStats = await stockAPI.getDashboardStats();
            
            // Load products
            const productsResult = await stockAPI.getProducts();
            this.products = productsResult.data || [];
            
            // Load recent transactions
            const transactionsResult = await stockAPI.getRecentTransactions(50);
            this.transactions = transactionsResult;
            
            // Load suppliers
            const suppliersResult = await stockAPI.getSuppliers();
            this.suppliers = suppliersResult.data || [];
            
            // Update dashboard stats display
            this.updateDashboardStats();
            
            console.log('Initial data loaded successfully');
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            showToast('Failed to load initial data', 'error');
        } finally {
            hideSpinner();
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active', 'text-blue-600', 'border-blue-500');
            btn.classList.add('text-gray-500', 'border-transparent');
        });
        
        const activeButton = document.getElementById(tabName + 'Tab');
        if (activeButton) {
            activeButton.classList.add('active', 'text-blue-600', 'border-blue-500');
            activeButton.classList.remove('text-gray-500', 'border-transparent');
        }

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Show selected tab content
        const tabContent = document.getElementById(tabName + 'Content');
        if (tabContent) {
            tabContent.classList.remove('hidden');
        }

        this.currentTab = tabName;

        // Load tab-specific data
        switch (tabName) {
            case 'dashboard':
                this.showDashboard();
                break;
            case 'products':
                this.showProducts();
                break;
            case 'transactions':
                this.showTransactions();
                break;
            case 'suppliers':
                this.showSuppliers();
                break;
            case 'reports':
                this.showReports();
                break;
        }
    }

    async showDashboard() {
        try {
            // Update dashboard stats
            this.dashboardStats = await stockAPI.getDashboardStats();
            this.updateDashboardStats();

            // Load and display recent transactions
            this.transactions = await stockAPI.getRecentTransactions(10);
            this.displayRecentTransactions();

            // Initialize/update charts
            this.initializeCharts();

        } catch (error) {
            console.error('Error loading dashboard:', error);
            showToast('Failed to load dashboard data', 'error');
        }
    }

    updateDashboardStats() {
        document.getElementById('totalProducts').textContent = this.dashboardStats.totalProducts || 0;
        document.getElementById('stockInToday').textContent = this.dashboardStats.stockInToday || 0;
        document.getElementById('stockOutToday').textContent = this.dashboardStats.stockOutToday || 0;
        document.getElementById('lowStockCount').textContent = this.dashboardStats.lowStockCount || 0;

        // Update alert badge
        const alertBadge = document.getElementById('alertBadge');
        const lowStockCount = this.dashboardStats.lowStockCount || 0;
        
        if (lowStockCount > 0) {
            alertBadge.textContent = lowStockCount;
            alertBadge.classList.remove('hidden');
        } else {
            alertBadge.classList.add('hidden');
        }
    }

    displayRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        
        if (!this.transactions || this.transactions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-3xl mb-2"></i>
                    <p>No recent transactions</p>
                </div>
            `;
            return;
        }

        const transactionsHTML = this.transactions.slice(0, 5).map(transaction => {
            const product = this.products.find(p => p.id === transaction.product_id);
            const productName = product ? product.name : 'Unknown Product';
            
            const typeClass = transaction.transaction_type === 'stock_in' ? 'transaction-in' : 'transaction-out';
            const typeIcon = transaction.transaction_type === 'stock_in' ? 'fa-arrow-up' : 'fa-arrow-down';
            
            return `
                <div class="flex items-center justify-between py-3 px-4 bg-white rounded border">
                    <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0">
                            <span class="status-badge ${typeClass}">
                                <i class="fas ${typeIcon} mr-1"></i>
                                ${transaction.transaction_type.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">${productName}</p>
                            <p class="text-xs text-gray-500">${stockAPI.formatDate(transaction.transaction_date)}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">${transaction.quantity} units</p>
                        <p class="text-xs text-gray-500">${stockAPI.formatCurrency(transaction.total_amount)}</p>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = transactionsHTML;
    }

    async showProducts() {
        try {
            showSpinner();
            
            // Reload products data
            const result = await stockAPI.getProducts();
            this.products = result.data || [];
            
            this.displayProductsTable();
            
        } catch (error) {
            console.error('Error loading products:', error);
            showToast('Failed to load products', 'error');
        } finally {
            hideSpinner();
        }
    }

    displayProductsTable() {
        const tbody = document.getElementById('productsTableBody');
        
        if (!this.products || this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-boxes text-3xl mb-2"></i>
                        <p>No products found. <button class="text-blue-600 hover:text-blue-800" onclick="app.openProductModal()">Add your first product</button></p>
                    </td>
                </tr>
            `;
            return;
        }

        const productsHTML = this.products.map(product => {
            const stockLevel = product.current_stock || 0;
            const minLevel = product.min_stock_level || 0;
            const isLowStock = stockLevel <= minLevel;
            
            return `
                <tr class="table-row-hover">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div>
                                <div class="text-sm font-medium text-gray-900">${product.name || 'N/A'}</div>
                                <div class="text-sm text-gray-500">${product.description || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.sku || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.category || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${stockLevel}</div>
                        ${isLowStock ? '<div class="text-xs text-red-500"><i class="fas fa-exclamation-triangle mr-1"></i>Low Stock</div>' : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stockAPI.formatCurrency(product.unit_price)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="status-badge status-${product.status || 'active'}">${product.status || 'active'}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="app.editProduct('${product.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="app.deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = productsHTML;
    }

    async showTransactions() {
        try {
            showSpinner();
            
            // Reload transactions data
            const result = await stockAPI.getTransactions(1, 100);
            this.transactions = result.data || [];
            
            this.displayTransactionsTable();
            
        } catch (error) {
            console.error('Error loading transactions:', error);
            showToast('Failed to load transactions', 'error');
        } finally {
            hideSpinner();
        }
    }

    displayTransactionsTable() {
        const tbody = document.getElementById('transactionsTableBody');
        
        if (!this.transactions || this.transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-exchange-alt text-3xl mb-2"></i>
                        <p>No transactions found.</p>
                    </td>
                </tr>
            `;
            return;
        }

        const transactionsHTML = this.transactions.map(transaction => {
            const product = this.products.find(p => p.id === transaction.product_id);
            const productName = product ? product.name : 'Unknown Product';
            const typeClass = transaction.transaction_type === 'stock_in' ? 'transaction-in' : 'transaction-out';
            
            return `
                <tr class="table-row-hover">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${stockAPI.formatDate(transaction.transaction_date)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="status-badge ${typeClass}">
                            ${transaction.transaction_type.replace('_', ' ').toUpperCase()}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${productName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.quantity}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stockAPI.formatCurrency(transaction.unit_price)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stockAPI.formatCurrency(transaction.total_amount)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${transaction.reference_number || 'N/A'}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = transactionsHTML;
    }

    async showSuppliers() {
        try {
            showSpinner();
            
            // Reload suppliers data
            const result = await stockAPI.getSuppliers();
            this.suppliers = result.data || [];
            
            this.displaySuppliersTable();
            
        } catch (error) {
            console.error('Error loading suppliers:', error);
            showToast('Failed to load suppliers', 'error');
        } finally {
            hideSpinner();
        }
    }

    displaySuppliersTable() {
        const tbody = document.getElementById('suppliersTableBody');
        
        if (!this.suppliers || this.suppliers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-truck text-3xl mb-2"></i>
                        <p>No suppliers found. <button class="text-blue-600 hover:text-blue-800" onclick="app.openSupplierModal()">Add your first supplier</button></p>
                    </td>
                </tr>
            `;
            return;
        }

        const suppliersHTML = this.suppliers.map(supplier => {
            return `
                <tr class="table-row-hover">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${supplier.name || 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${supplier.contact_person || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${supplier.email || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${supplier.phone || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="status-badge status-${supplier.status || 'active'}">${supplier.status || 'active'}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="app.editSupplier('${supplier.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="app.deleteSupplier('${supplier.id}')" class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = suppliersHTML;
    }

    showReports() {
        // Initialize report charts
        this.initializeReportCharts();
    }

    async refreshDashboard() {
        if (this.currentTab === 'dashboard') {
            await this.showDashboard();
        }
    }

    // Modal operations (defined in modals.js)
    openProductModal(productId = null) {
        if (typeof openProductModal === 'function') {
            openProductModal(productId);
        }
    }

    openStockInModal() {
        if (typeof openStockInModal === 'function') {
            openStockInModal();
        }
    }

    openStockOutModal() {
        if (typeof openStockOutModal === 'function') {
            openStockOutModal();
        }
    }

    openSupplierModal(supplierId = null) {
        if (typeof openSupplierModal === 'function') {
            openSupplierModal(supplierId);
        }
    }

    // CRUD operations
    async editProduct(productId) {
        this.openProductModal(productId);
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            await stockAPI.deleteProduct(productId);
            showToast('Product deleted successfully', 'success');
            
            // Refresh current view
            if (this.currentTab === 'products') {
                await this.showProducts();
            }
            await this.loadInitialData();
            
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }

    async editSupplier(supplierId) {
        this.openSupplierModal(supplierId);
    }

    async deleteSupplier(supplierId) {
        if (!confirm('Are you sure you want to delete this supplier?')) {
            return;
        }

        try {
            await stockAPI.deleteSupplier(supplierId);
            showToast('Supplier deleted successfully', 'success');
            
            // Refresh current view
            if (this.currentTab === 'suppliers') {
                await this.showSuppliers();
            }
            
        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    }

    // Chart initialization (defined in charts.js)
    initializeCharts() {
        if (typeof initializeDashboardCharts === 'function') {
            initializeDashboardCharts(this.products, this.transactions);
        }
    }

    initializeReportCharts() {
        if (typeof initializeReportCharts === 'function') {
            initializeReportCharts(this.products, this.transactions);
        }
    }

    // Excel export functionality
    exportToExcel() {
        if (typeof exportToExcel === 'function') {
            exportToExcel(this.products, this.transactions, this.suppliers);
        }
    }

    // Low stock alerts
    async showLowStockAlerts() {
        try {
            const lowStockProducts = await stockAPI.getLowStockProducts();
            
            if (lowStockProducts.length === 0) {
                showToast('No low stock alerts', 'info');
                return;
            }

            let alertMessage = `Low Stock Alert!\n\nThe following products are running low:\n\n`;
            
            lowStockProducts.forEach(product => {
                alertMessage += `• ${product.name}: ${product.current_stock || 0} units (Min: ${product.min_stock_level || 0})\n`;
            });

            alert(alertMessage);
            
        } catch (error) {
            console.error('Error getting low stock alerts:', error);
            showToast('Failed to load low stock alerts', 'error');
        }
    }
}

// Initialize the app when DOM is loaded
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new StockManagementApp();
});