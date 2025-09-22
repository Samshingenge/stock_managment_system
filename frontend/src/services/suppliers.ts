// Suppliers service for the Stock Management System

import { apiService } from './api';
import type {
  Supplier,
  PaginatedResponse,
  FilterOptions,
  ExportOptions,
  SupplierStatistics
} from '../types';

class SuppliersService {
  // Get suppliers with filtering and pagination
  async getSuppliers(filters?: FilterOptions): Promise<PaginatedResponse<Supplier>> {
    try {
      return await apiService.getSuppliers(filters);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  // Get single supplier by ID
  async getSupplier(id: string): Promise<Supplier> {
    try {
      return await apiService.getSupplier(id);
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      throw error;
    }
  }

  // Create new supplier
  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    try {
      return await apiService.createSupplier(supplier);
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }

  // Update existing supplier
  async updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    try {
      return await apiService.updateSupplier(id, supplier);
    } catch (error) {
      console.error(`Error updating supplier ${id}:`, error);
      throw error;
    }
  }

  // Delete supplier
  async deleteSupplier(id: string): Promise<void> {
    try {
      return await apiService.deleteSupplier(id);
    } catch (error) {
      console.error(`Error deleting supplier ${id}:`, error);
      throw error;
    }
  }

  // Get active suppliers
  async getActiveSuppliers(): Promise<Supplier[]> {
    try {
      const response = await apiService.getSuppliers({
        status: 'active',
        per_page: 100
      });
      return response.items || [];
    } catch (error) {
      console.error('Error fetching active suppliers:', error);
      throw error;
    }
  }

  // Search suppliers
  async searchSuppliers(query: string, limit: number = 20): Promise<Supplier[]> {
    try {
      const response = await apiService.getSuppliers({
        search: query,
        per_page: limit
      });
      return response.items || [];
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw error;
    }
  }

  // Get suppliers by status
  async getSuppliersByStatus(status: 'active' | 'inactive'): Promise<Supplier[]> {
    try {
      const response = await apiService.getSuppliers({
        status: status,
        per_page: 100
      });
      return response.items || [];
    } catch (error) {
      console.error(`Error fetching ${status} suppliers:`, error);
      throw error;
    }
  }

  // Get supplier statistics
  async getSupplierStatistics(supplierId?: string): Promise<SupplierStatistics> {
    try {
      if (supplierId) {
        const supplier = await this.getSupplier(supplierId);
        return supplier.statistics || {
          total_products: 0,
          active_products: 0,
          total_transactions: 0,
          total_value_last_30_days: 0,
          average_order_value: 0,
        };
      }

      // Get overall supplier statistics
      const response = await apiService.getSuppliers({ per_page: 1000 });
      const suppliers = response.items || [];

      const totalProducts = suppliers.reduce((sum: number, supplier: Supplier) =>
        sum + (supplier.product_count || 0), 0
      );

      const activeProducts = suppliers.reduce((sum: number, supplier: Supplier) =>
        sum + (supplier.statistics?.active_products || 0), 0
      );

      const totalTransactions = suppliers.reduce((sum: number, supplier: Supplier) =>
        sum + (supplier.total_transactions || 0), 0
      );

      const totalValueLast30Days = suppliers.reduce((sum: number, supplier: Supplier) =>
        sum + (supplier.statistics?.total_value_last_30_days || 0), 0
      );

      const averageOrderValue = totalTransactions > 0
        ? totalValueLast30Days / totalTransactions
        : 0;

      return {
        total_products: totalProducts,
        active_products: activeProducts,
        total_transactions: totalTransactions,
        total_value_last_30_days: totalValueLast30Days,
        average_order_value: averageOrderValue,
      };
    } catch (error) {
      console.error('Error fetching supplier statistics:', error);
      throw error;
    }
  }

  // Get top suppliers by transaction value
  async getTopSuppliersByValue(limit: number = 10): Promise<Array<{
    supplier: Supplier;
    totalValue: number;
    transactionCount: number;
    averageOrderValue: number;
  }>> {
    try {
      const response = await apiService.getSuppliers({ per_page: 1000 });
      const suppliers = response.items || [];

      // Sort suppliers by total value and return top N
      const topSuppliers = suppliers
        .filter((supplier: Supplier) => supplier.total_value && supplier.total_value > 0)
        .sort((a: Supplier, b: Supplier) => (b.total_value || 0) - (a.total_value || 0))
        .slice(0, limit)
        .map((supplier: Supplier) => ({
          supplier,
          totalValue: supplier.total_value || 0,
          transactionCount: supplier.total_transactions || 0,
          averageOrderValue: (supplier.total_transactions || 0) > 0
            ? (supplier.total_value || 0) / (supplier.total_transactions || 0)
            : 0,
        }));

      return topSuppliers;
    } catch (error) {
      console.error('Error fetching top suppliers by value:', error);
      throw error;
    }
  }

  // Get suppliers with most products
  async getSuppliersWithMostProducts(limit: number = 10): Promise<Array<{
    supplier: Supplier;
    productCount: number;
  }>> {
    try {
      const response = await apiService.getSuppliers({ per_page: 1000 });
      const suppliers = response.items || [];

      // Sort suppliers by product count and return top N
      const topSuppliers = suppliers
        .filter((supplier: Supplier) => supplier.product_count && supplier.product_count > 0)
        .sort((a: Supplier, b: Supplier) => (b.product_count || 0) - (a.product_count || 0))
        .slice(0, limit)
        .map((supplier: Supplier) => ({
          supplier,
          productCount: supplier.product_count || 0,
        }));

      return topSuppliers;
    } catch (error) {
      console.error('Error fetching suppliers with most products:', error);
      throw error;
    }
  }

  // Get supplier performance metrics
  async getSupplierPerformanceMetrics(supplierId: string): Promise<{
    totalProducts: number;
    activeProducts: number;
    totalTransactions: number;
    totalValue: number;
    averageOrderValue: number;
    lastTransactionDate: string | null;
    topProducts: Array<{
      product: any;
      transactionCount: number;
      totalValue: number;
    }>;
  }> {
    try {
      const supplier = await this.getSupplier(supplierId);

      // Get supplier's products
      const productsResponse = await apiService.getProducts({
        supplier_id: supplierId,
        per_page: 1000
      });
      const products = productsResponse.items || [];

      // Get supplier's transactions
      const transactionsResponse = await apiService.getTransactions({
        supplier_id: supplierId,
        per_page: 1000
      });
      const transactions = transactionsResponse.items || [];

      const activeProducts = products.filter((p: any) => p.status === 'active');

      const totalValue = transactions.reduce((sum: number, t: any) => sum + t.total_amount, 0);

      const averageOrderValue = transactions.length > 0
        ? totalValue / transactions.length
        : 0;

      const lastTransactionDate = transactions.length > 0
        ? transactions.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null;

      // Get top products by transaction value
      const productStats = new Map<string, { transactionCount: number; totalValue: number }>();

      transactions.forEach((transaction: any) => {
        const productId = transaction.product_id;
        if (!productStats.has(productId)) {
          productStats.set(productId, { transactionCount: 0, totalValue: 0 });
        }
        const stats = productStats.get(productId)!;
        stats.transactionCount++;
        stats.totalValue += transaction.total_amount;
      });

      const topProducts = Array.from(productStats.entries())
        .sort(([, a], [, b]) => b.totalValue - a.totalValue)
        .slice(0, 5)
        .map(([productId, stats]) => ({
          product: products.find((p: any) => p.id === productId),
          transactionCount: stats.transactionCount,
          totalValue: stats.totalValue,
        }))
        .filter(item => item.product); // Filter out products not found

      return {
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        totalTransactions: transactions.length,
        totalValue,
        averageOrderValue,
        lastTransactionDate,
        topProducts,
      };
    } catch (error) {
      console.error(`Error fetching performance metrics for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  // Export suppliers
  async exportSuppliers(format: 'excel' | 'csv' | 'pdf', filters?: FilterOptions): Promise<any> {
    try {
      const exportOptions: ExportOptions = {
        report_type: 'suppliers',
        format,
        filters: filters as Record<string, any>,
        options: {
          include_charts: false,
          include_summary: true,
        },
      };

      return await apiService.exportReport(exportOptions);
    } catch (error) {
      console.error('Error exporting suppliers:', error);
      throw error;
    }
  }

  // Bulk update suppliers
  async bulkUpdateSuppliers(updates: Array<{
    id: string;
    updates: Partial<Supplier>;
  }>): Promise<Supplier[]> {
    try {
      const promises = updates.map(({ id, updates: supplierUpdates }) =>
        apiService.updateSupplier(id, supplierUpdates)
      );

      return await Promise.all(promises);
    } catch (error) {
      console.error('Error bulk updating suppliers:', error);
      throw error;
    }
  }

  // Bulk delete suppliers
  async bulkDeleteSuppliers(ids: string[]): Promise<void> {
    try {
      const promises = ids.map(id => apiService.deleteSupplier(id));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error bulk deleting suppliers:', error);
      throw error;
    }
  }

  // Validate supplier data
  validateSupplier(supplier: Partial<Supplier>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!supplier.name || supplier.name.trim().length === 0) {
      errors.push('Supplier name is required');
    }

    if (supplier.email && supplier.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(supplier.email)) {
        errors.push('Invalid email format');
      }
    }

    if (supplier.phone && supplier.phone.trim().length > 0) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(supplier.phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.push('Invalid phone number format');
      }
    }

    if (supplier.payment_terms && supplier.payment_terms.trim().length === 0) {
      errors.push('Payment terms cannot be empty if provided');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get supplier suggestions for search autocomplete
  async getSupplierSuggestions(query: string, limit: number = 5): Promise<Array<{
    id: string;
    name: string;
    contact_person?: string;
    email?: string;
  }>> {
    try {
      const suppliers = await this.searchSuppliers(query, limit);
      return suppliers.map((supplier: Supplier) => ({
        id: supplier.id,
        name: supplier.name,
        contact_person: supplier.contact_person,
        email: supplier.email,
      }));
    } catch (error) {
      console.error('Error fetching supplier suggestions:', error);
      return [];
    }
  }
}

// Create and export suppliers service instance
export const suppliersService = new SuppliersService();
export default suppliersService;