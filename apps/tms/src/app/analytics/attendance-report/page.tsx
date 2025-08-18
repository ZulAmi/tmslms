'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';
import {
  SessionsAPI,
  ParticipantsAPI,
  showNotification,
} from '../../../lib/api';

// Types
interface AttendanceRecord {
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  instructor: string;
  totalRegistered: number;
  totalAttended: number;
  attendanceRate: number;
  participants: {
    id: string;
    name: string;
    email: string;
    department: string;
    status: 'registered' | 'confirmed' | 'attended' | 'no-show';
  }[];
}

interface ReportFilters {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate: string;
  endDate: string;
  department: string;
  instructor: string;
  sessionType: string;
  minAttendanceRate: number;
}

export default function AttendanceReportPage() {
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'month',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    department: '',
    instructor: '',
    sessionType: '',
    minAttendanceRate: 0,
  });

  const [availableFilters, setAvailableFilters] = useState({
    departments: [] as string[],
    instructors: [] as string[],
    sessionTypes: [] as string[],
  });

  const [reportStats, setReportStats] = useState({
    totalSessions: 0,
    totalRegistrations: 0,
    totalAttendances: 0,
    averageAttendanceRate: 0,
    bestPerformingSession: '',
    worstPerformingSession: '',
  });

  useEffect(() => {
    loadAttendanceData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attendanceData, filters]);

  useEffect(() => {
    calculateStats();
  }, [filteredData]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const sessionResult = await SessionsAPI.getAllSessions();
      const participantResult = await ParticipantsAPI.getAllParticipants();

      if (sessionResult.success && participantResult.success) {
        const sessions = sessionResult.data?.sessions || [];
        const participants = participantResult.data?.participants || [];

        // Generate attendance records
        const attendanceRecords = generateAttendanceRecords(
          sessions,
          participants
        );
        setAttendanceData(attendanceRecords);

        // Extract filter options
        const departments = [
          ...new Set(participants.map((p: any) => p.department)),
        ];
        const instructors = [
          ...new Set(sessions.map((s: any) => s.instructor)),
        ];
        const sessionTypes = [...new Set(sessions.map((s: any) => s.type))];

        setAvailableFilters({ departments, instructors, sessionTypes });

        showNotification(
          `Loaded attendance data for ${attendanceRecords.length} sessions`,
          'success'
        );
      } else {
        // Use demo data if API fails
        const demoData = generateDemoAttendanceData();
        setAttendanceData(demoData);
        setFilteredData(demoData);
        showNotification('Using demo attendance data', 'info');
      }
    } catch (error) {
      showNotification('Failed to load attendance data', 'error');
      const demoData = generateDemoAttendanceData();
      setAttendanceData(demoData);
      setFilteredData(demoData);
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceRecords = (
    sessions: any[],
    participants: any[]
  ): AttendanceRecord[] => {
    return sessions.map((session) => {
      const sessionParticipants = participants
        .filter(
          (p) => Math.random() > 0.3 // Simulate some participants registered for each session
        )
        .map((p) => ({
          ...p,
          status:
            Math.random() > 0.2
              ? 'attended'
              : ('no-show' as
                  | 'registered'
                  | 'confirmed'
                  | 'attended'
                  | 'no-show'),
        }));

      const totalRegistered = sessionParticipants.length;
      const totalAttended = sessionParticipants.filter(
        (p) => p.status === 'attended'
      ).length;
      const attendanceRate =
        totalRegistered > 0
          ? Math.round((totalAttended / totalRegistered) * 100)
          : 0;

      return {
        sessionId: session.id,
        sessionTitle: session.title,
        sessionDate: session.date,
        sessionTime: session.time,
        sessionType: session.type,
        instructor: session.instructor,
        totalRegistered,
        totalAttended,
        attendanceRate,
        participants: sessionParticipants,
      };
    });
  };

  const generateDemoAttendanceData = (): AttendanceRecord[] => {
    return [
      {
        sessionId: '1',
        sessionTitle: 'Leadership Fundamentals',
        sessionDate: new Date().toLocaleDateString(),
        sessionTime: '09:00 AM - 12:00 PM',
        sessionType: 'Leadership',
        instructor: 'Dr. Sarah Johnson',
        totalRegistered: 25,
        totalAttended: 23,
        attendanceRate: 92,
        participants: [
          {
            id: '1',
            name: 'Emma Thompson',
            email: 'emma@company.com',
            department: 'HR',
            status: 'attended',
          },
          {
            id: '2',
            name: 'Daniel Smith',
            email: 'daniel@company.com',
            department: 'IT',
            status: 'attended',
          },
          {
            id: '3',
            name: 'Sophia Chen',
            email: 'sophia@company.com',
            department: 'Marketing',
            status: 'no-show',
          },
        ],
      },
      {
        sessionId: '2',
        sessionTitle: 'Technical Skills Workshop',
        sessionDate: new Date(Date.now() - 86400000).toLocaleDateString(),
        sessionTime: '02:00 PM - 05:00 PM',
        sessionType: 'Technical',
        instructor: 'Michael Rodriguez',
        totalRegistered: 18,
        totalAttended: 15,
        attendanceRate: 83,
        participants: [
          {
            id: '4',
            name: 'Michael Johnson',
            email: 'michael@company.com',
            department: 'Sales',
            status: 'attended',
          },
          {
            id: '5',
            name: 'Olivia Wilson',
            email: 'olivia@company.com',
            department: 'Operations',
            status: 'attended',
          },
        ],
      },
      {
        sessionId: '3',
        sessionTitle: 'Communication Excellence',
        sessionDate: new Date(Date.now() - 172800000).toLocaleDateString(),
        sessionTime: '10:00 AM - 01:00 PM',
        sessionType: 'Soft Skills',
        instructor: 'Dr. Sarah Johnson',
        totalRegistered: 30,
        totalAttended: 28,
        attendanceRate: 93,
        participants: [
          {
            id: '6',
            name: 'James Brown',
            email: 'james@company.com',
            department: 'Finance',
            status: 'attended',
          },
          {
            id: '7',
            name: 'Lisa Davis',
            email: 'lisa@company.com',
            department: 'HR',
            status: 'no-show',
          },
        ],
      },
    ];
  };

  const applyFilters = () => {
    let filtered = [...attendanceData];

    // Date range filter
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    filtered = filtered.filter((record) => {
      const recordDate = new Date(record.sessionDate);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Other filters
    if (filters.department) {
      filtered = filtered.filter((record) =>
        record.participants.some((p) => p.department === filters.department)
      );
    }

    if (filters.instructor) {
      filtered = filtered.filter(
        (record) => record.instructor === filters.instructor
      );
    }

    if (filters.sessionType) {
      filtered = filtered.filter(
        (record) => record.sessionType === filters.sessionType
      );
    }

    if (filters.minAttendanceRate > 0) {
      filtered = filtered.filter(
        (record) => record.attendanceRate >= filters.minAttendanceRate
      );
    }

    setFilteredData(filtered);
  };

  const calculateStats = () => {
    if (filteredData.length === 0) {
      setReportStats({
        totalSessions: 0,
        totalRegistrations: 0,
        totalAttendances: 0,
        averageAttendanceRate: 0,
        bestPerformingSession: '',
        worstPerformingSession: '',
      });
      return;
    }

    const totalSessions = filteredData.length;
    const totalRegistrations = filteredData.reduce(
      (sum, record) => sum + record.totalRegistered,
      0
    );
    const totalAttendances = filteredData.reduce(
      (sum, record) => sum + record.totalAttended,
      0
    );
    const averageAttendanceRate = Math.round(
      filteredData.reduce((sum, record) => sum + record.attendanceRate, 0) /
        totalSessions
    );

    const bestSession = filteredData.reduce((best, current) =>
      current.attendanceRate > best.attendanceRate ? current : best
    );
    const worstSession = filteredData.reduce((worst, current) =>
      current.attendanceRate < worst.attendanceRate ? current : worst
    );

    setReportStats({
      totalSessions,
      totalRegistrations,
      totalAttendances,
      averageAttendanceRate,
      bestPerformingSession: bestSession.sessionTitle,
      worstPerformingSession: worstSession.sessionTitle,
    });
  };

  const handleDateRangeChange = (range: string) => {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    setFilters((prev) => ({
      ...prev,
      dateRange: range as any,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    }));
  };

  const exportReport = () => {
    try {
      const reportData = {
        generatedDate: new Date().toISOString(),
        dateRange: `${filters.startDate} to ${filters.endDate}`,
        filters: filters,
        summary: reportStats,
        sessionDetails: filteredData.map((record) => ({
          sessionTitle: record.sessionTitle,
          sessionDate: record.sessionDate,
          instructor: record.instructor,
          sessionType: record.sessionType,
          totalRegistered: record.totalRegistered,
          totalAttended: record.totalAttended,
          attendanceRate: record.attendanceRate,
          participantCount: record.participants.length,
        })),
      };

      const jsonContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `attendance-report-${filters.startDate}-to-${filters.endDate}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification('Attendance report exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export report', 'error');
    }
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <h1>Attendance Report</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="tms-button" onClick={exportReport}>
            Export Report
          </button>
          <Link href="/analytics" className="tms-button">
            Back to Analytics
          </Link>
          <Link href="/" className="tms-button">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="tms-analytics-summary">
        <div className="tms-metric-card">
          <div className="tms-metric-value">{reportStats.totalSessions}</div>
          <div className="tms-metric-label">Total Sessions</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {reportStats.totalRegistrations}
          </div>
          <div className="tms-metric-label">Total Registrations</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">{reportStats.totalAttendances}</div>
          <div className="tms-metric-label">Total Attendances</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {reportStats.averageAttendanceRate}%
          </div>
          <div className="tms-metric-label">Average Attendance Rate</div>
        </div>
      </div>

      <div className="tms-form-container">
        <h3>Report Filters</h3>
        <div className="tms-form">
          <div className="tms-form-group">
            <label>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="tms-select"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filters.dateRange === 'custom' && (
            <>
              <div className="tms-form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="tms-input"
                />
              </div>
              <div className="tms-form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="tms-input"
                />
              </div>
            </>
          )}

          <div className="tms-form-group">
            <label>Department</label>
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, department: e.target.value }))
              }
              className="tms-select"
            >
              <option value="">All Departments</option>
              {availableFilters.departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="tms-form-group">
            <label>Instructor</label>
            <select
              value={filters.instructor}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, instructor: e.target.value }))
              }
              className="tms-select"
            >
              <option value="">All Instructors</option>
              {availableFilters.instructors.map((instructor) => (
                <option key={instructor} value={instructor}>
                  {instructor}
                </option>
              ))}
            </select>
          </div>

          <div className="tms-form-group">
            <label>Session Type</label>
            <select
              value={filters.sessionType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sessionType: e.target.value }))
              }
              className="tms-select"
            >
              <option value="">All Types</option>
              {availableFilters.sessionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="tms-form-group">
            <label>Minimum Attendance Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.minAttendanceRate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minAttendanceRate: parseInt(e.target.value) || 0,
                }))
              }
              className="tms-input"
            />
          </div>
        </div>
      </div>

      <div className="tms-analytics-content">
        <h3>Session Attendance Details ({filteredData.length} sessions)</h3>

        {loading ? (
          <div className="tms-loading">Loading attendance data...</div>
        ) : (
          <div className="tms-table-container">
            <table className="tms-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Date</th>
                  <th>Instructor</th>
                  <th>Type</th>
                  <th>Registered</th>
                  <th>Attended</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="tms-no-data">
                      No sessions match your filter criteria
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record) => (
                    <tr key={record.sessionId}>
                      <td>{record.sessionTitle}</td>
                      <td>{record.sessionDate}</td>
                      <td>{record.instructor}</td>
                      <td>{record.sessionType}</td>
                      <td>{record.totalRegistered}</td>
                      <td>{record.totalAttended}</td>
                      <td>
                        <span
                          className={`tms-status ${
                            record.attendanceRate >= 90
                              ? 'attended'
                              : record.attendanceRate >= 70
                                ? 'confirmed'
                                : 'registered'
                          }`}
                        >
                          {record.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reportStats.bestPerformingSession &&
        reportStats.worstPerformingSession && (
          <div className="tms-analytics-content">
            <h3>Performance Insights</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
              }}
            >
              <div
                className="tms-form-container"
                style={{ backgroundColor: 'var(--color-success-background)' }}
              >
                <h4>Best Performing Session</h4>
                <p>{reportStats.bestPerformingSession}</p>
                <p>Highest attendance rate in the selected period</p>
              </div>
              <div
                className="tms-form-container"
                style={{ backgroundColor: 'var(--color-error-background)' }}
              >
                <h4>Needs Improvement</h4>
                <p>{reportStats.worstPerformingSession}</p>
                <p>Lowest attendance rate in the selected period</p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
