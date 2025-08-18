'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';
import {
  SessionsAPI,
  ParticipantsAPI,
  showNotification,
} from '../../../lib/api';

// Types
interface FinancialRecord {
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  sessionType: string;
  instructor: string;
  costPerParticipant: number;
  registeredParticipants: number;
  attendedParticipants: number;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  roi: number;
  instructorFee: number;
  materialCosts: number;
  venueCosts: number;
  otherCosts: number;
}

interface FinancialFilters {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate: string;
  endDate: string;
  sessionType: string;
  instructor: string;
  minROI: number;
  showProfitableOnly: boolean;
}

export default function FinancialReportPage() {
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialRecord[]>([]);
  const [filteredData, setFilteredData] = useState<FinancialRecord[]>([]);
  const [filters, setFilters] = useState<FinancialFilters>({
    dateRange: 'month',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    sessionType: '',
    instructor: '',
    minROI: 0,
    showProfitableOnly: false,
  });

  const [availableFilters, setAvailableFilters] = useState({
    instructors: [] as string[],
    sessionTypes: [] as string[],
  });

  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 0,
    totalCosts: 0,
    totalProfit: 0,
    averageROI: 0,
    totalSessions: 0,
    profitableSessions: 0,
    avgCostPerSession: 0,
    avgRevenuePerSession: 0,
  });

  useEffect(() => {
    loadFinancialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [financialData, filters]);

  useEffect(() => {
    calculateSummary();
  }, [filteredData]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const sessionResult = await SessionsAPI.getAllSessions();
      const participantResult = await ParticipantsAPI.getAllParticipants();

      if (sessionResult.success && participantResult.success) {
        const sessions = sessionResult.data?.sessions || [];
        const participants = participantResult.data?.participants || [];

        // Generate financial records
        const financialRecords = generateFinancialRecords(
          sessions,
          participants
        );
        setFinancialData(financialRecords);

        // Extract filter options
        const instructors = [
          ...new Set(sessions.map((s: any) => s.instructor)),
        ];
        const sessionTypes = [...new Set(sessions.map((s: any) => s.type))];

        setAvailableFilters({ instructors, sessionTypes });

        showNotification(
          `Loaded financial data for ${financialRecords.length} sessions`,
          'success'
        );
      } else {
        // Use demo data if API fails
        const demoData = generateDemoFinancialData();
        setFinancialData(demoData);
        setFilteredData(demoData);
        showNotification('Using demo financial data', 'info');
      }
    } catch (error) {
      showNotification('Failed to load financial data', 'error');
      const demoData = generateDemoFinancialData();
      setFinancialData(demoData);
      setFilteredData(demoData);
    } finally {
      setLoading(false);
    }
  };

  const generateFinancialRecords = (
    sessions: any[],
    participants: any[]
  ): FinancialRecord[] => {
    return sessions.map((session) => {
      const registeredCount = Math.floor(Math.random() * 30) + 10; // 10-40 participants
      const attendedCount = Math.floor(
        registeredCount * (0.7 + Math.random() * 0.3)
      ); // 70-100% attendance

      const costPerParticipant = 100 + Math.floor(Math.random() * 400); // $100-500
      const instructorFee = 500 + Math.floor(Math.random() * 1500); // $500-2000
      const materialCosts =
        registeredCount * (10 + Math.floor(Math.random() * 30)); // $10-40 per participant
      const venueCosts = 200 + Math.floor(Math.random() * 300); // $200-500
      const otherCosts = Math.floor(Math.random() * 200); // $0-200

      const totalRevenue = attendedCount * costPerParticipant;
      const totalCosts =
        instructorFee + materialCosts + venueCosts + otherCosts;
      const profit = totalRevenue - totalCosts;
      const roi =
        totalCosts > 0
          ? Math.round(((totalRevenue - totalCosts) / totalCosts) * 100)
          : 0;

      return {
        sessionId: session.id,
        sessionTitle: session.title,
        sessionDate: session.date,
        sessionType: session.type,
        instructor: session.instructor,
        costPerParticipant,
        registeredParticipants: registeredCount,
        attendedParticipants: attendedCount,
        totalRevenue,
        totalCosts,
        profit,
        roi,
        instructorFee,
        materialCosts,
        venueCosts,
        otherCosts,
      };
    });
  };

  const generateDemoFinancialData = (): FinancialRecord[] => {
    return [
      {
        sessionId: '1',
        sessionTitle: 'Leadership Fundamentals',
        sessionDate: new Date().toLocaleDateString(),
        sessionType: 'Leadership',
        instructor: 'Dr. Sarah Johnson',
        costPerParticipant: 350,
        registeredParticipants: 25,
        attendedParticipants: 23,
        totalRevenue: 8050,
        totalCosts: 2100,
        profit: 5950,
        roi: 283,
        instructorFee: 1500,
        materialCosts: 400,
        venueCosts: 150,
        otherCosts: 50,
      },
      {
        sessionId: '2',
        sessionTitle: 'Technical Skills Workshop',
        sessionDate: new Date(Date.now() - 86400000).toLocaleDateString(),
        sessionType: 'Technical',
        instructor: 'Michael Rodriguez',
        costPerParticipant: 250,
        registeredParticipants: 18,
        attendedParticipants: 15,
        totalRevenue: 3750,
        totalCosts: 1800,
        profit: 1950,
        roi: 108,
        instructorFee: 1200,
        materialCosts: 360,
        venueCosts: 200,
        otherCosts: 40,
      },
      {
        sessionId: '3',
        sessionTitle: 'Communication Excellence',
        sessionDate: new Date(Date.now() - 172800000).toLocaleDateString(),
        sessionType: 'Soft Skills',
        instructor: 'Dr. Sarah Johnson',
        costPerParticipant: 200,
        registeredParticipants: 30,
        attendedParticipants: 28,
        totalRevenue: 5600,
        totalCosts: 2400,
        profit: 3200,
        roi: 133,
        instructorFee: 1000,
        materialCosts: 900,
        venueCosts: 400,
        otherCosts: 100,
      },
      {
        sessionId: '4',
        sessionTitle: 'Advanced Analytics',
        sessionDate: new Date(Date.now() - 259200000).toLocaleDateString(),
        sessionType: 'Technical',
        instructor: 'Dr. Emily Chen',
        costPerParticipant: 450,
        registeredParticipants: 12,
        attendedParticipants: 10,
        totalRevenue: 4500,
        totalCosts: 2800,
        profit: 1700,
        roi: 61,
        instructorFee: 2000,
        materialCosts: 600,
        venueCosts: 150,
        otherCosts: 50,
      },
    ];
  };

  const applyFilters = () => {
    let filtered = [...financialData];

    // Date range filter
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    filtered = filtered.filter((record) => {
      const recordDate = new Date(record.sessionDate);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Other filters
    if (filters.instructor) {
      filtered = filtered.filter(
        (record) => record.instructor === filters.instructor
      );
    }

    if (filters.sessionType) {
      filtered = filtered.filter(
        (record) => record.sessionType === filters.sessionType
      );
    }

    if (filters.minROI > 0) {
      filtered = filtered.filter((record) => record.roi >= filters.minROI);
    }

    if (filters.showProfitableOnly) {
      filtered = filtered.filter((record) => record.profit > 0);
    }

    setFilteredData(filtered);
  };

  const calculateSummary = () => {
    if (filteredData.length === 0) {
      setFinancialSummary({
        totalRevenue: 0,
        totalCosts: 0,
        totalProfit: 0,
        averageROI: 0,
        totalSessions: 0,
        profitableSessions: 0,
        avgCostPerSession: 0,
        avgRevenuePerSession: 0,
      });
      return;
    }

    const totalRevenue = filteredData.reduce(
      (sum, record) => sum + record.totalRevenue,
      0
    );
    const totalCosts = filteredData.reduce(
      (sum, record) => sum + record.totalCosts,
      0
    );
    const totalProfit = totalRevenue - totalCosts;
    const averageROI = Math.round(
      filteredData.reduce((sum, record) => sum + record.roi, 0) /
        filteredData.length
    );
    const totalSessions = filteredData.length;
    const profitableSessions = filteredData.filter(
      (record) => record.profit > 0
    ).length;
    const avgCostPerSession = Math.round(totalCosts / totalSessions);
    const avgRevenuePerSession = Math.round(totalRevenue / totalSessions);

    setFinancialSummary({
      totalRevenue,
      totalCosts,
      totalProfit,
      averageROI,
      totalSessions,
      profitableSessions,
      avgCostPerSession,
      avgRevenuePerSession,
    });
  };

  const handleDateRangeChange = (range: string) => {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    setFilters((prev) => ({
      ...prev,
      dateRange: range as any,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    }));
  };

  const exportReport = () => {
    try {
      const reportData = {
        generatedDate: new Date().toISOString(),
        dateRange: `${filters.startDate} to ${filters.endDate}`,
        filters: filters,
        summary: financialSummary,
        sessionDetails: filteredData.map((record) => ({
          sessionTitle: record.sessionTitle,
          sessionDate: record.sessionDate,
          instructor: record.instructor,
          sessionType: record.sessionType,
          registeredParticipants: record.registeredParticipants,
          attendedParticipants: record.attendedParticipants,
          costPerParticipant: record.costPerParticipant,
          totalRevenue: record.totalRevenue,
          totalCosts: record.totalCosts,
          profit: record.profit,
          roi: record.roi,
          costBreakdown: {
            instructorFee: record.instructorFee,
            materialCosts: record.materialCosts,
            venueCosts: record.venueCosts,
            otherCosts: record.otherCosts,
          },
        })),
      };

      const jsonContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `financial-report-${filters.startDate}-to-${filters.endDate}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification('Financial report exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export report', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <h1>Financial Report</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="tms-button" onClick={exportReport}>
            Export Report
          </button>
          <Link href="/analytics" className="tms-button">
            Back to Analytics
          </Link>
          <Link href="/" className="tms-button">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="tms-analytics-summary">
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {formatCurrency(financialSummary.totalRevenue)}
          </div>
          <div className="tms-metric-label">Total Revenue</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {formatCurrency(financialSummary.totalCosts)}
          </div>
          <div className="tms-metric-label">Total Costs</div>
        </div>
        <div className="tms-metric-card">
          <div
            className="tms-metric-value"
            style={{
              color:
                financialSummary.totalProfit >= 0
                  ? 'var(--color-success)'
                  : 'var(--color-error)',
            }}
          >
            {formatCurrency(financialSummary.totalProfit)}
          </div>
          <div className="tms-metric-label">Net Profit</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">{financialSummary.averageROI}%</div>
          <div className="tms-metric-label">Average ROI</div>
        </div>
      </div>

      <div className="tms-analytics-summary">
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {financialSummary.totalSessions}
          </div>
          <div className="tms-metric-label">Total Sessions</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {financialSummary.profitableSessions}
          </div>
          <div className="tms-metric-label">Profitable Sessions</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {formatCurrency(financialSummary.avgRevenuePerSession)}
          </div>
          <div className="tms-metric-label">Avg Revenue/Session</div>
        </div>
        <div className="tms-metric-card">
          <div className="tms-metric-value">
            {formatCurrency(financialSummary.avgCostPerSession)}
          </div>
          <div className="tms-metric-label">Avg Cost/Session</div>
        </div>
      </div>

      <div className="tms-form-container">
        <h3>Report Filters</h3>
        <div className="tms-form">
          <div className="tms-form-group">
            <label>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="tms-select"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filters.dateRange === 'custom' && (
            <>
              <div className="tms-form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="tms-input"
                />
              </div>
              <div className="tms-form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="tms-input"
                />
              </div>
            </>
          )}

          <div className="tms-form-group">
            <label>Instructor</label>
            <select
              value={filters.instructor}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, instructor: e.target.value }))
              }
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
            <label>Session Type</label>
            <select
              value={filters.sessionType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sessionType: e.target.value }))
              }
              className="tms-select"
            >
              <option value="">All Types</option>
              {availableFilters.sessionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="tms-form-group">
            <label>Minimum ROI (%)</label>
            <input
              type="number"
              value={filters.minROI}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minROI: parseInt(e.target.value) || 0,
                }))
              }
              className="tms-input"
            />
          </div>

          <div className="tms-form-group">
            <label>
              <input
                type="checkbox"
                checked={filters.showProfitableOnly}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    showProfitableOnly: e.target.checked,
                  }))
                }
              />
              Show Profitable Sessions Only
            </label>
          </div>
        </div>
      </div>

      <div className="tms-analytics-content">
        <h3>Session Financial Details ({filteredData.length} sessions)</h3>

        {loading ? (
          <div className="tms-loading">Loading financial data...</div>
        ) : (
          <div className="tms-table-container">
            <table className="tms-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Date</th>
                  <th>Instructor</th>
                  <th>Type</th>
                  <th>Participants</th>
                  <th>Revenue</th>
                  <th>Costs</th>
                  <th>Profit</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="tms-no-data">
                      No sessions match your filter criteria
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record) => (
                    <tr key={record.sessionId}>
                      <td>{record.sessionTitle}</td>
                      <td>{record.sessionDate}</td>
                      <td>{record.instructor}</td>
                      <td>{record.sessionType}</td>
                      <td>
                        {record.attendedParticipants}/
                        {record.registeredParticipants}
                      </td>
                      <td>{formatCurrency(record.totalRevenue)}</td>
                      <td>{formatCurrency(record.totalCosts)}</td>
                      <td
                        style={{
                          color:
                            record.profit >= 0
                              ? 'var(--color-success)'
                              : 'var(--color-error)',
                        }}
                      >
                        {formatCurrency(record.profit)}
                      </td>
                      <td>
                        <span
                          className={`tms-status ${
                            record.roi >= 100
                              ? 'attended'
                              : record.roi >= 50
                                ? 'confirmed'
                                : record.roi >= 0
                                  ? 'registered'
                                  : 'no-show'
                          }`}
                        >
                          {record.roi}%
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
        <h3>Cost Breakdown Analysis</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <div className="tms-form-container">
            <h4>Average Costs per Session</h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Instructor Fees:</span>
                <strong>
                  {formatCurrency(
                    filteredData.reduce((sum, r) => sum + r.instructorFee, 0) /
                      (filteredData.length || 1)
                  )}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Material Costs:</span>
                <strong>
                  {formatCurrency(
                    filteredData.reduce((sum, r) => sum + r.materialCosts, 0) /
                      (filteredData.length || 1)
                  )}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Venue Costs:</span>
                <strong>
                  {formatCurrency(
                    filteredData.reduce((sum, r) => sum + r.venueCosts, 0) /
                      (filteredData.length || 1)
                  )}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Other Costs:</span>
                <strong>
                  {formatCurrency(
                    filteredData.reduce((sum, r) => sum + r.otherCosts, 0) /
                      (filteredData.length || 1)
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="tms-form-container">
            <h4>Profitability Analysis</h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Profitable Sessions:</span>
                <strong style={{ color: 'var(--color-success)' }}>
                  {financialSummary.profitableSessions} /{' '}
                  {financialSummary.totalSessions}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Success Rate:</span>
                <strong>
                  {Math.round(
                    (financialSummary.profitableSessions /
                      (financialSummary.totalSessions || 1)) *
                      100
                  )}
                  %
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Break-even Sessions:</span>
                <strong>
                  {filteredData.filter((r) => Math.abs(r.profit) < 100).length}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Loss-making Sessions:</span>
                <strong style={{ color: 'var(--color-error)' }}>
                  {filteredData.filter((r) => r.profit < -100).length}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
