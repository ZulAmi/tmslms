'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';
import { SessionsAPI, showNotification } from '../../../lib/api';

// Session type definition
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

interface DuplicationSettings {
  selectedSessions: string[];
  newDate: string;
  newTime: string;
  newLocation: string;
  newInstructor: string;
  duplicateCount: number;
  intervalDays: number;
  resetParticipants: boolean;
  includeCompleted: boolean;
}

export default function DuplicateSessionsPage() {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [duplicationSettings, setDuplicationSettings] =
    useState<DuplicationSettings>({
      selectedSessions: [],
      newDate: '',
      newTime: '',
      newLocation: '',
      newInstructor: '',
      duplicateCount: 1,
      intervalDays: 7,
      resetParticipants: true,
      includeCompleted: false,
    });
  const [previewResults, setPreviewResults] = useState<Session[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const result = await SessionsAPI.getAllSessions();
      if (result.success && result.data) {
        const sessionData = result.data.sessions || generateDemoSessions();
        setSessions(sessionData);
        showNotification(`Loaded ${sessionData.length} sessions`, 'success');
      } else {
        showNotification(result.error || 'Failed to load sessions', 'error');
        setSessions(generateDemoSessions());
      }
    } catch (error) {
      showNotification('Failed to load sessions', 'error');
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
    ];
  };

  const handleSessionSelect = (sessionId: string) => {
    setDuplicationSettings((prev) => ({
      ...prev,
      selectedSessions: prev.selectedSessions.includes(sessionId)
        ? prev.selectedSessions.filter((id) => id !== sessionId)
        : [...prev.selectedSessions, sessionId],
    }));
  };

  const handleSelectAll = () => {
    const filteredSessions = duplicationSettings.includeCompleted
      ? sessions
      : sessions.filter((s) => s.status !== 'completed');

    if (
      duplicationSettings.selectedSessions.length === filteredSessions.length
    ) {
      setDuplicationSettings((prev) => ({ ...prev, selectedSessions: [] }));
    } else {
      setDuplicationSettings((prev) => ({
        ...prev,
        selectedSessions: filteredSessions.map((s) => s.id),
      }));
    }
  };

  const generatePreview = () => {
    if (duplicationSettings.selectedSessions.length === 0) {
      showNotification(
        'Please select at least one session to duplicate',
        'info'
      );
      return;
    }

    const selectedSessionObjects = sessions.filter((s) =>
      duplicationSettings.selectedSessions.includes(s.id)
    );

    const duplicatedSessions: Session[] = [];

    selectedSessionObjects.forEach((originalSession) => {
      for (let i = 0; i < duplicationSettings.duplicateCount; i++) {
        const duplicateDate =
          duplicationSettings.newDate ||
          new Date(
            Date.now() +
              (i + 1) * duplicationSettings.intervalDays * 24 * 60 * 60 * 1000
          ).toLocaleDateString();

        const duplicate: Session = {
          id: `${originalSession.id}-dup-${i + 1}`,
          title: `${originalSession.title} (Copy ${i + 1})`,
          date: duplicateDate,
          time: duplicationSettings.newTime || originalSession.time,
          duration: originalSession.duration,
          participants: duplicationSettings.resetParticipants
            ? 0
            : originalSession.participants,
          maxParticipants: originalSession.maxParticipants,
          status: 'scheduled',
          location: duplicationSettings.newLocation || originalSession.location,
          instructor:
            duplicationSettings.newInstructor || originalSession.instructor,
          category: originalSession.category,
        };

        duplicatedSessions.push(duplicate);
      }
    });

    setPreviewResults(duplicatedSessions);
    showNotification(
      `Generated preview for ${duplicatedSessions.length} duplicated sessions`,
      'success'
    );
  };

  const executeDuplication = async () => {
    if (previewResults.length === 0) {
      showNotification('Please generate a preview first', 'info');
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;
      let failCount = 0;

      for (const session of previewResults) {
        try {
          const result = await SessionsAPI.createSession({
            title: session.title,
            date: session.date,
            time: session.time,
            location: session.location,
            instructor: session.instructor,
            duration: session.duration,
            maxParticipants: session.maxParticipants,
            category: session.category,
          });

          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        showNotification(
          `Successfully duplicated ${successCount} sessions${failCount > 0 ? `, ${failCount} failed` : ''}`,
          successCount > failCount ? 'success' : 'info'
        );

        // Reset preview and reload sessions
        setPreviewResults([]);
        setDuplicationSettings((prev) => ({ ...prev, selectedSessions: [] }));
        loadSessions();
      } else {
        showNotification('Failed to duplicate any sessions', 'error');
      }
    } catch (error) {
      showNotification('Error during duplication process', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = duplicationSettings.includeCompleted
    ? sessions
    : sessions.filter((s) => s.status !== 'completed');

  return (
    <div className="tms-container">
      <div className="tms-header">
        <h1>Duplicate Sessions</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href="/sessions" className="tms-button">
            Back to Sessions
          </Link>
          <Link href="/" className="tms-button">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="tms-form-container">
        <h3>Duplication Settings</h3>
        <div className="tms-form">
          <div className="tms-form-group">
            <label>Number of Duplicates</label>
            <input
              type="number"
              min="1"
              max="10"
              value={duplicationSettings.duplicateCount}
              onChange={(e) =>
                setDuplicationSettings((prev) => ({
                  ...prev,
                  duplicateCount: parseInt(e.target.value) || 1,
                }))
              }
              className="tms-input"
            />
          </div>

          <div className="tms-form-group">
            <label>Interval (Days)</label>
            <input
              type="number"
              min="1"
              value={duplicationSettings.intervalDays}
              onChange={(e) =>
                setDuplicationSettings((prev) => ({
                  ...prev,
                  intervalDays: parseInt(e.target.value) || 1,
                }))
              }
              className="tms-input"
            />
            <small>Days between each duplicated session</small>
          </div>

          <div className="tms-form-group">
            <label>Override Date (Optional)</label>
            <input
              type="date"
              value={duplicationSettings.newDate}
              onChange={(e) =>
                setDuplicationSettings((prev) => ({
                  ...prev,
                  newDate: e.target.value,
                }))
              }
              className="tms-input"
            />
            <small>Leave empty to use interval-based dates</small>
          </div>

          <div className="tms-form-group">
            <label>Override Time (Optional)</label>
            <input
              type="time"
              value={duplicationSettings.newTime}
              onChange={(e) =>
                setDuplicationSettings((prev) => ({
                  ...prev,
                  newTime: e.target.value,
                }))
              }
              className="tms-input"
            />
          </div>

          <div className="tms-form-group">
            <label>Override Location (Optional)</label>
            <input
              type="text"
              value={duplicationSettings.newLocation}
              onChange={(e) =>
                setDuplicationSettings((prev) => ({
                  ...prev,
                  newLocation: e.target.value,
                }))
              }
              className="tms-input"
              placeholder="Leave empty to keep original"
            />
          </div>

          <div className="tms-form-group">
            <label>Override Instructor (Optional)</label>
            <input
              type="text"
              value={duplicationSettings.newInstructor}
              onChange={(e) =>
                setDuplicationSettings((prev) => ({
                  ...prev,
                  newInstructor: e.target.value,
                }))
              }
              className="tms-input"
              placeholder="Leave empty to keep original"
            />
          </div>

          <div className="tms-form-group">
            <label>
              <input
                type="checkbox"
                checked={duplicationSettings.resetParticipants}
                onChange={(e) =>
                  setDuplicationSettings((prev) => ({
                    ...prev,
                    resetParticipants: e.target.checked,
                  }))
                }
              />
              Reset participant count to 0
            </label>
          </div>

          <div className="tms-form-group">
            <label>
              <input
                type="checkbox"
                checked={duplicationSettings.includeCompleted}
                onChange={(e) =>
                  setDuplicationSettings((prev) => ({
                    ...prev,
                    includeCompleted: e.target.checked,
                  }))
                }
              />
              Include completed sessions
            </label>
          </div>
        </div>

        <div className="tms-form-actions">
          <button className="tms-button primary" onClick={generatePreview}>
            Generate Preview
          </button>
          <button
            className="tms-button"
            onClick={executeDuplication}
            disabled={previewResults.length === 0 || loading}
          >
            Execute Duplication
          </button>
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
          <h3>
            Select Sessions to Duplicate (
            {duplicationSettings.selectedSessions.length} selected)
          </h3>
          <button className="tms-button" onClick={handleSelectAll}>
            {duplicationSettings.selectedSessions.length ===
            filteredSessions.length
              ? 'Deselect All'
              : 'Select All'}
          </button>
        </div>

        <div className="tms-table-container">
          <table className="tms-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Instructor</th>
                <th>Status</th>
                <th>Participants</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="tms-no-data">
                    No sessions available for duplication
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={duplicationSettings.selectedSessions.includes(
                          session.id
                        )}
                        onChange={() => handleSessionSelect(session.id)}
                      />
                    </td>
                    <td>{session.title}</td>
                    <td>{session.category}</td>
                    <td>{session.date}</td>
                    <td>{session.instructor}</td>
                    <td>
                      <span className={`tms-status ${session.status}`}>
                        {session.status}
                      </span>
                    </td>
                    <td>
                      {session.participants}/{session.maxParticipants}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewResults.length > 0 && (
        <div className="tms-analytics-content">
          <h3>Preview: {previewResults.length} New Sessions</h3>
          <div className="tms-table-container">
            <table className="tms-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Instructor</th>
                  <th>Participants</th>
                </tr>
              </thead>
              <tbody>
                {previewResults.map((session) => (
                  <tr key={session.id}>
                    <td>{session.title}</td>
                    <td>{session.date}</td>
                    <td>{session.time}</td>
                    <td>{session.location}</td>
                    <td>{session.instructor}</td>
                    <td>
                      {session.participants}/{session.maxParticipants}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
