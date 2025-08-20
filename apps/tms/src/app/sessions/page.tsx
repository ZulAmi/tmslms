'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../professional-tms.css';
import { SessionsAPI } from '../../lib/api';

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

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const result = await SessionsAPI.getAllSessions();
      if (result.success && result.data) {
        setSessions(result.data.sessions);
      } else {
        // Load demo data as fallback
        setSessions(generateDemoSessions());
      }
    } catch (error) {
      setSessions(generateDemoSessions());
    } finally {
      setLoading(false);
    }
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
      {
        id: '6',
        title: 'Cybersecurity Awareness Training',
        date: new Date(Date.now() + 259200000).toLocaleDateString(),
        time: '03:00 PM',
        duration: '2 hours',
        participants: 12,
        maxParticipants: 15,
        status: 'scheduled',
        location: 'Online',
        instructor: 'Alex Thompson',
        category: 'Security',
      },
    ];
  };

  const handleCreateSession = async (sessionData: any) => {
    try {
      const result = await SessionsAPI.createSession(sessionData);
      if (result.success) {
        setShowCreateForm(false);
        loadSessions();
      }
    } catch (error) {
      // Handle error silently or redirect to error page
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        const result = await SessionsAPI.deleteSession(sessionId);
        if (result.success) {
          loadSessions();
        }
      } catch (error) {
        // Handle error silently or redirect to error page
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'gray';
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || session.status === filterStatus;
    const matchesCategory =
      filterCategory === 'all' || session.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(sessions.map((s) => s.category)));

  if (loading) {
    return (
      <div className="tms-dashboard">
        <div className="tms-loading">
          <div className="tms-spinner"></div>
          <span className="tms-loading-text">Loading Sessions...</span>
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
            <Link href="/">
              <div className="tms-logo">T</div>
            </Link>
            <h1>Sessions Management</h1>
          </div>
          <div className="tms-user-menu">
            <Link href="/" className="tms-btn tms-btn-secondary tms-btn-small">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="tms-main">
        <div className="tms-fade-in">
          {/* Page Header */}
          <div className="tms-page-header">
            <div>
              <h2 className="tms-page-title">Training Sessions</h2>
              <p className="tms-page-subtitle">
                Comprehensive session management and scheduling
              </p>
            </div>
            <div className="tms-card-actions">
              <Link
                href="/sessions/create"
                className="tms-btn tms-btn-secondary"
              >
                + Schedule New Session
              </Link>
              <button
                className="tms-btn tms-btn-primary"
                onClick={loadSessions}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="tms-stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="tms-stat-card">
              <div className="tms-stat-header">
                <div className="tms-stat-icon primary">
                  <span className="tms-icon">●</span>
                </div>
              </div>
              <div className="tms-stat-value">{sessions.length}</div>
              <div className="tms-stat-label">Total Sessions</div>
            </div>
            <div className="tms-stat-card">
              <div className="tms-stat-header">
                <div className="tms-stat-icon warning">
                  <span className="tms-icon">◉</span>
                </div>
              </div>
              <div className="tms-stat-value">
                {sessions.filter((s) => s.status === 'in-progress').length}
              </div>
              <div className="tms-stat-label">Active Sessions</div>
            </div>
            <div className="tms-stat-card">
              <div className="tms-stat-header">
                <div className="tms-stat-icon info">
                  <span className="tms-icon">○</span>
                </div>
              </div>
              <div className="tms-stat-value">
                {sessions.filter((s) => s.status === 'scheduled').length}
              </div>
              <div className="tms-stat-label">Scheduled</div>
            </div>
            <div className="tms-stat-card">
              <div className="tms-stat-header">
                <div className="tms-stat-icon success">
                  <span className="tms-icon">✓</span>
                </div>
              </div>
              <div className="tms-stat-value">
                {sessions.filter((s) => s.status === 'completed').length}
              </div>
              <div className="tms-stat-label">Completed</div>
            </div>
          </div>

          {/* Action Buttons - Professional Pages */}
          <div className="tms-card" style={{ marginBottom: '2rem' }}>
            <div className="tms-card-header">
              <h3 className="tms-card-title">Session Management Actions</h3>
            </div>
            <div className="tms-card-content">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <Link
                  href="/sessions/filter"
                  className="tms-btn tms-btn-primary"
                >
                  🔍 Filter Sessions
                </Link>
                <Link
                  href="/sessions/duplicate"
                  className="tms-btn tms-btn-primary"
                >
                  📋 Duplicate Sessions
                </Link>
                <Link
                  href="/sessions/bulk-manage"
                  className="tms-btn tms-btn-primary"
                >
                  ⚙️ Bulk Management
                </Link>
                <Link
                  href="/sessions/analytics"
                  className="tms-btn tms-btn-primary"
                >
                  📊 Session Analytics
                </Link>
                <Link
                  href="/sessions/schedule"
                  className="tms-btn tms-btn-primary"
                >
                  📅 Schedule Management
                </Link>
                <Link
                  href="/sessions/reports"
                  className="tms-btn tms-btn-primary"
                >
                  📈 Session Reports
                </Link>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="tms-card" style={{ marginBottom: '2rem' }}>
            <div className="tms-card-header">
              <h3 className="tms-card-title">Quick Filters</h3>
              <div className="tms-card-actions">
                {selectedSessions.length > 0 && (
                  <>
                    <Link
                      href={`/sessions/bulk-cancel?ids=${selectedSessions.join(',')}`}
                      className="tms-btn tms-btn-secondary tms-btn-small"
                    >
                      Cancel Selected
                    </Link>
                    <Link
                      href={`/sessions/duplicate?ids=${selectedSessions.join(',')}`}
                      className="tms-btn tms-btn-secondary tms-btn-small"
                    >
                      Duplicate Selected
                    </Link>
                    <Link
                      href={`/sessions/bulk-delete?ids=${selectedSessions.join(',')}`}
                      className="tms-btn tms-btn-secondary tms-btn-small"
                    >
                      Delete Selected ({selectedSessions.length})
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="tms-card-content">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  gap: '1rem',
                }}
              >
                <div className="tms-form-group">
                  <label className="tms-label">Search Sessions</label>
                  <input
                    type="text"
                    className="tms-input"
                    placeholder="Search by title, instructor, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="tms-form-group">
                  <label className="tms-label">Filter by Status</label>
                  <select
                    className="tms-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="tms-form-group">
                  <label className="tms-label">Filter by Category</label>
                  <select
                    className="tms-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="tms-card">
            <div className="tms-card-header">
              <h3 className="tms-card-title">
                Sessions ({filteredSessions.length} of {sessions.length})
              </h3>
              <div className="tms-card-actions">
                <button
                  className="tms-btn tms-btn-secondary tms-btn-small"
                  onClick={() => setSelectedSessions([])}
                >
                  Clear Selection
                </button>
                <button
                  className="tms-btn tms-btn-secondary tms-btn-small"
                  onClick={() =>
                    setSelectedSessions(filteredSessions.map((s) => s.id))
                  }
                >
                  Select All
                </button>
              </div>
            </div>
            <div className="tms-card-content">
              <div className="tms-table-container">
                <table className="tms-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSessions(
                                filteredSessions.map((s) => s.id)
                              );
                            } else {
                              setSelectedSessions([]);
                            }
                          }}
                          checked={
                            selectedSessions.length ===
                              filteredSessions.length &&
                            filteredSessions.length > 0
                          }
                        />
                      </th>
                      <th>Session Details</th>
                      <th>Schedule</th>
                      <th>Participants</th>
                      <th>Instructor</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => (
                      <tr key={session.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedSessions.includes(session.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSessions([
                                  ...selectedSessions,
                                  session.id,
                                ]);
                              } else {
                                setSelectedSessions(
                                  selectedSessions.filter(
                                    (id) => id !== session.id
                                  )
                                );
                              }
                            }}
                          />
                        </td>
                        <td>
                          <div>
                            <div
                              style={{ fontWeight: 600, marginBottom: '4px' }}
                            >
                              {session.title}
                            </div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--gray-500)',
                              }}
                            >
                              {session.category} • {session.location}
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
                            {session.time} • {session.duration}
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
                              href={`/sessions/edit/${session.id}`}
                              className="tms-btn tms-btn-secondary tms-btn-small"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/sessions/view/${session.id}`}
                              className="tms-btn tms-btn-secondary tms-btn-small"
                            >
                              View
                            </Link>
                            <Link
                              href={`/sessions/delete/${session.id}`}
                              className="tms-btn tms-btn-secondary tms-btn-small"
                            >
                              Delete
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

          {/* Empty State */}
          {filteredSessions.length === 0 && (
            <div
              className="tms-card"
              style={{ textAlign: 'center', padding: '3rem' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ marginBottom: '1rem' }}>No sessions found</h3>
              <p style={{ marginBottom: '2rem', color: 'var(--gray-600)' }}>
                {searchTerm ||
                filterStatus !== 'all' ||
                filterCategory !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first training session.'}
              </p>
              <Link href="/sessions/create" className="tms-btn tms-btn-primary">
                Create New Session
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
