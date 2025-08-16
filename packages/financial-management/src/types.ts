// ============================================================================
// FINANCIAL MANAGEMENT TYPES - COMPREHENSIVE SYSTEM
// ============================================================================

import { Decimal } from 'decimal.js';

// UUID Type for type safety
export interface UUID extends String {
  readonly _brand: unique symbol;
}

export const createUUID = (id: string): UUID => id as unknown as UUID;

// ============================================================================
// CORE FINANCIAL ENUMS
// ============================================================================

export enum Currency {
  SGD = 'SGD',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  AUD = 'AUD',
  CAD = 'CAD',
  CHF = 'CHF',
  CNY = 'CNY',
  HKD = 'HKD',
  MYR = 'MYR',
  THB = 'THB',
  INR = 'INR',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
  ACCRUAL = 'accrual',
  PREPAYMENT = 'prepayment',
}

export enum TransactionStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSED = 'processed',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  CASH = 'cash',
  DIGITAL_WALLET = 'digital_wallet',
  CORPORATE_ACCOUNT = 'corporate_account',
  SSG_FUNDING = 'ssg_funding',
  GOVERNMENT_GRANT = 'government_grant',
}

export enum PaymentGateway {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  SQUARE = 'square',
  ADYEN = 'adyen',
  RAZORPAY = 'razorpay',
  PAYNOW = 'paynow',
  NETS = 'nets',
  DBS_PAYLAH = 'dbs_paylah',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum BudgetStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  FROZEN = 'frozen',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export enum FundingSource {
  SELF_FUNDED = 'self_funded',
  SSG_ENHANCED = 'ssg_enhanced',
  SSG_COURSE_FEE_GRANT = 'ssg_course_fee_grant',
  SSG_ABSENTEE_PAYROLL = 'ssg_absentee_payroll',
  SSG_WORKFARE = 'ssg_workfare',
  COMPANY_BUDGET = 'company_budget',
  GOVERNMENT_GRANT = 'government_grant',
  THIRD_PARTY = 'third_party',
}

export enum CostCategory {
  COURSE_FEES = 'course_fees',
  INSTRUCTOR_FEES = 'instructor_fees',
  MATERIALS = 'materials',
  VENUE_RENTAL = 'venue_rental',
  EQUIPMENT = 'equipment',
  CATERING = 'catering',
  TRANSPORTATION = 'transportation',
  ACCOMMODATION = 'accommodation',
  CERTIFICATION = 'certification',
  ADMINISTRATION = 'administration',
  TECHNOLOGY = 'technology',
  MARKETING = 'marketing',
  OVERHEAD = 'overhead',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_REVIEW = 'requires_review',
  ESCALATED = 'escalated',
}

export enum ReportType {
  FINANCIAL_SUMMARY = 'financial_summary',
  BUDGET_VARIANCE = 'budget_variance',
  ROI_ANALYSIS = 'roi_analysis',
  COST_BREAKDOWN = 'cost_breakdown',
  REVENUE_ANALYSIS = 'revenue_analysis',
  SSG_FUNDING_REPORT = 'ssg_funding_report',
  COMPLIANCE_REPORT = 'compliance_report',
  CASH_FLOW = 'cash_flow',
  PROFIT_LOSS = 'profit_loss',
  FORECASTING = 'forecasting',
}

// ============================================================================
// MONEY AND CALCULATION TYPES
// ============================================================================

export interface Money {
  amount: Decimal;
  currency: Currency;
}

export interface MoneyRange {
  min: Money;
  max: Money;
}

export interface CurrencyRate {
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: Decimal;
  effectiveDate: Date;
  source: string;
}

export interface FinancialCalculation {
  grossAmount: Money;
  discounts: Money[];
  taxes: Money[];
  netAmount: Money;
  totalDiscount: Money;
  totalTax: Money;
  calculatedAt: Date;
}

// ============================================================================
// BUDGET MANAGEMENT
// ============================================================================

export interface Budget {
  id: UUID;
  name: string;
  description?: string;
  type: BudgetType;
  status: BudgetStatus;
  organizationId: UUID;
  departmentId?: UUID;
  trainingProgramId?: UUID;
  fiscalYear: number;
  startDate: Date;
  endDate: Date;
  totalAllocated: Money;
  totalCommitted: Money;
  totalSpent: Money;
  totalRemaining: Money;
  categories: BudgetCategory[];
  approvers: BudgetApprover[];
  scenarios: BudgetScenario[];
  revisions: BudgetRevision[];
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
  updatedBy: UUID;
}

export enum BudgetType {
  ANNUAL = 'annual',
  QUARTERLY = 'quarterly',
  PROJECT = 'project',
  DEPARTMENT = 'department',
  COURSE = 'course',
  OPERATIONAL = 'operational',
  CAPITAL = 'capital',
}

export interface BudgetCategory {
  id: UUID;
  category: CostCategory;
  name: string;
  description?: string;
  allocated: Money;
  committed: Money;
  spent: Money;
  remaining: Money;
  utilizationPercentage: number;
  subcategories: BudgetSubcategory[];
  approvalRequired: boolean;
  approvalThreshold?: Money;
}

export interface BudgetSubcategory {
  id: UUID;
  name: string;
  allocated: Money;
  spent: Money;
  remaining: Money;
}

export interface BudgetApprover {
  userId: UUID;
  role: string;
  approvalLevel: number;
  maxApprovalAmount: Money;
  departments: string[];
  categories: CostCategory[];
}

export interface BudgetScenario {
  id: UUID;
  name: string;
  description: string;
  type: ScenarioType;
  assumptions: ScenarioAssumption[];
  projections: BudgetProjection[];
  confidenceLevel: number;
  createdAt: Date;
  createdBy: UUID;
}

export enum ScenarioType {
  OPTIMISTIC = 'optimistic',
  REALISTIC = 'realistic',
  PESSIMISTIC = 'pessimistic',
  CUSTOM = 'custom',
}

export interface ScenarioAssumption {
  parameter: string;
  baseValue: number;
  adjustmentPercentage: number;
  rationale: string;
}

export interface BudgetProjection {
  category: CostCategory;
  projected: Money;
  variance: Money;
  probability: number;
  factors: ProjectionFactor[];
}

export interface ProjectionFactor {
  name: string;
  impact: number; // -100 to 100
  confidence: number; // 0 to 100
  description: string;
}

export interface BudgetRevision {
  id: UUID;
  revisionNumber: number;
  reason: string;
  changes: BudgetChange[];
  approvedBy: UUID;
  approvedAt: Date;
  effectiveDate: Date;
}

export interface BudgetChange {
  category: CostCategory;
  subcategory?: string;
  previousAmount: Money;
  newAmount: Money;
  variance: Money;
  reason: string;
}

// ============================================================================
// COST TRACKING
// ============================================================================

export enum CostType {
  DIRECT = 'direct',
  INDIRECT = 'indirect',
  FIXED = 'fixed',
  VARIABLE = 'variable',
  OVERHEAD = 'overhead',
  ALLOCATION = 'allocation',
}

export enum CostStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSED = 'processed',
  ALLOCATED = 'allocated',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export interface CostRecord {
  id: UUID;
  description: string;
  category: CostCategory;
  type: CostType;
  amount: Money;
  status: CostStatus;
  organizationId: UUID;
  departmentId?: UUID;
  courseId?: UUID;
  participantId?: UUID;
  resourceId?: UUID;
  vendorId?: UUID;
  invoiceNumber?: string;
  referenceNumber?: string;
  incurredDate: Date;
  approvedDate?: Date;
  approvedBy?: UUID;
  costCenterId?: UUID;
  projectId?: UUID;
  allocations: CostAllocation[];
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
  updatedBy: UUID;
}

export interface ParticipantCost {
  id: UUID;
  participantId: UUID;
  description: string;
  category: CostCategory;
  totalCost: Money;
  reimbursableAmount: Money;
  courseId?: UUID;
  sessionId?: UUID;
  incurredDate: Date;
  breakdown: CostBreakdown[];
  isReimbursable: boolean;
  reimbursementRate?: number;
  createdAt: Date;
  createdBy: UUID;
}

export interface CourseCost {
  id: UUID;
  courseId: UUID;
  description: string;
  category: CostCategory;
  type: CostType;
  totalCost: Money;
  perParticipantCost?: Money;
  fixedCost: Money;
  variableCost: Money;
  participantAllocations: Array<{
    participantId: UUID;
    amount: Money;
    method: AllocationMethod;
  }>;
  costDrivers: CostDriver[];
  incurredDate: Date;
  createdAt: Date;
  createdBy: UUID;
}

export interface ResourceCost {
  id: UUID;
  resourceId: UUID;
  description: string;
  category: CostCategory;
  unitCost: Money;
  quantity: number;
  totalCost: Money;
  vendor?: string;
  purchaseDate: Date;
  usageStartDate?: Date;
  usageEndDate?: Date;
  depreciationMethod: 'straight_line' | 'declining_balance';
  depreciationRate?: number;
  usefulLife?: number;
  allocatedCourses: UUID[];
  utilizationRate: number;
  createdAt: Date;
  createdBy: UUID;
}

export interface CostCenter {
  id: UUID;
  name: string;
  description?: string;
  organizationId: UUID;
  parentCostCenterId?: UUID;
  totalBudget: Money;
  totalAllocated: Money;
  costCategories: CostCategory[];
  managers: UUID[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostDriver {
  name: string;
  type: 'quantity' | 'time' | 'complexity' | 'resource_usage';
  impact: number; // percentage impact on cost
  measurement: string;
  description?: string;
}

export interface CostAnalysis {
  period: { start: Date; end: Date };
  totalCost: Money;
  averageCost: Money;
  transactionCount: number;
  breakdown: CostBreakdown[];
  trends: CostTrend[];
  comparisons: CostComparison[];
  topCategories: CostBreakdown[];
  costEfficiencyMetrics: Record<string, number>;
  generatedAt: Date;
}

export interface CostBreakdown {
  label: string;
  amount: Money;
  count: number;
  percentage: number;
}

export interface CostTrend {
  period: string;
  amount: Money;
  changeFromPrevious: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
}

export interface CostComparison {
  label: string;
  currentPeriod: Money;
  previousPeriod: Money;
  variance: Money;
  variancePercentage: number;
}

export interface CostParticipant {
  participantId: UUID;
  allocation: CostAllocation;
  amount: Money;
  percentage: number;
}

export interface CostAllocation {
  id: UUID;
  costId: UUID;
  costCenterId: UUID;
  amount: Money;
  method: AllocationMethod;
  allocationBasis?: string;
  percentage: number;
  createdAt: Date;
}

export enum AllocationMethod {
  EQUAL_SPLIT = 'equal_split',
  PROPORTIONAL = 'proportional',
  ACTIVITY_BASED = 'activity_based',
  TIME_BASED = 'time_based',
  USAGE_BASED = 'usage_based',
  CUSTOM = 'custom',
  DIRECT = 'direct',
  REALLOCATION = 'reallocation',
}

export enum AllocationBasis {
  PARTICIPANT_COUNT = 'participant_count',
  COURSE_HOURS = 'course_hours',
  COURSE_DAYS = 'course_days',
  RESOURCE_USAGE = 'resource_usage',
  COMPLEXITY_FACTOR = 'complexity_factor',
  MARKET_RATE = 'market_rate',
}

export interface CostResource {
  resourceId: UUID;
  resourceType: ResourceType;
  name: string;
  unitCost: Money;
  quantity: number;
  totalCost: Money;
  utilizationRate: number;
}

export enum ResourceType {
  INSTRUCTOR = 'instructor',
  VENUE = 'venue',
  EQUIPMENT = 'equipment',
  MATERIAL = 'material',
  SOFTWARE = 'software',
  CATERING = 'catering',
  TRANSPORTATION = 'transportation',
}

export interface CostApproval {
  id: UUID;
  approverId: UUID;
  approverName: string;
  level: number;
  status: ApprovalStatus;
  amount: Money;
  comments?: string;
  approvedAt?: Date;
  escalatedTo?: UUID;
}

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

export interface Invoice {
  id: UUID;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  organizationId: UUID;
  customerId: UUID;
  customerInfo: CustomerInfo;
  billingAddress: Address;
  shippingAddress?: Address;
  lineItems: InvoiceLineItem[];
  subtotal: Money;
  discounts: InvoiceDiscount[];
  taxes: InvoiceTax[];
  total: Money;
  terms: PaymentTerms;
  dueDate: Date;
  paymentHistory: PaymentRecord[];
  remainingBalance: Money;
  documents: InvoiceDocument[];
  notes: InvoiceNote[];
  tags: string[];
  metadata: Record<string, any>;
  issuedAt: Date;
  sentAt?: Date;
  viewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
}

export enum InvoiceType {
  STANDARD = 'standard',
  PROFORMA = 'proforma',
  CREDIT_NOTE = 'credit_note',
  DEBIT_NOTE = 'debit_note',
  RECURRING = 'recurring',
  MILESTONE = 'milestone',
}

export interface CustomerInfo {
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  taxId?: string;
  registrationNumber?: string;
  contactPerson?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface InvoiceLineItem {
  id: UUID;
  type: LineItemType;
  description: string;
  courseId?: UUID;
  participantId?: UUID;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
  taxRate: number;
  taxAmount: Money;
  discountRate: number;
  discountAmount: Money;
  netAmount: Money;
  fundingSource?: FundingSource;
  ssgClaimable: boolean;
  metadata: Record<string, any>;
}

export enum LineItemType {
  COURSE_FEE = 'course_fee',
  REGISTRATION_FEE = 'registration_fee',
  MATERIAL_FEE = 'material_fee',
  EXAMINATION_FEE = 'examination_fee',
  CERTIFICATION_FEE = 'certification_fee',
  LATE_FEE = 'late_fee',
  CANCELLATION_FEE = 'cancellation_fee',
  REFUND = 'refund',
  DISCOUNT = 'discount',
  OTHER = 'other',
}

export interface InvoiceDiscount {
  id: UUID;
  type: DiscountType;
  name: string;
  amount?: Money;
  percentage?: number;
  appliedTo: UUID[]; // Line item IDs
  conditions?: DiscountCondition[];
  code?: string;
  reason?: string;
  calculatedAmount: Money;
  createdAt: Date;
}

export enum DiscountType {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE = 'percentage',
  EARLY_BIRD = 'early_bird',
  BULK = 'bulk',
  LOYALTY = 'loyalty',
  PROMOTIONAL = 'promotional',
  SSG_SUBSIDY = 'ssg_subsidy',
}

export interface DiscountCondition {
  type: string;
  operator: string;
  value: any;
}

export interface InvoiceTax {
  id: UUID;
  type: TaxType;
  name: string;
  rate: number;
  amount: Money;
  calculatedAmount: Money;
  appliedTo: UUID[]; // Line item IDs
  taxAuthority: string;
  taxCode?: string;
  createdAt: Date;
}

export interface PaymentTerms {
  dueDays: number;
  earlyPaymentDiscount?: EarlyPaymentDiscount;
  latePaymentPenalty?: LatePaymentPenalty;
  installmentPlan?: InstallmentPlan;
  acceptedMethods: PaymentMethod[];
}

export interface EarlyPaymentDiscount {
  days: number;
  percentage: number;
  discountPercentage: number;
  discountAmount?: Money;
}

export interface LatePaymentPenalty {
  gracePeriodDays: number;
  penaltyPercentage: number;
  penaltyAmount?: Money;
  compoundDaily: boolean;
}

export interface InstallmentPlan {
  numberOfInstallments: number;
  installments: Installment[];
  interestRate?: number;
  processingFee?: Money;
}

export interface Installment {
  installmentNumber: number;
  amount: Money;
  dueDate: Date;
  status: InstallmentStatus;
  paidAt?: Date;
  paidAmount?: Money;
}

export enum InstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
}

export interface InvoiceDocument {
  id: UUID;
  type: DocumentType;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: UUID;
}

export enum DocumentType {
  INVOICE_PDF = 'invoice_pdf',
  RECEIPT = 'receipt',
  CREDIT_NOTE = 'credit_note',
  PURCHASE_ORDER = 'purchase_order',
  CONTRACT = 'contract',
  SUPPORTING_DOCUMENT = 'supporting_document',
}

export interface InvoiceNote {
  id: UUID;
  content: string;
  note: string;
  isInternal: boolean;
  createdAt: Date;
  createdBy: UUID;
}

// ============================================================================
// PAYMENT PROCESSING
// ============================================================================

export interface PaymentRecord {
  id: UUID;
  invoiceId?: UUID;
  amount: Money;
  method: string;
  reference: string;
  gateway?: string;
  transactionId?: string;
  paymentMethod?: PaymentMethod;
  gatewayTransactionId?: string;
  fees?: Money;
  netAmount?: Money;
  currency?: Currency;
  exchangeRate?: Decimal;
  baseAmount?: Money;
  status: PaymentStatus;
  processedAt?: Date;
  processedBy?: UUID;
  settledAt?: Date;
  refundedAt?: Date;
  refundAmount?: Money;
  failureReason?: string;
  notes?: string;
  payerInfo?: PayerInfo;
  gatewayResponse?: Record<string, any>;
  metadata: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export interface PayerInfo {
  name: string;
  email: string;
  phone?: string;
  paymentMethodDetails?: PaymentMethodDetails;
}

export interface PaymentMethodDetails {
  type: PaymentMethod;
  cardLast4?: string;
  cardBrand?: string;
  bankName?: string;
  accountLast4?: string;
  walletType?: string;
}

export interface PaymentGatewayConfig {
  gateway: PaymentGateway;
  isActive: boolean;
  config: GatewaySpecificConfig;
  supportedMethods: PaymentMethod[];
  supportedCurrencies: Currency[];
  fees: GatewayFeeStructure;
}

export interface GatewaySpecificConfig {
  apiKey?: string;
  secretKey?: string;
  merchantId?: string;
  environment: 'sandbox' | 'production';
  webhookSecret?: string;
  [key: string]: any;
}

export interface GatewayFeeStructure {
  fixedFee?: Money;
  percentageFee?: number;
  perTransactionFee?: Money;
  internationalFee?: number;
}

// Additional Payment Processing Types for Payment Service
export interface Payment {
  id: UUID;
  type: 'payment' | 'refund';
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  errorMessage?: string;
  transactionFee?: TransactionFee;
  refunds?: UUID[];
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  paymentMethod: PaymentMethod;
  customerId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: UUID;
  transactionId: string;
  status: PaymentStatus;
  error?: string;
  timestamp: Date;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  fees?: TransactionFee;
}

export interface RefundRequest {
  originalPaymentId: UUID;
  amount: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RefundResponse {
  success: boolean;
  refundId: UUID;
  transactionId: string;
  status: PaymentStatus;
  error?: string;
  timestamp: Date;
  amount: number;
  currency: string;
  originalPaymentId: UUID;
}

export interface PaymentWebhook {
  id: UUID;
  gateway: PaymentGateway;
  eventType:
    | 'payment.completed'
    | 'payment.failed'
    | 'payment.refunded'
    | 'payment.dispute';
  data: Record<string, any>;
  signature: string;
  timestamp: Date;
}

export interface TransactionFee {
  fixed: number;
  percentage: number;
  percentageFee: number;
  totalFee: number;
  netAmount: number;
}

export interface PaymentPlan {
  id: UUID;
  totalAmount: number;
  currency: string;
  installments: number;
  installmentAmount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  startDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringPayment {
  id: UUID;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  paymentMethod: PaymentMethod;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'paused' | 'cancelled' | 'completed' | 'failed';
  customerId: string;
  description: string;
  nextPaymentDate: Date;
  lastPaymentDate?: Date;
  totalPayments?: number;
  paymentsMade?: number;
  failedAttempts?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SSG FUNDING INTEGRATION
// ============================================================================

export interface SSGFunding {
  id: UUID;
  scheme: SSGScheme;
  courseId: UUID;
  participantId: UUID;
  organizationId: UUID;
  applicationId: string;
  status: SSGStatus;
  eligibility: SSGEligibility;
  claim: SSGClaim;
  subsidy: SSGSubsidy;
  compliance: SSGCompliance;
  documents: SSGDocument[];
  timeline: SSGTimeline[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum SSGScheme {
  ENHANCED_TRAINING_SUPPORT = 'enhanced_training_support',
  COURSE_FEE_GRANT = 'course_fee_grant',
  ABSENTEE_PAYROLL_FUNDING = 'absentee_payroll_funding',
  WORKFARE_TRAINING_SUPPORT = 'workfare_training_support',
  PRODUCTIVITY_INNOVATION_CREDIT = 'productivity_innovation_credit',
  SKILLSFUTURE_ENTERPRISE_CREDIT = 'skillsfuture_enterprise_credit',
}

export enum SSGStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CLAIMED = 'claimed',
  PAID = 'paid',
  AUDITED = 'audited',
}

export interface SSGEligibility {
  isEligible: boolean;
  criteria: EligibilityCriteria[];
  checks: EligibilityCheck[];
  verifiedAt?: Date;
  verifiedBy?: UUID;
}

export interface EligibilityCriteria {
  criterion: string;
  requirement: string;
  status: 'met' | 'not_met' | 'pending';
  evidence?: string[];
}

export interface EligibilityCheck {
  checkType: string;
  result: boolean;
  details: string;
  checkedAt: Date;
  checkedBy: UUID;
}

export interface SSGClaim {
  claimId: string;
  claimableAmount: Money;
  claimedAmount: Money;
  supportingDocuments: string[];
  submittedAt?: Date;
  approvedAt?: Date;
  paidAt?: Date;
  rejectionReason?: string;
}

export interface SSGSubsidy {
  subsidyRate: number; // Percentage
  maxSubsidyAmount: Money;
  actualSubsidyAmount: Money;
  courseFee: Money;
  participantContribution: Money;
  employerContribution: Money;
  calculation: SubsidyCalculation;
}

export interface SubsidyCalculation {
  baseFee: Money;
  eligibleFee: Money;
  subsidyPercentage: number;
  subsidyAmount: Money;
  gstAmount: Money;
  totalClaimable: Money;
  breakdown: Record<string, Money>;
}

export interface SSGCompliance {
  requirements: ComplianceRequirement[];
  attestations: ComplianceAttestation[];
  auditTrail: AuditEntry[];
  lastReviewedAt?: Date;
  nextReviewDate?: Date;
}

export interface ComplianceRequirement {
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  evidence: string[];
  dueDate?: Date;
  completedAt?: Date;
}

export interface ComplianceAttestation {
  attestationType: string;
  attestedBy: UUID;
  attestedAt: Date;
  statement: string;
  evidence?: string[];
}

export interface AuditEntry {
  id: UUID;
  action: string;
  performedBy: UUID;
  performedAt: Date;
  details: Record<string, any>;
  ipAddress?: string;
}

export interface SSGDocument {
  id: UUID;
  type: SSGDocumentType;
  name: string;
  url: string;
  required: boolean;
  submitted: boolean;
  approved?: boolean;
  rejectionReason?: string;
  uploadedAt?: Date;
  reviewedAt?: Date;
}

export enum SSGDocumentType {
  COURSE_OUTLINE = 'course_outline',
  ATTENDANCE_RECORD = 'attendance_record',
  ASSESSMENT_RESULT = 'assessment_result',
  PARTICIPANT_FEEDBACK = 'participant_feedback',
  TRAINER_PROFILE = 'trainer_profile',
  COMPANY_PROFILE = 'company_profile',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  BANK_STATEMENT = 'bank_statement',
}

export interface SSGTimeline {
  id: UUID;
  event: SSGEvent;
  description: string;
  performedBy?: UUID;
  performedAt: Date;
  metadata?: Record<string, any>;
}

export enum SSGEvent {
  APPLICATION_CREATED = 'application_created',
  DOCUMENTS_UPLOADED = 'documents_uploaded',
  ELIGIBILITY_CHECKED = 'eligibility_checked',
  APPLICATION_SUBMITTED = 'application_submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CLAIM_SUBMITTED = 'claim_submitted',
  CLAIM_APPROVED = 'claim_approved',
  PAYMENT_RECEIVED = 'payment_received',
}

// ============================================================================
// ROI ANALYSIS
// ============================================================================

export interface ROIAnalysis {
  id: UUID;
  trainingProgramId: UUID;
  analysisName: string;
  analysisType: ROIAnalysisType;
  timeframe: ROITimeframe;
  methodology: ROIMethodology;
  investment: ROIInvestment;
  returns: ROIReturns;
  calculations: ROICalculations;
  businessImpact: BusinessImpact;
  riskFactors: RiskFactor[];
  assumptions: ROIAssumption[];
  scenarios: ROIScenario[];
  benchmarks: ROIBenchmark[];
  recommendations: string[];
  confidence: ConfidenceLevel;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
}

export enum ROIAnalysisType {
  TRADITIONAL_ROI = 'traditional_roi',
  NPV = 'npv',
  IRR = 'irr',
  PAYBACK_PERIOD = 'payback_period',
  BENEFIT_COST_RATIO = 'benefit_cost_ratio',
  SOCIAL_ROI = 'social_roi',
  PHILLIPS_ROI = 'phillips_roi',
}

export interface ROITimeframe {
  analysisStartDate: Date;
  analysisEndDate: Date;
  investmentPeriod: number; // months
  returnPeriod: number; // months
  followUpPeriod: number; // months
}

export interface ROIMethodology {
  evaluationLevels: KirkpatrickLevel[];
  dataCollectionMethods: DataCollectionMethod[];
  isolationMethods: IsolationMethod[];
  conversionMethods: ConversionMethod[];
  discountRate?: number;
}

export enum KirkpatrickLevel {
  REACTION = 'reaction',
  LEARNING = 'learning',
  BEHAVIOR = 'behavior',
  RESULTS = 'results',
  ROI = 'roi',
}

export enum DataCollectionMethod {
  SURVEYS = 'surveys',
  INTERVIEWS = 'interviews',
  FOCUS_GROUPS = 'focus_groups',
  OBSERVATIONS = 'observations',
  PERFORMANCE_RECORDS = 'performance_records',
  BUSINESS_METRICS = 'business_metrics',
}

export enum IsolationMethod {
  CONTROL_GROUP = 'control_group',
  TREND_ANALYSIS = 'trend_analysis',
  FORECASTING = 'forecasting',
  PARTICIPANT_ESTIMATION = 'participant_estimation',
  SUPERVISOR_ESTIMATION = 'supervisor_estimation',
  EXPERT_ESTIMATION = 'expert_estimation',
}

export enum ConversionMethod {
  HISTORICAL_COSTS = 'historical_costs',
  INTERNAL_EXPERTS = 'internal_experts',
  EXTERNAL_EXPERTS = 'external_experts',
  INDUSTRY_STUDIES = 'industry_studies',
  PARTICIPANT_ESTIMATES = 'participant_estimates',
}

export interface ROIInvestment {
  totalInvestment: Money;
  breakdown: InvestmentBreakdown;
  costPerParticipant: Money;
  costPerHour: Money;
  fullyCaptured: boolean;
}

export interface InvestmentBreakdown {
  developmentCosts: Money;
  deliveryCosts: Money;
  participantCosts: Money;
  evaluationCosts: Money;
  overheadCosts: Money;
  opportunityCosts: Money;
  categories: Record<CostCategory, Money>;
}

export interface ROIReturns {
  totalReturns: Money;
  breakdown: ReturnsBreakdown;
  returnPerParticipant: Money;
  annualizedReturns: Money;
  confidence: number; // 0-100
}

export interface ReturnsBreakdown {
  productivityGains: Money;
  qualityImprovements: Money;
  timeReductions: Money;
  costReductions: Money;
  revenueIncreases: Money;
  retentionBenefits: Money;
  complianceBenefits: Money;
  intangibleBenefits: Money;
}

export interface ROICalculations {
  roi: Decimal; // Percentage
  netBenefit: Money;
  benefitCostRatio: Decimal;
  paybackPeriod: number; // months
  npv?: Money;
  irr?: Decimal; // Percentage
  breakEvenPoint: Date;
  sensitivity: SensitivityAnalysis;
}

export interface SensitivityAnalysis {
  optimistic: ROIScenarioResult;
  realistic: ROIScenarioResult;
  pessimistic: ROIScenarioResult;
  keyVariables: SensitivityVariable[];
}

export interface SensitivityVariable {
  variable: string;
  baseValue: number;
  impact: number; // Impact on ROI per 1% change
  range: { min: number; max: number };
}

export interface ROIScenarioResult {
  roi: Decimal;
  npv: Money;
  paybackPeriod: number;
  probability: number;
}

export interface BusinessImpact {
  kpis: BusinessKPI[];
  intangibleBenefits: IntangibleBenefit[];
  stakeholderValue: StakeholderValue[];
  strategicAlignment: StrategicAlignment;
}

export interface BusinessKPI {
  name: string;
  category: KPICategory;
  baselineValue: number;
  targetValue: number;
  actualValue?: number;
  improvementPercentage: number;
  monetaryValue: Money;
  confidenceLevel: number;
  measurementPeriod: string;
  dataSource: string;
}

export enum KPICategory {
  PRODUCTIVITY = 'productivity',
  QUALITY = 'quality',
  EFFICIENCY = 'efficiency',
  REVENUE = 'revenue',
  COST = 'cost',
  CUSTOMER_SATISFACTION = 'customer_satisfaction',
  EMPLOYEE_ENGAGEMENT = 'employee_engagement',
  COMPLIANCE = 'compliance',
  INNOVATION = 'innovation',
}

export interface IntangibleBenefit {
  benefit: string;
  description: string;
  impact: ImpactLevel;
  stakeholders: string[];
  evidence: string[];
  monetizationAttempt?: Money;
}

export enum ImpactLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface StakeholderValue {
  stakeholder: string;
  valueProposition: string;
  benefits: string[];
  costs: string[];
  netValue: ValueAssessment;
}

export enum ValueAssessment {
  VERY_POSITIVE = 'very_positive',
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  VERY_NEGATIVE = 'very_negative',
}

export interface StrategicAlignment {
  organizationalGoals: string[];
  alignmentScore: number; // 0-100
  strategicContribution: string;
  futureValue: string;
}

export interface RiskFactor {
  factor: string;
  description: string;
  probability: number; // 0-100
  impact: ImpactLevel;
  mitigation: string;
  contingency?: string;
}

export interface ROIAssumption {
  assumption: string;
  rationale: string;
  source: string;
  confidence: number; // 0-100
  sensitivity: number; // Impact on ROI
}

export interface ROIScenario {
  name: string;
  description: string;
  probability: number;
  assumptions: Record<string, number>;
  results: ROIScenarioResult;
}

export interface ROIBenchmark {
  source: string;
  industry: string;
  trainingType: string;
  averageROI: Decimal;
  medianROI: Decimal;
  topQuartileROI: Decimal;
  sampleSize: number;
  timeframe: string;
}

export enum ConfidenceLevel {
  VERY_HIGH = 'very_high', // 90-100%
  HIGH = 'high', // 75-89%
  MEDIUM = 'medium', // 50-74%
  LOW = 'low', // 25-49%
  VERY_LOW = 'very_low', // 0-24%
}

// ============================================================================
// FINANCIAL REPORTING
// ============================================================================

export interface FinancialReport {
  id: UUID;
  name: string;
  type: ReportType;
  description?: string;
  parameters: ReportParameters;
  data: ReportData;
  visualizations: ReportVisualization[];
  insights: ReportInsight[];
  recommendations: string[];
  status: ReportStatus;
  scheduledFor?: Date;
  generatedAt: Date;
  expiresAt?: Date;
  accessLevel: ReportAccessLevel;
  recipients: ReportRecipient[];
  metadata: Record<string, any>;
  createdBy: UUID;
}

export enum ReportStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
}

export enum ReportAccessLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
}

export interface ReportParameters {
  dateRange: DateRange;
  organizationIds?: UUID[];
  departmentIds?: UUID[];
  courseIds?: UUID[];
  categories?: CostCategory[];
  currencies?: Currency[];
  filters: ReportFilter[];
  groupBy: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  period: ReportPeriod;
}

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export interface ReportFilter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
}

export interface ReportData {
  summary: ReportSummary;
  details: Record<string, any>[];
  aggregations: ReportAggregation[];
  trends: ReportTrend[];
  comparisons: ReportComparison[];
}

export interface ReportSummary {
  totalRecords: number;
  totalAmount: Money;
  averageAmount: Money;
  medianAmount: Money;
  period: string;
  keyMetrics: Record<string, number>;
}

export interface ReportAggregation {
  groupBy: string;
  values: Record<string, any>;
  summary: Record<string, number>;
}

export interface ReportTrend {
  metric: string;
  dataPoints: TrendDataPoint[];
  trendDirection: TrendDirection;
  growthRate: number;
  seasonality?: SeasonalityPattern;
}

export enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  VOLATILE = 'volatile',
}

export interface TrendDataPoint {
  period: string;
  value: number;
  change: number;
  changePercentage: number;
}

export interface SeasonalityPattern {
  detected: boolean;
  pattern: string;
  confidence: number;
  peaks: string[];
  troughs: string[];
}

export interface ReportComparison {
  type: ComparisonType;
  baseline: ComparisonData;
  current: ComparisonData;
  variance: ComparisonVariance;
}

export enum ComparisonType {
  PERIOD_OVER_PERIOD = 'period_over_period',
  YEAR_OVER_YEAR = 'year_over_year',
  BUDGET_VS_ACTUAL = 'budget_vs_actual',
  PLAN_VS_ACTUAL = 'plan_vs_actual',
  BENCHMARK = 'benchmark',
}

export interface ComparisonData {
  label: string;
  value: number;
  period: string;
}

export interface ComparisonVariance {
  absolute: number;
  percentage: number;
  direction: 'favorable' | 'unfavorable' | 'neutral';
  significance: 'high' | 'medium' | 'low';
}

export interface ReportVisualization {
  id: UUID;
  type: VisualizationType;
  title: string;
  description?: string;
  data: any;
  configuration: VisualizationConfig;
}

export enum VisualizationType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  AREA_CHART = 'area_chart',
  SCATTER_PLOT = 'scatter_plot',
  HEATMAP = 'heatmap',
  GAUGE = 'gauge',
  TABLE = 'table',
  KPI_CARD = 'kpi_card',
  TREEMAP = 'treemap',
}

export interface VisualizationConfig {
  colors: string[];
  axes: AxisConfig[];
  legend: LegendConfig;
  formatting: FormattingConfig;
  interactivity: InteractivityConfig;
}

export interface AxisConfig {
  axis: 'x' | 'y' | 'z';
  label: string;
  scale: 'linear' | 'logarithmic' | 'time';
  format: string;
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface FormattingConfig {
  numberFormat: string;
  currencyFormat: string;
  dateFormat: string;
  decimals: number;
}

export interface InteractivityConfig {
  drillDown: boolean;
  filtering: boolean;
  sorting: boolean;
  export: boolean;
}

export interface ReportInsight {
  type: InsightType;
  title: string;
  description: string;
  significance: InsightSignificance;
  evidence: string[];
  actionable: boolean;
  recommendations?: string[];
}

export enum InsightType {
  TREND = 'trend',
  ANOMALY = 'anomaly',
  PATTERN = 'pattern',
  CORRELATION = 'correlation',
  FORECAST = 'forecast',
  OPPORTUNITY = 'opportunity',
  RISK = 'risk',
}

export enum InsightSignificance {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational',
}

export interface ReportRecipient {
  userId: UUID;
  email: string;
  role: string;
  deliveryMethod: DeliveryMethod;
  frequency: DeliveryFrequency;
}

export enum DeliveryMethod {
  EMAIL = 'email',
  DASHBOARD = 'dashboard',
  API = 'api',
  DOWNLOAD = 'download',
}

export enum DeliveryFrequency {
  REAL_TIME = 'real_time',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ON_DEMAND = 'on_demand',
}

// ============================================================================
// FORECASTING AND PREDICTIVE ANALYTICS
// ============================================================================

export interface FinancialForecast {
  id: UUID;
  name: string;
  type: ForecastType;
  scope: ForecastScope;
  timeHorizon: ForecastTimeHorizon;
  methodology: ForecastMethodology;
  inputs: ForecastInput[];
  scenarios: ForecastScenario[];
  predictions: ForecastPrediction[];
  accuracy: ForecastAccuracy;
  confidence: ForecastConfidence;
  assumptions: ForecastAssumption[];
  risks: ForecastRisk[];
  recommendations: ForecastRecommendation[];
  lastUpdated: Date;
  nextUpdate: Date;
  createdBy: UUID;
}

export enum ForecastType {
  BUDGET = 'budget',
  CASH_FLOW = 'cash_flow',
  REVENUE = 'revenue',
  EXPENSES = 'expenses',
  ROI = 'roi',
  DEMAND = 'demand',
  CAPACITY = 'capacity',
}

export interface ForecastScope {
  organizationIds: UUID[];
  departments: string[];
  categories: CostCategory[];
  courses: UUID[];
  geographies: string[];
}

export interface ForecastTimeHorizon {
  startDate: Date;
  endDate: Date;
  granularity: ForecastGranularity;
  periods: number;
}

export enum ForecastGranularity {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export interface ForecastMethodology {
  primaryMethod: ForecastMethod;
  secondaryMethods: ForecastMethod[];
  ensembleWeights: Record<ForecastMethod, number>;
  validationMethod: ValidationMethod;
}

export enum ForecastMethod {
  LINEAR_REGRESSION = 'linear_regression',
  EXPONENTIAL_SMOOTHING = 'exponential_smoothing',
  ARIMA = 'arima',
  NEURAL_NETWORK = 'neural_network',
  RANDOM_FOREST = 'random_forest',
  TIME_SERIES_DECOMPOSITION = 'time_series_decomposition',
  MOVING_AVERAGE = 'moving_average',
  SEASONAL_NAIVE = 'seasonal_naive',
  ENSEMBLE = 'ensemble',
}

export enum ValidationMethod {
  HOLDOUT = 'holdout',
  CROSS_VALIDATION = 'cross_validation',
  TIME_SERIES_SPLIT = 'time_series_split',
  WALK_FORWARD = 'walk_forward',
}

export interface ForecastInput {
  name: string;
  type: InputType;
  source: string;
  importance: number; // 0-100
  correlation: number; // -1 to 1
  transformation?: DataTransformation;
}

export enum InputType {
  HISTORICAL_DATA = 'historical_data',
  EXTERNAL_FACTOR = 'external_factor',
  LEADING_INDICATOR = 'leading_indicator',
  SEASONAL_FACTOR = 'seasonal_factor',
  ECONOMIC_INDICATOR = 'economic_indicator',
}

export enum DataTransformation {
  LOG = 'log',
  SQUARE_ROOT = 'square_root',
  DIFFERENCE = 'difference',
  SEASONAL_DIFFERENCE = 'seasonal_difference',
  NORMALIZATION = 'normalization',
  STANDARDIZATION = 'standardization',
}

export interface ForecastScenario {
  name: string;
  probability: number;
  assumptions: Record<string, number>;
  adjustments: ScenarioAdjustment[];
}

export interface ScenarioAdjustment {
  factor: string;
  adjustment: number;
  rationale: string;
}

export interface ForecastPrediction {
  period: string;
  date: Date;
  scenario: string;
  predictedValue: number;
  confidence: ForecastConfidenceInterval;
  components: ForecastComponent[];
}

export interface ForecastConfidenceInterval {
  level: number; // e.g., 95
  lowerBound: number;
  upperBound: number;
  standardError: number;
}

export interface ForecastComponent {
  name: string;
  value: number;
  contribution: number; // percentage
}

export interface ForecastAccuracy {
  historicalAccuracy: AccuracyMetric[];
  backtestResults: BacktestResult[];
  errorMetrics: ErrorMetric[];
  benchmarkComparison: BenchmarkComparison[];
}

export interface AccuracyMetric {
  metric: AccuracyMetricType;
  value: number;
  period: string;
}

export enum AccuracyMetricType {
  MAPE = 'mape', // Mean Absolute Percentage Error
  MAE = 'mae', // Mean Absolute Error
  RMSE = 'rmse', // Root Mean Square Error
  R_SQUARED = 'r_squared',
  DIRECTIONAL_ACCURACY = 'directional_accuracy',
}

export interface BacktestResult {
  period: string;
  actualValue: number;
  predictedValue: number;
  error: number;
  errorPercentage: number;
}

export interface ErrorMetric {
  name: string;
  value: number;
  threshold: number;
  status: 'within_threshold' | 'exceeds_threshold';
}

export interface BenchmarkComparison {
  benchmark: string;
  ourAccuracy: number;
  benchmarkAccuracy: number;
  difference: number;
  performance: 'better' | 'worse' | 'similar';
}

export interface ForecastConfidence {
  overall: number; // 0-100
  dataQuality: number;
  methodSuitability: number;
  externalFactors: number;
  timeHorizon: number;
}

export interface ForecastAssumption {
  assumption: string;
  category: AssumptionCategory;
  impact: ImpactLevel;
  rationale: string;
  source: string;
  confidence: number;
}

export enum AssumptionCategory {
  ECONOMIC = 'economic',
  ORGANIZATIONAL = 'organizational',
  MARKET = 'market',
  REGULATORY = 'regulatory',
  TECHNOLOGICAL = 'technological',
  SEASONAL = 'seasonal',
}

export interface ForecastRisk {
  risk: string;
  probability: number;
  impact: ImpactLevel;
  mitigation: string;
  contingency: string;
}

export interface ForecastRecommendation {
  recommendation: string;
  priority: RecommendationPriority;
  rationale: string;
  expectedImpact: string;
  implementation: string;
  timeline: string;
}

export enum RecommendationPriority {
  IMMEDIATE = 'immediate',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// ============================================================================
// SYSTEM CONFIGURATION AND INTEGRATION
// ============================================================================

export interface FinancialSystemConfig {
  id: UUID;
  organizationId: UUID;
  baseCurrency: Currency;
  supportedCurrencies: Currency[];
  fiscalYearStart: { month: number; day: number };
  taxSettings: TaxSettings;
  approvalWorkflows: ApprovalWorkflow[];
  integrations: SystemIntegration[];
  reportingConfig: ReportingConfig;
  complianceSettings: ComplianceSettings;
  notifications: NotificationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxSettings {
  defaultTaxRate: number;
  taxInclusive: boolean;
  taxRates: TaxRate[];
  taxExemptions: TaxExemption[];
}

export interface TaxRate {
  name: string;
  rate: number;
  applicableFrom: Date;
  applicableTo?: Date;
  jurisdiction: string;
  type: TaxType;
}

export enum TaxType {
  GST = 'gst',
  VAT = 'vat',
  SALES_TAX = 'sales_tax',
  SERVICE_TAX = 'service_tax',
  WITHHOLDING_TAX = 'withholding_tax',
}

export interface TaxExemption {
  exemptionType: string;
  criteria: string[];
  certificateRequired: boolean;
  validFrom: Date;
  validTo?: Date;
}

export interface ApprovalWorkflow {
  id: UUID;
  name: string;
  type: WorkflowType;
  triggers: WorkflowTrigger[];
  steps: ApprovalStep[];
  escalationRules: EscalationRule[];
  isActive: boolean;
}

export enum WorkflowType {
  BUDGET_APPROVAL = 'budget_approval',
  EXPENSE_APPROVAL = 'expense_approval',
  INVOICE_APPROVAL = 'invoice_approval',
  PAYMENT_APPROVAL = 'payment_approval',
  SSG_CLAIM_APPROVAL = 'ssg_claim_approval',
}

export interface WorkflowTrigger {
  condition: TriggerCondition;
  value: any;
}

export interface TriggerCondition {
  field: string;
  operator: string;
  threshold: any;
}

export interface ApprovalStep {
  stepNumber: number;
  approverRole: string;
  approverIds?: UUID[];
  requiredApprovals: number;
  timeoutDays?: number;
  canDelegate: boolean;
  conditions?: ApprovalCondition[];
}

export interface ApprovalCondition {
  field: string;
  operator: string;
  value: any;
}

export interface EscalationRule {
  triggerAfterDays: number;
  escalateToRole: string;
  escalateToIds?: UUID[];
  action: EscalationAction;
}

export enum EscalationAction {
  NOTIFY = 'notify',
  REASSIGN = 'reassign',
  AUTO_APPROVE = 'auto_approve',
  AUTO_REJECT = 'auto_reject',
}

export interface SystemIntegration {
  id: UUID;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  config: IntegrationConfig;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  syncFrequency: SyncFrequency;
  errorCount: number;
  lastError?: string;
}

export enum IntegrationType {
  ACCOUNTING_SYSTEM = 'accounting_system',
  PAYMENT_GATEWAY = 'payment_gateway',
  BANKING = 'banking',
  SSG_PORTAL = 'ssg_portal',
  GOVERNMENT_SYSTEMS = 'government_systems',
  ERP = 'erp',
  CRM = 'crm',
  HRM = 'hrm',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  SYNCING = 'syncing',
  PENDING_SETUP = 'pending_setup',
}

export interface IntegrationConfig {
  endpoint?: string;
  authentication: AuthenticationConfig;
  fieldMappings: FieldMapping[];
  syncSettings: SyncSettings;
  errorHandling: ErrorHandlingConfig;
}

export interface AuthenticationConfig {
  type: AuthenticationType;
  credentials: Record<string, string>;
  tokenExpiry?: Date;
  refreshToken?: string;
}

export enum AuthenticationType {
  API_KEY = 'api_key',
  OAUTH2 = 'oauth2',
  BASIC_AUTH = 'basic_auth',
  JWT = 'jwt',
  CERTIFICATE = 'certificate',
}

export interface FieldMapping {
  localField: string;
  remoteField: string;
  transformation?: string;
  required: boolean;
  defaultValue?: any;
}

export interface SyncSettings {
  direction: SyncDirection;
  conflictResolution: ConflictResolution;
  batchSize: number;
  timeout: number;
}

export enum SyncDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  BIDIRECTIONAL = 'bidirectional',
}

export enum ConflictResolution {
  LOCAL_WINS = 'local_wins',
  REMOTE_WINS = 'remote_wins',
  MANUAL_REVIEW = 'manual_review',
  TIMESTAMP_BASED = 'timestamp_based',
}

export interface ErrorHandlingConfig {
  retryAttempts: number;
  retryDelay: number;
  escalateAfterFailures: number;
  notifyOnError: boolean;
  notificationRecipients: string[];
}

export enum SyncFrequency {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  MANUAL = 'manual',
}

export interface ReportingConfig {
  defaultCurrency: Currency;
  defaultPeriod: ReportPeriod;
  defaultTimeZone: string;
  retentionPeriod: number; // months
  autoGenerate: AutoGenerateConfig[];
  customFields: CustomField[];
}

export interface AutoGenerateConfig {
  reportType: ReportType;
  frequency: DeliveryFrequency;
  recipients: string[];
  parameters: Record<string, any>;
}

export interface CustomField {
  name: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[];
  validation?: string;
}

export enum CustomFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
}

export interface ComplianceSettings {
  auditTrail: boolean;
  dataRetention: DataRetentionPolicy;
  accessControls: AccessControl[];
  encryptionSettings: EncryptionSettings;
  regulatoryCompliance: RegulatoryCompliance[];
}

export interface DataRetentionPolicy {
  defaultRetentionPeriod: number; // months
  categorySpecific: Record<string, number>;
  archiveAfterMonths: number;
  deleteAfterMonths: number;
}

export interface AccessControl {
  role: string;
  permissions: Permission[];
  dataAccess: DataAccessRule[];
  sessionTimeout: number; // minutes
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface DataAccessRule {
  dataType: string;
  access: AccessLevel;
  filters: Record<string, any>;
}

export enum AccessLevel {
  NONE = 'none',
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  FULL = 'full',
}

export interface EncryptionSettings {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
  keyRotationPeriod: number; // days
}

export interface RegulatoryCompliance {
  regulation: string;
  requirements: string[];
  controls: ComplianceControl[];
  lastAudit?: Date;
  nextAudit?: Date;
}

export interface ComplianceControl {
  control: string;
  implementation: string;
  responsible: string;
  evidence: string[];
  status: ControlStatus;
}

export enum ControlStatus {
  IMPLEMENTED = 'implemented',
  PARTIAL = 'partial',
  NOT_IMPLEMENTED = 'not_implemented',
  UNDER_REVIEW = 'under_review',
}

export interface NotificationSettings {
  channels: NotificationChannel[];
  events: NotificationEvent[];
  templates: NotificationTemplate[];
  preferences: UserNotificationPreference[];
}

export interface NotificationChannel {
  type: NotificationChannelType;
  config: NotificationChannelConfig;
  isActive: boolean;
}

export enum NotificationChannelType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  SLACK = 'slack',
  TEAMS = 'teams',
  WEBHOOK = 'webhook',
}

export interface NotificationChannelConfig {
  [key: string]: any;
}

export interface NotificationEvent {
  event: string;
  description: string;
  channels: NotificationChannelType[];
  template: string;
  recipients: NotificationRecipient[];
  conditions?: NotificationCondition[];
}

export interface NotificationRecipient {
  type: RecipientType;
  identifier: string;
  roles?: string[];
}

export enum RecipientType {
  USER = 'user',
  ROLE = 'role',
  EMAIL = 'email',
  PHONE = 'phone',
}

export interface NotificationCondition {
  field: string;
  operator: string;
  value: any;
}

export interface NotificationTemplate {
  id: UUID;
  name: string;
  channel: NotificationChannelType;
  subject?: string;
  content: string;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: string;
  required: boolean;
  defaultValue?: any;
}

export interface UserNotificationPreference {
  userId: UUID;
  eventTypes: string[];
  channels: NotificationChannelType[];
  frequency: NotificationFrequency;
  quietHours?: QuietHours;
}

export enum NotificationFrequency {
  IMMEDIATE = 'immediate',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NEVER = 'never',
}

export interface QuietHours {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
  days: string[]; // day names
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './types';
