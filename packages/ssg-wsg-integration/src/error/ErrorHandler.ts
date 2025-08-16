/**
 * Comprehensive Error Handling Service
 * Provides exponential backoff retry, error classification, and recovery strategies
 */

import { EventEmitter } from 'events';
import { ApiError, SystemEvent, SystemEventType, LogLevel } from '../types';

export interface ErrorContext {
  operation: string;
  endpoint?: string;
  method?: string;
  requestId?: string;
  userId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: ErrorType[];
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  averageRetryAttempts: number;
  lastErrorTime: Date;
  errorRate: number; // errors per minute
}

export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  VALIDATION = 'validation',
  SERVER_ERROR = 'server_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
  BUSINESS_LOGIC = 'business_logic',
  CONFIGURATION = 'configuration',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  isRetryable: boolean;
  isTransient: boolean;
  code: string;
  message: string;
  details?: any;
  suggestions?: string[];
}

export interface RetryAttempt {
  attemptNumber: number;
  delay: number;
  timestamp: Date;
  error: Error;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: RetryAttempt[];
  totalDuration: number;
}

export class ErrorHandler extends EventEmitter {
  private readonly retryConfig: RetryConfig;
  private readonly metrics: ErrorMetrics;
  private readonly errorPatterns: Map<RegExp, ErrorInfo>;

  constructor(retryConfig?: Partial<RetryConfig>) {
    super();

    this.retryConfig = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      retryableErrors: [
        ErrorType.NETWORK,
        ErrorType.TIMEOUT,
        ErrorType.SERVER_ERROR,
        ErrorType.RATE_LIMIT,
      ],
      ...retryConfig,
    };

    this.metrics = {
      totalErrors: 0,
      errorsByType: {},
      errorsByEndpoint: {},
      averageRetryAttempts: 0,
      lastErrorTime: new Date(),
      errorRate: 0,
    };

    this.errorPatterns = this.initializeErrorPatterns();
    this.startMetricsTracking();
  }

  /**
   * Execute an operation with retry logic and error handling
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    retryConfig?: Partial<RetryConfig>
  ): Promise<RetryResult<T>> {
    const config = { ...this.retryConfig, ...retryConfig };
    const attempts: RetryAttempt[] = [];
    const startTime = Date.now();

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();

        // Success - emit success event if there were previous attempts
        if (attempts.length > 0) {
          this.emitEvent({
            id: context.requestId || this.generateId(),
            type: SystemEventType.SYSTEM_ACTION,
            source: 'error-handler',
            data: {
              operation: context.operation,
              attemptsRequired: attempt,
              totalDuration: Date.now() - startTime,
            },
            timestamp: new Date(),
            correlationId: context.correlationId,
            userId: context.userId,
          });
        }

        return {
          success: true,
          result,
          attempts,
          totalDuration: Date.now() - startTime,
        };
      } catch (error: any) {
        const errorInfo = this.classifyError(error);
        const attemptInfo: RetryAttempt = {
          attemptNumber: attempt,
          delay: 0,
          timestamp: new Date(),
          error,
        };

        attempts.push(attemptInfo);
        this.updateMetrics(errorInfo, context);

        // Emit error event
        this.emitErrorEvent(error, errorInfo, context, attempt);

        // Check if we should retry
        if (
          attempt >= config.maxAttempts ||
          !this.shouldRetry(errorInfo, config)
        ) {
          return {
            success: false,
            error,
            attempts,
            totalDuration: Date.now() - startTime,
          };
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, config);
        attemptInfo.delay = delay;

        // Wait before retry
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    return {
      success: false,
      error: new Error('Maximum retry attempts exceeded'),
      attempts,
      totalDuration: Date.now() - startTime,
    };
  }

  /**
   * Handle errors without retry logic
   */
  handleError(error: any, context: ErrorContext): ErrorInfo {
    const errorInfo = this.classifyError(error);
    this.updateMetrics(errorInfo, context);
    this.emitErrorEvent(error, errorInfo, context, 1);
    return errorInfo;
  }

  /**
   * Classify an error and provide handling information
   */
  classifyError(error: any): ErrorInfo {
    // Check for specific error patterns
    for (const [pattern, info] of this.errorPatterns.entries()) {
      if (pattern.test(error.message || error.toString())) {
        return {
          ...info,
          details: this.extractErrorDetails(error),
        };
      }
    }

    // Check by error properties
    if (error.code) {
      switch (error.code) {
        case 'ENOTFOUND':
        case 'ECONNREFUSED':
        case 'ETIMEDOUT':
        case 'ECONNRESET':
          return {
            type: ErrorType.NETWORK,
            severity: ErrorSeverity.HIGH,
            isRetryable: true,
            isTransient: true,
            code: error.code,
            message: 'Network connectivity error',
            suggestions: [
              'Check network connectivity',
              'Verify endpoint URL',
              'Check firewall settings',
            ],
          };
      }
    }

    // Check by HTTP status code
    if (error.response?.status) {
      const status = error.response.status;

      if (status === 401) {
        return {
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.HIGH,
          isRetryable: false,
          isTransient: false,
          code: 'AUTH_FAILED',
          message: 'Authentication failed',
          suggestions: [
            'Check API credentials',
            'Verify token expiration',
            'Refresh authentication token',
          ],
        };
      }

      if (status === 403) {
        return {
          type: ErrorType.AUTHORIZATION,
          severity: ErrorSeverity.HIGH,
          isRetryable: false,
          isTransient: false,
          code: 'ACCESS_DENIED',
          message: 'Access denied',
          suggestions: [
            'Check user permissions',
            'Verify API scope',
            'Contact administrator',
          ],
        };
      }

      if (status === 429) {
        return {
          type: ErrorType.RATE_LIMIT,
          severity: ErrorSeverity.MEDIUM,
          isRetryable: true,
          isTransient: true,
          code: 'RATE_LIMITED',
          message: 'Rate limit exceeded',
          suggestions: [
            'Reduce request frequency',
            'Implement exponential backoff',
            'Check rate limit headers',
          ],
        };
      }

      if (status >= 400 && status < 500) {
        return {
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          isRetryable: false,
          isTransient: false,
          code: `CLIENT_ERROR_${status}`,
          message: 'Client error',
          suggestions: [
            'Check request parameters',
            'Validate request format',
            'Review API documentation',
          ],
        };
      }

      if (status >= 500) {
        return {
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.HIGH,
          isRetryable: true,
          isTransient: true,
          code: `SERVER_ERROR_${status}`,
          message: 'Server error',
          suggestions: [
            'Retry the request',
            'Check service status',
            'Contact support if persists',
          ],
        };
      }
    }

    // Default classification
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      isRetryable: false,
      isTransient: false,
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      details: this.extractErrorDetails(error),
      suggestions: [
        'Check error details',
        'Review operation logs',
        'Contact support if needed',
      ],
    };
  }

  /**
   * Get current error metrics
   */
  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset error metrics
   */
  resetMetrics(): void {
    this.metrics.totalErrors = 0;
    this.metrics.errorsByType = {};
    this.metrics.errorsByEndpoint = {};
    this.metrics.averageRetryAttempts = 0;
    this.metrics.errorRate = 0;
  }

  /**
   * Create a circuit breaker pattern implementation
   */
  createCircuitBreaker<T>(
    operation: () => Promise<T>,
    options: {
      failureThreshold: number;
      resetTimeout: number;
      monitoringPeriod: number;
    }
  ): () => Promise<T> {
    let failures = 0;
    let lastFailureTime = 0;
    let state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    return async (): Promise<T> => {
      const now = Date.now();

      // Check if we should reset after timeout
      if (state === 'OPEN' && now - lastFailureTime >= options.resetTimeout) {
        state = 'HALF_OPEN';
        failures = 0;
      }

      // Reject if circuit is open
      if (state === 'OPEN') {
        throw new Error('Circuit breaker is OPEN');
      }

      try {
        const result = await operation();

        // Success - reset circuit
        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
        }
        failures = 0;

        return result;
      } catch (error) {
        failures++;
        lastFailureTime = now;

        // Trip circuit if threshold exceeded
        if (failures >= options.failureThreshold) {
          state = 'OPEN';
        }

        throw error;
      }
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeErrorPatterns(): Map<RegExp, ErrorInfo> {
    const patterns = new Map<RegExp, ErrorInfo>();

    // Network errors
    patterns.set(/network error|net::|ENOTFOUND|ECONNREFUSED/i, {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      isRetryable: true,
      isTransient: true,
      code: 'NETWORK_ERROR',
      message: 'Network connectivity issue',
    });

    // Timeout errors
    patterns.set(/timeout|ETIMEDOUT/i, {
      type: ErrorType.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      isRetryable: true,
      isTransient: true,
      code: 'TIMEOUT_ERROR',
      message: 'Request timeout',
    });

    // Authentication errors
    patterns.set(/unauthorized|invalid token|expired token/i, {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      isRetryable: false,
      isTransient: false,
      code: 'AUTH_ERROR',
      message: 'Authentication error',
    });

    // Rate limiting
    patterns.set(/rate limit|too many requests/i, {
      type: ErrorType.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      isRetryable: true,
      isTransient: true,
      code: 'RATE_LIMIT_ERROR',
      message: 'Rate limit exceeded',
    });

    // Validation errors
    patterns.set(/validation|invalid parameter|bad request/i, {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      isRetryable: false,
      isTransient: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
    });

    return patterns;
  }

  private shouldRetry(errorInfo: ErrorInfo, config: RetryConfig): boolean {
    return (
      errorInfo.isRetryable && config.retryableErrors.includes(errorInfo.type)
    );
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    // Exponential backoff with jitter
    let delay = Math.min(
      config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
      config.maxDelay
    );

    // Add jitter to prevent thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private updateMetrics(errorInfo: ErrorInfo, context: ErrorContext): void {
    this.metrics.totalErrors++;
    this.metrics.lastErrorTime = new Date();

    // Update error counts by type
    const type = errorInfo.type;
    this.metrics.errorsByType[type] =
      (this.metrics.errorsByType[type] || 0) + 1;

    // Update error counts by endpoint
    if (context.endpoint) {
      const endpoint = context.endpoint;
      this.metrics.errorsByEndpoint[endpoint] =
        (this.metrics.errorsByEndpoint[endpoint] || 0) + 1;
    }

    // Calculate error rate (errors per minute)
    this.calculateErrorRate();
  }

  private calculateErrorRate(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // This is a simplified calculation
    // In a real implementation, you'd maintain a sliding window
    this.metrics.errorRate = this.metrics.totalErrors / 60; // rough approximation
  }

  private extractErrorDetails(error: any): Record<string, any> {
    const details: Record<string, any> = {};

    if (error.response) {
      details.status = error.response.status;
      details.statusText = error.response.statusText;
      details.headers = error.response.headers;
      details.data = error.response.data;
    }

    if (error.request) {
      details.url = error.request.url;
      details.method = error.request.method;
    }

    if (error.config) {
      details.timeout = error.config.timeout;
      details.baseURL = error.config.baseURL;
    }

    details.name = error.name;
    details.message = error.message;
    details.stack = error.stack;
    details.code = error.code;

    return details;
  }

  private emitErrorEvent(
    error: any,
    errorInfo: ErrorInfo,
    context: ErrorContext,
    attempt: number
  ): void {
    this.emit('error', {
      error,
      errorInfo,
      context,
      attempt,
      timestamp: new Date(),
    });

    this.emitEvent({
      id: context.requestId || this.generateId(),
      type: SystemEventType.ERROR_EVENT,
      source: 'error-handler',
      data: {
        operation: context.operation,
        errorType: errorInfo.type,
        errorCode: errorInfo.code,
        errorMessage: errorInfo.message,
        severity: errorInfo.severity,
        isRetryable: errorInfo.isRetryable,
        attempt,
        endpoint: context.endpoint,
        method: context.method,
      },
      timestamp: new Date(),
      correlationId: context.correlationId,
      userId: context.userId,
      metadata: {
        ...context.metadata,
        errorDetails: this.extractErrorDetails(error),
      },
    });
  }

  private emitEvent(event: SystemEvent): void {
    this.emit('systemEvent', event);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private startMetricsTracking(): void {
    // Update metrics every minute
    setInterval(() => {
      this.calculateErrorRate();
    }, 60000);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create an error handler instance with default configuration
 */
export function createErrorHandler(
  retryConfig?: Partial<RetryConfig>
): ErrorHandler {
  return new ErrorHandler(retryConfig);
}

/**
 * Create an API error from an HTTP response
 */
export function createApiError(response: any, context?: string): ApiError {
  const status = response?.status || 0;
  const statusText = response?.statusText || 'Unknown Error';
  const data = response?.data;

  let message = statusText;
  let code = `HTTP_${status}`;
  let details: any = undefined;

  if (data) {
    if (typeof data === 'object') {
      message = data.message || data.error || statusText;
      code = data.code || data.error_code || code;
      details = data.details || data;
    } else {
      message = String(data);
    }
  }

  if (context) {
    message = `${context}: ${message}`;
  }

  return {
    code,
    message,
    details,
  };
}

/**
 * Wrap a function with error handling and retry logic
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler: ErrorHandler,
  context: Omit<ErrorContext, 'requestId'>,
  retryConfig?: Partial<RetryConfig>
): T {
  return (async (...args: Parameters<T>) => {
    const requestId = Math.random().toString(36).substring(2);
    const fullContext: ErrorContext = { ...context, requestId };

    const result = await errorHandler.executeWithRetry(
      () => fn(...args),
      fullContext,
      retryConfig
    );

    if (result.success) {
      return result.result;
    } else {
      throw result.error;
    }
  }) as T;
}

/**
 * Create a delay function with exponential backoff
 */
export function createBackoffDelay(
  baseDelay = 1000,
  maxDelay = 30000,
  multiplier = 2,
  jitter = true
): (attempt: number) => number {
  return (attempt: number): number => {
    let delay = Math.min(
      baseDelay * Math.pow(multiplier, attempt - 1),
      maxDelay
    );

    if (jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  };
}
