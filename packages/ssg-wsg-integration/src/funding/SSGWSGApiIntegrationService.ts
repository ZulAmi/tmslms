/**
 * SSG-WSG API Integration Service
 * Real-time API communication with government funding systems
 */

import { EventEmitter } from 'events';
import { SSGWSGApiClient } from '../client/ApiClient';
import { CacheService } from '../cache/CacheService';
import {
  EligibilityRequest,
  EligibilityResponse,
  ClaimSubmission,
  SubsidyCalculationRequest,
  SubsidyCalculationResponse,
  ReconciliationBatch,
} from './types';

export interface APIEndpoints {
  eligibility: {
    check: string;
    bulk: string;
    verify: string;
  };
  claims: {
    submit: string;
    status: string;
    update: string;
    bulk: string;
  };
  subsidy: {
    calculate: string;
    schemes: string;
    rates: string;
  };
  reconciliation: {
    batch: string;
    status: string;
    discrepancies: string;
  };
  reporting: {
    compliance: string;
    financial: string;
    analytics: string;
  };
}

export interface APIConfiguration {
  baseUrl: string;
  version: string;
  timeout: number;
  retryAttempts: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  authentication: {
    clientId: string;
    clientSecret: string;
    scope: string[];
  };
  endpoints: APIEndpoints;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    rateLimit: {
      remaining: number;
      reset: Date;
    };
  };
}

export interface RealTimeNotification {
  type:
    | 'eligibility_approved'
    | 'claim_processed'
    | 'payment_completed'
    | 'document_required'
    | 'system_alert';
  participantId?: string;
  claimId?: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  actionRequired?: boolean;
  actionUrl?: string;
  expiresAt?: Date;
}

/**
 * Real-time SSG-WSG API Integration Service
 */
export class SSGWSGApiIntegrationService extends EventEmitter {
  private apiClient: SSGWSGApiClient;
  private cache: CacheService;
  private config: APIConfiguration;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(
    apiClient: SSGWSGApiClient,
    cache: CacheService,
    config: APIConfiguration
  ) {
    super();
    this.apiClient = apiClient;
    this.cache = cache;
    this.config = config;
    this.setupRealtimeConnection();
    this.startHealthCheck();
  }

  // ============================================================================
  // ELIGIBILITY API METHODS
  // ============================================================================

  /**
   * Real-time eligibility verification with SSG APIs
   */
  async verifyEligibilityWithSSG(
    request: EligibilityRequest
  ): Promise<APIResponse<EligibilityResponse>> {
    const startTime = Date.now();

    try {
      // Call real SSG eligibility API
      const response = await this.apiClient.post<EligibilityResponse>(
        this.config.endpoints.eligibility.check,
        {
          participant: {
            nric: request.participantDetails.nric,
            nationality: request.participantDetails.nationality,
            employment_status: request.participantDetails.employmentStatus,
            monthly_income: request.participantDetails.monthlyIncome,
            education_level: request.participantDetails.educationLevel,
          },
          course: {
            course_id: request.courseId,
            course_fee: request.requestedAmount,
            provider: request.trainingProvider,
            skills_alignment: request.courseDetails.skillsFrameworkAlignment,
          },
          funding_scheme: request.fundingSchemeId,
          requested_amount: request.requestedAmount,
        }
      );

      const processingTime = Date.now() - startTime;

      // Transform SSG response to internal format
      const eligibilityResponse = this.transformSSGEligibilityResponse(
        response.data
      );

      // Cache the result
      const cacheKey = `ssg_eligibility:${request.participantId}:${request.courseId}`;
      await this.cache.set(cacheKey, eligibilityResponse, { ttl: 3600 });

      // Real-time notification
      await this.sendRealtimeNotification({
        type: eligibilityResponse.eligible
          ? 'eligibility_approved'
          : 'system_alert',
        participantId: request.participantId,
        message: eligibilityResponse.eligible
          ? `Eligibility approved for ${request.courseDetails.courseTitle}`
          : `Eligibility check failed: ${eligibilityResponse.eligibilityDetails.recommendedAction.reasoning.join(', ')}`,
        priority: eligibilityResponse.eligible ? 'medium' : 'high',
        timestamp: new Date(),
        actionRequired: !eligibilityResponse.eligible,
        actionUrl: !eligibilityResponse.eligible
          ? `/eligibility/${request.participantId}/review`
          : undefined,
      });

      return {
        success: true,
        data: eligibilityResponse,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime,
          rateLimit: {
            remaining: 45, // Mock rate limit
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.emit('apiError', {
        endpoint: 'eligibility.check',
        error: error instanceof Error ? error.message : String(error),
        request,
        timestamp: new Date(),
      });

      return {
        success: false,
        error: {
          code: 'ELIGIBILITY_CHECK_FAILED',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime,
          rateLimit: {
            remaining: 45,
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    }
  }

  /**
   * Bulk eligibility verification with batch processing
   */
  async bulkVerifyEligibility(
    requests: EligibilityRequest[]
  ): Promise<APIResponse<EligibilityResponse[]>> {
    const startTime = Date.now();
    const batchId = this.generateRequestId();

    try {
      // Split into batches to respect API limits
      const batchSize = 50;
      const batches = this.chunkArray(requests, batchSize);
      const results: EligibilityResponse[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        const batchResponse = await this.apiClient.post<EligibilityResponse[]>(
          this.config.endpoints.eligibility.bulk,
          {
            batch_id: `${batchId}_${i}`,
            requests: batch.map((req) => this.transformEligibilityRequest(req)),
          }
        );

        // Transform and add to results
        const transformedResults = batchResponse.data.map((resp) =>
          this.transformSSGEligibilityResponse(resp)
        );
        results.push(...transformedResults);

        // Small delay between batches to respect rate limits
        if (i < batches.length - 1) {
          await this.delay(1000);
        }
      }

      const processingTime = Date.now() - startTime;

      // Send batch completion notification
      await this.sendRealtimeNotification({
        type: 'system_alert',
        message: `Bulk eligibility verification completed: ${results.length} applications processed`,
        priority: 'medium',
        timestamp: new Date(),
        actionRequired: false,
      });

      return {
        success: true,
        data: results,
        metadata: {
          requestId: batchId,
          timestamp: new Date().toISOString(),
          processingTime,
          rateLimit: {
            remaining: 40,
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BULK_ELIGIBILITY_FAILED',
          message:
            error instanceof Error ? error.message : 'Bulk verification failed',
          details: error,
        },
        metadata: {
          requestId: batchId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          rateLimit: {
            remaining: 40,
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    }
  }

  // ============================================================================
  // CLAIMS API METHODS
  // ============================================================================

  /**
   * Submit claim directly to SSG-WSG system
   */
  async submitClaimToSSG(
    claim: ClaimSubmission
  ): Promise<
    APIResponse<{ claimId: string; referenceNumber: string; status: string }>
  > {
    const startTime = Date.now();

    try {
      const response = await this.apiClient.post(
        this.config.endpoints.claims.submit,
        {
          claim_id: claim.claimId,
          participant: {
            id: claim.participantId,
            nric: claim.participantDeclaration.hasCompletedCourse
              ? 'verified'
              : 'pending',
          },
          course: {
            id: claim.courseId,
            completion_date: claim.completionDetails.courseEndDate,
            attendance_percentage: claim.completionDetails.attendancePercentage,
            assessment_score: claim.completionDetails.assessmentScore,
          },
          funding: {
            scheme_id: claim.fundingSchemeId,
            requested_amount: claim.claimAmount,
            currency: claim.currency,
          },
          documents: claim.documents.map((doc) => ({
            type: doc.documentType,
            filename: doc.fileName,
            checksum: doc.checksum,
            verified: doc.verified,
          })),
          declarations: {
            participant: claim.participantDeclaration,
            provider: claim.trainingProviderDeclaration,
          },
        }
      );

      const processingTime = Date.now() - startTime;

      // Send real-time notification
      await this.sendRealtimeNotification({
        type: 'claim_processed',
        participantId: claim.participantId,
        claimId: claim.claimId,
        message: `Claim ${claim.claimId} submitted successfully. Reference: ${response.data.referenceNumber}`,
        priority: 'medium',
        timestamp: new Date(),
        actionRequired: false,
        actionUrl: `/claims/${claim.claimId}/status`,
      });

      return {
        success: true,
        data: response.data,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime,
          rateLimit: {
            remaining: 35,
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    } catch (error) {
      this.emit('claimSubmissionFailed', {
        claimId: claim.claimId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });

      return {
        success: false,
        error: {
          code: 'CLAIM_SUBMISSION_FAILED',
          message:
            error instanceof Error ? error.message : 'Claim submission failed',
          details: error,
        },
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          rateLimit: {
            remaining: 35,
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    }
  }

  /**
   * Get real-time claim status from SSG system
   */
  async getClaimStatus(claimId: string): Promise<
    APIResponse<{
      status: string;
      lastUpdated: Date;
      processingStage: string;
      estimatedCompletion: Date;
      messages: Array<{
        type: 'info' | 'warning' | 'error';
        message: string;
        timestamp: Date;
      }>;
    }>
  > {
    try {
      const response = await this.apiClient.get(
        `${this.config.endpoints.claims.status}/${claimId}`
      );

      return {
        success: true,
        data: response.data,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime: 150, // Mock processing time
          rateLimit: {
            remaining: 48,
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLAIM_STATUS_FAILED',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to get claim status',
          details: error,
        },
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime: 150,
          rateLimit: {
            remaining: 48,
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    }
  }

  // ============================================================================
  // SUBSIDY CALCULATION API
  // ============================================================================

  /**
   * Get real-time subsidy rates and calculate amounts
   */
  async calculateSubsidyWithSSG(
    request: SubsidyCalculationRequest
  ): Promise<APIResponse<SubsidyCalculationResponse>> {
    const startTime = Date.now();

    try {
      // First get current subsidy schemes
      const schemesResponse = await this.apiClient.get(
        this.config.endpoints.subsidy.schemes,
        {
          params: {
            participant_profile: request.participantProfile,
            course_category: request.courseId,
            calculation_date: request.calculationDate,
          },
        }
      );

      // Then calculate subsidy
      const calculationResponse = await this.apiClient.post(
        this.config.endpoints.subsidy.calculate,
        {
          participant_id: request.participantId,
          course_id: request.courseId,
          course_fee: request.courseFee,
          applicable_schemes: schemesResponse.data.schemes,
          calculation_context: {
            date: request.calculationDate,
            currency: request.currency,
            participant_profile: request.participantProfile,
            company_profile: request.companyProfile,
          },
        }
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: calculationResponse.data,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime,
          rateLimit: {
            remaining: 42,
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SUBSIDY_CALCULATION_FAILED',
          message:
            error instanceof Error
              ? error.message
              : 'Subsidy calculation failed',
          details: error,
        },
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          rateLimit: {
            remaining: 42,
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    }
  }

  // ============================================================================
  // RECONCILIATION API
  // ============================================================================

  /**
   * Submit reconciliation batch to SSG system
   */
  async submitReconciliationBatch(batch: ReconciliationBatch): Promise<
    APIResponse<{
      batchId: string;
      status: 'accepted' | 'rejected' | 'pending_review';
      matchedItems: number;
      discrepancies: number;
      processingEstimate: string;
    }>
  > {
    try {
      const response = await this.apiClient.post(
        this.config.endpoints.reconciliation.batch,
        {
          batch_id: batch.batchId,
          batch_date: batch.batchDate,
          payment_provider: batch.paymentProvider,
          items: batch.reconciliationItems.map((item) => ({
            claim_id: item.claimId,
            expected_amount: item.expectedAmount,
            received_amount: item.receivedAmount,
            payment_reference: item.paymentReference,
            transaction_date: item.paymentDate,
          })),
        }
      );

      // Send notification for significant discrepancies
      if (response.data.discrepancies > 0) {
        await this.sendRealtimeNotification({
          type: 'system_alert',
          message: `Reconciliation batch ${batch.batchId} has ${response.data.discrepancies} discrepancies requiring attention`,
          priority: response.data.discrepancies > 5 ? 'high' : 'medium',
          timestamp: new Date(),
          actionRequired: true,
          actionUrl: `/reconciliation/${batch.batchId}/discrepancies`,
        });
      }

      return {
        success: true,
        data: response.data,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime: 250,
          rateLimit: {
            remaining: 38,
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RECONCILIATION_SUBMISSION_FAILED',
          message:
            error instanceof Error
              ? error.message
              : 'Reconciliation submission failed',
          details: error,
        },
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime: 250,
          rateLimit: {
            remaining: 38,
            reset: new Date(Date.now() + 60000),
          },
        },
      };
    }
  }

  // ============================================================================
  // REAL-TIME FEATURES
  // ============================================================================

  /**
   * Setup WebSocket connection for real-time updates
   */
  private setupRealtimeConnection(): void {
    // Mock WebSocket connection setup
    this.isConnected = true;
    this.emit('connected', { timestamp: new Date() });

    // Simulate periodic real-time updates
    setInterval(() => {
      if (this.isConnected) {
        this.handleRealtimeUpdate();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Handle incoming real-time updates
   */
  private handleRealtimeUpdate(): void {
    // Mock real-time updates
    const updateTypes = [
      'claim_status_change',
      'payment_processed',
      'document_verified',
      'system_maintenance',
    ];
    const randomUpdate =
      updateTypes[Math.floor(Math.random() * updateTypes.length)];

    this.emit('realtimeUpdate', {
      type: randomUpdate,
      timestamp: new Date(),
      data: {
        message: `System update: ${randomUpdate}`,
        affectedItems: Math.floor(Math.random() * 10) + 1,
      },
    });
  }

  /**
   * Send real-time notification to participants/admins
   */
  private async sendRealtimeNotification(
    notification: RealTimeNotification
  ): Promise<void> {
    // Mock notification delivery
    this.emit('notificationSent', notification);

    // Store notification for retrieval
    const cacheKey = `notification:${notification.participantId || 'system'}:${Date.now()}`;
    await this.cache.set(cacheKey, notification, { ttl: 86400 }); // 24 hours
  }

  /**
   * Start health check monitoring
   */
  private startHealthCheck(): void {
    setInterval(async () => {
      try {
        // Mock health check
        const healthResponse = await this.performHealthCheck();

        if (!healthResponse.healthy) {
          this.handleConnectionIssue();
        } else {
          this.reconnectAttempts = 0; // Reset on successful health check
        }

        this.emit('healthCheck', healthResponse);
      } catch (error) {
        this.handleConnectionIssue();
      }
    }, 60000); // Every minute
  }

  private async performHealthCheck(): Promise<{
    healthy: boolean;
    responseTime: number;
    services: any[];
  }> {
    // Mock health check
    return {
      healthy: Math.random() > 0.05, // 95% uptime simulation
      responseTime: Math.random() * 1000 + 200,
      services: [
        { name: 'eligibility-api', status: 'healthy' },
        { name: 'claims-api', status: 'healthy' },
        { name: 'subsidy-api', status: 'healthy' },
        { name: 'reconciliation-api', status: 'healthy' },
      ],
    };
  }

  private handleConnectionIssue(): void {
    this.isConnected = false;
    this.reconnectAttempts++;

    this.emit('connectionIssue', {
      attempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      timestamp: new Date(),
    });

    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      setTimeout(
        () => {
          this.attemptReconnection();
        },
        Math.pow(2, this.reconnectAttempts) * 1000
      ); // Exponential backoff
    }
  }

  private async attemptReconnection(): Promise<void> {
    try {
      // Mock reconnection attempt
      await this.delay(1000);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      this.emit('reconnected', { timestamp: new Date() });
    } catch (error) {
      this.handleConnectionIssue();
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private transformSSGEligibilityResponse(
    ssgResponse: any
  ): EligibilityResponse {
    // Transform SSG API response to internal format
    return {
      requestId: ssgResponse.request_id || this.generateRequestId(),
      participantId: ssgResponse.participant_id,
      courseId: ssgResponse.course_id,
      eligible: ssgResponse.eligible,
      eligibilityScore: ssgResponse.eligibility_score || 0,
      maxSubsidyAmount: ssgResponse.max_subsidy_amount || 0,
      subsidyPercentage: ssgResponse.subsidy_percentage || 0,
      applicableFundingSchemes: ssgResponse.applicable_schemes || [],
      eligibilityDetails: ssgResponse.eligibility_details || {},
      requirements: ssgResponse.requirements || [],
      validUntil: new Date(
        ssgResponse.valid_until || Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
      processedAt: new Date(ssgResponse.processed_at || Date.now()),
      processingTime: ssgResponse.processing_time || 0,
    };
  }

  private transformEligibilityRequest(request: EligibilityRequest): any {
    // Transform internal request to SSG API format
    return {
      participant_id: request.participantId,
      course_id: request.courseId,
      funding_scheme_id: request.fundingSchemeId,
      requested_amount: request.requestedAmount,
      participant_details: request.participantDetails,
      course_details: request.courseDetails,
      company_details: request.companyDetails,
    };
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default SSGWSGApiIntegrationService;
