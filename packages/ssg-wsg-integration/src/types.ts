/**
 * SSG-WSG API Integration Types and Interfaces
 * Comprehensive type definitions for Singapore's SSG-WSG funding system integration
 */

import { z } from 'zod';

// ============================================================================
// CORE API TYPES
// ============================================================================

export interface ApiConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string[];
  environment: 'sandbox' | 'production';
  timeout: number;
  retryAttempts: number;
  rateLimitRpm: number;
  rateLimitRph: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  pagination?: PaginationInfo;
  meta?: ResponseMetadata;
  requestId: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ResponseMetadata {
  version: string;
  processingTime: number;
  rateLimitRemaining: number;
  rateLimitReset: Date;
}

// ============================================================================
// AUTHENTICATION & SECURITY
// ============================================================================

export interface OAuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  expiresAt: Date;
  scope: string[];
  issuedAt: Date;
}

export interface TokenValidation {
  isValid: boolean;
  expiresIn: number;
  needsRefresh: boolean;
  scopes: string[];
}

export interface SecurityHeaders {
  'X-API-Key'?: string;
  'X-Request-ID': string;
  'X-Client-Version': string;
  'X-Timestamp': string;
  'X-Signature'?: string;
}

// ============================================================================
// SSG FUNDING SCHEMES
// ============================================================================

export interface SSGFundingScheme {
  id: string;
  name: string;
  code: string;
  description: string;
  category: FundingCategory;
  eligibilityCriteria: EligibilityCriteria;
  fundingLimits: FundingLimits;
  supportedCourseTypes: CourseType[];
  applicationDeadlines: ApplicationDeadline[];
  requiredDocuments: RequiredDocument[];
  subsidyRates: SubsidyRate[];
  status: SchemeStatus;
  effectiveDate: Date;
  expiryDate?: Date;
  lastUpdated: Date;
}

export enum FundingCategory {
  INDIVIDUAL_SKILLS_DEVELOPMENT = 'individual_skills_development',
  ENTERPRISE_TRANSFORMATION = 'enterprise_transformation',
  SECTOR_TRANSFORMATION = 'sector_transformation',
  APPRENTICESHIP = 'apprenticeship',
  SKILLSFUTURE_CREDIT = 'skillsfuture_credit',
  SKILLSFUTURE_MID_CAREER = 'skillsfuture_mid_career',
}

export enum SchemeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

export interface EligibilityCriteria {
  citizenship: CitizenshipRequirement[];
  ageRange?: AgeRange;
  employmentStatus: EmploymentStatus[];
  industryRestrictions?: string[];
  salaryCapRequirement?: SalaryCapRequirement;
  educationLevel?: EducationLevel[];
  companySize?: CompanySize;
  companyAge?: number; // months
  priorFundingRestrictions?: PriorFundingRestriction[];
}

export enum CitizenshipRequirement {
  SINGAPORE_CITIZEN = 'singapore_citizen',
  PERMANENT_RESIDENT = 'permanent_resident',
  EMPLOYMENT_PASS = 'employment_pass',
  WORK_PERMIT = 'work_permit',
}

export interface AgeRange {
  minimum: number;
  maximum?: number;
}

export enum EmploymentStatus {
  EMPLOYED = 'employed',
  UNEMPLOYED = 'unemployed',
  SELF_EMPLOYED = 'self_employed',
  COMPANY_SPONSORED = 'company_sponsored',
}

export interface SalaryCapRequirement {
  maximum: number;
  currency: 'SGD';
  period: 'monthly' | 'annual';
}

export enum EducationLevel {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  POST_SECONDARY = 'post_secondary',
  TERTIARY = 'tertiary',
  GRADUATE = 'graduate',
  POST_GRADUATE = 'post_graduate',
}

export enum CompanySize {
  SME_SMALL = 'sme_small', // < 50 employees
  SME_MEDIUM = 'sme_medium', // 50-199 employees
  LARGE = 'large', // 200+ employees
}

export interface PriorFundingRestriction {
  schemeId: string;
  waitingPeriod: number; // months
  maxApplications: number;
  timeframe: number; // months
}

export interface FundingLimits {
  individual?: IndividualLimits;
  enterprise?: EnterpriseLimits;
  course?: CourseLimits;
}

export interface IndividualLimits {
  maxAmountPerCourse: number;
  maxAmountPerYear: number;
  maxAmountLifetime?: number;
  maxCoursesPerYear?: number;
  currency: 'SGD';
}

export interface EnterpriseLimits {
  maxAmountPerEmployee: number;
  maxAmountPerYear: number;
  maxEmployeesPerApplication?: number;
  currency: 'SGD';
}

export interface CourseLimits {
  maxFundableAmount: number;
  maxParticipants?: number;
  minParticipants?: number;
  currency: 'SGD';
}

export enum CourseType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  ONLINE = 'online',
  BLENDED = 'blended',
  WORKPLACE = 'workplace',
  MODULAR = 'modular',
}

export interface ApplicationDeadline {
  type: 'rolling' | 'fixed' | 'quarterly' | 'annual';
  dates?: Date[];
  cutoffDays?: number; // days before course start
  description: string;
}

export interface RequiredDocument {
  id: string;
  name: string;
  type: DocumentType;
  mandatory: boolean;
  description: string;
  format: string[];
  maxSize: number; // bytes
  validityPeriod?: number; // months
}

export enum DocumentType {
  IDENTITY = 'identity',
  EMPLOYMENT = 'employment',
  EDUCATION = 'education',
  FINANCIAL = 'financial',
  COMPANY = 'company',
  COURSE = 'course',
  SUPPORTING = 'supporting',
}

export interface SubsidyRate {
  participantProfile: ParticipantProfile;
  subsidyPercentage: number;
  maxSubsidyAmount?: number;
  conditions?: string[];
}

export interface ParticipantProfile {
  citizenship: CitizenshipRequirement;
  ageGroup?: string;
  employmentStatus: EmploymentStatus;
  salaryRange?: SalaryRange;
  companySize?: CompanySize;
  industryCode?: string;
}

export interface SalaryRange {
  minimum?: number;
  maximum?: number;
  currency: 'SGD';
}

// ============================================================================
// WSG COURSE REGISTRY
// ============================================================================

export interface WSGCourseRegistry {
  courses: WSGCourse[];
  providers: TrainingProvider[];
  qualifications: Qualification[];
  skillsFramework: SkillsFramework;
  lastSyncDate: Date;
  version: string;
}

export interface WSGCourse {
  id: string;
  title: string;
  code: string;
  description: string;
  provider: TrainingProvider;
  category: CourseCategory;
  subcategory: string;
  duration: CourseDuration;
  deliveryMode: DeliveryMode[];
  schedule: CourseSchedule[];
  fees: CourseFees;
  eligibleSchemes: string[]; // SSG scheme IDs
  qualifications: Qualification[];
  skillsOutcomes: SkillOutcome[];
  prerequisites: string[];
  targetAudience: TargetAudience;
  languageOfInstruction: Language[];
  accreditation: Accreditation[];
  status: CourseStatus;
  createdDate: Date;
  lastUpdated: Date;
  expiryDate?: Date;
}

export interface TrainingProvider {
  id: string;
  name: string;
  registrationNumber: string;
  type: ProviderType;
  contactInfo: ContactInfo;
  accreditations: Accreditation[];
  specializations: string[];
  ratings: ProviderRating;
  status: ProviderStatus;
  establishedDate: Date;
}

export enum ProviderType {
  PUBLIC_INSTITUTION = 'public_institution',
  PRIVATE_INSTITUTION = 'private_institution',
  CORPORATE_UNIVERSITY = 'corporate_university',
  INDEPENDENT_TRAINER = 'independent_trainer',
  ONLINE_PLATFORM = 'online_platform',
}

export interface ContactInfo {
  address: Address;
  phone: string[];
  email: string[];
  website?: string;
  socialMedia?: SocialMediaLinks;
}

export interface Address {
  street: string;
  unit?: string;
  building?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface SocialMediaLinks {
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface Accreditation {
  id: string;
  name: string;
  issuingBody: string;
  certificateNumber: string;
  issuedDate: Date;
  expiryDate?: Date;
  status: AccreditationStatus;
  scope: string[];
}

export enum AccreditationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
}

export interface ProviderRating {
  overall: number; // 1-5
  courseQuality: number;
  instructorQuality: number;
  facilities: number;
  support: number;
  valueForMoney: number;
  totalReviews: number;
  lastUpdated: Date;
}

export enum ProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  UNDER_REVIEW = 'under_review',
}

export enum CourseCategory {
  INFOCOMM_TECHNOLOGY = 'infocomm_technology',
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  ENGINEERING = 'engineering',
  LOGISTICS = 'logistics',
  RETAIL = 'retail',
  FOOD_SERVICES = 'food_services',
  MANUFACTURING = 'manufacturing',
  CONSTRUCTION = 'construction',
  PROFESSIONAL_SERVICES = 'professional_services',
  CREATIVE_INDUSTRIES = 'creative_industries',
  EDUCATION = 'education',
  GENERIC_SKILLS = 'generic_skills',
}

export interface CourseDuration {
  totalHours: number;
  weeks?: number;
  months?: number;
  selfPacedMaxDuration?: number; // months
}

export enum DeliveryMode {
  CLASSROOM = 'classroom',
  ONLINE = 'online',
  BLENDED = 'blended',
  VIRTUAL_CLASSROOM = 'virtual_classroom',
  ON_JOB_TRAINING = 'on_job_training',
  WORKPLACE_LEARNING = 'workplace_learning',
}

export interface CourseSchedule {
  id: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  timeSlots: TimeSlot[];
  location?: Location;
  maxParticipants: number;
  currentEnrollment: number;
  waitlistSize: number;
  status: ScheduleStatus;
}

export interface TimeSlot {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export interface Location {
  name: string;
  address: Address;
  roomNumber?: string;
  facilities: string[];
  accessibility: AccessibilityFeature[];
  coordinates?: Coordinates;
}

export interface AccessibilityFeature {
  type: AccessibilityType;
  description: string;
  available: boolean;
}

export enum AccessibilityType {
  WHEELCHAIR_ACCESS = 'wheelchair_access',
  HEARING_LOOP = 'hearing_loop',
  SIGN_LANGUAGE = 'sign_language',
  LARGE_PRINT = 'large_print',
  BRAILLE = 'braille',
  AUDIO_DESCRIPTION = 'audio_description',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum ScheduleStatus {
  OPEN = 'open',
  FULL = 'full',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
}

export interface CourseFees {
  standardFee: number;
  gstAmount: number;
  totalFee: number;
  currency: 'SGD';
  feeBreakdown: FeeComponent[];
  paymentOptions: PaymentOption[];
  refundPolicy: RefundPolicy;
}

export interface FeeComponent {
  name: string;
  amount: number;
  type: FeeType;
  mandatory: boolean;
  description?: string;
}

export enum FeeType {
  COURSE_FEE = 'course_fee',
  REGISTRATION_FEE = 'registration_fee',
  MATERIAL_FEE = 'material_fee',
  EXAMINATION_FEE = 'examination_fee',
  CERTIFICATION_FEE = 'certification_fee',
  FACILITY_FEE = 'facility_fee',
}

export interface PaymentOption {
  method: PaymentMethod;
  installments?: InstallmentPlan;
  processingFee?: number;
  availableFrom: Date;
  availableUntil?: Date;
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYNOW = 'paynow',
  CHEQUE = 'cheque',
  CASH = 'cash',
  COMPANY_BILLING = 'company_billing',
}

export interface InstallmentPlan {
  numberOfInstallments: number;
  frequency: InstallmentFrequency;
  firstPaymentAmount: number;
  subsequentPaymentAmount: number;
  interestRate?: number;
}

export enum InstallmentFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

export interface RefundPolicy {
  fullRefundDeadline: number; // days before course start
  partialRefundDeadline: number; // days before course start
  partialRefundPercentage: number;
  processingFee: number;
  conditions: string[];
}

export interface Qualification {
  id: string;
  name: string;
  type: QualificationType;
  level: QualificationLevel;
  issuingBody: string;
  description: string;
  creditPoints?: number;
  validityPeriod?: number; // months
  prerequisites: string[];
  pathwayOptions: PathwayOption[];
}

export enum QualificationType {
  CERTIFICATE = 'certificate',
  DIPLOMA = 'diploma',
  DEGREE = 'degree',
  PROFESSIONAL_CERTIFICATION = 'professional_certification',
  INDUSTRY_CERTIFICATION = 'industry_certification',
  MICRO_CREDENTIAL = 'micro_credential',
  DIGITAL_BADGE = 'digital_badge',
}

export enum QualificationLevel {
  FOUNDATIONAL = 'foundational',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  SPECIALIST = 'specialist',
}

export interface PathwayOption {
  nextQualification: string;
  creditTransfer?: number;
  additionalRequirements?: string[];
  estimatedDuration: number; // months
}

export interface SkillOutcome {
  skillId: string;
  skillName: string;
  competencyLevel: CompetencyLevel;
  assessmentMethod: AssessmentMethod[];
  learningOutcome: string;
}

export enum CompetencyLevel {
  AWARENESS = 'awareness',
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum AssessmentMethod {
  WRITTEN_EXAM = 'written_exam',
  PRACTICAL_EXAM = 'practical_exam',
  PROJECT_BASED = 'project_based',
  PORTFOLIO = 'portfolio',
  PRESENTATION = 'presentation',
  PEER_ASSESSMENT = 'peer_assessment',
  CONTINUOUS_ASSESSMENT = 'continuous_assessment',
}

export interface TargetAudience {
  jobRoles: string[];
  industries: string[];
  experienceLevel: ExperienceLevel[];
  educationLevel: EducationLevel[];
  description: string;
}

export enum ExperienceLevel {
  FRESH_GRADUATE = 'fresh_graduate',
  JUNIOR = 'junior', // 0-2 years
  INTERMEDIATE = 'intermediate', // 2-5 years
  SENIOR = 'senior', // 5-10 years
  EXPERT = 'expert', // 10+ years
  CAREER_SWITCHER = 'career_switcher',
}

export enum Language {
  ENGLISH = 'english',
  MANDARIN = 'mandarin',
  MALAY = 'malay',
  TAMIL = 'tamil',
  OTHER = 'other',
}

export enum CourseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_REVIEW = 'under_review',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

export interface SkillsFramework {
  sectors: SkillsSector[];
  jobRoles: JobRole[];
  skills: SkillDefinition[];
  competencyLevels: CompetencyLevel[];
  lastUpdated: Date;
  version: string;
}

export interface SkillsSector {
  id: string;
  name: string;
  description: string;
  subSectors: SubSector[];
  keyTrends: string[];
  emergingSkills: string[];
}

export interface SubSector {
  id: string;
  name: string;
  description: string;
  jobFamilies: JobFamily[];
}

export interface JobFamily {
  id: string;
  name: string;
  description: string;
  jobRoles: string[]; // JobRole IDs
}

export interface JobRole {
  id: string;
  name: string;
  alternativeNames: string[];
  description: string;
  sector: string;
  subSector: string;
  jobFamily: string;
  seniorityLevel: SeniorityLevel;
  requiredSkills: SkillRequirement[];
  optionalSkills: SkillRequirement[];
  careerPathways: CareerPathway[];
  salaryBenchmark?: SalaryBenchmark;
}

export enum SeniorityLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MIDDLE = 'middle',
  SENIOR = 'senior',
  LEAD = 'lead',
  DIRECTOR = 'director',
  EXECUTIVE = 'executive',
}

export interface SkillRequirement {
  skillId: string;
  proficiencyLevel: CompetencyLevel;
  importance: SkillImportance;
}

export enum SkillImportance {
  CRITICAL = 'critical',
  IMPORTANT = 'important',
  USEFUL = 'useful',
}

export interface CareerPathway {
  fromRole: string;
  toRole: string;
  pathwayType: PathwayType;
  estimatedDuration: number; // months
  requiredDevelopment: DevelopmentRequirement[];
}

export enum PathwayType {
  VERTICAL = 'vertical', // promotion
  LATERAL = 'lateral', // same level, different function
  FUNCTIONAL = 'functional', // different department/function
  SECTOR = 'sector', // different sector
}

export interface DevelopmentRequirement {
  type: DevelopmentType;
  description: string;
  courses?: string[]; // Course IDs
  duration?: number; // months
  priority: RequirementPriority;
}

export enum DevelopmentType {
  FORMAL_TRAINING = 'formal_training',
  ON_JOB_EXPERIENCE = 'on_job_experience',
  MENTORING = 'mentoring',
  PROJECT_WORK = 'project_work',
  CERTIFICATION = 'certification',
  SELF_STUDY = 'self_study',
}

export enum RequirementPriority {
  MANDATORY = 'mandatory',
  RECOMMENDED = 'recommended',
  OPTIONAL = 'optional',
}

export interface SalaryBenchmark {
  currency: 'SGD';
  ranges: SalaryRange[];
  lastUpdated: Date;
  source: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  keywords: string[];
  relatedSkills: string[];
  emergingTrend?: EmergingTrend;
}

export enum SkillCategory {
  TECHNICAL = 'technical',
  GENERIC = 'generic',
  LEADERSHIP = 'leadership',
  DIGITAL = 'digital',
  GREEN = 'green',
  EMERGING = 'emerging',
}

export interface EmergingTrend {
  trendName: string;
  timeline: string;
  impactLevel: ImpactLevel;
  description: string;
}

export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  TRANSFORMATIONAL = 'transformational',
}

// ============================================================================
// APPLICATION MANAGEMENT
// ============================================================================

export interface FundingApplication {
  id: string;
  applicationNumber: string;
  schemeId: string;
  applicationType: ApplicationType;
  applicant: Applicant;
  sponsor?: Sponsor;
  courses: ApplicationCourse[];
  participants: ApplicationParticipant[];
  totalAmount: number;
  requestedSubsidy: number;
  approvedSubsidy?: number;
  status: ApplicationStatus;
  submissionDate: Date;
  reviewDate?: Date;
  approvalDate?: Date;
  rejectionReason?: string;
  documents: ApplicationDocument[];
  workflow: WorkflowStep[];
  paymentSchedule?: PaymentSchedule[];
  complianceChecks: ComplianceCheck[];
  auditTrail: AuditEntry[];
  expiryDate?: Date;
}

export enum ApplicationType {
  INDIVIDUAL = 'individual',
  COMPANY_SPONSORED = 'company_sponsored',
  BATCH_APPLICATION = 'batch_application',
  BULK_APPLICATION = 'bulk_application',
}

export interface Applicant {
  type: ApplicantType;
  individual?: IndividualApplicant;
  company?: CompanyApplicant;
}

export enum ApplicantType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

export interface IndividualApplicant {
  nric: string;
  name: string;
  dateOfBirth: Date;
  citizenship: CitizenshipRequirement;
  gender: Gender;
  contactInfo: ContactInfo;
  employmentInfo: EmploymentInfo;
  educationInfo: EducationInfo;
  previousFunding: PreviousFunding[];
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHERS = 'others',
}

export interface EmploymentInfo {
  status: EmploymentStatus;
  company?: CompanyInfo;
  jobTitle?: string;
  salary?: number;
  startDate?: Date;
  industryCode?: string;
}

export interface CompanyInfo {
  name: string;
  registrationNumber: string;
  address: Address;
  size: CompanySize;
  industry: string;
  establishedDate: Date;
}

export interface EducationInfo {
  highestLevel: EducationLevel;
  qualifications: EducationQualification[];
}

export interface EducationQualification {
  level: EducationLevel;
  field: string;
  institution: string;
  graduationYear: number;
  grade?: string;
}

export interface PreviousFunding {
  schemeId: string;
  applicationId: string;
  amount: number;
  dateReceived: Date;
  status: FundingStatus;
}

export enum FundingStatus {
  APPROVED = 'approved',
  DISBURSED = 'disbursed',
  COMPLETED = 'completed',
  CLAWED_BACK = 'clawed_back',
}

export interface CompanyApplicant {
  name: string;
  registrationNumber: string;
  entityType: EntityType;
  address: Address;
  contactPerson: ContactPerson;
  businessInfo: BusinessInfo;
  financialInfo: FinancialInfo;
  employeeInfo: EmployeeInfo;
}

export enum EntityType {
  PRIVATE_LIMITED = 'private_limited',
  PUBLIC_LIMITED = 'public_limited',
  PARTNERSHIP = 'partnership',
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  NON_PROFIT = 'non_profit',
  GOVERNMENT = 'government',
}

export interface ContactPerson {
  name: string;
  designation: string;
  phone: string;
  email: string;
  nric?: string;
}

export interface BusinessInfo {
  industry: string;
  mainActivities: string[];
  businessDescription: string;
  incorporationDate: Date;
  website?: string;
  annualRevenue?: number;
  employeeCount: number;
}

export interface FinancialInfo {
  annualRevenue: number;
  profitMargin?: number;
  lastAuditedYear: number;
  auditorName?: string;
  creditRating?: CreditRating;
}

export enum CreditRating {
  AAA = 'AAA',
  AA = 'AA',
  A = 'A',
  BBB = 'BBB',
  BB = 'BB',
  B = 'B',
  CCC = 'CCC',
  CC = 'CC',
  C = 'C',
  D = 'D',
  UNRATED = 'unrated',
}

export interface EmployeeInfo {
  totalEmployees: number;
  singaporeEmployees: number;
  employeeBreakdown: EmployeeBreakdown[];
  averageSalary?: number;
  turnoverRate?: number;
}

export interface EmployeeBreakdown {
  category: EmployeeCategory;
  count: number;
  averageSalary?: number;
}

export enum EmployeeCategory {
  MANAGEMENT = 'management',
  PROFESSIONALS = 'professionals',
  EXECUTIVES = 'executives',
  TECHNICIANS = 'technicians',
  SUPPORT_STAFF = 'support_staff',
  FRESH_GRADUATES = 'fresh_graduates',
  FOREIGN_WORKERS = 'foreign_workers',
}

export interface Sponsor {
  type: SponsorType;
  company: CompanyApplicant;
  relationship: SponsorRelationship;
  sponsorshipDetails: SponsorshipDetails;
}

export enum SponsorType {
  EMPLOYER = 'employer',
  TRAINING_PARTNER = 'training_partner',
  PARENT_COMPANY = 'parent_company',
  INDUSTRY_ASSOCIATION = 'industry_association',
}

export enum SponsorRelationship {
  EMPLOYEE = 'employee',
  CONTRACT_WORKER = 'contract_worker',
  BUSINESS_PARTNER = 'business_partner',
  MEMBER = 'member',
  SUBSIDIARY = 'subsidiary',
}

export interface SponsorshipDetails {
  sponsorshipPercentage: number;
  sponsorshipAmount: number;
  paymentResponsibility: PaymentResponsibility;
  approvalRequired: boolean;
  sponsorshipAgreement?: string; // document reference
}

export enum PaymentResponsibility {
  FULL_SPONSORSHIP = 'full_sponsorship',
  PARTIAL_SPONSORSHIP = 'partial_sponsorship',
  ADVANCE_PAYMENT = 'advance_payment',
  REIMBURSEMENT = 'reimbursement',
}

export interface ApplicationCourse {
  courseId: string;
  scheduleId: string;
  courseName: string;
  provider: string;
  startDate: Date;
  endDate: Date;
  totalFee: number;
  requestedSubsidy: number;
  participantCount: number;
  justification?: string;
}

export interface ApplicationParticipant {
  id: string;
  nric: string;
  name: string;
  designation?: string;
  department?: string;
  courseIds: string[];
  individualSubsidy: number;
  eligibilityVerified: boolean;
  attendanceCommitment: AttendanceCommitment;
  postCourseCommitment?: PostCourseCommitment;
}

export interface AttendanceCommitment {
  minimumAttendance: number; // percentage
  makeUpArrangements?: string;
  penaltyClause?: string;
}

export interface PostCourseCommitment {
  serviceBond?: ServiceBond;
  performanceTargets?: PerformanceTarget[];
  reportingRequirements?: ReportingRequirement[];
}

export interface ServiceBond {
  duration: number; // months
  penaltyAmount?: number;
  exemptionConditions?: string[];
}

export interface PerformanceTarget {
  metric: string;
  target: string;
  measurementPeriod: number; // months
  verificationMethod: string;
}

export interface ReportingRequirement {
  type: ReportType;
  frequency: ReportingFrequency;
  dueDate: number; // days after course completion
  format: string;
}

export enum ReportType {
  COMPLETION_REPORT = 'completion_report',
  IMPACT_ASSESSMENT = 'impact_assessment',
  UTILIZATION_REPORT = 'utilization_report',
  ROI_ANALYSIS = 'roi_analysis',
}

export enum ReportingFrequency {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  PENDING_DOCUMENTS = 'pending_documents',
  APPROVED = 'approved',
  CONDITIONALLY_APPROVED = 'conditionally_approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  format: string;
  uploadDate: Date;
  uploadedBy: string;
  status: DocumentStatus;
  verificationStatus: VerificationStatus;
  expiryDate?: Date;
  metadata: DocumentMetadata;
}

export enum DocumentStatus {
  UPLOADED = 'uploaded',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  REPLACED = 'replaced',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  NOT_REQUIRED = 'not_required',
}

export interface DocumentMetadata {
  checksum: string;
  version: number;
  sourceSystem?: string;
  automatedChecks: AutomatedCheck[];
  manualReview?: ManualReview;
}

export interface AutomatedCheck {
  type: CheckType;
  status: CheckStatus;
  result?: any;
  timestamp: Date;
}

export enum CheckType {
  VIRUS_SCAN = 'virus_scan',
  FORMAT_VALIDATION = 'format_validation',
  CONTENT_EXTRACTION = 'content_extraction',
  OCR_PROCESSING = 'ocr_processing',
  DATA_VALIDATION = 'data_validation',
}

export enum CheckStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  WARNING = 'warning',
  SKIPPED = 'skipped',
}

export interface ManualReview {
  reviewerId: string;
  reviewDate: Date;
  status: ReviewStatus;
  comments?: string;
  recommendedAction?: ReviewAction;
}

export enum ReviewStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_CLARIFICATION = 'requires_clarification',
  PENDING = 'pending',
}

export enum ReviewAction {
  APPROVE_APPLICATION = 'approve_application',
  REJECT_APPLICATION = 'reject_application',
  REQUEST_ADDITIONAL_DOCUMENTS = 'request_additional_documents',
  SCHEDULE_INTERVIEW = 'schedule_interview',
  CONDITIONAL_APPROVAL = 'conditional_approval',
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: StepStatus;
  assignedTo?: string;
  assignedDate?: Date;
  completedDate?: Date;
  notes?: string;
  requiredActions: RequiredAction[];
  dependencies: string[]; // other step IDs
  estimatedDuration: number; // hours
  actualDuration?: number; // hours
}

export enum StepStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  SKIPPED = 'skipped',
}

export interface RequiredAction {
  action: WorkflowAction;
  deadline?: Date;
  responsible: string;
  status: ActionStatus;
}

export enum WorkflowAction {
  DOCUMENT_REVIEW = 'document_review',
  ELIGIBILITY_CHECK = 'eligibility_check',
  FINANCIAL_VERIFICATION = 'financial_verification',
  APPROVAL_DECISION = 'approval_decision',
  NOTIFICATION_SEND = 'notification_send',
  PAYMENT_PROCESS = 'payment_process',
}

export enum ActionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

export interface PaymentSchedule {
  id: string;
  amount: number;
  dueDate: Date;
  type: PaymentType;
  status: PaymentStatus;
  reference?: string;
  processedDate?: Date;
  failureReason?: string;
}

export enum PaymentType {
  ADVANCE_PAYMENT = 'advance_payment',
  MILESTONE_PAYMENT = 'milestone_payment',
  COMPLETION_PAYMENT = 'completion_payment',
  REIMBURSEMENT = 'reimbursement',
}

export enum PaymentStatus {
  SCHEDULED = 'scheduled',
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ComplianceCheck {
  id: string;
  type: ComplianceType;
  status: ComplianceStatus;
  checkedDate: Date;
  checkedBy: string;
  result: ComplianceResult;
  notes?: string;
  remedialAction?: RemedialAction;
}

export enum ComplianceType {
  ANTI_MONEY_LAUNDERING = 'anti_money_laundering',
  SANCTIONS_SCREENING = 'sanctions_screening',
  ELIGIBILITY_VERIFICATION = 'eligibility_verification',
  DUPLICATE_CHECK = 'duplicate_check',
  BLACKLIST_CHECK = 'blacklist_check',
  FINANCIAL_THRESHOLD = 'financial_threshold',
}

export enum ComplianceStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  REQUIRES_REVIEW = 'requires_review',
  EXEMPTED = 'exempted',
}

export interface ComplianceResult {
  score?: number;
  riskLevel: RiskLevel;
  flags: ComplianceFlag[];
  recommendations: string[];
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ComplianceFlag {
  type: FlagType;
  severity: FlagSeverity;
  description: string;
  reference?: string;
}

export enum FlagType {
  IDENTITY_MISMATCH = 'identity_mismatch',
  SUSPICIOUS_PATTERN = 'suspicious_pattern',
  INCOMPLETE_INFORMATION = 'incomplete_information',
  CONFLICTING_DATA = 'conflicting_data',
  REGULATORY_CONCERN = 'regulatory_concern',
}

export enum FlagSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface RemedialAction {
  action: RemedialActionType;
  deadline: Date;
  responsible: string;
  status: ActionStatus;
  evidence?: string[];
}

export enum RemedialActionType {
  PROVIDE_DOCUMENTATION = 'provide_documentation',
  CLARIFY_INFORMATION = 'clarify_information',
  MANAGEMENT_REVIEW = 'management_review',
  LEGAL_CONSULTATION = 'legal_consultation',
  REGULATORY_REPORTING = 'regulatory_reporting',
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes?: FieldChange[];
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  SUBMIT = 'submit',
  WITHDRAW = 'withdraw',
  EXPORT = 'export',
  IMPORT = 'import',
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeReason?: string;
}

// ============================================================================
// CACHING & PERFORMANCE
// ============================================================================

export interface CacheConfig {
  defaultTTL: number; // seconds
  maxTTL: number; // seconds
  keyPrefix: string;
  namespace: string;
  compression: boolean;
  serialization: SerializationType;
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

export enum SerializationType {
  JSON = 'json',
  MSGPACK = 'msgpack',
  PROTOBUF = 'protobuf',
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  size: number; // bytes
  tags: string[];
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  averageResponseTime: number;
  memoryUsage: number;
  keyCount: number;
  expiredKeys: number;
  evictedKeys: number;
}

export interface CacheInvalidationRule {
  pattern: string;
  event: InvalidationEvent;
  delay?: number; // milliseconds
  cascade: boolean;
}

export enum InvalidationEvent {
  DATA_UPDATE = 'data_update',
  SCHEMA_CHANGE = 'schema_change',
  TIME_BASED = 'time_based',
  MANUAL = 'manual',
  DEPENDENCY_CHANGE = 'dependency_change',
}

// ============================================================================
// QUEUE & BACKGROUND PROCESSING
// ============================================================================

export interface QueueConfig {
  name: string;
  concurrency: number;
  maxRetries: number;
  backoffStrategy: BackoffStrategy;
  priority: QueuePriority;
  delayedProcessing: boolean;
  rateLimiting: QueueRateLimit;
  deadLetterQueue: boolean;
}

export enum BackoffStrategy {
  FIXED = 'fixed',
  EXPONENTIAL = 'exponential',
  LINEAR = 'linear',
  POLYNOMIAL = 'polynomial',
}

export enum QueuePriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 15,
  IMMEDIATE = 20,
}

export interface QueueRateLimit {
  max: number;
  duration: number; // milliseconds
  skipSuccessful: boolean;
  skipFailed: boolean;
}

export interface QueueJob<T = any> {
  id: string;
  type: JobType;
  data: T;
  options: JobOptions;
  status: JobStatus;
  progress: number; // 0-100
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  attempts: number;
  result?: any;
  error?: JobError;
  logs: JobLog[];
}

export enum JobType {
  DATA_SYNC = 'data_sync',
  WEBHOOK_DELIVERY = 'webhook_delivery',
  REPORT_GENERATION = 'report_generation',
  NOTIFICATION_SEND = 'notification_send',
  FILE_PROCESSING = 'file_processing',
  BATCH_UPDATE = 'batch_update',
  CLEANUP = 'cleanup',
  BACKUP = 'backup',
}

export interface JobOptions {
  priority: QueuePriority;
  delay?: number; // milliseconds
  repeat?: RepeatOptions;
  timeout?: number; // milliseconds
  removeOnComplete?: number;
  removeOnFail?: number;
  maxRetries?: number;
  backoff?: BackoffOptions;
}

export interface RepeatOptions {
  cron?: string;
  every?: number; // milliseconds
  limit?: number;
  endDate?: Date;
  tz?: string;
}

export interface BackoffOptions {
  type: BackoffStrategy;
  delay: number; // milliseconds
  settings?: Record<string, any>;
}

export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused',
  STUCK = 'stuck',
}

export interface JobError {
  name: string;
  message: string;
  stack: string;
  data?: any;
  isRetryable: boolean;
}

export interface JobLog {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
}

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// ============================================================================
// WEBHOOK SYSTEM
// ============================================================================

export interface WebhookConfig {
  url: string;
  secret: string;
  events: WebhookEvent[];
  retryPolicy: WebhookRetryPolicy;
  timeout: number; // milliseconds
  headers: Record<string, string>;
  active: boolean;
  createdAt: Date;
  lastDelivery?: Date;
  successfulDeliveries: number;
  failedDeliveries: number;
}

export enum WebhookEvent {
  APPLICATION_SUBMITTED = 'application.submitted',
  APPLICATION_APPROVED = 'application.approved',
  APPLICATION_REJECTED = 'application.rejected',
  PAYMENT_PROCESSED = 'payment.processed',
  COURSE_COMPLETED = 'course.completed',
  DOCUMENT_UPLOADED = 'document.uploaded',
  COMPLIANCE_FAILED = 'compliance.failed',
  SCHEME_UPDATED = 'scheme.updated',
  PARTICIPANT_ENROLLED = 'participant.enrolled',
}

export interface WebhookRetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  retryableStatusCodes: number[];
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: Date;
  data: any;
  metadata: WebhookMetadata;
}

export interface WebhookMetadata {
  id: string;
  version: string;
  source: string;
  correlationId?: string;
  retryCount?: number;
  signature: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  status: DeliveryStatus;
  httpStatus?: number;
  response?: string;
  error?: string;
  attemptCount: number;
  sentAt: Date;
  responseAt?: Date;
  nextRetryAt?: Date;
}

export enum DeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRYING = 'retrying',
  ABANDONED = 'abandoned',
}

// ============================================================================
// MONITORING & HEALTH
// ============================================================================

export interface HealthCheck {
  service: string;
  status: HealthStatus;
  timestamp: Date;
  responseTime: number; // milliseconds
  details: HealthDetails;
  dependencies: DependencyHealth[];
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

export interface HealthDetails {
  version: string;
  uptime: number; // seconds
  memoryUsage: MemoryUsage;
  cpuUsage: number; // percentage
  diskUsage: DiskUsage;
  activeConnections: number;
  errors: ErrorSummary[];
}

export interface MemoryUsage {
  used: number; // bytes
  total: number; // bytes
  percentage: number;
}

export interface DiskUsage {
  used: number; // bytes
  available: number; // bytes
  percentage: number;
}

export interface DependencyHealth {
  name: string;
  type: DependencyType;
  status: HealthStatus;
  responseTime: number; // milliseconds
  lastChecked: Date;
  error?: string;
}

export enum DependencyType {
  DATABASE = 'database',
  CACHE = 'cache',
  QUEUE = 'queue',
  API = 'api',
  FILE_SYSTEM = 'file_system',
  EXTERNAL_SERVICE = 'external_service',
}

export interface ErrorSummary {
  type: string;
  count: number;
  lastOccurrence: Date;
  sampleMessage: string;
}

export interface PerformanceMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughput: number;
  timestamp: Date;
  period: number; // seconds
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: AlertCondition;
  threshold: number;
  duration: number; // seconds
  severity: AlertSeverity;
  enabled: boolean;
  channels: AlertChannel[];
  suppression: AlertSuppression;
}

export interface AlertCondition {
  operator: ComparisonOperator;
  aggregation: AggregationType;
  timeWindow: number; // seconds
}

export enum ComparisonOperator {
  GREATER_THAN = 'gt',
  GREATER_THAN_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_EQUAL = 'lte',
  EQUAL = 'eq',
  NOT_EQUAL = 'ne',
}

export enum AggregationType {
  AVERAGE = 'average',
  SUM = 'sum',
  MIN = 'min',
  MAX = 'max',
  COUNT = 'count',
  PERCENTILE = 'percentile',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AlertChannel {
  type: ChannelType;
  config: ChannelConfig;
  enabled: boolean;
}

export enum ChannelType {
  EMAIL = 'email',
  SMS = 'sms',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  PAGERDUTY = 'pagerduty',
}

export interface ChannelConfig {
  recipients?: string[];
  webhook?: string;
  template?: string;
  customFields?: Record<string, any>;
}

export interface AlertSuppression {
  cooldown: number; // seconds
  maxAlertsPerHour: number;
  maintenanceWindows: MaintenanceWindow[];
}

export interface MaintenanceWindow {
  start: Date;
  end: Date;
  reason: string;
  affectedServices: string[];
}

// ============================================================================
// VALIDATION SCHEMAS (ZOD)
// ============================================================================

// API Configuration Schema
export const ApiConfigSchema = z.object({
  baseUrl: z.string().url(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  scope: z.array(z.string()),
  environment: z.enum(['sandbox', 'production']),
  timeout: z.number().positive(),
  retryAttempts: z.number().min(0),
  rateLimitRpm: z.number().positive(),
  rateLimitRph: z.number().positive(),
});

// OAuth Token Schema
export const OAuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number(),
  expiresAt: z.date(),
  scope: z.array(z.string()),
  issuedAt: z.date(),
});

// Funding Application Schema
export const FundingApplicationSchema = z.object({
  id: z.string().uuid(),
  applicationNumber: z.string(),
  schemeId: z.string(),
  applicationType: z.nativeEnum(ApplicationType),
  totalAmount: z.number().positive(),
  requestedSubsidy: z.number().positive(),
  status: z.nativeEnum(ApplicationStatus),
  submissionDate: z.date(),
  expiryDate: z.date().optional(),
});

// Course Schema
export const WSGCourseSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  code: z.string(),
  description: z.string(),
  category: z.nativeEnum(CourseCategory),
  duration: z.object({
    totalHours: z.number().positive(),
    weeks: z.number().positive().optional(),
    months: z.number().positive().optional(),
  }),
  fees: z.object({
    standardFee: z.number().positive(),
    gstAmount: z.number().min(0),
    totalFee: z.number().positive(),
    currency: z.literal('SGD'),
  }),
  status: z.nativeEnum(CourseStatus),
});

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type Timestamp = string; // ISO 8601 format

export type Currency = 'SGD';

export type Percentage = number; // 0-100

export type UUID = string;

export type NRIC = string; // Singapore NRIC format

export type UEN = string; // Singapore Unique Entity Number

// ============================================================================
// API RESPONSE WRAPPER TYPES
// ============================================================================

export type SingleResponse<T> = ApiResponse<T>;

export type ListResponse<T> = ApiResponse<T[]>;

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  pagination: Required<PaginationInfo>;
};

export type ErrorResponse = ApiResponse<null> & {
  success: false;
  errors: Required<ApiError[]>;
};

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface SystemEvent {
  id: string;
  type: SystemEventType;
  source: string;
  data: any;
  timestamp: Date;
  correlationId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export enum SystemEventType {
  USER_ACTION = 'user_action',
  SYSTEM_ACTION = 'system_action',
  INTEGRATION_EVENT = 'integration_event',
  ERROR_EVENT = 'error_event',
  SECURITY_EVENT = 'security_event',
  PERFORMANCE_EVENT = 'performance_event',
}
