'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  extension: string;
  icon: string;
  supported: boolean;
}

interface ExportJob {
  id: string;
  name: string;
  type: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
}

export default function ExportPage() {
  const [selectedDataType, setSelectedDataType] = useState('sessions');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [includeArchived, setIncludeArchived] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [formats] = useState<ExportFormat[]>([
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values, ideal for Excel',
      extension: '.csv',
      icon: '📊',
      supported: true,
    },
    {
      id: 'xlsx',
      name: 'Excel',
      description: 'Microsoft Excel workbook format',
      extension: '.xlsx',
      icon: '📗',
      supported: true,
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'JavaScript Object Notation for APIs',
      extension: '.json',
      icon: '📋',
      supported: true,
    },
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Formatted PDF report with charts',
      extension: '.pdf',
      icon: '📄',
      supported: true,
    },
    {
      id: 'xml',
      name: 'XML',
      description: 'Extensible Markup Language format',
      extension: '.xml',
      icon: '📝',
      supported: false,
    },
  ]);

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'Training Sessions Export',
      type: 'sessions',
      format: 'csv',
      status: 'completed',
      createdAt: '2024-01-15 10:30 AM',
      completedAt: '2024-01-15 10:32 AM',
      fileSize: '2.5 MB',
      downloadUrl: '/exports/sessions-2024-01-15.csv',
    },
    {
      id: '2',
      name: 'Participants Database',
      type: 'participants',
      format: 'xlsx',
      status: 'completed',
      createdAt: '2024-01-14 03:15 PM',
      completedAt: '2024-01-14 03:18 PM',
      fileSize: '4.8 MB',
      downloadUrl: '/exports/participants-2024-01-14.xlsx',
    },
    {
      id: '3',
      name: 'Analytics Report',
      type: 'analytics',
      format: 'pdf',
      status: 'processing',
      createdAt: '2024-01-15 11:45 AM',
    },
  ]);

  const dataTypes = [
    {
      id: 'sessions',
      name: 'Training Sessions',
      description:
        'All session data including schedules, participants, and status',
    },
    {
      id: 'participants',
      name: 'Participants',
      description:
        'Participant profiles, contact information, and enrollment history',
    },
    {
      id: 'analytics',
      name: 'Analytics Data',
      description:
        'Performance metrics, attendance records, and completion rates',
    },
    {
      id: 'settings',
      name: 'System Settings',
      description: 'Configuration settings and preferences',
    },
    {
      id: 'users',
      name: 'User Accounts',
      description: 'User profiles and account information',
    },
    {
      id: 'reports',
      name: 'Generated Reports',
      description: 'Previously generated reports and summaries',
    },
  ];

  const handleStartExport = async () => {
    if (!selectedDataType || !selectedFormat) return;

    setIsExporting(true);

    // Create new export job
    const newJob: ExportJob = {
      id: Date.now().toString(),
      name: `${dataTypes.find((dt) => dt.id === selectedDataType)?.name} Export`,
      type: selectedDataType,
      format: selectedFormat,
      status: 'processing',
      createdAt: new Date().toLocaleString(),
    };

    setExportJobs((prev) => [newJob, ...prev]);

    // Simulate export process
    setTimeout(() => {
      setExportJobs((prev) =>
        prev.map((job) =>
          job.id === newJob.id
            ? {
                ...job,
                status: 'completed' as const,
                completedAt: new Date().toLocaleString(),
                fileSize: '3.2 MB',
                downloadUrl: `/exports/${selectedDataType}-${Date.now()}.${selectedFormat}`,
              }
            : job
        )
      );
      setIsExporting(false);
    }, 3000);
  };

  const getStatusColor = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'processing':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleDownload = (job: ExportJob) => {
    if (job.downloadUrl) {
      // In a real app, this would trigger the file download
      console.log('Downloading:', job.downloadUrl);
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
          <span>Data Export</span>
        </div>
        <h1>Data Export</h1>
        <p>
          Export your TMS data in various formats for backup, analysis, or
          migration
        </p>
      </div>

      <div className="tms-grid tms-grid-2">
        {/* Export Configuration */}
        <div className="tms-card">
          <h2>Export Configuration</h2>
          <div className="tms-export-form">
            <div className="tms-form-group">
              <label className="tms-label">Data Type</label>
              <div className="tms-radio-group">
                {dataTypes.map((dataType) => (
                  <div key={dataType.id} className="tms-radio-item">
                    <input
                      type="radio"
                      id={dataType.id}
                      name="dataType"
                      value={dataType.id}
                      checked={selectedDataType === dataType.id}
                      onChange={(e) => setSelectedDataType(e.target.value)}
                      className="tms-radio"
                    />
                    <label htmlFor={dataType.id} className="tms-radio-label">
                      <div className="tms-radio-title">{dataType.name}</div>
                      <div className="tms-radio-description">
                        {dataType.description}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Date Range (Optional)</label>
              <div className="tms-date-range">
                <input
                  type="date"
                  className="tms-input"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, from: e.target.value }))
                  }
                  placeholder="From date"
                />
                <span>to</span>
                <input
                  type="date"
                  className="tms-input"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                  placeholder="To date"
                />
              </div>
            </div>

            <div className="tms-setting-item">
              <div className="tms-setting-info">
                <label className="tms-setting-label">
                  Include Archived Data
                </label>
                <p className="tms-setting-description">
                  Include archived and deleted records in the export
                </p>
              </div>
              <label className="tms-toggle">
                <input
                  type="checkbox"
                  checked={includeArchived}
                  onChange={(e) => setIncludeArchived(e.target.checked)}
                />
                <span className="tms-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="tms-card">
          <h2>Export Format</h2>
          <div className="tms-format-grid">
            {formats.map((format) => (
              <div
                key={format.id}
                className={`tms-format-option ${selectedFormat === format.id ? 'selected' : ''} ${!format.supported ? 'disabled' : ''}`}
                onClick={() => format.supported && setSelectedFormat(format.id)}
              >
                <div className="tms-format-icon">{format.icon}</div>
                <div className="tms-format-info">
                  <h4>{format.name}</h4>
                  <p>{format.description}</p>
                  <span className="tms-format-extension">
                    {format.extension}
                  </span>
                </div>
                {!format.supported && (
                  <span className="tms-format-coming-soon">Coming Soon</span>
                )}
              </div>
            ))}
          </div>

          <div className="tms-export-action">
            <button
              className="tms-button primary large"
              onClick={handleStartExport}
              disabled={!selectedDataType || !selectedFormat || isExporting}
            >
              {isExporting ? 'Starting Export...' : 'Start Export'}
            </button>
          </div>
        </div>
      </div>

      {/* Export Jobs History */}
      <div className="tms-card">
        <h2>Export History</h2>
        <div className="tms-export-jobs">
          {exportJobs.map((job) => (
            <div key={job.id} className="tms-export-job">
              <div className="tms-job-info">
                <div className="tms-job-header">
                  <h3>{job.name}</h3>
                  <span
                    className="tms-status-badge"
                    style={{ backgroundColor: getStatusColor(job.status) }}
                  >
                    {job.status}
                  </span>
                </div>
                <div className="tms-job-details">
                  <span>Type: {job.type}</span>
                  <span>Format: {job.format.toUpperCase()}</span>
                  <span>Created: {job.createdAt}</span>
                  {job.completedAt && <span>Completed: {job.completedAt}</span>}
                  {job.fileSize && <span>Size: {job.fileSize}</span>}
                </div>
              </div>
              <div className="tms-job-actions">
                {job.status === 'completed' && job.downloadUrl && (
                  <button
                    className="tms-button primary small"
                    onClick={() => handleDownload(job)}
                  >
                    Download
                  </button>
                )}
                {job.status === 'processing' && (
                  <div className="tms-processing-indicator">
                    <div className="tms-spinner small"></div>
                    Processing...
                  </div>
                )}
                <button className="tms-button secondary small">Details</button>
                {job.status !== 'processing' && (
                  <button className="tms-button danger small">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {exportJobs.length === 0 && (
          <div className="tms-empty-state">
            <div className="tms-empty-icon">📤</div>
            <h3>No Export History</h3>
            <p>Your export jobs will appear here once you start an export</p>
          </div>
        )}
      </div>

      {/* Export Guidelines */}
      <div className="tms-card">
        <h2>Export Guidelines</h2>
        <div className="tms-guidelines">
          <div className="tms-guideline-item">
            <div className="tms-guideline-icon">ℹ️</div>
            <div>
              <h4>File Size Limits</h4>
              <p>
                Exports are limited to 100MB. For larger datasets, consider
                using date ranges or data filtering.
              </p>
            </div>
          </div>
          <div className="tms-guideline-item">
            <div className="tms-guideline-icon">🔒</div>
            <div>
              <h4>Data Privacy</h4>
              <p>
                Exported files contain sensitive information. Ensure secure
                handling and storage of downloaded files.
              </p>
            </div>
          </div>
          <div className="tms-guideline-item">
            <div className="tms-guideline-icon">⏰</div>
            <div>
              <h4>File Retention</h4>
              <p>
                Export files are available for download for 7 days after
                creation, then automatically deleted.
              </p>
            </div>
          </div>
          <div className="tms-guideline-item">
            <div className="tms-guideline-icon">🔄</div>
            <div>
              <h4>Regular Backups</h4>
              <p>
                Consider scheduling regular exports for data backup and disaster
                recovery purposes.
              </p>
            </div>
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
