/**
 * Predictive Analytics & Early Warning System Examples
 * Comprehensive examples demonstrating the full capabilities of the predictive analytics system
 */

import {
  PredictiveAnalyticsService,
  PredictiveAnalyticsIntegrationService,
  createPredictiveAnalyticsService,
  createPredictiveAnalyticsIntegrationService,
} from './index';
import { CacheService } from '../cache/CacheService';
import { SSGWSGApiClient } from '../client/ApiClient';
import Redis from 'ioredis';
import { createAIContentGenerationService } from './AIContentGenerationService';

// ============================================================================
// EXAMPLE 1: COMPLETE RISK PREDICTION AND INTERVENTION WORKFLOW
// ============================================================================

class ComprehensiveRiskManagementExample {
  private predictiveService: PredictiveAnalyticsService;
  private integrationService: PredictiveAnalyticsIntegrationService;

  constructor(
    cache: CacheService,
    apiClient: SSGWSGApiClient,
    openaiApiKey: string
  ) {
    // Initialize services
    this.predictiveService = createPredictiveAnalyticsService({
      cache,
      apiClient,
      enableRealTimeProcessing: true,
      autoIntervention: true,
      featureEngineering: true,
    });

    const contentService = createAIContentGenerationService({
      openaiApiKey,
      cache,
      apiClient,
    });

    this.integrationService = createPredictiveAnalyticsIntegrationService({
      predictiveService: this.predictiveService,
      contentService,
      cache,
      apiClient,
      interventionAutomationLevel: 'semi-automatic',
      personalizedContentGeneration: true,
    });
  }

  /**
   * Example: Complete learner risk assessment and intervention workflow
   */
  async demonstrateCompleteRiskWorkflow(learnerId: string): Promise<void> {
    console.log('🚀 Starting comprehensive risk management workflow...');

    try {
      // Step 1: Get integrated learner profile with predictive insights
      console.log('\n📊 Step 1: Building integrated learner profile...');
      const profile =
        await this.integrationService.getIntegratedLearnerProfile(learnerId);

      console.log(`✅ Profile created for: ${profile.personalInfo.name}`);
      console.log(
        `📈 Risk Level: ${profile.predictiveInsights.riskPrediction?.riskLevel || 'Unknown'}`
      );
      console.log(
        `🎯 Active Interventions: ${profile.predictiveInsights.recommendedInterventions.length}`
      );

      // Step 2: Generate course recommendations if needed
      if (
        profile.predictiveInsights.riskPrediction?.riskLevel === 'high' ||
        profile.predictiveInsights.riskPrediction?.riskLevel === 'critical'
      ) {
        console.log(
          '\n🎓 Step 2: Generating alternative course recommendations...'
        );
        const recommendations =
          await this.integrationService.generateIntelligentCourseRecommendations(
            learnerId,
            {
              timeAvailable: 10, // 10 hours per week
              budget: 2000,
              preferredTopics: ['data_analysis', 'business'],
              careerGoals: ['career_advancement'],
            }
          );

        console.log(
          `✅ Generated ${recommendations.length} course recommendations`
        );
        recommendations.slice(0, 3).forEach((rec, index) => {
          console.log(
            `   ${index + 1}. ${rec.courseTitle} (Relevance: ${rec.relevanceScore.toFixed(2)})`
          );
          console.log(
            `      Success Probability: ${(rec.successProbability * 100).toFixed(1)}%`
          );
        });
      }

      // Step 3: Create personalized learning schedule
      console.log('\n📅 Step 3: Creating personalized learning schedule...');
      const currentCourse = profile.currentStatus.currentCourse || 'course_001';
      const schedule =
        await this.integrationService.generateIntelligentSchedule(
          learnerId,
          currentCourse,
          {
            availableHours: 15,
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          }
        );

      console.log(`✅ Optimal schedule created:`);
      console.log(
        `   Sessions per week: ${schedule.recommendedSchedule.sessionsPerWeek}`
      );
      console.log(
        `   Session duration: ${schedule.recommendedSchedule.sessionDuration} minutes`
      );
      console.log(
        `   Intensity level: ${schedule.recommendedSchedule.intensityLevel}`
      );

      // Step 4: Generate assessment insights
      console.log('\n📊 Step 4: Analyzing assessment performance...');
      const assessmentInsights =
        await this.integrationService.generateAssessmentInsights(
          learnerId,
          currentCourse
        );

      console.log(`✅ Assessment insights generated:`);
      console.log(
        `   Performance trend: ${assessmentInsights.overallPerformance.trend}`
      );
      console.log(
        `   Predicted final grade: ${assessmentInsights.overallPerformance.predictedFinalGrade}`
      );
      console.log(
        `   Skill gaps identified: ${assessmentInsights.skillGaps.identifiedGaps.length}`
      );

      // Step 5: Set up smart notifications
      console.log('\n🔔 Step 5: Setting up smart notification system...');
      const notificationSystem =
        await this.integrationService.generateSmartNotifications(learnerId);

      console.log(`✅ Smart notifications configured:`);
      console.log(
        `   Total notifications: ${notificationSystem.notifications.length}`
      );
      console.log(
        `   Urgent notifications: ${notificationSystem.notifications.filter((n) => n.priority === 'urgent').length}`
      );

      // Step 6: Demonstrate real-time processing
      console.log('\n⚡ Step 6: Simulating real-time event processing...');
      await this.demonstrateRealTimeProcessing(learnerId);

      console.log(
        '\n🎉 Complete risk management workflow demonstrated successfully!'
      );
    } catch (error) {
      console.error('❌ Risk management workflow failed:', error);
      throw error;
    }
  }

  private async demonstrateRealTimeProcessing(
    learnerId: string
  ): Promise<void> {
    // Simulate various real-time events
    const events = [
      {
        learnerId,
        eventType: 'login',
        timestamp: new Date(),
        data: { device: 'mobile', duration: 45 },
      },
      {
        learnerId,
        eventType: 'assessment_submit',
        timestamp: new Date(),
        data: { assessmentId: 'quiz_001', score: 65, timeSpent: 25 },
      },
      {
        learnerId,
        eventType: 'help_request',
        timestamp: new Date(),
        data: { topic: 'advanced_concepts', urgency: 'high' },
      },
    ];

    for (const event of events) {
      console.log(`   Processing event: ${event.eventType}`);
      await this.integrationService.processRealTimeLearnerEvent(event);

      // Small delay to simulate real-time processing
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('✅ Real-time events processed successfully');
  }
}

// ============================================================================
// EXAMPLE 2: INSTITUTIONAL DASHBOARD AND ANALYTICS
// ============================================================================

class InstitutionalAnalyticsExample {
  private integrationService: PredictiveAnalyticsIntegrationService;

  constructor(integrationService: PredictiveAnalyticsIntegrationService) {
    this.integrationService = integrationService;
  }

  /**
   * Example: Generate comprehensive institutional dashboard
   */
  async demonstrateInstitutionalDashboard(): Promise<void> {
    console.log('🏢 Demonstrating institutional dashboard generation...');

    try {
      // Generate dashboard for different time ranges
      const timeRanges: ('week' | 'month' | 'quarter')[] = [
        'week',
        'month',
        'quarter',
      ];

      for (const timeRange of timeRanges) {
        console.log(`\n📊 Generating ${timeRange}ly dashboard...`);

        const dashboard =
          await this.integrationService.generateInstitutionalDashboard(
            'institution_001',
            timeRange
          );

        console.log(`✅ ${timeRange}ly Dashboard Generated:`);
        console.log(`   Total Learners: ${dashboard.overview.totalLearners}`);
        console.log(
          `   At-Risk Learners: ${dashboard.overview.atRiskLearners} (${((dashboard.overview.atRiskLearners / dashboard.overview.totalLearners) * 100).toFixed(1)}%)`
        );
        console.log(
          `   Average Completion Rate: ${(dashboard.overview.completionRates['Technology Program'] * 100).toFixed(1)}%`
        );

        console.log(`\n   Predictive Metrics:`);
        console.log(
          `   - Next week dropouts: ${dashboard.predictiveMetrics.dropoutPredictions.nextWeek}`
        );
        console.log(
          `   - Instructor needs: ${dashboard.predictiveMetrics.resourceForecasts.instructorNeeds}`
        );
        console.log(
          `   - High-impact interventions available: ${dashboard.predictiveMetrics.interventionOpportunities.highImpact}`
        );

        console.log(`\n   Financial Insights:`);
        console.log(
          `   - Revenue forecast: $${dashboard.financialInsights.revenueForecasts.nextQuarter.toLocaleString()}`
        );
        console.log(
          `   - Cost efficiency: ${(dashboard.financialInsights.costEfficiency * 100).toFixed(1)}%`
        );
      }

      console.log('\n🎉 Institutional dashboard demonstration completed!');
    } catch (error) {
      console.error('❌ Institutional dashboard generation failed:', error);
      throw error;
    }
  }

  /**
   * Example: Batch processing for risk assessments
   */
  async demonstrateBatchRiskProcessing(): Promise<void> {
    console.log('\n🔄 Demonstrating batch risk assessment processing...');

    try {
      // Generate sample learner IDs
      const learnerIds = Array.from(
        { length: 25 },
        (_, i) => `learner_${String(i + 1).padStart(3, '0')}`
      );

      console.log(
        `📝 Processing risk assessments for ${learnerIds.length} learners...`
      );

      const startTime = Date.now();
      const results =
        await this.integrationService[
          'predictiveService'
        ].batchProcessRiskAssessments(learnerIds);
      const endTime = Date.now();

      console.log(`✅ Batch processing completed in ${endTime - startTime}ms`);
      console.log(`   Successful assessments: ${results.length}`);
      console.log(
        `   Failed assessments: ${learnerIds.length - results.length}`
      );

      // Analyze risk distribution
      const riskDistribution = results.reduce(
        (dist, result) => {
          dist[result.riskLevel] = (dist[result.riskLevel] || 0) + 1;
          return dist;
        },
        {} as Record<string, number>
      );

      console.log('\n📊 Risk Distribution:');
      Object.entries(riskDistribution).forEach(([level, count]) => {
        console.log(
          `   ${level}: ${count} (${((count / results.length) * 100).toFixed(1)}%)`
        );
      });
    } catch (error) {
      console.error('❌ Batch risk processing failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXAMPLE 3: ADVANCED PERSONALIZATION AND CONTENT ADAPTATION
// ============================================================================

class PersonalizationExample {
  private integrationService: PredictiveAnalyticsIntegrationService;

  constructor(integrationService: PredictiveAnalyticsIntegrationService) {
    this.integrationService = integrationService;
  }

  /**
   * Example: Advanced personalization based on predictive insights
   */
  async demonstrateAdvancedPersonalization(learnerId: string): Promise<void> {
    console.log('🎯 Demonstrating advanced personalization capabilities...');

    try {
      // Get learner profile
      const profile =
        await this.integrationService.getIntegratedLearnerProfile(learnerId);

      console.log(
        `\n👤 Personalizing experience for: ${profile.personalInfo.name}`
      );
      console.log(
        `   Learning style: ${profile.behaviorProfile.learningStyle}`
      );
      console.log(
        `   Risk level: ${profile.predictiveInsights.riskPrediction?.riskLevel || 'Unknown'}`
      );

      // Generate personalized course recommendations
      console.log('\n🎓 Generating personalized course recommendations...');
      const recommendations =
        await this.integrationService.generateIntelligentCourseRecommendations(
          learnerId,
          {
            timeAvailable:
              profile.behaviorProfile.preferredSchedule.timeOfDay === 'evening'
                ? 8
                : 12,
            budget: profile.financialProfile.budgetConstraints,
            preferredTopics: profile.behaviorProfile.contentPreferences,
            careerGoals: [profile.personalInfo.demographics.industry],
          }
        );

      console.log(
        `✅ Generated ${recommendations.length} personalized recommendations:`
      );
      recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`\n   ${index + 1}. ${rec.courseTitle}`);
        console.log(`      Relevance Score: ${rec.relevanceScore.toFixed(2)}`);
        console.log(
          `      Success Probability: ${(rec.successProbability * 100).toFixed(1)}%`
        );
        console.log(`      Reasoning: ${rec.reasoning.join(', ')}`);
      });

      // Create adaptive learning schedule
      console.log('\n📅 Creating adaptive learning schedule...');
      const currentCourse =
        profile.currentStatus.currentCourse ||
        recommendations[0]?.courseId ||
        'course_001';
      const schedule =
        await this.integrationService.generateIntelligentSchedule(
          learnerId,
          currentCourse,
          {
            availableHours:
              profile.behaviorProfile.preferredSchedule.timeOfDay === 'evening'
                ? 10
                : 15,
            workSchedule: {
              daysAvailable:
                profile.behaviorProfile.preferredSchedule.daysOfWeek,
              preferredTime:
                profile.behaviorProfile.preferredSchedule.timeOfDay,
            },
          }
        );

      console.log(`\n✅ Adaptive schedule created:`);
      console.log(
        `   Personalized for: ${profile.behaviorProfile.learningStyle} learning style`
      );
      console.log(
        `   Sessions/week: ${schedule.recommendedSchedule.sessionsPerWeek}`
      );
      console.log(
        `   Session duration: ${schedule.recommendedSchedule.sessionDuration} minutes`
      );
      console.log(
        `   Intensity: ${schedule.recommendedSchedule.intensityLevel}`
      );
      console.log(
        `   Preferred times: ${schedule.recommendedSchedule.preferredTimes.join(', ')}`
      );

      // Generate personalized intervention strategies
      if (profile.predictiveInsights.recommendedInterventions.length > 0) {
        console.log('\n🚨 Personalized intervention strategies:');
        profile.predictiveInsights.recommendedInterventions.forEach(
          (intervention, index) => {
            console.log(`\n   ${index + 1}. ${intervention.title}`);
            console.log(`      Type: ${intervention.type}`);
            console.log(`      Priority: ${intervention.priority}`);
            console.log(
              `      Effectiveness: ${(intervention.estimatedEffectiveness * 100).toFixed(1)}%`
            );
            console.log(
              `      Automated: ${intervention.automatable ? 'Yes' : 'No'}`
            );
          }
        );
      }

      // Setup personalized notifications
      console.log('\n🔔 Setting up personalized notification system...');
      const notifications =
        await this.integrationService.generateSmartNotifications(learnerId);

      const notificationsByType = notifications.notifications.reduce(
        (types, notification) => {
          types[notification.type] = (types[notification.type] || 0) + 1;
          return types;
        },
        {} as Record<string, number>
      );

      console.log(`✅ Personalized notifications configured:`);
      Object.entries(notificationsByType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} notifications`);
      });

      console.log('\n🎉 Advanced personalization demonstration completed!');
    } catch (error) {
      console.error('❌ Personalization demonstration failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXAMPLE 4: MODEL TRAINING AND VALIDATION
// ============================================================================

class ModelManagementExample {
  private predictiveService: PredictiveAnalyticsService;

  constructor(predictiveService: PredictiveAnalyticsService) {
    this.predictiveService = predictiveService;
  }

  /**
   * Example: Model training, validation, and performance monitoring
   */
  async demonstrateModelManagement(): Promise<void> {
    console.log('🤖 Demonstrating ML model management capabilities...');

    try {
      // Validate existing models
      console.log('\n✅ Step 1: Validating existing models...');
      const modelTypes = ['dropout_risk', 'performance_forecast'];

      for (const modelType of modelTypes) {
        console.log(`\n   Validating ${modelType} model...`);
        const validation =
          await this.predictiveService.validateModelPerformance(modelType);

        console.log(`   📊 Validation Results:`);
        console.log(
          `      Accuracy: ${(validation.accuracy * 100).toFixed(2)}%`
        );
        console.log(
          `      Precision: ${(validation.precision * 100).toFixed(2)}%`
        );
        console.log(`      Recall: ${(validation.recall * 100).toFixed(2)}%`);
        console.log(
          `      F1 Score: ${(validation.f1Score * 100).toFixed(2)}%`
        );
        console.log(`      AUC: ${(validation.auc * 100).toFixed(2)}%`);
      }

      // Retrain models with new data
      console.log('\n🔄 Step 2: Retraining models with fresh data...');
      await this.predictiveService.retrainModels();
      console.log('✅ Model retraining completed');

      // Generate predictive insights report
      console.log('\n📊 Step 3: Generating comprehensive insights report...');
      const report =
        await this.predictiveService.generatePredictiveInsightsReport(
          'quarter'
        );

      console.log(`\n📋 Quarterly Insights Report Generated:`);
      console.log(
        `   Executive Summary: ${report.executiveSummary.slice(0, 200)}...`
      );
      console.log(
        `   Strategic Recommendations: ${report.recommendations.length}`
      );
      console.log(
        `   Data Quality Score: ${(report.dataQuality.overallScore * 100).toFixed(1)}%`
      );

      console.log('\n🎉 Model management demonstration completed!');
    } catch (error) {
      console.error('❌ Model management failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXAMPLE 5: COMPLETE INTEGRATION WORKFLOW
// ============================================================================

class CompleteIntegrationExample {
  private predictiveService: PredictiveAnalyticsService;
  private integrationService: PredictiveAnalyticsIntegrationService;

  constructor(
    cache: CacheService,
    apiClient: SSGWSGApiClient,
    openaiApiKey: string
  ) {
    this.predictiveService = createPredictiveAnalyticsService({
      cache,
      apiClient,
      enableRealTimeProcessing: true,
      autoIntervention: true,
    });

    const contentService = createAIContentGenerationService({
      openaiApiKey,
      cache,
      apiClient,
    });

    this.integrationService = createPredictiveAnalyticsIntegrationService({
      predictiveService: this.predictiveService,
      contentService,
      cache,
      apiClient,
    });
  }

  /**
   * Complete end-to-end workflow demonstration
   */
  async runCompleteWorkflow(): Promise<void> {
    console.log('🚀 Running complete predictive analytics workflow...');

    try {
      // Step 1: Initialize system with learners
      const learnerIds = ['learner_001', 'learner_002', 'learner_003'];

      // Step 2: Process each learner through complete workflow
      for (const learnerId of learnerIds) {
        console.log(`\n👤 Processing learner: ${learnerId}`);

        // Get integrated profile
        const profile =
          await this.integrationService.getIntegratedLearnerProfile(learnerId);
        console.log(
          `   Risk Level: ${profile.predictiveInsights.riskPrediction?.riskLevel || 'Unknown'}`
        );

        // Generate recommendations if at risk
        if (
          profile.predictiveInsights.riskPrediction?.riskLevel === 'high' ||
          profile.predictiveInsights.riskPrediction?.riskLevel === 'critical'
        ) {
          const recommendations =
            await this.integrationService.generateIntelligentCourseRecommendations(
              learnerId
            );
          console.log(
            `   Generated ${recommendations.length} course recommendations`
          );

          // Create optimized schedule
          const schedule =
            await this.integrationService.generateIntelligentSchedule(
              learnerId,
              recommendations[0]?.courseId || 'course_001'
            );
          console.log(
            `   Created personalized schedule: ${schedule.recommendedSchedule.intensityLevel} intensity`
          );
        }

        // Setup notifications
        const notifications =
          await this.integrationService.generateSmartNotifications(learnerId);
        console.log(
          `   Configured ${notifications.notifications.length} smart notifications`
        );
      }

      // Step 3: Generate institutional insights
      console.log('\n🏢 Generating institutional dashboard...');
      const dashboard =
        await this.integrationService.generateInstitutionalDashboard();
      console.log(
        `   Institutional metrics: ${dashboard.overview.totalLearners} total learners`
      );
      console.log(`   At-risk learners: ${dashboard.overview.atRiskLearners}`);

      // Step 4: Batch process risk assessments
      console.log('\n🔄 Running batch risk assessments...');
      const batchResults =
        await this.predictiveService.batchProcessRiskAssessments(learnerIds);
      console.log(`   Processed ${batchResults.length} learners successfully`);

      // Step 5: Generate comprehensive report
      console.log('\n📊 Generating comprehensive insights report...');
      const report =
        await this.predictiveService.generatePredictiveInsightsReport('month');
      console.log(
        `   Report generated with ${report.recommendations.length} strategic recommendations`
      );

      console.log('\n🎉 Complete workflow executed successfully!');
      console.log('\n📋 Workflow Summary:');
      console.log(`   - Processed ${learnerIds.length} learners`);
      console.log(`   - Generated personalized recommendations and schedules`);
      console.log(`   - Set up intelligent notification systems`);
      console.log(`   - Created institutional dashboard`);
      console.log(`   - Performed batch risk assessments`);
      console.log(`   - Generated comprehensive insights report`);
    } catch (error) {
      console.error('❌ Complete workflow failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// USAGE EXAMPLES AND TESTS
// ============================================================================

/**
 * Main function to run all examples
 */
export async function runPredictiveAnalyticsExamples(): Promise<void> {
  console.log(
    '🔮 Starting Predictive Analytics & Early Warning System Examples'
  );
  console.log('='.repeat(80));

  // Mock dependencies
  const mockCache = new CacheService({ host: 'localhost', port: 6379 });

  // Create mock Redis client for SSGWSGApiClient
  const mockRedisClient = new Redis({
    host: 'localhost',
    port: 6379,
  });

  const mockApiClient = new SSGWSGApiClient(
    {
      baseUrl: 'https://api.ssg.gov.sg',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      scope: ['read', 'write'],
      environment: 'sandbox',
      timeout: 30000,
      retryAttempts: 3,
      rateLimitRpm: 100,
      rateLimitRph: 1000,
    },
    mockRedisClient
  );
  const openaiApiKey = process.env.OPENAI_API_KEY || 'test-key';

  try {
    // Example 1: Complete Risk Management
    console.log('\n📊 EXAMPLE 1: COMPLETE RISK MANAGEMENT WORKFLOW');
    console.log('-'.repeat(60));
    const riskExample = new ComprehensiveRiskManagementExample(
      mockCache,
      mockApiClient,
      openaiApiKey
    );
    await riskExample.demonstrateCompleteRiskWorkflow('learner_001');

    // Example 2: Institutional Analytics
    console.log('\n🏢 EXAMPLE 2: INSTITUTIONAL ANALYTICS DASHBOARD');
    console.log('-'.repeat(60));
    const integrationService = createPredictiveAnalyticsIntegrationService({
      predictiveService: createPredictiveAnalyticsService({
        cache: mockCache,
        apiClient: mockApiClient,
      }),
      contentService: createAIContentGenerationService({
        openaiApiKey,
        cache: mockCache,
        apiClient: mockApiClient,
      }),
      cache: mockCache,
      apiClient: mockApiClient,
    });

    const institutionalExample = new InstitutionalAnalyticsExample(
      integrationService
    );
    await institutionalExample.demonstrateInstitutionalDashboard();
    await institutionalExample.demonstrateBatchRiskProcessing();

    // Example 3: Advanced Personalization
    console.log('\n🎯 EXAMPLE 3: ADVANCED PERSONALIZATION');
    console.log('-'.repeat(60));
    const personalizationExample = new PersonalizationExample(
      integrationService
    );
    await personalizationExample.demonstrateAdvancedPersonalization(
      'learner_002'
    );

    // Example 4: Model Management
    console.log('\n🤖 EXAMPLE 4: MODEL TRAINING & VALIDATION');
    console.log('-'.repeat(60));
    const modelExample = new ModelManagementExample(
      createPredictiveAnalyticsService({
        cache: mockCache,
        apiClient: mockApiClient,
      })
    );
    await modelExample.demonstrateModelManagement();

    // Example 5: Complete Integration
    console.log('\n🚀 EXAMPLE 5: COMPLETE END-TO-END WORKFLOW');
    console.log('-'.repeat(60));
    const completeExample = new CompleteIntegrationExample(
      mockCache,
      mockApiClient,
      openaiApiKey
    );
    await completeExample.runCompleteWorkflow();

    console.log(
      '\n🎉 ALL PREDICTIVE ANALYTICS EXAMPLES COMPLETED SUCCESSFULLY!'
    );
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Examples failed:', error);
    throw error;
  }
}

// Export all examples for individual use
export {
  ComprehensiveRiskManagementExample,
  InstitutionalAnalyticsExample,
  PersonalizationExample,
  ModelManagementExample,
  CompleteIntegrationExample,
};
