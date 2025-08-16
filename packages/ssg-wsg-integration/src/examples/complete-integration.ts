/**
 * SSG-WSG Integration Example
 * Comprehensive example showing how to use all services together
 */

import {
  SSGWSGApiClient,
  createSSGWSGClient,
  SSGWSGQueueService,
  createQueueService,
  SSGWSGWebhookService,
  createWebhookService,
  SSGWSGDocumentationService,
  createDocumentationService,
  DataSyncProcessor,
  WebhookDeliveryProcessor,
  ReportGenerationProcessor,
  WebhookDeliveryQueueProcessor,
  JobType,
  WebhookEvent,
  QueuePriority,
} from '../index';

// ============================================================================
// COMPLETE SSG-WSG INTEGRATION SERVICE
// ============================================================================

export class CompleteSSGWSGIntegration {
  private apiClient: SSGWSGApiClient;
  private queueService: SSGWSGQueueService;
  private webhookService: SSGWSGWebhookService;
  private documentationService: SSGWSGDocumentationService;

  constructor(config: {
    apiBaseUrl: string;
    clientId: string;
    clientSecret: string;
    redisUrl: string;
  }) {
    // Initialize Redis client (you'll need to provide this)
    const redis = this.createRedisClient(config.redisUrl);

    // Initialize API client
    this.apiClient = createSSGWSGClient(
      {
        baseUrl: config.apiBaseUrl,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        environment: 'production',
        timeout: 30000,
        rateLimitRpm: 60,
        rateLimitRph: 1000,
        scope: ['read', 'write'],
        retryAttempts: 3,
      },
      redis
    );

    // Initialize queue service
    this.queueService = createQueueService({
      concurrency: 10,
      maxRetries: 3,
    });

    // Initialize webhook service
    this.webhookService = createWebhookService();
    this.webhookService.initialize(this.queueService);

    // Initialize documentation service
    this.documentationService = createDocumentationService({
      title: 'SSG-WSG Integration API',
      description: 'Comprehensive API for SSG-WSG system integration',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'api-support@example.com',
        url: 'https://example.com/support',
      },
      servers: [
        {
          url: config.apiBaseUrl,
          description: 'Production server',
        },
        {
          url: 'https://staging-api.example.com',
          description: 'Staging server',
        },
      ],
    });

    this.setupServices();
  }

  /**
   * Initialize and start all services
   */
  async start(): Promise<void> {
    console.log('🚀 Starting complete SSG-WSG integration...');

    // Initialize API client
    await this.apiClient.initialize();

    // Start queue service
    this.queueService.start();

    // Register webhook endpoints
    this.setupWebhooks();

    // Generate documentation
    await this.generateDocumentation();

    console.log('✅ SSG-WSG integration started successfully');
  }

  /**
   * Stop all services
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping SSG-WSG integration...');

    this.queueService.stop();
    // API client cleanup will happen automatically

    console.log('✅ SSG-WSG integration stopped');
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, any>;
  }> {
    const health = await this.apiClient.getHealthStatus();
    const queueMetrics = this.queueService.getMetrics();
    const webhookMetrics = this.webhookService.getMetrics();

    const services = {
      api: health,
      queue: {
        running: this.queueService['isRunning'], // Access private property
        metrics: queueMetrics,
      },
      webhooks: {
        metrics: webhookMetrics,
      },
    };

    const overall =
      health.isAuthenticated && queueMetrics.activeJobs >= 0
        ? 'healthy'
        : 'unhealthy';

    return { overall, services };
  }

  // ============================================================================
  // EXAMPLE OPERATIONS
  // ============================================================================

  /**
   * Example: Process course enrollment with full integration
   */
  async processCourseEnrollment(enrollmentData: {
    userId: string;
    courseId: string;
    schemeId: string;
    personalDetails: any;
  }): Promise<string> {
    console.log('📚 Processing course enrollment with full integration...');

    // 1. Submit application via API
    const applicationResult = await this.apiClient.post('/applications', {
      userId: enrollmentData.userId,
      courseId: enrollmentData.courseId,
      schemeId: enrollmentData.schemeId,
      personalDetails: enrollmentData.personalDetails,
    });

    if (!applicationResult.success) {
      throw new Error('Failed to submit application');
    }

    const applicationId = applicationResult.data.id;

    // 2. Queue background processing jobs
    await this.queueService.addJob(
      JobType.DATA_SYNC,
      { applicationId, action: 'sync_to_lms' },
      { priority: QueuePriority.HIGH }
    );

    await this.queueService.addJob(
      JobType.NOTIFICATION_SEND,
      {
        userId: enrollmentData.userId,
        type: 'application_submitted',
        applicationId,
      },
      { priority: QueuePriority.NORMAL }
    );

    // 3. Trigger webhook notifications
    await this.webhookService.triggerEvent(WebhookEvent.APPLICATION_SUBMITTED, {
      applicationId,
      userId: enrollmentData.userId,
      courseId: enrollmentData.courseId,
      timestamp: new Date().toISOString(),
    });

    // 4. Queue report generation
    await this.queueService.addJob(
      JobType.REPORT_GENERATION,
      {
        type: 'enrollment_summary',
        applicationId,
        format: 'pdf',
      },
      {
        priority: QueuePriority.LOW,
        delay: 5000, // Generate report after 5 seconds
      }
    );

    console.log(`✅ Course enrollment processed: ${applicationId}`);
    return applicationId;
  }

  /**
   * Example: Bulk data synchronization
   */
  async performBulkDataSync(syncConfig: {
    type: 'courses' | 'participants' | 'applications';
    batchSize: number;
    priority: QueuePriority;
  }): Promise<string[]> {
    console.log(`📊 Starting bulk data sync: ${syncConfig.type}`);

    const jobIds: string[] = [];

    // Create multiple sync jobs for parallel processing
    for (let batch = 0; batch < 10; batch++) {
      const jobId = await this.queueService.addJob(
        JobType.DATA_SYNC,
        {
          type: syncConfig.type,
          batch,
          batchSize: syncConfig.batchSize,
        },
        {
          priority: syncConfig.priority,
          delay: batch * 1000, // Stagger job execution
        }
      );
      jobIds.push(jobId);
    }

    // Trigger webhook for sync started
    await this.webhookService.triggerEvent(WebhookEvent.SCHEME_UPDATED, {
      syncType: syncConfig.type,
      jobCount: jobIds.length,
      startedAt: new Date().toISOString(),
    });

    console.log(`📋 Created ${jobIds.length} sync jobs`);
    return jobIds;
  }

  /**
   * Example: Generate comprehensive report
   */
  async generateComprehensiveReport(reportConfig: {
    type: 'monthly' | 'quarterly' | 'annual';
    includeCharts: boolean;
    format: 'pdf' | 'excel' | 'csv';
  }): Promise<string> {
    console.log(`📄 Generating comprehensive report: ${reportConfig.type}`);

    // Queue report generation with high priority
    const jobId = await this.queueService.addJob(
      JobType.REPORT_GENERATION,
      {
        ...reportConfig,
        timestamp: new Date().toISOString(),
      },
      {
        priority: QueuePriority.HIGH,
        timeout: 300000, // 5 minutes timeout for large reports
      }
    );

    // Set up webhook notification for when report is ready
    await this.webhookService.triggerEvent(WebhookEvent.DOCUMENT_UPLOADED, {
      jobId,
      reportType: reportConfig.type,
      status: 'generating',
    });

    return jobId;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Setup queue processors and webhook handlers
   */
  private setupServices(): void {
    // Register queue processors
    this.queueService.registerProcessor(
      JobType.DATA_SYNC,
      new DataSyncProcessor()
    );
    this.queueService.registerProcessor(
      JobType.REPORT_GENERATION,
      new ReportGenerationProcessor()
    );
    this.queueService.registerProcessor(
      JobType.WEBHOOK_DELIVERY,
      new WebhookDeliveryQueueProcessor(this.webhookService)
    );

    // Set up periodic cleanup
    setInterval(() => {
      this.queueService.cleanupCompletedJobs();
    }, 300000); // Every 5 minutes
  }

  /**
   * Setup webhook endpoints
   */
  private setupWebhooks(): void {
    // Register outgoing webhooks for external systems
    this.webhookService.registerWebhook({
      url: 'https://external-lms.example.com/webhooks/ssg-wsg',
      secret: 'webhook-secret-key',
      events: [
        WebhookEvent.APPLICATION_APPROVED,
        WebhookEvent.COURSE_COMPLETED,
        WebhookEvent.PAYMENT_PROCESSED,
      ],
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
        maxDelay: 30000,
        retryableStatusCodes: [500, 502, 503, 504],
      },
      timeout: 30000,
      headers: {
        'X-Source': 'SSG-WSG-Integration',
        'X-Version': '1.0.0',
      },
      active: true,
      createdAt: new Date(),
      successfulDeliveries: 0,
      failedDeliveries: 0,
    });

    // Register incoming webhook endpoints
    this.webhookService.registerEndpoint({
      url: '/webhooks/external-system',
      events: [WebhookEvent.PARTICIPANT_ENROLLED, WebhookEvent.SCHEME_UPDATED],
      secret: 'incoming-webhook-secret',
      headers: {},
      timeout: 30000,
      active: true,
    });
  }

  /**
   * Generate API documentation
   */
  private async generateDocumentation(): Promise<void> {
    try {
      const docs =
        await this.documentationService.generateDocumentation('./docs');
      console.log('📚 API documentation generated:', docs);
    } catch (error) {
      console.error('❌ Failed to generate documentation:', error);
    }
  }

  /**
   * Create Redis client (placeholder - implement based on your Redis setup)
   */
  private createRedisClient(redisUrl: string): any {
    // This is a placeholder - implement based on your Redis client
    console.log(`🔗 Connecting to Redis: ${redisUrl}`);
    return {
      // Mock Redis client for example
      get: async (key: string) => null,
      set: async (key: string, value: any, ttl?: number) => {},
      del: async (key: string) => {},
      // Add other Redis methods as needed
    };
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

async function exampleUsage() {
  // Initialize the complete integration
  const integration = new CompleteSSGWSGIntegration({
    apiBaseUrl: 'https://api.ssg-wsg.gov.sg',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redisUrl: 'redis://localhost:6379',
  });

  try {
    // Start all services
    await integration.start();

    // Check health
    const health = await integration.getHealthStatus();
    console.log('System health:', health);

    // Process a course enrollment
    const applicationId = await integration.processCourseEnrollment({
      userId: 'user-123',
      courseId: 'course-456',
      schemeId: 'scheme-789',
      personalDetails: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+65 9123 4567',
      },
    });

    // Perform bulk data sync
    const syncJobs = await integration.performBulkDataSync({
      type: 'courses',
      batchSize: 100,
      priority: QueuePriority.NORMAL,
    });

    // Generate report
    const reportJobId = await integration.generateComprehensiveReport({
      type: 'monthly',
      includeCharts: true,
      format: 'pdf',
    });

    console.log('Example operations completed successfully');
  } catch (error) {
    console.error('Error in example usage:', error);
  } finally {
    // Clean shutdown
    await integration.stop();
  }
}

// Export for use
export default CompleteSSGWSGIntegration;
export { exampleUsage };
