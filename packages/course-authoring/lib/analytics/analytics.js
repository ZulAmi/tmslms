"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAnalyticsService = void 0;
class InMemoryAnalyticsService {
    constructor() {
        this.analytics = new Map();
        this.events = new Map();
        this.initializeMockData();
    }
    async get(courseId) {
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
    async getEngagementMetrics(courseId, timeRange) {
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
    async getPerformanceMetrics(courseId) {
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
    async getContentAnalytics(courseId) {
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
    async getLearnerJourney(courseId, userId) {
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
    async getCompletionFunnel(courseId) {
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
    async trackEvent(event) {
        const courseEvents = this.events.get(event.courseId) || [];
        courseEvents.push(event);
        this.events.set(event.courseId, courseEvents);
    }
    async getRealtimeStats(courseId) {
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
    async generateReport(courseId, reportType, format) {
        let reportData;
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
        }
        else {
            return Buffer.from(JSON.stringify(reportData)); // Simplified CSV
        }
    }
    // Private helper methods
    initializeMockData() {
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
    getEventsInRange(courseId, timeRange) {
        const events = this.events.get(courseId) || [];
        return events.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end);
    }
    countSessions(events) {
        const sessions = new Map();
        events.forEach(event => {
            const sessionKey = `${event.userId}_${Math.floor(event.timestamp.getTime() / (30 * 60 * 1000))}`;
            if (!sessions.has(sessionKey)) {
                sessions.set(sessionKey, event.timestamp);
            }
        });
        return sessions.size;
    }
    calculateAvgSessionDuration(events) {
        // Simplified calculation
        return Math.random() * 30 + 10; // 10-40 minutes
    }
    calculateBounceRate(events) {
        return Math.random() * 0.3; // 0-30% bounce rate
    }
    generateImprovementSuggestions(analytics) {
        const suggestions = [];
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
    getDefaultTimeRange() {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start: thirtyDaysAgo, end: now };
    }
}
exports.InMemoryAnalyticsService = InMemoryAnalyticsService;
