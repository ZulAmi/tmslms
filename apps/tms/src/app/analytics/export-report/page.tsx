'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange: { from: string; to: string };
  includeCharts: boolean;
  includeRawData: boolean;
  reportTypes: string[];
}

interface ReportData {
  summary: {
    totalSessions: number;
    totalParticipants: number;
    averageAttendance: number;
    completionRate: number;
  };
  trends: {
    month: string;
    sessions: number;
    participants: number;
    attendance: number;
  }[];
  topPerformers: {
    session: string;
    attendance: number;
    satisfaction: number;
  }[];
}

export default function ExportReportPage() {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: { from: '', to: '' },
    includeCharts: true,
    includeRawData: false,
    reportTypes: ['attendance', 'performance', 'financial'],
  });

  const [reportData, setReportData] = useState<ReportData>({
    summary: {
      totalSessions: 145,
      totalParticipants: 2847,
      averageAttendance: 87.3,
      completionRate: 92.1,
    },
    trends: [
      { month: 'Oct', sessions: 32, participants: 456, attendance: 85.2 },
      { month: 'Nov', sessions: 38, participants: 612, attendance: 88.7 },
      { month: 'Dec', sessions: 41, participants: 723, attendance: 91.2 },
      { month: 'Jan', sessions: 34, participants: 589, attendance: 87.3 },
    ],
    topPerformers: [
      { session: 'Leadership Excellence', attendance: 98.5, satisfaction: 4.8 },
      {
        session: 'Digital Transformation',
        attendance: 96.2,
        satisfaction: 4.7,
      },
      { session: 'Project Management', attendance: 94.8, satisfaction: 4.6 },
    ],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const availableReportTypes = [
    {
      id: 'attendance',
      name: 'Attendance Report',
      description: 'Detailed attendance tracking and analytics',
    },
    {
      id: 'performance',
      name: 'Performance Report',
      description: 'Training effectiveness and participant progress',
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Cost analysis and budget tracking',
    },
    {
      id: 'satisfaction',
      name: 'Satisfaction Report',
      description: 'Participant feedback and satisfaction scores',
    },
    {
      id: 'completion',
      name: 'Completion Report',
      description: 'Course completion rates and progress tracking',
    },
    {
      id: 'trainer',
      name: 'Trainer Report',
      description: 'Trainer performance and evaluation metrics',
    },
  ];

  useEffect(() => {
    // Set default date range to last 3 months
    const today = new Date();
    const threeMonthsAgo = new Date(
      today.getFullYear(),
      today.getMonth() - 3,
      today.getDate()
    );

    setExportOptions((prev) => ({
      ...prev,
      dateRange: {
        from: threeMonthsAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      },
    }));
  }, []);

  const handleReportTypeToggle = (reportType: string) => {
    setExportOptions((prev) => ({
      ...prev,
      reportTypes: prev.reportTypes.includes(reportType)
        ? prev.reportTypes.filter((type) => type !== reportType)
        : [...prev.reportTypes, reportType],
    }));
  };

  const handleGeneratePreview = async () => {
    setIsGenerating(true);

    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setPreviewData({
      title: 'TMS Analytics Report',
      generatedAt: new Date().toLocaleString(),
      period: `${exportOptions.dateRange.from} to ${exportOptions.dateRange.to}`,
      reportTypes: exportOptions.reportTypes,
      pageCount: Math.ceil(exportOptions.reportTypes.length * 2.5),
    });

    setIsGenerating(false);
  };

  const handleExportReport = async () => {
    setIsGenerating(true);

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // In a real app, this would trigger the file download
    console.log('Exporting report with options:', exportOptions);

    setIsGenerating(false);
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <div className="tms-breadcrumb">
          <Link href="/">Dashboard</Link>
          <span>/</span>
          <Link href="/analytics">Analytics</Link>
          <span>/</span>
          <span>Export Report</span>
        </div>
        <h1>Export Analytics Report</h1>
        <p>
          Generate and export comprehensive analytics reports in multiple
          formats
        </p>
      </div>

      <div className="tms-grid tms-grid-2">
        {/* Export Configuration */}
        <div className="tms-card">
          <h2>Report Configuration</h2>
          <div className="tms-export-form">
            <div className="tms-form-group">
              <label className="tms-label">Date Range</label>
              <div className="tms-date-range">
                <input
                  type="date"
                  className="tms-input"
                  value={exportOptions.dateRange.from}
                  onChange={(e) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from: e.target.value },
                    }))
                  }
                />
                <span>to</span>
                <input
                  type="date"
                  className="tms-input"
                  value={exportOptions.dateRange.to}
                  onChange={(e) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Export Format</label>
              <div className="tms-format-options">
                <label
                  className={`tms-format-card ${exportOptions.format === 'pdf' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={exportOptions.format === 'pdf'}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        format: e.target.value as any,
                      }))
                    }
                  />
                  <div className="tms-format-content">
                    <div className="tms-format-icon">📄</div>
                    <div>
                      <h4>PDF Report</h4>
                      <p>Professional formatted report with charts</p>
                    </div>
                  </div>
                </label>

                <label
                  className={`tms-format-card ${exportOptions.format === 'xlsx' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="format"
                    value="xlsx"
                    checked={exportOptions.format === 'xlsx'}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        format: e.target.value as any,
                      }))
                    }
                  />
                  <div className="tms-format-content">
                    <div className="tms-format-icon">📗</div>
                    <div>
                      <h4>Excel Workbook</h4>
                      <p>Spreadsheet with multiple sheets and data</p>
                    </div>
                  </div>
                </label>

                <label
                  className={`tms-format-card ${exportOptions.format === 'csv' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportOptions.format === 'csv'}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        format: e.target.value as any,
                      }))
                    }
                  />
                  <div className="tms-format-content">
                    <div className="tms-format-icon">📊</div>
                    <div>
                      <h4>CSV Data</h4>
                      <p>Raw data for custom analysis</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Report Options</label>
              <div className="tms-checkbox-group">
                <label className="tms-checkbox-item">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCharts}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeCharts: e.target.checked,
                      }))
                    }
                  />
                  <span>Include Charts and Visualizations</span>
                </label>
                <label className="tms-checkbox-item">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeRawData}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeRawData: e.target.checked,
                      }))
                    }
                  />
                  <span>Include Raw Data Tables</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Report Types Selection */}
        <div className="tms-card">
          <h2>Report Types</h2>
          <div className="tms-report-types">
            {availableReportTypes.map((reportType) => (
              <label
                key={reportType.id}
                className={`tms-report-type-card ${exportOptions.reportTypes.includes(reportType.id) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={exportOptions.reportTypes.includes(reportType.id)}
                  onChange={() => handleReportTypeToggle(reportType.id)}
                />
                <div className="tms-report-type-content">
                  <h4>{reportType.name}</h4>
                  <p>{reportType.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {previewData && (
        <div className="tms-card">
          <h2>Report Preview</h2>
          <div className="tms-report-preview">
            <div className="tms-preview-header">
              <h3>{previewData.title}</h3>
              <div className="tms-preview-meta">
                <span>Generated: {previewData.generatedAt}</span>
                <span>Period: {previewData.period}</span>
                <span>Pages: {previewData.pageCount}</span>
              </div>
            </div>

            <div className="tms-preview-sections">
              <h4>Report Sections:</h4>
              <ul className="tms-section-list">
                {previewData.reportTypes.map((type: string) => (
                  <li key={type}>
                    {availableReportTypes.find((rt) => rt.id === type)?.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="tms-preview-summary">
              <h4>Summary Statistics:</h4>
              <div className="tms-summary-grid">
                <div className="tms-summary-item">
                  <span className="tms-summary-value">
                    {reportData.summary.totalSessions}
                  </span>
                  <span className="tms-summary-label">Total Sessions</span>
                </div>
                <div className="tms-summary-item">
                  <span className="tms-summary-value">
                    {reportData.summary.totalParticipants}
                  </span>
                  <span className="tms-summary-label">Total Participants</span>
                </div>
                <div className="tms-summary-item">
                  <span className="tms-summary-value">
                    {reportData.summary.averageAttendance}%
                  </span>
                  <span className="tms-summary-label">Avg Attendance</span>
                </div>
                <div className="tms-summary-item">
                  <span className="tms-summary-value">
                    {reportData.summary.completionRate}%
                  </span>
                  <span className="tms-summary-label">Completion Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="tms-card">
        <h2>Generate Report</h2>
        <div className="tms-action-buttons">
          <button
            className="tms-button secondary large"
            onClick={handleGeneratePreview}
            disabled={isGenerating || exportOptions.reportTypes.length === 0}
          >
            {isGenerating ? 'Generating Preview...' : 'Generate Preview'}
          </button>

          <button
            className="tms-button primary large"
            onClick={handleExportReport}
            disabled={isGenerating || exportOptions.reportTypes.length === 0}
          >
            {isGenerating
              ? 'Exporting Report...'
              : `Export ${exportOptions.format.toUpperCase()} Report`}
          </button>
        </div>

        {exportOptions.reportTypes.length === 0 && (
          <p className="tms-warning-message">
            Please select at least one report type to generate.
          </p>
        )}
      </div>

      {/* Recent Exports */}
      <div className="tms-card">
        <h2>Recent Exports</h2>
        <div className="tms-recent-exports">
          <div className="tms-export-item">
            <div className="tms-export-info">
              <h4>Quarterly Analytics Report</h4>
              <p>Generated on Jan 14, 2024 • PDF • 2.8 MB</p>
            </div>
            <div className="tms-export-actions">
              <button className="tms-button secondary small">Download</button>
              <button className="tms-button secondary small">View</button>
            </div>
          </div>

          <div className="tms-export-item">
            <div className="tms-export-info">
              <h4>Monthly Performance Report</h4>
              <p>Generated on Jan 01, 2024 • Excel • 1.5 MB</p>
            </div>
            <div className="tms-export-actions">
              <button className="tms-button secondary small">Download</button>
              <button className="tms-button secondary small">View</button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="tms-navigation-buttons">
        <Link href="/analytics" className="tms-button secondary">
          Back to Analytics
        </Link>
        <Link href="/" className="tms-button">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
