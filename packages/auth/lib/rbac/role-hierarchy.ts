import { Role, RolePermissions, AllPermissions, Permission, BasePermission } from './types';

export interface RoleHierarchyNode {
  role: Role;
  children: RoleHierarchyNode[];
  parent?: RoleHierarchyNode;
  level: number;
  effectivePermissions: Permission[];
}

export interface RoleInheritanceRule {
  id: string;
  parentRoleId: string;
  childRoleId: string;
  isActive: boolean;
  conditions?: InheritanceCondition[];
  excludedPermissions?: AllPermissions[];
  createdAt: Date;
  createdBy: string;
}

export interface InheritanceCondition {
  type: 'tenant' | 'organization' | 'time' | 'custom';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  value: any;
}

export class RoleHierarchyManager {
  private hierarchyCache = new Map<string, RoleHierarchyNode>();
  private inheritanceRules = new Map<string, RoleInheritanceRule[]>();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.initializeSystemRoles();
  }

  /**
   * Initialize default system role hierarchy
   */
  private initializeSystemRoles() {
    // This would typically load from database
    // For now, we'll define the standard hierarchy
    const systemRoles = this.getSystemRoleDefinitions();
    systemRoles.forEach(role => {
      this.createRoleHierarchyNode(role);
    });
  }

  /**
   * Get system role definitions
   */
  private getSystemRoleDefinitions(): Role[] {
    const now = new Date();
    
    return [
      {
        id: 'super-admin',
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        level: 100,
        inheritsFrom: [],
        permissions: this.getAllPermissions(),
        isActive: true,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Administrative access with most permissions',
        level: 90,
        inheritsFrom: ['manager'],
        permissions: this.getAdminPermissions(),
        isActive: true,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Management access for assigned areas',
        level: 80,
        inheritsFrom: ['instructor'],
        permissions: this.getManagerPermissions(),
        isActive: true,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      },
      {
        id: 'instructor',
        name: 'Instructor',
        description: 'Teaching and training capabilities',
        level: 70,
        inheritsFrom: ['user'],
        permissions: this.getInstructorPermissions(),
        isActive: true,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      },
      {
        id: 'user',
        name: 'User',
        description: 'Basic user access for learning',
        level: 10,
        inheritsFrom: [],
        permissions: this.getUserPermissions(),
        isActive: true,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      }
    ];
  }

  /**
   * Get all available permissions
   */
  private getAllPermissions(): RolePermissions {
    return {
      courses: {
        'courses:create': this.createPermission('courses', 'create'),
        'courses:read': this.createPermission('courses', 'read'),
        'courses:update': this.createPermission('courses', 'update'),
        'courses:delete': this.createPermission('courses', 'delete'),
        'courses:publish': this.createPermission('courses', 'publish'),
        'courses:archive': this.createPermission('courses', 'archive'),
        'course-content:create': this.createPermission('course-content', 'create'),
        'course-content:read': this.createPermission('course-content', 'read'),
        'course-content:update': this.createPermission('course-content', 'update'),
        'course-content:delete': this.createPermission('course-content', 'delete'),
        'enrollments:create': this.createPermission('enrollments', 'create'),
        'enrollments:read': this.createPermission('enrollments', 'read'),
        'enrollments:update': this.createPermission('enrollments', 'update'),
        'enrollments:delete': this.createPermission('enrollments', 'delete'),
        'enrollments:bulk-enroll': this.createPermission('enrollments', 'create'),
        'assessments:create': this.createPermission('assessments', 'create'),
        'assessments:read': this.createPermission('assessments', 'read'),
        'assessments:update': this.createPermission('assessments', 'update'),
        'assessments:delete': this.createPermission('assessments', 'delete'),
        'assessments:grade': this.createPermission('assessments', 'execute'),
        'assessments:review': this.createPermission('assessments', 'read'),
        'progress:read': this.createPermission('progress', 'read'),
        'progress:update': this.createPermission('progress', 'update'),
        'progress:reset': this.createPermission('progress', 'update')
      },
      training: {
        'training-programs:create': this.createPermission('training-programs', 'create'),
        'training-programs:read': this.createPermission('training-programs', 'read'),
        'training-programs:update': this.createPermission('training-programs', 'update'),
        'training-programs:delete': this.createPermission('training-programs', 'delete'),
        'training-programs:approve': this.createPermission('training-programs', 'approve'),
        'training-sessions:create': this.createPermission('training-sessions', 'create'),
        'training-sessions:read': this.createPermission('training-sessions', 'read'),
        'training-sessions:update': this.createPermission('training-sessions', 'update'),
        'training-sessions:delete': this.createPermission('training-sessions', 'delete'),
        'training-sessions:conduct': this.createPermission('training-sessions', 'execute'),
        'training-requests:create': this.createPermission('training-requests', 'create'),
        'training-requests:read': this.createPermission('training-requests', 'read'),
        'training-requests:update': this.createPermission('training-requests', 'update'),
        'training-requests:approve': this.createPermission('training-requests', 'approve'),
        'training-requests:reject': this.createPermission('training-requests', 'update'),
        'training-records:read': this.createPermission('training-records', 'read'),
        'training-records:update': this.createPermission('training-records', 'update'),
        'training-records:export': this.createPermission('training-records', 'export'),
        'certifications:create': this.createPermission('certifications', 'create'),
        'certifications:read': this.createPermission('certifications', 'read'),
        'certifications:update': this.createPermission('certifications', 'update'),
        'certifications:issue': this.createPermission('certifications', 'create'),
        'certifications:revoke': this.createPermission('certifications', 'delete'),
        'certifications:verify': this.createPermission('certifications', 'read')
      },
      users: {
        'users:create': this.createPermission('users', 'create'),
        'users:read': this.createPermission('users', 'read'),
        'users:update': this.createPermission('users', 'update'),
        'users:delete': this.createPermission('users', 'delete'),
        'users:activate': this.createPermission('users', 'update'),
        'users:deactivate': this.createPermission('users', 'update'),
        'users:impersonate': this.createPermission('users', 'execute'),
        'roles:create': this.createPermission('roles', 'create'),
        'roles:read': this.createPermission('roles', 'read'),
        'roles:update': this.createPermission('roles', 'update'),
        'roles:delete': this.createPermission('roles', 'delete'),
        'roles:assign': this.createPermission('roles', 'update'),
        'roles:revoke': this.createPermission('roles', 'update'),
        'profiles:read': this.createPermission('profiles', 'read'),
        'profiles:update': this.createPermission('profiles', 'update'),
        'profiles:export': this.createPermission('profiles', 'export'),
        'organizations:create': this.createPermission('organizations', 'create'),
        'organizations:read': this.createPermission('organizations', 'read'),
        'organizations:update': this.createPermission('organizations', 'update'),
        'organizations:delete': this.createPermission('organizations', 'delete')
      },
      reports: {
        'reports:read': this.createPermission('reports', 'read'),
        'reports:create': this.createPermission('reports', 'create'),
        'reports:update': this.createPermission('reports', 'update'),
        'reports:delete': this.createPermission('reports', 'delete'),
        'reports:export': this.createPermission('reports', 'export'),
        'reports:schedule': this.createPermission('reports', 'create'),
        'analytics:read': this.createPermission('analytics', 'read'),
        'analytics:create': this.createPermission('analytics', 'create'),
        'analytics:export': this.createPermission('analytics', 'export'),
        'audit-logs:read': this.createPermission('audit-logs', 'read'),
        'audit-logs:export': this.createPermission('audit-logs', 'export'),
        'metrics:read': this.createPermission('metrics', 'read'),
        'metrics:export': this.createPermission('metrics', 'export'),
        'financial-reports:read': this.createPermission('financial-reports', 'read'),
        'financial-reports:create': this.createPermission('financial-reports', 'create'),
        'financial-reports:export': this.createPermission('financial-reports', 'export')
      },
      admin: {
        'system:configure': this.createPermission('system', 'update'),
        'system:backup': this.createPermission('system', 'execute'),
        'system:restore': this.createPermission('system', 'execute'),
        'system:maintenance': this.createPermission('system', 'execute'),
        'security:configure': this.createPermission('security', 'update'),
        'security:audit': this.createPermission('security', 'read'),
        'security:monitor': this.createPermission('security', 'read'),
        'integrations:create': this.createPermission('integrations', 'create'),
        'integrations:read': this.createPermission('integrations', 'read'),
        'integrations:update': this.createPermission('integrations', 'update'),
        'integrations:delete': this.createPermission('integrations', 'delete'),
        'integrations:test': this.createPermission('integrations', 'execute'),
        'tenants:create': this.createPermission('tenants', 'create'),
        'tenants:read': this.createPermission('tenants', 'read'),
        'tenants:update': this.createPermission('tenants', 'update'),
        'tenants:delete': this.createPermission('tenants', 'delete'),
        'tenants:configure': this.createPermission('tenants', 'update'),
        'licenses:read': this.createPermission('licenses', 'read'),
        'licenses:update': this.createPermission('licenses', 'update'),
        'licenses:export': this.createPermission('licenses', 'export')
      }
    };
  }

  /**
   * Create a permission object
   */
  private createPermission(resource: string, action: string): BasePermission {
    return {
      resource,
      action: action as any
    };
  }

  /**
   * Get admin-level permissions
   */
  private getAdminPermissions(): RolePermissions {
    const allPermissions = this.getAllPermissions();
    
    // Admin gets all permissions except super-admin specific ones
    return {
      ...allPermissions,
      admin: {
        'system:configure': this.createPermission('system', 'update'),
        'system:backup': this.createPermission('system', 'execute'),
        'security:configure': this.createPermission('security', 'update'),
        'security:audit': this.createPermission('security', 'read'),
        'security:monitor': this.createPermission('security', 'read'),
        'integrations:create': this.createPermission('integrations', 'create'),
        'integrations:read': this.createPermission('integrations', 'read'),
        'integrations:update': this.createPermission('integrations', 'update'),
        'integrations:delete': this.createPermission('integrations', 'delete'),
        'tenants:read': this.createPermission('tenants', 'read'),
        'tenants:update': this.createPermission('tenants', 'update'),
        'licenses:read': this.createPermission('licenses', 'read'),
        'licenses:export': this.createPermission('licenses', 'export')
      }
    };
  }

  /**
   * Get manager-level permissions
   */
  private getManagerPermissions(): RolePermissions {
    return {
      courses: {
        'courses:create': this.createPermission('courses', 'create'),
        'courses:read': this.createPermission('courses', 'read'),
        'courses:update': this.createPermission('courses', 'update'),
        'courses:publish': this.createPermission('courses', 'publish'),
        'course-content:create': this.createPermission('course-content', 'create'),
        'course-content:read': this.createPermission('course-content', 'read'),
        'course-content:update': this.createPermission('course-content', 'update'),
        'enrollments:create': this.createPermission('enrollments', 'create'),
        'enrollments:read': this.createPermission('enrollments', 'read'),
        'enrollments:update': this.createPermission('enrollments', 'update'),
        'enrollments:bulk-enroll': this.createPermission('enrollments', 'create'),
        'assessments:create': this.createPermission('assessments', 'create'),
        'assessments:read': this.createPermission('assessments', 'read'),
        'assessments:update': this.createPermission('assessments', 'update'),
        'assessments:grade': this.createPermission('assessments', 'execute'),
        'assessments:review': this.createPermission('assessments', 'read'),
        'progress:read': this.createPermission('progress', 'read'),
        'progress:update': this.createPermission('progress', 'update')
      },
      training: {
        'training-programs:create': this.createPermission('training-programs', 'create'),
        'training-programs:read': this.createPermission('training-programs', 'read'),
        'training-programs:update': this.createPermission('training-programs', 'update'),
        'training-programs:approve': this.createPermission('training-programs', 'approve'),
        'training-sessions:create': this.createPermission('training-sessions', 'create'),
        'training-sessions:read': this.createPermission('training-sessions', 'read'),
        'training-sessions:update': this.createPermission('training-sessions', 'update'),
        'training-requests:read': this.createPermission('training-requests', 'read'),
        'training-requests:approve': this.createPermission('training-requests', 'approve'),
        'training-records:read': this.createPermission('training-records', 'read'),
        'training-records:export': this.createPermission('training-records', 'export'),
        'certifications:create': this.createPermission('certifications', 'create'),
        'certifications:read': this.createPermission('certifications', 'read'),
        'certifications:issue': this.createPermission('certifications', 'create')
      },
      users: {
        'users:read': this.createPermission('users', 'read'),
        'users:update': this.createPermission('users', 'update'),
        'roles:read': this.createPermission('roles', 'read'),
        'roles:assign': this.createPermission('roles', 'update'),
        'profiles:read': this.createPermission('profiles', 'read'),
        'profiles:update': this.createPermission('profiles', 'update'),
        'organizations:read': this.createPermission('organizations', 'read')
      },
      reports: {
        'reports:read': this.createPermission('reports', 'read'),
        'reports:create': this.createPermission('reports', 'create'),
        'reports:export': this.createPermission('reports', 'export'),
        'analytics:read': this.createPermission('analytics', 'read'),
        'analytics:export': this.createPermission('analytics', 'export'),
        'metrics:read': this.createPermission('metrics', 'read')
      },
      admin: {}
    };
  }

  /**
   * Get instructor-level permissions
   */
  private getInstructorPermissions(): RolePermissions {
    return {
      courses: {
        'courses:read': this.createPermission('courses', 'read'),
        'courses:update': this.createPermission('courses', 'update'),
        'course-content:create': this.createPermission('course-content', 'create'),
        'course-content:read': this.createPermission('course-content', 'read'),
        'course-content:update': this.createPermission('course-content', 'update'),
        'enrollments:read': this.createPermission('enrollments', 'read'),
        'assessments:create': this.createPermission('assessments', 'create'),
        'assessments:read': this.createPermission('assessments', 'read'),
        'assessments:update': this.createPermission('assessments', 'update'),
        'assessments:grade': this.createPermission('assessments', 'execute'),
        'progress:read': this.createPermission('progress', 'read'),
        'progress:update': this.createPermission('progress', 'update')
      },
      training: {
        'training-sessions:read': this.createPermission('training-sessions', 'read'),
        'training-sessions:conduct': this.createPermission('training-sessions', 'execute'),
        'training-records:read': this.createPermission('training-records', 'read'),
        'certifications:read': this.createPermission('certifications', 'read')
      },
      users: {
        'profiles:read': this.createPermission('profiles', 'read')
      },
      reports: {
        'reports:read': this.createPermission('reports', 'read')
      },
      admin: {}
    };
  }

  /**
   * Get user-level permissions
   */
  private getUserPermissions(): RolePermissions {
    return {
      courses: {
        'courses:read': this.createPermission('courses', 'read'),
        'course-content:read': this.createPermission('course-content', 'read'),
        'enrollments:read': this.createPermission('enrollments', 'read'),
        'assessments:read': this.createPermission('assessments', 'read'),
        'progress:read': this.createPermission('progress', 'read')
      },
      training: {
        'training-requests:create': this.createPermission('training-requests', 'create'),
        'training-requests:read': this.createPermission('training-requests', 'read'),
        'training-records:read': this.createPermission('training-records', 'read'),
        'certifications:read': this.createPermission('certifications', 'read')
      },
      users: {
        'profiles:read': this.createPermission('profiles', 'read'),
        'profiles:update': this.createPermission('profiles', 'update')
      },
      reports: {},
      admin: {}
    };
  }

  /**
   * Create role hierarchy node
   */
  private createRoleHierarchyNode(role: Role): RoleHierarchyNode {
    const node: RoleHierarchyNode = {
      role,
      children: [],
      level: role.level,
      effectivePermissions: this.flattenRolePermissions(role.permissions)
    };

    this.hierarchyCache.set(role.id, node);
    return node;
  }

  /**
   * Build complete hierarchy with inheritance
   */
  async buildHierarchy(roles: Role[]): Promise<Map<string, RoleHierarchyNode>> {
    const nodes = new Map<string, RoleHierarchyNode>();
    
    // Create all nodes first
    roles.forEach(role => {
      const node = this.createRoleHierarchyNode(role);
      nodes.set(role.id, node);
    });

    // Build parent-child relationships
    roles.forEach(role => {
      const node = nodes.get(role.id);
      if (!node) return;

      if (role.inheritsFrom && role.inheritsFrom.length > 0) {
        role.inheritsFrom.forEach(parentId => {
          const parentNode = nodes.get(parentId);
          if (parentNode) {
            parentNode.children.push(node);
            node.parent = parentNode;
          }
        });
      }
    });

    // Calculate effective permissions with inheritance
    nodes.forEach(node => {
      node.effectivePermissions = this.calculateEffectivePermissions(node, nodes);
    });

    return nodes;
  }

  /**
   * Calculate effective permissions including inheritance
   */
  private calculateEffectivePermissions(
    node: RoleHierarchyNode,
    allNodes: Map<string, RoleHierarchyNode>
  ): Permission[] {
    const permissions = new Set<string>();
    const permissionObjects: Permission[] = [];

    // Add own permissions
    const ownPermissions = this.flattenRolePermissions(node.role.permissions);
    ownPermissions.forEach(permission => {
      const key = typeof permission === 'string' ? 
        permission : 
        `${(permission as BasePermission).resource}:${(permission as BasePermission).action}`;
      
      if (!permissions.has(key)) {
        permissions.add(key);
        permissionObjects.push(permission);
      }
    });

    // Add inherited permissions
    if (node.role.inheritsFrom && node.role.inheritsFrom.length > 0) {
      node.role.inheritsFrom.forEach(parentId => {
        const parentNode = allNodes.get(parentId);
        if (parentNode) {
          const parentPermissions = this.calculateEffectivePermissions(parentNode, allNodes);
          parentPermissions.forEach(permission => {
            const key = typeof permission === 'string' ? 
              permission : 
              `${(permission as BasePermission).resource}:${(permission as BasePermission).action}`;
            
            if (!permissions.has(key)) {
              permissions.add(key);
              permissionObjects.push(permission);
            }
          });
        }
      });
    }

    return permissionObjects;
  }

  /**
   * Flatten role permissions to array
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
   * Get role hierarchy path
   */
  getHierarchyPath(roleId: string): string[] {
    const node = this.hierarchyCache.get(roleId);
    if (!node) return [];

    const path: string[] = [roleId];
    let current = node.parent;
    
    while (current) {
      path.unshift(current.role.id);
      current = current.parent;
    }

    return path;
  }

  /**
   * Check if role inherits from another role
   */
  inheritsFrom(childRoleId: string, parentRoleId: string): boolean {
    const path = this.getHierarchyPath(childRoleId);
    return path.includes(parentRoleId);
  }

  /**
   * Get all descendant roles
   */
  getDescendants(roleId: string): string[] {
    const node = this.hierarchyCache.get(roleId);
    if (!node) return [];

    const descendants: string[] = [];
    
    function traverse(currentNode: RoleHierarchyNode) {
      currentNode.children.forEach(child => {
        descendants.push(child.role.id);
        traverse(child);
      });
    }

    traverse(node);
    return descendants;
  }

  /**
   * Get role level in hierarchy
   */
  getRoleLevel(roleId: string): number {
    const node = this.hierarchyCache.get(roleId);
    return node?.role.level || 0;
  }

  /**
   * Check if user can manage another user based on role hierarchy
   */
  canManageUser(managerRoleIds: string[], targetRoleIds: string[]): boolean {
    const managerMaxLevel = Math.max(...managerRoleIds.map(id => this.getRoleLevel(id)));
    const targetMaxLevel = Math.max(...targetRoleIds.map(id => this.getRoleLevel(id)));
    
    return managerMaxLevel > targetMaxLevel;
  }

  /**
   * Clear hierarchy cache
   */
  clearCache(): void {
    this.hierarchyCache.clear();
    this.inheritanceRules.clear();
  }
}
