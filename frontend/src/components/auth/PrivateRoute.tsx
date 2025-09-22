// Private route component for protecting authenticated pages

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layout, LoadingLayout } from '../layout/Layout';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'viewer';
  requiredPermission?: string;
}

export function PrivateRoute({
  children,
  requiredRole,
  requiredPermission
}: PrivateRouteProps) {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth is initializing
  if (!isInitialized) {
    return <LoadingLayout message="Initializing application..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Layout>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have the required role ({requiredRole}) to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Check permission-based access
  if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
    return (
      <Layout>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have the required permission ({requiredPermission}) to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Render children if all checks pass
  return <Layout>{children}</Layout>;
}

// Higher-order component version for class components
export function withPrivateRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: 'admin' | 'user' | 'viewer';
    requiredPermission?: string;
  }
) {
  return function PrivateRouteWrapper(props: P) {
    return (
      <PrivateRoute
        requiredRole={options?.requiredRole}
        requiredPermission={options?.requiredPermission}
      >
        <Component {...props} />
      </PrivateRoute>
    );
  };
}

// Admin-only route component
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute requiredRole="admin">
      {children}
    </PrivateRoute>
  );
}

// User route component (admin or user role)
export function UserRoute({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute requiredRole="user">
      {children}
    </PrivateRoute>
  );
}

// Viewer route component (any authenticated user)
export function ViewerRoute({ children }: { children: React.ReactNode }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}

export default PrivateRoute;