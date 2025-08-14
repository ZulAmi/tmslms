/**
 * RBAC (Role-Based Access Control) System
 * 
 * A comprehensive permission management system with:
 * - Granular permissions for each module (courses, training, users, reports, admin)
 * - Role hierarchy and inheritance
 * - Time-based permissions and temporary access grants
 * - Permission checking middleware for API routes
 * - React hooks for conditional UI rendering
 * - Audit logging and security compliance
 */

// Core Types
export * from './types';

// Main RBAC Service
export { RBACService } from './rbac-service';

// Role Hierarchy Management
export { RoleHierarchyManager } from './role-hierarchy';
export type { 
  RoleHierarchyNode, 
  RoleInheritanceRule, 
  InheritanceCondition 
} from './role-hierarchy';

// Temporary Access Management
export { TemporaryAccessManager } from './temporary-access';
export type {
  TemporaryAccessRequest,
  TemporaryAccessApproval,
  TemporaryAccessPolicy
} from './temporary-access';

// API Middleware
export {
  withPermissions,
  requirePermissions,
  PermissionChecker,
  createPermissionChecker,
  PermissionResponses,
  requireAdmin,
  requireCourseManagement,
  requireUserManagement,
  requireReportAccess
} from './middleware';
export type { PermissionMiddlewareOptions } from './middleware';

// React Hooks and Components
export {
  PermissionProvider,
  usePermission,
  usePermissions,
  useUserPermissions,
  PermissionGate,
  withPermission,
  usePermissionNavigation,
  usePermissionClasses
} from './hooks';
export type {
  UsePermissionResult,
  UsePermissionsResult
} from './hooks';

// Default System Roles
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  INSTRUCTOR: 'instructor',
  USER: 'user'
} as const;

// Permission Categories
export const PERMISSION_CATEGORIES = {
  COURSES: 'courses',
  TRAINING: 'training',
  USERS: 'users',
  REPORTS: 'reports',
  ADMIN: 'admin'
} as const;

// Common Permission Patterns
export const COMMON_PERMISSIONS = {
  // Course permissions
  VIEW_COURSES: 'courses:read' as const,
  CREATE_COURSES: 'courses:create' as const,
  UPDATE_COURSES: 'courses:update' as const,
  DELETE_COURSES: 'courses:delete' as const,
  PUBLISH_COURSES: 'courses:publish' as const,
  
  // User permissions
  VIEW_USERS: 'users:read' as const,
  CREATE_USERS: 'users:create' as const,
  UPDATE_USERS: 'users:update' as const,
  DELETE_USERS: 'users:delete' as const,
  ASSIGN_ROLES: 'roles:assign' as const,
  
  // Training permissions
  VIEW_TRAINING: 'training-programs:read' as const,
  CREATE_TRAINING: 'training-programs:create' as const,
  CONDUCT_TRAINING: 'training-sessions:conduct' as const,
  APPROVE_TRAINING: 'training-programs:approve' as const,
  
  // Report permissions
  VIEW_REPORTS: 'reports:read' as const,
  CREATE_REPORTS: 'reports:create' as const,
  EXPORT_REPORTS: 'reports:export' as const,
  VIEW_ANALYTICS: 'analytics:read' as const,
  
  // Admin permissions
  CONFIGURE_SYSTEM: 'system:configure' as const,
  BACKUP_SYSTEM: 'system:backup' as const,
  MANAGE_SECURITY: 'security:configure' as const,
  VIEW_AUDIT_LOGS: 'audit-logs:read' as const
} as const;

// Permission Groups for easier management
export const PERMISSION_GROUPS = {
  COURSE_BASIC: [
    COMMON_PERMISSIONS.VIEW_COURSES,
    COMMON_PERMISSIONS.CREATE_COURSES,
    COMMON_PERMISSIONS.UPDATE_COURSES
  ] as const,
  
  COURSE_ADVANCED: [
    COMMON_PERMISSIONS.VIEW_COURSES,
    COMMON_PERMISSIONS.CREATE_COURSES,
    COMMON_PERMISSIONS.UPDATE_COURSES,
    COMMON_PERMISSIONS.DELETE_COURSES,
    COMMON_PERMISSIONS.PUBLISH_COURSES
  ] as const,
  
  USER_BASIC: [
    COMMON_PERMISSIONS.VIEW_USERS,
    COMMON_PERMISSIONS.UPDATE_USERS
  ] as const,
  
  USER_ADVANCED: [
    COMMON_PERMISSIONS.VIEW_USERS,
    COMMON_PERMISSIONS.UPDATE_USERS,
    COMMON_PERMISSIONS.CREATE_USERS,
    COMMON_PERMISSIONS.DELETE_USERS,
    COMMON_PERMISSIONS.ASSIGN_ROLES
  ] as const,
  
  TRAINING_INSTRUCTOR: [
    COMMON_PERMISSIONS.VIEW_TRAINING,
    COMMON_PERMISSIONS.CONDUCT_TRAINING
  ] as const,
  
  TRAINING_MANAGER: [
    COMMON_PERMISSIONS.VIEW_TRAINING,
    COMMON_PERMISSIONS.CONDUCT_TRAINING,
    COMMON_PERMISSIONS.CREATE_TRAINING,
    COMMON_PERMISSIONS.APPROVE_TRAINING
  ] as const,
  
  REPORTING_BASIC: [
    COMMON_PERMISSIONS.VIEW_REPORTS,
    COMMON_PERMISSIONS.VIEW_ANALYTICS
  ] as const,
  
  REPORTING_ADVANCED: [
    COMMON_PERMISSIONS.VIEW_REPORTS,
    COMMON_PERMISSIONS.VIEW_ANALYTICS,
    COMMON_PERMISSIONS.CREATE_REPORTS,
    COMMON_PERMISSIONS.EXPORT_REPORTS
  ] as const,
  
  ADMIN_BASIC: [
    COMMON_PERMISSIONS.CONFIGURE_SYSTEM,
    COMMON_PERMISSIONS.VIEW_AUDIT_LOGS
  ] as const,
  
  ADMIN_FULL: [
    COMMON_PERMISSIONS.CONFIGURE_SYSTEM,
    COMMON_PERMISSIONS.VIEW_AUDIT_LOGS,
    COMMON_PERMISSIONS.BACKUP_SYSTEM,
    COMMON_PERMISSIONS.MANAGE_SECURITY
  ] as const
} as const;

// Utility functions
export class PermissionUtils {
  /**
   * Check if permission belongs to a specific category
   */
  static belongsToCategory(permission: string, category: string): boolean {
    return permission.startsWith(`${category}:`);
  }

  /**
   * Extract category from permission string
   */
  static getCategory(permission: string): string {
    return permission.split(':')[0];
  }

  /**
   * Extract action from permission string
   */
  static getAction(permission: string): string {
    return permission.split(':')[1];
  }

  /**
   * Create permission string from category and action
   */
  static createPermission(category: string, action: string): string {
    return `${category}:${action}`;
  }

  /**
   * Get all permissions for a category
   */
  static getPermissionsForCategory(
    permissions: string[], 
    category: string
  ): string[] {
    return permissions.filter(permission => 
      this.belongsToCategory(permission, category)
    );
  }

  /**
   * Group permissions by category
   */
  static groupPermissionsByCategory(
    permissions: string[]
  ): Record<string, string[]> {
    return permissions.reduce((groups, permission) => {
      const category = this.getCategory(permission);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
      return groups;
    }, {} as Record<string, string[]>);
  }

  /**
   * Check if user has all permissions in a group
   */
  static hasPermissionGroup(
    userPermissions: string[],
    permissionGroup: readonly string[]
  ): boolean {
    return permissionGroup.every(permission => 
      userPermissions.includes(permission)
    );
  }

  /**
   * Check if user has any permissions in a group
   */
  static hasAnyPermissionInGroup(
    userPermissions: string[],
    permissionGroup: readonly string[]
  ): boolean {
    return permissionGroup.some(permission => 
      userPermissions.includes(permission)
    );
  }

  /**
   * Get missing permissions from a group
   */
  static getMissingPermissions(
    userPermissions: string[],
    requiredPermissions: readonly string[]
  ): string[] {
    return requiredPermissions.filter(permission => 
      !userPermissions.includes(permission)
    );
  }

  /**
   * Validate permission format
   */
  static isValidPermissionFormat(permission: string): boolean {
    const parts = permission.split(':');
    return parts.length === 2 && 
           parts[0].length > 0 && 
           parts[1].length > 0;
  }

  /**
   * Sort permissions by category and action
   */
  static sortPermissions(permissions: string[]): string[] {
    return permissions.sort((a, b) => {
      const [categoryA, actionA] = a.split(':');
      const [categoryB, actionB] = b.split(':');
      
      if (categoryA !== categoryB) {
        return categoryA.localeCompare(categoryB);
      }
      
      return actionA.localeCompare(actionB);
    });
  }
}

// Role Templates for common role configurations
const USER_PERMISSIONS = [
  COMMON_PERMISSIONS.VIEW_COURSES,
  'course-content:read',
  'enrollments:read',
  'progress:read',
  'profiles:read',
  'profiles:update',
  'training-requests:create',
  'training-records:read',
  'certifications:read'
] as const;

const INSTRUCTOR_PERMISSIONS = [
  ...USER_PERMISSIONS,
  COMMON_PERMISSIONS.UPDATE_COURSES,
  'course-content:create',
  'course-content:update',
  'assessments:create',
  'assessments:update',
  'assessments:grade',
  'progress:update',
  COMMON_PERMISSIONS.CONDUCT_TRAINING,
  'training-records:update'
] as const;

const MANAGER_PERMISSIONS = [
  ...INSTRUCTOR_PERMISSIONS,
  ...PERMISSION_GROUPS.COURSE_ADVANCED,
  'enrollments:create',
  'enrollments:update',
  'enrollments:bulk-enroll',
  ...PERMISSION_GROUPS.TRAINING_MANAGER,
  ...PERMISSION_GROUPS.USER_BASIC,
  COMMON_PERMISSIONS.ASSIGN_ROLES,
  ...PERMISSION_GROUPS.REPORTING_ADVANCED
] as const;

export const ROLE_TEMPLATES = {
  /**
   * Basic user role - can view and interact with assigned content
   */
  USER: {
    name: 'User',
    permissions: USER_PERMISSIONS
  },

  /**
   * Instructor role - can teach and manage course content
   */
  INSTRUCTOR: {
    name: 'Instructor',
    permissions: INSTRUCTOR_PERMISSIONS
  },

  /**
   * Manager role - can manage teams and approve actions
   */
  MANAGER: {
    name: 'Manager',
    permissions: MANAGER_PERMISSIONS
  },

  /**
   * Administrator role - full system access except super admin functions
   */
  ADMIN: {
    name: 'Administrator',
    permissions: [
      ...MANAGER_PERMISSIONS,
      ...PERMISSION_GROUPS.USER_ADVANCED,
      ...PERMISSION_GROUPS.ADMIN_BASIC,
      'security:audit',
      'security:monitor',
      'integrations:create',
      'integrations:update',
      'integrations:delete',
      'tenants:read',
      'tenants:update'
    ]
  }
} as const;
