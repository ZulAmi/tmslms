/**
 * Simplified Form Configuration Service - Dynamic Profile Form Management
 * 
 * Generates adaptive profile forms based on user role, organization, and context
 * with conditional fields, validation rules, and progressive disclosure.
 */

import {
  ProfileFormConfig,
  FormField,
  FormSection,
  ValidationRule,
  ConditionalField,
  OrganizationalData
} from './types';

// ===========================================
// Simplified Form Configuration Service Interface
// ===========================================

export interface IFormConfigurationService {
  // Form Generation
  generateProfileForm(userId: string, context: FormGenerationContext): Promise<ProfileFormConfig>;
  getFormConfiguration(formId: string): Promise<ProfileFormConfig>;
  updateFormConfiguration(formId: string, config: Partial<ProfileFormConfig>): Promise<ProfileFormConfig>;
  
  // Dynamic Field Management
  getConditionalFields(baseFields: FormField[], userData: any): Promise<FormField[]>;
  evaluateFieldConditions(field: ConditionalField, userData: any): Promise<boolean>;
  generateValidationRules(field: FormField, context: FormGenerationContext): Promise<ValidationRule[]>;
  
  // Role-Based Configuration
  getFieldsForRole(role: string, organization: string): Promise<FormField[]>;
  applyOrganizationalConstraints(fields: FormField[], orgData: OrganizationalData): Promise<FormField[]>;
  
  // Validation & Processing
  validateFormData(formConfig: ProfileFormConfig, data: any): Promise<ValidationResult>;
  processFormSubmission(formId: string, data: any): Promise<ProcessingResult>;
}

// ===========================================
// Simplified Form Configuration Service Implementation
// ===========================================

export class FormConfigurationService implements IFormConfigurationService {
  private formBuilder: FormBuilder;
  private roleConfigManager: RoleConfigurationManager;
  private validationEngine: ValidationEngine;

  constructor(
    formBuilder: FormBuilder,
    roleConfigManager: RoleConfigurationManager,
    validationEngine: ValidationEngine
  ) {
    this.formBuilder = formBuilder;
    this.roleConfigManager = roleConfigManager;
    this.validationEngine = validationEngine;
  }

  // ===========================================
  // Form Generation
  // ===========================================

  async generateProfileForm(userId: string, context: FormGenerationContext): Promise<ProfileFormConfig> {
    try {
      // Get user context
      const userContext = await this.getUserContext(userId);
      
      // Get role-specific fields
      const roleFields = await this.getFieldsForRole(userContext.role, userContext.organization);
      
      // Apply organizational constraints
      const constrainedFields = await this.applyOrganizationalConstraints(
        roleFields, 
        userContext.organizationalData
      );
      
      // Group fields into sections
      const sections = await this.groupFieldsIntoSections(constrainedFields);
      
      // Generate form configuration
      const formConfig: ProfileFormConfig = {
        formId: this.generateFormId(),
        version: '1.0',
        name: this.generateFormTitle(userContext, context),
        description: this.generateFormDescription(userContext, context),
        applicableRoles: [userContext.role],
        applicableOrganizations: [userContext.organization],
        sections,
        validation: {
          rules: [],
          customValidators: [],
          crossFieldValidation: []
        },
        permissions: {
          create: [userContext.role],
          view: ['*'],
          edit: [userContext.role],
          delete: ['admin'],
          export: ['admin'],
          audit: ['admin']
        },
        workflow: {
          approval: {
            required: false,
            approvers: [],
            escalation: [],
            timeout: 7
          },
          notifications: {
            events: [],
            templates: [],
            channels: []
          },
          automation: {
            triggers: [],
            actions: [],
            schedules: []
          }
        },
        localization: {
          defaultLanguage: 'en',
          supportedLanguages: ['en'],
          translations: {},
          dateFormats: {
            short: 'DD/MM/YYYY',
            medium: 'DD MMM YYYY',
            long: 'DD MMMM YYYY'
          },
          numberFormats: {
            'default': {
              decimal: '.',
              thousands: ',',
              currency: '$',
              pattern: '#,##0.00'
            }
          }
        }
      };
      
      return formConfig;
    } catch (error) {
      console.error('Error generating profile form:', error);
      throw new Error('Failed to generate profile form');
    }
  }

  async getFormConfiguration(formId: string): Promise<ProfileFormConfig> {
    return await this.formBuilder.getFormConfiguration(formId);
  }

  async updateFormConfiguration(formId: string, config: Partial<ProfileFormConfig>): Promise<ProfileFormConfig> {
    const existingConfig = await this.getFormConfiguration(formId);
    const updatedConfig = {
      ...existingConfig,
      ...config,
      version: this.incrementVersion(existingConfig.version)
    };
    
    return await this.formBuilder.saveFormConfiguration(updatedConfig);
  }

  // ===========================================
  // Dynamic Field Management
  // ===========================================

  async getConditionalFields(baseFields: FormField[], userData: any): Promise<FormField[]> {
    const conditionalFields: FormField[] = [];
    
    for (const field of baseFields) {
      if (field.conditional) {
        const shouldShow = await this.evaluateFieldConditions(field.conditional, userData);
        if (shouldShow) {
          conditionalFields.push(field);
        }
      } else {
        // Always include non-conditional fields
        conditionalFields.push(field);
      }
    }
    
    return conditionalFields;
  }

  async evaluateFieldConditions(field: ConditionalField, userData: any): Promise<boolean> {
    if (!field.showWhen) return true;
    
    for (const condition of field.showWhen) {
      const fieldValue = this.getNestedValue(userData, condition.field);
      const conditionMet = this.evaluateCondition(fieldValue, condition.operator, condition.value);
      
      if (field.logic === 'AND' && !conditionMet) {
        return false;
      }
      if (field.logic === 'OR' && conditionMet) {
        return true;
      }
    }
    
    return field.logic === 'AND';
  }

  async generateValidationRules(field: FormField, _context: FormGenerationContext): Promise<ValidationRule[]> {
    const rules: ValidationRule[] = [];
    
    // Basic validation using existing ValidationRule structure
    if (field.required) {
      rules.push({
        type: 'custom',
        rule: 'required',
        errorMessage: `${field.label} is required`
      });
    }
    
    // Type-specific validation
    switch (field.type) {
      case 'email':
        rules.push({
          type: 'pattern',
          rule: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          errorMessage: 'Please enter a valid email address'
        });
        break;
        
      case 'phone':
        rules.push({
          type: 'pattern',
          rule: '^\\+?[1-9]\\d{1,14}$',
          errorMessage: 'Please enter a valid phone number'
        });
        break;
        
      case 'number':
        if (field.constraints?.min !== undefined) {
          rules.push({
            type: 'range',
            rule: `min:${field.constraints.min}`,
            errorMessage: `Value must be at least ${field.constraints.min}`
          });
        }
        if (field.constraints?.max !== undefined) {
          rules.push({
            type: 'range',
            rule: `max:${field.constraints.max}`,
            errorMessage: `Value must be at most ${field.constraints.max}`
          });
        }
        break;
    }
    
    return rules;
  }

  // ===========================================
  // Role-Based Configuration
  // ===========================================

  async getFieldsForRole(role: string, organization: string): Promise<FormField[]> {
    const roleConfig = await this.roleConfigManager.getRoleConfiguration(role, organization);
    return roleConfig.profileFields || [];
  }

  async applyOrganizationalConstraints(fields: FormField[], _orgData: OrganizationalData): Promise<FormField[]> {
    // For now, return fields as-is since OrganizationalData doesn't contain
    // field policies or default values in the current interface
    // This could be extended when organizational constraints are implemented
    return fields;
  }

  // ===========================================
  // Validation & Processing
  // ===========================================

  async validateFormData(formConfig: ProfileFormConfig, data: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Get all fields from all sections
    const allFields = formConfig.sections.flatMap(section => section.fields);
    
    // Get fields that should be validated (considering conditional logic)
    const fieldsToValidate = await this.getConditionalFields(allFields, data);
    
    for (const field of fieldsToValidate) {
      const fieldValue = this.getNestedValue(data, field.id);
      const validationRules = await this.generateValidationRules(field, {});
      
      for (const rule of validationRules) {
        const isValid = await this.validationEngine.validateField(fieldValue, rule);
        if (!isValid) {
          errors.push({
            field: field.id,
            rule: rule.type,
            message: rule.errorMessage,
            value: fieldValue
          });
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: this.calculateCompleteness(fieldsToValidate, data)
    };
  }

  async processFormSubmission(formId: string, data: any): Promise<ProcessingResult> {
    try {
      const formConfig = await this.getFormConfiguration(formId);
      
      // Validate data
      const validationResult = await this.validateFormData(formConfig, data);
      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors,
          warnings: validationResult.warnings
        };
      }
      
      // Process submission
      const result = await this.saveFormData(formConfig, data);
      
      return {
        success: true,
        data: result,
        warnings: validationResult.warnings
      };
    } catch (error) {
      console.error('Error processing form submission:', error);
      return {
        success: false,
        errors: [{ field: 'form', rule: 'processing', message: 'Failed to process form submission', value: null }]
      };
    }
  }

  // ===========================================
  // Private Helper Methods
  // ===========================================

  private generateFormId(): string {
    return `form_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private generateFormTitle(userContext: UserContext, context: FormGenerationContext): string {
    return context.title || `${userContext.role} Profile Form`;
  }

  private generateFormDescription(userContext: UserContext, context: FormGenerationContext): string {
    return context.description || `Complete your profile information for ${userContext.organization}`;
  }

  private async groupFieldsIntoSections(fields: FormField[]): Promise<FormSection[]> {
    // Group fields by category or explicit section
    const sectionMap = new Map<string, FormField[]>();
    
    for (const field of fields) {
      const sectionName = field.section || this.categorizeField(field);
      if (!sectionMap.has(sectionName)) {
        sectionMap.set(sectionName, []);
      }
      sectionMap.get(sectionName)!.push(field);
    }
    
    // Convert to sections with metadata
    const sections: FormSection[] = [];
    let order = 1;
    
    for (const [sectionName, sectionFields] of sectionMap) {
      sections.push({
        id: this.generateSectionId(sectionName),
        name: sectionName,
        description: this.getSectionDescription(sectionName),
        order: order++,
        required: sectionFields.some(f => f.required),
        conditional: {
          conditions: [],
          operator: 'AND',
          action: 'show'
        },
        fields: sectionFields,
        layout: {
          columns: 1,
          spacing: 'normal',
          collapsible: false,
          defaultExpanded: true
        },
        permissions: {
          view: ['*'],
          edit: ['*'],
          admin: ['admin']
        }
      });
    }
    
    return sections;
  }

  private categorizeField(field: FormField): string {
    const fieldId = field.id.toLowerCase();
    
    if (fieldId.includes('personal') || fieldId.includes('name') || fieldId.includes('email')) {
      return 'Personal Information';
    }
    if (fieldId.includes('skill') || fieldId.includes('competenc')) {
      return 'Skills & Competencies';
    }
    if (fieldId.includes('education') || fieldId.includes('qualification')) {
      return 'Education & Qualifications';
    }
    if (fieldId.includes('experience') || fieldId.includes('work') || fieldId.includes('job')) {
      return 'Work Experience';
    }
    if (fieldId.includes('goal') || fieldId.includes('objective')) {
      return 'Goals & Objectives';
    }
    if (fieldId.includes('preference') || fieldId.includes('setting')) {
      return 'Preferences & Settings';
    }
    
    return 'General Information';
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private evaluateCondition(value: any, operator: string, targetValue: any): boolean {
    switch (operator) {
      case 'equals':
        return value === targetValue;
      case 'not_equals':
        return value !== targetValue;
      case 'contains':
        return Array.isArray(value) ? value.includes(targetValue) : String(value).includes(targetValue);
      case 'greater_than':
        return Number(value) > Number(targetValue);
      case 'less_than':
        return Number(value) < Number(targetValue);
      case 'is_empty':
        return !value || value === '' || (Array.isArray(value) && value.length === 0);
      case 'is_not_empty':
        return !!value && value !== '' && (!Array.isArray(value) || value.length > 0);
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private calculateCompleteness(fields: FormField[], data: any): number {
    if (fields.length === 0) return 100;
    
    const completedFields = fields.filter(field => {
      const value = this.getNestedValue(data, field.id);
      return value !== undefined && value !== null && value !== '';
    });
    
    return (completedFields.length / fields.length) * 100;
  }

  private async getUserContext(_userId: string): Promise<UserContext> {
    // This would fetch user context from user service
    return {
      role: 'employee',
      organization: 'default',
      organizationalData: {
        organizationChart: [],
        departments: [],
        locations: [],
        jobFamilies: [],
        competencyFrameworks: [],
        skillCatalogs: []
      }
    };
  }

  private generateSectionId(sectionName: string): string {
    return sectionName.toLowerCase().replace(/\s+/g, '_');
  }

  private getSectionDescription(sectionName: string): string {
    const descriptions: Record<string, string> = {
      'Personal Information': 'Basic personal details and contact information',
      'Skills & Competencies': 'Your professional skills and competency levels',
      'Education & Qualifications': 'Educational background and certifications',
      'Work Experience': 'Professional experience and employment history',
      'Goals & Objectives': 'Career goals and learning objectives',
      'Preferences & Settings': 'System preferences and privacy settings'
    };
    return descriptions[sectionName] || '';
  }

  private async saveFormData(formConfig: ProfileFormConfig, data: any): Promise<any> {
    // This would save the form data to the database
    return { id: formConfig.formId, status: 'saved', data };
  }
}

// ===========================================
// Supporting Types and Interfaces
// ===========================================

export interface FormGenerationContext {
  title?: string;
  description?: string;
  phoneFormat?: string;
}

export interface UserContext {
  role: string;
  organization: string;
  organizationalData: OrganizationalData;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  completeness: number;
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  value: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ProcessingResult {
  success: boolean;
  data?: any;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

// ===========================================
// Supporting Services Interfaces
// ===========================================

export interface FormBuilder {
  getFormConfiguration(formId: string): Promise<ProfileFormConfig>;
  saveFormConfiguration(config: ProfileFormConfig): Promise<ProfileFormConfig>;
}

export interface RoleConfigurationManager {
  getRoleConfiguration(role: string, organization: string): Promise<any>;
}

export interface ValidationEngine {
  validateField(value: any, rule: ValidationRule): Promise<boolean>;
}
