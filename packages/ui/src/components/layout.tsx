import React from 'react';
import { cn } from '../utils';

// Main layout container
interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'centered' | 'sidebar' | 'split';
}

const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'min-h-screen',
        {
          'bg-background': variant === 'default',
          'bg-background flex items-center justify-center':
            variant === 'centered',
          'bg-background flex': variant === 'sidebar',
          'bg-background grid grid-cols-1 lg:grid-cols-2': variant === 'split',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Layout.displayName = 'Layout';

// Container with max width and padding
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', padding = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'w-full mx-auto',
        {
          'max-w-screen-sm': size === 'sm',
          'max-w-screen-md': size === 'md',
          'max-w-screen-lg': size === 'lg',
          'max-w-screen-xl': size === 'xl',
          'max-w-none': size === 'full',
        },
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    />
  )
);
Container.displayName = 'Container';

// Main content area
interface MainProps extends React.HTMLAttributes<HTMLElement> {
  padding?: boolean;
}

const Main = React.forwardRef<HTMLElement, MainProps>(
  ({ className, padding = true, ...props }, ref) => (
    <main
      ref={ref}
      className={cn('flex-1', padding && 'p-6 lg:p-8', className)}
      {...props}
    />
  )
);
Main.displayName = 'Main';

// Header component
interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
  bordered?: boolean;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, sticky = false, bordered = true, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        sticky && 'sticky top-0 z-50',
        bordered && 'border-b',
        className
      )}
      {...props}
    />
  )
);
Header.displayName = 'Header';

// Footer component
const Footer = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn('border-t bg-background', className)}
      {...props}
    />
  )
);
Footer.displayName = 'Footer';

// Section component
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = 'lg', ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        {
          'py-0': spacing === 'none',
          'py-4': spacing === 'sm',
          'py-8': spacing === 'md',
          'py-12 lg:py-16': spacing === 'lg',
          'py-16 lg:py-24': spacing === 'xl',
        },
        className
      )}
      {...props}
    />
  )
);
Section.displayName = 'Section';

// Grid layout
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 'md', responsive = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'grid',
        {
          'grid-cols-1': cols === 1,
          'grid-cols-1 md:grid-cols-2': cols === 2 && responsive,
          'grid-cols-2': cols === 2 && !responsive,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': cols === 3 && responsive,
          'grid-cols-3': cols === 3 && !responsive,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': cols === 4 && responsive,
          'grid-cols-4': cols === 4 && !responsive,
          'grid-cols-1 md:grid-cols-3 lg:grid-cols-5': cols === 5 && responsive,
          'grid-cols-5': cols === 5 && !responsive,
          'grid-cols-1 md:grid-cols-3 lg:grid-cols-6': cols === 6 && responsive,
          'grid-cols-6': cols === 6 && !responsive,
          'grid-cols-12': cols === 12,
        },
        {
          'gap-0': gap === 'none',
          'gap-2': gap === 'sm',
          'gap-4': gap === 'md',
          'gap-6': gap === 'lg',
          'gap-8': gap === 'xl',
        },
        className
      )}
      {...props}
    />
  )
);
Grid.displayName = 'Grid';

// Flex layout
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: boolean;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction = 'row',
      justify = 'start',
      align = 'start',
      wrap = false,
      gap = 'none',
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex',
        {
          'flex-row': direction === 'row',
          'flex-col': direction === 'col',
          'flex-row-reverse': direction === 'row-reverse',
          'flex-col-reverse': direction === 'col-reverse',
        },
        {
          'justify-start': justify === 'start',
          'justify-end': justify === 'end',
          'justify-center': justify === 'center',
          'justify-between': justify === 'between',
          'justify-around': justify === 'around',
          'justify-evenly': justify === 'evenly',
        },
        {
          'items-start': align === 'start',
          'items-end': align === 'end',
          'items-center': align === 'center',
          'items-baseline': align === 'baseline',
          'items-stretch': align === 'stretch',
        },
        wrap && 'flex-wrap',
        {
          'gap-0': gap === 'none',
          'gap-2': gap === 'sm',
          'gap-4': gap === 'md',
          'gap-6': gap === 'lg',
          'gap-8': gap === 'xl',
        },
        className
      )}
      {...props}
    />
  )
);
Flex.displayName = 'Flex';

// Stack component (vertical flex with gap)
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'start' | 'end' | 'center' | 'stretch';
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing = 'md', align = 'start', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col',
        {
          'gap-0': spacing === 'none',
          'gap-1': spacing === 'xs',
          'gap-2': spacing === 'sm',
          'gap-4': spacing === 'md',
          'gap-6': spacing === 'lg',
          'gap-8': spacing === 'xl',
          'gap-12': spacing === '2xl',
        },
        {
          'items-start': align === 'start',
          'items-end': align === 'end',
          'items-center': align === 'center',
          'items-stretch': align === 'stretch',
        },
        className
      )}
      {...props}
    />
  )
);
Stack.displayName = 'Stack';

// Divider component
interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  (
    { className, orientation = 'horizontal', spacing = 'md', ...props },
    ref
  ) => (
    <hr
      ref={ref}
      className={cn(
        'border-border',
        {
          'w-full border-t': orientation === 'horizontal',
          'h-full border-l min-h-[20px]': orientation === 'vertical',
        },
        {
          'my-0': spacing === 'none' && orientation === 'horizontal',
          'mx-0': spacing === 'none' && orientation === 'vertical',
          'my-2': spacing === 'sm' && orientation === 'horizontal',
          'mx-2': spacing === 'sm' && orientation === 'vertical',
          'my-4': spacing === 'md' && orientation === 'horizontal',
          'mx-4': spacing === 'md' && orientation === 'vertical',
          'my-6': spacing === 'lg' && orientation === 'horizontal',
          'mx-6': spacing === 'lg' && orientation === 'vertical',
        },
        className
      )}
      {...props}
    />
  )
);
Divider.displayName = 'Divider';

export {
  Layout,
  Container,
  Main,
  Header,
  Footer,
  Section,
  Grid,
  Flex,
  Stack,
  Divider,
  type LayoutProps,
  type ContainerProps,
  type MainProps,
  type HeaderProps,
  type SectionProps,
  type GridProps,
  type FlexProps,
  type StackProps,
  type DividerProps,
};
export default Layout;
