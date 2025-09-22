// Sidebar component for the Stock Management System

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
      current: location.pathname.startsWith('/products'),
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

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
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
                {navigation.map((item) => {
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

        </div>
      </div>
    </>
  );
}

export default Sidebar;