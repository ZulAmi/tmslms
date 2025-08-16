import {
  createSSGWSGClient,
  createCacheService,
  createErrorHandler,
  createDataTransformationService,
  DEFAULT_CONFIG,
} from '@tmslms/ssg-wsg-integration';
import Redis from 'ioredis';

// Configuration interfaces
interface ApiConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string[];
  environment: 'production' | 'sandbox';
  timeout: number;
  retryAttempts: number;
  rateLimitRpm: number;
  rateLimitRph: number;
}

interface CacheConfig {
  defaultTTL: number;
  maxTTL: number;
  keyPrefix: string;
  namespace: string;
}

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// Environment configuration
const getSSGWSGConfig = (): ApiConfig => ({
  baseUrl:
    process.env.SSG_WSG_API_BASE_URL || 'https://sandbox-api.ssg-wsg.gov.sg',
  clientId: process.env.SSG_WSG_CLIENT_ID!,
  clientSecret: process.env.SSG_WSG_CLIENT_SECRET!,
  scope: ['read', 'write'],
  environment:
    (process.env.SSG_WSG_ENVIRONMENT as 'production' | 'sandbox') || 'sandbox',
  timeout: parseInt(process.env.API_REQUEST_TIMEOUT || '30000'),
  retryAttempts: 3,
  rateLimitRpm: parseInt(process.env.RATE_LIMIT_RPM || '60'),
  rateLimitRph: parseInt(process.env.RATE_LIMIT_RPH || '1000'),
});

const getCacheConfig = (): CacheConfig => ({
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'),
  maxTTL: parseInt(process.env.CACHE_MAX_TTL || '86400'),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'tmslms:ssg-wsg:',
  namespace: process.env.CACHE_NAMESPACE || 'tmslms_ssg_wsg',
});

const getRetryConfig = (): RetryConfig => ({
  maxAttempts: 5,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
});

// Redis client configuration
const createRedisClient = () => {
  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
};

// Service initialization
let ssgwsgClient: ReturnType<typeof createSSGWSGClient> | null = null;
let cacheService: ReturnType<typeof createCacheService> | null = null;
let errorHandler: ReturnType<typeof createErrorHandler> | null = null;
let transformationService: ReturnType<
  typeof createDataTransformationService
> | null = null;
let redisClient: Redis | null = null;

export const initializeSSGWSGServices = async () => {
  try {
    // Validate required environment variables
    if (!process.env.SSG_WSG_CLIENT_ID || !process.env.SSG_WSG_CLIENT_SECRET) {
      throw new Error('SSG-WSG client credentials are required');
    }

    // Initialize Redis client
    redisClient = createRedisClient();
    await redisClient.connect();

    // Initialize services
    const apiConfig = getSSGWSGConfig();
    const cacheConfig = getCacheConfig();
    const retryConfig = getRetryConfig();

    errorHandler = createErrorHandler(retryConfig);
    cacheService = createCacheService(redisClient, cacheConfig);
    transformationService = createDataTransformationService();
    ssgwsgClient = createSSGWSGClient(apiConfig, redisClient);

    // Initialize the client
    await ssgwsgClient.initialize();

    console.log('SSG-WSG services initialized successfully');

    return {
      client: ssgwsgClient,
      cache: cacheService,
      errorHandler,
      transformer: transformationService,
      redis: redisClient,
    };
  } catch (error) {
    console.error('Failed to initialize SSG-WSG services:', error);
    throw error;
  }
};

export const getSSGWSGServices = () => {
  if (
    !ssgwsgClient ||
    !cacheService ||
    !errorHandler ||
    !transformationService
  ) {
    throw new Error(
      'SSG-WSG services not initialized. Call initializeSSGWSGServices() first.'
    );
  }

  return {
    client: ssgwsgClient,
    cache: cacheService,
    errorHandler,
    transformer: transformationService,
    redis: redisClient!,
  };
};

export const cleanupSSGWSGServices = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
    }

    ssgwsgClient = null;
    cacheService = null;
    errorHandler = null;
    transformationService = null;
    redisClient = null;

    console.log('SSG-WSG services cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up SSG-WSG services:', error);
  }
};

// Health check function
export const checkSSGWSGHealth = async () => {
  try {
    const services = getSSGWSGServices();

    const health = {
      timestamp: new Date().toISOString(),
      api: services.client.getHealthStatus(),
      cache: services.cache.getStatistics(),
      errors: services.errorHandler.getMetrics(),
      redis: redisClient?.status || 'unknown',
    };

    return {
      healthy: health.api.isAuthenticated && health.redis === 'ready',
      details: health,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export default {
  initializeSSGWSGServices,
  getSSGWSGServices,
  cleanupSSGWSGServices,
  checkSSGWSGHealth,
};
