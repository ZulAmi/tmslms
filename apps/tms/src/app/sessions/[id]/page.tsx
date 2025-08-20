'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import '../../professional-tms.css';

interface SessionDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  duration: string;
  participants: number;
  maxParticipants: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  instructor: string;
  instructorEmail: string;
  category: string;
  level: string;
  price: number;
  materials: string[];
  prerequisites: string[];
  objectives: string[];
  registeredParticipants: Array<{
    id: string;
    name: string;
    email: string;
    department: string;
    registrationDate: string;
    status: 'registered' | 'confirmed' | 'attended' | 'no-show';
  }>;
}

export default function SessionViewPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'participants' | 'materials' | 'analytics'
  >('overview');

  useEffect(() => {
    const fetchSessionDetails = async () => {
      setLoading(true);

      // Simulate API call with demo data
      await new Promise((resolve) => setTimeout(resolve, 800));

      const demoSession: SessionDetails = {
        id: sessionId,
        title: 'Advanced Leadership Training',
        description:
          'Comprehensive leadership development program focusing on strategic thinking, team management, and organizational change. This intensive session covers modern leadership methodologies and practical applications.',
        date: '2024-01-20',
        time: '09:00',
        endTime: '17:00',
        duration: '8 hours',
        participants: 18,
        maxParticipants: 20,
        status: 'scheduled',
        location: 'Conference Room A, Main Building',
        instructor: 'Sarah Johnson',
        instructorEmail: 'sarah.johnson@company.com',
        category: 'Leadership',
        level: 'Advanced',
        price: 499,
        materials: [
          'Leadership Handbook (PDF)',
          'Case Study Materials',
          'Assessment Tools',
          'Reference Guide',
        ],
        prerequisites: [
          'Basic management experience',
          'Completion of Foundation Leadership course',
          'Supervisory responsibilities',
        ],
        objectives: [
          'Develop strategic thinking skills',
          'Master effective communication techniques',
          'Learn change management principles',
          'Build high-performing teams',
          'Implement leadership best practices',
        ],
        registeredParticipants: [
          {
            id: '1',
            name: 'Emma Thompson',
            email: 'emma.thompson@company.com',
            department: 'Human Resources',
            registrationDate: '2024-01-15',
            status: 'confirmed',
          },
          {
            id: '2',
            name: 'James Wilson',
            email: 'james.wilson@company.com',
            department: 'Engineering',
            registrationDate: '2024-01-14',
            status: 'confirmed',
          },
          {
            id: '3',
            name: 'Lisa Anderson',
            email: 'lisa.anderson@company.com',
            department: 'Marketing',
            registrationDate: '2024-01-13',
            status: 'registered',
          },
          {
            id: '4',
            name: 'Robert Chen',
            email: 'robert.chen@company.com',
            department: 'Finance',
            registrationDate: '2024-01-12',
            status: 'confirmed',
          },
        ],
      };

      setSession(demoSession);
      setLoading(false);
    };

    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3b82f6';
      case 'in-progress':
        return '#f59e0b';
      case 'completed':
        return '#22c55e';
      case 'cancelled':
        return '#ef4444';
      case 'confirmed':
        return '#22c55e';
      case 'registered':
        return '#3b82f6';
      case 'attended':
        return '#22c55e';
      case 'no-show':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="tms-dashboard">
        <header className="tms-header">
          <div className="tms-header-container">
            <div className="tms-brand">
              <div className="tms-logo">T</div>
              <h1>Training Management System</h1>
            </div>
            <div
              className="tms-breadcrumb"
              style={{
                marginLeft: 'auto',
                color: 'var(--gray-600)',
                fontSize: '0.875rem',
              }}
            >
              <Link
                href="/"
                style={{ color: 'var(--primary)', textDecoration: 'none' }}
              >
                Dashboard
              </Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <Link
                href="/sessions"
                style={{ color: 'var(--primary)', textDecoration: 'none' }}
              >
                Sessions
              </Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span>Session Details</span>
            </div>
          </div>
        </header>

        <main className="tms-main">
          <div className="tms-loading">
            <div className="tms-spinner"></div>
            <span className="tms-loading-text">Loading session details...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="tms-dashboard">
        <header className="tms-header">
          <div className="tms-header-container">
            <div className="tms-brand">
              <div className="tms-logo">T</div>
              <h1>Training Management System</h1>
            </div>
            <div
              className="tms-breadcrumb"
              style={{
                marginLeft: 'auto',
                color: 'var(--gray-600)',
                fontSize: '0.875rem',
              }}
            >
              <Link
                href="/"
                style={{ color: 'var(--primary)', textDecoration: 'none' }}
              >
                Dashboard
              </Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <Link
                href="/sessions"
                style={{ color: 'var(--primary)', textDecoration: 'none' }}
              >
                Sessions
              </Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span>Not Found</span>
            </div>
          </div>
        </header>

        <main className="tms-main">
          <div className="tms-fade-in">
            <div className="tms-page-header">
              <h2 className="tms-page-title">Session Not Found</h2>
              <p className="tms-page-subtitle">
                The session you're looking for doesn't exist or has been
                removed.
              </p>
            </div>
            <div className="tms-card">
              <div
                className="tms-card-content"
                style={{ textAlign: 'center', padding: '3rem' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ marginBottom: '1rem' }}>Session Not Found</h3>
                <p style={{ marginBottom: '2rem', color: 'var(--gray-600)' }}>
                  The session you're looking for doesn't exist or has been
                  removed.
                </p>
                <Link href="/sessions" className="tms-btn tms-btn-primary">
                  Back to Sessions
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="tms-dashboard">
      <header className="tms-header">
        <div className="tms-header-container">
          <div className="tms-brand">
            <div className="tms-logo">T</div>
            <h1>Training Management System</h1>
          </div>
          <div
            className="tms-breadcrumb"
            style={{
              marginLeft: 'auto',
              color: 'var(--gray-600)',
              fontSize: '0.875rem',
            }}
          >
            <Link
              href="/"
              style={{ color: 'var(--primary)', textDecoration: 'none' }}
            >
              Dashboard
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link
              href="/sessions"
              style={{ color: 'var(--primary)', textDecoration: 'none' }}
            >
              Sessions
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span>{session.title}</span>
          </div>
        </div>
      </header>

      <main className="tms-main">
        <div className="tms-fade-in">
          <div className="tms-page-header">
            <div className="tms-header-content">
              <div className="tms-header-main">
                <h2 className="tms-page-title">{session.title}</h2>
                <div
                  className="tms-header-meta"
                  style={{ display: 'flex', gap: '12px', marginTop: '8px' }}
                >
                  <span className="tms-badge tms-badge-info">
                    {session.category}
                  </span>
                  <span
                    className="tms-badge"
                    style={{
                      backgroundColor: getStatusColor(session.status),
                      color: 'white',
                    }}
                  >
                    {session.status}
                  </span>
                  <span className="tms-badge tms-badge-secondary">
                    {session.level}
                  </span>
                </div>
              </div>
              <div className="tms-header-actions">
                <Link
                  href={`/sessions/${session.id}/edit`}
                  className="tms-btn tms-btn-secondary"
                >
                  Edit Session
                </Link>
                <button className="tms-btn tms-btn-primary">
                  Register Participant
                </button>
                <button className="tms-btn tms-btn-danger">
                  Cancel Session
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className="tms-nav-tabs"
            style={{
              marginTop: '2rem',
              borderBottom: '1px solid var(--gray-200)',
            }}
          >
            <button
              className={`tms-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tms-nav-tab ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              Participants ({session.participants})
            </button>
            <button
              className={`tms-nav-tab ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('materials')}
            >
              Materials
            </button>
            <button
              className={`tms-nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="tms-content-grid" style={{ marginTop: '2rem' }}>
              <div>
                {/* Session Details */}
                <div className="tms-card">
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Session Details</h3>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-info-grid">
                      <div className="tms-info-item">
                        <div className="tms-info-label">Date & Time</div>
                        <div className="tms-info-value">
                          {new Date(session.date).toLocaleDateString()} at{' '}
                          {session.time} - {session.endTime}
                        </div>
                      </div>
                      <div className="tms-info-item">
                        <div className="tms-info-label">Duration</div>
                        <div className="tms-info-value">{session.duration}</div>
                      </div>
                      <div className="tms-info-item">
                        <div className="tms-info-label">Location</div>
                        <div className="tms-info-value">{session.location}</div>
                      </div>
                      <div className="tms-info-item">
                        <div className="tms-info-label">Instructor</div>
                        <div className="tms-info-value">
                          {session.instructor}
                        </div>
                      </div>
                      <div className="tms-info-item">
                        <div className="tms-info-label">Category</div>
                        <div className="tms-info-value">{session.category}</div>
                      </div>
                      <div className="tms-info-item">
                        <div className="tms-info-label">Level</div>
                        <div className="tms-info-value">{session.level}</div>
                      </div>
                      <div className="tms-info-item">
                        <div className="tms-info-label">Price</div>
                        <div className="tms-info-value">
                          {formatCurrency(session.price)}
                        </div>
                      </div>
                      <div className="tms-info-item">
                        <div className="tms-info-label">Capacity</div>
                        <div className="tms-info-value">
                          {session.participants} / {session.maxParticipants}{' '}
                          participants
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description & Objectives */}
                <div className="tms-card" style={{ marginTop: '2rem' }}>
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Description & Objectives</h3>
                  </div>
                  <div className="tms-card-content">
                    <div style={{ marginBottom: '2rem' }}>
                      <h4
                        style={{
                          marginBottom: '1rem',
                          color: 'var(--gray-800)',
                        }}
                      >
                        Description
                      </h4>
                      <p
                        style={{ lineHeight: '1.6', color: 'var(--gray-700)' }}
                      >
                        {session.description}
                      </p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                      <h4
                        style={{
                          marginBottom: '1rem',
                          color: 'var(--gray-800)',
                        }}
                      >
                        Learning Objectives
                      </h4>
                      <ul style={{ paddingLeft: '1.5rem' }}>
                        {session.objectives.map((objective, index) => (
                          <li
                            key={index}
                            style={{
                              marginBottom: '0.5rem',
                              color: 'var(--gray-700)',
                            }}
                          >
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4
                        style={{
                          marginBottom: '1rem',
                          color: 'var(--gray-800)',
                        }}
                      >
                        Prerequisites
                      </h4>
                      <ul style={{ paddingLeft: '1.5rem' }}>
                        {session.prerequisites.map((prereq, index) => (
                          <li
                            key={index}
                            style={{
                              marginBottom: '0.5rem',
                              color: 'var(--gray-700)',
                            }}
                          >
                            {prereq}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {/* Statistics */}
                <div className="tms-card">
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Session Statistics</h3>
                  </div>
                  <div className="tms-card-content">
                    <div className="tms-stats-grid">
                      <div className="tms-stat-card">
                        <div className="tms-stat-value">
                          {session.participants}
                        </div>
                        <div className="tms-stat-label">Registered</div>
                      </div>
                      <div className="tms-stat-card">
                        <div className="tms-stat-value">
                          {
                            session.registeredParticipants.filter(
                              (p) => p.status === 'confirmed'
                            ).length
                          }
                        </div>
                        <div className="tms-stat-label">Confirmed</div>
                      </div>
                      <div className="tms-stat-card">
                        <div className="tms-stat-value">
                          {session.maxParticipants - session.participants}
                        </div>
                        <div className="tms-stat-label">Available</div>
                      </div>
                      <div className="tms-stat-card">
                        <div className="tms-stat-value">
                          {Math.round(
                            (session.participants / session.maxParticipants) *
                              100
                          )}
                          %
                        </div>
                        <div className="tms-stat-label">Capacity</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="tms-card" style={{ marginTop: '2rem' }}>
                  <div className="tms-card-header">
                    <h3 className="tms-card-title">Quick Actions</h3>
                  </div>
                  <div className="tms-card-content">
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <button className="tms-btn tms-btn-primary">
                        Send Session Reminder
                      </button>
                      <button className="tms-btn tms-btn-secondary">
                        Download Participant List
                      </button>
                      <button className="tms-btn tms-btn-secondary">
                        Export Session Report
                      </button>
                      <Link
                        href={`/sessions/${session.id}/duplicate`}
                        className="tms-btn tms-btn-secondary"
                      >
                        Duplicate Session
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div style={{ marginTop: '2rem' }}>
              <div className="tms-card">
                <div className="tms-card-header">
                  <h3 className="tms-card-title">Registered Participants</h3>
                  <div className="tms-card-actions">
                    <button className="tms-btn tms-btn-primary tms-btn-small">
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
                          <th>Department</th>
                          <th>Registration Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {session.registeredParticipants.map((participant) => (
                          <tr key={participant.id}>
                            <td>
                              <div>
                                <div style={{ fontWeight: 600 }}>
                                  {participant.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--gray-500)',
                                  }}
                                >
                                  {participant.email}
                                </div>
                              </div>
                            </td>
                            <td>{participant.department}</td>
                            <td>
                              {new Date(
                                participant.registrationDate
                              ).toLocaleDateString()}
                            </td>
                            <td>
                              <span
                                className="tms-badge"
                                style={{
                                  backgroundColor: getStatusColor(
                                    participant.status
                                  ),
                                  color: 'white',
                                }}
                              >
                                {participant.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="tms-btn tms-btn-secondary tms-btn-small">
                                  Edit
                                </button>
                                <button className="tms-btn tms-btn-danger tms-btn-small">
                                  Remove
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

          {activeTab === 'materials' && (
            <div style={{ marginTop: '2rem' }}>
              <div className="tms-card">
                <div className="tms-card-header">
                  <h3 className="tms-card-title">Session Materials</h3>
                  <div className="tms-card-actions">
                    <button className="tms-btn tms-btn-primary tms-btn-small">
                      Add Material
                    </button>
                  </div>
                </div>
                <div className="tms-card-content">
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {session.materials.map((material, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          border: '1px solid var(--gray-200)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--gray-100)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            📄
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{material}</div>
                            <div
                              style={{
                                fontSize: '0.875rem',
                                color: 'var(--gray-500)',
                              }}
                            >
                              Document
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="tms-btn tms-btn-secondary tms-btn-small">
                            Download
                          </button>
                          <button className="tms-btn tms-btn-danger tms-btn-small">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div style={{ marginTop: '2rem' }}>
              <div className="tms-card">
                <div className="tms-card-header">
                  <h3 className="tms-card-title">Session Analytics</h3>
                  <div className="tms-card-actions">
                    <button className="tms-btn tms-btn-secondary tms-btn-small">
                      Export Report
                    </button>
                  </div>
                </div>
                <div className="tms-card-content">
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                      📊
                    </div>
                    <h3 style={{ marginBottom: '1rem' }}>
                      Analytics Dashboard
                    </h3>
                    <p
                      style={{ marginBottom: '2rem', color: 'var(--gray-600)' }}
                    >
                      Detailed analytics and reporting features will be
                      available once the session is completed.
                    </p>
                    <Link href="/analytics" className="tms-btn tms-btn-primary">
                      View Full Analytics
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
