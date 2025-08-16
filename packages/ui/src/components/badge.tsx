import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success:
          'border-transparent bg-success text-success-foreground hover:bg-success/80',
        warning:
          'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline:
          'text-foreground border-border hover:bg-accent hover:text-accent-foreground',
        ghost:
          'border-transparent hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      leftIcon,
      rightIcon,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {leftIcon && <span className="mr-1 h-3 w-3">{leftIcon}</span>}
        {children}
        {rightIcon && !removable && (
          <span className="ml-1 h-3 w-3">{rightIcon}</span>
        )}
        {removable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-1 h-3 w-3 rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
Badge.displayName = 'Badge';

// Status Badge component for common use cases
interface StatusBadgeProps {
  status:
    | 'active'
    | 'inactive'
    | 'pending'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'draft';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const StatusBadge = ({
  status,
  size = 'default',
  className,
}: StatusBadgeProps) => {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Active' },
    inactive: { variant: 'outline' as const, label: 'Inactive' },
    pending: { variant: 'warning' as const, label: 'Pending' },
    completed: { variant: 'success' as const, label: 'Completed' },
    failed: { variant: 'destructive' as const, label: 'Failed' },
    cancelled: { variant: 'outline' as const, label: 'Cancelled' },
    draft: { variant: 'secondary' as const, label: 'Draft' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
};

// Priority Badge component
interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const PriorityBadge = ({
  priority,
  size = 'default',
  className,
}: PriorityBadgeProps) => {
  const priorityConfig = {
    low: { variant: 'secondary' as const, label: 'Low' },
    medium: { variant: 'outline' as const, label: 'Medium' },
    high: { variant: 'warning' as const, label: 'High' },
    urgent: { variant: 'destructive' as const, label: 'Urgent' },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
};

export { Badge, badgeVariants, StatusBadge, PriorityBadge };
export default Badge;
