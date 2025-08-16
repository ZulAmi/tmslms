/**
 * Advanced Funding Dashboard Service
 * Real-time analytics and insights for SSG-WSG funding operations
 */

import { EventEmitter } from 'events';
import { FundingClaimsService } from './FundingClaimsService';
import {
  FundingDashboardData,
  FundingSummaryMetrics,
  ApprovalRateMetrics,
  FundingUtilizationMetrics,
  ProcessingPerformanceMetrics,
  ComplianceMetrics,
  TrendAnalysis,
  CoursePerformanceMetric,
  RiskIndicator,
  EligibilityResponse,
  ClaimSubmission,
  ClaimStatus,
} from './types';

export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  fundingSchemes?: string[];
  trainingProviders?: string[];
  participantCategories?: string[];
  claimStatuses?: ClaimStatus[];
  amountRange?: {
    min: number;
    max: number;
  };
  companySize?: string[];
  industry?: string[];
  region?: string[];
}

export interface RealtimeMetrics {
  activeUsers: number;
  pendingApplications: number;
  processingQueue: number;
  systemLoad: number;
  errorRate: number;
  averageResponseTime: number;
  lastUpdated: Date;
}

export interface ForecastData {
  predictedApplicationVolume: Array<{
    period: string;
    predicted: number;
    confidence: number;
  }>;
  budgetUtilizationForecast: Array<{
    period: string;
    predicted: number;
    actualToDate: number;
  }>;
  capacityPlanning: {
    recommendedStaffing: number;
    peakPeriods: string[];
    bottleneckPrediction: string[];
  };
}

export interface CustomReport {
  reportId: string;
  name: string;
  description: string;
  filters: DashboardFilters;
  metrics: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  format: 'pdf' | 'excel' | 'json';
  createdBy: string;
  createdAt: Date;
}

/**
 * Advanced Dashboard Analytics Service
 * Provides comprehensive insights and real-time monitoring
 */
export class FundingDashboardService extends EventEmitter {
  private fundingService: FundingClaimsService;
  private realtimeMetrics: RealtimeMetrics;
  private customReports = new Map<string, CustomReport>();

  constructor(fundingService: FundingClaimsService) {
    super();
    this.fundingService = fundingService;
    this.realtimeMetrics = this.initializeRealtimeMetrics();
    this.startRealtimeMonitoring();
  }

  /**
   * Get comprehensive dashboard data with advanced filtering
   */
  async getDashboardData(
    filters: DashboardFilters
  ): Promise<FundingDashboardData> {
    const startTime = Date.now();

    try {
      // Generate dashboard data with applied filters
      const dashboardData = await this.fundingService.generateFundingDashboard(
        filters.dateRange.start,
        filters.dateRange.end
      );

      // Apply additional filtering logic
      const filteredData = this.applyAdvancedFilters(dashboardData, filters);

      // Add real-time enhancements
      const enhancedData = this.enhanceWithRealtimeData(filteredData);

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      this.emit('dashboardGenerated', {
        filters,
        processingTime,
        dataPoints: this.calculateDataPoints(enhancedData),
      });

      return enhancedData;
    } catch (error) {
      this.emit('dashboardError', {
        error: error instanceof Error ? error.message : String(error),
        filters,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Get real-time system metrics
   */
  getRealtimeMetrics(): RealtimeMetrics {
    return { ...this.realtimeMetrics };
  }

  /**
   * Generate predictive analytics and forecasting
   */
  async generateForecast(
    historicalMonths: number = 12,
    forecastMonths: number = 6
  ): Promise<ForecastData> {
    // Mock advanced forecasting logic
    const currentDate = new Date();

    const predictedApplicationVolume = Array.from(
      { length: forecastMonths },
      (_, i) => {
        const period = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + i + 1,
          1
        );
        const seasonal = this.calculateSeasonalFactor(period);
        const trend = this.calculateTrendFactor(i);
        const baseVolume = 150; // Base monthly applications

        return {
          period: period.toISOString().slice(0, 7), // YYYY-MM format
          predicted: Math.round(baseVolume * seasonal * trend),
          confidence: Math.max(0.6, 0.95 - i * 0.05), // Decreasing confidence over time
        };
      }
    );

    const budgetUtilizationForecast = Array.from(
      { length: forecastMonths },
      (_, i) => {
        const period = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + i + 1,
          1
        );
        const baseUtilization = 800000; // Base monthly utilization
        const growth = 1 + i * 0.02; // 2% monthly growth

        return {
          period: period.toISOString().slice(0, 7),
          predicted: Math.round(baseUtilization * growth),
          actualToDate: i === 0 ? 750000 : 0, // Only current month has actual data
        };
      }
    );

    const capacityPlanning = {
      recommendedStaffing: this.calculateRecommendedStaffing(
        predictedApplicationVolume
      ),
      peakPeriods: this.identifyPeakPeriods(predictedApplicationVolume),
      bottleneckPrediction: ['Document Verification', 'Senior Approval'],
    };

    const forecast: ForecastData = {
      predictedApplicationVolume,
      budgetUtilizationForecast,
      capacityPlanning,
    };

    this.emit('forecastGenerated', forecast);

    return forecast;
  }

  /**
   * Create custom report configuration
   */
  async createCustomReport(
    report: Omit<CustomReport, 'reportId' | 'createdAt'>
  ): Promise<CustomReport> {
    const customReport: CustomReport = {
      ...report,
      reportId: this.generateId(),
      createdAt: new Date(),
    };

    this.customReports.set(customReport.reportId, customReport);

    // Schedule report if configured
    if (customReport.schedule) {
      this.scheduleReport(customReport);
    }

    this.emit('customReportCreated', customReport);

    return customReport;
  }

  /**
   * Generate executive summary report
   */
  async generateExecutiveSummary(
    period: 'weekly' | 'monthly' | 'quarterly'
  ): Promise<{
    period: string;
    keyMetrics: {
      totalApplications: number;
      approvalRate: number;
      totalFunding: number;
      averageProcessingTime: number;
    };
    trends: {
      applicationGrowth: number;
      approvalRateChange: number;
      fundingGrowth: number;
      efficiencyImprovement: number;
    };
    highlights: string[];
    concerns: string[];
    recommendations: string[];
    nextPeriodProjections: {
      expectedApplications: number;
      projectedFunding: number;
      capacity: string;
    };
  }> {
    const endDate = new Date();
    const startDate = this.calculatePeriodStart(endDate, period);

    const dashboardData = await this.fundingService.generateFundingDashboard(
      startDate,
      endDate
    );

    // Calculate key metrics
    const keyMetrics = {
      totalApplications: dashboardData.summaryMetrics.totalApplications,
      approvalRate: dashboardData.approvalRates.overallApprovalRate,
      totalFunding: dashboardData.summaryMetrics.totalApprovedAmount,
      averageProcessingTime: dashboardData.summaryMetrics.averageProcessingTime,
    };

    // Calculate trends (mock comparison with previous period)
    const trends = {
      applicationGrowth: 12.5, // 12.5% increase
      approvalRateChange: -2.1, // 2.1% decrease
      fundingGrowth: 18.7, // 18.7% increase
      efficiencyImprovement: 8.3, // 8.3% improvement in processing time
    };

    // Generate insights
    const highlights = [
      'Record high monthly funding approvals of $2.1M',
      'Processing efficiency improved by 8.3% compared to last period',
      'Digital transformation courses showing 45% higher completion rates',
      'New automated eligibility checking reduced manual review by 60%',
    ];

    const concerns = [
      'Approval rate declined 2.1% due to stricter compliance requirements',
      'Document verification stage experiencing 15% longer processing times',
      'Regional disparity in application volumes - West region down 8%',
    ];

    const recommendations = [
      'Implement additional document verification automation',
      'Conduct targeted outreach in underperforming regions',
      'Review and streamline compliance requirements',
      'Increase staffing for peak processing periods in Q4',
    ];

    const forecast = await this.generateForecast(3, 1);
    const nextPeriodProjections = {
      expectedApplications:
        forecast.predictedApplicationVolume[0]?.predicted || 0,
      projectedFunding: forecast.budgetUtilizationForecast[0]?.predicted || 0,
      capacity: 'Adequate with current staffing levels',
    };

    const executiveSummary = {
      period: `${period.toUpperCase()} - ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`,
      keyMetrics,
      trends,
      highlights,
      concerns,
      recommendations,
      nextPeriodProjections,
    };

    this.emit('executiveSummaryGenerated', executiveSummary);

    return executiveSummary;
  }

  /**
   * Get advanced analytics insights
   */
  async getAdvancedInsights(filters: DashboardFilters): Promise<{
    anomalyDetection: Array<{
      type: 'volume' | 'processing_time' | 'approval_rate' | 'amount';
      severity: 'low' | 'medium' | 'high';
      description: string;
      detectedAt: Date;
      impact: string;
      recommendedAction: string;
    }>;
    performanceBenchmarks: {
      industry: {
        averageProcessingTime: number;
        averageApprovalRate: number;
        yourPerformance: 'above' | 'at' | 'below';
      };
      regional: {
        rank: number;
        totalRegions: number;
        comparisonMetric: string;
      };
    };
    optimization: Array<{
      area: string;
      currentPerformance: number;
      potentialImprovement: number;
      effort: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      timeline: string;
    }>;
  }> {
    // Mock advanced analytics
    const insights = {
      anomalyDetection: [
        {
          type: 'processing_time' as const,
          severity: 'medium' as const,
          description:
            'Document verification stage showing 23% longer processing times than baseline',
          detectedAt: new Date(),
          impact:
            'Affecting 15% of applications, adding average 2.3 days to processing',
          recommendedAction:
            'Review document verification workflow and consider automation upgrades',
        },
        {
          type: 'volume' as const,
          severity: 'low' as const,
          description:
            'Applications from healthcare sector down 18% compared to seasonal norm',
          detectedAt: new Date(),
          impact: 'Potential $320K reduction in sector funding',
          recommendedAction:
            'Targeted outreach to healthcare training providers',
        },
      ],
      performanceBenchmarks: {
        industry: {
          averageProcessingTime: 12.5, // days
          averageApprovalRate: 82.3, // percentage
          yourPerformance: 'above' as const,
        },
        regional: {
          rank: 2,
          totalRegions: 8,
          comparisonMetric: 'processing efficiency',
        },
      },
      optimization: [
        {
          area: 'Automated Eligibility Screening',
          currentPerformance: 65, // percentage automated
          potentialImprovement: 25, // percentage points
          effort: 'medium' as const,
          impact: 'high' as const,
          timeline: '3-4 months',
        },
        {
          area: 'Document Digital Processing',
          currentPerformance: 45,
          potentialImprovement: 40,
          effort: 'high' as const,
          impact: 'high' as const,
          timeline: '6-8 months',
        },
        {
          area: 'Predictive Risk Assessment',
          currentPerformance: 0,
          potentialImprovement: 15,
          effort: 'low' as const,
          impact: 'medium' as const,
          timeline: '2-3 months',
        },
      ],
    };

    this.emit('advancedInsightsGenerated', insights);

    return insights;
  }

  /**
   * Export dashboard data in various formats
   */
  async exportDashboardData(
    filters: DashboardFilters,
    format: 'excel' | 'pdf' | 'json' | 'csv',
    includeCharts: boolean = true
  ): Promise<{
    downloadUrl: string;
    fileSize: number;
    generatedAt: Date;
    expiresAt: Date;
  }> {
    const dashboardData = await this.getDashboardData(filters);

    // Mock export process
    const mockExport = {
      downloadUrl: `https://exports.ssg-wsg.gov.sg/dashboard-export-${this.generateId()}.${format}`,
      fileSize: Math.floor(Math.random() * 5000000) + 1000000, // 1-5MB
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    this.emit('dashboardExported', {
      format,
      filters,
      includeCharts,
      export: mockExport,
    });

    return mockExport;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private initializeRealtimeMetrics(): RealtimeMetrics {
    return {
      activeUsers: 0,
      pendingApplications: 0,
      processingQueue: 0,
      systemLoad: 0,
      errorRate: 0,
      averageResponseTime: 0,
      lastUpdated: new Date(),
    };
  }

  private startRealtimeMonitoring(): void {
    setInterval(() => {
      this.updateRealtimeMetrics();
    }, 5000); // Update every 5 seconds

    // Emit real-time updates
    setInterval(() => {
      this.emit('realtimeUpdate', this.realtimeMetrics);
    }, 1000); // Emit every second
  }

  private updateRealtimeMetrics(): void {
    // Mock real-time metric updates
    this.realtimeMetrics = {
      activeUsers: Math.floor(Math.random() * 50) + 20,
      pendingApplications: Math.floor(Math.random() * 200) + 100,
      processingQueue: Math.floor(Math.random() * 50) + 10,
      systemLoad: Math.random() * 100,
      errorRate: Math.random() * 5,
      averageResponseTime: Math.random() * 2000 + 500,
      lastUpdated: new Date(),
    };
  }

  private applyAdvancedFilters(
    data: FundingDashboardData,
    filters: DashboardFilters
  ): FundingDashboardData {
    // Mock advanced filtering logic
    // In production, this would apply complex filtering to the dataset
    return data;
  }

  private enhanceWithRealtimeData(
    data: FundingDashboardData
  ): FundingDashboardData {
    // Add real-time enhancements
    return {
      ...data,
      summaryMetrics: {
        ...data.summaryMetrics,
        pendingApplications: this.realtimeMetrics.pendingApplications,
      },
    };
  }

  private calculateDataPoints(data: FundingDashboardData): number {
    // Calculate total data points for performance tracking
    return Object.keys(data).length * 100; // Mock calculation
  }

  private calculateSeasonalFactor(date: Date): number {
    // Mock seasonal adjustment
    const month = date.getMonth();
    const seasonalFactors = [
      0.9, 0.85, 1.1, 1.15, 1.2, 1.0, 0.8, 0.75, 1.05, 1.25, 1.15, 0.95,
    ];
    return seasonalFactors[month];
  }

  private calculateTrendFactor(monthsAhead: number): number {
    // Mock trend calculation (slight growth)
    return 1 + monthsAhead * 0.02;
  }

  private calculateRecommendedStaffing(applicationVolume: any[]): number {
    const avgVolume =
      applicationVolume.reduce((sum, item) => sum + item.predicted, 0) /
      applicationVolume.length;
    const applicationsPerStaff = 75; // Mock capacity per staff member
    return Math.ceil(avgVolume / applicationsPerStaff);
  }

  private identifyPeakPeriods(applicationVolume: any[]): string[] {
    const avgVolume =
      applicationVolume.reduce((sum, item) => sum + item.predicted, 0) /
      applicationVolume.length;
    return applicationVolume
      .filter((item) => item.predicted > avgVolume * 1.2)
      .map((item) => item.period);
  }

  private calculatePeriodStart(
    endDate: Date,
    period: 'weekly' | 'monthly' | 'quarterly'
  ): Date {
    const start = new Date(endDate);
    switch (period) {
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() - 3);
        break;
    }
    return start;
  }

  private scheduleReport(report: CustomReport): void {
    // Mock report scheduling
    console.log(
      `Scheduled report: ${report.name} - ${report.schedule?.frequency}`
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export default FundingDashboardService;
