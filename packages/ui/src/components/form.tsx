import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../utils';

// Form wrapper component
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, onSubmit, ...props }, ref) => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      if (onSubmit) {
        event.preventDefault();
        onSubmit(event);
      }
    };

    return (
      <form
        ref={ref}
        className={cn('space-y-6', className)}
        onSubmit={handleSubmit}
        {...props}
      />
    );
  }
);
Form.displayName = 'Form';

// Form Field wrapper
interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

const FormField = ({ children, className }: FormFieldProps) => (
  <div className={cn('space-y-2', className)}>{children}</div>
);

// Form Label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, required = false, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  )
);
FormLabel.displayName = 'FormLabel';

// Form Description
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
FormDescription.displayName = 'FormDescription';

// Form Message (for errors, success, etc.)
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'error' | 'success' | 'warning' | 'info';
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, variant = 'error', children, ...props }, ref) => {
    if (!children) return null;

    const Icon = () => {
      switch (variant) {
        case 'error':
          return (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          );
        case 'success':
          return (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          );
        case 'warning':
          return (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          );
        case 'info':
          return (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          );
        default:
          return null;
      }
    };

    return (
      <p
        ref={ref}
        className={cn(
          'text-sm font-medium flex items-center gap-2',
          {
            'text-destructive': variant === 'error',
            'text-success': variant === 'success',
            'text-warning': variant === 'warning',
            'text-blue-600': variant === 'info',
          },
          className
        )}
        {...props}
      >
        <Icon />
        {children}
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';

// Textarea component
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  resize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      success,
      warning,
      helperText,
      resize = true,
      ...props
    },
    ref
  ) => {
    const textareaId =
      props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <FormLabel htmlFor={textareaId} required={props.required}>
            {label}
          </FormLabel>
        )}

        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            !resize && 'resize-none',
            error && 'border-destructive focus-visible:ring-destructive',
            success && 'border-success focus-visible:ring-success',
            warning && 'border-warning focus-visible:ring-warning',
            className
          )}
          ref={ref}
          {...props}
        />

        {(error || success || warning || helperText) && (
          <div className="mt-1.5">
            {error && <FormMessage variant="error">{error}</FormMessage>}
            {success && <FormMessage variant="success">{success}</FormMessage>}
            {warning && <FormMessage variant="warning">{warning}</FormMessage>}
            {helperText && !error && !success && !warning && (
              <FormDescription>{helperText}</FormDescription>
            )}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      success,
      warning,
      helperText,
      placeholder,
      options,
      ...props
    },
    ref
  ) => {
    const selectId =
      props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <FormLabel htmlFor={selectId} required={props.required}>
            {label}
          </FormLabel>
        )}

        <select
          id={selectId}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            error && 'border-destructive focus-visible:ring-destructive',
            success && 'border-success focus-visible:ring-success',
            warning && 'border-warning focus-visible:ring-warning',
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {(error || success || warning || helperText) && (
          <div className="mt-1.5">
            {error && <FormMessage variant="error">{error}</FormMessage>}
            {success && <FormMessage variant="success">{success}</FormMessage>}
            {warning && <FormMessage variant="warning">{warning}</FormMessage>}
            {helperText && !error && !success && !warning && (
              <FormDescription>{helperText}</FormDescription>
            )}
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export {
  Form,
  FormField,
  FormLabel,
  FormDescription,
  FormMessage,
  Textarea,
  Select,
  type FormProps,
  type TextareaProps,
  type SelectProps,
};
export default Form;
