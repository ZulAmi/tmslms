import { EventEmitter } from 'events';
import {
  differenceInMinutes,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  addDays,
  parseISO,
} from 'date-fns';
import { v4 as uuid } from 'uuid';
import {
  UUID,
  createUUID,
  TrainingSession,
  Resource,
  ResourceAllocation,
  SchedulingRequest,
  OptimizationResult,
  SchedulingConflict,
  ConflictType,
  ConflictResolution,
  AlternativeSchedule,
  ResourceType,
  TrainingStatus,
  ResourceStatus,
  SchedulingError,
  ResourceConflictError,
  InstructorUnavailableError,
  CapacityExceededError,
  InvalidTimeSlotError,
  Instructor,
  InstructorPreference,
  ResourceRequirement,
  SchedulingConstraint,
  FlexibilityOptions,
  AlternativeOption,
  ImpactAssessment,
} from '../types';

export interface ISchedulingService {
  scheduleSession(request: SchedulingRequest): Promise<OptimizationResult>;
  detectConflicts(sessions: TrainingSession[]): Promise<SchedulingConflict[]>;
  resolveConflict(
    conflict: SchedulingConflict,
    resolution: ConflictResolution
  ): Promise<boolean>;
  findAlternativeSlots(
    sessionId: UUID,
    constraints: SchedulingConstraint[]
  ): Promise<AlternativeSchedule[]>;
  optimizeSchedule(
    sessions: TrainingSession[],
    resources: Resource[]
  ): Promise<OptimizationResult[]>;
  validateScheduling(
    session: TrainingSession
  ): Promise<{ isValid: boolean; errors: string[] }>;
}

export class SchedulingService
  extends EventEmitter
  implements ISchedulingService
{
  private sessions: Map<UUID, TrainingSession> = new Map();
  private resources: Map<UUID, Resource> = new Map();
  private instructors: Map<UUID, Instructor> = new Map();
  private resourceAllocations: Map<UUID, ResourceAllocation> = new Map();
  private conflicts: Map<UUID, SchedulingConflict> = new Map();

  constructor(
    private readonly databaseService?: any,
    private readonly notificationService?: any,
    private readonly calendarService?: any
  ) {
    super();
  }

  // ============================================================================
  // MAIN SCHEDULING METHODS
  // ============================================================================

  async scheduleSession(
    request: SchedulingRequest
  ): Promise<OptimizationResult> {
    const startTime = Date.now();

    try {
      // Validate the scheduling request
      await this.validateSchedulingRequest(request);

      // Get session details
      const session = await this.getSession(request.sessionId);
      if (!session) {
        throw new SchedulingError('Session not found', 'SESSION_NOT_FOUND');
      }

      // Find optimal schedule using AI-powered optimization
      const optimizationResult = await this.optimizeSessionScheduling(
        session,
        request
      );

      // If successful, allocate resources and update session
      if (optimizationResult.success && optimizationResult.scheduledDateTime) {
        await this.allocateResources(
          session,
          optimizationResult.allocatedResources
        );
        await this.updateSessionSchedule(session, optimizationResult);

        // Emit scheduling success event
        this.emit('sessionScheduled', {
          sessionId: session.id,
          startDateTime: optimizationResult.scheduledDateTime,
          resources: optimizationResult.allocatedResources,
        });
      }

      optimizationResult.processingTimeMs = Date.now() - startTime;
      return optimizationResult;
    } catch (error) {
      this.emit('schedulingError', {
        sessionId: request.sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        id: createUUID(uuid()),
        requestId: request.id,
        success: false,
        allocatedResources: [],
        alternativeOptions: [],
        conflicts: [],
        optimizationScore: 0,
        processingTimeMs: Date.now() - startTime,
        generatedAt: new Date(),
      };
    }
  }

  async detectConflicts(
    sessions: TrainingSession[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Check for resource conflicts
    const resourceConflicts = await this.detectResourceConflicts(sessions);
    conflicts.push(...resourceConflicts);

    // Check for instructor conflicts
    const instructorConflicts = await this.detectInstructorConflicts(sessions);
    conflicts.push(...instructorConflicts);

    // Check for capacity conflicts
    const capacityConflicts = await this.detectCapacityConflicts(sessions);
    conflicts.push(...capacityConflicts);

    // Check for time overlap conflicts
    const timeConflicts = await this.detectTimeOverlapConflicts(sessions);
    conflicts.push(...timeConflicts);

    // Check for maintenance conflicts
    const maintenanceConflicts =
      await this.detectMaintenanceConflicts(sessions);
    conflicts.push(...maintenanceConflicts);

    // Store conflicts for tracking
    conflicts.forEach((conflict) => {
      this.conflicts.set(conflict.id, conflict);
    });

    return conflicts;
  }

  async resolveConflict(
    conflict: SchedulingConflict,
    resolution: ConflictResolution
  ): Promise<boolean> {
    try {
      switch (resolution.type) {
        case 'reschedule':
          return await this.rescheduleConflictingSessions(conflict, resolution);

        case 'reallocate_resource':
          return await this.reallocateResources(conflict, resolution);

        case 'change_instructor':
          return await this.changeInstructor(conflict, resolution);

        case 'split_session':
          return await this.splitSession(conflict, resolution);

        case 'cancel':
          return await this.cancelConflictingSessions(conflict, resolution);

        default:
          throw new SchedulingError(
            `Unknown resolution type: ${resolution.type}`,
            'INVALID_RESOLUTION'
          );
      }
    } catch (error) {
      this.emit('conflictResolutionError', {
        conflictId: conflict.id,
        resolutionId: resolution.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async findAlternativeSlots(
    sessionId: UUID,
    constraints: SchedulingConstraint[]
  ): Promise<AlternativeSchedule[]> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new SchedulingError('Session not found', 'SESSION_NOT_FOUND');
    }

    const alternatives: AlternativeSchedule[] = [];
    const sessionDuration = differenceInMinutes(
      session.endDateTime,
      session.startDateTime
    );

    // Get time window from constraints
    const timeWindow = this.extractTimeWindowFromConstraints(constraints);

    // Generate time slots within the window
    const timeSlots = this.generateTimeSlots(
      timeWindow.start,
      timeWindow.end,
      sessionDuration
    );

    for (const slot of timeSlots) {
      const alternative = await this.evaluateAlternativeSlot(
        session,
        slot,
        constraints
      );
      if (alternative && alternative.score > 0) {
        alternatives.push(alternative);
      }
    }

    // Sort by score (best first)
    alternatives.sort((a, b) => b.score - a.score);

    // Rank alternatives
    alternatives.forEach((alt, index) => {
      alt.rank = index + 1;
    });

    return alternatives.slice(0, 10); // Return top 10 alternatives
  }

  async optimizeSchedule(
    sessions: TrainingSession[],
    resources: Resource[]
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    // Group sessions by priority and dependencies
    const sessionGroups = this.groupSessionsByPriority(sessions);

    for (const group of sessionGroups) {
      for (const session of group) {
        const request: SchedulingRequest =
          this.createOptimizationRequest(session);
        const result = await this.scheduleSession(request);
        results.push(result);
      }
    }

    // Perform global optimization
    await this.performGlobalOptimization(results, resources);

    return results;
  }

  async validateScheduling(
    session: TrainingSession
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate time slot
    if (isAfter(session.startDateTime, session.endDateTime)) {
      errors.push('Start time must be before end time');
    }

    // Validate capacity
    if (session.enrolledCount > session.maxParticipants) {
      errors.push('Enrolled count exceeds maximum participants');
    }

    if (session.minParticipants > session.maxParticipants) {
      errors.push('Minimum participants cannot exceed maximum participants');
    }

    // Validate resource allocations
    for (const allocation of session.resourceAllocations) {
      const resource = await this.getResource(allocation.resourceId);
      if (!resource) {
        errors.push(`Resource ${allocation.resourceId} not found`);
        continue;
      }

      if (resource.status !== ResourceStatus.AVAILABLE) {
        errors.push(`Resource ${resource.name} is not available`);
      }

      // Check resource capacity
      if (resource.capacity && session.maxParticipants > resource.capacity) {
        errors.push(
          `Session capacity (${session.maxParticipants}) exceeds resource capacity (${resource.capacity})`
        );
      }
    }

    // Validate instructor availability
    if (session.instructorId) {
      const instructor = await this.getInstructor(session.instructorId);
      if (!instructor) {
        errors.push(`Instructor ${session.instructorId} not found`);
      } else if (!instructor.isActive) {
        errors.push(`Instructor ${instructor.userId} is not active`);
      } else {
        const isAvailable = await this.checkInstructorAvailability(
          instructor,
          session.startDateTime,
          session.endDateTime
        );
        if (!isAvailable) {
          errors.push(`Instructor is not available during the scheduled time`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ============================================================================
  // OPTIMIZATION ALGORITHMS
  // ============================================================================

  private async optimizeSessionScheduling(
    session: TrainingSession,
    request: SchedulingRequest
  ): Promise<OptimizationResult> {
    const alternatives: AlternativeSchedule[] = [];
    let bestSchedule: AlternativeSchedule | null = null;
    let conflicts: SchedulingConflict[] = [];

    // Try each preferred time slot
    for (const preferredTime of request.preferredStartTimes) {
      const endTime = new Date(
        preferredTime.getTime() +
          differenceInMinutes(session.endDateTime, session.startDateTime) *
            60000
      );

      const schedule = await this.evaluateTimeSlot(
        session,
        preferredTime,
        endTime,
        request.requiredResources,
        request.instructorPreferences,
        request.constraints
      );

      if (schedule) {
        alternatives.push(schedule);
        if (!bestSchedule || schedule.score > bestSchedule.score) {
          bestSchedule = schedule;
        }
      }
    }

    // If no preferred times work, try intelligent suggestions
    if (!bestSchedule || bestSchedule.conflicts.length > 0) {
      const suggestedSlots = await this.generateIntelligentTimeSlots(
        session,
        request
      );

      for (const slot of suggestedSlots) {
        const schedule = await this.evaluateTimeSlot(
          session,
          slot.start,
          slot.end,
          request.requiredResources,
          request.instructorPreferences,
          request.constraints
        );

        if (schedule) {
          alternatives.push(schedule);
          if (!bestSchedule || schedule.score > bestSchedule.score) {
            bestSchedule = schedule;
          }
        }
      }
    }

    // Sort alternatives by score
    alternatives.sort((a, b) => b.score - a.score);

    const result: OptimizationResult = {
      id: createUUID(uuid()),
      requestId: request.id,
      success: bestSchedule !== null && bestSchedule.conflicts.length === 0,
      scheduledDateTime: bestSchedule?.startDateTime,
      allocatedResources: bestSchedule?.resources || [],
      assignedInstructorId: bestSchedule?.instructorId,
      alternativeOptions: alternatives.slice(0, 5), // Top 5 alternatives
      conflicts: bestSchedule?.conflicts || [],
      optimizationScore: bestSchedule?.score || 0,
      processingTimeMs: 0, // Will be set by caller
      generatedAt: new Date(),
    };

    return result;
  }

  private async evaluateTimeSlot(
    session: TrainingSession,
    startTime: Date,
    endTime: Date,
    resourceRequirements: ResourceRequirement[],
    instructorPreferences: InstructorPreference[],
    constraints: SchedulingConstraint[]
  ): Promise<AlternativeSchedule | null> {
    let score = 100; // Start with perfect score
    const conflicts: SchedulingConflict[] = [];
    const allocatedResources: ResourceAllocation[] = [];
    let assignedInstructorId: UUID | undefined;

    // Check time constraints
    const timeViolations = this.checkTimeConstraints(
      startTime,
      endTime,
      constraints
    );
    score -= timeViolations.length * 20;

    // Try to allocate resources
    const resourceAllocation = await this.findBestResourceAllocation(
      resourceRequirements,
      startTime,
      endTime
    );

    if (!resourceAllocation.success) {
      score -= 40;
      conflicts.push(...resourceAllocation.conflicts);
    } else {
      allocatedResources.push(...resourceAllocation.allocations);
      score += resourceAllocation.qualityScore;
    }

    // Try to assign instructor
    const instructorAssignment = await this.findBestInstructor(
      instructorPreferences,
      startTime,
      endTime,
      session.type
    );

    if (!instructorAssignment.success) {
      score -= 30;
      if (instructorAssignment.conflicts) {
        conflicts.push(...instructorAssignment.conflicts);
      }
    } else {
      assignedInstructorId = instructorAssignment.instructorId;
      score += instructorAssignment.qualityScore;
    }

    // Apply constraint penalties
    for (const constraint of constraints) {
      if (!constraint.isHard) continue;

      const violation = this.checkConstraintViolation(constraint, {
        startTime,
        endTime,
        resources: allocatedResources,
        instructorId: assignedInstructorId,
      });

      if (violation) {
        score -= 25;
        conflicts.push(violation);
      }
    }

    // If score is too low, don't return this option
    if (score < 20) {
      return null;
    }

    return {
      rank: 0, // Will be set later
      startDateTime: startTime,
      endDateTime: endTime,
      resources: allocatedResources,
      instructorId: assignedInstructorId,
      score,
      tradeoffs: this.generateTradeoffExplanations(score, conflicts),
      conflicts,
    };
  }

  // ============================================================================
  // CONFLICT DETECTION
  // ============================================================================

  private async detectResourceConflicts(
    sessions: TrainingSession[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];
    const resourceBookings = new Map<UUID, TrainingSession[]>();

    // Group sessions by resource
    for (const session of sessions) {
      for (const allocation of session.resourceAllocations) {
        if (!resourceBookings.has(allocation.resourceId)) {
          resourceBookings.set(allocation.resourceId, []);
        }
        resourceBookings.get(allocation.resourceId)!.push(session);
      }
    }

    // Check for overlapping bookings
    for (const [resourceId, resourceSessions] of resourceBookings) {
      const sortedSessions = resourceSessions.sort(
        (a, b) => a.startDateTime.getTime() - b.startDateTime.getTime()
      );

      for (let i = 0; i < sortedSessions.length - 1; i++) {
        const current = sortedSessions[i];
        const next = sortedSessions[i + 1];

        if (isBefore(next.startDateTime, current.endDateTime)) {
          const conflict: SchedulingConflict = {
            id: createUUID(uuid()),
            type: ConflictType.RESOURCE_DOUBLE_BOOKING,
            severity: 'high',
            description: `Resource ${resourceId} is double-booked`,
            affectedSessions: [current.id, next.id],
            affectedResources: [resourceId],
            suggestedResolutions: await this.generateConflictResolutions(
              ConflictType.RESOURCE_DOUBLE_BOOKING,
              [current, next],
              [resourceId]
            ),
            detectedAt: new Date(),
          };
          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  private async detectInstructorConflicts(
    sessions: TrainingSession[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];
    const instructorSessions = new Map<UUID, TrainingSession[]>();

    // Group sessions by instructor
    for (const session of sessions) {
      if (session.instructorId) {
        if (!instructorSessions.has(session.instructorId)) {
          instructorSessions.set(session.instructorId, []);
        }
        instructorSessions.get(session.instructorId)!.push(session);
      }
    }

    // Check for overlapping assignments
    for (const [instructorId, instructorSessionList] of instructorSessions) {
      const sortedSessions = instructorSessionList.sort(
        (a, b) => a.startDateTime.getTime() - b.startDateTime.getTime()
      );

      for (let i = 0; i < sortedSessions.length - 1; i++) {
        const current = sortedSessions[i];
        const next = sortedSessions[i + 1];

        // Check for overlap or insufficient break time
        const minimumBreakMinutes = 15; // Configurable
        const breakTime = differenceInMinutes(
          next.startDateTime,
          current.endDateTime
        );

        if (breakTime < minimumBreakMinutes) {
          const conflictType =
            breakTime < 0
              ? ConflictType.INSTRUCTOR_CONFLICT
              : ConflictType.MINIMUM_BREAK_VIOLATED;

          const conflict: SchedulingConflict = {
            id: createUUID(uuid()),
            type: conflictType,
            severity: breakTime < 0 ? 'critical' : 'medium',
            description: `Instructor ${instructorId} has ${breakTime < 0 ? 'overlapping sessions' : 'insufficient break time'}`,
            affectedSessions: [current.id, next.id],
            affectedResources: [],
            suggestedResolutions: await this.generateConflictResolutions(
              conflictType,
              [current, next],
              []
            ),
            detectedAt: new Date(),
          };
          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  private async detectCapacityConflicts(
    sessions: TrainingSession[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    for (const session of sessions) {
      // Check if enrolled count exceeds max participants
      if (session.enrolledCount > session.maxParticipants) {
        const conflict: SchedulingConflict = {
          id: createUUID(uuid()),
          type: ConflictType.ROOM_CAPACITY_EXCEEDED,
          severity: 'high',
          description: `Session ${session.title} has ${session.enrolledCount} enrolled but capacity is ${session.maxParticipants}`,
          affectedSessions: [session.id],
          affectedResources: session.resourceAllocations.map(
            (r) => r.resourceId
          ),
          suggestedResolutions: await this.generateConflictResolutions(
            ConflictType.ROOM_CAPACITY_EXCEEDED,
            [session],
            session.resourceAllocations.map((r) => r.resourceId)
          ),
          detectedAt: new Date(),
        };
        conflicts.push(conflict);
      }

      // Check resource capacity constraints
      for (const allocation of session.resourceAllocations) {
        const resource = await this.getResource(allocation.resourceId);
        if (
          resource &&
          resource.capacity &&
          session.maxParticipants > resource.capacity
        ) {
          const conflict: SchedulingConflict = {
            id: createUUID(uuid()),
            type: ConflictType.ROOM_CAPACITY_EXCEEDED,
            severity: 'critical',
            description: `Session requires capacity of ${session.maxParticipants} but resource ${resource.name} only has ${resource.capacity}`,
            affectedSessions: [session.id],
            affectedResources: [resource.id],
            suggestedResolutions: await this.generateConflictResolutions(
              ConflictType.ROOM_CAPACITY_EXCEEDED,
              [session],
              [resource.id]
            ),
            detectedAt: new Date(),
          };
          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  private async detectTimeOverlapConflicts(
    sessions: TrainingSession[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Sort sessions by start time
    const sortedSessions = sessions.sort(
      (a, b) => a.startDateTime.getTime() - b.startDateTime.getTime()
    );

    for (let i = 0; i < sortedSessions.length - 1; i++) {
      const current = sortedSessions[i];

      for (let j = i + 1; j < sortedSessions.length; j++) {
        const other = sortedSessions[j];

        // Check if sessions overlap and share resources or instructor
        const hasTimeOverlap =
          isBefore(current.endDateTime, other.startDateTime) === false;

        if (hasTimeOverlap) {
          const hasSharedResources = this.hasSharedResources(current, other);
          const hasSameInstructor =
            current.instructorId === other.instructorId && current.instructorId;

          if (hasSharedResources || hasSameInstructor) {
            const conflict: SchedulingConflict = {
              id: createUUID(uuid()),
              type: ConflictType.TIME_OVERLAP,
              severity: 'high',
              description: `Sessions ${current.title} and ${other.title} have overlapping times and shared resources`,
              affectedSessions: [current.id, other.id],
              affectedResources: this.getSharedResourceIds(current, other),
              suggestedResolutions: await this.generateConflictResolutions(
                ConflictType.TIME_OVERLAP,
                [current, other],
                this.getSharedResourceIds(current, other)
              ),
              detectedAt: new Date(),
            };
            conflicts.push(conflict);
          }
        }
      }
    }

    return conflicts;
  }

  private async detectMaintenanceConflicts(
    sessions: TrainingSession[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    for (const session of sessions) {
      for (const allocation of session.resourceAllocations) {
        const resource = await this.getResource(allocation.resourceId);
        if (!resource) continue;

        // Check if session overlaps with maintenance windows
        for (const maintenance of resource.maintenanceSchedule) {
          const sessionStart = session.startDateTime;
          const sessionEnd = session.endDateTime;
          const maintenanceStart = maintenance.startDate;
          const maintenanceEnd = maintenance.endDate;

          const hasOverlap =
            isBefore(sessionStart, maintenanceEnd) &&
            isAfter(sessionEnd, maintenanceStart);

          if (hasOverlap) {
            const conflict: SchedulingConflict = {
              id: createUUID(uuid()),
              type: ConflictType.MAINTENANCE_CONFLICT,
              severity: maintenance.type === 'emergency' ? 'critical' : 'high',
              description: `Session ${session.title} conflicts with ${maintenance.type} maintenance of ${resource.name}`,
              affectedSessions: [session.id],
              affectedResources: [resource.id],
              suggestedResolutions: await this.generateConflictResolutions(
                ConflictType.MAINTENANCE_CONFLICT,
                [session],
                [resource.id]
              ),
              detectedAt: new Date(),
            };
            conflicts.push(conflict);
          }
        }
      }
    }

    return conflicts;
  }

  // ============================================================================
  // CONFLICT RESOLUTION
  // ============================================================================

  private async rescheduleConflictingSessions(
    conflict: SchedulingConflict,
    resolution: ConflictResolution
  ): Promise<boolean> {
    const affectedSessions = await Promise.all(
      conflict.affectedSessions.map((id) => this.getSession(id))
    );

    const validSessions = affectedSessions.filter(
      (s) => s !== null
    ) as TrainingSession[];

    for (const session of validSessions) {
      // Find alternative time slots
      const alternatives = await this.findAlternativeSlots(session.id, []);

      if (alternatives.length > 0) {
        const bestAlternative = alternatives[0];

        // Update session schedule
        session.startDateTime = bestAlternative.startDateTime;
        session.endDateTime = bestAlternative.endDateTime;
        session.resourceAllocations = bestAlternative.resources;

        await this.updateSession(session);

        // Notify stakeholders
        this.emit('sessionRescheduled', {
          sessionId: session.id,
          oldStartTime: session.startDateTime,
          newStartTime: bestAlternative.startDateTime,
          reason: 'Conflict resolution',
        });
      }
    }

    // Mark conflict as resolved
    conflict.resolvedAt = new Date();
    this.conflicts.set(conflict.id, conflict);

    return true;
  }

  private async reallocateResources(
    conflict: SchedulingConflict,
    resolution: ConflictResolution
  ): Promise<boolean> {
    const affectedSessions = await Promise.all(
      conflict.affectedSessions.map((id) => this.getSession(id))
    );

    const validSessions = affectedSessions.filter(
      (s) => s !== null
    ) as TrainingSession[];

    for (const session of validSessions) {
      // Find alternative resources for each conflicting resource
      for (const allocation of session.resourceAllocations) {
        if (conflict.affectedResources.includes(allocation.resourceId)) {
          const alternatives = await this.findAlternativeResources(
            allocation,
            session.startDateTime,
            session.endDateTime
          );

          if (alternatives.length > 0) {
            const bestAlternative = alternatives[0];
            allocation.resourceId = bestAlternative.id;
            await this.updateSession(session);
          }
        }
      }
    }

    conflict.resolvedAt = new Date();
    this.conflicts.set(conflict.id, conflict);

    return true;
  }

  private async changeInstructor(
    conflict: SchedulingConflict,
    resolution: ConflictResolution
  ): Promise<boolean> {
    const affectedSessions = await Promise.all(
      conflict.affectedSessions.map((id) => this.getSession(id))
    );

    const validSessions = affectedSessions.filter(
      (s) => s !== null
    ) as TrainingSession[];

    // Usually reassign the lower priority session
    const sessionToReassign = validSessions.reduce((lowest, current) => {
      // Implement priority logic here
      return current; // Simplified for now
    });

    // Find alternative instructor
    const alternatives = await this.findAlternativeInstructors(
      sessionToReassign,
      sessionToReassign.startDateTime,
      sessionToReassign.endDateTime
    );

    if (alternatives.length > 0) {
      sessionToReassign.instructorId = alternatives[0].id;
      await this.updateSession(sessionToReassign);

      this.emit('instructorReassigned', {
        sessionId: sessionToReassign.id,
        newInstructorId: alternatives[0].id,
        reason: 'Conflict resolution',
      });
    }

    conflict.resolvedAt = new Date();
    this.conflicts.set(conflict.id, conflict);

    return true;
  }

  private async splitSession(
    conflict: SchedulingConflict,
    resolution: ConflictResolution
  ): Promise<boolean> {
    // Implementation for splitting a session into multiple smaller sessions
    // This is more complex and would require business logic decisions

    conflict.resolvedAt = new Date();
    this.conflicts.set(conflict.id, conflict);

    return true;
  }

  private async cancelConflictingSessions(
    conflict: SchedulingConflict,
    resolution: ConflictResolution
  ): Promise<boolean> {
    const affectedSessions = await Promise.all(
      conflict.affectedSessions.map((id) => this.getSession(id))
    );

    const validSessions = affectedSessions.filter(
      (s) => s !== null
    ) as TrainingSession[];

    // Usually cancel the lower priority or newer session
    const sessionToCancel = validSessions.reduce((lowest, current) => {
      // Implement priority logic here
      return current; // Simplified for now
    });

    sessionToCancel.status = TrainingStatus.CANCELLED;
    await this.updateSession(sessionToCancel);

    this.emit('sessionCancelled', {
      sessionId: sessionToCancel.id,
      reason: 'Conflict resolution',
    });

    conflict.resolvedAt = new Date();
    this.conflicts.set(conflict.id, conflict);

    return true;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async validateSchedulingRequest(
    request: SchedulingRequest
  ): Promise<void> {
    if (!request.sessionId) {
      throw new SchedulingError('Session ID is required', 'INVALID_REQUEST');
    }

    if (
      !request.preferredStartTimes ||
      request.preferredStartTimes.length === 0
    ) {
      throw new SchedulingError(
        'At least one preferred start time is required',
        'INVALID_REQUEST'
      );
    }

    // Validate that preferred times are in the future
    const now = new Date();
    const futureStartTimes = request.preferredStartTimes.filter((time) =>
      isAfter(time, now)
    );

    if (futureStartTimes.length === 0) {
      throw new SchedulingError(
        'All preferred start times are in the past',
        'INVALID_REQUEST'
      );
    }
  }

  private async getSession(sessionId: UUID): Promise<TrainingSession | null> {
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    // Try to load from database if available
    if (this.databaseService) {
      const session = await this.databaseService.getSession(sessionId);
      if (session) {
        this.sessions.set(sessionId, session);
        return session;
      }
    }

    return null;
  }

  private async getResource(resourceId: UUID): Promise<Resource | null> {
    if (this.resources.has(resourceId)) {
      return this.resources.get(resourceId)!;
    }

    if (this.databaseService) {
      const resource = await this.databaseService.getResource(resourceId);
      if (resource) {
        this.resources.set(resourceId, resource);
        return resource;
      }
    }

    return null;
  }

  private async getInstructor(instructorId: UUID): Promise<Instructor | null> {
    if (this.instructors.has(instructorId)) {
      return this.instructors.get(instructorId)!;
    }

    if (this.databaseService) {
      const instructor = await this.databaseService.getInstructor(instructorId);
      if (instructor) {
        this.instructors.set(instructorId, instructor);
        return instructor;
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

  private async allocateResources(
    session: TrainingSession,
    allocations: ResourceAllocation[]
  ): Promise<void> {
    for (const allocation of allocations) {
      this.resourceAllocations.set(allocation.id, allocation);
    }

    session.resourceAllocations = allocations;
    await this.updateSession(session);
  }

  private async updateSessionSchedule(
    session: TrainingSession,
    result: OptimizationResult
  ): Promise<void> {
    if (result.scheduledDateTime) {
      session.startDateTime = result.scheduledDateTime;
      // Calculate end time based on original duration
      const originalDuration = differenceInMinutes(
        session.endDateTime,
        session.startDateTime
      );
      session.endDateTime = new Date(
        result.scheduledDateTime.getTime() + originalDuration * 60000
      );
    }

    if (result.assignedInstructorId) {
      session.instructorId = result.assignedInstructorId;
    }

    session.status = TrainingStatus.SCHEDULED;
    await this.updateSession(session);
  }

  private createOptimizationRequest(
    session: TrainingSession
  ): SchedulingRequest {
    return {
      id: createUUID(uuid()),
      sessionId: session.id,
      preferredStartTimes: [session.startDateTime],
      requiredResources: session.resourceAllocations.map((allocation) => ({
        resourceType: ResourceType.ROOM, // Would be determined from resource
        capacity: session.maxParticipants,
        preferred: true,
      })),
      instructorPreferences: session.instructorId
        ? [
            {
              instructorId: session.instructorId,
            },
          ]
        : [],
      constraints: [],
      priority: 'normal',
      flexibility: {
        timeFlexibilityMinutes: 60,
        dateFlexibilityDays: 7,
        resourceSubstitutionAllowed: true,
        instructorSubstitutionAllowed: false,
        splitSessionAllowed: false,
        virtualAlternativeAcceptable: session.type === 'online',
      },
      requestedBy: session.createdBy,
      requestedAt: new Date(),
    };
  }

  private groupSessionsByPriority(
    sessions: TrainingSession[]
  ): TrainingSession[][] {
    // Group sessions by some priority logic (status, deadlines, etc.)
    const priorityGroups: TrainingSession[][] = [[], [], []]; // high, medium, low

    for (const session of sessions) {
      if (session.status === TrainingStatus.CONFIRMED) {
        priorityGroups[0].push(session); // high priority
      } else if (session.status === TrainingStatus.SCHEDULED) {
        priorityGroups[1].push(session); // medium priority
      } else {
        priorityGroups[2].push(session); // low priority
      }
    }

    return priorityGroups.filter((group) => group.length > 0);
  }

  private async performGlobalOptimization(
    results: OptimizationResult[],
    resources: Resource[]
  ): Promise<void> {
    // Implement global optimization logic
    // This could involve machine learning algorithms to optimize across all sessions
  }

  private extractTimeWindowFromConstraints(
    constraints: SchedulingConstraint[]
  ): { start: Date; end: Date } {
    const now = new Date();
    let start = startOfDay(now);
    let end = addDays(endOfDay(now), 30); // Default 30-day window

    for (const constraint of constraints) {
      if (constraint.type === 'time_window') {
        start = constraint.value.start || start;
        end = constraint.value.end || end;
      }
    }

    return { start, end };
  }

  private generateTimeSlots(
    start: Date,
    end: Date,
    durationMinutes: number
  ): { start: Date; end: Date }[] {
    const slots: { start: Date; end: Date }[] = [];
    const slotDuration = durationMinutes * 60000; // Convert to milliseconds
    const increment = 30 * 60000; // 30-minute increments

    for (
      let time = start.getTime();
      time + slotDuration <= end.getTime();
      time += increment
    ) {
      slots.push({
        start: new Date(time),
        end: new Date(time + slotDuration),
      });
    }

    return slots;
  }

  private async evaluateAlternativeSlot(
    session: TrainingSession,
    slot: { start: Date; end: Date },
    constraints: SchedulingConstraint[]
  ): Promise<AlternativeSchedule | null> {
    // Create a temporary session with the new time slot
    const tempSession = {
      ...session,
      startDateTime: slot.start,
      endDateTime: slot.end,
    };

    // Check for conflicts
    const conflicts = await this.detectConflicts([tempSession]);

    // Calculate score based on constraints and conflicts
    let score = 100;
    score -= conflicts.length * 20;

    // Apply constraint scoring
    for (const constraint of constraints) {
      if (!this.evaluateConstraint(constraint, tempSession)) {
        score -= constraint.isHard ? 50 : 10;
      }
    }

    if (score < 20) {
      return null;
    }

    return {
      rank: 0,
      startDateTime: slot.start,
      endDateTime: slot.end,
      resources: session.resourceAllocations,
      instructorId: session.instructorId,
      score,
      tradeoffs: this.generateTradeoffExplanations(score, conflicts),
      conflicts,
    };
  }

  private async generateIntelligentTimeSlots(
    session: TrainingSession,
    request: SchedulingRequest
  ): Promise<{ start: Date; end: Date }[]> {
    const slots: { start: Date; end: Date }[] = [];
    const sessionDuration = differenceInMinutes(
      session.endDateTime,
      session.startDateTime
    );

    // Generate slots based on resource availability patterns
    // This is a simplified version - in reality, you'd use ML/AI here

    const now = new Date();
    for (let days = 1; days <= 14; days++) {
      const baseDate = addDays(now, days);

      // Try common business hours
      const commonStartTimes = [9, 10, 11, 13, 14, 15, 16];

      for (const hour of commonStartTimes) {
        const start = new Date(baseDate);
        start.setHours(hour, 0, 0, 0);

        const end = new Date(start.getTime() + sessionDuration * 60000);

        slots.push({ start, end });
      }
    }

    return slots;
  }

  private checkTimeConstraints(
    startTime: Date,
    endTime: Date,
    constraints: SchedulingConstraint[]
  ): SchedulingConstraint[] {
    const violations: SchedulingConstraint[] = [];

    for (const constraint of constraints) {
      if (constraint.type === 'time_window') {
        const windowStart = constraint.value.start;
        const windowEnd = constraint.value.end;

        if (isBefore(startTime, windowStart) || isAfter(endTime, windowEnd)) {
          violations.push(constraint);
        }
      }
    }

    return violations;
  }

  private async findBestResourceAllocation(
    requirements: ResourceRequirement[],
    startTime: Date,
    endTime: Date
  ): Promise<{
    success: boolean;
    allocations: ResourceAllocation[];
    conflicts: SchedulingConflict[];
    qualityScore: number;
  }> {
    const allocations: ResourceAllocation[] = [];
    const conflicts: SchedulingConflict[] = [];
    let qualityScore = 0;

    for (const requirement of requirements) {
      const availableResources = await this.findAvailableResources(
        requirement,
        startTime,
        endTime
      );

      if (availableResources.length === 0) {
        const conflict: SchedulingConflict = {
          id: createUUID(uuid()),
          type: ConflictType.RESOURCE_DOUBLE_BOOKING,
          severity: 'high',
          description: `No available resources for requirement: ${requirement.resourceType}`,
          affectedSessions: [],
          affectedResources: [],
          suggestedResolutions: [],
          detectedAt: new Date(),
        };
        conflicts.push(conflict);
        continue;
      }

      // Choose the best resource (highest quality score)
      const bestResource = availableResources[0]; // Assuming sorted by quality

      const allocation: ResourceAllocation = {
        id: createUUID(uuid()),
        sessionId: createUUID(''), // Will be set by caller
        resourceId: bestResource.id,
        allocatedFrom: startTime,
        allocatedTo: endTime,
        status: 'pending',
      };

      allocations.push(allocation);
      qualityScore += this.calculateResourceQualityScore(
        bestResource,
        requirement
      );
    }

    return {
      success:
        conflicts.length === 0 && allocations.length === requirements.length,
      allocations,
      conflicts,
      qualityScore: qualityScore / requirements.length,
    };
  }

  private async findBestInstructor(
    preferences: InstructorPreference[],
    startTime: Date,
    endTime: Date,
    sessionType: any
  ): Promise<{
    success: boolean;
    instructorId?: UUID;
    conflicts?: SchedulingConflict[];
    qualityScore: number;
  }> {
    // If specific instructor is preferred
    if (preferences.length > 0 && preferences[0].instructorId) {
      const instructor = await this.getInstructor(preferences[0].instructorId);
      if (instructor) {
        const isAvailable = await this.checkInstructorAvailability(
          instructor,
          startTime,
          endTime
        );
        if (isAvailable) {
          return {
            success: true,
            instructorId: instructor.id,
            qualityScore: 20, // Perfect match
          };
        }
      }
    }

    // Find available instructors matching preferences
    const availableInstructors = await this.findAvailableInstructors(
      preferences,
      startTime,
      endTime
    );

    if (availableInstructors.length === 0) {
      return {
        success: false,
        qualityScore: 0,
      };
    }

    // Choose the best instructor
    const bestInstructor = availableInstructors[0]; // Assuming sorted by quality

    return {
      success: true,
      instructorId: bestInstructor.id,
      qualityScore: this.calculateInstructorQualityScore(
        bestInstructor,
        preferences
      ),
    };
  }

  private checkConstraintViolation(
    constraint: SchedulingConstraint,
    context: {
      startTime: Date;
      endTime: Date;
      resources: ResourceAllocation[];
      instructorId?: UUID;
    }
  ): SchedulingConflict | null {
    // Implement constraint checking logic
    // Return null if no violation, otherwise return a conflict
    return null;
  }

  private generateTradeoffExplanations(
    score: number,
    conflicts: SchedulingConflict[]
  ): string[] {
    const explanations: string[] = [];

    if (score < 80) {
      explanations.push(
        'Suboptimal scheduling due to limited resource availability'
      );
    }

    if (conflicts.length > 0) {
      explanations.push(`${conflicts.length} scheduling conflicts detected`);
    }

    return explanations;
  }

  private async generateConflictResolutions(
    conflictType: ConflictType,
    sessions: TrainingSession[],
    resources: UUID[]
  ): Promise<ConflictResolution[]> {
    const resolutions: ConflictResolution[] = [];

    switch (conflictType) {
      case ConflictType.RESOURCE_DOUBLE_BOOKING:
        resolutions.push({
          id: createUUID(uuid()),
          type: 'reschedule',
          description: 'Reschedule one of the conflicting sessions',
          impact: 'moderate',
          estimatedEffort: 30,
          requiredApprovals: ['instructor', 'participants'],
          alternativeOptions: [],
        });

        resolutions.push({
          id: createUUID(uuid()),
          type: 'reallocate_resource',
          description: 'Find alternative resource for one session',
          impact: 'minimal',
          estimatedEffort: 15,
          requiredApprovals: [],
          alternativeOptions: [],
        });
        break;

      case ConflictType.INSTRUCTOR_CONFLICT:
        resolutions.push({
          id: createUUID(uuid()),
          type: 'change_instructor',
          description: 'Assign different instructor to one session',
          impact: 'moderate',
          estimatedEffort: 20,
          requiredApprovals: ['participants'],
          alternativeOptions: [],
        });
        break;

      // Add more resolution patterns for other conflict types
    }

    return resolutions;
  }

  private hasSharedResources(
    session1: TrainingSession,
    session2: TrainingSession
  ): boolean {
    const resources1 = new Set(
      session1.resourceAllocations.map((r) => r.resourceId)
    );
    const resources2 = new Set(
      session2.resourceAllocations.map((r) => r.resourceId)
    );

    for (const resource of resources1) {
      if (resources2.has(resource)) {
        return true;
      }
    }

    return false;
  }

  private getSharedResourceIds(
    session1: TrainingSession,
    session2: TrainingSession
  ): UUID[] {
    const resources1 = new Set(
      session1.resourceAllocations.map((r) => r.resourceId)
    );
    const resources2 = session2.resourceAllocations.map((r) => r.resourceId);

    return resources2.filter((resourceId) => resources1.has(resourceId));
  }

  private async findAlternativeResources(
    allocation: ResourceAllocation,
    startTime: Date,
    endTime: Date
  ): Promise<Resource[]> {
    // Implementation would search for alternative resources
    // with similar capabilities and availability
    return [];
  }

  private async findAlternativeInstructors(
    session: TrainingSession,
    startTime: Date,
    endTime: Date
  ): Promise<Instructor[]> {
    // Implementation would search for qualified instructors
    // available during the time slot
    return [];
  }

  private async findAvailableResources(
    requirement: ResourceRequirement,
    startTime: Date,
    endTime: Date
  ): Promise<Resource[]> {
    // Implementation would query available resources matching requirements
    return [];
  }

  private async findAvailableInstructors(
    preferences: InstructorPreference[],
    startTime: Date,
    endTime: Date
  ): Promise<Instructor[]> {
    // Implementation would query available instructors matching preferences
    return [];
  }

  private async checkInstructorAvailability(
    instructor: Instructor,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    // Check instructor's availability rules and existing bookings
    return true; // Simplified implementation
  }

  private calculateResourceQualityScore(
    resource: Resource,
    requirement: ResourceRequirement
  ): number {
    let score = 10; // Base score

    // Add points for exact matches
    if (
      requirement.capacity &&
      resource.capacity &&
      resource.capacity >= requirement.capacity
    ) {
      score += 5;
    }

    if (requirement.features) {
      const matchingFeatures = requirement.features.filter((feature) =>
        resource.features.includes(feature)
      );
      score += matchingFeatures.length * 2;
    }

    return score;
  }

  private calculateInstructorQualityScore(
    instructor: Instructor,
    preferences: InstructorPreference[]
  ): number {
    let score = 10; // Base score

    for (const preference of preferences) {
      if (
        preference.minimumRating &&
        instructor.rating >= preference.minimumRating
      ) {
        score += 5;
      }

      if (preference.preferredSpecializations) {
        const matchingSpecs = preference.preferredSpecializations.filter(
          (spec) => instructor.specializations.includes(spec)
        );
        score += matchingSpecs.length * 3;
      }
    }

    return score;
  }

  private evaluateConstraint(
    constraint: SchedulingConstraint,
    session: TrainingSession
  ): boolean {
    // Implement constraint evaluation logic
    return true; // Simplified implementation
  }
}
