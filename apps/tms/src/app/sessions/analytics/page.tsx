'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';

interface SessionAnalytics {
  sessionId: string;
  sessionName: string;
  totalParticipants: number;
  attended: number;
  completionRate: number;
  averageScore: number;
  satisfactionScore: number;
  duration: number;
  date: string;
  trainer: string;
}

interface AnalyticsOverview {
  totalSessions: number;
  totalParticipants: number;
  averageAttendance: number;
  averageCompletion: number;
  averageSatisfaction: number;
  totalTrainingHours: number;
}

interface TimeFilter {
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}

export default function SessionsAnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>({ period: 'month' });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedTrainer, setSelectedTrainer] = useState('all');
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState<AnalyticsOverview>({
    totalSessions: 42,
    totalParticipants: 1285,
    averageAttendance: 87.3,
    averageCompletion: 92.1,
    averageSatisfaction: 4.6,
    totalTrainingHours: 168,
  });

  const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics[]>([
    {
      sessionId: '1',
      sessionName: 'Leadership Excellence Program',
      totalParticipants: 25,
      attended: 24,
      completionRate: 96.0,
      averageScore: 88.5,
      satisfactionScore: 4.8,
      duration: 180,
      date: '2024-01-15',
      trainer: 'Sarah Chen',
    },
    {
      sessionId: '2',
      sessionName: 'Digital Transformation Workshop',
      totalParticipants: 30,
      attended: 26,
      completionRate: 86.7,
      averageScore: 82.3,
      satisfactionScore: 4.5,
      duration: 240,
      date: '2024-01-12',
      trainer: 'Michael Rodriguez',
    },
    {
      sessionId: '3',
      sessionName: 'Project Management Fundamentals',
      totalParticipants: 35,
      attended: 33,
      completionRate: 94.3,
      averageScore: 85.7,
      satisfactionScore: 4.7,
      duration: 300,
      date: '2024-01-10',
      trainer: 'Emily Watson',
    },
    {
      sessionId: '4',
      sessionName: 'Communication Skills Enhancement',
      totalParticipants: 28,
      attended: 25,
      completionRate: 89.3,
      averageScore: 79.2,
      satisfactionScore: 4.4,
      duration: 120,
      date: '2024-01-08',
      trainer: 'David Kim',
    },
    {
      sessionId: '5',
      sessionName: 'Data Analytics Basics',
      totalParticipants: 20,
      attended: 18,
      completionRate: 90.0,
      averageScore: 84.6,
      satisfactionScore: 4.3,
      duration: 360,
      date: '2024-01-05',
      trainer: 'Jennifer Liu',
    },
  ]);

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'it', name: 'Information Technology' },
    { id: 'hr', name: 'Human Resources' },
    { id: 'finance', name: 'Finance' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'operations', name: 'Operations' },
  ];

  const trainers = [
    { id: 'all', name: 'All Trainers' },
    { id: 'sarah', name: 'Sarah Chen' },
    { id: 'michael', name: 'Michael Rodriguez' },
    { id: 'emily', name: 'Emily Watson' },
    { id: 'david', name: 'David Kim' },
    { id: 'jennifer', name: 'Jennifer Liu' },
  ];

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [timeFilter, selectedDepartment, selectedTrainer]);

  const getAttendanceColor = (attended: number, total: number) => {
    const rate = (attended / total) * 100;
    if (rate >= 90) return '#22c55e';
    if (rate >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return '#22c55e';
    if (rate >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 4.5) return '#22c55e';
    if (score >= 4.0) return '#f59e0b';
    return '#ef4444';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="tms-container">
        <div className="tms-header">
          <div className="tms-breadcrumb">
            <Link href="/">Dashboard</Link>
            <span>/</span>
            <Link href="/sessions">Sessions</Link>
            <span>/</span>
            <span>Analytics</span>
          </div>
          <h1>Session Analytics</h1>
        </div>

        <div className="tms-loading-state">
          <div className="tms-spinner"></div>
          <p>Loading analytics data...</p>
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
          <Link href="/sessions">Sessions</Link>
          <span>/</span>
          <span>Analytics</span>
        </div>
        <h1>Session Analytics</h1>
        <p>
          Comprehensive analytics and performance metrics for training sessions
        </p>
      </div>

      {/* Filters */}
      <div className="tms-card">
        <div className="tms-analytics-filters">
          <div className="tms-filter-group">
            <label className="tms-label">Time Period</label>
            <select
              className="tms-select"
              value={timeFilter.period}
              onChange={(e) => setTimeFilter({ period: e.target.value as any })}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="tms-filter-group">
            <label className="tms-label">Department</label>
            <select
              className="tms-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="tms-filter-group">
            <label className="tms-label">Trainer</label>
            <select
              className="tms-select"
              value={selectedTrainer}
              onChange={(e) => setSelectedTrainer(e.target.value)}
            >
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </option>
              ))}
            </select>
          </div>

          <button className="tms-button secondary">Apply Filters</button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="tms-analytics-overview">
        <div className="tms-overview-card">
          <div className="tms-overview-icon">📚</div>
          <div className="tms-overview-content">
            <h3>Total Sessions</h3>
            <span className="tms-overview-value">{overview.totalSessions}</span>
            <span className="tms-overview-change positive">+12%</span>
          </div>
        </div>

        <div className="tms-overview-card">
          <div className="tms-overview-icon">👥</div>
          <div className="tms-overview-content">
            <h3>Total Participants</h3>
            <span className="tms-overview-value">
              {overview.totalParticipants.toLocaleString()}
            </span>
            <span className="tms-overview-change positive">+8%</span>
          </div>
        </div>

        <div className="tms-overview-card">
          <div className="tms-overview-icon">✅</div>
          <div className="tms-overview-content">
            <h3>Avg Attendance</h3>
            <span className="tms-overview-value">
              {overview.averageAttendance}%
            </span>
            <span className="tms-overview-change negative">-2%</span>
          </div>
        </div>

        <div className="tms-overview-card">
          <div className="tms-overview-icon">🎯</div>
          <div className="tms-overview-content">
            <h3>Avg Completion</h3>
            <span className="tms-overview-value">
              {overview.averageCompletion}%
            </span>
            <span className="tms-overview-change positive">+5%</span>
          </div>
        </div>

        <div className="tms-overview-card">
          <div className="tms-overview-icon">⭐</div>
          <div className="tms-overview-content">
            <h3>Avg Satisfaction</h3>
            <span className="tms-overview-value">
              {overview.averageSatisfaction}/5
            </span>
            <span className="tms-overview-change positive">+0.3</span>
          </div>
        </div>

        <div className="tms-overview-card">
          <div className="tms-overview-icon">⏰</div>
          <div className="tms-overview-content">
            <h3>Training Hours</h3>
            <span className="tms-overview-value">
              {overview.totalTrainingHours}
            </span>
            <span className="tms-overview-change positive">+15%</span>
          </div>
        </div>
      </div>

      {/* Detailed Session Analytics */}
      <div className="tms-card">
        <div className="tms-card-header">
          <h2>Session Performance Details</h2>
          <div className="tms-card-actions">
            <button className="tms-button secondary small">Export Data</button>
            <button className="tms-button secondary small">Print Report</button>
          </div>
        </div>

        <div className="tms-table-responsive">
          <table className="tms-table">
            <thead>
              <tr>
                <th>Session Name</th>
                <th>Date</th>
                <th>Trainer</th>
                <th>Attendance</th>
                <th>Completion Rate</th>
                <th>Avg Score</th>
                <th>Satisfaction</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessionAnalytics.map((session) => (
                <tr key={session.sessionId}>
                  <td>
                    <div className="tms-session-name">
                      <strong>{session.sessionName}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="tms-date">
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className="tms-trainer">{session.trainer}</span>
                  </td>
                  <td>
                    <div className="tms-attendance-info">
                      <span
                        className="tms-attendance-badge"
                        style={{
                          color: getAttendanceColor(
                            session.attended,
                            session.totalParticipants
                          ),
                        }}
                      >
                        {session.attended}/{session.totalParticipants}
                      </span>
                      <span className="tms-attendance-percent">
                        (
                        {Math.round(
                          (session.attended / session.totalParticipants) * 100
                        )}
                        %)
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="tms-completion-badge"
                      style={{
                        color: getCompletionColor(session.completionRate),
                      }}
                    >
                      {session.completionRate}%
                    </span>
                  </td>
                  <td>
                    <span className="tms-score-badge">
                      {session.averageScore}%
                    </span>
                  </td>
                  <td>
                    <div className="tms-satisfaction">
                      <span
                        className="tms-satisfaction-score"
                        style={{
                          color: getSatisfactionColor(
                            session.satisfactionScore
                          ),
                        }}
                      >
                        {session.satisfactionScore}/5
                      </span>
                      <div className="tms-satisfaction-stars">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`tms-star ${i < Math.floor(session.satisfactionScore) ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="tms-duration">
                      {formatDuration(session.duration)}
                    </span>
                  </td>
                  <td>
                    <div className="tms-table-actions">
                      <button className="tms-button secondary small">
                        View Details
                      </button>
                      <button className="tms-button secondary small">
                        Export
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="tms-grid tms-grid-2">
        <div className="tms-card">
          <h2>Top Performing Sessions</h2>
          <div className="tms-performance-list">
            {sessionAnalytics
              .sort((a, b) => b.satisfactionScore - a.satisfactionScore)
              .slice(0, 3)
              .map((session, index) => (
                <div key={session.sessionId} className="tms-performance-item">
                  <div className="tms-performance-rank">{index + 1}</div>
                  <div className="tms-performance-info">
                    <h4>{session.sessionName}</h4>
                    <p>
                      Satisfaction: {session.satisfactionScore}/5 • Completion:{' '}
                      {session.completionRate}%
                    </p>
                  </div>
                  <div className="tms-performance-score">
                    <span className="tms-score-value">
                      {session.satisfactionScore}
                    </span>
                    <span className="tms-score-label">/5</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="tms-card">
          <h2>Improvement Opportunities</h2>
          <div className="tms-improvement-list">
            <div className="tms-improvement-item warning">
              <div className="tms-improvement-icon">⚠️</div>
              <div className="tms-improvement-content">
                <h4>Low Attendance Alert</h4>
                <p>
                  Communication Skills session had below-average attendance
                  (89.3%)
                </p>
              </div>
            </div>

            <div className="tms-improvement-item info">
              <div className="tms-improvement-icon">💡</div>
              <div className="tms-improvement-content">
                <h4>Content Review Needed</h4>
                <p>
                  Data Analytics session scored lower on satisfaction (4.3/5)
                </p>
              </div>
            </div>

            <div className="tms-improvement-item success">
              <div className="tms-improvement-icon">✨</div>
              <div className="tms-improvement-content">
                <h4>Excellent Performance</h4>
                <p>Leadership program achieved 96% completion rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export and Actions */}
      <div className="tms-card">
        <h2>Analytics Actions</h2>
        <div className="tms-action-buttons">
          <Link href="/analytics/export-report" className="tms-button primary">
            Generate Full Report
          </Link>
          <button className="tms-button secondary">Schedule Report</button>
          <button className="tms-button secondary">Download Raw Data</button>
          <button className="tms-button secondary">Share Analytics</button>
        </div>
      </div>

      {/* Navigation */}
      <div className="tms-navigation-buttons">
        <Link href="/sessions" className="tms-button secondary">
          Back to Sessions
        </Link>
        <Link href="/" className="tms-button">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
