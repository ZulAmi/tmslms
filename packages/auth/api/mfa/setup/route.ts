import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { generateMFASetup, verifyTOTPCode } from "../../../lib/mfa"
import { getAuthenticatedUser, getAuthFromHeaders, logSecurityEvent } from "../../../lib/auth-utils"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// POST /api/auth/mfa/setup - Setup new MFA device
export async function POST(req: NextRequest) {
  try {
    // Try to get authenticated user (fallback to headers for development)
    let authUser = await getAuthenticatedUser(req)
    if (!authUser) {
      authUser = getAuthFromHeaders(req)
    }
    
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized - User authentication required" },
        { status: 401 }
      )
    }

    const { deviceName, deviceType, secret, backupCodes, verificationCode } = await req.json()

    // Validate required fields
    if (!deviceName || !deviceType || !verificationCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the TOTP code before saving
    if (deviceType === "TOTP" && !verifyTOTPCode(verificationCode, secret)) {
      return NextResponse.json(
        { error: "INVALID_MFA_CODE" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
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

    // Hash backup codes if provided
    let hashedBackupCodes: string[] | undefined
    if (backupCodes && Array.isArray(backupCodes)) {
      hashedBackupCodes = await Promise.all(
        backupCodes.map(code => bcrypt.hash(code, 12))
      )
    }

    // Create the MFA device
    const mfaDevice = await prisma.mFADevice.create({
      data: {
        userId: user.id,
        deviceName,
        deviceType,
        secret: deviceType === "TOTP" ? secret : undefined,
        backupCodes: hashedBackupCodes || [],
        isActive: true,
        isVerified: true,
        isPrimary: isFirstDevice
      }
    })

    // Log the MFA setup event
    await logSecurityEvent(
      user.id,
      "MFA_DEVICE_ADDED",
      `MFA device "${deviceName}" (${deviceType}) added`,
      req,
      {
        deviceType,
        deviceName,
        isPrimary: isFirstDevice
      }
    )

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
    console.error("MFA setup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
