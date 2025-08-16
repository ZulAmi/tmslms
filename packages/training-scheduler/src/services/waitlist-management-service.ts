import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import { addMinutes, addDays, isBefore, isAfter } from 'date-fns';
import {
  UUID,
  createUUID,
  TrainingSession,
  Enrollment,
  WaitlistEntry,
  EnrollmentStatus,
  NotificationType,
  NotificationTemplate,
  SchedulingError,
} from '../types';

export interface IWaitlistManagementService {
  // Waitlist Management
  addToWaitlist(
    sessionId: UUID,
    userId: UUID,
    options?: WaitlistOptions
  ): Promise<WaitlistEntry>;
  removeFromWaitlist(entryId: UUID): Promise<boolean>;
  getWaitlistPosition(entryId: UUID): Promise<number>;
  getWaitlistEntries(sessionId: UUID): Promise<WaitlistEntry[]>;
  getUserWaitlistEntries(userId: UUID): Promise<WaitlistEntry[]>;

  // Automatic Processing
  processWaitlistForSession(sessionId: UUID): Promise<WaitlistProcessingResult>;
  processAllWaitlists(): Promise<WaitlistProcessingResult[]>;
  moveWaitlistToEnrollment(entryId: UUID): Promise<Enrollment | null>;

  // Priority Management
  updateWaitlistPriority(
    entryId: UUID,
    priority: 'normal' | 'high' | 'urgent'
  ): Promise<WaitlistEntry>;
  reorderWaitlist(sessionId: UUID, newOrder: UUID[]): Promise<WaitlistEntry[]>;

  // Notification Management
  sendWaitlistNotifications(
    sessionId: UUID,
    notificationType: WaitlistNotificationType
  ): Promise<NotificationResult[]>;
  scheduleWaitlistReminders(sessionId: UUID): Promise<void>;

  // Analytics
  getWaitlistAnalytics(
    sessionId?: UUID,
    dateRange?: DateRange
  ): Promise<WaitlistAnalytics>;
  getConversionRates(
    sessionId?: UUID,
    period?: DateRange
  ): Promise<ConversionAnalytics>;

  // Expiration Management
  processExpiredWaitlistEntries(): Promise<ExpiredEntriesResult>;
  extendWaitlistExpiry(
    entryId: UUID,
    newExpiryDate: Date
  ): Promise<WaitlistEntry>;
}

export interface WaitlistOptions {
  priority?: 'normal' | 'high' | 'urgent';
  autoEnrollEnabled?: boolean;
  expiresAt?: Date;
  notificationPreferences?: NotificationPreferences;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  inApp?: boolean;
  frequency?: 'immediate' | 'daily' | 'weekly';
}

export interface WaitlistProcessingResult {
  sessionId: UUID;
  processedEntries: number;
  enrolledFromWaitlist: number;
  notificationsSent: number;
  expiredEntries: number;
  errors: ProcessingError[];
  processedAt: Date;
}

export interface ProcessingError {
  entryId: UUID;
  userId: UUID;
  error: string;
  errorCode: string;
}

export interface NotificationResult {
  userId: UUID;
  entryId: UUID;
  notificationType: WaitlistNotificationType;
  success: boolean;
  error?: string;
  sentAt: Date;
}

export enum WaitlistNotificationType {
  POSITION_AVAILABLE = 'position_available',
  POSITION_UPDATE = 'position_update',
  SESSION_CANCELLED = 'session_cancelled',
  ENROLLMENT_DEADLINE_REMINDER = 'enrollment_deadline_reminder',
  WAITLIST_EXPIRY_WARNING = 'waitlist_expiry_warning',
  MOVED_TO_ENROLLMENT = 'moved_to_enrollment',
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface WaitlistAnalytics {
  totalWaitlistEntries: number;
  averageWaitlistSize: number;
  averageWaitTime: number; // in hours
  conversionRate: number; // percentage
  dropoutRate: number; // percentage
  mostPopularSessions: PopularSession[];
  waitlistTrends: WaitlistTrend[];
  peakWaitlistTimes: PeakTime[];
}

export interface ConversionAnalytics {
  totalWaitlistEntries: number;
  convertedToEnrollment: number;
  droppedFromWaitlist: number;
  expiredEntries: number;
  conversionRate: number;
  averageTimeToConversion: number; // in hours
  conversionsByPriority: Record<string, number>;
}

export interface PopularSession {
  sessionId: UUID;
  sessionTitle: string;
  waitlistSize: number;
  conversionRate: number;
}

export interface WaitlistTrend {
  date: Date;
  waitlistSize: number;
  enrollments: number;
  dropouts: number;
}

export interface PeakTime {
  hour: number;
  dayOfWeek: number;
  averageWaitlistAdditions: number;
}

export interface ExpiredEntriesResult {
  totalExpiredEntries: number;
  removedEntries: UUID[];
  notificationsSent: number;
  errors: ProcessingError[];
}

export class WaitlistManagementService
  extends EventEmitter
  implements IWaitlistManagementService
{
  private waitlistEntries: Map<UUID, WaitlistEntry> = new Map();
  private sessions: Map<UUID, TrainingSession> = new Map();
  private enrollments: Map<UUID, Enrollment> = new Map();

  constructor(
    private readonly databaseService?: any,
    private readonly notificationService?: any,
    private readonly enrollmentService?: any,
    private readonly schedulerService?: any
  ) {
    super();
    this.initializeBackgroundProcessing();
  }

  // ============================================================================
  // WAITLIST MANAGEMENT
  // ============================================================================

  async addToWaitlist(
    sessionId: UUID,
    userId: UUID,
    options?: WaitlistOptions
  ): Promise<WaitlistEntry> {
    // Validate session exists and has waitlist enabled
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new SchedulingError(
        `Session ${sessionId} not found`,
        'SESSION_NOT_FOUND'
      );
    }

    if (!session.waitlistEnabled) {
      throw new SchedulingError(
        'Waitlist is not enabled for this session',
        'WAITLIST_DISABLED'
      );
    }

    // Check if user is already enrolled or on waitlist
    const existingEnrollment = await this.getUserEnrollment(sessionId, userId);
    if (
      existingEnrollment &&
      existingEnrollment.status !== EnrollmentStatus.CANCELLED
    ) {
      throw new SchedulingError(
        'User is already enrolled or on waitlist for this session',
        'ALREADY_ENROLLED'
      );
    }

    const existingWaitlistEntry = await this.getUserWaitlistEntry(
      sessionId,
      userId
    );
    if (existingWaitlistEntry) {
      throw new SchedulingError(
        'User is already on waitlist for this session',
        'ALREADY_ON_WAITLIST'
      );
    }

    // Calculate position in waitlist
    const currentWaitlist = await this.getWaitlistEntries(sessionId);
    const position = currentWaitlist.length + 1;

    // Create waitlist entry
    const waitlistEntry: WaitlistEntry = {
      id: createUUID(uuid()),
      sessionId,
      userId,
      position,
      addedAt: new Date(),
      notificationsSent: 0,
      autoEnrollEnabled: options?.autoEnrollEnabled ?? true,
      priority: options?.priority ?? 'normal',
      expiresAt: options?.expiresAt,
      metadata: options?.metadata ?? {},
    };

    this.waitlistEntries.set(waitlistEntry.id, waitlistEntry);

    // Update session waitlist count
    session.waitlistCount = currentWaitlist.length + 1;
    await this.updateSession(session);

    if (this.databaseService) {
      await this.databaseService.createWaitlistEntry(waitlistEntry);
    }

    // Send confirmation notification
    await this.sendWaitlistConfirmation(waitlistEntry, session);

    this.emit('userAddedToWaitlist', {
      waitlistEntry,
      session,
      position,
    });

    return waitlistEntry;
  }

  async removeFromWaitlist(entryId: UUID): Promise<boolean> {
    const entry = this.waitlistEntries.get(entryId);
    if (!entry) {
      return false;
    }

    const session = await this.getSession(entry.sessionId);

    this.waitlistEntries.delete(entryId);

    // Reorder remaining waitlist entries
    await this.reorderWaitlistAfterRemoval(entry.sessionId, entry.position);

    // Update session waitlist count
    if (session) {
      session.waitlistCount = Math.max(0, session.waitlistCount - 1);
      await this.updateSession(session);
    }

    if (this.databaseService) {
      await this.databaseService.deleteWaitlistEntry(entryId);
    }

    this.emit('userRemovedFromWaitlist', {
      entryId,
      sessionId: entry.sessionId,
      userId: entry.userId,
    });

    return true;
  }

  async getWaitlistPosition(entryId: UUID): Promise<number> {
    const entry = this.waitlistEntries.get(entryId);
    if (!entry) {
      throw new SchedulingError(
        `Waitlist entry ${entryId} not found`,
        'ENTRY_NOT_FOUND'
      );
    }

    return entry.position;
  }

  async getWaitlistEntries(sessionId: UUID): Promise<WaitlistEntry[]> {
    let entries: WaitlistEntry[];

    if (this.databaseService) {
      entries = await this.databaseService.getWaitlistEntries(sessionId);
    } else {
      entries = Array.from(this.waitlistEntries.values()).filter(
        (entry) => entry.sessionId === sessionId
      );
    }

    // Sort by priority and position
    return entries.sort((a, b) => {
      const priorityOrder = { urgent: 3, high: 2, normal: 1 };
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.position - b.position;
    });
  }

  async getUserWaitlistEntries(userId: UUID): Promise<WaitlistEntry[]> {
    let entries: WaitlistEntry[];

    if (this.databaseService) {
      entries = await this.databaseService.getUserWaitlistEntries(userId);
    } else {
      entries = Array.from(this.waitlistEntries.values()).filter(
        (entry) => entry.userId === userId
      );
    }

    return entries.sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());
  }

  // ============================================================================
  // AUTOMATIC PROCESSING
  // ============================================================================

  async processWaitlistForSession(
    sessionId: UUID
  ): Promise<WaitlistProcessingResult> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new SchedulingError(
        `Session ${sessionId} not found`,
        'SESSION_NOT_FOUND'
      );
    }

    const result: WaitlistProcessingResult = {
      sessionId,
      processedEntries: 0,
      enrolledFromWaitlist: 0,
      notificationsSent: 0,
      expiredEntries: 0,
      errors: [],
      processedAt: new Date(),
    };

    const waitlistEntries = await this.getWaitlistEntries(sessionId);
    const availableSpots = session.maxParticipants - session.enrolledCount;

    // Process expired entries first
    const currentTime = new Date();
    const expiredEntries = waitlistEntries.filter(
      (entry) => entry.expiresAt && isBefore(entry.expiresAt, currentTime)
    );

    for (const expiredEntry of expiredEntries) {
      try {
        await this.removeFromWaitlist(expiredEntry.id);
        result.expiredEntries++;
      } catch (error) {
        result.errors.push({
          entryId: expiredEntry.id,
          userId: expiredEntry.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorCode: 'EXPIRED_ENTRY_REMOVAL_FAILED',
        });
      }
    }

    // Get updated waitlist after removing expired entries
    const activeWaitlist = waitlistEntries.filter(
      (entry) => !entry.expiresAt || isAfter(entry.expiresAt, currentTime)
    );

    // Auto-enroll users if spots are available and auto-enrollment is enabled
    if (availableSpots > 0 && session.autoEnrollFromWaitlist) {
      const eligibleEntries = activeWaitlist
        .filter((entry) => entry.autoEnrollEnabled)
        .slice(0, availableSpots);

      for (const entry of eligibleEntries) {
        try {
          const enrollment = await this.moveWaitlistToEnrollment(entry.id);
          if (enrollment) {
            result.enrolledFromWaitlist++;

            // Send enrollment notification
            await this.sendEnrollmentNotification(entry, session);
            result.notificationsSent++;
          }
        } catch (error) {
          result.errors.push({
            entryId: entry.id,
            userId: entry.userId,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'AUTO_ENROLLMENT_FAILED',
          });
        }
      }
    }

    // Send position update notifications to remaining waitlist members
    const remainingWaitlist = await this.getWaitlistEntries(sessionId);
    for (const entry of remainingWaitlist) {
      try {
        await this.sendPositionUpdateNotification(entry, session);
        result.notificationsSent++;
      } catch (error) {
        result.errors.push({
          entryId: entry.id,
          userId: entry.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorCode: 'NOTIFICATION_FAILED',
        });
      }
    }

    result.processedEntries = waitlistEntries.length;

    this.emit('waitlistProcessed', { result });

    return result;
  }

  async processAllWaitlists(): Promise<WaitlistProcessingResult[]> {
    const activeSessions = await this.getActiveSessionsWithWaitlists();

    const results = await Promise.all(
      activeSessions.map((session) =>
        this.processWaitlistForSession(session.id)
      )
    );

    this.emit('allWaitlistsProcessed', { results });

    return results;
  }

  async moveWaitlistToEnrollment(entryId: UUID): Promise<Enrollment | null> {
    const waitlistEntry = this.waitlistEntries.get(entryId);
    if (!waitlistEntry) {
      throw new SchedulingError(
        `Waitlist entry ${entryId} not found`,
        'ENTRY_NOT_FOUND'
      );
    }

    const session = await this.getSession(waitlistEntry.sessionId);
    if (!session) {
      throw new SchedulingError(
        `Session ${waitlistEntry.sessionId} not found`,
        'SESSION_NOT_FOUND'
      );
    }

    // Check if there's still space in the session
    if (session.enrolledCount >= session.maxParticipants) {
      throw new SchedulingError(
        'Session is already at maximum capacity',
        'SESSION_FULL'
      );
    }

    // Create enrollment
    const enrollment: Enrollment = {
      id: createUUID(uuid()),
      sessionId: waitlistEntry.sessionId,
      userId: waitlistEntry.userId,
      status: EnrollmentStatus.ENROLLED,
      enrolledAt: new Date(),
      confirmedAt: new Date(),
      metadata: {
        ...waitlistEntry.metadata,
        promotedFromWaitlist: true,
        originalWaitlistPosition: waitlistEntry.position,
      },
    };

    // Use enrollment service if available
    if (this.enrollmentService) {
      await this.enrollmentService.createEnrollment(enrollment);
    } else {
      this.enrollments.set(enrollment.id, enrollment);
      if (this.databaseService) {
        await this.databaseService.createEnrollment(enrollment);
      }
    }

    // Update session enrolled count
    session.enrolledCount++;
    await this.updateSession(session);

    // Remove from waitlist
    await this.removeFromWaitlist(entryId);

    this.emit('waitlistToEnrollment', {
      enrollment,
      waitlistEntry,
      session,
    });

    return enrollment;
  }

  // ============================================================================
  // PRIORITY MANAGEMENT
  // ============================================================================

  async updateWaitlistPriority(
    entryId: UUID,
    priority: 'normal' | 'high' | 'urgent'
  ): Promise<WaitlistEntry> {
    const entry = this.waitlistEntries.get(entryId);
    if (!entry) {
      throw new SchedulingError(
        `Waitlist entry ${entryId} not found`,
        'ENTRY_NOT_FOUND'
      );
    }

    entry.priority = priority;
    this.waitlistEntries.set(entryId, entry);

    if (this.databaseService) {
      await this.databaseService.updateWaitlistEntry(entry);
    }

    // Reorder waitlist based on new priority
    await this.reorderWaitlistByPriority(entry.sessionId);

    this.emit('waitlistPriorityUpdated', {
      entryId,
      newPriority: priority,
      sessionId: entry.sessionId,
    });

    return entry;
  }

  async reorderWaitlist(
    sessionId: UUID,
    newOrder: UUID[]
  ): Promise<WaitlistEntry[]> {
    const entries = await this.getWaitlistEntries(sessionId);

    // Validate that all entries are included in new order
    const existingIds = new Set(entries.map((e) => e.id));
    const newOrderSet = new Set(newOrder);

    if (
      existingIds.size !== newOrderSet.size ||
      !Array.from(existingIds).every((id) => newOrderSet.has(id))
    ) {
      throw new SchedulingError(
        'Invalid reorder: missing or extra entries',
        'INVALID_REORDER'
      );
    }

    // Update positions
    const updatedEntries: WaitlistEntry[] = [];
    for (let i = 0; i < newOrder.length; i++) {
      const entryId = newOrder[i];
      const entry = this.waitlistEntries.get(entryId);
      if (entry) {
        entry.position = i + 1;
        this.waitlistEntries.set(entryId, entry);
        updatedEntries.push(entry);

        if (this.databaseService) {
          await this.databaseService.updateWaitlistEntry(entry);
        }
      }
    }

    this.emit('waitlistReordered', {
      sessionId,
      newOrder: updatedEntries,
    });

    return updatedEntries;
  }

  // ============================================================================
  // NOTIFICATION MANAGEMENT
  // ============================================================================

  async sendWaitlistNotifications(
    sessionId: UUID,
    notificationType: WaitlistNotificationType
  ): Promise<NotificationResult[]> {
    const waitlistEntries = await this.getWaitlistEntries(sessionId);
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new SchedulingError(
        `Session ${sessionId} not found`,
        'SESSION_NOT_FOUND'
      );
    }

    const results: NotificationResult[] = [];

    for (const entry of waitlistEntries) {
      try {
        const success = await this.sendNotificationToUser(
          entry,
          session,
          notificationType
        );

        results.push({
          userId: entry.userId,
          entryId: entry.id,
          notificationType,
          success,
          sentAt: new Date(),
        });

        if (success) {
          entry.notificationsSent++;
          entry.lastNotificationAt = new Date();
          this.waitlistEntries.set(entry.id, entry);

          if (this.databaseService) {
            await this.databaseService.updateWaitlistEntry(entry);
          }
        }
      } catch (error) {
        results.push({
          userId: entry.userId,
          entryId: entry.id,
          notificationType,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          sentAt: new Date(),
        });
      }
    }

    this.emit('waitlistNotificationsSent', {
      sessionId,
      notificationType,
      results,
    });

    return results;
  }

  async scheduleWaitlistReminders(sessionId: UUID): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session || !this.schedulerService) {
      return;
    }

    // Schedule reminder 24 hours before enrollment deadline
    if (session.enrollmentDeadline) {
      const reminderTime = addDays(session.enrollmentDeadline, -1);
      if (isAfter(reminderTime, new Date())) {
        await this.schedulerService.scheduleTask({
          id: `waitlist-reminder-${sessionId}`,
          executeAt: reminderTime,
          taskType: 'waitlist_reminder',
          payload: {
            sessionId,
            notificationType:
              WaitlistNotificationType.ENROLLMENT_DEADLINE_REMINDER,
          },
        });
      }
    }

    // Schedule expiry warnings for entries with expiration dates
    const waitlistEntries = await this.getWaitlistEntries(sessionId);
    for (const entry of waitlistEntries) {
      if (entry.expiresAt) {
        const warningTime = addDays(entry.expiresAt, -1);
        if (isAfter(warningTime, new Date())) {
          await this.schedulerService.scheduleTask({
            id: `waitlist-expiry-warning-${entry.id}`,
            executeAt: warningTime,
            taskType: 'waitlist_expiry_warning',
            payload: {
              entryId: entry.id,
              notificationType:
                WaitlistNotificationType.WAITLIST_EXPIRY_WARNING,
            },
          });
        }
      }
    }
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getWaitlistAnalytics(
    sessionId?: UUID,
    dateRange?: DateRange
  ): Promise<WaitlistAnalytics> {
    let entries: WaitlistEntry[];

    if (sessionId) {
      entries = await this.getWaitlistEntries(sessionId);
    } else {
      if (this.databaseService) {
        entries = await this.databaseService.getAllWaitlistEntries(dateRange);
      } else {
        entries = Array.from(this.waitlistEntries.values());
      }
    }

    // Filter by date range if provided
    if (dateRange && !sessionId) {
      entries = entries.filter(
        (entry) =>
          entry.addedAt >= dateRange.startDate &&
          entry.addedAt <= dateRange.endDate
      );
    }

    const totalEntries = entries.length;
    const averageWaitlistSize = this.calculateAverageWaitlistSize(entries);
    const averageWaitTime = this.calculateAverageWaitTime(entries);
    const conversionRate = await this.calculateConversionRate(entries);
    const dropoutRate = await this.calculateDropoutRate(entries);

    const mostPopularSessions = await this.getMostPopularSessions(entries);
    const waitlistTrends = this.calculateWaitlistTrends(entries, dateRange);
    const peakWaitlistTimes = this.calculatePeakWaitlistTimes(entries);

    return {
      totalWaitlistEntries: totalEntries,
      averageWaitlistSize,
      averageWaitTime,
      conversionRate,
      dropoutRate,
      mostPopularSessions,
      waitlistTrends,
      peakWaitlistTimes,
    };
  }

  async getConversionRates(
    sessionId?: UUID,
    period?: DateRange
  ): Promise<ConversionAnalytics> {
    let entries: WaitlistEntry[];

    if (sessionId) {
      entries = await this.getWaitlistEntries(sessionId);
    } else {
      if (this.databaseService) {
        entries = await this.databaseService.getAllWaitlistEntries(period);
      } else {
        entries = Array.from(this.waitlistEntries.values());
      }
    }

    const totalEntries = entries.length;
    const convertedToEnrollment = await this.countConvertedEntries(entries);
    const droppedFromWaitlist = await this.countDroppedEntries(entries);
    const expiredEntries = this.countExpiredEntries(entries);

    const conversionRate =
      totalEntries > 0 ? (convertedToEnrollment / totalEntries) * 100 : 0;
    const averageTimeToConversion =
      await this.calculateAverageTimeToConversion(entries);
    const conversionsByPriority = await this.getConversionsByPriority(entries);

    return {
      totalWaitlistEntries: totalEntries,
      convertedToEnrollment,
      droppedFromWaitlist,
      expiredEntries,
      conversionRate,
      averageTimeToConversion,
      conversionsByPriority,
    };
  }

  // ============================================================================
  // EXPIRATION MANAGEMENT
  // ============================================================================

  async processExpiredWaitlistEntries(): Promise<ExpiredEntriesResult> {
    const currentTime = new Date();
    let allEntries: WaitlistEntry[];

    if (this.databaseService) {
      allEntries =
        await this.databaseService.getExpiredWaitlistEntries(currentTime);
    } else {
      allEntries = Array.from(this.waitlistEntries.values()).filter(
        (entry) => entry.expiresAt && isBefore(entry.expiresAt, currentTime)
      );
    }

    const result: ExpiredEntriesResult = {
      totalExpiredEntries: allEntries.length,
      removedEntries: [],
      notificationsSent: 0,
      errors: [],
    };

    for (const entry of allEntries) {
      try {
        // Send expiry notification before removal
        const session = await this.getSession(entry.sessionId);
        if (session) {
          await this.sendExpiryNotification(entry, session);
          result.notificationsSent++;
        }

        // Remove from waitlist
        await this.removeFromWaitlist(entry.id);
        result.removedEntries.push(entry.id);
      } catch (error) {
        result.errors.push({
          entryId: entry.id,
          userId: entry.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorCode: 'EXPIRY_PROCESSING_FAILED',
        });
      }
    }

    this.emit('expiredEntriesProcessed', { result });

    return result;
  }

  async extendWaitlistExpiry(
    entryId: UUID,
    newExpiryDate: Date
  ): Promise<WaitlistEntry> {
    const entry = this.waitlistEntries.get(entryId);
    if (!entry) {
      throw new SchedulingError(
        `Waitlist entry ${entryId} not found`,
        'ENTRY_NOT_FOUND'
      );
    }

    entry.expiresAt = newExpiryDate;
    this.waitlistEntries.set(entryId, entry);

    if (this.databaseService) {
      await this.databaseService.updateWaitlistEntry(entry);
    }

    this.emit('waitlistExpiryExtended', {
      entryId,
      newExpiryDate,
      sessionId: entry.sessionId,
    });

    return entry;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private initializeBackgroundProcessing(): void {
    // Process waitlists every 30 minutes
    setInterval(
      async () => {
        try {
          await this.processAllWaitlists();
          await this.processExpiredWaitlistEntries();
        } catch (error) {
          this.emit('backgroundProcessingError', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
      30 * 60 * 1000
    );
  }

  private async getSession(sessionId: UUID): Promise<TrainingSession | null> {
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    if (this.databaseService) {
      const session = await this.databaseService.getSession(sessionId);
      if (session) {
        this.sessions.set(sessionId, session);
        return session;
      }
    }

    return null;
  }

  private async updateSession(session: TrainingSession): Promise<void> {
    session.updatedAt = new Date();
    this.sessions.set(session.id, session);

    if (this.databaseService) {
      await this.databaseService.updateSession(session);
    }
  }

  private async getUserEnrollment(
    sessionId: UUID,
    userId: UUID
  ): Promise<Enrollment | null> {
    if (this.enrollmentService) {
      return await this.enrollmentService.getUserEnrollment(sessionId, userId);
    }

    if (this.databaseService) {
      return await this.databaseService.getUserEnrollment(sessionId, userId);
    }

    // Fallback to local storage
    const enrollments = Array.from(this.enrollments.values());
    return (
      enrollments.find(
        (e) => e.sessionId === sessionId && e.userId === userId
      ) || null
    );
  }

  private async getUserWaitlistEntry(
    sessionId: UUID,
    userId: UUID
  ): Promise<WaitlistEntry | null> {
    const entries = Array.from(this.waitlistEntries.values());
    return (
      entries.find((e) => e.sessionId === sessionId && e.userId === userId) ||
      null
    );
  }

  private async reorderWaitlistAfterRemoval(
    sessionId: UUID,
    removedPosition: number
  ): Promise<void> {
    const entries = await this.getWaitlistEntries(sessionId);

    for (const entry of entries) {
      if (entry.position > removedPosition) {
        entry.position--;
        this.waitlistEntries.set(entry.id, entry);

        if (this.databaseService) {
          await this.databaseService.updateWaitlistEntry(entry);
        }
      }
    }
  }

  private async reorderWaitlistByPriority(sessionId: UUID): Promise<void> {
    const entries = await this.getWaitlistEntries(sessionId);

    // Sort by priority and original position
    entries.sort((a, b) => {
      const priorityOrder = { urgent: 3, high: 2, normal: 1 };
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.position - b.position;
    });

    // Update positions
    for (let i = 0; i < entries.length; i++) {
      entries[i].position = i + 1;
      this.waitlistEntries.set(entries[i].id, entries[i]);

      if (this.databaseService) {
        await this.databaseService.updateWaitlistEntry(entries[i]);
      }
    }
  }

  private async getActiveSessionsWithWaitlists(): Promise<TrainingSession[]> {
    if (this.databaseService) {
      return await this.databaseService.getActiveSessionsWithWaitlists();
    }

    return Array.from(this.sessions.values()).filter(
      (session) => session.waitlistEnabled && session.waitlistCount > 0
    );
  }

  private async sendWaitlistConfirmation(
    entry: WaitlistEntry,
    session: TrainingSession
  ): Promise<void> {
    if (this.notificationService) {
      await this.notificationService.sendNotification({
        userId: entry.userId,
        type: 'waitlist_confirmation',
        templateData: {
          sessionTitle: session.title,
          position: entry.position,
          sessionDate: session.startDateTime,
        },
      });
    }
  }

  private async sendEnrollmentNotification(
    entry: WaitlistEntry,
    session: TrainingSession
  ): Promise<void> {
    if (this.notificationService) {
      await this.notificationService.sendNotification({
        userId: entry.userId,
        type: WaitlistNotificationType.MOVED_TO_ENROLLMENT,
        templateData: {
          sessionTitle: session.title,
          sessionDate: session.startDateTime,
        },
      });
    }
  }

  private async sendPositionUpdateNotification(
    entry: WaitlistEntry,
    session: TrainingSession
  ): Promise<void> {
    if (this.notificationService) {
      await this.notificationService.sendNotification({
        userId: entry.userId,
        type: WaitlistNotificationType.POSITION_UPDATE,
        templateData: {
          sessionTitle: session.title,
          newPosition: entry.position,
          sessionDate: session.startDateTime,
        },
      });
    }
  }

  private async sendNotificationToUser(
    entry: WaitlistEntry,
    session: TrainingSession,
    notificationType: WaitlistNotificationType
  ): Promise<boolean> {
    if (!this.notificationService) {
      return false;
    }

    try {
      await this.notificationService.sendNotification({
        userId: entry.userId,
        type: notificationType,
        templateData: {
          sessionTitle: session.title,
          position: entry.position,
          sessionDate: session.startDateTime,
          enrollmentDeadline: session.enrollmentDeadline,
          expiryDate: entry.expiresAt,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private async sendExpiryNotification(
    entry: WaitlistEntry,
    session: TrainingSession
  ): Promise<void> {
    if (this.notificationService) {
      await this.notificationService.sendNotification({
        userId: entry.userId,
        type: 'waitlist_expired',
        templateData: {
          sessionTitle: session.title,
          sessionDate: session.startDateTime,
        },
      });
    }
  }

  // Analytics helper methods
  private calculateAverageWaitlistSize(entries: WaitlistEntry[]): number {
    const sessionGroups = new Map<UUID, number>();

    for (const entry of entries) {
      sessionGroups.set(
        entry.sessionId,
        (sessionGroups.get(entry.sessionId) || 0) + 1
      );
    }

    const sizes = Array.from(sessionGroups.values());
    return sizes.length > 0
      ? sizes.reduce((sum, size) => sum + size, 0) / sizes.length
      : 0;
  }

  private calculateAverageWaitTime(entries: WaitlistEntry[]): number {
    // This would need enrollment data to calculate actual wait times
    // For now, return a placeholder
    return 24; // 24 hours average
  }

  private async calculateConversionRate(
    entries: WaitlistEntry[]
  ): Promise<number> {
    const converted = await this.countConvertedEntries(entries);
    return entries.length > 0 ? (converted / entries.length) * 100 : 0;
  }

  private async calculateDropoutRate(
    entries: WaitlistEntry[]
  ): Promise<number> {
    const dropped = await this.countDroppedEntries(entries);
    return entries.length > 0 ? (dropped / entries.length) * 100 : 0;
  }

  private async countConvertedEntries(
    entries: WaitlistEntry[]
  ): Promise<number> {
    // This would need to check enrollment records
    return 0; // Placeholder
  }

  private async countDroppedEntries(entries: WaitlistEntry[]): Promise<number> {
    // This would need to check removal records
    return 0; // Placeholder
  }

  private countExpiredEntries(entries: WaitlistEntry[]): number {
    const now = new Date();
    return entries.filter(
      (entry) => entry.expiresAt && isBefore(entry.expiresAt, now)
    ).length;
  }

  private async calculateAverageTimeToConversion(
    entries: WaitlistEntry[]
  ): Promise<number> {
    // This would need enrollment data
    return 0; // Placeholder
  }

  private async getConversionsByPriority(
    entries: WaitlistEntry[]
  ): Promise<Record<string, number>> {
    // This would need enrollment data
    return { normal: 0, high: 0, urgent: 0 }; // Placeholder
  }

  private async getMostPopularSessions(
    entries: WaitlistEntry[]
  ): Promise<PopularSession[]> {
    const sessionCounts = new Map<UUID, number>();

    for (const entry of entries) {
      sessionCounts.set(
        entry.sessionId,
        (sessionCounts.get(entry.sessionId) || 0) + 1
      );
    }

    const popularSessions: PopularSession[] = [];
    for (const [sessionId, count] of sessionCounts) {
      const session = await this.getSession(sessionId);
      if (session) {
        popularSessions.push({
          sessionId,
          sessionTitle: session.title,
          waitlistSize: count,
          conversionRate: 0, // Would need enrollment data
        });
      }
    }

    return popularSessions
      .sort((a, b) => b.waitlistSize - a.waitlistSize)
      .slice(0, 10);
  }

  private calculateWaitlistTrends(
    entries: WaitlistEntry[],
    dateRange?: DateRange
  ): WaitlistTrend[] {
    // Group entries by date and calculate trends
    return []; // Placeholder
  }

  private calculatePeakWaitlistTimes(entries: WaitlistEntry[]): PeakTime[] {
    const timeGroups = new Map<string, number>();

    for (const entry of entries) {
      const hour = entry.addedAt.getHours();
      const dayOfWeek = entry.addedAt.getDay();
      const key = `${dayOfWeek}-${hour}`;

      timeGroups.set(key, (timeGroups.get(key) || 0) + 1);
    }

    const peakTimes: PeakTime[] = [];
    for (const [key, count] of timeGroups) {
      const [dayOfWeek, hour] = key.split('-').map(Number);
      peakTimes.push({
        hour,
        dayOfWeek,
        averageWaitlistAdditions: count,
      });
    }

    return peakTimes
      .sort((a, b) => b.averageWaitlistAdditions - a.averageWaitlistAdditions)
      .slice(0, 10);
  }
}
