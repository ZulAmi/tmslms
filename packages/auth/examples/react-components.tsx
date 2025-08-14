/**
 * Example React components demonstrating RBAC permission hooks
 */

import React from 'react';
import { 
  usePermission, 
  usePermissions, 
  useUserPermissions,
  PermissionGate,
  withPermission,
  usePermissionNavigation,
  usePermissionClasses
} from '../lib/rbac/hooks';

// Course Management Component
export function CourseManagement() {
  const { hasPermission: canCreate, isLoading: createLoading } = usePermission('courses:create');
  const { hasPermission: canUpdate, isLoading: updateLoading } = usePermission('courses:update');
  const { hasPermission: canDelete, isLoading: deleteLoading } = usePermission('courses:delete');

  if (createLoading || updateLoading || deleteLoading) {
    return <div className="loading">Loading permissions...</div>;
  }

  return (
    <div className="course-management">
      <h2>Course Management</h2>
      
      <div className="course-list">
        {/* Course list would be rendered here */}
        <div className="course-item">
          <h3>Sample Course</h3>
          <p>Course description...</p>
          
          <div className="course-actions">
            {canUpdate && (
              <button className="btn btn-primary">Edit Course</button>
            )}
            
            {canDelete && (
              <button className="btn btn-danger">Delete Course</button>
            )}
          </div>
        </div>
      </div>

      {canCreate && (
        <div className="create-section">
          <button className="btn btn-success">Create New Course</button>
        </div>
      )}
    </div>
  );
}

// User Management with Multiple Permissions
export function UserManagement() {
  const { 
    permissions, 
    hasAnyPermission, 
    hasAllPermissions,
    isLoading,
    grantedPermissions,
    deniedPermissions 
  } = usePermissions([
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'roles:assign'
  ]);

  if (isLoading) {
    return <div className="loading">Loading user management permissions...</div>;
  }

  if (!hasAnyPermission) {
    return (
      <div className="no-access">
        <h2>Access Denied</h2>
        <p>You don't have permission to access user management.</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <h2>User Management</h2>
      
      <div className="permission-debug">
        <h4>Your Permissions:</h4>
        <ul>
          {grantedPermissions.map(permission => (
            <li key={permission} className="permission-granted">
              ✓ {permission}
            </li>
          ))}
          {deniedPermissions.map(permission => (
            <li key={permission} className="permission-denied">
              ✗ {permission}
            </li>
          ))}
        </ul>
      </div>

      <div className="user-actions">
        {permissions['users:create'] && (
          <button className="btn btn-success">Create User</button>
        )}
        
        {permissions['users:read'] && (
          <button className="btn btn-info">View Users</button>
        )}
        
        {permissions['users:update'] && (
          <button className="btn btn-warning">Update Users</button>
        )}
        
        {permissions['users:delete'] && (
          <button className="btn btn-danger">Delete Users</button>
        )}
        
        {permissions['roles:assign'] && (
          <button className="btn btn-secondary">Manage Roles</button>
        )}
      </div>

      {hasAllPermissions && (
        <div className="admin-notice">
          <p>You have full user management permissions.</p>
        </div>
      )}
    </div>
  );
}

// Permission Gate Examples
export function DashboardContent() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {/* Simple permission gate */}
      <PermissionGate 
        permission="reports:read"
        fallback={<div className="no-access">Reports not available</div>}
        loading={<div className="loading">Loading reports...</div>}
      >
        <div className="reports-section">
          <h2>Reports</h2>
          <p>Your reports content here...</p>
        </div>
      </PermissionGate>

      {/* Multiple permissions gate - user needs ANY */}
      <PermissionGate 
        permissions={['analytics:read', 'reports:read']}
        requireAll={false}
        fallback={<div className="no-access">Analytics not available</div>}
      >
        <div className="analytics-section">
          <h2>Analytics</h2>
          <p>Analytics content here...</p>
        </div>
      </PermissionGate>

      {/* Multiple permissions gate - user needs ALL */}
      <PermissionGate 
        permissions={['system:configure', 'system:backup']}
        requireAll={true}
        fallback={<div className="no-access">Admin tools not available</div>}
      >
        <div className="admin-tools">
          <h2>System Administration</h2>
          <button>Configure System</button>
          <button>Backup System</button>
        </div>
      </PermissionGate>
    </div>
  );
}

// Navigation Component with Permission-based Menu
export function NavigationMenu() {
  const { canNavigate, getAccessibleRoutes } = usePermissionNavigation();
  const [accessibleRoutes, setAccessibleRoutes] = React.useState<string[]>([]);

  React.useEffect(() => {
    const checkRoutes = async () => {
      const routes = await getAccessibleRoutes({
        '/courses': 'courses:read',
        '/users': 'users:read',
        '/reports': 'reports:read',
        '/admin': 'system:configure',
        '/training': 'training-programs:read'
      });
      setAccessibleRoutes(routes);
    };

    checkRoutes();
  }, [getAccessibleRoutes]);

  return (
    <nav className="navigation">
      <ul className="nav-menu">
        {accessibleRoutes.includes('/courses') && (
          <li><a href="/courses">Courses</a></li>
        )}
        
        {accessibleRoutes.includes('/training') && (
          <li><a href="/training">Training</a></li>
        )}
        
        {accessibleRoutes.includes('/users') && (
          <li><a href="/users">Users</a></li>
        )}
        
        {accessibleRoutes.includes('/reports') && (
          <li><a href="/reports">Reports</a></li>
        )}
        
        {accessibleRoutes.includes('/admin') && (
          <li><a href="/admin">Administration</a></li>
        )}
      </ul>
    </nav>
  );
}

// Component with Permission-based Styling
export function StatusIndicator({ type }: { type: 'create' | 'update' | 'delete' }) {
  const permission = `courses:${type}`;
  const classes = usePermissionClasses(permission as any, {
    granted: 'status-enabled',
    denied: 'status-disabled',
    loading: 'status-loading'
  });

  return (
    <div className={`status-indicator ${classes}`}>
      {type.toUpperCase()} Permission
    </div>
  );
}

// User Permissions Display Component
export function UserPermissionsDisplay() {
  const { permissions, isLoading, error } = useUserPermissions();

  if (isLoading) {
    return <div className="loading">Loading your permissions...</div>;
  }

  if (error) {
    return <div className="error">Error loading permissions: {error}</div>;
  }

  const groupedPermissions = permissions.reduce((groups, permission) => {
    const [module] = permission.split(':');
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(permission);
    return groups;
  }, {} as Record<string, string[]>);

  return (
    <div className="user-permissions">
      <h3>Your Permissions</h3>
      
      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
        <div key={module} className="permission-group">
          <h4>{module.charAt(0).toUpperCase() + module.slice(1)}</h4>
          <ul>
            {modulePermissions.map(permission => (
              <li key={permission} className="permission-item">
                {permission}
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      <div className="permission-summary">
        <p>Total permissions: {permissions.length}</p>
      </div>
    </div>
  );
}

// Higher-Order Component Example
const AdminOnlyComponent = withPermission(
  function AdminPanel() {
    return (
      <div className="admin-panel">
        <h2>Admin Panel</h2>
        <p>This component is only visible to administrators.</p>
        <button>System Settings</button>
        <button>User Management</button>
        <button>Security Configuration</button>
      </div>
    );
  },
  'system:configure',
  function AccessDenied() {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You need administrator privileges to view this content.</p>
      </div>
    );
  }
);

// Complex Permission Logic Component
export function AdvancedCourseEditor() {
  const { hasPermission: canEdit } = usePermission('courses:update');
  const { hasPermission: canPublish } = usePermission('courses:publish');
  const { hasPermission: canDelete } = usePermission('courses:delete');
  const { permissions: bulkPermissions } = usePermissions([
    'course-content:create',
    'course-content:update',
    'course-content:delete',
    'assessments:create',
    'assessments:update'
  ]);

  const hasContentPermissions = bulkPermissions['course-content:create'] && 
                                bulkPermissions['course-content:update'];
  
  const hasAssessmentPermissions = bulkPermissions['assessments:create'] && 
                                   bulkPermissions['assessments:update'];

  return (
    <div className="course-editor">
      <h2>Course Editor</h2>
      
      {canEdit ? (
        <div className="editor-content">
          <div className="basic-editor">
            <h3>Basic Course Information</h3>
            <input placeholder="Course Title" />
            <textarea placeholder="Course Description" />
          </div>

          {hasContentPermissions && (
            <div className="content-editor">
              <h3>Course Content</h3>
              <button>Add Lesson</button>
              <button>Add Module</button>
              <button>Upload Materials</button>
            </div>
          )}

          {hasAssessmentPermissions && (
            <div className="assessment-editor">
              <h3>Assessments</h3>
              <button>Create Quiz</button>
              <button>Create Assignment</button>
              <button>Create Exam</button>
            </div>
          )}

          <div className="editor-actions">
            <button className="btn btn-primary">Save Draft</button>
            
            {canPublish && (
              <button className="btn btn-success">Publish Course</button>
            )}
            
            {canDelete && (
              <button className="btn btn-danger">Delete Course</button>
            )}
          </div>
        </div>
      ) : (
        <div className="no-edit-access">
          <p>You don't have permission to edit courses.</p>
        </div>
      )}
    </div>
  );
}

// Export the admin component
export { AdminOnlyComponent };
