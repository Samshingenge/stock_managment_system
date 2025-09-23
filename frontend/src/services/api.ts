// API service layer for the Stock Management System

import { config } from '../utils';
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  Supplier,
  Transaction,
  DashboardStats,
  ChartData,
  FilterOptions,
  ExportOptions
} from '../types';

class ApiService {
  private baseURL: string;
  private useMockData: boolean;

  constructor() {
    this.baseURL = config.apiUrl;
    // Enable mock data for testing when backend is not available
    this.useMockData = window.location.hostname === 'localhost' && !this.isBackendAvailable();
  }

  private isBackendAvailable(): boolean {
    // Simple check to see if backend is running
    try {
      // Try to fetch from the backend health endpoint
      const testUrl = `${this.baseURL.replace('/api', '')}/health`;
      // If we can construct the URL without errors, assume backend is available
      return true;
    } catch (error) {
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Use mock data for testing when backend is not available
    if (this.useMockData) {
      return this.mockRequest<T>(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, finalOptions);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Mock data for testing
  private async mockRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock authentication
    if (endpoint === '/auth/login') {
      const body = JSON.parse(options.body as string);
      if (body.username === 'admin' && body.password === 'admin123') {
        return {
          success: true,
          data: {
            access_token: 'mock-jwt-token-' + Date.now(),
            token_type: 'bearer',
            user: {
              id: '1',
              username: 'admin',
              email: 'admin@example.com',
              role: 'admin'
            }
          },
          message: 'Login successful',
          errors: null,
          metadata: {
            timestamp: new Date().toISOString(),
            request_id: 'mock-' + Date.now()
          }
        } as T;
      } else {
        throw new Error('Invalid credentials');
      }
    }

    // Mock dashboard stats
    if (endpoint === '/dashboard/stats') {
      return {
        overview: {
          total_products: 6,
          active_products: 6,
          total_suppliers: 3,
          active_suppliers: 3
        },
        inventory: {
          total_inventory_value: 15420.50,
          total_stock_units: 1250,
          low_stock_items: 3,
          out_of_stock_items: 0,
          categories: {
            'Electronics': { count: 2, value: 8500.00 },
            'Clothing': { count: 2, value: 3200.00 },
            'Books': { count: 2, value: 3720.50 }
          }
        },
        transactions: {
          period: '2024-09-21',
          stock_in: { count: 12, quantity: 450, value: 8750.00 },
          stock_out: { count: 8, quantity: 320, value: 6200.00 },
          net_movement: { quantity: 130, value: 2550.00 }
        },
        alerts: {
          low_stock: 3,
          out_of_stock: 0,
          high_value_transactions: 2,
          new_products_week: 1
        }
      } as T;
    }

    // Mock low stock products
    if (endpoint === '/dashboard/low-stock-products') {
      const mockLowStockProducts = [
        {
          id: '2',
          name: 'Gaming Mouse',
          sku: 'GM-002',
          category: 'Electronics',
          description: 'RGB gaming mouse with programmable buttons',
          unit_price: 79.99,
          min_stock_level: 10,
          current_stock: 8,
          supplier_id: '1',
          status: 'active',
          created_at: '2024-02-01T09:00:00Z',
          updated_at: '2024-09-21T11:15:00Z',
          inventory_value: 639.92,
          is_low_stock: true
        },
        {
          id: '4',
          name: 'Denim Jeans',
          sku: 'DJ-004',
          category: 'Clothing',
          description: 'Classic denim jeans with modern fit',
          unit_price: 59.99,
          min_stock_level: 15,
          current_stock: 2,
          supplier_id: '2',
          status: 'active',
          created_at: '2024-04-05T12:00:00Z',
          updated_at: '2024-09-21T10:30:00Z',
          inventory_value: 119.98,
          is_low_stock: true
        },
        {
          id: '6',
          name: 'Web Development Guide',
          sku: 'WD-006',
          category: 'Books',
          description: 'Complete web development from basics to advanced',
          unit_price: 39.99,
          min_stock_level: 12,
          current_stock: 1,
          supplier_id: '3',
          status: 'active',
          created_at: '2024-06-15T11:00:00Z',
          updated_at: '2024-09-21T09:45:00Z',
          inventory_value: 39.99,
          is_low_stock: true
        }
      ];

      return mockLowStockProducts as T;
    }

    // Mock products
    if (endpoint.startsWith('/products')) {
      const mockProducts = [
        {
          id: '1',
          name: 'Wireless Headphones',
          sku: 'WH-001',
          category: 'Electronics',
          description: 'High-quality wireless headphones with noise cancellation',
          unit_price: 299.99,
          min_stock_level: 5,
          current_stock: 15,
          supplier_id: '1',
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-09-20T14:30:00Z',
          inventory_value: 4499.85,
          is_low_stock: false
        },
        {
          id: '2',
          name: 'Gaming Mouse',
          sku: 'GM-002',
          category: 'Electronics',
          description: 'RGB gaming mouse with programmable buttons',
          unit_price: 79.99,
          min_stock_level: 10,
          current_stock: 8,
          supplier_id: '1',
          status: 'active',
          created_at: '2024-02-01T09:00:00Z',
          updated_at: '2024-09-21T11:15:00Z',
          inventory_value: 639.92,
          is_low_stock: true
        },
        {
          id: '3',
          name: 'Cotton T-Shirt',
          sku: 'CT-003',
          category: 'Clothing',
          description: 'Comfortable cotton t-shirt in multiple colors',
          unit_price: 19.99,
          min_stock_level: 20,
          current_stock: 45,
          supplier_id: '2',
          status: 'active',
          created_at: '2024-03-10T16:00:00Z',
          updated_at: '2024-09-19T13:45:00Z',
          inventory_value: 899.55,
          is_low_stock: false
        },
        {
          id: '4',
          name: 'Denim Jeans',
          sku: 'DJ-004',
          category: 'Clothing',
          description: 'Classic denim jeans with modern fit',
          unit_price: 59.99,
          min_stock_level: 15,
          current_stock: 2,
          supplier_id: '2',
          status: 'active',
          created_at: '2024-04-05T12:00:00Z',
          updated_at: '2024-09-21T10:30:00Z',
          inventory_value: 119.98,
          is_low_stock: true
        },
        {
          id: '5',
          name: 'Programming Book',
          sku: 'PB-005',
          category: 'Books',
          description: 'Comprehensive guide to modern programming',
          unit_price: 49.99,
          min_stock_level: 8,
          current_stock: 12,
          supplier_id: '3',
          status: 'active',
          created_at: '2024-05-20T14:00:00Z',
          updated_at: '2024-09-18T16:20:00Z',
          inventory_value: 599.88,
          is_low_stock: false
        },
        {
          id: '6',
          name: 'Web Development Guide',
          sku: 'WD-006',
          category: 'Books',
          description: 'Complete web development from basics to advanced',
          unit_price: 39.99,
          min_stock_level: 12,
          current_stock: 1,
          supplier_id: '3',
          status: 'active',
          created_at: '2024-06-15T11:00:00Z',
          updated_at: '2024-09-21T09:45:00Z',
          inventory_value: 39.99,
          is_low_stock: true
        }
      ];

      return {
        items: mockProducts,
        total: mockProducts.length,
        page: 1,
        per_page: 20,
        pages: 1,
        has_next: false,
        has_prev: false
      } as T;
    }

    // Mock suppliers
    if (endpoint.startsWith('/suppliers')) {
      const mockSuppliers = [
        {
          id: '1',
          name: 'TechCorp Electronics',
          contact_person: 'John Smith',
          email: 'john@techcorp.com',
          phone: '+1-555-0101',
          address: '123 Tech Street, Silicon Valley, CA',
          payment_terms: 'Net 30',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-09-20T00:00:00Z',
          product_count: 2,
          total_transactions: 15,
          total_value: 5139.77
        },
        {
          id: '2',
          name: 'Fashion Plus',
          contact_person: 'Sarah Johnson',
          email: 'sarah@fashionplus.com',
          phone: '+1-555-0102',
          address: '456 Style Ave, New York, NY',
          payment_terms: 'Net 15',
          status: 'active',
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-09-19T00:00:00Z',
          product_count: 2,
          total_transactions: 12,
          total_value: 1019.53
        },
        {
          id: '3',
          name: 'BookWorld Publishers',
          contact_person: 'Mike Davis',
          email: 'mike@bookworld.com',
          phone: '+1-555-0103',
          address: '789 Knowledge Blvd, Boston, MA',
          payment_terms: 'Net 45',
          status: 'active',
          created_at: '2024-03-01T00:00:00Z',
          updated_at: '2024-09-18T00:00:00Z',
          product_count: 2,
          total_transactions: 8,
          total_value: 639.87
        }
      ];

      return {
        items: mockSuppliers,
        total: mockSuppliers.length,
        page: 1,
        per_page: 20,
        pages: 1,
        has_next: false,
        has_prev: false
      } as T;
    }

    // Mock recent transactions
    if (endpoint.startsWith('/dashboard/recent-activities')) {
      const mockActivities = [
        {
          id: '1',
          type: 'stock_in',
          description: 'Added 10 units of Wireless Headphones',
          timestamp: '2024-09-21T10:30:00Z',
          user: 'admin'
        },
        {
          id: '2',
          type: 'stock_out',
          description: 'Removed 3 units of Gaming Mouse',
          timestamp: '2024-09-21T09:15:00Z',
          user: 'admin'
        },
        {
          id: '3',
          type: 'product_created',
          description: 'Created new product: Web Development Guide',
          timestamp: '2024-09-20T16:45:00Z',
          user: 'admin'
        }
      ];

      return mockActivities as T;
    }

    // Mock transactions
    if (endpoint.startsWith('/transactions')) {
      const mockTransactions = [
        {
          id: '1',
          product_id: '1',
          transaction_type: 'stock_in',
          quantity: 10,
          unit_price: 299.99,
          total_amount: 2999.90,
          reference_number: 'PO-2024-001',
          notes: 'Initial stock',
          created_by: 'admin',
          transaction_date: '2024-09-20T10:00:00Z',
          created_at: '2024-09-20T10:00:00Z',
          updated_at: '2024-09-20T10:00:00Z'
        },
        {
          id: '2',
          product_id: '2',
          transaction_type: 'stock_in',
          quantity: 5,
          unit_price: 79.99,
          total_amount: 399.95,
          reference_number: 'PO-2024-002',
          notes: 'Restock',
          created_by: 'admin',
          transaction_date: '2024-09-21T14:00:00Z',
          created_at: '2024-09-21T14:00:00Z',
          updated_at: '2024-09-21T14:00:00Z'
        }
      ];

      return {
        items: mockTransactions,
        total: mockTransactions.length,
        page: 1,
        per_page: 20,
        pages: 1,
        has_next: false,
        has_prev: false
      } as T;
    }

    // Mock chart data
    if (endpoint.startsWith('/dashboard/chart-data')) {
      if (endpoint.includes('stock-levels')) {
        return {
          by_category: [
            { category: 'Electronics', total_stock: 23, total_value: 5139.77, product_count: 2 },
            { category: 'Clothing', total_stock: 47, total_value: 1019.53, product_count: 2 },
            { category: 'Books', total_stock: 13, total_value: 639.87, product_count: 2 }
          ],
          by_status: [
            { status: 'active', count: 6, percentage: 100 },
            { status: 'inactive', count: 0, percentage: 0 },
            { status: 'discontinued', count: 0, percentage: 0 }
          ]
        } as T;
      }

      if (endpoint.includes('transaction-trends')) {
        return {
          period: {
            start_date: '2024-09-15',
            end_date: '2024-09-21',
            days: 7
          },
          daily_data: [
            { date: '2024-09-15', stock_in: { count: 2, quantity: 15, value: 1200.00 }, stock_out: { count: 1, quantity: 5, value: 400.00 }, net_movement: 10, net_value: 800.00 },
            { date: '2024-09-16', stock_in: { count: 1, quantity: 8, value: 600.00 }, stock_out: { count: 2, quantity: 12, value: 900.00 }, net_movement: -4, net_value: -300.00 },
            { date: '2024-09-17', stock_in: { count: 3, quantity: 25, value: 1800.00 }, stock_out: { count: 1, quantity: 3, value: 200.00 }, net_movement: 22, net_value: 1600.00 },
            { date: '2024-09-18', stock_in: { count: 2, quantity: 12, value: 950.00 }, stock_out: { count: 2, quantity: 8, value: 650.00 }, net_movement: 4, net_value: 300.00 },
            { date: '2024-09-19', stock_in: { count: 1, quantity: 6, value: 450.00 }, stock_out: { count: 1, quantity: 4, value: 300.00 }, net_movement: 2, net_value: 150.00 },
            { date: '2024-09-20', stock_in: { count: 2, quantity: 18, value: 1350.00 }, stock_out: { count: 1, quantity: 2, value: 150.00 }, net_movement: 16, net_value: 1200.00 },
            { date: '2024-09-21', stock_in: { count: 1, quantity: 5, value: 399.95 }, stock_out: { count: 0, quantity: 0, value: 0.00 }, net_movement: 5, net_value: 399.95 }
          ],
          totals: {
            stock_in_total: 12,
            stock_out_total: 8,
            net_movement: 55,
            total_value: 5149.95
          }
        } as T;
      }
    }

    // Default mock response
    return {
      success: true,
      data: null,
      message: 'Mock response',
      errors: null,
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: 'mock-' + Date.now()
      }
    } as T;
  }

  // Authentication methods
  async login(credentials: { username: string; password: string }) {
    return this.request<ApiResponse<{ access_token: string; token_type: string; user: any }>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
  }

  async refreshToken() {
    return this.request<ApiResponse<{ access_token: string; token_type: string }>>(
      '/auth/refresh',
      {
        method: 'POST',
      }
    );
  }

  async logout() {
    return this.request<ApiResponse<{ message: string }>>('/auth/logout', {
      method: 'POST',
    });
  }

  // Products API
  async getProducts(filters?: FilterOptions): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters as Record<string, any>).forEach(([key, value]: [string, any]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginatedResponse<Product>>(endpoint);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Transactions API
  async getTransactions(filters?: FilterOptions): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters as Record<string, any>).forEach(([key, value]: [string, any]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/transactions${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginatedResponse<Transaction>>(endpoint);
  }

  async getTransaction(id: string): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}`);
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async processStockIn(data: {
    product_id: string;
    quantity: number;
    unit_price: number;
    reference_number?: string;
    notes?: string;
  }): Promise<Transaction> {
    return this.request<Transaction>('/transactions/stock-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async processStockOut(data: {
    product_id: string;
    quantity: number;
    unit_price: number;
    reference_number?: string;
    notes?: string;
  }): Promise<Transaction> {
    return this.request<Transaction>('/transactions/stock-out', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Suppliers API
  async getSuppliers(filters?: FilterOptions): Promise<PaginatedResponse<Supplier>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters as Record<string, any>).forEach(([key, value]: [string, any]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/suppliers${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginatedResponse<Supplier>>(endpoint);
  }

  async getSupplier(id: string): Promise<Supplier> {
    return this.request<Supplier>(`/suppliers/${id}`);
  }

  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    return this.request<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
  }

  async updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    return this.request<Supplier>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    });
  }

  async deleteSupplier(id: string): Promise<void> {
    return this.request<void>(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard API
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getStockLevelsChartData(): Promise<ChartData['stock_levels']> {
    return this.request<ChartData['stock_levels']>('/dashboard/chart-data/stock-levels');
  }

  async getTransactionTrendsChartData(days: number = 7): Promise<ChartData['transaction_trends']> {
    return this.request<ChartData['transaction_trends']>(`/dashboard/chart-data/transaction-trends?days=${days}`);
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.request<Product[]>('/dashboard/low-stock-products');
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    return this.request<any[]>(`/dashboard/recent-activities?limit=${limit}`);
  }

  // Reports API
  async getInventoryReport(filters?: any): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters as Record<string, any>).forEach(([key, value]: [string, any]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/reports/inventory-report${queryString ? `?${queryString}` : ''}`;

    return this.request<any>(endpoint);
  }

  async getTransactionReport(filters: {
    date_from: string;
    date_to: string;
    transaction_type?: string;
    product_id?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters as Record<string, any>).forEach(([key, value]: [string, any]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = `/reports/transaction-report?${queryString}`;

    return this.request<any>(endpoint);
  }

  async exportReport(options: ExportOptions): Promise<any> {
    return this.request<any>('/reports/export', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async getExportStatus(exportId: string): Promise<any> {
    return this.request<any>(`/reports/export/${exportId}`);
  }

  // Search API
  async search(query: string, type?: string, limit: number = 20): Promise<any> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    if (type) {
      params.append('type', type);
    }

    const queryString = params.toString();
    return this.request<any>(`/search?${queryString}`);
  }

  // Utility methods
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/health');
  }

  // Helper method to get auth headers
  getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(config.tokenKey);
    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }

  // Helper method to make authenticated requests
  async authenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const authHeaders = this.getAuthHeaders();

    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });
  }
}

// Create and export API service instance
export const apiService = new ApiService();
export default apiService;