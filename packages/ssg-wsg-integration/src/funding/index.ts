/**
 * SSG-WSG Funding System - Main Export File
 * Provides access to all funding-related services and components
 */

// Core Services
import FundingManagementSystem from './FundingManagementSystem';
export { FundingManagementSystem };
export { default as FundingClaimsService } from './FundingClaimsService';
export { default as FundingDashboardService } from './FundingDashboardService';
export { default as SSGWSGApiIntegrationService } from './SSGWSGApiIntegrationService';
export { default as FundingWorkflowService } from './FundingWorkflowService';
export { default as FundingConfigurationService } from './FundingConfigurationService';

// Types and Interfaces
export * from './types';

// Service Configurations
export type {
  FundingOperationResult,
  BulkOperationResult,
  FundingSystemMetrics,
} from './FundingManagementSystem';

export type {
  APIConfiguration,
  APIResponse,
  RealTimeNotification,
} from './SSGWSGApiIntegrationService';

export type {
  WorkflowConfiguration,
  EscalationRule,
  NotificationSettings,
  WorkflowMetrics,
} from './FundingWorkflowService';

// Note: These types are defined in the service files and exported through main types.ts

export type {
  SchemeConfiguration,
  SchemeSubsidyRate,
  SchemeComplianceRule,
  DocumentRequirement,
  ReportingRequirement,
  ApprovalConfiguration,
  ComplianceConfiguration,
  IntegrationConfiguration,
  NotificationConfiguration,
  SecurityConfiguration,
  PerformanceConfiguration,
} from './FundingConfigurationService';

// Utility Functions and Helpers
export const FundingSystemVersion = '1.0.0';

export interface FundingSystemInfo {
  version: string;
  services: string[];
  features: string[];
  supportedSchemes: string[];
  integrationsAvailable: string[];
}

export const getFundingSystemInfo = (): FundingSystemInfo => {
  return {
    version: FundingSystemVersion,
    services: [
      'Claims Management',
      'Eligibility Verification',
      'Subsidy Calculation',
      'Workflow Management',
      'Real-time Dashboard',
      'API Integration',
      'Configuration Management',
      'Compliance Reporting',
      'Audit Trail',
      'Financial Reconciliation',
    ],
    features: [
      'Real-time Eligibility Checking',
      'Automated Claims Processing',
      'Multi-level Approval Workflows',
      'Dynamic Subsidy Calculation',
      'Batch Processing',
      'Real-time Notifications',
      'Advanced Analytics',
      'Predictive Forecasting',
      'Compliance Monitoring',
      'Government API Integration',
      'Automated Reconciliation',
      'Executive Reporting',
      'Audit Trail Management',
      'Role-based Access Control',
      'Configuration Management',
    ],
    supportedSchemes: [
      'SkillsFuture Singapore (SSG)',
      'Workforce Singapore (WSG)',
      'TechSkills Accelerator (TeSA)',
      'Professional Conversion Programme (PCP)',
      'SkillsFuture Mid-Career Enhanced',
      'SkillsFuture Work-Study Programme',
      'Enhanced Training Support for SMEs',
      'Industry Transformation Programme',
      'Critical Core Skills Training Grant',
      'SkillsFuture Leadership Development Initiative',
    ],
    integrationsAvailable: [
      'SSG Training Partners Gateway',
      'WSG Employer Portal',
      'SkillsFuture Credit System',
      'Singapore Workforce Skills Qualification',
      'Continuing Education and Training Portal',
      'Corporate Learning Management Systems',
      'Human Resource Information Systems',
      'Financial Management Systems',
      'Document Management Systems',
      'Notification Services (Email/SMS)',
      'Real-time Analytics Platforms',
      'Government Reporting Portals',
    ],
  };
};

// System Status and Health Check
export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: Array<{
    name: string;
    status: 'up' | 'down' | 'degraded';
    responseTime: number;
    uptime: number;
  }>;
  performance: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  alerts: Array<{
    type: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

// Quick Start Configuration
export interface QuickStartConfig {
  environment: 'development' | 'staging' | 'production';
  enabledServices: string[];
  initialSchemes: string[];
  defaultSettings: {
    autoApprovalThreshold: number;
    maxProcessingTime: number;
    enableRealtimeUpdates: boolean;
    enableAuditTrail: boolean;
  };
}

export const getDefaultQuickStartConfig = (): QuickStartConfig => {
  return {
    environment: 'development',
    enabledServices: [
      'claims',
      'eligibility',
      'subsidy',
      'workflow',
      'dashboard',
      'configuration',
    ],
    initialSchemes: [
      'SSG_SKILLSFUTURE_INDIVIDUAL',
      'WSG_CAREER_GUIDANCE',
      'TESA_COMPANY_LED',
    ],
    defaultSettings: {
      autoApprovalThreshold: 5000,
      maxProcessingTime: 72,
      enableRealtimeUpdates: true,
      enableAuditTrail: true,
    },
  };
};

// Error Handling
export class FundingSystemError extends Error {
  public code: string;
  public context?: any;
  public timestamp: Date;

  constructor(
    message: string,
    code: string = 'FUNDING_SYSTEM_ERROR',
    context?: any
  ) {
    super(message);
    this.name = 'FundingSystemError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }
}

export class FundingValidationError extends FundingSystemError {
  constructor(message: string, context?: any) {
    super(message, 'FUNDING_VALIDATION_ERROR', context);
    this.name = 'FundingValidationError';
  }
}

export class FundingIntegrationError extends FundingSystemError {
  constructor(message: string, context?: any) {
    super(message, 'FUNDING_INTEGRATION_ERROR', context);
    this.name = 'FundingIntegrationError';
  }
}

export class FundingWorkflowError extends FundingSystemError {
  constructor(message: string, context?: any) {
    super(message, 'FUNDING_WORKFLOW_ERROR', context);
    this.name = 'FundingWorkflowError';
  }
}

// Constants
export const FUNDING_CONSTANTS = {
  // System Limits
  MAX_BATCH_SIZE: 1000,
  MAX_FILE_SIZE_MB: 100,
  MAX_CONCURRENT_OPERATIONS: 50,

  // Timeout Values (in milliseconds)
  DEFAULT_API_TIMEOUT: 30000,
  WORKFLOW_STEP_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  CACHE_DEFAULT_TTL: 60 * 60, // 1 hour

  // Currency and Formatting
  DEFAULT_CURRENCY: 'SGD',
  DEFAULT_DATE_FORMAT: 'DD/MM/YYYY',
  DEFAULT_NUMBER_FORMAT: '#,##0.00',

  // Status Codes
  OPERATION_SUCCESS: 'SUCCESS',
  OPERATION_PENDING: 'PENDING',
  OPERATION_FAILED: 'FAILED',

  // Priority Levels
  PRIORITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app',
    WEBHOOK: 'webhook',
  },

  // Compliance Standards
  COMPLIANCE_STANDARDS: {
    ISO27001: 'ISO 27001',
    SOC2: 'SOC 2 Type II',
    GDPR: 'GDPR',
    PDPA: 'Personal Data Protection Act (Singapore)',
  },
} as const;

// Utility Functions
export const formatCurrency = (
  amount: number,
  currency: string = 'SGD'
): string => {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (
  date: Date,
  format: string = 'DD/MM/YYYY'
): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year.toString());
};

export const generateOperationId = (): string => {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateProcessingTime = (startTime: number): number => {
  return Date.now() - startTime;
};

export const isValidNRIC = (nric: string): boolean => {
  const nricRegex = /^[STFG]\d{7}[A-Z]$/;
  return nricRegex.test(nric);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidSingaporePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+65)?[689]\d{7}$/;
  return phoneRegex.test(phone);
};

// Performance Monitoring
export interface PerformanceMetrics {
  operationId: string;
  operationType: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  errorCode?: string;
  memoryUsage?: number;
  cpuUsage?: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics: number = 10000;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(filter?: {
    operationType?: string;
    timeRange?: { start: Date; end: Date };
    successOnly?: boolean;
  }): PerformanceMetrics[] {
    let filtered = this.metrics;

    if (filter) {
      if (filter.operationType) {
        filtered = filtered.filter(
          (m) => m.operationType === filter.operationType
        );
      }

      if (filter.timeRange) {
        filtered = filtered.filter(
          (m) =>
            m.startTime >= filter.timeRange!.start.getTime() &&
            m.endTime <= filter.timeRange!.end.getTime()
        );
      }

      if (filter.successOnly) {
        filtered = filtered.filter((m) => m.success);
      }
    }

    return filtered;
  }

  getAveragePerformance(operationType?: string): {
    avgDuration: number;
    successRate: number;
    totalOperations: number;
  } {
    const metrics = operationType
      ? this.metrics.filter((m) => m.operationType === operationType)
      : this.metrics;

    if (metrics.length === 0) {
      return { avgDuration: 0, successRate: 0, totalOperations: 0 };
    }

    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const successfulOperations = metrics.filter((m) => m.success).length;

    return {
      avgDuration: totalDuration / metrics.length,
      successRate: successfulOperations / metrics.length,
      totalOperations: metrics.length,
    };
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// Main entry point for the funding system
export { FundingManagementSystem as default };
