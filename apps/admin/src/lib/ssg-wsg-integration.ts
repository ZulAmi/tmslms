import { NextRequest, NextResponse } from 'next/server';

// Mock services interface for development
interface MockServices {
  client: {
    getHealthStatus: () => { isAuthenticated: boolean };
    get: (
      path: string,
      params?: any
    ) => Promise<{ success: boolean; data: any }>;
    post: (path: string, data: any) => Promise<{ success: boolean; data: any }>;
  };
  cache: {
    getStatistics: () => any;
    getOrSet: (
      key: string,
      fn: () => Promise<any>,
      options?: any
    ) => Promise<any>;
    set: (key: string, data: any, options?: any) => Promise<void>;
    invalidateByTags: (tags: string[]) => Promise<void>;
  };
  errorHandler: {
    getMetrics: () => any;
    executeWithRetry: (
      fn: () => Promise<any>,
      options: any
    ) => Promise<{ success: boolean; result?: any; error?: any }>;
  };
  transformer: {
    transformList: (
      data: any,
      type: string,
      context: any
    ) => Promise<{ success: boolean; data: any }>;
    transformApplicationToSSG: (
      data: any
    ) => Promise<{ success: boolean; data: any }>;
  };
  redis: {
    status: string;
  };
}

// Mock implementation for development
const mockServices: MockServices = {
  client: {
    getHealthStatus: () => ({ isAuthenticated: true }),
    get: async (path, params) => {
      console.log(`[ADMIN MOCK] GET ${path}`, params);
      return { success: true, data: [] };
    },
    post: async (path, data) => {
      console.log(`[ADMIN MOCK] POST ${path}`, data);
      return { success: true, data: { id: 'mock-id', ...data } };
    },
  },
  cache: {
    getStatistics: () => ({ hits: 80, misses: 12, hitRate: 87.0 }),
    getOrSet: async (key, fn, options) => {
      console.log(`[ADMIN MOCK] Cache getOrSet: ${key}`);
      return await fn();
    },
    set: async (key, data, options) => {
      console.log(`[ADMIN MOCK] Cache set: ${key}`);
    },
    invalidateByTags: async (tags) => {
      console.log(`[ADMIN MOCK] Cache invalidate tags: ${tags.join(', ')}`);
    },
  },
  errorHandler: {
    getMetrics: () => ({ totalErrors: 0, errorRate: 0 }),
    executeWithRetry: async (fn, options) => {
      try {
        const result = await fn();
        return { success: true, result };
      } catch (error) {
        console.error('[ADMIN MOCK] Error in retry handler:', error);
        return { success: false, error };
      }
    },
  },
  transformer: {
    transformList: async (data, type, context) => {
      console.log(`[ADMIN MOCK] Transform list: ${type}`);
      return { success: true, data };
    },
    transformApplicationToSSG: async (data) => {
      console.log('[ADMIN MOCK] Transform application to SSG');
      return { success: true, data };
    },
  },
  redis: {
    status: 'ready',
  },
};

// Initialize services (mock implementation)
let servicesInitialized = false;

export async function initializeApp() {
  if (!servicesInitialized) {
    try {
      console.log('Admin app: Initializing SSG-WSG services (mock mode)');
      servicesInitialized = true;
    } catch (error) {
      console.error('Admin app: Failed to initialize SSG-WSG services:', error);
      throw error;
    }
  }
}

export const getSSGWSG = () => {
  return mockServices;
};

// API route helper for SSG-WSG integration
export function withSSGWSG<T = any>(
  handler: (
    req: NextRequest,
    services: MockServices
  ) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    try {
      if (!servicesInitialized) {
        await initializeApp();
      }

      const services = getSSGWSG();
      return await handler(req, services);
    } catch (error) {
      console.error('SSG-WSG API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ) as NextResponse<T>;
    }
  };
}

// Admin-specific SSG-WSG functions
export const adminSSGWSG = {
  // Get system-wide analytics
  async getSystemAnalytics(timeframe: string = '30d') {
    const { client, cache } = getSSGWSG();

    const cacheKey = `admin:analytics:${timeframe}`;

    const result = await cache.getOrSet(
      cacheKey,
      async () => {
        const analytics = await client.get('/admin/analytics', {
          timeframe,
          includeMetrics: true,
        });

        return analytics.data;
      },
      { ttl: 3600, tags: ['admin', 'analytics'] }
    );

    return result;
  },

  // Manage funding schemes
  async manageFundingSchemes(
    action: 'approve' | 'reject' | 'suspend',
    schemeId: string,
    reason?: string
  ) {
    const { client, cache, errorHandler } = getSSGWSG();

    return errorHandler.executeWithRetry(
      async () => {
        const result = await client.post(
          `/admin/funding-schemes/${schemeId}/${action}`,
          {
            reason,
            timestamp: new Date().toISOString(),
          }
        );

        // Invalidate related caches
        if (result.success) {
          await cache.invalidateByTags(['funding-schemes', 'admin']);
        }

        return result;
      },
      {
        operation: 'manageFundingSchemes',
        endpoint: `/admin/funding-schemes/${schemeId}/${action}`,
      }
    );
  },
};

// Health check function
export const checkSSGWSGHealth = async () => {
  try {
    const services = getSSGWSG();

    const health = {
      timestamp: new Date().toISOString(),
      api: services.client.getHealthStatus(),
      cache: services.cache.getStatistics(),
      errors: services.errorHandler.getMetrics(),
      redis: services.redis?.status || 'unknown',
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
  initializeApp,
  getSSGWSG,
  withSSGWSG,
  adminSSGWSG,
  checkSSGWSGHealth,
};
