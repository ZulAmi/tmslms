/**
 * Data Transformation Service
 * Handles mapping between internal models and SSG-WSG API schemas
 */

import { z } from 'zod';
import {
  SSGFundingScheme,
  WSGCourse,
  FundingApplication,
  TrainingProvider,
  ApplicationParticipant,
  CourseSchedule,
  ApiResponse,
  DeepPartial,
  RequiredFields,
} from '../types';

export interface TransformationContext {
  source: 'internal' | 'ssg' | 'wsg';
  target: 'internal' | 'ssg' | 'wsg';
  version: string;
  includeMetadata?: boolean;
  validateOutput?: boolean;
}

export interface TransformationResult<T> {
  success: boolean;
  data?: T;
  errors?: TransformationError[];
  warnings?: string[];
  metadata?: TransformationMetadata;
}

export interface TransformationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface TransformationMetadata {
  sourceSchema: string;
  targetSchema: string;
  transformedAt: Date;
  transformationRules: string[];
  fieldsOmitted: string[];
  fieldsAdded: string[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any, context?: any) => any;
  required?: boolean;
  defaultValue?: any;
  validation?: z.ZodSchema;
}

export interface SchemaMapping {
  name: string;
  version: string;
  sourceSchema: string;
  targetSchema: string;
  fieldMappings: FieldMapping[];
  customTransforms?: Record<string, (data: any, context?: any) => any>;
  validationSchema?: z.ZodSchema;
}

export class DataTransformationService {
  private readonly schemaMappings: Map<string, SchemaMapping>;
  private readonly customTransformers: Map<
    string,
    (data: any, context?: any) => any
  >;

  constructor() {
    this.schemaMappings = new Map();
    this.customTransformers = new Map();
    this.initializeDefaultMappings();
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Transform data from one schema to another
   */
  async transform<TSource, TTarget>(
    data: TSource,
    mappingName: string,
    context: TransformationContext
  ): Promise<TransformationResult<TTarget>> {
    try {
      const mapping = this.schemaMappings.get(mappingName);
      if (!mapping) {
        return {
          success: false,
          errors: [
            {
              field: 'mapping',
              message: `Schema mapping '${mappingName}' not found`,
              code: 'MAPPING_NOT_FOUND',
            },
          ],
        };
      }

      // Validate input if schema is provided
      if (mapping.validationSchema && context.validateOutput) {
        const validation = mapping.validationSchema.safeParse(data);
        if (!validation.success) {
          return {
            success: false,
            errors: validation.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
              value: undefined, // ZodIssue doesn't expose input value
            })),
          };
        }
      }

      const result = await this.performTransformation<TSource, TTarget>(
        data,
        mapping,
        context
      );

      return result;
    } catch (error: any) {
      return {
        success: false,
        errors: [
          {
            field: 'transformation',
            message: error.message,
            code: 'TRANSFORMATION_ERROR',
          },
        ],
      };
    }
  }

  /**
   * Transform SSG funding scheme from API to internal format
   */
  async transformSSGSchemeFromAPI(
    apiData: any
  ): Promise<TransformationResult<SSGFundingScheme>> {
    return this.transform<any, SSGFundingScheme>(
      apiData,
      'ssg-scheme-from-api',
      {
        source: 'ssg',
        target: 'internal',
        version: '1.0',
        validateOutput: true,
      }
    );
  }

  /**
   * Transform WSG course from API to internal format
   */
  async transformWSGCourseFromAPI(
    apiData: any
  ): Promise<TransformationResult<WSGCourse>> {
    return this.transform<any, WSGCourse>(apiData, 'wsg-course-from-api', {
      source: 'wsg',
      target: 'internal',
      version: '1.0',
      validateOutput: true,
    });
  }

  /**
   * Transform internal funding application to SSG API format
   */
  async transformApplicationToSSG(
    application: FundingApplication
  ): Promise<TransformationResult<any>> {
    return this.transform<FundingApplication, any>(
      application,
      'application-to-ssg',
      {
        source: 'internal',
        target: 'ssg',
        version: '1.0',
        validateOutput: false,
      }
    );
  }

  /**
   * Transform internal course to WSG API format
   */
  async transformCourseToWSG(
    course: WSGCourse
  ): Promise<TransformationResult<any>> {
    return this.transform<WSGCourse, any>(course, 'course-to-wsg', {
      source: 'internal',
      target: 'wsg',
      version: '1.0',
      validateOutput: false,
    });
  }

  /**
   * Register a new schema mapping
   */
  registerMapping(mapping: SchemaMapping): void {
    this.schemaMappings.set(mapping.name, mapping);
  }

  /**
   * Register a custom transformer function
   */
  registerTransformer(
    name: string,
    transformer: (data: any, context?: any) => any
  ): void {
    this.customTransformers.set(name, transformer);
  }

  /**
   * Get all registered mappings
   */
  getMappings(): string[] {
    return Array.from(this.schemaMappings.keys());
  }

  /**
   * Validate data against a schema
   */
  async validateData<T>(
    data: any,
    schema: z.ZodSchema<T>
  ): Promise<TransformationResult<T>> {
    try {
      const validation = schema.safeParse(data);

      if (validation.success) {
        return {
          success: true,
          data: validation.data,
        };
      } else {
        return {
          success: false,
          errors: validation.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            value: undefined, // ZodIssue doesn't expose input value
          })),
        };
      }
    } catch (error: any) {
      return {
        success: false,
        errors: [
          {
            field: 'validation',
            message: error.message,
            code: 'VALIDATION_ERROR',
          },
        ],
      };
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async performTransformation<TSource, TTarget>(
    data: TSource,
    mapping: SchemaMapping,
    context: TransformationContext
  ): Promise<TransformationResult<TTarget>> {
    const result: any = {};
    const errors: TransformationError[] = [];
    const warnings: string[] = [];
    const fieldsOmitted: string[] = [];
    const fieldsAdded: string[] = [];
    const transformationRules: string[] = [];

    // Apply field mappings
    for (const fieldMapping of mapping.fieldMappings) {
      try {
        const sourceValue = this.getNestedValue(data, fieldMapping.sourceField);

        // Check if field is required but missing
        if (
          fieldMapping.required &&
          (sourceValue === undefined || sourceValue === null)
        ) {
          if (fieldMapping.defaultValue !== undefined) {
            this.setNestedValue(
              result,
              fieldMapping.targetField,
              fieldMapping.defaultValue
            );
            fieldsAdded.push(fieldMapping.targetField);
            transformationRules.push(
              `Applied default value for ${fieldMapping.targetField}`
            );
          } else {
            errors.push({
              field: fieldMapping.sourceField,
              message: `Required field is missing`,
              code: 'REQUIRED_FIELD_MISSING',
            });
            continue;
          }
        }

        // Skip if source value is undefined and not required
        if (sourceValue === undefined && !fieldMapping.required) {
          fieldsOmitted.push(fieldMapping.sourceField);
          continue;
        }

        // Apply transformation if provided
        let transformedValue = sourceValue;
        if (fieldMapping.transform) {
          try {
            transformedValue = fieldMapping.transform(sourceValue, context);
            transformationRules.push(
              `Applied custom transform for ${fieldMapping.targetField}`
            );
          } catch (transformError: any) {
            errors.push({
              field: fieldMapping.sourceField,
              message: `Transformation failed: ${transformError.message}`,
              code: 'TRANSFORM_ERROR',
              value: sourceValue,
            });
            continue;
          }
        }

        // Validate transformed value if schema provided
        if (fieldMapping.validation) {
          const validation =
            fieldMapping.validation.safeParse(transformedValue);
          if (!validation.success) {
            errors.push({
              field: fieldMapping.targetField,
              message: `Validation failed: ${validation.error.errors[0]?.message}`,
              code: 'VALIDATION_FAILED',
              value: transformedValue,
            });
            continue;
          }
          transformedValue = validation.data;
        }

        // Set the transformed value
        this.setNestedValue(result, fieldMapping.targetField, transformedValue);
      } catch (error: any) {
        errors.push({
          field: fieldMapping.sourceField,
          message: `Field mapping failed: ${error.message}`,
          code: 'MAPPING_ERROR',
        });
      }
    }

    // Apply custom transforms
    if (mapping.customTransforms) {
      for (const [transformName, transformer] of Object.entries(
        mapping.customTransforms
      )) {
        try {
          const transformResult = transformer(data, context);
          Object.assign(result, transformResult);
          transformationRules.push(
            `Applied custom transform: ${transformName}`
          );
        } catch (error: any) {
          warnings.push(
            `Custom transform '${transformName}' failed: ${error.message}`
          );
        }
      }
    }

    // Return result
    if (errors.length > 0) {
      return {
        success: false,
        errors,
        warnings,
      };
    }

    const metadata: TransformationMetadata = {
      sourceSchema: mapping.sourceSchema,
      targetSchema: mapping.targetSchema,
      transformedAt: new Date(),
      transformationRules,
      fieldsOmitted,
      fieldsAdded,
    };

    return {
      success: true,
      data: result as TTarget,
      warnings,
      metadata: context.includeMetadata ? metadata : undefined,
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;

    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  private initializeDefaultMappings(): void {
    // SSG Funding Scheme mapping
    this.registerMapping({
      name: 'ssg-scheme-from-api',
      version: '1.0',
      sourceSchema: 'ssg-api-scheme',
      targetSchema: 'internal-scheme',
      fieldMappings: [
        {
          sourceField: 'scheme_id',
          targetField: 'id',
          required: true,
        },
        {
          sourceField: 'scheme_name',
          targetField: 'name',
          required: true,
        },
        {
          sourceField: 'scheme_code',
          targetField: 'code',
          required: true,
        },
        {
          sourceField: 'description',
          targetField: 'description',
          required: true,
        },
        {
          sourceField: 'category',
          targetField: 'category',
          transform: (value: string) =>
            value.toLowerCase().replace(/\s+/g, '_'),
          required: true,
        },
        {
          sourceField: 'status',
          targetField: 'status',
          transform: (value: string) => value.toLowerCase(),
          required: true,
        },
        {
          sourceField: 'effective_date',
          targetField: 'effectiveDate',
          transform: (value: string) => new Date(value),
          required: true,
        },
        {
          sourceField: 'expiry_date',
          targetField: 'expiryDate',
          transform: (value: string) => (value ? new Date(value) : undefined),
        },
        {
          sourceField: 'last_updated',
          targetField: 'lastUpdated',
          transform: (value: string) => new Date(value),
          required: true,
        },
        {
          sourceField: 'eligibility_criteria',
          targetField: 'eligibilityCriteria',
          transform: this.transformEligibilityCriteria.bind(this),
          required: true,
        },
        {
          sourceField: 'funding_limits',
          targetField: 'fundingLimits',
          transform: this.transformFundingLimits.bind(this),
          required: true,
        },
        {
          sourceField: 'subsidy_rates',
          targetField: 'subsidyRates',
          transform: this.transformSubsidyRates.bind(this),
          required: true,
        },
      ],
    });

    // WSG Course mapping
    this.registerMapping({
      name: 'wsg-course-from-api',
      version: '1.0',
      sourceSchema: 'wsg-api-course',
      targetSchema: 'internal-course',
      fieldMappings: [
        {
          sourceField: 'course_id',
          targetField: 'id',
          required: true,
        },
        {
          sourceField: 'course_title',
          targetField: 'title',
          required: true,
        },
        {
          sourceField: 'course_code',
          targetField: 'code',
          required: true,
        },
        {
          sourceField: 'course_description',
          targetField: 'description',
          required: true,
        },
        {
          sourceField: 'training_provider',
          targetField: 'provider',
          transform: this.transformTrainingProvider.bind(this),
          required: true,
        },
        {
          sourceField: 'course_category',
          targetField: 'category',
          transform: (value: string) =>
            value.toLowerCase().replace(/\s+/g, '_'),
          required: true,
        },
        {
          sourceField: 'course_duration',
          targetField: 'duration',
          transform: this.transformCourseDuration.bind(this),
          required: true,
        },
        {
          sourceField: 'delivery_modes',
          targetField: 'deliveryMode',
          transform: (modes: string[]) =>
            modes.map((mode) => mode.toLowerCase().replace(/\s+/g, '_')),
          required: true,
        },
        {
          sourceField: 'course_fees',
          targetField: 'fees',
          transform: this.transformCourseFees.bind(this),
          required: true,
        },
        {
          sourceField: 'course_status',
          targetField: 'status',
          transform: (value: string) => value.toLowerCase(),
          required: true,
        },
        {
          sourceField: 'created_date',
          targetField: 'createdDate',
          transform: (value: string) => new Date(value),
          required: true,
        },
        {
          sourceField: 'last_updated',
          targetField: 'lastUpdated',
          transform: (value: string) => new Date(value),
          required: true,
        },
      ],
    });

    // Application to SSG mapping
    this.registerMapping({
      name: 'application-to-ssg',
      version: '1.0',
      sourceSchema: 'internal-application',
      targetSchema: 'ssg-api-application',
      fieldMappings: [
        {
          sourceField: 'id',
          targetField: 'application_id',
          required: true,
        },
        {
          sourceField: 'applicationNumber',
          targetField: 'application_number',
          required: true,
        },
        {
          sourceField: 'schemeId',
          targetField: 'scheme_id',
          required: true,
        },
        {
          sourceField: 'applicationType',
          targetField: 'application_type',
          transform: (value: string) => value.toUpperCase(),
          required: true,
        },
        {
          sourceField: 'applicant',
          targetField: 'applicant_details',
          transform: this.transformApplicantToSSG.bind(this),
          required: true,
        },
        {
          sourceField: 'courses',
          targetField: 'course_details',
          transform: this.transformCoursesToSSG.bind(this),
          required: true,
        },
        {
          sourceField: 'participants',
          targetField: 'participant_details',
          transform: this.transformParticipantsToSSG.bind(this),
          required: true,
        },
        {
          sourceField: 'totalAmount',
          targetField: 'total_course_fee',
          required: true,
        },
        {
          sourceField: 'requestedSubsidy',
          targetField: 'requested_subsidy_amount',
          required: true,
        },
        {
          sourceField: 'submissionDate',
          targetField: 'submission_date',
          transform: (value: Date) => value.toISOString(),
          required: true,
        },
      ],
    });
  }

  // ============================================================================
  // TRANSFORMATION HELPER METHODS
  // ============================================================================

  private transformEligibilityCriteria(apiCriteria: any): any {
    return {
      citizenship:
        apiCriteria.citizenship_requirements?.map((c: string) =>
          c.toLowerCase().replace(/\s+/g, '_')
        ) || [],
      ageRange: apiCriteria.age_range
        ? {
            minimum: apiCriteria.age_range.min_age,
            maximum: apiCriteria.age_range.max_age,
          }
        : undefined,
      employmentStatus:
        apiCriteria.employment_status?.map((s: string) =>
          s.toLowerCase().replace(/\s+/g, '_')
        ) || [],
      industryRestrictions: apiCriteria.industry_restrictions,
      salaryCapRequirement: apiCriteria.salary_cap
        ? {
            maximum: apiCriteria.salary_cap.amount,
            currency: 'SGD',
            period: apiCriteria.salary_cap.period.toLowerCase(),
          }
        : undefined,
      educationLevel:
        apiCriteria.education_levels?.map((l: string) =>
          l.toLowerCase().replace(/\s+/g, '_')
        ) || [],
      companySize: apiCriteria.company_size
        ? apiCriteria.company_size.toLowerCase().replace(/\s+/g, '_')
        : undefined,
      companyAge: apiCriteria.company_age_months,
    };
  }

  private transformFundingLimits(apiLimits: any): any {
    return {
      individual: apiLimits.individual
        ? {
            maxAmountPerCourse: apiLimits.individual.max_amount_per_course,
            maxAmountPerYear: apiLimits.individual.max_amount_per_year,
            maxAmountLifetime: apiLimits.individual.max_amount_lifetime,
            maxCoursesPerYear: apiLimits.individual.max_courses_per_year,
            currency: 'SGD',
          }
        : undefined,
      enterprise: apiLimits.enterprise
        ? {
            maxAmountPerEmployee: apiLimits.enterprise.max_amount_per_employee,
            maxAmountPerYear: apiLimits.enterprise.max_amount_per_year,
            maxEmployeesPerApplication:
              apiLimits.enterprise.max_employees_per_application,
            currency: 'SGD',
          }
        : undefined,
      course: apiLimits.course
        ? {
            maxFundableAmount: apiLimits.course.max_fundable_amount,
            maxParticipants: apiLimits.course.max_participants,
            minParticipants: apiLimits.course.min_participants,
            currency: 'SGD',
          }
        : undefined,
    };
  }

  private transformSubsidyRates(apiRates: any[]): any[] {
    return apiRates.map((rate) => ({
      participantProfile: {
        citizenship: rate.participant_profile.citizenship
          .toLowerCase()
          .replace(/\s+/g, '_'),
        ageGroup: rate.participant_profile.age_group,
        employmentStatus: rate.participant_profile.employment_status
          .toLowerCase()
          .replace(/\s+/g, '_'),
        salaryRange: rate.participant_profile.salary_range
          ? {
              minimum: rate.participant_profile.salary_range.min,
              maximum: rate.participant_profile.salary_range.max,
              currency: 'SGD',
            }
          : undefined,
        companySize: rate.participant_profile.company_size
          ? rate.participant_profile.company_size
              .toLowerCase()
              .replace(/\s+/g, '_')
          : undefined,
        industryCode: rate.participant_profile.industry_code,
      },
      subsidyPercentage: rate.subsidy_percentage,
      maxSubsidyAmount: rate.max_subsidy_amount,
      conditions: rate.conditions || [],
    }));
  }

  private transformTrainingProvider(apiProvider: any): any {
    return {
      id: apiProvider.provider_id,
      name: apiProvider.provider_name,
      registrationNumber: apiProvider.registration_number,
      type: apiProvider.provider_type.toLowerCase().replace(/\s+/g, '_'),
      contactInfo: {
        address: {
          street: apiProvider.address.street,
          unit: apiProvider.address.unit,
          building: apiProvider.address.building,
          postalCode: apiProvider.address.postal_code,
          city: apiProvider.address.city || 'Singapore',
          country: apiProvider.address.country || 'Singapore',
        },
        phone: apiProvider.contact.phone || [],
        email: apiProvider.contact.email || [],
        website: apiProvider.contact.website,
      },
      status: apiProvider.status.toLowerCase(),
      establishedDate: new Date(apiProvider.established_date),
    };
  }

  private transformCourseDuration(apiDuration: any): any {
    return {
      totalHours: apiDuration.total_hours,
      weeks: apiDuration.weeks,
      months: apiDuration.months,
      selfPacedMaxDuration: apiDuration.self_paced_max_duration,
    };
  }

  private transformCourseFees(apiFees: any): any {
    return {
      standardFee: apiFees.standard_fee,
      gstAmount: apiFees.gst_amount,
      totalFee: apiFees.total_fee,
      currency: 'SGD',
      feeBreakdown:
        apiFees.fee_breakdown?.map((fee: any) => ({
          name: fee.name,
          amount: fee.amount,
          type: fee.type.toLowerCase().replace(/\s+/g, '_'),
          mandatory: fee.mandatory,
          description: fee.description,
        })) || [],
      paymentOptions:
        apiFees.payment_options?.map((option: any) => ({
          method: option.method.toLowerCase().replace(/\s+/g, '_'),
          installments: option.installments
            ? {
                numberOfInstallments:
                  option.installments.number_of_installments,
                frequency: option.installments.frequency.toLowerCase(),
                firstPaymentAmount: option.installments.first_payment_amount,
                subsequentPaymentAmount:
                  option.installments.subsequent_payment_amount,
                interestRate: option.installments.interest_rate,
              }
            : undefined,
          processingFee: option.processing_fee,
          availableFrom: new Date(option.available_from),
          availableUntil: option.available_until
            ? new Date(option.available_until)
            : undefined,
        })) || [],
      refundPolicy: {
        fullRefundDeadline: apiFees.refund_policy.full_refund_deadline,
        partialRefundDeadline: apiFees.refund_policy.partial_refund_deadline,
        partialRefundPercentage:
          apiFees.refund_policy.partial_refund_percentage,
        processingFee: apiFees.refund_policy.processing_fee,
        conditions: apiFees.refund_policy.conditions || [],
      },
    };
  }

  private transformApplicantToSSG(applicant: any): any {
    if (applicant.type === 'individual') {
      return {
        applicant_type: 'INDIVIDUAL',
        individual_details: {
          nric: applicant.individual.nric,
          name: applicant.individual.name,
          date_of_birth: applicant.individual.dateOfBirth
            .toISOString()
            .split('T')[0],
          citizenship: applicant.individual.citizenship.toUpperCase(),
          gender: applicant.individual.gender.toUpperCase(),
          contact_info: {
            phone: applicant.individual.contactInfo.phone[0] || '',
            email: applicant.individual.contactInfo.email[0] || '',
            address: applicant.individual.contactInfo.address,
          },
          employment_info: applicant.individual.employmentInfo,
        },
      };
    } else {
      return {
        applicant_type: 'COMPANY',
        company_details: {
          company_name: applicant.company.name,
          registration_number: applicant.company.registrationNumber,
          entity_type: applicant.company.entityType.toUpperCase(),
          contact_person: applicant.company.contactPerson,
          business_info: applicant.company.businessInfo,
        },
      };
    }
  }

  private transformCoursesToSSG(courses: any[]): any[] {
    return courses.map((course) => ({
      course_id: course.courseId,
      schedule_id: course.scheduleId,
      course_name: course.courseName,
      training_provider: course.provider,
      start_date: course.startDate.toISOString().split('T')[0],
      end_date: course.endDate.toISOString().split('T')[0],
      total_course_fee: course.totalFee,
      requested_subsidy: course.requestedSubsidy,
      participant_count: course.participantCount,
      justification: course.justification,
    }));
  }

  private transformParticipantsToSSG(participants: any[]): any[] {
    return participants.map((participant) => ({
      participant_id: participant.id,
      nric: participant.nric,
      name: participant.name,
      designation: participant.designation,
      department: participant.department,
      course_ids: participant.courseIds,
      individual_subsidy: participant.individualSubsidy,
      eligibility_verified: participant.eligibilityVerified,
      attendance_commitment: {
        minimum_attendance_percentage:
          participant.attendanceCommitment.minimumAttendance,
        make_up_arrangements:
          participant.attendanceCommitment.makeUpArrangements,
        penalty_clause: participant.attendanceCommitment.penaltyClause,
      },
      post_course_commitment: participant.postCourseCommitment
        ? {
            service_bond: participant.postCourseCommitment.serviceBond,
            performance_targets:
              participant.postCourseCommitment.performanceTargets,
            reporting_requirements:
              participant.postCourseCommitment.reportingRequirements,
          }
        : undefined,
    }));
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a data transformation service instance
 */
export function createDataTransformationService(): DataTransformationService {
  return new DataTransformationService();
}

/**
 * Transform a list of items using a transformation function
 */
export async function transformList<TSource, TTarget>(
  items: TSource[],
  transformer: (item: TSource) => Promise<TransformationResult<TTarget>>,
  options: {
    continueOnError?: boolean;
    maxConcurrent?: number;
  } = {}
): Promise<{
  succeeded: TTarget[];
  failed: Array<{ item: TSource; error: TransformationError[] }>;
}> {
  const { continueOnError = true, maxConcurrent = 10 } = options;
  const succeeded: TTarget[] = [];
  const failed: Array<{ item: TSource; error: TransformationError[] }> = [];

  // Process items in batches to control concurrency
  for (let i = 0; i < items.length; i += maxConcurrent) {
    const batch = items.slice(i, i + maxConcurrent);
    const promises = batch.map(async (item) => {
      try {
        const result = await transformer(item);
        if (result.success && result.data) {
          return { success: true, data: result.data, item };
        } else {
          return { success: false, errors: result.errors || [], item };
        }
      } catch (error: any) {
        return {
          success: false,
          errors: [
            {
              field: 'transformation',
              message: error.message,
              code: 'TRANSFORM_ERROR',
            },
          ],
          item,
        };
      }
    });

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result.success && result.data) {
        succeeded.push(result.data);
      } else {
        failed.push({ item: result.item, error: result.errors || [] });
        if (!continueOnError) {
          return { succeeded, failed };
        }
      }
    }
  }

  return { succeeded, failed };
}
