import { z } from 'zod';

// ============================================================================
// CORE TYPES & INTERFACES
// ============================================================================

export interface UUID extends String {
  readonly brand: unique symbol;
}

export const createUUID = (id: string): UUID => id as unknown as UUID;

// ============================================================================
// PARTICIPANT CORE TYPES
// ============================================================================

export enum ParticipantStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  TRANSFERRED = 'transferred',
}

export enum RegistrationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WAITLISTED = 'waitlisted',
  ENROLLED = 'enrolled',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  PARTIAL = 'partial',
}

export enum CommunicationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
  PUSH = 'push',
  PHONE = 'phone',
}

export enum DocumentType {
  CERTIFICATE = 'certificate',
  TRANSCRIPT = 'transcript',
  ATTENDANCE_RECORD = 'attendance_record',
  ASSESSMENT_RESULT = 'assessment_result',
  MEDICAL_CLEARANCE = 'medical_clearance',
  BACKGROUND_CHECK = 'background_check',
  ID_VERIFICATION = 'id_verification',
  CUSTOM = 'custom',
}

export enum SurveyType {
  PRE_TRAINING = 'pre_training',
  POST_TRAINING = 'post_training',
  MID_TRAINING = 'mid_training',
  FOLLOW_UP = 'follow_up',
  SATISFACTION = 'satisfaction',
  EVALUATION = 'evaluation',
}

export enum InterventionLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PENDING_REVIEW = 'pending_review',
}

// ============================================================================
// PARTICIPANT MANAGEMENT INTERFACES
// ============================================================================

export interface Participant {
  id: UUID;
  userId: UUID;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  location?: string;
  manager?: string;
  hireDate?: Date;
  status: ParticipantStatus;
  profileData: ParticipantProfile;
  preferences: ParticipantPreferences;
  enrollments: ParticipantEnrollment[];
  documents: ParticipantDocument[];
  communications: CommunicationRecord[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
  updatedBy: UUID;
}

export interface ParticipantProfile {
  bio?: string;
  avatar?: string;
  skills: string[];
  certifications: Certification[];
  education: EducationRecord[];
  workExperience: WorkExperience[];
  languages: LanguageProficiency[];
  accessibility: AccessibilityRequirements;
  emergencyContact: EmergencyContact;
  customFields: Record<string, any>;
}

export interface ParticipantPreferences {
  communicationChannels: CommunicationChannel[];
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
  learningStyle?: string;
  schedulingPreferences: SchedulingPreferences;
  privacySettings: PrivacySettings;
}

export interface SchedulingPreferences {
  preferredDays: string[];
  preferredTimes: TimeSlot[];
  blackoutPeriods: DateRange[];
  maxSessionsPerDay: number;
  minBreakBetweenSessions: number;
}

export interface PrivacySettings {
  shareProgressWithManager: boolean;
  shareProgressWithPeers: boolean;
  allowDirectMessages: boolean;
  showInDirectory: boolean;
  shareContactInfo: boolean;
}

// ============================================================================
// REGISTRATION & ENROLLMENT
// ============================================================================

export interface RegistrationWorkflow {
  id: UUID;
  name: string;
  description?: string;
  trainingProgramId: UUID;
  steps: RegistrationStep[];
  prerequisites: PrerequisiteRule[];
  approvalChain: ApprovalStep[];
  autoEnrollmentRules: AutoEnrollmentRule[];
  isActive: boolean;
  validFrom?: Date;
  validTo?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrationStep {
  id: UUID;
  stepNumber: number;
  title: string;
  description?: string;
  fields: FormField[];
  isRequired: boolean;
  conditionalLogic?: StepLogicRule[];
  validationRules: ValidationRule[];
  estimatedTimeMinutes: number;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  options?: FieldOption[];
  validation: FieldValidation;
  conditionalDisplay?: ConditionalRule[];
  defaultValue?: any;
  metadata: Record<string, any>;
}

export enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME = 'datetime',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  FILE_UPLOAD = 'file_upload',
  SIGNATURE = 'signature',
  RATING = 'rating',
}

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  isDefault?: boolean;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidator?: string;
  errorMessage?: string;
}

export interface ConditionalRule {
  fieldId: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than';
  value: any;
}

export interface StepLogicRule {
  condition: ConditionalRule;
  action: LogicAction;
}

export interface ValidationRule {
  id: string;
  name: string;
  rule: string;
  errorMessage: string;
  isBlocking: boolean;
}

export interface PrerequisiteRule {
  id: UUID;
  type: 'training' | 'certification' | 'skill' | 'assessment' | 'custom';
  description: string;
  requirements: PrerequisiteRequirement[];
  isStrict: boolean; // If true, all requirements must be met; if false, any requirement can be met
}

export interface PrerequisiteRequirement {
  type: string;
  value: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
  validationPeriod?: number; // Days
}

export interface ApprovalStep {
  id: UUID;
  stepNumber: number;
  approverRole: string;
  approverIds?: UUID[];
  isRequired: boolean;
  timeoutDays?: number;
  escalationRules?: EscalationRule[];
}

export interface EscalationRule {
  triggerAfterDays: number;
  escalateToRole: string;
  escalateToIds?: UUID[];
  notificationTemplate: string;
}

export interface AutoEnrollmentRule {
  id: UUID;
  name: string;
  conditions: EnrollmentCondition[];
  action: EnrollmentAction;
  priority: number;
  isActive: boolean;
}

export interface EnrollmentCondition {
  field: string;
  operator: string;
  value: any;
}

export interface EnrollmentAction {
  type: 'enroll' | 'waitlist' | 'reject' | 'require_approval';
  sessionId?: UUID;
  waitlistPriority?: number;
  notificationTemplate?: string;
}

// ============================================================================
// REGISTRATION INSTANCE
// ============================================================================

export interface ParticipantRegistration {
  id: UUID;
  participantId: UUID;
  workflowId: UUID;
  trainingProgramId: UUID;
  status: RegistrationStatus;
  currentStep: number;
  submittedData: Record<string, any>;
  approvals: RegistrationApproval[];
  validationResults: ValidationResult[];
  notes: RegistrationNote[];
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrationApproval {
  id: UUID;
  stepId: UUID;
  approverId: UUID;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  decision?: 'approve' | 'reject' | 'request_changes';
  comments?: string;
  decidedAt?: Date;
  escalatedAt?: Date;
}

export interface ValidationResult {
  ruleId: string;
  fieldId?: string;
  isValid: boolean;
  errorMessage?: string;
  validatedAt: Date;
}

export interface RegistrationNote {
  id: UUID;
  authorId: UUID;
  authorName: string;
  note: string;
  isInternal: boolean;
  createdAt: Date;
}

// ============================================================================
// ENROLLMENT & PARTICIPATION
// ============================================================================

export interface ParticipantEnrollment {
  id: UUID;
  participantId: UUID;
  trainingProgramId: UUID;
  sessionId?: UUID;
  cohortId?: UUID;
  status: EnrollmentStatus;
  enrollmentDate: Date;
  startDate?: Date;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;
  progress: ParticipantProgress;
  attendance: AttendanceRecord[];
  assessments: AssessmentResult[];
  interventions: InterventionRecord[];
  notes: EnrollmentNote[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  WITHDRAWN = 'withdrawn',
  TRANSFERRED = 'transferred',
  ON_HOLD = 'on_hold',
}

export interface ParticipantProgress {
  overallProgress: number; // 0-100
  modulesCompleted: number;
  totalModules: number;
  assessmentsPassed: number;
  totalAssessments: number;
  attendancePercentage: number;
  lastActivityDate?: Date;
  milestones: ProgressMilestone[];
  competencies: CompetencyProgress[];
  learningPath: LearningPathProgress[];
}

export interface ProgressMilestone {
  id: UUID;
  name: string;
  description?: string;
  targetDate: Date;
  completedDate?: Date;
  status: ProgressStatus;
  requirements: MilestoneRequirement[];
}

export interface MilestoneRequirement {
  type: 'module' | 'assessment' | 'attendance' | 'custom';
  description: string;
  isCompleted: boolean;
  completedDate?: Date;
}

export interface CompetencyProgress {
  competencyId: UUID;
  competencyName: string;
  currentLevel: number;
  targetLevel: number;
  progress: number; // 0-100
  lastAssessedDate?: Date;
  evidence: CompetencyEvidence[];
}

export interface CompetencyEvidence {
  type: 'assessment' | 'observation' | 'project' | 'portfolio';
  description: string;
  score?: number;
  assessorId?: UUID;
  assessmentDate: Date;
  documentUrl?: string;
}

export interface LearningPathProgress {
  pathId: UUID;
  pathName: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  estimatedTimeRemaining: number; // minutes
}

// ============================================================================
// ATTENDANCE TRACKING
// ============================================================================

export interface AttendanceRecord {
  id: UUID;
  participantId: UUID;
  sessionId: UUID;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  duration?: number; // minutes
  verificationMethod: AttendanceVerificationMethod;
  verificationData: AttendanceVerificationData;
  location?: GeoLocation;
  notes?: string;
  approvedBy?: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export enum AttendanceVerificationMethod {
  QR_CODE = 'qr_code',
  GPS = 'gps',
  BIOMETRIC = 'biometric',
  MANUAL = 'manual',
  RFID = 'rfid',
  BEACON = 'beacon',
  FACIAL_RECOGNITION = 'facial_recognition',
}

export interface AttendanceVerificationData {
  method: AttendanceVerificationMethod;
  qrCodeData?: string;
  gpsCoordinates?: GeoLocation;
  biometricHash?: string;
  rfidTag?: string;
  beaconId?: string;
  faceRecognitionConfidence?: number;
  deviceInfo?: DeviceInfo;
  timestamp: Date;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'kiosk';
  operatingSystem: string;
  browser?: string;
  ipAddress: string;
  userAgent: string;
}

export interface AttendanceConfiguration {
  sessionId: UUID;
  checkInWindowStart: number; // minutes before session start
  checkInWindowEnd: number; // minutes after session start
  checkOutRequired: boolean;
  verificationMethods: AttendanceVerificationMethod[];
  locationRequired: boolean;
  allowedLocations?: GeoLocation[];
  locationRadius?: number; // meters
  requiresApproval: boolean;
  autoMarkAbsent: boolean;
  absentAfterMinutes: number;
}

// ============================================================================
// COMMUNICATION SYSTEM
// ============================================================================

export interface CommunicationRecord {
  id: UUID;
  participantId: UUID;
  channel: CommunicationChannel;
  type: CommunicationType;
  subject: string;
  content: string;
  templateId?: UUID;
  status: CommunicationStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  responseRequired: boolean;
  responseReceived?: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum CommunicationType {
  ENROLLMENT_CONFIRMATION = 'enrollment_confirmation',
  REMINDER = 'reminder',
  SCHEDULE_CHANGE = 'schedule_change',
  ASSIGNMENT_DUE = 'assignment_due',
  ASSESSMENT_AVAILABLE = 'assessment_available',
  COMPLETION_CERTIFICATE = 'completion_certificate',
  INTERVENTION_ALERT = 'intervention_alert',
  SURVEY_REQUEST = 'survey_request',
  CUSTOM = 'custom',
}

export enum CommunicationStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

export interface CommunicationTemplate {
  id: UUID;
  name: string;
  description?: string;
  channel: CommunicationChannel;
  type: CommunicationType;
  subject: string;
  content: string;
  variables: TemplateVariable[];
  isActive: boolean;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  isRequired: boolean;
  defaultValue?: any;
}

export interface CommunicationRule {
  id: UUID;
  name: string;
  trigger: CommunicationTrigger;
  conditions: CommunicationCondition[];
  templateId: UUID;
  channel: CommunicationChannel;
  delay?: number; // minutes
  isActive: boolean;
  priority: number;
}

export interface CommunicationTrigger {
  event:
    | 'enrollment'
    | 'attendance'
    | 'progress'
    | 'assessment'
    | 'intervention'
    | 'schedule_change';
  when: 'before' | 'after' | 'on';
  timeOffset?: number; // minutes
}

export interface CommunicationCondition {
  field: string;
  operator: string;
  value: any;
}

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

export interface ParticipantDocument {
  id: UUID;
  participantId: UUID;
  type: DocumentType;
  title: string;
  description?: string;
  filename: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  isGenerated: boolean;
  templateId?: UUID;
  generatedData?: Record<string, any>;
  version: number;
  status: DocumentStatus;
  expiryDate?: Date;
  verificationHash?: string;
  accessLevel: DocumentAccessLevel;
  downloadCount: number;
  lastDownloadedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
}

export enum DocumentStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  ARCHIVED = 'archived',
}

export enum DocumentAccessLevel {
  PRIVATE = 'private',
  PARTICIPANT_ONLY = 'participant_only',
  MANAGER_ACCESS = 'manager_access',
  INSTRUCTOR_ACCESS = 'instructor_access',
  PUBLIC = 'public',
}

export interface DocumentTemplate {
  id: UUID;
  name: string;
  type: DocumentType;
  description?: string;
  templateData: DocumentTemplateData;
  variables: TemplateVariable[];
  styling: DocumentStyling;
  isActive: boolean;
  version: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentTemplateData {
  format: 'pdf' | 'html' | 'docx' | 'image';
  content: string;
  layout: DocumentLayout;
  signatures?: SignatureField[];
  watermark?: WatermarkConfig;
}

export interface DocumentLayout {
  pageSize: 'A4' | 'Letter' | 'Legal' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: PageMargins;
  header?: HeaderFooterConfig;
  footer?: HeaderFooterConfig;
}

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface HeaderFooterConfig {
  content: string;
  height: number;
  alignment: 'left' | 'center' | 'right';
}

export interface SignatureField {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isRequired: boolean;
}

export interface WatermarkConfig {
  text: string;
  opacity: number;
  rotation: number;
  fontSize: number;
  color: string;
  position: 'center' | 'diagonal' | 'custom';
}

export interface DocumentStyling {
  fonts: FontConfig[];
  colors: ColorPalette;
  spacing: SpacingConfig;
  branding: BrandingConfig;
}

export interface FontConfig {
  name: string;
  size: number;
  weight: 'normal' | 'bold' | 'light';
  style: 'normal' | 'italic';
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export interface SpacingConfig {
  lineHeight: number;
  paragraphSpacing: number;
  sectionSpacing: number;
}

export interface BrandingConfig {
  logo?: string;
  organizationName: string;
  contactInfo: ContactInfo;
  theme: 'corporate' | 'academic' | 'modern' | 'classic';
}

// ============================================================================
// SURVEY & FEEDBACK SYSTEM
// ============================================================================

export interface Survey {
  id: UUID;
  title: string;
  description?: string;
  type: SurveyType;
  trainingProgramId?: UUID;
  questions: SurveyQuestion[];
  settings: SurveySettings;
  isActive: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  responseCount: number;
  targetAudience: SurveyAudience;
  analytics: SurveyAnalytics;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
}

export interface SurveyQuestion {
  id: UUID;
  questionNumber: number;
  type: QuestionType;
  text: string;
  description?: string;
  isRequired: boolean;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  logic?: QuestionLogic[];
  scoring?: QuestionScoring;
}

export enum QuestionType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  RATING = 'rating',
  SCALE = 'scale',
  DATE = 'date',
  EMAIL = 'email',
  NUMBER = 'number',
  YES_NO = 'yes_no',
  RANKING = 'ranking',
  MATRIX = 'matrix',
  FILE_UPLOAD = 'file_upload',
}

export interface QuestionOption {
  id: string;
  text: string;
  value: string;
  order: number;
  isOther?: boolean;
}

export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  customValidator?: string;
}

export interface QuestionLogic {
  condition: LogicCondition;
  action: LogicAction;
}

export interface LogicCondition {
  questionId: UUID;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface LogicAction {
  type: 'show' | 'hide' | 'require' | 'skip_to';
  targetQuestionId?: UUID;
}

export interface QuestionScoring {
  maxPoints: number;
  correctAnswers?: string[];
  scoringMethod: 'binary' | 'partial' | 'weighted';
  weights?: Record<string, number>;
}

export interface SurveySettings {
  allowAnonymousResponses: boolean;
  allowMultipleResponses: boolean;
  requireAuthentication: boolean;
  showProgressBar: boolean;
  randomizeQuestions: boolean;
  timeLimit?: number; // minutes
  autoSave: boolean;
  thankYouMessage: string;
  redirectUrl?: string;
}

export interface SurveyAudience {
  participantIds?: UUID[];
  cohortIds?: UUID[];
  trainingProgramIds?: UUID[];
  filters?: AudienceFilter[];
  excludeCompleted: boolean;
}

export interface AudienceFilter {
  field: string;
  operator: string;
  value: any;
}

export interface SurveyResponse {
  id: UUID;
  surveyId: UUID;
  participantId?: UUID;
  isAnonymous: boolean;
  answers: SurveyAnswer[];
  score?: number;
  completedAt?: Date;
  timeSpent: number; // minutes
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyAnswer {
  questionId: UUID;
  answer: any;
  score?: number;
  timeSpent?: number; // seconds
}

export interface SurveyAnalytics {
  totalResponses: number;
  completionRate: number;
  averageCompletionTime: number;
  averageScore?: number;
  responseDistribution: ResponseDistribution[];
  sentimentAnalysis?: SentimentAnalysis;
  keyInsights: string[];
  recommendations: string[];
}

export interface ResponseDistribution {
  questionId: UUID;
  questionText: string;
  responses: ResponseSummary[];
}

export interface ResponseSummary {
  value: string;
  count: number;
  percentage: number;
}

export interface SentimentAnalysis {
  overall: SentimentScore;
  byQuestion: Record<string, SentimentScore>;
  themes: string[];
}

export interface SentimentScore {
  positive: number;
  neutral: number;
  negative: number;
  confidence: number;
}

// ============================================================================
// INTERVENTION SYSTEM
// ============================================================================

export interface InterventionRecord {
  id: UUID;
  participantId: UUID;
  trainingProgramId: UUID;
  type: InterventionType;
  level: InterventionLevel;
  title: string;
  description: string;
  triggers: InterventionTrigger[];
  status: InterventionStatus;
  assignedTo?: UUID;
  interventions: InterventionAction[];
  followUps: FollowUpAction[];
  resolution?: InterventionResolution;
  dueDate?: Date;
  resolvedAt?: Date;
  escalatedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum InterventionType {
  ATTENDANCE = 'attendance',
  PERFORMANCE = 'performance',
  ENGAGEMENT = 'engagement',
  BEHAVIOR = 'behavior',
  TECHNICAL = 'technical',
  ACADEMIC = 'academic',
  PERSONAL = 'personal',
}

export enum InterventionStatus {
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
}

export interface InterventionTrigger {
  type: TriggerType;
  condition: TriggerCondition;
  threshold: number;
  timeframe: number; // days
  isActive: boolean;
}

export enum TriggerType {
  ATTENDANCE_RATE = 'attendance_rate',
  ASSIGNMENT_COMPLETION = 'assignment_completion',
  ASSESSMENT_SCORE = 'assessment_score',
  ENGAGEMENT_SCORE = 'engagement_score',
  LOGIN_FREQUENCY = 'login_frequency',
  PROGRESS_RATE = 'progress_rate',
  TIME_BEHIND_SCHEDULE = 'time_behind_schedule',
}

export interface TriggerCondition {
  operator: 'less_than' | 'greater_than' | 'equals' | 'not_equals';
  value: number;
  consecutive?: boolean;
  period?: number; // days
}

export interface InterventionAction {
  id: UUID;
  type: ActionType;
  description: string;
  assignedTo?: UUID;
  status: ActionStatus;
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
  outcome?: ActionOutcome;
}

export enum ActionType {
  EMAIL_REMINDER = 'email_reminder',
  PHONE_CALL = 'phone_call',
  MEETING_SCHEDULED = 'meeting_scheduled',
  ADDITIONAL_RESOURCES = 'additional_resources',
  PEER_SUPPORT = 'peer_support',
  COACHING_SESSION = 'coaching_session',
  SCHEDULE_ADJUSTMENT = 'schedule_adjustment',
  REMEDIAL_TRAINING = 'remedial_training',
}

export enum ActionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface ActionOutcome {
  success: boolean;
  participantResponse: string;
  nextSteps: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface FollowUpAction {
  id: UUID;
  description: string;
  dueDate: Date;
  assignedTo: UUID;
  status: ActionStatus;
  completedAt?: Date;
  notes?: string;
}

export interface InterventionResolution {
  type: ResolutionType;
  description: string;
  outcome: ResolutionOutcome;
  preventiveMeasures: string[];
  lessonsLearned: string[];
  resolvedBy: UUID;
  resolvedAt: Date;
}

export enum ResolutionType {
  SUCCESSFUL = 'successful',
  PARTIALLY_SUCCESSFUL = 'partially_successful',
  UNSUCCESSFUL = 'unsuccessful',
  TRANSFERRED = 'transferred',
  WITHDRAWN = 'withdrawn',
}

export enum ResolutionOutcome {
  BACK_ON_TRACK = 'back_on_track',
  IMPROVED = 'improved',
  NO_CHANGE = 'no_change',
  DECLINED = 'declined',
  PROGRAM_CHANGE = 'program_change',
}

// ============================================================================
// PROGRESS VISUALIZATION & DASHBOARDS
// ============================================================================

export interface ProgressDashboard {
  id: UUID;
  type: DashboardType;
  title: string;
  description?: string;
  participantId?: UUID;
  cohortId?: UUID;
  trainingProgramId?: UUID;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: DashboardFilter[];
  refreshInterval: number; // minutes
  isShared: boolean;
  sharedWith: UUID[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
}

export enum DashboardType {
  INDIVIDUAL = 'individual',
  COHORT = 'cohort',
  PROGRAM = 'program',
  INSTRUCTOR = 'instructor',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export interface DashboardWidget {
  id: UUID;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  dataSource: DataSource;
  configuration: WidgetConfiguration;
  isVisible: boolean;
}

export enum WidgetType {
  PROGRESS_BAR = 'progress_bar',
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  TABLE = 'table',
  METRIC_CARD = 'metric_card',
  GAUGE = 'gauge',
  HEATMAP = 'heatmap',
  TIMELINE = 'timeline',
  LEADERBOARD = 'leaderboard',
}

export interface WidgetPosition {
  x: number;
  y: number;
  zIndex: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface DataSource {
  type: 'progress' | 'attendance' | 'assessments' | 'surveys' | 'interventions';
  query: DataQuery;
  aggregation?: DataAggregation;
  timeframe?: TimeframeFilter;
}

export interface DataQuery {
  fields: string[];
  filters: QueryFilter[];
  groupBy?: string[];
  orderBy?: QueryOrder[];
  limit?: number;
}

export interface QueryFilter {
  field: string;
  operator: string;
  value: any;
}

export interface QueryOrder {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface DataAggregation {
  type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
  field: string;
  groupBy?: string;
}

export interface TimeframeFilter {
  type:
    | 'last_7_days'
    | 'last_30_days'
    | 'last_90_days'
    | 'year_to_date'
    | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export interface WidgetConfiguration {
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltips?: boolean;
  animations?: boolean;
  thresholds?: ThresholdConfig[];
  formatting?: FormatConfig;
}

export interface ThresholdConfig {
  value: number;
  color: string;
  label?: string;
}

export interface FormatConfig {
  numberFormat?: 'integer' | 'decimal' | 'percentage' | 'currency';
  dateFormat?: string;
  prefix?: string;
  suffix?: string;
  precision?: number;
}

export interface DashboardLayout {
  type: 'grid' | 'flexible' | 'tabbed';
  columns: number;
  rowHeight: number;
  spacing: number;
  responsive: boolean;
}

export interface DashboardFilter {
  field: string;
  type: 'select' | 'date_range' | 'search' | 'checkbox';
  label: string;
  options?: FilterOption[];
  defaultValue?: any;
}

export interface FilterOption {
  value: string;
  label: string;
}

// ============================================================================
// REPORTING SYSTEM
// ============================================================================

export interface ReportDefinition {
  id: UUID;
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  dataSource: ReportDataSource;
  parameters: ReportParameter[];
  format: ReportFormat;
  template?: ReportTemplate;
  schedule?: ReportSchedule;
  recipients: ReportRecipient[];
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
}

export enum ReportType {
  PARTICIPANT_SUMMARY = 'participant_summary',
  PROGRESS_REPORT = 'progress_report',
  ATTENDANCE_REPORT = 'attendance_report',
  COMPLETION_REPORT = 'completion_report',
  SURVEY_ANALYSIS = 'survey_analysis',
  INTERVENTION_SUMMARY = 'intervention_summary',
  PERFORMANCE_ANALYTICS = 'performance_analytics',
  CUSTOM = 'custom',
}

export enum ReportCategory {
  OPERATIONAL = 'operational',
  ANALYTICAL = 'analytical',
  COMPLIANCE = 'compliance',
  EXECUTIVE = 'executive',
}

export interface ReportDataSource {
  tables: string[];
  joins: TableJoin[];
  fields: ReportField[];
  filters: ReportFilter[];
  aggregations: ReportAggregation[];
}

export interface TableJoin {
  leftTable: string;
  rightTable: string;
  joinType: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  condition: string;
}

export interface ReportField {
  field: string;
  alias?: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  aggregation?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
  format?: string;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
  parameterName?: string;
}

export interface ReportAggregation {
  field: string;
  function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'GROUP_CONCAT';
  groupBy?: string[];
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'select' | 'multiselect';
  isRequired: boolean;
  defaultValue?: any;
  options?: ParameterOption[];
  validation?: ParameterValidation;
}

export interface ParameterOption {
  value: string;
  label: string;
}

export interface ParameterValidation {
  minValue?: any;
  maxValue?: any;
  pattern?: string;
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  HTML = 'html',
  JSON = 'json',
}

export interface ReportTemplate {
  header?: TemplateSection;
  body: TemplateSection;
  footer?: TemplateSection;
  styling: ReportStyling;
}

export interface TemplateSection {
  content: string;
  variables: string[];
  height?: number;
}

export interface ReportStyling {
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: PageMargins;
  fonts: FontConfig[];
  colors: ColorPalette;
  table: TableStyling;
}

export interface TableStyling {
  headerStyle: CellStyle;
  dataStyle: CellStyle;
  alternateRowColor?: string;
  borderStyle: BorderStyle;
}

export interface CellStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  padding: number;
}

export interface BorderStyle {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface ReportSchedule {
  frequency: ScheduleFrequency;
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6, Sunday=0
  dayOfMonth?: number; // 1-31
  timezone: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export interface ReportRecipient {
  type: 'user' | 'role' | 'email';
  identifier: string;
  deliveryMethod: 'email' | 'dashboard' | 'download';
}

export interface GeneratedReport {
  id: UUID;
  reportDefinitionId: UUID;
  name: string;
  parameters: Record<string, any>;
  format: ReportFormat;
  status: ReportStatus;
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  generationTime: number; // milliseconds
  error?: string;
  expiresAt?: Date;
  downloadCount: number;
  metadata: Record<string, any>;
  generatedAt: Date;
  generatedBy: UUID;
}

export enum ReportStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

// ============================================================================
// ADDITIONAL UTILITY TYPES
// ============================================================================

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: Address;
  website?: string;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: Address;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
}

export interface EducationRecord {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  honors?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  department?: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  skills: string[];
}

export interface LanguageProficiency {
  language: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
  certifications?: string[];
}

export interface AccessibilityRequirements {
  visualAids: boolean;
  hearingAids: boolean;
  mobilityAssistance: boolean;
  cognitiveSupport: boolean;
  screenReader: boolean;
  largeText: boolean;
  highContrast: boolean;
  additionalTime: boolean;
  notes?: string;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AssessmentResult {
  assessmentId: UUID;
  assessmentName: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
  timeSpent: number; // minutes
  submittedAt: Date;
  gradedAt?: Date;
  feedback?: string;
}

export interface EnrollmentNote {
  id: UUID;
  authorId: UUID;
  authorName: string;
  note: string;
  isPrivate: boolean;
  tags: string[];
  createdAt: Date;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const ParticipantSchema = z.object({
  id: z.string(),
  userId: z.string(),
  employeeId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  location: z.string().optional(),
  manager: z.string().optional(),
  hireDate: z.date().optional(),
  status: z.nativeEnum(ParticipantStatus),
  profileData: z.any(),
  preferences: z.any(),
  enrollments: z.array(z.any()).default([]),
  documents: z.array(z.any()).default([]),
  communications: z.array(z.any()).default([]),
  metadata: z.record(z.any()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  updatedBy: z.string(),
});

export const RegistrationWorkflowSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  trainingProgramId: z.string(),
  steps: z.array(z.any()),
  prerequisites: z.array(z.any()).default([]),
  approvalChain: z.array(z.any()).default([]),
  autoEnrollmentRules: z.array(z.any()).default([]),
  isActive: z.boolean().default(true),
  validFrom: z.date().optional(),
  validTo: z.date().optional(),
  metadata: z.record(z.any()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AttendanceRecordSchema = z.object({
  id: z.string(),
  participantId: z.string(),
  sessionId: z.string(),
  status: z.nativeEnum(AttendanceStatus),
  checkInTime: z.date().optional(),
  checkOutTime: z.date().optional(),
  duration: z.number().optional(),
  verificationMethod: z.nativeEnum(AttendanceVerificationMethod),
  verificationData: z.any(),
  location: z.any().optional(),
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SurveySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(SurveyType),
  trainingProgramId: z.string().optional(),
  questions: z.array(z.any()),
  settings: z.any(),
  isActive: z.boolean().default(true),
  publishedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  responseCount: z.number().default(0),
  targetAudience: z.any(),
  analytics: z.any(),
  metadata: z.record(z.any()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

export const InterventionRecordSchema = z.object({
  id: z.string(),
  participantId: z.string(),
  trainingProgramId: z.string(),
  type: z.nativeEnum(InterventionType),
  level: z.nativeEnum(InterventionLevel),
  title: z.string().min(1),
  description: z.string(),
  triggers: z.array(z.any()),
  status: z.nativeEnum(InterventionStatus),
  assignedTo: z.string().optional(),
  interventions: z.array(z.any()).default([]),
  followUps: z.array(z.any()).default([]),
  resolution: z.any().optional(),
  dueDate: z.date().optional(),
  resolvedAt: z.date().optional(),
  escalatedAt: z.date().optional(),
  metadata: z.record(z.any()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});
