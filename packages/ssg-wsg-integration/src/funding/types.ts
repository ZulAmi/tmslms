/**
 * SSG-WSG Funding & Claims Management Types
 * Comprehensive type definitions for funding eligibility, claims processing, and financial reconciliation
 */

import { z } from 'zod';

// ============================================================================
// ELIGIBILITY VERIFICATION TYPES
// ============================================================================

export interface EligibilityRequest {
  participantId: string;
  courseId: string;
  trainingProvider: TrainingProvider;
  fundingSchemeId: string;
  requestedAmount: number;
  currency: 'SGD';
  participantDetails: ParticipantEligibility;
  courseDetails: CourseEligibility;
  companyDetails?: CompanyEligibility;
  priority: 'high' | 'medium' | 'low';
  metadata: Record<string, any>;
  requestedBy: string;
  requestedAt: Date;
}

export interface EligibilityResponse {
  requestId: string;
  participantId: string;
  courseId: string;
  eligible: boolean;
  eligibilityScore: number;
  maxSubsidyAmount: number;
  subsidyPercentage: number;
  applicableFundingSchemes: ApplicableFundingScheme[];
  eligibilityDetails: EligibilityDetails;
  requirements: EligibilityRequirement[];
  validUntil: Date;
  processedAt: Date;
  processingTime: number;
}

export interface ParticipantEligibility {
  nric: string;
  name: string;
  dateOfBirth: Date;
  nationality: string;
  residencyStatus: ResidencyStatus;
  employmentStatus: EmploymentStatus;
  monthlyIncome?: number;
  educationLevel: EducationLevel;
  industryExperience: number;
  companyUEN?: string;
  previousFundingHistory: PreviousFunding[];
  skillsFrameworkAlignment: string[];
  disabilityStatus?: DisabilityStatus;
  isFirstTimeUser: boolean;
}

export interface CourseEligibility {
  courseId: string;
  courseTitle: string;
  trainingProvider: string;
  courseCategory: CourseCategory;
  skillsFrameworkAlignment: string[];
  courseDuration: number;
  courseFee: number;
  currency: 'SGD';
  deliveryMode: DeliveryMode;
  assessmentType: AssessmentType;
  certificationAwarded: string;
  isSSGApproved: boolean;
  ssgCourseReferenceNumber?: string;
  wsgFundingTier?: number;
}

export interface CompanyEligibility {
  companyUEN: string;
  companyName: string;
  industryCode: string;
  companySize: CompanySize;
  isLocalCompany: boolean;
  companyAge: number;
  previousClaimsHistory: CompanyClaimsHistory[];
  outstandingClaims: number;
  creditRating?: string;
}

export interface ApplicableFundingScheme {
  schemeId: string;
  schemeName: string;
  category: FundingCategory;
  subsidyPercentage: number;
  maxSubsidyAmount: number;
  applicableConditions: string[];
  priority: number;
  estimatedProcessingTime: number;
}

export interface EligibilityDetails {
  criteriaChecks: EligibilityCriteriaCheck[];
  overallScore: number;
  passedChecks: number;
  totalChecks: number;
  riskAssessment: RiskAssessment;
  recommendedAction: RecommendedAction;
}

export interface EligibilityCriteriaCheck {
  criterion: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  score: number;
  maxScore: number;
  description: string;
  evidence?: string[];
  failureReason?: string;
  remedialAction?: string;
}

export interface EligibilityRequirement {
  id: string;
  type: 'document' | 'verification' | 'approval' | 'payment';
  title: string;
  description: string;
  mandatory: boolean;
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  dueDate?: Date;
  documents?: RequiredDocument[];
}

// ============================================================================
// CLAIMS MANAGEMENT TYPES
// ============================================================================

export interface ClaimSubmission {
  claimId: string;
  participantId: string;
  courseId: string;
  eligibilityId: string;
  fundingSchemeId: string;
  claimType: ClaimType;
  claimAmount: number;
  currency: 'SGD';
  claimStatus: ClaimStatus;
  submissionMethod: SubmissionMethod;
  documents: ClaimDocument[];
  participantDeclaration: ParticipantDeclaration;
  trainingProviderDeclaration: ProviderDeclaration;
  completionDetails: CompletionDetails;
  paymentDetails: PaymentDetails;
  submittedBy: string;
  submittedAt: Date;
  processedAt?: Date;
  approvedAt?: Date;
  paidAt?: Date;
  metadata: Record<string, any>;
}

export interface ClaimDocument {
  id: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  fileFormat: string;
  uploadedAt: Date;
  uploadedBy: string;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  s3Url?: string;
  checksum: string;
  documentMetadata: DocumentMetadata;
}

export interface CompletionDetails {
  courseStartDate: Date;
  courseEndDate: Date;
  actualAttendance: number;
  requiredAttendance: number;
  attendancePercentage: number;
  assessmentScore?: number;
  passingScore?: number;
  certificateIssued: boolean;
  certificateNumber?: string;
  competenciesAchieved: string[];
  trainingHours: number;
}

export interface PaymentDetails {
  totalCourseFee: number;
  participantPaidAmount: number;
  requestedClaimAmount: number;
  approvedClaimAmount?: number;
  actualPaidAmount?: number;
  paymentMethod: PaymentMethod;
  bankDetails?: BankDetails;
  gstAmount?: number;
  netAmount?: number;
  exchangeRate?: number;
  processingFees?: number;
}

export interface ClaimProcessingWorkflow {
  claimId: string;
  currentStage: WorkflowStage;
  workflowHistory: WorkflowStep[];
  approvalLevels: ApprovalLevelConfiguration[];
  notifications: NotificationLog[];
  slaTargets: SLATarget[];
  escalationRules: EscalationRule[];
}

export interface WorkflowStep {
  stepId: string;
  stage: WorkflowStage;
  status: StepStatus;
  assignedTo?: string;
  processedBy?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  comments?: string;
  attachments?: string[];
  nextPossibleSteps: string[];
}

export enum ApprovalLevel {
  AUTO_APPROVAL = 'auto_approval',
  L1_REVIEWER = 'l1_reviewer',
  L2_MANAGER = 'l2_manager',
  SENIOR_MANAGER = 'senior_manager',
  FINANCE_DIRECTOR = 'finance_director',
  CEO_APPROVAL = 'ceo_approval',
}

export interface ApprovalLevelConfiguration {
  level: number;
  approverRole: string;
  requiredApprovals: number;
  currentApprovals: number;
  approvalThreshold?: number;
  delegationRules?: DelegationRule[];
  timeoutPeriod: number;
  autoApprovalRules?: AutoApprovalRule[];
}

// ============================================================================
// SUBSIDY CALCULATION TYPES
// ============================================================================

export interface SubsidyCalculationRequest {
  participantId: string;
  courseId: string;
  courseFee: number;
  fundingSchemes: string[];
  participantProfile: ParticipantProfile;
  companyProfile?: CompanyProfile;
  calculationDate: Date;
  currency: 'SGD';
}

export interface SubsidyCalculationResponse {
  requestId: string;
  totalCourseFee: number;
  maximumClaimableAmount: number;
  participantContribution: number;
  governmentContribution: number;
  subsidyBreakdown: SubsidyBreakdown[];
  calculationMethod: string;
  applicableRules: ApplicableRule[];
  calculatedAt: Date;
  validUntil: Date;
  calculationId: string;
}

export interface SubsidyBreakdown {
  fundingSchemeId: string;
  schemeName: string;
  subsidyAmount: number;
  subsidyPercentage: number;
  maxAmount: number;
  appliedRules: string[];
  calculationDetails: CalculationDetails;
}

export interface CalculationDetails {
  baseAmount: number;
  adjustments: AmountAdjustment[];
  finalAmount: number;
  gstApplicable: boolean;
  gstAmount?: number;
  netAmount: number;
  rounding: RoundingInfo;
}

export interface AmountAdjustment {
  type: 'bonus' | 'reduction' | 'cap' | 'floor';
  reason: string;
  amount: number;
  percentage?: number;
  rule: string;
  applied: boolean;
}

// ============================================================================
// FINANCIAL RECONCILIATION TYPES
// ============================================================================

export interface ReconciliationBatch {
  batchId: string;
  batchDate: Date;
  paymentProvider: 'SSG' | 'WSG' | 'TESA' | 'MAS';
  batchType: 'daily' | 'weekly' | 'monthly' | 'adhoc';
  totalClaims: number;
  totalAmount: number;
  currency: 'SGD';
  reconciliationStatus: ReconciliationStatus;
  reconciliationItems: ReconciliationItem[];
  discrepancies: Discrepancy[];
  processedBy: string;
  processedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface ReconciliationItem {
  itemId: string;
  claimId: string;
  participantId: string;
  expectedAmount: number;
  receivedAmount: number;
  difference: number;
  reconciliationStatus: ItemReconciliationStatus;
  paymentReference: string;
  paymentDate: Date;
  bankTransactionId?: string;
  notes?: string;
}

export interface Discrepancy {
  discrepancyId: string;
  type: DiscrepancyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedClaims: string[];
  potentialImpact: number;
  resolutionStatus: ResolutionStatus;
  assignedTo?: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

// ============================================================================
// DASHBOARD & ANALYTICS TYPES
// ============================================================================

export interface FundingDashboardData {
  periodStart: Date;
  periodEnd: Date;
  summaryMetrics: FundingSummaryMetrics;
  approvalRates: ApprovalRateMetrics;
  fundingUtilization: FundingUtilizationMetrics;
  processingPerformance: ProcessingPerformanceMetrics;
  complianceMetrics: ComplianceMetrics;
  trendAnalysis: TrendAnalysis[];
  topPerformingCourses: CoursePerformanceMetric[];
  riskIndicators: RiskIndicator[];
}

export interface FundingSummaryMetrics {
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  pendingApplications: number;
  totalClaimsValue: number;
  totalApprovedAmount: number;
  totalPaidAmount: number;
  averageClaimAmount: number;
  averageProcessingTime: number;
  slaComplianceRate: number;
}

export interface ApprovalRateMetrics {
  overallApprovalRate: number;
  approvalRateByScheme: SchemeApprovalRate[];
  approvalRateByProvider: ProviderApprovalRate[];
  approvalRateByAmount: AmountRangeApprovalRate[];
  monthlyApprovalTrend: MonthlyApprovalData[];
}

export interface FundingUtilizationMetrics {
  totalBudgetAllocated: number;
  totalBudgetUtilized: number;
  utilizationPercentage: number;
  utilizationByScheme: SchemeUtilization[];
  utilizationByQuarter: QuarterlyUtilization[];
  projectedUtilization: number;
  remainingBudget: number;
}

// ============================================================================
// COMPLIANCE & AUDIT TYPES
// ============================================================================

export interface ComplianceReport {
  reportId: string;
  reportType: ComplianceReportType;
  generatedFor: Date;
  generatedAt: Date;
  generatedBy: string;
  reportPeriod: DateRange;
  complianceChecks: ComplianceCheck[];
  violations: ComplianceViolation[];
  recommendations: ComplianceRecommendation[];
  auditTrail: AuditTrailEntry[];
  certificationStatus: CertificationStatus;
}

export interface ComplianceCheck {
  checkId: string;
  checkType: ComplianceCheckType;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  severity: 'low' | 'medium' | 'high';
  evidence: string[];
  recommendedAction?: string;
  dueDate?: Date;
}

export interface AuditTrailEntry {
  entryId: string;
  timestamp: Date;
  userId: string;
  userRole: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  changes: AuditChange[];
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

// ============================================================================
// ENUM DEFINITIONS
// ============================================================================

export enum ResidencyStatus {
  CITIZEN = 'citizen',
  PR = 'permanent_resident',
  WORK_PERMIT = 'work_permit',
  S_PASS = 'spass',
  EP = 'employment_pass',
  DEPENDENT = 'dependent_pass',
  STUDENT = 'student_pass',
}

export enum EmploymentStatus {
  EMPLOYED = 'employed',
  UNEMPLOYED = 'unemployed',
  SELF_EMPLOYED = 'self_employed',
  TRAINEE = 'trainee',
  RETIREE = 'retiree',
}

export enum EducationLevel {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  POST_SECONDARY = 'post_secondary',
  POLYTECHNIC = 'polytechnic',
  UNIVERSITY = 'university',
  POSTGRADUATE = 'postgraduate',
}

export enum CourseCategory {
  TECHNICAL_SKILLS = 'technical_skills',
  SOFT_SKILLS = 'soft_skills',
  LEADERSHIP = 'leadership',
  DIGITAL_LITERACY = 'digital_literacy',
  INDUSTRY_SPECIFIC = 'industry_specific',
  COMPLIANCE = 'compliance',
  SAFETY = 'safety',
}

export enum DeliveryMode {
  CLASSROOM = 'classroom',
  E_LEARNING = 'e_learning',
  BLENDED = 'blended',
  OJT = 'on_the_job',
  VIRTUAL_CLASSROOM = 'virtual_classroom',
}

export enum AssessmentType {
  WRITTEN_EXAM = 'written_exam',
  PRACTICAL_ASSESSMENT = 'practical_assessment',
  PROJECT_BASED = 'project_based',
  PORTFOLIO = 'portfolio',
  COMPETENCY_ASSESSMENT = 'competency_assessment',
}

export enum CompanySize {
  MICRO = 'micro', // < 10 employees
  SMALL = 'small', // 10-49 employees
  MEDIUM = 'medium', // 50-199 employees
  LARGE = 'large', // 200+ employees
}

export enum ClaimType {
  INDIVIDUAL_CLAIM = 'individual_claim',
  COMPANY_SPONSORED = 'company_sponsored',
  BULK_CLAIM = 'bulk_claim',
  ADVANCE_PAYMENT = 'advance_payment',
  POST_TRAINING = 'post_training',
}

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  PENDING_DOCUMENTS = 'pending_documents',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAYMENT_PROCESSING = 'payment_processing',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum DocumentType {
  NRIC = 'nric',
  CERTIFICATE = 'certificate',
  TRANSCRIPT = 'transcript',
  ATTENDANCE_RECORD = 'attendance_record',
  ASSESSMENT_RESULTS = 'assessment_results',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  BANK_STATEMENT = 'bank_statement',
  EMPLOYMENT_LETTER = 'employment_letter',
  COMPANY_PROFILE = 'company_profile',
}

export enum WorkflowStage {
  INITIAL_REVIEW = 'initial_review',
  DOCUMENT_VERIFICATION = 'document_verification',
  ELIGIBILITY_CHECK = 'eligibility_check',
  FINANCIAL_VERIFICATION = 'financial_verification',
  MANAGER_APPROVAL = 'manager_approval',
  SENIOR_APPROVAL = 'senior_approval',
  PAYMENT_PREPARATION = 'payment_preparation',
  PAYMENT_EXECUTION = 'payment_execution',
  COMPLETION = 'completion',
}

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ReconciliationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISCREPANCIES_FOUND = 'discrepancies_found',
  REQUIRES_INVESTIGATION = 'requires_investigation',
  RESOLVED = 'resolved',
}

export enum DiscrepancyType {
  AMOUNT_MISMATCH = 'amount_mismatch',
  MISSING_PAYMENT = 'missing_payment',
  DUPLICATE_PAYMENT = 'duplicate_payment',
  INCORRECT_REFERENCE = 'incorrect_reference',
  TIMING_DIFFERENCE = 'timing_difference',
}

// ============================================================================
// ADDITIONAL SUPPORTING TYPES
// ============================================================================

export interface PreviousFunding {
  fundingId: string;
  schemeUsed: string;
  amountReceived: number;
  dateReceived: Date;
  courseCompleted: boolean;
}

export interface CompanyClaimsHistory {
  claimId: string;
  claimAmount: number;
  status: ClaimStatus;
  submittedDate: Date;
  paidDate?: Date;
}

export interface RiskAssessment {
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: RiskFactor[];
  mitigationRecommendations: string[];
}

export interface RiskFactor {
  factor: string;
  score: number;
  weight: number;
  description: string;
}

export interface RecommendedAction {
  action: 'approve' | 'reject' | 'request_additional_info' | 'manual_review';
  confidence: number;
  reasoning: string[];
  conditions?: string[];
}

export interface RequiredDocument {
  documentType: DocumentType;
  description: string;
  format: string[];
  maxSize: number;
  mandatory: boolean;
}

export interface ParticipantDeclaration {
  hasCompletedCourse: boolean;
  attendanceConfirmed: boolean;
  feePaidConfirmed: boolean;
  informationAccurate: boolean;
  consentToVerify: boolean;
  signedAt: Date;
  ipAddress: string;
}

export interface ProviderDeclaration {
  courseDeliveredAsPlanned: boolean;
  participantCompleted: boolean;
  certificateIssued: boolean;
  feeReceivedFromParticipant: boolean;
  declaredBy: string;
  position: string;
  signedAt: Date;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface BankDetails {
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  branchCode?: string;
  swift?: string;
}

export interface DocumentMetadata {
  originalName: string;
  category: string;
  tags: string[];
  description?: string;
  version: number;
  isEncrypted: boolean;
}

export interface ParticipantProfile {
  age: number;
  industry: string;
  jobRole: string;
  experience: number;
  education: EducationLevel;
  previousTrainingCount: number;
}

export interface CompanyProfile {
  industry: string;
  size: CompanySize;
  revenue: number;
  employeeCount: number;
  isLocalCompany: boolean;
}

export interface TrainingProvider {
  providerId: string;
  providerName: string;
  registrationNumber: string;
  accreditationStatus: string;
}

export interface FundingCategory {
  id: string;
  name: string;
  description: string;
}

export interface DisabilityStatus {
  hasDisability: boolean;
  disabilityType?: string[];
  accommodationRequired?: boolean;
  accommodationDetails?: string;
}

export interface SLATarget {
  stage: WorkflowStage;
  targetDuration: number;
  unit: 'hours' | 'days' | 'weeks';
  priority: 'high' | 'medium' | 'low';
}

export interface EscalationRule {
  trigger: 'time_exceeded' | 'amount_threshold' | 'risk_level';
  threshold: number;
  escalateTo: string[];
  notificationMethod: 'email' | 'sms' | 'system';
}

export interface NotificationLog {
  id: string;
  type: 'email' | 'sms' | 'push' | 'system';
  recipient: string;
  subject: string;
  content: string;
  sentAt: Date;
  deliveryStatus: 'sent' | 'delivered' | 'failed';
}

export interface DelegationRule {
  fromRole: string;
  toRole: string;
  conditions: string[];
  validFrom: Date;
  validTo: Date;
}

export interface AutoApprovalRule {
  conditions: string[];
  maxAmount?: number;
  applicableFundingSchemes?: string[];
}

export interface ApplicableRule {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  impact: number;
  description: string;
}

export interface RoundingInfo {
  method: 'up' | 'down' | 'nearest';
  precision: number;
  originalAmount: number;
  roundedAmount: number;
}

export interface PaymentMethod {
  method: 'bank_transfer' | 'cheque' | 'giro';
  details: BankDetails | {};
}

export interface ItemReconciliationStatus {
  status: 'matched' | 'mismatched' | 'missing' | 'duplicate';
  confidence: number;
}

export interface ResolutionStatus {
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ProcessingPerformanceMetrics {
  averageProcessingTime: number;
  slaCompliance: number;
  bottleneckStages: string[];
  efficiencyScore: number;
}

export interface ComplianceMetrics {
  complianceScore: number;
  violationCount: number;
  auditReadiness: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
  period: string;
}

export interface CoursePerformanceMetric {
  courseId: string;
  courseName: string;
  applicationCount: number;
  approvalRate: number;
  averageClaimAmount: number;
  completionRate: number;
}

export interface RiskIndicator {
  indicator: string;
  value: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'worsening';
}

export interface SchemeApprovalRate {
  schemeId: string;
  schemeName: string;
  approvalRate: number;
  applicationCount: number;
}

export interface ProviderApprovalRate {
  providerId: string;
  providerName: string;
  approvalRate: number;
  applicationCount: number;
}

export interface AmountRangeApprovalRate {
  range: string;
  approvalRate: number;
  applicationCount: number;
}

export interface MonthlyApprovalData {
  month: string;
  approvalRate: number;
  applicationCount: number;
}

export interface SchemeUtilization {
  schemeId: string;
  schemeName: string;
  budgetAllocated: number;
  budgetUtilized: number;
  utilizationRate: number;
}

export interface QuarterlyUtilization {
  quarter: string;
  budgetUtilized: number;
  utilizationRate: number;
}

export interface ComplianceReportType {
  type: 'monthly' | 'quarterly' | 'annual' | 'audit' | 'adhoc';
}

export interface ComplianceCheckType {
  type: 'regulatory' | 'internal' | 'external' | 'system';
}

export interface ComplianceViolation {
  violationId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedRecords: string[];
  detectedAt: Date;
  status: 'open' | 'investigating' | 'resolved';
}

export interface ComplianceRecommendation {
  recommendationId: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  implementationCost: number;
  timelineWeeks: number;
  expectedBenefit: string;
}

export interface CertificationStatus {
  isCertified: boolean;
  certificationBody?: string;
  certificationDate?: Date;
  expiryDate?: Date;
  certificationLevel?: string;
}

export interface AuditAction {
  action:
    | 'create'
    | 'read'
    | 'update'
    | 'delete'
    | 'approve'
    | 'reject'
    | 'submit'
    | 'cancel';
}

export interface AuditResource {
  type: 'claim' | 'eligibility' | 'payment' | 'document' | 'user' | 'system';
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'created' | 'updated' | 'deleted';
}

export interface SubmissionMethod {
  method: 'online_portal' | 'api' | 'email' | 'physical_submission';
  platform?: string;
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const EligibilityRequestSchema = z.object({
  participantId: z.string().min(1),
  courseId: z.string().min(1),
  fundingSchemeId: z.string().min(1),
  requestedAmount: z.number().positive(),
  currency: z.literal('SGD'),
  priority: z.enum(['high', 'medium', 'low']),
  requestedBy: z.string().min(1),
  requestedAt: z.date(),
});

export const ClaimSubmissionSchema = z.object({
  claimId: z.string().min(1),
  participantId: z.string().min(1),
  courseId: z.string().min(1),
  eligibilityId: z.string().min(1),
  fundingSchemeId: z.string().min(1),
  claimAmount: z.number().positive(),
  currency: z.literal('SGD'),
  submittedBy: z.string().min(1),
  submittedAt: z.date(),
});

export const SubsidyCalculationRequestSchema = z.object({
  participantId: z.string().min(1),
  courseId: z.string().min(1),
  courseFee: z.number().positive(),
  fundingSchemes: z.array(z.string().min(1)),
  calculationDate: z.date(),
  currency: z.literal('SGD'),
});

// ============================================================================
// WORKFLOW MANAGEMENT TYPES
// ============================================================================

export enum WorkflowStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ActionType {
  API_CALL = 'api_call',
  MANUAL_REVIEW = 'manual_review',
  VALIDATION = 'validation',
  CALCULATION = 'calculation',
  NOTIFICATION = 'notification',
  PAYMENT_PROCESSING = 'payment_processing',
  ERROR_HANDLING = 'error_handling',
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  isActive: boolean;
  steps: WorkflowStepDefinition[];
  triggers: WorkflowTrigger[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStepDefinition {
  id: string;
  name: string;
  type: 'automated' | 'manual';
  description?: string;
  assignedRole?: ApprovalLevel;
  action: WorkflowAction;
  rules?: WorkflowRule[];
  timeoutAction?: { nextStep: string };
  onError?: { nextStep: string };
  conditions?: string[];
}

export interface WorkflowAction {
  type: ActionType;
  endpoint?: string;
  timeout?: number;
  formFields?: string[];
  validationRules?: string[];
  calculations?: string[];
  recipients?: string[];
  template?: string;
  retryCount?: number;
  escalateAfterRetries?: boolean;
  paymentGateway?: string;
}

export interface WorkflowRule {
  condition: string;
  outcome: string;
  nextStep?: string;
  description?: string;
}

export interface WorkflowTrigger {
  type: 'api_request' | 'scheduled' | 'event_based';
  endpoint?: string;
  schedule?: string;
  eventType?: string;
  conditions: string[];
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  currentStep: string;
  contextData: any;
  history: WorkflowStepHistory[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  triggeredBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCompletion?: Date;
  error?: any;
  metrics: {
    stepsCompleted: number;
    totalSteps: number;
    processingTime: number;
    approvalTime: number;
  };
}

export interface WorkflowStepHistory {
  stepId: string;
  stepName: string;
  status: 'completed' | 'failed' | 'skipped';
  startTime: Date;
  endTime: Date;
  processingTime: number;
  result?: any;
  error?: string;
  assignedTo?: ApprovalLevel;
  comments?: string[];
}

export interface WorkflowApproval {
  id: string;
  workflowInstanceId: string;
  stepId: string;
  assignedTo: ApprovalLevel;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  createdAt: Date;
  dueDate: Date;
  submittedAt?: Date;
  submittedBy?: string;
  decision?: 'approved' | 'rejected' | 'escalate';
  comments?: string;
  formData: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}
