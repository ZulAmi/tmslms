/**
 * Queue Processing Service
 * Background job processing for large data operations with Bull/BullMQ integration
 */

import { EventEmitter } from 'events';
import {
  QueueConfig,
  QueueJob,
  JobType,
  JobStatus,
  QueuePriority,
  QueueRateLimit,
  JobOptions,
  JobError,
  JobLog,
  LogLevel,
  BackoffStrategy,
} from '../types';

export interface QueueProcessor<T = any> {
  process(job: QueueJob<T>): Promise<any>;
}

export interface QueueMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  activeJobs: number;
  waitingJobs: number;
  averageProcessingTime: number;
  throughput: number; // jobs per minute
}

export class SSGWSGQueueService extends EventEmitter {
  private config: QueueConfig;
  private jobs: Map<string, QueueJob> = new Map();
  private processors: Map<JobType, QueueProcessor> = new Map();
  private isRunning = false;
  private processingTimer?: NodeJS.Timeout;
  private metrics: QueueMetrics;
  private rateLimiters: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor(config: QueueConfig) {
    super();
    this.config = config;
    this.metrics = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      activeJobs: 0,
      waitingJobs: 0,
      averageProcessingTime: 0,
      throughput: 0,
    };
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Start the queue processing
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🚀 SSG-WSG Queue Service started');

    // Start processing jobs
    this.processingTimer = setInterval(() => {
      this.processJobs();
    }, 1000);

    this.emit('queue:started');
  }

  /**
   * Stop the queue processing
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.processingTimer) {
      clearInterval(this.processingTimer);
    }

    console.log('🛑 SSG-WSG Queue Service stopped');
    this.emit('queue:stopped');
  }

  /**
   * Add a job to the queue
   */
  async addJob<T>(
    type: JobType,
    data: T,
    jobOptions: Partial<JobOptions> = {}
  ): Promise<string> {
    const jobId = this.generateJobId();
    const now = new Date();

    const options: JobOptions = {
      priority: jobOptions.priority || QueuePriority.NORMAL,
      delay: jobOptions.delay || 0,
      timeout: jobOptions.timeout || 30000,
      removeOnComplete: jobOptions.removeOnComplete || 1,
      removeOnFail: jobOptions.removeOnFail || 1,
      maxRetries: jobOptions.maxRetries || this.config.maxRetries,
      backoff: jobOptions.backoff || {
        type: BackoffStrategy.EXPONENTIAL,
        delay: 1000,
      },
    };

    const job: QueueJob<T> = {
      id: jobId,
      type,
      data,
      options,
      status: JobStatus.WAITING,
      progress: 0,
      createdAt: now,
      attempts: 0,
      logs: [],
    };

    // Add delay if specified
    if (options.delay && options.delay > 0) {
      job.status = JobStatus.DELAYED;
    }

    this.jobs.set(jobId, job);
    this.metrics.totalJobs++;
    this.metrics.waitingJobs++;

    console.log(`📝 Job added: ${type} (${jobId})`);
    this.emit('job:added', job);

    return jobId;
  }

  /**
   * Register a job processor
   */
  registerProcessor<T>(type: JobType, processor: QueueProcessor<T>): void {
    this.processors.set(type, processor);
    console.log(`🔧 Processor registered for job type: ${type}`);
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): QueueJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: JobStatus): QueueJob[] {
    return Array.from(this.jobs.values()).filter(
      (job) => job.status === status
    );
  }

  /**
   * Get queue metrics
   */
  getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  /**
   * Remove completed jobs
   */
  cleanupCompletedJobs(): void {
    const toRemove: string[] = [];

    for (const [jobId, job] of this.jobs.entries()) {
      if (
        job.status === JobStatus.COMPLETED &&
        job.options.removeOnComplete &&
        job.options.removeOnComplete > 0
      ) {
        toRemove.push(jobId);
      }
    }

    toRemove.forEach((jobId) => {
      this.jobs.delete(jobId);
    });

    if (toRemove.length > 0) {
      console.log(`🧹 Cleaned up ${toRemove.length} completed jobs`);
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Process jobs in the queue
   */
  private async processJobs(): Promise<void> {
    // Move delayed jobs to waiting if their time has come
    this.processDelayedJobs();

    const waitingJobs = this.getJobsByStatus(JobStatus.WAITING).sort((a, b) => {
      // Sort by priority, then by creation time
      if (a.options.priority !== b.options.priority) {
        return (
          this.priorityWeight(b.options.priority) -
          this.priorityWeight(a.options.priority)
        );
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    // Respect concurrency limits
    const activeJobs = this.getJobsByStatus(JobStatus.ACTIVE);
    const availableSlots = this.config.concurrency - activeJobs.length;

    if (availableSlots <= 0) return;

    const jobsToProcess = waitingJobs.slice(0, availableSlots);

    for (const job of jobsToProcess) {
      await this.processJob(job);
    }

    // Update metrics
    this.updateMetrics();
  }

  /**
   * Process delayed jobs
   */
  private processDelayedJobs(): void {
    const now = new Date();
    const delayedJobs = this.getJobsByStatus(JobStatus.DELAYED);

    for (const job of delayedJobs) {
      const delayTime = job.options.delay || 0;
      const shouldProcess =
        now.getTime() >= job.createdAt.getTime() + delayTime;

      if (shouldProcess) {
        job.status = JobStatus.WAITING;
        this.addJobLog(job, LogLevel.INFO, 'Job moved from delayed to waiting');
      }
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: QueueJob): Promise<void> {
    const processor = this.processors.get(job.type);
    if (!processor) {
      console.error(`❌ No processor found for job type: ${job.type}`);
      await this.failJob(job, {
        name: 'ProcessorNotFound',
        message: `No processor for job type: ${job.type}`,
        stack: '',
        isRetryable: false,
      });
      return;
    }

    // Check rate limiting
    if (!this.checkRateLimit(job)) {
      return; // Skip this job for now
    }

    // Start processing
    job.status = JobStatus.ACTIVE;
    job.attempts++;
    job.startedAt = new Date();

    this.addJobLog(
      job,
      LogLevel.INFO,
      `Started processing attempt ${job.attempts}`
    );
    this.emit('job:started', job);
    console.log(`⚡ Processing job: ${job.type} (${job.id})`);

    try {
      // Set timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), job.options.timeout);
      });

      const processingPromise = processor.process(job);
      const result = await Promise.race([processingPromise, timeoutPromise]);

      await this.completeJob(job, result);
    } catch (error) {
      await this.handleJobError(job, error as Error);
    }
  }

  /**
   * Complete a job successfully
   */
  private async completeJob(job: QueueJob, result: any): Promise<void> {
    job.status = JobStatus.COMPLETED;
    job.result = result;
    job.completedAt = new Date();
    job.progress = 100;

    const processingTime = job.startedAt
      ? job.completedAt.getTime() - job.startedAt.getTime()
      : 0;

    this.addJobLog(
      job,
      LogLevel.INFO,
      `Job completed successfully in ${processingTime}ms`
    );
    this.metrics.completedJobs++;
    this.emit('job:completed', job);
    console.log(`✅ Job completed: ${job.type} (${job.id})`);

    // Auto-cleanup if configured
    if (job.options.removeOnComplete && job.options.removeOnComplete > 0) {
      setTimeout(() => {
        this.jobs.delete(job.id);
      }, 5000); // Remove after 5 seconds
    }
  }

  /**
   * Fail a job
   */
  private async failJob(job: QueueJob, error: JobError): Promise<void> {
    job.status = JobStatus.FAILED;
    job.error = error;
    job.failedAt = new Date();

    this.addJobLog(job, LogLevel.ERROR, `Job failed: ${error.message}`);
    this.metrics.failedJobs++;
    this.emit('job:failed', job);
    console.error(`❌ Job failed: ${job.type} (${job.id}) - ${error.message}`);

    // Auto-cleanup if configured
    if (job.options.removeOnFail && job.options.removeOnFail > 0) {
      setTimeout(() => {
        this.jobs.delete(job.id);
      }, 10000); // Remove after 10 seconds
    }
  }

  /**
   * Handle job processing error
   */
  private async handleJobError(job: QueueJob, error: Error): Promise<void> {
    const maxRetries = job.options.maxRetries || this.config.maxRetries;

    if (job.attempts < maxRetries) {
      // Retry the job
      job.status = JobStatus.DELAYED;
      const delay = this.calculateBackoffDelay(job);
      job.options.delay = delay;

      this.addJobLog(
        job,
        LogLevel.WARN,
        `Job retry scheduled: attempt ${job.attempts}/${maxRetries} in ${delay}ms`
      );
      console.log(
        `🔄 Job retry scheduled: ${job.type} (${job.id}) - attempt ${job.attempts}/${maxRetries}`
      );
      this.emit('job:retry', job);
    } else {
      // Move to dead letter queue or fail permanently
      if (this.config.deadLetterQueue) {
        job.status = JobStatus.STUCK;
        this.addJobLog(
          job,
          LogLevel.ERROR,
          'Job moved to dead letter queue after max retries'
        );
        console.log(
          `💀 Job moved to dead letter queue: ${job.type} (${job.id})`
        );
        this.emit('job:deadletter', job);
      } else {
        await this.failJob(job, {
          name: error.name,
          message: error.message,
          stack: error.stack || '',
          isRetryable: false,
        });
      }
    }
  }

  /**
   * Calculate backoff delay
   */
  private calculateBackoffDelay(job: QueueJob): number {
    const backoff = job.options.backoff;
    if (!backoff) return 1000;

    const baseDelay = backoff.delay;
    const attempt = job.attempts;

    let delay: number;

    switch (backoff.type) {
      case BackoffStrategy.FIXED:
        delay = baseDelay;
        break;
      case BackoffStrategy.LINEAR:
        delay = baseDelay * attempt;
        break;
      case BackoffStrategy.EXPONENTIAL:
        delay = baseDelay * Math.pow(2, attempt - 1);
        break;
      case BackoffStrategy.POLYNOMIAL:
        delay = baseDelay * Math.pow(attempt, 2);
        break;
      default:
        delay = baseDelay;
    }

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    delay += jitter;

    // Cap maximum delay
    delay = Math.min(delay, 30000); // 30 seconds max

    return Math.floor(delay);
  }

  /**
   * Check rate limiting for job processing
   */
  private checkRateLimit(job: QueueJob): boolean {
    const rateLimit = this.config.rateLimiting;
    if (!rateLimit) return true;

    const key = `${job.type}:${rateLimit.duration}`;
    const now = Date.now();
    const limiter = this.rateLimiters.get(key);

    if (!limiter || now > limiter.resetTime) {
      // Reset rate limiter
      this.rateLimiters.set(key, {
        count: 1,
        resetTime: now + rateLimit.duration,
      });
      return true;
    }

    if (limiter.count < rateLimit.max) {
      limiter.count++;
      return true;
    }

    return false; // Rate limited
  }

  /**
   * Add log entry to job
   */
  private addJobLog(
    job: QueueJob,
    level: LogLevel,
    message: string,
    data?: any
  ): void {
    const log: JobLog = {
      timestamp: new Date(),
      level,
      message,
      data,
    };

    job.logs.push(log);

    // Keep only last 50 logs per job
    if (job.logs.length > 50) {
      job.logs.shift();
    }
  }

  /**
   * Update queue metrics
   */
  private updateMetrics(): void {
    const jobs = Array.from(this.jobs.values());

    this.metrics.activeJobs = jobs.filter(
      (j) => j.status === JobStatus.ACTIVE
    ).length;
    this.metrics.waitingJobs = jobs.filter(
      (j) => j.status === JobStatus.WAITING
    ).length;

    // Calculate average processing time
    const completedJobs = jobs.filter((j) => j.completedAt && j.startedAt);
    if (completedJobs.length > 0) {
      const totalTime = completedJobs.reduce((sum, job) => {
        const processingTime =
          job.completedAt!.getTime() - job.startedAt!.getTime();
        return sum + processingTime;
      }, 0);
      this.metrics.averageProcessingTime = totalTime / completedJobs.length;
    }

    // Calculate throughput (jobs per minute)
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentJobs = jobs.filter(
      (j) => j.completedAt && j.completedAt > oneMinuteAgo
    );
    this.metrics.throughput = recentJobs.length;
  }

  /**
   * Get priority weight for sorting
   */
  private priorityWeight(priority: QueuePriority): number {
    return priority; // Enum values are already numeric
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createQueueService(
  config: Partial<QueueConfig> = {}
): SSGWSGQueueService {
  const defaultConfig: QueueConfig = {
    name: 'ssg-wsg-queue',
    concurrency: 5,
    maxRetries: 3,
    backoffStrategy: BackoffStrategy.EXPONENTIAL,
    priority: QueuePriority.NORMAL,
    delayedProcessing: true,
    rateLimiting: {
      max: 100,
      duration: 60000, // 1 minute
      skipSuccessful: false,
      skipFailed: false,
    },
    deadLetterQueue: true,
  };

  return new SSGWSGQueueService({ ...defaultConfig, ...config });
}

// ============================================================================
// BUILT-IN JOB PROCESSORS
// ============================================================================

export class DataSyncProcessor implements QueueProcessor {
  async process(job: QueueJob): Promise<any> {
    console.log(`📊 Processing data sync job: ${job.id}`);

    // Update progress
    job.progress = 25;

    // Simulate data synchronization
    await new Promise((resolve) => setTimeout(resolve, 2000));

    job.progress = 75;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      syncedRecords: Math.floor(Math.random() * 1000) + 100,
      syncTime: new Date().toISOString(),
    };
  }
}

export class WebhookDeliveryProcessor implements QueueProcessor {
  async process(job: QueueJob): Promise<any> {
    console.log(`🔗 Processing webhook delivery: ${job.id}`);

    const { url, payload, headers } = job.data;

    job.progress = 50;

    // Simulate webhook delivery
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      delivered: true,
      responseStatus: 200,
      deliveredAt: new Date().toISOString(),
    };
  }
}

export class ReportGenerationProcessor implements QueueProcessor {
  async process(job: QueueJob): Promise<any> {
    console.log(`📄 Processing report generation: ${job.id}`);

    // Simulate long-running report generation with progress updates
    for (let i = 1; i <= 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      job.progress = i * 10;
    }

    return {
      reportUrl: `https://reports.example.com/report_${job.id}.pdf`,
      generatedAt: new Date().toISOString(),
      fileSize: Math.floor(Math.random() * 1000000) + 100000,
    };
  }
}
