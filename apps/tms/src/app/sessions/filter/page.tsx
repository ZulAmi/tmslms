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

interface FilterCriteria {
  status: string;
  category: string;
  instructor: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  minParticipants: number;
  maxParticipants: number;
}

export default function FilterSessionsPage() {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    status: '',
    category: '',
    instructor: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    minParticipants: 0,
    maxParticipants: 0,
  });

  const [availableFilters, setAvailableFilters] = useState({
    categories: [] as string[],
    instructors: [] as string[],
    locations: [] as string[],
  });

  useEffect(() => {
    loadAllSessions();
  }, []);

  const loadAllSessions = async () => {
    try {
      setLoading(true);
      const result = await SessionsAPI.getAllSessions();
      if (result.success && result.data) {
        const sessionData = result.data.sessions || generateDemoSessions();
        setAllSessions(sessionData);
        setSessions(sessionData);

        // Extract unique values for filter options
        const categories = [...new Set(sessionData.map((s) => s.category))];
        const instructors = [...new Set(sessionData.map((s) => s.instructor))];
        const locations = [...new Set(sessionData.map((s) => s.location))];

        setAvailableFilters({ categories, instructors, locations });

        showNotification(
          `Loaded ${sessionData.length} sessions for filtering`,
          'success'
        );
      } else {
        showNotification(result.error || 'Failed to load sessions', 'error');
        const demoData = generateDemoSessions();
        setAllSessions(demoData);
        setSessions(demoData);
      }
    } catch (error) {
      showNotification('Failed to load sessions', 'error');
      const demoData = generateDemoSessions();
      setAllSessions(demoData);
      setSessions(demoData);
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
        title: 'Financial Planning Seminar',
        date: new Date(Date.now() + 259200000).toLocaleDateString(),
        time: '03:00 PM',
        duration: '2 hours',
        participants: 12,
        maxParticipants: 15,
        status: 'scheduled',
        location: 'Meeting Room 1',
        instructor: 'Robert Kim',
        category: 'Finance',
      },
    ];
  };

  const handleFilterChange = (
    field: keyof FilterCriteria,
    value: string | number
  ) => {
    setFilterCriteria((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    let filteredSessions = [...allSessions];

    // Apply status filter
    if (filterCriteria.status) {
      filteredSessions = filteredSessions.filter(
        (s) => s.status === filterCriteria.status
      );
    }

    // Apply category filter
    if (filterCriteria.category) {
      filteredSessions = filteredSessions.filter(
        (s) => s.category === filterCriteria.category
      );
    }

    // Apply instructor filter
    if (filterCriteria.instructor) {
      filteredSessions = filteredSessions.filter(
        (s) => s.instructor === filterCriteria.instructor
      );
    }

    // Apply location filter
    if (filterCriteria.location) {
      filteredSessions = filteredSessions.filter(
        (s) => s.location === filterCriteria.location
      );
    }

    // Apply participant count filters
    if (filterCriteria.minParticipants > 0) {
      filteredSessions = filteredSessions.filter(
        (s) => s.participants >= filterCriteria.minParticipants
      );
    }

    if (filterCriteria.maxParticipants > 0) {
      filteredSessions = filteredSessions.filter(
        (s) => s.participants <= filterCriteria.maxParticipants
      );
    }

    setSessions(filteredSessions);
    showNotification(
      `Found ${filteredSessions.length} sessions matching your criteria`,
      'success'
    );
  };

  const clearFilters = () => {
    setFilterCriteria({
      status: '',
      category: '',
      instructor: '',
      location: '',
      dateFrom: '',
      dateTo: '',
      minParticipants: 0,
      maxParticipants: 0,
    });
    setSessions(allSessions);
    showNotification('Filters cleared', 'info');
  };

  const exportFilteredResults = () => {
    try {
      const csv =
        'Title,Category,Instructor,Date,Time,Location,Status,Participants\n' +
        sessions
          .map(
            (s) =>
              `"${s.title}","${s.category}","${s.instructor}","${s.date}","${s.time}","${s.location}","${s.status}","${s.participants}/${s.maxParticipants}"`
          )
          .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filtered-sessions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showNotification('Filtered sessions exported successfully!', 'success');
    } catch (error) {
      showNotification('Failed to export filtered results', 'error');
    }
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <h1>Filter Sessions</h1>
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
        <h3>Filter Criteria</h3>
        <div
          className="tms-form"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          }}
        >
          <div className="tms-form-group">
            <label>Status</label>
            <select
              value={filterCriteria.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="tms-select"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="tms-form-group">
            <label>Category</label>
            <select
              value={filterCriteria.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="tms-select"
            >
              <option value="">All Categories</option>
              {availableFilters.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="tms-form-group">
            <label>Instructor</label>
            <select
              value={filterCriteria.instructor}
              onChange={(e) => handleFilterChange('instructor', e.target.value)}
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
            <label>Location</label>
            <select
              value={filterCriteria.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="tms-select"
            >
              <option value="">All Locations</option>
              {availableFilters.locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="tms-form-group">
            <label>Min Participants</label>
            <input
              type="number"
              min="0"
              value={filterCriteria.minParticipants || ''}
              onChange={(e) =>
                handleFilterChange(
                  'minParticipants',
                  parseInt(e.target.value) || 0
                )
              }
              className="tms-input"
              placeholder="0"
            />
          </div>

          <div className="tms-form-group">
            <label>Max Participants</label>
            <input
              type="number"
              min="0"
              value={filterCriteria.maxParticipants || ''}
              onChange={(e) =>
                handleFilterChange(
                  'maxParticipants',
                  parseInt(e.target.value) || 0
                )
              }
              className="tms-input"
              placeholder="Unlimited"
            />
          </div>
        </div>

        <div className="tms-form-actions">
          <button className="tms-button primary" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="tms-button" onClick={clearFilters}>
            Clear All
          </button>
          <button
            className="tms-button"
            onClick={exportFilteredResults}
            disabled={sessions.length === 0}
          >
            Export Results
          </button>
        </div>
      </div>

      {loading ? (
        <div className="tms-loading">Loading sessions...</div>
      ) : (
        <div className="tms-analytics-content">
          <h3>Filtered Results ({sessions.length} sessions)</h3>
          <div className="tms-table-container">
            <table className="tms-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Instructor</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Participants</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="tms-no-data">
                      No sessions match your filter criteria
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.id}>
                      <td>{session.title}</td>
                      <td>{session.category}</td>
                      <td>{session.instructor}</td>
                      <td>{session.date}</td>
                      <td>{session.location}</td>
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
      )}
    </div>
  );
}
