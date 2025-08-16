import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  Participant,
  ParticipantStatus,
  ParticipantRegistration,
  RegistrationStatus,
  RegistrationWorkflow,
  UUID,
  createUUID,
  ParticipantEnrollment,
  EnrollmentStatus,
  ParticipantProgress,
  ProgressStatus,
} from '../types';

/**
 * Comprehensive Participant Management Service
 * Handles complete participant lifecycle from registration to completion
 */
export class ParticipantManagementService extends EventEmitter {
  private participants: Map<UUID, Participant> = new Map();
  private registrations: Map<UUID, ParticipantRegistration> = new Map();
  private enrollments: Map<UUID, ParticipantEnrollment> = new Map();

  constructor() {
    super();
    this.setupEventHandlers();
  }

  // ============================================================================
  // PARTICIPANT MANAGEMENT
  // ============================================================================

  /**
   * Create a new participant
   */
  async createParticipant(
    participantData: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Participant> {
    const id = createUUID(uuidv4());
    const now = new Date();

    const participant: Participant = {
      ...participantData,
      id,
      enrollments: [],
      documents: [],
      communications: [],
      metadata: participantData.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    this.participants.set(id, participant);

    this.emit('participantCreated', { participant });

    return participant;
  }

  /**
   * Get participant by ID
   */
  async getParticipant(participantId: UUID): Promise<Participant | null> {
    return this.participants.get(participantId) || null;
  }

  /**
   * Get participants with filtering and pagination
   */
  async getParticipants(
    options: {
      status?: ParticipantStatus[];
      department?: string;
      location?: string;
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    participants: Participant[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let filteredParticipants = Array.from(this.participants.values());

    // Apply filters
    if (options.status && options.status.length > 0) {
      filteredParticipants = filteredParticipants.filter((p) =>
        options.status!.includes(p.status)
      );
    }

    if (options.department) {
      filteredParticipants = filteredParticipants.filter(
        (p) => p.department === options.department
      );
    }

    if (options.location) {
      filteredParticipants = filteredParticipants.filter(
        (p) => p.location === options.location
      );
    }

    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filteredParticipants = filteredParticipants.filter(
        (p) =>
          p.firstName.toLowerCase().includes(searchTerm) ||
          p.lastName.toLowerCase().includes(searchTerm) ||
          p.email.toLowerCase().includes(searchTerm) ||
          (p.employeeId && p.employeeId.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    if (options.sortBy) {
      filteredParticipants.sort((a, b) => {
        const aValue = this.getNestedValue(a, options.sortBy!);
        const bValue = this.getNestedValue(b, options.sortBy!);

        if (aValue < bValue) return options.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return options.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedParticipants = filteredParticipants.slice(
      startIndex,
      endIndex
    );

    return {
      participants: paginatedParticipants,
      total: filteredParticipants.length,
      page,
      limit,
      totalPages: Math.ceil(filteredParticipants.length / limit),
    };
  }

  /**
   * Update participant
   */
  async updateParticipant(
    participantId: UUID,
    updates: Partial<Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Participant | null> {
    const participant = this.participants.get(participantId);
    if (!participant) {
      return null;
    }

    const updatedParticipant: Participant = {
      ...participant,
      ...updates,
      id: participantId,
      createdAt: participant.createdAt,
      updatedAt: new Date(),
    };

    this.participants.set(participantId, updatedParticipant);

    this.emit('participantUpdated', {
      participantId,
      participant: updatedParticipant,
      changes: updates,
    });

    return updatedParticipant;
  }

  /**
   * Update participant status
   */
  async updateParticipantStatus(
    participantId: UUID,
    status: ParticipantStatus,
    reason?: string
  ): Promise<Participant | null> {
    const participant = this.participants.get(participantId);
    if (!participant) {
      return null;
    }

    const previousStatus = participant.status;
    const updatedParticipant = await this.updateParticipant(participantId, {
      status,
      metadata: {
        ...participant.metadata,
        statusHistory: [
          ...(participant.metadata.statusHistory || []),
          {
            from: previousStatus,
            to: status,
            reason,
            changedAt: new Date(),
            changedBy: participant.updatedBy,
          },
        ],
      },
    });

    if (updatedParticipant) {
      this.emit('participantStatusChanged', {
        participantId,
        previousStatus,
        newStatus: status,
        reason,
      });
    }

    return updatedParticipant;
  }

  /**
   * Deactivate participant
   */
  async deactivateParticipant(
    participantId: UUID,
    reason?: string
  ): Promise<boolean> {
    const result = await this.updateParticipantStatus(
      participantId,
      ParticipantStatus.INACTIVE,
      reason
    );
    return result !== null;
  }

  /**
   * Reactivate participant
   */
  async reactivateParticipant(
    participantId: UUID,
    reason?: string
  ): Promise<boolean> {
    const result = await this.updateParticipantStatus(
      participantId,
      ParticipantStatus.ACTIVE,
      reason
    );
    return result !== null;
  }

  // ============================================================================
  // REGISTRATION MANAGEMENT
  // ============================================================================

  /**
   * Start participant registration process
   */
  async startRegistration(
    participantId: UUID,
    workflowId: UUID,
    trainingProgramId: UUID
  ): Promise<ParticipantRegistration> {
    const registrationId = createUUID(uuidv4());
    const now = new Date();

    const registration: ParticipantRegistration = {
      id: registrationId,
      participantId,
      workflowId,
      trainingProgramId,
      status: RegistrationStatus.DRAFT,
      currentStep: 1,
      submittedData: {},
      approvals: [],
      validationResults: [],
      notes: [],
      createdAt: now,
      updatedAt: now,
    };

    this.registrations.set(registrationId, registration);

    this.emit('registrationStarted', { registration });

    return registration;
  }

  /**
   * Update registration step data
   */
  async updateRegistrationStep(
    registrationId: UUID,
    stepNumber: number,
    stepData: Record<string, any>
  ): Promise<ParticipantRegistration | null> {
    const registration = this.registrations.get(registrationId);
    if (!registration) {
      return null;
    }

    const updatedRegistration: ParticipantRegistration = {
      ...registration,
      submittedData: {
        ...registration.submittedData,
        [`step_${stepNumber}`]: stepData,
      },
      currentStep: Math.max(registration.currentStep, stepNumber),
      updatedAt: new Date(),
    };

    this.registrations.set(registrationId, updatedRegistration);

    this.emit('registrationStepUpdated', {
      registration: updatedRegistration,
      stepNumber,
      stepData,
    });

    return updatedRegistration;
  }

  /**
   * Submit registration for review
   */
  async submitRegistration(
    registrationId: UUID
  ): Promise<ParticipantRegistration | null> {
    const registration = this.registrations.get(registrationId);
    if (!registration || registration.status !== RegistrationStatus.DRAFT) {
      return null;
    }

    const updatedRegistration: ParticipantRegistration = {
      ...registration,
      status: RegistrationStatus.SUBMITTED,
      submittedAt: new Date(),
      updatedAt: new Date(),
    };

    this.registrations.set(registrationId, updatedRegistration);

    this.emit('registrationSubmitted', { registration: updatedRegistration });

    return updatedRegistration;
  }

  /**
   * Approve registration
   */
  async approveRegistration(
    registrationId: UUID,
    approverId: UUID,
    comments?: string
  ): Promise<ParticipantRegistration | null> {
    const registration = this.registrations.get(registrationId);
    if (!registration) {
      return null;
    }

    const updatedRegistration: ParticipantRegistration = {
      ...registration,
      status: RegistrationStatus.APPROVED,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };

    this.registrations.set(registrationId, updatedRegistration);

    this.emit('registrationApproved', {
      registration: updatedRegistration,
      approverId,
      comments,
    });

    // Auto-enroll if configured
    await this.checkAutoEnrollment(
      registration.participantId,
      registration.trainingProgramId
    );

    return updatedRegistration;
  }

  /**
   * Reject registration
   */
  async rejectRegistration(
    registrationId: UUID,
    approverId: UUID,
    reason: string
  ): Promise<ParticipantRegistration | null> {
    const registration = this.registrations.get(registrationId);
    if (!registration) {
      return null;
    }

    const updatedRegistration: ParticipantRegistration = {
      ...registration,
      status: RegistrationStatus.REJECTED,
      rejectedAt: new Date(),
      rejectionReason: reason,
      updatedAt: new Date(),
    };

    this.registrations.set(registrationId, updatedRegistration);

    this.emit('registrationRejected', {
      registration: updatedRegistration,
      approverId,
      reason,
    });

    return updatedRegistration;
  }

  // ============================================================================
  // ENROLLMENT MANAGEMENT
  // ============================================================================

  /**
   * Enroll participant in training program
   */
  async enrollParticipant(
    participantId: UUID,
    trainingProgramId: UUID,
    options: {
      sessionId?: UUID;
      cohortId?: UUID;
      startDate?: Date;
      expectedCompletionDate?: Date;
      autoStart?: boolean;
    } = {}
  ): Promise<ParticipantEnrollment> {
    const enrollmentId = createUUID(uuidv4());
    const now = new Date();

    const enrollment: ParticipantEnrollment = {
      id: enrollmentId,
      participantId,
      trainingProgramId,
      sessionId: options.sessionId,
      cohortId: options.cohortId,
      status: options.autoStart
        ? EnrollmentStatus.IN_PROGRESS
        : EnrollmentStatus.ENROLLED,
      enrollmentDate: now,
      startDate: options.startDate,
      expectedCompletionDate: options.expectedCompletionDate,
      progress: this.initializeProgress(),
      attendance: [],
      assessments: [],
      interventions: [],
      notes: [],
      metadata: {},
      createdAt: now,
      updatedAt: now,
    };

    this.enrollments.set(enrollmentId, enrollment);

    // Update participant enrollments
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.enrollments.push(enrollment);
      this.participants.set(participantId, participant);
    }

    this.emit('participantEnrolled', { enrollment });

    return enrollment;
  }

  /**
   * Update enrollment status
   */
  async updateEnrollmentStatus(
    enrollmentId: UUID,
    status: EnrollmentStatus,
    reason?: string
  ): Promise<ParticipantEnrollment | null> {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) {
      return null;
    }

    const previousStatus = enrollment.status;
    const updatedEnrollment: ParticipantEnrollment = {
      ...enrollment,
      status,
      updatedAt: new Date(),
      metadata: {
        ...enrollment.metadata,
        statusHistory: [
          ...(enrollment.metadata.statusHistory || []),
          {
            from: previousStatus,
            to: status,
            reason,
            changedAt: new Date(),
          },
        ],
      },
    };

    // Set completion date if completing
    if (
      status === EnrollmentStatus.COMPLETED &&
      !enrollment.actualCompletionDate
    ) {
      updatedEnrollment.actualCompletionDate = new Date();
    }

    this.enrollments.set(enrollmentId, updatedEnrollment);

    this.emit('enrollmentStatusChanged', {
      enrollment: updatedEnrollment,
      previousStatus,
      newStatus: status,
      reason,
    });

    return updatedEnrollment;
  }

  /**
   * Withdraw participant from enrollment
   */
  async withdrawParticipant(
    enrollmentId: UUID,
    reason: string,
    withdrawnBy: UUID
  ): Promise<ParticipantEnrollment | null> {
    const enrollment = await this.updateEnrollmentStatus(
      enrollmentId,
      EnrollmentStatus.WITHDRAWN,
      reason
    );

    if (enrollment) {
      enrollment.metadata = {
        ...enrollment.metadata,
        withdrawalReason: reason,
        withdrawnBy,
        withdrawnAt: new Date(),
      };

      this.enrollments.set(enrollmentId, enrollment);

      this.emit('participantWithdrawn', { enrollment, reason, withdrawnBy });
    }

    return enrollment;
  }

  /**
   * Transfer participant to different session/cohort
   */
  async transferParticipant(
    enrollmentId: UUID,
    newSessionId?: UUID,
    newCohortId?: UUID,
    reason?: string
  ): Promise<ParticipantEnrollment | null> {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) {
      return null;
    }

    const previousSessionId = enrollment.sessionId;
    const previousCohortId = enrollment.cohortId;

    const updatedEnrollment: ParticipantEnrollment = {
      ...enrollment,
      sessionId: newSessionId || enrollment.sessionId,
      cohortId: newCohortId || enrollment.cohortId,
      status: EnrollmentStatus.TRANSFERRED,
      updatedAt: new Date(),
      metadata: {
        ...enrollment.metadata,
        transferHistory: [
          ...(enrollment.metadata.transferHistory || []),
          {
            fromSessionId: previousSessionId,
            toSessionId: newSessionId,
            fromCohortId: previousCohortId,
            toCohortId: newCohortId,
            reason,
            transferredAt: new Date(),
          },
        ],
      },
    };

    this.enrollments.set(enrollmentId, updatedEnrollment);

    this.emit('participantTransferred', {
      enrollment: updatedEnrollment,
      previousSessionId,
      newSessionId,
      previousCohortId,
      newCohortId,
      reason,
    });

    return updatedEnrollment;
  }

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  /**
   * Update participant progress
   */
  async updateProgress(
    enrollmentId: UUID,
    progressUpdate: Partial<ParticipantProgress>
  ): Promise<ParticipantEnrollment | null> {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) {
      return null;
    }

    const updatedProgress: ParticipantProgress = {
      ...enrollment.progress,
      ...progressUpdate,
      lastActivityDate: new Date(),
    };

    const updatedEnrollment: ParticipantEnrollment = {
      ...enrollment,
      progress: updatedProgress,
      updatedAt: new Date(),
    };

    this.enrollments.set(enrollmentId, updatedEnrollment);

    this.emit('progressUpdated', {
      enrollment: updatedEnrollment,
      progressUpdate,
    });

    // Check for completion
    if (updatedProgress.overallProgress >= 100) {
      await this.updateEnrollmentStatus(
        enrollmentId,
        EnrollmentStatus.COMPLETED
      );
    }

    return updatedEnrollment;
  }

  /**
   * Get participant analytics
   */
  async getParticipantAnalytics(participantId: UUID): Promise<{
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    averageProgress: number;
    totalTrainingHours: number;
    attendanceRate: number;
    lastActivity?: Date;
    upcomingSessions: number;
    overdueAssignments: number;
  }> {
    const participant = this.participants.get(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    const enrollments = participant.enrollments;
    const activeEnrollments = enrollments.filter(
      (e) =>
        e.status === EnrollmentStatus.ENROLLED ||
        e.status === EnrollmentStatus.IN_PROGRESS
    );
    const completedEnrollments = enrollments.filter(
      (e) => e.status === EnrollmentStatus.COMPLETED
    );

    const totalProgress = enrollments.reduce(
      (sum, e) => sum + e.progress.overallProgress,
      0
    );
    const averageProgress =
      enrollments.length > 0 ? totalProgress / enrollments.length : 0;

    const attendanceRecords = enrollments.flatMap((e) => e.attendance);
    const totalSessions = attendanceRecords.length;
    const presentSessions = attendanceRecords.filter(
      (a) => a.status === 'present'
    ).length;
    const attendanceRate =
      totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

    const lastActivities = enrollments
      .map((e) => e.progress.lastActivityDate)
      .filter((date) => date)
      .sort((a, b) => b!.getTime() - a!.getTime());

    return {
      totalEnrollments: enrollments.length,
      activeEnrollments: activeEnrollments.length,
      completedEnrollments: completedEnrollments.length,
      averageProgress,
      totalTrainingHours: 0, // TODO: Calculate from sessions
      attendanceRate,
      lastActivity: lastActivities[0],
      upcomingSessions: 0, // TODO: Calculate from schedule
      overdueAssignments: 0, // TODO: Calculate from assessments
    };
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk enroll participants
   */
  async bulkEnrollParticipants(
    participantIds: UUID[],
    trainingProgramId: UUID,
    options: {
      sessionId?: UUID;
      cohortId?: UUID;
      startDate?: Date;
      expectedCompletionDate?: Date;
    } = {}
  ): Promise<{
    successful: ParticipantEnrollment[];
    failed: { participantId: UUID; error: string }[];
  }> {
    const successful: ParticipantEnrollment[] = [];
    const failed: { participantId: UUID; error: string }[] = [];

    for (const participantId of participantIds) {
      try {
        const enrollment = await this.enrollParticipant(
          participantId,
          trainingProgramId,
          options
        );
        successful.push(enrollment);
      } catch (error) {
        failed.push({
          participantId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.emit('bulkEnrollmentCompleted', { successful, failed });

    return { successful, failed };
  }

  /**
   * Bulk update participant status
   */
  async bulkUpdateStatus(
    participantIds: UUID[],
    status: ParticipantStatus,
    reason?: string
  ): Promise<{
    successful: UUID[];
    failed: { participantId: UUID; error: string }[];
  }> {
    const successful: UUID[] = [];
    const failed: { participantId: UUID; error: string }[] = [];

    for (const participantId of participantIds) {
      try {
        await this.updateParticipantStatus(participantId, status, reason);
        successful.push(participantId);
      } catch (error) {
        failed.push({
          participantId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.emit('bulkStatusUpdateCompleted', {
      successful,
      failed,
      status,
      reason,
    });

    return { successful, failed };
  }

  // ============================================================================
  // SEARCH AND FILTERING
  // ============================================================================

  /**
   * Advanced participant search
   */
  async searchParticipants(criteria: {
    text?: string;
    status?: ParticipantStatus[];
    department?: string[];
    location?: string[];
    enrollmentStatus?: EnrollmentStatus[];
    trainingPrograms?: UUID[];
    dateRange?: {
      field: 'createdAt' | 'enrollmentDate' | 'actualCompletionDate';
      start: Date;
      end: Date;
    };
    progressRange?: {
      min: number;
      max: number;
    };
  }): Promise<Participant[]> {
    let results = Array.from(this.participants.values());

    // Text search
    if (criteria.text) {
      const searchTerm = criteria.text.toLowerCase();
      results = results.filter(
        (p) =>
          p.firstName.toLowerCase().includes(searchTerm) ||
          p.lastName.toLowerCase().includes(searchTerm) ||
          p.email.toLowerCase().includes(searchTerm) ||
          (p.employeeId && p.employeeId.toLowerCase().includes(searchTerm)) ||
          (p.department && p.department.toLowerCase().includes(searchTerm)) ||
          (p.position && p.position.toLowerCase().includes(searchTerm))
      );
    }

    // Status filter
    if (criteria.status && criteria.status.length > 0) {
      results = results.filter((p) => criteria.status!.includes(p.status));
    }

    // Department filter
    if (criteria.department && criteria.department.length > 0) {
      results = results.filter(
        (p) => p.department && criteria.department!.includes(p.department)
      );
    }

    // Location filter
    if (criteria.location && criteria.location.length > 0) {
      results = results.filter(
        (p) => p.location && criteria.location!.includes(p.location)
      );
    }

    // Enrollment status filter
    if (criteria.enrollmentStatus && criteria.enrollmentStatus.length > 0) {
      results = results.filter((p) =>
        p.enrollments.some((e) => criteria.enrollmentStatus!.includes(e.status))
      );
    }

    // Training programs filter
    if (criteria.trainingPrograms && criteria.trainingPrograms.length > 0) {
      results = results.filter((p) =>
        p.enrollments.some((e) =>
          criteria.trainingPrograms!.includes(e.trainingProgramId)
        )
      );
    }

    // Date range filter
    if (criteria.dateRange) {
      results = results.filter((p) => {
        let dateToCheck: Date;
        switch (criteria.dateRange!.field) {
          case 'createdAt':
            dateToCheck = p.createdAt;
            break;
          case 'enrollmentDate':
            const enrollmentDates = p.enrollments.map((e) => e.enrollmentDate);
            if (enrollmentDates.length === 0) return false;
            dateToCheck = new Date(
              Math.max(...enrollmentDates.map((d) => d.getTime()))
            );
            break;
          case 'actualCompletionDate':
            const completionDates = p.enrollments
              .map((e) => e.actualCompletionDate)
              .filter((d) => d) as Date[];
            if (completionDates.length === 0) return false;
            dateToCheck = new Date(
              Math.max(...completionDates.map((d) => d.getTime()))
            );
            break;
          default:
            return false;
        }
        return (
          dateToCheck >= criteria.dateRange!.start &&
          dateToCheck <= criteria.dateRange!.end
        );
      });
    }

    // Progress range filter
    if (criteria.progressRange) {
      results = results.filter((p) => {
        const avgProgress =
          p.enrollments.length > 0
            ? p.enrollments.reduce(
                (sum, e) => sum + e.progress.overallProgress,
                0
              ) / p.enrollments.length
            : 0;
        return (
          avgProgress >= criteria.progressRange!.min &&
          avgProgress <= criteria.progressRange!.max
        );
      });
    }

    return results;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private setupEventHandlers(): void {
    this.on('participantCreated', this.handleParticipantCreated.bind(this));
    this.on('registrationApproved', this.handleRegistrationApproved.bind(this));
    this.on(
      'enrollmentStatusChanged',
      this.handleEnrollmentStatusChanged.bind(this)
    );
  }

  private async handleParticipantCreated(event: {
    participant: Participant;
  }): Promise<void> {
    // Initialize participant tracking
    console.log(
      `Participant created: ${event.participant.firstName} ${event.participant.lastName}`
    );
  }

  private async handleRegistrationApproved(event: {
    registration: ParticipantRegistration;
    approverId: UUID;
    comments?: string;
  }): Promise<void> {
    // Handle auto-enrollment logic
    await this.checkAutoEnrollment(
      event.registration.participantId,
      event.registration.trainingProgramId
    );
  }

  private async handleEnrollmentStatusChanged(event: {
    enrollment: ParticipantEnrollment;
    previousStatus: EnrollmentStatus;
    newStatus: EnrollmentStatus;
    reason?: string;
  }): Promise<void> {
    // Update participant status if needed
    if (event.newStatus === EnrollmentStatus.COMPLETED) {
      const participant = this.participants.get(event.enrollment.participantId);
      if (participant) {
        // Check if all active enrollments are completed
        const activeEnrollments = participant.enrollments.filter(
          (e) =>
            e.status === EnrollmentStatus.IN_PROGRESS ||
            e.status === EnrollmentStatus.ENROLLED
        );

        if (
          activeEnrollments.length === 1 &&
          activeEnrollments[0].id === event.enrollment.id
        ) {
          await this.updateParticipantStatus(
            event.enrollment.participantId,
            ParticipantStatus.COMPLETED,
            'All training programs completed'
          );
        }
      }
    }
  }

  private async checkAutoEnrollment(
    participantId: UUID,
    trainingProgramId: UUID
  ): Promise<void> {
    try {
      // Get participant and training program details
      const participant = this.participants.get(participantId);
      if (!participant) {
        console.warn(
          'Participant not found for auto-enrollment check:',
          participantId
        );
        return;
      }

      // Check if already enrolled
      const existingEnrollment = participant.enrollments.find(
        (e) => e.trainingProgramId === trainingProgramId
      );
      if (existingEnrollment) {
        console.log(
          'Participant already enrolled in program:',
          trainingProgramId
        );
        return;
      }

      // Check auto-enrollment rules based on participant profile
      const shouldAutoEnroll = await this.evaluateAutoEnrollmentRules(
        participant,
        trainingProgramId
      );

      if (shouldAutoEnroll) {
        console.log(
          'Auto-enrolling participant',
          participantId,
          'in program',
          trainingProgramId
        );
        await this.enrollParticipant(participantId, trainingProgramId, {
          autoStart: true,
        });
      } else {
        console.log(
          'Auto-enrollment criteria not met for participant',
          participantId
        );
      }
    } catch (error) {
      console.error('Auto-enrollment check failed:', error);
    }
  }

  private async evaluateAutoEnrollmentRules(
    participant: Participant,
    trainingProgramId: UUID
  ): Promise<boolean> {
    // Comprehensive auto-enrollment rule evaluation

    // Rule 1: Department-based enrollment
    if (this.checkDepartmentBasedEnrollment(participant, trainingProgramId)) {
      return true;
    }

    // Rule 2: Role-based enrollment
    if (this.checkRoleBasedEnrollment(participant, trainingProgramId)) {
      return true;
    }

    // Rule 3: Skill gap-based enrollment
    if (
      await this.checkSkillGapBasedEnrollment(participant, trainingProgramId)
    ) {
      return true;
    }

    // Rule 4: Compliance requirement-based enrollment
    if (this.checkComplianceBasedEnrollment(participant, trainingProgramId)) {
      return true;
    }

    // Rule 5: Career path-based enrollment
    if (this.checkCareerPathBasedEnrollment(participant, trainingProgramId)) {
      return true;
    }

    // Rule 6: Performance-based enrollment
    if (this.checkPerformanceBasedEnrollment(participant, trainingProgramId)) {
      return true;
    }

    return false;
  }

  private checkDepartmentBasedEnrollment(
    participant: Participant,
    trainingProgramId: UUID
  ): boolean {
    // Define department-specific training programs
    const departmentTrainingMap: Record<string, string[]> = {
      IT: ['it-security-basics', 'cloud-computing-101', 'agile-development'],
      HR: [
        'employee-relations',
        'recruitment-best-practices',
        'performance-management',
      ],
      Finance: ['financial-analysis', 'budget-planning', 'compliance-training'],
      Sales: ['sales-techniques', 'customer-relations', 'crm-training'],
      Marketing: [
        'digital-marketing',
        'content-strategy',
        'analytics-training',
      ],
      Operations: [
        'process-improvement',
        'quality-management',
        'safety-training',
      ],
    };

    const department = participant.department;
    if (!department) return false;

    const departmentPrograms = departmentTrainingMap[department] || [];
    return departmentPrograms.includes(trainingProgramId.toString());
  }

  private checkRoleBasedEnrollment(
    participant: Participant,
    trainingProgramId: UUID
  ): boolean {
    // Define role-specific training requirements
    const roleTrainingMap: Record<string, string[]> = {
      Manager: [
        'leadership-fundamentals',
        'team-management',
        'performance-coaching',
      ],
      'Senior Developer': [
        'architecture-patterns',
        'code-review-best-practices',
        'mentoring-skills',
      ],
      'Data Analyst': [
        'advanced-excel',
        'data-visualization',
        'statistical-analysis',
      ],
      'Project Manager': [
        'project-management-certification',
        'risk-management',
        'stakeholder-communication',
      ],
      'Customer Support': [
        'customer-service-excellence',
        'conflict-resolution',
        'product-knowledge',
      ],
    };

    const role = participant.position;
    if (!role) return false;

    const rolePrograms = roleTrainingMap[role] || [];
    return rolePrograms.includes(trainingProgramId.toString());
  }

  private async checkSkillGapBasedEnrollment(
    participant: Participant,
    trainingProgramId: UUID
  ): Promise<boolean> {
    // Check if participant has skill gaps that this training program addresses
    const skillGaps = await this.getParticipantSkillGaps(participant.id);
    const programSkills =
      await this.getTrainingProgramSkills(trainingProgramId);

    // If training program addresses any of the participant's skill gaps, auto-enroll
    return skillGaps.some((gap) => programSkills.includes(gap.skillId));
  }

  private checkComplianceBasedEnrollment(
    participant: Participant,
    trainingProgramId: UUID
  ): boolean {
    // Define compliance training requirements
    const complianceTraining = [
      'data-privacy-training',
      'workplace-safety',
      'anti-harassment-training',
      'security-awareness',
      'code-of-conduct',
    ];

    if (!complianceTraining.includes(trainingProgramId.toString())) {
      return false;
    }

    // Check if participant needs compliance training based on:
    // 1. New employee (within first 30 days)
    // 2. Annual renewal requirement
    // 3. Role change requiring new compliance training

    const hireDate = new Date(participant.hireDate || Date.now());
    const daysSinceHire = Math.floor(
      (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // New employee - auto-enroll in all compliance training
    if (daysSinceHire <= 30) {
      return true;
    }

    // Check for expired compliance certifications
    const lastCompleted = participant.enrollments
      .filter(
        (e) =>
          e.trainingProgramId === trainingProgramId &&
          e.status === EnrollmentStatus.COMPLETED
      )
      .sort(
        (a, b) =>
          new Date(b.enrollmentDate).getTime() -
          new Date(a.enrollmentDate).getTime()
      )[0];

    if (!lastCompleted) {
      return true; // Never completed compliance training
    }

    // Check if compliance training needs renewal (annual)
    const lastCompletedDate = new Date(
      lastCompleted.actualCompletionDate || lastCompleted.enrollmentDate
    );
    const daysSinceCompletion = Math.floor(
      (Date.now() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceCompletion > 365; // Renew annually
  }

  private checkCareerPathBasedEnrollment(
    participant: Participant,
    trainingProgramId: UUID
  ): boolean {
    // Check if training program is part of participant's career development path
    const careerPathTraining: Record<string, string[]> = {
      'technical-lead-path': [
        'architecture-design',
        'team-leadership',
        'technical-mentoring',
      ],
      'management-path': [
        'people-management',
        'strategic-planning',
        'budget-management',
      ],
      'specialist-path': [
        'advanced-analytics',
        'domain-expertise',
        'research-methods',
      ],
      'cross-functional-path': [
        'collaboration-skills',
        'process-improvement',
        'change-management',
      ],
    };

    const careerGoal = participant.profileData.customFields?.careerGoals;
    if (!careerGoal) return false;

    // Simple career path matching - in real implementation, this would be more sophisticated
    for (const [path, programs] of Object.entries(careerPathTraining)) {
      if (
        careerGoal.toLowerCase().includes(path.split('-')[0]) &&
        programs.includes(trainingProgramId.toString())
      ) {
        return true;
      }
    }

    return false;
  }

  private checkPerformanceBasedEnrollment(
    participant: Participant,
    trainingProgramId: UUID
  ): boolean {
    // Auto-enroll based on performance indicators
    const performanceTraining: Record<string, string[]> = {
      'improvement-needed': [
        'time-management',
        'productivity-techniques',
        'goal-setting',
      ],
      'high-performer': [
        'advanced-skills',
        'leadership-development',
        'innovation-training',
      ],
      'new-challenges': [
        'adaptability-training',
        'problem-solving',
        'critical-thinking',
      ],
    };

    // In a real implementation, this would analyze performance reviews, 360 feedback, etc.
    // For now, simulate performance-based enrollment logic

    const recentEnrollments = participant.enrollments.filter((e) => {
      const enrollmentDate = new Date(e.enrollmentDate);
      const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      return enrollmentDate > threeMonthsAgo;
    });

    // If participant has completed multiple training programs recently, they might be a high performer
    if (
      recentEnrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED)
        .length >= 3
    ) {
      const highPerformerPrograms = performanceTraining['high-performer'];
      return highPerformerPrograms.includes(trainingProgramId.toString());
    }

    // If participant has incomplete enrollments, they might need improvement support
    if (
      recentEnrollments.filter((e) => e.status === EnrollmentStatus.WITHDRAWN)
        .length >= 2
    ) {
      const improvementPrograms = performanceTraining['improvement-needed'];
      return improvementPrograms.includes(trainingProgramId.toString());
    }

    return false;
  }

  private async getParticipantSkillGaps(
    participantId: UUID
  ): Promise<Array<{ skillId: string; gapLevel: number }>> {
    // In real implementation, this would integrate with skills assessment system
    // For now, simulate skill gaps based on participant profile
    const mockSkillGaps = [
      { skillId: 'javascript', gapLevel: 2 },
      { skillId: 'project-management', gapLevel: 1 },
      { skillId: 'data-analysis', gapLevel: 3 },
    ];

    return mockSkillGaps;
  }

  private async getTrainingProgramSkills(
    trainingProgramId: UUID
  ): Promise<string[]> {
    // In real implementation, this would query training program metadata
    // For now, simulate program skills mapping
    const programSkillsMap: Record<string, string[]> = {
      'javascript-fundamentals': ['javascript', 'web-development'],
      'project-management-101': ['project-management', 'leadership'],
      'data-analysis-basics': ['data-analysis', 'excel', 'statistics'],
      'advanced-react': ['javascript', 'react', 'frontend-development'],
      'leadership-training': ['leadership', 'communication', 'team-management'],
    };

    return programSkillsMap[trainingProgramId.toString()] || [];
  }

  private initializeProgress(): ParticipantProgress {
    return {
      overallProgress: 0,
      modulesCompleted: 0,
      totalModules: 0,
      assessmentsPassed: 0,
      totalAssessments: 0,
      attendancePercentage: 0,
      milestones: [],
      competencies: [],
      learningPath: [],
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
