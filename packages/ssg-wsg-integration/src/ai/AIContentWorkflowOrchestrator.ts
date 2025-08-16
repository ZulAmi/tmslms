/**
 * AI Content Workflow Orchestrator
 * Manages complex AI content generation workflows with human review gates,
 * version control, quality assurance, and compliance checking
 */

import { EventEmitter } from 'events';
import { AIContentGenerationService } from './AIContentGenerationService';
import { AIContentIntegrationService } from './AIContentIntegrationService';
import { CacheService } from '../cache/CacheService';

// Workflow Types
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  stages: WorkflowStage[];
  triggers: WorkflowTrigger[];
  approval: ApprovalConfiguration;
  sla: ServiceLevelAgreement;
}

export interface WorkflowStage {
  id: string;
  name: string;
  type:
    | 'ai_generation'
    | 'human_review'
    | 'quality_check'
    | 'compliance_check'
    | 'approval'
    | 'deployment';
  configuration: Record<string, any>;
  dependencies: string[];
  timeout: number;
  retryPolicy: RetryPolicy;
  fallback?: WorkflowStage;
}

export interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'api';
  configuration: Record<string, any>;
  conditions: TriggerCondition[];
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface ApprovalConfiguration {
  required: boolean;
  approvers: ApproverConfig[];
  escalation: EscalationPolicy;
  deadline: number; // hours
}

export interface ApproverConfig {
  userId: string;
  role: string;
  weight: number;
  canVeto: boolean;
}

export interface EscalationPolicy {
  levels: EscalationLevel[];
  autoApprove: boolean;
  notificationChannels: string[];
}

export interface EscalationLevel {
  hours: number;
  approvers: string[];
  actions: string[];
}

export interface ServiceLevelAgreement {
  maxProcessingTime: number;
  qualityThreshold: number;
  availabilityTarget: number;
  responseTimeTarget: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelay: number;
  maxDelay: number;
}

// Execution Types
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  input: Record<string, any>;
  output?: Record<string, any>;
  stages: StageExecution[];
  metrics: ExecutionMetrics;
  error?: WorkflowError;
}

export interface StageExecution {
  stageId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  input: Record<string, any>;
  output?: Record<string, any>;
  attempts: number;
  error?: string;
  humanReview?: HumanReviewRecord;
}

export interface ExecutionMetrics {
  totalTime: number;
  aiProcessingTime: number;
  humanReviewTime: number;
  qualityScore: number;
  cost: number;
  apiCalls: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  apiCalls: number;
  tokensUsed: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface WorkflowError {
  code: string;
  message: string;
  stage?: string;
  timestamp: Date;
  recoverable: boolean;
  details?: Record<string, any>;
}

export interface HumanReviewRecord {
  reviewerId: string;
  reviewedAt: Date;
  decision: 'approved' | 'rejected' | 'needs_revision';
  feedback: string;
  qualityScore: number;
  timeSpent: number;
  modifications?: Record<string, any>;
}

// Quality Control Types
export interface QualityGate {
  id: string;
  name: string;
  criteria: QualityCriterion[];
  threshold: number;
  mandatory: boolean;
  automatedCheck: boolean;
}

export interface QualityCriterion {
  name: string;
  weight: number;
  validator: QualityValidator;
  threshold: number;
}

export interface QualityValidator {
  type: 'ai_score' | 'rule_based' | 'human_review' | 'external_api';
  configuration: Record<string, any>;
}

export interface QualityCheckResult {
  passed: boolean;
  score: number;
  criteriaResults: CriterionResult[];
  recommendations: string[];
  requiresHumanReview: boolean;
}

export interface CriterionResult {
  criterion: string;
  score: number;
  passed: boolean;
  details: string;
}

// ============================================================================
// MAIN ORCHESTRATOR CLASS
// ============================================================================

export class AIContentWorkflowOrchestrator extends EventEmitter {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private aiService: AIContentGenerationService;
  private integrationService: AIContentIntegrationService;
  private cache: CacheService;
  private qualityGates: Map<string, QualityGate> = new Map();

  constructor(config: {
    aiService: AIContentGenerationService;
    integrationService: AIContentIntegrationService;
    cache: CacheService;
  }) {
    super();

    this.aiService = config.aiService;
    this.integrationService = config.integrationService;
    this.cache = config.cache;

    this.initializeDefaultWorkflows();
    this.initializeQualityGates();

    console.log('🎭 AI Content Workflow Orchestrator initialized');
  }

  // ============================================================================
  // WORKFLOW MANAGEMENT
  // ============================================================================

  /**
   * Register a new workflow definition
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.validateWorkflow(workflow);
    this.workflows.set(workflow.id, workflow);

    console.log(`📋 Registered workflow: ${workflow.name}`);
    this.emit('workflowRegistered', {
      workflowId: workflow.id,
      name: workflow.name,
    });
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    input: Record<string, any>
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const executionId = `exec_${workflowId}_${Date.now()}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'pending',
      startTime: new Date(),
      input,
      stages: workflow.stages.map((stage) => ({
        stageId: stage.id,
        status: 'pending',
        input: {},
        attempts: 0,
      })),
      metrics: {
        totalTime: 0,
        aiProcessingTime: 0,
        humanReviewTime: 0,
        qualityScore: 0,
        cost: 0,
        apiCalls: 0,
        resourceUsage: {
          apiCalls: 0,
          tokensUsed: 0,
          cacheHits: 0,
          cacheMisses: 0,
        },
      },
    };

    this.executions.set(executionId, execution);

    console.log(`🚀 Starting workflow execution: ${executionId}`);
    this.emit('workflowStarted', { executionId, workflowId });

    try {
      execution.status = 'running';
      await this.processWorkflow(execution, workflow);

      execution.status = 'completed';
      execution.endTime = new Date();
      execution.metrics.totalTime =
        execution.endTime.getTime() - execution.startTime.getTime();

      console.log(`✅ Workflow completed: ${executionId}`);
      this.emit('workflowCompleted', {
        executionId,
        metrics: execution.metrics,
      });
    } catch (error) {
      execution.status = 'failed';
      execution.error = {
        code: 'WORKFLOW_EXECUTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        recoverable: false,
      };

      console.error(`❌ Workflow failed: ${executionId}`, error);
      this.emit('workflowFailed', { executionId, error: execution.error });
    }

    return execution;
  }

  /**
   * Cancel a running workflow
   */
  async cancelWorkflow(executionId: string, reason: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') {
      throw new Error(`Cannot cancel workflow: ${executionId}`);
    }

    execution.status = 'cancelled';
    execution.endTime = new Date();

    console.log(`🛑 Workflow cancelled: ${executionId} - ${reason}`);
    this.emit('workflowCancelled', { executionId, reason });
  }

  // ============================================================================
  // STAGE PROCESSING
  // ============================================================================

  private async processWorkflow(
    execution: WorkflowExecution,
    workflow: WorkflowDefinition
  ): Promise<void> {
    const stageMap = new Map(workflow.stages.map((s) => [s.id, s]));
    const completed = new Set<string>();
    const remaining = new Set(workflow.stages.map((s) => s.id));

    while (remaining.size > 0) {
      // Find stages ready to execute (dependencies satisfied)
      const ready = Array.from(remaining).filter((stageId) => {
        const stage = stageMap.get(stageId)!;
        return stage.dependencies.every((dep) => completed.has(dep));
      });

      if (ready.length === 0) {
        throw new Error('Workflow deadlock: no stages ready to execute');
      }

      // Process ready stages in parallel
      await Promise.all(
        ready.map(async (stageId) => {
          try {
            await this.processStage(execution, stageMap.get(stageId)!);
            completed.add(stageId);
            remaining.delete(stageId);
          } catch (error) {
            // Handle stage failure
            const stage = stageMap.get(stageId)!;
            if (stage.fallback) {
              console.log(`🔄 Stage ${stageId} failed, trying fallback`);
              await this.processStage(execution, stage.fallback);
              completed.add(stageId);
              remaining.delete(stageId);
            } else {
              throw error;
            }
          }
        })
      );
    }
  }

  private async processStage(
    execution: WorkflowExecution,
    stage: WorkflowStage
  ): Promise<void> {
    const stageExecution = execution.stages.find(
      (s) => s.stageId === stage.id
    )!;

    console.log(`🔄 Processing stage: ${stage.name}`);
    stageExecution.status = 'running';
    stageExecution.startTime = new Date();
    stageExecution.attempts++;

    this.emit('stageStarted', { executionId: execution.id, stageId: stage.id });

    try {
      let result: any;

      switch (stage.type) {
        case 'ai_generation':
          result = await this.processAIGenerationStage(execution, stage);
          break;
        case 'human_review':
          result = await this.processHumanReviewStage(execution, stage);
          break;
        case 'quality_check':
          result = await this.processQualityCheckStage(execution, stage);
          break;
        case 'compliance_check':
          result = await this.processComplianceCheckStage(execution, stage);
          break;
        case 'approval':
          result = await this.processApprovalStage(execution, stage);
          break;
        case 'deployment':
          result = await this.processDeploymentStage(execution, stage);
          break;
        default:
          throw new Error(`Unknown stage type: ${stage.type}`);
      }

      stageExecution.status = 'completed';
      stageExecution.endTime = new Date();
      stageExecution.output = result;

      this.emit('stageCompleted', {
        executionId: execution.id,
        stageId: stage.id,
      });
    } catch (error) {
      stageExecution.status = 'failed';
      stageExecution.error =
        error instanceof Error ? error.message : 'Unknown error';

      // Retry logic
      if (stageExecution.attempts < stage.retryPolicy.maxAttempts) {
        const delay = this.calculateRetryDelay(
          stage.retryPolicy,
          stageExecution.attempts
        );
        console.log(
          `🔄 Retrying stage ${stage.id} in ${delay}ms (attempt ${stageExecution.attempts})`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.processStage(execution, stage);
      }

      this.emit('stageFailed', {
        executionId: execution.id,
        stageId: stage.id,
        error,
      });
      throw error;
    }
  }

  // ============================================================================
  // STAGE IMPLEMENTATIONS
  // ============================================================================

  private async processAIGenerationStage(
    execution: WorkflowExecution,
    stage: WorkflowStage
  ): Promise<any> {
    const config = stage.configuration;
    const startTime = Date.now();

    let result: any;

    switch (config.contentType) {
      case 'course':
        result = await this.integrationService.generateCourseWithAuthoring({
          courseTitle: config.title,
          subject: config.subject,
          level: config.level,
          duration: config.duration,
          authorId: execution.input.userId,
          targetAudience: config.targetAudience,
          learningObjectives: config.objectives || [],
          assessmentStrategy: config.assessmentStrategy || 'mixed',
        });
        break;

      case 'assessment':
        result = await this.integrationService.generateAdaptiveAssessment({
          userId: execution.input.userId,
          subject: config.subject,
          currentSkillLevel: config.level,
          learningObjectives: config.objectives || [],
          previousPerformance: [],
        });
        break;

      case 'translation':
        result = await this.integrationService.batchTranslateCourseContent({
          courseId: config.courseId,
          targetLanguages: config.languages,
          contentTypes: config.contentTypes,
          prioritizeQuality: true,
        });
        break;

      default:
        throw new Error(`Unknown AI generation type: ${config.contentType}`);
    }

    // Update metrics
    const processingTime = Date.now() - startTime;
    execution.metrics.aiProcessingTime += processingTime;
    execution.metrics.apiCalls += 1;
    execution.metrics.cost += this.estimateStageeCost(stage);

    return result;
  }

  private async processHumanReviewStage(
    execution: WorkflowExecution,
    stage: WorkflowStage
  ): Promise<any> {
    const config = stage.configuration;

    console.log(`👥 Human review required for execution: ${execution.id}`);

    // Create review request
    const reviewRequest = {
      executionId: execution.id,
      stageId: stage.id,
      content: execution.stages.find(
        (s) => s.stageId === config.previousStageId
      )?.output,
      reviewers: config.reviewers || [],
      deadline: new Date(
        Date.now() + (config.timeoutHours || 24) * 60 * 60 * 1000
      ),
      criteria: config.reviewCriteria || [],
    };

    // Emit event for human review system
    this.emit('humanReviewRequired', reviewRequest);

    // Wait for review (in real implementation, this would be handled by callback)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          reject(new Error('Human review timeout'));
        },
        (config.timeoutHours || 24) * 60 * 60 * 1000
      );

      this.once(
        `humanReviewCompleted_${execution.id}_${stage.id}`,
        (result) => {
          clearTimeout(timeout);
          const reviewTime =
            Date.now() - (stage.configuration.startTime || Date.now());
          execution.metrics.humanReviewTime += reviewTime;
          resolve(result);
        }
      );
    });
  }

  private async processQualityCheckStage(
    execution: WorkflowExecution,
    stage: WorkflowStage
  ): Promise<QualityCheckResult> {
    const config = stage.configuration;
    const gateId = config.qualityGateId;
    const gate = this.qualityGates.get(gateId);

    if (!gate) {
      throw new Error(`Quality gate not found: ${gateId}`);
    }

    console.log(`🔍 Running quality check: ${gate.name}`);

    const content = execution.stages.find(
      (s) => s.stageId === config.sourceStageId
    )?.output;
    if (!content) {
      throw new Error('No content found for quality check');
    }

    const result = await this.runQualityCheck(gate, content);

    if (!result.passed && gate.mandatory) {
      throw new Error(`Quality gate failed: ${gate.name}`);
    }

    execution.metrics.qualityScore = Math.max(
      execution.metrics.qualityScore,
      result.score
    );

    return result;
  }

  private async processComplianceCheckStage(
    execution: WorkflowExecution,
    stage: WorkflowStage
  ): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const config = stage.configuration;
    const content = execution.stages.find(
      (s) => s.stageId === config.sourceStageId
    )?.output;

    console.log('📋 Running compliance check');

    // Use AI service for compliance review
    const review = await this.aiService.reviewContent(
      JSON.stringify(content),
      config.contentType || 'course_content'
    );

    const compliant =
      review.ssgCompliance.compliant &&
      review.qualityScore >= (config.minQualityScore || 80);

    return {
      compliant,
      issues: review.ssgCompliance.issues || [],
      recommendations: review.suggestions || [],
    };
  }

  private async processApprovalStage(
    execution: WorkflowExecution,
    stage: WorkflowStage
  ): Promise<{
    approved: boolean;
    approvedBy: string[];
    comments: string[];
  }> {
    const config = stage.configuration;

    console.log('✅ Processing approval stage');

    // Emit approval request
    this.emit('approvalRequired', {
      executionId: execution.id,
      stageId: stage.id,
      approvers: config.approvers || [],
      deadline: new Date(
        Date.now() + (config.timeoutHours || 48) * 60 * 60 * 1000
      ),
    });

    // Wait for approvals (mock implementation)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          approved: true,
          approvedBy: config.approvers || ['system'],
          comments: ['Auto-approved for demonstration'],
        });
      }, 1000);
    });
  }

  private async processDeploymentStage(
    execution: WorkflowExecution,
    stage: WorkflowStage
  ): Promise<{
    deployed: boolean;
    deploymentId: string;
    url?: string;
  }> {
    const config = stage.configuration;

    console.log('🚀 Processing deployment stage');

    // Mock deployment
    const deploymentId = `deploy_${execution.id}_${Date.now()}`;

    // Simulate deployment process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      deployed: true,
      deploymentId,
      url: config.targetUrl,
    };
  }

  // ============================================================================
  // QUALITY CONTROL
  // ============================================================================

  private async runQualityCheck(
    gate: QualityGate,
    content: any
  ): Promise<QualityCheckResult> {
    const criteriaResults: CriterionResult[] = [];
    let totalScore = 0;
    let weightSum = 0;

    for (const criterion of gate.criteria) {
      const result = await this.runQualityCriterion(criterion, content);
      criteriaResults.push(result);

      totalScore += result.score * criterion.weight;
      weightSum += criterion.weight;
    }

    const overallScore = weightSum > 0 ? totalScore / weightSum : 0;
    const passed = overallScore >= gate.threshold;

    return {
      passed,
      score: overallScore,
      criteriaResults,
      recommendations: this.generateQualityRecommendations(criteriaResults),
      requiresHumanReview: !passed || overallScore < 90,
    };
  }

  private async runQualityCriterion(
    criterion: QualityCriterion,
    content: any
  ): Promise<CriterionResult> {
    let score = 0;
    let details = '';

    switch (criterion.validator.type) {
      case 'ai_score':
        const review = await this.aiService.reviewContent(
          JSON.stringify(content),
          'general'
        );
        score = review.qualityScore;
        details = `AI quality score: ${score}`;
        break;

      case 'rule_based':
        score = this.runRuleBasedValidation(
          criterion.validator.configuration,
          content
        );
        details = `Rule-based validation score: ${score}`;
        break;

      case 'human_review':
        // Would trigger human review process
        score = 85; // Mock score
        details = 'Human review required';
        break;

      case 'external_api':
        score = await this.runExternalValidation(
          criterion.validator.configuration,
          content
        );
        details = `External validation score: ${score}`;
        break;
    }

    return {
      criterion: criterion.name,
      score,
      passed: score >= criterion.threshold,
      details,
    };
  }

  private runRuleBasedValidation(config: any, content: any): number {
    // Mock rule-based validation
    const contentStr = JSON.stringify(content);
    let score = 100;

    // Check content length
    if (config.minLength && contentStr.length < config.minLength) {
      score -= 20;
    }

    // Check required fields
    if (config.requiredFields) {
      for (const field of config.requiredFields) {
        if (!content[field]) {
          score -= 10;
        }
      }
    }

    return Math.max(score, 0);
  }

  private async runExternalValidation(
    config: any,
    content: any
  ): Promise<number> {
    // Mock external API validation
    return 88;
  }

  private generateQualityRecommendations(results: CriterionResult[]): string[] {
    const recommendations: string[] = [];

    for (const result of results) {
      if (!result.passed) {
        recommendations.push(`Improve ${result.criterion}: ${result.details}`);
      }
    }

    return recommendations;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private validateWorkflow(workflow: WorkflowDefinition): void {
    if (!workflow.id || !workflow.name || !workflow.stages.length) {
      throw new Error('Invalid workflow definition');
    }

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (stageId: string): boolean => {
      if (recursionStack.has(stageId)) return true;
      if (visited.has(stageId)) return false;

      visited.add(stageId);
      recursionStack.add(stageId);

      const stage = workflow.stages.find((s) => s.id === stageId);
      if (stage) {
        for (const dep of stage.dependencies) {
          if (hasCycle(dep)) return true;
        }
      }

      recursionStack.delete(stageId);
      return false;
    };

    for (const stage of workflow.stages) {
      if (hasCycle(stage.id)) {
        throw new Error(
          `Circular dependency detected in workflow: ${workflow.id}`
        );
      }
    }
  }

  private calculateRetryDelay(policy: RetryPolicy, attempt: number): number {
    let delay: number;

    switch (policy.backoffStrategy) {
      case 'linear':
        delay = policy.baseDelay * attempt;
        break;
      case 'exponential':
        delay = policy.baseDelay * Math.pow(2, attempt - 1);
        break;
      case 'fixed':
      default:
        delay = policy.baseDelay;
        break;
    }

    return Math.min(delay, policy.maxDelay);
  }

  private estimateStageeCost(stage: WorkflowStage): number {
    const baseCosts: Record<string, number> = {
      ai_generation: 5.0,
      human_review: 0.0, // Human cost not included
      quality_check: 1.0,
      compliance_check: 2.0,
      approval: 0.0,
      deployment: 0.5,
    };

    return baseCosts[stage.type] || 1.0;
  }

  private initializeDefaultWorkflows(): void {
    // Course Creation Workflow
    const courseWorkflow: WorkflowDefinition = {
      id: 'course_creation',
      name: 'AI-Powered Course Creation',
      description: 'Complete workflow for creating courses with AI assistance',
      stages: [
        {
          id: 'generate_outline',
          name: 'Generate Course Outline',
          type: 'ai_generation',
          configuration: { contentType: 'course' },
          dependencies: [],
          timeout: 300000, // 5 minutes
          retryPolicy: {
            maxAttempts: 3,
            backoffStrategy: 'exponential',
            baseDelay: 5000,
            maxDelay: 30000,
          },
        },
        {
          id: 'quality_check_outline',
          name: 'Quality Check Outline',
          type: 'quality_check',
          configuration: {
            qualityGateId: 'content_quality',
            sourceStageId: 'generate_outline',
          },
          dependencies: ['generate_outline'],
          timeout: 60000,
          retryPolicy: {
            maxAttempts: 2,
            backoffStrategy: 'fixed',
            baseDelay: 10000,
            maxDelay: 10000,
          },
        },
        {
          id: 'human_review_outline',
          name: 'Human Review Outline',
          type: 'human_review',
          configuration: {
            previousStageId: 'generate_outline',
            timeoutHours: 24,
          },
          dependencies: ['quality_check_outline'],
          timeout: 86400000, // 24 hours
          retryPolicy: {
            maxAttempts: 1,
            backoffStrategy: 'fixed',
            baseDelay: 0,
            maxDelay: 0,
          },
        },
        {
          id: 'compliance_check',
          name: 'SSG Compliance Check',
          type: 'compliance_check',
          configuration: {
            sourceStageId: 'human_review_outline',
            contentType: 'course',
          },
          dependencies: ['human_review_outline'],
          timeout: 120000,
          retryPolicy: {
            maxAttempts: 2,
            backoffStrategy: 'fixed',
            baseDelay: 5000,
            maxDelay: 5000,
          },
        },
        {
          id: 'final_approval',
          name: 'Final Approval',
          type: 'approval',
          configuration: {
            approvers: ['instructor', 'admin'],
            timeoutHours: 48,
          },
          dependencies: ['compliance_check'],
          timeout: 172800000, // 48 hours
          retryPolicy: {
            maxAttempts: 1,
            backoffStrategy: 'fixed',
            baseDelay: 0,
            maxDelay: 0,
          },
        },
        {
          id: 'deploy_course',
          name: 'Deploy Course',
          type: 'deployment',
          configuration: { targetUrl: '/courses' },
          dependencies: ['final_approval'],
          timeout: 60000,
          retryPolicy: {
            maxAttempts: 3,
            backoffStrategy: 'linear',
            baseDelay: 10000,
            maxDelay: 30000,
          },
        },
      ],
      triggers: [
        {
          type: 'api',
          configuration: { endpoint: '/api/workflows/course-creation' },
          conditions: [],
        },
      ],
      approval: {
        required: true,
        approvers: [
          {
            userId: 'instructor',
            role: 'instructor',
            weight: 1,
            canVeto: true,
          },
          { userId: 'admin', role: 'admin', weight: 2, canVeto: true },
        ],
        deadline: 48,
        escalation: {
          levels: [
            { hours: 24, approvers: ['supervisor'], actions: ['notify'] },
            { hours: 48, approvers: ['director'], actions: ['escalate'] },
          ],
          autoApprove: false,
          notificationChannels: ['email', 'slack'],
        },
      },
      sla: {
        maxProcessingTime: 172800000, // 48 hours
        qualityThreshold: 85,
        availabilityTarget: 99.9,
        responseTimeTarget: 5000,
      },
    };

    this.registerWorkflow(courseWorkflow);
  }

  private initializeQualityGates(): void {
    // Content Quality Gate
    const contentQualityGate: QualityGate = {
      id: 'content_quality',
      name: 'Content Quality Assessment',
      criteria: [
        {
          name: 'Educational Value',
          weight: 30,
          validator: {
            type: 'ai_score',
            configuration: { aspect: 'educational_value' },
          },
          threshold: 80,
        },
        {
          name: 'Language Quality',
          weight: 25,
          validator: {
            type: 'ai_score',
            configuration: { aspect: 'language_quality' },
          },
          threshold: 85,
        },
        {
          name: 'Structure',
          weight: 20,
          validator: {
            type: 'rule_based',
            configuration: { requiredFields: ['title', 'objectives'] },
          },
          threshold: 90,
        },
        {
          name: 'SSG Alignment',
          weight: 25,
          validator: {
            type: 'ai_score',
            configuration: { aspect: 'ssg_compliance' },
          },
          threshold: 90,
        },
      ],
      threshold: 85,
      mandatory: true,
      automatedCheck: true,
    };

    this.qualityGates.set(contentQualityGate.id, contentQualityGate);
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get workflow execution status
   */
  getExecutionStatus(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all workflows
   */
  getWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 10): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  /**
   * Complete human review
   */
  completeHumanReview(
    executionId: string,
    stageId: string,
    review: HumanReviewRecord
  ): void {
    const execution = this.executions.get(executionId);
    if (execution) {
      const stage = execution.stages.find((s) => s.stageId === stageId);
      if (stage) {
        stage.humanReview = review;
        this.emit(`humanReviewCompleted_${executionId}_${stageId}`, review);
      }
    }
  }

  /**
   * Get workflow metrics
   */
  getWorkflowMetrics(): {
    totalExecutions: number;
    successRate: number;
    averageProcessingTime: number;
    totalCost: number;
    qualityScores: number[];
  } {
    const executions = Array.from(this.executions.values());
    const completed = executions.filter((e) => e.status === 'completed');

    return {
      totalExecutions: executions.length,
      successRate:
        executions.length > 0 ? completed.length / executions.length : 0,
      averageProcessingTime:
        completed.reduce((sum, e) => sum + e.metrics.totalTime, 0) /
        Math.max(completed.length, 1),
      totalCost: completed.reduce((sum, e) => sum + e.metrics.cost, 0),
      qualityScores: completed.map((e) => e.metrics.qualityScore),
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createAIContentWorkflowOrchestrator(config: {
  aiService: AIContentGenerationService;
  integrationService: AIContentIntegrationService;
  cache: CacheService;
}): AIContentWorkflowOrchestrator {
  return new AIContentWorkflowOrchestrator(config);
}

export default AIContentWorkflowOrchestrator;
