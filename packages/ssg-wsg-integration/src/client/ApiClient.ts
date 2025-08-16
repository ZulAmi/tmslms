/**
 * SSG-WSG API Client
 * Centralized HTTP client with OAuth 2.0 authentication, rate limiting, and error handling
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import retry from 'retry';
import pino from 'pino';
import crypto from 'crypto';
import {
  ApiConfig,
  ApiResponse,
  ApiError,
  OAuthToken,
  TokenValidation,
  SecurityHeaders,
  SystemEvent,
  SystemEventType,
  HealthStatus,
} from '../types';

export class SSGWSGApiClient {
  private readonly config: ApiConfig;
  private readonly httpClient: AxiosInstance;
  private readonly logger: pino.Logger;
  private readonly redis: Redis;
  private readonly rateLimiter: RateLimiterRedis;
  private readonly requestRateLimiter: RateLimiterRedis;

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private readonly tokenRefreshLock = new Map<string, Promise<OAuthToken>>();

  private healthStatus: HealthStatus = HealthStatus.UNKNOWN;
  private lastHealthCheck: Date = new Date();
  private consecutiveFailures = 0;
  private readonly maxConsecutiveFailures = 5;

  constructor(config: ApiConfig, redisClient: Redis, logger?: pino.Logger) {
    this.config = config;
    this.redis = redisClient;
    this.logger = logger || pino({ name: 'ssg-wsg-api-client' });

    // Initialize rate limiters
    this.rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'ssg_wsg_rate_limit',
      points: config.rateLimitRpm,
      duration: 60, // per minute
      blockDuration: 60,
    });

    this.requestRateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'ssg_wsg_request_limit',
      points: config.rateLimitRph,
      duration: 3600, // per hour
      blockDuration: 300,
    });

    // Initialize HTTP client
    this.httpClient = this.createHttpClient();

    // Start health monitoring
    this.startHealthMonitoring();

    this.logger.info('SSG-WSG API Client initialized', {
      baseUrl: config.baseUrl,
      environment: config.environment,
    });
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Initialize the client with authentication
   */
  public async initialize(): Promise<void> {
    try {
      await this.authenticate();
      this.healthStatus = HealthStatus.HEALTHY;
      this.consecutiveFailures = 0;

      this.logger.info('SSG-WSG API Client initialized successfully');
    } catch (error) {
      this.healthStatus = HealthStatus.UNHEALTHY;
      this.consecutiveFailures++;

      this.logger.error('Failed to initialize SSG-WSG API Client', { error });
      throw error;
    }
  }

  /**
   * Get client health status
   */
  public getHealthStatus(): {
    status: HealthStatus;
    lastCheck: Date;
    consecutiveFailures: number;
    isAuthenticated: boolean;
    tokenExpiresIn?: number;
  } {
    return {
      status: this.healthStatus,
      lastCheck: this.lastHealthCheck,
      consecutiveFailures: this.consecutiveFailures,
      isAuthenticated: this.isAuthenticated(),
      tokenExpiresIn: this.getTokenExpiresIn(),
    };
  }

  /**
   * Perform a GET request
   */
  public async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, params, options);
  }

  /**
   * Perform a POST request
   */
  public async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, undefined, options);
  }

  /**
   * Perform a PUT request
   */
  public async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, undefined, options);
  }

  /**
   * Perform a PATCH request
   */
  public async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, data, undefined, options);
  }

  /**
   * Perform a DELETE request
   */
  public async delete<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      'DELETE',
      endpoint,
      undefined,
      undefined,
      options
    );
  }

  /**
   * Upload a file
   */
  public async uploadFile<T = any>(
    endpoint: string,
    file: Buffer | Blob,
    filename: string,
    additionalData?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(
      'file',
      file instanceof Buffer ? new Blob([file]) : file,
      filename
    );

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(
          key,
          typeof value === 'string' ? value : JSON.stringify(value)
        );
      });
    }

    return this.makeRequest<T>('POST', endpoint, formData, undefined, {
      ...options,
      headers: {
        ...options?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Download a file
   */
  public async downloadFile(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<{ data: Buffer; headers: Record<string, string> }> {
    const response = await this.makeRawRequest(
      'GET',
      endpoint,
      undefined,
      params,
      {
        ...options,
        responseType: 'arraybuffer',
      }
    );

    return {
      data: Buffer.from(response.data),
      headers: response.headers as Record<string, string>,
    };
  }

  /**
   * Get paginated results
   */
  public async getPaginated<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestOptions & { autoFetch?: boolean }
  ): Promise<ApiResponse<T[]>> {
    const { autoFetch = false, ...requestOptions } = options || {};

    let allData: T[] = [];
    let currentPage = params?.page || 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.get<T[]>(
        endpoint,
        {
          ...params,
          page: currentPage,
        },
        requestOptions
      );

      if (response.success && response.data) {
        allData = allData.concat(response.data);

        if (!autoFetch || !response.pagination?.hasNextPage) {
          return {
            ...response,
            data: allData,
            pagination: response.pagination,
          };
        }

        currentPage++;
        hasMore = response.pagination?.hasNextPage || false;
      } else {
        return response as ApiResponse<T[]>;
      }
    }

    return {
      success: true,
      data: allData,
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Invalidate authentication tokens
   */
  public async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await this.revokeToken(this.accessToken);
      }
    } catch (error) {
      this.logger.warn('Failed to revoke token during logout', { error });
    }

    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;

    await this.redis.del([
      'ssg_wsg_access_token',
      'ssg_wsg_refresh_token',
      'ssg_wsg_token_expires_at',
    ]);

    this.logger.info('Successfully logged out');
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private createHttpClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': `TMSLMS-SSG-WSG-Client/1.0.0 (${this.config.environment})`,
      },
    });

    // Request interceptor
    client.interceptors.request.use(
      async (config) => {
        // Add security headers
        Object.assign(config.headers, this.generateSecurityHeaders());

        // Add authentication if available
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        // Log request
        this.logger.debug('Making API request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: this.sanitizeHeaders(config.headers),
        });

        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error', { error });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    client.interceptors.response.use(
      (response) => {
        this.consecutiveFailures = 0;
        this.healthStatus = HealthStatus.HEALTHY;

        this.logger.debug('API response received', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          responseTime: this.calculateResponseTime(response),
        });

        return response;
      },
      async (error: AxiosError) => {
        this.consecutiveFailures++;

        if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
          this.healthStatus = HealthStatus.UNHEALTHY;
        } else {
          this.healthStatus = HealthStatus.DEGRADED;
        }

        // Handle token expiration
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            // Retry the original request
            return client.request(error.config!);
          } catch (refreshError) {
            this.logger.error('Token refresh failed', { refreshError });
            await this.logout();
          }
        }

        this.logger.error('API response error', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });

        return Promise.reject(error);
      }
    );

    return client;
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      // Check rate limits
      await this.checkRateLimits();

      // Ensure authentication
      await this.ensureAuthenticated();

      // Make the raw request
      const response = await this.makeRawRequest(
        method,
        endpoint,
        data,
        params,
        options
      );

      // Transform response
      return this.transformResponse<T>(response);
    } catch (error) {
      return this.handleRequestError<T>(error, method, endpoint);
    }
  }

  private async makeRawRequest(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<AxiosResponse> {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data,
      params,
      ...options,
      headers: {
        ...options?.headers,
      },
    };

    // Apply retry logic
    return new Promise((resolve, reject) => {
      const operation = retry.operation({
        retries: options?.retries || this.config.retryAttempts,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 10000,
        randomize: true,
      });

      operation.attempt(async (currentAttempt) => {
        try {
          const response = await this.httpClient.request(config);
          resolve(response);
        } catch (error: any) {
          if (this.isRetryableError(error) && operation.retry(error)) {
            this.logger.warn(
              `Request attempt ${currentAttempt} failed, retrying`,
              {
                error: error.message,
                endpoint,
                method,
              }
            );
            return;
          }
          reject(operation.mainError() || error);
        }
      });
    });
  }

  private transformResponse<T>(response: AxiosResponse): ApiResponse<T> {
    const requestId = response.headers['x-request-id'] || crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Handle different response formats
    if (response.data && typeof response.data === 'object') {
      // If response already follows our API format
      if ('success' in response.data && 'data' in response.data) {
        return {
          ...response.data,
          requestId,
          timestamp,
        };
      }

      // Transform standard response
      return {
        success: true,
        data: response.data,
        requestId,
        timestamp,
        meta: {
          version: response.headers['api-version'] || '1.0',
          processingTime: this.calculateResponseTime(response),
          rateLimitRemaining:
            parseInt(response.headers['x-ratelimit-remaining']) || 0,
          rateLimitReset: new Date(
            response.headers['x-ratelimit-reset'] || Date.now()
          ),
        },
      };
    }

    return {
      success: true,
      data: response.data,
      requestId,
      timestamp,
    };
  }

  private handleRequestError<T>(
    error: any,
    method: string,
    endpoint: string
  ): ApiResponse<T> {
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    let apiErrors: ApiError[] = [];
    let message = 'Request failed';

    if (error.response) {
      // HTTP error response
      const { status, statusText, data } = error.response;

      message = `HTTP ${status}: ${statusText}`;

      if (data && typeof data === 'object') {
        if (data.errors && Array.isArray(data.errors)) {
          apiErrors = data.errors;
        } else if (data.error) {
          apiErrors = [
            {
              code: data.error.code || `HTTP_${status}`,
              message: data.error.message || statusText,
              details: data.error.details,
            },
          ];
        } else {
          apiErrors = [
            {
              code: `HTTP_${status}`,
              message: data.message || statusText,
              details: data,
            },
          ];
        }
      } else {
        apiErrors = [
          {
            code: `HTTP_${status}`,
            message: statusText,
          },
        ];
      }
    } else if (error.request) {
      // Network error
      message = 'Network error';
      apiErrors = [
        {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network request failed',
        },
      ];
    } else {
      // Other error
      message = error.message || 'Unknown error';
      apiErrors = [
        {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'An unknown error occurred',
        },
      ];
    }

    // Log error event
    this.emitEvent({
      id: requestId,
      type: SystemEventType.ERROR_EVENT,
      source: 'ssg-wsg-api-client',
      data: {
        method,
        endpoint,
        error: error.message,
        stack: error.stack,
      },
      timestamp: new Date(),
    });

    return {
      success: false,
      data: null as any,
      message,
      errors: apiErrors,
      requestId,
      timestamp,
    };
  }

  private async checkRateLimits(): Promise<void> {
    try {
      await Promise.all([
        this.rateLimiter.consume('api-client'),
        this.requestRateLimiter.consume('api-client'),
      ]);
    } catch (rateLimitError: any) {
      const resetTime = new Date(Date.now() + rateLimitError.msBeforeNext);

      this.logger.warn('Rate limit exceeded', {
        resetTime,
        remainingPoints: rateLimitError.remainingPoints,
      });

      throw new Error(
        `Rate limit exceeded. Reset at: ${resetTime.toISOString()}`
      );
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated()) {
      if (this.refreshToken) {
        await this.refreshAccessToken();
      } else {
        await this.authenticate();
      }
    }
  }

  private isAuthenticated(): boolean {
    return !!(
      this.accessToken &&
      this.tokenExpiresAt &&
      this.tokenExpiresAt > new Date(Date.now() + 60000) // 1 minute buffer
    );
  }

  private getTokenExpiresIn(): number | undefined {
    if (!this.tokenExpiresAt) return undefined;
    return Math.max(
      0,
      Math.floor((this.tokenExpiresAt.getTime() - Date.now()) / 1000)
    );
  }

  private async authenticate(): Promise<OAuthToken> {
    const lockKey = 'authenticate';

    if (this.tokenRefreshLock.has(lockKey)) {
      return this.tokenRefreshLock.get(lockKey)!;
    }

    const authPromise = this.performAuthentication();
    this.tokenRefreshLock.set(lockKey, authPromise);

    try {
      const token = await authPromise;
      this.setTokens(token);
      return token;
    } finally {
      this.tokenRefreshLock.delete(lockKey);
    }
  }

  private async performAuthentication(): Promise<OAuthToken> {
    try {
      // Try to load existing tokens from cache
      const cachedToken = await this.loadCachedTokens();
      if (cachedToken && this.isTokenValid(cachedToken)) {
        return cachedToken;
      }

      // Perform OAuth 2.0 client credentials flow
      const response = await axios.post(
        `${this.config.baseUrl}/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: this.config.scope.join(' '),
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: this.config.timeout,
        }
      );

      const tokenData = response.data;
      const token: OAuthToken = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: 'Bearer',
        expiresIn: tokenData.expires_in,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        scope: tokenData.scope ? tokenData.scope.split(' ') : this.config.scope,
        issuedAt: new Date(),
      };

      // Cache the tokens
      await this.cacheTokens(token);

      this.logger.info('Authentication successful', {
        expiresAt: token.expiresAt,
        scope: token.scope,
      });

      return token;
    } catch (error: any) {
      this.logger.error('Authentication failed', { error });
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  private async refreshAccessToken(): Promise<OAuthToken> {
    const lockKey = 'refresh';

    if (this.tokenRefreshLock.has(lockKey)) {
      return this.tokenRefreshLock.get(lockKey)!;
    }

    const refreshPromise = this.performTokenRefresh();
    this.tokenRefreshLock.set(lockKey, refreshPromise);

    try {
      const token = await refreshPromise;
      this.setTokens(token);
      return token;
    } finally {
      this.tokenRefreshLock.delete(lockKey);
    }
  }

  private async performTokenRefresh(): Promise<OAuthToken> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/oauth/token`,
        {
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: this.config.timeout,
        }
      );

      const tokenData = response.data;
      const token: OAuthToken = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || this.refreshToken,
        tokenType: 'Bearer',
        expiresIn: tokenData.expires_in,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        scope: tokenData.scope ? tokenData.scope.split(' ') : this.config.scope,
        issuedAt: new Date(),
      };

      // Cache the new tokens
      await this.cacheTokens(token);

      this.logger.info('Token refresh successful', {
        expiresAt: token.expiresAt,
      });

      return token;
    } catch (error: any) {
      this.logger.error('Token refresh failed', { error });
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  private async revokeToken(token: string): Promise<void> {
    try {
      await axios.post(
        `${this.config.baseUrl}/oauth/revoke`,
        {
          token,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: this.config.timeout,
        }
      );
    } catch (error: any) {
      this.logger.warn('Token revocation failed', { error });
      // Don't throw here as this is best effort
    }
  }

  private setTokens(token: OAuthToken): void {
    this.accessToken = token.accessToken;
    this.refreshToken = token.refreshToken;
    this.tokenExpiresAt = token.expiresAt;
  }

  private async loadCachedTokens(): Promise<OAuthToken | null> {
    try {
      const [accessToken, refreshToken, expiresAt] = await this.redis.mget([
        'ssg_wsg_access_token',
        'ssg_wsg_refresh_token',
        'ssg_wsg_token_expires_at',
      ]);

      if (accessToken && refreshToken && expiresAt) {
        return {
          accessToken,
          refreshToken,
          tokenType: 'Bearer',
          expiresIn: Math.floor(
            (new Date(expiresAt).getTime() - Date.now()) / 1000
          ),
          expiresAt: new Date(expiresAt),
          scope: this.config.scope,
          issuedAt: new Date(Date.now() - 3600000), // Assume issued 1 hour ago
        };
      }
    } catch (error) {
      this.logger.warn('Failed to load cached tokens', { error });
    }

    return null;
  }

  private async cacheTokens(token: OAuthToken): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      pipeline.setex(
        'ssg_wsg_access_token',
        token.expiresIn,
        token.accessToken
      );
      pipeline.setex(
        'ssg_wsg_refresh_token',
        token.expiresIn * 2,
        token.refreshToken
      );
      pipeline.setex(
        'ssg_wsg_token_expires_at',
        token.expiresIn,
        token.expiresAt.toISOString()
      );
      await pipeline.exec();
    } catch (error) {
      this.logger.warn('Failed to cache tokens', { error });
    }
  }

  private isTokenValid(token: OAuthToken): boolean {
    return token.expiresAt > new Date(Date.now() + 60000); // 1 minute buffer
  }

  private generateSecurityHeaders(): SecurityHeaders {
    const timestamp = new Date().toISOString();
    const requestId = crypto.randomUUID();

    return {
      'X-Request-ID': requestId,
      'X-Client-Version': '1.0.0',
      'X-Timestamp': timestamp,
    };
  }

  private sanitizeHeaders(headers: any): Record<string, any> {
    const sanitized = { ...headers };

    // Remove sensitive headers from logs
    const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie'];
    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private calculateResponseTime(response: AxiosResponse): number {
    const startTime = (response.config as any).metadata?.startTime;
    return startTime ? Date.now() - startTime : 0;
  }

  private isRetryableError(error: any): boolean {
    // Network errors
    if (!error.response) return true;

    // Server errors (5xx)
    if (error.response.status >= 500) return true;

    // Rate limiting (429)
    if (error.response.status === 429) return true;

    // Specific retryable errors
    const retryableCodes = [408, 502, 503, 504];
    return retryableCodes.includes(error.response.status);
  }

  private emitEvent(event: SystemEvent): void {
    // Emit to event system (would integrate with event bus)
    this.logger.debug('System event emitted', event);
  }

  private startHealthMonitoring(): void {
    setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        this.logger.error('Health check failed', { error });
      }
    }, 60000); // Every minute
  }

  private async performHealthCheck(): Promise<void> {
    this.lastHealthCheck = new Date();

    try {
      // Simple ping to health endpoint
      await this.httpClient.get('/health', { timeout: 5000 });

      if (this.consecutiveFailures > 0) {
        this.consecutiveFailures = Math.max(0, this.consecutiveFailures - 1);
      }

      if (this.consecutiveFailures === 0) {
        this.healthStatus = HealthStatus.HEALTHY;
      } else if (this.consecutiveFailures < this.maxConsecutiveFailures / 2) {
        this.healthStatus = HealthStatus.DEGRADED;
      }
    } catch (error) {
      this.consecutiveFailures++;

      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        this.healthStatus = HealthStatus.UNHEALTHY;
      } else {
        this.healthStatus = HealthStatus.DEGRADED;
      }
    }
  }
}

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RequestOptions extends AxiosRequestConfig {
  retries?: number;
  skipAuth?: boolean;
  skipRateLimit?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a configured SSG-WSG API client instance
 */
export function createSSGWSGClient(
  config: ApiConfig,
  redisClient: Redis,
  logger?: pino.Logger
): SSGWSGApiClient {
  return new SSGWSGApiClient(config, redisClient, logger);
}

/**
 * Validate API configuration
 */
export function validateApiConfig(config: Partial<ApiConfig>): ApiConfig {
  const required = ['baseUrl', 'clientId', 'clientSecret'];
  const missing = required.filter((key) => !config[key as keyof ApiConfig]);

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }

  return {
    baseUrl: config.baseUrl!,
    clientId: config.clientId!,
    clientSecret: config.clientSecret!,
    scope: config.scope || ['read', 'write'],
    environment: config.environment || 'sandbox',
    timeout: config.timeout || 30000,
    retryAttempts: config.retryAttempts || 3,
    rateLimitRpm: config.rateLimitRpm || 60,
    rateLimitRph: config.rateLimitRph || 1000,
  };
}
