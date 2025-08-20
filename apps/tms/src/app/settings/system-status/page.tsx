'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';

interface SystemStatus {
  database: 'healthy' | 'warning' | 'critical';
  server: 'healthy' | 'warning' | 'critical';
  memory: number;
  cpu: number;
  disk: number;
  uptime: string;
  lastBackup: string;
  activeUsers: number;
}

export default function SystemStatusPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'healthy',
    server: 'healthy',
    memory: 78.5,
    cpu: 42.3,
    disk: 65.2,
    uptime: '15 days, 8 hours, 23 minutes',
    lastBackup: '2024-01-15 03:30 AM',
    activeUsers: 24,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading system status
    setTimeout(() => {
      setLoading(false);
    }, 800);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemStatus((prev) => ({
        ...prev,
        memory: Math.max(
          20,
          Math.min(95, prev.memory + (Math.random() - 0.5) * 5)
        ),
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        activeUsers: Math.max(
          0,
          prev.activeUsers + Math.floor((Math.random() - 0.5) * 3)
        ),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SystemStatus['database']) => {
    switch (status) {
      case 'healthy':
        return '#22c55e';
      case 'warning':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getMetricColor = (value: number, type: 'memory' | 'cpu' | 'disk') => {
    const thresholds = {
      memory: { warning: 80, critical: 90 },
      cpu: { warning: 70, critical: 85 },
      disk: { warning: 75, critical: 90 },
    };

    if (value >= thresholds[type].critical) return '#ef4444';
    if (value >= thresholds[type].warning) return '#f59e0b';
    return '#22c55e';
  };

  if (loading) {
    return (
      <div className="tms-container">
        <div className="tms-header">
          <div className="tms-breadcrumb">
            <Link href="/">Dashboard</Link>
            <span>/</span>
            <Link href="/settings">Settings</Link>
            <span>/</span>
            <span>System Status</span>
          </div>
          <h1>System Status</h1>
        </div>

        <div className="tms-loading-state">
          <div className="tms-spinner"></div>
          <p>Loading system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tms-container">
      <div className="tms-header">
        <div className="tms-breadcrumb">
          <Link href="/">Dashboard</Link>
          <span>/</span>
          <Link href="/settings">Settings</Link>
          <span>/</span>
          <span>System Status</span>
        </div>
        <h1>System Status</h1>
        <p>Monitor system health and performance metrics</p>
      </div>

      <div className="tms-grid tms-grid-2">
        {/* System Health Overview */}
        <div className="tms-card">
          <h2>System Health</h2>
          <div className="tms-status-grid">
            <div className="tms-status-item">
              <div
                className="tms-status-indicator"
                style={{
                  backgroundColor: getStatusColor(systemStatus.database),
                }}
              ></div>
              <div>
                <span className="tms-status-label">Database</span>
                <span className="tms-status-value">
                  {systemStatus.database}
                </span>
              </div>
            </div>
            <div className="tms-status-item">
              <div
                className="tms-status-indicator"
                style={{ backgroundColor: getStatusColor(systemStatus.server) }}
              ></div>
              <div>
                <span className="tms-status-label">Server</span>
                <span className="tms-status-value">{systemStatus.server}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="tms-card">
          <h2>Resource Usage</h2>
          <div className="tms-metrics-grid">
            <div className="tms-metric-item">
              <div className="tms-metric-header">
                <span>Memory Usage</span>
                <span
                  style={{
                    color: getMetricColor(systemStatus.memory, 'memory'),
                  }}
                >
                  {systemStatus.memory.toFixed(1)}%
                </span>
              </div>
              <div className="tms-progress-bar">
                <div
                  className="tms-progress-fill"
                  style={{
                    width: `${systemStatus.memory}%`,
                    backgroundColor: getMetricColor(
                      systemStatus.memory,
                      'memory'
                    ),
                  }}
                ></div>
              </div>
            </div>

            <div className="tms-metric-item">
              <div className="tms-metric-header">
                <span>CPU Usage</span>
                <span
                  style={{ color: getMetricColor(systemStatus.cpu, 'cpu') }}
                >
                  {systemStatus.cpu.toFixed(1)}%
                </span>
              </div>
              <div className="tms-progress-bar">
                <div
                  className="tms-progress-fill"
                  style={{
                    width: `${systemStatus.cpu}%`,
                    backgroundColor: getMetricColor(systemStatus.cpu, 'cpu'),
                  }}
                ></div>
              </div>
            </div>

            <div className="tms-metric-item">
              <div className="tms-metric-header">
                <span>Disk Usage</span>
                <span
                  style={{ color: getMetricColor(systemStatus.disk, 'disk') }}
                >
                  {systemStatus.disk.toFixed(1)}%
                </span>
              </div>
              <div className="tms-progress-bar">
                <div
                  className="tms-progress-fill"
                  style={{
                    width: `${systemStatus.disk}%`,
                    backgroundColor: getMetricColor(systemStatus.disk, 'disk'),
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="tms-card">
          <h2>System Information</h2>
          <div className="tms-info-grid">
            <div className="tms-info-item">
              <span className="tms-info-label">System Uptime</span>
              <span className="tms-info-value">{systemStatus.uptime}</span>
            </div>
            <div className="tms-info-item">
              <span className="tms-info-label">Last Backup</span>
              <span className="tms-info-value">{systemStatus.lastBackup}</span>
            </div>
            <div className="tms-info-item">
              <span className="tms-info-label">Active Users</span>
              <span className="tms-info-value">{systemStatus.activeUsers}</span>
            </div>
          </div>
        </div>

        {/* System Actions */}
        <div className="tms-card">
          <h2>System Actions</h2>
          <div className="tms-action-buttons">
            <Link href="/settings/backup" className="tms-button primary">
              Run Backup
            </Link>
            <Link href="/settings/maintenance" className="tms-button secondary">
              Maintenance Mode
            </Link>
            <Link href="/settings/updates" className="tms-button secondary">
              Check Updates
            </Link>
            <button
              className="tms-button warning"
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1000);
              }}
            >
              Refresh Status
            </button>
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
