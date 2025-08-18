'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './professional-tms.css';
import {
  SessionsAPI,
  ParticipantsAPI,
  SettingsAPI,
  ReportsAPI,
} from '../lib/api';

// Type definitions
interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  totalParticipants: number;
  completionRate: number;
  totalBudget: number;
  spentBudget: number;
  pendingAssessments: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  maxParticipants: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  instructor: string;
  category: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  status: 'registered' | 'confirmed' | 'attended' | 'no-show';
  registrationDate: string;
  lastActivity: string;
  completedSessions: number;
}

interface Activity {
  id: string;
  type: 'session' | 'registration' | 'completion' | 'cancellation';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  description: string;
  lastCheck: string;
}

export default function ProfessionalTMSDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    activeSessions: 0,
    totalParticipants: 0,
    completionRate: 0,
    totalBudget: 0,
    spentBudget: 0,
    pendingAssessments: 0,
    systemHealth: 'healthy',
  });
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [recentParticipants, setRecentParticipants] = useState<Participant[]>(
    []
  );
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Load demo data for professional presentation
        const sessions = generateDemoSessions();
        const participants = generateDemoParticipants();
        const activities = generateRecentActivity();
        const services = generateServiceStatus();

        setRecentSessions(sessions);
        setRecentParticipants(participants);
        setRecentActivity(activities);
        setServiceStatus(services);

        // Calculate stats
        const dashboardStats = calculateDashboardStats(sessions, participants);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generateDemoSessions = (): Session[] => {
    return [
      {
        id: '1',
        title: 'Advanced Leadership Training',
        date: new Date().toLocaleDateString(),
        time: '09:00 AM',
        duration: '4 hours',
        participants: 18,
        maxParticipants: 20,
        status: 'in-progress',
        location: 'Conference Room A',
        instructor: 'Sarah Johnson',
        category: 'Leadership',
      },
      {
        id: '2',
        title: 'Digital Transformation Workshop',
        date: new Date(Date.now() + 86400000).toLocaleDateString(),
        time: '02:00 PM',
        duration: '3 hours',
        participants: 25,
        maxParticipants: 30,
        status: 'scheduled',
        location: 'Training Center',
        instructor: 'Michael Chen',
        category: 'Technology',
      },
      {
        id: '3',
        title: 'Project Management Fundamentals',
        date: new Date(Date.now() - 86400000).toLocaleDateString(),
        time: '10:00 AM',
        duration: '6 hours',
        participants: 22,
        maxParticipants: 25,
        status: 'completed',
        location: 'Online',
        instructor: 'David Rodriguez',
        category: 'Management',
      },
      {
        id: '4',
        title: 'Data Analytics Masterclass',
        date: new Date(Date.now() + 172800000).toLocaleDateString(),
        time: '01:00 PM',
        duration: '5 hours',
        participants: 15,
        maxParticipants: 20,
        status: 'scheduled',
        location: 'Lab B',
        instructor: 'Dr. Emma Wilson',
        category: 'Analytics',
      },
      {
        id: '5',
        title: 'Communication Skills Workshop',
        date: new Date(Date.now() - 172800000).toLocaleDateString(),
        time: '11:00 AM',
        duration: '3 hours',
        participants: 28,
        maxParticipants: 30,
        status: 'completed',
        location: 'Conference Room C',
        instructor: 'Jennifer Lee',
        category: 'Soft Skills',
      },
    ];
  };

  const generateDemoParticipants = (): Participant[] => {
    return [
      {
        id: '1',
        name: 'Emma Thompson',
        email: 'emma.thompson@company.com',
        phone: '+1 (555) 123-4567',
        department: 'Human Resources',
        status: 'confirmed',
        registrationDate: new Date().toLocaleDateString(),
        lastActivity: new Date().toLocaleDateString(),
        completedSessions: 3,
      },
      {
        id: '2',
        name: 'James Wilson',
        email: 'james.wilson@company.com',
        phone: '+1 (555) 987-6543',
        department: 'Engineering',
        status: 'attended',
        registrationDate: new Date(Date.now() - 172800000).toLocaleDateString(),
        lastActivity: new Date().toLocaleDateString(),
        completedSessions: 5,
      },
      {
        id: '3',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@company.com',
        phone: '+1 (555) 456-7890',
        department: 'Marketing',
        status: 'registered',
        registrationDate: new Date(Date.now() - 259200000).toLocaleDateString(),
        lastActivity: new Date(Date.now() - 86400000).toLocaleDateString(),
        completedSessions: 1,
      },
      {
        id: '4',
        name: 'Robert Chen',
        email: 'robert.chen@company.com',
        phone: '+1 (555) 321-9876',
        department: 'Finance',
        status: 'attended',
        registrationDate: new Date(Date.now() - 345600000).toLocaleDateString(),
        lastActivity: new Date().toLocaleDateString(),
        completedSessions: 4,
      },
      {
        id: '5',
        name: 'Maria Garcia',
        email: 'maria.garcia@company.com',
        phone: '+1 (555) 654-3210',
        department: 'Operations',
        status: 'confirmed',
        registrationDate: new Date(Date.now() - 432000000).toLocaleDateString(),
        lastActivity: new Date(Date.now() - 43200000).toLocaleDateString(),
        completedSessions: 2,
      },
    ];
  };

  const generateRecentActivity = (): Activity[] => {
    const activities: Activity[] = [];
    const now = new Date();
    const activityTypes = [
      'session',
      'registration',
      'completion',
      'cancellation',
    ] as const;
    const titles = [
      'Leadership Training Session Started',
      'New Participant Registration',
      'Training Module Completed',
      'Session Schedule Updated',
      'Assessment Submitted',
      'Resource Allocation Updated',
      'Participant Feedback Received',
      'Budget Approval Processed',
    ];

    for (let i = 0; i < 8; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000).toISOString();
      activities.push({
        id: `activity-${i}`,
        type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
        title: titles[i] || `Training Activity ${i + 1}`,
        description: `System activity recorded at ${new Date(timestamp).toLocaleTimeString()}`,
        timestamp: timestamp,
        user: `User ${Math.floor(Math.random() * 5) + 1}`,
      });
    }

    return activities;
  };

  const generateServiceStatus = (): ServiceStatus[] => {
    return [
      {
        name: 'Training Scheduler',
        status: 'online',
        description: 'Session scheduling and management',
        lastCheck: new Date().toLocaleTimeString(),
      },
      {
        name: 'Participant Management',
        status: 'online',
        description: 'User registration and tracking',
        lastCheck: new Date().toLocaleTimeString(),
      },
      {
        name: 'Financial Management',
        status: 'online',
        description: 'Budget and cost tracking',
        lastCheck: new Date().toLocaleTimeString(),
      },
      {
        name: 'Assessment System',
        status: 'online',
        description: 'Training evaluation and testing',
        lastCheck: new Date().toLocaleTimeString(),
      },
      {
        name: 'Resource Management',
        status: 'online',
        description: 'Training resource allocation',
        lastCheck: new Date().toLocaleTimeString(),
      },
    ];
  };

  const calculateDashboardStats = (
    sessions: Session[],
    participants: Participant[]
  ): DashboardStats => {
    const activeSessions = sessions.filter(
      (s) => s.status === 'in-progress' || s.status === 'scheduled'
    ).length;
    const completedSessions = sessions.filter(
      (s) => s.status === 'completed'
    ).length;
    const totalParticipants = participants.length;
    const attendedParticipants = participants.filter(
      (p) => p.status === 'attended'
    ).length;

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions,
      totalParticipants: totalParticipants,
      completionRate:
        totalParticipants > 0
          ? Math.round((attendedParticipants / totalParticipants) * 100)
          : 0,
      totalBudget: 250000,
      spentBudget: 147500,
      pendingAssessments: Math.floor(Math.random() * 15) + 8,
      systemHealth: 'healthy',
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'registered':
      case 'online':
        return 'info';
      case 'in-progress':
      case 'confirmed':
        return 'warning';
      case 'completed':
      case 'attended':
        return 'success';
      case 'cancelled':
      case 'no-show':
      case 'offline':
        return 'error';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="tms-dashboard">
        <div className="tms-loading">
          <div className="tms-spinner"></div>
          <span className="tms-loading-text">Loading TMS Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="tms-dashboard">
      {/* Header */}
      <header className="tms-header">
        <div className="tms-header-container">
          <div className="tms-brand">
            <div className="tms-logo">T</div>
            <h1>Training Management System</h1>
          </div>

          <nav className="tms-nav-tabs">
            <button
              className={`tms-nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`tms-nav-tab ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Sessions
            </button>
            <button
              className={`tms-nav-tab ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              Participants
            </button>
            <button
              className={`tms-nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button
              className={`tms-nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </nav>

          <div className="tms-user-menu">
            <div className="tms-user-avatar">AD</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="tms-main">
        {activeTab === 'dashboard' && (
          <div className="tms-fade-in">
            <div className="tms-page-header">
              <h2 className="tms-page-title">Dashboard Overview</h2>
              <p className="tms-page-subtitle">
                Monitor your training programs and system performance
              </p>
            </div>

            {/* Stats Grid */}
            <div className="tms-stats-grid">
              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon primary">
                    <span className="tms-icon">●</span>
                  </div>
                </div>
                <div className="tms-stat-value">{stats.totalSessions}</div>
                <div className="tms-stat-label">Total Sessions</div>
                <div className="tms-stat-change positive">
                  +12% from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon success">
                    <span className="tms-icon">◉</span>
                  </div>
                </div>
                <div className="tms-stat-value">{stats.totalParticipants}</div>
                <div className="tms-stat-label">Active Participants</div>
                <div className="tms-stat-change positive">
                  +8% from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon info">
                    <span className="tms-icon">✓</span>
                  </div>
                </div>
                <div className="tms-stat-value">{stats.completionRate}%</div>
                <div className="tms-stat-label">Completion Rate</div>
                <div className="tms-stat-change positive">
                  +3% from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon warning">
                    <span className="tms-icon">$</span>
                  </div>
                </div>
                <div className="tms-stat-value">
                  {formatCurrency(stats.spentBudget)}
                </div>
                <div className="tms-stat-label">Budget Spent</div>
                <div className="tms-progress" style={{ marginTop: '12px' }}>
                  <div
                    className="tms-progress-bar"
                    style={{
                      width: `${(stats.spentBudget / stats.totalBudget) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="tms-content-grid">
              <div>
                {/* Recent Sessions */}
                <div className="tms-card">
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Recent Training Sessions</h3>
                    <div className="tms-card-actions">
                      <Link
                        href="/sessions"
                        className="tms-btn tms-btn-secondary tms-btn-small"
                      >
                        View All Sessions
                      </Link>
                      <Link
                        href="/sessions/create"
                        className="tms-btn tms-btn-primary tms-btn-small"
                      >
                        Schedule New
                      </Link>
                    </div>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-table-container">
                      <table className="tms-table">
                        <thead>
                          <tr>
                            <th>Session</th>
                            <th>Date & Time</th>
                            <th>Participants</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentSessions.slice(0, 5).map((session) => (
                            <tr key={session.id}>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 600 }}>
                                    {session.title}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '0.75rem',
                                      color: 'var(--gray-500)',
                                    }}
                                  >
                                    {session.instructor} • {session.location}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>{session.date}</div>
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--gray-500)',
                                  }}
                                >
                                  {session.time}
                                </div>
                              </td>
                              <td>
                                {session.participants}/{session.maxParticipants}
                              </td>
                              <td>
                                <span
                                  className={`tms-badge tms-badge-${getStatusColor(session.status)}`}
                                >
                                  {session.status}
                                </span>
                              </td>
                              <td>
                                <Link
                                  href={`/sessions/${session.id}`}
                                  className="tms-btn tms-btn-primary tms-btn-small"
                                >
                                  View Details
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Recent Participants */}
                <div className="tms-card" style={{ marginTop: '2rem' }}>
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Recent Participants</h3>
                    <div className="tms-card-actions">
                      <Link
                        href="/participants"
                        className="tms-btn tms-btn-secondary tms-btn-small"
                      >
                        Manage All
                      </Link>
                      <Link
                        href="/participants/create"
                        className="tms-btn tms-btn-primary tms-btn-small"
                      >
                        Add New
                      </Link>
                    </div>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-table-container">
                      <table className="tms-table">
                        <thead>
                          <tr>
                            <th>Participant</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Sessions</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentParticipants.slice(0, 5).map((participant) => (
                            <tr key={participant.id}>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 600 }}>
                                    {participant.name}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '0.75rem',
                                      color: 'var(--gray-500)',
                                    }}
                                  >
                                    {participant.email}
                                  </div>
                                </div>
                              </td>
                              <td>{participant.department}</td>
                              <td>
                                <span
                                  className={`tms-badge tms-badge-${getStatusColor(participant.status)}`}
                                >
                                  {participant.status}
                                </span>
                              </td>
                              <td>{participant.completedSessions}</td>
                              <td>
                                <Link
                                  href={`/participants/${participant.id}`}
                                  className="tms-btn tms-btn-primary tms-btn-small"
                                >
                                  View Profile
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {/* System Status */}
                <div className="tms-card">
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">System Status</h3>
                    <div className="tms-card-actions">
                      <Link
                        href="/settings/system-status"
                        className="tms-btn tms-btn-secondary tms-btn-small"
                      >
                        System Diagnostics
                      </Link>
                    </div>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-service-status">
                      {serviceStatus.map((service, index) => (
                        <div key={index} className="tms-service-item">
                          <div className="tms-service-info">
                            <div className="tms-service-name">
                              {service.name}
                            </div>
                            <div className="tms-service-description">
                              {service.description}
                            </div>
                          </div>
                          <div
                            className={`tms-service-indicator ${service.status}`}
                          ></div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <Link
                        href="/settings/updates"
                        className="tms-btn tms-btn-secondary tms-btn-small"
                      >
                        Check System Updates
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="tms-card" style={{ marginTop: '2rem' }}>
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Recent Activity</h3>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-activity-feed">
                      {recentActivity.slice(0, 6).map((activity) => (
                        <div key={activity.id} className="tms-activity-item">
                          <div
                            className={`tms-activity-icon tms-stat-icon ${getStatusColor(activity.type)}`}
                          >
                            <span className="tms-icon">
                              {activity.type === 'session' && '●'}
                              {activity.type === 'registration' && '○'}
                              {activity.type === 'completion' && '✓'}
                              {activity.type === 'cancellation' && '×'}
                            </span>
                          </div>
                          <div className="tms-activity-content">
                            <div className="tms-activity-title">
                              {activity.title}
                            </div>
                            <div className="tms-activity-description">
                              {activity.description}
                            </div>
                            <div className="tms-activity-time">
                              {formatDate(activity.timestamp)} by{' '}
                              {activity.user}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="tms-card" style={{ marginTop: '2rem' }}>
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Quick Actions</h3>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-quick-actions">
                      <Link
                        href="/analytics/export-report"
                        className="tms-btn tms-btn-secondary"
                        style={{ marginBottom: '0.5rem', width: '100%' }}
                      >
                        Export Analytics Report
                      </Link>
                      <Link
                        href="/participants/export"
                        className="tms-btn tms-btn-secondary"
                        style={{ marginBottom: '0.5rem', width: '100%' }}
                      >
                        Export Participants
                      </Link>
                      <Link
                        href="/sessions/bulk-manage"
                        className="tms-btn tms-btn-secondary"
                        style={{ marginBottom: '0.5rem', width: '100%' }}
                      >
                        Bulk Session Management
                      </Link>
                      <Link
                        href="/settings/backup"
                        className="tms-btn tms-btn-secondary"
                        style={{ width: '100%' }}
                      >
                        System Backup
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="tms-fade-in">
            <div className="tms-page-header">
              <h2 className="tms-page-title">Training Sessions</h2>
              <p className="tms-page-subtitle">
                Manage and monitor all training sessions
              </p>
            </div>

            <div className="tms-card">
              <div className="tms-card-header">
                <h3 className="tms-card-title">All Sessions</h3>
                <div className="tms-card-actions">
                  <Link
                    href="/sessions/filter"
                    className="tms-btn tms-btn-secondary"
                  >
                    Advanced Filters
                  </Link>
                  <Link
                    href="/sessions/bulk-manage"
                    className="tms-btn tms-btn-secondary tms-btn-small"
                  >
                    Bulk Operations
                  </Link>
                  <Link href="/sessions" className="tms-btn tms-btn-primary">
                    Manage All Sessions
                  </Link>
                  <Link
                    href="/sessions/create"
                    className="tms-btn tms-btn-primary"
                  >
                    Create New Session
                  </Link>
                </div>
              </div>
              <div className="tms-card-content">
                <div className="tms-table-container">
                  <table className="tms-table">
                    <thead>
                      <tr>
                        <th>Session Details</th>
                        <th>Schedule</th>
                        <th>Participants</th>
                        <th>Instructor</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSessions.map((session) => (
                        <tr key={session.id}>
                          <td>
                            <div>
                              <div style={{ fontWeight: 600 }}>
                                {session.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--gray-500)',
                                }}
                              >
                                {session.category} • {session.duration}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>{session.date}</div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--gray-500)',
                              }}
                            >
                              {session.time} • {session.location}
                            </div>
                          </td>
                          <td>
                            <div>
                              {session.participants}/{session.maxParticipants}
                            </div>
                            <div
                              className="tms-progress"
                              style={{ marginTop: '4px' }}
                            >
                              <div
                                className="tms-progress-bar"
                                style={{
                                  width: `${(session.participants / session.maxParticipants) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </td>
                          <td>{session.instructor}</td>
                          <td>
                            <span
                              className={`tms-badge tms-badge-${getStatusColor(session.status)}`}
                            >
                              {session.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Link
                                href={`/sessions/${session.id}/edit`}
                                className="tms-btn tms-btn-secondary tms-btn-small"
                              >
                                Edit
                              </Link>
                              <Link
                                href={`/sessions/${session.id}`}
                                className="tms-btn tms-btn-primary tms-btn-small"
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="tms-fade-in">
            <div className="tms-page-header">
              <h2 className="tms-page-title">Participant Management</h2>
              <p className="tms-page-subtitle">
                Track and manage participant registrations and progress
              </p>
            </div>

            <div className="tms-card">
              <div className="tms-card-header">
                <h3 className="tms-card-title">All Participants</h3>
                <div className="tms-card-actions">
                  <Link
                    href="/participants/export"
                    className="tms-btn tms-btn-secondary"
                  >
                    Export Data
                  </Link>
                  <Link
                    href="/participants/bulk-email"
                    className="tms-btn tms-btn-secondary tms-btn-small"
                  >
                    Bulk Email
                  </Link>
                  <Link
                    href="/participants/certificates"
                    className="tms-btn tms-btn-secondary tms-btn-small"
                  >
                    Export Certificates
                  </Link>
                  <Link
                    href="/participants"
                    className="tms-btn tms-btn-primary"
                  >
                    Manage All Participants
                  </Link>
                  <Link
                    href="/participants/create"
                    className="tms-btn tms-btn-primary"
                  >
                    Add New Participant
                  </Link>
                </div>
              </div>
              <div className="tms-card-content">
                <div className="tms-table-container">
                  <table className="tms-table">
                    <thead>
                      <tr>
                        <th>Participant</th>
                        <th>Contact</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Completed Sessions</th>
                        <th>Last Activity</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentParticipants.map((participant) => (
                        <tr key={participant.id}>
                          <td>
                            <div>
                              <div style={{ fontWeight: 600 }}>
                                {participant.name}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>{participant.email}</div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--gray-500)',
                              }}
                            >
                              {participant.phone}
                            </div>
                          </td>
                          <td>{participant.department}</td>
                          <td>
                            <span
                              className={`tms-badge tms-badge-${getStatusColor(participant.status)}`}
                            >
                              {participant.status}
                            </span>
                          </td>
                          <td>{participant.completedSessions}</td>
                          <td>{participant.lastActivity}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Link
                                href={`/participants/${participant.id}/edit`}
                                className="tms-btn tms-btn-secondary tms-btn-small"
                              >
                                Edit
                              </Link>
                              <Link
                                href={`/participants/${participant.id}`}
                                className="tms-btn tms-btn-primary tms-btn-small"
                              >
                                View Profile
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tms-fade-in">
            <div className="tms-page-header">
              <h2 className="tms-page-title">Analytics & Reporting</h2>
              <p className="tms-page-subtitle">
                Insights and performance metrics for your training programs
              </p>
            </div>

            <div className="tms-stats-grid">
              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon success">
                    <span className="tms-icon">↗</span>
                  </div>
                </div>
                <div className="tms-stat-value">{stats.completionRate}%</div>
                <div className="tms-stat-label">Overall Completion Rate</div>
                <div className="tms-progress" style={{ marginTop: '12px' }}>
                  <div
                    className="tms-progress-bar success"
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon warning">
                    <span className="tms-icon">○</span>
                  </div>
                </div>
                <div className="tms-stat-value">4.2h</div>
                <div className="tms-stat-label">Average Session Duration</div>
                <div className="tms-stat-change positive">
                  +15min from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon info">
                    <span className="tms-icon">★</span>
                  </div>
                </div>
                <div className="tms-stat-value">4.8/5</div>
                <div className="tms-stat-label">Average Rating</div>
                <div className="tms-stat-change positive">
                  +0.3 from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon primary">
                    <span className="tms-icon">●</span>
                  </div>
                </div>
                <div className="tms-stat-value">
                  {formatCurrency(stats.spentBudget / stats.totalParticipants)}
                </div>
                <div className="tms-stat-label">Cost per Participant</div>
                <div className="tms-stat-change negative">
                  -$12 from last month
                </div>
              </div>
            </div>

            <div className="tms-card">
              <div className="tms-card-header">
                <h3 className="tms-card-title">Performance Reports</h3>
                <div className="tms-card-actions">
                  <Link
                    href="/analytics/attendance-report"
                    className="tms-btn tms-btn-secondary tms-btn-small"
                  >
                    Attendance Report
                  </Link>
                  <Link
                    href="/analytics/financial-report"
                    className="tms-btn tms-btn-secondary tms-btn-small"
                  >
                    Financial Report
                  </Link>
                  <Link
                    href="/analytics/performance-report"
                    className="tms-btn tms-btn-secondary tms-btn-small"
                  >
                    Performance Report
                  </Link>
                  <Link href="/analytics" className="tms-btn tms-btn-primary">
                    Full Analytics Dashboard
                  </Link>
                  <Link
                    href="/analytics/export-report"
                    className="tms-btn tms-btn-primary tms-btn-small"
                  >
                    Export All Data
                  </Link>
                </div>
              </div>
              <div className="tms-card-content">
                <div className="tms-chart-container">
                  <div className="tms-chart-placeholder">
                    <h4>Performance Analytics</h4>
                    <p>
                      ● Advanced charts and metrics available in full analytics
                      dashboard
                    </p>
                    <p>
                      ● Integration with charting library provides detailed
                      visualizations
                    </p>
                    <div style={{ marginTop: '1rem' }}>
                      <Link
                        href="/analytics"
                        className="tms-btn tms-btn-primary"
                      >
                        View Full Analytics
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tms-fade-in">
            <div className="tms-page-header">
              <h2 className="tms-page-title">System Settings</h2>
              <p className="tms-page-subtitle">
                Configure your TMS system preferences and integrations
              </p>
            </div>

            <div className="tms-content-grid">
              <div>
                <div className="tms-card">
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">General Settings</h3>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-form-group">
                      <label className="tms-label">Organization Name</label>
                      <input
                        type="text"
                        className="tms-input"
                        defaultValue="Training Management Corp"
                        readOnly
                      />
                    </div>
                    <div className="tms-form-group">
                      <label className="tms-label">
                        Default Session Duration
                      </label>
                      <select className="tms-select" disabled>
                        <option>2 hours</option>
                        <option>4 hours</option>
                        <option>8 hours</option>
                      </select>
                    </div>
                    <div className="tms-form-group">
                      <label className="tms-label">Time Zone</label>
                      <select className="tms-select" disabled>
                        <option>UTC-05:00 (Eastern)</option>
                        <option>UTC-06:00 (Central)</option>
                        <option>UTC-07:00 (Mountain)</option>
                        <option>UTC-08:00 (Pacific)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Link
                        href="/settings"
                        className="tms-btn tms-btn-primary"
                      >
                        Advanced Settings
                      </Link>
                      <Link
                        href="/settings/general"
                        className="tms-btn tms-btn-secondary"
                      >
                        Edit Settings
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="tms-card" style={{ marginTop: '2rem' }}>
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Notification Preferences</h3>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-form-group">
                      <label className="tms-label">Email Notifications</label>
                      <select className="tms-select" disabled>
                        <option>All notifications</option>
                        <option>Important only</option>
                        <option>Disabled</option>
                      </select>
                    </div>
                    <div className="tms-form-group">
                      <label className="tms-label">Session Reminders</label>
                      <select className="tms-select" disabled>
                        <option>24 hours before</option>
                        <option>1 hour before</option>
                        <option>Both</option>
                        <option>Disabled</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Link
                        href="/settings/notifications"
                        className="tms-btn tms-btn-primary"
                      >
                        Manage Notifications
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="tms-card">
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">System Information</h3>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-info-grid">
                      <div className="tms-info-item">
                        <div className="tms-info-label">TMS Version</div>
                        <div className="tms-info-value">2.1.0</div>
                      </div>
                      <div className="tms-info-item">
                        <div className="tms-info-label">Last Update</div>
                        <div className="tms-info-value">Dec 15, 2024</div>
                      </div>
                      <div className="tms-info-item">
                        <div className="tms-info-label">System Status</div>
                        <div className="tms-info-value">
                          <span className="tms-badge tms-badge-success">
                            Healthy
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: '1.5rem',
                        display: 'flex',
                        gap: '12px',
                      }}
                    >
                      <Link
                        href="/settings/system-status"
                        className="tms-btn tms-btn-secondary"
                      >
                        System Diagnostics
                      </Link>
                      <Link
                        href="/settings/updates"
                        className="tms-btn tms-btn-secondary"
                      >
                        Check Updates
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="tms-card" style={{ marginTop: '2rem' }}>
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Service Configuration</h3>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-service-config">
                      {serviceStatus.map((service, index) => (
                        <div key={index} className="tms-service-config-item">
                          <div className="tms-service-info">
                            <div className="tms-service-name">
                              {service.name}
                            </div>
                            <span
                              className={`tms-badge tms-badge-${getStatusColor(service.status)}`}
                            >
                              {service.status}
                            </span>
                          </div>
                          <Link
                            href={`/settings/services/${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="tms-btn tms-btn-secondary tms-btn-small"
                          >
                            Configure
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="tms-card" style={{ marginTop: '2rem' }}>
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">System Maintenance</h3>
                  </div>
                  <div className="tms-card-content">
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <Link
                        href="/settings/backup"
                        className="tms-btn tms-btn-secondary"
                      >
                        System Backup
                      </Link>
                      <Link
                        href="/settings/maintenance"
                        className="tms-btn tms-btn-secondary"
                      >
                        Maintenance Mode
                      </Link>
                      <Link
                        href="/settings/export"
                        className="tms-btn tms-btn-secondary"
                      >
                        Export System Data
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <div className="tms-mobile-nav">
        <button
          className={`tms-mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="tms-mobile-nav-icon">●</span>
          Dashboard
        </button>
        <button
          className={`tms-mobile-nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <span className="tms-mobile-nav-icon">◉</span>
          Sessions
        </button>
        <button
          className={`tms-mobile-nav-item ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          <span className="tms-mobile-nav-icon">○</span>
          People
        </button>
        <button
          className={`tms-mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="tms-mobile-nav-icon">↗</span>
          Analytics
        </button>
      </div>
    </div>
  );
}
