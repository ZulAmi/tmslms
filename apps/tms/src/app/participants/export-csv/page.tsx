'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';
import { ParticipantsAPI, showNotification } from '../../../lib/api';

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

interface ExportSettings {
  selectedParticipants: string[];
  includeFields: {
    name: boolean;
    email: boolean;
    phone: boolean;
    department: boolean;
    status: boolean;
    registrationDate: boolean;
    lastActivity: boolean;
    completedSessions: boolean;
  };
  filterByStatus: string;
  filterByDepartment: string;
  exportFormat: 'csv' | 'excel' | 'json';
  fileName: string;
}

export default function ExportParticipantsPage() {
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<
    Participant[]
  >([]);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    selectedParticipants: [],
    includeFields: {
      name: true,
      email: true,
      phone: true,
      department: true,
      status: true,
      registrationDate: true,
      lastActivity: false,
      completedSessions: true,
    },
    filterByStatus: '',
    filterByDepartment: '',
    exportFormat: 'csv',
    fileName: `participants-export-${new Date().toISOString().split('T')[0]}`,
  });

  const [availableFilters, setAvailableFilters] = useState({
    departments: [] as string[],
  });

  useEffect(() => {
    loadParticipants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    participants,
    exportSettings.filterByStatus,
    exportSettings.filterByDepartment,
  ]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const result = await ParticipantsAPI.getAllParticipants();
      if (result.success && result.data) {
        const participantData =
          result.data.participants || generateDemoParticipants();
        setParticipants(participantData);

        // Extract unique departments
        const departments = [
          ...new Set(participantData.map((p) => p.department)),
        ];
        setAvailableFilters({ departments });

        showNotification(
          `Loaded ${participantData.length} participants`,
          'success'
        );
      } else {
        showNotification(
          result.error || 'Failed to load participants',
          'error'
        );
        const demoData = generateDemoParticipants();
        setParticipants(demoData);
        setFilteredParticipants(demoData);
      }
    } catch (error) {
      showNotification('Failed to load participants', 'error');
      const demoData = generateDemoParticipants();
      setParticipants(demoData);
      setFilteredParticipants(demoData);
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

  const applyFilters = () => {
    let filtered = [...participants];

    if (exportSettings.filterByStatus) {
      filtered = filtered.filter(
        (p) => p.status === exportSettings.filterByStatus
      );
    }

    if (exportSettings.filterByDepartment) {
      filtered = filtered.filter(
        (p) => p.department === exportSettings.filterByDepartment
      );
    }

    setFilteredParticipants(filtered);
  };

  const handleParticipantSelect = (participantId: string) => {
    setExportSettings((prev) => ({
      ...prev,
      selectedParticipants: prev.selectedParticipants.includes(participantId)
        ? prev.selectedParticipants.filter((id) => id !== participantId)
        : [...prev.selectedParticipants, participantId],
    }));
  };

  const handleSelectAll = () => {
    if (
      exportSettings.selectedParticipants.length === filteredParticipants.length
    ) {
      setExportSettings((prev) => ({ ...prev, selectedParticipants: [] }));
    } else {
      setExportSettings((prev) => ({
        ...prev,
        selectedParticipants: filteredParticipants.map((p) => p.id),
      }));
    }
  };

  const handleFieldToggle = (
    field: keyof typeof exportSettings.includeFields
  ) => {
    setExportSettings((prev) => ({
      ...prev,
      includeFields: {
        ...prev.includeFields,
        [field]: !prev.includeFields[field],
      },
    }));
  };

  const getExportData = () => {
    const participantsToExport =
      exportSettings.selectedParticipants.length > 0
        ? filteredParticipants.filter((p) =>
            exportSettings.selectedParticipants.includes(p.id)
          )
        : filteredParticipants;

    return participantsToExport.map((participant) => {
      const exportRecord: any = {};

      if (exportSettings.includeFields.name)
        exportRecord.Name = participant.name;
      if (exportSettings.includeFields.email)
        exportRecord.Email = participant.email;
      if (exportSettings.includeFields.phone)
        exportRecord.Phone = participant.phone;
      if (exportSettings.includeFields.department)
        exportRecord.Department = participant.department;
      if (exportSettings.includeFields.status)
        exportRecord.Status = participant.status;
      if (exportSettings.includeFields.registrationDate)
        exportRecord['Registration Date'] = participant.registrationDate;
      if (exportSettings.includeFields.lastActivity)
        exportRecord['Last Activity'] = participant.lastActivity;
      if (exportSettings.includeFields.completedSessions)
        exportRecord['Completed Sessions'] = participant.completedSessions;

      return exportRecord;
    });
  };

  const exportToCSV = () => {
    try {
      const data = getExportData();
      if (data.length === 0) {
        showNotification('No data to export', 'info');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map((row) =>
          headers.map((header) => `"${row[header] || ''}"`).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${exportSettings.fileName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification(
        `Exported ${data.length} participants to CSV`,
        'success'
      );
    } catch (error) {
      showNotification('Failed to export CSV', 'error');
    }
  };

  const exportToJSON = () => {
    try {
      const data = getExportData();
      if (data.length === 0) {
        showNotification('No data to export', 'info');
        return;
      }

      const jsonContent = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          totalRecords: data.length,
          participants: data,
        },
        null,
        2
      );

      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${exportSettings.fileName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification(
        `Exported ${data.length} participants to JSON`,
        'success'
      );
    } catch (error) {
      showNotification('Failed to export JSON', 'error');
    }
  };

  const executeExport = () => {
    switch (exportSettings.exportFormat) {
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
      default:
        showNotification('Unsupported export format', 'error');
    }
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <h1>Export Participants</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href="/participants" className="tms-button">
            Back to Participants
          </Link>
          <Link href="/" className="tms-button">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="tms-form-container">
        <h3>Export Settings</h3>
        <div className="tms-form">
          <div className="tms-form-group">
            <label>Export Format</label>
            <select
              value={exportSettings.exportFormat}
              onChange={(e) =>
                setExportSettings((prev) => ({
                  ...prev,
                  exportFormat: e.target.value as 'csv' | 'excel' | 'json',
                }))
              }
              className="tms-select"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className="tms-form-group">
            <label>File Name</label>
            <input
              type="text"
              value={exportSettings.fileName}
              onChange={(e) =>
                setExportSettings((prev) => ({
                  ...prev,
                  fileName: e.target.value,
                }))
              }
              className="tms-input"
            />
          </div>

          <div className="tms-form-group">
            <label>Filter by Status</label>
            <select
              value={exportSettings.filterByStatus}
              onChange={(e) =>
                setExportSettings((prev) => ({
                  ...prev,
                  filterByStatus: e.target.value,
                }))
              }
              className="tms-select"
            >
              <option value="">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="confirmed">Confirmed</option>
              <option value="attended">Attended</option>
              <option value="no-show">No-Show</option>
            </select>
          </div>

          <div className="tms-form-group">
            <label>Filter by Department</label>
            <select
              value={exportSettings.filterByDepartment}
              onChange={(e) =>
                setExportSettings((prev) => ({
                  ...prev,
                  filterByDepartment: e.target.value,
                }))
              }
              className="tms-select"
            >
              <option value="">All Departments</option>
              {availableFilters.departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h4>Include Fields</h4>
        <div
          className="tms-form"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
          {Object.entries(exportSettings.includeFields).map(
            ([field, included]) => (
              <div key={field} className="tms-form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={included}
                    onChange={() =>
                      handleFieldToggle(
                        field as keyof typeof exportSettings.includeFields
                      )
                    }
                  />
                  {field
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                </label>
              </div>
            )
          )}
        </div>

        <div className="tms-form-actions">
          <button
            className="tms-button primary"
            onClick={executeExport}
            disabled={filteredParticipants.length === 0}
          >
            Export (
            {exportSettings.selectedParticipants.length > 0
              ? exportSettings.selectedParticipants.length
              : filteredParticipants.length}{' '}
            records)
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
            Select Participants ({exportSettings.selectedParticipants.length}{' '}
            selected from {filteredParticipants.length} filtered)
          </h3>
          <button className="tms-button" onClick={handleSelectAll}>
            {exportSettings.selectedParticipants.length ===
            filteredParticipants.length
              ? 'Deselect All'
              : 'Select All'}
          </button>
        </div>

        {loading ? (
          <div className="tms-loading">Loading participants...</div>
        ) : (
          <div className="tms-table-container">
            <table className="tms-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Completed Sessions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="tms-no-data">
                      No participants match your filter criteria
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((participant) => (
                    <tr key={participant.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={exportSettings.selectedParticipants.includes(
                            participant.id
                          )}
                          onChange={() =>
                            handleParticipantSelect(participant.id)
                          }
                        />
                      </td>
                      <td>{participant.name}</td>
                      <td>{participant.email}</td>
                      <td>{participant.department}</td>
                      <td>
                        <span className={`tms-status ${participant.status}`}>
                          {participant.status}
                        </span>
                      </td>
                      <td>{participant.completedSessions}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
