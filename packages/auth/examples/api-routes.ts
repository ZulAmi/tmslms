/**
 * Example API routes demonstrating RBAC permission middleware
 * These files would be placed in the app/api directory
 */

// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, createPermissionChecker } from '../../../packages/auth/lib/rbac/middleware';

// Course list endpoint - requires courses:read permission
async function getCourses(req: NextRequest) {
  try {
    // Your course fetching logic here
    const courses = [
      { id: '1', title: 'Introduction to Programming', status: 'active' },
      { id: '2', title: 'Advanced React', status: 'draft' }
    ];

    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// Course creation endpoint - requires courses:create permission
async function createCourse(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Your course creation logic here
    const newCourse = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      status: 'draft',
      createdAt: new Date()
    };

    return NextResponse.json({ course: newCourse }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

// Apply permission middleware
export const GET = withPermissions(getCourses, {
  permissions: ['courses:read'],
  requireAll: true
});

export const POST = withPermissions(createCourse, {
  permissions: ['courses:create'],
  requireAll: true
});

// app/api/courses/[id]/route.ts
async function getCourse(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseId = params.id;
    
    // Your single course fetching logic
    const course = {
      id: courseId,
      title: 'Sample Course',
      description: 'Course description',
      status: 'active'
    };

    return NextResponse.json({ course });
  } catch (error) {
    return NextResponse.json(
      { error: 'Course not found' },
      { status: 404 }
    );
  }
}

async function updateCourse(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseId = params.id;
    const body = await req.json();
    
    // Your course update logic
    const updatedCourse = {
      id: courseId,
      ...body,
      updatedAt: new Date()
    };

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

async function deleteCourse(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseId = params.id;
    
    // Your course deletion logic
    
    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}

// Apply different permissions for different HTTP methods
export const GET_SINGLE = withPermissions(getCourse, {
  permissions: ['courses:read'],
  requireAll: true
});

export const PUT = withPermissions(updateCourse, {
  permissions: ['courses:update'],
  requireAll: true
});

export const DELETE = withPermissions(deleteCourse, {
  permissions: ['courses:delete'],
  requireAll: true
});

// app/api/admin/users/route.ts
async function getUsers(req: NextRequest) {
  try {
    // Check for additional conditional permissions within the handler
    const permissionChecker = createPermissionChecker();
    
    // Check if user can see sensitive user data
    const canViewSensitiveData = await permissionChecker.hasPermission(req, 'users:read');
    
    const users = [
      {
        id: '1',
        name: 'John Doe',
        email: canViewSensitiveData ? 'john@example.com' : '*****@*****.com',
        role: 'user'
      }
    ];

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

async function createUser(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Additional permission check for role assignment
    if (body.role && body.role !== 'user') {
      const permissionChecker = createPermissionChecker();
      const canAssignRoles = await permissionChecker.hasPermission(req, 'roles:assign');
      
      if (!canAssignRoles) {
        return NextResponse.json(
          { error: 'Insufficient permissions to assign roles' },
          { status: 403 }
        );
      }
    }
    
    // Your user creation logic
    const newUser = {
      id: Date.now().toString(),
      name: body.name,
      email: body.email,
      role: body.role || 'user',
      createdAt: new Date()
    };

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Admin endpoints with multiple permission requirements
export const GET_USERS = withPermissions(getUsers, {
  permissions: ['users:read'],
  requireAll: true,
  unauthorizedHandler: (req, reason) => NextResponse.json(
    { error: 'Admin access required', reason },
    { status: 403 }
  )
});

export const POST_USER = withPermissions(createUser, {
  permissions: ['users:create'],
  requireAll: true
});

// app/api/reports/advanced/route.ts
async function generateAdvancedReport(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type');
    
    const permissionChecker = createPermissionChecker();
    
    // Check specific permissions based on report type
    let requiredPermission: string;
    switch (reportType) {
      case 'financial':
        requiredPermission = 'financial-reports:read';
        break;
      case 'audit':
        requiredPermission = 'audit-logs:read';
        break;
      case 'analytics':
        requiredPermission = 'analytics:read';
        break;
      default:
        requiredPermission = 'reports:read';
    }
    
    const hasPermission = await permissionChecker.hasPermission(req, requiredPermission as any);
    if (!hasPermission) {
      return NextResponse.json(
        { error: `Permission required: ${requiredPermission}` },
        { status: 403 }
      );
    }
    
    // Generate report based on type
    const report = {
      type: reportType,
      generatedAt: new Date(),
      data: `Sample ${reportType} report data`
    };

    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Multiple permission options - user needs ANY of these permissions
export const GET_REPORT = withPermissions(generateAdvancedReport, {
  permissions: [
    'reports:read',
    'analytics:read',
    'financial-reports:read',
    'audit-logs:read'
  ],
  requireAll: false, // User needs ANY of these permissions
  unauthorizedHandler: (req, reason) => NextResponse.json(
    { 
      error: 'Insufficient permissions for report generation',
      required: 'One of: reports:read, analytics:read, financial-reports:read, audit-logs:read'
    },
    { status: 403 }
  )
});

// app/api/training/emergency-access/route.ts
import { TemporaryAccessManager } from '../../../packages/auth/lib/rbac/temporary-access';

const temporaryAccessManager = new TemporaryAccessManager();

async function requestEmergencyAccess(req: NextRequest) {
  try {
    const body = await req.json();
    
    const accessRequestId = await temporaryAccessManager.requestAccess({
      userId: body.userId,
      requestedBy: body.requestedBy,
      permissions: body.permissions,
      reason: body.reason,
      duration: body.duration || 60, // 1 hour default
      urgencyLevel: 'emergency',
      businessJustification: body.justification,
      accessType: 'emergency'
    });

    return NextResponse.json({ 
      requestId: accessRequestId,
      message: 'Emergency access request submitted'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 400 }
    );
  }
}

async function approveEmergencyAccess(req: NextRequest) {
  try {
    const body = await req.json();
    
    const approved = await temporaryAccessManager.processApproval({
      requestId: body.requestId,
      approvedBy: body.approvedBy,
      approved: body.approved,
      comments: body.comments,
      modifiedDuration: body.modifiedDuration
    });

    return NextResponse.json({ 
      approved,
      message: approved ? 'Access granted' : 'Access denied'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Approval failed' },
      { status: 400 }
    );
  }
}

// Emergency access requires admin permissions
export const POST_REQUEST = withPermissions(requestEmergencyAccess, {
  permissions: ['system:maintenance'],
  requireAll: true
});

export const POST_APPROVE = withPermissions(approveEmergencyAccess, {
  permissions: ['system:configure'],
  requireAll: true
});
