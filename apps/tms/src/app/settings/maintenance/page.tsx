'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';

interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  lastRun: string;
  nextRun: string;
  frequency: string;
  status: 'completed' | 'running' | 'scheduled' | 'failed';
  duration: string;
}

export default function MaintenancePage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [scheduledMaintenance, setScheduledMaintenance] = useState<Date | null>(
    null
  );
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'System is currently under maintenance. Please check back later.'
  );

  const [tasks, setTasks] = useState<MaintenanceTask[]>([
    {
      id: '1',
      name: 'Database Optimization',
      description: 'Optimize database indexes and clean up unused data',
      lastRun: '2024-01-14 03:00 AM',
      nextRun: '2024-01-21 03:00 AM',
      frequency: 'Weekly',
      status: 'completed',
      duration: '15 minutes',
    },
    {
      id: '2',
      name: 'Log Cleanup',
      description: 'Remove old log files and compress archives',
      lastRun: '2024-01-15 02:00 AM',
      nextRun: '2024-01-16 02:00 AM',
      frequency: 'Daily',
      status: 'completed',
      duration: '5 minutes',
    },
    {
      id: '3',
      name: 'Cache Cleanup',
      description: 'Clear expired cache entries and optimize memory usage',
      lastRun: '2024-01-15 04:00 AM',
      nextRun: '2024-01-16 04:00 AM',
      frequency: 'Daily',
      status: 'completed',
      duration: '3 minutes',
    },
    {
      id: '4',
      name: 'Security Scan',
      description: 'Run automated security vulnerability scans',
      lastRun: '2024-01-08 01:00 AM',
      nextRun: '2024-01-22 01:00 AM',
      frequency: 'Bi-weekly',
      status: 'scheduled',
      duration: '30 minutes',
    },
  ]);

  const [isRunning, setIsRunning] = useState<string | null>(null);

  const getStatusColor = (status: MaintenanceTask['status']) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'running':
        return '#3b82f6';
      case 'scheduled':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleToggleMaintenanceMode = async () => {
    setMaintenanceMode(!maintenanceMode);

    // In a real app, this would make an API call to toggle maintenance mode
    console.log('Maintenance mode:', !maintenanceMode ? 'enabled' : 'disabled');
  };

  const handleRunTask = async (taskId: string) => {
    setIsRunning(taskId);

    // Update task status to running
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: 'running' as const } : task
      )
    );

    // Simulate task execution
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Update task to completed
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'completed' as const,
              lastRun: new Date().toLocaleString(),
              nextRun: getNextRunDate(task.frequency),
            }
          : task
      )
    );

    setIsRunning(null);
  };

  const getNextRunDate = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
      case 'Daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'Weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'Bi-weekly':
        now.setDate(now.getDate() + 14);
        break;
      case 'Monthly':
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toLocaleString();
  };

  const handleScheduleMaintenance = () => {
    if (scheduledMaintenance) {
      console.log('Scheduling maintenance for:', scheduledMaintenance);
      // In a real app, this would schedule the maintenance window
    }
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <div className="tms-breadcrumb">
          <Link href="/">Dashboard</Link>
          <span>/</span>
          <Link href="/settings">Settings</Link>
          <span>/</span>
          <span>Maintenance</span>
        </div>
        <h1>System Maintenance</h1>
        <p>Manage system maintenance tasks and schedule downtime</p>
      </div>

      <div className="tms-grid tms-grid-2">
        {/* Maintenance Mode */}
        <div className="tms-card">
          <h2>Maintenance Mode</h2>
          <div className="tms-maintenance-controls">
            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">
                  Enable Maintenance Mode
                </label>
                <p className="tms-setting-description">
                  Temporarily disable user access to perform system updates
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={handleToggleMaintenanceMode}
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>

            {maintenanceMode && (
              <div className="tms-maintenance-warning">
                <div className="tms-warning-icon">⚠️</div>
                <div>
                  <h4>Maintenance Mode is Active</h4>
                  <p>Users are currently unable to access the system</p>
                </div>
              </div>
            )}

            <div className="tms-form-group">
              <label className="tms-label">Maintenance Message</label>
              <textarea
                className="tms-textarea"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                rows={3}
                placeholder="Message shown to users during maintenance"
              />
            </div>
          </div>
        </div>

        {/* Schedule Maintenance */}
        <div className="tms-card">
          <h2>Schedule Maintenance</h2>
          <div className="tms-schedule-form">
            <div className="tms-form-group">
              <label className="tms-label">Maintenance Date & Time</label>
              <input
                type="datetime-local"
                className="tms-input"
                value={
                  scheduledMaintenance
                    ? scheduledMaintenance.toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setScheduledMaintenance(
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
              />
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Estimated Duration</label>
              <select className="tms-select">
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
                <option value="480">8 hours</option>
              </select>
            </div>

            <button
              className="tms-button primary"
              onClick={handleScheduleMaintenance}
              disabled={!scheduledMaintenance}
            >
              Schedule Maintenance
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Tasks */}
      <div className="tms-card">
        <h2>Automated Maintenance Tasks</h2>
        <div className="tms-tasks-list">
          {tasks.map((task) => (
            <div key={task.id} className="tms-task-item">
              <div className="tms-task-info">
                <div className="tms-task-header">
                  <h3>{task.name}</h3>
                  <span
                    className="tms-status-badge"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="tms-task-description">{task.description}</p>
                <div className="tms-task-schedule">
                  <div className="tms-schedule-item">
                    <span className="tms-schedule-label">Last Run:</span>
                    <span className="tms-schedule-value">{task.lastRun}</span>
                  </div>
                  <div className="tms-schedule-item">
                    <span className="tms-schedule-label">Next Run:</span>
                    <span className="tms-schedule-value">{task.nextRun}</span>
                  </div>
                  <div className="tms-schedule-item">
                    <span className="tms-schedule-label">Frequency:</span>
                    <span className="tms-schedule-value">{task.frequency}</span>
                  </div>
                  <div className="tms-schedule-item">
                    <span className="tms-schedule-label">Duration:</span>
                    <span className="tms-schedule-value">{task.duration}</span>
                  </div>
                </div>
              </div>
              <div className="tms-task-actions">
                <button
                  className="tms-button secondary small"
                  onClick={() => handleRunTask(task.id)}
                  disabled={task.status === 'running' || isRunning === task.id}
                >
                  {isRunning === task.id ? 'Running...' : 'Run Now'}
                </button>
                <button className="tms-button secondary small">
                  Configure
                </button>
                <button className="tms-button secondary small">
                  View Logs
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="tms-tasks-actions">
          <button className="tms-button secondary">Add Custom Task</button>
          <button className="tms-button secondary">Run All Tasks</button>
        </div>
      </div>

      {/* System Health Check */}
      <div className="tms-card">
        <h2>System Health Check</h2>
        <div className="tms-health-checks">
          <div className="tms-health-item">
            <div className="tms-health-icon">✅</div>
            <div className="tms-health-info">
              <h4>Database Connection</h4>
              <p>All database connections are healthy</p>
            </div>
            <span className="tms-health-status healthy">Healthy</span>
          </div>

          <div className="tms-health-item">
            <div className="tms-health-icon">✅</div>
            <div className="tms-health-info">
              <h4>File System</h4>
              <p>File system has adequate free space</p>
            </div>
            <span className="tms-health-status healthy">Healthy</span>
          </div>

          <div className="tms-health-item">
            <div className="tms-health-icon">⚠️</div>
            <div className="tms-health-info">
              <h4>Memory Usage</h4>
              <p>Memory usage is approaching threshold</p>
            </div>
            <span className="tms-health-status warning">Warning</span>
          </div>

          <div className="tms-health-item">
            <div className="tms-health-icon">✅</div>
            <div className="tms-health-info">
              <h4>External Services</h4>
              <p>All external API connections are responding</p>
            </div>
            <span className="tms-health-status healthy">Healthy</span>
          </div>
        </div>

        <button className="tms-button secondary">Run Full Health Check</button>
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
