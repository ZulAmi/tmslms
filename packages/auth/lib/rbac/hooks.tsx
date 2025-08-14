import { useSession } from 'next-auth/react';
import React, { useEffect, useState, useMemo, useCallback, createContext, useContext } from 'react';
import { RBACService } from './rbac-service';
import { 
  AllPermissions, 
  PermissionContext, 
  PermissionEvaluationResult,
  PermissionAuditLog 
} from './types';

// Permission hook return type
export interface UsePermissionResult {
  hasPermission: boolean;
  isLoading: boolean;
  error?: string;
  checkTime?: Date;
  ttl?: number;
}

// Multiple permissions hook return type
export interface UsePermissionsResult {
  permissions: Record<AllPermissions, boolean>;
  hasAnyPermission: boolean;
  hasAllPermissions: boolean;
  isLoading: boolean;
  error?: string;
  grantedPermissions: AllPermissions[];
  deniedPermissions: AllPermissions[];
}

// Permission context provider
interface PermissionProviderProps {
  children: React.ReactNode;
  auditLogger?: (log: PermissionAuditLog) => Promise<void>;
}

interface PermissionContextType {
  rbacService: RBACService;
  checkPermission: (permission: AllPermissions) => Promise<PermissionEvaluationResult>;
  getUserPermissions: () => Promise<string[]>;
}

const PermissionContext = createContext<PermissionContextType | null>(null);

/**
 * Permission provider component
 */
export function PermissionProvider({ children, auditLogger }: PermissionProviderProps) {
  const { data: session } = useSession();
  const rbacService = useMemo(() => new RBACService(auditLogger), [auditLogger]);

  const checkPermission = useCallback(async (permission: AllPermissions) => {
    if (!session?.user?.id) {
      return { granted: false, reason: 'Not authenticated', auditRequired: false };
    }

    const context: PermissionContext = {
      userId: session.user.id,
      tenantId: (session as any).tenantId,
      organizationId: (session as any).organizationId,
      timestamp: new Date(),
      metadata: {
        source: 'react-hook',
        userAgent: navigator.userAgent
      }
    };

    return rbacService.hasPermission(session.user.id, permission, context);
  }, [session, rbacService]);

  const getUserPermissions = useCallback(async () => {
    if (!session?.user?.id) {
      return [];
    }

    const permissions = await rbacService.getUserPermissions(session.user.id);
    return permissions.map(p => 
      typeof p === 'string' ? p : `${(p as any).resource}:${(p as any).action}`
    );
  }, [session, rbacService]);

  const value = useMemo(() => ({
    rbacService,
    checkPermission,
    getUserPermissions
  }), [rbacService, checkPermission, getUserPermissions]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook to check a single permission
 */
export function usePermission(permission: AllPermissions): UsePermissionResult {
  const { data: session, status } = useSession();
  const context = useContext(PermissionContext);
  const [result, setResult] = useState<UsePermissionResult>({
    hasPermission: false,
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    async function checkPermission() {
      if (status === 'loading') {
        return;
      }

      if (!session?.user || !context) {
        if (isMounted) {
          setResult({
            hasPermission: false,
            isLoading: false,
            error: status === 'unauthenticated' ? 'Not authenticated' : 'Permission context not available'
          });
        }
        return;
      }

      try {
        const permissionResult = await context.checkPermission(permission);
        
        if (isMounted) {
          setResult({
            hasPermission: permissionResult.granted,
            isLoading: false,
            error: permissionResult.granted ? undefined : permissionResult.reason,
            checkTime: new Date(),
            ttl: permissionResult.ttl
          });
        }
      } catch (error) {
        if (isMounted) {
          setResult({
            hasPermission: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    checkPermission();

    return () => {
      isMounted = false;
    };
  }, [permission, session, status, context]);

  return result;
}

/**
 * Hook to check multiple permissions
 */
export function usePermissions(permissions: AllPermissions[]): UsePermissionsResult {
  const { data: session, status } = useSession();
  const context = useContext(PermissionContext);
  const [result, setResult] = useState<UsePermissionsResult>({
    permissions: {} as Record<AllPermissions, boolean>,
    hasAnyPermission: false,
    hasAllPermissions: false,
    isLoading: true,
    grantedPermissions: [],
    deniedPermissions: []
  });

  useEffect(() => {
    let isMounted = true;

    async function checkPermissions() {
      if (status === 'loading') {
        return;
      }

      if (!session?.user || !context) {
        if (isMounted) {
          setResult({
            permissions: permissions.reduce((acc, p) => ({ ...acc, [p]: false }), {}) as Record<AllPermissions, boolean>,
            hasAnyPermission: false,
            hasAllPermissions: false,
            isLoading: false,
            error: status === 'unauthenticated' ? 'Not authenticated' : 'Permission context not available',
            grantedPermissions: [],
            deniedPermissions: permissions
          });
        }
        return;
      }

      try {
        const permissionChecks = await Promise.all(
          permissions.map(async (permission) => {
            const result = await context.checkPermission(permission);
            return { permission, granted: result.granted };
          })
        );

        if (isMounted) {
          const permissionMap = permissionChecks.reduce(
            (acc, { permission, granted }) => ({ ...acc, [permission]: granted }),
            {} as Record<AllPermissions, boolean>
          );

          const grantedPermissions = permissionChecks
            .filter(({ granted }) => granted)
            .map(({ permission }) => permission);

          const deniedPermissions = permissionChecks
            .filter(({ granted }) => !granted)
            .map(({ permission }) => permission);

          setResult({
            permissions: permissionMap,
            hasAnyPermission: grantedPermissions.length > 0,
            hasAllPermissions: grantedPermissions.length === permissions.length,
            isLoading: false,
            grantedPermissions,
            deniedPermissions
          });
        }
      } catch (error) {
        if (isMounted) {
          setResult({
            permissions: permissions.reduce((acc, p) => ({ ...acc, [p]: false }), {}) as Record<AllPermissions, boolean>,
            hasAnyPermission: false,
            hasAllPermissions: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            grantedPermissions: [],
            deniedPermissions: permissions
          });
        }
      }
    }

    checkPermissions();

    return () => {
      isMounted = false;
    };
  }, [permissions, session, status, context]);

  return result;
}

/**
 * Hook to get all user permissions
 */
export function useUserPermissions() {
  const { data: session, status } = useSession();
  const context = useContext(PermissionContext);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let isMounted = true;

    async function fetchPermissions() {
      if (status === 'loading') {
        return;
      }

      if (!session?.user || !context) {
        if (isMounted) {
          setPermissions([]);
          setIsLoading(false);
          setError(status === 'unauthenticated' ? 'Not authenticated' : 'Permission context not available');
        }
        return;
      }

      try {
        const userPermissions = await context.getUserPermissions();
        
        if (isMounted) {
          setPermissions(userPermissions);
          setIsLoading(false);
          setError(undefined);
        }
      } catch (err) {
        if (isMounted) {
          setPermissions([]);
          setIsLoading(false);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      }
    }

    fetchPermissions();

    return () => {
      isMounted = false;
    };
  }, [session, status, context]);

  return { permissions, isLoading, error };
}

/**
 * Component for conditional rendering based on permissions
 */
interface PermissionGateProps {
  children: React.ReactNode;
  permission?: AllPermissions;
  permissions?: AllPermissions[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  loading = null
}: PermissionGateProps) {
  const singlePermissionResult = usePermission(permission!);
  const multiplePermissionsResult = usePermissions(permissions || []);

  // Use single permission if provided, otherwise multiple permissions
  const result = permission ? singlePermissionResult : multiplePermissionsResult;

  if (result.isLoading) {
    return <>{loading}</>;
  }

  const hasAccess = permission 
    ? (result as UsePermissionResult).hasPermission
    : requireAll 
      ? (result as UsePermissionsResult).hasAllPermissions
      : (result as UsePermissionsResult).hasAnyPermission;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component for permission-based rendering
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: AllPermissions,
  fallback?: React.ComponentType<P>
) {
  return function PermissionWrappedComponent(props: P) {
    const { hasPermission, isLoading } = usePermission(permission);

    if (isLoading) {
      return null;
    }

    if (!hasPermission) {
      const FallbackComponent = fallback;
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }

    return <Component {...props} />;
  };
}

/**
 * Custom hook for permission-based navigation
 */
export function usePermissionNavigation() {
  const { data: session } = useSession();
  const context = useContext(PermissionContext);

  const canNavigate = useCallback(async (permission: AllPermissions): Promise<boolean> => {
    if (!session?.user || !context) {
      return false;
    }

    const result = await context.checkPermission(permission);
    return result.granted;
  }, [session, context]);

  const getAccessibleRoutes = useCallback(async (routePermissions: Record<string, AllPermissions>) => {
    if (!session?.user || !context) {
      return [];
    }

    const checks = await Promise.all(
      Object.entries(routePermissions).map(async ([route, permission]) => {
        const result = await context.checkPermission(permission);
        return { route, accessible: result.granted };
      })
    );

    return checks.filter(({ accessible }) => accessible).map(({ route }) => route);
  }, [session, context]);

  return { canNavigate, getAccessibleRoutes };
}

/**
 * Utility function for permission-based class names
 */
export function usePermissionClasses(
  permission: AllPermissions,
  classes: { granted: string; denied: string; loading?: string }
) {
  const { hasPermission, isLoading } = usePermission(permission);

  if (isLoading && classes.loading) {
    return classes.loading;
  }

  return hasPermission ? classes.granted : classes.denied;
}
