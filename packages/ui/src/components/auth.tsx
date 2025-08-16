'use client';

import React, { useState, createContext, useContext } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Card } from './card';
import { Badge } from './badge';
import { Flex, Stack } from './layout';
import { cn } from '../lib/utils';

// Authentication Context and Provider
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin' | 'trainer';
  avatar?: string;
  organization?: string;
  lastLogin?: Date;
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUser: AuthUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'student',
        lastLogin: new Date(),
        permissions: ['courses.read', 'profile.update'],
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true,
        },
      };
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUser: AuthUser = {
        id: '1',
        email: data.email,
        name: data.name,
        role: data.role || 'student',
        organization: data.organization,
        permissions: ['courses.read', 'profile.update'],
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true,
        },
      };
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const hasPermission = (permission: string) => {
    return user?.permissions.includes(permission) || false;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Authentication Layout
export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  showBranding?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  backgroundImage,
  showBranding = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      {showBranding && (
        <div
          className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 text-white"
          style={
            backgroundImage
              ? {
                  backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(99, 102, 241, 0.8)), url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}
          }
        >
          <div className="flex flex-col justify-between h-full max-w-md">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">TMSLMS</span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{title}</h1>
              {subtitle && <p className="text-xl opacity-90">{subtitle}</p>}
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="font-semibold mb-3">Why Choose TMSLMS?</h3>
                <ul className="space-y-2 text-sm opacity-90">
                  <li className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Comprehensive learning management
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Professional training solutions
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Advanced analytics & reporting
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

// Login Form Component
export interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  className?: string;
}

export function LoginForm({
  onSuccess,
  onForgotPassword,
  onSignUp,
  className,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (email && !/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'Invalid email format';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(email, password);
      onSuccess?.();
    } catch (error) {
      setErrors({ general: 'Invalid email or password' });
    }
  };

  return (
    <div className={cn('space-y-8', className)}>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">
          Sign in to continue to TMSLMS
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {errors.general}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            helperText={errors.email}
            leftIcon={
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            helperText={errors.password}
            leftIcon={
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            }
          />
        </div>

        <Flex justify="between" align="center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-input"
            />
            Remember me
          </label>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={onForgotPassword}
          >
            Forgot password?
          </Button>
        </Flex>

        <Button type="submit" className="w-full" loading={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          <Button variant="outline" type="button">
            <svg
              className="h-4 w-4 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </Button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Button variant="ghost" size="sm" className="p-0" onClick={onSignUp}>
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );
}

// Registration Form
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'student' | 'instructor' | 'admin' | 'trainer';
  organization?: string;
  terms: boolean;
}

export interface RegisterFormProps {
  onSuccess?: () => void;
  onSignIn?: () => void;
  defaultRole?: RegisterData['role'];
  className?: string;
}

export function RegisterForm({
  onSuccess,
  onSignIn,
  defaultRole = 'student',
  className,
}: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    organization: '',
    terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";
    if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (!formData.terms)
      newErrors.terms = 'You must accept the terms and conditions';
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register(formData);
      onSuccess?.();
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    }
  };

  const updateFormData = (
    field: keyof RegisterData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const passwordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className={cn('space-y-8', className)}>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-muted-foreground mt-2">
          Join TMSLMS and start learning
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              error={errors.name}
              helperText={errors.name}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => updateFormData('role', e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="trainer">Trainer</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            error={errors.email}
            helperText={errors.email}
            leftIcon={
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="organization" className="text-sm font-medium">
            Organization (Optional)
          </label>
          <Input
            id="organization"
            placeholder="Enter your organization"
            value={formData.organization}
            onChange={(e) => updateFormData('organization', e.target.value)}
            leftIcon={
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            error={errors.password}
            helperText={errors.password}
            leftIcon={
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            }
          />
          {formData.password && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      strength <= 2
                        ? 'bg-destructive'
                        : strength <= 3
                          ? 'bg-warning'
                          : 'bg-success'
                    }`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {strength <= 2 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            helperText={errors.confirmPassword}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            }
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={formData.terms}
              onChange={(e) => updateFormData('terms', e.target.checked)}
              className="mt-0.5 rounded border-input"
            />
            <span>
              I agree to the{' '}
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-primary"
              >
                Terms of Service
              </Button>{' '}
              and{' '}
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-primary"
              >
                Privacy Policy
              </Button>
            </span>
          </label>
          {errors.terms && (
            <p className="text-sm text-destructive">{errors.terms}</p>
          )}
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Button variant="ghost" size="sm" className="p-0" onClick={onSignIn}>
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
}

// Password Reset Form
export interface PasswordResetProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  className?: string;
}

export function PasswordResetForm({
  onSuccess,
  onBackToLogin,
  className,
}: PasswordResetProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }

    try {
      await resetPassword(email);
      setSent(true);
      onSuccess?.();
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    }
  };

  if (sent) {
    return (
      <div className={cn('space-y-8 text-center', className)}>
        <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="h-8 w-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
          <p className="text-muted-foreground mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Didn't receive the email? Check your spam folder or{' '}
            <Button
              variant="ghost"
              size="sm"
              className="p-0"
              onClick={() => setSent(false)}
            >
              try again
            </Button>
          </p>
        </div>
        <Button variant="outline" onClick={onBackToLogin} className="w-full">
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground mt-2">
          Enter your email to receive a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            leftIcon={
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
          />
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={onBackToLogin}>
          ← Back to Sign In
        </Button>
      </div>
    </div>
  );
}

// User Profile Component
export interface UserProfileProps {
  user: AuthUser;
  onUpdate?: (data: Partial<AuthUser>) => void;
  className?: string;
}

export function UserProfile({ user, onUpdate, className }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    organization: user.organization || '',
    preferences: { ...user.preferences },
  });

  const handleSave = async () => {
    await onUpdate?.(formData);
    setIsEditing(false);
  };

  return (
    <Card className={cn('p-6', className)}>
      <Flex justify="between" align="center" className="mb-6">
        <h2 className="text-xl font-semibold">Profile Settings</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </Flex>

      <div className="space-y-6">
        <Flex align="center" gap="lg">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium">{user.name}</h3>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge variant="outline" size="sm" className="mt-1">
              {user.role}
            </Badge>
          </div>
        </Flex>

        {isEditing ? (
          <Stack spacing="lg">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Organization</label>
              <Input
                value={formData.organization}
                onChange={(e) =>
                  setFormData({ ...formData, organization: e.target.value })
                }
              />
            </div>
            <Flex gap="sm">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </Flex>
          </Stack>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Organization
              </label>
              <p className="text-sm">{user.organization || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Login
              </label>
              <p className="text-sm">
                {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Permissions
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.permissions.map((permission) => (
                  <Badge key={permission} variant="secondary" size="sm">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Forgot Password Form Component
interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => void;
  loading?: boolean;
  success?: boolean;
  error?: string;
}

export function ForgotPasswordForm({
  onSubmit,
  loading,
  success,
  error,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email);
  };

  if (success) {
    return (
      <Card className="p-6 text-center space-y-4">
        <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="h-6 w-6 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="text-muted-foreground">
          We've sent a password reset link to {email}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Back to Sign In
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Forgot your password?</h3>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email Address</label>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          leftIcon={
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
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          }
          required
        />
      </div>

      <div className="space-y-3">
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Send Reset Link
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => window.history.back()}
        >
          Back to Sign In
        </Button>
      </div>
    </form>
  );
}
