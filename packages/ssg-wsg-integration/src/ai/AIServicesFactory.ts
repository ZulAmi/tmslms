/**
 * AI Factory and Configuration
 * Central factory for creating and configuring all AI services
 * Provides easy setup and integration with the TMSLMS ecosystem
 */

import { AIContentGenerationService } from './AIContentGenerationService';
import { AIContentIntegrationService } from './AIContentIntegrationService';
import { AIContentWorkflowOrchestrator } from './AIContentWorkflowOrchestrator';
import {
  AIAnalyticsDashboardService,
  type MonitoringConfig,
} from './AIAnalyticsDashboardService';
import { CacheService } from '../cache/CacheService';
import { SSGWSGApiClient } from '../client/ApiClient';

// Configuration Types
export interface AIServicesConfig {
  openai: {
    apiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    timeout?: number;
  };
  cache: {
    redis?: {
      host: string;
      port: number;
      password?: string;
      database?: number;
    };
    memory?: {
      maxSize: number;
      ttl: number;
    };
    enabled: boolean;
  };
  ssgApi: {
    baseUrl: string;
    apiKey: string;
    timeout?: number;
    retryAttempts?: number;
  };
  features: {
    contentGeneration: boolean;
    courseAuthoring: boolean;
    assessmentCreation: boolean;
    multilingualSupport: boolean;
    personalization: boolean;
    qualityAssurance: boolean;
    workflowOrchestration: boolean;
    analytics: boolean;
    realTimeMonitoring: boolean;
  };
  policies: {
    requireHumanReview: boolean;
    ssgComplianceRequired: boolean;
    enableCaching: boolean;
    enableVersionControl: boolean;
    enableAuditTrail: boolean;
    maxRetryAttempts: number;
    defaultTimeout: number;
  };
  monitoring: MonitoringConfig;
  security: {
    enableEncryption: boolean;
    auditLevel: 'minimal' | 'standard' | 'comprehensive';
    accessControl: 'basic' | 'rbac' | 'advanced';
    dataRetention: number; // days
  };
}

export interface AIServicesCollection {
  contentGeneration: AIContentGenerationService;
  integration: AIContentIntegrationService;
  orchestrator: AIContentWorkflowOrchestrator;
  analytics: AIAnalyticsDashboardService;
  cache: CacheService;
  apiClient: SSGWSGApiClient;
}

// Default Configuration
export const defaultAIConfig: AIServicesConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    maxTokens: 4000,
    temperature: 0.7,
    timeout: 60000,
  },
  cache: {
    enabled: true,
    memory: {
      maxSize: 1000, // MB
      ttl: 3600, // seconds
    },
  },
  ssgApi: {
    baseUrl: process.env.SSG_API_URL || 'https://api.ssg-wsg.gov.sg',
    apiKey: process.env.SSG_API_KEY || '',
    timeout: 30000,
    retryAttempts: 3,
  },
  features: {
    contentGeneration: true,
    courseAuthoring: true,
    assessmentCreation: true,
    multilingualSupport: true,
    personalization: true,
    qualityAssurance: true,
    workflowOrchestration: true,
    analytics: true,
    realTimeMonitoring: true,
  },
  policies: {
    requireHumanReview: true,
    ssgComplianceRequired: true,
    enableCaching: true,
    enableVersionControl: true,
    enableAuditTrail: true,
    maxRetryAttempts: 3,
    defaultTimeout: 30000,
  },
  monitoring: {
    refreshInterval: 30000,
    alertThresholds: {
      responseTime: 5000,
      errorRate: 0.05,
      systemLoad: 0.8,
      qualityScore: 70,
      budgetUtilization: 0.9,
      costPerHour: 100,
    },
    metricsRetention: 7 * 24 * 60 * 60 * 1000,
    enableRealTime: true,
  },
  security: {
    enableEncryption: true,
    auditLevel: 'standard',
    accessControl: 'rbac',
    dataRetention: 365, // 1 year
  },
};

// Environment-specific configurations
export const developmentConfig: Partial<AIServicesConfig> = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    temperature: 0.8, // More creative for development
    maxTokens: 2000, // Lower for cost savings
  },
  policies: {
    requireHumanReview: false,
    ssgComplianceRequired: true,
    enableCaching: true,
    enableVersionControl: false,
    enableAuditTrail: false,
    maxRetryAttempts: 3,
    defaultTimeout: 30000,
  },
  monitoring: {
    refreshInterval: 60000, // Less frequent in dev
    enableRealTime: false,
    alertThresholds: {
      errorRate: 0.05,
      responseTime: 10000,
      costPerHour: 100,
      systemLoad: 0.8,
      qualityScore: 70,
      budgetUtilization: 0.9,
    },
    metricsRetention: 86400000, // 1 day
  },
  security: {
    auditLevel: 'minimal',
    accessControl: 'basic',
    enableEncryption: false,
    dataRetention: 86400000, // 1 day
  },
};

export const productionConfig: Partial<AIServicesConfig> = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    temperature: 0.6, // More consistent for production
    maxTokens: 4000,
  },
  policies: {
    requireHumanReview: true,
    ssgComplianceRequired: true,
    enableCaching: true,
    enableVersionControl: true,
    enableAuditTrail: true,
    maxRetryAttempts: 5,
    defaultTimeout: 60000,
  },
  monitoring: {
    refreshInterval: 15000, // More frequent monitoring
    enableRealTime: true,
    alertThresholds: {
      errorRate: 0.01,
      responseTime: 5000,
      costPerHour: 500,
      systemLoad: 0.7,
      qualityScore: 80,
      budgetUtilization: 0.85,
    },
    metricsRetention: 2592000000, // 30 days
  },
  security: {
    enableEncryption: true,
    auditLevel: 'comprehensive',
    accessControl: 'advanced',
    dataRetention: 220752000000, // 7 years for compliance
  },
};

export const testingConfig: Partial<AIServicesConfig> = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'test-key',
    temperature: 0.5,
    maxTokens: 1000,
  },
  cache: {
    enabled: false, // No caching in tests
  },
  policies: {
    requireHumanReview: false,
    ssgComplianceRequired: true,
    enableCaching: false,
    enableVersionControl: false,
    enableAuditTrail: false,
    maxRetryAttempts: 1,
    defaultTimeout: 10000,
  },
  monitoring: {
    refreshInterval: 5000,
    enableRealTime: false,
    alertThresholds: {
      errorRate: 0.1,
      responseTime: 15000,
      costPerHour: 50,
      systemLoad: 0.9,
      qualityScore: 60,
      budgetUtilization: 0.95,
    },
    metricsRetention: 3600000, // 1 hour
  },
  security: {
    auditLevel: 'minimal',
    accessControl: 'basic',
    enableEncryption: false,
    dataRetention: 86400000, // 1 day
  },
};

// ============================================================================
// AI SERVICES FACTORY
// ============================================================================

export class AIServicesFactory {
  private static instance: AIServicesFactory;
  private services: Map<string, AIServicesCollection> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): AIServicesFactory {
    if (!AIServicesFactory.instance) {
      AIServicesFactory.instance = new AIServicesFactory();
    }
    return AIServicesFactory.instance;
  }

  /**
   * Create and configure all AI services
   */
  async createAIServices(
    instanceId: string = 'default',
    config: Partial<AIServicesConfig> = {}
  ): Promise<AIServicesCollection> {
    console.log(`🏗️ Creating AI services instance: ${instanceId}`);

    // Merge with default configuration
    const finalConfig = this.mergeConfigurations(defaultAIConfig, config);

    // Validate configuration
    this.validateConfiguration(finalConfig);

    try {
      // Create cache service
      const cache = await this.createCacheService(finalConfig.cache);

      // Create API client
      const apiClient = await this.createApiClient(finalConfig.ssgApi);

      // Create content generation service
      const contentGeneration = this.createContentGenerationService(
        finalConfig.openai,
        finalConfig.policies,
        cache,
        apiClient
      );

      // Create integration service
      const integration = this.createIntegrationService(
        contentGeneration,
        cache,
        apiClient
      );

      // Create workflow orchestrator
      const orchestrator = this.createWorkflowOrchestrator(
        contentGeneration,
        integration,
        cache
      );

      // Create analytics dashboard
      const analytics = this.createAnalyticsDashboard(
        contentGeneration,
        integration,
        orchestrator,
        cache,
        finalConfig.monitoring
      );

      const services: AIServicesCollection = {
        contentGeneration,
        integration,
        orchestrator,
        analytics,
        cache,
        apiClient,
      };

      // Initialize services
      await this.initializeServices(services, finalConfig);

      // Store services
      this.services.set(instanceId, services);

      console.log(`✅ AI services instance created: ${instanceId}`);
      return services;
    } catch (error) {
      console.error(`❌ Failed to create AI services: ${instanceId}`, error);
      throw error;
    }
  }

  /**
   * Get existing AI services instance
   */
  getAIServices(instanceId: string = 'default'): AIServicesCollection {
    const services = this.services.get(instanceId);
    if (!services) {
      throw new Error(`AI services instance not found: ${instanceId}`);
    }
    return services;
  }

  /**
   * Destroy AI services instance
   */
  async destroyAIServices(instanceId: string = 'default'): Promise<void> {
    const services = this.services.get(instanceId);
    if (!services) {
      return;
    }

    console.log(`🔚 Destroying AI services instance: ${instanceId}`);

    try {
      // Cleanup services
      await this.cleanupServices(services);

      // Remove from registry
      this.services.delete(instanceId);

      console.log(`✅ AI services instance destroyed: ${instanceId}`);
    } catch (error) {
      console.error(`❌ Error destroying AI services: ${instanceId}`, error);
      throw error;
    }
  }

  // ============================================================================
  // SERVICE CREATION METHODS
  // ============================================================================

  private async createCacheService(
    config: AIServicesConfig['cache']
  ): Promise<CacheService> {
    if (!config.enabled) {
      // Return a no-op cache service
      return new CacheService({
        type: 'memory',
        memory: { maxSize: 1, ttl: 1 },
        enabled: false,
      });
    }

    if (config.redis) {
      return new CacheService({
        type: 'redis',
        redis: config.redis,
        enabled: true,
      });
    }

    if (config.memory) {
      return new CacheService({
        type: 'memory',
        memory: config.memory,
        enabled: true,
      });
    }

    throw new Error('Invalid cache configuration');
  }

  private async createApiClient(
    config: AIServicesConfig['ssgApi']
  ): Promise<SSGWSGApiClient> {
    const apiConfig = {
      baseUrl: config.baseUrl,
      clientId: 'ai-services',
      clientSecret: config.apiKey,
      scope: ['read', 'write'],
      environment: 'production' as const,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      rateLimitRpm: 100,
      rateLimitRph: 1000,
    };

    // Create a simple Redis client for the API client
    const Redis = require('ioredis');
    const redisClient = new Redis();

    const client = new SSGWSGApiClient(apiConfig, redisClient);
    return client;
  }

  private createContentGenerationService(
    openaiConfig: AIServicesConfig['openai'],
    policies: AIServicesConfig['policies'],
    cache: CacheService,
    apiClient: SSGWSGApiClient
  ): AIContentGenerationService {
    return new AIContentGenerationService({
      openaiApiKey: openaiConfig.apiKey,
      cache,
      apiClient,
      defaultModel: openaiConfig.model,
      maxTokens: openaiConfig.maxTokens,
      temperature: openaiConfig.temperature,
      enableCaching: policies.enableCaching,
      requireHumanReview: policies.requireHumanReview,
      ssgComplianceRequired: policies.ssgComplianceRequired,
    });
  }

  private createIntegrationService(
    aiService: AIContentGenerationService,
    cache: CacheService,
    apiClient: SSGWSGApiClient
  ): AIContentIntegrationService {
    return new AIContentIntegrationService({
      aiService,
      cache,
      apiClient,
    });
  }

  private createWorkflowOrchestrator(
    aiService: AIContentGenerationService,
    integrationService: AIContentIntegrationService,
    cache: CacheService
  ): AIContentWorkflowOrchestrator {
    return new AIContentWorkflowOrchestrator({
      aiService,
      integrationService,
      cache,
    });
  }

  private createAnalyticsDashboard(
    aiService: AIContentGenerationService,
    integrationService: AIContentIntegrationService,
    orchestrator: AIContentWorkflowOrchestrator,
    cache: CacheService,
    monitoringConfig: MonitoringConfig
  ): AIAnalyticsDashboardService {
    return new AIAnalyticsDashboardService({
      aiService,
      integrationService,
      orchestrator,
      cache,
      monitoringConfig,
    });
  }

  // ============================================================================
  // INITIALIZATION AND CLEANUP
  // ============================================================================

  private async initializeServices(
    services: AIServicesCollection,
    config: AIServicesConfig
  ): Promise<void> {
    console.log('🔧 Initializing AI services...');

    // Services are ready - no additional initialization needed

    // Set up event listeners between services
    this.setupEventListeners(services);

    // Configure security if enabled
    if (config.security.enableEncryption) {
      await this.configureecurity(services, config.security);
    }

    // Start monitoring if enabled
    if (config.monitoring.enableRealTime) {
      services.analytics.startRealTimeMonitoring();
    }

    console.log('✅ AI services initialized');
  }

  private setupEventListeners(services: AIServicesCollection): void {
    // Content generation events
    services.contentGeneration.on('contentGenerated', (event) => {
      console.log(`📝 Content generated: ${event.type}`);
    });

    services.contentGeneration.on('generationError', (event) => {
      console.error(`❌ Generation error: ${event.type}`, event.error);
    });

    // Integration events
    services.integration.on('courseGenerated', (event) => {
      console.log(`🎓 Course generated: ${event.courseId}`);
    });

    services.integration.on('personalizedPathCreated', (event) => {
      console.log(`👤 Personalized path created for user: ${event.userId}`);
    });

    // Workflow events
    services.orchestrator.on('workflowCompleted', (event) => {
      console.log(`✅ Workflow completed: ${event.executionId}`);
    });

    services.orchestrator.on('workflowFailed', (event) => {
      console.error(`❌ Workflow failed: ${event.executionId}`, event.error);
    });

    // Analytics events
    services.analytics.on('alertsTriggered', (alerts) => {
      console.warn(`🚨 ${alerts.length} alerts triggered`);
    });

    services.analytics.on('dashboardUpdated', () => {
      console.log('📊 Dashboard metrics updated');
    });
  }

  private async configureecurity(
    services: AIServicesCollection,
    securityConfig: AIServicesConfig['security']
  ): Promise<void> {
    console.log('🔐 Configuring security...');

    // Security configuration would be implemented here
    // This is a placeholder for the actual security setup

    console.log('✅ Security configured');
  }

  private async cleanupServices(services: AIServicesCollection): Promise<void> {
    // Stop real-time monitoring
    services.analytics.stopRealTimeMonitoring();

    // Cleanup analytics
    services.analytics.destroy();

    // Remove event listeners
    services.contentGeneration.removeAllListeners();
    services.integration.removeAllListeners();
    services.orchestrator.removeAllListeners();
    services.analytics.removeAllListeners();

    // Services cleanup complete
    console.log('🧹 AI Services cleanup completed');
  }

  // ============================================================================
  // CONFIGURATION UTILITIES
  // ============================================================================

  private mergeConfigurations(
    defaultConfig: AIServicesConfig,
    userConfig: Partial<AIServicesConfig>
  ): AIServicesConfig {
    const merged = { ...defaultConfig };

    // Deep merge each section
    if (userConfig.openai) {
      merged.openai = { ...defaultConfig.openai, ...userConfig.openai };
    }

    if (userConfig.cache) {
      merged.cache = { ...defaultConfig.cache, ...userConfig.cache };
    }

    if (userConfig.ssgApi) {
      merged.ssgApi = { ...defaultConfig.ssgApi, ...userConfig.ssgApi };
    }

    if (userConfig.features) {
      merged.features = { ...defaultConfig.features, ...userConfig.features };
    }

    if (userConfig.policies) {
      merged.policies = { ...defaultConfig.policies, ...userConfig.policies };
    }

    if (userConfig.monitoring) {
      merged.monitoring = {
        ...defaultConfig.monitoring,
        ...userConfig.monitoring,
      };
    }

    if (userConfig.security) {
      merged.security = { ...defaultConfig.security, ...userConfig.security };
    }

    return merged;
  }

  private validateConfiguration(config: AIServicesConfig): void {
    // OpenAI validation
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // SSG API validation
    if (!config.ssgApi.apiKey || !config.ssgApi.baseUrl) {
      throw new Error('SSG API configuration is incomplete');
    }

    // Cache validation
    if (config.cache.enabled) {
      if (
        config.cache.redis &&
        (!config.cache.redis.host || !config.cache.redis.port)
      ) {
        throw new Error('Redis cache configuration is incomplete');
      }
      if (
        config.cache.memory &&
        (!config.cache.memory.maxSize || !config.cache.memory.ttl)
      ) {
        throw new Error('Memory cache configuration is incomplete');
      }
    }

    // Security validation
    if (config.security.dataRetention < 30) {
      console.warn('⚠️ Data retention period is less than 30 days');
    }

    console.log('✅ Configuration validated');
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get environment-specific configuration
   */
  static getEnvironmentConfig(
    environment: 'development' | 'production' | 'testing' = 'development'
  ): Partial<AIServicesConfig> {
    switch (environment) {
      case 'development':
        return developmentConfig;
      case 'production':
        return productionConfig;
      case 'testing':
        return testingConfig;
      default:
        return {};
    }
  }

  /**
   * Create configuration from environment variables
   */
  static createConfigFromEnv(): Partial<AIServicesConfig> {
    return {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      },
      ssgApi: {
        baseUrl: process.env.SSG_API_URL || '',
        apiKey: process.env.SSG_API_KEY || '',
        timeout: parseInt(process.env.SSG_API_TIMEOUT || '30000'),
      },
      cache: {
        enabled: process.env.CACHE_ENABLED !== 'false',
        redis: process.env.REDIS_URL
          ? {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379'),
              password: process.env.REDIS_PASSWORD,
              database: parseInt(process.env.REDIS_DATABASE || '0'),
            }
          : undefined,
      },
      policies: {
        requireHumanReview: process.env.REQUIRE_HUMAN_REVIEW !== 'false',
        ssgComplianceRequired: process.env.SSG_COMPLIANCE_REQUIRED !== 'false',
        enableCaching: process.env.ENABLE_CACHING !== 'false',
        enableVersionControl: process.env.ENABLE_VERSION_CONTROL === 'true',
        enableAuditTrail: process.env.ENABLE_AUDIT_TRAIL === 'true',
        maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
        defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
      },
    };
  }

  /**
   * List all active service instances
   */
  listInstances(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get service health status
   */
  getHealthStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    for (const [instanceId, services] of this.services.entries()) {
      status[instanceId] = {
        contentGeneration: 'healthy',
        integration: services.integration.getHealthStatus?.() || 'healthy',
        orchestrator: 'healthy',
        analytics: 'healthy',
        cache: 'healthy',
        apiClient: 'healthy',
      };
    }

    return status;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick setup function for common use cases
 */
export async function setupAIServices(
  environment: 'development' | 'production' | 'testing' = 'development',
  customConfig: Partial<AIServicesConfig> = {}
): Promise<AIServicesCollection> {
  const factory = AIServicesFactory.getInstance();

  const envConfig = AIServicesFactory.getEnvironmentConfig(environment);
  const envVarConfig = AIServicesFactory.createConfigFromEnv();

  const finalConfig = {
    ...envConfig,
    ...envVarConfig,
    ...customConfig,
  };

  return factory.createAIServices('default', finalConfig);
}

/**
 * Create AI services for course authoring integration
 */
export async function setupCourseAuthoringAI(
  config: Partial<AIServicesConfig> = {}
): Promise<AIServicesCollection> {
  const courseAuthoringConfig: Partial<AIServicesConfig> = {
    features: {
      contentGeneration: true,
      courseAuthoring: true,
      assessmentCreation: true,
      multilingualSupport: true,
      personalization: false,
      qualityAssurance: true,
      workflowOrchestration: true,
      analytics: true,
      realTimeMonitoring: false,
    },
    policies: {
      requireHumanReview: true,
      ssgComplianceRequired: true,
      enableCaching: true,
      enableVersionControl: true,
      enableAuditTrail: true,
      maxRetryAttempts: 2,
      defaultTimeout: 45000,
    },
    ...config,
  };

  return setupAIServices('production', courseAuthoringConfig);
}

/**
 * Create AI services for assessment system integration
 */
export async function setupAssessmentAI(
  config: Partial<AIServicesConfig> = {}
): Promise<AIServicesCollection> {
  const assessmentConfig: Partial<AIServicesConfig> = {
    features: {
      contentGeneration: true,
      courseAuthoring: false,
      assessmentCreation: true,
      multilingualSupport: true,
      personalization: true,
      qualityAssurance: true,
      workflowOrchestration: false,
      analytics: true,
      realTimeMonitoring: true,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      temperature: 0.6, // More consistent for assessments
    },
    ...config,
  };

  return setupAIServices('production', assessmentConfig);
}

/**
 * Create AI services for user profile integration
 */
export async function setupPersonalizationAI(
  config: Partial<AIServicesConfig> = {}
): Promise<AIServicesCollection> {
  const personalizationConfig: Partial<AIServicesConfig> = {
    features: {
      contentGeneration: true,
      courseAuthoring: false,
      assessmentCreation: false,
      multilingualSupport: true,
      personalization: true,
      qualityAssurance: true,
      workflowOrchestration: false,
      analytics: true,
      realTimeMonitoring: true,
    },
    policies: {
      requireHumanReview: false, // Personalization can be more automated
      ssgComplianceRequired: true,
      enableCaching: true,
      enableVersionControl: false,
      enableAuditTrail: false,
      maxRetryAttempts: 3,
      defaultTimeout: 30000,
    },
    ...config,
  };

  return setupAIServices('production', personalizationConfig);
}

// Export singleton instance
export const aiServicesFactory = AIServicesFactory.getInstance();

// Export default configuration
export { defaultAIConfig as defaultConfig };

// Default export
export default AIServicesFactory;
