// Dashboard page for the Stock Management System

import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard';
import { productsService } from '../services/products';
import { suppliersService } from '../services/suppliers';
import { StockLevelChart } from '../components/charts/StockLevelChart';
import { TransactionTrendsChart } from '../components/charts/TransactionTrendsChart';
import { FormModal } from '../components/ui/Modal';
import { Form } from '../components/ui/Form';
import type { DashboardStats, Product, Transaction, ChartData, Supplier } from '../types';

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [stockLevelData, setStockLevelData] = useState<ChartData['stock_levels'] | null>(null);
  const [transactionTrendsData, setTransactionTrendsData] = useState<ChartData['transaction_trends'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Product Modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [
        statsData,
        lowStockData,
        recentTransactionsData,
        stockLevelChartData,
        transactionTrendsChartData
      ] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getLowStockProducts(),
        dashboardService.getRecentTransactions(5),
        dashboardService.getStockLevelsChartData(),
        dashboardService.getTransactionTrendsChartData(7)
      ]);

      setStats(statsData);
      setLowStockProducts(lowStockData);
      setRecentTransactions(recentTransactionsData);
      setStockLevelData(stockLevelChartData);
      setTransactionTrendsData(transactionTrendsChartData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch suppliers for the dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const suppliersData = await suppliersService.getSuppliers({ per_page: 100 });
        setSuppliers(suppliersData.items || []);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    if (showAddProductModal) {
      fetchSuppliers();
    }
  }, [showAddProductModal]);

  // Handle form submission
  const handleAddProduct = async (formData: Record<string, any>) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Prepare product data
      const productData = {
        name: formData.name,
        description: formData.description,
        unit_price: formData.unit_price,
        current_stock: formData.current_stock,
        min_stock_level: formData.min_stock_level || 0,
        category: formData.category || '',
        sku: formData.sku || '',
        status: 'active' as const,
        supplier_id: formData.supplier_id || null,
      };

      // Create the product
      await productsService.createProduct(productData);

      // Close modal and refresh dashboard data
      setShowAddProductModal(false);
      await fetchDashboardData();

      // Show success message (you could add a toast notification here)
      console.log('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowAddProductModal(false);
    setSubmitError(null);
  };

  // Form fields configuration
  const productFormFields = [
    {
      name: 'name',
      label: 'Product Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter product name',
      validation: {
        min: 2,
        max: 100,
        message: 'Product name must be between 2 and 100 characters'
      }
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      required: false,
      placeholder: 'Enter product description',
    },
    {
      name: 'sku',
      label: 'SKU',
      type: 'text' as const,
      required: false,
      placeholder: 'Enter SKU (optional)',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'text' as const,
      required: false,
      placeholder: 'Enter product category',
    },
    {
      name: 'unit_price',
      label: 'Unit Price',
      type: 'number' as const,
      required: true,
      placeholder: '0.00',
      validation: {
        min: 0.01,
        max: 999999.99,
        message: 'Unit price must be greater than 0'
      }
    },
    {
      name: 'current_stock',
      label: 'Current Stock',
      type: 'number' as const,
      required: true,
      placeholder: '0',
      validation: {
        min: 0,
        max: 999999,
        message: 'Current stock must be 0 or greater'
      }
    },
    {
      name: 'min_stock_level',
      label: 'Minimum Stock Level',
      type: 'number' as const,
      required: false,
      placeholder: '0',
      validation: {
        min: 0,
        max: 999999,
        message: 'Minimum stock level must be 0 or greater'
      }
    },
    {
      name: 'supplier_id',
      label: 'Supplier',
      type: 'select' as const,
      required: false,
      placeholder: 'Select a supplier (optional)',
      options: suppliers.map(supplier => ({
        value: supplier.id,
        label: supplier.name
      }))
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6m-6-4h6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Products
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.overview.total_products || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Stock In (Today)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.transactions.stock_in.count || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Stock Out (Today)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.transactions.stock_out.count || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Low Stock Items
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {lowStockProducts.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Levels Overview</h3>
          <StockLevelChart
            data={stockLevelData || { by_category: [], by_status: [] }}
            type="doughnut"
            title=""
            height={300}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Levels by Category</h3>
          <StockLevelChart
            data={stockLevelData || { by_category: [], by_status: [] }}
            type="bar"
            title=""
            height={300}
          />
        </div>
      </div>

      {/* Transaction trends chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Trends (Last 7 Days)</h3>
        <TransactionTrendsChart
          data={transactionTrendsData || {
            period: { start_date: '', end_date: '', days: 7 },
            daily_data: [],
            totals: { stock_in_total: 0, stock_out_total: 0, net_movement: 0, total_value: 0 }
          }}
          title=""
          height={350}
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => setShowAddProductModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Stock In
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Stock Out
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
          </div>
          <div className="p-6">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No low stock items</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">Current: {product.current_stock} | Min: {product.min_stock_level}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Low Stock
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 6h6m-6 4h6m6-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2v-4z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.transaction_type === 'stock_in' ? 'Stock In' : 'Stock Out'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {transaction.quantity} | ${transaction.unit_price}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.transaction_type === 'stock_in'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.transaction_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <FormModal
        isOpen={showAddProductModal}
        onClose={handleCloseModal}
        title="Add New Product"
        onSubmit={handleAddProduct}
        submitText="Add Product"
        cancelText="Cancel"
        loading={isSubmitting}
        size="lg"
      >
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{submitError}</p>
          </div>
        )}

        <Form
          fields={productFormFields}
          onSubmit={handleAddProduct}
          loading={isSubmitting}
          submitText="Add Product"
          layout="grid"
          columns={2}
        />
      </FormModal>
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}