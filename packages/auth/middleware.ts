import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Define user roles enum locally since Prisma client may not be available in middleware
enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  TENANT_ADMIN = "TENANT_ADMIN", 
  ORG_ADMIN = "ORG_ADMIN",
  MANAGER = "MANAGER",
  INSTRUCTOR = "INSTRUCTOR",
  STUDENT = "STUDENT",
  LEARNER = "LEARNER",
  USER = "USER",
  HR_PERSONNEL = "HR_PERSONNEL",
  FINANCE_OFFICER = "FINANCE_OFFICER",
  AUDITOR = "AUDITOR"
}

// Define protected routes and their required permissions
const protectedRoutes = {
  // Admin routes
  "/admin": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN],
  "/admin/users": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN],
  "/admin/settings": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN],
  "/admin/security": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.AUDITOR],
  
  // LMS routes
  "/lms/courses/create": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.INSTRUCTOR],
  "/lms/courses/manage": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.INSTRUCTOR],
  "/lms/assessments/create": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.INSTRUCTOR],
  
  // TMS routes
  "/tms/programs/create": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.INSTRUCTOR],
  "/tms/sessions/manage": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.INSTRUCTOR],
  "/tms/requests": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_PERSONNEL],
  
  // Finance routes
  "/finance": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.FINANCE_OFFICER],
  "/finance/funding": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.FINANCE_OFFICER, UserRole.HR_PERSONNEL],
  
  // API routes
  "/api/admin": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN],
  "/api/users": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN],
  "/api/reports": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.MANAGER, UserRole.AUDITOR]
}

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth",
  "/auth/signin",
  "/auth/signup",
  "/auth/reset-password",
  "/auth/verify-email",
  "/api/auth",
  "/api/health",
  "/about",
  "/contact",
  "/privacy",
  "/terms"
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and API auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  )

  // Get the token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Redirect to signin if accessing protected route without token
  if (!isPublicRoute && !token) {
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // If user is authenticated, check route permissions
  if (token) {
    // Check if user account is active
    if (token.status && token.status !== "ACTIVE") {
      const errorUrl = new URL("/auth/error", request.url)
      errorUrl.searchParams.set("error", "AccountInactive")
      return NextResponse.redirect(errorUrl)
    }

    // Check MFA requirements for sensitive routes
    const requiresMFA = isSensitiveRoute(pathname)
    if (requiresMFA && token.mfaEnabled && !token.mfaVerified) {
      const mfaUrl = new URL("/auth/mfa", request.url)
      mfaUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(mfaUrl)
    }

    // Check role-based permissions
    const requiredRoles = getRequiredRoles(pathname)
    if (requiredRoles.length > 0 && !requiredRoles.includes(token.role as unknown as UserRole)) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Forbidden", 
          message: "You don't have permission to access this resource" 
        }),
        { 
          status: 403, 
          headers: { "content-type": "application/json" } 
        }
      )
    }

    // Check tenant-specific access
    if (pathname.startsWith("/admin") && !isSystemAdmin(token.role as unknown as UserRole)) {
      // Ensure user can only access their tenant's data
      const tenantId = getTenantFromPath(pathname)
      if (tenantId && tenantId !== token.tenantId) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Forbidden", 
            message: "Access to this tenant is not allowed" 
          }),
          { 
            status: 403, 
            headers: { "content-type": "application/json" } 
          }
        )
      }
    }

    // Log access for audit purposes
    await logAccess({
      userId: token.id as string,
      path: pathname,
      method: request.method,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || "",
      timestamp: new Date()
    })

    // Add security headers
    const response = NextResponse.next()
    addSecurityHeaders(response)
    
    return response
  }

  return NextResponse.next()
}

function getRequiredRoles(pathname: string): UserRole[] {
  // Find the most specific route match
  const matchedRoute = Object.keys(protectedRoutes)
    .filter(route => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0] // Get longest match (most specific)

  return matchedRoute ? protectedRoutes[matchedRoute] : []
}

function isSensitiveRoute(pathname: string): boolean {
  const sensitiveRoutes = [
    "/admin/security",
    "/admin/users",
    "/finance",
    "/api/admin",
    "/api/users",
    "/api/finance"
  ]
  
  return sensitiveRoutes.some(route => pathname.startsWith(route))
}

function isSystemAdmin(role: UserRole): boolean {
  return [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(role)
}

function getTenantFromPath(pathname: string): string | null {
  // Extract tenant ID from path like /admin/tenant/123/...
  const match = pathname.match(/\/admin\/tenant\/([^\/]+)/)
  return match ? match[1] : null
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  )
}

async function logAccess(data: {
  userId: string
  path: string
  method: string
  ipAddress: string
  userAgent: string
  timestamp: Date
}) {
  // In production, you would log this to your database or logging service
  try {
    // This would be implemented with your database client
    console.log(`[ACCESS] ${data.timestamp.toISOString()} - User ${data.userId} accessed ${data.method} ${data.path} from ${data.ipAddress}`)
  } catch (error) {
    console.error("Failed to log access:", error)
  }
}

function addSecurityHeaders(response: NextResponse) {
  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  
  // CSP header (adjust based on your needs)
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'"
  )
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
