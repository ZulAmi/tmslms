// Core permission types and interfaces for the RBAC system

export type Permission = string | BasePermission;
export type Resource = string;
export type Action = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'export' | 'import';

// Base permission interface
export interface BasePermission {
  resource: Resource;
  action: Action;
  conditions?: PermissionCondition[];
}

// Permission conditions for fine-grained access control
export interface PermissionCondition {
  type: 'owner' | 'organization' | 'tenant' | 'time' | 'location' | 'custom';
  field?: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

// Time-based permission constraints
export interface TimeBasedPermission extends BasePermission {
  validFrom?: Date;
  validUntil?: Date;
  schedules?: PermissionSchedule[];
}

export interface PermissionSchedule {
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
}

// Course-related permissions
export interface CoursePermissions {
  // Course management
  'courses:create': BasePermission;
  'courses:read': BasePermission;
  'courses:update': BasePermission;
  'courses:delete': BasePermission;
  'courses:publish': BasePermission;
  'courses:archive': BasePermission;
  
  // Content management
  'course-content:create': BasePermission;
  'course-content:read': BasePermission;
  'course-content:update': BasePermission;
  'course-content:delete': BasePermission;
  
  // Enrollment management
  'enrollments:create': BasePermission;
  'enrollments:read': BasePermission;
  'enrollments:update': BasePermission;
  'enrollments:delete': BasePermission;
  'enrollments:bulk-enroll': BasePermission;
  
  // Assessment management
  'assessments:create': BasePermission;
  'assessments:read': BasePermission;
  'assessments:update': BasePermission;
  'assessments:delete': BasePermission;
  'assessments:grade': BasePermission;
  'assessments:review': BasePermission;
  
  // Progress tracking
  'progress:read': BasePermission;
  'progress:update': BasePermission;
  'progress:reset': BasePermission;
}

// Training-related permissions
export interface TrainingPermissions {
  // Training programs
  'training-programs:create': BasePermission;
  'training-programs:read': BasePermission;
  'training-programs:update': BasePermission;
  'training-programs:delete': BasePermission;
  'training-programs:approve': BasePermission;
  
  // Training sessions
  'training-sessions:create': BasePermission;
  'training-sessions:read': BasePermission;
  'training-sessions:update': BasePermission;
  'training-sessions:delete': BasePermission;
  'training-sessions:conduct': BasePermission;
  
  // Training requests
  'training-requests:create': BasePermission;
  'training-requests:read': BasePermission;
  'training-requests:update': BasePermission;
  'training-requests:approve': BasePermission;
  'training-requests:reject': BasePermission;
  
  // Training records
  'training-records:read': BasePermission;
  'training-records:update': BasePermission;
  'training-records:export': BasePermission;
  
  // Certifications
  'certifications:create': BasePermission;
  'certifications:read': BasePermission;
  'certifications:update': BasePermission;
  'certifications:issue': BasePermission;
  'certifications:revoke': BasePermission;
  'certifications:verify': BasePermission;
}

// User management permissions
export interface UserPermissions {
  // User accounts
  'users:create': BasePermission;
  'users:read': BasePermission;
  'users:update': BasePermission;
  'users:delete': BasePermission;
  'users:activate': BasePermission;
  'users:deactivate': BasePermission;
  'users:impersonate': BasePermission;
  
  // Role management
  'roles:create': BasePermission;
  'roles:read': BasePermission;
  'roles:update': BasePermission;
  'roles:delete': BasePermission;
  'roles:assign': BasePermission;
  'roles:revoke': BasePermission;
  
  // Profile management
  'profiles:read': BasePermission;
  'profiles:update': BasePermission;
  'profiles:export': BasePermission;
  
  // Organization management
  'organizations:create': BasePermission;
  'organizations:read': BasePermission;
  'organizations:update': BasePermission;
  'organizations:delete': BasePermission;
}

// Reporting permissions
export interface ReportPermissions {
  // Standard reports
  'reports:read': BasePermission;
  'reports:create': BasePermission;
  'reports:update': BasePermission;
  'reports:delete': BasePermission;
  'reports:export': BasePermission;
  'reports:schedule': BasePermission;
  
  // Analytics
  'analytics:read': BasePermission;
  'analytics:create': BasePermission;
  'analytics:export': BasePermission;
  
  // Audit logs
  'audit-logs:read': BasePermission;
  'audit-logs:export': BasePermission;
  
  // Performance metrics
  'metrics:read': BasePermission;
  'metrics:export': BasePermission;
  
  // Financial reports
  'financial-reports:read': BasePermission;
  'financial-reports:create': BasePermission;
  'financial-reports:export': BasePermission;
}

// Administrative permissions
export interface AdminPermissions {
  // System configuration
  'system:configure': BasePermission;
  'system:backup': BasePermission;
  'system:restore': BasePermission;
  'system:maintenance': BasePermission;
  
  // Security management
  'security:configure': BasePermission;
  'security:audit': BasePermission;
  'security:monitor': BasePermission;
  
  // Integration management
  'integrations:create': BasePermission;
  'integrations:read': BasePermission;
  'integrations:update': BasePermission;
  'integrations:delete': BasePermission;
  'integrations:test': BasePermission;
  
  // Tenant management
  'tenants:create': BasePermission;
  'tenants:read': BasePermission;
  'tenants:update': BasePermission;
  'tenants:delete': BasePermission;
  'tenants:configure': BasePermission;
  
  // License management
  'licenses:read': BasePermission;
  'licenses:update': BasePermission;
  'licenses:export': BasePermission;
}

// Main role permissions interface
export interface RolePermissions {
  courses: Partial<CoursePermissions>;
  training: Partial<TrainingPermissions>;
  users: Partial<UserPermissions>;
  reports: Partial<ReportPermissions>;
  admin: Partial<AdminPermissions>;
}

// Role hierarchy and inheritance
export interface Role {
  id: string;
  name: string;
  description: string;
  level: number; // Hierarchy level (higher = more privileges)
  inheritsFrom?: string[]; // Parent role IDs
  permissions: RolePermissions;
  isActive: boolean;
  isSystem: boolean; // System roles cannot be deleted
  tenantId?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  metadata?: Record<string, any>;
}

// Temporary access grants
export interface TemporaryAccess {
  id: string;
  userId: string;
  grantedBy: string;
  permissions: Permission[];
  reason: string;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  revokedBy?: string;
  revokedAt?: Date;
  usageCount: number;
  maxUsage?: number;
  conditions?: PermissionCondition[];
  auditTrail: TemporaryAccessAudit[];
}

export interface TemporaryAccessAudit {
  id: string;
  action: 'granted' | 'used' | 'revoked' | 'expired' | 'requested' | 'denied';
  timestamp: Date;
  userId: string;
  details?: Record<string, any>;
}

// Permission context for evaluation
export interface PermissionContext {
  userId: string;
  tenantId?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  resource?: any; // The resource being accessed
  metadata?: Record<string, any>;
}

// Permission evaluation result
export interface PermissionEvaluationResult {
  granted: boolean;
  reason?: string;
  conditions?: PermissionCondition[];
  ttl?: number; // Time to live in seconds
  auditRequired: boolean;
  metadata?: Record<string, any>;
}

// Permission audit log
export interface PermissionAuditLog {
  id: string;
  userId: string;
  permission: Permission;
  resource: Resource;
  action: Action;
  granted: boolean;
  reason?: string;
  context: PermissionContext;
  timestamp: Date;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

// Export all permission types for easy use
export type AllPermissions = 
  | keyof CoursePermissions
  | keyof TrainingPermissions 
  | keyof UserPermissions
  | keyof ReportPermissions
  | keyof AdminPermissions;
