// Utility functions for the Stock Management System

// Environment configuration
export const config = {
  apiUrl: 'http://localhost:8000/api',
  wsUrl: 'ws://localhost:8000/ws',
  appName: 'Stock Management System',
  version: '1.0.0',
  environment: 'development',
  tokenKey: 'stock_management_token',
  tokenExpireMinutes: 30,
  defaultPageSize: 20,
  maxPageSize: 100,
  minPageSize: 10,
  cacheTimeoutMinutes: 5,
  maxCacheSize: 100,
  enableDebug: true,
  enableAnalytics: false,
  enableNotifications: true,
  enableReduxDevtools: true,
  enableReactQueryDevtools: true,
  exportFilenamePrefix: 'Stock_Management_Export',
  exportDateFormat: 'YYYY-MM-DD',
  chartColors: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'],
};

// Date and time utilities
export const formatDate = (date: string | number | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | number | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: string | number | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Currency formatting
export const formatCurrency = (amount: number | string, currency = 'USD'): string => {
  if (amount === null || amount === undefined) return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
};

// Number formatting
export const formatNumber = (num: number | string, decimals = 0): string => {
  if (num === null || num === undefined) return '0';
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

// Parse currency string to number
export const parseCurrency = (currencyString: string): number => {
  if (!currencyString) return 0;
  const cleaned = currencyString.replace(/[$,\s]/g, '');
  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number;
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (direction === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    } else {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
  });
};

export const filterBy = <T>(array: T[], filters: Record<string, any>): T[] => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (filterValue === '' || filterValue === null || filterValue === undefined) {
        return true;
      }

      const itemValue = item[key as keyof T];
      if (typeof filterValue === 'string') {
        return String(itemValue || '').toLowerCase().includes(filterValue.toLowerCase());
      }

      return itemValue === filterValue;
    });
  });
};

export const sumBy = <T>(array: T[], key: keyof T): number => {
  return array.reduce((sum, item) => {
    const value = parseFloat(String(item[key])) || 0;
    return sum + value;
  }, 0);
};

export const countBy = <T>(array: T[], key: keyof T): Record<string, number> => {
  return array.reduce((counts, item) => {
    const value = String(item[key] || 'Unknown');
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
};

// Local storage utilities
export const saveToLocalStorage = (key: string, data: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T = null): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
};

// Generate random colors for charts
export const generateRandomColors = (count: number): string[] => {
  const colors: string[] = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = i * hueStep;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return colors;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// URL utilities
export const getQueryParams = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
};

export const updateURL = (params: Record<string, string | null>): void => {
  const url = new URL(window.location.href);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });

  window.history.replaceState(null, '', url.toString());
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10;
};

export const validateRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

export const validateNumber = (value: any, min?: number, max?: number): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Chart utilities
export const getChartColors = (count: number): string[] => {
  const baseColors = config.chartColors;
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }

  return colors;
};

// Export utilities
export const generateExportFilename = (prefix: string, extension: string): string => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${config.exportFilenamePrefix}_${prefix}_${dateStr}_${timeStr}.${extension}`;
};

// Performance utilities
export const measurePerformance = (name: string, fn: () => void): void => {
  if (config.enableDebug) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

// Accessibility utilities
export const generateId = (prefix = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const focusElement = (selector: string): void => {
  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    element.focus();
  }
};

// Theme utilities
export const isDarkMode = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const getThemeColors = () => {
  return {
    primary: isDarkMode() ? '#3B82F6' : '#3B82F6',
    background: isDarkMode() ? '#1F2937' : '#FFFFFF',
    text: isDarkMode() ? '#F9FAFB' : '#111827',
    border: isDarkMode() ? '#374151' : '#E5E7EB',
  };
};