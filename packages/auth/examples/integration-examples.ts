/**
 * Integration Examples Export
 * 
 * This file provides simple re-exports for documentation purposes.
 * For detailed implementation examples, see integration-guide.md
 */

// Re-export all RBAC components for easy access in examples
export * from '../lib/rbac';

// Type exports for integration examples
export type { 
  AllPermissions,
  RolePermissions,
  PermissionContext,
  TemporaryAccess
} from '../lib/rbac/types';

/**
 * Integration Quick Start:
 * 
 * 1. Import the PermissionProvider and wrap your app
 * 2. Use PermissionGate components for conditional rendering
 * 3. Use usePermissions hook for dynamic permission checking
 * 4. Protect API routes with withPermissions middleware
 * 5. See integration-guide.md for complete examples
 */
