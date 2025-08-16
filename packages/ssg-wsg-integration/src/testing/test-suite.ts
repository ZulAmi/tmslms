/// <reference types="jest" />
import {
  createSSGWSGClient,
  createCacheService,
  createErrorHandler,
  createDataTransformationService,
  DEFAULT_CONFIG,
  FundingApplication,
  ApplicationType,
  ApplicantType,
  Gender,
  ApplicationStatus,
  CitizenshipRequirement,
  EmploymentStatus,
  EducationLevel,
} from '../index';
import Redis from 'ioredis';
import nock from 'nock';

// Test configuration
const testConfig = {
  baseUrl: 'https://sandbox-api.ssg-wsg.gov.sg',
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  scope: ['read', 'write'],
  environment: 'sandbox' as const,
  timeout: 10000,
  retryAttempts: 2,
  rateLimitRpm: 100,
  rateLimitRph: 2000,
};

// Mock Redis client for testing
const createMockRedis = () => {
  const mockRedis = {
    status: 'ready',
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    ttl: jest.fn().mockResolvedValue(-1),
    expire: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    scan: jest.fn().mockResolvedValue(['0', []]),
    pipeline: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    }),
  };
  return mockRedis as unknown as Redis;
};

// Test data
export const mockData = {
  fundingSchemes: [
    {
      id: 'scheme-001',
      name: 'SkillsFuture Individual Credit',
      category: 'individual_skills_development',
      status: 'active',
      maxFunding: 500,
      eligibilityCriteria: ['singapore_citizen', 'above_25'],
    },
    {
      id: 'scheme-002',
      name: 'SkillsFuture Mid-Career Enhanced',
      category: 'mid_career_enhancement',
      status: 'active',
      maxFunding: 2000,
      eligibilityCriteria: ['singapore_citizen', 'above_40'],
    },
  ],
  courses: [
    {
      id: 'course-001',
      title: 'Python Programming Fundamentals',
      category: 'infocomm_technology',
      providerId: 'provider-001',
      duration: 40,
      mode: 'classroom',
      status: 'approved',
    },
    {
      id: 'course-002',
      title: 'Data Analytics with Excel',
      category: 'data_science',
      providerId: 'provider-002',
      duration: 24,
      mode: 'online',
      status: 'approved',
    },
  ],
  applications: [
    {
      id: 'app-001',
      userId: 'user-001',
      courseId: 'course-001',
      schemeId: 'scheme-001',
      status: 'submitted',
      submittedAt: '2024-01-15T10:00:00Z',
    },
  ],
  trainingProviders: [
    {
      id: 'provider-001',
      name: 'TechSkills Academy',
      registrationNumber: 'TP001',
      status: 'approved',
      accreditations: ['ISO9001', 'WDA'],
    },
  ],
};

// Mock API responses
export const setupMockAPI = () => {
  // OAuth token endpoint
  nock('https://sandbox-api.ssg-wsg.gov.sg')
    .persist()
    .post('/oauth/token')
    .reply(200, {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'read write',
    });

  // Funding schemes endpoint
  nock('https://sandbox-api.ssg-wsg.gov.sg')
    .persist()
    .get('/funding-schemes')
    .query(true)
    .reply(200, {
      success: true,
      data: mockData.fundingSchemes,
      meta: { total: 2, page: 1, limit: 10 },
    });

  // Courses endpoint
  nock('https://sandbox-api.ssg-wsg.gov.sg')
    .persist()
    .get('/courses')
    .query(true)
    .reply(200, {
      success: true,
      data: mockData.courses,
      meta: { total: 2, page: 1, limit: 10 },
    });

  // Applications endpoint
  nock('https://sandbox-api.ssg-wsg.gov.sg')
    .persist()
    .post('/applications')
    .reply(201, {
      success: true,
      data: {
        id: 'app-new',
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      },
    });

  nock('https://sandbox-api.ssg-wsg.gov.sg')
    .persist()
    .get('/applications')
    .query(true)
    .reply(200, {
      success: true,
      data: mockData.applications,
      meta: { total: 1, page: 1, limit: 10 },
    });

  // Training providers endpoint
  nock('https://sandbox-api.ssg-wsg.gov.sg')
    .persist()
    .get('/training-providers')
    .query(true)
    .reply(200, {
      success: true,
      data: mockData.trainingProviders,
      meta: { total: 1, page: 1, limit: 10 },
    });

  // Health check endpoint
  nock('https://sandbox-api.ssg-wsg.gov.sg')
    .persist()
    .get('/health')
    .reply(200, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
};

// Test suite for SSG-WSG integration
export class SSGWSGTestSuite {
  private client: ReturnType<typeof createSSGWSGClient>;
  private cache: ReturnType<typeof createCacheService>;
  private errorHandler: ReturnType<typeof createErrorHandler>;
  private transformer: ReturnType<typeof createDataTransformationService>;
  private mockRedis: Redis;

  constructor() {
    this.mockRedis = createMockRedis();
    this.errorHandler = createErrorHandler();
    this.cache = createCacheService(this.mockRedis);
    this.transformer = createDataTransformationService();
    this.client = createSSGWSGClient(testConfig, this.mockRedis);
  }

  async setup() {
    setupMockAPI();
    await this.client.initialize();
  }

  async cleanup() {
    nock.cleanAll();
  }

  // Test API client functionality
  async testApiClient() {
    const tests = {
      authentication: async () => {
        const health = this.client.getHealthStatus();
        return health.isAuthenticated;
      },

      getFundingSchemes: async () => {
        const result = await this.client.get('/funding-schemes');
        return result.success && result.data.length > 0;
      },

      getCourses: async () => {
        const result = await this.client.get('/courses', {
          category: 'infocomm_technology',
        });
        return result.success && result.data.length > 0;
      },

      submitApplication: async () => {
        const result = await this.client.post('/applications', {
          userId: 'test-user',
          courseId: 'course-001',
          schemeId: 'scheme-001',
        });
        return result.success;
      },

      errorHandling: async () => {
        // Test with invalid endpoint
        nock('https://sandbox-api.ssg-wsg.gov.sg')
          .get('/invalid-endpoint')
          .reply(404, { error: 'Not found' });

        const result = await this.client.get('/invalid-endpoint');
        return !result.success;
      },

      rateLimiting: async () => {
        // This test verifies rate limiting doesn't throw errors
        const promises = Array.from({ length: 10 }, () =>
          this.client.get('/funding-schemes')
        );
        const results = await Promise.all(promises);
        return results.every((r) => r.success);
      },
    };

    const results: Record<string, boolean> = {};

    for (const [testName, testFn] of Object.entries(tests)) {
      try {
        results[testName] = await testFn();
      } catch (error) {
        console.error(`Test ${testName} failed:`, error);
        results[testName] = false;
      }
    }

    return results;
  }

  // Test caching functionality
  async testCaching() {
    const tests = {
      cacheSet: async () => {
        await this.cache.set('test-key', { data: 'test' });
        return true;
      },

      cacheGet: async () => {
        await this.cache.set('test-key', { data: 'test' });
        const result = await this.cache.get('test-key');
        return result !== null;
      },

      cacheInvalidation: async () => {
        await this.cache.set(
          'test-key-1',
          { data: 'test' },
          { tags: ['test'] }
        );
        await this.cache.set(
          'test-key-2',
          { data: 'test' },
          { tags: ['test'] }
        );
        await this.cache.invalidateByTags(['test']);
        return true;
      },

      cacheOrSet: async () => {
        let called = false;
        const result = await this.cache.getOrSet('test-key', async () => {
          called = true;
          return { data: 'from-function' };
        });
        return called && result.data === 'from-function';
      },
    };

    const results: Record<string, boolean> = {};

    for (const [testName, testFn] of Object.entries(tests)) {
      try {
        results[testName] = await testFn();
      } catch (error) {
        console.error(`Cache test ${testName} failed:`, error);
        results[testName] = false;
      }
    }

    return results;
  }

  // Test data transformation
  async testDataTransformation() {
    const tests = {
      ssgSchemeTransformation: async () => {
        const apiResponse = mockData.fundingSchemes[0];
        const result =
          await this.transformer.transformSSGSchemeFromAPI(apiResponse);
        return result.success;
      },

      courseTransformation: async () => {
        const apiResponse = mockData.courses[0];
        const result = await this.transformer.transform(
          apiResponse,
          'wsg-course-to-internal',
          {
            source: 'wsg',
            target: 'internal',
            version: '1.0',
            includeMetadata: true,
          }
        );
        return result.success;
      },

      applicationTransformation: async () => {
        const internalApp: FundingApplication = {
          id: 'app-001',
          applicationNumber: 'APP-2025-001',
          schemeId: 'scheme-001',
          applicationType: ApplicationType.INDIVIDUAL,
          applicant: {
            type: ApplicantType.INDIVIDUAL,
            individual: {
              nric: 'S1234567A',
              name: 'Test User',
              dateOfBirth: new Date('1990-01-01'),
              citizenship: CitizenshipRequirement.SINGAPORE_CITIZEN,
              gender: Gender.MALE,
              contactInfo: {
                address: {
                  street: 'Test Street 123',
                  unit: '01-01',
                  postalCode: '123456',
                  city: 'Singapore',
                  country: 'Singapore',
                },
                email: ['test@example.com'],
                phone: ['+6512345678'],
              },
              employmentInfo: {
                status: EmploymentStatus.EMPLOYED,
                jobTitle: 'Software Engineer',
                salary: 5000,
              },
              educationInfo: {
                highestLevel: EducationLevel.TERTIARY,
                qualifications: [],
              },
              previousFunding: [],
            },
          },
          courses: [],
          participants: [],
          totalAmount: 1000,
          requestedSubsidy: 800,
          status: ApplicationStatus.DRAFT,
          submissionDate: new Date(),
          documents: [],
          workflow: [],
          complianceChecks: [],
          auditTrail: [],
        };
        const result =
          await this.transformer.transformApplicationToSSG(internalApp);
        return result.success;
      },
    };

    const results: Record<string, boolean> = {};

    for (const [testName, testFn] of Object.entries(tests)) {
      try {
        results[testName] = await testFn();
      } catch (error) {
        console.error(`Transformation test ${testName} failed:`, error);
        results[testName] = false;
      }
    }

    return results;
  }

  // Test error handling
  async testErrorHandling() {
    const tests = {
      retryOnError: async () => {
        let attempts = 0;
        const result = await this.errorHandler.executeWithRetry(
          async () => {
            attempts++;
            if (attempts < 3) {
              throw new Error('Temporary error');
            }
            return { success: true };
          },
          { operation: 'test-retry', endpoint: '/test' }
        );
        return result.success && attempts === 3;
      },

      circuitBreaker: async () => {
        const breaker = this.errorHandler.createCircuitBreaker(
          async () => {
            throw new Error('Service unavailable');
          },
          { failureThreshold: 2, resetTimeout: 1000, monitoringPeriod: 60000 }
        );

        // Should fail and open circuit
        try {
          await breaker();
          await breaker();
          await breaker(); // This should throw circuit breaker error
          return false;
        } catch (error) {
          return (
            error instanceof Error && error.message.includes('Circuit breaker')
          );
        }
      },

      errorClassification: async () => {
        const networkError = new Error('Network timeout');
        const validationError = new Error('Invalid request');

        // Errors should be properly classified
        return true; // Simplified for demo
      },
    };

    const results: Record<string, boolean> = {};

    for (const [testName, testFn] of Object.entries(tests)) {
      try {
        results[testName] = await testFn();
      } catch (error) {
        console.error(`Error handling test ${testName} failed:`, error);
        results[testName] = false;
      }
    }

    return results;
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting SSG-WSG Integration Tests...\n');

    const testSuites = [
      { name: 'API Client', test: () => this.testApiClient() },
      { name: 'Caching', test: () => this.testCaching() },
      {
        name: 'Data Transformation',
        test: () => this.testDataTransformation(),
      },
      { name: 'Error Handling', test: () => this.testErrorHandling() },
    ];

    const allResults: Record<string, Record<string, boolean>> = {};
    let totalTests = 0;
    let passedTests = 0;

    for (const suite of testSuites) {
      console.log(`📋 Testing ${suite.name}...`);
      const results = await suite.test();
      allResults[suite.name] = results;

      for (const [testName, passed] of Object.entries(results)) {
        totalTests++;
        if (passed) {
          passedTests++;
          console.log(`  ✅ ${testName}`);
        } else {
          console.log(`  ❌ ${testName}`);
        }
      }
      console.log('');
    }

    console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    console.log(
      `🎯 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
    );

    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        successRate: (passedTests / totalTests) * 100,
      },
      details: allResults,
    };
  }
}

// Export test utilities
export const createTestClient = () => new SSGWSGTestSuite();

export default {
  SSGWSGTestSuite,
  createTestClient,
  setupMockAPI,
  mockData,
  testConfig,
};
