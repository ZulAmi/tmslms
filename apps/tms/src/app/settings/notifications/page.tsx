'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  sessionReminders: boolean;
  cancelNotifications: boolean;
  systemAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  reminderHours: number;
  escalationEnabled: boolean;
  escalationHours: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    sessionReminders: true,
    cancelNotifications: true,
    systemAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    reminderHours: 24,
    escalationEnabled: false,
    escalationHours: 2,
  });

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Session Reminder',
      type: 'email',
      subject: 'Upcoming Training Session - {{session_name}}',
      description: 'Sent to participants before their training session',
      enabled: true,
    },
    {
      id: '2',
      name: 'Session Cancelled',
      type: 'email',
      subject: 'Training Session Cancelled - {{session_name}}',
      description: 'Sent when a training session is cancelled',
      enabled: true,
    },
    {
      id: '3',
      name: 'Registration Confirmation',
      type: 'email',
      subject: 'Registration Confirmed - {{session_name}}',
      description: 'Sent when participant registers for a session',
      enabled: true,
    },
    {
      id: '4',
      name: 'SMS Reminder',
      type: 'sms',
      subject: 'Training reminder for {{session_name}} at {{session_time}}',
      description: 'SMS sent before training sessions',
      enabled: false,
    },
  ]);

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

  const toggleTemplate = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? { ...template, enabled: !template.enabled }
          : template
      )
    );
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <div className="tms-breadcrumb">
          <Link href="/">Dashboard</Link>
          <span>/</span>
          <Link href="/settings">Settings</Link>
          <span>/</span>
          <span>Notifications</span>
        </div>
        <h1>Notification Settings</h1>
        <p>Configure how and when users receive notifications</p>
      </div>

      <div className="tms-settings-form">
        {/* Global Notification Settings */}
        <div className="tms-card">
          <h2>Notification Channels</h2>
          <div className="tms-setting-items">
            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">Email Notifications</label>
                <p className="tms-setting-description">
                  Send notifications via email to users and administrators
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      emailNotifications: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>

            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">SMS Notifications</label>
                <p className="tms-setting-description">
                  Send SMS notifications for urgent updates and reminders
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      smsNotifications: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>

            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">Push Notifications</label>
                <p className="tms-setting-description">
                  Send browser push notifications for real-time updates
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      pushNotifications: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Event Notifications */}
        <div className="tms-card">
          <h2>Event Notifications</h2>
          <div className="tms-setting-items">
            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">Session Reminders</label>
                <p className="tms-setting-description">
                  Send reminders to participants before their training sessions
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.sessionReminders}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      sessionReminders: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>

            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">
                  Cancellation Notifications
                </label>
                <p className="tms-setting-description">
                  Notify participants when sessions are cancelled or rescheduled
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.cancelNotifications}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      cancelNotifications: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>

            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">System Alerts</label>
                <p className="tms-setting-description">
                  Send alerts for system maintenance, updates, and issues
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.systemAlerts}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      systemAlerts: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="tms-form-group">
            <label className="tms-label">
              Reminder Time (hours before session)
            </label>
            <select
              className="tms-select"
              value={settings.reminderHours}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  reminderHours: parseInt(e.target.value),
                }))
              }
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="4">4 hours</option>
              <option value="24">24 hours (1 day)</option>
              <option value="48">48 hours (2 days)</option>
              <option value="168">1 week</option>
            </select>
          </div>
        </div>

        {/* Reports & Analytics */}
        <div className="tms-card">
          <h2>Reports & Analytics</h2>
          <div className="tms-setting-items">
            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">Weekly Reports</label>
                <p className="tms-setting-description">
                  Send weekly training activity summaries to administrators
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      weeklyReports: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>

            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">Monthly Reports</label>
                <p className="tms-setting-description">
                  Send comprehensive monthly reports with analytics and insights
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.monthlyReports}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      monthlyReports: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Escalation Settings */}
        <div className="tms-card">
          <h2>Escalation Settings</h2>
          <div className="tms-setting-item">
            <div className="tms-setting-info">
              <label className="tms-setting-label">Enable Escalation</label>
              <p className="tms-setting-description">
                Send escalated notifications for unacknowledged critical alerts
              </p>
            </div>
            <label className="tms-toggle">
              <input
                type="checkbox"
                checked={settings.escalationEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    escalationEnabled: e.target.checked,
                  }))
                }
              />
              <span className="tms-toggle-slider"></span>
            </label>
          </div>

          {settings.escalationEnabled && (
            <div className="tms-form-group">
              <label className="tms-label">Escalation Delay (hours)</label>
              <input
                type="number"
                className="tms-input"
                value={settings.escalationHours}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    escalationHours: parseInt(e.target.value),
                  }))
                }
                min="1"
                max="24"
              />
              <p className="tms-help-text">
                Hours to wait before escalating unacknowledged alerts
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Templates */}
      <div className="tms-card">
        <h2>Notification Templates</h2>
        <div className="tms-templates-list">
          {templates.map((template) => (
            <div key={template.id} className="tms-template-item">
              <div className="tms-template-info">
                <div className="tms-template-header">
                  <h3>{template.name}</h3>
                  <span className={`tms-badge ${template.type}`}>
                    {template.type.toUpperCase()}
                  </span>
                </div>
                <div className="tms-template-subject">
                  <strong>Subject:</strong> {template.subject}
                </div>
                <div className="tms-template-description">
                  {template.description}
                </div>
              </div>
              <div className="tms-template-actions">
                <label className="tms-toggle">
                  <input
                    type="checkbox"
                    checked={template.enabled}
                    onChange={() => toggleTemplate(template.id)}
                  />
                  <span className="tms-toggle-slider"></span>
                </label>
                <button className="tms-button secondary small">Edit</button>
                <button className="tms-button secondary small">Preview</button>
              </div>
            </div>
          ))}
        </div>

        <div className="tms-template-actions-footer">
          <button className="tms-button secondary">Add Template</button>
          <button className="tms-button secondary">Import Templates</button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="tms-form-actions">
        <button
          className="tms-button primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && (
          <div className="tms-success-message">
            Notification settings saved successfully!
          </div>
        )}
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
