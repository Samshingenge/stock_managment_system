// Sidebar component for the Stock Management System

import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CubeIcon as CubeIconSolid,
  ArrowPathIcon as ArrowPathIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  UserGroupIcon as UserGroupIconSolid
} from '@heroicons/react/24/solid';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid: React.ComponentType<{ className?: string }>;
  current: boolean;
  badge?: string;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(false);
  const [showProductsOverview, setShowProductsOverview] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close products overview when navigating to different page
  useEffect(() => {
    if (showProductsOverview && !location.pathname.startsWith('/products')) {
      setShowProductsOverview(false);
    }
  }, [location.pathname, showProductsOverview]);

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Products',
      href: '/products',
      icon: CubeIcon,
      iconSolid: CubeIconSolid,
      current: location.pathname.startsWith('/products') || showProductsOverview,
      badge: '12'
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: ArrowPathIcon,
      iconSolid: ArrowPathIconSolid,
      current: location.pathname.startsWith('/transactions')
    },
    {
      name: 'Suppliers',
      href: '/suppliers',
      icon: BuildingStorefrontIcon,
      iconSolid: BuildingStorefrontIconSolid,
      current: location.pathname.startsWith('/suppliers')
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ClipboardDocumentListIcon,
      iconSolid: ClipboardDocumentListIconSolid,
      current: location.pathname.startsWith('/reports')
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
      current: location.pathname.startsWith('/analytics')
    },
  ];

  const secondaryNavigation: NavigationItem[] = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
      current: location.pathname === '/settings'
    },
    {
      name: 'Users',
      href: '/users',
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
      current: location.pathname === '/users'
    },
  ];

  const handleNavClick = () => {
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  const handleProductsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Products button clicked, current state:', showProductsOverview);
    setShowProductsOverview(!showProductsOverview);
    handleNavClick();
  };

  // Update Products navigation item current state
  const updatedNavigation = React.useMemo(() => {
    return navigation.map(item => {
      if (item.name === 'Products') {
        const isCurrent = location.pathname.startsWith('/products') || showProductsOverview;
        return {
          ...item,
          current: isCurrent
        };
      }
      return item;
    });
  }, [location.pathname, showProductsOverview]);

  const handleOverlayClick = () => {
    if (showProductsOverview) {
      setShowProductsOverview(false);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {(isOpen || showProductsOverview) && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={handleOverlayClick} />
        </div>
      )}

      {/* Sidebar - Only render once */}
      <div
        className={`
          ${isDesktop
            ? 'sticky top-0 h-screen w-64 bg-white shadow-lg z-40'
            : isOpen
              ? 'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0'
              : 'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out -translate-x-full'
          }
        `}
        style={{ display: 'block' }}
        key="main-sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Main Navigation */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Main
              </h3>
              <div className="space-y-1">
                {updatedNavigation.map((item) => {
                  const IconComponent = item.current ? item.iconSolid : item.icon;
                  if (item.name === 'Products') {
                    return (
                      <button
                        key={item.name}
                        onClick={handleProductsClick}
                        data-testid="products-button"
                        type="button"
                        className={`
                          group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 w-full text-left
                          ${item.current
                            ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <IconComponent
                          className={`
                            mr-3 h-5 w-5 flex-shrink-0
                            ${item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                          `}
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span className={`
                            inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full
                            ${item.current ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  }
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={handleNavClick}
                      className={({ isActive }) => `
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                        ${isActive
                          ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <IconComponent
                        className={`
                          mr-3 h-5 w-5 flex-shrink-0
                          ${item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                        `}
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className={`
                          inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full
                          ${item.current ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Secondary Navigation */}
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                System
              </h3>
              <div className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const IconComponent = item.current ? item.iconSolid : item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={handleNavClick}
                      className={({ isActive }) => `
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                        ${isActive
                          ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <IconComponent
                        className={`
                          mr-3 h-5 w-5 flex-shrink-0
                          ${item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                        `}
                      />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Products Overview Panel */}
          {showProductsOverview && (
            <div className="px-4 pb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-blue-900">Products Overview</h4>
                  <button
                    onClick={() => setShowProductsOverview(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Total Products</span>
                    <span className="font-semibold text-blue-900">24</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Low Stock</span>
                    <span className="font-semibold text-red-600">3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Out of Stock</span>
                    <span className="font-semibold text-red-600">1</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Categories</span>
                    <span className="font-semibold text-blue-900">8</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-200">
                  <div className="space-y-2">
                    <button className="w-full text-left px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 rounded transition-colors">
                      View All Products
                    </button>
                    <button className="w-full text-left px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 rounded transition-colors">
                      Add New Product
                    </button>
                    <button className="w-full text-left px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 rounded transition-colors">
                      Low Stock Alerts
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default Sidebar;