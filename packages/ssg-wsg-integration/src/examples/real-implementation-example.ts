/**
 * SSG Skills Framework Integration - Real Usage Example
 * Demonstrates how to use the actual working implementation
 */

import {
  createSSGSkillsIntegration,
  type SkillsGap,
  type LearningPath,
  type TrendingSkill,
  type SkillProgress,
} from '../skills/SSGSkillsService';
import { SSGWSGApiClient } from '../client/ApiClient';
import { CacheService } from '../cache/CacheService';

// ============================================================================
// REAL IMPLEMENTATION EXAMPLE
// ============================================================================

export class SkillsDevelopmentManager {
  private skillsService: ReturnType<typeof createSSGSkillsIntegration>;

  constructor() {
    // Initialize Redis client first
    const Redis = require('ioredis');
    const redisClient = new Redis(
      process.env.REDIS_URL || 'redis://localhost:6379'
    );

    // Initialize the real services
    const apiClient = new SSGWSGApiClient(
      {
        baseUrl: process.env.SSG_API_URL || 'https://api.ssg-wsg.gov.sg',
        clientId: process.env.SSG_CLIENT_ID!,
        clientSecret: process.env.SSG_CLIENT_SECRET!,
        scope: ['read', 'write'],
        environment: 'production',
        timeout: 30000,
        retryAttempts: 3,
        rateLimitRpm: 100,
        rateLimitRph: 1000,
      },
      redisClient
    );

    const cacheService = new CacheService({
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      defaultTTL: 3600,
      keyPrefix: 'ssg-skills:',
    });

    // Create the actual skills integration service
    this.skillsService = createSSGSkillsIntegration({
      client: apiClient,
      cache: cacheService,
      aiModelEndpoint: process.env.AI_MODEL_ENDPOINT,
    });

    console.log(
      '🎯 Skills Development Manager initialized with real SSG integration'
    );
  }

  // ============================================================================
  // REAL IMPLEMENTATION METHODS
  // ============================================================================

  /**
   * Complete career development workflow
   */
  async developCareerPath(
    userId: string,
    targetRole: string
  ): Promise<{
    skillsGap: SkillsGap;
    learningPath: LearningPath;
    estimatedTimeToCompletion: number;
    estimatedCost: number;
  }> {
    console.log(
      `🚀 Starting career development for ${userId} -> ${targetRole}`
    );

    try {
      // Step 1: Sync latest skills framework from SSG
      console.log('📚 Syncing SSG skills framework...');
      const framework = await this.skillsService.syncSkillsFramework({
        forceRefresh: false,
      });
      console.log(`✅ Synced ${framework.totalSkills} skills from SSG`);

      // Step 2: Analyze current skills vs target role requirements
      console.log('🔍 Analyzing skills gaps...');
      const skillsGap = await this.skillsService.generateSkillsGapAnalysis(
        userId,
        targetRole,
        {
          includeMarketTrends: true,
          careerLevel: 'Mid',
        }
      );
      console.log(
        `📊 Found ${skillsGap.criticalGaps.length} critical skill gaps`
      );

      // Step 3: Generate personalized learning path
      console.log('🎯 Creating personalized learning path...');
      const learningPath = await this.skillsService.recommendLearningPath(
        'gap-analysis-id', // In real usage, you'd store and pass the actual ID
        userId,
        targetRole,
        {
          timeframe: { months: 12, hoursPerWeek: 10 },
          budget: { maxAmount: 5000, currency: 'SGD' },
          learningStyle: 'Visual',
          formats: ['Online', 'Blended'],
          certificationRequired: true,
        }
      );
      console.log(
        `📈 Generated ${learningPath.pathSteps.length}-step learning path`
      );

      return {
        skillsGap,
        learningPath,
        estimatedTimeToCompletion: learningPath.estimatedDuration,
        estimatedCost: skillsGap.estimatedCost,
      };
    } catch (error) {
      console.error('❌ Career development workflow failed:', error);
      throw error;
    }
  }

  /**
   * Track and update user's skill progress
   */
  async updateSkillProgress(
    userId: string,
    skillId: string,
    completedCourse: {
      title: string;
      provider: string;
      completionDate: Date;
      score?: number;
      certificateUrl?: string;
    }
  ): Promise<void> {
    console.log(`📈 Updating skill progress: ${userId} - ${skillId}`);

    await this.skillsService.updateSkillProgress(userId, skillId, {
      currentLevel: 'Intermediate', // This would be determined by assessment
      evidence: {
        type: 'Course',
        title: completedCourse.title,
        description: `Completed course from ${completedCourse.provider}`,
        completedDate: completedCourse.completionDate,
        verificationStatus: 'Verified',
        verificationUrl: completedCourse.certificateUrl,
        score: completedCourse.score,
        issuer: completedCourse.provider,
      },
    });

    console.log('✅ Skill progress updated successfully');
  }

  /**
   * Map course content to SSG skills using AI
   */
  async mapCourseToSkills(
    courseId: string,
    courseContent: {
      title: string;
      description: string;
      syllabus: string[];
      learningObjectives: string[];
    }
  ): Promise<void> {
    console.log(`🎯 Mapping course ${courseId} to SSG skills...`);

    const mappings = await this.skillsService.mapCourseToSkills(courseId, {
      useAI: true, // Use AI to analyze content and suggest mappings
      manualMappings: [
        // You can also add manual mappings for known skills
        {
          skillId: 'skill-da-001',
          competencyLevel: 'Advanced',
          relevanceScore: 0.9,
          assessmentMethod: 'Project',
        },
      ],
    });

    console.log(`✅ Mapped ${mappings.length} skills to course ${courseId}`);
  }

  /**
   * Get real-time market trends for skills planning
   */
  async getSkillsMarketInsights(sector: string = 'Technology'): Promise<void> {
    console.log(`📈 Fetching market trends for ${sector} sector...`);

    const trends = await this.skillsService.getMarketTrends({
      sector,
      region: 'Singapore',
      timeframe: 12, // 12 months forecast
    });

    console.log(`📊 Market Insights for ${sector}:`);
    console.log(`  - ${trends.trendingSkills.length} trending skills`);
    console.log(`  - ${trends.emergingSkills.length} emerging skills`);
    console.log(`  - Forecast confidence: ${trends.forecast.confidence}%`);

    // Display top trending skills
    trends.trendingSkills.slice(0, 5).forEach((skill, index) => {
      console.log(
        `  ${index + 1}. ${skill.skillTitle} - ${skill.demandGrowth}% growth`
      );
    });
  }

  /**
   * Complete skills portfolio assessment
   */
  async assessUserSkillsPortfolio(userId: string): Promise<void> {
    console.log(`📋 Assessing skills portfolio for user ${userId}...`);

    const skillsProgress = await this.skillsService.trackSkillProgress(userId, {
      sector: 'Technology',
    });

    console.log(`📊 Skills Portfolio Summary:`);
    console.log(`  - Total skills tracked: ${skillsProgress.length}`);

    const competencyLevels = {
      Expert: skillsProgress.filter((s) => s.currentLevel === 'Expert').length,
      Advanced: skillsProgress.filter((s) => s.currentLevel === 'Advanced')
        .length,
      Intermediate: skillsProgress.filter(
        (s) => s.currentLevel === 'Intermediate'
      ).length,
      Basic: skillsProgress.filter((s) => s.currentLevel === 'Basic').length,
    };

    console.log(`  - Expert: ${competencyLevels.Expert}`);
    console.log(`  - Advanced: ${competencyLevels.Advanced}`);
    console.log(`  - Intermediate: ${competencyLevels.Intermediate}`);
    console.log(`  - Basic: ${competencyLevels.Basic}`);

    // Identify skills needing attention
    const needsAttention = skillsProgress.filter(
      (s) => s.progressPercentage < 70 && s.confidenceScore < 0.6
    );

    if (needsAttention.length > 0) {
      console.log(`⚠️  Skills needing attention: ${needsAttention.length}`);
      needsAttention.forEach((skill) => {
        console.log(
          `    - Skill ID: ${skill.skillId} (${skill.progressPercentage}% progress)`
        );
      });
    }
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

export async function demonstrateRealImplementation(): Promise<void> {
  console.log('🚀 Demonstrating Real SSG Skills Framework Implementation');
  console.log('='.repeat(60));

  const skillsManager = new SkillsDevelopmentManager();

  try {
    // Example: Complete career development workflow
    const careerDevelopment = await skillsManager.developCareerPath(
      'user-123',
      'Senior Data Scientist'
    );

    console.log('📋 Career Development Results:');
    console.log(
      `  - Skills gaps identified: ${careerDevelopment.skillsGap.criticalGaps.length}`
    );
    console.log(
      `  - Learning path steps: ${careerDevelopment.learningPath.pathSteps.length}`
    );
    console.log(
      `  - Estimated completion time: ${careerDevelopment.estimatedTimeToCompletion} hours`
    );
    console.log(`  - Estimated cost: $${careerDevelopment.estimatedCost}`);

    // Example: Update skill progress after completing a course
    await skillsManager.updateSkillProgress('user-123', 'skill-ml-001', {
      title: 'Machine Learning Fundamentals',
      provider: 'TechSkills Institute',
      completionDate: new Date(),
      score: 85,
      certificateUrl: 'https://example.com/certificate/123',
    });

    // Example: Map new course to skills
    await skillsManager.mapCourseToSkills('course-456', {
      title: 'Advanced Data Analytics with Python',
      description: 'Comprehensive course covering data science techniques',
      syllabus: ['Pandas', 'NumPy', 'Machine Learning', 'Data Visualization'],
      learningObjectives: [
        'Analyze large datasets',
        'Build ML models',
        'Create visualizations',
      ],
    });

    // Example: Get market trends
    await skillsManager.getSkillsMarketInsights('Technology');

    // Example: Assess user's skills portfolio
    await skillsManager.assessUserSkillsPortfolio('user-123');

    console.log('✅ Real implementation demonstration completed successfully!');
  } catch (error) {
    console.error('❌ Demonstration failed:', error);
  }
}

// Export for use in other modules
export default SkillsDevelopmentManager;
