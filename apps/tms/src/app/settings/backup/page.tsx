'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';

interface BackupInfo {
  id: string;
  name: string;
  date: string;
  size: string;
  type: 'full' | 'incremental' | 'manual';
  status: 'completed' | 'in-progress' | 'failed';
}

interface BackupSettings {
  autoBackup: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionPeriod: number;
  includeFiles: boolean;
  includeDatabase: boolean;
  backupLocation: string;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupInfo[]>([
    {
      id: 'backup_001',
      name: 'Daily Backup - January 15',
      date: '2024-01-15 03:30 AM',
      size: '1.2 GB',
      type: 'full',
      status: 'completed',
    },
    {
      id: 'backup_002',
      name: 'Incremental Backup - January 14',
      date: '2024-01-14 03:30 AM',
      size: '245 MB',
      type: 'incremental',
      status: 'completed',
    },
    {
      id: 'backup_003',
      name: 'Manual Backup - System Update',
      date: '2024-01-13 10:15 AM',
      size: '1.1 GB',
      type: 'manual',
      status: 'completed',
    },
  ]);

  const [settings, setSettings] = useState<BackupSettings>({
    autoBackup: true,
    frequency: 'daily',
    retentionPeriod: 30,
    includeFiles: true,
    includeDatabase: true,
    backupLocation: '/backups/tms',
  });

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const getBackupTypeColor = (type: BackupInfo['type']) => {
    switch (type) {
      case 'full':
        return '#3b82f6';
      case 'incremental':
        return '#22c55e';
      case 'manual':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: BackupInfo['status']) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'in-progress':
        return '#3b82f6';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    // Simulate backup progress
    const progressInterval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate backup completion
    setTimeout(() => {
      const newBackup: BackupInfo = {
        id: `backup_${Date.now()}`,
        name: `Manual Backup - ${new Date().toLocaleDateString()}`,
        date: new Date().toLocaleString(),
        size: '1.3 GB',
        type: 'manual',
        status: 'completed',
      };

      setBackups((prev) => [newBackup, ...prev]);
      setIsCreatingBackup(false);
      setBackupProgress(0);
      clearInterval(progressInterval);
    }, 4000);
  };

  const handleRestoreBackup = (backupId: string) => {
    // Simulate restore process
    console.log('Restoring backup:', backupId);
  };

  const handleDeleteBackup = (backupId: string) => {
    setBackups((prev) => prev.filter((backup) => backup.id !== backupId));
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <div className="tms-breadcrumb">
          <Link href="/">Dashboard</Link>
          <span>/</span>
          <Link href="/settings">Settings</Link>
          <span>/</span>
          <span>Backup</span>
        </div>
        <h1>System Backup</h1>
        <p>Manage system backups and restore points for your TMS data</p>
      </div>

      <div className="tms-grid tms-grid-2">
        {/* Backup Actions */}
        <div className="tms-card">
          <h2>Backup Actions</h2>
          <div className="tms-backup-actions">
            <button
              className="tms-button primary large"
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
            >
              {isCreatingBackup ? 'Creating Backup...' : 'Create Backup Now'}
            </button>

            {isCreatingBackup && (
              <div className="tms-progress-container">
                <div className="tms-progress-bar">
                  <div
                    className="tms-progress-fill"
                    style={{ width: `${backupProgress}%` }}
                  ></div>
                </div>
                <span className="tms-progress-text">
                  {Math.round(backupProgress)}% Complete
                </span>
              </div>
            )}

            <div className="tms-backup-info">
              <p>Next scheduled backup: Tomorrow at 3:30 AM</p>
              <p>Last backup: {backups[0]?.date}</p>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="tms-card">
          <h2>Backup Settings</h2>
          <div className="tms-settings-form">
            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">Automatic Backup</label>
                <p className="tms-setting-description">
                  Enable scheduled automatic backups
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      autoBackup: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Backup Frequency</label>
              <select
                className="tms-select"
                value={settings.frequency}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    frequency: e.target.value as any,
                  }))
                }
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Retention Period (days)</label>
              <input
                type="number"
                className="tms-input"
                value={settings.retentionPeriod}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    retentionPeriod: parseInt(e.target.value),
                  }))
                }
                min="7"
                max="365"
              />
            </div>

            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">Include Files</label>
                <p className="tms-setting-description">
                  Backup uploaded files and documents
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.includeFiles}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      includeFiles: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>

            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">Include Database</label>
                <p className="tms-setting-description">
                  Backup all database content
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={settings.includeDatabase}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      includeDatabase: e.target.checked,
                    }))
                  }
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="tms-card">
        <h2>Backup History</h2>
        <div className="tms-backup-list">
          {backups.map((backup) => (
            <div key={backup.id} className="tms-backup-item">
              <div className="tms-backup-info">
                <div className="tms-backup-header">
                  <h3>{backup.name}</h3>
                  <div className="tms-backup-badges">
                    <span
                      className="tms-badge"
                      style={{
                        backgroundColor: getBackupTypeColor(backup.type),
                      }}
                    >
                      {backup.type}
                    </span>
                    <span
                      className="tms-badge"
                      style={{ backgroundColor: getStatusColor(backup.status) }}
                    >
                      {backup.status}
                    </span>
                  </div>
                </div>
                <div className="tms-backup-details">
                  <span>Date: {backup.date}</span>
                  <span>Size: {backup.size}</span>
                </div>
              </div>
              <div className="tms-backup-actions">
                <button
                  className="tms-button secondary small"
                  onClick={() => handleRestoreBackup(backup.id)}
                  disabled={backup.status !== 'completed'}
                >
                  Restore
                </button>
                <button className="tms-button secondary small">Download</button>
                <button
                  className="tms-button danger small"
                  onClick={() => handleDeleteBackup(backup.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Information */}
      <div className="tms-card">
        <h2>Storage Information</h2>
        <div className="tms-storage-info">
          <div className="tms-storage-item">
            <span className="tms-storage-label">Total Backup Size:</span>
            <span className="tms-storage-value">2.8 GB</span>
          </div>
          <div className="tms-storage-item">
            <span className="tms-storage-label">Available Space:</span>
            <span className="tms-storage-value">45.2 GB</span>
          </div>
          <div className="tms-storage-item">
            <span className="tms-storage-label">Backup Location:</span>
            <span className="tms-storage-value">{settings.backupLocation}</span>
          </div>
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
