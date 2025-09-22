// Dashboard service for the Stock Management System

import { apiService } from './api';
import type {
  DashboardStats,
  ChartData,
  Product,
  Transaction,
  PaginatedResponse
} from '../types';

class DashboardService {
  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    try {
      return await apiService.getDashboardStats();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get stock levels chart data
  async getStockLevelsChartData(): Promise<ChartData['stock_levels']> {
    try {
      return await apiService.getStockLevelsChartData();
    } catch (error) {
      console.error('Error fetching stock levels chart data:', error);
      throw error;
    }
  }

  // Get transaction trends chart data
  async getTransactionTrendsChartData(days: number = 7): Promise<ChartData['transaction_trends']> {
    try {
      return await apiService.getTransactionTrendsChartData(days);
    } catch (error) {
      console.error('Error fetching transaction trends chart data:', error);
      throw error;
    }
  }

  // Get low stock products
  async getLowStockProducts(): Promise<Product[]> {
    try {
      return await apiService.getLowStockProducts();
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  // Get recent activities
  async getRecentActivities(limit: number = 10): Promise<any[]> {
    try {
      return await apiService.getRecentActivities(limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  // Get products with low stock
  async getProductsWithLowStock(): Promise<Product[]> {
    try {
      const products = await apiService.getProducts({ low_stock_only: true });
      return products.items || [];
    } catch (error) {
      console.error('Error fetching products with low stock:', error);
      throw error;
    }
  }

  // Get recent transactions
  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    try {
      const transactions = await apiService.getTransactions({
        per_page: limit,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      return transactions.items || [];
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  // Get stock overview data
  async getStockOverview(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
  }> {
    try {
      const [stats, lowStockProducts] = await Promise.all([
        this.getStats(),
        this.getLowStockProducts()
      ]);

      const outOfStockItems = lowStockProducts.filter(
        (product: Product) => product.current_stock <= 0
      ).length;

      const totalValue = lowStockProducts.reduce(
        (sum: number, product: Product) => sum + (product.current_stock * product.unit_price),
        0
      );

      return {
        totalProducts: stats.overview.total_products || 0,
        lowStockItems: stats.inventory.low_stock_items || 0,
        outOfStockItems,
        totalValue: stats.inventory.total_inventory_value || 0,
      };
    } catch (error) {
      console.error('Error fetching stock overview:', error);
      throw error;
    }
  }

  // Get transaction summary for the last N days
  async getTransactionSummary(days: number = 7): Promise<{
    totalTransactions: number;
    stockInCount: number;
    stockOutCount: number;
    totalStockInValue: number;
    totalStockOutValue: number;
  }> {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      const transactions = await apiService.getTransactions({
        date_from: dateFrom.toISOString().split('T')[0],
        limit: 1000 // Get a large number to ensure we get all transactions
      });

      const transactionList = transactions.items || [];

      const stockInTransactions = transactionList.filter(
        (t: Transaction) => t.transaction_type === 'stock_in'
      );

      const stockOutTransactions = transactionList.filter(
        (t: Transaction) => t.transaction_type === 'stock_out'
      );

      const totalStockInValue = stockInTransactions.reduce(
        (sum: number, t: Transaction) => sum + (t.quantity * t.unit_price),
        0
      );

      const totalStockOutValue = stockOutTransactions.reduce(
        (sum: number, t: Transaction) => sum + (t.quantity * t.unit_price),
        0
      );

      return {
        totalTransactions: transactionList.length,
        stockInCount: stockInTransactions.length,
        stockOutCount: stockOutTransactions.length,
        totalStockInValue,
        totalStockOutValue,
      };
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      throw error;
    }
  }

  // Get top products by stock movement
  async getTopProductsByMovement(limit: number = 5): Promise<{
    product: Product;
    totalMovement: number;
    lastMovement: string;
  }[]> {
    try {
      const transactions = await apiService.getTransactions({
        per_page: 1000,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      const transactionList = transactions.items || [];

      // Group transactions by product and calculate total movement
      const productMovements = new Map<string, {
        product: Product | null;
        totalMovement: number;
        lastMovement: string;
      }>();

      for (const transaction of transactionList) {
        const productId = transaction.product_id;

        if (!productMovements.has(productId)) {
          productMovements.set(productId, {
            product: null,
            totalMovement: 0,
            lastMovement: transaction.created_at,
          });
        }

        const movement = productMovements.get(productId)!;
        movement.totalMovement += Math.abs(transaction.quantity);
        movement.lastMovement = transaction.created_at;
      }

      // Get product details for each product ID
      const topProducts = [];

      for (const [productId, movement] of productMovements.entries()) {
        try {
          const product = await apiService.getProduct(productId);
          movement.product = product;

          topProducts.push({
            product,
            totalMovement: movement.totalMovement,
            lastMovement: movement.lastMovement,
          });
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }

      // Sort by total movement and return top N
      return topProducts
        .sort((a, b) => b.totalMovement - a.totalMovement)
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching top products by movement:', error);
      throw error;
    }
  }

  // Get inventory alerts
  async getInventoryAlerts(): Promise<{
    lowStock: Product[];
    outOfStock: Product[];
    expiringSoon: Product[];
  }> {
    try {
      const [lowStockProducts] = await Promise.all([
        this.getLowStockProducts()
      ]);

      const outOfStock = lowStockProducts.filter(
        (product: Product) => product.current_stock <= 0
      );

      const lowStock = lowStockProducts.filter(
        (product: Product) => product.current_stock > 0 && product.current_stock <= product.min_stock_level
      );

      // For now, we'll return empty array for expiring soon
      // This could be enhanced with expiry date tracking in the future
      const expiringSoon: Product[] = [];

      return {
        lowStock,
        outOfStock,
        expiringSoon,
      };
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      throw error;
    }
  }

  // Get dashboard summary for quick overview
  async getDashboardSummary(): Promise<{
    stats: DashboardStats;
    alerts: {
      lowStock: Product[];
      outOfStock: Product[];
      expiringSoon: Product[];
    };
    recentTransactions: Transaction[];
    topProducts: {
      product: Product;
      totalMovement: number;
      lastMovement: string;
    }[];
  }> {
    try {
      const [
        stats,
        alerts,
        recentTransactions,
        topProducts
      ] = await Promise.all([
        this.getStats(),
        this.getInventoryAlerts(),
        this.getRecentTransactions(5),
        this.getTopProductsByMovement(5)
      ]);

      return {
        stats,
        alerts,
        recentTransactions,
        topProducts,
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }
}

// Create and export dashboard service instance
export const dashboardService = new DashboardService();
export default dashboardService;