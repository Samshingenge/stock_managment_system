# ⚛️ React Component Specifications - Stock Management System

## Complete Frontend Architecture Preserving Current Design

This document provides detailed specifications for building the React.js frontend that maintains the exact UI/UX design and functionality of the current static system.

---

## 🏗️ Project Structure & Setup

### Initial Setup Commands

```bash
# Create React app with TypeScript
npx create-react-app stock-management-frontend --template typescript
cd stock-management-frontend

# Install core dependencies
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install react-router-dom
npm install axios
npm install react-hook-form @hookform/resolvers yup
npm install date-fns
npm install react-hot-toast
npm install lucide-react
npm install clsx
npm install react-chartjs-2 chart.js
npm install xlsx file-saver

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install development dependencies
npm install -D @types/file-saver
npm install -D eslint-plugin-react-hooks
npm install -D prettier eslint-config-prettier
```

### Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── LoadingSpinner.tsx
│   │   ├── Toast.tsx
│   │   ├── Modal.tsx
│   │   ├── Pagination.tsx
│   │   ├── SearchInput.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ConfirmDialog.tsx
│   ├── layout/
│   │   ├── Navigation.tsx
│   │   ├── Layout.tsx
│   │   └── QuickActions.tsx
│   ├── dashboard/
│   │   ├── DashboardStats.tsx
│   │   ├── StockLevelsChart.tsx
│   │   ├── TransactionTrendsChart.tsx
│   │   ├── RecentTransactions.tsx
│   │   └── LowStockAlerts.tsx
│   ├── products/
│   │   ├── ProductList.tsx
│   │   ├── ProductTable.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductModal.tsx
│   │   ├── ProductFilters.tsx
│   │   └── ProductCard.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   ├── TransactionTable.tsx
│   │   ├── StockInModal.tsx
│   │   ├── StockOutModal.tsx
│   │   ├── TransactionForm.tsx
│   │   └── TransactionHistory.tsx
│   ├── suppliers/
│   │   ├── SupplierList.tsx
│   │   ├── SupplierTable.tsx
│   │   ├── SupplierForm.tsx
│   │   ├── SupplierModal.tsx
│   │   └── SupplierCard.tsx
│   ├── reports/
│   │   ├── ReportsPage.tsx
│   │   ├── InventoryValueChart.tsx
│   │   ├── StockMovementChart.tsx
│   │   ├── ExportControls.tsx
│   │   └── ReportFilters.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Textarea.tsx
│       └── Card.tsx
├── hooks/
│   ├── useApi.ts
│   ├── useProducts.ts
│   ├── useTransactions.ts
│   ├── useSuppliers.ts
│   ├── useDashboard.ts
│   ├── useAuth.ts
│   └── useExport.ts
├── services/
│   ├── api.ts
│   ├── productService.ts
│   ├── transactionService.ts
│   ├── supplierService.ts
│   ├── dashboardService.ts
│   └── authService.ts
├── types/
│   ├── api.ts
│   ├── product.ts
│   ├── transaction.ts
│   ├── supplier.ts
│   ├── dashboard.ts
│   └── auth.ts
├── utils/
│   ├── formatters.ts
│   ├── validation.ts
│   ├── constants.ts
│   ├── exportUtils.ts
│   └── helpers.ts
├── contexts/
│   ├── AuthContext.tsx
│   ├── ToastContext.tsx
│   └── AppContext.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── Transactions.tsx
│   ├── Suppliers.tsx
│   ├── Reports.tsx
│   └── Login.tsx
├── styles/
│   ├── globals.css
│   └── components.css
├── App.tsx
├── index.tsx
└── setupTests.ts
```

---

## 🎨 Exact Design Preservation

### Tailwind Configuration (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe', 
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          50: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        danger: {
          50: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        warning: {
          50: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-50px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
```

### Global Styles (src/styles/globals.css)

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Custom CSS preserving exact design */
:root {
  --primary-color: #3B82F6;
  --secondary-color: #6B7280;
  --success-color: #10B981;
  --warning-color: #F59E0B;
  --danger-color: #EF4444;
  --light-bg: #F9FAFB;
  --border-color: #E5E7EB;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Status badges (exact from current design) */
.status-badge {
  @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide;
}

.status-active {
  @apply bg-green-100 text-green-800;
}

.status-inactive {
  @apply bg-yellow-100 text-yellow-800;
}

.status-discontinued {
  @apply bg-red-100 text-red-800;
}

.status-low-stock {
  @apply bg-yellow-100 text-yellow-800 animate-pulse;
}

/* Transaction type badges */
.transaction-in {
  @apply bg-green-100 text-green-800;
}

.transaction-out {
  @apply bg-red-100 text-red-800;
}

.transaction-adjustment {
  @apply bg-blue-100 text-blue-800;
}

/* Table styles */
.table-row-hover {
  @apply hover:bg-gray-50 transition-colors;
}

/* Card hover effects */
.card-hover {
  @apply hover:-translate-y-1 hover:shadow-lg transition-all duration-200;
}

/* Modal animations */
.modal-overlay {
  @apply backdrop-blur-sm;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  animation: slideIn 0.3s ease-out;
}

/* Form styles */
.form-group {
  @apply mb-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
         focus:ring-primary-500 focus:border-primary-500 transition-colors;
}

.form-input:focus {
  @apply outline-none ring-2 ring-primary-500 ring-opacity-20;
}

.form-select {
  @apply form-input bg-white bg-no-repeat bg-right pr-10;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-size: 1.5em 1.5em;
  background-position: right 0.5rem center;
}

/* Button styles */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md 
         font-medium transition-colors focus:outline-none focus:ring-2 
         focus:ring-primary-500 focus:ring-opacity-50;
}

.btn-success {
  @apply bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded-md 
         font-medium transition-colors;
}

.btn-danger {
  @apply bg-danger-600 hover:bg-danger-700 text-white px-4 py-2 rounded-md 
         font-medium transition-colors;
}

.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md 
         font-medium transition-colors;
}

/* Loading states */
.loading-skeleton {
  @apply bg-gray-200 animate-pulse rounded;
}

/* Alert styles */
.alert {
  @apply p-4 rounded-md mb-4;
}

.alert-success {
  @apply bg-green-50 border border-green-200 text-green-800;
}

.alert-warning {
  @apply bg-yellow-50 border border-yellow-200 text-yellow-800;
}

.alert-error {
  @apply bg-red-50 border border-red-200 text-red-800;
}

.alert-info {
  @apply bg-blue-50 border border-blue-200 text-blue-800;
}
```

---

## 🧩 Core Components

### App.tsx (Main Application Component)

```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/transactions" element={<Transactions />} />
                          <Route path="/suppliers" element={<Suppliers />} />
                          <Route path="/reports" element={<Reports />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
              
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: 'bg-white shadow-lg border',
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </div>
          </Router>
          
          {/* React Query DevTools */}
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
```

### Layout/Navigation.tsx (Preserving Exact Design)

```tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Bell, FileDown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';
import { useExport } from '../../hooks/useExport';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data: stats } = useDashboard();
  const { exportAllData } = useExport();

  const handleExport = () => {
    exportAllData();
  };

  const handleAlerts = () => {
    // Show low stock alerts (implement modal or redirect)
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Package className="text-blue-600 text-2xl mr-3" />
            <h1 className="text-xl font-bold text-gray-900">
              Stock Management System
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Export Button */}
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FileDown size={16} />
              <span>Export Excel</span>
            </button>

            {/* Alerts Button */}
            <div className="relative">
              <button
                onClick={handleAlerts}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell size={18} />
                {stats?.lowStockCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.lowStockCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                Welcome, {user?.username}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
```

### Layout/Layout.tsx (Main Layout Component)

```tsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import TabNavigation from './TabNavigation';
import QuickActions from './QuickActions';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show Quick Actions only on dashboard */}
        {isDashboard && <QuickActions />}
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <TabNavigation />
          
          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
```

### Layout/TabNavigation.tsx (Exact Tab Design)

```tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  ArrowUpDown, 
  Truck, 
  FileBarChart 
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <BarChart3 className="w-4 h-4 mr-2" />,
  },
  {
    id: 'products',
    label: 'Products',
    path: '/products',
    icon: <Package className="w-4 h-4 mr-2" />,
  },
  {
    id: 'transactions',
    label: 'Transactions',
    path: '/transactions',
    icon: <ArrowUpDown className="w-4 h-4 mr-2" />,
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    path: '/suppliers',
    icon: <Truck className="w-4 h-4 mr-2" />,
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: <FileBarChart className="w-4 h-4 mr-2" />,
  },
];

const TabNavigation: React.FC = () => {
  const location = useLocation();
  
  // Normalize dashboard paths
  const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname;

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;
```

### Common/Modal.tsx (Preserving Modal Design)

```tsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modalContent = (
    <div className="modal-overlay fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`modal-content bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-screen overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
```

---

## 📊 Dashboard Components

### Dashboard/DashboardStats.tsx (Exact KPI Cards)

```tsx
import React from 'react';
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import LoadingSpinner from '../common/LoadingSpinner';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  loading = false 
}) => (
  <div className="bg-white rounded-lg shadow p-6 card-hover">
    <div className="flex items-center">
      <div className={`flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {loading ? (
          <div className="loading-skeleton h-8 w-16 rounded"></div>
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  </div>
);

const DashboardStats: React.FC = () => {
  const { data: stats, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-600">Error loading dashboard statistics</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Products"
        value={stats?.overview?.totalProducts || 0}
        icon={<Package className="text-2xl" />}
        color="text-blue-500"
        loading={isLoading}
      />
      <StatsCard
        title="Stock In (Today)"
        value={stats?.transactions?.stock_in?.count || 0}
        icon={<TrendingUp className="text-2xl" />}
        color="text-green-500"
        loading={isLoading}
      />
      <StatsCard
        title="Stock Out (Today)"
        value={stats?.transactions?.stock_out?.count || 0}
        icon={<TrendingDown className="text-2xl" />}
        color="text-red-500"
        loading={isLoading}
      />
      <StatsCard
        title="Low Stock Items"
        value={stats?.alerts?.low_stock || 0}
        icon={<AlertTriangle className="text-2xl" />}
        color="text-yellow-500"
        loading={isLoading}
      />
    </div>
  );
};

export default DashboardStats;
```

### Dashboard/StockLevelsChart.tsx (Preserving Chart Design)

```tsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency } from '../../utils/formatters';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const StockLevelsChart: React.FC = () => {
  const { data: chartData, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 h-80 flex items-center justify-center">
        <div className="loading-skeleton w-64 h-64 rounded-full"></div>
      </div>
    );
  }

  const stockData = chartData?.chart_data?.stock_levels?.by_category || [];

  if (stockData.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 h-80 flex items-center justify-center">
        <p className="text-gray-500">No stock data available</p>
      </div>
    );
  }

  // Generate colors (same as original)
  const generateColors = (count: number) => {
    const hues = [];
    for (let i = 0; i < count; i++) {
      hues.push((i * 360) / count);
    }
    return hues.map(hue => `hsl(${hue}, 70%, 50%)`);
  };

  const colors = generateColors(stockData.length);

  const data = {
    labels: stockData.map((item: any) => item.category),
    datasets: [
      {
        label: 'Stock by Category',
        data: stockData.map((item: any) => item.total_stock),
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('50%', '40%')),
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const categoryData = stockData[dataIndex];
            return [
              `${context.label}: ${context.parsed} units`,
              `Products: ${categoryData.product_count}`,
              `Value: ${formatCurrency(categoryData.total_value)}`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Stock Levels Overview
      </h3>
      <div style={{ height: '300px' }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default StockLevelsChart;
```

---

## 📦 Product Components

### Products/ProductList.tsx (Main Products Page)

```tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import ProductTable from './ProductTable';
import ProductModal from './ProductModal';
import ProductFilters from './ProductFilters';
import { Product } from '../../types/product';

const ProductList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1,
    per_page: 20,
  });

  const { 
    data: productsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useProducts(filters);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Product Inventory</h3>
        <button
          onClick={handleAddProduct}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <ProductFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          Error loading products. Please try again.
        </div>
      )}

      {/* Products Table */}
      <ProductTable
        products={productsResponse?.items || []}
        isLoading={isLoading}
        onEdit={handleEditProduct}
        pagination={{
          page: productsResponse?.page || 1,
          pages: productsResponse?.pages || 1,
          total: productsResponse?.total || 0,
          per_page: productsResponse?.per_page || 20,
        }}
        onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={editingProduct}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default ProductList;
```

### Products/ProductTable.tsx (Exact Table Design)

```tsx
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Product } from '../../types/product';
import { formatCurrency } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';
import Pagination from '../common/Pagination';
import { useDeleteProduct } from '../../hooks/useProducts';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  pagination: {
    page: number;
    pages: number;
    total: number;
    per_page: number;
  };
  onPageChange: (page: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  onEdit,
  pagination,
  onPageChange,
}) => {
  const deleteProduct = useDeleteProduct();

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}? This action cannot be undone.`)) {
      try {
        await deleteProduct.mutateAsync(product.id);
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="loading-skeleton h-16 w-full rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-500">
          <Package className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg">No products found</p>
          <p className="text-sm">Get started by adding your first product</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const isLowStock = (product.current_stock || 0) <= (product.min_stock_level || 0);
              
              return (
                <tr key={product.id} className="table-row-hover">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sku || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.current_stock || 0}
                    </div>
                    {isLowStock && (
                      <div className="text-xs text-red-500 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(product.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={product.status || 'active'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      disabled={deleteProduct.isPending}
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ProductTable;
```

---

## 📊 Transaction Components

### Transactions/StockInModal.tsx (Preserving Modal Design)

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useProducts } from '../../hooks/useProducts';
import { useStockIn } from '../../hooks/useTransactions';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StockInFormData {
  product_id: string;
  quantity: number;
  unit_price: number;
  reference_number?: string;
  notes?: string;
}

const schema = yup.object({
  product_id: yup.string().required('Product is required'),
  quantity: yup.number().positive('Quantity must be positive').required('Quantity is required'),
  unit_price: yup.number().min(0, 'Unit price must be 0 or greater').required('Unit price is required'),
  reference_number: yup.string(),
  notes: yup.string(),
});

const StockInModal: React.FC<StockInModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { data: productsResponse } = useProducts({ status: 'active' });
  const stockInMutation = useStockIn();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<StockInFormData>({
    resolver: yupResolver(schema),
  });

  const watchedQuantity = watch('quantity', 0);
  const watchedUnitPrice = watch('unit_price', 0);
  const watchedProductId = watch('product_id');

  // Calculate total amount
  const totalAmount = watchedQuantity * watchedUnitPrice;

  // Update unit price when product changes
  React.useEffect(() => {
    if (watchedProductId && productsResponse?.items) {
      const selectedProduct = productsResponse.items.find(p => p.id === watchedProductId);
      if (selectedProduct?.unit_price) {
        setValue('unit_price', selectedProduct.unit_price);
      }
    }
  }, [watchedProductId, productsResponse?.items, setValue]);

  const onSubmit = async (data: StockInFormData) => {
    try {
      await stockInMutation.mutateAsync(data);
      reset();
      onSuccess();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Stock In"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Product Selection */}
        <div className="form-group">
          <label className="form-label" htmlFor="product_id">
            Product *
          </label>
          <select
            {...register('product_id')}
            id="product_id"
            className={`form-select ${errors.product_id ? 'border-red-500' : ''}`}
          >
            <option value="">Select Product</option>
            {productsResponse?.items?.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku || 'No SKU'})
              </option>
            ))}
          </select>
          {errors.product_id && (
            <p className="text-red-500 text-xs mt-1">{errors.product_id.message}</p>
          )}
        </div>

        {/* Quantity */}
        <div className="form-group">
          <label className="form-label" htmlFor="quantity">
            Quantity *
          </label>
          <input
            {...register('quantity')}
            type="number"
            id="quantity"
            min="1"
            step="1"
            className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>
          )}
        </div>

        {/* Unit Price */}
        <div className="form-group">
          <label className="form-label" htmlFor="unit_price">
            Unit Price *
          </label>
          <input
            {...register('unit_price')}
            type="number"
            id="unit_price"
            min="0"
            step="0.01"
            className={`form-input ${errors.unit_price ? 'border-red-500' : ''}`}
          />
          {errors.unit_price && (
            <p className="text-red-500 text-xs mt-1">{errors.unit_price.message}</p>
          )}
        </div>

        {/* Reference Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="reference_number">
            Reference Number
          </label>
          <input
            {...register('reference_number')}
            type="text"
            id="reference_number"
            placeholder="Invoice/PO Number"
            className="form-input"
          />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label" htmlFor="notes">
            Notes
          </label>
          <textarea
            {...register('notes')}
            id="notes"
            rows={3}
            placeholder="Additional notes..."
            className="form-input"
          />
        </div>

        {/* Total Amount Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total Amount:</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={stockInMutation.isPending}
            className="btn-success flex items-center space-x-2"
          >
            {stockInMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            <span>Process Stock In</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StockInModal;
```

---

## 🎨 Chart Components with Exact Design

### Charts/TransactionTrendsChart.tsx

```tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { useDashboard } from '../../hooks/useDashboard';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TransactionTrendsChart: React.FC = () => {
  const { data: chartData, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 h-80 flex items-center justify-center">
        <div className="loading-skeleton w-full h-full rounded"></div>
      </div>
    );
  }

  const trendsData = chartData?.chart_data?.transaction_trends?.daily_data || [];

  if (trendsData.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 h-80 flex items-center justify-center">
        <p className="text-gray-500">No transaction data available</p>
      </div>
    );
  }

  const labels = trendsData.map((item: any) => 
    new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const stockInData = trendsData.map((item: any) => item.stock_in.quantity || 0);
  const stockOutData = trendsData.map((item: any) => item.stock_out.quantity || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Stock In',
        data: stockInData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Stock Out', 
        data: stockOutData,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} units`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
    },
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Transaction Trends (Last 7 Days)
      </h3>
      <div style={{ height: '300px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default TransactionTrendsChart;
```

This comprehensive specification provides everything needed to build the React frontend that preserves the exact design and functionality of the current system. The component structure follows React best practices while maintaining the original UI/UX design elements, animations, and user interactions.