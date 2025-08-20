'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';

interface GeneralSettings {
  systemName: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  defaultCurrency: string;
  sessionDuration: number;
  maxParticipants: number;
  emailDomain: string;
  supportEmail: string;
  maintenanceMode: boolean;
  debugMode: boolean;
}

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<GeneralSettings>({
    systemName: 'Training Management System',
    timezone: 'Asia/Singapore',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour',
    language: 'en-US',
    defaultCurrency: 'SGD',
    sessionDuration: 120,
    maxParticipants: 50,
    emailDomain: 'company.com',
    supportEmail: 'support@company.com',
    maintenanceMode: false,
    debugMode: false,
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSaving(false);
    setSaved(true);

    // Hide saved message after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings({
      systemName: 'Training Management System',
      timezone: 'Asia/Singapore',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24-hour',
      language: 'en-US',
      defaultCurrency: 'SGD',
      sessionDuration: 120,
      maxParticipants: 50,
      emailDomain: 'company.com',
      supportEmail: 'support@company.com',
      maintenanceMode: false,
      debugMode: false,
    });
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <div className="tms-breadcrumb">
          <Link href="/">Dashboard</Link>
          <span>/</span>
          <Link href="/settings">Settings</Link>
          <span>/</span>
          <span>General</span>
        </div>
        <h1>General Settings</h1>
        <p>Configure basic system settings and preferences</p>
      </div>

      <div className="tms-settings-form">
        {/* System Information */}
        <div className="tms-card">
          <h2>System Information</h2>
          <div className="tms-form-grid">
            <div className="tms-form-group">
              <label className="tms-label">System Name</label>
              <input
                type="text"
                className="tms-input"
                value={settings.systemName}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    systemName: e.target.value,
                  }))
                }
              />
              <p className="tms-help-text">
                This name appears in the header and notifications
              </p>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Support Email</label>
              <input
                type="email"
                className="tms-input"
                value={settings.supportEmail}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    supportEmail: e.target.value,
                  }))
                }
              />
              <p className="tms-help-text">
                Contact email for user support and system notifications
              </p>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Email Domain</label>
              <input
                type="text"
                className="tms-input"
                value={settings.emailDomain}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    emailDomain: e.target.value,
                  }))
                }
              />
              <p className="tms-help-text">
                Default domain for user email addresses
              </p>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="tms-card">
          <h2>Regional Settings</h2>
          <div className="tms-form-grid">
            <div className="tms-form-group">
              <label className="tms-label">Timezone</label>
              <select
                className="tms-select"
                value={settings.timezone}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, timezone: e.target.value }))
                }
              >
                <option value="Asia/Singapore">Singapore (GMT+8)</option>
                <option value="Asia/Kuala_Lumpur">Kuala Lumpur (GMT+8)</option>
                <option value="Asia/Jakarta">Jakarta (GMT+7)</option>
                <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                <option value="Asia/Manila">Manila (GMT+8)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Date Format</label>
              <select
                className="tms-select"
                value={settings.dateFormat}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    dateFormat: e.target.value,
                  }))
                }
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              </select>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Time Format</label>
              <select
                className="tms-select"
                value={settings.timeFormat}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    timeFormat: e.target.value,
                  }))
                }
              >
                <option value="24-hour">24-hour (13:30)</option>
                <option value="12-hour">12-hour (1:30 PM)</option>
              </select>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Language</label>
              <select
                className="tms-select"
                value={settings.language}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, language: e.target.value }))
                }
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="zh-CN">中文 (简体)</option>
                <option value="zh-TW">中文 (繁體)</option>
                <option value="ms-MY">Bahasa Malaysia</option>
                <option value="th-TH">ไทย</option>
              </select>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Default Currency</label>
              <select
                className="tms-select"
                value={settings.defaultCurrency}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    defaultCurrency: e.target.value,
                  }))
                }
              >
                <option value="SGD">SGD - Singapore Dollar</option>
                <option value="MYR">MYR - Malaysian Ringgit</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="THB">THB - Thai Baht</option>
                <option value="IDR">IDR - Indonesian Rupiah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Session Defaults */}
        <div className="tms-card">
          <h2>Session Defaults</h2>
          <div className="tms-form-grid">
            <div className="tms-form-group">
              <label className="tms-label">
                Default Session Duration (minutes)
              </label>
              <input
                type="number"
                className="tms-input"
                value={settings.sessionDuration}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    sessionDuration: parseInt(e.target.value),
                  }))
                }
                min="30"
                max="480"
                step="15"
              />
              <p className="tms-help-text">
                Default duration for new training sessions
              </p>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">
                Maximum Participants per Session
              </label>
              <input
                type="number"
                className="tms-input"
                value={settings.maxParticipants}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maxParticipants: parseInt(e.target.value),
                  }))
                }
                min="1"
                max="500"
              />
              <p className="tms-help-text">
                Maximum number of participants allowed in a single session
              </p>
            </div>
          </div>
        </div>

        {/* System Modes */}
        <div className="tms-card">
          <h2>System Modes</h2>
          <div className="tms-setting-items">
            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">Maintenance Mode</label>
                <p className="tms-setting-description">
                  Enable maintenance mode to temporarily disable user access
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maintenanceMode: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>

            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">Debug Mode</label>
                <p className="tms-setting-description">
                  Enable debug mode for detailed error logging and
                  troubleshooting
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.debugMode}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      debugMode: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="tms-form-actions">
          <button
            className="tms-button primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            className="tms-button secondary"
            onClick={handleReset}
            disabled={saving}
          >
            Reset to Defaults
          </button>
          {saved && (
            <div className="tms-success-message">
              Settings saved successfully!
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="tms-navigation-buttons">
        <Link href="/settings" className="tms-button secondary">
          Back to Settings
        </Link>
        <Link href="/" className="tms-button">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
