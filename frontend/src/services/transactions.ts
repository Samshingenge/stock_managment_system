// Transactions service for the Stock Management System

import { apiService } from './api';
import type {
  Transaction,
  PaginatedResponse,
  FilterOptions,
  ExportOptions,
  Product
} from '../types';

class TransactionsService {
  // Get transactions with filtering and pagination
  async getTransactions(filters?: FilterOptions): Promise<PaginatedResponse<Transaction>> {
    try {
      return await apiService.getTransactions(filters);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Get single transaction by ID
  async getTransaction(id: string): Promise<Transaction> {
    try {
      return await apiService.getTransaction(id);
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      throw error;
    }
  }

  // Create new transaction
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    try {
      return await apiService.createTransaction(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Process stock in transaction
  async processStockIn(data: {
    product_id: string;
    quantity: number;
    unit_price: number;
    reference_number?: string;
    notes?: string;
  }): Promise<Transaction> {
    try {
      return await apiService.processStockIn(data);
    } catch (error) {
      console.error('Error processing stock in:', error);
      throw error;
    }
  }

  // Process stock out transaction
  async processStockOut(data: {
    product_id: string;
    quantity: number;
    unit_price: number;
    reference_number?: string;
    notes?: string;
  }): Promise<Transaction> {
    try {
      return await apiService.processStockOut(data);
    } catch (error) {
      console.error('Error processing stock out:', error);
      throw error;
    }
  }

  // Get transactions by product
  async getTransactionsByProduct(productId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const response = await apiService.getTransactions({
        product_id: productId,
        per_page: limit,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      return response.items || [];
    } catch (error) {
      console.error(`Error fetching transactions for product ${productId}:`, error);
      throw error;
    }
  }

  // Get transactions by date range
  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const response = await apiService.getTransactions({
        date_from: startDate,
        date_to: endDate,
        per_page: 1000,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      return response.items || [];
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      throw error;
    }
  }

  // Get stock in transactions
  async getStockInTransactions(filters?: FilterOptions): Promise<Transaction[]> {
    try {
      const response = await apiService.getTransactions({
        ...filters,
        transaction_type: 'stock_in',
        per_page: 1000,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      return response.items || [];
    } catch (error) {
      console.error('Error fetching stock in transactions:', error);
      throw error;
    }
  }

  // Get stock out transactions
  async getStockOutTransactions(filters?: FilterOptions): Promise<Transaction[]> {
    try {
      const response = await apiService.getTransactions({
        ...filters,
        transaction_type: 'stock_out',
        per_page: 1000,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      return response.items || [];
    } catch (error) {
      console.error('Error fetching stock out transactions:', error);
      throw error;
    }
  }

  // Get transaction statistics
  async getTransactionStatistics(dateFrom?: string, dateTo?: string): Promise<{
    totalTransactions: number;
    stockInCount: number;
    stockOutCount: number;
    totalStockInValue: number;
    totalStockOutValue: number;
    netMovement: number;
    averageTransactionValue: number;
  }> {
    try {
      const filters: FilterOptions = {
        per_page: 1000,
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;

      const response = await apiService.getTransactions(filters);
      const transactions = response.items || [];

      const stockInTransactions = transactions.filter(
        (t: Transaction) => t.transaction_type === 'stock_in'
      );

      const stockOutTransactions = transactions.filter(
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

      const netMovement = stockInTransactions.reduce(
        (sum: number, t: Transaction) => sum + t.quantity,
        0
      ) - stockOutTransactions.reduce(
        (sum: number, t: Transaction) => sum + t.quantity,
        0
      );

      const averageTransactionValue = transactions.length > 0
        ? transactions.reduce((sum: number, t: Transaction) => sum + t.total_amount, 0) / transactions.length
        : 0;

      return {
        totalTransactions: transactions.length,
        stockInCount: stockInTransactions.length,
        stockOutCount: stockOutTransactions.length,
        totalStockInValue,
        totalStockOutValue,
        netMovement,
        averageTransactionValue,
      };
    } catch (error) {
      console.error('Error fetching transaction statistics:', error);
      throw error;
    }
  }

  // Get daily transaction summary
  async getDailyTransactionSummary(days: number = 7): Promise<Array<{
    date: string;
    stockIn: { count: number; quantity: number; value: number };
    stockOut: { count: number; quantity: number; value: number };
    netMovement: number;
  }>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const transactions = await this.getTransactionsByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Group transactions by date
      const dailySummary = new Map<string, {
        stockIn: { count: number; quantity: number; value: number };
        stockOut: { count: number; quantity: number; value: number };
        netMovement: number;
      }>();

      // Initialize all dates in range
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        dailySummary.set(dateStr, {
          stockIn: { count: 0, quantity: 0, value: 0 },
          stockOut: { count: 0, quantity: 0, value: 0 },
          netMovement: 0,
        });
      }

      // Aggregate transactions by date
      transactions.forEach((transaction: Transaction) => {
        const date = transaction.created_at.split('T')[0];
        const summary = dailySummary.get(date);

        if (summary) {
          if (transaction.transaction_type === 'stock_in') {
            summary.stockIn.count++;
            summary.stockIn.quantity += transaction.quantity;
            summary.stockIn.value += transaction.total_amount;
          } else if (transaction.transaction_type === 'stock_out') {
            summary.stockOut.count++;
            summary.stockOut.quantity += transaction.quantity;
            summary.stockOut.value += transaction.total_amount;
          }
          summary.netMovement += transaction.transaction_type === 'stock_in'
            ? transaction.quantity
            : -transaction.quantity;
        }
      });

      // Convert to array and sort by date
      return Array.from(dailySummary.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

    } catch (error) {
      console.error('Error fetching daily transaction summary:', error);
      throw error;
    }
  }

  // Export transactions
  async exportTransactions(format: 'excel' | 'csv' | 'pdf', filters?: FilterOptions): Promise<any> {
    try {
      const exportOptions: ExportOptions = {
        report_type: 'transactions',
        format,
        filters: filters as Record<string, any>,
        options: {
          include_charts: true,
          include_summary: true,
        },
      };

      return await apiService.exportReport(exportOptions);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw error;
    }
  }

  // Get top products by transaction volume
  async getTopProductsByTransactionVolume(limit: number = 10): Promise<Array<{
    product: Product;
    transactionCount: number;
    totalQuantity: number;
    totalValue: number;
  }>> {
    try {
      const response = await apiService.getTransactions({
        per_page: 1000,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      const transactions = response.items || [];

      // Group transactions by product
      const productStats = new Map<string, {
        product: Product | null;
        transactionCount: number;
        totalQuantity: number;
        totalValue: number;
      }>();

      for (const transaction of transactions) {
        const productId = transaction.product_id;

        if (!productStats.has(productId)) {
          productStats.set(productId, {
            product: null,
            transactionCount: 0,
            totalQuantity: 0,
            totalValue: 0,
          });
        }

        const stats = productStats.get(productId)!;
        stats.transactionCount++;
        stats.totalQuantity += transaction.quantity;
        stats.totalValue += transaction.total_amount;
      }

      // Get product details
      const topProducts = [];

      for (const [productId, stats] of productStats.entries()) {
        try {
          const product = await apiService.getProduct(productId);
          stats.product = product;

          topProducts.push({
            product,
            transactionCount: stats.transactionCount,
            totalQuantity: stats.totalQuantity,
            totalValue: stats.totalValue,
          });
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }

      // Sort by transaction count and return top N
      return topProducts
        .sort((a, b) => b.transactionCount - a.transactionCount)
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching top products by transaction volume:', error);
      throw error;
    }
  }

  // Validate transaction data
  validateTransaction(transaction: Partial<Transaction>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!transaction.product_id) {
      errors.push('Product ID is required');
    }

    if (!transaction.transaction_type || !['stock_in', 'stock_out', 'adjustment'].includes(transaction.transaction_type)) {
      errors.push('Valid transaction type is required');
    }

    if (!transaction.quantity || transaction.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (!transaction.unit_price || transaction.unit_price < 0) {
      errors.push('Unit price cannot be negative');
    }

    if (transaction.transaction_type === 'stock_out' && transaction.quantity) {
      // Additional validation for stock out could be added here
      // For example, checking if there's enough stock
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get transaction trends
  async getTransactionTrends(days: number = 30): Promise<{
    period: { start_date: string; end_date: string; days: number };
    daily_data: Array<{
      date: string;
      stock_in: { count: number; quantity: number; value: number };
      stock_out: { count: number; quantity: number; value: number };
      net_movement: number;
    }>;
    totals: {
      stock_in_total: number;
      stock_out_total: number;
      net_movement: number;
      total_value: number;
    };
  }> {
    try {
      const dailySummary = await this.getDailyTransactionSummary(days);

      const totals = dailySummary.reduce(
        (acc, day) => ({
          stock_in_total: acc.stock_in_total + day.stockIn.count,
          stock_out_total: acc.stock_out_total + day.stockOut.count,
          net_movement: acc.net_movement + day.netMovement,
          total_value: acc.total_value + day.stockIn.value + day.stockOut.value,
        }),
        { stock_in_total: 0, stock_out_total: 0, net_movement: 0, total_value: 0 }
      );

      return {
        period: {
          start_date: dailySummary[0]?.date || '',
          end_date: dailySummary[dailySummary.length - 1]?.date || '',
          days,
        },
        daily_data: dailySummary.map(day => ({
          date: day.date,
          stock_in: day.stockIn,
          stock_out: day.stockOut,
          net_movement: day.netMovement,
        })),
        totals,
      };
    } catch (error) {
      console.error('Error fetching transaction trends:', error);
      throw error;
    }
  }
}

// Create and export transactions service instance
export const transactionsService = new TransactionsService();
export default transactionsService;