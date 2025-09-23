// Main App component for the Stock Management System

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute, AdminRoute, UserRoute, ViewerRoute } from './components/auth/PrivateRoute';
import { Layout, SimpleLayout, LoadingLayout } from './components/layout/Layout';

// Import pages (we'll create these next)
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Suppliers from './pages/Suppliers';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <SimpleLayout>
                  <Login />
                </SimpleLayout>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ViewerRoute>
                  
                    <Dashboard />
                  
                </ViewerRoute>
              }
            />

            <Route
              path="/products"
              element={
                <UserRoute>
                  <Layout>
                    <Products />
                  </Layout>
                </UserRoute>
              }
            />

            <Route
              path="/products/:id"
              element={
                <UserRoute>
                  <Layout>
                    <div>Product Detail Page (Coming Soon)</div>
                  </Layout>
                </UserRoute>
              }
            />

            <Route
              path="/transactions"
              element={
                <UserRoute>
                  <Layout>
                    <Transactions />
                  </Layout>
                </UserRoute>
              }
            />

            <Route
              path="/transactions/:id"
              element={
                <UserRoute>
                  <Layout>
                    <div>Transaction Detail Page (Coming Soon)</div>
                  </Layout>
                </UserRoute>
              }
            />

            <Route
              path="/suppliers"
              element={
                <UserRoute>
                  <Layout>
                    <Suppliers />
                  </Layout>
                </UserRoute>
              }
            />

            <Route
              path="/suppliers/:id"
              element={
                <UserRoute>
                  <Layout>
                    <div>Supplier Detail Page (Coming Soon)</div>
                  </Layout>
                </UserRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <UserRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </UserRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <UserRoute>
                  <Layout>
                    <div>Reports Page (Coming Soon)</div>
                  </Layout>
                </UserRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <AdminRoute>
                  
                    <Settings />
                  
                </AdminRoute>
              }
            />

            <Route
              path="/users"
              element={
                <AdminRoute>
                  
                    <div>Users Management Page (Coming Soon)</div>
                  
                </AdminRoute>
              }
            />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Loading component for suspense fallback
export function AppLoading() {
  return <LoadingLayout message="Loading application..." />;
}

// Error boundary component
export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              The application encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default App;