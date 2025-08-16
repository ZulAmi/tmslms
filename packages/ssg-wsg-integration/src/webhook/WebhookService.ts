/**
 * Webhook Service
 * Bidirectional webhook integration for real-time updates
 */

import { EventEmitter } from 'events';
import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import {
  WebhookConfig,
  WebhookEvent,
  WebhookRetryPolicy,
  QueueJob,
  JobType,
  QueuePriority,
} from '../types';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
  source: string;
  id: string;
  signature?: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  url: string;
  status: WebhookDeliveryStatus;
  attempts: number;
  lastAttempt?: Date;
  nextAttempt?: Date;
  response?: {
    status: number;
    headers: Record<string, string>;
    body: string;
    duration: number;
  };
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export enum WebhookDeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface WebhookEndpoint {
  url: string;
  events: WebhookEvent[];
  secret: string;
  headers: Record<string, string>;
  timeout: number;
  active: boolean;
}

export interface WebhookMetrics {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageResponseTime: number;
  successRate: number;
  deliveriesByEvent: Record<WebhookEvent, number>;
  deliveriesByEndpoint: Record<string, number>;
}

export class SSGWSGWebhookService extends EventEmitter {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private deliveries: Map<string, WebhookDelivery> = new Map();
  private endpoints: Map<string, WebhookEndpoint> = new Map();
  private queueService?: any; // Will be injected
  private metrics: WebhookMetrics;

  constructor() {
    super();
    this.metrics = {
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      averageResponseTime: 0,
      successRate: 0,
      deliveriesByEvent: {} as Record<WebhookEvent, number>,
      deliveriesByEndpoint: {},
    };
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Initialize webhook service with queue service
   */
  initialize(queueService: any): void {
    this.queueService = queueService;
    console.log('🔗 SSG-WSG Webhook Service initialized');
  }

  /**
   * Register a webhook endpoint
   */
  registerWebhook(config: WebhookConfig): string {
    const webhookId = this.generateWebhookId();
    this.webhooks.set(webhookId, {
      ...config,
      createdAt: new Date(),
      successfulDeliveries: 0,
      failedDeliveries: 0,
    });

    console.log(
      `📝 Webhook registered: ${config.url} for events: ${config.events.join(', ')}`
    );
    this.emit('webhook:registered', { webhookId, config });

    return webhookId;
  }

  /**
   * Register webhook endpoint
   */
  registerEndpoint(endpoint: WebhookEndpoint): string {
    const endpointId = this.generateEndpointId();
    this.endpoints.set(endpointId, endpoint);

    console.log(`📝 Webhook endpoint registered: ${endpoint.url}`);
    return endpointId;
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(
    event: WebhookEvent,
    data: any,
    options: {
      source?: string;
      immediate?: boolean;
      priority?: QueuePriority;
    } = {}
  ): Promise<string[]> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      source: options.source || 'ssg-wsg-integration',
      id: this.generateEventId(),
    };

    console.log(`🚀 Triggering webhook event: ${event}`);
    this.emit('webhook:event', { event, payload });

    const deliveryIds: string[] = [];
    const webhooksToTrigger = Array.from(this.webhooks.values()).filter(
      (webhook) => webhook.active && webhook.events.includes(event)
    );

    for (const webhook of webhooksToTrigger) {
      const deliveryId = await this.createDelivery(webhook, payload, options);
      deliveryIds.push(deliveryId);
    }

    console.log(
      `📬 Created ${deliveryIds.length} webhook deliveries for event: ${event}`
    );
    return deliveryIds;
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);

    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Process incoming webhook
   */
  async processIncomingWebhook(
    endpointId: string,
    payload: WebhookPayload,
    headers: Record<string, string>
  ): Promise<{ success: boolean; message: string }> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      return { success: false, message: 'Endpoint not found' };
    }

    if (!endpoint.active) {
      return { success: false, message: 'Endpoint not active' };
    }

    // Verify signature if provided
    const signature = headers['x-webhook-signature'];
    if (signature && endpoint.secret) {
      const isValid = this.verifySignature(
        JSON.stringify(payload),
        signature,
        endpoint.secret
      );

      if (!isValid) {
        console.error('🔒 Webhook signature verification failed');
        return { success: false, message: 'Invalid signature' };
      }
    }

    // Check if endpoint accepts this event
    if (!endpoint.events.includes(payload.event)) {
      return { success: false, message: 'Event not supported by endpoint' };
    }

    console.log(
      `📥 Processing incoming webhook: ${payload.event} from ${payload.source}`
    );
    this.emit('webhook:incoming', { endpointId, payload, headers });

    // Process the webhook data
    try {
      await this.handleIncomingWebhook(payload);
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('❌ Failed to process incoming webhook:', error);
      return { success: false, message: 'Processing failed' };
    }
  }

  /**
   * Get webhook delivery status
   */
  getDelivery(deliveryId: string): WebhookDelivery | undefined {
    return this.deliveries.get(deliveryId);
  }

  /**
   * Get webhook metrics
   */
  getMetrics(): WebhookMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * List webhooks
   */
  listWebhooks(): WebhookConfig[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Update webhook configuration
   */
  updateWebhook(webhookId: string, updates: Partial<WebhookConfig>): boolean {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return false;

    Object.assign(webhook, updates);
    console.log(`✏️ Webhook updated: ${webhookId}`);
    this.emit('webhook:updated', { webhookId, updates });

    return true;
  }

  /**
   * Delete webhook
   */
  deleteWebhook(webhookId: string): boolean {
    const deleted = this.webhooks.delete(webhookId);
    if (deleted) {
      console.log(`🗑️ Webhook deleted: ${webhookId}`);
      this.emit('webhook:deleted', { webhookId });
    }
    return deleted;
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(deliveryId: string): Promise<boolean> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery || delivery.status !== WebhookDeliveryStatus.FAILED) {
      return false;
    }

    console.log(`🔄 Retrying webhook delivery: ${deliveryId}`);

    delivery.status = WebhookDeliveryStatus.PENDING;
    delivery.nextAttempt = new Date();

    if (this.queueService) {
      await this.queueService.addJob(
        JobType.WEBHOOK_DELIVERY,
        { deliveryId },
        { priority: QueuePriority.HIGH }
      );
    } else {
      // Fallback to immediate delivery
      await this.deliverWebhook(delivery);
    }

    return true;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Create webhook delivery
   */
  private async createDelivery(
    webhook: WebhookConfig,
    payload: WebhookPayload,
    options: any
  ): Promise<string> {
    const deliveryId = this.generateDeliveryId();

    // Add signature to payload
    const signedPayload = {
      ...payload,
      signature: this.generateSignature(
        JSON.stringify(payload.data),
        webhook.secret
      ),
    };

    const delivery: WebhookDelivery = {
      id: deliveryId,
      webhookId: this.getWebhookId(webhook),
      event: payload.event,
      payload: signedPayload,
      url: webhook.url,
      status: WebhookDeliveryStatus.PENDING,
      attempts: 0,
      createdAt: new Date(),
      nextAttempt: new Date(),
    };

    this.deliveries.set(deliveryId, delivery);
    this.metrics.totalDeliveries++;

    // Queue for delivery or deliver immediately
    if (options.immediate || !this.queueService) {
      // Immediate delivery
      setImmediate(() => this.deliverWebhook(delivery));
    } else {
      // Queue for background processing
      await this.queueService.addJob(
        JobType.WEBHOOK_DELIVERY,
        { deliveryId },
        {
          priority: options.priority || QueuePriority.NORMAL,
          delay: 0,
        }
      );
    }

    return deliveryId;
  }

  /**
   * Deliver webhook
   */
  async deliverWebhook(delivery: WebhookDelivery): Promise<void> {
    const webhook = this.getWebhookById(delivery.webhookId);
    if (!webhook) {
      console.error(`❌ Webhook not found for delivery: ${delivery.id}`);
      return;
    }

    delivery.attempts++;
    delivery.lastAttempt = new Date();
    delivery.status = WebhookDeliveryStatus.PENDING;

    const startTime = Date.now();

    try {
      console.log(
        `📤 Delivering webhook: ${delivery.event} to ${delivery.url} (attempt ${delivery.attempts})`
      );

      const response = await axios.post(delivery.url, delivery.payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': delivery.event,
          'X-Webhook-ID': delivery.id,
          'X-Webhook-Timestamp': delivery.payload.timestamp,
          'X-Webhook-Signature': delivery.payload.signature || '',
          ...webhook.headers,
        },
        timeout: webhook.timeout,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const duration = Date.now() - startTime;

      delivery.status = WebhookDeliveryStatus.DELIVERED;
      delivery.completedAt = new Date();
      delivery.response = {
        status: response.status,
        headers: response.headers as Record<string, string>,
        body:
          typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data),
        duration,
      };

      webhook.successfulDeliveries++;
      webhook.lastDelivery = new Date();
      this.metrics.successfulDeliveries++;

      console.log(
        `✅ Webhook delivered successfully: ${delivery.id} (${duration}ms)`
      );
      this.emit('webhook:delivered', { delivery, response });
    } catch (error: any) {
      const duration = Date.now() - startTime;

      delivery.error = error.message;
      delivery.response = {
        status: error.response?.status || 0,
        headers: error.response?.headers || {},
        body: error.response?.data || error.message,
        duration,
      };

      // Check if we should retry
      if (delivery.attempts < webhook.retryPolicy.maxRetries) {
        delivery.status = WebhookDeliveryStatus.PENDING;
        delivery.nextAttempt = this.calculateNextRetry(
          delivery,
          webhook.retryPolicy
        );

        console.log(
          `🔄 Webhook delivery failed, will retry: ${delivery.id} (attempt ${delivery.attempts}/${webhook.retryPolicy.maxRetries})`
        );

        // Schedule retry
        if (this.queueService) {
          const delay = delivery.nextAttempt.getTime() - Date.now();
          await this.queueService.addJob(
            JobType.WEBHOOK_DELIVERY,
            { deliveryId: delivery.id },
            { delay: Math.max(0, delay) }
          );
        }
      } else {
        delivery.status = WebhookDeliveryStatus.FAILED;
        delivery.completedAt = new Date();
        webhook.failedDeliveries++;
        this.metrics.failedDeliveries++;

        console.error(`❌ Webhook delivery failed permanently: ${delivery.id}`);
      }

      this.emit('webhook:failed', { delivery, error });
    }
  }

  /**
   * Handle incoming webhook
   */
  private async handleIncomingWebhook(payload: WebhookPayload): Promise<void> {
    // Process different types of incoming webhooks
    switch (payload.event) {
      case WebhookEvent.APPLICATION_SUBMITTED:
        await this.handleApplicationSubmitted(payload.data);
        break;
      case WebhookEvent.APPLICATION_APPROVED:
        await this.handleApplicationApproved(payload.data);
        break;
      case WebhookEvent.PAYMENT_PROCESSED:
        await this.handlePaymentProcessed(payload.data);
        break;
      case WebhookEvent.COURSE_COMPLETED:
        await this.handleCourseCompleted(payload.data);
        break;
      default:
        console.log(
          `📥 Received webhook event: ${payload.event} (no specific handler)`
        );
    }
  }

  /**
   * Application submitted handler
   */
  private async handleApplicationSubmitted(data: any): Promise<void> {
    console.log(
      '📝 Processing application submitted webhook:',
      data.applicationId
    );
    // Implement application submission logic
  }

  /**
   * Application approved handler
   */
  private async handleApplicationApproved(data: any): Promise<void> {
    console.log(
      '✅ Processing application approved webhook:',
      data.applicationId
    );
    // Implement application approval logic
  }

  /**
   * Payment processed handler
   */
  private async handlePaymentProcessed(data: any): Promise<void> {
    console.log('💰 Processing payment processed webhook:', data.paymentId);
    // Implement payment processing logic
  }

  /**
   * Course completed handler
   */
  private async handleCourseCompleted(data: any): Promise<void> {
    console.log(
      '🎓 Processing course completed webhook:',
      data.courseId,
      data.userId
    );
    // Implement course completion logic
  }

  /**
   * Calculate next retry time
   */
  private calculateNextRetry(
    delivery: WebhookDelivery,
    retryPolicy: WebhookRetryPolicy
  ): Date {
    const baseDelay = retryPolicy.initialDelay || 1000;
    const multiplier = retryPolicy.backoffMultiplier || 2;
    const maxDelay = retryPolicy.maxDelay || 300000; // 5 minutes

    let delay = baseDelay * Math.pow(multiplier, delivery.attempts - 1);
    delay = Math.min(delay, maxDelay);

    // Add jitter
    const jitter = Math.random() * 0.1 * delay;
    delay += jitter;

    return new Date(Date.now() + delay);
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const deliveries = Array.from(this.deliveries.values());

    this.metrics.totalDeliveries = deliveries.length;
    this.metrics.successfulDeliveries = deliveries.filter(
      (d) => d.status === WebhookDeliveryStatus.DELIVERED
    ).length;
    this.metrics.failedDeliveries = deliveries.filter(
      (d) => d.status === WebhookDeliveryStatus.FAILED
    ).length;

    this.metrics.successRate =
      this.metrics.totalDeliveries > 0
        ? this.metrics.successfulDeliveries / this.metrics.totalDeliveries
        : 0;

    // Calculate average response time
    const completedDeliveries = deliveries.filter((d) => d.response?.duration);
    if (completedDeliveries.length > 0) {
      const totalDuration = completedDeliveries.reduce(
        (sum, d) => sum + (d.response?.duration || 0),
        0
      );
      this.metrics.averageResponseTime =
        totalDuration / completedDeliveries.length;
    }

    // Count by event type
    this.metrics.deliveriesByEvent = {} as Record<WebhookEvent, number>;
    for (const delivery of deliveries) {
      this.metrics.deliveriesByEvent[delivery.event] =
        (this.metrics.deliveriesByEvent[delivery.event] || 0) + 1;
    }

    // Count by endpoint
    this.metrics.deliveriesByEndpoint = {};
    for (const delivery of deliveries) {
      this.metrics.deliveriesByEndpoint[delivery.url] =
        (this.metrics.deliveriesByEndpoint[delivery.url] || 0) + 1;
    }
  }

  /**
   * Generate unique IDs
   */
  private generateWebhookId(): string {
    return `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEndpointId(): string {
    return `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDeliveryId(): string {
    return `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get webhook by ID
   */
  private getWebhookById(webhookId: string): WebhookConfig | undefined {
    return this.webhooks.get(webhookId);
  }

  /**
   * Get webhook ID for config
   */
  private getWebhookId(config: WebhookConfig): string {
    for (const [id, webhook] of this.webhooks.entries()) {
      if (webhook === config) return id;
    }
    return '';
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createWebhookService(): SSGWSGWebhookService {
  return new SSGWSGWebhookService();
}

// ============================================================================
// WEBHOOK DELIVERY PROCESSOR (for queue integration)
// ============================================================================

export class WebhookDeliveryQueueProcessor {
  constructor(private webhookService: SSGWSGWebhookService) {}

  async process(job: QueueJob): Promise<any> {
    const { deliveryId } = job.data;
    const delivery = this.webhookService.getDelivery(deliveryId);

    if (!delivery) {
      throw new Error(`Delivery not found: ${deliveryId}`);
    }

    await (this.webhookService as any).deliverWebhook(delivery);

    return {
      deliveryId,
      status: delivery.status,
      attempts: delivery.attempts,
    };
  }
}
