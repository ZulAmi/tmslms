// Core Types
export * from './types';

// Services
export { ParticipantManagementService } from './services/ParticipantManagementService';
export { RegistrationWorkflowService } from './services/RegistrationWorkflowService';
export { AttendanceTrackingService } from './services/AttendanceTrackingService';
export { CommunicationService } from './services/CommunicationService';
export { DocumentManagementService } from './services/DocumentManagementService';

// Main Participant Management System
import { ParticipantManagementService } from './services/ParticipantManagementService';
import { RegistrationWorkflowService } from './services/RegistrationWorkflowService';
import { AttendanceTrackingService } from './services/AttendanceTrackingService';
import { CommunicationService } from './services/CommunicationService';
import { DocumentManagementService } from './services/DocumentManagementService';
import { CommunicationChannel, CommunicationType, createUUID } from './types';

/**
 * Main Participant Management System
 * Orchestrates all participant-related services
 */
export class ParticipantManagementSystem {
  public readonly participantService: ParticipantManagementService;
  public readonly registrationService: RegistrationWorkflowService;
  public readonly attendanceService: AttendanceTrackingService;
  public readonly communicationService: CommunicationService;
  public readonly documentService: DocumentManagementService;

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
    this.participantService = new ParticipantManagementService();
    this.registrationService = new RegistrationWorkflowService();
    this.attendanceService = new AttendanceTrackingService();
    this.communicationService = new CommunicationService(config);
    this.documentService = new DocumentManagementService();

    this.setupServiceIntegration();
  }

  /**
   * Setup integration between services
   */
  private setupServiceIntegration(): void {
    // Connect participant events to communication service
    this.participantService.on('participantCreated', async (event) => {
      await this.communicationService.processTriggerEvent(
        'enrollment',
        event.participant.id,
        { participant: event.participant }
      );
    });

    this.participantService.on('participantEnrolled', async (event) => {
      await this.communicationService.processTriggerEvent(
        'enrollment',
        event.enrollment.participantId,
        { enrollment: event.enrollment }
      );
    });

    this.participantService.on('enrollmentStatusChanged', async (event) => {
      if (event.newStatus === 'completed') {
        // Generate completion certificate
        try {
          // Get participant details (this would come from actual participant data)
          const certificateData = {
            participantName: 'Participant Name', // Would fetch from participant service
            courseName: 'Course Name', // Would fetch from training program
            completionDate: new Date(),
            organizationName: 'Training Organization',
          };

          await this.documentService.generateCertificate(
            event.enrollment.participantId,
            certificateData
          );
        } catch (error) {
          console.error('Failed to generate completion certificate:', error);
        }
      }
    });

    // Connect attendance events
    this.attendanceService.on('attendanceRecorded', async (event) => {
      await this.communicationService.processTriggerEvent(
        'attendance',
        event.attendance.participantId,
        { attendance: event.attendance }
      );
    });

    // Connect registration events
    this.registrationService.on('registrationSubmitted', async (event) => {
      await this.communicationService.processTriggerEvent(
        'enrollment',
        event.registration.participantId,
        { registration: event.registration }
      );
    });

    this.registrationService.on('registrationApproved', async (event) => {
      await this.communicationService.processTriggerEvent(
        'enrollment',
        event.registration.participantId,
        { registration: event.registration, status: 'approved' }
      );
    });
  }

  /**
   * Initialize the system with default templates and configurations
   */
  async initialize(): Promise<void> {
    try {
      // Create default communication templates
      await this.createDefaultCommunicationTemplates();

      // Create default registration workflows
      await this.createDefaultRegistrationWorkflows();

      console.log('Participant Management System initialized successfully');
    } catch (error) {
      console.error(
        'Failed to initialize Participant Management System:',
        error
      );
      throw error;
    }
  }

  /**
   * Create default communication templates
   */
  private async createDefaultCommunicationTemplates(): Promise<void> {
    const systemUserId = 'system'; // In a real app, this would be a proper system user ID

    const templates = [
      {
        name: 'Welcome Email',
        channel: CommunicationChannel.EMAIL,
        type: CommunicationType.ENROLLMENT_CONFIRMATION,
        subject: 'Welcome to {{courseName}}',
        content: `
          <h1>Welcome {{participantName}}!</h1>
          <p>You have been successfully enrolled in {{courseName}}.</p>
          <p>Start Date: {{startDate}}</p>
          <p>We look forward to having you in the program!</p>
        `,
        variables: [
          {
            name: 'participantName',
            description: 'Participant name',
            type: 'string' as const,
            isRequired: true,
          },
          {
            name: 'courseName',
            description: 'Course name',
            type: 'string' as const,
            isRequired: true,
          },
          {
            name: 'startDate',
            description: 'Course start date',
            type: 'date' as const,
            isRequired: true,
          },
        ],
        isActive: true,
        tags: ['welcome', 'enrollment'],
        metadata: {},
        createdBy: createUUID(systemUserId),
      },
      {
        name: 'Session Reminder',
        channel: CommunicationChannel.EMAIL,
        type: CommunicationType.REMINDER,
        subject: 'Reminder: {{sessionName}} starts in 24 hours',
        content: `
          <h2>Session Reminder</h2>
          <p>Hello {{participantName}},</p>
          <p>This is a reminder that {{sessionName}} is scheduled for tomorrow.</p>
          <p><strong>Date:</strong> {{sessionDate}}</p>
          <p><strong>Time:</strong> {{sessionTime}}</p>
          <p><strong>Location:</strong> {{location}}</p>
          <p>Please make sure to arrive on time.</p>
        `,
        variables: [
          {
            name: 'participantName',
            description: 'Participant name',
            type: 'string' as const,
            isRequired: true,
          },
          {
            name: 'sessionName',
            description: 'Session name',
            type: 'string' as const,
            isRequired: true,
          },
          {
            name: 'sessionDate',
            description: 'Session date',
            type: 'date' as const,
            isRequired: true,
          },
          {
            name: 'sessionTime',
            description: 'Session time',
            type: 'string' as const,
            isRequired: true,
          },
          {
            name: 'location',
            description: 'Session location',
            type: 'string' as const,
            isRequired: true,
          },
        ],
        isActive: true,
        tags: ['reminder', 'session'],
        metadata: {},
        createdBy: createUUID(systemUserId),
      },
    ];

    for (const templateData of templates) {
      await this.communicationService.createTemplate(templateData);
    }
  }

  /**
   * Create default registration workflows
   */
  private async createDefaultRegistrationWorkflows(): Promise<void> {
    // This would create default workflows for different training program types
    // For now, we'll just log that this step would happen
    console.log('Default registration workflows would be created here');
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: Record<string, 'up' | 'down'>;
    timestamp: Date;
  }> {
    const services = {
      participant: 'up' as const,
      registration: 'up' as const,
      attendance: 'up' as const,
      communication: 'up' as const,
      document: 'up' as const,
    };

    // In a real implementation, you would test each service
    const allServicesUp = Object.values(services).every(
      (status) => status === 'up'
    );

    return {
      status: allServicesUp ? 'healthy' : 'unhealthy',
      services,
      timestamp: new Date(),
    };
  }
}
