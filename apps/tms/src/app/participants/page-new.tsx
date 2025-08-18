'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../professional-tms.css';
import { ParticipantsAPI } from '../../lib/api';

// Participant type definition
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

export default function ParticipantsPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const result = await ParticipantsAPI.getAllParticipants();
      if (result.success && result.data) {
        setParticipants(result.data.participants);
      } else {
        // Load demo data as fallback
        setParticipants(generateDemoParticipants());
      }
    } catch (error) {
      setParticipants(generateDemoParticipants());
    } finally {
      setLoading(false);
    }
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
        name: 'Daniel Smith',
        email: 'daniel.smith@company.com',
        phone: '+1 (555) 234-5678',
        department: 'IT',
        status: 'attended',
        registrationDate: new Date(Date.now() - 86400000).toLocaleDateString(),
        lastActivity: new Date().toLocaleDateString(),
        completedSessions: 5,
      },
      {
        id: '3',
        name: 'Sophia Chen',
        email: 'sophia.chen@company.com',
        phone: '+1 (555) 345-6789',
        department: 'Marketing',
        status: 'registered',
        registrationDate: new Date(Date.now() - 172800000).toLocaleDateString(),
        lastActivity: new Date(Date.now() - 86400000).toLocaleDateString(),
        completedSessions: 1,
      },
      {
        id: '4',
        name: 'Michael Johnson',
        email: 'michael.johnson@company.com',
        phone: '+1 (555) 456-7890',
        department: 'Sales',
        status: 'no-show',
        registrationDate: new Date(Date.now() - 259200000).toLocaleDateString(),
        lastActivity: new Date(Date.now() - 172800000).toLocaleDateString(),
        completedSessions: 0,
      },
      {
        id: '5',
        name: 'Olivia Wilson',
        email: 'olivia.wilson@company.com',
        phone: '+1 (555) 567-8901',
        department: 'Operations',
        status: 'confirmed',
        registrationDate: new Date(Date.now() - 345600000).toLocaleDateString(),
        lastActivity: new Date(Date.now() - 259200000).toLocaleDateString(),
        completedSessions: 2,
      },
    ];
  };

  const departments = Array.from(
    new Set(participants.map((p) => p.department))
  );

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || participant.status === filterStatus;
    const matchesDepartment =
      filterDepartment === 'all' || participant.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleSelectAll = () => {
    if (selectedParticipants.length === filteredParticipants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(filteredParticipants.map((p) => p.id));
    }
  };

  const handleParticipantSelect = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(
        selectedParticipants.filter((id) => id !== participantId)
      );
    } else {
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
  };

  if (loading) {
    return (
      <div className="tms-container">
        <div className="tms-loading">Loading Participants...</div>
      </div>
    );
  }

  return (
    <div className="tms-container">
      <div className="tms-header">
        <h1>Participants Management</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href="/participants/add" className="tms-button primary">
            + Add Participant
          </Link>
          <Link href="/" className="tms-button">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="tms-analytics-summary">
        <div className="tms-metric-card">
          <div className="tms-metric-value">{participants.length}</div>
          <div className="tms-metric-label">Total Participants</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {participants.filter((p) => p.status === 'attended').length}
          </div>
          <div className="tms-metric-label">Attended Sessions</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {participants.filter((p) => p.status === 'confirmed').length}
          </div>
          <div className="tms-metric-label">Confirmed</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">{departments.length}</div>
          <div className="tms-metric-label">Departments</div>
        </div>
      </div>

      {/* Professional Action Buttons */}
      <div className="tms-form-container">
        <h3>Participant Management Actions</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          <Link href="/participants/export-csv" className="tms-button primary">
            📊 Export to CSV
          </Link>
          <Link href="/participants/bulk-email" className="tms-button primary">
            📧 Send Bulk Email
          </Link>
          <Link
            href="/participants/export-certificates"
            className="tms-button primary"
          >
            🏆 Export Certificates
          </Link>
          <Link href="/participants/bulk-manage" className="tms-button primary">
            ⚙️ Bulk Management
          </Link>
          <Link href="/participants/import" className="tms-button primary">
            📥 Import Participants
          </Link>
          <Link href="/participants/reports" className="tms-button primary">
            📈 Participant Reports
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="tms-form-container">
        <h3>Filter Participants</h3>
        <div className="tms-form">
          <div className="tms-form-group">
            <label>Search</label>
            <input
              type="text"
              className="tms-input"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tms-form-group">
            <label>Status</label>
            <select
              className="tms-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="registered">Registered</option>
              <option value="confirmed">Confirmed</option>
              <option value="attended">Attended</option>
              <option value="no-show">No-Show</option>
            </select>
          </div>
          <div className="tms-form-group">
            <label>Department</label>
            <select
              className="tms-select"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions for Selected */}
      {selectedParticipants.length > 0 && (
        <div className="tms-form-container">
          <h3>Bulk Actions for Selected ({selectedParticipants.length})</h3>
          <div
            style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}
          >
            <Link
              href={`/participants/bulk-email?ids=${selectedParticipants.join(',')}`}
              className="tms-button secondary"
            >
              Email Selected
            </Link>
            <Link
              href={`/participants/export-csv?ids=${selectedParticipants.join(',')}`}
              className="tms-button secondary"
            >
              Export Selected
            </Link>
            <Link
              href={`/participants/export-certificates?ids=${selectedParticipants.join(',')}`}
              className="tms-button secondary"
            >
              Generate Certificates
            </Link>
            <Link
              href={`/participants/bulk-delete?ids=${selectedParticipants.join(',')}`}
              className="tms-button secondary"
            >
              Delete Selected
            </Link>
          </div>
        </div>
      )}

      {/* Participants Table */}
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
            Participants ({filteredParticipants.length} of {participants.length}
            )
          </h3>
          <button className="tms-button" onClick={handleSelectAll}>
            {selectedParticipants.length === filteredParticipants.length
              ? 'Deselect All'
              : 'Select All'}
          </button>
        </div>

        <div className="tms-table-container">
          <table className="tms-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedParticipants.length ===
                        filteredParticipants.length &&
                      filteredParticipants.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Completed Sessions</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="tms-no-data">
                    No participants match your filters
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((participant) => (
                  <tr key={participant.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={() => handleParticipantSelect(participant.id)}
                      />
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {participant.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {participant.phone}
                        </div>
                      </div>
                    </td>
                    <td>{participant.email}</td>
                    <td>{participant.department}</td>
                    <td>
                      <span className={`tms-status ${participant.status}`}>
                        {participant.status}
                      </span>
                    </td>
                    <td>{participant.completedSessions}</td>
                    <td>{participant.lastActivity}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          href={`/participants/view/${participant.id}`}
                          className="tms-button secondary small"
                        >
                          View
                        </Link>
                        <Link
                          href={`/participants/edit/${participant.id}`}
                          className="tms-button secondary small"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
