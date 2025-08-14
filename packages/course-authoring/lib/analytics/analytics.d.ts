/// <reference types="node" />
/// <reference types="node" />
import { CourseAnalytics, UUID } from '../types';
export interface AnalyticsService {
    get(courseId: UUID): Promise<CourseAnalytics>;
    getEngagementMetrics(courseId: UUID, timeRange: TimeRange): Promise<EngagementMetrics>;
    getPerformanceMetrics(courseId: UUID): Promise<PerformanceMetrics>;
    getContentAnalytics(courseId: UUID): Promise<ContentAnalytics>;
    getLearnerJourney(courseId: UUID, userId: string): Promise<LearnerJourney>;
    getCompletionFunnel(courseId: UUID): Promise<CompletionFunnel>;
    trackEvent(event: AnalyticsEvent): Promise<void>;
    getRealtimeStats(courseId: UUID): Promise<RealtimeStats>;
    generateReport(courseId: UUID, reportType: ReportType, format: 'json' | 'csv'): Promise<Buffer>;
}
export declare class InMemoryAnalyticsService implements AnalyticsService {
    private analytics;
    private events;
    constructor();
    get(courseId: UUID): Promise<CourseAnalytics>;
    getEngagementMetrics(courseId: UUID, timeRange: TimeRange): Promise<EngagementMetrics>;
    getPerformanceMetrics(courseId: UUID): Promise<PerformanceMetrics>;
    getContentAnalytics(courseId: UUID): Promise<ContentAnalytics>;
    getLearnerJourney(courseId: UUID, userId: string): Promise<LearnerJourney>;
    getCompletionFunnel(courseId: UUID): Promise<CompletionFunnel>;
    trackEvent(event: AnalyticsEvent): Promise<void>;
    getRealtimeStats(courseId: UUID): Promise<RealtimeStats>;
    generateReport(courseId: UUID, reportType: ReportType, format: 'json' | 'csv'): Promise<Buffer>;
    private initializeMockData;
    private getEventsInRange;
    private countSessions;
    private calculateAvgSessionDuration;
    private calculateBounceRate;
    private generateImprovementSuggestions;
    private getDefaultTimeRange;
}
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
    contentPopularity: Array<{
        contentId: string;
        views: number;
        engagement: number;
    }>;
    completionBySection: Record<string, number>;
    timeSpentBySection: Record<string, number>;
    dropOffPoints: Array<{
        point: string;
        dropOffRate: number;
    }>;
    mostViewedContent: Array<{
        contentId: string;
        views: number;
        engagement: number;
    }>;
    leastEngaging: Array<{
        contentId: string;
        engagementScore: number;
    }>;
    optimalContentLength: {
        minutes: number;
        confidence: number;
    };
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
    milestones: Array<{
        type: string;
        timestamp: Date;
    }>;
    strugglingPoints: Array<{
        point: string;
        timestamp: Date;
        reason: string;
    }>;
    lastActivity?: Date;
    pathway: Array<{
        step: string;
        timestamp: Date;
        duration: number;
    }>;
}
export interface CompletionFunnel {
    stages: Array<{
        name: string;
        count: number;
        percentage: number;
    }>;
    dropOffAnalysis: Array<{
        stage: string;
        dropOffRate: number;
        reasons: string[];
    }>;
    conversionRate: number;
    bottlenecks: Array<{
        location: string;
        impact: string;
        suggestion: string;
    }>;
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
    liveActivity: Array<{
        type: string;
        count: number;
    }>;
    systemHealth: {
        status: 'healthy' | 'warning' | 'error';
        responseTime: number;
        errorRate: number;
    };
}
export type ReportType = 'overview' | 'engagement' | 'performance' | 'content';
