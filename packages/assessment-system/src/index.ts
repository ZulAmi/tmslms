// Main exports for the assessment system package
export * from './types';

// Core Services
export { QuestionBankService } from './services/QuestionBankService';
export { CATEngine } from './services/CATEngine';
export { MLGradingService } from './services/MLGradingService';
export { AssessmentService } from './services/AssessmentService';

// Import for internal use
import { QuestionBankService } from './services/QuestionBankService';
import { CATEngine } from './services/CATEngine';
import { MLGradingService } from './services/MLGradingService';
import { AssessmentService } from './services/AssessmentService';

// Security Services (placeholders for now)
export class SecurityService {
  async startMonitoring(sessionId: string, config: any): Promise<void> {
    console.log('Security monitoring started for session:', sessionId);
  }

  async stopMonitoring(sessionId: string): Promise<void> {
    console.log('Security monitoring stopped for session:', sessionId);
  }
}

export class ProctoringService {
  async startSession(sessionId: string, config: any): Promise<void> {
    console.log('Proctoring session started:', sessionId);
  }

  async stopSession(sessionId: string): Promise<void> {
    console.log('Proctoring session stopped:', sessionId);
  }
}

export class AnalyticsService {
  async generateReport(assessmentId: string): Promise<any> {
    console.log('Generating analytics report for:', assessmentId);
    return {};
  }
}

// Utility functions
export const AssessmentUtils = {
  generateUUID: (): string => {
    return require('crypto').randomUUID();
  },

  calculateReadabilityScore: (text: string): number => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;

    // Simplified Flesch Reading Ease
    return Math.max(0, Math.min(100, 206.835 - 1.015 * avgWordsPerSentence));
  },

  validateAssessmentData: (data: any): boolean => {
    return !!(data.title && data.questions && data.questions.length > 0);
  },

  formatScore: (score: number, maxScore: number): string => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    return `${score}/${maxScore} (${percentage.toFixed(1)}%)`;
  },

  estimateCompletionTime: (questions: any[]): number => {
    // Estimate based on question types and complexity
    return questions.length * 2; // 2 minutes per question on average
  },
};

// Configuration factory
export const createAssessmentSystem = (options?: {
  enableCAT?: boolean;
  enableMLGrading?: boolean;
  enableProctoring?: boolean;
  enableSecurity?: boolean;
}) => {
  const questionBankService = new QuestionBankService();
  const catEngine = options?.enableCAT ? new CATEngine() : undefined;
  const gradingService = options?.enableMLGrading
    ? new MLGradingService()
    : undefined;
  const securityService = options?.enableSecurity
    ? new SecurityService()
    : undefined;
  const proctoringService = options?.enableProctoring
    ? new ProctoringService()
    : undefined;
  const analyticsService = new AnalyticsService();

  const assessmentService = new AssessmentService({
    questionBankService,
    catEngine,
    gradingService,
    securityService,
    proctoringService,
    analyticsService,
  });

  return {
    questionBankService,
    catEngine,
    gradingService,
    securityService,
    proctoringService,
    analyticsService,
    assessmentService,
  };
};

// Default export
export default {
  QuestionBankService,
  CATEngine,
  MLGradingService,
  AssessmentService,
  SecurityService,
  ProctoringService,
  AnalyticsService,
  AssessmentUtils,
  createAssessmentSystem,
};
