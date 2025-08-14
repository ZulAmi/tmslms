import { 
  TemporaryAccess, 
  TemporaryAccessAudit, 
  AllPermissions, 
  PermissionCondition,
  PermissionContext 
} from './types';

export interface TemporaryAccessRequest {
  userId: string;
  requestedBy: string;
  permissions: AllPermissions[];
  reason: string;
  duration: number; // in minutes
  validFrom?: Date;
  maxUsage?: number;
  conditions?: PermissionCondition[];
  approvalRequired?: boolean;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  businessJustification: string;
  accessType: 'one-time' | 'recurring' | 'project-based' | 'emergency';
}

export interface TemporaryAccessApproval {
  requestId: string;
  approvedBy: string;
  approved: boolean;
  comments?: string;
  modifiedPermissions?: AllPermissions[];
  modifiedDuration?: number;
  additionalConditions?: PermissionCondition[];
}

export interface TemporaryAccessPolicy {
  id: string;
  name: string;
  description: string;
  maxDuration: number; // in minutes
  autoApproveThreshold: number; // minutes below which auto-approval is allowed
  requiredApprovers: number;
  approverRoles: string[];
  permissionCategories: string[];
  conditions: PermissionCondition[];
  isActive: boolean;
}

export class TemporaryAccessManager {
  private accessCache = new Map<string, TemporaryAccess[]>();
  private requestQueue = new Map<string, TemporaryAccessRequest[]>();
  private policies = new Map<string, TemporaryAccessPolicy>();
  private auditLogs = new Map<string, TemporaryAccessAudit[]>();

  constructor() {
    this.initializeDefaultPolicies();
    this.startCleanupTimer();
  }

  /**
   * Initialize default temporary access policies
   */
  private initializeDefaultPolicies() {
    const defaultPolicies: TemporaryAccessPolicy[] = [
      {
        id: 'emergency-access',
        name: 'Emergency Access',
        description: 'Emergency access for critical situations',
        maxDuration: 240, // 4 hours
        autoApproveThreshold: 60, // 1 hour
        requiredApprovers: 1,
        approverRoles: ['admin', 'manager'],
        permissionCategories: ['emergency'],
        conditions: [],
        isActive: true
      },
      {
        id: 'project-access',
        name: 'Project-Based Access',
        description: 'Temporary access for specific projects',
        maxDuration: 10080, // 1 week
        autoApproveThreshold: 0, // No auto-approval
        requiredApprovers: 2,
        approverRoles: ['admin', 'manager'],
        permissionCategories: ['courses', 'training', 'reports'],
        conditions: [],
        isActive: true
      },
      {
        id: 'maintenance-access',
        name: 'Maintenance Access',
        description: 'Temporary elevated access for system maintenance',
        maxDuration: 480, // 8 hours
        autoApproveThreshold: 0, // No auto-approval
        requiredApprovers: 2,
        approverRoles: ['super-admin', 'admin'],
        permissionCategories: ['admin'],
        conditions: [],
        isActive: true
      }
    ];

    defaultPolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });
  }

  /**
   * Request temporary access
   */
  async requestAccess(request: TemporaryAccessRequest): Promise<string> {
    // Validate request
    const validation = this.validateRequest(request);
    if (!validation.isValid) {
      throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
    }

    // Find applicable policy
    const policy = this.findApplicablePolicy(request);
    if (!policy) {
      throw new Error('No applicable policy found for this request');
    }

    // Check if auto-approval is possible
    const autoApprove = this.canAutoApprove(request, policy);
    
    const requestId = this.generateId();
    const now = new Date();

    // Create temporary access record
    const temporaryAccess: TemporaryAccess = {
      id: requestId,
      userId: request.userId,
      grantedBy: autoApprove ? 'system' : 'pending',
      permissions: request.permissions,
      reason: request.reason,
      validFrom: request.validFrom || now,
      validUntil: new Date(
        (request.validFrom || now).getTime() + request.duration * 60 * 1000
      ),
      isActive: autoApprove,
      approvalRequired: !autoApprove,
      approvedBy: autoApprove ? 'system' : undefined,
      approvedAt: autoApprove ? now : undefined,
      usageCount: 0,
      maxUsage: request.maxUsage,
      conditions: request.conditions,
      auditTrail: [{
        id: this.generateId(),
        action: autoApprove ? 'granted' : 'requested',
        timestamp: now,
        userId: request.requestedBy,
        details: {
          reason: request.reason,
          duration: request.duration,
          autoApproved: autoApprove,
          policy: policy.id
        }
      }]
    };

    if (autoApprove) {
      // Grant access immediately
      this.grantAccess(temporaryAccess);
    } else {
      // Add to approval queue
      this.addToApprovalQueue(request, requestId);
    }

    return requestId;
  }

  /**
   * Approve or deny temporary access request
   */
  async processApproval(approval: TemporaryAccessApproval): Promise<boolean> {
    const request = this.findPendingRequest(approval.requestId);
    if (!request) {
      throw new Error('Request not found or already processed');
    }

    const now = new Date();
    
    if (approval.approved) {
      // Create approved temporary access
      const temporaryAccess: TemporaryAccess = {
        id: approval.requestId,
        userId: request.userId,
        grantedBy: approval.approvedBy,
        permissions: approval.modifiedPermissions || request.permissions,
        reason: request.reason,
        validFrom: request.validFrom || now,
        validUntil: new Date(
          (request.validFrom || now).getTime() + 
          (approval.modifiedDuration || request.duration) * 60 * 1000
        ),
        isActive: true,
        approvalRequired: false,
        approvedBy: approval.approvedBy,
        approvedAt: now,
        usageCount: 0,
        maxUsage: request.maxUsage,
        conditions: [
          ...(request.conditions || []),
          ...(approval.additionalConditions || [])
        ],
        auditTrail: [{
          id: this.generateId(),
          action: 'granted',
          timestamp: now,
          userId: approval.approvedBy,
          details: {
            originalRequest: request,
            comments: approval.comments,
            modifications: {
              permissions: approval.modifiedPermissions,
              duration: approval.modifiedDuration,
              conditions: approval.additionalConditions
            }
          }
        }]
      };

      this.grantAccess(temporaryAccess);
    } else {
      // Record denial
      this.auditLogs.set(approval.requestId, [{
        id: this.generateId(),
        action: 'denied' as any,
        timestamp: now,
        userId: approval.approvedBy,
        details: {
          reason: approval.comments,
          originalRequest: request
        }
      }]);
    }

    // Remove from queue
    this.removeFromApprovalQueue(approval.requestId);

    return approval.approved;
  }

  /**
   * Grant temporary access
   */
  private grantAccess(access: TemporaryAccess): void {
    const userAccess = this.accessCache.get(access.userId) || [];
    userAccess.push(access);
    this.accessCache.set(access.userId, userAccess);

    // Set auto-expiration
    const timeUntilExpiration = access.validUntil.getTime() - Date.now();
    if (timeUntilExpiration > 0) {
      setTimeout(() => {
        this.revokeAccess(access.id, 'system', 'Auto-expired');
      }, timeUntilExpiration);
    }
  }

  /**
   * Revoke temporary access
   */
  async revokeAccess(
    accessId: string, 
    revokedBy: string, 
    reason: string
  ): Promise<boolean> {
    const userAccess = Array.from(this.accessCache.values()).flat();
    const access = userAccess.find(a => a.id === accessId);
    
    if (!access) {
      return false;
    }

    // Mark as revoked
    access.isActive = false;
    access.revokedBy = revokedBy;
    access.revokedAt = new Date();

    // Add audit log
    access.auditTrail.push({
      id: this.generateId(),
      action: 'revoked',
      timestamp: new Date(),
      userId: revokedBy,
      details: { reason }
    });

    return true;
  }

  /**
   * Get active temporary access for user
   */
  getActiveAccess(userId: string): TemporaryAccess[] {
    const userAccess = this.accessCache.get(userId) || [];
    const now = new Date();
    
    return userAccess.filter(access => 
      access.isActive &&
      access.validFrom <= now &&
      access.validUntil >= now &&
      (!access.maxUsage || access.usageCount < access.maxUsage)
    );
  }

  /**
   * Record usage of temporary access
   */
  recordUsage(accessId: string, context: PermissionContext): void {
    const userAccess = Array.from(this.accessCache.values()).flat();
    const access = userAccess.find(a => a.id === accessId);
    
    if (access) {
      access.usageCount++;
      access.auditTrail.push({
        id: this.generateId(),
        action: 'used',
        timestamp: new Date(),
        userId: context.userId,
        details: {
          context,
          usageCount: access.usageCount
        }
      });

      // Auto-revoke if max usage reached
      if (access.maxUsage && access.usageCount >= access.maxUsage) {
        this.revokeAccess(accessId, 'system', 'Maximum usage reached');
      }
    }
  }

  /**
   * Validate temporary access request
   */
  private validateRequest(request: TemporaryAccessRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.userId) {
      errors.push('User ID is required');
    }

    if (!request.requestedBy) {
      errors.push('Requester ID is required');
    }

    if (!request.permissions || request.permissions.length === 0) {
      errors.push('At least one permission is required');
    }

    if (!request.reason || request.reason.trim().length < 10) {
      errors.push('Detailed reason is required (minimum 10 characters)');
    }

    if (request.duration <= 0 || request.duration > 43200) { // Max 30 days
      errors.push('Duration must be between 1 minute and 30 days');
    }

    if (!request.businessJustification || request.businessJustification.trim().length < 20) {
      errors.push('Business justification is required (minimum 20 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Find applicable policy for request
   */
  private findApplicablePolicy(request: TemporaryAccessRequest): TemporaryAccessPolicy | null {
    for (const policy of this.policies.values()) {
      if (!policy.isActive) continue;

      // Check if permissions match policy categories
      const hasMatchingCategory = request.permissions.some(permission => {
        const category = permission.split(':')[0];
        return policy.permissionCategories.includes(category);
      });

      if (hasMatchingCategory && request.duration <= policy.maxDuration) {
        return policy;
      }
    }

    return null;
  }

  /**
   * Check if request can be auto-approved
   */
  private canAutoApprove(
    request: TemporaryAccessRequest, 
    policy: TemporaryAccessPolicy
  ): boolean {
    return request.duration <= policy.autoApproveThreshold &&
           request.urgencyLevel === 'emergency' &&
           policy.autoApproveThreshold > 0;
  }

  /**
   * Add request to approval queue
   */
  private addToApprovalQueue(request: TemporaryAccessRequest, requestId: string): void {
    const approverQueue = this.requestQueue.get('pending') || [];
    approverQueue.push({ ...request, userId: requestId });
    this.requestQueue.set('pending', approverQueue);
  }

  /**
   * Find pending request by ID
   */
  private findPendingRequest(requestId: string): TemporaryAccessRequest | null {
    const pending = this.requestQueue.get('pending') || [];
    return pending.find(req => req.userId === requestId) || null;
  }

  /**
   * Remove request from approval queue
   */
  private removeFromApprovalQueue(requestId: string): void {
    const pending = this.requestQueue.get('pending') || [];
    const filtered = pending.filter(req => req.userId !== requestId);
    this.requestQueue.set('pending', filtered);
  }

  /**
   * Start cleanup timer for expired access
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredAccess();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Cleanup expired access entries
   */
  private cleanupExpiredAccess(): void {
    const now = new Date();
    
    for (const [userId, userAccess] of this.accessCache.entries()) {
      const activeAccess = userAccess.filter(access => 
        access.isActive && access.validUntil > now
      );
      
      if (activeAccess.length !== userAccess.length) {
        if (activeAccess.length === 0) {
          this.accessCache.delete(userId);
        } else {
          this.accessCache.set(userId, activeAccess);
        }
      }
    }
  }

  /**
   * Get pending approval requests
   */
  getPendingRequests(): TemporaryAccessRequest[] {
    return this.requestQueue.get('pending') || [];
  }

  /**
   * Get access audit trail
   */
  getAuditTrail(accessId: string): TemporaryAccessAudit[] {
    const userAccess = Array.from(this.accessCache.values()).flat();
    const access = userAccess.find(a => a.id === accessId);
    return access?.auditTrail || [];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get usage statistics
   */
  getUsageStatistics(): {
    totalActive: number;
    totalRequests: number;
    approvalRate: number;
    averageDuration: number;
    topPermissions: Array<{ permission: string; count: number }>;
  } {
    const allAccess = Array.from(this.accessCache.values()).flat();
    const allRequests = Array.from(this.requestQueue.values()).flat();
    
    const totalActive = allAccess.filter(a => a.isActive).length;
    const totalRequests = allAccess.length + allRequests.length;
    const approvedAccess = allAccess.filter(a => a.approvedBy);
    const approvalRate = totalRequests > 0 ? approvedAccess.length / totalRequests : 0;
    
    const durations = allAccess.map(a => 
      a.validUntil.getTime() - a.validFrom.getTime()
    );
    const averageDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length / (1000 * 60) // in minutes
      : 0;

    // Count permission usage
    const permissionCounts = new Map<string, number>();
    allAccess.forEach(access => {
      access.permissions.forEach(permission => {
        const permissionKey = typeof permission === 'string' ? permission : `${permission}`;
        permissionCounts.set(permissionKey, (permissionCounts.get(permissionKey) || 0) + 1);
      });
    });

    const topPermissions = Array.from(permissionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([permission, count]) => ({ permission, count }));

    return {
      totalActive,
      totalRequests,
      approvalRate,
      averageDuration,
      topPermissions
    };
  }
}
