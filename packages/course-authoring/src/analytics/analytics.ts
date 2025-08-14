import { CourseAnalytics, UUID } from '../types';

export interface AnalyticsService {
  get(courseId: UUID): Promise<CourseAnalytics>;
  getEngagementMetrics(courseId: UUID, timeRange: TimeRange): Promise<EngagementMetrics>;
  getPerformanceMetrics(courseId: UUID): Promise<PerformanceMetrics>;
  getContentAnalytics(courseId: UUID): Promise<ContentAnalytics>;
  getLearnerJourney(courseId: UUID, userId: string): Promise<LearnerJourney>;
  getCompletionFunnel(courseId: UUID): Promise<CompletionFunnel>;
  
  // Real-time analytics
  trackEvent(event: AnalyticsEvent): Promise<void>;
  getRealtimeStats(courseId: UUID): Promise<RealtimeStats>;
  
  // Export and reporting
  generateReport(courseId: UUID, reportType: ReportType, format: 'json' | 'csv'): Promise<Buffer>;
}

export class InMemoryAnalyticsService implements AnalyticsService {
  private analytics: Map<UUID, CourseAnalytics> = new Map();
  private events: Map<UUID, AnalyticsEvent[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  async get(courseId: UUID): Promise<CourseAnalytics> {
    let analytics = this.analytics.get(courseId);
    
    if (!analytics) {
      analytics = {
        courseId,
        enrollments: Math.floor(Math.random() * 500) + 50,
        completions: Math.floor(Math.random() * 400) + 25,
        avgTimeSpentMins: Math.floor(Math.random() * 180) + 30,
        dropOffRate: Math.random() * 0.3,
        engagementScore: Math.floor(Math.random() * 40) + 60
      };
      this.analytics.set(courseId, analytics);
    }
    
    return analytics;
  }

  async getEngagementMetrics(courseId: UUID, timeRange: TimeRange): Promise<EngagementMetrics> {
    const events = this.getEventsInRange(courseId, timeRange);
    
    return {
      timeRange,
      uniqueUsers: new Set(events.map(e => e.userId)).size,
      totalSessions: this.countSessions(events),
      avgSessionDuration: this.calculateAvgSessionDuration(events),
      pageViews: events.filter(e => e.type === 'page_view').length,
      interactions: events.filter(e => ['click', 'video_play', 'quiz_attempt'].includes(e.type)).length,
      bounceRate: this.calculateBounceRate(events),
      returningUserRate: 0.35,
      peakHours: [9, 14, 19],
      deviceBreakdown: { mobile: 0.6, desktop: 0.35, tablet: 0.05 },
      contentInteractionRate: 0.75
    };
  }

  async getPerformanceMetrics(courseId: UUID): Promise<PerformanceMetrics> {
    const analytics = await this.get(courseId);
    
    return {
      completionRate: analytics.enrollments > 0 ? analytics.completions / analytics.enrollments : 0,
      averageScore: 78.5,
      passingRate: 0.82,
      timeToCompletion: 14.5,
      retentionRates: { '1_day': 0.85, '7_days': 0.65, '30_days': 0.45 },
      strugglingLearners: ['user-1', 'user-2'],
      topPerformers: ['user-3', 'user-4'],
      improvementSuggestions: this.generateImprovementSuggestions(analytics)
    };
  }

  async getContentAnalytics(courseId: UUID): Promise<ContentAnalytics> {
    return {
      contentPopularity: [
        { contentId: 'intro', views: 450, engagement: 0.85 },
        { contentId: 'chapter1', views: 320, engagement: 0.72 }
      ],
      completionBySection: { intro: 95, chapter1: 78, chapter2: 65 },
      timeSpentBySection: { intro: 15, chapter1: 45, chapter2: 60 },
      dropOffPoints: [{ point: 'first_quiz', dropOffRate: 0.25 }],
      mostViewedContent: [{ contentId: 'intro', views: 450, engagement: 0.85 }],
      leastEngaging: [{ contentId: 'chapter3', engagementScore: 0.3 }],
      optimalContentLength: { minutes: 12, confidence: 0.85 },
      mediaEffectiveness: { video: 0.75, text: 0.45, interactive: 0.85 }
    };
  }

  async getLearnerJourney(courseId: UUID, userId: string): Promise<LearnerJourney> {
    return {
      userId,
      courseId,
      enrollmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      totalTimeSpent: 180,
      sessionsCount: 8,
      completionStatus: 'in_progress',
      progressPercentage: 65,
      milestones: [
        { type: 'course_start', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
        { type: 'progress_50', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
      ],
      strugglingPoints: [{ point: 'quiz_1', timestamp: new Date(), reason: 'Multiple failed attempts' }],
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      pathway: [
        { step: 'Enrolled', timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), duration: 0 },
        { step: 'Started Course', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), duration: 5 }
      ]
    };
  }

  async getCompletionFunnel(courseId: UUID): Promise<CompletionFunnel> {
    const analytics = await this.get(courseId);
    
    return {
      stages: [
        { name: 'Enrolled', count: analytics.enrollments, percentage: 100 },
        { name: 'Started', count: Math.floor(analytics.enrollments * 0.85), percentage: 85 },
        { name: 'Halfway', count: Math.floor(analytics.enrollments * 0.65), percentage: 65 },
        { name: 'Completed', count: analytics.completions, percentage: (analytics.completions / analytics.enrollments) * 100 }
      ],
      dropOffAnalysis: [
        { stage: 'Introduction', dropOffRate: 0.15, reasons: ['Content too basic', 'Technical issues'] }
      ],
      conversionRate: (analytics.completions / analytics.enrollments) * 100,
      bottlenecks: [
        { location: 'First Quiz', impact: 'High', suggestion: 'Add practice questions' }
      ]
    };
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const courseEvents = this.events.get(event.courseId) || [];
    courseEvents.push(event);
    this.events.set(event.courseId, courseEvents);
  }

  async getRealtimeStats(courseId: UUID): Promise<RealtimeStats> {
    return {
      activeUsers: Math.floor(Math.random() * 20) + 5,
      currentSessions: Math.floor(Math.random() * 15) + 3,
      recentCompletions: Math.floor(Math.random() * 5),
      liveActivity: [
        { type: 'page_view', count: 45 },
        { type: 'video_play', count: 12 }
      ],
      systemHealth: {
        status: 'healthy',
        responseTime: Math.random() * 100 + 50,
        errorRate: Math.random() * 0.01
      }
    };
  }

  async generateReport(courseId: UUID, reportType: ReportType, format: 'json' | 'csv'): Promise<Buffer> {
    let reportData: any;
    
    switch (reportType) {
      case 'overview':
        reportData = await this.get(courseId);
        break;
      case 'engagement':
        reportData = await this.getEngagementMetrics(courseId, this.getDefaultTimeRange());
        break;
      case 'performance':
        reportData = await this.getPerformanceMetrics(courseId);
        break;
      case 'content':
        reportData = await this.getContentAnalytics(courseId);
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
    
    if (format === 'json') {
      return Buffer.from(JSON.stringify(reportData, null, 2));
    } else {
      return Buffer.from(JSON.stringify(reportData)); // Simplified CSV
    }
  }

  // Private helper methods
  private initializeMockData(): void {
    const mockCourses = ['course-1', 'course-2', 'course-3'];
    
    mockCourses.forEach(courseId => {
      this.analytics.set(courseId, {
        courseId,
        enrollments: Math.floor(Math.random() * 1000) + 100,
        completions: Math.floor(Math.random() * 800) + 50,
        avgTimeSpentMins: Math.floor(Math.random() * 300) + 60,
        dropOffRate: Math.random() * 0.4,
        engagementScore: Math.floor(Math.random() * 40) + 60
      });
    });
  }

  private getEventsInRange(courseId: UUID, timeRange: TimeRange): AnalyticsEvent[] {
    const events = this.events.get(courseId) || [];
    return events.filter(e => 
      e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
    );
  }

  private countSessions(events: AnalyticsEvent[]): number {
    const sessions = new Map<string, Date>();
    events.forEach(event => {
      const sessionKey = `${event.userId}_${Math.floor(event.timestamp.getTime() / (30 * 60 * 1000))}`;
      if (!sessions.has(sessionKey)) {
        sessions.set(sessionKey, event.timestamp);
      }
    });
    return sessions.size;
  }

  private calculateAvgSessionDuration(events: AnalyticsEvent[]): number {
    // Simplified calculation
    return Math.random() * 30 + 10; // 10-40 minutes
  }

  private calculateBounceRate(events: AnalyticsEvent[]): number {
    return Math.random() * 0.3; // 0-30% bounce rate
  }

  private generateImprovementSuggestions(analytics: CourseAnalytics): string[] {
    const suggestions: string[] = [];
    
    const completionRate = analytics.enrollments > 0 ? analytics.completions / analytics.enrollments : 0;
    
    if (completionRate < 0.6) {
      suggestions.push('Consider adding more interactive elements to improve engagement');
    }
    
    if (analytics.avgTimeSpentMins > 120) {
      suggestions.push('Content might be too lengthy - consider breaking into shorter modules');
    }
    
    if (analytics.dropOffRate > 0.3) {
      suggestions.push('High drop-off rate detected - review course introduction and early content');
    }
    
    return suggestions;
  }

  private getDefaultTimeRange(): TimeRange {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { start: thirtyDaysAgo, end: now };
  }
}

// Supporting interfaces
export interface TimeRange {
  start: Date;
  end: Date;
}

export interface EngagementMetrics {
  timeRange: TimeRange;
  uniqueUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  pageViews: number;
  interactions: number;
  bounceRate: number;
  returningUserRate: number;
  peakHours: number[];
  deviceBreakdown: Record<string, number>;
  contentInteractionRate: number;
}

export interface PerformanceMetrics {
  completionRate: number;
  averageScore: number;
  passingRate: number;
  timeToCompletion: number;
  retentionRates: Record<string, number>;
  strugglingLearners: string[];
  topPerformers: string[];
  improvementSuggestions: string[];
}

export interface ContentAnalytics {
  contentPopularity: Array<{ contentId: string; views: number; engagement: number }>;
  completionBySection: Record<string, number>;
  timeSpentBySection: Record<string, number>;
  dropOffPoints: Array<{ point: string; dropOffRate: number }>;
  mostViewedContent: Array<{ contentId: string; views: number; engagement: number }>;
  leastEngaging: Array<{ contentId: string; engagementScore: number }>;
  optimalContentLength: { minutes: number; confidence: number };
  mediaEffectiveness: Record<string, number>;
}

export interface LearnerJourney {
  userId: string;
  courseId: UUID;
  enrollmentDate: Date;
  totalTimeSpent: number;
  sessionsCount: number;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
  milestones: Array<{ type: string; timestamp: Date }>;
  strugglingPoints: Array<{ point: string; timestamp: Date; reason: string }>;
  lastActivity?: Date;
  pathway: Array<{ step: string; timestamp: Date; duration: number }>;
}

export interface CompletionFunnel {
  stages: Array<{ name: string; count: number; percentage: number }>;
  dropOffAnalysis: Array<{ stage: string; dropOffRate: number; reasons: string[] }>;
  conversionRate: number;
  bottlenecks: Array<{ location: string; impact: string; suggestion: string }>;
}

export interface AnalyticsEvent {
  id: UUID;
  courseId: UUID;
  userId: string;
  type: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface RealtimeStats {
  activeUsers: number;
  currentSessions: number;
  recentCompletions: number;
  liveActivity: Array<{ type: string; count: number }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    errorRate: number;
  };
}

export type ReportType = 'overview' | 'engagement' | 'performance' | 'content';
