import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import {
  CommunicationRecord,
  CommunicationChannel,
  CommunicationType,
  CommunicationStatus,
  CommunicationTemplate,
  CommunicationRule,
  CommunicationTrigger,
  CommunicationCondition,
  TemplateVariable,
  UUID,
  createUUID,
} from '../types';

/**
 * Comprehensive Communication Service
 * Handles multi-channel communication (email, SMS, in-app, push notifications)
 */
export class CommunicationService extends EventEmitter {
  private communications: Map<UUID, CommunicationRecord> = new Map();
  private templates: Map<UUID, CommunicationTemplate> = new Map();
  private rules: Map<UUID, CommunicationRule> = new Map();
  private emailTransporter: nodemailer.Transporter | null = null;
  private twilioClient: twilio.Twilio | null = null;

  constructor(config?: {
    email?: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    twilio?: {
      accountSid: string;
      authToken: string;
      fromNumber: string;
    };
  }) {
    super();

    if (config?.email) {
      this.setupEmailTransporter(config.email);
    }

    if (config?.twilio) {
      this.setupTwilioClient(config.twilio);
    }
  }

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  /**
   * Create communication template
   */
  async createTemplate(
    templateData: Omit<CommunicationTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CommunicationTemplate> {
    const id = createUUID(uuidv4());
    const now = new Date();

    const template: CommunicationTemplate = {
      ...templateData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.templates.set(id, template);

    this.emit('templateCreated', { template });

    return template;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: UUID): Promise<CommunicationTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get templates by type and channel
   */
  async getTemplates(filters?: {
    channel?: CommunicationChannel;
    type?: CommunicationType;
    isActive?: boolean;
    tags?: string[];
  }): Promise<CommunicationTemplate[]> {
    let templates = Array.from(this.templates.values());

    if (filters?.channel) {
      templates = templates.filter((t) => t.channel === filters.channel);
    }

    if (filters?.type) {
      templates = templates.filter((t) => t.type === filters.type);
    }

    if (filters?.isActive !== undefined) {
      templates = templates.filter((t) => t.isActive === filters.isActive);
    }

    if (filters?.tags && filters.tags.length > 0) {
      templates = templates.filter((t) =>
        filters.tags!.some((tag) => t.tags.includes(tag))
      );
    }

    return templates;
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: UUID,
    updates: Partial<
      Omit<CommunicationTemplate, 'id' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<CommunicationTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template) {
      return null;
    }

    const updatedTemplate: CommunicationTemplate = {
      ...template,
      ...updates,
      id: templateId,
      createdAt: template.createdAt,
      updatedAt: new Date(),
    };

    this.templates.set(templateId, updatedTemplate);

    this.emit('templateUpdated', {
      templateId,
      template: updatedTemplate,
      changes: updates,
    });

    return updatedTemplate;
  }

  // ============================================================================
  // COMMUNICATION RULES
  // ============================================================================

  /**
   * Create communication rule
   */
  async createRule(
    ruleData: Omit<CommunicationRule, 'id'>
  ): Promise<CommunicationRule> {
    const id = createUUID(uuidv4());

    const rule: CommunicationRule = {
      ...ruleData,
      id,
    };

    this.rules.set(id, rule);

    this.emit('ruleCreated', { rule });

    return rule;
  }

  /**
   * Get rules by trigger event
   */
  async getRulesByTrigger(event: string): Promise<CommunicationRule[]> {
    return Array.from(this.rules.values())
      .filter((rule) => rule.isActive && rule.trigger.event === event)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Process trigger event
   */
  async processTriggerEvent(
    event: string,
    participantId: UUID,
    eventData: Record<string, any>
  ): Promise<CommunicationRecord[]> {
    const rules = await this.getRulesByTrigger(event);
    const sentCommunications: CommunicationRecord[] = [];

    for (const rule of rules) {
      try {
        // Check if conditions are met
        const conditionsMet = this.evaluateConditions(
          rule.conditions,
          eventData
        );
        if (!conditionsMet) {
          continue;
        }

        // Get template
        const template = await this.getTemplate(rule.templateId);
        if (!template) {
          console.warn(
            `Template ${rule.templateId} not found for rule ${rule.id}`
          );
          continue;
        }

        // Schedule or send communication
        const communication = await this.scheduleOrSendCommunication(
          participantId,
          template,
          rule.channel,
          eventData,
          rule.delay
        );

        sentCommunications.push(communication);
      } catch (error) {
        console.error(`Error processing rule ${rule.id}:`, error);
        this.emit('ruleFailed', { rule, error, participantId, eventData });
      }
    }

    return sentCommunications;
  }

  // ============================================================================
  // SENDING COMMUNICATIONS
  // ============================================================================

  /**
   * Send immediate communication
   */
  async sendCommunication(
    participantId: UUID,
    templateId: UUID,
    channel: CommunicationChannel,
    variables: Record<string, any> = {}
  ): Promise<CommunicationRecord> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    return await this.scheduleOrSendCommunication(
      participantId,
      template,
      channel,
      variables,
      0
    );
  }

  /**
   * Schedule communication for later
   */
  async scheduleCommunication(
    participantId: UUID,
    templateId: UUID,
    channel: CommunicationChannel,
    scheduledAt: Date,
    variables: Record<string, any> = {}
  ): Promise<CommunicationRecord> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const delayMinutes = Math.max(
      0,
      Math.round((scheduledAt.getTime() - Date.now()) / 60000)
    );
    return await this.scheduleOrSendCommunication(
      participantId,
      template,
      channel,
      variables,
      delayMinutes
    );
  }

  /**
   * Send bulk communications
   */
  async sendBulkCommunication(
    participantIds: UUID[],
    templateId: UUID,
    channel: CommunicationChannel,
    variables: Record<string, any> = {}
  ): Promise<{
    successful: CommunicationRecord[];
    failed: { participantId: UUID; error: string }[];
  }> {
    const successful: CommunicationRecord[] = [];
    const failed: { participantId: UUID; error: string }[] = [];

    for (const participantId of participantIds) {
      try {
        const communication = await this.sendCommunication(
          participantId,
          templateId,
          channel,
          variables
        );
        successful.push(communication);
      } catch (error) {
        failed.push({
          participantId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.emit('bulkCommunicationCompleted', { successful, failed });

    return { successful, failed };
  }

  // ============================================================================
  // CHANNEL-SPECIFIC SENDING
  // ============================================================================

  /**
   * Send email
   */
  private async sendEmail(
    participantEmail: string,
    subject: string,
    content: string,
    metadata: Record<string, any>
  ): Promise<{ messageId?: string; error?: string }> {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not configured');
    }

    try {
      const mailOptions = {
        from: metadata.fromEmail || process.env.DEFAULT_FROM_EMAIL,
        to: participantEmail,
        subject,
        html: content,
        text: this.htmlToText(content),
      };

      const result = await this.emailTransporter.sendMail(mailOptions);

      return { messageId: result.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown email error',
      };
    }
  }

  /**
   * Send SMS
   */
  private async sendSMS(
    participantPhone: string,
    content: string,
    metadata: Record<string, any>
  ): Promise<{ messageId?: string; error?: string }> {
    if (!this.twilioClient) {
      throw new Error('Twilio client not configured');
    }

    try {
      const message = await this.twilioClient.messages.create({
        body: content,
        from: metadata.fromNumber || process.env.TWILIO_FROM_NUMBER,
        to: participantPhone,
      });

      return { messageId: message.sid };
    } catch (error) {
      console.error('SMS send error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown SMS error',
      };
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(
    participantId: UUID,
    subject: string,
    content: string,
    metadata: Record<string, any>
  ): Promise<{ messageId?: string; error?: string }> {
    // In a real implementation, this would integrate with your in-app notification system
    try {
      // Store notification in database or send via WebSocket
      const notificationId = uuidv4();

      this.emit('inAppNotificationSent', {
        participantId,
        notificationId,
        subject,
        content,
        metadata,
      });

      return { messageId: notificationId };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Unknown in-app notification error',
      };
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    participantId: UUID,
    subject: string,
    content: string,
    metadata: Record<string, any>
  ): Promise<{ messageId?: string; error?: string }> {
    // In a real implementation, this would integrate with Firebase Cloud Messaging or similar
    try {
      const notificationId = uuidv4();

      this.emit('pushNotificationSent', {
        participantId,
        notificationId,
        subject,
        content,
        metadata,
      });

      return { messageId: notificationId };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Unknown push notification error',
      };
    }
  }

  // ============================================================================
  // COMMUNICATION TRACKING
  // ============================================================================

  /**
   * Get communication history for participant
   */
  async getParticipantCommunications(
    participantId: UUID,
    options?: {
      channel?: CommunicationChannel;
      type?: CommunicationType;
      status?: CommunicationStatus[];
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<CommunicationRecord[]> {
    let communications = Array.from(this.communications.values()).filter(
      (comm) => comm.participantId === participantId
    );

    if (options?.channel) {
      communications = communications.filter(
        (comm) => comm.channel === options.channel
      );
    }

    if (options?.type) {
      communications = communications.filter(
        (comm) => comm.type === options.type
      );
    }

    if (options?.status && options.status.length > 0) {
      communications = communications.filter((comm) =>
        options.status!.includes(comm.status)
      );
    }

    if (options?.startDate) {
      communications = communications.filter(
        (comm) => comm.createdAt >= options.startDate!
      );
    }

    if (options?.endDate) {
      communications = communications.filter(
        (comm) => comm.createdAt <= options.endDate!
      );
    }

    // Sort by creation date (newest first)
    communications.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    if (options?.limit) {
      communications = communications.slice(0, options.limit);
    }

    return communications;
  }

  /**
   * Update communication status
   */
  async updateCommunicationStatus(
    communicationId: UUID,
    status: CommunicationStatus,
    metadata?: Record<string, any>
  ): Promise<CommunicationRecord | null> {
    const communication = this.communications.get(communicationId);
    if (!communication) {
      return null;
    }

    const now = new Date();
    const updatedCommunication: CommunicationRecord = {
      ...communication,
      status,
      metadata: { ...communication.metadata, ...metadata },
      updatedAt: now,
    };

    // Set status-specific timestamps
    switch (status) {
      case CommunicationStatus.SENT:
        updatedCommunication.sentAt = now;
        break;
      case CommunicationStatus.DELIVERED:
        updatedCommunication.deliveredAt = now;
        break;
      case CommunicationStatus.READ:
        updatedCommunication.readAt = now;
        break;
    }

    this.communications.set(communicationId, updatedCommunication);

    this.emit('communicationStatusUpdated', {
      communication: updatedCommunication,
      previousStatus: communication.status,
    });

    return updatedCommunication;
  }

  /**
   * Mark communication as read
   */
  async markAsRead(communicationId: UUID): Promise<CommunicationRecord | null> {
    return await this.updateCommunicationStatus(
      communicationId,
      CommunicationStatus.READ
    );
  }

  /**
   * Get communication statistics
   */
  async getCommunicationStats(options?: {
    participantId?: UUID;
    channel?: CommunicationChannel;
    type?: CommunicationType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    total: number;
    byStatus: Record<CommunicationStatus, number>;
    byChannel: Record<CommunicationChannel, number>;
    byType: Record<CommunicationType, number>;
    deliveryRate: number;
    readRate: number;
  }> {
    let communications = Array.from(this.communications.values());

    // Apply filters
    if (options?.participantId) {
      communications = communications.filter(
        (comm) => comm.participantId === options.participantId
      );
    }

    if (options?.channel) {
      communications = communications.filter(
        (comm) => comm.channel === options.channel
      );
    }

    if (options?.type) {
      communications = communications.filter(
        (comm) => comm.type === options.type
      );
    }

    if (options?.startDate) {
      communications = communications.filter(
        (comm) => comm.createdAt >= options.startDate!
      );
    }

    if (options?.endDate) {
      communications = communications.filter(
        (comm) => comm.createdAt <= options.endDate!
      );
    }

    // Calculate statistics
    const byStatus = {} as Record<CommunicationStatus, number>;
    const byChannel = {} as Record<CommunicationChannel, number>;
    const byType = {} as Record<CommunicationType, number>;

    for (const status of Object.values(CommunicationStatus)) {
      byStatus[status] = communications.filter(
        (comm) => comm.status === status
      ).length;
    }

    for (const channel of Object.values(CommunicationChannel)) {
      byChannel[channel] = communications.filter(
        (comm) => comm.channel === channel
      ).length;
    }

    for (const type of Object.values(CommunicationType)) {
      byType[type] = communications.filter((comm) => comm.type === type).length;
    }

    const sentCount =
      byStatus[CommunicationStatus.SENT] +
      byStatus[CommunicationStatus.DELIVERED] +
      byStatus[CommunicationStatus.READ];

    const deliveredCount =
      byStatus[CommunicationStatus.DELIVERED] +
      byStatus[CommunicationStatus.READ];

    const readCount = byStatus[CommunicationStatus.READ];

    return {
      total: communications.length,
      byStatus,
      byChannel,
      byType,
      deliveryRate: sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0,
      readRate: deliveredCount > 0 ? (readCount / deliveredCount) * 100 : 0,
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async scheduleOrSendCommunication(
    participantId: UUID,
    template: CommunicationTemplate,
    channel: CommunicationChannel,
    variables: Record<string, any>,
    delayMinutes: number = 0
  ): Promise<CommunicationRecord> {
    const communicationId = createUUID(uuidv4());
    const now = new Date();
    const scheduledAt =
      delayMinutes > 0
        ? new Date(now.getTime() + delayMinutes * 60000)
        : undefined;

    // Process template content
    const processedSubject = this.processTemplate(template.subject, variables);
    const processedContent = this.processTemplate(template.content, variables);

    const communication: CommunicationRecord = {
      id: communicationId,
      participantId,
      channel,
      type: template.type,
      subject: processedSubject,
      content: processedContent,
      templateId: template.id,
      status: scheduledAt
        ? CommunicationStatus.SCHEDULED
        : CommunicationStatus.DRAFT,
      scheduledAt,
      responseRequired: template.metadata.requiresResponse || false,
      metadata: { ...template.metadata, ...variables },
      createdAt: now,
      updatedAt: now,
    };

    this.communications.set(communicationId, communication);

    if (scheduledAt) {
      // Schedule for later sending
      setTimeout(() => {
        this.sendScheduledCommunication(communicationId);
      }, delayMinutes * 60000);

      this.emit('communicationScheduled', { communication });
    } else {
      // Send immediately
      await this.sendScheduledCommunication(communicationId);
    }

    return communication;
  }

  private async sendScheduledCommunication(
    communicationId: UUID
  ): Promise<void> {
    const communication = this.communications.get(communicationId);
    if (!communication) {
      return;
    }

    try {
      // Update status to sending
      await this.updateCommunicationStatus(
        communicationId,
        CommunicationStatus.SENDING
      );

      // Get participant contact information (this would come from participant service)
      const participantContact = await this.getParticipantContact(
        communication.participantId
      );

      let result: { messageId?: string; error?: string };

      switch (communication.channel) {
        case CommunicationChannel.EMAIL:
          result = await this.sendEmail(
            participantContact.email,
            communication.subject,
            communication.content,
            communication.metadata
          );
          break;

        case CommunicationChannel.SMS:
          result = await this.sendSMS(
            participantContact.phone,
            communication.content,
            communication.metadata
          );
          break;

        case CommunicationChannel.IN_APP:
          result = await this.sendInAppNotification(
            communication.participantId,
            communication.subject,
            communication.content,
            communication.metadata
          );
          break;

        case CommunicationChannel.PUSH:
          result = await this.sendPushNotification(
            communication.participantId,
            communication.subject,
            communication.content,
            communication.metadata
          );
          break;

        default:
          throw new Error(
            `Unsupported communication channel: ${communication.channel}`
          );
      }

      if (result.error) {
        await this.updateCommunicationStatus(
          communicationId,
          CommunicationStatus.FAILED,
          {
            error: result.error,
          }
        );
      } else {
        await this.updateCommunicationStatus(
          communicationId,
          CommunicationStatus.SENT,
          {
            messageId: result.messageId,
          }
        );
      }
    } catch (error) {
      console.error(`Failed to send communication ${communicationId}:`, error);
      await this.updateCommunicationStatus(
        communicationId,
        CommunicationStatus.FAILED,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  private processTemplate(
    template: string,
    variables: Record<string, any>
  ): string {
    let processed = template;

    // Replace variables in format {{variableName}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    }

    // Handle common template functions
    processed = processed.replace(/{{date}}/g, new Date().toLocaleDateString());
    processed = processed.replace(/{{datetime}}/g, new Date().toLocaleString());
    processed = processed.replace(/{{time}}/g, new Date().toLocaleTimeString());

    return processed;
  }

  private evaluateConditions(
    conditions: CommunicationCondition[],
    data: Record<string, any>
  ): boolean {
    if (conditions.length === 0) {
      return true;
    }

    return conditions.every((condition) => {
      const fieldValue = data[condition.field];

      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  private async getParticipantContact(participantId: UUID): Promise<{
    email: string;
    phone: string;
  }> {
    // In a real implementation, this would fetch from participant service
    return {
      email: 'participant@example.com',
      phone: '+1234567890',
    };
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  private setupEmailTransporter(config: any): void {
    this.emailTransporter = nodemailer.createTransport(config);
  }

  private setupTwilioClient(config: any): void {
    this.twilioClient = twilio(config.accountSid, config.authToken);
  }
}
