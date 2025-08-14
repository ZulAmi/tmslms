import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { RBACService } from './rbac-service';
import { PermissionContext, AllPermissions, PermissionAuditLog } from './types';

export interface PermissionMiddlewareOptions {
  permissions: AllPermissions[];
  requireAll?: boolean; // If true, user must have ALL permissions, if false, ANY permission
  auditLogger?: (log: PermissionAuditLog) => Promise<void>;
  errorHandler?: (error: Error, req: NextRequest) => NextResponse;
  unauthorizedHandler?: (req: NextRequest, reason: string) => NextResponse;
}

/**
 * Middleware factory for API route permission checking
 */
export function withPermissions(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  options: PermissionMiddlewareOptions
) {
  return async (req: NextRequest, context: any): Promise<NextResponse> => {
    try {
      // Get user token
      const token = await getToken({ 
        req,
        secret: process.env.NEXTAUTH_SECRET 
      });

      if (!token || !token.sub) {
        return options.unauthorizedHandler?.(req, 'Not authenticated') || 
               NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }

      // Create permission context
      const permissionContext: PermissionContext = {
        userId: token.sub,
        tenantId: token.tenantId as string,
        organizationId: token.organizationId as string,
        ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        timestamp: new Date(),
        metadata: {
          route: req.nextUrl.pathname,
          method: req.method,
          sessionId: token.sessionId
        }
      };

      // Initialize RBAC service
      const rbacService = new RBACService(options.auditLogger);

      // Check permissions
      const permissionResults = await rbacService.hasPermissions(
        token.sub,
        options.permissions,
        permissionContext
      );

      // Evaluate permission results
      const grantedPermissions = Object.entries(permissionResults)
        .filter(([_, result]) => result.granted)
        .map(([permission, _]) => permission);

      const hasRequiredPermissions = options.requireAll
        ? grantedPermissions.length === options.permissions.length
        : grantedPermissions.length > 0;

      if (!hasRequiredPermissions) {
        const deniedPermissions = options.permissions.filter(
          p => !grantedPermissions.includes(p)
        );
        
        return options.unauthorizedHandler?.(
          req, 
          `Missing permissions: ${deniedPermissions.join(', ')}`
        ) || NextResponse.json({ 
          error: 'Insufficient permissions',
          required: options.permissions,
          denied: deniedPermissions
        }, { status: 403 });
      }

      // Add permission context to request
      (req as any).permissionContext = permissionContext;
      (req as any).grantedPermissions = grantedPermissions;

      // Call the original handler
      return handler(req, context);

    } catch (error) {
      console.error('Permission middleware error:', error);
      
      if (options.errorHandler) {
        return options.errorHandler(error as Error, req);
      }
      
      return NextResponse.json({ 
        error: 'Internal server error' 
      }, { status: 500 });
    }
  };
}

/**
 * Higher-order function for creating permission-checked API handlers
 */
export function requirePermissions(
  permissions: AllPermissions[],
  options: Partial<PermissionMiddlewareOptions> = {}
) {
  return function permissionDecorator<T extends (...args: any[]) => any>(
    target: T
  ): T {
    const mergedOptions: PermissionMiddlewareOptions = {
      permissions,
      requireAll: false,
      ...options
    };

    return withPermissions(target, mergedOptions) as T;
  };
}

/**
 * Permission checking utility for use within API handlers
 */
export class PermissionChecker {
  private rbacService: RBACService;

  constructor(auditLogger?: (log: PermissionAuditLog) => Promise<void>) {
    this.rbacService = new RBACService(auditLogger);
  }

  /**
   * Check if current user has permission
   */
  async hasPermission(
    req: NextRequest,
    permission: AllPermissions
  ): Promise<boolean> {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.sub) {
      return false;
    }

    const context: PermissionContext = {
      userId: token.sub,
      tenantId: token.tenantId as string,
      organizationId: token.organizationId as string,
      ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      timestamp: new Date()
    };

    const result = await this.rbacService.hasPermission(
      token.sub,
      permission,
      context
    );

    return result.granted;
  }

  /**
   * Get all user permissions
   */
  async getUserPermissions(req: NextRequest): Promise<string[]> {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.sub) {
      return [];
    }

    const permissions = await this.rbacService.getUserPermissions(token.sub);
    return permissions.map(p => typeof p === 'string' ? p : `${(p as any).resource}:${(p as any).action}`);
  }

  /**
   * Check multiple permissions
   */
  async hasPermissions(
    req: NextRequest,
    permissions: AllPermissions[],
    requireAll = false
  ): Promise<{ hasAccess: boolean; granted: string[]; denied: string[] }> {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.sub) {
      return {
        hasAccess: false,
        granted: [],
        denied: permissions
      };
    }

    const context: PermissionContext = {
      userId: token.sub,
      tenantId: token.tenantId as string,
      organizationId: token.organizationId as string,
      ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      timestamp: new Date()
    };

    const results = await this.rbacService.hasPermissions(
      token.sub,
      permissions,
      context
    );

    const granted = Object.entries(results)
      .filter(([_, result]) => result.granted)
      .map(([permission, _]) => permission);

    const denied = permissions.filter(p => !granted.includes(p));

    const hasAccess = requireAll 
      ? granted.length === permissions.length
      : granted.length > 0;

    return { hasAccess, granted, denied };
  }
}

/**
 * Create permission checker instance
 */
export const createPermissionChecker = (
  auditLogger?: (log: PermissionAuditLog) => Promise<void>
) => new PermissionChecker(auditLogger);

/**
 * Default permission responses
 */
export const PermissionResponses = {
  unauthorized: () => NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 }
  ),

  forbidden: (permissions?: string[]) => NextResponse.json(
    { 
      error: 'Insufficient permissions',
      required: permissions 
    },
    { status: 403 }
  ),

  notFound: () => NextResponse.json(
    { error: 'Resource not found' },
    { status: 404 }
  ),

  serverError: (message = 'Internal server error') => NextResponse.json(
    { error: message },
    { status: 500 }
  )
};

/**
 * Example usage decorators for common permission patterns
 */

// Admin only
export const requireAdmin = requirePermissions(['system:configure'], {
  requireAll: true,
  unauthorizedHandler: (req, reason) => PermissionResponses.forbidden(['system:configure'])
});

// Course management
export const requireCourseManagement = requirePermissions([
  'courses:create',
  'courses:update',
  'courses:delete'
], {
  requireAll: false
});

// User management
export const requireUserManagement = requirePermissions([
  'users:create',
  'users:update',
  'users:delete'
], {
  requireAll: false
});

// Report access
export const requireReportAccess = requirePermissions(['reports:read'], {
  requireAll: true
});
