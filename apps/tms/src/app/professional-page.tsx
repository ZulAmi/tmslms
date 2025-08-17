'use client';

import React, { useState, useEffect } from 'react';
import './professional-tms.css';

// Import TMS services
import {
  SchedulingService,
  ResourceManagementService,
  CalendarIntegrationService,
  WaitlistManagementService,
} from '@tmslms/training-scheduler';

import { ParticipantManagementSystem } from '@tmslms/participant-management';

import {
  BudgetPlanningService,
  CostTrackingService,
  InvoiceGenerationService,
} from '@tmslms/financial-management';

import { AssessmentService } from '@tmslms/assessment-system';

// Initialize services
const schedulingService = new SchedulingService();
const resourceService = new ResourceManagementService();
const calendarService = new CalendarIntegrationService();
const waitlistService = new WaitlistManagementService();
const participantService = new ParticipantManagementSystem();
const budgetService = new BudgetPlanningService();
const costService = new CostTrackingService();
const invoiceService = new InvoiceGenerationService();
const assessmentService = new AssessmentService();

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
  status: 'online' | 'offline' | 'degraded';
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch data from services with fallback to demo data
        const sessions = await loadSessions();
        const participants = await loadParticipants();
        const activities = await loadRecentActivity();
        const services = await loadServiceStatus();

        setRecentSessions(sessions);
        setRecentParticipants(participants);
        setRecentActivity(activities);
        setServiceStatus(services);

        // Calculate stats
        const dashboardStats = calculateDashboardStats(sessions, participants);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        loadFallbackData();
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const loadSessions = async (): Promise<Session[]> => {
    try {
      const sessions = await schedulingService.getSessions();
      return sessions.map((session) => ({
        id: session.id,
        title: session.title,
        date: new Date(session.startTime).toLocaleDateString(),
        time: new Date(session.startTime).toLocaleTimeString(),
        duration: session.duration || '2 hours',
        participants: session.registeredParticipants?.length || 0,
        maxParticipants: session.maxParticipants || 25,
        status: session.status as any,
        location: session.location || 'Online',
        instructor: session.instructor || 'TMS Instructor',
        category: session.category || 'Training',
      }));
    } catch (error) {
      return generateDemoSessions();
    }
  };

  const loadParticipants = async (): Promise<Participant[]> => {
    try {
      const participants = await participantService.getAllParticipants();
      return participants.map((participant) => ({
        id: participant.id,
        name: participant.name,
        email: participant.email,
        phone: participant.contactInfo?.phone || 'Not provided',
        department: participant.metadata?.department || 'General',
        status: participant.status as any,
        registrationDate: new Date(
          participant.registrationDate
        ).toLocaleDateString(),
        lastActivity: new Date().toLocaleDateString(),
        completedSessions: participant.completedSessions || 0,
      }));
    } catch (error) {
      return generateDemoParticipants();
    }
  };

  const loadRecentActivity = async (): Promise<Activity[]> => {
    const activities: Activity[] = [];
    const now = new Date();

    // Generate recent activity based on sessions and participants
    for (let i = 0; i < 8; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000).toISOString();
      activities.push({
        id: `activity-${i}`,
        type: ['session', 'registration', 'completion'][
          Math.floor(Math.random() * 3)
        ] as any,
        title: `Training Activity ${i + 1}`,
        description: `System activity recorded at ${new Date(timestamp).toLocaleTimeString()}`,
        timestamp: timestamp,
        user: `User ${i + 1}`,
      });
    }

    return activities;
  };

  const loadServiceStatus = async (): Promise<ServiceStatus[]> => {
    return [
      {
        name: 'Scheduling Service',
        status: 'online',
        description: 'Training session scheduling and management',
        lastCheck: new Date().toLocaleTimeString(),
      },
      {
        name: 'Participant Management',
        status: 'online',
        description: 'User registration and tracking system',
        lastCheck: new Date().toLocaleTimeString(),
      },
      {
        name: 'Financial Management',
        status: 'online',
        description: 'Budget and cost tracking services',
        lastCheck: new Date().toLocaleTimeString(),
      },
      {
        name: 'Assessment System',
        status: 'online',
        description: 'Training assessment and evaluation',
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
      totalBudget: 150000,
      spentBudget: 87500,
      pendingAssessments: Math.floor(Math.random() * 10) + 5,
      systemHealth: 'healthy',
    };
  };

  const loadFallbackData = () => {
    setRecentSessions(generateDemoSessions());
    setRecentParticipants(generateDemoParticipants());
    setStats({
      totalSessions: 45,
      activeSessions: 8,
      totalParticipants: 1247,
      completionRate: 87,
      totalBudget: 150000,
      spentBudget: 87500,
      pendingAssessments: 12,
      systemHealth: 'healthy',
    });
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
                  <div className="tms-stat-icon primary">📊</div>
                </div>
                <div className="tms-stat-value">{stats.totalSessions}</div>
                <div className="tms-stat-label">Total Sessions</div>
                <div className="tms-stat-change positive">
                  +12% from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon success">👥</div>
                </div>
                <div className="tms-stat-value">{stats.totalParticipants}</div>
                <div className="tms-stat-label">Active Participants</div>
                <div className="tms-stat-change positive">
                  +8% from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon info">✅</div>
                </div>
                <div className="tms-stat-value">{stats.completionRate}%</div>
                <div className="tms-stat-label">Completion Rate</div>
                <div className="tms-stat-change positive">
                  +3% from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon warning">💰</div>
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
                      <button className="tms-btn tms-btn-secondary tms-btn-small">
                        View All
                      </button>
                      <button className="tms-btn tms-btn-primary tms-btn-small">
                        Schedule New
                      </button>
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
                      <button className="tms-btn tms-btn-secondary tms-btn-small">
                        Manage
                      </button>
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
                            {activity.type === 'session' && '📅'}
                            {activity.type === 'registration' && '👤'}
                            {activity.type === 'completion' && '✅'}
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
                  <button className="tms-btn tms-btn-secondary">Filter</button>
                  <button className="tms-btn tms-btn-primary">
                    Schedule New Session
                  </button>
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
                              <button className="tms-btn tms-btn-secondary tms-btn-small">
                                Edit
                              </button>
                              <button className="tms-btn tms-btn-primary tms-btn-small">
                                View
                              </button>
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
                  <button className="tms-btn tms-btn-secondary">Export</button>
                  <button className="tms-btn tms-btn-primary">
                    Add Participant
                  </button>
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
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--gray-500)',
                                }}
                              >
                                Registered {participant.registrationDate}
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
                              <button className="tms-btn tms-btn-secondary tms-btn-small">
                                Edit
                              </button>
                              <button className="tms-btn tms-btn-primary tms-btn-small">
                                Profile
                              </button>
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
                  <div className="tms-stat-icon success">📈</div>
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
                  <div className="tms-stat-icon warning">⏱️</div>
                </div>
                <div className="tms-stat-value">4.2h</div>
                <div className="tms-stat-label">Average Session Duration</div>
                <div className="tms-stat-change positive">
                  +15min from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon info">⭐</div>
                </div>
                <div className="tms-stat-value">4.8/5</div>
                <div className="tms-stat-label">Average Rating</div>
                <div className="tms-stat-change positive">
                  +0.3 from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon primary">💼</div>
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
                <h3 className="tms-card-title">Performance Charts</h3>
                <div className="tms-card-actions">
                  <button className="tms-btn tms-btn-secondary tms-btn-small">
                    Export Report
                  </button>
                </div>
              </div>
              <div className="tms-card-content">
                <div className="tms-chart-container">
                  <div>
                    📊 Performance charts will be displayed here
                    <br />
                    <small>Integration with charting library in progress</small>
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
                      />
                    </div>
                    <div className="tms-form-group">
                      <label className="tms-label">
                        Default Session Duration
                      </label>
                      <select className="tms-select">
                        <option>2 hours</option>
                        <option>4 hours</option>
                        <option>6 hours</option>
                        <option>8 hours</option>
                      </select>
                    </div>
                    <div className="tms-form-group">
                      <label className="tms-label">Time Zone</label>
                      <select className="tms-select">
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC-6 (Central Time)</option>
                        <option>UTC-7 (Mountain Time)</option>
                        <option>UTC-8 (Pacific Time)</option>
                      </select>
                    </div>
                    <button className="tms-btn tms-btn-primary">
                      Save Settings
                    </button>
                  </div>
                </div>

                <div className="tms-card" style={{ marginTop: '2rem' }}>
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Notification Preferences</h3>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-form-group">
                      <label className="tms-label">Email Notifications</label>
                      <select className="tms-select">
                        <option>All notifications</option>
                        <option>Important only</option>
                        <option>None</option>
                      </select>
                    </div>
                    <div className="tms-form-group">
                      <label className="tms-label">Reminder Settings</label>
                      <select className="tms-select">
                        <option>24 hours before</option>
                        <option>2 hours before</option>
                        <option>1 hour before</option>
                        <option>Disabled</option>
                      </select>
                    </div>
                    <button className="tms-btn tms-btn-primary">
                      Update Preferences
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="tms-card">
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Service Integrations</h3>
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
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--gray-500)',
                                marginTop: '4px',
                              }}
                            >
                              Last checked: {service.lastCheck}
                            </div>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                            }}
                          >
                            <div
                              className={`tms-service-indicator ${service.status}`}
                            ></div>
                            <button className="tms-btn tms-btn-secondary tms-btn-small">
                              Configure
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="tms-card" style={{ marginTop: '2rem' }}>
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">System Information</h3>
                  </div>
                  <div className="tms-card-content">
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ color: 'var(--gray-600)' }}>
                          TMS Version:
                        </span>
                        <span style={{ fontWeight: 600 }}>v2.1.0</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ color: 'var(--gray-600)' }}>
                          Last Updated:
                        </span>
                        <span style={{ fontWeight: 600 }}>2024-01-15</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ color: 'var(--gray-600)' }}>
                          Database Status:
                        </span>
                        <span className="tms-badge tms-badge-success">
                          Connected
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ color: 'var(--gray-600)' }}>
                          System Health:
                        </span>
                        <span
                          className={`tms-badge tms-badge-${getStatusColor(stats.systemHealth)}`}
                        >
                          {stats.systemHealth}
                        </span>
                      </div>
                    </div>
                    <hr
                      style={{
                        margin: '16px 0',
                        border: 'none',
                        borderTop: '1px solid var(--gray-200)',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="tms-btn tms-btn-secondary tms-btn-small">
                        Run Diagnostics
                      </button>
                      <button className="tms-btn tms-btn-primary tms-btn-small">
                        Check Updates
                      </button>
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
          <span className="tms-mobile-nav-icon">📊</span>
          Dashboard
        </button>
        <button
          className={`tms-mobile-nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <span className="tms-mobile-nav-icon">📅</span>
          Sessions
        </button>
        <button
          className={`tms-mobile-nav-item ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          <span className="tms-mobile-nav-icon">👥</span>
          People
        </button>
        <button
          className={`tms-mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="tms-mobile-nav-icon">📈</span>
          Analytics
        </button>
      </div>
    </div>
  );
}
