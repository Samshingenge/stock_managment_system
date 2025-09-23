// Products page for the Stock Management System

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from '../components/ui/DataTable';
import { Modal, FormModal, ConfirmationModal } from '../components/ui/Modal';
import { Form } from '../components/ui/Form';
import { productsService } from '../services/products';
import type { Product, TableColumn, FormField, PaginatedResponse } from '../types';

interface ProductFormData {
  name: string;
  sku?: string;
  category?: string;
  description?: string;
  unit_price: number;
  min_stock_level: number;
  current_stock: number;
  supplier_id?: string;
  status: 'active' | 'inactive' | 'discontinued';
}

function ProductsContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'low-stock'>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    category: '',
    description: '',
    unit_price: 0,
    min_stock_level: 0,
    current_stock: 0,
    supplier_id: '',
    status: 'active',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Table columns configuration
  const columns: TableColumn<Product>[] = [
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {row.sku && (
            <div className="text-sm text-gray-500">SKU: {row.sku}</div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => value || <span className="text-gray-400">N/A</span>,
    },
    {
      key: 'current_stock',
      label: 'Stock',
      sortable: true,
      render: (value, row) => {
        const isLowStock = value <= row.min_stock_level;
        return (
          <div className="flex items-center">
            <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
              {value}
            </span>
            {isLowStock && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Low Stock
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'unit_price',
      label: 'Unit Price',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">
          ${Number(value).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          discontinued: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <span className="text-sm text-gray-500">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
  ];

  // Form fields configuration
  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Product Name',
      type: 'text',
      required: true,
      placeholder: 'Enter product name',
    },
    {
      name: 'sku',
      label: 'SKU',
      type: 'text',
      placeholder: 'Enter SKU (optional)',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'text',
      placeholder: 'Enter category',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter product description',
    },
    {
      name: 'unit_price',
      label: 'Unit Price',
      type: 'number',
      required: true,
      placeholder: '0.00',
      validation: {
        min: 0,
        message: 'Unit price must be positive',
      },
    },
    {
      name: 'current_stock',
      label: 'Current Stock',
      type: 'number',
      required: true,
      placeholder: '0',
      validation: {
        min: 0,
        message: 'Stock cannot be negative',
      },
    },
    {
      name: 'min_stock_level',
      label: 'Minimum Stock Level',
      type: 'number',
      required: true,
      placeholder: '0',
      validation: {
        min: 0,
        message: 'Minimum stock level cannot be negative',
      },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'discontinued', label: 'Discontinued' },
      ],
    },
  ];

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getProducts({
        per_page: 50,
        sort_by: 'updated_at',
        sort_order: 'desc',
      });
      setProducts(response.items || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on current filter
  const filteredProducts = useMemo(() => {
    if (filter === 'low-stock') {
      return products.filter(product => product.current_stock <= product.min_stock_level);
    }
    return products;
  }, [products, filter]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle query parameters
  useEffect(() => {
    const createParam = searchParams.get('create');
    const filterParam = searchParams.get('filter');

    if (createParam === 'true') {
      setShowCreateModal(true);
      // Clear the query parameter after opening modal
      setSearchParams(new URLSearchParams());
    }

    if (filterParam === 'low-stock') {
      setFilter('low-stock');
      // Clear the query parameter after applying filter
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams, setSearchParams]);

  // Reset filter when navigating away from products page
  useEffect(() => {
    if (!window.location.pathname.startsWith('/products')) {
      setFilter('all');
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (data: Record<string, any>) => {
    try {
      setFormLoading(true);

      if (editingProduct) {
        // Update existing product
        await productsService.updateProduct(editingProduct.id, data as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
      } else {
        // Create new product
        await productsService.createProduct(data as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
      }

      await fetchProducts();
      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingProduct(null);

      // Refresh products count in sidebar
      window.dispatchEvent(new CustomEvent('refreshProductsCount'));
      setFormData({
        name: '',
        sku: '',
        category: '',
        description: '',
        unit_price: 0,
        min_stock_level: 0,
        current_stock: 0,
        supplier_id: '',
        status: 'active',
      });
    } catch (err) {
      console.error('Error saving product:', err);
      // Error is handled by the service
    } finally {
      setFormLoading(false);
    }
  };

  // Handle form data changes
  const handleFormChange = (data: Record<string, any>) => {
    setFormData(data as ProductFormData);
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      category: product.category || '',
      description: product.description || '',
      unit_price: product.unit_price,
      min_stock_level: product.min_stock_level,
      current_stock: product.current_stock,
      supplier_id: product.supplier_id || '',
      status: product.status,
    });
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      await productsService.deleteProduct(deletingProduct.id);
      await fetchProducts();
      setShowDeleteModal(false);
      setDeletingProduct(null);

      // Refresh products count in sidebar
      window.dispatchEvent(new CustomEvent('refreshProductsCount'));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    try {
      await productsService.bulkDeleteProducts(selectedProducts.map(p => p.id));
      await fetchProducts();
      setSelectedProducts([]);
    } catch (err) {
      console.error('Error bulk deleting products:', err);
    }
  };

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
            <button
              onClick={fetchProducts}
              className="mt-2 text-sm text-red-800 underline hover:text-red-600"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Products table */}
      <DataTable
        data={filteredProducts}
        columns={columns}
        loading={loading}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelect={setSelectedProducts}
        selectedRows={selectedProducts}
        emptyMessage={
          filter === 'low-stock'
            ? "No products with low stock found."
            : "No products found. Create your first product to get started."
        }
      />

      {/* Create Product Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Product"
        onSubmit={handleSubmit}
        loading={formLoading}
        submitText="Create Product"
      >
        <Form
          fields={formFields}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          initialData={formData}
          loading={formLoading}
          layout="grid"
          columns={2}
        />
      </FormModal>

      {/* Edit Product Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        title="Edit Product"
        onSubmit={handleSubmit}
        loading={formLoading}
        submitText="Update Product"
      >
        <Form
          fields={formFields}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          initialData={formData}
          loading={formLoading}
          layout="grid"
          columns={2}
        />
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingProduct(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        type="danger"
      />
    </div>
  );
}

export default function Products() {
  return <ProductsContent />;
}