/**
 * SSG-WSG Integration Package
 * Main entry point for the comprehensive SSG-WSG API integration service layer
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types';

// ============================================================================
// CLIENT EXPORTS
// ============================================================================

export {
  SSGWSGApiClient,
  createSSGWSGClient,
  validateApiConfig,
  type RequestOptions,
} from './client/ApiClient';

// ============================================================================
// ERROR HANDLING EXPORTS
// ============================================================================

export {
  ErrorHandler,
  createErrorHandler,
  createApiError,
  withErrorHandling,
  createBackoffDelay,
  type ErrorContext,
  type RetryConfig,
  type ErrorMetrics,
  type ErrorInfo,
  type RetryAttempt,
  type RetryResult,
  ErrorType,
  ErrorSeverity,
} from './error/ErrorHandler';

// ============================================================================
// DATA TRANSFORMATION EXPORTS
// ============================================================================

export {
  DataTransformationService,
  createDataTransformationService,
  transformList,
  type TransformationContext,
  type TransformationResult,
  type TransformationError,
  type TransformationMetadata,
  type FieldMapping,
  type SchemaMapping,
} from './transformation/DataTransformationService';

// ============================================================================
// CACHING EXPORTS
// ============================================================================

export {
  CacheService,
  createCacheService,
  createCacheKey,
  withCache,
  Cache,
  createTimeBasedKey,
  type CacheOptions,
  type CacheStatistics,
  type CachePattern,
} from './cache/CacheService';

// ============================================================================
// TESTING EXPORTS
// ============================================================================

export {
  SSGWSGTestSuite,
  createTestClient,
  setupMockAPI,
  mockData,
} from './testing/test-suite';

// ============================================================================
// MONITORING EXPORTS
// ============================================================================

export {
  SSGWSGMonitoringService,
  createMonitoringService,
  defaultMonitoringConfig,
} from './monitoring/MonitoringService';

// ============================================================================
// QUEUE PROCESSING EXPORTS
// ============================================================================

export {
  SSGWSGQueueService,
  createQueueService,
  DataSyncProcessor,
  WebhookDeliveryProcessor,
  ReportGenerationProcessor,
  type QueueProcessor,
  type QueueMetrics,
} from './queue/QueueService';

// ============================================================================
// WEBHOOK EXPORTS
// ============================================================================

export {
  SSGWSGWebhookService,
  createWebhookService,
  WebhookDeliveryQueueProcessor,
  type WebhookPayload,
  type WebhookDelivery,
  type WebhookEndpoint,
  type WebhookMetrics,
  WebhookDeliveryStatus,
} from './webhook/WebhookService';

// ============================================================================
// DOCUMENTATION EXPORTS
// ============================================================================

export {
  SSGWSGDocumentationService,
  createDocumentationService,
  type ApiEndpoint,
  type ApiParameter,
  type ApiSchema,
  type OpenAPISpec,
} from './docs/DocumentationService';

// ============================================================================
// SKILLS FRAMEWORK EXPORTS
// ============================================================================

export {
  SSGSkillsIntegration,
  createSSGSkillsIntegration,
  type SSGSkill,
  type SkillsFramework,
  type SkillMapping,
  type SkillProgress,
  type SkillEvidence,
  type SkillsGap,
  type SkillGapItem,
  type LearningPath,
  type LearningPathStep,
  type MarketTrends,
  type TrendingSkill,
} from './skills/SSGSkillsService';

// ============================================================================
// EXAMPLES
// ============================================================================

export {
  default as CompleteSSGWSGIntegration,
  exampleUsage,
} from './examples/complete-integration';

// Funding System Examples
export {
  showSystemInformation as showFundingSystemInfo,
  showQuickStartGuide as showFundingQuickStart,
  runSimpleDemo as runFundingDemo,
  getSystemInformation,
  quickStartGuide,
  runBasicExamples,
  formatCurrency,
  formatDate,
} from './funding/examples';

// ============================================================================
// CONSTANTS
// ============================================================================

export const SSG_WSG_INTEGRATION_VERSION = '1.0.0';

export const DEFAULT_CONFIG = {
  client: {
    timeout: 30000,
    retryAttempts: 3,
    rateLimitRpm: 60,
    rateLimitRph: 1000,
  },
  cache: {
    defaultTTL: 3600,
    maxTTL: 86400,
    compression: true,
  },
  error: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },
} as const;

// ============================================================================
// VERSION INFORMATION
// ============================================================================

export const VERSION_INFO = {
  version: SSG_WSG_INTEGRATION_VERSION,
  buildDate: new Date().toISOString(),
  features: [
    'OAuth 2.0 Authentication',
    'Rate Limiting',
    'Exponential Backoff Retry',
    'Redis-based Caching',
    'Data Transformation',
    'Comprehensive Error Handling',
    'Queue Processing',
    'Webhook Integration',
    'API Documentation Generation',
    'SSG Skills Framework Integration',
    'Skills Progress Tracking',
    'Learning Path Optimization',
    'Market Trends Analysis',
    'Health Monitoring',
  ],
  supportedAPIs: [
    'SSG Funding Schemes API',
    'WSG Course Registry API',
    'Application Management API',
    'Document Management API',
  ],
} as const;
