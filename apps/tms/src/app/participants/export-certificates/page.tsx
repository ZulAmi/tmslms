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
  certificateEligible: boolean;
  certificateIssued: boolean;
  completionDate?: string;
}

interface CertificateSettings {
  selectedParticipants: string[];
  filterByDepartment: string;
  certificateTemplate: string;
  certificateType: 'completion' | 'participation' | 'achievement';
  includeGrade: boolean;
  customMessage: string;
  issueDate: string;
  batchGeneration: boolean;
  emailCertificates: boolean;
}

export default function ExportCertificatesPage() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<
    Participant[]
  >([]);
  const [certificateSettings, setCertificateSettings] =
    useState<CertificateSettings>({
      selectedParticipants: [],
      filterByDepartment: '',
      certificateTemplate: 'standard',
      certificateType: 'completion',
      includeGrade: false,
      customMessage: '',
      issueDate: new Date().toISOString().split('T')[0],
      batchGeneration: true,
      emailCertificates: true,
    });

  const [availableFilters, setAvailableFilters] = useState({
    departments: [] as string[],
  });

  const certificateTemplates = [
    {
      id: 'standard',
      name: 'Standard Certificate',
      description: 'Professional standard template',
    },
    {
      id: 'premium',
      name: 'Premium Certificate',
      description: 'Enhanced design with company branding',
    },
    {
      id: 'simple',
      name: 'Simple Certificate',
      description: 'Minimalist design',
    },
    {
      id: 'custom',
      name: 'Custom Template',
      description: 'Upload your own template',
    },
  ];

  useEffect(() => {
    loadParticipants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [participants, certificateSettings.filterByDepartment]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const result = await ParticipantsAPI.getAllParticipants();
      if (result.success && result.data) {
        const apiData = result.data.participants || [];
        // Transform API data to match our interface
        const participantData = apiData.map((p: any) => ({
          ...p,
          certificateEligible: p.completedSessions >= 3,
          certificateIssued: p.certificateIssued || false,
          completionDate: p.completionDate || new Date().toLocaleDateString(),
        }));
        setParticipants(participantData);

        // Extract unique departments
        const departments = [
          ...new Set(participantData.map((p: Participant) => p.department)),
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
        status: 'attended',
        registrationDate: new Date().toLocaleDateString(),
        lastActivity: new Date().toLocaleDateString(),
        completedSessions: 5,
        certificateEligible: true,
        certificateIssued: false,
        completionDate: new Date().toLocaleDateString(),
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
        certificateEligible: true,
        certificateIssued: true,
        completionDate: new Date().toLocaleDateString(),
      },
      {
        id: '3',
        name: 'Sophia Chen',
        email: 'sophia.chen@company.com',
        phone: '+1 (555) 345-6789',
        department: 'Marketing',
        status: 'attended',
        registrationDate: new Date(Date.now() - 172800000).toLocaleDateString(),
        lastActivity: new Date(Date.now() - 86400000).toLocaleDateString(),
        completedSessions: 3,
        certificateEligible: false,
        certificateIssued: false,
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
        certificateEligible: false,
        certificateIssued: false,
      },
      {
        id: '5',
        name: 'Olivia Wilson',
        email: 'olivia.wilson@company.com',
        phone: '+1 (555) 567-8901',
        department: 'Operations',
        status: 'attended',
        registrationDate: new Date(Date.now() - 345600000).toLocaleDateString(),
        lastActivity: new Date(Date.now() - 259200000).toLocaleDateString(),
        completedSessions: 4,
        certificateEligible: true,
        certificateIssued: false,
        completionDate: new Date().toLocaleDateString(),
      },
    ];
  };

  const applyFilters = () => {
    let filtered = [...participants];

    // Only show eligible participants
    filtered = filtered.filter((p) => p.certificateEligible);

    if (certificateSettings.filterByDepartment) {
      filtered = filtered.filter(
        (p) => p.department === certificateSettings.filterByDepartment
      );
    }

    setFilteredParticipants(filtered);
  };

  const handleParticipantSelect = (participantId: string) => {
    setCertificateSettings((prev) => ({
      ...prev,
      selectedParticipants: prev.selectedParticipants.includes(participantId)
        ? prev.selectedParticipants.filter((id) => id !== participantId)
        : [...prev.selectedParticipants, participantId],
    }));
  };

  const handleSelectAll = () => {
    if (
      certificateSettings.selectedParticipants.length ===
      filteredParticipants.length
    ) {
      setCertificateSettings((prev) => ({ ...prev, selectedParticipants: [] }));
    } else {
      setCertificateSettings((prev) => ({
        ...prev,
        selectedParticipants: filteredParticipants.map((p) => p.id),
      }));
    }
  };

  const generateCertificates = async () => {
    try {
      setGenerating(true);

      const recipientIds =
        certificateSettings.selectedParticipants.length > 0
          ? certificateSettings.selectedParticipants
          : filteredParticipants.map((p) => p.id);

      if (recipientIds.length === 0) {
        showNotification('No eligible participants selected', 'error');
        return;
      }

      // Simulate certificate generation (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (certificateSettings.batchGeneration) {
        // Generate ZIP file with all certificates
        const zipFileName = `certificates-batch-${certificateSettings.issueDate}.zip`;
        showNotification(
          `Generated ${recipientIds.length} certificates in batch file: ${zipFileName}`,
          'success'
        );
      } else {
        // Generate individual certificates
        showNotification(
          `Generated ${recipientIds.length} individual certificates`,
          'success'
        );
      }

      if (certificateSettings.emailCertificates) {
        showNotification(
          `Certificates emailed to ${recipientIds.length} participants`,
          'success'
        );
      }

      // Update certificate issued status
      const updatedParticipants = participants.map((p) =>
        recipientIds.includes(p.id) ? { ...p, certificateIssued: true } : p
      );
      setParticipants(updatedParticipants);

      // Reset selection
      setCertificateSettings((prev) => ({
        ...prev,
        selectedParticipants: [],
      }));
    } catch (error) {
      showNotification('Failed to generate certificates', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const eligibleParticipants = filteredParticipants.filter(
    (p) => p.certificateEligible && !p.certificateIssued
  );
  const issuedCount = participants.filter((p) => p.certificateIssued).length;

  return (
    <div className="tms-container">
      <div className="tms-header">
        <h1>Export Certificates</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href="/participants" className="tms-button">
            Back to Participants
          </Link>
          <Link href="/" className="tms-button">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="tms-analytics-summary">
        <div className="tms-metric-card">
          <div className="tms-metric-value">{eligibleParticipants.length}</div>
          <div className="tms-metric-label">Eligible for Certificates</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">{issuedCount}</div>
          <div className="tms-metric-label">Certificates Issued</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {certificateSettings.selectedParticipants.length}
          </div>
          <div className="tms-metric-label">Selected</div>
        </div>
      </div>

      <div className="tms-form-container">
        <h3>Certificate Settings</h3>
        <div className="tms-form">
          <div className="tms-form-group">
            <label>Certificate Template</label>
            <select
              value={certificateSettings.certificateTemplate}
              onChange={(e) =>
                setCertificateSettings((prev) => ({
                  ...prev,
                  certificateTemplate: e.target.value,
                }))
              }
              className="tms-select"
            >
              {certificateTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.description}
                </option>
              ))}
            </select>
          </div>

          <div className="tms-form-group">
            <label>Certificate Type</label>
            <select
              value={certificateSettings.certificateType}
              onChange={(e) =>
                setCertificateSettings((prev) => ({
                  ...prev,
                  certificateType: e.target.value as
                    | 'completion'
                    | 'participation'
                    | 'achievement',
                }))
              }
              className="tms-select"
            >
              <option value="completion">Completion Certificate</option>
              <option value="participation">Participation Certificate</option>
              <option value="achievement">Achievement Certificate</option>
            </select>
          </div>

          <div className="tms-form-group">
            <label>Filter by Department</label>
            <select
              value={certificateSettings.filterByDepartment}
              onChange={(e) =>
                setCertificateSettings((prev) => ({
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

          <div className="tms-form-group">
            <label>Issue Date</label>
            <input
              type="date"
              value={certificateSettings.issueDate}
              onChange={(e) =>
                setCertificateSettings((prev) => ({
                  ...prev,
                  issueDate: e.target.value,
                }))
              }
              className="tms-input"
            />
          </div>

          <div className="tms-form-group">
            <label>Custom Message (Optional)</label>
            <textarea
              value={certificateSettings.customMessage}
              onChange={(e) =>
                setCertificateSettings((prev) => ({
                  ...prev,
                  customMessage: e.target.value,
                }))
              }
              className="tms-textarea"
              rows={3}
              placeholder="Enter a custom message to appear on the certificate..."
            />
          </div>
        </div>

        <h4>Generation Options</h4>
        <div
          className="tms-form"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
          <div className="tms-form-group">
            <label>
              <input
                type="checkbox"
                checked={certificateSettings.includeGrade}
                onChange={(e) =>
                  setCertificateSettings((prev) => ({
                    ...prev,
                    includeGrade: e.target.checked,
                  }))
                }
              />
              Include Grade/Score
            </label>
          </div>

          <div className="tms-form-group">
            <label>
              <input
                type="checkbox"
                checked={certificateSettings.batchGeneration}
                onChange={(e) =>
                  setCertificateSettings((prev) => ({
                    ...prev,
                    batchGeneration: e.target.checked,
                  }))
                }
              />
              Generate as Batch (ZIP)
            </label>
          </div>

          <div className="tms-form-group">
            <label>
              <input
                type="checkbox"
                checked={certificateSettings.emailCertificates}
                onChange={(e) =>
                  setCertificateSettings((prev) => ({
                    ...prev,
                    emailCertificates: e.target.checked,
                  }))
                }
              />
              Email to Participants
            </label>
          </div>
        </div>

        <div className="tms-form-actions">
          <button
            className="tms-button primary"
            onClick={generateCertificates}
            disabled={generating || eligibleParticipants.length === 0}
          >
            {generating
              ? 'Generating...'
              : `Generate Certificates (${certificateSettings.selectedParticipants.length > 0 ? certificateSettings.selectedParticipants.length : eligibleParticipants.length} participants)`}
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
            Eligible Participants (
            {certificateSettings.selectedParticipants.length} selected from{' '}
            {eligibleParticipants.length} eligible)
          </h3>
          <button
            className="tms-button"
            onClick={handleSelectAll}
            disabled={eligibleParticipants.length === 0}
          >
            {certificateSettings.selectedParticipants.length ===
            eligibleParticipants.length
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
                  <th>Department</th>
                  <th>Completed Sessions</th>
                  <th>Completion Date</th>
                  <th>Certificate Status</th>
                </tr>
              </thead>
              <tbody>
                {eligibleParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="tms-no-data">
                      No participants eligible for certificates
                    </td>
                  </tr>
                ) : (
                  eligibleParticipants.map((participant) => (
                    <tr key={participant.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={certificateSettings.selectedParticipants.includes(
                            participant.id
                          )}
                          onChange={() =>
                            handleParticipantSelect(participant.id)
                          }
                          disabled={participant.certificateIssued}
                        />
                      </td>
                      <td>{participant.name}</td>
                      <td>{participant.department}</td>
                      <td>{participant.completedSessions}</td>
                      <td>{participant.completionDate || 'N/A'}</td>
                      <td>
                        <span
                          className={`tms-status ${participant.certificateIssued ? 'attended' : 'confirmed'}`}
                        >
                          {participant.certificateIssued ? 'Issued' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="tms-analytics-content">
        <h3>Certificate Preview</h3>
        <div
          className="tms-form-container"
          style={{
            backgroundColor: 'var(--color-background-secondary)',
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--color-border)',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Certificate of{' '}
            {certificateSettings.certificateType.charAt(0).toUpperCase() +
              certificateSettings.certificateType.slice(1)}
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: 'var(--space-3)' }}>
            This is to certify that
          </p>
          <h3
            style={{
              color: 'var(--color-text)',
              marginBottom: 'var(--space-4)',
            }}
          >
            [Participant Name]
          </h3>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            has successfully completed the training program
          </p>
          {certificateSettings.customMessage && (
            <p
              style={{
                fontStyle: 'italic',
                marginBottom: 'var(--space-4)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {certificateSettings.customMessage}
            </p>
          )}
          <p
            style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}
          >
            Date of Issue: {certificateSettings.issueDate}
          </p>
          <div
            style={{
              marginTop: 'var(--space-4)',
              fontSize: '0.8rem',
              color: 'var(--color-text-tertiary)',
            }}
          >
            Template:{' '}
            {
              certificateTemplates.find(
                (t) => t.id === certificateSettings.certificateTemplate
              )?.name
            }
          </div>
        </div>
      </div>
    </div>
  );
}
