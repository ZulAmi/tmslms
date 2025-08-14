/**
 * HR Integration Service - Enterprise HR System Integration
 * 
 * Manages synchronization with HR systems, handles data conflicts,
 * and maintains employee record consistency across platforms.
 */

import {
  HRIntegrationData,
  HREmployeeData,
  OrganizationalData,
  DataConflict,
  ConflictResolutionAction,
  UserProfile,
  SkillProfile
} from './types';

// ===========================================
// HR Integration Service Interface
// ===========================================

export interface IHRIntegrationService {
  // Data Synchronization
  syncEmployeeData(employeeId: string): Promise<HRSyncResult>;
  batchSyncEmployees(employeeIds: string[]): Promise<BatchSyncResult>;
  schedulePeriodSync(frequency: SyncFrequency): Promise<void>;
  
  // Data Mapping
  mapHRDataToProfile(hrData: HREmployeeData): Promise<Partial<UserProfile>>;
  mapProfileToHRData(profile: UserProfile): Promise<Partial<HREmployeeData>>;
  validateDataMapping(hrData: HREmployeeData, profileData: UserProfile): Promise<ValidationResult>;
  
  // Conflict Resolution
  detectDataConflicts(employeeId: string): Promise<DataConflict[]>;
  resolveConflict(conflictId: string, resolution: ConflictResolutionAction): Promise<void>;
  getConflictHistory(employeeId: string): Promise<DataConflict[]>;
  
  // Organizational Structure
  syncOrganizationalStructure(): Promise<OrganizationalData>;
  updateEmployeeHierarchy(employeeId: string): Promise<void>;
  getReportingStructure(employeeId: string): Promise<ReportingStructure>;
  
  // Skills Integration
  syncSkillsFromHR(employeeId: string): Promise<SkillProfile>;
  pushSkillsToHR(employeeId: string, skills: SkillProfile): Promise<HRUpdateResult>;
  reconcileSkillData(employeeId: string): Promise<SkillReconciliationResult>;
  
  // Compliance & Audit
  generateSyncReport(): Promise<SyncReport>;
  auditDataIntegrity(): Promise<IntegrityReport>;
  trackSyncActivity(employeeId: string): Promise<SyncActivity[]>;
  
  // System Management
  configureHRConnection(config: HRConnectionConfig): Promise<void>;
  testHRConnection(): Promise<ConnectionTestResult>;
  getIntegrationStatus(): Promise<IntegrationStatus>;
}

// ===========================================
// HR Integration Service Implementation
// ===========================================

export class HRIntegrationService implements IHRIntegrationService {
  private hrApiClient: HRApiClient;
  private dataMapper: DataMapper;
  private conflictResolver: ConflictResolver;
  private syncScheduler: SyncScheduler;
  private auditLogger: AuditLogger;
  private profileService: ProfileService;

  constructor(
    hrApiClient: HRApiClient,
    dataMapper: DataMapper,
    conflictResolver: ConflictResolver,
    syncScheduler: SyncScheduler,
    auditLogger: AuditLogger,
    profileService: ProfileService
  ) {
    this.hrApiClient = hrApiClient;
    this.dataMapper = dataMapper;
    this.conflictResolver = conflictResolver;
    this.syncScheduler = syncScheduler;
    this.auditLogger = auditLogger;
    this.profileService = profileService;
  }

  // ===========================================
  // Data Synchronization
  // ===========================================

  async syncEmployeeData(employeeId: string): Promise<HRSyncResult> {
    try {
      console.log(`Starting HR sync for employee ${employeeId}`);
      
      // Fetch data from both systems
      const [hrData, profileData] = await Promise.all([
        this.hrApiClient.getEmployeeData(employeeId),
        this.profileService.getProfile(employeeId)
      ]);

      if (!hrData) {
        throw new Error('Employee not found in HR system');
      }

      // Detect conflicts
      const conflicts = await this.detectDataConflicts(employeeId);
      
      if (conflicts.length > 0) {
        console.log(`Found ${conflicts.length} conflicts for employee ${employeeId}`);
        return {
          success: false,
          employeeId,
          conflicts,
          lastSyncDate: new Date(),
          status: 'conflicts_detected'
        };
      }

      // Map HR data to profile format
      const mappedData = await this.mapHRDataToProfile(hrData);
      
      // Update profile with HR data
      const updatedProfile = await this.profileService.updateProfile(employeeId, mappedData);
      
      // Log successful sync
      await this.auditLogger.logSync({
        employeeId,
        syncType: 'full',
        status: 'success',
        timestamp: new Date(),
        dataPoints: Object.keys(mappedData).length
      });

      return {
        success: true,
        employeeId,
        updatedFields: Object.keys(mappedData),
        conflicts: [],
        lastSyncDate: new Date(),
        status: 'synchronized'
      };
    } catch (error) {
      console.error(`HR sync failed for employee ${employeeId}:`, error);
      
      await this.auditLogger.logSync({
        employeeId,
        syncType: 'full',
        status: 'error',
        timestamp: new Date(),
        error: error.message
      });

      return {
        success: false,
        employeeId,
        conflicts: [],
        lastSyncDate: new Date(),
        status: 'error',
        error: error.message
      };
    }
  }

  async batchSyncEmployees(employeeIds: string[]): Promise<BatchSyncResult> {
    console.log(`Starting batch sync for ${employeeIds.length} employees`);
    
    const results: HRSyncResult[] = [];
    const batchSize = 10; // Process in batches to avoid overwhelming systems
    
    for (let i = 0; i < employeeIds.length; i += batchSize) {
      const batch = employeeIds.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(employeeId => this.syncEmployeeData(employeeId))
      );
      
      results.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < employeeIds.length) {
        await this.delay(1000); // 1 second delay
      }
    }
    
    const summary = this.calculateBatchSummary(results);
    
    await this.auditLogger.logBatchSync({
      totalEmployees: employeeIds.length,
      successful: summary.successful,
      failed: summary.failed,
      conflicts: summary.conflicts,
      timestamp: new Date()
    });
    
    return {
      totalProcessed: employeeIds.length,
      successful: summary.successful,
      failed: summary.failed,
      conflicts: summary.conflicts,
      results,
      completedAt: new Date()
    };
  }

  async schedulePeriodSync(frequency: SyncFrequency): Promise<void> {
    await this.syncScheduler.scheduleSync(frequency);
    console.log(`Scheduled periodic sync with frequency: ${frequency}`);
  }

  // ===========================================
  // Data Mapping
  // ===========================================

  async mapHRDataToProfile(hrData: HREmployeeData): Promise<Partial<UserProfile>> {
    const mappedData: Partial<UserProfile> = {};
    
    // Map basic information from HR data
    mappedData.personalInfo = {
      firstName: '', // Would need to be retrieved from HR system separately
      lastName: '', // Would need to be retrieved from HR system separately
      email: hrData.workEmail,
      phone: '', // Would need to be retrieved from HR system separately
      dateOfBirth: new Date(), // Would need to be retrieved from HR system separately
      nationality: '', // Would need to be retrieved from HR system separately
      languages: [], // Would need to be retrieved from HR system separately
    };

    // Map professional information
    mappedData.professionalInfo = {
      employeeId: hrData.employeeId,
      department: hrData.department,
      jobTitle: hrData.jobFamily, // Using job family as job title
      manager: hrData.managerEmployeeId,
      startDate: new Date(), // Would need actual start date from HR
      employmentType: hrData.contractType,
      workingHours: hrData.workingHours,
      costCenter: hrData.costCenter,
      grade: hrData.salaryGrade,
      performanceRating: hrData.performanceRating
    };

    // Map skills from HR competency model
    if (hrData.competencies) {
      mappedData.skillProfile = await this.mapHRCompetenciesToSkills(hrData.competencies);
    }

    return mappedData;
  }

  async mapProfileToHRData(profile: UserProfile): Promise<Partial<HREmployeeData>> {
    const hrData: Partial<HREmployeeData> = {};
    
    // Map personal information
    if (profile.personalInfo) {
      hrData.personalInfo = {
        firstName: profile.personalInfo.firstName,
        lastName: profile.personalInfo.lastName,
        personalEmail: profile.personalInfo.email,
        personalPhone: profile.personalInfo.phone,
        dateOfBirth: profile.personalInfo.dateOfBirth,
        nationality: profile.personalInfo.nationality,
        languages: profile.personalInfo.languages,
        emergencyContact: profile.personalInfo.emergencyContact
      };
    }

    // Map professional information (read-only from HR perspective)
    // This is typically not pushed back to HR as it's the source of truth

    // Map skills back to HR competency format
    if (profile.skillProfile) {
      hrData.competencies = await this.mapSkillsToHRCompetencies(profile.skillProfile);
    }

    return hrData;
  }

  async validateDataMapping(hrData: HREmployeeData, profileData: UserProfile): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    
    // Validate required fields are present
    if (!hrData.personalInfo?.firstName || !profileData.personalInfo?.firstName) {
      issues.push({
        field: 'firstName',
        type: 'missing_required',
        message: 'First name is required in both systems'
      });
    }
    
    if (!hrData.personalInfo?.lastName || !profileData.personalInfo?.lastName) {
      issues.push({
        field: 'lastName',
        type: 'missing_required',
        message: 'Last name is required in both systems'
      });
    }

    // Validate data consistency
    if (hrData.personalInfo?.firstName !== profileData.personalInfo?.firstName) {
      issues.push({
        field: 'firstName',
        type: 'data_mismatch',
        message: 'First name differs between HR and profile',
        hrValue: hrData.personalInfo.firstName,
        profileValue: profileData.personalInfo.firstName
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (hrData.personalInfo?.workEmail && !emailRegex.test(hrData.personalInfo.workEmail)) {
      issues.push({
        field: 'workEmail',
        type: 'invalid_format',
        message: 'Invalid email format in HR system'
      });
    }

    return {
      isValid: issues.length === 0,
      issues,
      validatedAt: new Date()
    };
  }

  // ===========================================
  // Conflict Resolution
  // ===========================================

  async detectDataConflicts(employeeId: string): Promise<DataConflict[]> {
    const [hrData, profileData] = await Promise.all([
      this.hrApiClient.getEmployeeData(employeeId),
      this.profileService.getProfile(employeeId)
    ]);

    if (!hrData || !profileData) {
      return [];
    }

    const conflicts: DataConflict[] = [];

    // Check for conflicts in personal information
    const personalConflicts = await this.comparePersonalInfo(
      hrData.personalInfo, 
      profileData.personalInfo,
      employeeId
    );
    conflicts.push(...personalConflicts);

    // Check for conflicts in professional information
    const professionalConflicts = await this.compareProfessionalInfo(
      hrData.professionalInfo,
      profileData.professionalInfo,
      employeeId
    );
    conflicts.push(...professionalConflicts);

    return conflicts;
  }

  async resolveConflict(conflictId: string, resolution: ConflictResolutionAction): Promise<void> {
    const conflict = await this.conflictResolver.getConflict(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    switch (resolution.action) {
      case 'use_hr_value':
        await this.updateProfileWithHRValue(conflict);
        break;
      case 'use_profile_value':
        await this.updateHRWithProfileValue(conflict);
        break;
      case 'merge_values':
        await this.mergeConflictValues(conflict, resolution.mergeStrategy);
        break;
      case 'manual_value':
        await this.setManualValue(conflict, resolution.manualValue);
        break;
      default:
        throw new Error('Invalid resolution action');
    }

    // Mark conflict as resolved
    await this.conflictResolver.markResolved(conflictId, resolution);
    
    // Log resolution
    await this.auditLogger.logConflictResolution({
      conflictId,
      employeeId: conflict.recordId,
      field: conflict.field,
      resolution: resolution.action,
      timestamp: new Date()
    });
  }

  async getConflictHistory(employeeId: string): Promise<DataConflict[]> {
    return await this.conflictResolver.getConflictHistory(employeeId);
  }

  // ===========================================
  // Organizational Structure
  // ===========================================

  async syncOrganizationalStructure(): Promise<OrganizationalData> {
    const orgStructure = await this.hrApiClient.getOrganizationalStructure();
    
    // Transform HR org structure to our format
    const organizationalData: OrganizationalData = {
      departments: orgStructure.departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        parentId: dept.parentId,
        managerId: dept.managerId,
        costCenter: dept.costCenter
      })),
      locations: orgStructure.locations,
      jobTitles: orgStructure.jobTitles,
      skillTaxonomy: await this.mapHRSkillTaxonomy(orgStructure.competencyModel),
      fieldPolicies: {},
      defaultValues: {}
    };
    
    return organizationalData;
  }

  async updateEmployeeHierarchy(employeeId: string): Promise<void> {
    const hrData = await this.hrApiClient.getEmployeeData(employeeId);
    if (!hrData) return;

    const hierarchyData = {
      manager: hrData.professionalInfo?.managerId,
      directReports: hrData.organizationalInfo?.directReports || [],
      department: hrData.professionalInfo?.department,
      level: hrData.organizationalInfo?.level
    };

    await this.profileService.updateHierarchy(employeeId, hierarchyData);
  }

  async getReportingStructure(employeeId: string): Promise<ReportingStructure> {
    const hrData = await this.hrApiClient.getEmployeeData(employeeId);
    if (!hrData) {
      throw new Error('Employee not found in HR system');
    }

    return {
      employeeId,
      managerId: hrData.professionalInfo?.managerId,
      directReports: hrData.organizationalInfo?.directReports || [],
      department: hrData.professionalInfo?.department,
      level: hrData.organizationalInfo?.level || 0,
      costCenter: hrData.professionalInfo?.costCenter
    };
  }

  // ===========================================
  // Skills Integration
  // ===========================================

  async syncSkillsFromHR(employeeId: string): Promise<SkillProfile> {
    const hrData = await this.hrApiClient.getEmployeeData(employeeId);
    if (!hrData?.competencies) {
      throw new Error('No HR competency data found');
    }

    return await this.mapHRCompetenciesToSkills(hrData.competencies);
  }

  async pushSkillsToHR(employeeId: string, skills: SkillProfile): Promise<HRUpdateResult> {
    const hrCompetencies = await this.mapSkillsToHRCompetencies(skills);
    
    try {
      await this.hrApiClient.updateEmployeeCompetencies(employeeId, hrCompetencies);
      
      return {
        success: true,
        updatedFields: Object.keys(hrCompetencies),
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async reconcileSkillData(employeeId: string): Promise<SkillReconciliationResult> {
    const [hrSkills, profileSkills] = await Promise.all([
      this.syncSkillsFromHR(employeeId),
      this.profileService.getSkillProfile(employeeId)
    ]);

    const reconciliation = await this.dataMapper.reconcileSkills(hrSkills, profileSkills);
    
    return {
      employeeId,
      hrSkillCount: hrSkills.skillsets.length,
      profileSkillCount: profileSkills.skillsets.length,
      matchedSkills: reconciliation.matched,
      hrOnlySkills: reconciliation.hrOnly,
      profileOnlySkills: reconciliation.profileOnly,
      conflicts: reconciliation.conflicts,
      recommendedActions: reconciliation.recommendations
    };
  }

  // ===========================================
  // Compliance & Audit
  // ===========================================

  async generateSyncReport(): Promise<SyncReport> {
    const syncActivities = await this.auditLogger.getSyncActivities();
    const conflicts = await this.conflictResolver.getActiveConflicts();
    
    return {
      reportPeriod: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date()
      },
      totalSyncs: syncActivities.length,
      successfulSyncs: syncActivities.filter(s => s.status === 'success').length,
      failedSyncs: syncActivities.filter(s => s.status === 'error').length,
      activeConflicts: conflicts.length,
      dataQualityIssues: await this.identifyDataQualityIssues(),
      recommendations: await this.generateSyncRecommendations()
    };
  }

  async auditDataIntegrity(): Promise<IntegrityReport> {
    const employees = await this.hrApiClient.getAllEmployeeIds();
    const integrityIssues: IntegrityIssue[] = [];
    
    for (const employeeId of employees.slice(0, 100)) { // Sample first 100 for performance
      try {
        const [hrData, profileData] = await Promise.all([
          this.hrApiClient.getEmployeeData(employeeId),
          this.profileService.getProfile(employeeId)
        ]);
        
        if (!hrData && profileData) {
          integrityIssues.push({
            employeeId,
            type: 'missing_hr_record',
            description: 'Profile exists but no HR record found'
          });
        }
        
        if (hrData && !profileData) {
          integrityIssues.push({
            employeeId,
            type: 'missing_profile',
            description: 'HR record exists but no profile found'
          });
        }
        
        if (hrData && profileData) {
          const validation = await this.validateDataMapping(hrData, profileData);
          if (!validation.isValid) {
            integrityIssues.push({
              employeeId,
              type: 'data_inconsistency',
              description: `Data validation failed: ${validation.issues.length} issues`,
              details: validation.issues
            });
          }
        }
      } catch (error) {
        integrityIssues.push({
          employeeId,
          type: 'audit_error',
          description: `Audit failed: ${error.message}`
        });
      }
    }
    
    return {
      auditDate: new Date(),
      employeesAudited: Math.min(employees.length, 100),
      totalEmployees: employees.length,
      integrityIssues,
      overallScore: this.calculateIntegrityScore(integrityIssues, employees.length)
    };
  }

  async trackSyncActivity(employeeId: string): Promise<SyncActivity[]> {
    return await this.auditLogger.getSyncActivitiesForEmployee(employeeId);
  }

  // ===========================================
  // System Management
  // ===========================================

  async configureHRConnection(config: HRConnectionConfig): Promise<void> {
    await this.hrApiClient.configure(config);
    console.log('HR connection configured successfully');
  }

  async testHRConnection(): Promise<ConnectionTestResult> {
    try {
      const testResult = await this.hrApiClient.testConnection();
      return {
        success: true,
        responseTime: testResult.responseTime,
        timestamp: new Date(),
        details: testResult.details
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async getIntegrationStatus(): Promise<IntegrationStatus> {
    const [connectionTest, recentSyncs, activeConflicts] = await Promise.all([
      this.testHRConnection(),
      this.auditLogger.getRecentSyncActivities(24), // Last 24 hours
      this.conflictResolver.getActiveConflicts()
    ]);
    
    return {
      isConnected: connectionTest.success,
      lastSyncDate: recentSyncs[0]?.timestamp,
      syncStatus: this.determineSyncStatus(recentSyncs),
      activeConflicts: activeConflicts.length,
      systemHealth: this.calculateSystemHealth(connectionTest, recentSyncs, activeConflicts)
    };
  }

  // ===========================================
  // Private Helper Methods
  // ===========================================

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateBatchSummary(results: HRSyncResult[]): BatchSummary {
    return {
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      conflicts: results.reduce((sum, r) => sum + r.conflicts.length, 0)
    };
  }

  private async mapHRCompetenciesToSkills(competencies: any[]): Promise<SkillProfile> {
    // Transform HR competency model to our skill profile format
    const skillsets = competencies.map(comp => ({
      id: comp.competencyId,
      category: comp.category,
      name: comp.name,
      level: comp.level,
      proficiency: comp.rating,
      lastAssessed: comp.lastAssessmentDate,
      selfRated: false,
      validated: true,
      priority: comp.priority || 'medium',
      relevantToRole: true
    }));

    return {
      skillsets,
      competencies: [],
      assessments: [],
      endorsements: [],
      developmentPlan: {
        id: '',
        createdDate: new Date(),
        lastUpdated: new Date(),
        skillGaps: [],
        developmentGoals: [],
        timeline: { phases: [], totalDuration: 0 },
        status: 'draft'
      },
      ssgMapping: {
        framework: 'SGD',
        mappings: [],
        lastSyncDate: new Date(),
        complianceLevel: 'partial'
      }
    };
  }

  private async mapSkillsToHRCompetencies(skills: SkillProfile): Promise<any[]> {
    return skills.skillsets.map(skill => ({
      competencyId: skill.id,
      name: skill.name,
      category: skill.category,
      level: skill.level,
      rating: skill.proficiency,
      lastAssessmentDate: skill.lastAssessed,
      validated: skill.validated
    }));
  }

  private async mapHRSkillTaxonomy(competencyModel: any): Promise<any> {
    // Transform HR competency model to our skill taxonomy
    return competencyModel;
  }

  private async comparePersonalInfo(hrInfo: any, profileInfo: any, employeeId: string): Promise<DataConflict[]> {
    const conflicts: DataConflict[] = [];
    
    if (hrInfo?.firstName !== profileInfo?.firstName) {
      conflicts.push({
        id: this.generateConflictId(),
        recordId: employeeId,
        field: 'firstName',
        lmsValue: profileInfo?.firstName,
        hrValue: hrInfo?.firstName,
        detectedDate: new Date(),
        status: 'pending'
      });
    }
    
    return conflicts;
  }

  private async compareProfessionalInfo(hrInfo: any, profileInfo: any, employeeId: string): Promise<DataConflict[]> {
    const conflicts: DataConflict[] = [];
    
    if (hrInfo?.jobTitle !== profileInfo?.jobTitle) {
      conflicts.push({
        id: this.generateConflictId(),
        recordId: employeeId,
        field: 'jobTitle',
        lmsValue: profileInfo?.jobTitle,
        hrValue: hrInfo?.jobTitle,
        detectedDate: new Date(),
        status: 'pending'
      });
    }
    
    return conflicts;
  }

  private async updateProfileWithHRValue(conflict: DataConflict): Promise<void> {
    await this.profileService.updateField(conflict.recordId, conflict.field, conflict.hrValue);
  }

  private async updateHRWithProfileValue(conflict: DataConflict): Promise<void> {
    await this.hrApiClient.updateEmployeeField(conflict.recordId, conflict.field, conflict.lmsValue);
  }

  private async mergeConflictValues(conflict: DataConflict, strategy?: string): Promise<void> {
    // Implement merge logic based on strategy
    const mergedValue = strategy === 'concatenate' 
      ? `${conflict.hrValue} / ${conflict.lmsValue}`
      : conflict.hrValue; // Default to HR value
    
    await this.profileService.updateField(conflict.recordId, conflict.field, mergedValue);
  }

  private async setManualValue(conflict: DataConflict, manualValue: any): Promise<void> {
    await this.profileService.updateField(conflict.recordId, conflict.field, manualValue);
  }

  private async identifyDataQualityIssues(): Promise<any[]> {
    // Implement data quality analysis
    return [];
  }

  private async generateSyncRecommendations(): Promise<string[]> {
    // Generate recommendations for improving sync quality
    return [];
  }

  private calculateIntegrityScore(issues: IntegrityIssue[], totalEmployees: number): number {
    if (totalEmployees === 0) return 100;
    const errorRate = issues.length / totalEmployees;
    return Math.max(0, 100 - (errorRate * 100));
  }

  private determineSyncStatus(recentSyncs: any[]): string {
    if (recentSyncs.length === 0) return 'inactive';
    
    const successRate = recentSyncs.filter(s => s.status === 'success').length / recentSyncs.length;
    
    if (successRate >= 0.9) return 'healthy';
    if (successRate >= 0.7) return 'warning';
    return 'critical';
  }

  private calculateSystemHealth(connectionTest: ConnectionTestResult, recentSyncs: any[], conflicts: any[]): string {
    if (!connectionTest.success) return 'critical';
    if (conflicts.length > 10) return 'warning';
    if (recentSyncs.length > 0 && recentSyncs.every(s => s.status === 'success')) return 'healthy';
    return 'warning';
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}

// ===========================================
// Supporting Types and Interfaces
// ===========================================

export type SyncFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface HRSyncResult {
  success: boolean;
  employeeId: string;
  updatedFields?: string[];
  conflicts: DataConflict[];
  lastSyncDate: Date;
  status: 'synchronized' | 'conflicts_detected' | 'error';
  error?: string;
}

export interface BatchSyncResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  conflicts: number;
  results: HRSyncResult[];
  completedAt: Date;
}

export interface BatchSummary {
  successful: number;
  failed: number;
  conflicts: number;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  validatedAt: Date;
}

export interface ValidationIssue {
  field: string;
  type: 'missing_required' | 'data_mismatch' | 'invalid_format';
  message: string;
  hrValue?: any;
  profileValue?: any;
}

export interface ReportingStructure {
  employeeId: string;
  managerId?: string;
  directReports: string[];
  department?: string;
  level: number;
  costCenter?: string;
}

export interface HRUpdateResult {
  success: boolean;
  updatedFields?: string[];
  error?: string;
  timestamp: Date;
}

export interface SkillReconciliationResult {
  employeeId: string;
  hrSkillCount: number;
  profileSkillCount: number;
  matchedSkills: number;
  hrOnlySkills: string[];
  profileOnlySkills: string[];
  conflicts: any[];
  recommendedActions: string[];
}

export interface SyncReport {
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  activeConflicts: number;
  dataQualityIssues: any[];
  recommendations: string[];
}

export interface IntegrityReport {
  auditDate: Date;
  employeesAudited: number;
  totalEmployees: number;
  integrityIssues: IntegrityIssue[];
  overallScore: number;
}

export interface IntegrityIssue {
  employeeId: string;
  type: 'missing_hr_record' | 'missing_profile' | 'data_inconsistency' | 'audit_error';
  description: string;
  details?: any;
}

export interface SyncActivity {
  employeeId: string;
  syncType: string;
  status: string;
  timestamp: Date;
  dataPoints?: number;
  error?: string;
}

export interface HRConnectionConfig {
  apiUrl: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  timeout: number;
  retryAttempts: number;
}

export interface ConnectionTestResult {
  success: boolean;
  responseTime?: number;
  error?: string;
  timestamp: Date;
  details?: any;
}

export interface IntegrationStatus {
  isConnected: boolean;
  lastSyncDate?: Date;
  syncStatus: string;
  activeConflicts: number;
  systemHealth: string;
}

// ===========================================
// Supporting Services Interfaces
// ===========================================

export interface HRApiClient {
  getEmployeeData(employeeId: string): Promise<HREmployeeData | null>;
  getAllEmployeeIds(): Promise<string[]>;
  getOrganizationalStructure(): Promise<any>;
  updateEmployeeField(employeeId: string, field: string, value: any): Promise<void>;
  updateEmployeeCompetencies(employeeId: string, competencies: any[]): Promise<void>;
  configure(config: HRConnectionConfig): Promise<void>;
  testConnection(): Promise<any>;
}

export interface DataMapper {
  reconcileSkills(hrSkills: SkillProfile, profileSkills: SkillProfile): Promise<any>;
}

export interface ConflictResolver {
  getConflict(conflictId: string): Promise<DataConflict | null>;
  getConflictHistory(employeeId: string): Promise<DataConflict[]>;
  getActiveConflicts(): Promise<DataConflict[]>;
  markResolved(conflictId: string, resolution: ConflictResolutionAction): Promise<void>;
}

export interface SyncScheduler {
  scheduleSync(frequency: SyncFrequency): Promise<void>;
}

export interface AuditLogger {
  logSync(data: any): Promise<void>;
  logBatchSync(data: any): Promise<void>;
  logConflictResolution(data: any): Promise<void>;
  getSyncActivities(): Promise<any[]>;
  getSyncActivitiesForEmployee(employeeId: string): Promise<SyncActivity[]>;
  getRecentSyncActivities(hours: number): Promise<any[]>;
}

export interface ProfileService {
  getProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  getSkillProfile(userId: string): Promise<SkillProfile>;
  updateField(userId: string, field: string, value: any): Promise<void>;
  updateHierarchy(userId: string, hierarchyData: any): Promise<void>;
}
