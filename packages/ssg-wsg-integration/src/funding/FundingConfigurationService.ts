/**
 * Funding Configuration Service
 * Manages all funding system settings, parameters, and business rules
 */

import { EventEmitter } from 'events';
import { CacheService } from '../cache/CacheService';
import {
  ApplicableFundingScheme,
  SubsidyCalculationResponse,
  EligibilityCriteriaCheck,
  ApprovalLevel,
  ApprovalLevelConfiguration,
} from './types';

export interface FundingConfiguration {
  general: GeneralConfig;
  schemes: SchemeConfiguration[];
  approval: ApprovalConfiguration;
  compliance: ComplianceConfiguration;
  integration: IntegrationConfiguration;
  notifications: NotificationConfiguration;
  security: SecurityConfiguration;
  performance: PerformanceConfiguration;
}

export interface GeneralConfig {
  systemName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  region: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  supportContact: {
    email: string;
    phone: string;
    hours: string;
  };
  features: {
    enableAutoApproval: boolean;
    enableBulkProcessing: boolean;
    enableRealtimeUpdates: boolean;
    enableAdvancedReporting: boolean;
    enableAuditTrail: boolean;
    enableMobileAccess: boolean;
    enableApiAccess: boolean;
  };
}

export interface SchemeConfiguration {
  schemeId: string;
  schemeName: string;
  description: string;
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
  eligibilityCriteria: EligibilityCriteriaCheck[];
  subsidyRates: SchemeSubsidyRate[];
  maximumClaims: {
    perParticipant: number;
    perCompany: number;
    perCourse: number;
  };
  documentRequirements: DocumentRequirement[];
  approvalWorkflow: string;
  reportingRequirements: ReportingRequirement[];
  complianceRules: SchemeComplianceRule[];
  integrationSettings: SchemeIntegrationSettings;
}

export interface SchemeSubsidyRate {
  participantProfile: string;
  courseCategory: string;
  subsidyPercentage: number;
  maxAmount: number;
  conditions: string[];
}

export interface SchemeComplianceRule {
  ruleId: string;
  ruleName: string;
  description: string;
  mandatory: boolean;
  validationLogic: string;
  errorMessage: string;
}

export interface DocumentRequirement {
  documentType: string;
  mandatory: boolean;
  format: string[];
  maxSize: number; // in MB
  validityPeriod?: number; // in days
  validationRules: string[];
  description: string;
}

export interface ReportingRequirement {
  reportType: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  template: string;
  automated: boolean;
  deadline: number; // days after period end
}

export interface SchemeIntegrationSettings {
  ssgApiEndpoint?: string;
  wsgApiEndpoint?: string;
  authenticationMethod: string;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  cacheSettings: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
}

export interface ApprovalConfiguration {
  levels: ApprovalLevelConfiguration[];
  workflows: WorkflowConfiguration[];
  delegation: DelegationConfiguration;
  escalation: EscalationConfiguration;
  timeouts: TimeoutConfiguration;
  notifications: ApprovalNotificationConfiguration;
}

export interface WorkflowConfiguration {
  workflowId: string;
  name: string;
  description: string;
  triggerConditions: string[];
  steps: WorkflowStepConfiguration[];
  isDefault: boolean;
  priority: number;
}

export interface WorkflowStepConfiguration {
  stepId: string;
  name: string;
  type: 'automated' | 'manual';
  approvalLevel?: ApprovalLevel;
  conditions: string[];
  actions: string[];
  timeoutMinutes: number;
  escalationRules: string[];
}

export interface DelegationConfiguration {
  enabled: boolean;
  allowedLevels: ApprovalLevel[];
  maxDelegationChain: number;
  requiresApproval: boolean;
  temporaryDelegation: {
    enabled: boolean;
    maxDurationDays: number;
  };
  auditTrail: boolean;
}

export interface EscalationConfiguration {
  enabled: boolean;
  triggerConditions: EscalationTrigger[];
  escalationMatrix: EscalationRule[];
  notifications: boolean;
  automaticEscalation: boolean;
}

export interface EscalationTrigger {
  condition: 'timeout' | 'amount_threshold' | 'risk_score' | 'manual';
  threshold?: number;
  timeoutHours?: number;
}

export interface EscalationRule {
  fromLevel: ApprovalLevel;
  toLevel: ApprovalLevel;
  conditions: string[];
  autoEscalate: boolean;
  notificationTemplate: string;
}

export interface TimeoutConfiguration {
  defaultTimeoutHours: number;
  timeoutsByLevel: { [key in ApprovalLevel]?: number };
  reminderSchedule: number[]; // hours before timeout
  timeoutAction: 'escalate' | 'auto_approve' | 'auto_reject' | 'extend';
  extensionRules: {
    maxExtensions: number;
    extensionHours: number;
    requiresApproval: boolean;
  };
}

export interface ApprovalNotificationConfiguration {
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  templates: { [key: string]: NotificationTemplate };
  frequency: 'immediate' | 'batched' | 'scheduled';
  batchSchedule?: string; // cron expression
  personalizeMessages: boolean;
  includeAttachments: boolean;
}

export interface NotificationTemplate {
  subject: string;
  body: string;
  format: 'html' | 'text';
  variables: string[];
  attachments?: string[];
}

export interface ComplianceConfiguration {
  auditTrail: AuditConfiguration;
  dataRetention: DataRetentionConfiguration;
  encryption: EncryptionConfiguration;
  accessControl: AccessControlConfiguration;
  reporting: ComplianceReportingConfiguration;
  monitoring: MonitoringConfiguration;
}

export interface AuditConfiguration {
  enabled: boolean;
  level: 'basic' | 'detailed' | 'comprehensive';
  includePersonalData: boolean;
  retentionPeriodYears: number;
  realTimeAuditing: boolean;
  integrityChecks: boolean;
  tamperDetection: boolean;
}

export interface DataRetentionConfiguration {
  defaultRetentionYears: number;
  categorySpecificRetention: { [category: string]: number };
  autoArchiving: {
    enabled: boolean;
    archiveAfterDays: number;
    compressionEnabled: boolean;
  };
  dataPurging: {
    enabled: boolean;
    purgeAfterYears: number;
    approvalRequired: boolean;
  };
}

export interface EncryptionConfiguration {
  encryptionAtRest: {
    enabled: boolean;
    algorithm: string;
    keyRotationDays: number;
  };
  encryptionInTransit: {
    enabled: boolean;
    tlsVersion: string;
    certificateValidation: boolean;
  };
  fieldLevelEncryption: {
    enabled: boolean;
    encryptedFields: string[];
    keyManagement: 'internal' | 'external' | 'hsm';
  };
}

export interface AccessControlConfiguration {
  authentication: {
    method: 'password' | 'mfa' | 'sso' | 'certificate';
    passwordPolicy: PasswordPolicy;
    sessionTimeout: number;
    maxConcurrentSessions: number;
  };
  authorization: {
    model: 'rbac' | 'abac' | 'hybrid';
    roleHierarchy: boolean;
    dynamicPermissions: boolean;
    contextualAccess: boolean;
  };
  ipRestrictions: {
    enabled: boolean;
    allowedIPs: string[];
    deniedIPs: string[];
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventReuse: number;
  expirationDays: number;
  lockoutAttempts: number;
  lockoutDuration: number;
}

export interface ComplianceReportingConfiguration {
  automatedReports: AutomatedReport[];
  customReports: CustomReportTemplate[];
  distributionLists: { [reportType: string]: string[] };
  reportingCalendar: ReportingSchedule[];
  qualityAssurance: QualityAssuranceSettings;
}

export interface AutomatedReport {
  reportId: string;
  name: string;
  description: string;
  schedule: string; // cron expression
  recipients: string[];
  format: string[];
  template: string;
  parameters: { [key: string]: any };
}

export interface CustomReportTemplate {
  templateId: string;
  name: string;
  category: string;
  query: string;
  parameters: ReportParameter[];
  visualizations: string[];
  exportFormats: string[];
}

export interface ReportParameter {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  validation: string;
  description: string;
}

export interface ReportingSchedule {
  reportType: string;
  frequency: string;
  dueDate: string;
  reminder: number; // days before due
  authority: string;
}

export interface QualityAssuranceSettings {
  dataValidation: {
    enabled: boolean;
    rules: ConfigValidationRule[];
    failureThreshold: number;
  };
  reviewProcess: {
    enabled: boolean;
    reviewerRoles: string[];
    approvalRequired: boolean;
  };
  errorHandling: {
    retryAttempts: number;
    escalationOnFailure: boolean;
    notifyOnError: boolean;
  };
}

export interface ConfigValidationRule {
  field: string;
  rule: string;
  errorMessage: string;
  severity: 'warning' | 'error' | 'critical';
}

export interface MonitoringConfiguration {
  healthChecks: HealthCheckConfiguration;
  performance: PerformanceMonitoringConfiguration;
  alerting: AlertingConfiguration;
  logging: LoggingConfiguration;
}

export interface HealthCheckConfiguration {
  enabled: boolean;
  interval: number; // seconds
  endpoints: HealthCheckEndpoint[];
  failureThreshold: number;
  alertOnFailure: boolean;
}

export interface HealthCheckEndpoint {
  name: string;
  url: string;
  method: string;
  timeout: number;
  expectedStatus: number;
  headers?: { [key: string]: string };
}

export interface PerformanceMonitoringConfiguration {
  enabled: boolean;
  metrics: string[];
  thresholds: { [metric: string]: number };
  sampling: {
    enabled: boolean;
    sampleRate: number;
  };
  retention: {
    rawDataDays: number;
    aggregatedDataDays: number;
  };
}

export interface AlertingConfiguration {
  enabled: boolean;
  channels: AlertChannel[];
  rules: AlertRule[];
  escalation: AlertEscalationRule[];
  suppression: {
    enabled: boolean;
    windowMinutes: number;
    maxAlerts: number;
  };
}

export interface AlertChannel {
  type: 'email' | 'sms' | 'webhook' | 'slack' | 'teams';
  configuration: { [key: string]: any };
  enabled: boolean;
}

export interface AlertRule {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  cooldownMinutes: number;
}

export interface AlertEscalationRule {
  trigger: string;
  escalateAfterMinutes: number;
  escalateToChannels: string[];
}

export interface LoggingConfiguration {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  destinations: LogDestination[];
  sensitiveFields: string[];
  retention: {
    days: number;
    archiveAfterDays: number;
  };
  structuredLogging: {
    enabled: boolean;
    includeStackTrace: boolean;
    includeUserContext: boolean;
  };
}

export interface LogDestination {
  type: 'file' | 'database' | 'elasticsearch' | 'cloudwatch';
  configuration: { [key: string]: any };
  enabled: boolean;
}

export interface IntegrationConfiguration {
  apis: APIConfiguration[];
  webhooks: WebhookConfiguration;
  messageQueues: MessageQueueConfiguration;
  fileTransfer: FileTransferConfiguration;
  dataSync: DataSyncConfiguration;
}

export interface APIConfiguration {
  name: string;
  baseUrl: string;
  version: string;
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'oauth2' | 'apikey';
    credentials: { [key: string]: string };
    refreshToken?: string;
    expiresAt?: Date;
  };
  rateLimit: {
    requestsPerSecond: number;
    burstLimit: number;
    backoffStrategy: 'linear' | 'exponential';
  };
  circuit: {
    enabled: boolean;
    failureThreshold: number;
    timeoutSeconds: number;
    retryAttempts: number;
  };
  monitoring: {
    enabled: boolean;
    logRequests: boolean;
    logResponses: boolean;
    trackMetrics: boolean;
  };
}

export interface WebhookConfiguration {
  enabled: boolean;
  endpoints: WebhookEndpoint[];
  security: {
    verifySignatures: boolean;
    secretKey?: string;
    allowedIPs?: string[];
  };
  retry: {
    maxAttempts: number;
    backoffMs: number;
    timeoutMs: number;
  };
}

export interface WebhookEndpoint {
  name: string;
  url: string;
  events: string[];
  headers?: { [key: string]: string };
  enabled: boolean;
  description?: string;
}

export interface MessageQueueConfiguration {
  provider: 'rabbitmq' | 'apache-kafka' | 'aws-sqs' | 'azure-servicebus';
  connection: {
    host: string;
    port: number;
    credentials: { [key: string]: string };
    ssl: boolean;
  };
  queues: QueueConfiguration[];
  deadLetter: {
    enabled: boolean;
    maxRetries: number;
    ttlMs: number;
  };
}

export interface QueueConfiguration {
  name: string;
  durable: boolean;
  autoDelete: boolean;
  exclusive: boolean;
  consumers: number;
  prefetch: number;
  routing: string;
}

export interface FileTransferConfiguration {
  protocols: ('sftp' | 'ftp' | 'https' | 's3' | 'azure-blob')[];
  defaultProtocol: string;
  connections: FileTransferConnection[];
  security: {
    encryption: boolean;
    verification: boolean;
    virusScanning: boolean;
  };
  limits: {
    maxFileSizeMB: number;
    maxFilesPerTransfer: number;
    allowedExtensions: string[];
    deniedExtensions: string[];
  };
}

export interface FileTransferConnection {
  name: string;
  protocol: string;
  host: string;
  port?: number;
  credentials: { [key: string]: string };
  basePath: string;
  enabled: boolean;
}

export interface DataSyncConfiguration {
  enabled: boolean;
  schedule: string; // cron expression
  sources: DataSource[];
  targets: DataTarget[];
  transformations: DataTransformation[];
  errorHandling: {
    continueOnError: boolean;
    maxErrors: number;
    notifyOnError: boolean;
  };
  validation: {
    enabled: boolean;
    rules: string[];
    failOnValidationError: boolean;
  };
}

export interface DataSource {
  name: string;
  type: 'database' | 'api' | 'file' | 'queue';
  connection: { [key: string]: any };
  query?: string;
  incremental: boolean;
  enabled: boolean;
}

export interface DataTarget {
  name: string;
  type: 'database' | 'api' | 'file' | 'queue';
  connection: { [key: string]: any };
  mapping: { [key: string]: string };
  upsert: boolean;
  enabled: boolean;
}

export interface DataTransformation {
  name: string;
  type: 'script' | 'mapping' | 'validation' | 'enrichment';
  configuration: { [key: string]: any };
  enabled: boolean;
  order: number;
}

export interface NotificationConfiguration {
  providers: NotificationProvider[];
  templates: { [key: string]: NotificationTemplate };
  rules: NotificationRule[];
  preferences: NotificationPreferences;
  tracking: {
    enabled: boolean;
    trackOpens: boolean;
    trackClicks: boolean;
    retentionDays: number;
  };
}

export interface NotificationProvider {
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook';
  configuration: { [key: string]: any };
  enabled: boolean;
  fallbackProvider?: string;
  rateLimit: {
    requestsPerMinute: number;
    burstLimit: number;
  };
}

export interface NotificationRule {
  event: string;
  conditions: string[];
  recipients: string[];
  template: string;
  providers: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  enabled: boolean;
}

export interface NotificationPreferences {
  defaultProvider: string;
  allowUserOverride: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
    urgentOverride: boolean;
  };
  frequency: {
    immediate: string[];
    batched: string[];
    scheduled: string[];
  };
}

export interface SecurityConfiguration {
  encryption: EncryptionConfiguration;
  authentication: SecurityAuthConfiguration;
  authorization: SecurityAuthzConfiguration;
  firewall: FirewallConfiguration;
  scanning: SecurityScanningConfiguration;
  incidents: IncidentConfiguration;
}

export interface SecurityAuthConfiguration {
  providers: AuthProvider[];
  sessions: SessionConfiguration;
  tokens: TokenConfiguration;
  multiFactor: MFAConfiguration;
}

export interface AuthProvider {
  name: string;
  type: 'local' | 'ldap' | 'saml' | 'oauth2' | 'oidc';
  configuration: { [key: string]: any };
  enabled: boolean;
  priority: number;
}

export interface SessionConfiguration {
  timeoutMinutes: number;
  maxConcurrent: number;
  renewBeforeExpiry: boolean;
  trackActivity: boolean;
  ipBinding: boolean;
  userAgentBinding: boolean;
}

export interface TokenConfiguration {
  accessToken: {
    expiryMinutes: number;
    algorithm: string;
    issuer: string;
    audience: string;
  };
  refreshToken: {
    expiryDays: number;
    rotateOnUse: boolean;
    reuseLimit: number;
  };
  apiKeys: {
    enabled: boolean;
    expiryDays: number;
    rateLimiting: boolean;
  };
}

export interface MFAConfiguration {
  required: boolean;
  providers: MFAProvider[];
  backup: {
    codes: boolean;
    codeCount: number;
    singleUse: boolean;
  };
  remember: {
    enabled: boolean;
    durationDays: number;
    deviceTrust: boolean;
  };
}

export interface MFAProvider {
  name: string;
  type: 'totp' | 'sms' | 'email' | 'push' | 'hardware';
  configuration: { [key: string]: any };
  enabled: boolean;
  priority: number;
}

export interface SecurityAuthzConfiguration {
  model: 'rbac' | 'abac';
  roles: RoleDefinition[];
  permissions: PermissionDefinition[];
  policies: PolicyDefinition[];
  inheritance: {
    enabled: boolean;
    maxDepth: number;
  };
}

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
  inherits: string[];
  enabled: boolean;
}

export interface PermissionDefinition {
  name: string;
  resource: string;
  actions: string[];
  conditions?: string[];
  description: string;
}

export interface PolicyDefinition {
  name: string;
  effect: 'allow' | 'deny';
  resources: string[];
  actions: string[];
  conditions: string[];
  priority: number;
  enabled: boolean;
}

export interface FirewallConfiguration {
  enabled: boolean;
  defaultAction: 'allow' | 'deny';
  rules: FirewallRule[];
  rateLimiting: {
    enabled: boolean;
    globalLimit: number;
    perIPLimit: number;
    windowSeconds: number;
  };
  geo: {
    enabled: boolean;
    allowedCountries: string[];
    deniedCountries: string[];
  };
}

export interface FirewallRule {
  name: string;
  action: 'allow' | 'deny' | 'rate_limit';
  source: string;
  destination?: string;
  port?: number;
  protocol?: string;
  enabled: boolean;
  priority: number;
}

export interface SecurityScanningConfiguration {
  vulnerability: {
    enabled: boolean;
    schedule: string;
    severity: string[];
    autoRemediate: boolean;
  };
  malware: {
    enabled: boolean;
    realTime: boolean;
    quarantine: boolean;
    alertOnDetection: boolean;
  };
  compliance: {
    enabled: boolean;
    standards: string[];
    schedule: string;
    autoRemediate: boolean;
  };
}

export interface IncidentConfiguration {
  detection: {
    enabled: boolean;
    rules: IncidentRule[];
    correlation: boolean;
  };
  response: {
    automated: boolean;
    playbooks: string[];
    escalation: IncidentEscalation[];
  };
  tracking: {
    enabled: boolean;
    sla: IncidentSLA[];
    reporting: boolean;
  };
}

export interface IncidentRule {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions: string[];
  enabled: boolean;
}

export interface IncidentEscalation {
  severity: string;
  escalateAfterMinutes: number;
  escalateTo: string[];
}

export interface IncidentSLA {
  severity: string;
  acknowledgeMinutes: number;
  resolveHours: number;
}

export interface PerformanceConfiguration {
  caching: CachingConfiguration;
  database: DatabaseConfiguration;
  optimization: OptimizationConfiguration;
  monitoring: PerformanceMonitoringConfiguration;
  scaling: ScalingConfiguration;
}

export interface CachingConfiguration {
  providers: CacheProvider[];
  strategies: CacheStrategy[];
  eviction: {
    policy: 'lru' | 'lfu' | 'ttl' | 'random';
    maxSize: number;
    maxAge: number;
  };
  warming: {
    enabled: boolean;
    schedule: string;
    priority: string[];
  };
}

export interface CacheProvider {
  name: string;
  type: 'memory' | 'redis' | 'memcached' | 'database';
  configuration: { [key: string]: any };
  enabled: boolean;
  priority: number;
}

export interface CacheStrategy {
  pattern: string;
  provider: string;
  ttl: number;
  enabled: boolean;
}

export interface DatabaseConfiguration {
  connections: DatabaseConnection[];
  pooling: {
    enabled: boolean;
    minConnections: number;
    maxConnections: number;
    acquireTimeoutMs: number;
    idleTimeoutMs: number;
  };
  optimization: {
    queryCache: boolean;
    indexOptimization: boolean;
    statisticsUpdate: boolean;
  };
  backup: {
    enabled: boolean;
    schedule: string;
    retentionDays: number;
    encryption: boolean;
  };
}

export interface DatabaseConnection {
  name: string;
  type: string;
  host: string;
  port: number;
  database: string;
  credentials: { [key: string]: string };
  ssl: boolean;
  readOnly: boolean;
  enabled: boolean;
}

export interface OptimizationConfiguration {
  compression: {
    enabled: boolean;
    algorithm: string;
    threshold: number;
  };
  minification: {
    enabled: boolean;
    types: string[];
  };
  bundling: {
    enabled: boolean;
    strategy: string;
  };
  lazyLoading: {
    enabled: boolean;
    threshold: number;
  };
}

export interface ScalingConfiguration {
  horizontal: {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    targetCPU: number;
    targetMemory: number;
  };
  vertical: {
    enabled: boolean;
    cpuRequest: string;
    cpuLimit: string;
    memoryRequest: string;
    memoryLimit: string;
  };
  loadBalancing: {
    algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'ip_hash';
    healthCheck: {
      enabled: boolean;
      path: string;
      interval: number;
      timeout: number;
    };
  };
}

/**
 * Funding Configuration Management Service
 */
export class FundingConfigurationService extends EventEmitter {
  private cache: CacheService;
  private configuration: FundingConfiguration;
  private configVersion: string = '1.0.0';
  private lastUpdated: Date = new Date();
  private watchers: Map<string, (config: any) => void> = new Map();

  constructor(
    cache: CacheService,
    initialConfig?: Partial<FundingConfiguration>
  ) {
    super();
    this.cache = cache;
    this.configuration = this.buildDefaultConfiguration();

    if (initialConfig) {
      this.updateConfiguration(initialConfig);
    }

    this.loadConfiguration();
    this.startConfigurationWatcher();
  }

  // ============================================================================
  // CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Get complete configuration
   */
  getConfiguration(): FundingConfiguration {
    return { ...this.configuration };
  }

  /**
   * Get specific configuration section
   */
  getConfigSection<K extends keyof FundingConfiguration>(
    section: K
  ): FundingConfiguration[K] {
    return { ...this.configuration[section] };
  }

  /**
   * Update configuration
   */
  async updateConfiguration(
    updates: Partial<FundingConfiguration>
  ): Promise<void> {
    const previousConfig = { ...this.configuration };

    // Merge updates with existing configuration
    this.configuration = this.mergeConfiguration(this.configuration, updates);

    // Validate configuration
    const validation = await this.validateConfiguration(this.configuration);
    if (!validation.valid) {
      this.configuration = previousConfig;
      throw new Error(
        `Configuration validation failed: ${validation.errors.join(', ')}`
      );
    }

    // Update version and timestamp
    this.configVersion = this.generateVersion();
    this.lastUpdated = new Date();

    // Save configuration
    await this.saveConfiguration();

    // Notify watchers
    this.notifyConfigurationChange(updates);

    // Emit configuration update event
    this.emit('configurationUpdated', {
      version: this.configVersion,
      timestamp: this.lastUpdated,
      sections: Object.keys(updates),
      changes: this.detectChanges(previousConfig, this.configuration),
    });
  }

  /**
   * Reload configuration from cache/storage
   */
  async reloadConfiguration(): Promise<void> {
    await this.loadConfiguration();

    this.emit('configurationReloaded', {
      version: this.configVersion,
      timestamp: this.lastUpdated,
    });
  }

  // ============================================================================
  // SCHEME MANAGEMENT
  // ============================================================================

  /**
   * Get active funding schemes
   */
  getActiveFundingSchemes(): SchemeConfiguration[] {
    return this.configuration.schemes.filter(
      (scheme) =>
        scheme.isActive &&
        scheme.effectiveDate <= new Date() &&
        (!scheme.expiryDate || scheme.expiryDate > new Date())
    );
  }

  /**
   * Get funding scheme by ID
   */
  getFundingScheme(schemeId: string): SchemeConfiguration | undefined {
    return this.configuration.schemes.find(
      (scheme) => scheme.schemeId === schemeId
    );
  }

  /**
   * Add or update funding scheme
   */
  async updateFundingScheme(scheme: SchemeConfiguration): Promise<void> {
    const existingIndex = this.configuration.schemes.findIndex(
      (s) => s.schemeId === scheme.schemeId
    );

    if (existingIndex >= 0) {
      this.configuration.schemes[existingIndex] = scheme;
    } else {
      this.configuration.schemes.push(scheme);
    }

    await this.saveConfiguration();

    this.emit('fundingSchemeUpdated', {
      schemeId: scheme.schemeId,
      action: existingIndex >= 0 ? 'updated' : 'created',
      timestamp: new Date(),
    });
  }

  /**
   * Remove funding scheme
   */
  async removeFundingScheme(schemeId: string): Promise<void> {
    const scheme = this.getFundingScheme(schemeId);
    if (!scheme) {
      throw new Error(`Funding scheme not found: ${schemeId}`);
    }

    // Mark as inactive instead of removing to preserve audit trail
    scheme.isActive = false;
    scheme.expiryDate = new Date();

    await this.saveConfiguration();

    this.emit('fundingSchemeRemoved', {
      schemeId,
      timestamp: new Date(),
    });
  }

  // ============================================================================
  // APPROVAL CONFIGURATION
  // ============================================================================

  /**
   * Get approval workflow configuration
   */
  getApprovalWorkflow(workflowId: string): WorkflowConfiguration | undefined {
    return this.configuration.approval.workflows.find(
      (w) => w.workflowId === workflowId
    );
  }

  /**
   * Update approval levels
   */
  async updateApprovalLevels(
    levels: ApprovalLevelConfiguration[]
  ): Promise<void> {
    this.configuration.approval.levels = levels;
    await this.saveConfiguration();

    this.emit('approvalLevelsUpdated', {
      levels: levels.map((l) => l.approverRole),
      timestamp: new Date(),
    });
  }

  // ============================================================================
  // ENVIRONMENT MANAGEMENT
  // ============================================================================

  /**
   * Switch environment configuration
   */
  async switchEnvironment(
    environment: 'development' | 'staging' | 'production'
  ): Promise<void> {
    const previousEnv = this.configuration.general.environment;
    this.configuration.general.environment = environment;

    // Apply environment-specific configurations
    await this.applyEnvironmentConfiguration(environment);

    this.emit('environmentSwitched', {
      from: previousEnv,
      to: environment,
      timestamp: new Date(),
    });
  }

  /**
   * Enable/disable maintenance mode
   */
  async setMaintenanceMode(enabled: boolean, message?: string): Promise<void> {
    this.configuration.general.maintenanceMode = enabled;
    if (message) {
      this.configuration.general.maintenanceMessage = message;
    }

    await this.saveConfiguration();

    this.emit('maintenanceModeChanged', {
      enabled,
      message,
      timestamp: new Date(),
    });
  }

  // ============================================================================
  // CONFIGURATION WATCHING
  // ============================================================================

  /**
   * Watch for configuration changes in specific section
   */
  watchConfiguration<K extends keyof FundingConfiguration>(
    section: K,
    callback: (config: FundingConfiguration[K]) => void
  ): string {
    const watcherId = this.generateWatcherId();
    const watcher = (config: Partial<FundingConfiguration>) => {
      if (config[section]) {
        callback(config[section]!);
      }
    };

    this.watchers.set(watcherId, watcher);
    return watcherId;
  }

  /**
   * Remove configuration watcher
   */
  unwatchConfiguration(watcherId: string): void {
    this.watchers.delete(watcherId);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private buildDefaultConfiguration(): FundingConfiguration {
    return {
      general: {
        systemName: 'SSG-WSG Funding Management System',
        version: '1.0.0',
        environment: 'development',
        region: 'Singapore',
        timezone: 'Asia/Singapore',
        currency: 'SGD',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: '#,##0.00',
        maintenanceMode: false,
        supportContact: {
          email: 'support@funding.gov.sg',
          phone: '+65 6123 4567',
          hours: '9:00 AM - 5:00 PM (Mon-Fri)',
        },
        features: {
          enableAutoApproval: true,
          enableBulkProcessing: true,
          enableRealtimeUpdates: true,
          enableAdvancedReporting: true,
          enableAuditTrail: true,
          enableMobileAccess: true,
          enableApiAccess: true,
        },
      },
      schemes: [],
      approval: {
        levels: [],
        workflows: [],
        delegation: {
          enabled: true,
          allowedLevels: [ApprovalLevel.L1_REVIEWER, ApprovalLevel.L2_MANAGER],
          maxDelegationChain: 3,
          requiresApproval: true,
          temporaryDelegation: {
            enabled: true,
            maxDurationDays: 30,
          },
          auditTrail: true,
        },
        escalation: {
          enabled: true,
          triggerConditions: [
            { condition: 'timeout', timeoutHours: 24 },
            { condition: 'amount_threshold', threshold: 50000 },
          ],
          escalationMatrix: [],
          notifications: true,
          automaticEscalation: true,
        },
        timeouts: {
          defaultTimeoutHours: 24,
          timeoutsByLevel: {
            [ApprovalLevel.L1_REVIEWER]: 24,
            [ApprovalLevel.L2_MANAGER]: 48,
            [ApprovalLevel.SENIOR_MANAGER]: 72,
          },
          reminderSchedule: [4, 12, 20], // hours before timeout
          timeoutAction: 'escalate',
          extensionRules: {
            maxExtensions: 2,
            extensionHours: 24,
            requiresApproval: true,
          },
        },
        notifications: {
          channels: ['email', 'in_app'],
          templates: {},
          frequency: 'immediate',
          personalizeMessages: true,
          includeAttachments: false,
        },
      },
      compliance: {
        auditTrail: {
          enabled: true,
          level: 'comprehensive',
          includePersonalData: false,
          retentionPeriodYears: 7,
          realTimeAuditing: true,
          integrityChecks: true,
          tamperDetection: true,
        },
        dataRetention: {
          defaultRetentionYears: 7,
          categorySpecificRetention: {
            audit_logs: 10,
            financial_records: 7,
            personal_data: 5,
          },
          autoArchiving: {
            enabled: true,
            archiveAfterDays: 365,
            compressionEnabled: true,
          },
          dataPurging: {
            enabled: true,
            purgeAfterYears: 10,
            approvalRequired: true,
          },
        },
        encryption: {
          encryptionAtRest: {
            enabled: true,
            algorithm: 'AES-256-GCM',
            keyRotationDays: 90,
          },
          encryptionInTransit: {
            enabled: true,
            tlsVersion: '1.3',
            certificateValidation: true,
          },
          fieldLevelEncryption: {
            enabled: true,
            encryptedFields: ['nric', 'bankAccount', 'personalDetails'],
            keyManagement: 'external',
          },
        },
        accessControl: {
          authentication: {
            method: 'mfa',
            passwordPolicy: {
              minLength: 12,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSymbols: true,
              preventReuse: 5,
              expirationDays: 90,
              lockoutAttempts: 3,
              lockoutDuration: 30,
            },
            sessionTimeout: 60,
            maxConcurrentSessions: 3,
          },
          authorization: {
            model: 'rbac',
            roleHierarchy: true,
            dynamicPermissions: true,
            contextualAccess: true,
          },
          ipRestrictions: {
            enabled: true,
            allowedIPs: [],
            deniedIPs: [],
          },
        },
        reporting: {
          automatedReports: [],
          customReports: [],
          distributionLists: {},
          reportingCalendar: [],
          qualityAssurance: {
            dataValidation: {
              enabled: true,
              rules: [],
              failureThreshold: 0.05,
            },
            reviewProcess: {
              enabled: true,
              reviewerRoles: ['compliance_officer', 'senior_manager'],
              approvalRequired: true,
            },
            errorHandling: {
              retryAttempts: 3,
              escalationOnFailure: true,
              notifyOnError: true,
            },
          },
        },
        monitoring: {
          healthChecks: {
            enabled: true,
            interval: 60,
            endpoints: [],
            failureThreshold: 3,
            alertOnFailure: true,
          },
          performance: {
            enabled: true,
            metrics: ['response_time', 'error_rate', 'throughput'],
            thresholds: {
              response_time: 1000,
              error_rate: 0.01,
              throughput: 100,
            },
            sampling: {
              enabled: true,
              sampleRate: 0.1,
            },
            retention: {
              rawDataDays: 30,
              aggregatedDataDays: 365,
            },
          },
          alerting: {
            enabled: true,
            channels: [],
            rules: [],
            escalation: [],
            suppression: {
              enabled: true,
              windowMinutes: 15,
              maxAlerts: 5,
            },
          },
          logging: {
            level: 'info',
            format: 'json',
            destinations: [],
            sensitiveFields: ['password', 'token', 'nric'],
            retention: {
              days: 90,
              archiveAfterDays: 30,
            },
            structuredLogging: {
              enabled: true,
              includeStackTrace: true,
              includeUserContext: true,
            },
          },
        },
      },
      integration: {
        apis: [],
        webhooks: {
          enabled: true,
          endpoints: [],
          security: {
            verifySignatures: true,
            secretKey: 'webhook_secret_key',
            allowedIPs: [],
          },
          retry: {
            maxAttempts: 3,
            backoffMs: 1000,
            timeoutMs: 30000,
          },
        },
        messageQueues: {
          provider: 'rabbitmq',
          connection: {
            host: 'localhost',
            port: 5672,
            credentials: {},
            ssl: false,
          },
          queues: [],
          deadLetter: {
            enabled: true,
            maxRetries: 3,
            ttlMs: 86400000,
          },
        },
        fileTransfer: {
          protocols: ['sftp', 'https'],
          defaultProtocol: 'https',
          connections: [],
          security: {
            encryption: true,
            verification: true,
            virusScanning: true,
          },
          limits: {
            maxFileSizeMB: 100,
            maxFilesPerTransfer: 10,
            allowedExtensions: ['.pdf', '.docx', '.xlsx', '.png', '.jpg'],
            deniedExtensions: ['.exe', '.bat', '.sh', '.ps1'],
          },
        },
        dataSync: {
          enabled: false,
          schedule: '0 2 * * *',
          sources: [],
          targets: [],
          transformations: [],
          errorHandling: {
            continueOnError: false,
            maxErrors: 10,
            notifyOnError: true,
          },
          validation: {
            enabled: true,
            rules: [],
            failOnValidationError: true,
          },
        },
      },
      notifications: {
        providers: [],
        templates: {},
        rules: [],
        preferences: {
          defaultProvider: 'email',
          allowUserOverride: true,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00',
            timezone: 'Asia/Singapore',
            urgentOverride: true,
          },
          frequency: {
            immediate: ['urgent', 'critical'],
            batched: ['medium', 'low'],
            scheduled: ['reports'],
          },
        },
        tracking: {
          enabled: true,
          trackOpens: true,
          trackClicks: true,
          retentionDays: 90,
        },
      },
      security: {
        encryption: {
          encryptionAtRest: {
            enabled: true,
            algorithm: 'AES-256-GCM',
            keyRotationDays: 90,
          },
          encryptionInTransit: {
            enabled: true,
            tlsVersion: '1.3',
            certificateValidation: true,
          },
          fieldLevelEncryption: {
            enabled: true,
            encryptedFields: ['nric', 'bankAccount'],
            keyManagement: 'external',
          },
        },
        authentication: {
          providers: [],
          sessions: {
            timeoutMinutes: 60,
            maxConcurrent: 3,
            renewBeforeExpiry: true,
            trackActivity: true,
            ipBinding: false,
            userAgentBinding: false,
          },
          tokens: {
            accessToken: {
              expiryMinutes: 15,
              algorithm: 'RS256',
              issuer: 'funding-system',
              audience: 'funding-api',
            },
            refreshToken: {
              expiryDays: 30,
              rotateOnUse: true,
              reuseLimit: 0,
            },
            apiKeys: {
              enabled: true,
              expiryDays: 365,
              rateLimiting: true,
            },
          },
          multiFactor: {
            required: true,
            providers: [],
            backup: {
              codes: true,
              codeCount: 10,
              singleUse: true,
            },
            remember: {
              enabled: true,
              durationDays: 30,
              deviceTrust: true,
            },
          },
        },
        authorization: {
          model: 'rbac',
          roles: [],
          permissions: [],
          policies: [],
          inheritance: {
            enabled: true,
            maxDepth: 5,
          },
        },
        firewall: {
          enabled: true,
          defaultAction: 'deny',
          rules: [],
          rateLimiting: {
            enabled: true,
            globalLimit: 1000,
            perIPLimit: 100,
            windowSeconds: 60,
          },
          geo: {
            enabled: false,
            allowedCountries: ['SG'],
            deniedCountries: [],
          },
        },
        scanning: {
          vulnerability: {
            enabled: true,
            schedule: '0 2 * * 0',
            severity: ['medium', 'high', 'critical'],
            autoRemediate: false,
          },
          malware: {
            enabled: true,
            realTime: true,
            quarantine: true,
            alertOnDetection: true,
          },
          compliance: {
            enabled: true,
            standards: ['ISO27001', 'SOC2'],
            schedule: '0 3 * * 1',
            autoRemediate: false,
          },
        },
        incidents: {
          detection: {
            enabled: true,
            rules: [],
            correlation: true,
          },
          response: {
            automated: true,
            playbooks: [],
            escalation: [],
          },
          tracking: {
            enabled: true,
            sla: [],
            reporting: true,
          },
        },
      },
      performance: {
        caching: {
          providers: [],
          strategies: [],
          eviction: {
            policy: 'lru',
            maxSize: 1000,
            maxAge: 3600,
          },
          warming: {
            enabled: true,
            schedule: '0 1 * * *',
            priority: [],
          },
        },
        database: {
          connections: [],
          pooling: {
            enabled: true,
            minConnections: 5,
            maxConnections: 20,
            acquireTimeoutMs: 30000,
            idleTimeoutMs: 600000,
          },
          optimization: {
            queryCache: true,
            indexOptimization: true,
            statisticsUpdate: true,
          },
          backup: {
            enabled: true,
            schedule: '0 0 * * *',
            retentionDays: 30,
            encryption: true,
          },
        },
        optimization: {
          compression: {
            enabled: true,
            algorithm: 'gzip',
            threshold: 1024,
          },
          minification: {
            enabled: true,
            types: ['js', 'css', 'html'],
          },
          bundling: {
            enabled: true,
            strategy: 'code-splitting',
          },
          lazyLoading: {
            enabled: true,
            threshold: 100,
          },
        },
        monitoring: {
          enabled: true,
          metrics: ['cpu', 'memory', 'disk', 'network'],
          thresholds: {
            cpu: 80,
            memory: 85,
            disk: 90,
            network: 100,
          },
          sampling: {
            enabled: true,
            sampleRate: 1.0,
          },
          retention: {
            rawDataDays: 7,
            aggregatedDataDays: 90,
          },
        },
        scaling: {
          horizontal: {
            enabled: false,
            minInstances: 2,
            maxInstances: 10,
            targetCPU: 70,
            targetMemory: 80,
          },
          vertical: {
            enabled: false,
            cpuRequest: '1000m',
            cpuLimit: '2000m',
            memoryRequest: '1Gi',
            memoryLimit: '2Gi',
          },
          loadBalancing: {
            algorithm: 'round_robin',
            healthCheck: {
              enabled: true,
              path: '/health',
              interval: 30,
              timeout: 5,
            },
          },
        },
      },
    };
  }

  private mergeConfiguration(
    existing: FundingConfiguration,
    updates: Partial<FundingConfiguration>
  ): FundingConfiguration {
    // Deep merge configuration
    return this.deepMerge(existing, updates) as FundingConfiguration;
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key])
        ) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  private async validateConfiguration(config: FundingConfiguration): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Validate general configuration
    if (!config.general.systemName) {
      errors.push('System name is required');
    }

    if (
      !['development', 'staging', 'production'].includes(
        config.general.environment
      )
    ) {
      errors.push('Invalid environment');
    }

    // Validate schemes
    for (const scheme of config.schemes) {
      if (!scheme.schemeId || !scheme.schemeName) {
        errors.push(`Invalid scheme: ${scheme.schemeId}`);
      }
    }

    // Validate approval configuration
    if (config.approval.levels.length === 0) {
      errors.push('At least one approval level is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private async loadConfiguration(): Promise<void> {
    try {
      const cachedConfig = await this.cache.get<FundingConfiguration>(
        'funding_configuration'
      );
      if (cachedConfig) {
        this.configuration = cachedConfig;
      }
    } catch (error) {
      console.warn('Failed to load configuration from cache:', error);
    }
  }

  private async saveConfiguration(): Promise<void> {
    try {
      await this.cache.set('funding_configuration', this.configuration, {
        ttl: 0,
      }); // No expiration
    } catch (error) {
      console.error('Failed to save configuration to cache:', error);
    }
  }

  private notifyConfigurationChange(
    updates: Partial<FundingConfiguration>
  ): void {
    for (const [, watcher] of this.watchers) {
      try {
        watcher(updates);
      } catch (error) {
        console.error('Configuration watcher error:', error);
      }
    }
  }

  private detectChanges(
    previous: FundingConfiguration,
    current: FundingConfiguration
  ): string[] {
    const changes: string[] = [];

    // Simple change detection - in production use a more sophisticated approach
    if (JSON.stringify(previous.general) !== JSON.stringify(current.general)) {
      changes.push('general');
    }

    if (JSON.stringify(previous.schemes) !== JSON.stringify(current.schemes)) {
      changes.push('schemes');
    }

    if (
      JSON.stringify(previous.approval) !== JSON.stringify(current.approval)
    ) {
      changes.push('approval');
    }

    return changes;
  }

  private async applyEnvironmentConfiguration(
    environment: string
  ): Promise<void> {
    // Apply environment-specific settings
    switch (environment) {
      case 'development':
        this.configuration.general.features.enableAdvancedReporting = false;
        this.configuration.security.firewall.enabled = false;
        this.configuration.compliance.auditTrail.level = 'basic';
        break;

      case 'staging':
        this.configuration.general.features.enableAdvancedReporting = true;
        this.configuration.security.firewall.enabled = true;
        this.configuration.compliance.auditTrail.level = 'detailed';
        break;

      case 'production':
        this.configuration.general.features.enableAdvancedReporting = true;
        this.configuration.security.firewall.enabled = true;
        this.configuration.compliance.auditTrail.level = 'comprehensive';
        break;
    }

    await this.saveConfiguration();
  }

  private startConfigurationWatcher(): void {
    // Watch for configuration changes every 5 minutes
    setInterval(
      async () => {
        try {
          const currentVersion = await this.cache.get<string>(
            'funding_configuration_version'
          );
          if (currentVersion && currentVersion !== this.configVersion) {
            await this.reloadConfiguration();
          }
        } catch (error) {
          console.error('Configuration watcher error:', error);
        }
      },
      5 * 60 * 1000
    );
  }

  private generateVersion(): string {
    return `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWatcherId(): string {
    return `watcher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default FundingConfigurationService;
