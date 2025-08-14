import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export interface AuthenticatedUser {
  id: string
  email: string
  name?: string
  role: string
  organizationId?: string
}

/**
 * Get authenticated user from NextAuth JWT token
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Try to get token from NextAuth JWT
    const token = await getToken({ 
      req: req as any, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token?.email) {
      return null
    }

    // Get user from database with current info
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        isActive: true,
        emailVerified: true
      }
    })

    if (!user || !user.isActive) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
      role: user.role,
      organizationId: user.organizationId || undefined
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

/**
 * Simplified auth check using headers (for development/testing)
 */
export function getAuthFromHeaders(req: NextRequest): AuthenticatedUser | null {
  const userId = req.headers.get("x-user-id")
  const userEmail = req.headers.get("x-user-email")
  const userRole = req.headers.get("x-user-role") || "USER"

  if (!userId || !userEmail) {
    return null
  }

  return {
    id: userId,
    email: userEmail,
    role: userRole,
    organizationId: req.headers.get("x-user-org") || undefined
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthenticatedUser, requiredRole: string | string[]): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(user.role)
}

/**
 * Check if user belongs to organization
 */
export function belongsToOrganization(user: AuthenticatedUser, organizationId: string): boolean {
  return user.organizationId === organizationId
}

/**
 * Log security event for authenticated user
 */
export async function logSecurityEvent(
  userId: string,
  eventType: string,
  description: string,
  req: NextRequest,
  metadata?: any
) {
  try {
    await prisma.securityEvent.create({
      data: {
        userId,
        eventType,
        description,
        ipAddress: req.headers.get("x-forwarded-for") || 
                  req.headers.get("x-real-ip") || 
                  "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        metadata: metadata || {}
      }
    })
  } catch (error) {
    console.error("Failed to log security event:", error)
  }
}
