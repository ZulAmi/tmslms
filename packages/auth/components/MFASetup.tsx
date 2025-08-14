"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { generateMFASetup, verifyTOTPCode, generateBackupCodes } from "../lib/mfa"

interface MFASetupProps {
  onComplete?: () => void
  onCancel?: () => void
}

export default function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const { data: session } = useSession()
  const [step, setStep] = useState<"generate" | "verify" | "backup" | "complete">("generate")
  const [secret, setSecret] = useState<string>("")
  const [qrCodeURL, setQRCodeURL] = useState<string>("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState<string>("")
  const [deviceName, setDeviceName] = useState<string>("My Authenticator")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  // Generate MFA setup on component mount
  useEffect(() => {
    if (session?.user?.email && step === "generate") {
      generateSetup()
    }
  }, [session, step])

  const generateSetup = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const setup = await generateMFASetup(session?.user?.email || "")
      setSecret(setup.secret)
      setQRCodeURL(setup.qrCodeDataURL)
      setBackupCodes(setup.backupCodes)
      
    } catch (err) {
      setError("Failed to generate MFA setup. Please try again.")
      console.error("MFA setup generation error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Verify the TOTP code
      const isValid = verifyTOTPCode(verificationCode, secret)
      
      if (!isValid) {
        setError("Invalid verification code. Please try again.")
        return
      }

      // Save MFA device to database
      const response = await fetch("/api/auth/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName,
          deviceType: "TOTP",
          secret,
          backupCodes,
          verificationCode
        })
      })

      if (!response.ok) {
        throw new Error("Failed to save MFA device")
      }

      setStep("backup")
    } catch (err) {
      setError("Failed to verify MFA setup. Please try again.")
      console.error("MFA verification error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    setStep("complete")
    onComplete?.()
  }

  const downloadBackupCodes = () => {
    const content = `TMSLMS Backup Codes\nGenerated: ${new Date().toISOString()}\nUser: ${session?.user?.email}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe! Each can only be used once.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tmslms-backup-codes-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (step === "generate") {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Set Up Multi-Factor Authentication</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Generating setup...</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Multi-factor authentication adds an extra layer of security to your account.
            </p>
            
            <div className="mb-4">
              <label htmlFor="deviceName" className="block text-sm font-medium mb-2">
                Device Name
              </label>
              <input
                id="deviceName"
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., My Phone, Work Device"
                maxLength={50}
              />
            </div>

            {qrCodeURL && (
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Scan this QR code with your authenticator app:
                </p>
                <div className="inline-block p-4 bg-white border rounded-lg">
                  <Image
                    src={qrCodeURL}
                    alt="QR Code for MFA setup"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 mb-1">Or enter this code manually:</p>
                  <code className="text-sm font-mono break-all">{secret}</code>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("verify")}
                disabled={!qrCodeURL || isLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Continue
              </button>
              
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (step === "verify") {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Verify Your Setup</h2>
        
        <p className="text-gray-600 mb-4">
          Enter the 6-digit code from your authenticator app to complete setup.
        </p>

        <div className="mb-4">
          <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
            Verification Code
          </label>
          <input
            id="verificationCode"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
            placeholder="000000"
            maxLength={6}
            autoComplete="off"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep("generate")}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          
          <button
            onClick={handleVerifyCode}
            disabled={verificationCode.length !== 6 || isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify & Continue"}
          </button>
        </div>
      </div>
    )
  }

  if (step === "backup") {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Save Your Backup Codes</h2>
        
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm font-medium mb-2">⚠️ Important</p>
          <p className="text-yellow-700 text-sm">
            Save these backup codes in a secure location. Each code can only be used once 
            and will help you regain access if you lose your authenticator device.
          </p>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded border font-mono text-sm">
            {backupCodes.map((code, index) => (
              <div key={index} className="text-center py-1">
                {code}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={downloadBackupCodes}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Download Codes
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            I've Saved My Codes
          </button>
        </div>
      </div>
    )
  }

  if (step === "complete") {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">MFA Setup Complete!</h2>
        <p className="text-gray-600 mb-6">
          Your account is now secured with multi-factor authentication.
        </p>
        
        <button
          onClick={onComplete}
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    )
  }

  return null
}
