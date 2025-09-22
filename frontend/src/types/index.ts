// Core type definitions for the Stock Management System

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  description?: string;
  unit_price: number;
  min_stock_level: number;
  current_stock: number;
  supplier_id?: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
  inventory_value?: number;
  is_low_stock?: boolean;
  supplier?: Supplier;
  recent_transactions?: Transaction[];
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  product_count?: number;
  total_transactions?: number;
  total_value?: number;
  products?: Product[];
  recent_transactions?: Transaction[];
  statistics?: SupplierStatistics;
}

export interface SupplierStatistics {
  total_products: number;
  active_products: number;
  total_transactions: number;
  total_value_last_30_days: number;
  average_order_value: number;
}

export interface Transaction {
  id: string;
  product_id: string;
  transaction_type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity: number;
  unit_price: number;
  total_amount: number;
  reference_number?: string;
  notes?: string;
  created_by: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface DashboardStats {
  overview: {
    total_products: number;
    active_products: number;
    total_suppliers: number;
    active_suppliers: number;
  };
  inventory: {
    total_inventory_value: number;
    total_stock_units: number;
    low_stock_items: number;
    out_of_stock_items: number;
    categories: Record<string, {
      count: number;
      value: number;
    }>;
  };
  transactions: {
    period: string;
    stock_in: {
      count: number;
      quantity: number;
      value: number;
    };
    stock_out: {
      count: number;
      quantity: number;
      value: number;
    };
    net_movement: {
      quantity: number;
      value: number;
    };
  };
  alerts: {
    low_stock: number;
    out_of_stock: number;
    high_value_transactions: number;
    new_products_week: number;
  };
}

export interface ChartData {
  stock_levels: {
    by_category: Array<{
      category: string;
      total_stock: number;
      total_value: number;
      product_count: number;
    }>;
    by_status: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
  };
  transaction_trends: {
    period: {
      start_date: string;
      end_date: string;
      days: number;
    };
    daily_data: Array<{
      date: string;
      stock_in: {
        count: number;
        quantity: number;
        value: number;
      };
      stock_out: {
        count: number;
        quantity: number;
        value: number;
      };
      net_movement: number;
      net_value: number;
    }>;
    totals: {
      stock_in_total: number;
      stock_out_total: number;
      net_movement: number;
      total_value: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }> | null;
  metadata: {
    timestamp: string;
    request_id?: string;
    version?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
  summary?: Record<string, any>;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  supplier_id?: string;
  low_stock_only?: boolean;
  low_stock?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
  limit?: number;
  date_from?: string;
  date_to?: string;
  transaction_type?: string;
  product_id?: string;
}

export interface ExportOptions {
  report_type: 'inventory' | 'transactions' | 'suppliers' | 'summary';
  format: 'excel' | 'csv' | 'pdf';
  filters?: Record<string, any>;
  options?: {
    include_charts?: boolean;
    include_summary?: boolean;
    email_delivery?: {
      enabled: boolean;
      recipients: string[];
    };
  };
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => any;
  width?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

// Chart configuration types
export interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  data: any;
  options: Record<string, any>;
}

// Export data types
export interface ExportData {
  products: Product[];
  transactions: Transaction[];
  suppliers: Supplier[];
  summary: DashboardStats;
  charts: ChartData;
  generated_at: string;
  generated_by: string;
}