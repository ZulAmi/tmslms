/**
 * AI Services Index
 * Main entry point for all AI-powered content generation services
 */

// Core AI Services
export {
  AIContentGenerationService,
  createAIContentGenerationService,
} from './AIContentGenerationService';
export {
  AIContentIntegrationService,
  createAIContentIntegrationService,
} from './AIContentIntegrationService';
export {
  AIContentWorkflowOrchestrator,
  createAIContentWorkflowOrchestrator,
} from './AIContentWorkflowOrchestrator';
export {
  AIAnalyticsDashboardService,
  createAIAnalyticsDashboardService,
} from './AIAnalyticsDashboardService';
export {
  PredictiveAnalyticsService,
  createPredictiveAnalyticsService,
} from './PredictiveAnalyticsService';
export {
  PredictiveAnalyticsIntegrationService,
  createPredictiveAnalyticsIntegrationService,
} from './PredictiveAnalyticsIntegrationService';

// Factory and Configuration
import { setupAIServices } from './AIServicesFactory';
export {
  default as AIServicesFactory,
  setupAIServices,
  setupCourseAuthoringAI,
  setupAssessmentAI,
  setupPersonalizationAI,
  defaultAIConfig as defaultConfig,
} from './AIServicesFactory';

// Types and Interfaces
export type {
  // Content Generation Types
  AIContentRequest,
  CourseOutlineResponse,
  PersonalizationProfile,
  PersonalizedContent,
  TranslationRequest,
  TranslationResponse,
} from './AIContentGenerationService';

export type {
  // Integration Types
  CourseAuthoringIntegration,
  UserLearningProfile,
  AIContentCostTracking,
  AIVideoContentGeneration,
  AISchedulingOptimization,
} from './AIContentIntegrationService';

export type {
  // Workflow Types
  WorkflowDefinition,
  WorkflowExecution,
  QualityGate,
  QualityCheckResult,
} from './AIContentWorkflowOrchestrator';

export type {
  // Analytics Types
  DashboardMetrics,
  RealTimeMetrics,
  MonitoringConfig,
} from './AIAnalyticsDashboardService';

export type {
  // Predictive Analytics Types
  LearnerData,
  RiskPrediction,
  PerformanceForecast,
  InterventionRecommendation,
  PredictiveModel,
  AnalyticsDashboardData,
} from './PredictiveAnalyticsService';

export type {
  // Integration Types
  IntegratedLearnerProfile,
  PredictiveCourseRecommendation,
  IntelligentSchedulingRecommendation,
  ComprehensiveAssessmentInsights,
  SmartNotificationSystem,
  InstitutionalDashboardData,
} from './PredictiveAnalyticsIntegrationService';

export type {
  // Configuration Types
  AIServicesConfig,
  AIServicesCollection,
} from './AIServicesFactory';

// Quick Setup Functions
export async function initializeAIForTMSLMS(
  environment: 'development' | 'production' | 'testing' = 'development'
) {
  console.log('🚀 Initializing AI services for TMSLMS...');

  try {
    const services = await setupAIServices(environment);

    console.log('✅ AI services initialized successfully');
    console.log('📊 Available services:');
    console.log('  - Content Generation Service');
    console.log('  - Integration Service');
    console.log('  - Workflow Orchestrator');
    console.log('  - Analytics Dashboard');

    return services;
  } catch (error) {
    console.error('❌ Failed to initialize AI services:', error);
    throw error;
  }
}

console.log('🎯 AI Integration Services ready for TMSLMS!');
