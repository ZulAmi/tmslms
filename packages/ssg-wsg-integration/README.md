# SSG-WSG API Integration Service Layer

A comprehensive, enterprise-grade integration service layer for Singapore's SSG (SkillsFuture Singapore) and WSG (Workforce Singapore) funding systems. This package provides robust API integration capabilities with advanced features including OAuth 2.0 authentication, rate limiting, caching, error handling, and data transformation.

## 🚀 Features

### Core Capabilities

- **Centralized HTTP Client**: OAuth 2.0 authentication with automatic token refresh
- **Rate Limiting**: Built-in rate limiting with Redis backend
- **Error Handling**: Comprehensive error handling with exponential backoff retry
- **Data Transformation**: Bi-directional data mapping between internal and API schemas
- **Caching Strategy**: Redis-based caching with TTL and intelligent invalidation
- **Performance Monitoring**: Real-time metrics and health monitoring
- **Security**: Token validation, signature verification, and audit trails

### API Coverage

- **SSG Funding Schemes API**: Complete funding scheme management
- **WSG Course Registry API**: Course and training provider integration
- **Application Management API**: Funding application lifecycle
- **Document Management API**: Secure document handling and validation

## 📦 Installation

```bash
npm install @tmslms/ssg-wsg-integration
```

## 🔧 Configuration

### Basic Setup

```typescript
import {
  createSSGWSGClient,
  createCacheService,
  createErrorHandler,
  createDataTransformationService,
} from '@tmslms/ssg-wsg-integration';

// API Configuration
const apiConfig = {
  baseUrl: 'https://api.ssg-wsg.gov.sg',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  scope: ['read', 'write'],
  environment: 'production', // or 'sandbox'
  timeout: 30000,
  retryAttempts: 3,
  rateLimitRpm: 60,
  rateLimitRph: 1000,
};

// Initialize services
const client = createSSGWSGClient(apiConfig, redisClient);
const cache = createCacheService(redisClient);
const errorHandler = createErrorHandler();
const transformer = createDataTransformationService();

// Initialize the client
await client.initialize();
```

### Environment Variables

```bash
# API Configuration
SSG_WSG_API_BASE_URL=https://api.ssg-wsg.gov.sg
SSG_WSG_CLIENT_ID=your-client-id
SSG_WSG_CLIENT_SECRET=your-client-secret
SSG_WSG_ENVIRONMENT=production

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Rate Limiting
RATE_LIMIT_RPM=60
RATE_LIMIT_RPH=1000

# Cache Configuration
CACHE_DEFAULT_TTL=3600
CACHE_MAX_TTL=86400
```

## 🛠 Usage Examples

### 1. API Client Usage

```typescript
import { SSGWSGApiClient } from '@tmslms/ssg-wsg-integration';

// GET request with caching
const schemes = await client.get<SSGFundingScheme[]>('/funding-schemes', {
  category: 'individual_skills_development',
  status: 'active',
});

// POST request with retry
const application = await client.post<FundingApplication>('/applications', {
  schemeId: 'scheme-123',
  applicantType: 'individual',
  // ... application data
});

// File upload
const document = await client.uploadFile(
  '/documents/upload',
  fileBuffer,
  'application.pdf',
  { documentType: 'identity' }
);

// Paginated requests
const courses = await client.getPaginated<WSGCourse[]>(
  '/courses',
  {
    category: 'infocomm_technology',
    page: 1,
    limit: 100,
  },
  { autoFetch: true }
); // Automatically fetch all pages
```

### 2. Error Handling

```typescript
import { ErrorHandler, withErrorHandling } from '@tmslms/ssg-wsg-integration';

const errorHandler = createErrorHandler({
  maxAttempts: 5,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
});

// Wrap function with error handling
const safeApiCall = withErrorHandling(
  async (id: string) => {
    return client.get(`/schemes/${id}`);
  },
  errorHandler,
  { operation: 'getScheme', endpoint: '/schemes/:id' }
);

// Execute with retry
const result = await errorHandler.executeWithRetry(
  () => client.post('/applications', applicationData),
  { operation: 'submitApplication', endpoint: '/applications' }
);

if (result.success) {
  console.log('Application submitted:', result.result);
} else {
  console.error('Failed after retries:', result.error);
}
```

### 3. Data Transformation

```typescript
import { DataTransformationService } from '@tmslms/ssg-wsg-integration';

const transformer = createDataTransformationService();

// Transform SSG API response to internal format
const schemeResult = await transformer.transformSSGSchemeFromAPI(apiResponse);
if (schemeResult.success) {
  const internalScheme: SSGFundingScheme = schemeResult.data;
}

// Transform internal application to SSG format
const apiResult =
  await transformer.transformApplicationToSSG(internalApplication);
if (apiResult.success) {
  const apiPayload = apiResult.data;
  await client.post('/applications', apiPayload);
}

// Custom transformation
const customResult = await transformer.transform<ApiCourse, InternalCourse>(
  apiCourse,
  'custom-course-mapping',
  {
    source: 'wsg',
    target: 'internal',
    version: '1.0',
    validateOutput: true,
  }
);
```

### 4. Caching

```typescript
import { CacheService, withCache } from '@tmslms/ssg-wsg-integration';

const cache = createCacheService(redisClient, {
  defaultTTL: 3600,
  keyPrefix: 'ssg_wsg',
  namespace: 'production',
});

// Cache-aside pattern
const schemes = await cache.getOrSet(
  'funding-schemes:active',
  async () => {
    return client.get<SSGFundingScheme[]>('/funding-schemes', {
      status: 'active',
    });
  },
  { ttl: 7200, tags: ['schemes', 'funding'] }
);

// Function caching decorator
const getCachedScheme = withCache(
  (id: string) => client.get(`/schemes/${id}`),
  cache,
  (id: string) => `scheme:${id}`,
  { ttl: 3600 }
);

// Pattern-based caching
const courses = await cache.applyPattern(
  'wsg-courses',
  `courses:${category}`,
  () => client.get(`/courses?category=${category}`)
);

// Cache invalidation
await cache.invalidateByTags(['schemes', 'funding']);
await cache.invalidateByPattern('courses:*');
```

### 5. Advanced Features

```typescript
// Circuit breaker pattern
const circuitBreaker = errorHandler.createCircuitBreaker(
  () => client.get('/external-service'),
  {
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 300000,
  }
);

// Health monitoring
const healthStatus = client.getHealthStatus();
console.log('API Health:', healthStatus);

// Cache statistics
const cacheStats = cache.getStatistics();
console.log('Cache Performance:', cacheStats);

// Error metrics
const errorMetrics = errorHandler.getMetrics();
console.log('Error Rates:', errorMetrics);
```

## 🏗 Architecture

### Service Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Application Layer                   │
├─────────────────────────────────────────────────────┤
│  SSG Service  │  WSG Service  │ Application Service │
├─────────────────────────────────────────────────────┤
│              Integration Layer                      │
├─────────────────────────────────────────────────────┤
│   API Client  │    Cache     │   Error Handler     │
├─────────────────────────────────────────────────────┤
│              Infrastructure Layer                   │
├─────────────────────────────────────────────────────┤
│     Redis     │    Queue     │   Monitoring        │
└─────────────────────────────────────────────────────┘
```

### Core Components

1. **API Client**: Centralized HTTP client with OAuth 2.0 authentication
2. **Cache Service**: Redis-based caching with intelligent invalidation
3. **Error Handler**: Comprehensive error handling with retry logic
4. **Data Transformer**: Bi-directional data transformation service
5. **Security Service**: Token validation and signature verification
6. **Monitoring Service**: Real-time metrics and health monitoring

## 📊 Monitoring & Observability

### Metrics Collection

The integration service provides comprehensive metrics:

```typescript
// API Client Metrics
{
  requestsPerSecond: 45.2,
  averageResponseTime: 234,
  errorRate: 0.02,
  authenticationStatus: 'healthy',
  rateLimitStatus: 'normal'
}

// Cache Metrics
{
  hitRate: 85.4,
  missRate: 14.6,
  memoryUsage: 67108864,
  keyCount: 15420,
  averageResponseTime: 2.3
}

// Error Metrics
{
  totalErrors: 12,
  errorsByType: {
    'network': 8,
    'timeout': 3,
    'validation': 1
  },
  averageRetryAttempts: 1.4,
  errorRate: 0.02
}
```

### Health Checks

```typescript
const health = await integrationService.getHealthStatus();
// Returns comprehensive health information across all services
```

## 🔒 Security Features

### Authentication & Authorization

- OAuth 2.0 client credentials flow
- Automatic token refresh
- Token validation and expiration handling
- Scope-based access control

### Security Headers

- Request signing and verification
- Correlation ID tracking
- Timestamp validation
- API key management

### Audit & Compliance

- Comprehensive audit trails
- Request/response logging
- Error tracking and alerting
- Security event monitoring

## 🧪 Testing

### Unit Testing

```typescript
import { createSSGWSGClient } from '@tmslms/ssg-wsg-integration';
import nock from 'nock';

describe('SSG-WSG API Client', () => {
  beforeEach(() => {
    nock('https://api.ssg-wsg.gov.sg').post('/oauth/token').reply(200, {
      access_token: 'test-token',
      token_type: 'Bearer',
      expires_in: 3600,
    });
  });

  it('should authenticate successfully', async () => {
    const client = createSSGWSGClient(testConfig, mockRedis);
    await client.initialize();

    expect(client.getHealthStatus().isAuthenticated).toBe(true);
  });
});
```

### Integration Testing

```typescript
// Mock API responses for testing
nock('https://api.ssg-wsg.gov.sg')
  .get('/funding-schemes')
  .reply(200, mockFundingSchemes);

const schemes = await client.get('/funding-schemes');
expect(schemes.success).toBe(true);
expect(schemes.data).toHaveLength(5);
```

## 📚 API Reference

### Types and Interfaces

The package exports comprehensive TypeScript types for all SSG-WSG API entities:

- `SSGFundingScheme` - Funding scheme information
- `WSGCourse` - Course registry data
- `FundingApplication` - Application details
- `TrainingProvider` - Training provider information
- `ApplicationParticipant` - Participant data
- `ApiResponse<T>` - Standard API response wrapper

### Configuration Types

- `ApiConfig` - API client configuration
- `CacheConfig` - Cache service configuration
- `RetryConfig` - Error handling configuration
- `TransformationContext` - Data transformation context

## 🤝 Contributing

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build package
npm run build

# Type checking
npm run type-check
```

### Code Style

- TypeScript with strict mode enabled
- ESLint + Prettier for code formatting
- Comprehensive JSDoc documentation
- 100% test coverage target

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

### Documentation

- [API Documentation](./docs/api.md)
- [Integration Guide](./docs/integration.md)
- [Troubleshooting](./docs/troubleshooting.md)

### Issues

- GitHub Issues: [Report bugs or request features](https://github.com/your-org/tmslms/issues)
- Support Email: support@tmslms.com

### Version Compatibility

| Package Version | SSG API Version | WSG API Version | Node.js Version |
| --------------- | --------------- | --------------- | --------------- |
| 1.x.x           | v2.0            | v1.5            | >=20.0.0        |

---

**Built with ❤️ for the Singapore training ecosystem**
