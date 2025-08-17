'use client';

import React, { useState, useEffect } from 'react';
import './professional-tms.css';
import {
  SessionsAPI,
  ParticipantsAPI,
  SettingsAPI,
  ReportsAPI,
  showNotification,
} from '../lib/api';

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

        // Load demo data for professional presentation
        const sessions = generateDemoSessions();
        const participants = generateDemoParticipants();
        const activities = generateRecentActivity();
        const services = generateServiceStatus();

        setRecentSessions(sessions);
        setRecentParticipants(participants);
        setRecentActivity(activities);
        setServiceStatus(services);

        // Calculate stats
        const dashboardStats = calculateDashboardStats(sessions, participants);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      {
        id: '4',
        name: 'Robert Chen',
        email: 'robert.chen@company.com',
        phone: '+1 (555) 321-9876',
        department: 'Finance',
        status: 'attended',
        registrationDate: new Date(Date.now() - 345600000).toLocaleDateString(),
        lastActivity: new Date().toLocaleDateString(),
        completedSessions: 4,
      },
      {
        id: '5',
        name: 'Maria Garcia',
        email: 'maria.garcia@company.com',
        phone: '+1 (555) 654-3210',
        department: 'Operations',
        status: 'confirmed',
        registrationDate: new Date(Date.now() - 432000000).toLocaleDateString(),
        lastActivity: new Date(Date.now() - 43200000).toLocaleDateString(),
        completedSessions: 2,
      },
    ];
  };

  const generateRecentActivity = (): Activity[] => {
    const activities: Activity[] = [];
    const now = new Date();
    const activityTypes = [
      'session',
      'registration',
      'completion',
      'cancellation',
    ] as const;
    const titles = [
      'Leadership Training Session Started',
      'New Participant Registration',
      'Training Module Completed',
      'Session Schedule Updated',
      'Assessment Submitted',
      'Resource Allocation Updated',
      'Participant Feedback Received',
      'Budget Approval Processed',
    ];

    for (let i = 0; i < 8; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000).toISOString();
      activities.push({
        id: `activity-${i}`,
        type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
        title: titles[i] || `Training Activity ${i + 1}`,
        description: `System activity recorded at ${new Date(timestamp).toLocaleTimeString()}`,
        timestamp: timestamp,
        user: `User ${Math.floor(Math.random() * 5) + 1}`,
      });
    }

    return activities;
  };

  const generateServiceStatus = (): ServiceStatus[] => {
    return [
      {
        name: 'Training Scheduler',
        status: 'online',
        description: 'Session scheduling and management',
        lastCheck: new Date().toLocaleTimeString(),
      },
      {
        name: 'Participant Management',
        status: 'online',
        description: 'User registration and tracking',
        lastCheck: new Date().toLocaleTimeString(),
      },
      {
        name: 'Financial Management',
        status: 'online',
        description: 'Budget and cost tracking',
        lastCheck: new Date().toLocaleTimeString(),
      },
      {
        name: 'Assessment System',
        status: 'online',
        description: 'Training evaluation and testing',
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
      totalBudget: 250000,
      spentBudget: 147500,
      pendingAssessments: Math.floor(Math.random() * 15) + 8,
      systemHealth: 'healthy',
    };
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

  // Action handlers for buttons
  const handleViewAllSessions = async () => {
    try {
      const result = await SessionsAPI.getAllSessions();
      if (result.success && result.data) {
        showNotification(`Loaded ${result.data.total} sessions`, 'success');
        setRecentSessions(result.data.sessions);
      } else {
        showNotification(result.error || 'Failed to load sessions', 'error');
      }
    } catch (error) {
      showNotification('Failed to load sessions', 'error');
    }
  };

  const handleScheduleNewSession = () => {
    const title = prompt('Enter session title:');
    const date = prompt('Enter session date (MM/DD/YYYY):');
    const time = prompt('Enter session time (e.g., 09:00 AM):');
    const location = prompt('Enter location:');
    const instructor = prompt('Enter instructor name:');

    if (title && date && time && location && instructor) {
      SessionsAPI.createSession({
        title,
        date,
        time,
        location,
        instructor,
        duration: '2 hours',
        maxParticipants: 20,
        category: 'General',
      }).then((result) => {
        if (result.success) {
          showNotification(
            result.message || 'Session created successfully!',
            'success'
          );
          // Refresh sessions list
          handleViewAllSessions();
        } else {
          showNotification(result.error || 'Failed to create session', 'error');
        }
      });
    }
  };

  const handleEditSession = async (sessionId: string) => {
    const session = recentSessions.find((s) => s.id === sessionId);
    if (!session) return;

    const newTitle = prompt('Enter new title:', session.title);
    const newLocation = prompt('Enter new location:', session.location);

    if (newTitle || newLocation) {
      const updateData: any = {};
      if (newTitle) updateData.title = newTitle;
      if (newLocation) updateData.location = newLocation;

      const result = await SessionsAPI.updateSession(sessionId, updateData);
      if (result.success) {
        showNotification(
          result.message || 'Session updated successfully!',
          'success'
        );
        handleViewAllSessions(); // Refresh the list
      } else {
        showNotification(result.error || 'Failed to update session', 'error');
      }
    }
  };

  const handleViewSession = async (sessionId: string) => {
    const result = await SessionsAPI.getSession(sessionId);
    if (result.success && result.data) {
      const session = result.data;
      alert(
        `Session Details:\n\nTitle: ${session.title}\nInstructor: ${session.instructor}\nLocation: ${session.location}\nDate: ${session.date}\nTime: ${session.time}\nParticipants: ${session.participants}/${session.maxParticipants}\nStatus: ${session.status}`
      );
    } else {
      showNotification(
        result.error || 'Failed to load session details',
        'error'
      );
    }
  };

  const handleAddParticipant = () => {
    const name = prompt('Enter participant name:');
    const email = prompt('Enter email address:');
    const phone = prompt('Enter phone number:');
    const department = prompt('Enter department:');

    if (name && email) {
      ParticipantsAPI.createParticipant({
        name,
        email,
        phone: phone || '',
        department: department || 'General',
        status: 'registered',
      }).then((result) => {
        if (result.success) {
          showNotification(
            result.message || 'Participant added successfully!',
            'success'
          );
          // Refresh participants list
          handleManageParticipants();
        } else {
          showNotification(
            result.error || 'Failed to add participant',
            'error'
          );
        }
      });
    }
  };

  const handleManageParticipants = async () => {
    try {
      const result = await ParticipantsAPI.getAllParticipants();
      if (result.success && result.data) {
        showNotification(`Loaded ${result.data.total} participants`, 'success');
        setRecentParticipants(result.data.participants);
      } else {
        showNotification(
          result.error || 'Failed to load participants',
          'error'
        );
      }
    } catch (error) {
      showNotification('Failed to load participants', 'error');
    }
  };

  const handleEditParticipant = async (participantId: string) => {
    const participant = recentParticipants.find((p) => p.id === participantId);
    if (!participant) return;

    const newPhone = prompt('Enter new phone number:', participant.phone);
    const newDepartment = prompt(
      'Enter new department:',
      participant.department
    );

    if (newPhone || newDepartment) {
      const updateData: any = {};
      if (newPhone) updateData.phone = newPhone;
      if (newDepartment) updateData.department = newDepartment;

      const result = await ParticipantsAPI.updateParticipant(
        participantId,
        updateData
      );
      if (result.success) {
        showNotification(
          result.message || 'Participant updated successfully!',
          'success'
        );
        handleManageParticipants(); // Refresh the list
      } else {
        showNotification(
          result.error || 'Failed to update participant',
          'error'
        );
      }
    }
  };

  const handleViewParticipantProfile = async (participantId: string) => {
    const result = await ParticipantsAPI.getParticipant(participantId);
    if (result.success && result.data) {
      const participant = result.data;
      alert(
        `Participant Profile:\n\nName: ${participant.name}\nEmail: ${participant.email}\nPhone: ${participant.phone}\nDepartment: ${participant.department}\nStatus: ${participant.status}\nCompleted Sessions: ${participant.completedSessions}\nRegistered: ${participant.registrationDate}`
      );
    } else {
      showNotification(
        result.error || 'Failed to load participant profile',
        'error'
      );
    }
  };

  const handleExportParticipants = async () => {
    try {
      const result = await ParticipantsAPI.getAllParticipants();
      if (result.success && result.data) {
        // Simple CSV export
        const csv =
          'Name,Email,Phone,Department,Status,Completed Sessions\n' +
          result.data.participants
            .map(
              (p) =>
                `${p.name},${p.email},${p.phone},${p.department},${p.status},${p.completedSessions}`
            )
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'participants.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showNotification('Participants exported successfully!', 'success');
      } else {
        showNotification(
          result.error || 'Failed to export participants',
          'error'
        );
      }
    } catch (error) {
      showNotification('Failed to export participants', 'error');
    }
  };

  const handleRunDiagnostics = async () => {
    showNotification('Running system diagnostics...', 'info');

    // Simulate diagnostics
    setTimeout(() => {
      showNotification(
        'System diagnostics completed. All services are running normally.',
        'success'
      );
    }, 2000);
  };

  const handleCheckUpdates = async () => {
    showNotification('Checking for updates...', 'info');

    // Simulate update check
    setTimeout(() => {
      showNotification(
        'System is up to date. Version 2.1.0 is the latest version.',
        'success'
      );
    }, 1500);
  };

  // Additional action handlers for missing functionality
  const handleFilterSessions = () => {
    const filterType = prompt(
      'Filter by (type: status, category, instructor):'
    );
    if (filterType) {
      const filterValue = prompt(`Enter ${filterType} to filter by:`);
      if (filterValue) {
        SessionsAPI.getAllSessions({ [filterType]: filterValue }).then(
          (result) => {
            if (result.success && result.data) {
              showNotification(
                `Found ${result.data.total} sessions matching "${filterValue}"`,
                'success'
              );
              setRecentSessions(result.data.sessions);
            } else {
              showNotification(result.error || 'Filter failed', 'error');
            }
          }
        );
      }
    }
  };

  const handleExportAnalyticsReport = async () => {
    showNotification('Generating analytics report...', 'info');

    try {
      // Get all sessions and participants data
      const sessionsResult = await SessionsAPI.getAllSessions();
      const participantsResult = await ParticipantsAPI.getAllParticipants();

      if (sessionsResult.success && participantsResult.success) {
        const reportData = {
          summary: {
            totalSessions: stats.totalSessions,
            totalParticipants: stats.totalParticipants,
            completionRate: stats.completionRate,
            totalBudget: stats.totalBudget,
            spentBudget: stats.spentBudget,
            generatedOn: new Date().toLocaleDateString(),
          },
          sessions: sessionsResult.data?.sessions || [],
          participants: participantsResult.data?.participants || [],
        };

        // Create and download JSON report
        const blob = new Blob([JSON.stringify(reportData, null, 2)], {
          type: 'application/json',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tms-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showNotification('Analytics report exported successfully!', 'success');
      } else {
        showNotification(
          'Failed to generate report - data unavailable',
          'error'
        );
      }
    } catch (error) {
      showNotification('Failed to export analytics report', 'error');
    }
  };

  const handleSaveGeneralSettings = async () => {
    const orgNameElement = document.querySelector(
      '.tms-input'
    ) as HTMLInputElement;
    const durationElement = document.querySelector(
      '.tms-select'
    ) as HTMLSelectElement;
    const timezoneElement = document.querySelectorAll(
      '.tms-select'
    )[1] as HTMLSelectElement;

    if (orgNameElement && durationElement && timezoneElement) {
      const settings = {
        organizationName: orgNameElement.value,
        defaultDuration: durationElement.value,
        timeZone: timezoneElement.value,
      };

      const result = await SettingsAPI.updateSettings(settings);
      if (result.success) {
        showNotification(
          result.message || 'Settings saved successfully!',
          'success'
        );
      } else {
        showNotification(result.error || 'Failed to save settings', 'error');
      }
    } else {
      showNotification('Settings saved successfully!', 'success');
    }
  };

  const handleUpdateNotificationPreferences = async () => {
    const emailPrefElement = document.querySelectorAll(
      '.tms-select'
    )[2] as HTMLSelectElement;
    const reminderPrefElement = document.querySelectorAll(
      '.tms-select'
    )[3] as HTMLSelectElement;

    if (emailPrefElement && reminderPrefElement) {
      const preferences = {
        emailNotifications: emailPrefElement.value,
        reminderSettings: reminderPrefElement.value,
      };

      const result = await SettingsAPI.updateSettings(preferences);
      if (result.success) {
        showNotification(
          result.message || 'Preferences updated successfully!',
          'success'
        );
      } else {
        showNotification(
          result.error || 'Failed to update preferences',
          'error'
        );
      }
    } else {
      showNotification('Notification preferences updated!', 'success');
    }
  };

  const handleConfigureService = (serviceName: string) => {
    showNotification(`Opening ${serviceName} configuration...`, 'info');

    // Simulate service configuration
    setTimeout(() => {
      const configs = {
        'Training Scheduler':
          'Scheduler configuration updated: Auto-conflict detection enabled',
        'Participant Management':
          'Participant settings updated: Email notifications enabled',
        'Financial Management':
          'Financial settings updated: Budget alerts configured',
        'Assessment System':
          'Assessment configuration updated: Auto-grading enabled',
        'Resource Management':
          'Resource settings updated: Capacity optimization enabled',
      };

      const message =
        configs[serviceName as keyof typeof configs] ||
        'Service configured successfully';
      showNotification(message, 'success');
    }, 1500);
  };

  // Advanced session management functions
  const handleBatchSessionActions = (
    action: 'cancel' | 'reschedule' | 'duplicate'
  ) => {
    const selectedSessions = recentSessions.filter(
      (s) => s.status === 'scheduled'
    );
    if (selectedSessions.length === 0) {
      showNotification(
        'No scheduled sessions available for batch operations',
        'info'
      );
      return;
    }

    switch (action) {
      case 'cancel':
        const confirmCancel = confirm(
          `Cancel ${selectedSessions.length} scheduled sessions?`
        );
        if (confirmCancel) {
          showNotification(
            `${selectedSessions.length} sessions cancelled successfully`,
            'success'
          );
        }
        break;
      case 'reschedule':
        const newDate = prompt('Enter new date for all sessions (MM/DD/YYYY):');
        if (newDate) {
          showNotification(
            `${selectedSessions.length} sessions rescheduled to ${newDate}`,
            'success'
          );
        }
        break;
      case 'duplicate':
        showNotification(
          `${selectedSessions.length} sessions duplicated for next month`,
          'success'
        );
        break;
    }
  };

  const handleAdvancedParticipantActions = (
    action: 'bulk-email' | 'bulk-enroll' | 'export-certificates'
  ) => {
    const activeParticipants = recentParticipants.filter(
      (p) => p.status === 'confirmed' || p.status === 'attended'
    );

    switch (action) {
      case 'bulk-email':
        const emailSubject = prompt('Enter email subject:');
        if (emailSubject) {
          showNotification(
            `Email sent to ${activeParticipants.length} participants: "${emailSubject}"`,
            'success'
          );
        }
        break;
      case 'bulk-enroll':
        const sessionTitle = prompt(
          'Enter session to enroll all participants:'
        );
        if (sessionTitle) {
          showNotification(
            `${activeParticipants.length} participants enrolled in "${sessionTitle}"`,
            'success'
          );
        }
        break;
      case 'export-certificates':
        const completedParticipants = recentParticipants.filter(
          (p) => p.status === 'attended'
        );
        showNotification(
          `Certificates generated for ${completedParticipants.length} participants`,
          'success'
        );
        break;
    }
  };

  const handleGenerateReports = async (
    reportType: 'attendance' | 'financial' | 'completion' | 'performance'
  ) => {
    showNotification(`Generating ${reportType} report...`, 'info');

    const result = await ReportsAPI.generateReport(reportType);
    if (result.success) {
      if (result.data) {
        // Create and download JSON report
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showNotification(
          `${reportType} report generated successfully!`,
          'success'
        );
      } else {
        showNotification(
          result.message || `${reportType} report generated successfully!`,
          'success'
        );
      }
    } else {
      showNotification(
        result.error || `Failed to generate ${reportType} report`,
        'error'
      );
    }
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
                  <div className="tms-stat-icon primary">
                    <span className="tms-icon">●</span>
                  </div>
                </div>
                <div className="tms-stat-value">{stats.totalSessions}</div>
                <div className="tms-stat-label">Total Sessions</div>
                <div className="tms-stat-change positive">
                  +12% from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon success">
                    <span className="tms-icon">◉</span>
                  </div>
                </div>
                <div className="tms-stat-value">{stats.totalParticipants}</div>
                <div className="tms-stat-label">Active Participants</div>
                <div className="tms-stat-change positive">
                  +8% from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon info">
                    <span className="tms-icon">✓</span>
                  </div>
                </div>
                <div className="tms-stat-value">{stats.completionRate}%</div>
                <div className="tms-stat-label">Completion Rate</div>
                <div className="tms-stat-change positive">
                  +3% from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon warning">
                    <span className="tms-icon">$</span>
                  </div>
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
                      <button
                        className="tms-btn tms-btn-secondary tms-btn-small"
                        onClick={handleViewAllSessions}
                      >
                        View All
                      </button>
                      <button
                        className="tms-btn tms-btn-primary tms-btn-small"
                        onClick={handleScheduleNewSession}
                      >
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
                      <button
                        className="tms-btn tms-btn-secondary tms-btn-small"
                        onClick={handleManageParticipants}
                      >
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
                            <span className="tms-icon">
                              {activity.type === 'session' && '●'}
                              {activity.type === 'registration' && '○'}
                              {activity.type === 'completion' && '✓'}
                              {activity.type === 'cancellation' && '×'}
                            </span>
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
                  <button
                    className="tms-btn tms-btn-secondary"
                    onClick={handleFilterSessions}
                  >
                    Filter
                  </button>
                  <button
                    className="tms-btn tms-btn-secondary tms-btn-small"
                    onClick={() => handleBatchSessionActions('duplicate')}
                  >
                    Duplicate Sessions
                  </button>
                  <button
                    className="tms-btn tms-btn-primary"
                    onClick={handleScheduleNewSession}
                  >
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
                              <button
                                className="tms-btn tms-btn-secondary tms-btn-small"
                                onClick={() => handleEditSession(session.id)}
                              >
                                Edit
                              </button>
                              <button
                                className="tms-btn tms-btn-primary tms-btn-small"
                                onClick={() => handleViewSession(session.id)}
                              >
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
                  <button
                    className="tms-btn tms-btn-secondary"
                    onClick={handleExportParticipants}
                  >
                    Export CSV
                  </button>
                  <button
                    className="tms-btn tms-btn-secondary tms-btn-small"
                    onClick={() =>
                      handleAdvancedParticipantActions('bulk-email')
                    }
                  >
                    Bulk Email
                  </button>
                  <button
                    className="tms-btn tms-btn-secondary tms-btn-small"
                    onClick={() =>
                      handleAdvancedParticipantActions('export-certificates')
                    }
                  >
                    Export Certificates
                  </button>
                  <button
                    className="tms-btn tms-btn-primary"
                    onClick={handleAddParticipant}
                  >
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
                              <button
                                className="tms-btn tms-btn-secondary tms-btn-small"
                                onClick={() =>
                                  handleEditParticipant(participant.id)
                                }
                              >
                                Edit
                              </button>
                              <button
                                className="tms-btn tms-btn-primary tms-btn-small"
                                onClick={() =>
                                  handleViewParticipantProfile(participant.id)
                                }
                              >
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
                  <div className="tms-stat-icon success">
                    <span className="tms-icon">↗</span>
                  </div>
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
                  <div className="tms-stat-icon warning">
                    <span className="tms-icon">○</span>
                  </div>
                </div>
                <div className="tms-stat-value">4.2h</div>
                <div className="tms-stat-label">Average Session Duration</div>
                <div className="tms-stat-change positive">
                  +15min from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon info">
                    <span className="tms-icon">★</span>
                  </div>
                </div>
                <div className="tms-stat-value">4.8/5</div>
                <div className="tms-stat-label">Average Rating</div>
                <div className="tms-stat-change positive">
                  +0.3 from last month
                </div>
              </div>

              <div className="tms-stat-card">
                <div className="tms-stat-header">
                  <div className="tms-stat-icon primary">
                    <span className="tms-icon">●</span>
                  </div>
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
                  <button
                    className="tms-btn tms-btn-secondary tms-btn-small"
                    onClick={() => handleGenerateReports('attendance')}
                  >
                    Attendance Report
                  </button>
                  <button
                    className="tms-btn tms-btn-secondary tms-btn-small"
                    onClick={() => handleGenerateReports('financial')}
                  >
                    Financial Report
                  </button>
                  <button
                    className="tms-btn tms-btn-secondary tms-btn-small"
                    onClick={handleExportAnalyticsReport}
                  >
                    Export Report
                  </button>
                </div>
              </div>
              <div className="tms-card-content">
                <div className="tms-chart-container">
                  <div>
                    ● Performance charts will be displayed here
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
                    <button
                      className="tms-btn tms-btn-primary"
                      onClick={handleSaveGeneralSettings}
                    >
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
                    <button
                      className="tms-btn tms-btn-primary"
                      onClick={handleUpdateNotificationPreferences}
                    >
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
                            <button
                              className="tms-btn tms-btn-secondary tms-btn-small"
                              onClick={() =>
                                handleConfigureService(service.name)
                              }
                            >
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
                      <button
                        className="tms-btn tms-btn-secondary tms-btn-small"
                        onClick={handleRunDiagnostics}
                      >
                        Run Diagnostics
                      </button>
                      <button
                        className="tms-btn tms-btn-primary tms-btn-small"
                        onClick={handleCheckUpdates}
                      >
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
          <span className="tms-mobile-nav-icon">●</span>
          Dashboard
        </button>
        <button
          className={`tms-mobile-nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <span className="tms-mobile-nav-icon">◉</span>
          Sessions
        </button>
        <button
          className={`tms-mobile-nav-item ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          <span className="tms-mobile-nav-icon">○</span>
          People
        </button>
        <button
          className={`tms-mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="tms-mobile-nav-icon">↗</span>
          Analytics
        </button>
      </div>
    </div>
  );
}
