import { authenticator } from "otplib"
import { toDataURL } from "qrcode"
import { randomBytes } from "crypto"

export interface MFASetupResult {
  secret: string
  qrCodeDataURL: string
  backupCodes: string[]
}

export interface MFADevice {
  id: string
  deviceName: string
  deviceType: "TOTP" | "SMS" | "EMAIL" | "HARDWARE_TOKEN" | "BIOMETRIC" | "BACKUP_CODES"
  isActive: boolean
  isVerified: boolean
  isPrimary: boolean
  secret?: string
  backupCodes?: string[]
}

/**
 * Generate a new TOTP secret and QR code for MFA setup
 */
export async function generateMFASetup(
  userEmail: string,
  appName: string = "TMSLMS"
): Promise<MFASetupResult> {
  // Generate a random secret
  const secret = authenticator.generateSecret()
  
  // Create the otpauth URL
  const otpauthURL = authenticator.keyuri(userEmail, appName, secret)
  
  // Generate QR code data URL
  const qrCodeDataURL = await toDataURL(otpauthURL)
  
  // Generate backup codes
  const backupCodes = generateBackupCodes()
  
  return {
    secret,
    qrCodeDataURL,
    backupCodes
  }
}

/**
 * Verify a TOTP code against a secret
 */
export function verifyTOTPCode(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch (error) {
    console.error("TOTP verification error:", error)
    return false
  }
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = randomBytes(4).toString('hex').toUpperCase()
    codes.push(code)
  }
  
  return codes
}

/**
 * Verify a backup code (this should check against encrypted stored codes)
 */
export function verifyBackupCode(
  inputCode: string, 
  storedCodes: string[]
): { isValid: boolean; remainingCodes: string[] } {
  const upperInputCode = inputCode.toUpperCase()
  const codeIndex = storedCodes.findIndex(code => code === upperInputCode)
  
  if (codeIndex === -1) {
    return { isValid: false, remainingCodes: storedCodes }
  }
  
  // Remove used code
  const remainingCodes = storedCodes.filter((_, index) => index !== codeIndex)
  
  return { isValid: true, remainingCodes }
}

/**
 * Send SMS MFA code (placeholder - implement with SMS service)
 */
export async function sendSMSMFACode(
  phoneNumber: string, 
  code: string
): Promise<boolean> {
  try {
    // In production, integrate with SMS service like Twilio, AWS SNS, etc.
    console.log(`SMS MFA code ${code} would be sent to ${phoneNumber}`)
    
    // Simulate SMS sending
    return true
  } catch (error) {
    console.error("SMS sending error:", error)
    return false
  }
}

/**
 * Send Email MFA code (placeholder - implement with email service)
 */
export async function sendEmailMFACode(
  email: string, 
  code: string
): Promise<boolean> {
  try {
    // In production, integrate with email service
    console.log(`Email MFA code ${code} would be sent to ${email}`)
    
    // Simulate email sending
    return true
  } catch (error) {
    console.error("Email sending error:", error)
    return false
  }
}

/**
 * Generate a random 6-digit MFA code
 */
export function generateMFACode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Validate MFA code format
 */
export function isValidMFACodeFormat(code: string): boolean {
  // TOTP codes are 6 digits
  return /^\d{6}$/.test(code)
}

/**
 * Check if MFA setup is complete for a user
 */
export function isMFASetupComplete(devices: MFADevice[]): boolean {
  return devices.some(device => 
    device.isActive && 
    device.isVerified && 
    (device.deviceType === "TOTP" || device.deviceType === "SMS" || device.deviceType === "EMAIL")
  )
}

/**
 * Get primary MFA device for a user
 */
export function getPrimaryMFADevice(devices: MFADevice[]): MFADevice | null {
  return devices.find(device => 
    device.isActive && 
    device.isVerified && 
    device.isPrimary
  ) || null
}

/**
 * Validate device name
 */
export function isValidDeviceName(name: string): boolean {
  return name.length >= 1 && name.length <= 50 && /^[a-zA-Z0-9\s\-_]+$/.test(name)
}

/**
 * Calculate MFA security score based on setup
 */
export function calculateMFASecurityScore(devices: MFADevice[]): number {
  let score = 0
  
  // Base score for having MFA enabled
  if (devices.length > 0) {
    score += 40
  }
  
  // Additional points for device types
  const deviceTypes = new Set(devices.map(d => d.deviceType))
  
  if (deviceTypes.has("TOTP")) score += 20 // Most secure
  if (deviceTypes.has("HARDWARE_TOKEN")) score += 25 // Most secure
  if (deviceTypes.has("SMS")) score += 10 // Less secure but better than nothing
  if (deviceTypes.has("EMAIL")) score += 5 // Least secure MFA
  if (deviceTypes.has("BACKUP_CODES")) score += 10 // Good for recovery
  
  // Bonus for multiple devices
  if (devices.filter(d => d.isActive && d.isVerified).length > 1) {
    score += 15
  }
  
  return Math.min(score, 100)
}
