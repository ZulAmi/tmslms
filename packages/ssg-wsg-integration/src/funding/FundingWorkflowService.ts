/**
 * Funding Workflow Management Service
 * Handles multi-level approvals, business processes, and automated workflows
 */

import { EventEmitter } from 'events';
import { CacheService } from '../cache/CacheService';
import {
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowStepDefinition,
  WorkflowApproval,
  WorkflowRule,
  WorkflowAction,
  WorkflowStatus,
  ApprovalLevel,
  ActionType,
  WorkflowTrigger,
} from './types';

export interface WorkflowConfiguration {
  enableAutoApproval: boolean;
  autoApprovalThreshold: number;
  maxProcessingTime: number; // in hours
  escalationRules: EscalationRule[];
  notificationSettings: NotificationSettings;
  auditLevel: 'basic' | 'detailed' | 'comprehensive';
}

export interface EscalationRule {
  triggerCondition:
    | 'timeout'
    | 'amount_threshold'
    | 'risk_score'
    | 'manual_escalation';
  threshold?: number;
  timeoutHours?: number;
  escalateTo: ApprovalLevel;
  actionRequired: ActionType[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  realTime: boolean;
  digestFrequency: 'immediate' | 'hourly' | 'daily';
  customTemplates: {
    [key: string]: string;
  };
}

export interface WorkflowMetrics {
  averageProcessingTime: number;
  approvalRate: number;
  escalationRate: number;
  bottlenecks: Array<{
    step: string;
    averageTime: number;
    count: number;
  }>;
  performanceByApprover: Array<{
    approverId: string;
    averageTime: number;
    approvalRate: number;
    workload: number;
  }>;
}

/**
 * Funding Workflow Management Service
 */
export class FundingWorkflowService extends EventEmitter {
  private cache: CacheService;
  private config: WorkflowConfiguration;
  private activeWorkflows: Map<string, WorkflowInstance> = new Map();
  private workflowDefinitions: Map<string, WorkflowDefinition> = new Map();

  constructor(cache: CacheService, config: WorkflowConfiguration) {
    super();
    this.cache = cache;
    this.config = config;
    this.initializeDefaultWorkflows();
    this.startWorkflowProcessor();
  }

  // ============================================================================
  // WORKFLOW DEFINITION MANAGEMENT
  // ============================================================================

  /**
   * Create a new workflow definition
   */
  async createWorkflowDefinition(
    definition: WorkflowDefinition
  ): Promise<string> {
    // Validate workflow definition
    const validationResult = this.validateWorkflowDefinition(definition);
    if (!validationResult.valid) {
      throw new Error(
        `Invalid workflow definition: ${validationResult.errors.join(', ')}`
      );
    }

    // Store definition
    this.workflowDefinitions.set(definition.id, definition);

    // Cache for retrieval
    const cacheKey = `workflow_definition:${definition.id}`;
    await this.cache.set(cacheKey, definition, { ttl: 86400 });

    this.emit('workflowDefinitionCreated', {
      definitionId: definition.id,
      name: definition.name,
      version: definition.version,
      timestamp: new Date(),
    });

    return definition.id;
  }

  /**
   * Initialize default funding workflows
   */
  private initializeDefaultWorkflows(): void {
    // Eligibility Workflow
    const eligibilityWorkflow: WorkflowDefinition = {
      id: 'eligibility_verification',
      name: 'Eligibility Verification Workflow',
      description: 'Automated eligibility verification with manual override',
      version: '1.0.0',
      category: 'eligibility',
      isActive: true,
      steps: [
        {
          id: 'step_1',
          name: 'Auto Eligibility Check',
          type: 'automated',
          action: {
            type: ActionType.API_CALL,
            endpoint: '/api/eligibility/auto-check',
            timeout: 30000,
          },
          rules: [
            {
              condition: 'result.eligible === true && result.confidence > 0.9',
              outcome: 'approved',
              nextStep: 'step_complete',
            },
            {
              condition: 'result.eligible === false && result.confidence > 0.8',
              outcome: 'rejected',
              nextStep: 'step_complete',
            },
            {
              condition: 'result.confidence <= 0.8',
              outcome: 'manual_review',
              nextStep: 'step_2',
            },
          ],
          timeoutAction: { nextStep: 'step_2' },
          onError: { nextStep: 'step_error' },
        },
        {
          id: 'step_2',
          name: 'Manual Review',
          type: 'manual',
          assignedRole: ApprovalLevel.L1_REVIEWER,
          action: {
            type: ActionType.MANUAL_REVIEW,
            formFields: [
              'eligibility_assessment',
              'supporting_documents',
              'reviewer_comments',
            ],
            timeout: 24 * 60 * 60 * 1000, // 24 hours
          },
          rules: [
            {
              condition: 'decision === "approved"',
              outcome: 'approved',
              nextStep: 'step_complete',
            },
            {
              condition: 'decision === "rejected"',
              outcome: 'rejected',
              nextStep: 'step_complete',
            },
            {
              condition: 'decision === "escalate"',
              outcome: 'escalated',
              nextStep: 'step_3',
            },
          ],
        },
        {
          id: 'step_3',
          name: 'Senior Review',
          type: 'manual',
          assignedRole: ApprovalLevel.L2_MANAGER,
          action: {
            type: ActionType.MANUAL_REVIEW,
            formFields: [
              'senior_assessment',
              'final_decision',
              'escalation_reason',
            ],
            timeout: 48 * 60 * 60 * 1000, // 48 hours
          },
        },
        {
          id: 'step_complete',
          name: 'Workflow Complete',
          type: 'automated',
          action: {
            type: ActionType.NOTIFICATION,
            recipients: ['participant', 'training_provider'],
            template: 'eligibility_decision',
          },
        },
        {
          id: 'step_error',
          name: 'Error Handling',
          type: 'automated',
          action: {
            type: ActionType.ERROR_HANDLING,
            retryCount: 3,
            escalateAfterRetries: true,
          },
        },
      ],
      triggers: [
        {
          type: 'api_request',
          endpoint: '/eligibility/verify',
          conditions: [],
        },
        {
          type: 'scheduled',
          schedule: 'daily',
          conditions: ['has_pending_applications'],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Claims Processing Workflow
    const claimsWorkflow: WorkflowDefinition = {
      id: 'claims_processing',
      name: 'Claims Processing Workflow',
      description: 'Multi-level claims approval with automated validations',
      version: '1.0.0',
      category: 'claims',
      isActive: true,
      steps: [
        {
          id: 'step_1',
          name: 'Document Validation',
          type: 'automated',
          action: {
            type: ActionType.VALIDATION,
            validationRules: [
              'document_completeness',
              'digital_signature',
              'data_integrity',
            ],
            timeout: 60000,
          },
          rules: [
            {
              condition: 'validation.allPassed === true',
              outcome: 'validated',
              nextStep: 'step_2',
            },
            {
              condition: 'validation.criticalFailures > 0',
              outcome: 'rejected',
              nextStep: 'step_reject',
            },
            {
              condition: 'validation.minorIssues > 0',
              outcome: 'conditional',
              nextStep: 'step_2',
            },
          ],
        },
        {
          id: 'step_2',
          name: 'Amount Verification',
          type: 'automated',
          action: {
            type: ActionType.CALCULATION,
            calculations: [
              'subsidy_amount',
              'fee_validation',
              'attendance_check',
            ],
            timeout: 30000,
          },
          rules: [
            {
              condition: 'calculatedAmount <= 5000 && validation.score > 0.95',
              outcome: 'auto_approved',
              nextStep: 'step_payment',
            },
            {
              condition: 'calculatedAmount <= 20000',
              outcome: 'l1_review',
              nextStep: 'step_3',
            },
            {
              condition: 'calculatedAmount > 20000',
              outcome: 'l2_review',
              nextStep: 'step_4',
            },
          ],
        },
        {
          id: 'step_3',
          name: 'L1 Review',
          type: 'manual',
          assignedRole: ApprovalLevel.L1_REVIEWER,
          action: {
            type: ActionType.MANUAL_REVIEW,
            formFields: [
              'amount_verification',
              'document_review',
              'approval_decision',
            ],
            timeout: 24 * 60 * 60 * 1000,
          },
          rules: [
            {
              condition: 'decision === "approved"',
              outcome: 'approved',
              nextStep: 'step_payment',
            },
            {
              condition: 'decision === "rejected"',
              outcome: 'rejected',
              nextStep: 'step_reject',
            },
            {
              condition: 'decision === "escalate" || amount > 15000',
              outcome: 'escalated',
              nextStep: 'step_4',
            },
          ],
        },
        {
          id: 'step_4',
          name: 'L2 Manager Approval',
          type: 'manual',
          assignedRole: ApprovalLevel.L2_MANAGER,
          action: {
            type: ActionType.MANUAL_REVIEW,
            formFields: [
              'risk_assessment',
              'compliance_check',
              'final_approval',
            ],
            timeout: 48 * 60 * 60 * 1000,
          },
          rules: [
            {
              condition: 'decision === "approved"',
              outcome: 'approved',
              nextStep: 'step_payment',
            },
            {
              condition: 'decision === "rejected"',
              outcome: 'rejected',
              nextStep: 'step_reject',
            },
            {
              condition: 'amount > 50000',
              outcome: 'senior_escalation',
              nextStep: 'step_5',
            },
          ],
        },
        {
          id: 'step_5',
          name: 'Senior Management Approval',
          type: 'manual',
          assignedRole: ApprovalLevel.SENIOR_MANAGER,
          action: {
            type: ActionType.MANUAL_REVIEW,
            formFields: [
              'strategic_review',
              'budget_impact',
              'executive_approval',
            ],
            timeout: 72 * 60 * 60 * 1000,
          },
        },
        {
          id: 'step_payment',
          name: 'Payment Processing',
          type: 'automated',
          action: {
            type: ActionType.PAYMENT_PROCESSING,
            paymentGateway: 'government_portal',
            timeout: 300000,
          },
        },
        {
          id: 'step_reject',
          name: 'Rejection Notification',
          type: 'automated',
          action: {
            type: ActionType.NOTIFICATION,
            recipients: ['participant', 'training_provider'],
            template: 'claim_rejection',
          },
        },
      ],
      triggers: [
        {
          type: 'api_request',
          endpoint: '/claims/submit',
          conditions: [],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store default workflows
    this.workflowDefinitions.set(eligibilityWorkflow.id, eligibilityWorkflow);
    this.workflowDefinitions.set(claimsWorkflow.id, claimsWorkflow);
  }

  // ============================================================================
  // WORKFLOW INSTANCE MANAGEMENT
  // ============================================================================

  /**
   * Start a new workflow instance
   */
  async startWorkflow(
    workflowId: string,
    contextData: any,
    triggeredBy: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<string> {
    const definition = this.workflowDefinitions.get(workflowId);
    if (!definition) {
      throw new Error(`Workflow definition not found: ${workflowId}`);
    }

    const instanceId = this.generateInstanceId();
    const instance: WorkflowInstance = {
      id: instanceId,
      workflowId,
      status: WorkflowStatus.RUNNING,
      currentStep: definition.steps[0].id,
      contextData,
      history: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      triggeredBy,
      priority,
      estimatedCompletion: this.calculateEstimatedCompletion(definition),
      metrics: {
        stepsCompleted: 0,
        totalSteps: definition.steps.length,
        processingTime: 0,
        approvalTime: 0,
      },
    };

    // Store active workflow
    this.activeWorkflows.set(instanceId, instance);

    // Cache for persistence
    const cacheKey = `workflow_instance:${instanceId}`;
    await this.cache.set(cacheKey, instance, { ttl: 7 * 24 * 60 * 60 }); // 7 days

    // Emit event
    this.emit('workflowStarted', {
      instanceId,
      workflowId,
      triggeredBy,
      priority,
      timestamp: new Date(),
    });

    // Process first step
    await this.processWorkflowStep(instanceId);

    return instanceId;
  }

  /**
   * Process workflow step
   */
  private async processWorkflowStep(instanceId: string): Promise<void> {
    const instance = this.activeWorkflows.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance not found: ${instanceId}`);
    }

    const definition = this.workflowDefinitions.get(instance.workflowId);
    if (!definition) {
      throw new Error(`Workflow definition not found: ${instance.workflowId}`);
    }

    const currentStep = definition.steps.find(
      (step) => step.id === instance.currentStep
    );
    if (!currentStep) {
      throw new Error(`Step not found: ${instance.currentStep}`);
    }

    const stepStartTime = Date.now();

    try {
      let stepResult: any;

      // Execute step based on type
      switch (currentStep.type) {
        case 'automated':
          stepResult = await this.executeAutomatedStep(currentStep, instance);
          break;
        case 'manual':
          stepResult = await this.initiateManualStep(currentStep, instance);
          break;
        default:
          throw new Error(`Unknown step type: ${currentStep.type}`);
      }

      const processingTime = Date.now() - stepStartTime;

      // Record step completion
      instance.history.push({
        stepId: currentStep.id,
        stepName: currentStep.name,
        status: 'completed',
        startTime: new Date(stepStartTime),
        endTime: new Date(),
        processingTime,
        result: stepResult,
        assignedTo: currentStep.assignedRole,
        comments: stepResult.comments || [],
      });

      // Update metrics
      instance.metrics.stepsCompleted++;
      instance.metrics.processingTime += processingTime;
      if (currentStep.type === 'manual') {
        instance.metrics.approvalTime += processingTime;
      }

      // Determine next step
      const nextStepId = this.determineNextStep(
        currentStep,
        stepResult,
        instance
      );

      if (nextStepId === 'COMPLETE') {
        await this.completeWorkflow(instanceId, stepResult);
      } else if (nextStepId === 'ERROR') {
        await this.handleWorkflowError(instanceId, stepResult);
      } else {
        instance.currentStep = nextStepId;
        instance.updatedAt = new Date();
        await this.updateWorkflowInstance(instance);

        // Continue processing if automated step
        const nextStep = definition.steps.find(
          (step) => step.id === nextStepId
        );
        if (nextStep && nextStep.type === 'automated') {
          await this.processWorkflowStep(instanceId);
        }
      }
    } catch (error) {
      await this.handleStepError(instanceId, currentStep, error);
    }
  }

  /**
   * Execute automated workflow step
   */
  private async executeAutomatedStep(
    step: WorkflowStepDefinition,
    instance: WorkflowInstance
  ): Promise<any> {
    const action = step.action;
    let result: any;

    switch (action.type) {
      case ActionType.API_CALL:
        result = await this.executeApiCall(action, instance.contextData);
        break;

      case ActionType.VALIDATION:
        result = await this.executeValidation(action, instance.contextData);
        break;

      case ActionType.CALCULATION:
        result = await this.executeCalculation(action, instance.contextData);
        break;

      case ActionType.NOTIFICATION:
        result = await this.executeNotification(action, instance.contextData);
        break;

      case ActionType.PAYMENT_PROCESSING:
        result = await this.executePaymentProcessing(
          action,
          instance.contextData
        );
        break;

      case ActionType.ERROR_HANDLING:
        result = await this.executeErrorHandling(action, instance.contextData);
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    // Emit step completion event
    this.emit('stepCompleted', {
      instanceId: instance.id,
      stepId: step.id,
      stepName: step.name,
      result,
      timestamp: new Date(),
    });

    return result;
  }

  /**
   * Initiate manual workflow step
   */
  private async initiateManualStep(
    step: WorkflowStepDefinition,
    instance: WorkflowInstance
  ): Promise<any> {
    // Create approval request
    const approvalId = this.generateApprovalId();
    const approval: WorkflowApproval = {
      id: approvalId,
      workflowInstanceId: instance.id,
      stepId: step.id,
      assignedTo: step.assignedRole!,
      status: 'pending',
      createdAt: new Date(),
      dueDate: new Date(
        Date.now() + (step.action.timeout || 24 * 60 * 60 * 1000)
      ),
      formData: {},
      priority: instance.priority,
    };

    // Store approval request
    const cacheKey = `workflow_approval:${approvalId}`;
    await this.cache.set(cacheKey, approval, { ttl: 7 * 24 * 60 * 60 }); // 7 days

    // Send notification to assignee
    await this.notifyAssignee(approval, step, instance);

    // Emit event
    this.emit('manualStepInitiated', {
      instanceId: instance.id,
      stepId: step.id,
      approvalId,
      assignedTo: step.assignedRole,
      dueDate: approval.dueDate,
      timestamp: new Date(),
    });

    return {
      approvalId,
      status: 'pending',
      assignedTo: step.assignedRole,
      dueDate: approval.dueDate,
    };
  }

  /**
   * Submit approval for manual step
   */
  async submitApproval(
    approvalId: string,
    decision: 'approved' | 'rejected' | 'escalate',
    comments: string,
    formData: any,
    submittedBy: string
  ): Promise<void> {
    const cacheKey = `workflow_approval:${approvalId}`;
    const approval = await this.cache.get<WorkflowApproval>(cacheKey);

    if (!approval) {
      throw new Error(`Approval not found: ${approvalId}`);
    }

    if (approval.status !== 'pending') {
      throw new Error(`Approval already processed: ${approval.status}`);
    }

    // Update approval
    approval.status = decision === 'approved' ? 'approved' : 'rejected';
    approval.decision = decision;
    approval.comments = comments;
    approval.formData = formData;
    approval.submittedBy = submittedBy;
    approval.submittedAt = new Date();

    await this.cache.set(cacheKey, approval, { ttl: 7 * 24 * 60 * 60 });

    // Get workflow instance
    const instance = this.activeWorkflows.get(approval.workflowInstanceId);
    if (!instance) {
      throw new Error(
        `Workflow instance not found: ${approval.workflowInstanceId}`
      );
    }

    // Continue workflow processing
    const stepResult = {
      decision,
      comments,
      formData,
      submittedBy,
      submittedAt: new Date(),
    };

    await this.continueWorkflowFromApproval(
      instance,
      approval.stepId,
      stepResult
    );

    this.emit('approvalSubmitted', {
      approvalId,
      instanceId: approval.workflowInstanceId,
      decision,
      submittedBy,
      timestamp: new Date(),
    });
  }

  // ============================================================================
  // WORKFLOW ANALYTICS & MONITORING
  // ============================================================================

  /**
   * Get workflow metrics and analytics
   */
  async getWorkflowMetrics(
    workflowId?: string,
    dateRange?: { from: Date; to: Date }
  ): Promise<WorkflowMetrics> {
    // Mock comprehensive metrics calculation
    const metrics: WorkflowMetrics = {
      averageProcessingTime: 4.2 * 60 * 60 * 1000, // 4.2 hours
      approvalRate: 0.87, // 87%
      escalationRate: 0.15, // 15%
      bottlenecks: [
        {
          step: 'L2 Manager Approval',
          averageTime: 18 * 60 * 60 * 1000, // 18 hours
          count: 45,
        },
        {
          step: 'Document Validation',
          averageTime: 2.5 * 60 * 60 * 1000, // 2.5 hours
          count: 123,
        },
      ],
      performanceByApprover: [
        {
          approverId: 'manager_001',
          averageTime: 4 * 60 * 60 * 1000, // 4 hours
          approvalRate: 0.92,
          workload: 67,
        },
        {
          approverId: 'reviewer_002',
          averageTime: 1.5 * 60 * 60 * 1000, // 1.5 hours
          approvalRate: 0.88,
          workload: 89,
        },
      ],
    };

    return metrics;
  }

  /**
   * Get active workflows dashboard data
   */
  async getWorkflowDashboard(): Promise<{
    activeWorkflows: number;
    pendingApprovals: number;
    completedToday: number;
    averageProcessingTime: number;
    escalatedItems: number;
    performanceScore: number;
    workflowsByStatus: { [key: string]: number };
    upcomingDeadlines: Array<{
      instanceId: string;
      stepName: string;
      dueDate: Date;
      priority: string;
    }>;
  }> {
    const dashboard = {
      activeWorkflows: this.activeWorkflows.size,
      pendingApprovals: 23,
      completedToday: 45,
      averageProcessingTime: 3.8 * 60 * 60 * 1000, // 3.8 hours
      escalatedItems: 7,
      performanceScore: 0.89, // 89%
      workflowsByStatus: {
        running: 34,
        pending_approval: 23,
        completed: 156,
        failed: 3,
        cancelled: 2,
      },
      upcomingDeadlines: [
        {
          instanceId: 'wf_001',
          stepName: 'L2 Manager Approval',
          dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
          priority: 'high',
        },
        {
          instanceId: 'wf_002',
          stepName: 'Document Review',
          dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
          priority: 'medium',
        },
      ],
    };

    return dashboard;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private validateWorkflowDefinition(definition: WorkflowDefinition): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!definition.id) errors.push('Workflow ID is required');
    if (!definition.name) errors.push('Workflow name is required');
    if (!definition.steps || definition.steps.length === 0) {
      errors.push('At least one step is required');
    }

    // Validate step connectivity
    const stepIds = new Set(definition.steps.map((s) => s.id));
    for (const step of definition.steps) {
      if (step.rules) {
        for (const rule of step.rules) {
          if (
            rule.nextStep &&
            rule.nextStep !== 'COMPLETE' &&
            rule.nextStep !== 'ERROR'
          ) {
            if (!stepIds.has(rule.nextStep)) {
              errors.push(`Invalid next step reference: ${rule.nextStep}`);
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private determineNextStep(
    currentStep: WorkflowStepDefinition,
    stepResult: any,
    instance: WorkflowInstance
  ): string {
    if (!currentStep.rules) {
      return 'COMPLETE';
    }

    for (const rule of currentStep.rules) {
      if (this.evaluateRule(rule, stepResult, instance)) {
        return rule.nextStep || 'COMPLETE';
      }
    }

    return 'COMPLETE';
  }

  private evaluateRule(
    rule: WorkflowRule,
    stepResult: any,
    instance: WorkflowInstance
  ): boolean {
    try {
      // Simple condition evaluation (in production, use a proper expression evaluator)
      const context = {
        result: stepResult,
        instance: instance.contextData,
        decision: stepResult.decision,
        amount: instance.contextData.amount || 0,
        validation: stepResult.validation || {},
        calculatedAmount: stepResult.calculatedAmount || 0,
      };

      // Mock condition evaluation
      return this.mockConditionEvaluation(rule.condition, context);
    } catch (error) {
      console.error('Error evaluating rule condition:', error);
      return false;
    }
  }

  private mockConditionEvaluation(condition: string, context: any): boolean {
    // Mock condition evaluation - in production use a proper expression evaluator
    if (condition.includes('eligible === true'))
      return context.result?.eligible === true;
    if (condition.includes('decision === "approved"'))
      return context.decision === 'approved';
    if (condition.includes('decision === "rejected"'))
      return context.decision === 'rejected';
    if (condition.includes('decision === "escalate"'))
      return context.decision === 'escalate';
    if (condition.includes('amount >')) {
      const match = condition.match(/amount > (\d+)/);
      return match ? context.amount > parseInt(match[1]) : false;
    }
    if (condition.includes('calculatedAmount <=')) {
      const match = condition.match(/calculatedAmount <= (\d+)/);
      return match ? context.calculatedAmount <= parseInt(match[1]) : false;
    }
    return Math.random() > 0.5; // Random fallback for mock
  }

  private async executeApiCall(
    action: WorkflowAction,
    contextData: any
  ): Promise<any> {
    // Mock API call execution
    await this.delay(1000);
    return {
      success: true,
      data: { status: 'completed' },
      timestamp: new Date(),
    };
  }

  private async executeValidation(
    action: WorkflowAction,
    contextData: any
  ): Promise<any> {
    // Mock validation execution
    await this.delay(500);
    return {
      allPassed: Math.random() > 0.2,
      criticalFailures: Math.random() > 0.9 ? 1 : 0,
      minorIssues: Math.floor(Math.random() * 3),
      score: 0.85 + Math.random() * 0.15,
    };
  }

  private async executeCalculation(
    action: WorkflowAction,
    contextData: any
  ): Promise<any> {
    // Mock calculation execution
    await this.delay(300);
    return {
      calculatedAmount: contextData.amount || Math.floor(Math.random() * 25000),
      subsidyPercentage: 0.7 + Math.random() * 0.3,
      breakdown: {
        courseFee: 10000,
        subsidyAmount: 7000,
        participantPayment: 3000,
      },
    };
  }

  private async executeNotification(
    action: WorkflowAction,
    contextData: any
  ): Promise<any> {
    // Mock notification sending
    await this.delay(200);
    return {
      sent: true,
      recipients: action.recipients || [],
      template: action.template || 'default',
      timestamp: new Date(),
    };
  }

  private async executePaymentProcessing(
    action: WorkflowAction,
    contextData: any
  ): Promise<any> {
    // Mock payment processing
    await this.delay(2000);
    return {
      paymentId: `pay_${Date.now()}`,
      status: 'processed',
      amount: contextData.amount || 5000,
      currency: 'SGD',
      transactionDate: new Date(),
    };
  }

  private async executeErrorHandling(
    action: WorkflowAction,
    contextData: any
  ): Promise<any> {
    // Mock error handling
    return {
      handled: true,
      retryCount: action.retryCount || 0,
      escalated: action.escalateAfterRetries || false,
      timestamp: new Date(),
    };
  }

  private async completeWorkflow(
    instanceId: string,
    finalResult: any
  ): Promise<void> {
    const instance = this.activeWorkflows.get(instanceId);
    if (!instance) return;

    instance.status = WorkflowStatus.COMPLETED;
    instance.completedAt = new Date();
    instance.updatedAt = new Date();

    await this.updateWorkflowInstance(instance);
    this.activeWorkflows.delete(instanceId);

    this.emit('workflowCompleted', {
      instanceId,
      workflowId: instance.workflowId,
      result: finalResult,
      duration: instance.completedAt.getTime() - instance.createdAt.getTime(),
      timestamp: new Date(),
    });
  }

  private async handleWorkflowError(
    instanceId: string,
    error: any
  ): Promise<void> {
    const instance = this.activeWorkflows.get(instanceId);
    if (!instance) return;

    instance.status = WorkflowStatus.FAILED;
    instance.error = error;
    instance.updatedAt = new Date();

    await this.updateWorkflowInstance(instance);

    this.emit('workflowFailed', {
      instanceId,
      workflowId: instance.workflowId,
      error,
      timestamp: new Date(),
    });
  }

  private async handleStepError(
    instanceId: string,
    step: WorkflowStepDefinition,
    error: any
  ): Promise<void> {
    const instance = this.activeWorkflows.get(instanceId);
    if (!instance) return;

    instance.history.push({
      stepId: step.id,
      stepName: step.name,
      status: 'failed',
      startTime: new Date(),
      endTime: new Date(),
      processingTime: 0,
      error: error instanceof Error ? error.message : String(error),
      assignedTo: step.assignedRole,
    });

    // Handle error based on step configuration
    if (step.onError?.nextStep) {
      instance.currentStep = step.onError.nextStep;
      await this.processWorkflowStep(instanceId);
    } else {
      await this.handleWorkflowError(instanceId, error);
    }
  }

  private async continueWorkflowFromApproval(
    instance: WorkflowInstance,
    stepId: string,
    stepResult: any
  ): Promise<void> {
    const definition = this.workflowDefinitions.get(instance.workflowId);
    if (!definition) return;

    const step = definition.steps.find((s) => s.id === stepId);
    if (!step) return;

    const nextStepId = this.determineNextStep(step, stepResult, instance);

    if (nextStepId === 'COMPLETE') {
      await this.completeWorkflow(instance.id, stepResult);
    } else {
      instance.currentStep = nextStepId;
      instance.updatedAt = new Date();
      await this.updateWorkflowInstance(instance);
      await this.processWorkflowStep(instance.id);
    }
  }

  private async notifyAssignee(
    approval: WorkflowApproval,
    step: WorkflowStepDefinition,
    instance: WorkflowInstance
  ): Promise<void> {
    // Mock notification to assignee
    this.emit('assigneeNotified', {
      approvalId: approval.id,
      assignedTo: approval.assignedTo,
      stepName: step.name,
      dueDate: approval.dueDate,
      timestamp: new Date(),
    });
  }

  private async updateWorkflowInstance(
    instance: WorkflowInstance
  ): Promise<void> {
    const cacheKey = `workflow_instance:${instance.id}`;
    await this.cache.set(cacheKey, instance, { ttl: 7 * 24 * 60 * 60 });
    this.activeWorkflows.set(instance.id, instance);
  }

  private calculateEstimatedCompletion(definition: WorkflowDefinition): Date {
    // Calculate based on average step times
    const estimatedHours = definition.steps.length * 2; // 2 hours per step average
    return new Date(Date.now() + estimatedHours * 60 * 60 * 1000);
  }

  private startWorkflowProcessor(): void {
    // Process workflows every 30 seconds
    setInterval(async () => {
      for (const [instanceId, instance] of this.activeWorkflows) {
        if (instance.status === WorkflowStatus.RUNNING) {
          await this.checkWorkflowTimeout(instance);
        }
      }
    }, 30000);
  }

  private async checkWorkflowTimeout(
    instance: WorkflowInstance
  ): Promise<void> {
    const timeoutHours = this.config.maxProcessingTime;
    const timeoutMs = timeoutHours * 60 * 60 * 1000;

    if (Date.now() - instance.createdAt.getTime() > timeoutMs) {
      this.emit('workflowTimeout', {
        instanceId: instance.id,
        workflowId: instance.workflowId,
        processingTime: Date.now() - instance.createdAt.getTime(),
        timestamp: new Date(),
      });
    }
  }

  private generateInstanceId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateApprovalId(): string {
    return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default FundingWorkflowService;
