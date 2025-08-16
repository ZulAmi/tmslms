import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// Monitoring configuration
interface MonitoringConfig {
  metricsPort: number;
  healthCheckInterval: number;
  alertThresholds: {
    errorRate: number;
    responseTime: number;
    cacheHitRate: number;
    queueDepth: number;
  };
  webhookUrl?: string;
  enableSlackAlerts: boolean;
  enableEmailAlerts: boolean;
}

// Metric types
interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
}

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  source: string;
  metadata: Record<string, any>;
}

// Performance metrics
interface PerformanceMetrics {
  apiCalls: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
    percentiles: {
      p50: number;
      p95: number;
      p99: number;
    };
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    averageResponseTime: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    byEndpoint: Record<string, number>;
  };
  system: {
    memoryUsage: number;
    cpuUsage: number;
    uptime: number;
  };
}

export class SSGWSGMonitoringService extends EventEmitter {
  private config: MonitoringConfig;
  private metrics: Map<string, Metric[]> = new Map();
  private alerts: Alert[] = [];
  private isRunning = false;
  private healthCheckTimer?: NodeJS.Timeout;
  private responseTimes: number[] = [];
  private startTime = Date.now();

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;
  }

  // Start monitoring
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log(
      `🔍 SSG-WSG Monitoring started on port ${this.config.metricsPort}`
    );

    // Start periodic health checks
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);

    // Start metrics server if needed
    if (this.config.metricsPort > 0) {
      this.startMetricsServer();
    }

    this.emit('monitoring:started');
  }

  // Stop monitoring
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    console.log('🔍 SSG-WSG Monitoring stopped');
    this.emit('monitoring:stopped');
  }

  // Record a metric
  recordMetric(name: string, value: number, tags: Record<string, string> = {}) {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricArray = this.metrics.get(name)!;
    metricArray.push(metric);

    // Keep only last 1000 metrics per type
    if (metricArray.length > 1000) {
      metricArray.shift();
    }

    // Check for threshold violations
    this.checkThresholds(name, value, tags);

    this.emit('metric:recorded', metric);
  }

  // Record API call metrics
  recordApiCall(
    endpoint: string,
    method: string,
    responseTime: number,
    success: boolean
  ) {
    this.responseTimes.push(responseTime);

    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }

    this.recordMetric('api_call_duration', responseTime, {
      endpoint,
      method,
      status: success ? 'success' : 'error',
    });

    this.recordMetric('api_call_count', 1, {
      endpoint,
      method,
      status: success ? 'success' : 'error',
    });

    // Check response time threshold
    if (responseTime > this.config.alertThresholds.responseTime) {
      this.createAlert(
        'warning',
        'High Response Time',
        `API call to ${endpoint} took ${responseTime}ms`,
        'api',
        {
          endpoint,
          method,
          responseTime,
        }
      );
    }
  }

  // Record cache metrics
  recordCacheOperation(
    operation: 'hit' | 'miss',
    key: string,
    responseTime: number
  ) {
    this.recordMetric('cache_operation', 1, {
      operation,
      key_pattern: this.getKeyPattern(key),
    });

    this.recordMetric('cache_response_time', responseTime, {
      operation,
    });
  }

  // Record error
  recordError(error: Error, context: Record<string, any> = {}) {
    this.recordMetric('error_count', 1, {
      error_type: error.constructor.name,
      endpoint: context.endpoint || 'unknown',
    });

    this.createAlert('error', 'API Error', error.message, 'error', {
      error: error.constructor.name,
      stack: error.stack,
      ...context,
    });
  }

  // Create alert
  private createAlert(
    level: Alert['level'],
    title: string,
    message: string,
    source: string,
    metadata: Record<string, any> = {}
  ) {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      title,
      message,
      timestamp: Date.now(),
      source,
      metadata,
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    console.log(`🚨 [${level.toUpperCase()}] ${title}: ${message}`);

    // Send alert to webhook if configured
    if (this.config.webhookUrl) {
      this.sendWebhookAlert(alert);
    }

    this.emit('alert:created', alert);
  }

  // Get current performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // API metrics
    const apiCalls = this.getMetricsSince('api_call_count', fiveMinutesAgo);
    const successfulCalls = apiCalls.filter(
      (m) => m.tags.status === 'success'
    ).length;
    const failedCalls = apiCalls.filter(
      (m) => m.tags.status === 'error'
    ).length;
    const totalCalls = successfulCalls + failedCalls;

    // Response times
    const recentResponseTimes = this.responseTimes.slice(-100);
    const sortedTimes = [...recentResponseTimes].sort((a, b) => a - b);

    // Cache metrics
    const cacheHits = this.getMetricsSince(
      'cache_operation',
      fiveMinutesAgo
    ).filter((m) => m.tags.operation === 'hit').length;
    const cacheMisses = this.getMetricsSince(
      'cache_operation',
      fiveMinutesAgo
    ).filter((m) => m.tags.operation === 'miss').length;
    const totalCacheOps = cacheHits + cacheMisses;

    // Error metrics
    const errors = this.getMetricsSince('error_count', fiveMinutesAgo);
    const errorsByType: Record<string, number> = {};
    const errorsByEndpoint: Record<string, number> = {};

    errors.forEach((error) => {
      const type = error.tags.error_type || 'unknown';
      const endpoint = error.tags.endpoint || 'unknown';
      errorsByType[type] = (errorsByType[type] || 0) + 1;
      errorsByEndpoint[endpoint] = (errorsByEndpoint[endpoint] || 0) + 1;
    });

    return {
      apiCalls: {
        total: totalCalls,
        successful: successfulCalls,
        failed: failedCalls,
        averageResponseTime:
          recentResponseTimes.length > 0
            ? recentResponseTimes.reduce((a, b) => a + b, 0) /
              recentResponseTimes.length
            : 0,
        percentiles: {
          p50: sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0,
          p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0,
          p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0,
        },
      },
      cache: {
        hits: cacheHits,
        misses: cacheMisses,
        hitRate: totalCacheOps > 0 ? (cacheHits / totalCacheOps) * 100 : 0,
        averageResponseTime: 0, // Would need cache response time tracking
      },
      errors: {
        total: errors.length,
        byType: errorsByType,
        byEndpoint: errorsByEndpoint,
      },
      system: {
        memoryUsage: process.memoryUsage().heapUsed,
        cpuUsage: 0, // Would need CPU monitoring
        uptime: now - this.startTime,
      },
    };
  }

  // Get health status
  getHealthStatus() {
    const metrics = this.getPerformanceMetrics();
    const now = Date.now();
    const recentAlerts = this.alerts.filter(
      (a) => now - a.timestamp < 5 * 60 * 1000
    );

    const criticalAlerts = recentAlerts.filter((a) => a.level === 'critical');
    const errorAlerts = recentAlerts.filter((a) => a.level === 'error');

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (
      errorAlerts.length > 0 ||
      metrics.apiCalls.failed > metrics.apiCalls.successful
    ) {
      status = 'warning';
    }

    return {
      status,
      timestamp: now,
      uptime: metrics.system.uptime,
      metrics,
      recentAlerts: recentAlerts.slice(-10),
      checks: {
        apiConnectivity: metrics.apiCalls.total > 0,
        errorRate:
          metrics.apiCalls.total > 0
            ? (metrics.apiCalls.failed / metrics.apiCalls.total) * 100
            : 0,
        cacheHealth: true, // Would implement actual cache health check
        memoryUsage: metrics.system.memoryUsage,
      },
    };
  }

  // Get metrics dashboard data
  getDashboardData() {
    const health = this.getHealthStatus();
    const metrics = this.getPerformanceMetrics();

    return {
      health,
      metrics,
      charts: {
        responseTimes: this.getChartData('api_call_duration', 60), // Last hour
        errorRates: this.getChartData('error_count', 60),
        cacheHitRates: this.getCacheHitRateChart(60),
        apiCallVolume: this.getChartData('api_call_count', 60),
      },
      alerts: this.alerts.slice(-20), // Last 20 alerts
    };
  }

  // Private helper methods
  private getMetricsSince(name: string, since: number): Metric[] {
    const metrics = this.metrics.get(name) || [];
    return metrics.filter((m) => m.timestamp >= since);
  }

  private getKeyPattern(key: string): string {
    // Extract pattern from cache key (e.g., "user:123" -> "user:*")
    return key.replace(/:\d+/g, ':*').replace(/:[a-f0-9-]{36}/g, ':*');
  }

  private checkThresholds(
    name: string,
    value: number,
    tags: Record<string, string>
  ) {
    // Implement threshold checking logic
    if (name === 'error_count' && value > 0) {
      const recentErrors = this.getMetricsSince(
        'error_count',
        Date.now() - 60000
      );
      const errorRate = recentErrors.length;

      if (errorRate > this.config.alertThresholds.errorRate) {
        this.createAlert(
          'warning',
          'High Error Rate',
          `Error rate of ${errorRate} errors/minute exceeded threshold`,
          'errors'
        );
      }
    }
  }

  private async sendWebhookAlert(alert: Alert) {
    try {
      if (!this.config.webhookUrl) return;

      const payload = {
        alert,
        service: 'SSG-WSG Integration',
        timestamp: new Date().toISOString(),
      };

      // In a real implementation, you'd send this to your webhook endpoint
      console.log('📤 Sending webhook alert:', payload);
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  private performHealthCheck() {
    const health = this.getHealthStatus();

    if (health.status === 'critical') {
      this.createAlert(
        'critical',
        'System Health Critical',
        'Multiple critical issues detected',
        'health',
        health
      );
    } else if (health.status === 'warning') {
      this.createAlert(
        'warning',
        'System Health Warning',
        'Performance issues detected',
        'health',
        health
      );
    }

    this.emit('health:checked', health);
  }

  private startMetricsServer() {
    // In a real implementation, you'd start an HTTP server to expose metrics
    console.log(
      `📊 Metrics server would start on port ${this.config.metricsPort}`
    );
    console.log('📈 Metrics available at /metrics endpoint');
    console.log('🏥 Health check available at /health endpoint');
  }

  private getChartData(metricName: string, minutes: number) {
    const since = Date.now() - minutes * 60 * 1000;
    const metrics = this.getMetricsSince(metricName, since);

    // Group by minute
    const grouped: Record<string, number> = {};
    metrics.forEach((metric) => {
      const minute = Math.floor(metric.timestamp / 60000) * 60000;
      grouped[minute] = (grouped[minute] || 0) + metric.value;
    });

    return Object.entries(grouped)
      .map(([timestamp, value]) => ({
        timestamp: parseInt(timestamp),
        value,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  private getCacheHitRateChart(minutes: number) {
    const since = Date.now() - minutes * 60 * 1000;
    const cacheMetrics = this.getMetricsSince('cache_operation', since);

    // Group by minute and calculate hit rate
    const grouped: Record<string, { hits: number; total: number }> = {};

    cacheMetrics.forEach((metric) => {
      const minute = Math.floor(metric.timestamp / 60000) * 60000;
      if (!grouped[minute]) {
        grouped[minute] = { hits: 0, total: 0 };
      }
      grouped[minute].total += 1;
      if (metric.tags.operation === 'hit') {
        grouped[minute].hits += 1;
      }
    });

    return Object.entries(grouped)
      .map(([timestamp, data]) => ({
        timestamp: parseInt(timestamp),
        value: data.total > 0 ? (data.hits / data.total) * 100 : 0,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }
}

// Create monitoring service instance
export const createMonitoringService = (config: MonitoringConfig) => {
  return new SSGWSGMonitoringService(config);
};

// Default monitoring configuration
export const defaultMonitoringConfig: MonitoringConfig = {
  metricsPort: parseInt(process.env.METRICS_PORT || '9090'),
  healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
  alertThresholds: {
    errorRate: parseInt(process.env.ALERT_ERROR_RATE || '5'),
    responseTime: parseInt(process.env.ALERT_RESPONSE_TIME || '5000'),
    cacheHitRate: parseInt(process.env.ALERT_CACHE_HIT_RATE || '80'),
    queueDepth: parseInt(process.env.ALERT_QUEUE_DEPTH || '100'),
  },
  webhookUrl: process.env.ALERT_WEBHOOK_URL,
  enableSlackAlerts: process.env.ENABLE_SLACK_ALERTS === 'true',
  enableEmailAlerts: process.env.ENABLE_EMAIL_ALERTS === 'true',
};

export default {
  SSGWSGMonitoringService,
  createMonitoringService,
  defaultMonitoringConfig,
};
