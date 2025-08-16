import { EventEmitter } from 'events';
import {
  TrainingSession,
  Resource,
  WaitlistEntry,
  SchedulingConflict,
  OptimizationResult,
  CalendarIntegration,
  CalendarEvent,
  UUID,
  createUUID,
} from './types';
import { SchedulingService } from './services/scheduling-service';
import { ResourceManagementService } from './services/resource-management-service';
import { CalendarIntegrationService } from './services/calendar-integration-service';
import { WaitlistManagementService } from './services/waitlist-management-service';

// Export all types
export * from './types';

// Export all services
export {
  SchedulingService,
  type ISchedulingService,
} from './services/scheduling-service';
export {
  ResourceManagementService,
  type IResourceManagementService,
} from './services/resource-management-service';
export {
  CalendarIntegrationService,
  type ICalendarIntegrationService,
} from './services/calendar-integration-service';
export {
  WaitlistManagementService,
  type IWaitlistManagementService,
} from './services/waitlist-management-service';

// Export utility functions and helpers
export {
  DateUtils,
  SchedulingUtils,
  ResourceUtils,
  ValidationUtils,
  ExportUtils,
  generateReadableId,
  debounce,
  deepClone,
  isEmpty,
} from './utils';

// Main TrainingScheduler class that orchestrates all services
export class TrainingScheduler {
  public readonly scheduling: SchedulingService;
  public readonly resourceManagement: ResourceManagementService;
  public readonly calendarIntegration: CalendarIntegrationService;
  public readonly waitlistManagement: WaitlistManagementService;

  constructor(options: TrainingSchedulerOptions = {}) {
    // Initialize services with optional dependencies
    this.resourceManagement = new ResourceManagementService(
      options.databaseService,
      options.notificationService,
      options.analyticsService
    );

    this.scheduling = new SchedulingService(
      options.databaseService,
      options.notificationService,
      options.calendarService
    );

    this.calendarIntegration = new CalendarIntegrationService(
      options.databaseService,
      options.notificationService,
      options.encryptionService,
      options.calendarProviders
    );

    this.waitlistManagement = new WaitlistManagementService(
      options.databaseService,
      options.notificationService,
      options.enrollmentService,
      options.schedulerService
    );

    // Set up inter-service communication
    this.setupServiceIntegration();
  }

  private setupServiceIntegration(): void {
    // Forward events between services for coordination
    this.scheduling.on('sessionScheduled', async (data) => {
      // Automatically process waitlist when a session is scheduled
      if (data.sessionId) {
        try {
          await this.waitlistManagement.processWaitlistForSession(
            data.sessionId
          );
        } catch (error) {
          console.error(
            'Error processing waitlist after session scheduling:',
            error
          );
        }
      }
    });

    this.scheduling.on('sessionCancelled', async (data) => {
      // Notify waitlisted users when a session is cancelled
      if (data.sessionId) {
        try {
          await this.waitlistManagement.sendWaitlistNotifications(
            data.sessionId,
            'session_cancelled' as any
          );
        } catch (error) {
          console.error(
            'Error notifying waitlist after session cancellation:',
            error
          );
        }
      }
    });

    this.resourceManagement.on('resourceAllocated', (data) => {
      // You could trigger calendar sync here if needed
      this.scheduling.emit('resourceAllocated', data);
    });

    this.waitlistManagement.on('waitlistToEnrollment', (data) => {
      // Trigger calendar sync for newly enrolled users
      if (data.enrollment) {
        this.scheduling.emit('enrollmentCreated', data);
      }
    });
  }

  // Convenience methods that orchestrate multiple services
  async scheduleTrainingSession(request: {
    sessionData: any;
    resourceRequirements: any[];
    instructorPreferences: any[];
    waitlistOptions?: any;
  }) {
    const {
      sessionData,
      resourceRequirements,
      instructorPreferences,
      waitlistOptions,
    } = request;

    // 1. Create the session
    const session = await this.createSession(sessionData);

    // 2. Find and allocate resources
    const schedulingRequest = {
      id: session.id,
      sessionId: session.id,
      preferredStartTimes: [sessionData.startDateTime],
      requiredResources: resourceRequirements,
      instructorPreferences,
      constraints: [],
      priority: 'normal' as const,
      flexibility: {
        timeFlexibilityMinutes: 60,
        dateFlexibilityDays: 7,
        resourceSubstitutionAllowed: true,
        instructorSubstitutionAllowed: false,
        splitSessionAllowed: false,
        virtualAlternativeAcceptable: sessionData.type === 'online',
      },
      requestedBy: sessionData.createdBy,
      requestedAt: new Date(),
    };

    const optimizationResult =
      await this.scheduling.scheduleSession(schedulingRequest);

    // 3. Set up waitlist if enabled
    if (sessionData.waitlistEnabled && waitlistOptions) {
      // Waitlist setup would be handled automatically by the waitlist service
    }

    return {
      session,
      schedulingResult: optimizationResult,
      waitlistEnabled: sessionData.waitlistEnabled,
    };
  }

  private async createSession(sessionData: any) {
    // This would typically integrate with a session management service
    // For now, return the session data with an ID
    return {
      ...sessionData,
      id: `session-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export interface TrainingSchedulerOptions {
  databaseService?: any;
  notificationService?: any;
  analyticsService?: any;
  calendarService?: any;
  encryptionService?: any;
  enrollmentService?: any;
  schedulerService?: any;
  calendarProviders?: Map<any, any>;
}

// Re-export commonly used types for convenience
export type {
  TrainingSession,
  Resource,
  ResourceType,
  ResourceAllocation,
  Instructor,
  Enrollment,
  WaitlistEntry,
  SchedulingRequest,
  OptimizationResult,
  SchedulingConflict,
  CalendarIntegration,
  CalendarEvent,
} from './types';
