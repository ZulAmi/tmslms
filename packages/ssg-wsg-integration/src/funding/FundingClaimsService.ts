/**
 * SSG-WSG Funding & Claims Management Service
 * Comprehensive service for handling funding eligibility, claims processing, and financial reconciliation
 */

import { EventEmitter } from 'events';
import { SSGWSGMonitoringService } from '../monitoring/MonitoringService';
import { SSGWSGApiClient } from '../client/ApiClient';
import { CacheService, CacheOptions } from '../cache/CacheService';
import { SSGWSGQueueService } from '../queue/QueueService';
import {
  EligibilityRequest,
  EligibilityResponse,
  ClaimSubmission,
  ClaimStatus,
  SubsidyCalculationRequest,
  SubsidyCalculationResponse,
  ReconciliationBatch,
  ReconciliationStatus,
  FundingDashboardData,
  ComplianceReport,
  WorkflowStage,
  ClaimProcessingWorkflow,
  ApprovalLevel,
  ApprovalLevelConfiguration,
  DelegationRule,
  AutoApprovalRule,
  WorkflowStep,
  StepStatus,
  NotificationLog,
  Discrepancy,
  DiscrepancyType,
  ReconciliationItem,
  AuditTrailEntry,
} from './types';

/**
 * Comprehensive Funding and Claims Management Service
 * Handles complete funding lifecycle from eligibility to reconciliation
 */
export class FundingClaimsService extends EventEmitter {
  private logger = console; // Simplified logger for now
  private apiClient: SSGWSGApiClient;
  private cache: CacheService;
  private queue: SSGWSGQueueService;

  // In-memory stores for demo purposes (replace with database in production)
  private eligibilityChecks = new Map<string, EligibilityResponse>();
  private claims = new Map<string, ClaimSubmission>();
  private workflows = new Map<string, ClaimProcessingWorkflow>();
  private reconciliationBatches = new Map<string, ReconciliationBatch>();
  private auditTrail: AuditTrailEntry[] = [];

  constructor(
    apiClient: SSGWSGApiClient,
    cache: CacheService,
    queue: SSGWSGQueueService
  ) {
    super();
    this.apiClient = apiClient;
    this.cache = cache;
    this.queue = queue;
    this.setupEventHandlers();
    this.startBackgroundProcesses();
  }

  // ============================================================================
  // ELIGIBILITY VERIFICATION
  // ============================================================================

  /**
   * Comprehensive real-time eligibility verification
   */
  async verifyEligibility(
    request: EligibilityRequest
  ): Promise<EligibilityResponse> {
    this.logger.info('Starting eligibility verification', {
      participantId: request.participantId,
      courseId: request.courseId,
    });

    try {
      // Check cache first for recent eligibility checks
      const cacheKey = this.generateEligibilityCacheKey(request);
      const cachedResult = await this.cache.get<EligibilityResponse>(cacheKey);

      if (cachedResult && this.isEligibilityResultValid(cachedResult)) {
        this.logger.info('Returning cached eligibility result');
        return cachedResult;
      }

      // Perform comprehensive eligibility checks
      const eligibilityResponse = await this.performEligibilityChecks(request);

      // Cache the result for performance
      await this.cache.set(cacheKey, eligibilityResponse, { ttl: 3600 }); // 1 hour cache

      // Record audit trail
      await this.recordAuditTrail({
        entryId: this.generateId(),
        timestamp: new Date(),
        userId: request.requestedBy,
        userRole: 'system',
        action: { action: 'read' },
        resource: { type: 'eligibility' },
        resourceId: request.participantId,
        changes: [],
        ipAddress: 'system',
        userAgent: 'FundingClaimsService',
        sessionId: this.generateId(),
      });

      // Emit eligibility checked event
      this.emit('eligibilityChecked', {
        request,
        response: eligibilityResponse,
        processingTime: eligibilityResponse.processingTime,
      });

      this.logger.info('Eligibility verification completed', {
        eligible: eligibilityResponse.eligible,
        maxSubsidy: eligibilityResponse.maxSubsidyAmount,
      });

      return eligibilityResponse;
    } catch (error) {
      this.logger.error('Eligibility verification failed', {
        error: error instanceof Error ? error.message : String(error),
      });

      // Return failed eligibility response
      const failedResponse: EligibilityResponse = {
        requestId: this.generateId(),
        participantId: request.participantId,
        courseId: request.courseId,
        eligible: false,
        eligibilityScore: 0,
        maxSubsidyAmount: 0,
        subsidyPercentage: 0,
        applicableFundingSchemes: [],
        eligibilityDetails: {
          criteriaChecks: [],
          overallScore: 0,
          passedChecks: 0,
          totalChecks: 0,
          riskAssessment: {
            overallRiskScore: 100,
            riskLevel: 'high',
            riskFactors: [
              {
                factor: 'System Error',
                score: 100,
                weight: 1.0,
                description: 'System error occurred',
              },
            ],
            mitigationRecommendations: ['Contact support'],
          },
          recommendedAction: {
            action: 'manual_review',
            confidence: 0,
            reasoning: ['System error occurred during eligibility check'],
            conditions: ['Manual review required'],
          },
        },
        requirements: [],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        processedAt: new Date(),
        processingTime: 0,
      };

      return failedResponse;
    }
  }

  /**
   * Batch eligibility verification for multiple participants
   */
  async batchVerifyEligibility(
    requests: EligibilityRequest[]
  ): Promise<EligibilityResponse[]> {
    this.logger.info(
      `Starting batch eligibility verification for ${requests.length} requests`
    );

    const results: EligibilityResponse[] = [];
    const batchSize = 10; // Process in batches of 10

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map((request) =>
        this.verifyEligibility(request)
      );

      try {
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            this.logger.error(
              `Batch eligibility verification failed for request ${i + index}`,
              {
                error: result.reason,
              }
            );
          }
        });
      } catch (error) {
        this.logger.error('Batch processing error', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.emit('batchEligibilityCompleted', {
      totalRequests: requests.length,
      successfulResults: results.length,
    });

    return results;
  }

  // ============================================================================
  // CLAIMS PROCESSING
  // ============================================================================

  /**
   * Submit a funding claim with automated processing
   */
  async submitClaim(
    claimSubmission: ClaimSubmission
  ): Promise<ClaimProcessingWorkflow> {
    this.logger.info('Processing claim submission', {
      claimId: claimSubmission.claimId,
    });

    try {
      // Validate claim submission
      await this.validateClaimSubmission(claimSubmission);

      // Store claim
      this.claims.set(claimSubmission.claimId, claimSubmission);

      // Create processing workflow
      const workflow = await this.createClaimWorkflow(claimSubmission);
      this.workflows.set(claimSubmission.claimId, workflow);

      // Start automated processing
      await this.processClaimWorkflow(workflow);

      // Record audit trail
      await this.recordAuditTrail({
        entryId: this.generateId(),
        timestamp: new Date(),
        userId: claimSubmission.submittedBy,
        userRole: 'participant',
        action: { action: 'create' },
        resource: { type: 'claim' },
        resourceId: claimSubmission.claimId,
        changes: [
          {
            field: 'status',
            oldValue: null,
            newValue: claimSubmission.claimStatus,
            changeType: 'created',
          },
        ],
        ipAddress: 'system',
        userAgent: 'FundingClaimsService',
        sessionId: this.generateId(),
      });

      this.emit('claimSubmitted', { claim: claimSubmission, workflow });

      return workflow;
    } catch (error) {
      this.logger.error('Claim submission failed', {
        claimId: claimSubmission.claimId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Update claim status with workflow progression
   */
  async updateClaimStatus(
    claimId: string,
    newStatus: ClaimStatus,
    updatedBy: string,
    comments?: string
  ): Promise<ClaimSubmission> {
    this.logger.info('Updating claim status', { claimId, newStatus });

    const claim = this.claims.get(claimId);
    if (!claim) {
      throw new Error(`Claim not found: ${claimId}`);
    }

    const oldStatus = claim.claimStatus;
    claim.claimStatus = newStatus;
    claim.metadata.lastUpdatedBy = updatedBy;
    claim.metadata.lastUpdatedAt = new Date();

    if (comments) {
      claim.metadata.statusComments = claim.metadata.statusComments || [];
      claim.metadata.statusComments.push({
        status: newStatus,
        comment: comments,
        updatedBy,
        updatedAt: new Date(),
      });
    }

    this.claims.set(claimId, claim);

    // Update workflow
    const workflow = this.workflows.get(claimId);
    if (workflow) {
      await this.updateWorkflowProgress(
        workflow,
        newStatus,
        updatedBy,
        comments
      );
    }

    // Record audit trail
    await this.recordAuditTrail({
      entryId: this.generateId(),
      timestamp: new Date(),
      userId: updatedBy,
      userRole: 'processor',
      action: { action: 'update' },
      resource: { type: 'claim' },
      resourceId: claimId,
      changes: [
        {
          field: 'status',
          oldValue: oldStatus,
          newValue: newStatus,
          changeType: 'updated',
        },
      ],
      ipAddress: 'system',
      userAgent: 'FundingClaimsService',
      sessionId: this.generateId(),
    });

    // Auto-trigger next workflow steps
    if (workflow) {
      await this.processNextWorkflowStep(workflow);
    }

    this.emit('claimStatusUpdated', {
      claimId,
      oldStatus,
      newStatus,
      updatedBy,
    });

    return claim;
  }

  /**
   * Bulk claims processing for training providers
   */
  async processBulkClaims(claims: ClaimSubmission[]): Promise<{
    successful: string[];
    failed: Array<{ claimId: string; error: string }>;
    totalProcessed: number;
  }> {
    this.logger.info(`Processing bulk claims: ${claims.length} claims`);

    const successful: string[] = [];
    const failed: Array<{ claimId: string; error: string }> = [];

    for (const claim of claims) {
      try {
        await this.submitClaim(claim);
        successful.push(claim.claimId);
      } catch (error) {
        failed.push({
          claimId: claim.claimId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const result = {
      successful,
      failed,
      totalProcessed: claims.length,
    };

    this.emit('bulkClaimsProcessed', result);

    return result;
  }

  // ============================================================================
  // SUBSIDY CALCULATION
  // ============================================================================

  /**
   * Dynamic subsidy calculation based on current schemes
   */
  async calculateSubsidy(
    request: SubsidyCalculationRequest
  ): Promise<SubsidyCalculationResponse> {
    this.logger.info('Calculating subsidy', {
      participantId: request.participantId,
      courseId: request.courseId,
      courseFee: request.courseFee,
    });

    try {
      // Check cache for recent calculations
      const cacheKey = this.generateSubsidyCacheKey(request);
      const cachedResult =
        await this.cache.get<SubsidyCalculationResponse>(cacheKey);

      if (cachedResult && this.isSubsidyCalculationValid(cachedResult)) {
        return cachedResult;
      }

      // Perform subsidy calculations
      const response = await this.performSubsidyCalculation(request);

      // Cache result for 30 minutes
      await this.cache.set(cacheKey, response, { ttl: 1800 });

      this.emit('subsidyCalculated', { request, response });

      return response;
    } catch (error) {
      this.logger.error('Subsidy calculation failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ============================================================================
  // WORKFLOW MANAGEMENT
  // ============================================================================

  /**
   * Get claim processing workflow status
   */
  async getClaimWorkflow(
    claimId: string
  ): Promise<ClaimProcessingWorkflow | null> {
    return this.workflows.get(claimId) || null;
  }

  /**
   * Approve claim at specific workflow stage
   */
  async approveClaimAtStage(
    claimId: string,
    stage: WorkflowStage,
    approverUserId: string,
    comments?: string
  ): Promise<void> {
    const workflow = this.workflows.get(claimId);
    if (!workflow) {
      throw new Error(`Workflow not found for claim: ${claimId}`);
    }

    // Find current stage
    const currentStep = workflow.workflowHistory.find(
      (step) => step.stage === stage && step.status === StepStatus.IN_PROGRESS
    );

    if (!currentStep) {
      throw new Error(`No in-progress step found for stage: ${stage}`);
    }

    // Complete current step
    currentStep.status = StepStatus.COMPLETED;
    currentStep.completedAt = new Date();
    currentStep.processedBy = approverUserId;
    currentStep.comments = comments;
    currentStep.duration =
      currentStep.completedAt.getTime() - currentStep.startedAt.getTime();

    // Update approval level
    const approvalLevel = workflow.approvalLevels.find(
      (level) =>
        level.approverRole === 'manager' ||
        level.approverRole === 'senior_manager'
    );

    if (approvalLevel) {
      approvalLevel.currentApprovals++;
    }

    // Progress to next stage
    await this.progressWorkflowToNextStage(workflow);

    // Update claim status
    await this.updateClaimStatus(
      claimId,
      ClaimStatus.APPROVED,
      approverUserId,
      comments
    );

    this.emit('claimApproved', { claimId, stage, approverUserId });
  }

  // ============================================================================
  // FINANCIAL RECONCILIATION
  // ============================================================================

  /**
   * Process financial reconciliation batch
   */
  async processReconciliationBatch(
    paymentProvider: 'SSG' | 'WSG' | 'TESA' | 'MAS',
    batchDate: Date
  ): Promise<ReconciliationBatch> {
    this.logger.info('Processing reconciliation batch', {
      paymentProvider,
      batchDate,
    });

    const batchId = this.generateId();

    try {
      // Get claims for reconciliation
      const claimsToReconcile = Array.from(this.claims.values()).filter(
        (claim) =>
          claim.claimStatus === ClaimStatus.PAYMENT_PROCESSING ||
          claim.claimStatus === ClaimStatus.PAID
      );

      // Create reconciliation items
      const reconciliationItems: ReconciliationItem[] = claimsToReconcile.map(
        (claim) => ({
          itemId: this.generateId(),
          claimId: claim.claimId,
          participantId: claim.participantId,
          expectedAmount: claim.claimAmount,
          receivedAmount: claim.claimAmount, // Mock - would come from bank statement
          difference: 0,
          reconciliationStatus: { status: 'matched', confidence: 1.0 },
          paymentReference: `REF-${claim.claimId}`,
          paymentDate: new Date(),
          bankTransactionId: `TXN-${this.generateId()}`,
          notes: 'Automated reconciliation',
        })
      );

      // Detect discrepancies
      const discrepancies =
        this.detectReconciliationDiscrepancies(reconciliationItems);

      // Create reconciliation batch
      const batch: ReconciliationBatch = {
        batchId,
        batchDate,
        paymentProvider,
        batchType: 'daily',
        totalClaims: claimsToReconcile.length,
        totalAmount: claimsToReconcile.reduce(
          (sum, claim) => sum + claim.claimAmount,
          0
        ),
        currency: 'SGD',
        reconciliationStatus:
          discrepancies.length > 0
            ? ReconciliationStatus.DISCREPANCIES_FOUND
            : ReconciliationStatus.COMPLETED,
        reconciliationItems,
        discrepancies,
        processedBy: 'system',
        processedAt: new Date(),
        approvedBy: discrepancies.length === 0 ? 'auto-approved' : undefined,
        approvedAt: discrepancies.length === 0 ? new Date() : undefined,
      };

      this.reconciliationBatches.set(batchId, batch);

      // Update claim statuses for successfully reconciled claims
      for (const item of reconciliationItems) {
        if (item.reconciliationStatus.status === 'matched') {
          await this.updateClaimStatus(
            item.claimId,
            ClaimStatus.PAID,
            'system',
            'Payment reconciled'
          );
        }
      }

      this.emit('reconciliationBatchProcessed', batch);

      return batch;
    } catch (error) {
      this.logger.error('Reconciliation batch processing failed', {
        batchId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get reconciliation discrepancies for investigation
   */
  async getReconciliationDiscrepancies(
    batchId?: string
  ): Promise<Discrepancy[]> {
    if (batchId) {
      const batch = this.reconciliationBatches.get(batchId);
      return batch?.discrepancies || [];
    }

    // Return all unresolved discrepancies
    const allDiscrepancies: Discrepancy[] = [];
    for (const batch of this.reconciliationBatches.values()) {
      allDiscrepancies.push(
        ...batch.discrepancies.filter(
          (d) =>
            d.resolutionStatus.status === 'open' ||
            d.resolutionStatus.status === 'in_progress'
        )
      );
    }

    return allDiscrepancies;
  }

  // ============================================================================
  // DASHBOARD & ANALYTICS
  // ============================================================================

  /**
   * Generate comprehensive funding dashboard data
   */
  async generateFundingDashboard(
    periodStart: Date,
    periodEnd: Date
  ): Promise<FundingDashboardData> {
    this.logger.info('Generating funding dashboard', {
      periodStart,
      periodEnd,
    });

    const claims = Array.from(this.claims.values()).filter(
      (claim) =>
        claim.submittedAt >= periodStart && claim.submittedAt <= periodEnd
    );

    const eligibilityChecks = Array.from(
      this.eligibilityChecks.values()
    ).filter(
      (check) =>
        check.processedAt >= periodStart && check.processedAt <= periodEnd
    );

    // Calculate summary metrics
    const summaryMetrics = {
      totalApplications: eligibilityChecks.length,
      approvedApplications: eligibilityChecks.filter((e) => e.eligible).length,
      rejectedApplications: eligibilityChecks.filter((e) => !e.eligible).length,
      pendingApplications: claims.filter(
        (c) =>
          c.claimStatus === ClaimStatus.SUBMITTED ||
          c.claimStatus === ClaimStatus.UNDER_REVIEW
      ).length,
      totalClaimsValue: claims.reduce((sum, c) => sum + c.claimAmount, 0),
      totalApprovedAmount: claims
        .filter(
          (c) =>
            c.claimStatus === ClaimStatus.APPROVED ||
            c.claimStatus === ClaimStatus.PAID
        )
        .reduce(
          (sum, c) => sum + (c.metadata.approvedAmount || c.claimAmount),
          0
        ),
      totalPaidAmount: claims
        .filter((c) => c.claimStatus === ClaimStatus.PAID)
        .reduce((sum, c) => sum + (c.metadata.paidAmount || c.claimAmount), 0),
      averageClaimAmount:
        claims.length > 0
          ? claims.reduce((sum, c) => sum + c.claimAmount, 0) / claims.length
          : 0,
      averageProcessingTime: this.calculateAverageProcessingTime(claims),
      slaComplianceRate: this.calculateSLACompliance(claims),
    };

    // Calculate approval rates
    const approvalRates = {
      overallApprovalRate:
        eligibilityChecks.length > 0
          ? (eligibilityChecks.filter((e) => e.eligible).length /
              eligibilityChecks.length) *
            100
          : 0,
      approvalRateByScheme:
        this.calculateApprovalRatesByScheme(eligibilityChecks),
      approvalRateByProvider: this.calculateApprovalRatesByProvider(claims),
      approvalRateByAmount:
        this.calculateApprovalRatesByAmount(eligibilityChecks),
      monthlyApprovalTrend: this.calculateMonthlyApprovalTrend(
        eligibilityChecks,
        periodStart,
        periodEnd
      ),
    };

    // Calculate funding utilization
    const utilizationMetrics = {
      totalBudgetAllocated: 10000000, // Mock $10M budget
      totalBudgetUtilized: summaryMetrics.totalPaidAmount,
      utilizationPercentage: (summaryMetrics.totalPaidAmount / 10000000) * 100,
      utilizationByScheme: this.calculateUtilizationByScheme(claims),
      utilizationByQuarter: this.calculateUtilizationByQuarter(
        claims,
        periodStart,
        periodEnd
      ),
      projectedUtilization: this.calculateProjectedUtilization(claims),
      remainingBudget: 10000000 - summaryMetrics.totalPaidAmount,
    };

    // Processing performance metrics
    const processingPerformance = {
      averageProcessingTime: summaryMetrics.averageProcessingTime,
      slaCompliance: summaryMetrics.slaComplianceRate,
      bottleneckStages: this.identifyBottleneckStages(claims),
      efficiencyScore: this.calculateEfficiencyScore(claims),
    };

    // Compliance metrics
    const complianceMetrics = {
      complianceScore: this.calculateComplianceScore(),
      violationCount: this.countComplianceViolations(),
      auditReadiness: this.calculateAuditReadiness(),
      riskLevel: this.assessRiskLevel() as 'low' | 'medium' | 'high',
    };

    const dashboard: FundingDashboardData = {
      periodStart,
      periodEnd,
      summaryMetrics,
      approvalRates,
      fundingUtilization: utilizationMetrics,
      processingPerformance,
      complianceMetrics,
      trendAnalysis: this.calculateTrendAnalysis(claims, eligibilityChecks),
      topPerformingCourses: this.identifyTopPerformingCourses(claims),
      riskIndicators: this.generateRiskIndicators(claims),
    };

    this.emit('dashboardGenerated', dashboard);

    return dashboard;
  }

  // ============================================================================
  // COMPLIANCE & AUDIT
  // ============================================================================

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    reportType: 'monthly' | 'quarterly' | 'annual' | 'audit' | 'adhoc',
    periodStart: Date,
    periodEnd: Date
  ): Promise<ComplianceReport> {
    this.logger.info('Generating compliance report', {
      reportType,
      periodStart,
      periodEnd,
    });

    const reportId = this.generateId();
    const generatedAt = new Date();
    const generatedBy = 'system';

    // Filter audit trail for the period
    const periodAuditTrail = this.auditTrail.filter(
      (entry) => entry.timestamp >= periodStart && entry.timestamp <= periodEnd
    );

    // Perform compliance checks
    const complianceChecks =
      await this.performComplianceChecks(periodAuditTrail);

    // Identify violations
    const violations = this.identifyComplianceViolations(complianceChecks);

    // Generate recommendations
    const recommendations = this.generateComplianceRecommendations(violations);

    const report: ComplianceReport = {
      reportId,
      reportType: { type: reportType },
      generatedFor: new Date(),
      generatedAt,
      generatedBy,
      reportPeriod: { startDate: periodStart, endDate: periodEnd },
      complianceChecks,
      violations,
      recommendations,
      auditTrail: periodAuditTrail,
      certificationStatus: {
        isCertified: true,
        certificationBody: 'SSG',
        certificationDate: new Date('2024-01-01'),
        expiryDate: new Date('2025-12-31'),
        certificationLevel: 'Gold',
      },
    };

    this.emit('complianceReportGenerated', report);

    return report;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async performEligibilityChecks(
    request: EligibilityRequest
  ): Promise<EligibilityResponse> {
    const startTime = Date.now();

    // Mock comprehensive eligibility checking logic
    const criteriaChecks = [
      {
        criterion: 'Citizenship/Residency',
        status: 'passed' as const,
        score: 100,
        maxScore: 100,
        description: 'Participant meets citizenship/residency requirements',
        evidence: ['NRIC verified'],
      },
      {
        criterion: 'Age Requirements',
        status: 'passed' as const,
        score: 100,
        maxScore: 100,
        description: 'Participant meets age requirements',
        evidence: ['Age 25-60 range'],
      },
      {
        criterion: 'Employment Status',
        status: 'passed' as const,
        score: 90,
        maxScore: 100,
        description: 'Participant is employed',
        evidence: ['Employment letter provided'],
      },
      {
        criterion: 'Course Eligibility',
        status: 'passed' as const,
        score: 95,
        maxScore: 100,
        description: 'Course meets SSG requirements',
        evidence: ['SSG-approved course'],
      },
      {
        criterion: 'Previous Funding History',
        status: 'passed' as const,
        score: 85,
        maxScore: 100,
        description: 'No excessive previous funding usage',
        evidence: ['Clean funding history'],
      },
    ];

    const overallScore =
      criteriaChecks.reduce((sum, check) => sum + check.score, 0) /
      criteriaChecks.length;
    const passedChecks = criteriaChecks.filter(
      (check) => check.status === 'passed'
    ).length;
    const eligible = overallScore >= 80 && passedChecks >= 4;

    // Mock subsidy calculation
    const maxSubsidyAmount = eligible
      ? Math.min(request.requestedAmount * 0.7, 5000)
      : 0;
    const subsidyPercentage = eligible ? 70 : 0;

    const applicableFundingSchemes = eligible
      ? [
          {
            schemeId: 'wsg-001',
            schemeName: 'WSG Individual Training Grant',
            category: {
              id: 'individual',
              name: 'Individual Training',
              description: 'Individual skills training',
            },
            subsidyPercentage: 70,
            maxSubsidyAmount: 5000,
            applicableConditions: [
              'Singapore Citizen/PR',
              'Employed',
              'Course completion required',
            ],
            priority: 1,
            estimatedProcessingTime: 14,
          },
        ]
      : [];

    const eligibilityResponse: EligibilityResponse = {
      requestId: this.generateId(),
      participantId: request.participantId,
      courseId: request.courseId,
      eligible,
      eligibilityScore: overallScore,
      maxSubsidyAmount,
      subsidyPercentage,
      applicableFundingSchemes,
      eligibilityDetails: {
        criteriaChecks,
        overallScore,
        passedChecks,
        totalChecks: criteriaChecks.length,
        riskAssessment: {
          overallRiskScore: 100 - overallScore,
          riskLevel:
            overallScore >= 90 ? 'low' : overallScore >= 70 ? 'medium' : 'high',
          riskFactors: [],
          mitigationRecommendations: [],
        },
        recommendedAction: {
          action: eligible ? 'approve' : 'reject',
          confidence: overallScore / 100,
          reasoning: eligible
            ? ['All criteria met', 'Good eligibility score']
            : ['Criteria not met'],
          conditions: eligible ? ['Complete course within 6 months'] : [],
        },
      },
      requirements: [],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      processedAt: new Date(),
      processingTime: Date.now() - startTime,
    };

    // Store result
    this.eligibilityChecks.set(
      eligibilityResponse.requestId,
      eligibilityResponse
    );

    return eligibilityResponse;
  }

  private async performSubsidyCalculation(
    request: SubsidyCalculationRequest
  ): Promise<SubsidyCalculationResponse> {
    const calculationId = this.generateId();
    const startTime = Date.now();

    // Mock subsidy calculation logic
    const subsidyBreakdown = request.fundingSchemes.map((schemeId) => ({
      fundingSchemeId: schemeId,
      schemeName: `Funding Scheme ${schemeId}`,
      subsidyAmount: Math.min(request.courseFee * 0.7, 5000),
      subsidyPercentage: 70,
      maxAmount: 5000,
      appliedRules: ['Standard 70% subsidy', 'Cap at $5000'],
      calculationDetails: {
        baseAmount: request.courseFee,
        adjustments: [],
        finalAmount: Math.min(request.courseFee * 0.7, 5000),
        gstApplicable: true,
        gstAmount: Math.min(request.courseFee * 0.7, 5000) * 0.07,
        netAmount: Math.min(request.courseFee * 0.7, 5000) * 1.07,
        rounding: {
          method: 'nearest' as const,
          precision: 2,
          originalAmount: request.courseFee * 0.7,
          roundedAmount: Math.min(request.courseFee * 0.7, 5000),
        },
      },
    }));

    const totalSubsidy = subsidyBreakdown.reduce(
      (sum, breakdown) => sum + breakdown.subsidyAmount,
      0
    );

    const response: SubsidyCalculationResponse = {
      requestId: this.generateId(),
      totalCourseFee: request.courseFee,
      maximumClaimableAmount: totalSubsidy,
      participantContribution: request.courseFee - totalSubsidy,
      governmentContribution: totalSubsidy,
      subsidyBreakdown,
      calculationMethod: 'Standard SSG-WSG calculation',
      applicableRules: [
        {
          ruleId: 'R001',
          ruleName: 'Standard Subsidy Rate',
          ruleType: 'percentage',
          impact: 70,
          description: '70% subsidy rate',
        },
        {
          ruleId: 'R002',
          ruleName: 'Maximum Cap',
          ruleType: 'cap',
          impact: 5000,
          description: 'Maximum $5000 per course',
        },
      ],
      calculatedAt: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      calculationId,
    };

    return response;
  }

  private async createClaimWorkflow(
    claim: ClaimSubmission
  ): Promise<ClaimProcessingWorkflow> {
    const workflowSteps: WorkflowStep[] = [
      {
        stepId: this.generateId(),
        stage: WorkflowStage.INITIAL_REVIEW,
        status: StepStatus.IN_PROGRESS,
        startedAt: new Date(),
        nextPossibleSteps: ['document_verification'],
      },
      {
        stepId: this.generateId(),
        stage: WorkflowStage.DOCUMENT_VERIFICATION,
        status: StepStatus.PENDING,
        startedAt: new Date(),
        nextPossibleSteps: ['eligibility_check'],
      },
      {
        stepId: this.generateId(),
        stage: WorkflowStage.ELIGIBILITY_CHECK,
        status: StepStatus.PENDING,
        startedAt: new Date(),
        nextPossibleSteps: ['financial_verification'],
      },
      {
        stepId: this.generateId(),
        stage: WorkflowStage.FINANCIAL_VERIFICATION,
        status: StepStatus.PENDING,
        startedAt: new Date(),
        nextPossibleSteps: ['manager_approval'],
      },
      {
        stepId: this.generateId(),
        stage: WorkflowStage.MANAGER_APPROVAL,
        status: StepStatus.PENDING,
        startedAt: new Date(),
        nextPossibleSteps: ['payment_preparation'],
      },
    ];

    const approvalLevels: ApprovalLevelConfiguration[] = [
      {
        level: 1,
        approverRole: 'reviewer',
        requiredApprovals: 1,
        currentApprovals: 0,
        timeoutPeriod: 48, // 48 hours
        autoApprovalRules: [
          {
            conditions: [
              'amount < 1000',
              'participant_verified',
              'course_approved',
            ],
            maxAmount: 1000,
            applicableFundingSchemes: ['SSG_SKILLSFUTURE_INDIVIDUAL'],
          },
        ],
      },
      {
        level: 2,
        approverRole: 'manager',
        requiredApprovals: 1,
        currentApprovals: 0,
        approvalThreshold: 5000,
        timeoutPeriod: 72, // 72 hours
        delegationRules: [
          {
            fromRole: 'manager',
            toRole: 'senior_manager',
            conditions: ['amount > 10000', 'manager_unavailable'],
            validFrom: new Date(),
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        ],
      },
      {
        level: 3,
        approverRole: 'senior_manager',
        requiredApprovals: 1,
        currentApprovals: 0,
        approvalThreshold: 20000,
        timeoutPeriod: 96, // 96 hours
      },
    ];

    const workflow: ClaimProcessingWorkflow = {
      claimId: claim.claimId,
      currentStage: WorkflowStage.INITIAL_REVIEW,
      workflowHistory: workflowSteps,
      approvalLevels,
      notifications: [],
      slaTargets: [
        {
          stage: WorkflowStage.INITIAL_REVIEW,
          targetDuration: 2,
          unit: 'days',
          priority: 'high',
        },
        {
          stage: WorkflowStage.DOCUMENT_VERIFICATION,
          targetDuration: 3,
          unit: 'days',
          priority: 'medium',
        },
        {
          stage: WorkflowStage.ELIGIBILITY_CHECK,
          targetDuration: 1,
          unit: 'days',
          priority: 'high',
        },
        {
          stage: WorkflowStage.MANAGER_APPROVAL,
          targetDuration: 5,
          unit: 'days',
          priority: 'medium',
        },
      ],
      escalationRules: [
        {
          trigger: 'time_exceeded',
          threshold: 48,
          escalateTo: ['manager'],
          notificationMethod: 'email',
        },
        {
          trigger: 'amount_threshold',
          threshold: 10000,
          escalateTo: ['senior_manager'],
          notificationMethod: 'email',
        },
      ],
    };

    return workflow;
  }

  private async processClaimWorkflow(
    workflow: ClaimProcessingWorkflow
  ): Promise<void> {
    // Start automated processing of the first step
    const firstStep = workflow.workflowHistory[0];
    if (firstStep.status === StepStatus.IN_PROGRESS) {
      // Simulate automatic initial review
      setTimeout(() => {
        this.completeWorkflowStep(
          workflow.claimId,
          firstStep.stepId,
          'system',
          'Initial review completed automatically'
        );
      }, 1000);
    }
  }

  private async completeWorkflowStep(
    claimId: string,
    stepId: string,
    completedBy: string,
    comments?: string
  ): Promise<void> {
    const workflow = this.workflows.get(claimId);
    if (!workflow) return;

    const step = workflow.workflowHistory.find((s) => s.stepId === stepId);
    if (!step) return;

    step.status = StepStatus.COMPLETED;
    step.completedAt = new Date();
    step.processedBy = completedBy;
    step.comments = comments;
    step.duration = step.completedAt.getTime() - step.startedAt.getTime();

    // Start next step
    const nextStepStage = step.nextPossibleSteps[0];
    if (nextStepStage) {
      const nextStep = workflow.workflowHistory.find(
        (s) =>
          s.stage.toString() === nextStepStage &&
          s.status === StepStatus.PENDING
      );

      if (nextStep) {
        nextStep.status = StepStatus.IN_PROGRESS;
        nextStep.startedAt = new Date();
        workflow.currentStage = nextStep.stage;
      }
    }

    this.workflows.set(claimId, workflow);
    this.emit('workflowStepCompleted', { claimId, stepId, stage: step.stage });
  }

  // Additional helper methods would continue here...
  // (Including methods for validation, cache key generation, processing calculations, etc.)

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateEligibilityCacheKey(request: EligibilityRequest): string {
    return `eligibility:${request.participantId}:${request.courseId}:${request.fundingSchemeId}`;
  }

  private generateSubsidyCacheKey(request: SubsidyCalculationRequest): string {
    return `subsidy:${request.participantId}:${request.courseId}:${request.fundingSchemes.join(',')}`;
  }

  private isEligibilityResultValid(result: EligibilityResponse): boolean {
    return result.validUntil > new Date();
  }

  private isSubsidyCalculationValid(
    result: SubsidyCalculationResponse
  ): boolean {
    return result.validUntil > new Date();
  }

  private async validateClaimSubmission(claim: ClaimSubmission): Promise<void> {
    if (!claim.claimId || !claim.participantId || !claim.courseId) {
      throw new Error('Missing required claim fields');
    }

    if (claim.claimAmount <= 0) {
      throw new Error('Claim amount must be positive');
    }

    if (!claim.documents || claim.documents.length === 0) {
      throw new Error('No supporting documents provided');
    }
  }

  private async recordAuditTrail(entry: AuditTrailEntry): Promise<void> {
    this.auditTrail.push(entry);
    // In production, this would be stored in a database
  }

  private setupEventHandlers(): void {
    this.on('eligibilityChecked', (data) => {
      this.logger.info('Eligibility checked', {
        participantId: data.request.participantId,
        eligible: data.response.eligible,
      });
    });

    this.on('claimSubmitted', (data) => {
      this.logger.info('Claim submitted', {
        claimId: data.claim.claimId,
        amount: data.claim.claimAmount,
      });
    });
  }

  private startBackgroundProcesses(): void {
    // Start periodic reconciliation
    setInterval(
      () => {
        this.processReconciliationBatch('SSG', new Date());
      },
      24 * 60 * 60 * 1000
    ); // Daily

    // Start SLA monitoring
    setInterval(
      () => {
        this.monitorSLACompliance();
      },
      60 * 60 * 1000
    ); // Hourly
  }

  private async monitorSLACompliance(): Promise<void> {
    // Check for claims exceeding SLA targets
    for (const [claimId, workflow] of this.workflows) {
      for (const step of workflow.workflowHistory) {
        if (step.status === StepStatus.IN_PROGRESS) {
          const slaTarget = workflow.slaTargets.find(
            (target) => target.stage === step.stage
          );
          if (slaTarget) {
            const elapsed = Date.now() - step.startedAt.getTime();
            const targetMs =
              slaTarget.targetDuration *
              (slaTarget.unit === 'hours' ? 3600000 : 86400000);

            if (elapsed > targetMs) {
              this.emit('slaBreached', {
                claimId,
                stage: step.stage,
                elapsed,
                target: targetMs,
              });
            }
          }
        }
      }
    }
  }

  // Mock helper methods for dashboard calculations
  private calculateAverageProcessingTime(claims: ClaimSubmission[]): number {
    const completedClaims = claims.filter(
      (c) =>
        c.claimStatus === ClaimStatus.PAID ||
        c.claimStatus === ClaimStatus.APPROVED
    );

    if (completedClaims.length === 0) return 0;

    const totalTime = completedClaims.reduce((sum, claim) => {
      const submittedTime = claim.submittedAt.getTime();
      const completedTime = claim.processedAt?.getTime() || Date.now();
      return sum + (completedTime - submittedTime);
    }, 0);

    return totalTime / completedClaims.length / (24 * 60 * 60 * 1000); // Convert to days
  }

  private calculateSLACompliance(claims: ClaimSubmission[]): number {
    // Mock SLA compliance calculation
    return 85.7; // 85.7% compliance rate
  }

  private calculateApprovalRatesByScheme(checks: EligibilityResponse[]) {
    // Mock calculation
    return [
      {
        schemeId: 'wsg-001',
        schemeName: 'WSG Individual Grant',
        approvalRate: 87.5,
        applicationCount: 245,
      },
      {
        schemeId: 'ssg-002',
        schemeName: 'SSG Company Grant',
        approvalRate: 92.1,
        applicationCount: 156,
      },
    ];
  }

  private calculateApprovalRatesByProvider(claims: ClaimSubmission[]) {
    // Mock calculation
    return [
      {
        providerId: 'tp-001',
        providerName: 'Training Provider A',
        approvalRate: 88.9,
        applicationCount: 89,
      },
      {
        providerId: 'tp-002',
        providerName: 'Training Provider B',
        approvalRate: 91.3,
        applicationCount: 67,
      },
    ];
  }

  private calculateApprovalRatesByAmount(checks: EligibilityResponse[]) {
    return [
      { range: '$0 - $1,000', approvalRate: 95.2, applicationCount: 123 },
      { range: '$1,001 - $3,000', approvalRate: 87.8, applicationCount: 187 },
      { range: '$3,001 - $5,000', approvalRate: 82.4, applicationCount: 91 },
    ];
  }

  private calculateMonthlyApprovalTrend(
    checks: EligibilityResponse[],
    start: Date,
    end: Date
  ) {
    return [
      { month: '2024-01', approvalRate: 85.3, applicationCount: 156 },
      { month: '2024-02', approvalRate: 87.1, applicationCount: 178 },
      { month: '2024-03', approvalRate: 88.9, applicationCount: 165 },
    ];
  }

  private calculateUtilizationByScheme(claims: ClaimSubmission[]) {
    return [
      {
        schemeId: 'wsg-001',
        schemeName: 'WSG Individual Grant',
        budgetAllocated: 2000000,
        budgetUtilized: 1650000,
        utilizationRate: 82.5,
      },
      {
        schemeId: 'ssg-002',
        schemeName: 'SSG Company Grant',
        budgetAllocated: 3000000,
        budgetUtilized: 2100000,
        utilizationRate: 70.0,
      },
    ];
  }

  private calculateUtilizationByQuarter(
    claims: ClaimSubmission[],
    start: Date,
    end: Date
  ) {
    return [
      { quarter: 'Q1 2024', budgetUtilized: 1200000, utilizationRate: 24.0 },
      { quarter: 'Q2 2024', budgetUtilized: 1500000, utilizationRate: 30.0 },
      { quarter: 'Q3 2024', budgetUtilized: 1050000, utilizationRate: 21.0 },
    ];
  }

  private calculateProjectedUtilization(claims: ClaimSubmission[]): number {
    return 4200000; // Mock projected utilization
  }

  private identifyBottleneckStages(claims: ClaimSubmission[]): string[] {
    return ['Document Verification', 'Manager Approval'];
  }

  private calculateEfficiencyScore(claims: ClaimSubmission[]): number {
    return 78.5; // Mock efficiency score
  }

  private calculateComplianceScore(): number {
    return 92.3;
  }

  private countComplianceViolations(): number {
    return 3;
  }

  private calculateAuditReadiness(): number {
    return 87.6;
  }

  private assessRiskLevel(): string {
    return 'low';
  }

  private calculateTrendAnalysis(
    claims: ClaimSubmission[],
    checks: EligibilityResponse[]
  ) {
    return [
      {
        metric: 'Application Volume',
        trend: 'increasing' as const,
        changePercentage: 12.5,
        period: 'monthly',
      },
      {
        metric: 'Approval Rate',
        trend: 'stable' as const,
        changePercentage: 2.1,
        period: 'monthly',
      },
      {
        metric: 'Processing Time',
        trend: 'decreasing' as const,
        changePercentage: -8.3,
        period: 'monthly',
      },
    ];
  }

  private identifyTopPerformingCourses(claims: ClaimSubmission[]) {
    return [
      {
        courseId: 'c-001',
        courseName: 'Digital Marketing Fundamentals',
        applicationCount: 89,
        approvalRate: 92.1,
        averageClaimAmount: 2100,
        completionRate: 87.6,
      },
      {
        courseId: 'c-002',
        courseName: 'Data Analytics with Python',
        applicationCount: 76,
        approvalRate: 89.5,
        averageClaimAmount: 3200,
        completionRate: 91.2,
      },
      {
        courseId: 'c-003',
        courseName: 'Project Management Professional',
        applicationCount: 65,
        approvalRate: 94.6,
        averageClaimAmount: 2800,
        completionRate: 89.3,
      },
    ];
  }

  private generateRiskIndicators(claims: ClaimSubmission[]) {
    return [
      {
        indicator: 'Fraud Detection Score',
        value: 2.1,
        threshold: 5.0,
        status: 'normal' as const,
        trend: 'stable' as const,
      },
      {
        indicator: 'SLA Breach Rate',
        value: 14.3,
        threshold: 15.0,
        status: 'warning' as const,
        trend: 'improving' as const,
      },
      {
        indicator: 'Budget Overrun Risk',
        value: 8.7,
        threshold: 10.0,
        status: 'normal' as const,
        trend: 'stable' as const,
      },
    ];
  }

  private async updateWorkflowProgress(
    workflow: ClaimProcessingWorkflow,
    status: ClaimStatus,
    updatedBy: string,
    comments?: string
  ): Promise<void> {
    // Update workflow based on claim status change
    const notification: NotificationLog = {
      id: this.generateId(),
      type: 'system',
      recipient: 'workflow-engine',
      subject: `Claim ${workflow.claimId} status updated`,
      content: `Status changed to ${status}`,
      sentAt: new Date(),
      deliveryStatus: 'delivered',
    };

    workflow.notifications.push(notification);
    this.workflows.set(workflow.claimId, workflow);
  }

  private async processNextWorkflowStep(
    workflow: ClaimProcessingWorkflow
  ): Promise<void> {
    // Auto-progress workflow based on business rules
    const currentStep = workflow.workflowHistory.find(
      (step) =>
        step.stage === workflow.currentStage &&
        step.status === StepStatus.IN_PROGRESS
    );

    if (currentStep && currentStep.nextPossibleSteps.length > 0) {
      // Auto-approve if conditions are met
      const autoApprovalLevel = workflow.approvalLevels.find((level) =>
        level.autoApprovalRules?.some((rule) =>
          this.evaluateAutoApprovalRule(rule, workflow.claimId)
        )
      );

      if (autoApprovalLevel) {
        await this.completeWorkflowStep(
          workflow.claimId,
          currentStep.stepId,
          'auto-approval',
          'Auto-approved based on business rules'
        );
      }
    }
  }

  private async progressWorkflowToNextStage(
    workflow: ClaimProcessingWorkflow
  ): Promise<void> {
    // Progress workflow to next stage based on current stage
    const stageOrder = [
      WorkflowStage.INITIAL_REVIEW,
      WorkflowStage.DOCUMENT_VERIFICATION,
      WorkflowStage.ELIGIBILITY_CHECK,
      WorkflowStage.FINANCIAL_VERIFICATION,
      WorkflowStage.MANAGER_APPROVAL,
      WorkflowStage.PAYMENT_PREPARATION,
      WorkflowStage.PAYMENT_EXECUTION,
      WorkflowStage.COMPLETION,
    ];

    const currentIndex = stageOrder.indexOf(workflow.currentStage);
    if (currentIndex < stageOrder.length - 1) {
      workflow.currentStage = stageOrder[currentIndex + 1];

      // Start next step
      const nextStep = workflow.workflowHistory.find(
        (step) =>
          step.stage === workflow.currentStage &&
          step.status === StepStatus.PENDING
      );

      if (nextStep) {
        nextStep.status = StepStatus.IN_PROGRESS;
        nextStep.startedAt = new Date();
      }
    }

    this.workflows.set(workflow.claimId, workflow);
  }

  private evaluateAutoApprovalRule(rule: any, claimId: string): boolean {
    const claim = this.claims.get(claimId);
    if (!claim) return false;

    // Mock auto-approval rule evaluation
    if (rule.maxAmount && claim.claimAmount <= rule.maxAmount) {
      return true;
    }

    return false;
  }

  private detectReconciliationDiscrepancies(
    items: ReconciliationItem[]
  ): Discrepancy[] {
    const discrepancies: Discrepancy[] = [];

    for (const item of items) {
      if (Math.abs(item.difference) > 0.01) {
        // More than 1 cent difference
        discrepancies.push({
          discrepancyId: this.generateId(),
          type: DiscrepancyType.AMOUNT_MISMATCH,
          severity: Math.abs(item.difference) > 100 ? 'high' : 'medium',
          description: `Amount mismatch for claim ${item.claimId}: expected ${item.expectedAmount}, received ${item.receivedAmount}`,
          affectedClaims: [item.claimId],
          potentialImpact: Math.abs(item.difference),
          resolutionStatus: { status: 'open', priority: 'medium' },
          detectedAt: new Date(),
        });
      }
    }

    return discrepancies;
  }

  private async performComplianceChecks(auditTrail: AuditTrailEntry[]) {
    return [
      {
        checkId: 'C001',
        checkType: { type: 'regulatory' as const },
        description: 'SSG Compliance Check',
        status: 'passed' as const,
        severity: 'high' as const,
        evidence: ['All claims processed within regulatory guidelines'],
        recommendedAction: 'Continue current practices',
      },
      {
        checkId: 'C002',
        checkType: { type: 'internal' as const },
        description: 'Internal Policy Compliance',
        status: 'warning' as const,
        severity: 'medium' as const,
        evidence: ['3 instances of minor policy deviations'],
        recommendedAction: 'Review policy training materials',
      },
    ];
  }

  private identifyComplianceViolations(checks: any[]) {
    return checks
      .filter((check) => check.status === 'failed')
      .map((check) => ({
        violationId: this.generateId(),
        type: 'Policy Violation',
        severity: check.severity,
        description: check.description,
        affectedRecords: [],
        detectedAt: new Date(),
        status: 'open' as const,
      }));
  }

  private generateComplianceRecommendations(violations: any[]) {
    return violations.map((violation) => ({
      recommendationId: this.generateId(),
      category: 'Process Improvement',
      priority: violation.severity,
      description: `Address ${violation.type}: ${violation.description}`,
      implementationCost: 5000,
      timelineWeeks: 4,
      expectedBenefit: 'Improved compliance score and reduced risk',
    }));
  }
}

export default FundingClaimsService;
