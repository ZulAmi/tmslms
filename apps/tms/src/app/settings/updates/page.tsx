'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';

interface UpdateInfo {
  version: string;
  releaseDate: string;
  description: string;
  type: 'major' | 'minor' | 'patch' | 'security';
  size: string;
}

interface SystemUpdate {
  current: string;
  available: UpdateInfo[];
  lastCheck: string;
  autoUpdate: boolean;
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<SystemUpdate>({
    current: '2.4.1',
    available: [
      {
        version: '2.4.2',
        releaseDate: '2024-01-20',
        description:
          'Bug fixes and performance improvements for session management',
        type: 'patch',
        size: '12.5 MB',
      },
      {
        version: '2.5.0',
        releaseDate: '2024-01-25',
        description:
          'New analytics features, enhanced reporting capabilities, and improved user interface',
        type: 'minor',
        size: '45.2 MB',
      },
    ],
    lastCheck: '2024-01-15 09:30 AM',
    autoUpdate: false,
  });

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<string | null>(null);

  const getUpdateTypeColor = (type: UpdateInfo['type']) => {
    switch (type) {
      case 'major':
        return '#8b5cf6';
      case 'minor':
        return '#3b82f6';
      case 'patch':
        return '#22c55e';
      case 'security':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getUpdateTypeLabel = (type: UpdateInfo['type']) => {
    switch (type) {
      case 'major':
        return 'Major Update';
      case 'minor':
        return 'Feature Update';
      case 'patch':
        return 'Bug Fix';
      case 'security':
        return 'Security Update';
      default:
        return 'Update';
    }
  };

  const handleCheckUpdates = async () => {
    setChecking(true);
    // Simulate checking for updates
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUpdates((prev) => ({
      ...prev,
      lastCheck: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    }));
    setChecking(false);
  };

  const handleInstallUpdate = async (version: string) => {
    setSelectedUpdate(version);
    setLoading(true);

    // Simulate update installation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Remove the installed update from available updates
    setUpdates((prev) => ({
      ...prev,
      current: version,
      available: prev.available.filter((update) => update.version !== version),
    }));

    setLoading(false);
    setSelectedUpdate(null);
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <div className="tms-breadcrumb">
          <Link href="/">Dashboard</Link>
          <span>/</span>
          <Link href="/settings">Settings</Link>
          <span>/</span>
          <span>Updates</span>
        </div>
        <h1>System Updates</h1>
        <p>
          Keep your TMS system up to date with the latest features and security
          patches
        </p>
      </div>

      <div className="tms-grid tms-grid-2">
        {/* Current Version Info */}
        <div className="tms-card">
          <h2>Current Version</h2>
          <div className="tms-version-info">
            <div className="tms-version-number">v{updates.current}</div>
            <div className="tms-version-details">
              <p>Last checked: {updates.lastCheck}</p>
              <div className="tms-update-actions">
                <button
                  className="tms-button secondary"
                  onClick={handleCheckUpdates}
                  disabled={checking}
                >
                  {checking ? 'Checking...' : 'Check for Updates'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Update Settings */}
        <div className="tms-card">
          <h2>Update Settings</h2>
          <div className="tms-setting-item">
            <div className="tms-setting-info">
              <label className="tms-setting-label">Automatic Updates</label>
              <p className="tms-setting-description">
                Automatically install security updates and patches
              </p>
            </div>
            <label className="tms-toggle">
              <input
                type="checkbox"
                checked={updates.autoUpdate}
                onChange={(e) =>
                  setUpdates((prev) => ({
                    ...prev,
                    autoUpdate: e.target.checked,
                  }))
                }
              />
              <span className="tms-toggle-slider"></span>
            </label>
          </div>

          <div className="tms-setting-item">
            <div className="tms-setting-info">
              <label className="tms-setting-label">Update Notifications</label>
              <p className="tms-setting-description">
                Receive notifications when updates are available
              </p>
            </div>
            <label className="tms-toggle">
              <input type="checkbox" defaultChecked />
              <span className="tms-toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Available Updates */}
      {updates.available.length > 0 && (
        <div className="tms-card">
          <h2>Available Updates ({updates.available.length})</h2>
          <div className="tms-updates-list">
            {updates.available.map((update) => (
              <div key={update.version} className="tms-update-item">
                <div className="tms-update-header">
                  <div className="tms-update-version">
                    <span className="tms-version-number">
                      v{update.version}
                    </span>
                    <span
                      className="tms-update-type"
                      style={{
                        backgroundColor: getUpdateTypeColor(update.type),
                      }}
                    >
                      {getUpdateTypeLabel(update.type)}
                    </span>
                  </div>
                  <div className="tms-update-meta">
                    <span>{update.releaseDate}</span>
                    <span>{update.size}</span>
                  </div>
                </div>

                <div className="tms-update-description">
                  {update.description}
                </div>

                <div className="tms-update-actions">
                  <button
                    className="tms-button primary"
                    onClick={() => handleInstallUpdate(update.version)}
                    disabled={loading}
                  >
                    {selectedUpdate === update.version && loading
                      ? 'Installing...'
                      : 'Install Update'}
                  </button>
                  <button className="tms-button secondary">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Updates Available */}
      {updates.available.length === 0 && !checking && (
        <div className="tms-card tms-empty-state">
          <div className="tms-empty-icon">✅</div>
          <h3>System Up to Date</h3>
          <p>
            Your TMS system is running the latest version. All security patches
            and features are current.
          </p>
        </div>
      )}

      {/* Update History */}
      <div className="tms-card">
        <h2>Recent Updates</h2>
        <div className="tms-update-history">
          <div className="tms-history-item">
            <div className="tms-history-date">2024-01-10</div>
            <div className="tms-history-version">v2.4.1</div>
            <div className="tms-history-description">
              Fixed session scheduling conflicts
            </div>
          </div>
          <div className="tms-history-item">
            <div className="tms-history-date">2024-01-05</div>
            <div className="tms-history-version">v2.4.0</div>
            <div className="tms-history-description">
              Enhanced participant management features
            </div>
          </div>
          <div className="tms-history-item">
            <div className="tms-history-date">2023-12-28</div>
            <div className="tms-history-version">v2.3.2</div>
            <div className="tms-history-description">
              Security improvements and bug fixes
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="tms-loading-overlay">
          <div className="tms-loading-content">
            <div className="tms-spinner"></div>
            <h3>Installing Update</h3>
            <p>Please wait while the system updates...</p>
          </div>
        </div>
      )}

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
