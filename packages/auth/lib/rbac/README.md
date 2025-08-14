# RBAC (Role-Based Access Control) System

A comprehensive permission management system for the TMS/LMS platform with granular permissions, role hierarchies, time-based access, and audit logging.

## Features

### 🔐 Granular Permissions

- **Course Management**: Create, read, update, delete, publish courses and content
- **Training Programs**: Manage training sessions, requests, approvals, and certifications
- **User Management**: Handle user accounts, roles, profiles, and organizations
- **Reporting**: Access reports, analytics, audit logs, and metrics
- **System Administration**: Configure system, manage security, integrations, and tenants

### 🏗️ Role Hierarchy

- **Super Admin**: Full system access with all permissions
- **Admin**: Administrative access with most permissions
- **Manager**: Management access for assigned areas
- **Instructor**: Teaching and training capabilities
- **User**: Basic user access for learning

### ⏰ Time-Based Permissions

- **Temporary Access**: Grant time-limited permissions for specific needs
- **Emergency Access**: Fast-track approval for critical situations
- **Scheduled Access**: Permission validity based on time schedules
- **Usage Limits**: Control how many times a permission can be used

### 🔍 Audit & Compliance

- **Permission Audit Logs**: Track all permission checks and usage
- **Access Request Tracking**: Log temporary access requests and approvals
- **Security Events**: Monitor permission failures and security incidents
- **Compliance Reporting**: Generate reports for security compliance

## Quick Start

### 1. Setup Permission Provider

```tsx
import { PermissionProvider } from "@/packages/auth/lib/rbac";

function App() {
  return (
    <PermissionProvider auditLogger={auditLogger}>
      <YourApp />
    </PermissionProvider>
  );
}
```

### 2. Use Permission Hooks

```tsx
import {
  usePermission,
  usePermissions,
  PermissionGate,
} from "@/packages/auth/lib/rbac";

function CourseManagement() {
  const { hasPermission: canCreate } = usePermission("courses:create");
  const { hasPermission: canDelete } = usePermission("courses:delete");

  return (
    <div>
      {canCreate && <button>Create Course</button>}

      <PermissionGate
        permission="courses:read"
        fallback={<div>No access to courses</div>}
      >
        <CourseList />
      </PermissionGate>
    </div>
  );
}
```

### 3. Protect API Routes

```typescript
import { withPermissions } from "@/packages/auth/lib/rbac";

async function createCourse(req: NextRequest) {
  // Your course creation logic
  return NextResponse.json({ course: newCourse });
}

export const POST = withPermissions(createCourse, {
  permissions: ["courses:create"],
  requireAll: true,
});
```

## Permission Categories

### Courses (`courses:*`)

- `courses:create` - Create new courses
- `courses:read` - View courses
- `courses:update` - Edit course information
- `courses:delete` - Delete courses
- `courses:publish` - Publish courses
- `courses:archive` - Archive courses
- `course-content:*` - Manage course content
- `enrollments:*` - Manage course enrollments
- `assessments:*` - Manage course assessments
- `progress:*` - Track and manage progress

### Training (`training-*`)

- `training-programs:*` - Manage training programs
- `training-sessions:*` - Handle training sessions
- `training-requests:*` - Process training requests
- `training-records:*` - Access training records
- `certifications:*` - Manage certifications

### Users (`users:*`, `roles:*`, `profiles:*`)

- `users:*` - User account management
- `roles:*` - Role assignment and management
- `profiles:*` - User profile management
- `organizations:*` - Organization management

### Reports (`reports:*`, `analytics:*`)

- `reports:*` - Standard reporting
- `analytics:*` - Advanced analytics
- `audit-logs:*` - Audit log access
- `metrics:*` - Performance metrics
- `financial-reports:*` - Financial reporting

### Admin (`system:*`, `security:*`)

- `system:*` - System configuration
- `security:*` - Security management
- `integrations:*` - Integration management
- `tenants:*` - Multi-tenant management
- `licenses:*` - License management

## API Reference

### Hooks

#### `usePermission(permission: AllPermissions)`

Check a single permission for the current user.

```tsx
const { hasPermission, isLoading, error } = usePermission("courses:create");
```

#### `usePermissions(permissions: AllPermissions[])`

Check multiple permissions at once.

```tsx
const {
  permissions,
  hasAnyPermission,
  hasAllPermissions,
  grantedPermissions,
  deniedPermissions,
} = usePermissions(["courses:create", "courses:update"]);
```

#### `useUserPermissions()`

Get all permissions for the current user.

```tsx
const { permissions, isLoading, error } = useUserPermissions();
```

### Components

#### `<PermissionGate>`

Conditionally render content based on permissions.

```tsx
<PermissionGate
  permission="courses:read"
  fallback={<div>Access denied</div>}
  loading={<div>Loading...</div>}
>
  <CourseContent />
</PermissionGate>
```

#### `withPermission(Component, permission, fallback?)`

Higher-order component for permission-based rendering.

```tsx
const AdminPanel = withPermission(
  AdminComponent,
  "system:configure",
  AccessDeniedComponent
);
```

### Middleware

#### `withPermissions(handler, options)`

Protect API routes with permission checks.

```typescript
export const POST = withPermissions(handler, {
  permissions: ["courses:create"],
  requireAll: true,
  unauthorizedHandler: (req, reason) =>
    NextResponse.json(
      {
        error: "Access denied",
        reason,
      },
      { status: 403 }
    ),
});
```

#### `requirePermissions(permissions, options)`

Decorator for permission-based route protection.

```typescript
const handler = requirePermissions(["admin:configure"])(async req => {
  // Admin-only logic
});
```

### Services

#### `RBACService`

Core service for permission evaluation.

```typescript
const rbacService = new RBACService(auditLogger);
const result = await rbacService.hasPermission(userId, permission, context);
```

#### `RoleHierarchyManager`

Manage role inheritance and hierarchies.

```typescript
const hierarchyManager = new RoleHierarchyManager();
const canManage = hierarchyManager.canManageUser(managerRoles, targetRoles);
```

#### `TemporaryAccessManager`

Handle temporary and emergency access requests.

```typescript
const accessManager = new TemporaryAccessManager();
const requestId = await accessManager.requestAccess({
  userId: "user123",
  permissions: ["system:backup"],
  duration: 240, // 4 hours
  urgencyLevel: "emergency",
});
```

## Common Patterns

### Conditional UI Rendering

```tsx
function Dashboard() {
  const { permissions } = usePermissions([
    "courses:read",
    "users:read",
    "reports:read",
  ]);

  return (
    <div>
      {permissions["courses:read"] && <CoursesWidget />}
      {permissions["users:read"] && <UsersWidget />}
      {permissions["reports:read"] && <ReportsWidget />}
    </div>
  );
}
```

### Navigation Menu

```tsx
function Navigation() {
  const { canNavigate } = usePermissionNavigation();

  const menuItems = [
    { path: "/courses", permission: "courses:read", label: "Courses" },
    { path: "/users", permission: "users:read", label: "Users" },
    { path: "/admin", permission: "system:configure", label: "Admin" },
  ];

  return (
    <nav>
      {menuItems.map(item => (
        <ConditionalNavItem
          key={item.path}
          permission={item.permission}
          {...item}
        />
      ))}
    </nav>
  );
}
```

### API Route Protection

```typescript
// Basic protection
export const GET = withPermissions(handler, {
  permissions: ["courses:read"],
});

// Multiple permissions (ANY)
export const POST = withPermissions(handler, {
  permissions: ["courses:create", "courses:update"],
  requireAll: false,
});

// Multiple permissions (ALL)
export const DELETE = withPermissions(handler, {
  permissions: ["courses:delete", "courses:archive"],
  requireAll: true,
});
```

### Dynamic Permission Checks

```typescript
async function updateCourse(req: NextRequest) {
  const { courseId } = await req.json();
  const permissionChecker = createPermissionChecker();

  // Check ownership-based permission
  const course = await getCourse(courseId);
  if (course.ownerId !== userId) {
    const hasGlobalUpdate = await permissionChecker.hasPermission(
      req,
      "courses:update"
    );

    if (!hasGlobalUpdate) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  }

  // Proceed with update
}
```

## Configuration

### Environment Variables

```env
# Required for permission middleware
NEXTAUTH_SECRET=your-secret-key

# Optional: Custom audit logging
RBAC_AUDIT_ENDPOINT=https://your-audit-service.com/logs
RBAC_CACHE_TIMEOUT=300000
```

### Database Integration

The RBAC system requires database integration for:

- User role assignments
- Permission storage
- Audit logging
- Temporary access tracking

Implement the following methods in your RBAC service:

- `getUserRoles(userId: string): Promise<Role[]>`
- `getParentRoles(roleIds: string[]): Promise<Role[]>`
- `fetchTemporaryAccess(userId: string): Promise<TemporaryAccess[]>`

## Security Considerations

1. **Principle of Least Privilege**: Grant minimal necessary permissions
2. **Regular Audits**: Review permission assignments and usage
3. **Time-Limited Access**: Use temporary access for elevated permissions
4. **Audit Logging**: Enable comprehensive permission audit trails
5. **Role Hierarchy**: Use inheritance to simplify permission management
6. **Condition-Based Access**: Implement additional security conditions

## Examples

See the `/examples` directory for:

- Complete API route implementations
- React component examples
- Role configuration templates
- Permission audit implementations
- Temporary access workflows

## Migration Guide

When upgrading from basic role-based access:

1. **Map Existing Roles**: Convert current roles to new permission system
2. **Update Components**: Replace role checks with permission checks
3. **Migrate API Routes**: Add permission middleware to protected routes
4. **Enable Auditing**: Implement audit logging for compliance
5. **Test Thoroughly**: Verify all permission combinations work correctly

For detailed migration instructions, see `MIGRATION.md`.
