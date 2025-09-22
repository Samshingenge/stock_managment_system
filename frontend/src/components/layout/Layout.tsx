// Main layout component for the Stock Management System

import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  HomeIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChartPieIcon,
  UsersIcon,
  XMarkIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { exportService } from '../../services/export';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Always visible at top */}
      <Header onMenuClick={handleMenuClick} title={title} />

      {/* Main container with sidebar and content */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onClose={handleSidebarClose}
        />

        {/* Main content area */}
        <div className="flex-1 md:ml-0">
          <main className="min-h-[calc(100vh-4rem)]">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Header component (merged from Header.tsx)
interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

function Header({ onMenuClick, title = 'Stock Management System' }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleExcelExport = async () => {
    try {
      // This will export all available data - products, transactions, suppliers, and dashboard stats
      await exportService.exportFullReport(
        {},
        {
          filename: 'stock_management_full_report',
          format: 'excel',
          includeTimestamp: true
        }
      );
    } catch (error) {
      console.error('Excel export error:', error);
      // You could add a toast notification here if you have a notification system
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and title */}
          <div className="flex items-center">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="flex-shrink-0 flex items-center ml-4 md:ml-0">
              <div className="flex items-center">
                <div className="bg-blue-600 rounded-lg p-2 mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6m-6-4h6" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              </div>
            </div>
          </div>

          {/* Right side - Excel Export, Notifications and user menu */}
          <div className="flex items-center space-x-4">
            {/* Excel Export Button */}
            <button
              onClick={handleExcelExport}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              title="Export to Excel"
            >
              <span className="sr-only">Export to Excel</span>
              <DocumentArrowDownIcon className="h-6 w-6" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
                {/* Notification badge */}
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-gray-900">Low stock alert</p>
                          <p className="text-xs text-gray-500">Product XYZ is running low</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-gray-900">New transaction</p>
                          <p className="text-xs text-gray-500">Stock out recorded for Product ABC</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.username || 'User'}
                </span>
                <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400 hidden sm:block" />
              </button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
                      <div className="font-medium text-gray-900">{user?.username}</div>
                      <div className="text-gray-500">{user?.email}</div>
                      <div className="text-xs text-blue-600 mt-1 capitalize">{user?.role}</div>
                    </div>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Cog6ToothIcon className="mr-3 h-4 w-4" />
                      Settings
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
}

// Sidebar component (merged from Sidebar.tsx)

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClose?: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    current: true
  },
  {
    name: 'Products',
    href: '/products',
    icon: CubeIcon,
    current: false,
    badge: '12'
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: ArrowsRightLeftIcon,
    current: false
  },
  {
    name: 'Suppliers',
    href: '/suppliers',
    icon: UsersIcon,
    current: false
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: DocumentTextIcon,
    current: false
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartPieIcon,
    current: false
  }
];

const systemItems = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    current: false
  },
  {
    name: 'Users',
    href: '/users',
    icon: UsersIcon,
    current: false
  }
];

function Sidebar({ isOpen, setIsOpen, onClose }: SidebarProps) {
  const handleNavClick = (href: string) => {
    // Handle navigation here
    console.log('Navigate to:', href);

    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setIsOpen(false);
      onClose?.(); // Call onClose if provided
    }
  };

  const closeSidebar = () => {
    setIsOpen(false);
    onClose?.(); // Call onClose if provided
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed top-0 bottom-0 left-0 z-20 w-64 bg-white shadow-lg border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen || window.innerWidth >= 768
            ? 'translate-x-0'
            : '-translate-x-full'
          }
          md:relative md:translate-x-0 md:z-10 md:shadow-none
        `}
        style={{ display: 'block' }}
        key="main-sidebar"
      >
        {/* Sidebar content */}
        <div className="flex flex-col h-full">
          {/* Header space for desktop, mobile close button for mobile */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 md:border-none">
            <h2 className="text-lg font-semibold text-gray-900 md:hidden">Menu</h2>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 md:hidden"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {/* Main Navigation */}
            <div className="px-3">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      className={`
                        group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md
                        ${item.current
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon
                        className={`
                          mr-3 flex-shrink-0 h-5 w-5
                          ${item.current
                            ? 'text-blue-500'
                            : 'text-gray-400 group-hover:text-gray-500'
                          }
                        `}
                      />
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <span className="ml-3 inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Section */}
            <div className="mt-8 px-3">
              <div className="px-2 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  System
                </h3>
              </div>
              <div className="space-y-1">
                {systemItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      className={`
                        group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md
                        ${item.current
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon
                        className={`
                          mr-3 flex-shrink-0 h-5 w-5
                          ${item.current
                            ? 'text-blue-500'
                            : 'text-gray-400 group-hover:text-gray-500'
                          }
                        `}
                      />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer info */}
            <div className="mt-8 px-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-xs font-medium text-gray-900">Storage Used</p>
                    <div className="mt-1">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">65%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {(isOpen && window.innerWidth < 768) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}

// Simple layout without sidebar for auth pages
export function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 rounded-lg p-3">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6m-6-4h6" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Stock Management System
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}

// Loading layout for initial loading states
export function LoadingLayout({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      {/* Loading spinner */}
      <div className="relative">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-blue-600 rounded-lg p-2">
            <svg className="h-6 w-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6m-6-4h6" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Loading message */}
      <p className="mt-6 text-lg text-gray-600 animate-pulse">{message}</p>
      
      {/* Loading dots */}
      <div className="flex space-x-1 mt-4">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}

// Error layout for error states
export function ErrorLayout({
  title = 'Something went wrong',
  message = 'Please try again later',
  onRetry,
  showHomeButton = true
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}) {
  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        {/* Error title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        
        {/* Error message */}
        <p className="text-gray-600 mb-6">{message}</p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Try Again
            </button>
          )}
          
          {showHomeButton && (
            <button
              onClick={handleGoHome}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 404 Not Found layout
export function NotFoundLayout() {
  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        
        {/* Content */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoHome}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={handleGoBack}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

// Maintenance layout
export function MaintenanceLayout({ 
  message = 'We\'ll be back soon!',
  description = 'We\'re performing scheduled maintenance. Please check back later.'
}: { 
  message?: string;
  description?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Maintenance icon */}
        <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{message}</h1>
        <p className="text-gray-600 mb-6">{description}</p>
        
        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-yellow-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        
        <p className="text-sm text-gray-500">
          Estimated completion: 30 minutes
        </p>
      </div>
    </div>
  );
}

export default Layout;