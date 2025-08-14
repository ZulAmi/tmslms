import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/auth/mfa/devices - Get user's MFA devices
export async function GET(req: NextRequest) {
  try {
    // In a real implementation, you would get the user from session
    // For now, we'll simulate with a query parameter
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      )
    }

    const devices = await prisma.mFADevice.findMany({
      where: { userId },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        isActive: true,
        isVerified: true,
        isPrimary: true,
        createdAt: true,
        lastUsedAt: true
      },
      orderBy: [
        { isPrimary: "desc" },
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json({ devices })

  } catch (error) {
    console.error("MFA devices fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/auth/mfa/devices - Create new MFA device (simplified)
export async function POST(req: NextRequest) {
  try {
    const { userId, deviceName, deviceType, secret, backupCodes, verificationCode } = await req.json()

    // Validate required fields
    if (!userId || !deviceName || !deviceType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { mfaDevices: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if this is the first MFA device (will be primary)
    const isFirstDevice = user.mfaDevices.length === 0

    // Create the MFA device
    const mfaDevice = await prisma.mFADevice.create({
      data: {
        userId: userId,
        deviceName,
        deviceType,
        secret: deviceType === "TOTP" ? secret : undefined,
        backupCodes: backupCodes || [],
        isActive: true,
        isVerified: true,
        isPrimary: isFirstDevice
      }
    })

    // Log the MFA setup event
    await prisma.securityEvent.create({
      data: {
        userId: userId,
        eventType: "MFA_DEVICE_ADDED",
        description: `MFA device "${deviceName}" (${deviceType}) added`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        metadata: {
          deviceType,
          deviceName,
          isPrimary: isFirstDevice
        }
      }
    })

    return NextResponse.json({
      success: true,
      device: {
        id: mfaDevice.id,
        deviceName: mfaDevice.deviceName,
        deviceType: mfaDevice.deviceType,
        isActive: mfaDevice.isActive,
        isVerified: mfaDevice.isVerified,
        isPrimary: mfaDevice.isPrimary,
        createdAt: mfaDevice.createdAt
      }
    })

  } catch (error) {
    console.error("MFA device creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
