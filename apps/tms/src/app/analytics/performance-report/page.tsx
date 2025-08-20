'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  target?: number;
}

interface TrainingEffectiveness {
  sessionId: string;
  sessionName: string;
  completionRate: number;
  satisfactionScore: number;
  knowledgeGain: number;
  attendanceRate: number;
  engagementScore: number;
}

interface LearnerProgress {
  participantId: string;
  participantName: string;
  sessionsCompleted: number;
  totalSessions: number;
  averageScore: number;
  improvementRate: number;
  lastActivity: string;
}

export default function PerformanceReportPage() {
  const [timeframe, setTimeframe] = useState('3months');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(true);

  const [performanceMetrics, setPerformanceMetrics] = useState<
    PerformanceMetric[]
  >([
    {
      id: 'completion_rate',
      name: 'Overall Completion Rate',
      value: 87.5,
      unit: '%',
      trend: 'up',
      change: 5.2,
      target: 85,
    },
    {
      id: 'satisfaction',
      name: 'Average Satisfaction Score',
      value: 4.6,
      unit: '/5',
      trend: 'up',
      change: 0.3,
      target: 4.5,
    },
    {
      id: 'knowledge_retention',
      name: 'Knowledge Retention Rate',
      value: 78.3,
      unit: '%',
      trend: 'stable',
      change: -0.5,
      target: 75,
    },
    {
      id: 'engagement',
      name: 'Engagement Score',
      value: 82.1,
      unit: '%',
      trend: 'up',
      change: 7.8,
      target: 80,
    },
    {
      id: 'attendance',
      name: 'Average Attendance Rate',
      value: 91.2,
      unit: '%',
      trend: 'down',
      change: -2.1,
      target: 90,
    },
    {
      id: 'certification',
      name: 'Certification Pass Rate',
      value: 94.7,
      unit: '%',
      trend: 'up',
      change: 3.4,
      target: 90,
    },
  ]);

  const [trainingEffectiveness, setTrainingEffectiveness] = useState<
    TrainingEffectiveness[]
  >([
    {
      sessionId: '1',
      sessionName: 'Leadership Excellence Program',
      completionRate: 96.8,
      satisfactionScore: 4.8,
      knowledgeGain: 85.2,
      attendanceRate: 98.5,
      engagementScore: 89.7,
    },
    {
      sessionId: '2',
      sessionName: 'Digital Transformation Basics',
      completionRate: 89.2,
      satisfactionScore: 4.5,
      knowledgeGain: 78.9,
      attendanceRate: 92.3,
      engagementScore: 84.6,
    },
    {
      sessionId: '3',
      sessionName: 'Project Management Fundamentals',
      completionRate: 92.5,
      satisfactionScore: 4.7,
      knowledgeGain: 82.1,
      attendanceRate: 94.8,
      engagementScore: 87.3,
    },
    {
      sessionId: '4',
      sessionName: 'Communication Skills Workshop',
      completionRate: 85.7,
      satisfactionScore: 4.4,
      knowledgeGain: 76.5,
      attendanceRate: 89.2,
      engagementScore: 81.9,
    },
  ]);

  const [learnerProgress, setLearnerProgress] = useState<LearnerProgress[]>([
    {
      participantId: '1',
      participantName: 'Sarah Chen',
      sessionsCompleted: 8,
      totalSessions: 10,
      averageScore: 92.5,
      improvementRate: 12.3,
      lastActivity: '2 hours ago',
    },
    {
      participantId: '2',
      participantName: 'Michael Rodriguez',
      sessionsCompleted: 12,
      totalSessions: 15,
      averageScore: 87.8,
      improvementRate: 8.7,
      lastActivity: '1 day ago',
    },
    {
      participantId: '3',
      participantName: 'Emily Watson',
      sessionsCompleted: 6,
      totalSessions: 8,
      averageScore: 94.2,
      improvementRate: 15.6,
      lastActivity: '3 hours ago',
    },
    {
      participantId: '4',
      participantName: 'David Kim',
      sessionsCompleted: 9,
      totalSessions: 12,
      averageScore: 89.1,
      improvementRate: 10.4,
      lastActivity: '1 hour ago',
    },
  ]);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [timeframe, selectedDepartment]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '#22c55e';
      case 'down':
        return '#ef4444';
      case 'stable':
        return '#f59e0b';
    }
  };

  const getProgressColor = (current: number, total: number) => {
    const percentage = (current / total) * 100;
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="tms-container">
        <div className="tms-header">
          <div className="tms-breadcrumb">
            <Link href="/">Dashboard</Link>
            <span>/</span>
            <Link href="/analytics">Analytics</Link>
            <span>/</span>
            <span>Performance Report</span>
          </div>
          <h1>Performance Report</h1>
        </div>

        <div className="tms-loading-state">
          <div className="tms-spinner"></div>
          <p>Loading performance data...</p>
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
          <Link href="/analytics">Analytics</Link>
          <span>/</span>
          <span>Performance Report</span>
        </div>
        <h1>Training Performance Report</h1>
        <p>
          Comprehensive analysis of training effectiveness and learner
          performance
        </p>
      </div>

      {/* Filters */}
      <div className="tms-card">
        <div className="tms-filters">
          <div className="tms-filter-group">
            <label className="tms-label">Time Period</label>
            <select
              className="tms-select"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
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
              <option value="all">All Departments</option>
              <option value="it">Information Technology</option>
              <option value="hr">Human Resources</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
              <option value="operations">Operations</option>
            </select>
          </div>

          <button className="tms-button secondary">Generate Report</button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="tms-card">
        <h2>Key Performance Indicators</h2>
        <div className="tms-kpi-grid">
          {performanceMetrics.map((metric) => (
            <div key={metric.id} className="tms-kpi-card">
              <div className="tms-kpi-header">
                <h3>{metric.name}</h3>
                <span
                  className="tms-kpi-trend"
                  style={{ color: getTrendColor(metric.trend) }}
                >
                  {getTrendIcon(metric.trend)}
                </span>
              </div>
              <div className="tms-kpi-value">
                <span className="tms-kpi-number">
                  {metric.value}
                  {metric.unit}
                </span>
                <span
                  className="tms-kpi-change"
                  style={{
                    color:
                      metric.trend === 'up'
                        ? '#22c55e'
                        : metric.trend === 'down'
                          ? '#ef4444'
                          : '#f59e0b',
                  }}
                >
                  {metric.change > 0 ? '+' : ''}
                  {metric.change}
                  {metric.unit}
                </span>
              </div>
              {metric.target && (
                <div className="tms-kpi-target">
                  <div className="tms-progress-bar small">
                    <div
                      className="tms-progress-fill"
                      style={{
                        width: `${Math.min(100, (metric.value / metric.target) * 100)}%`,
                        backgroundColor:
                          metric.value >= metric.target ? '#22c55e' : '#f59e0b',
                      }}
                    ></div>
                  </div>
                  <span>
                    Target: {metric.target}
                    {metric.unit}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Training Effectiveness Analysis */}
      <div className="tms-card">
        <h2>Training Effectiveness Analysis</h2>
        <div className="tms-table-responsive">
          <table className="tms-table">
            <thead>
              <tr>
                <th>Training Session</th>
                <th>Completion Rate</th>
                <th>Satisfaction</th>
                <th>Knowledge Gain</th>
                <th>Attendance</th>
                <th>Engagement</th>
                <th>Overall Score</th>
              </tr>
            </thead>
            <tbody>
              {trainingEffectiveness.map((session) => {
                const overallScore = (
                  (session.completionRate +
                    session.satisfactionScore * 20 +
                    session.knowledgeGain +
                    session.attendanceRate +
                    session.engagementScore) /
                  5
                ).toFixed(1);

                return (
                  <tr key={session.sessionId}>
                    <td>
                      <div className="tms-session-name">
                        <strong>{session.sessionName}</strong>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`tms-metric-badge ${session.completionRate >= 90 ? 'success' : session.completionRate >= 75 ? 'warning' : 'danger'}`}
                      >
                        {session.completionRate}%
                      </span>
                    </td>
                    <td>
                      <div className="tms-rating">
                        <span>{session.satisfactionScore}/5</span>
                        <div className="tms-stars">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < Math.floor(session.satisfactionScore)
                                  ? 'star filled'
                                  : 'star'
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`tms-metric-badge ${session.knowledgeGain >= 80 ? 'success' : session.knowledgeGain >= 65 ? 'warning' : 'danger'}`}
                      >
                        {session.knowledgeGain}%
                      </span>
                    </td>
                    <td>
                      <span
                        className={`tms-metric-badge ${session.attendanceRate >= 90 ? 'success' : session.attendanceRate >= 75 ? 'warning' : 'danger'}`}
                      >
                        {session.attendanceRate}%
                      </span>
                    </td>
                    <td>
                      <span
                        className={`tms-metric-badge ${session.engagementScore >= 85 ? 'success' : session.engagementScore >= 70 ? 'warning' : 'danger'}`}
                      >
                        {session.engagementScore}%
                      </span>
                    </td>
                    <td>
                      <span
                        className={`tms-overall-score ${parseFloat(overallScore) >= 85 ? 'excellent' : parseFloat(overallScore) >= 75 ? 'good' : 'needs-improvement'}`}
                      >
                        {overallScore}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performing Learners */}
      <div className="tms-card">
        <h2>Top Performing Learners</h2>
        <div className="tms-learner-grid">
          {learnerProgress.map((learner) => (
            <div key={learner.participantId} className="tms-learner-card">
              <div className="tms-learner-header">
                <h3>{learner.participantName}</h3>
                <span className="tms-learner-activity">
                  Last active: {learner.lastActivity}
                </span>
              </div>

              <div className="tms-learner-progress">
                <div className="tms-progress-info">
                  <span>
                    Progress: {learner.sessionsCompleted}/
                    {learner.totalSessions}
                  </span>
                  <span>
                    {Math.round(
                      (learner.sessionsCompleted / learner.totalSessions) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="tms-progress-bar">
                  <div
                    className="tms-progress-fill"
                    style={{
                      width: `${(learner.sessionsCompleted / learner.totalSessions) * 100}%`,
                      backgroundColor: getProgressColor(
                        learner.sessionsCompleted,
                        learner.totalSessions
                      ),
                    }}
                  ></div>
                </div>
              </div>

              <div className="tms-learner-metrics">
                <div className="tms-metric-item">
                  <span className="tms-metric-label">Average Score</span>
                  <span className="tms-metric-value">
                    {learner.averageScore}%
                  </span>
                </div>
                <div className="tms-metric-item">
                  <span className="tms-metric-label">Improvement Rate</span>
                  <span className="tms-metric-value">
                    +{learner.improvementRate}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="tms-card">
        <h2>Performance Insights</h2>
        <div className="tms-insights-grid">
          <div className="tms-insight-card success">
            <div className="tms-insight-icon">📈</div>
            <div className="tms-insight-content">
              <h4>Strong Performance Trend</h4>
              <p>
                Overall training effectiveness has improved by 8.3% compared to
                the previous period.
              </p>
            </div>
          </div>

          <div className="tms-insight-card warning">
            <div className="tms-insight-icon">⚠️</div>
            <div className="tms-insight-content">
              <h4>Attendance Concern</h4>
              <p>
                Attendance rates have decreased by 2.1%. Consider reviewing
                session scheduling and format.
              </p>
            </div>
          </div>

          <div className="tms-insight-card info">
            <div className="tms-insight-icon">💡</div>
            <div className="tms-insight-content">
              <h4>High Engagement</h4>
              <p>
                Leadership Excellence Program shows exceptional engagement
                scores. Consider expanding similar programs.
              </p>
            </div>
          </div>

          <div className="tms-insight-card success">
            <div className="tms-insight-icon">🎯</div>
            <div className="tms-insight-content">
              <h4>Certification Success</h4>
              <p>
                Certification pass rates exceed targets by 4.7%, indicating
                effective training delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="tms-card">
        <h2>Export Report</h2>
        <div className="tms-export-actions">
          <Link href="/analytics/export-report" className="tms-button primary">
            Export Detailed Report
          </Link>
          <button className="tms-button secondary">
            Schedule Recurring Report
          </button>
          <button className="tms-button secondary">Share Report</button>
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
