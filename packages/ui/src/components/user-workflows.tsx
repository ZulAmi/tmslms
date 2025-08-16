'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Badge } from './badge';
import { Input } from './input';
import { cn } from '../lib/utils';

// User Workflow Components for Complete UX System

// Dashboard Layout with Sidebar Navigation
interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  navigation: NavItem[];
  breadcrumbs?: BreadcrumbItem[];
  notifications?: Notification[];
  quickActions?: QuickAction[];
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  items?: NavItem[];
  badge?: string | number;
  active?: boolean;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  shortcut?: string;
  onClick: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function DashboardLayout({
  children,
  user,
  navigation,
  breadcrumbs = [],
  notifications = [],
  quickActions = [],
  className,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className={cn('h-screen flex bg-background', className)}>
      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'bg-card border-r border-border transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TMS</span>
          </div>
          {sidebarOpen && <span className="font-bold text-lg">TMSLMS</span>}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              collapsed={!sidebarOpen}
            />
          ))}
        </nav>

        {/* User Profile */}
        {user && (
          <UserProfile
            user={user}
            collapsed={!sidebarOpen}
            notifications={notifications.length}
          />
        )}

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full"
          >
            <svg
              className={cn(
                'h-4 w-4 transition-transform',
                sidebarOpen ? 'rotate-180' : ''
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <GlobalSearch />

            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <QuickActionMenu actions={quickActions} />
            )}

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5-5 5-5"
                  />
                </svg>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center text-xs text-white">
                    {notifications.filter((n) => !n.read).length}
                  </div>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 z-50">
                  <NotificationCenter
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

// Navigation Item Component
function NavigationItem({
  item,
  collapsed,
  level = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.items && item.items.length > 0;

  return (
    <div>
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center justify-between p-2 text-left rounded-md transition-colors',
          level > 0 && 'ml-4 pl-4',
          item.active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        )}
      >
        <div className="flex items-center space-x-3">
          {item.icon && (
            <span className="h-5 w-5 flex-shrink-0">{item.icon}</span>
          )}
          {!collapsed && (
            <span className="font-medium truncate">{item.label}</span>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center space-x-2">
            {item.badge && (
              <Badge variant="secondary" size="sm">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <svg
                className={cn(
                  'h-4 w-4 transition-transform',
                  expanded && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </div>
        )}
      </button>

      {!collapsed && hasChildren && expanded && (
        <div className="mt-1 space-y-1">
          {item.items!.map((subItem) => (
            <NavigationItem
              key={subItem.id}
              item={subItem}
              collapsed={collapsed}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// User Profile Component
function UserProfile({
  user,
  collapsed,
  notifications,
}: {
  user: DashboardLayoutProps['user'];
  collapsed: boolean;
  notifications: number;
}) {
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  return (
    <div className="p-2 border-t border-border relative">
      <button
        onClick={() => !collapsed && setShowMenu(!showMenu)}
        className="w-full flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors"
      >
        <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 text-left truncate">
              <div className="font-medium text-sm">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.role}</div>
            </div>
            <div className="flex items-center space-x-1">
              {notifications > 0 && (
                <div className="h-2 w-2 bg-destructive rounded-full" />
              )}
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </>
        )}
      </button>

      {showMenu && !collapsed && (
        <Card className="absolute bottom-full left-2 right-2 mb-2 p-1">
          <button className="w-full p-2 text-left text-sm hover:bg-accent rounded-md flex items-center space-x-2">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Profile</span>
          </button>
          <button className="w-full p-2 text-left text-sm hover:bg-accent rounded-md flex items-center space-x-2">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Settings</span>
          </button>
          <div className="border-t border-border my-1" />
          <button className="w-full p-2 text-left text-sm hover:bg-accent rounded-md flex items-center space-x-2 text-destructive">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sign Out</span>
          </button>
        </Card>
      )}
    </div>
  );
}

// Breadcrumb Component
function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && (
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          {item.current ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}

// Global Search Component
function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="relative w-80">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, users, content..."
          className="pl-10 pr-4"
        />
      </div>
    </div>
  );
}

// Quick Action Menu
function QuickActionMenu({ actions }: { actions: QuickAction[] }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setShowMenu(!showMenu)}>
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </Button>

      {showMenu && (
        <Card className="absolute top-full right-0 mt-2 w-64 p-2 z-50">
          <div className="space-y-1">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  action.onClick();
                  setShowMenu(false);
                }}
                className="w-full p-3 text-left hover:bg-accent rounded-md transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-5 w-5 text-primary">{action.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{action.label}</div>
                    {action.description && (
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    )}
                  </div>
                  {action.shortcut && (
                    <Badge variant="outline" size="sm" className="text-xs">
                      {action.shortcut}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Notification Center
function NotificationCenter({
  notifications,
  onClose,
}: {
  notifications: Notification[];
  onClose: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="w-96 max-h-96 overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" size="sm">
                {unreadCount}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <div className="text-sm">No notifications</div>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 hover:bg-accent/50 transition-colors',
                  !notification.read &&
                    'bg-primary/5 border-l-4 border-l-primary'
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
