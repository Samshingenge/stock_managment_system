/**
 * API Layer for Stock Management System
 * Handles all REST API operations using the RESTful Table API
 */

class StockAPI {
    constructor() {
        this.baseURL = '';  // Using relative URLs
        this.endpoints = {
            products: 'tables/products',
            transactions: 'tables/stock_transactions',
            suppliers: 'tables/suppliers'
        };
    }

    // Generic API methods
    async makeRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            showSpinner();
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }

            // Handle 204 No Content responses (DELETE operations)
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            showToast('API Error: ' + error.message, 'error');
            throw error;
        } finally {
            hideSpinner();
        }
    }

    // Products API
    async getProducts(page = 1, limit = 100, search = '', sort = 'name') {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(sort && { sort })
        });
        
        const url = `${this.endpoints.products}?${params}`;
        return await this.makeRequest(url);
    }

    async getProduct(id) {
        return await this.makeRequest(`${this.endpoints.products}/${id}`);
    }

    async createProduct(productData) {
        // Generate UUID for the product
        productData.id = this.generateUUID();
        
        return await this.makeRequest(this.endpoints.products, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(id, productData) {
        return await this.makeRequest(`${this.endpoints.products}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async patchProduct(id, partialData) {
        return await this.makeRequest(`${this.endpoints.products}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(partialData)
        });
    }

    async deleteProduct(id) {
        return await this.makeRequest(`${this.endpoints.products}/${id}`, {
            method: 'DELETE'
        });
    }

    // Stock Transactions API
    async getTransactions(page = 1, limit = 100, search = '', sort = 'transaction_date') {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(sort && { sort })
        });
        
        const url = `${this.endpoints.transactions}?${params}`;
        return await this.makeRequest(url);
    }

    async getTransaction(id) {
        return await this.makeRequest(`${this.endpoints.transactions}/${id}`);
    }

    async createTransaction(transactionData) {
        // Generate UUID for the transaction
        transactionData.id = this.generateUUID();
        // Set current timestamp
        transactionData.transaction_date = Date.now();
        
        return await this.makeRequest(this.endpoints.transactions, {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    }

    async updateTransaction(id, transactionData) {
        return await this.makeRequest(`${this.endpoints.transactions}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(transactionData)
        });
    }

    async deleteTransaction(id) {
        return await this.makeRequest(`${this.endpoints.transactions}/${id}`, {
            method: 'DELETE'
        });
    }

    // Suppliers API
    async getSuppliers(page = 1, limit = 100, search = '', sort = 'name') {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(sort && { sort })
        });
        
        const url = `${this.endpoints.suppliers}?${params}`;
        return await this.makeRequest(url);
    }

    async getSupplier(id) {
        return await this.makeRequest(`${this.endpoints.suppliers}/${id}`);
    }

    async createSupplier(supplierData) {
        // Generate UUID for the supplier
        supplierData.id = this.generateUUID();
        
        return await this.makeRequest(this.endpoints.suppliers, {
            method: 'POST',
            body: JSON.stringify(supplierData)
        });
    }

    async updateSupplier(id, supplierData) {
        return await this.makeRequest(`${this.endpoints.suppliers}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(supplierData)
        });
    }

    async deleteSupplier(id) {
        return await this.makeRequest(`${this.endpoints.suppliers}/${id}`, {
            method: 'DELETE'
        });
    }

    // Stock Operations
    async processStockIn(productId, quantity, unitPrice, referenceNumber, notes = '', createdBy = 'System') {
        try {
            // Get current product data
            const product = await this.getProduct(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            // Create stock in transaction
            const transactionData = {
                product_id: productId,
                transaction_type: 'stock_in',
                quantity: parseFloat(quantity),
                unit_price: parseFloat(unitPrice),
                total_amount: parseFloat(quantity) * parseFloat(unitPrice),
                reference_number: referenceNumber,
                notes: notes,
                created_by: createdBy
            };

            const transaction = await this.createTransaction(transactionData);

            // Update product stock
            const newStock = (product.current_stock || 0) + parseFloat(quantity);
            await this.patchProduct(productId, { current_stock: newStock });

            showToast(`Stock in successful. Added ${quantity} units to ${product.name}`, 'success');
            return transaction;

        } catch (error) {
            console.error('Stock in error:', error);
            showToast('Failed to process stock in: ' + error.message, 'error');
            throw error;
        }
    }

    async processStockOut(productId, quantity, unitPrice, referenceNumber, notes = '', createdBy = 'System') {
        try {
            // Get current product data
            const product = await this.getProduct(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            // Check if sufficient stock available
            const currentStock = product.current_stock || 0;
            if (currentStock < parseFloat(quantity)) {
                throw new Error(`Insufficient stock. Available: ${currentStock}, Requested: ${quantity}`);
            }

            // Create stock out transaction
            const transactionData = {
                product_id: productId,
                transaction_type: 'stock_out',
                quantity: parseFloat(quantity),
                unit_price: parseFloat(unitPrice),
                total_amount: parseFloat(quantity) * parseFloat(unitPrice),
                reference_number: referenceNumber,
                notes: notes,
                created_by: createdBy
            };

            const transaction = await this.createTransaction(transactionData);

            // Update product stock
            const newStock = currentStock - parseFloat(quantity);
            await this.patchProduct(productId, { current_stock: newStock });

            showToast(`Stock out successful. Removed ${quantity} units from ${product.name}`, 'success');
            return transaction;

        } catch (error) {
            console.error('Stock out error:', error);
            showToast('Failed to process stock out: ' + error.message, 'error');
            throw error;
        }
    }

    // Analytics and Reports
    async getDashboardStats() {
        try {
            const [productsResult, transactionsResult] = await Promise.all([
                this.getProducts(1, 1000),
                this.getTransactions(1, 1000)
            ]);

            const products = productsResult.data || [];
            const transactions = transactionsResult.data || [];

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayTimestamp = today.getTime();

            // Calculate stats
            const stats = {
                totalProducts: products.length,
                stockInToday: transactions
                    .filter(t => t.transaction_type === 'stock_in' && t.transaction_date >= todayTimestamp)
                    .reduce((sum, t) => sum + (t.quantity || 0), 0),
                stockOutToday: transactions
                    .filter(t => t.transaction_type === 'stock_out' && t.transaction_date >= todayTimestamp)
                    .reduce((sum, t) => sum + (t.quantity || 0), 0),
                lowStockCount: products
                    .filter(p => (p.current_stock || 0) <= (p.min_stock_level || 0))
                    .length,
                totalInventoryValue: products
                    .reduce((sum, p) => sum + ((p.current_stock || 0) * (p.unit_price || 0)), 0)
            };

            return stats;

        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            return {
                totalProducts: 0,
                stockInToday: 0,
                stockOutToday: 0,
                lowStockCount: 0,
                totalInventoryValue: 0
            };
        }
    }

    async getLowStockProducts() {
        try {
            const result = await this.getProducts(1, 1000);
            const products = result.data || [];
            
            return products.filter(p => (p.current_stock || 0) <= (p.min_stock_level || 0));
        } catch (error) {
            console.error('Error getting low stock products:', error);
            return [];
        }
    }

    async getRecentTransactions(limit = 10) {
        try {
            const result = await this.getTransactions(1, limit, '', '-transaction_date');
            return result.data || [];
        } catch (error) {
            console.error('Error getting recent transactions:', error);
            return [];
        }
    }

    // Utility methods
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }

    formatDate(timestamp) {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Create global API instance
const stockAPI = new StockAPI();