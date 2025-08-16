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
    transformCertificateToSSG: (
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
      console.log(`[TMS MOCK] GET ${path}`, params);
      return { success: true, data: [] };
    },
    post: async (path, data) => {
      console.log(`[TMS MOCK] POST ${path}`, data);
      return { success: true, data: { id: 'mock-id', ...data } };
    },
  },
  cache: {
    getStatistics: () => ({ hits: 150, misses: 8, hitRate: 94.9 }),
    getOrSet: async (key, fn, options) => {
      console.log(`[TMS MOCK] Cache getOrSet: ${key}`);
      return await fn();
    },
    set: async (key, data, options) => {
      console.log(`[TMS MOCK] Cache set: ${key}`);
    },
  },
  errorHandler: {
    getMetrics: () => ({ totalErrors: 0, errorRate: 0 }),
    executeWithRetry: async (fn, options) => {
      try {
        const result = await fn();
        return { success: true, result };
      } catch (error) {
        console.error('[TMS MOCK] Error in retry handler:', error);
        return { success: false, error };
      }
    },
  },
  transformer: {
    transformList: async (data, type, context) => {
      console.log(`[TMS MOCK] Transform list: ${type}`);
      return { success: true, data };
    },
    transformCertificateToSSG: async (data) => {
      console.log('[TMS MOCK] Transform certificate to SSG');
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
      console.log('TMS app: Initializing SSG-WSG services (mock mode)');
      servicesInitialized = true;
    } catch (error) {
      console.error('TMS app: Failed to initialize SSG-WSG services:', error);
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

// TMS-specific SSG-WSG functions
export const tmsSSGWSG = {
  // Submit course for approval/registration
  async submitCourseForApproval(courseData: {
    courseId: string;
    providerId: string;
    title: string;
    description: string;
    category: string;
    duration: number;
    deliveryMode: string;
    objectives: string[];
    assessment: any;
    certification: any;
  }) {
    const { client, cache, errorHandler, transformer } = getSSGWSG();

    return errorHandler.executeWithRetry(
      async () => {
        // Transform course data to SSG format
        const transformResult = await transformer.transformList(
          [courseData],
          'tms-course-to-ssg',
          { operation: 'approval-submission' }
        );

        if (!transformResult.success) {
          throw new Error('Course data transformation failed');
        }

        const result = await client.post(
          '/courses/submissions',
          transformResult.data[0]
        );

        // Cache the submitted course
        if (result.success) {
          await cache.set(
            `tms:course-submission:${result.data.id}`,
            result.data,
            {
              ttl: 172800,
              tags: ['tms', 'submissions', `provider:${courseData.providerId}`],
            }
          );
        }

        return result;
      },
      { operation: 'submitCourseForApproval', endpoint: '/courses/submissions' }
    );
  },

  // Submit certificate for recognition
  async submitCertificateForRecognition(certificateData: {
    certificateId: string;
    providerId: string;
    title: string;
    issuingBody: string;
    validityPeriod: number;
    skillsFramework: string[];
    recognitionLevel: string;
    prerequisites: string[];
  }) {
    const { client, cache, errorHandler, transformer } = getSSGWSG();

    return errorHandler.executeWithRetry(
      async () => {
        // Transform certificate data to SSG format
        const transformResult =
          await transformer.transformCertificateToSSG(certificateData);

        if (!transformResult.success) {
          throw new Error('Certificate transformation failed');
        }

        const result = await client.post(
          '/certificates/submissions',
          transformResult.data
        );

        // Cache the submitted certificate
        if (result.success) {
          await cache.set(
            `tms:certificate-submission:${result.data.id}`,
            result.data,
            {
              ttl: 172800,
              tags: [
                'tms',
                'certificates',
                `provider:${certificateData.providerId}`,
              ],
            }
          );
        }

        return result;
      },
      {
        operation: 'submitCertificateForRecognition',
        endpoint: '/certificates/submissions',
      }
    );
  },

  // Get provider statistics
  async getProviderStatistics(providerId: string) {
    const { client, cache } = getSSGWSG();

    const cacheKey = `tms:provider-stats:${providerId}`;

    const result = await cache.getOrSet(
      cacheKey,
      async () => {
        const stats = await client.get(`/providers/${providerId}/statistics`, {
          includeMetrics: true,
          timeframe: '30d',
        });

        return stats.data;
      },
      { ttl: 3600, tags: ['tms', 'statistics', `provider:${providerId}`] }
    );

    return result;
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
  tmsSSGWSG,
  checkSSGWSGHealth,
};
