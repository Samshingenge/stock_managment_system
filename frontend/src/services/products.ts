// Products service for the Stock Management System

import { apiService } from './api';
import type {
  Product,
  PaginatedResponse,
  FilterOptions,
  ExportOptions
} from '../types';

class ProductsService {
  // Get products with filtering and pagination
  async getProducts(filters?: FilterOptions): Promise<PaginatedResponse<Product>> {
    try {
      return await apiService.getProducts(filters);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get single product by ID
  async getProduct(id: string): Promise<Product> {
    try {
      return await apiService.getProduct(id);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  // Create new product
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    try {
      return await apiService.createProduct(product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update existing product
  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    try {
      return await apiService.updateProduct(id, product);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      return await apiService.deleteProduct(id);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }

  // Get products with low stock
  async getLowStockProducts(): Promise<Product[]> {
    try {
      const response = await apiService.getProducts({ low_stock_only: true });
      return response.items || [];
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  // Get out of stock products
  async getOutOfStockProducts(): Promise<Product[]> {
    try {
      const response = await apiService.getProducts({ low_stock_only: true });
      const products = response.items || [];
      return products.filter((product: Product) => product.current_stock <= 0);
    } catch (error) {
      console.error('Error fetching out of stock products:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    try {
      const response = await apiService.getProducts({
        search: query,
        per_page: limit
      });
      return response.items || [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await apiService.getProducts({
        category: category,
        per_page: 100
      });
      return response.items || [];
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error);
      throw error;
    }
  }

  // Get products by supplier
  async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    try {
      const response = await apiService.getProducts({
        supplier_id: supplierId,
        per_page: 100
      });
      return response.items || [];
    } catch (error) {
      console.error(`Error fetching products for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  // Update product stock
  async updateProductStock(id: string, newStock: number, notes?: string): Promise<Product> {
    try {
      return await apiService.updateProduct(id, {
        current_stock: newStock,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error updating stock for product ${id}:`, error);
      throw error;
    }
  }

  // Bulk update products
  async bulkUpdateProducts(updates: Array<{
    id: string;
    updates: Partial<Product>;
  }>): Promise<Product[]> {
    try {
      const promises = updates.map(({ id, updates: productUpdates }) =>
        apiService.updateProduct(id, productUpdates)
      );

      return await Promise.all(promises);
    } catch (error) {
      console.error('Error bulk updating products:', error);
      throw error;
    }
  }

  // Bulk delete products
  async bulkDeleteProducts(ids: string[]): Promise<void> {
    try {
      const promises = ids.map(id => apiService.deleteProduct(id));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      throw error;
    }
  }

  // Get product statistics
  async getProductStatistics(): Promise<{
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalInventoryValue: number;
    averageProductValue: number;
  }> {
    try {
      const response = await apiService.getProducts({ per_page: 1000 });
      const products = response.items || [];

      const activeProducts = products.filter((p: Product) => p.status === 'active');
      const inactiveProducts = products.filter((p: Product) => p.status === 'inactive');
      const lowStockProducts = products.filter((p: Product) =>
        p.current_stock > 0 && p.current_stock <= p.min_stock_level
      );
      const outOfStockProducts = products.filter((p: Product) => p.current_stock <= 0);

      const totalInventoryValue = products.reduce((sum: number, product: Product) =>
        sum + (product.current_stock * product.unit_price), 0
      );

      const averageProductValue = products.length > 0
        ? totalInventoryValue / products.length
        : 0;

      return {
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        inactiveProducts: inactiveProducts.length,
        lowStockProducts: lowStockProducts.length,
        outOfStockProducts: outOfStockProducts.length,
        totalInventoryValue,
        averageProductValue,
      };
    } catch (error) {
      console.error('Error fetching product statistics:', error);
      throw error;
    }
  }

  // Export products
  async exportProducts(format: 'excel' | 'csv' | 'pdf', filters?: FilterOptions): Promise<any> {
    try {
      const exportOptions: ExportOptions = {
        report_type: 'inventory',
        format,
        filters: filters as Record<string, any>,
        options: {
          include_charts: false,
          include_summary: true,
        },
      };

      return await apiService.exportReport(exportOptions);
    } catch (error) {
      console.error('Error exporting products:', error);
      throw error;
    }
  }

  // Get product history (recent transactions)
  async getProductHistory(productId: string, limit: number = 10): Promise<any[]> {
    try {
      // This would typically be a separate API endpoint
      // For now, we'll get all transactions and filter by product
      const response = await apiService.getTransactions({
        product_id: productId,
        per_page: limit,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      return response.items || [];
    } catch (error) {
      console.error(`Error fetching history for product ${productId}:`, error);
      throw error;
    }
  }

  // Validate product data
  validateProduct(product: Partial<Product>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (!product.unit_price || product.unit_price <= 0) {
      errors.push('Unit price must be greater than 0');
    }

    if (product.min_stock_level !== undefined && product.min_stock_level < 0) {
      errors.push('Minimum stock level cannot be negative');
    }

    if (product.current_stock !== undefined && product.current_stock < 0) {
      errors.push('Current stock cannot be negative');
    }

    if (product.category && product.category.trim().length === 0) {
      errors.push('Category cannot be empty if provided');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get product suggestions for search autocomplete
  async getProductSuggestions(query: string, limit: number = 5): Promise<Array<{
    id: string;
    name: string;
    sku?: string;
    category?: string;
  }>> {
    try {
      const products = await this.searchProducts(query, limit);
      return products.map((product: Product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
      }));
    } catch (error) {
      console.error('Error fetching product suggestions:', error);
      return [];
    }
  }
}

// Create and export products service instance
export const productsService = new ProductsService();
export default productsService;