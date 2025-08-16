import { z } from 'zod';

// ============================================================================
// CORE TYPES & INTERFACES
// ============================================================================

export interface UUID extends String {
  readonly brand: unique symbol;
}

export const createUUID = (id: string): UUID => id as unknown as UUID;

// ============================================================================
// BASIC UTILITY TYPES
// ============================================================================

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// ============================================================================
// RESOURCE TYPES
// ============================================================================

export enum ResourceType {
  ROOM = 'room',
  EQUIPMENT = 'equipment',
  INSTRUCTOR = 'instructor',
  VEHICLE = 'vehicle',
  VENUE = 'venue',
  VIRTUAL_ROOM = 'virtual_room',
}

export enum ResourceStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  BLOCKED = 'blocked',
  RESERVED = 'reserved',
}

export interface Resource {
  id: UUID;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  capacity?: number;
  location?: string;
  description?: string;
  features: string[];
  metadata: Record<string, any>;
  availabilityRules: AvailabilityRule[];
  maintenanceSchedule: MaintenanceWindow[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityRule {
  id: UUID;
  resourceId: UUID;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive: boolean;
  exceptions: DateException[];
}

export interface DateException {
  date: string; // YYYY-MM-DD format
  type: 'unavailable' | 'extended' | 'modified';
  reason?: string;
  modifiedStartTime?: string;
  modifiedEndTime?: string;
}

export interface MaintenanceWindow {
  id: UUID;
  resourceId: UUID;
  startDate: Date;
  endDate: Date;
  description: string;
  type: 'scheduled' | 'emergency' | 'preventive';
  recurrenceRule?: string; // RRULE format
}

// ============================================================================
// TRAINING SESSION TYPES
// ============================================================================

export enum TrainingStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
}

export enum SessionType {
  CLASSROOM = 'classroom',
  ONLINE = 'online',
  HYBRID = 'hybrid',
  SELF_PACED = 'self_paced',
  WORKSHOP = 'workshop',
  PRACTICAL = 'practical',
}

export interface TrainingSession {
  id: UUID;
  title: string;
  description?: string;
  courseId?: UUID;
  programId?: UUID;
  type: SessionType;
  status: TrainingStatus;

  // Scheduling details
  startDateTime: Date;
  endDateTime: Date;
  timezone: string;
  location?: string;

  // Capacity and enrollment
  maxParticipants: number;
  minParticipants: number;
  enrolledCount: number;
  waitlistCount: number;

  // Resources
  instructorId?: UUID;
  resourceAllocations: ResourceAllocation[];

  // Recurrence
  isRecurring: boolean;
  recurrenceRule?: string; // RRULE format
  recurrenceEndDate?: Date;
  parentSessionId?: UUID; // For recurring session instances

  // Waitlist and enrollment
  waitlistEnabled: boolean;
  autoEnrollFromWaitlist: boolean;
  enrollmentDeadline?: Date;
  cancellationDeadline?: Date;

  // Metadata
  tags: string[];
  requirements: string[];
  materials: TrainingMaterial[];
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
}

export interface ResourceAllocation {
  id: UUID;
  sessionId: UUID;
  resourceId: UUID;
  allocatedFrom: Date;
  allocatedTo: Date;
  quantity?: number; // For equipment that can be allocated in quantities
  status: 'pending' | 'confirmed' | 'released';
  notes?: string;
}

export interface TrainingMaterial {
  id: UUID;
  name: string;
  type: 'document' | 'video' | 'link' | 'equipment' | 'software';
  url?: string;
  required: boolean;
  description?: string;
}

// ============================================================================
// ENROLLMENT & WAITLIST TYPES
// ============================================================================

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  WAITLISTED = 'waitlisted',
  CONFIRMED = 'confirmed',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled',
  TRANSFERRED = 'transferred',
}

export interface Enrollment {
  id: UUID;
  sessionId: UUID;
  userId: UUID;
  status: EnrollmentStatus;
  enrolledAt: Date;
  confirmedAt?: Date;
  waitlistPosition?: number;
  transferredFromSessionId?: UUID;
  transferredToSessionId?: UUID;
  cancellationReason?: string;
  notes?: string;
  metadata: Record<string, any>;
}

export interface WaitlistEntry {
  id: UUID;
  sessionId: UUID;
  userId: UUID;
  position: number;
  addedAt: Date;
  notificationsSent: number;
  lastNotificationAt?: Date;
  autoEnrollEnabled: boolean;
  priority: 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  metadata: Record<string, any>;
}

// ============================================================================
// INSTRUCTOR TYPES
// ============================================================================

export interface Instructor {
  id: UUID;
  userId: UUID;
  specializations: string[];
  certifications: Certification[];
  availability: InstructorAvailability;
  maxSessionsPerDay: number;
  maxSessionsPerWeek: number;
  preferredSessionTypes: SessionType[];
  travelWillingness: TravelPreference;
  qualifications: string[];
  rating: number;
  bio?: string;
  metadata: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: UUID;
  name: string;
  issuingOrganization: string;
  issuedDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
  isValid: boolean;
}

export interface InstructorAvailability {
  id: UUID;
  instructorId: UUID;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
  isActive: boolean;
  exceptions: AvailabilityException[];
}

export interface AvailabilityException {
  date: string; // YYYY-MM-DD format
  type: 'unavailable' | 'limited' | 'extended';
  reason?: string;
  startTime?: string;
  endTime?: string;
}

export interface TravelPreference {
  maxTravelDistance: number; // in kilometers
  preferredLocations: string[];
  blackoutDates: string[]; // YYYY-MM-DD format
  travelCompensationRequired: boolean;
}

// ============================================================================
// SCHEDULING TYPES
// ============================================================================

export enum ConflictType {
  RESOURCE_DOUBLE_BOOKING = 'resource_double_booking',
  INSTRUCTOR_CONFLICT = 'instructor_conflict',
  ROOM_CAPACITY_EXCEEDED = 'room_capacity_exceeded',
  TIME_OVERLAP = 'time_overlap',
  MAINTENANCE_CONFLICT = 'maintenance_conflict',
  AVAILABILITY_CONFLICT = 'availability_conflict',
  MINIMUM_BREAK_VIOLATED = 'minimum_break_violated',
}

export interface SchedulingConflict {
  id: UUID;
  type: ConflictType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSessions: UUID[];
  affectedResources: UUID[];
  suggestedResolutions: ConflictResolution[];
  detectedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: UUID;
}

export interface ConflictResolution {
  id: UUID;
  type:
    | 'reschedule'
    | 'reallocate_resource'
    | 'change_instructor'
    | 'split_session'
    | 'cancel';
  description: string;
  impact: 'minimal' | 'moderate' | 'significant';
  estimatedEffort: number; // in minutes
  requiredApprovals: string[];
  alternativeOptions: AlternativeOption[];
}

export interface AlternativeOption {
  id: UUID;
  description: string;
  newStartTime?: Date;
  newEndTime?: Date;
  alternativeResourceId?: UUID;
  alternativeInstructorId?: UUID;
  impactAssessment: ImpactAssessment;
}

export interface ImpactAssessment {
  affectedParticipants: number;
  notificationRequired: boolean;
  costImplication: number;
  qualityImpact: 'none' | 'minor' | 'moderate' | 'significant';
  reschedulingComplexity: 'simple' | 'moderate' | 'complex';
}

// ============================================================================
// CALENDAR INTEGRATION TYPES
// ============================================================================

export enum CalendarProvider {
  GOOGLE = 'google',
  OUTLOOK = 'outlook',
  APPLE = 'apple',
  EXCHANGE = 'exchange',
  ICAL = 'ical',
}

export interface CalendarIntegration {
  id: UUID;
  userId?: UUID;
  resourceId?: UUID;
  provider: CalendarProvider;
  accountId: string;
  calendarId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  syncEnabled: boolean;
  bidirectionalSync: boolean;
  lastSyncAt?: Date;
  syncErrors: CalendarSyncError[];
  settings: CalendarSyncSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarSyncError {
  id: UUID;
  errorType: 'authentication' | 'network' | 'format' | 'conflict' | 'quota';
  message: string;
  details?: Record<string, any>;
  occurredAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface CalendarSyncSettings {
  syncDirection: 'import' | 'export' | 'bidirectional';
  syncFrequency: number; // in minutes
  conflictResolution: 'tmslms_priority' | 'external_priority' | 'manual';
  includePrivateEvents: boolean;
  eventPrefix?: string;
  categoryMapping: Record<string, string>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  location?: string;
  attendees?: string[];
  isAllDay: boolean;
  recurrenceRule?: string;
  calendarId: string;
  externalId?: string;
  source: 'tmslms' | 'external';
  lastSyncAt?: Date;
}

// ============================================================================
// OPTIMIZATION TYPES
// ============================================================================

export interface SchedulingRequest {
  id: UUID;
  sessionId: UUID;
  preferredStartTimes: Date[];
  requiredResources: ResourceRequirement[];
  instructorPreferences: InstructorPreference[];
  constraints: SchedulingConstraint[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  deadlineDate?: Date;
  flexibility: FlexibilityOptions;
  requestedBy: UUID;
  requestedAt: Date;
}

export interface ResourceRequirement {
  resourceType: ResourceType;
  features?: string[];
  capacity?: number;
  location?: string;
  preferred?: boolean;
  alternatives?: UUID[];
}

export interface InstructorPreference {
  instructorId?: UUID;
  requiredCertifications?: string[];
  preferredSpecializations?: string[];
  minimumRating?: number;
  excludeInstructors?: UUID[];
}

export interface SchedulingConstraint {
  type:
    | 'time_window'
    | 'resource_availability'
    | 'instructor_availability'
    | 'break_duration'
    | 'travel_time';
  value: any;
  description: string;
  isHard: boolean; // true for must-have, false for nice-to-have
}

export interface FlexibilityOptions {
  timeFlexibilityMinutes: number;
  dateFlexibilityDays: number;
  resourceSubstitutionAllowed: boolean;
  instructorSubstitutionAllowed: boolean;
  splitSessionAllowed: boolean;
  virtualAlternativeAcceptable: boolean;
}

export interface OptimizationResult {
  id: UUID;
  requestId: UUID;
  success: boolean;
  scheduledDateTime?: Date;
  allocatedResources: ResourceAllocation[];
  assignedInstructorId?: UUID;
  alternativeOptions: AlternativeSchedule[];
  conflicts: SchedulingConflict[];
  optimizationScore: number;
  processingTimeMs: number;
  generatedAt: Date;
}

export interface AlternativeSchedule {
  rank: number;
  startDateTime: Date;
  endDateTime: Date;
  resources: ResourceAllocation[];
  instructorId?: UUID;
  score: number;
  tradeoffs: string[];
  conflicts: SchedulingConflict[];
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export enum NotificationType {
  SESSION_SCHEDULED = 'session_scheduled',
  SESSION_CANCELLED = 'session_cancelled',
  SESSION_RESCHEDULED = 'session_rescheduled',
  ENROLLMENT_CONFIRMED = 'enrollment_confirmed',
  WAITLIST_POSITION_AVAILABLE = 'waitlist_position_available',
  INSTRUCTOR_ASSIGNED = 'instructor_assigned',
  RESOURCE_CONFLICT = 'resource_conflict',
  CAPACITY_WARNING = 'capacity_warning',
  MAINTENANCE_REMINDER = 'maintenance_reminder',
}

export interface NotificationTemplate {
  id: UUID;
  type: NotificationType;
  name: string;
  subject: string;
  bodyTemplate: string;
  channels: NotificationChannel[];
  variables: NotificationVariable[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'in_app' | 'webhook';
  isDefault: boolean;
  config: Record<string, any>;
}

export interface NotificationVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue?: any;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface SchedulingMetrics {
  id: UUID;
  periodStart: Date;
  periodEnd: Date;
  totalSessions: number;
  successfulSchedules: number;
  failedSchedules: number;
  conflicts: number;
  conflictsResolved: number;
  averageSchedulingTime: number; // in minutes
  resourceUtilization: ResourceUtilizationMetric[];
  instructorUtilization: InstructorUtilizationMetric[];
  capacityMetrics: CapacityMetrics;
  waitlistMetrics: WaitlistMetrics;
  generatedAt: Date;
}

export interface ResourceUtilizationMetric {
  resourceId: UUID;
  resourceType: ResourceType;
  totalAvailableHours: number;
  totalBookedHours: number;
  utilizationPercentage: number;
  peakUsageTimes: PeakUsageTime[];
}

export interface InstructorUtilizationMetric {
  instructorId: UUID;
  totalAvailableHours: number;
  totalAssignedHours: number;
  utilizationPercentage: number;
  sessionCount: number;
  averageRating: number;
}

export interface CapacityMetrics {
  averageSessionCapacity: number;
  averageEnrollment: number;
  averageWaitlistSize: number;
  capacityUtilizationPercentage: number;
  oversoldSessions: number;
}

export interface WaitlistMetrics {
  totalWaitlistEntries: number;
  averageWaitTime: number; // in hours
  conversionRate: number; // percentage of waitlisted users who eventually enrolled
  abandamentRate: number; // percentage who left waitlist without enrolling
}

export interface PeakUsageTime {
  dayOfWeek: number;
  hour: number;
  utilizationPercentage: number;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const ResourceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.nativeEnum(ResourceType),
  status: z.nativeEnum(ResourceStatus),
  capacity: z.number().positive().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()),
  metadata: z.record(z.any()),
  availabilityRules: z.array(z.any()),
  maintenanceSchedule: z.array(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TrainingSessionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  courseId: z.string().optional(),
  programId: z.string().optional(),
  type: z.nativeEnum(SessionType),
  status: z.nativeEnum(TrainingStatus),
  startDateTime: z.date(),
  endDateTime: z.date(),
  timezone: z.string(),
  location: z.string().optional(),
  maxParticipants: z.number().positive(),
  minParticipants: z.number().nonnegative(),
  enrolledCount: z.number().nonnegative(),
  waitlistCount: z.number().nonnegative(),
  instructorId: z.string().optional(),
  resourceAllocations: z.array(z.any()),
  isRecurring: z.boolean(),
  recurrenceRule: z.string().optional(),
  recurrenceEndDate: z.date().optional(),
  parentSessionId: z.string().optional(),
  waitlistEnabled: z.boolean(),
  autoEnrollFromWaitlist: z.boolean(),
  enrollmentDeadline: z.date().optional(),
  cancellationDeadline: z.date().optional(),
  tags: z.array(z.string()),
  requirements: z.array(z.string()),
  materials: z.array(z.any()),
  metadata: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

export const EnrollmentSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  status: z.nativeEnum(EnrollmentStatus),
  enrolledAt: z.date(),
  confirmedAt: z.date().optional(),
  waitlistPosition: z.number().optional(),
  transferredFromSessionId: z.string().optional(),
  transferredToSessionId: z.string().optional(),
  cancellationReason: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()),
});

// ============================================================================
// ERROR TYPES
// ============================================================================

export class SchedulingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'SchedulingError';
  }
}

export class ResourceConflictError extends SchedulingError {
  constructor(
    message: string,
    public conflictingResources: UUID[]
  ) {
    super(message, 'RESOURCE_CONFLICT');
  }
}

export class InstructorUnavailableError extends SchedulingError {
  constructor(
    message: string,
    public instructorId: UUID
  ) {
    super(message, 'INSTRUCTOR_UNAVAILABLE');
  }
}

export class CapacityExceededError extends SchedulingError {
  constructor(
    message: string,
    public requestedCapacity: number,
    public availableCapacity: number
  ) {
    super(message, 'CAPACITY_EXCEEDED');
  }
}

export class InvalidTimeSlotError extends SchedulingError {
  constructor(
    message: string,
    public timeSlot: { start: Date; end: Date }
  ) {
    super(message, 'INVALID_TIME_SLOT');
  }
}
