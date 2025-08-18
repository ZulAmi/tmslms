'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../../professional-tms.css';
import { SessionsAPI } from '../../../lib/api';

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

export default function BulkManagePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [processing, setProcessing] = useState(false);

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
        status: 'scheduled',
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
        date: new Date(Date.now() + 172800000).toLocaleDateString(),
        time: '10:00 AM',
        duration: '6 hours',
        participants: 22,
        maxParticipants: 25,
        status: 'scheduled',
        location: 'Online',
        instructor: 'David Rodriguez',
        category: 'Management',
      },
    ];
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === sessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(sessions.map((s) => s.id));
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(selectedSessions.filter((id) => id !== sessionId));
    } else {
      setSelectedSessions([...selectedSessions, sessionId]);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedSessions.length === 0) {
      alert('Please select sessions and choose an action');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to ${bulkAction} ${selectedSessions.length} session(s)?`
      )
    ) {
      return;
    }

    try {
      setProcessing(true);

      switch (bulkAction) {
        case 'cancel':
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 2000));
          router.push('/sessions?bulkCancelled=' + selectedSessions.length);
          break;
        case 'delete':
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 2000));
          router.push('/sessions?bulkDeleted=' + selectedSessions.length);
          break;
        case 'reschedule':
          router.push(
            '/sessions/bulk-reschedule?ids=' + selectedSessions.join(',')
          );
          break;
        case 'duplicate':
          router.push('/sessions/duplicate?ids=' + selectedSessions.join(','));
          break;
        case 'export':
          // Simulate export
          const exportData = sessions.filter((s) =>
            selectedSessions.includes(s.id)
          );
          const jsonContent = JSON.stringify(exportData, null, 2);
          const blob = new Blob([jsonContent], { type: 'application/json' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `bulk-sessions-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          alert('Sessions exported successfully!');
          break;
        default:
          alert('Unknown action');
      }
    } catch (error) {
      alert('Failed to perform bulk action');
    } finally {
      setProcessing(false);
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

  return (
    <div className="tms-container">
      <div className="tms-header">
        <h1>Bulk Session Management</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href="/sessions" className="tms-button">
            Back to Sessions
          </Link>
          <Link href="/" className="tms-button">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="tms-analytics-summary">
        <div className="tms-metric-card">
          <div className="tms-metric-value">{sessions.length}</div>
          <div className="tms-metric-label">Total Sessions</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">{selectedSessions.length}</div>
          <div className="tms-metric-label">Selected</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {sessions.filter((s) => s.status === 'scheduled').length}
          </div>
          <div className="tms-metric-label">Scheduled</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {sessions.reduce((sum, s) => sum + s.participants, 0)}
          </div>
          <div className="tms-metric-label">Total Participants</div>
        </div>
      </div>

      <div className="tms-form-container">
        <h3>Bulk Actions</h3>
        <div className="tms-form">
          <div className="tms-form-group">
            <label>Select Action</label>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="tms-select"
            >
              <option value="">Choose an action</option>
              <option value="cancel">Cancel Sessions</option>
              <option value="delete">Delete Sessions</option>
              <option value="reschedule">Reschedule Sessions</option>
              <option value="duplicate">Duplicate Sessions</option>
              <option value="export">Export Sessions</option>
            </select>
          </div>

          <div className="tms-form-actions">
            <button
              className="tms-button primary"
              onClick={handleBulkAction}
              disabled={
                !bulkAction || selectedSessions.length === 0 || processing
              }
            >
              {processing
                ? 'Processing...'
                : `Apply to ${selectedSessions.length} Session(s)`}
            </button>
          </div>
        </div>
      </div>

      <div className="tms-analytics-content">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h3>Select Sessions ({selectedSessions.length} selected)</h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              className="tms-button secondary"
              onClick={() => setSelectedSessions([])}
            >
              Clear Selection
            </button>
            <button className="tms-button secondary" onClick={handleSelectAll}>
              {selectedSessions.length === sessions.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="tms-loading">Loading sessions...</div>
        ) : (
          <div className="tms-table-container">
            <table className="tms-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={
                        selectedSessions.length === sessions.length &&
                        sessions.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Session Details</th>
                  <th>Schedule</th>
                  <th>Participants</th>
                  <th>Status</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedSessions.includes(session.id)}
                        onChange={() => handleSessionSelect(session.id)}
                      />
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                          {session.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {session.category} • {session.instructor}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{session.date}</div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-secondary)',
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
                        style={{ marginTop: '4px', width: '60px' }}
                      >
                        <div
                          className="tms-progress-bar"
                          style={{
                            width: `${(session.participants / session.maxParticipants) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td>
                      <span className={`tms-status ${session.status}`}>
                        {session.status}
                      </span>
                    </td>
                    <td>{session.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="tms-analytics-content">
        <h3>Quick Bulk Actions</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          <Link
            href="/sessions/bulk-cancel"
            className="tms-button primary"
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            🚫 Cancel Multiple Sessions
          </Link>
          <Link
            href="/sessions/duplicate"
            className="tms-button primary"
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            📋 Duplicate Sessions
          </Link>
          <Link
            href="/sessions/bulk-reschedule"
            className="tms-button primary"
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            📅 Reschedule Sessions
          </Link>
          <Link
            href="/sessions/bulk-notify"
            className="tms-button primary"
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            📧 Notify Participants
          </Link>
        </div>
      </div>
    </div>
  );
}
