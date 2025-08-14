/\*\*

- RBAC Integration Guide & Examples
-
- This file contains code examples and integration patterns for the TMS/LMS RBAC system.
- These are meant to be copied and adapted to your specific implementation.
  \*/

# /\*

1. # MAIN LAYOUT SETUP (app/layout.tsx)

import { PermissionProvider } from '../packages/auth/lib/rbac';
import { SessionProvider } from 'next-auth/react';

// Audit logger function
async function auditLogger(log: any) {
// Send audit logs to your logging service
await fetch('/api/audit/permissions', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(log)
});
}

export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (

<html lang="en">
<body>
<SessionProvider>
<PermissionProvider auditLogger={auditLogger}>
{children}
</PermissionProvider>
</SessionProvider>
</body>
</html>
);
}

# =========================================== 2. NEXTAUTH CONFIGURATION (packages/auth/lib/auth.ts)

import { ROLE_TEMPLATES } from './rbac';

export const authConfig = {
// ... existing configuration
callbacks: {
async jwt({ token, user, account }) {
if (user) {
token.id = user.id;
token.role = user.role;
token.tenantId = user.tenantId;
token.organizationId = user.organizationId;

        // Add permissions based on role
        const roleTemplate = ROLE_TEMPLATES[user.role as keyof typeof ROLE_TEMPLATES];
        if (roleTemplate) {
          token.permissions = roleTemplate.permissions;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string;
        session.user.organizationId = token.organizationId as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    }

}
};

# =========================================== 3. DASHBOARD COMPONENT (app/dashboard/page.tsx)

import {
PermissionGate,
usePermissions,
COMMON_PERMISSIONS,
PERMISSION_GROUPS
} from '../packages/auth/lib/rbac';

export default function Dashboard() {
const { permissions, isLoading } = usePermissions([
...PERMISSION_GROUPS.COURSE_BASIC,
...PERMISSION_GROUPS.USER_BASIC,
...PERMISSION_GROUPS.REPORTING_BASIC,
COMMON_PERMISSIONS.CONFIGURE_SYSTEM
]);

if (isLoading) {
return <div className="loading">Loading dashboard...</div>;
}

return (

<div className="dashboard">
<h1>TMS/LMS Dashboard</h1>

      <div className="dashboard-grid">
        {/* Course Management Section */}
        <PermissionGate
          permission="courses:read"
          fallback={<div className="widget-disabled">Courses not available</div>}
        >
          <div className="dashboard-widget">
            <h2>Course Management</h2>
            <div className="widget-stats">
              <div>Total Courses: 156</div>
              <div>Active Enrollments: 2,340</div>
            </div>
            <div className="widget-actions">
              {permissions['courses:create'] && (
                <button className="btn btn-primary">Create Course</button>
              )}
              <button className="btn btn-secondary">View All Courses</button>
            </div>
          </div>
        </PermissionGate>

        {/* Training Programs Section */}
        <PermissionGate
          permission="training-programs:read"
          fallback={<div className="widget-disabled">Training not available</div>}
        >
          <div className="dashboard-widget">
            <h2>Training Programs</h2>
            <div className="widget-stats">
              <div>Active Programs: 45</div>
              <div>Scheduled Sessions: 23</div>
            </div>
            <div className="widget-actions">
              {permissions['training-programs:create'] && (
                <button className="btn btn-primary">Create Program</button>
              )}
              <button className="btn btn-secondary">View Programs</button>
            </div>
          </div>
        </PermissionGate>

        {/* System Administration Section */}
        <PermissionGate
          permission="system:configure"
          fallback={null}
        >
          <div className="dashboard-widget admin-widget">
            <h2>System Administration</h2>
            <div className="widget-stats">
              <div>System Status: Healthy</div>
              <div>Last Backup: 2 hours ago</div>
            </div>
            <div className="widget-actions">
              <button className="btn btn-warning">System Settings</button>
              <button className="btn btn-info">View Logs</button>
            </div>
          </div>
        </PermissionGate>
      </div>
    </div>

);
}

# =========================================== 4. API ROUTE PROTECTION (app/api/courses/route.ts)

import { withPermissions } from '../../../packages/auth/lib/rbac';
import { NextRequest, NextResponse } from 'next/server';

async function createCourse(req: NextRequest) {
const { title, description } = await req.json();

// Your course creation logic here
const newCourse = {
id: Date.now(),
title,
description,
createdAt: new Date()
};

return NextResponse.json({ course: newCourse });
}

async function getCourses(req: NextRequest) {
// Your course fetching logic here
const courses = [
{ id: 1, title: 'React Fundamentals', status: 'published' },
{ id: 2, title: 'Advanced JavaScript', status: 'draft' }
];

return NextResponse.json({ courses });
}

// Protected routes with permission requirements
export const POST = withPermissions(createCourse, {
permissions: ['courses:create'],
requireAll: true
});

export const GET = withPermissions(getCourses, {
permissions: ['courses:read'],
requireAll: true
});

# =========================================== 5. NAVIGATION COMPONENT (components/Navigation.tsx)

import { usePermissionNavigation } from '../packages/auth/lib/rbac';
import { useEffect, useState } from 'react';

interface MenuItem {
path: string;
label: string;
permission: string;
icon?: string;
children?: MenuItem[];
}

const menuStructure: MenuItem[] = [
{
path: '/dashboard',
label: 'Dashboard',
permission: 'courses:read',
icon: '🏠'
},
{
path: '/courses',
label: 'Courses',
permission: 'courses:read',
icon: '📚',
children: [
{ path: '/courses/catalog', label: 'Course Catalog', permission: 'courses:read' },
{ path: '/courses/create', label: 'Create Course', permission: 'courses:create' },
{ path: '/courses/manage', label: 'Manage Courses', permission: 'courses:update' }
]
},
{
path: '/admin',
label: 'Administration',
permission: 'system:configure',
icon: '⚙️'
}
];

export function Navigation() {
const { getAccessibleRoutes } = usePermissionNavigation();
const [accessibleItems, setAccessibleItems] = useState<MenuItem[]>([]);

useEffect(() => {
async function filterMenuItems() {
const routePermissions: Record<string, string> = {};

      // Build route-permission mapping
      function mapRoutes(items: MenuItem[]) {
        items.forEach(item => {
          routePermissions[item.path] = item.permission;
          if (item.children) {
            mapRoutes(item.children);
          }
        });
      }

      mapRoutes(menuStructure);

      // Get accessible routes
      const accessiblePaths = await getAccessibleRoutes(routePermissions);

      // Filter menu items based on accessible routes
      function filterItems(items: MenuItem[]): MenuItem[] {
        return items.filter(item => {
          if (!accessiblePaths.includes(item.path)) {
            return false;
          }

          if (item.children) {
            item.children = filterItems(item.children);
          }

          return true;
        });
      }

      setAccessibleItems(filterItems(menuStructure));
    }

    filterMenuItems();

}, [getAccessibleRoutes]);

return (

<nav className="navigation">
<div className="nav-brand">
<h1>TMS/LMS</h1>
</div>

      <ul className="nav-menu">
        {accessibleItems.map(item => (
          <NavigationItem key={item.path} item={item} />
        ))}
      </ul>
    </nav>

);
}

function NavigationItem({ item }: { item: MenuItem }) {
return (

<li className="nav-item">
<a href={item.path} className="nav-link">
<span className="nav-icon">{item.icon}</span>
<span className="nav-label">{item.label}</span>
</a>
</li>
);
}

# =========================================== 6. COURSE MANAGEMENT COMPONENT (app/courses/manage/page.tsx)

import {
usePermissions,
PermissionGate
} from '../../../packages/auth/lib/rbac';

export default function CourseManagement() {
const { permissions, isLoading } = usePermissions([
'courses:create',
'courses:update',
'courses:delete',
'courses:publish'
]);

const courses = [
{ id: 1, title: 'React Fundamentals', status: 'draft', enrollments: 0 },
{ id: 2, title: 'Advanced JavaScript', status: 'published', enrollments: 156 }
];

if (isLoading) {
return <div className="loading">Loading course management...</div>;
}

return (

<div className="course-management">
<div className="page-header">
<h1>Course Management</h1>

        <PermissionGate permission="courses:create">
          <button className="btn btn-primary">
            Create New Course
          </button>
        </PermissionGate>
      </div>

      <div className="course-list">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-info">
              <h3>{course.title}</h3>
              <div className="course-meta">
                <span className={`status ${course.status}`}>
                  {course.status}
                </span>
                <span>Enrollments: {course.enrollments}</span>
              </div>
            </div>

            <div className="course-actions">
              <PermissionGate permission="courses:update">
                <button className="btn btn-sm btn-secondary">
                  Edit
                </button>
              </PermissionGate>

              <PermissionGate permission="courses:publish">
                {course.status === 'draft' && (
                  <button className="btn btn-sm btn-success">
                    Publish
                  </button>
                )}
              </PermissionGate>

              <PermissionGate permission="courses:delete">
                <button className="btn btn-sm btn-danger">
                  Delete
                </button>
              </PermissionGate>
            </div>
          </div>
        ))}
      </div>
    </div>

);
}

# =========================================== 7. EMERGENCY ACCESS COMPONENT (components/EmergencyAccess.tsx)

import { useState } from 'react';
import { TemporaryAccessManager } from '../packages/auth/lib/rbac';

const accessManager = new TemporaryAccessManager();

export function EmergencyAccessRequest() {
const [isRequesting, setIsRequesting] = useState(false);
const [requestId, setRequestId] = useState<string | null>(null);

async function handleEmergencyRequest() {
setIsRequesting(true);

    try {
      const id = await accessManager.requestAccess({
        userId: 'current-user-id',
        requestedBy: 'current-user-id',
        permissions: ['system:backup', 'system:restore'],
        reason: 'Emergency system recovery needed',
        duration: 240, // 4 hours
        urgencyLevel: 'emergency',
        businessJustification: 'Critical system failure requires immediate backup and restore access',
        accessType: 'emergency'
      });

      setRequestId(id);
    } catch (error) {
      console.error('Emergency access request failed:', error);
    } finally {
      setIsRequesting(false);
    }

}

return (

<div className="emergency-access">
<h3>Emergency Access Request</h3>

      {!requestId ? (
        <div className="request-form">
          <p>Request emergency access to system backup and restore functions.</p>
          <button
            onClick={handleEmergencyRequest}
            disabled={isRequesting}
            className="btn btn-danger"
          >
            {isRequesting ? 'Requesting...' : 'Request Emergency Access'}
          </button>
        </div>
      ) : (
        <div className="request-status">
          <p>Emergency access request submitted.</p>
          <p>Request ID: <code>{requestId}</code></p>
          <p>Status: Pending approval</p>
        </div>
      )}
    </div>

);
}

# =========================================== 8. PERMISSION AUDIT DASHBOARD (app/admin/audit/page.tsx)

import { useUserPermissions } from '../../../packages/auth/lib/rbac';

export default function PermissionAuditDashboard() {
const { permissions } = useUserPermissions();

// Mock audit data - in real app, fetch from your audit service
const auditLogs = [
{
id: 1,
user: 'john.doe@example.com',
permission: 'courses:delete',
resource: 'course-123',
granted: false,
timestamp: new Date(),
reason: 'Permission not found'
},
{
id: 2,
user: 'admin@example.com',
permission: 'system:backup',
resource: 'system',
granted: true,
timestamp: new Date(),
reason: null
}
];

return (

<div className="audit-dashboard">
<h1>Permission Audit Dashboard</h1>

      <div className="audit-stats">
        <div className="stat-card">
          <h3>Total Permission Checks</h3>
          <div className="stat-number">15,234</div>
        </div>

        <div className="stat-card">
          <h3>Access Denied</h3>
          <div className="stat-number">432</div>
        </div>

        <div className="stat-card">
          <h3>Emergency Access Requests</h3>
          <div className="stat-number">12</div>
        </div>
      </div>

      <div className="audit-logs">
        <h2>Recent Audit Logs</h2>
        <table className="audit-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Permission</th>
              <th>Resource</th>
              <th>Result</th>
              <th>Timestamp</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map(log => (
              <tr key={log.id}>
                <td>{log.user}</td>
                <td><code>{log.permission}</code></td>
                <td>{log.resource}</td>
                <td>
                  <span className={log.granted ? 'granted' : 'denied'}>
                    {log.granted ? '✅ Granted' : '❌ Denied'}
                  </span>
                </td>
                <td>{log.timestamp.toLocaleString()}</td>
                <td>{log.reason || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

);
}

# =========================================== 9. COMMON PATTERNS & UTILITIES

// Permission checking utility
import { createPermissionChecker } from '../packages/auth/lib/rbac';

export async function checkCourseAccess(req: NextRequest, courseId: string) {
const permissionChecker = createPermissionChecker();

// Check basic permission
const canRead = await permissionChecker.hasPermission(req, 'courses:read');
if (!canRead) {
return false;
}

// Check ownership or advanced permissions
const course = await getCourse(courseId);
const userId = req.user?.id;

if (course.ownerId === userId) {
return true; // Owner can always access
}

// Check if user has global course management permissions
return await permissionChecker.hasPermission(req, 'courses:update');
}

// Bulk permission checking
export async function getBulkPermissions(req: NextRequest) {
const checker = createPermissionChecker();

const results = await checker.hasPermissions(req, [
'courses:create',
'courses:update',
'courses:delete',
'users:create',
'users:update',
'reports:read'
]);

return results;
}

// Role-based component rendering
export function RoleBasedWrapper({ children, allowedRoles }: {
children: React.ReactNode;
allowedRoles: string[];
}) {
const { data: session } = useSession();

if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
return <div>Access denied</div>;
}

return <>{children}</>;
}

\*/

export {}; // Make this file a module
