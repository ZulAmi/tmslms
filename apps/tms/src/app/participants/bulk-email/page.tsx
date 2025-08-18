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

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface BulkEmailSettings {
  selectedParticipants: string[];
  filterByStatus: string;
  filterByDepartment: string;
  emailTemplate: string;
  customSubject: string;
  customMessage: string;
  includeAttachment: boolean;
  sendScheduled: boolean;
  scheduleDate: string;
  scheduleTime: string;
}

export default function BulkEmailPage() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<
    Participant[]
  >([]);
  const [emailSettings, setEmailSettings] = useState<BulkEmailSettings>({
    selectedParticipants: [],
    filterByStatus: '',
    filterByDepartment: '',
    emailTemplate: 'custom',
    customSubject: '',
    customMessage: '',
    includeAttachment: false,
    sendScheduled: false,
    scheduleDate: new Date().toISOString().split('T')[0],
    scheduleTime: '09:00',
  });

  const [availableFilters, setAvailableFilters] = useState({
    departments: [] as string[],
  });

  const [emailTemplates] = useState<EmailTemplate[]>([
    {
      id: 'welcome',
      name: 'Welcome Message',
      subject: 'Welcome to Training Program',
      body: 'Dear {{name}},\n\nWelcome to our training program! We are excited to have you join us.\n\nBest regards,\nTraining Team',
    },
    {
      id: 'reminder',
      name: 'Session Reminder',
      subject: 'Upcoming Training Session Reminder',
      body: 'Dear {{name}},\n\nThis is a reminder about your upcoming training session.\n\nPlease make sure to attend on time.\n\nBest regards,\nTraining Team',
    },
    {
      id: 'completion',
      name: 'Course Completion',
      subject: 'Training Course Completed',
      body: 'Dear {{name}},\n\nCongratulations on completing your training course!\n\nYour certificate will be available soon.\n\nBest regards,\nTraining Team',
    },
    {
      id: 'custom',
      name: 'Custom Message',
      subject: '',
      body: '',
    },
  ]);

  useEffect(() => {
    loadParticipants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    participants,
    emailSettings.filterByStatus,
    emailSettings.filterByDepartment,
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

    if (emailSettings.filterByStatus) {
      filtered = filtered.filter(
        (p) => p.status === emailSettings.filterByStatus
      );
    }

    if (emailSettings.filterByDepartment) {
      filtered = filtered.filter(
        (p) => p.department === emailSettings.filterByDepartment
      );
    }

    setFilteredParticipants(filtered);
  };

  const handleParticipantSelect = (participantId: string) => {
    setEmailSettings((prev) => ({
      ...prev,
      selectedParticipants: prev.selectedParticipants.includes(participantId)
        ? prev.selectedParticipants.filter((id) => id !== participantId)
        : [...prev.selectedParticipants, participantId],
    }));
  };

  const handleSelectAll = () => {
    if (
      emailSettings.selectedParticipants.length === filteredParticipants.length
    ) {
      setEmailSettings((prev) => ({ ...prev, selectedParticipants: [] }));
    } else {
      setEmailSettings((prev) => ({
        ...prev,
        selectedParticipants: filteredParticipants.map((p) => p.id),
      }));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = emailTemplates.find((t) => t.id === templateId);
    if (template) {
      setEmailSettings((prev) => ({
        ...prev,
        emailTemplate: templateId,
        customSubject: template.subject,
        customMessage: template.body,
      }));
    }
  };

  const getEmailPreview = () => {
    if (
      emailSettings.selectedParticipants.length === 0 &&
      filteredParticipants.length === 0
    ) {
      return {
        subject: emailSettings.customSubject,
        body: emailSettings.customMessage,
      };
    }

    const sampleParticipant =
      emailSettings.selectedParticipants.length > 0
        ? filteredParticipants.find(
            (p) => p.id === emailSettings.selectedParticipants[0]
          )
        : filteredParticipants[0];

    if (!sampleParticipant) {
      return {
        subject: emailSettings.customSubject,
        body: emailSettings.customMessage,
      };
    }

    const subject = emailSettings.customSubject.replace(
      /{{name}}/g,
      sampleParticipant.name
    );
    const body = emailSettings.customMessage
      .replace(/{{name}}/g, sampleParticipant.name)
      .replace(/{{email}}/g, sampleParticipant.email)
      .replace(/{{department}}/g, sampleParticipant.department);

    return { subject, body };
  };

  const sendBulkEmails = async () => {
    try {
      setSending(true);

      const recipientIds =
        emailSettings.selectedParticipants.length > 0
          ? emailSettings.selectedParticipants
          : filteredParticipants.map((p) => p.id);

      if (recipientIds.length === 0) {
        showNotification('No recipients selected', 'error');
        return;
      }

      if (!emailSettings.customSubject.trim()) {
        showNotification('Please enter an email subject', 'error');
        return;
      }

      if (!emailSettings.customMessage.trim()) {
        showNotification('Please enter an email message', 'error');
        return;
      }

      // Simulate sending emails (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      showNotification(
        `Bulk email ${emailSettings.sendScheduled ? 'scheduled' : 'sent'} to ${recipientIds.length} participants`,
        'success'
      );

      // Reset form
      setEmailSettings((prev) => ({
        ...prev,
        selectedParticipants: [],
        customSubject: '',
        customMessage: '',
        emailTemplate: 'custom',
      }));
    } catch (error) {
      showNotification('Failed to send bulk emails', 'error');
    } finally {
      setSending(false);
    }
  };

  const preview = getEmailPreview();

  return (
    <div className="tms-container">
      <div className="tms-header">
        <h1>Bulk Email Participants</h1>
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
        <h3>Email Settings</h3>
        <div className="tms-form">
          <div className="tms-form-group">
            <label>Email Template</label>
            <select
              value={emailSettings.emailTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="tms-select"
            >
              {emailTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="tms-form-group">
            <label>Filter by Status</label>
            <select
              value={emailSettings.filterByStatus}
              onChange={(e) =>
                setEmailSettings((prev) => ({
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
              value={emailSettings.filterByDepartment}
              onChange={(e) =>
                setEmailSettings((prev) => ({
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
            <label>
              <input
                type="checkbox"
                checked={emailSettings.sendScheduled}
                onChange={(e) =>
                  setEmailSettings((prev) => ({
                    ...prev,
                    sendScheduled: e.target.checked,
                  }))
                }
              />
              Schedule for later
            </label>
          </div>

          {emailSettings.sendScheduled && (
            <>
              <div className="tms-form-group">
                <label>Schedule Date</label>
                <input
                  type="date"
                  value={emailSettings.scheduleDate}
                  onChange={(e) =>
                    setEmailSettings((prev) => ({
                      ...prev,
                      scheduleDate: e.target.value,
                    }))
                  }
                  className="tms-input"
                />
              </div>

              <div className="tms-form-group">
                <label>Schedule Time</label>
                <input
                  type="time"
                  value={emailSettings.scheduleTime}
                  onChange={(e) =>
                    setEmailSettings((prev) => ({
                      ...prev,
                      scheduleTime: e.target.value,
                    }))
                  }
                  className="tms-input"
                />
              </div>
            </>
          )}
        </div>

        <h4>Email Content</h4>
        <div className="tms-form">
          <div className="tms-form-group">
            <label>Subject</label>
            <input
              type="text"
              value={emailSettings.customSubject}
              onChange={(e) =>
                setEmailSettings((prev) => ({
                  ...prev,
                  customSubject: e.target.value,
                }))
              }
              className="tms-input"
              placeholder="Enter email subject..."
            />
          </div>

          <div className="tms-form-group">
            <label>Message</label>
            <textarea
              value={emailSettings.customMessage}
              onChange={(e) =>
                setEmailSettings((prev) => ({
                  ...prev,
                  customMessage: e.target.value,
                }))
              }
              className="tms-textarea"
              rows={8}
              placeholder="Enter your message... Use {{name}}, {{email}}, {{department}} for personalization"
            />
          </div>
        </div>

        <div className="tms-form-actions">
          <button
            className="tms-button primary"
            onClick={sendBulkEmails}
            disabled={
              sending ||
              (emailSettings.selectedParticipants.length === 0 &&
                filteredParticipants.length === 0)
            }
          >
            {sending
              ? 'Sending...'
              : `${emailSettings.sendScheduled ? 'Schedule' : 'Send'} Email (${emailSettings.selectedParticipants.length > 0 ? emailSettings.selectedParticipants.length : filteredParticipants.length} recipients)`}
          </button>
        </div>
      </div>

      <div className="tms-analytics-content">
        <h3>Email Preview</h3>
        <div
          className="tms-form-container"
          style={{
            backgroundColor: 'var(--color-background-secondary)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <strong>Subject:</strong> {preview.subject || 'No subject'}
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            <strong>Message:</strong>
            <br />
            {preview.body || 'No message'}
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
          <h3>
            Select Recipients ({emailSettings.selectedParticipants.length}{' '}
            selected from {filteredParticipants.length} filtered)
          </h3>
          <button className="tms-button" onClick={handleSelectAll}>
            {emailSettings.selectedParticipants.length ===
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
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="tms-no-data">
                      No participants match your filter criteria
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((participant) => (
                    <tr key={participant.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={emailSettings.selectedParticipants.includes(
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
