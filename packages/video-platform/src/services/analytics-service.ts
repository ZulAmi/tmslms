import { 
  VideoAnalytics, 
  VideoEvent, 
  WatchProgress, 
  EngagementMetrics,
  DropOffPoint,
  ReplaySegment,
  QuizPerformanceMetrics,
  DeviceMetrics,
  GeographicMetrics
} from '../types';

export interface VideoAnalyticsService {
  trackEvent(videoId: string, userId: string, event: VideoEvent): Promise<void>;
  updateProgress(videoId: string, userId: string, progress: Partial<WatchProgress>): Promise<void>;
  getProgress(videoId: string, userId: string): Promise<WatchProgress | null>;
  getEngagementMetrics(videoId: string, timeRange?: { start: Date; end: Date }): Promise<EngagementMetrics>;
  getDropOffAnalysis(videoId: string): Promise<DropOffPoint[]>;
  getReplayAnalysis(videoId: string): Promise<ReplaySegment[]>;
  generateReport(videoId: string, format: 'json' | 'csv' | 'pdf'): Promise<string>;
}

export class InMemoryVideoAnalyticsService implements VideoAnalyticsService {
  private analytics: Map<string, VideoAnalytics[]> = new Map();
  private progress: Map<string, WatchProgress> = new Map();
  private eventBuffer: VideoAnalytics[] = [];
  private bufferSize = 100;
  private flushInterval = 5000; // 5 seconds

  constructor() {
    // Auto-flush buffer every 5 seconds
    setInterval(() => this.flushBuffer(), this.flushInterval);
  }

  async trackEvent(videoId: string, userId: string, event: VideoEvent): Promise<void> {
    const sessionId = this.getSessionId(userId);
    const analytics: VideoAnalytics = {
      videoId,
      userId,
      sessionId,
      timestamp: new Date(),
      event,
      data: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        screenResolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '',
        connectionType: this.getConnectionType(),
        deviceType: this.getDeviceType(),
        location: await this.getLocation()
      }
    };

    this.eventBuffer.push(analytics);

    // Immediate flush for critical events
    if (['ended', 'quiz_complete', 'error'].includes(event.type)) {
      await this.flushBuffer();
    }

    // Buffer size limit
    if (this.eventBuffer.length >= this.bufferSize) {
      await this.flushBuffer();
    }
  }

  async updateProgress(videoId: string, userId: string, progress: Partial<WatchProgress>): Promise<void> {
    const key = `${videoId}-${userId}`;
    const existing = this.progress.get(key) || this.createDefaultProgress(videoId, userId);
    
    const updated: WatchProgress = {
      ...existing,
      ...progress,
      updatedAt: new Date()
    };

    this.progress.set(key, updated);

    // Track progress milestone events
    const previousCompletion = existing.completionPercentage;
    const newCompletion = updated.completionPercentage;
    
    const milestones = [25, 50, 75, 90, 100];
    for (const milestone of milestones) {
      if (previousCompletion < milestone && newCompletion >= milestone) {
        await this.trackEvent(videoId, userId, {
          type: 'play',
          timestamp: updated.lastWatchedTime,
          value: { milestone, completionRate: newCompletion }
        });
      }
    }
  }

  async getProgress(videoId: string, userId: string): Promise<WatchProgress | null> {
    const key = `${videoId}-${userId}`;
    return this.progress.get(key) || null;
  }

  async getEngagementMetrics(videoId: string, timeRange?: { start: Date; end: Date }): Promise<EngagementMetrics> {
    const analytics = this.analytics.get(videoId) || [];
    const filteredAnalytics = timeRange 
      ? analytics.filter(a => a.timestamp >= timeRange.start && a.timestamp <= timeRange.end)
      : analytics;

    const uniqueViewers = new Set(filteredAnalytics.map(a => a.userId)).size;
    const totalViews = filteredAnalytics.filter(a => a.event.type === 'play').length;
    
    const watchTimes = Array.from(this.progress.values())
      .filter(p => p.videoId === videoId)
      .map(p => p.totalWatchTime);
    
    const averageWatchTime = watchTimes.length > 0 
      ? watchTimes.reduce((sum, time) => sum + time, 0) / watchTimes.length 
      : 0;

    const completions = Array.from(this.progress.values())
      .filter(p => p.videoId === videoId && p.completionPercentage >= 95);
    
    const completionRate = watchTimes.length > 0 ? completions.length / watchTimes.length : 0;

    const dropOffPoints = await this.getDropOffAnalysis(videoId);
    const replaySegments = await this.getReplayAnalysis(videoId);
    
    const interactionEvents = filteredAnalytics.filter(a => 
      ['quiz_start', 'annotation_click', 'chapter_change'].includes(a.event.type)
    );
    const interactionRate = totalViews > 0 ? interactionEvents.length / totalViews : 0;

    const quizPerformance = await this.getQuizPerformanceMetrics(videoId);
    const deviceBreakdown = this.getDeviceBreakdown(filteredAnalytics);
    const geographicDistribution = this.getGeographicDistribution(filteredAnalytics);

    return {
      videoId,
      totalViews,
      uniqueViewers,
      averageWatchTime,
      completionRate,
      dropOffPoints,
      replaySegments,
      interactionRate,
      quizPerformance,
      deviceBreakdown,
      geographicDistribution
    };
  }

  async getDropOffAnalysis(videoId: string): Promise<DropOffPoint[]> {
    const analytics = this.analytics.get(videoId) || [];
    const exitEvents = analytics.filter(a => a.event.type === 'exit' || a.event.type === 'pause');
    
    const dropOffMap = new Map<number, number>();
    const totalViewers = new Set(analytics.map(a => a.userId)).size;

    exitEvents.forEach(event => {
      const timestamp = Math.floor(event.event.timestamp / 10) * 10; // 10-second buckets
      dropOffMap.set(timestamp, (dropOffMap.get(timestamp) || 0) + 1);
    });

    const dropOffPoints: DropOffPoint[] = [];
    let remainingViewers = totalViewers;

    Array.from(dropOffMap.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([timestamp, dropOffs]) => {
        remainingViewers -= dropOffs;
        dropOffPoints.push({
          timestamp,
          dropOffRate: totalViewers > 0 ? dropOffs / totalViewers : 0,
          viewersRemaining: remainingViewers,
          commonExitReasons: ['user_navigation', 'content_complete', 'technical_issue']
        });
      });

    return dropOffPoints;
  }

  async getReplayAnalysis(videoId: string): Promise<ReplaySegment[]> {
    const analytics = this.analytics.get(videoId) || [];
    const seekEvents = analytics.filter(a => a.event.type === 'seek');
    
    const replayMap = new Map<string, number>();
    
    seekEvents.forEach(event => {
      const currentTime = event.event.timestamp;
      const seekTo = event.event.value?.seekTo || 0;
      
      if (seekTo < currentTime) { // Backward seek indicates replay
        const segmentKey = `${Math.floor(seekTo / 30)}-${Math.floor(currentTime / 30)}`; // 30-second segments
        replayMap.set(segmentKey, (replayMap.get(segmentKey) || 0) + 1);
      }
    });

    const replaySegments: ReplaySegment[] = [];
    replayMap.forEach((count, segmentKey) => {
      const [start, end] = segmentKey.split('-').map(Number);
      replaySegments.push({
        startTime: start * 30,
        endTime: end * 30,
        replayCount: count,
        averageReplays: count / new Set(seekEvents.map(e => e.userId)).size
      });
    });

    return replaySegments.sort((a, b) => b.replayCount - a.replayCount);
  }

  async getQuizPerformanceMetrics(videoId: string): Promise<QuizPerformanceMetrics> {
    const progressEntries = Array.from(this.progress.values()).filter(p => p.videoId === videoId);
    const allAttempts = progressEntries.flatMap(p => p.quizAttempts);

    if (allAttempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        questionAnalytics: []
      };
    }

    const totalAttempts = allAttempts.length;
    const averageScore = allAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts;
    const passRate = allAttempts.filter(attempt => attempt.score >= 70).length / totalAttempts;

    return {
      totalAttempts,
      averageScore,
      passRate,
      questionAnalytics: [] // Simplified for this implementation
    };
  }

  async generateReport(videoId: string, format: 'json' | 'csv' | 'pdf'): Promise<string> {
    const metrics = await this.getEngagementMetrics(videoId);
    
    switch (format) {
      case 'json':
        return JSON.stringify(metrics, null, 2);
      
      case 'csv':
        const csvHeaders = 'Metric,Value\n';
        const csvData = [
          `Total Views,${metrics.totalViews}`,
          `Unique Viewers,${metrics.uniqueViewers}`,
          `Average Watch Time,${metrics.averageWatchTime}`,
          `Completion Rate,${(metrics.completionRate * 100).toFixed(2)}%`,
          `Interaction Rate,${(metrics.interactionRate * 100).toFixed(2)}%`
        ].join('\n');
        return csvHeaders + csvData;
      
      case 'pdf':
        // In a real implementation, you'd use a PDF library
        return `PDF Report for Video ${videoId}\n${JSON.stringify(metrics, null, 2)}`;
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const toFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    // Group by videoId
    toFlush.forEach(analytics => {
      const existing = this.analytics.get(analytics.videoId) || [];
      existing.push(analytics);
      this.analytics.set(analytics.videoId, existing);
    });
  }

  private createDefaultProgress(videoId: string, userId: string): WatchProgress {
    return {
      videoId,
      userId,
      totalWatchTime: 0,
      completionPercentage: 0,
      lastWatchedTime: 0,
      watchedSegments: [],
      quizAttempts: [],
      annotationInteractions: [],
      updatedAt: new Date()
    };
  }

  private getSessionId(userId: string): string {
    // Simple session ID generation
    return `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getConnectionType(): string {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      return (navigator as any).connection?.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  private getDeviceType(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      return /ipad/i.test(userAgent) ? 'tablet' : 'mobile';
    }
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private async getLocation(): Promise<string> {
    // In a real implementation, you'd use IP geolocation or GPS
    return 'unknown';
  }

  private getDeviceBreakdown(analytics: VideoAnalytics[]): DeviceMetrics {
    const devices = { desktop: 0, mobile: 0, tablet: 0, tv: 0, unknown: 0 };
    
    analytics.forEach(a => {
      const deviceType = a.data.deviceType as keyof DeviceMetrics;
      if (deviceType in devices) {
        devices[deviceType]++;
      } else {
        devices.unknown++;
      }
    });

    return devices;
  }

  private getGeographicDistribution(analytics: VideoAnalytics[]): GeographicMetrics {
    const geo: GeographicMetrics = {};
    
    analytics.forEach(a => {
      const location = a.data.location || 'unknown';
      if (!geo[location]) {
        geo[location] = { views: 0, watchTime: 0, completionRate: 0 };
      }
      geo[location].views++;
    });

    return geo;
  }
}
