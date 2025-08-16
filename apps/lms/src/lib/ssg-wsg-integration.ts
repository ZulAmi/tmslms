import { NextRequest, NextResponse } from 'next/server';

// Mock services interface for development
export interface MockServices {
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
      console.log(`[LMS MOCK] GET ${path}`, params);
      return { success: true, data: [] };
    },
    post: async (path, data) => {
      console.log(`[LMS MOCK] POST ${path}`, data);
      return { success: true, data: { id: 'mock-id', ...data } };
    },
  },
  cache: {
    getStatistics: () => ({ hits: 100, misses: 10, hitRate: 90.9 }),
    getOrSet: async (key, fn, options) => {
      console.log(`[LMS MOCK] Cache getOrSet: ${key}`);
      return await fn();
    },
    set: async (key, data, options) => {
      console.log(`[LMS MOCK] Cache set: ${key}`);
    },
  },
  errorHandler: {
    getMetrics: () => ({ totalErrors: 0, errorRate: 0 }),
    executeWithRetry: async (fn, options) => {
      try {
        const result = await fn();
        return { success: true, result };
      } catch (error) {
        console.error('[LMS MOCK] Error in retry handler:', error);
        return { success: false, error };
      }
    },
  },
  transformer: {
    transformList: async (data, type, context) => {
      console.log(`[LMS MOCK] Transform list: ${type}`);
      return { success: true, data };
    },
    transformApplicationToSSG: async (data) => {
      console.log('[LMS MOCK] Transform application to SSG');
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
      console.log('LMS app: Initializing SSG-WSG services (mock mode)');
      servicesInitialized = true;
    } catch (error) {
      console.error('LMS app: Failed to initialize SSG-WSG services:', error);
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

// LMS-specific SSG-WSG functions
export const lmsSSGWSG = {
  // Get available courses for learners
  async getAvailableCourses(
    userId: string,
    filters?: {
      category?: string;
      level?: string;
      duration?: string;
      mode?: string;
    }
  ) {
    const { client, cache, transformer } = getSSGWSG();

    const cacheKey = `lms:courses:${userId}:${JSON.stringify(filters || {})}`;

    const result = await cache.getOrSet(
      cacheKey,
      async () => {
        const courses = await client.get('/courses', {
          ...filters,
          eligible: true,
          available: true,
        });

        // Transform WSG course data to LMS format
        return transformer.transformList(courses.data, 'wsg-course-to-lms', {
          userId,
          context: 'course-catalog',
        });
      },
      { ttl: 1800, tags: ['lms', 'courses', `user:${userId}`] }
    );

    return result;
  },

  // Submit funding application for learner
  async submitFundingApplication(applicationData: {
    userId: string;
    courseId: string;
    schemeId: string;
    personalDetails: any;
    supportingDocuments: any[];
  }) {
    const { client, cache, errorHandler, transformer } = getSSGWSG();

    return errorHandler.executeWithRetry(
      async () => {
        // Transform application data to SSG format
        const transformResult =
          await transformer.transformApplicationToSSG(applicationData);

        if (!transformResult.success) {
          throw new Error('Data transformation failed');
        }

        const result = await client.post('/applications', transformResult.data);

        // Cache the submitted application
        if (result.success) {
          await cache.set(`lms:application:${result.data.id}`, result.data, {
            ttl: 86400,
            tags: ['lms', 'applications', `user:${applicationData.userId}`],
          });
        }

        return result;
      },
      { operation: 'submitFundingApplication', endpoint: '/applications' }
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
  lmsSSGWSG,
  checkSSGWSGHealth,
};
