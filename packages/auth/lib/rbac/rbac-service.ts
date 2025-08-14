import { 
  Role, 
  Permission, 
  PermissionContext, 
  PermissionEvaluationResult,
  PermissionCondition,
  TimeBasedPermission,
  TemporaryAccess,
  PermissionAuditLog,
  RolePermissions,
  AllPermissions,
  BasePermission
} from './types';

export class RBACService {
  private roleCache = new Map<string, Role>();
  private permissionCache = new Map<string, Permission[]>();
  private temporaryAccessCache = new Map<string, TemporaryAccess[]>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    private auditLogger?: (log: PermissionAuditLog) => Promise<void>
  ) {}

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(
    userId: string,
    permission: AllPermissions,
    context: PermissionContext
  ): Promise<PermissionEvaluationResult> {
    try {
      // Get user's effective permissions (including inherited and temporary)
      const userPermissions = await this.getUserPermissions(userId);
      
      // Find the specific permission
      const permissionObj = userPermissions.find(p => 
        this.matchesPermission(p, permission)
      );

      if (!permissionObj) {
        await this.auditPermissionCheck(userId, permission, false, context, 'Permission not found');
        return {
          granted: false,
          reason: 'Permission not found',
          auditRequired: true
        };
      }

      // Evaluate permission conditions
      const conditionResult = await this.evaluateConditions(
        permissionObj,
        context
      );

      if (!conditionResult.granted) {
        await this.auditPermissionCheck(userId, permission, false, context, conditionResult.reason);
        return conditionResult;
      }

      // Check time-based constraints
      const timeResult = await this.evaluateTimeConstraints(
        permissionObj,
        context
      );

      if (!timeResult.granted) {
        await this.auditPermissionCheck(userId, permission, false, context, timeResult.reason);
        return timeResult;
      }

      // Permission granted
      await this.auditPermissionCheck(userId, permission, true, context);
      return {
        granted: true,
        auditRequired: true,
        ttl: timeResult.ttl
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.auditPermissionCheck(userId, permission, false, context, errorMsg);
      return {
        granted: false,
        reason: 'Error evaluating permission',
        auditRequired: true
      };
    }
  }

  /**
   * Check multiple permissions at once
   */
  async hasPermissions(
    userId: string,
    permissions: AllPermissions[],
    context: PermissionContext
  ): Promise<Record<AllPermissions, PermissionEvaluationResult>> {
    const results: Record<string, PermissionEvaluationResult> = {};
    
    for (const permission of permissions) {
      results[permission] = await this.hasPermission(userId, permission, context);
    }
    
    return results;
  }

  /**
   * Get all effective permissions for a user
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    // Check cache first
    const cached = this.permissionCache.get(userId);
    if (cached) {
      return cached;
    }

    try {
      // Get user's roles
      const userRoles = await this.getUserRoles(userId);
      
      // Get permissions from roles (including inheritance)
      const rolePermissions = await this.getRolePermissions(userRoles);
      
      // Get temporary access permissions
      const temporaryPermissions = await this.getTemporaryPermissions(userId);
      
      // Combine and deduplicate permissions
      const allPermissions = [
        ...rolePermissions,
        ...temporaryPermissions
      ];
      
      const uniquePermissions = this.deduplicatePermissions(allPermissions);
      
      // Cache the result
      this.permissionCache.set(userId, uniquePermissions);
      setTimeout(() => this.permissionCache.delete(userId), this.cacheTimeout);
      
      return uniquePermissions;
      
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Get user's roles with inheritance resolution
   */
  private async getUserRoles(userId: string): Promise<Role[]> {
    // This would typically fetch from database
    // For now, return mock data or implement database integration
    throw new Error('getUserRoles must be implemented with database integration');
  }

  /**
   * Get permissions from roles with inheritance
   */
  private async getRolePermissions(roles: Role[]): Promise<Permission[]> {
    const allPermissions: Permission[] = [];
    
    for (const role of roles) {
      // Add direct permissions
      const rolePerms = this.flattenRolePermissions(role.permissions);
      allPermissions.push(...rolePerms);
      
      // Add inherited permissions
      if (role.inheritsFrom && role.inheritsFrom.length > 0) {
        const parentRoles = await this.getParentRoles(role.inheritsFrom);
        const inheritedPermissions = await this.getRolePermissions(parentRoles);
        allPermissions.push(...inheritedPermissions);
      }
    }
    
    return allPermissions;
  }

  /**
   * Get parent roles by IDs
   */
  private async getParentRoles(roleIds: string[]): Promise<Role[]> {
    // This would typically fetch from database
    // Implement caching for better performance
    throw new Error('getParentRoles must be implemented with database integration');
  }

  /**
   * Get temporary access permissions for a user
   */
  private async getTemporaryPermissions(userId: string): Promise<Permission[]> {
    const temporaryAccess = this.temporaryAccessCache.get(userId) || 
      await this.fetchTemporaryAccess(userId);
    
    const now = new Date();
    const activeGrants = temporaryAccess.filter(grant => 
      grant.isActive &&
      grant.validFrom <= now &&
      grant.validUntil >= now
    );
    
    const permissions: Permission[] = [];
    for (const grant of activeGrants) {
      permissions.push(...grant.permissions);
    }
    
    return permissions;
  }

  /**
   * Fetch temporary access from database
   */
  private async fetchTemporaryAccess(userId: string): Promise<TemporaryAccess[]> {
    // This would typically fetch from database
    // Cache the result for performance
    return [];
  }

  /**
   * Flatten role permissions structure to array
   */
  private flattenRolePermissions(rolePermissions: RolePermissions): Permission[] {
    const permissions: Permission[] = [];
    
    Object.values(rolePermissions).forEach(modulePermissions => {
      if (modulePermissions) {
        Object.values(modulePermissions).forEach(permission => {
          if (permission) {
            permissions.push(permission as Permission);
          }
        });
      }
    });
    
    return permissions;
  }

  /**
   * Remove duplicate permissions
   */
  private deduplicatePermissions(permissions: Permission[]): Permission[] {
    const seen = new Set<string>();
    return permissions.filter(permission => {
      const key = typeof permission === 'string' ? 
        permission : 
        `${(permission as BasePermission).resource}:${(permission as BasePermission).action}`;
      
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Check if a permission object matches a permission string
   */
  private matchesPermission(permission: Permission, target: AllPermissions): boolean {
    if (typeof permission === 'string') {
      return permission === target;
    }
    
    const basePermission = permission as BasePermission;
    return `${basePermission.resource}:${basePermission.action}` === target;
  }

  /**
   * Evaluate permission conditions
   */
  private async evaluateConditions(
    permission: Permission,
    context: PermissionContext
  ): Promise<PermissionEvaluationResult> {
    if (typeof permission === 'string') {
      return { granted: true, auditRequired: false };
    }

    const basePermission = permission as BasePermission;
    if (!basePermission.conditions || basePermission.conditions.length === 0) {
      return { granted: true, auditRequired: false };
    }

    for (const condition of basePermission.conditions) {
      const result = await this.evaluateCondition(condition, context);
      if (!result) {
        return {
          granted: false,
          reason: `Condition failed: ${condition.type}`,
          auditRequired: true
        };
      }
    }

    return { granted: true, auditRequired: false };
  }

  /**
   * Evaluate a single permission condition
   */
  private async evaluateCondition(
    condition: PermissionCondition,
    context: PermissionContext
  ): Promise<boolean> {
    switch (condition.type) {
      case 'owner':
        return this.evaluateOwnerCondition(condition, context);
      case 'organization':
        return this.evaluateOrganizationCondition(condition, context);
      case 'tenant':
        return this.evaluateTenantCondition(condition, context);
      case 'time':
        return this.evaluateTimeCondition(condition, context);
      case 'location':
        return this.evaluateLocationCondition(condition, context);
      case 'custom':
        return this.evaluateCustomCondition(condition, context);
      default:
        return false;
    }
  }

  /**
   * Evaluate owner-based conditions
   */
  private evaluateOwnerCondition(
    condition: PermissionCondition,
    context: PermissionContext
  ): boolean {
    if (!context.resource || !condition.field) {
      return false;
    }

    const resourceValue = context.resource[condition.field];
    const userId = context.userId;

    switch (condition.operator) {
      case 'equals':
        return resourceValue === userId;
      case 'not_equals':
        return resourceValue !== userId;
      default:
        return false;
    }
  }

  /**
   * Evaluate organization-based conditions
   */
  private evaluateOrganizationCondition(
    condition: PermissionCondition,
    context: PermissionContext
  ): boolean {
    if (!context.organizationId) {
      return false;
    }

    switch (condition.operator) {
      case 'equals':
        return context.organizationId === condition.value;
      case 'in':
        return Array.isArray(condition.value) && 
               condition.value.includes(context.organizationId);
      default:
        return false;
    }
  }

  /**
   * Evaluate tenant-based conditions
   */
  private evaluateTenantCondition(
    condition: PermissionCondition,
    context: PermissionContext
  ): boolean {
    if (!context.tenantId) {
      return false;
    }

    switch (condition.operator) {
      case 'equals':
        return context.tenantId === condition.value;
      case 'in':
        return Array.isArray(condition.value) && 
               condition.value.includes(context.tenantId);
      default:
        return false;
    }
  }

  /**
   * Evaluate time-based conditions
   */
  private evaluateTimeCondition(
    condition: PermissionCondition,
    context: PermissionContext
  ): boolean {
    const now = context.timestamp;
    const conditionTime = new Date(condition.value);

    switch (condition.operator) {
      case 'greater_than':
        return now > conditionTime;
      case 'less_than':
        return now < conditionTime;
      default:
        return false;
    }
  }

  /**
   * Evaluate location-based conditions
   */
  private evaluateLocationCondition(
    condition: PermissionCondition,
    context: PermissionContext
  ): boolean {
    // Implement IP-based or geo-location based restrictions
    // This would require additional location data in context
    return true; // Placeholder implementation
  }

  /**
   * Evaluate custom conditions
   */
  private evaluateCustomCondition(
    condition: PermissionCondition,
    context: PermissionContext
  ): boolean {
    // Implement custom business logic conditions
    // This could call external services or apply complex rules
    return true; // Placeholder implementation
  }

  /**
   * Evaluate time-based constraints
   */
  private async evaluateTimeConstraints(
    permission: Permission,
    context: PermissionContext
  ): Promise<PermissionEvaluationResult> {
    if (typeof permission === 'string') {
      return { granted: true, auditRequired: false };
    }

    const timeBasedPermission = permission as TimeBasedPermission;
    const now = context.timestamp;

    // Check validity period
    if (timeBasedPermission.validFrom && now < timeBasedPermission.validFrom) {
      return {
        granted: false,
        reason: 'Permission not yet valid',
        auditRequired: true
      };
    }

    if (timeBasedPermission.validUntil && now > timeBasedPermission.validUntil) {
      return {
        granted: false,
        reason: 'Permission expired',
        auditRequired: true
      };
    }

    // Check schedule constraints
    if (timeBasedPermission.schedules && timeBasedPermission.schedules.length > 0) {
      const scheduleValid = this.checkScheduleConstraints(timeBasedPermission.schedules, now);
      if (!scheduleValid) {
        return {
          granted: false,
          reason: 'Outside permitted schedule',
          auditRequired: true
        };
      }
    }

    // Calculate TTL if permission has expiration
    let ttl: number | undefined;
    if (timeBasedPermission.validUntil) {
      ttl = Math.floor((timeBasedPermission.validUntil.getTime() - now.getTime()) / 1000);
    }

    return {
      granted: true,
      auditRequired: false,
      ttl
    };
  }

  /**
   * Check schedule constraints
   */
  private checkScheduleConstraints(schedules: any[], timestamp: Date): boolean {
    // Implementation for schedule checking
    // This would check day of week and time ranges
    return true; // Placeholder implementation
  }

  /**
   * Audit permission check
   */
  private async auditPermissionCheck(
    userId: string,
    permission: AllPermissions,
    granted: boolean,
    context: PermissionContext,
    reason?: string
  ): Promise<void> {
    if (!this.auditLogger) {
      return;
    }

    const auditLog: PermissionAuditLog = {
      id: this.generateId(),
      userId,
      permission,
      resource: permission.split(':')[0],
      action: permission.split(':')[1] as any,
      granted,
      reason,
      context,
      timestamp: new Date()
    };

    await this.auditLogger(auditLog);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear user permission cache
   */
  clearUserCache(userId: string): void {
    this.permissionCache.delete(userId);
    this.temporaryAccessCache.delete(userId);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.permissionCache.clear();
    this.temporaryAccessCache.clear();
    this.roleCache.clear();
  }
}
