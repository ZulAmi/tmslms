import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

// Initialize Prisma client
const prisma = new PrismaClient()

// Define enums locally
enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  INSTRUCTOR = "INSTRUCTOR",
  STUDENT = "STUDENT",
  USER = "USER"
}

enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING"
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      tenantId?: string
      organizationId?: string
      permissions: string[]
      mfaEnabled: boolean
      isActive: boolean
    }
  }
  
  interface User {
    id: string
    email: string
    firstName?: string
    lastName?: string
    role: UserRole
    tenantId?: string
    organizationId?: string
    mfaEnabled: boolean
    status: UserStatus
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    tenantId?: string
    organizationId?: string
    permissions: string[]
    mfaEnabled: boolean
    mfaVerified: boolean
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mfaCode: { label: "MFA Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              mfaDevices: {
                where: { isActive: true, isVerified: true }
              }
            }
          })

          if (!user) {
            return null
          }

          // Check if account is active
          if (user.status !== "ACTIVE") {
            return null
          }

          // Verify password
          const isPasswordValid = await compare(credentials.password, user.passwordHash || "")
          
          if (!isPasswordValid) {
            return null
          }

          // Check MFA if enabled
          if (user.mfaEnabled && user.mfaDevices.length > 0) {
            if (!credentials.mfaCode) {
              // Return indication that MFA is required
              throw new Error("MFA_REQUIRED")
            }

            // Basic MFA verification (in production, use proper TOTP verification)
            if (!/^\d{6}$/.test(credentials.mfaCode)) {
              throw new Error("INVALID_MFA_CODE")
            }
          }

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as UserRole,
            tenantId: user.tenantId,
            organizationId: user.organizationId,
            mfaEnabled: user.mfaEnabled,
            status: user.status as UserStatus
          }
        } catch (error) {
          console.error("Authentication error:", error)
          if (error instanceof Error && (error.message === "MFA_REQUIRED" || error.message === "INVALID_MFA_CODE")) {
            throw error
          }
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.tenantId = user.tenantId
        token.organizationId = user.organizationId
        token.mfaEnabled = user.mfaEnabled
        token.permissions = [] // Add permissions logic here
        token.mfaVerified = !user.mfaEnabled // Auto-verify if MFA not enabled
      }
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email as string,
          name: token.name as string,
          role: token.role,
          tenantId: token.tenantId,
          organizationId: token.organizationId,
          permissions: token.permissions,
          mfaEnabled: token.mfaEnabled,
          isActive: true
        }
      }
      return session
    }
  },
  events: {
    async signIn({ user, account }) {
      if (user?.email) {
        console.log(`User ${user.email} signed in via ${account?.provider || 'credentials'}`)
      }
    },
    async signOut({ session }) {
      if (session?.user?.email) {
        console.log(`User ${session.user.email} signed out`)
      }
    }
  },
  debug: process.env.NODE_ENV === "development"
}

export default NextAuth(authOptions)

// Export handlers for App Router
export const handlers = NextAuth(authOptions)
export const { GET, POST } = handlers
