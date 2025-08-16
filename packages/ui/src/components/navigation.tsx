import React from 'react';
import { cn } from '../utils';
import { Button } from './button';

// Navigation container
interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'sidebar' | 'topbar' | 'breadcrumb';
}

const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  ({ className, variant = 'topbar', ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        'flex',
        {
          'flex-col w-64 h-full bg-card border-r': variant === 'sidebar',
          'flex-row items-center justify-between w-full h-16 px-4 bg-background border-b':
            variant === 'topbar',
          'flex-row items-center space-x-2 text-sm text-muted-foreground':
            variant === 'breadcrumb',
        },
        className
      )}
      {...props}
    />
  )
);
Navigation.displayName = 'Navigation';

// Navigation item
interface NavigationItemProps extends React.HTMLAttributes<HTMLElement> {
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  href?: string;
  asChild?: boolean;
}

const NavigationItem = React.forwardRef<HTMLElement, NavigationItemProps>(
  (
    {
      className,
      active = false,
      disabled = false,
      icon,
      badge,
      children,
      href,
      asChild = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? 'span' : href ? 'a' : 'button';

    return (
      <Component
        ref={ref as any}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          active
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer',
          className
        )}
        href={href}
        onClick={disabled ? undefined : onClick}
        disabled={disabled && !asChild}
        {...props}
      >
        {icon && <span className="flex-shrink-0 h-5 w-5">{icon}</span>}
        <span className="flex-1 truncate">{children}</span>
        {badge && <span className="flex-shrink-0">{badge}</span>}
      </Component>
    );
  }
);
NavigationItem.displayName = 'NavigationItem';

// Sidebar navigation
interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, collapsed = false, children, onToggle, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(
        'flex flex-col bg-card border-r transition-all duration-300 h-full',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
      {...props}
    >
      {/* Toggle button */}
      {onToggle && (
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-full"
          >
            <svg
              className={cn(
                'h-4 w-4 transition-transform',
                collapsed && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7M5 12h13"
              />
            </svg>
          </Button>
        </div>
      )}

      {/* Navigation content */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {children}
      </div>
    </aside>
  )
);
Sidebar.displayName = 'Sidebar';

// Sidebar navigation item (optimized for collapsed state)
interface SidebarItemProps extends NavigationItemProps {
  collapsed?: boolean;
  tooltip?: string;
}

const SidebarItem = React.forwardRef<HTMLElement, SidebarItemProps>(
  (
    { className, collapsed = false, tooltip, icon, badge, children, ...props },
    ref
  ) => {
    const content = (
      <NavigationItem
        ref={ref}
        className={cn(
          'w-full justify-start',
          collapsed && 'px-2 justify-center',
          className
        )}
        icon={icon}
        badge={!collapsed ? badge : undefined}
        {...props}
      >
        {!collapsed && children}
      </NavigationItem>
    );

    // Add tooltip for collapsed state
    if (collapsed && tooltip) {
      return (
        <div className="relative group">
          {content}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {tooltip}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-foreground" />
          </div>
        </div>
      );
    }

    return content;
  }
);
SidebarItem.displayName = 'SidebarItem';

// Breadcrumb navigation
interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
  separator?: React.ReactNode;
  className?: string;
}

const Breadcrumb = ({ items, separator = '/', className }: BreadcrumbProps) => (
  <nav className={cn('flex items-center space-x-2 text-sm', className)}>
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && (
          <span className="text-muted-foreground">{separator}</span>
        )}
        {item.href && !item.active ? (
          <a
            href={item.href}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {item.label}
          </a>
        ) : (
          <span
            className={cn(
              item.active
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            )}
          >
            {item.label}
          </span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// Top navigation bar
interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  actions?: React.ReactNode;
}

const TopNav = React.forwardRef<HTMLElement, TopNavProps>(
  ({ className, logo, actions, children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'flex items-center justify-between h-16 px-4 bg-background border-b',
        className
      )}
      {...props}
    >
      {/* Logo/Brand */}
      {logo && <div className="flex-shrink-0">{logo}</div>}

      {/* Navigation items */}
      <nav className="flex items-center space-x-1 flex-1 mx-4">{children}</nav>

      {/* Actions */}
      {actions && (
        <div className="flex items-center space-x-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </header>
  )
);
TopNav.displayName = 'TopNav';

// Navigation group/section
interface NavigationGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  collapsed?: boolean;
}

const NavigationGroup = React.forwardRef<HTMLDivElement, NavigationGroupProps>(
  ({ className, label, collapsed = false, children, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1', className)} {...props}>
      {label && !collapsed && (
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      )}
      {children}
    </div>
  )
);
NavigationGroup.displayName = 'NavigationGroup';

export {
  Navigation,
  NavigationItem,
  Sidebar,
  SidebarItem,
  Breadcrumb,
  TopNav,
  NavigationGroup,
  type NavigationProps,
  type NavigationItemProps,
  type SidebarProps,
  type BreadcrumbProps,
  type TopNavProps,
};
export default Navigation;
