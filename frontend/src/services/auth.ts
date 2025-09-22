// Authentication service for the Stock Management System

import { config } from '../utils';
import { apiService } from './api';
import type { ApiResponse } from '../types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

class AuthService {
  private readonly TOKEN_KEY = config.tokenKey;
  private readonly USER_KEY = 'user';

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        const { access_token, user } = response.data;

        // Store token and user data
        this.setToken(access_token);
        this.setUser(user);

        return {
          access_token,
          token_type: 'bearer',
          user,
        };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local storage
      this.clearAuthData();
    }
  }

  // Refresh token
  async refreshToken(): Promise<string> {
    try {
      const response = await apiService.refreshToken();

      if (response.success && response.data) {
        const { access_token } = response.data;
        this.setToken(access_token);
        return access_token;
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Set token in localStorage
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Get stored user data
  getUser(): AuthUser | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Set user data in localStorage
  setUser(user: AuthUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Clear all authentication data
  clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user?.permissions?.includes(permission) || false;
  }

  // Check if user has role
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  // Get authorization headers for API requests
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }

  // Initialize auth state from localStorage
  initializeAuth(): void {
    const token = this.getToken();
    const user = this.getUser();

    if (token && user) {
      // Validate token by making a test request
      this.validateToken().catch(() => {
        // If validation fails, clear auth data
        this.clearAuthData();
      });
    }
  }

  // Validate current token
  async validateToken(): Promise<boolean> {
    try {
      const response = await apiService.authenticatedRequest<{ valid: boolean }>('/auth/validate');
      return response?.valid || false;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.getUser();
  }

  // Update user profile
  async updateProfile(userData: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const response = await apiService.authenticatedRequest<ApiResponse<AuthUser>>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (response.success && response.data) {
        this.setUser(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(data: {
    current_password: string;
    new_password: string;
  }): Promise<void> {
    try {
      const response = await apiService.authenticatedRequest<ApiResponse<{ message: string }>>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(`${config.apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Password reset request failed');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(data: {
    token: string;
    new_password: string;
  }): Promise<void> {
    try {
      const response = await fetch(`${config.apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
}

// Create and export auth service instance
export const authService = new AuthService();
export default authService;