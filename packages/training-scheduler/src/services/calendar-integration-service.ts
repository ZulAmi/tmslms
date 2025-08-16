import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import { addMinutes, format, parseISO } from 'date-fns';
import {
  UUID,
  createUUID,
  CalendarIntegration,
  CalendarProvider,
  CalendarSyncError,
  CalendarSyncSettings,
  TrainingSession,
  Instructor,
  Resource,
  SchedulingError,
} from '../types';

export interface ICalendarIntegrationService {
  // Integration Management
  createIntegration(
    integration: Omit<CalendarIntegration, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CalendarIntegration>;
  updateIntegration(
    id: UUID,
    updates: Partial<CalendarIntegration>
  ): Promise<CalendarIntegration>;
  deleteIntegration(id: UUID): Promise<boolean>;
  getIntegration(id: UUID): Promise<CalendarIntegration | null>;
  getUserIntegrations(userId: UUID): Promise<CalendarIntegration[]>;
  getResourceIntegrations(resourceId: UUID): Promise<CalendarIntegration[]>;

  // OAuth & Authentication
  initiateOAuthFlow(
    provider: CalendarProvider,
    userId?: UUID,
    resourceId?: UUID
  ): Promise<OAuthFlowResult>;
  completeOAuthFlow(code: string, state: string): Promise<CalendarIntegration>;
  refreshAccessToken(integrationId: UUID): Promise<boolean>;
  validateConnection(integrationId: UUID): Promise<ConnectionStatus>;

  // Calendar Synchronization
  syncCalendar(integrationId: UUID): Promise<SyncResult>;
  syncAllCalendars(): Promise<SyncResult[]>;
  exportSessionToCalendar(
    sessionId: UUID,
    integrationId: UUID
  ): Promise<CalendarEvent>;
  importEventsFromCalendar(
    integrationId: UUID,
    dateRange?: DateRange
  ): Promise<CalendarEvent[]>;

  // Event Management
  createCalendarEvent(
    integrationId: UUID,
    event: CalendarEventData
  ): Promise<CalendarEvent>;
  updateCalendarEvent(
    integrationId: UUID,
    eventId: string,
    updates: Partial<CalendarEventData>
  ): Promise<CalendarEvent>;
  deleteCalendarEvent(integrationId: UUID, eventId: string): Promise<boolean>;
  getCalendarEvent(
    integrationId: UUID,
    eventId: string
  ): Promise<CalendarEvent | null>;

  // Conflict Detection
  detectCalendarConflicts(
    integrationId: UUID,
    session: TrainingSession
  ): Promise<CalendarConflict[]>;
  resolveCalendarConflict(
    conflictId: UUID,
    resolution: ConflictResolution
  ): Promise<boolean>;

  // Availability Checking
  checkExternalAvailability(
    integrationId: UUID,
    startTime: Date,
    endTime: Date
  ): Promise<AvailabilityStatus>;
  getFreeBusyInformation(
    integrationId: UUID,
    dateRange: DateRange
  ): Promise<FreeBusySlot[]>;

  // Bulk Operations
  bulkExportSessions(
    sessionIds: UUID[],
    integrationId: UUID
  ): Promise<BulkExportResult>;
  bulkSyncCalendars(integrationIds: UUID[]): Promise<SyncResult[]>;
}

export interface OAuthFlowResult {
  authUrl: string;
  state: string;
  expiresAt: Date;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastSuccessfulSync?: Date;
  errors: string[];
  accountInfo?: {
    email: string;
    name: string;
    calendars: CalendarInfo[];
  };
}

export interface CalendarInfo {
  id: string;
  name: string;
  primary: boolean;
  accessRole: 'owner' | 'reader' | 'writer' | 'freeBusyReader';
  color?: string;
}

export interface SyncResult {
  integrationId: UUID;
  success: boolean;
  eventsImported: number;
  eventsExported: number;
  eventsUpdated: number;
  eventsDeleted: number;
  conflicts: CalendarConflict[];
  errors: CalendarSyncError[];
  syncedAt: Date;
  nextSyncAt?: Date;
}

export interface CalendarEventData {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: CalendarAttendee[];
  isAllDay?: boolean;
  recurrence?: RecurrenceRule;
  visibility?: 'public' | 'private' | 'confidential';
  reminders?: CalendarReminder[];
  metadata?: Record<string, any>;
}

export interface CalendarEvent extends CalendarEventData {
  id: string;
  calendarId: string;
  externalId?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  created: Date;
  updated: Date;
  creator?: CalendarAttendee;
  organizer?: CalendarAttendee;
  htmlLink?: string;
  iCalUID?: string;
}

export interface CalendarAttendee {
  email: string;
  displayName?: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  optional?: boolean;
  resource?: boolean;
  comment?: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  count?: number;
  until?: Date;
  byDay?: string[];
  byMonth?: number[];
  byMonthDay?: number[];
}

export interface CalendarReminder {
  method: 'email' | 'popup' | 'sms';
  minutes: number;
}

export interface CalendarConflict {
  id: UUID;
  integrationId: UUID;
  sessionId?: UUID;
  externalEventId: string;
  conflictType: 'time_overlap' | 'resource_conflict' | 'duplicate_event';
  description: string;
  severity: 'low' | 'medium' | 'high';
  tmslmsEvent: CalendarEvent;
  externalEvent: CalendarEvent;
  suggestedResolutions: ConflictResolution[];
  detectedAt: Date;
  resolvedAt?: Date;
}

export interface ConflictResolution {
  id: UUID;
  type:
    | 'keep_tmslms'
    | 'keep_external'
    | 'merge'
    | 'reschedule_tmslms'
    | 'reschedule_external';
  description: string;
  impact: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
}

export interface AvailabilityStatus {
  isAvailable: boolean;
  conflictingEvents: CalendarEvent[];
  suggestedAlternatives?: TimeSlot[];
}

export interface FreeBusySlot {
  startTime: Date;
  endTime: Date;
  status: 'free' | 'busy' | 'tentative' | 'out_of_office';
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface BulkExportResult {
  totalSessions: number;
  successfulExports: number;
  failedExports: number;
  exportedEvents: CalendarEvent[];
  errors: Array<{ sessionId: UUID; error: string }>;
}

export class CalendarIntegrationService
  extends EventEmitter
  implements ICalendarIntegrationService
{
  private integrations: Map<UUID, CalendarIntegration> = new Map();
  private oauthStates: Map<string, { integrationData: any; expiresAt: Date }> =
    new Map();
  private syncInProgress: Set<UUID> = new Set();

  constructor(
    private readonly databaseService?: any,
    private readonly notificationService?: any,
    private readonly encryptionService?: any,
    private readonly calendarProviders?: Map<
      CalendarProvider,
      CalendarProviderAdapter
    >
  ) {
    super();
    this.initializeProviders();
  }

  // ============================================================================
  // INTEGRATION MANAGEMENT
  // ============================================================================

  async createIntegration(
    integrationData: Omit<CalendarIntegration, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CalendarIntegration> {
    const integration: CalendarIntegration = {
      ...integrationData,
      id: createUUID(uuid()),
      createdAt: new Date(),
      updatedAt: new Date(),
      syncErrors: [],
    };

    // Encrypt sensitive tokens if encryption service is available
    if (this.encryptionService) {
      integration.accessToken = await this.encryptionService.encrypt(
        integration.accessToken
      );
      if (integration.refreshToken) {
        integration.refreshToken = await this.encryptionService.encrypt(
          integration.refreshToken
        );
      }
    }

    this.integrations.set(integration.id, integration);

    if (this.databaseService) {
      await this.databaseService.createCalendarIntegration(integration);
    }

    this.emit('integrationCreated', { integration });

    return integration;
  }

  async updateIntegration(
    id: UUID,
    updates: Partial<CalendarIntegration>
  ): Promise<CalendarIntegration> {
    const existingIntegration = await this.getIntegration(id);
    if (!existingIntegration) {
      throw new SchedulingError(
        `Calendar integration ${id} not found`,
        'INTEGRATION_NOT_FOUND'
      );
    }

    // Encrypt sensitive tokens if being updated
    if (updates.accessToken && this.encryptionService) {
      updates.accessToken = await this.encryptionService.encrypt(
        updates.accessToken
      );
    }
    if (updates.refreshToken && this.encryptionService) {
      updates.refreshToken = await this.encryptionService.encrypt(
        updates.refreshToken
      );
    }

    const updatedIntegration: CalendarIntegration = {
      ...existingIntegration,
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date(),
    };

    this.integrations.set(id, updatedIntegration);

    if (this.databaseService) {
      await this.databaseService.updateCalendarIntegration(updatedIntegration);
    }

    this.emit('integrationUpdated', {
      integration: updatedIntegration,
      changes: updates,
    });

    return updatedIntegration;
  }

  async deleteIntegration(id: UUID): Promise<boolean> {
    const integration = await this.getIntegration(id);
    if (!integration) {
      return false;
    }

    this.integrations.delete(id);

    if (this.databaseService) {
      await this.databaseService.deleteCalendarIntegration(id);
    }

    this.emit('integrationDeleted', { integrationId: id, integration });

    return true;
  }

  async getIntegration(id: UUID): Promise<CalendarIntegration | null> {
    if (this.integrations.has(id)) {
      const integration = this.integrations.get(id)!;

      // Decrypt tokens if encryption service is available
      if (this.encryptionService) {
        integration.accessToken = await this.encryptionService.decrypt(
          integration.accessToken
        );
        if (integration.refreshToken) {
          integration.refreshToken = await this.encryptionService.decrypt(
            integration.refreshToken
          );
        }
      }

      return integration;
    }

    if (this.databaseService) {
      const integration = await this.databaseService.getCalendarIntegration(id);
      if (integration) {
        this.integrations.set(id, integration);
        return this.getIntegration(id); // Get decrypted version
      }
    }

    return null;
  }

  async getUserIntegrations(userId: UUID): Promise<CalendarIntegration[]> {
    let integrations: CalendarIntegration[];

    if (this.databaseService) {
      integrations =
        await this.databaseService.getUserCalendarIntegrations(userId);
    } else {
      integrations = Array.from(this.integrations.values()).filter(
        (integration) => integration.userId === userId
      );
    }

    // Decrypt tokens for each integration
    for (const integration of integrations) {
      if (this.encryptionService) {
        integration.accessToken = await this.encryptionService.decrypt(
          integration.accessToken
        );
        if (integration.refreshToken) {
          integration.refreshToken = await this.encryptionService.decrypt(
            integration.refreshToken
          );
        }
      }
    }

    return integrations;
  }

  async getResourceIntegrations(
    resourceId: UUID
  ): Promise<CalendarIntegration[]> {
    let integrations: CalendarIntegration[];

    if (this.databaseService) {
      integrations =
        await this.databaseService.getResourceCalendarIntegrations(resourceId);
    } else {
      integrations = Array.from(this.integrations.values()).filter(
        (integration) => integration.resourceId === resourceId
      );
    }

    // Decrypt tokens for each integration
    for (const integration of integrations) {
      if (this.encryptionService) {
        integration.accessToken = await this.encryptionService.decrypt(
          integration.accessToken
        );
        if (integration.refreshToken) {
          integration.refreshToken = await this.encryptionService.decrypt(
            integration.refreshToken
          );
        }
      }
    }

    return integrations;
  }

  // ============================================================================
  // OAUTH & AUTHENTICATION
  // ============================================================================

  async initiateOAuthFlow(
    provider: CalendarProvider,
    userId?: UUID,
    resourceId?: UUID
  ): Promise<OAuthFlowResult> {
    const providerAdapter = this.calendarProviders?.get(provider);
    if (!providerAdapter) {
      throw new SchedulingError(
        `Calendar provider ${provider} not supported`,
        'PROVIDER_NOT_SUPPORTED'
      );
    }

    const state = uuid();
    const expiresAt = addMinutes(new Date(), 30); // 30-minute expiry

    // Store state for later verification
    this.oauthStates.set(state, {
      integrationData: { provider, userId, resourceId },
      expiresAt,
    });

    const authUrl = await providerAdapter.getAuthorizationUrl(state);

    return {
      authUrl,
      state,
      expiresAt,
    };
  }

  async completeOAuthFlow(
    code: string,
    state: string
  ): Promise<CalendarIntegration> {
    const oauthData = this.oauthStates.get(state);
    if (!oauthData) {
      throw new SchedulingError(
        'Invalid or expired OAuth state',
        'INVALID_OAUTH_STATE'
      );
    }

    if (oauthData.expiresAt < new Date()) {
      this.oauthStates.delete(state);
      throw new SchedulingError(
        'OAuth state has expired',
        'OAUTH_STATE_EXPIRED'
      );
    }

    const { integrationData } = oauthData;
    this.oauthStates.delete(state);

    const providerAdapter = this.calendarProviders?.get(
      integrationData.provider
    );
    if (!providerAdapter) {
      throw new SchedulingError(
        `Calendar provider ${integrationData.provider} not supported`,
        'PROVIDER_NOT_SUPPORTED'
      );
    }

    // Exchange code for tokens
    const tokenData = await providerAdapter.exchangeCodeForTokens(code);

    // Get account information
    const accountInfo = await providerAdapter.getAccountInfo(
      tokenData.accessToken
    );

    const integrationData_complete = {
      userId: integrationData.userId,
      resourceId: integrationData.resourceId,
      provider: integrationData.provider,
      accountId: accountInfo.id,
      calendarId: accountInfo.primaryCalendarId,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      tokenExpiresAt: tokenData.expiresAt,
      syncEnabled: true,
      bidirectionalSync: false,
      syncErrors: [],
      settings: this.getDefaultSyncSettings(),
    };

    return await this.createIntegration(integrationData_complete);
  }

  async refreshAccessToken(integrationId: UUID): Promise<boolean> {
    const integration = await this.getIntegration(integrationId);
    if (!integration || !integration.refreshToken) {
      return false;
    }

    const providerAdapter = this.calendarProviders?.get(integration.provider);
    if (!providerAdapter) {
      return false;
    }

    try {
      const tokenData = await providerAdapter.refreshAccessToken(
        integration.refreshToken
      );

      await this.updateIntegration(integrationId, {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiresAt: tokenData.expiresAt,
      });

      return true;
    } catch (error) {
      // Log refresh token error
      const syncError: CalendarSyncError = {
        id: createUUID(uuid()),
        errorType: 'authentication',
        message: 'Failed to refresh access token',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        occurredAt: new Date(),
        resolved: false,
      };

      integration.syncErrors.push(syncError);
      await this.updateIntegration(integrationId, {
        syncErrors: integration.syncErrors,
      });

      return false;
    }
  }

  async validateConnection(integrationId: UUID): Promise<ConnectionStatus> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      return {
        isConnected: false,
        errors: ['Integration not found'],
      };
    }

    const providerAdapter = this.calendarProviders?.get(integration.provider);
    if (!providerAdapter) {
      return {
        isConnected: false,
        errors: ['Calendar provider not supported'],
      };
    }

    try {
      const accountInfo = await providerAdapter.getAccountInfo(
        integration.accessToken
      );
      const calendars = await providerAdapter.getCalendars(
        integration.accessToken
      );

      return {
        isConnected: true,
        lastSuccessfulSync: integration.lastSyncAt,
        errors: [],
        accountInfo: {
          email: accountInfo.email,
          name: accountInfo.name,
          calendars,
        },
      };
    } catch (error) {
      return {
        isConnected: false,
        errors: [
          error instanceof Error
            ? error.message
            : 'Connection validation failed',
        ],
      };
    }
  }

  // ============================================================================
  // CALENDAR SYNCHRONIZATION
  // ============================================================================

  async syncCalendar(integrationId: UUID): Promise<SyncResult> {
    if (this.syncInProgress.has(integrationId)) {
      throw new SchedulingError(
        'Sync already in progress for this integration',
        'SYNC_IN_PROGRESS'
      );
    }

    this.syncInProgress.add(integrationId);

    try {
      const integration = await this.getIntegration(integrationId);
      if (!integration || !integration.syncEnabled) {
        throw new SchedulingError(
          'Integration not found or sync disabled',
          'SYNC_DISABLED'
        );
      }

      const providerAdapter = this.calendarProviders?.get(integration.provider);
      if (!providerAdapter) {
        throw new SchedulingError(
          `Calendar provider ${integration.provider} not supported`,
          'PROVIDER_NOT_SUPPORTED'
        );
      }

      const result: SyncResult = {
        integrationId,
        success: false,
        eventsImported: 0,
        eventsExported: 0,
        eventsUpdated: 0,
        eventsDeleted: 0,
        conflicts: [],
        errors: [],
        syncedAt: new Date(),
      };

      // Import events from external calendar
      if (
        integration.settings.syncDirection === 'import' ||
        integration.settings.syncDirection === 'bidirectional'
      ) {
        const importResult = await this.importEventsFromProvider(
          integration,
          providerAdapter
        );
        result.eventsImported = importResult.imported;
        result.eventsUpdated = importResult.updated;
        result.conflicts.push(...importResult.conflicts);
        result.errors.push(...importResult.errors);
      }

      // Export TMSLMS events to external calendar
      if (
        integration.settings.syncDirection === 'export' ||
        integration.settings.syncDirection === 'bidirectional'
      ) {
        const exportResult = await this.exportEventsToProvider(
          integration,
          providerAdapter
        );
        result.eventsExported = exportResult.exported;
        result.conflicts.push(...exportResult.conflicts);
        result.errors.push(...exportResult.errors);
      }

      result.success = result.errors.length === 0;

      // Update integration with sync result
      await this.updateIntegration(integrationId, {
        lastSyncAt: result.syncedAt,
        syncErrors: result.errors,
      });

      this.emit('calendarSynced', { result });

      return result;
    } finally {
      this.syncInProgress.delete(integrationId);
    }
  }

  async syncAllCalendars(): Promise<SyncResult[]> {
    const allIntegrations = this.databaseService
      ? await this.databaseService.getAllCalendarIntegrations()
      : Array.from(this.integrations.values());

    const enabledIntegrations = allIntegrations.filter(
      (integration: CalendarIntegration) => integration.syncEnabled
    );

    const results = await Promise.all(
      enabledIntegrations.map((integration: CalendarIntegration) =>
        this.syncCalendar(integration.id)
      )
    );

    this.emit('allCalendarsSynced', { results });

    return results;
  }

  async exportSessionToCalendar(
    sessionId: UUID,
    integrationId: UUID
  ): Promise<CalendarEvent> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      throw new SchedulingError(
        `Calendar integration ${integrationId} not found`,
        'INTEGRATION_NOT_FOUND'
      );
    }

    const session = await this.getTrainingSession(sessionId);
    if (!session) {
      throw new SchedulingError(
        `Training session ${sessionId} not found`,
        'SESSION_NOT_FOUND'
      );
    }

    const providerAdapter = this.calendarProviders?.get(integration.provider);
    if (!providerAdapter) {
      throw new SchedulingError(
        `Calendar provider ${integration.provider} not supported`,
        'PROVIDER_NOT_SUPPORTED'
      );
    }

    const eventData = this.convertSessionToCalendarEvent(session, integration);
    const calendarEvent = await providerAdapter.createEvent(
      integration.accessToken,
      integration.calendarId,
      eventData
    );

    this.emit('sessionExported', { sessionId, integrationId, calendarEvent });

    return calendarEvent;
  }

  async importEventsFromCalendar(
    integrationId: UUID,
    dateRange?: DateRange
  ): Promise<CalendarEvent[]> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      throw new SchedulingError(
        `Calendar integration ${integrationId} not found`,
        'INTEGRATION_NOT_FOUND'
      );
    }

    const providerAdapter = this.calendarProviders?.get(integration.provider);
    if (!providerAdapter) {
      throw new SchedulingError(
        `Calendar provider ${integration.provider} not supported`,
        'PROVIDER_NOT_SUPPORTED'
      );
    }

    const events = await providerAdapter.getEvents(
      integration.accessToken,
      integration.calendarId,
      dateRange
    );

    this.emit('eventsImported', { integrationId, events });

    return events;
  }

  // ============================================================================
  // EVENT MANAGEMENT
  // ============================================================================

  async createCalendarEvent(
    integrationId: UUID,
    eventData: CalendarEventData
  ): Promise<CalendarEvent> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      throw new SchedulingError(
        `Calendar integration ${integrationId} not found`,
        'INTEGRATION_NOT_FOUND'
      );
    }

    const providerAdapter = this.calendarProviders?.get(integration.provider);
    if (!providerAdapter) {
      throw new SchedulingError(
        `Calendar provider ${integration.provider} not supported`,
        'PROVIDER_NOT_SUPPORTED'
      );
    }

    const calendarEvent = await providerAdapter.createEvent(
      integration.accessToken,
      integration.calendarId,
      eventData
    );

    this.emit('calendarEventCreated', { integrationId, calendarEvent });

    return calendarEvent;
  }

  async updateCalendarEvent(
    integrationId: UUID,
    eventId: string,
    updates: Partial<CalendarEventData>
  ): Promise<CalendarEvent> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      throw new SchedulingError(
        `Calendar integration ${integrationId} not found`,
        'INTEGRATION_NOT_FOUND'
      );
    }

    const providerAdapter = this.calendarProviders?.get(integration.provider);
    if (!providerAdapter) {
      throw new SchedulingError(
        `Calendar provider ${integration.provider} not supported`,
        'PROVIDER_NOT_SUPPORTED'
      );
    }

    const calendarEvent = await providerAdapter.updateEvent(
      integration.accessToken,
      integration.calendarId,
      eventId,
      updates
    );

    this.emit('calendarEventUpdated', { integrationId, calendarEvent });

    return calendarEvent;
  }

  async deleteCalendarEvent(
    integrationId: UUID,
    eventId: string
  ): Promise<boolean> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      return false;
    }

    const providerAdapter = this.calendarProviders?.get(integration.provider);
    if (!providerAdapter) {
      return false;
    }

    const success = await providerAdapter.deleteEvent(
      integration.accessToken,
      integration.calendarId,
      eventId
    );

    if (success) {
      this.emit('calendarEventDeleted', { integrationId, eventId });
    }

    return success;
  }

  async getCalendarEvent(
    integrationId: UUID,
    eventId: string
  ): Promise<CalendarEvent | null> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      return null;
    }

    const providerAdapter = this.calendarProviders?.get(integration.provider);
    if (!providerAdapter) {
      return null;
    }

    return await providerAdapter.getEvent(
      integration.accessToken,
      integration.calendarId,
      eventId
    );
  }

  // ============================================================================
  // CONFLICT DETECTION
  // ============================================================================

  async detectCalendarConflicts(
    integrationId: UUID,
    session: TrainingSession
  ): Promise<CalendarConflict[]> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      return [];
    }

    const conflicts: CalendarConflict[] = [];

    // Get events from external calendar for the session time period
    const dateRange: DateRange = {
      startDate: session.startDateTime,
      endDate: session.endDateTime,
    };

    const externalEvents = await this.importEventsFromCalendar(
      integrationId,
      dateRange
    );

    // Check for time overlaps
    for (const externalEvent of externalEvents) {
      if (this.eventsOverlap(session, externalEvent)) {
        const conflict: CalendarConflict = {
          id: createUUID(uuid()),
          integrationId,
          sessionId: session.id,
          externalEventId: externalEvent.id,
          conflictType: 'time_overlap',
          description: `Training session "${session.title}" overlaps with calendar event "${externalEvent.title}"`,
          severity: 'medium',
          tmslmsEvent: this.convertSessionToCalendarEvent(session, integration),
          externalEvent,
          suggestedResolutions: this.generateConflictResolutions(
            session,
            externalEvent
          ),
          detectedAt: new Date(),
        };

        conflicts.push(conflict);
      }
    }

    return conflicts;
  }

  async resolveCalendarConflict(
    conflictId: UUID,
    resolution: ConflictResolution
  ): Promise<boolean> {
    // Implementation would depend on the specific resolution type
    // For now, return a placeholder
    return true;
  }

  // ============================================================================
  // AVAILABILITY CHECKING
  // ============================================================================

  async checkExternalAvailability(
    integrationId: UUID,
    startTime: Date,
    endTime: Date
  ): Promise<AvailabilityStatus> {
    const events = await this.importEventsFromCalendar(integrationId, {
      startDate: startTime,
      endDate: endTime,
    });

    const conflictingEvents = events.filter((event) =>
      this.timeRangesOverlap(
        { start: startTime, end: endTime },
        { start: event.startTime, end: event.endTime }
      )
    );

    return {
      isAvailable: conflictingEvents.length === 0,
      conflictingEvents,
      suggestedAlternatives:
        conflictingEvents.length > 0
          ? this.generateAlternativeTimeSlots(startTime, endTime, events)
          : undefined,
    };
  }

  async getFreeBusyInformation(
    integrationId: UUID,
    dateRange: DateRange
  ): Promise<FreeBusySlot[]> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      return [];
    }

    const providerAdapter = this.calendarProviders?.get(integration.provider);
    if (!providerAdapter) {
      return [];
    }

    // If provider supports free/busy API, use it; otherwise derive from events
    if (providerAdapter.getFreeBusy) {
      return await providerAdapter.getFreeBusy(
        integration.accessToken,
        integration.accountId,
        dateRange
      );
    } else {
      const events = await this.importEventsFromCalendar(
        integrationId,
        dateRange
      );
      return this.deriveFreeBusyFromEvents(events, dateRange);
    }
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  async bulkExportSessions(
    sessionIds: UUID[],
    integrationId: UUID
  ): Promise<BulkExportResult> {
    const result: BulkExportResult = {
      totalSessions: sessionIds.length,
      successfulExports: 0,
      failedExports: 0,
      exportedEvents: [],
      errors: [],
    };

    for (const sessionId of sessionIds) {
      try {
        const calendarEvent = await this.exportSessionToCalendar(
          sessionId,
          integrationId
        );
        result.exportedEvents.push(calendarEvent);
        result.successfulExports++;
      } catch (error) {
        result.errors.push({
          sessionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        result.failedExports++;
      }
    }

    this.emit('bulkExportCompleted', { result });

    return result;
  }

  async bulkSyncCalendars(integrationIds: UUID[]): Promise<SyncResult[]> {
    const results = await Promise.all(
      integrationIds.map((integrationId) => this.syncCalendar(integrationId))
    );

    this.emit('bulkSyncCompleted', { results });

    return results;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private initializeProviders(): void {
    if (!this.calendarProviders) {
      // Initialize default providers here
      // This would typically be done through dependency injection
    }
  }

  private getDefaultSyncSettings(): CalendarSyncSettings {
    return {
      syncDirection: 'export',
      syncFrequency: 60, // 1 hour
      conflictResolution: 'tmslms_priority',
      includePrivateEvents: false,
      eventPrefix: '[TMSLMS] ',
      categoryMapping: {},
    };
  }

  private async importEventsFromProvider(
    integration: CalendarIntegration,
    providerAdapter: CalendarProviderAdapter
  ): Promise<{
    imported: number;
    updated: number;
    conflicts: CalendarConflict[];
    errors: CalendarSyncError[];
  }> {
    // Implementation for importing events from external calendar
    return { imported: 0, updated: 0, conflicts: [], errors: [] };
  }

  private async exportEventsToProvider(
    integration: CalendarIntegration,
    providerAdapter: CalendarProviderAdapter
  ): Promise<{
    exported: number;
    conflicts: CalendarConflict[];
    errors: CalendarSyncError[];
  }> {
    // Implementation for exporting TMSLMS sessions to external calendar
    return { exported: 0, conflicts: [], errors: [] };
  }

  private async getTrainingSession(
    sessionId: UUID
  ): Promise<TrainingSession | null> {
    if (this.databaseService) {
      return await this.databaseService.getTrainingSession(sessionId);
    }
    return null;
  }

  private convertSessionToCalendarEvent(
    session: TrainingSession,
    integration: CalendarIntegration
  ): CalendarEvent {
    const prefix = integration.settings.eventPrefix || '';

    return {
      id: `tmslms-${session.id}`,
      calendarId: integration.calendarId,
      title: `${prefix}${session.title}`,
      description: session.description,
      startTime: session.startDateTime,
      endTime: session.endDateTime,
      location: session.location,
      status: 'confirmed',
      created: session.createdAt,
      updated: session.updatedAt,
      metadata: {
        tmslmsSessionId: session.id,
        sessionType: session.type,
      },
    };
  }

  private eventsOverlap(
    session: TrainingSession,
    event: CalendarEvent
  ): boolean {
    return this.timeRangesOverlap(
      { start: session.startDateTime, end: session.endDateTime },
      { start: event.startTime, end: event.endTime }
    );
  }

  private timeRangesOverlap(
    range1: { start: Date; end: Date },
    range2: { start: Date; end: Date }
  ): boolean {
    return range1.start < range2.end && range1.end > range2.start;
  }

  private generateConflictResolutions(
    session: TrainingSession,
    event: CalendarEvent
  ): ConflictResolution[] {
    return [
      {
        id: createUUID(uuid()),
        type: 'keep_tmslms',
        description:
          'Keep the training session and ignore the calendar conflict',
        impact: 'low',
        autoApplicable: false,
      },
      {
        id: createUUID(uuid()),
        type: 'reschedule_tmslms',
        description: 'Reschedule the training session to avoid conflict',
        impact: 'medium',
        autoApplicable: false,
      },
    ];
  }

  private generateAlternativeTimeSlots(
    originalStart: Date,
    originalEnd: Date,
    existingEvents: CalendarEvent[]
  ): TimeSlot[] {
    // Simple implementation - find gaps in the schedule
    const alternatives: TimeSlot[] = [];
    const duration = originalEnd.getTime() - originalStart.getTime();

    // Try a few hours before and after
    for (let offset = -2; offset <= 2; offset++) {
      if (offset === 0) continue; // Skip original time

      const newStart = new Date(
        originalStart.getTime() + offset * 60 * 60 * 1000
      );
      const newEnd = new Date(newStart.getTime() + duration);

      const hasConflict = existingEvents.some((event) =>
        this.timeRangesOverlap(
          { start: newStart, end: newEnd },
          { start: event.startTime, end: event.endTime }
        )
      );

      if (!hasConflict) {
        alternatives.push({ startTime: newStart, endTime: newEnd });
      }
    }

    return alternatives.slice(0, 3); // Return up to 3 alternatives
  }

  private deriveFreeBusyFromEvents(
    events: CalendarEvent[],
    dateRange: DateRange
  ): FreeBusySlot[] {
    const busySlots: FreeBusySlot[] = [];

    for (const event of events) {
      if (event.status === 'confirmed') {
        busySlots.push({
          startTime: event.startTime,
          endTime: event.endTime,
          status: 'busy',
        });
      } else if (event.status === 'tentative') {
        busySlots.push({
          startTime: event.startTime,
          endTime: event.endTime,
          status: 'tentative',
        });
      }
    }

    return busySlots.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
  }
}

// Abstract interface for calendar provider adapters
export interface CalendarProviderAdapter {
  getAuthorizationUrl(state: string): Promise<string>;
  exchangeCodeForTokens(code: string): Promise<TokenData>;
  refreshAccessToken(refreshToken: string): Promise<TokenData>;
  getAccountInfo(accessToken: string): Promise<AccountInfo>;
  getCalendars(accessToken: string): Promise<CalendarInfo[]>;
  createEvent(
    accessToken: string,
    calendarId: string,
    eventData: CalendarEventData
  ): Promise<CalendarEvent>;
  updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    updates: Partial<CalendarEventData>
  ): Promise<CalendarEvent>;
  deleteEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ): Promise<boolean>;
  getEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ): Promise<CalendarEvent | null>;
  getEvents(
    accessToken: string,
    calendarId: string,
    dateRange?: DateRange
  ): Promise<CalendarEvent[]>;
  getFreeBusy?(
    accessToken: string,
    userId: string,
    dateRange: DateRange
  ): Promise<FreeBusySlot[]>;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
}

export interface AccountInfo {
  id: string;
  email: string;
  name: string;
  primaryCalendarId: string;
}
