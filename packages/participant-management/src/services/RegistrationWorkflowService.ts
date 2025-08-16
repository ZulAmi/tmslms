import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  RegistrationWorkflow,
  RegistrationStep,
  FormField,
  ValidationRule,
  ConditionalRule,
  StepLogicRule,
  PrerequisiteRule,
  AutoEnrollmentRule,
  ParticipantRegistration,
  RegistrationStatus,
  ValidationResult,
  UUID,
  createUUID,
  FieldType,
} from '../types';

/**
 * Registration Workflow Service
 * Manages multi-step registration processes with conditional logic and validation
 */
export class RegistrationWorkflowService extends EventEmitter {
  private workflows: Map<UUID, RegistrationWorkflow> = new Map();
  private registrationInstances: Map<UUID, ParticipantRegistration> = new Map();

  constructor() {
    super();
  }

  // ============================================================================
  // WORKFLOW MANAGEMENT
  // ============================================================================

  /**
   * Create a new registration workflow
   */
  async createWorkflow(
    workflowData: Omit<RegistrationWorkflow, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RegistrationWorkflow> {
    const id = createUUID(uuidv4());
    const now = new Date();

    const workflow: RegistrationWorkflow = {
      ...workflowData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // Validate workflow structure
    await this.validateWorkflow(workflow);

    this.workflows.set(id, workflow);

    this.emit('workflowCreated', { workflow });

    return workflow;
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: UUID): Promise<RegistrationWorkflow | null> {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * Get all workflows for a training program
   */
  async getWorkflowsForProgram(
    trainingProgramId: UUID
  ): Promise<RegistrationWorkflow[]> {
    return Array.from(this.workflows.values()).filter(
      (w) => w.trainingProgramId === trainingProgramId && w.isActive
    );
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    workflowId: UUID,
    updates: Partial<
      Omit<RegistrationWorkflow, 'id' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<RegistrationWorkflow | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return null;
    }

    const updatedWorkflow: RegistrationWorkflow = {
      ...workflow,
      ...updates,
      id: workflowId,
      createdAt: workflow.createdAt,
      updatedAt: new Date(),
    };

    // Validate updated workflow
    await this.validateWorkflow(updatedWorkflow);

    this.workflows.set(workflowId, updatedWorkflow);

    this.emit('workflowUpdated', {
      workflowId,
      workflow: updatedWorkflow,
      changes: updates,
    });

    return updatedWorkflow;
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow(workflowId: UUID): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    workflow.isActive = false;
    workflow.updatedAt = new Date();

    this.workflows.set(workflowId, workflow);

    this.emit('workflowDeactivated', { workflowId });

    return true;
  }

  // ============================================================================
  // STEP MANAGEMENT
  // ============================================================================

  /**
   * Add step to workflow
   */
  async addStep(
    workflowId: UUID,
    stepData: Omit<RegistrationStep, 'id'>
  ): Promise<RegistrationStep | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return null;
    }

    const stepId = createUUID(uuidv4());
    const step: RegistrationStep = {
      ...stepData,
      id: stepId,
    };

    workflow.steps.push(step);
    workflow.steps.sort((a, b) => a.stepNumber - b.stepNumber);
    workflow.updatedAt = new Date();

    this.workflows.set(workflowId, workflow);

    this.emit('stepAdded', { workflowId, step });

    return step;
  }

  /**
   * Update step
   */
  async updateStep(
    workflowId: UUID,
    stepId: UUID,
    updates: Partial<Omit<RegistrationStep, 'id'>>
  ): Promise<RegistrationStep | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return null;
    }

    const stepIndex = workflow.steps.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) {
      return null;
    }

    const updatedStep: RegistrationStep = {
      ...workflow.steps[stepIndex],
      ...updates,
      id: stepId,
    };

    workflow.steps[stepIndex] = updatedStep;
    workflow.updatedAt = new Date();

    this.workflows.set(workflowId, workflow);

    this.emit('stepUpdated', {
      workflowId,
      stepId,
      step: updatedStep,
      changes: updates,
    });

    return updatedStep;
  }

  /**
   * Remove step from workflow
   */
  async removeStep(workflowId: UUID, stepId: UUID): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    const stepIndex = workflow.steps.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) {
      return false;
    }

    workflow.steps.splice(stepIndex, 1);
    workflow.updatedAt = new Date();

    this.workflows.set(workflowId, workflow);

    this.emit('stepRemoved', { workflowId, stepId });

    return true;
  }

  // ============================================================================
  // FIELD MANAGEMENT
  // ============================================================================

  /**
   * Add field to step
   */
  async addField(
    workflowId: UUID,
    stepId: UUID,
    fieldData: FormField
  ): Promise<FormField | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return null;
    }

    const step = workflow.steps.find((s) => s.id === stepId);
    if (!step) {
      return null;
    }

    // Validate field
    await this.validateField(fieldData);

    step.fields.push(fieldData);
    workflow.updatedAt = new Date();

    this.workflows.set(workflowId, workflow);

    this.emit('fieldAdded', { workflowId, stepId, field: fieldData });

    return fieldData;
  }

  /**
   * Update field
   */
  async updateField(
    workflowId: UUID,
    stepId: UUID,
    fieldId: string,
    updates: Partial<FormField>
  ): Promise<FormField | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return null;
    }

    const step = workflow.steps.find((s) => s.id === stepId);
    if (!step) {
      return null;
    }

    const fieldIndex = step.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) {
      return null;
    }

    const updatedField: FormField = {
      ...step.fields[fieldIndex],
      ...updates,
      id: fieldId,
    };

    // Validate updated field
    await this.validateField(updatedField);

    step.fields[fieldIndex] = updatedField;
    workflow.updatedAt = new Date();

    this.workflows.set(workflowId, workflow);

    this.emit('fieldUpdated', {
      workflowId,
      stepId,
      fieldId,
      field: updatedField,
      changes: updates,
    });

    return updatedField;
  }

  /**
   * Remove field from step
   */
  async removeField(
    workflowId: UUID,
    stepId: UUID,
    fieldId: string
  ): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    const step = workflow.steps.find((s) => s.id === stepId);
    if (!step) {
      return false;
    }

    const fieldIndex = step.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) {
      return false;
    }

    step.fields.splice(fieldIndex, 1);
    workflow.updatedAt = new Date();

    this.workflows.set(workflowId, workflow);

    this.emit('fieldRemoved', { workflowId, stepId, fieldId });

    return true;
  }

  // ============================================================================
  // VALIDATION AND LOGIC
  // ============================================================================

  /**
   * Validate step data against workflow rules
   */
  async validateStepData(
    workflowId: UUID,
    stepNumber: number,
    data: Record<string, any>
  ): Promise<ValidationResult[]> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const step = workflow.steps.find((s) => s.stepNumber === stepNumber);
    if (!step) {
      throw new Error('Step not found');
    }

    const results: ValidationResult[] = [];

    // Validate each field
    for (const field of step.fields) {
      const fieldValue = data[field.id];
      const fieldResults = await this.validateFieldValue(field, fieldValue);
      results.push(...fieldResults);
    }

    // Validate step-level rules
    for (const rule of step.validationRules) {
      const ruleResult = await this.validateRule(rule, data);
      results.push(ruleResult);
    }

    return results;
  }

  /**
   * Check if field should be displayed based on conditional logic
   */
  async shouldDisplayField(
    field: FormField,
    currentData: Record<string, any>
  ): Promise<boolean> {
    if (!field.conditionalDisplay || field.conditionalDisplay.length === 0) {
      return true;
    }

    // All conditions must be met for field to be displayed
    for (const condition of field.conditionalDisplay) {
      const fieldValue = currentData[condition.fieldId];
      if (!this.evaluateCondition(condition, fieldValue)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get next step number based on current step and data
   */
  async getNextStep(
    workflowId: UUID,
    currentStep: number,
    stepData: Record<string, any>
  ): Promise<number | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return null;
    }

    const step = workflow.steps.find((s) => s.stepNumber === currentStep);
    if (!step) {
      return null;
    }

    // Check conditional logic for step progression
    if (step.conditionalLogic && step.conditionalLogic.length > 0) {
      for (const logic of step.conditionalLogic) {
        const fieldValue = stepData[logic.condition.fieldId];
        if (this.evaluateCondition(logic.condition, fieldValue)) {
          // Handle skip logic
          if (
            logic.action.type === 'skip_to' &&
            logic.action.targetQuestionId
          ) {
            const targetStep = workflow.steps.find(
              (s) => s.id === logic.action.targetQuestionId
            );
            return targetStep ? targetStep.stepNumber : null;
          }
        }
      }
    }

    // Return next sequential step
    const nextStepNumber = currentStep + 1;
    const nextStep = workflow.steps.find(
      (s) => s.stepNumber === nextStepNumber
    );
    return nextStep ? nextStepNumber : null;
  }

  /**
   * Check prerequisites for workflow
   */
  async checkPrerequisites(
    workflowId: UUID,
    participantData: Record<string, any>
  ): Promise<{
    canProceed: boolean;
    missingPrerequisites: PrerequisiteRule[];
    warnings: string[];
  }> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const missingPrerequisites: PrerequisiteRule[] = [];
    const warnings: string[] = [];

    for (const prerequisite of workflow.prerequisites) {
      const prerequisiteMet = await this.checkPrerequisite(
        prerequisite,
        participantData
      );

      if (!prerequisiteMet) {
        if (prerequisite.isStrict) {
          missingPrerequisites.push(prerequisite);
        } else {
          warnings.push(
            `Optional prerequisite not met: ${prerequisite.description}`
          );
        }
      }
    }

    return {
      canProceed: missingPrerequisites.length === 0,
      missingPrerequisites,
      warnings,
    };
  }

  /**
   * Check auto-enrollment rules
   */
  async checkAutoEnrollmentRules(
    workflowId: UUID,
    registrationData: Record<string, any>
  ): Promise<AutoEnrollmentRule | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return null;
    }

    // Sort by priority (higher priority first)
    const sortedRules = workflow.autoEnrollmentRules
      .filter((rule) => rule.isActive)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      const conditionsMet = rule.conditions.every((condition) =>
        this.evaluateEnrollmentCondition(condition, registrationData)
      );

      if (conditionsMet) {
        return rule;
      }
    }

    return null;
  }

  // ============================================================================
  // WORKFLOW TEMPLATES
  // ============================================================================

  /**
   * Create workflow from template
   */
  async createFromTemplate(
    templateType: 'basic' | 'advanced' | 'corporate' | 'academic',
    trainingProgramId: UUID,
    customizations?: Partial<RegistrationWorkflow>
  ): Promise<RegistrationWorkflow> {
    let templateData: Partial<RegistrationWorkflow>;

    switch (templateType) {
      case 'basic':
        templateData = this.getBasicTemplate();
        break;
      case 'advanced':
        templateData = this.getAdvancedTemplate();
        break;
      case 'corporate':
        templateData = this.getCorporateTemplate();
        break;
      case 'academic':
        templateData = this.getAcademicTemplate();
        break;
      default:
        throw new Error('Invalid template type');
    }

    const workflowData: Omit<
      RegistrationWorkflow,
      'id' | 'createdAt' | 'updatedAt'
    > = {
      ...templateData,
      ...customizations,
      trainingProgramId,
      isActive: true,
      metadata: {
        ...(templateData.metadata || {}),
        ...(customizations?.metadata || {}),
        templateType,
      },
    } as Omit<RegistrationWorkflow, 'id' | 'createdAt' | 'updatedAt'>;

    return await this.createWorkflow(workflowData);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async validateWorkflow(
    workflow: RegistrationWorkflow
  ): Promise<void> {
    // Validate steps are sequential
    const stepNumbers = workflow.steps
      .map((s) => s.stepNumber)
      .sort((a, b) => a - b);
    for (let i = 0; i < stepNumbers.length; i++) {
      if (stepNumbers[i] !== i + 1) {
        throw new Error(
          `Invalid step numbering: Expected step ${i + 1}, found step ${stepNumbers[i]}`
        );
      }
    }

    // Validate field references in conditional logic
    for (const step of workflow.steps) {
      for (const field of step.fields) {
        if (field.conditionalDisplay) {
          for (const condition of field.conditionalDisplay) {
            if (!this.isValidFieldReference(workflow, condition.fieldId)) {
              throw new Error(
                `Invalid field reference in conditional logic: ${condition.fieldId}`
              );
            }
          }
        }
      }
    }
  }

  private async validateField(field: FormField): Promise<void> {
    // Validate field type and options
    if (
      field.type === FieldType.SELECT ||
      field.type === FieldType.MULTISELECT ||
      field.type === FieldType.RADIO
    ) {
      if (!field.options || field.options.length === 0) {
        throw new Error(
          `Field ${field.id} of type ${field.type} must have options`
        );
      }
    }

    // Validate validation rules
    if (field.validation.pattern) {
      try {
        new RegExp(field.validation.pattern);
      } catch (error) {
        throw new Error(
          `Invalid regex pattern for field ${field.id}: ${field.validation.pattern}`
        );
      }
    }
  }

  private async validateFieldValue(
    field: FormField,
    value: any
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const now = new Date();

    // Required field validation
    if (
      field.isRequired &&
      (value === undefined || value === null || value === '')
    ) {
      results.push({
        ruleId: 'required',
        fieldId: field.id,
        isValid: false,
        errorMessage: `${field.label} is required`,
        validatedAt: now,
      });
      return results; // Skip other validations if required field is empty
    }

    // Skip validation if field is empty and not required
    if (value === undefined || value === null || value === '') {
      return results;
    }

    // Type-specific validation
    switch (field.type) {
      case FieldType.EMAIL:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          results.push({
            ruleId: 'email_format',
            fieldId: field.id,
            isValid: false,
            errorMessage: 'Invalid email format',
            validatedAt: now,
          });
        }
        break;

      case FieldType.PHONE:
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          results.push({
            ruleId: 'phone_format',
            fieldId: field.id,
            isValid: false,
            errorMessage: 'Invalid phone number format',
            validatedAt: now,
          });
        }
        break;

      case FieldType.NUMBER:
        if (isNaN(Number(value))) {
          results.push({
            ruleId: 'number_format',
            fieldId: field.id,
            isValid: false,
            errorMessage: 'Must be a valid number',
            validatedAt: now,
          });
        }
        break;
    }

    // Length validation
    if (
      field.validation.minLength &&
      value.length < field.validation.minLength
    ) {
      results.push({
        ruleId: 'min_length',
        fieldId: field.id,
        isValid: false,
        errorMessage: `Minimum length is ${field.validation.minLength} characters`,
        validatedAt: now,
      });
    }

    if (
      field.validation.maxLength &&
      value.length > field.validation.maxLength
    ) {
      results.push({
        ruleId: 'max_length',
        fieldId: field.id,
        isValid: false,
        errorMessage: `Maximum length is ${field.validation.maxLength} characters`,
        validatedAt: now,
      });
    }

    // Pattern validation
    if (field.validation.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        results.push({
          ruleId: 'pattern',
          fieldId: field.id,
          isValid: false,
          errorMessage: field.validation.errorMessage || 'Invalid format',
          validatedAt: now,
        });
      }
    }

    return results;
  }

  private async validateRule(
    rule: ValidationRule,
    data: Record<string, any>
  ): Promise<ValidationResult> {
    const now = new Date();

    try {
      // Simple rule evaluation (in a real implementation, this would be more sophisticated)
      const isValid = this.evaluateValidationRule(rule.rule, data);

      return {
        ruleId: rule.id,
        isValid,
        errorMessage: isValid ? undefined : rule.errorMessage,
        validatedAt: now,
      };
    } catch (error) {
      return {
        ruleId: rule.id,
        isValid: false,
        errorMessage: 'Validation rule error',
        validatedAt: now,
      };
    }
  }

  private evaluateCondition(
    condition: ConditionalRule,
    fieldValue: any
  ): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'not_contains':
        return !String(fieldValue).includes(String(condition.value));
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      default:
        return false;
    }
  }

  private evaluateEnrollmentCondition(
    condition: any,
    data: Record<string, any>
  ): boolean {
    const fieldValue = data[condition.field];
    return this.evaluateCondition(condition, fieldValue);
  }

  private evaluateValidationRule(
    rule: string,
    data: Record<string, any>
  ): boolean {
    // Simplified rule evaluation - in practice, this would use a proper expression parser
    // For now, just return true
    return true;
  }

  private async checkPrerequisite(
    prerequisite: PrerequisiteRule,
    participantData: Record<string, any>
  ): Promise<boolean> {
    // Check if participant meets prerequisite requirements
    for (const requirement of prerequisite.requirements) {
      const participantValue = participantData[requirement.type];

      if (
        !this.evaluatePrerequisiteRequirement(requirement, participantValue)
      ) {
        if (prerequisite.isStrict) {
          return false; // All requirements must be met for strict prerequisites
        }
      } else if (!prerequisite.isStrict) {
        return true; // Any requirement can be met for non-strict prerequisites
      }
    }

    return prerequisite.isStrict; // For strict: all met, for non-strict: none met
  }

  private evaluatePrerequisiteRequirement(
    requirement: any,
    participantValue: any
  ): boolean {
    switch (requirement.operator) {
      case 'equals':
        return participantValue === requirement.value;
      case 'contains':
        return (
          Array.isArray(participantValue) &&
          participantValue.includes(requirement.value)
        );
      case 'greater_than':
        return Number(participantValue) > Number(requirement.value);
      case 'less_than':
        return Number(participantValue) < Number(requirement.value);
      case 'exists':
        return participantValue !== undefined && participantValue !== null;
      default:
        return false;
    }
  }

  private isValidFieldReference(
    workflow: RegistrationWorkflow,
    fieldId: string
  ): boolean {
    for (const step of workflow.steps) {
      if (step.fields.some((f) => f.id === fieldId)) {
        return true;
      }
    }
    return false;
  }

  // ============================================================================
  // WORKFLOW TEMPLATES
  // ============================================================================

  private getBasicTemplate(): Partial<RegistrationWorkflow> {
    return {
      name: 'Basic Registration',
      description: 'Simple registration workflow with essential information',
      steps: [
        {
          id: createUUID(uuidv4()),
          stepNumber: 1,
          title: 'Personal Information',
          description: 'Please provide your basic information',
          fields: [
            {
              id: 'firstName',
              type: FieldType.TEXT,
              label: 'First Name',
              isRequired: true,
              validation: { minLength: 2, maxLength: 50 },
              conditionalDisplay: [],
              metadata: {},
            },
            {
              id: 'lastName',
              type: FieldType.TEXT,
              label: 'Last Name',
              isRequired: true,
              validation: { minLength: 2, maxLength: 50 },
              conditionalDisplay: [],
              metadata: {},
            },
            {
              id: 'email',
              type: FieldType.EMAIL,
              label: 'Email Address',
              isRequired: true,
              validation: {},
              conditionalDisplay: [],
              metadata: {},
            },
          ],
          isRequired: true,
          conditionalLogic: [],
          validationRules: [],
          estimatedTimeMinutes: 5,
        },
      ],
      prerequisites: [],
      approvalChain: [],
      autoEnrollmentRules: [],
      metadata: {},
    };
  }

  private getAdvancedTemplate(): Partial<RegistrationWorkflow> {
    return {
      name: 'Advanced Registration',
      description:
        'Comprehensive registration with multiple steps and validations',
      steps: [
        {
          id: createUUID(uuidv4()),
          stepNumber: 1,
          title: 'Personal Information',
          description: 'Please provide your personal details',
          fields: [
            {
              id: 'firstName',
              type: FieldType.TEXT,
              label: 'First Name',
              isRequired: true,
              validation: { minLength: 2, maxLength: 50 },
              conditionalDisplay: [],
              metadata: {},
            },
            {
              id: 'lastName',
              type: FieldType.TEXT,
              label: 'Last Name',
              isRequired: true,
              validation: { minLength: 2, maxLength: 50 },
              conditionalDisplay: [],
              metadata: {},
            },
            {
              id: 'email',
              type: FieldType.EMAIL,
              label: 'Email Address',
              isRequired: true,
              validation: {},
              conditionalDisplay: [],
              metadata: {},
            },
            {
              id: 'phone',
              type: FieldType.PHONE,
              label: 'Phone Number',
              isRequired: false,
              validation: {},
              conditionalDisplay: [],
              metadata: {},
            },
          ],
          isRequired: true,
          conditionalLogic: [],
          validationRules: [],
          estimatedTimeMinutes: 5,
        },
        {
          id: createUUID(uuidv4()),
          stepNumber: 2,
          title: 'Professional Information',
          description: 'Tell us about your professional background',
          fields: [
            {
              id: 'department',
              type: FieldType.SELECT,
              label: 'Department',
              isRequired: true,
              options: [
                { value: 'hr', label: 'Human Resources' },
                { value: 'it', label: 'Information Technology' },
                { value: 'finance', label: 'Finance' },
                { value: 'operations', label: 'Operations' },
              ],
              validation: {},
              conditionalDisplay: [],
              metadata: {},
            },
            {
              id: 'position',
              type: FieldType.TEXT,
              label: 'Job Title',
              isRequired: true,
              validation: { minLength: 2, maxLength: 100 },
              conditionalDisplay: [],
              metadata: {},
            },
          ],
          isRequired: true,
          conditionalLogic: [],
          validationRules: [],
          estimatedTimeMinutes: 3,
        },
      ],
      prerequisites: [],
      approvalChain: [],
      autoEnrollmentRules: [],
      metadata: {},
    };
  }

  private getCorporateTemplate(): Partial<RegistrationWorkflow> {
    return {
      name: 'Corporate Registration',
      description: 'Enterprise registration workflow with approval process',
      steps: [
        // Similar to advanced but with additional corporate fields
        // and approval chain
      ],
      prerequisites: [],
      approvalChain: [
        {
          id: createUUID(uuidv4()),
          stepNumber: 1,
          approverRole: 'manager',
          isRequired: true,
          timeoutDays: 5,
          escalationRules: [],
        },
      ],
      autoEnrollmentRules: [],
      metadata: {},
    };
  }

  private getAcademicTemplate(): Partial<RegistrationWorkflow> {
    return {
      name: 'Academic Registration',
      description: 'Academic institution registration workflow',
      steps: [
        // Similar structure but with academic-specific fields
      ],
      prerequisites: [
        {
          id: createUUID(uuidv4()),
          type: 'certification',
          description: 'High school diploma or equivalent',
          requirements: [
            {
              type: 'education',
              value: 'high_school',
              operator: 'equals',
            },
          ],
          isStrict: true,
        },
      ],
      approvalChain: [],
      autoEnrollmentRules: [],
      metadata: {},
    };
  }
}
