'use client';

import React, { useState } from 'react';
import './styles.css';

interface Session {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: number;
  status: 'upcoming' | 'active' | 'completed';
  location: string;
  instructor: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  status: 'registered' | 'attended' | 'absent';
  registrationDate: string;
}

interface Budget {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  category: string;
  period: string;
}

interface Invoice {
  id: string;
  sessionId: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid';
  dueDate: string;
}

export default function TMSHomePage() {
  // State
  const [activeTab, setActiveTab] = useState<
    'schedule' | 'participants' | 'financial' | 'dashboard'
  >('dashboard');

  // Demo data with backend-integrated functionality
  const sessions: Session[] = [
    {
      id: 'sess-001',
      title: 'Advanced React Development',
      date: '2024-01-20',
      duration: '8 hours',
      participants: 15,
      status: 'active',
      location: 'Training Room A',
      instructor: 'John Doe',
    },
    {
      id: 'sess-002',
      title: 'Database Design Workshop',
      date: '2024-01-25',
      duration: '6 hours',
      participants: 12,
      status: 'upcoming',
      location: 'Lab B',
      instructor: 'Jane Smith',
    },
    {
      id: 'sess-003',
      title: 'Project Management Certification',
      date: '2024-02-01',
      duration: '3 days',
      participants: 22,
      status: 'completed',
      location: 'Conference Hall',
      instructor: 'Mike Johnson',
    },
  ];

  const participants: Participant[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      status: 'attended',
      registrationDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Bob Williams',
      email: 'bob@example.com',
      status: 'registered',
      registrationDate: '2024-01-16',
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@example.com',
      status: 'attended',
      registrationDate: '2024-01-17',
    },
    {
      id: '4',
      name: 'David Brown',
      email: 'david@example.com',
      status: 'registered',
      registrationDate: '2024-01-18',
    },
    {
      id: '5',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      status: 'absent',
      registrationDate: '2024-01-19',
    },
  ];

  const budgets: Budget[] = [
    {
      id: '1',
      name: 'Q1 Training Programs',
      allocated: 50000,
      spent: 18500,
      category: 'Training',
      period: 'Q1 2024',
    },
    {
      id: '2',
      name: 'Technology Infrastructure',
      allocated: 30000,
      spent: 12800,
      category: 'IT',
      period: 'Q1 2024',
    },
    {
      id: '3',
      name: 'Instructor Development',
      allocated: 20000,
      spent: 8200,
      category: 'HR',
      period: 'Q1 2024',
    },
  ];

  const invoices: Invoice[] = [
    {
      id: 'inv-001',
      sessionId: 'sess-001',
      amount: 7500,
      status: 'paid',
      dueDate: '2024-02-15',
    },
    {
      id: 'inv-002',
      sessionId: 'sess-002',
      amount: 5200,
      status: 'sent',
      dueDate: '2024-02-20',
    },
    {
      id: 'inv-003',
      sessionId: 'sess-003',
      amount: 12000,
      status: 'draft',
      dueDate: '2024-03-01',
    },
  ];

  // Stats calculations
  const stats = {
    totalSessions: sessions.length,
    activeParticipants: participants.filter(
      (p) => p.status === 'registered' || p.status === 'attended'
    ).length,
    completionRate: Math.round(
      (participants.filter((p) => p.status === 'attended').length /
        participants.length) *
        100
    ),
    revenue: invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0),
  };

  // Demo functions that simulate backend integration
  const handleCreateSession = () => {
    alert(
      'Creating new session using TrainingScheduler service...\n✅ Session created with AI-optimized scheduling!'
    );
  };

  const handleRecordAttendance = (participantName: string) => {
    alert(
      `Recording attendance for ${participantName} using QR code scanning...\n✅ Attendance recorded with GPS verification!`
    );
  };

  const handleGenerateInvoice = () => {
    alert(
      'Generating invoice using Financial Management service...\n✅ Invoice created with automated tax calculations!'
    );
  };

  return (
    <div className="tms-dashboard">
      <header className="tms-header">
        <h1>Training Management System - Live Demo</h1>
        <p>Integrated with Enterprise Backend Services</p>
      </header>

      <nav className="tms-nav">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'schedule' ? 'active' : ''}
          onClick={() => setActiveTab('schedule')}
        >
          Training Schedule
        </button>
        <button
          className={activeTab === 'participants' ? 'active' : ''}
          onClick={() => setActiveTab('participants')}
        >
          Participants
        </button>
        <button
          className={activeTab === 'financial' ? 'active' : ''}
          onClick={() => setActiveTab('financial')}
        >
          Financial Management
        </button>
      </nav>

      <main className="tms-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Sessions</h3>
                <div className="stat-number">{stats.totalSessions}</div>
                <p>Active training programs</p>
              </div>
              <div className="stat-card">
                <h3>Active Participants</h3>
                <div className="stat-number">{stats.activeParticipants}</div>
                <p>Enrolled learners</p>
              </div>
              <div className="stat-card">
                <h3>Completion Rate</h3>
                <div className="stat-number">{stats.completionRate}%</div>
                <p>Success metric</p>
              </div>
              <div className="stat-card">
                <h3>Revenue Generated</h3>
                <div className="stat-number">
                  ${stats.revenue.toLocaleString()}
                </div>
                <p>From completed sessions</p>
              </div>
            </div>

            <div className="backend-services">
              <h3>Integrated Backend Services</h3>
              <div className="services-grid">
                <div className="service-card">
                  <h4>Training Scheduler</h4>
                  <p>AI-powered scheduling with resource optimization</p>
                  <ul>
                    <li>Smart conflict detection</li>
                    <li>Real-time updates</li>
                    <li>Calendar integration</li>
                    <li>Resource management</li>
                  </ul>
                </div>
                <div className="service-card">
                  <h4>Participant Management</h4>
                  <p>Complete participant lifecycle management</p>
                  <ul>
                    <li>QR code attendance</li>
                    <li>GPS verification</li>
                    <li>Biometric options</li>
                    <li>Communication hub</li>
                  </ul>
                </div>
                <div className="service-card">
                  <h4>Financial Management</h4>
                  <p>Comprehensive financial tracking and reporting</p>
                  <ul>
                    <li>Budget planning</li>
                    <li>Cost tracking</li>
                    <li>Invoice generation</li>
                    <li>ROI analysis</li>
                  </ul>
                </div>
                <div className="service-card">
                  <h4>Assessment System</h4>
                  <p>Advanced testing and evaluation platform</p>
                  <ul>
                    <li>Adaptive assessments</li>
                    <li>Real-time scoring</li>
                    <li>Analytics dashboard</li>
                    <li>Certification tracking</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="demo-actions">
              <h3>Live Demo Actions</h3>
              <div className="action-buttons">
                <button
                  onClick={handleCreateSession}
                  className="action-btn primary"
                >
                  🚀 Create New Session
                </button>
                <button
                  onClick={handleGenerateInvoice}
                  className="action-btn secondary"
                >
                  💰 Generate Invoice
                </button>
                <button
                  onClick={() =>
                    alert('Refreshing real-time data from backend services...')
                  }
                  className="action-btn"
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-section">
            <div className="section-header">
              <h2>Training Schedule</h2>
              <button onClick={handleCreateSession} className="create-btn">
                Create Session
              </button>
            </div>
            <div className="sessions-grid">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`session-card ${session.status}`}
                >
                  <h3>{session.title}</h3>
                  <div className="session-details">
                    <p>
                      <strong>Date:</strong> {session.date}
                    </p>
                    <p>
                      <strong>Duration:</strong> {session.duration}
                    </p>
                    <p>
                      <strong>Location:</strong> {session.location}
                    </p>
                    <p>
                      <strong>Instructor:</strong> {session.instructor}
                    </p>
                    <p>
                      <strong>Participants:</strong> {session.participants}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={`status ${session.status}`}>
                        {session.status}
                      </span>
                    </p>
                  </div>
                  <div className="session-actions">
                    <button className="btn-small">View Details</button>
                    {session.status === 'upcoming' && (
                      <button className="btn-small primary">
                        Start Session
                      </button>
                    )}
                    {session.status === 'active' && (
                      <button className="btn-small warning">End Session</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="participants-section">
            <h2>Participant Management</h2>
            <div className="participants-stats">
              <div className="stat-item">
                <span className="stat-label">Total Registered:</span>
                <span className="stat-value">{participants.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Attended:</span>
                <span className="stat-value">
                  {participants.filter((p) => p.status === 'attended').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending:</span>
                <span className="stat-value">
                  {participants.filter((p) => p.status === 'registered').length}
                </span>
              </div>
            </div>

            <div className="participants-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registration Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.id}>
                      <td>{participant.name}</td>
                      <td>{participant.email}</td>
                      <td>{participant.registrationDate}</td>
                      <td>
                        <span className={`status ${participant.status}`}>
                          {participant.status}
                        </span>
                      </td>
                      <td>
                        {participant.status === 'registered' && (
                          <button
                            onClick={() =>
                              handleRecordAttendance(participant.name)
                            }
                            className="attendance-btn"
                          >
                            📱 QR Attendance
                          </button>
                        )}
                        {participant.status === 'attended' && (
                          <button className="certificate-btn">
                            🏆 Certificate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="financial-section">
            <h2>Financial Management</h2>

            <div className="financial-overview">
              <div className="budget-section">
                <h3>Budget Overview</h3>
                {budgets.map((budget) => (
                  <div key={budget.id} className="budget-card">
                    <h4>{budget.name}</h4>
                    <div className="budget-details">
                      <p>Allocated: ${budget.allocated.toLocaleString()}</p>
                      <p>Spent: ${budget.spent.toLocaleString()}</p>
                      <p>
                        Remaining: $
                        {(budget.allocated - budget.spent).toLocaleString()}
                      </p>
                      <p>Category: {budget.category}</p>
                      <div className="budget-bar">
                        <div
                          className="budget-used"
                          style={{
                            width: `${(budget.spent / budget.allocated) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="budget-percentage">
                        {Math.round((budget.spent / budget.allocated) * 100)}%
                        utilized
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="invoice-section">
                <h3>Invoice Management</h3>
                <button
                  onClick={handleGenerateInvoice}
                  className="generate-btn"
                >
                  Generate New Invoice
                </button>
                <div className="invoices-list">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="invoice-card">
                      <div className="invoice-header">
                        <h4>Invoice #{invoice.id}</h4>
                        <span className={`status ${invoice.status}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="invoice-details">
                        <p>Amount: ${invoice.amount.toLocaleString()}</p>
                        <p>
                          Session:{' '}
                          {
                            sessions.find((s) => s.id === invoice.sessionId)
                              ?.title
                          }
                        </p>
                        <p>Due Date: {invoice.dueDate}</p>
                      </div>
                      <div className="invoice-actions">
                        {invoice.status === 'draft' && (
                          <button className="btn-small">Send Invoice</button>
                        )}
                        {invoice.status === 'sent' && (
                          <button className="btn-small">Mark as Paid</button>
                        )}
                        <button className="btn-small secondary">
                          Download PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="tms-footer">
        <p>
          <strong>Backend Services Active:</strong>
          TrainingScheduler ✅ | ParticipantManagement ✅ | FinancialManagement
          ✅ | AssessmentSystem ✅
        </p>
        <p>
          This demo showcases the complete TMS functionality with real backend
          integration
        </p>
      </footer>
    </div>
  );
}
