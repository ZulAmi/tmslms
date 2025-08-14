"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import MFASetup from "./MFASetup"

interface MFADevice {
  id: string
  deviceName: string
  deviceType: "TOTP" | "SMS" | "EMAIL" | "HARDWARE_TOKEN" | "BIOMETRIC" | "BACKUP_CODES"
  isActive: boolean
  isVerified: boolean
  isPrimary: boolean
  createdAt: string
  lastUsedAt?: string
}

export default function MFAManagement() {
  const { data: session } = useSession()
  const [devices, setDevices] = useState<MFADevice[]>([])
  const [showSetup, setShowSetup] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (session) {
      fetchDevices()
    }
  }, [session])

  const fetchDevices = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/auth/mfa/devices")
      if (!response.ok) {
        throw new Error("Failed to fetch MFA devices")
      }

      const data = await response.json()
      setDevices(data.devices || [])
    } catch (err) {
      setError("Failed to load MFA devices")
      console.error("MFA devices fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to remove this MFA device?")) {
      return
    }

    try {
      const response = await fetch(`/api/auth/mfa/devices/${deviceId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to remove device")
      }

      await fetchDevices()
    } catch (err) {
      setError("Failed to remove device")
      console.error("MFA device removal error:", err)
    }
  }

  const handleSetPrimary = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/auth/mfa/devices/${deviceId}/primary`, {
        method: "POST"
      })

      if (!response.ok) {
        throw new Error("Failed to set primary device")
      }

      await fetchDevices()
    } catch (err) {
      setError("Failed to set primary device")
      console.error("MFA primary device error:", err)
    }
  }

  const handleToggleDevice = async (deviceId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/auth/mfa/devices/${deviceId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (!response.ok) {
        throw new Error("Failed to toggle device")
      }

      await fetchDevices()
    } catch (err) {
      setError("Failed to toggle device")
      console.error("MFA device toggle error:", err)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "TOTP":
        return "📱"
      case "SMS":
        return "💬"
      case "EMAIL":
        return "📧"
      case "HARDWARE_TOKEN":
        return "🔑"
      case "BIOMETRIC":
        return "👆"
      case "BACKUP_CODES":
        return "🔢"
      default:
        return "🔒"
    }
  }

  const getDeviceTypeName = (deviceType: string) => {
    switch (deviceType) {
      case "TOTP":
        return "Authenticator App"
      case "SMS":
        return "SMS"
      case "EMAIL":
        return "Email"
      case "HARDWARE_TOKEN":
        return "Hardware Token"
      case "BIOMETRIC":
        return "Biometric"
      case "BACKUP_CODES":
        return "Backup Codes"
      default:
        return deviceType
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const activeDevices = devices.filter(d => d.isActive && d.isVerified)
  const hasTotp = activeDevices.some(d => d.deviceType === "TOTP")

  if (showSetup) {
    return (
      <MFASetup
        onComplete={() => {
          setShowSetup(false)
          fetchDevices()
        }}
        onCancel={() => setShowSetup(false)}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Multi-Factor Authentication</h2>
              <p className="text-gray-600 mt-1">
                Manage your MFA devices to keep your account secure
              </p>
            </div>
            
            <button
              onClick={() => setShowSetup(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Device
            </button>
          </div>

          {/* Security Status */}
          <div className="mt-4 p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                activeDevices.length > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="font-medium">
                {activeDevices.length > 0 ? 'MFA Enabled' : 'MFA Disabled'}
              </span>
              {activeDevices.length > 1 && (
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Multiple devices configured
                </span>
              )}
            </div>
            
            {activeDevices.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                Your account is not protected with multi-factor authentication. 
                Add a device to improve security.
              </p>
            )}
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading devices...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-lg font-medium mb-2">No MFA devices configured</h3>
              <p className="text-gray-600 mb-4">
                Add your first MFA device to secure your account
              </p>
              <button
                onClick={() => setShowSetup(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className={`p-4 border rounded-lg ${
                    device.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getDeviceIcon(device.deviceType)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{device.deviceName}</h3>
                          {device.isPrimary && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Primary
                            </span>
                          )}
                          {!device.isActive && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {getDeviceTypeName(device.deviceType)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Added {formatDate(device.createdAt)}
                          {device.lastUsedAt && (
                            <span> • Last used {formatDate(device.lastUsedAt)}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {device.isActive && !device.isPrimary && activeDevices.length > 1 && (
                        <button
                          onClick={() => handleSetPrimary(device.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1"
                        >
                          Set Primary
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleToggleDevice(device.id, device.isActive)}
                        className={`text-sm px-3 py-1 rounded ${
                          device.isActive
                            ? 'text-yellow-600 hover:text-yellow-800'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {device.isActive ? 'Disable' : 'Enable'}
                      </button>
                      
                      <button
                        onClick={() => handleRemoveDevice(device.id)}
                        disabled={device.isPrimary && activeDevices.length === 1}
                        className="text-sm text-red-600 hover:text-red-800 px-3 py-1 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {devices.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Security Recommendations</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {!hasTotp && (
                  <li>• Consider adding an authenticator app for better security</li>
                )}
                {activeDevices.length === 1 && (
                  <li>• Add a backup device in case you lose access to your primary device</li>
                )}
                {devices.some(d => d.deviceType === "SMS") && (
                  <li>• SMS is less secure than authenticator apps - consider upgrading</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
