// Authentication context for the Stock Management System

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import type { AuthUser, LoginCredentials } from '../services/auth';
import type { LoadingState, ErrorState } from '../types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_INITIALIZED' };

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: AuthUser) => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        isInitialized: true,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true,
      };
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'AUTH_INITIALIZED':
      return {
        ...state,
        isInitialized: true,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const user = authService.getUser();

        if (token && user) {
          // Validate token with backend
          dispatch({ type: 'AUTH_START' });
          try {
            await authService.validateToken();
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
          } catch (error) {
            // Token is invalid, clear it
            await authService.logout();
            dispatch({ type: 'AUTH_ERROR', payload: 'Session expired. Please log in again.' });
          }
        } else {
          dispatch({ type: 'AUTH_INITIALIZED' });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'AUTH_INITIALIZED' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const authResponse = await authService.login(credentials);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: authResponse.user
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch({ type: 'AUTH_LOGOUT' });
      console.error('Logout error:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const updateUser = (user: AuthUser) => {
    dispatch({ type: 'AUTH_SUCCESS', payload: user });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<T extends object>(
  Component: React.ComponentType<T>
) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, isInitialized } = useAuth();

    if (!isInitialized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Please log in to continue
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                You need to be authenticated to access this page.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook for checking permissions
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isUser = (): boolean => {
    return hasRole('user');
  };

  const isViewer = (): boolean => {
    return hasRole('viewer');
  };

  return {
    hasPermission,
    hasRole,
    isAdmin,
    isUser,
    isViewer,
    user,
  };
}

export default AuthContext;