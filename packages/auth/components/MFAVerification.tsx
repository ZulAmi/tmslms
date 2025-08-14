"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { verifyTOTPCode, verifyBackupCode } from "../lib/mfa"

interface MFAVerificationProps {
  email: string
  password?: string
  callbackUrl?: string
  onCancel?: () => void
}

export default function MFAVerification({ 
  email, 
  password, 
  callbackUrl, 
  onCancel 
}: MFAVerificationProps) {
  const [verificationCode, setVerificationCode] = useState<string>("")
  const [useBackupCode, setUseBackupCode] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [attempts, setAttempts] = useState<number>(0)

  const maxAttempts = 5

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError("Please enter a verification code")
      return
    }

    if (!useBackupCode && verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    if (attempts >= maxAttempts) {
      setError("Too many failed attempts. Please try again later.")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Attempt to verify MFA and sign in
      const result = await signIn("credentials", {
        email,
        password,
        mfaCode: verificationCode,
        isBackupCode: useBackupCode,
        redirect: false,
        callbackUrl
      })

      if (result?.error) {
        setAttempts(prev => prev + 1)
        
        if (result.error === "INVALID_MFA_CODE") {
          setError(useBackupCode 
            ? "Invalid backup code. Please try again." 
            : "Invalid verification code. Please try again."
          )
        } else if (result.error === "MFA_REQUIRED") {
          setError("MFA verification failed. Please try again.")
        } else if (result.error === "ACCOUNT_LOCKED") {
          setError("Account temporarily locked due to suspicious activity.")
        } else {
          setError("Authentication failed. Please try again.")
        }
        
        setVerificationCode("")
      } else if (result?.url) {
        // Success - redirect will happen automatically
        window.location.href = result.url
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("MFA verification error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/auth/mfa/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setError("")
        // Show success message temporarily
        setError("New code sent successfully!")
        setTimeout(() => setError(""), 3000)
      } else {
        setError("Failed to send new code. Please try again.")
      }
    } catch (err) {
      setError("Failed to send new code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isLocked = attempts >= maxAttempts

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
      
      <p className="text-gray-600 mb-6">
        {useBackupCode 
          ? "Enter one of your backup codes to complete sign-in."
          : "Enter the 6-digit code from your authenticator app."
        }
      </p>

      <div className="mb-4">
        <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
          {useBackupCode ? "Backup Code" : "Verification Code"}
        </label>
        <input
          id="verificationCode"
          type="text"
          value={verificationCode}
          onChange={(e) => {
            const value = useBackupCode 
              ? e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 8)
              : e.target.value.replace(/\D/g, '').slice(0, 6)
            setVerificationCode(value)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
          placeholder={useBackupCode ? "ABCD1234" : "000000"}
          maxLength={useBackupCode ? 8 : 6}
          disabled={isLocked || isLoading}
          autoComplete="off"
        />
      </div>

      {error && (
        <div className={`mb-4 p-3 border rounded text-sm ${
          error.includes("sent successfully") 
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {error}
        </div>
      )}

      {attempts > 0 && !isLocked && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          {maxAttempts - attempts} attempt(s) remaining
        </div>
      )}

      {isLocked && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Account temporarily locked. Please try again in 15 minutes or contact support.
        </div>
      )}

      <div className="space-y-3 mb-4">
        <button
          onClick={handleVerifyCode}
          disabled={
            !verificationCode || 
            (!useBackupCode && verificationCode.length !== 6) ||
            (useBackupCode && verificationCode.length !== 8) ||
            isLocked || 
            isLoading
          }
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Verify"}
        </button>

        {!useBackupCode && !isLocked && (
          <button
            onClick={handleResendCode}
            disabled={isLoading}
            className="w-full text-blue-600 hover:text-blue-800 text-sm py-2"
          >
            Resend Code
          </button>
        )}
      </div>

      <div className="border-t pt-4">
        <button
          onClick={() => {
            setUseBackupCode(!useBackupCode)
            setVerificationCode("")
            setError("")
          }}
          disabled={isLocked}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {useBackupCode 
            ? "Use authenticator app instead"
            : "Use backup code instead"
          }
        </button>
      </div>

      {onCancel && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onCancel}
            className="w-full text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel and try different account
          </button>
        </div>
      )}
    </div>
  )
}
