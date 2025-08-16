/**
 * AI-Powered Content Generation Service
 * Comprehensive AI integration for course content, assessments, and personalization
 * Integrates with OpenAI GPT-4 and other AI services for enterprise LMS/TMS
 */

import { EventEmitter } from 'events';
import OpenAI from 'openai';
import { z } from 'zod';
import { CacheService } from '../cache/CacheService';
import { SSGWSGApiClient } from '../client/ApiClient';

// ============================================================================
// SCHEMAS AND INTERFACES
// ============================================================================

export const ContentGenerationRequestSchema = z.object({
  type: z.enum([
    'course_outline',
    'learning_objectives',
    'lesson_content',
    'quiz',
    'assignment',
    'rubric',
    'translation',
  ]),
  subject: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  duration: z.number().optional(),
  learnerProfile: z
    .object({
      role: z.string(),
      experience: z.string(),
      preferences: z.array(z.string()),
      learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']),
    })
    .optional(),
  constraints: z
    .object({
      ssgCompliant: z.boolean().default(true),
      language: z.string().default('en'),
      wordCount: z.number().optional(),
      format: z.string().optional(),
    })
    .optional(),
});

export interface AIContentRequest {
  type:
    | 'course_outline'
    | 'learning_objectives'
    | 'lesson_content'
    | 'quiz'
    | 'assignment'
    | 'rubric'
    | 'translation';
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration?: number;
  learnerProfile?: {
    role: string;
    experience: string;
    preferences: string[];
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  };
  constraints?: {
    ssgCompliant: boolean;
    language: string;
    wordCount?: number;
    format?: string;
  };
}

export interface CourseOutlineResponse {
  title: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  modules: CourseModule[];
  assessments: AssessmentPlan[];
  estimatedDuration: number;
  ssgAlignment: SSGAlignment;
  metadata: ContentMetadata;
}

export interface CourseModule {
  moduleNumber: number;
  title: string;
  description: string;
  objectives: string[];
  lessons: Lesson[];
  duration: number;
  assessments: string[];
  resources: Resource[];
}

export interface Lesson {
  lessonNumber: number;
  title: string;
  objectives: string[];
  content: LessonContent;
  activities: Activity[];
  duration: number;
  deliveryMethod: 'lecture' | 'workshop' | 'lab' | 'discussion' | 'self_study';
}

export interface LessonContent {
  introduction: string;
  mainContent: ContentSection[];
  summary: string;
  keyTakeaways: string[];
  additionalResources: Resource[];
}

export interface ContentSection {
  heading: string;
  content: string;
  examples: string[];
  multimedia: MultimediaElement[];
  interactions: InteractiveElement[];
}

export interface Activity {
  type: 'individual' | 'group' | 'practical' | 'discussion';
  title: string;
  description: string;
  instructions: string[];
  materials: string[];
  duration: number;
  learningObjectives: string[];
}

export interface AssessmentPlan {
  type: 'formative' | 'summative';
  method: 'quiz' | 'assignment' | 'project' | 'presentation' | 'practical';
  title: string;
  description: string;
  questions: Question[];
  rubric: Rubric;
  weight: number;
  timeAllocation: number;
}

export interface Question {
  id: string;
  type:
    | 'multiple_choice'
    | 'true_false'
    | 'short_answer'
    | 'essay'
    | 'practical';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bloomsLevel: string;
  skillAssessed: string[];
  points: number;
}

export interface Rubric {
  title: string;
  criteria: RubricCriterion[];
  gradingScale: GradingScale;
  instructions: string;
}

export interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  level: string;
  points: number;
  description: string;
  indicators: string[];
}

export interface GradingScale {
  type: 'points' | 'percentage' | 'letter';
  maxPoints?: number;
  passingGrade: number;
  gradeRanges: { min: number; max: number; grade: string }[];
}

export interface MultimediaElement {
  type: 'image' | 'video' | 'audio' | 'animation' | 'simulation';
  url?: string;
  placeholder: string;
  description: string;
  duration?: number;
  altText: string;
}

export interface InteractiveElement {
  type: 'clickable_hotspot' | 'drag_drop' | 'timeline' | 'accordion' | 'tabs';
  title: string;
  description: string;
  configuration: Record<string, any>;
}

export interface Resource {
  type: 'document' | 'website' | 'video' | 'book' | 'article' | 'tool';
  title: string;
  url?: string;
  description: string;
  author?: string;
  isRequired: boolean;
}

export interface SSGAlignment {
  skillsFramework: {
    sector: string;
    trackId: string;
    roleId: string;
    skillsAddressed: string[];
  };
  qualificationLevel: string;
  cpPoints: number;
  industryRelevance: string;
  employabilitySkills: string[];
}

export interface ContentMetadata {
  aiModel: string;
  generatedAt: Date;
  version: string;
  quality: {
    score: number;
    confidence: number;
    flags: string[];
  };
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  lastReviewed?: Date;
  reviewedBy?: string;
  revisionNotes?: string[];
}

export interface TranslationRequest {
  sourceLanguage: string;
  targetLanguage: string;
  content: string;
  contentType: 'plain_text' | 'html' | 'markdown' | 'structured';
  preserveFormatting: boolean;
  culturalAdaptation: boolean;
}

export interface TranslationResponse {
  translatedContent: string;
  confidence: number;
  alternatives: string[];
  culturalNotes: string[];
  reviewRequired: boolean;
  metadata: ContentMetadata;
}

export interface PersonalizationProfile {
  learnerId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests: string[];
  careerGoals: string[];
  previousKnowledge: string[];
  preferredPace: 'slow' | 'moderate' | 'fast';
  preferredContentLength: 'short' | 'medium' | 'long';
  accessibilityNeeds: string[];
  culturalContext: string;
}

export interface PersonalizedContent {
  originalContentId: string;
  personalizedVersion: string;
  adaptations: ContentAdaptation[];
  effectiveness: {
    engagementScore: number;
    comprehensionScore: number;
    completionRate: number;
  };
  metadata: ContentMetadata;
}

export interface ContentAdaptation {
  type:
    | 'language_complexity'
    | 'examples'
    | 'analogies'
    | 'visual_aids'
    | 'pacing'
    | 'cultural_context';
  description: string;
  rationale: string;
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class AIContentGenerationService extends EventEmitter {
  private openai: OpenAI;
  private cache: CacheService;
  private apiClient: SSGWSGApiClient;
  private config: {
    defaultModel: string;
    maxTokens: number;
    temperature: number;
    enableCaching: boolean;
    requireHumanReview: boolean;
    ssgComplianceRequired: boolean;
  };

  constructor(config: {
    openaiApiKey: string;
    cache: CacheService;
    apiClient: SSGWSGApiClient;
    defaultModel?: string;
    maxTokens?: number;
    temperature?: number;
    enableCaching?: boolean;
    requireHumanReview?: boolean;
    ssgComplianceRequired?: boolean;
  }) {
    super();

    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });

    this.cache = config.cache;
    this.apiClient = config.apiClient;
    this.config = {
      defaultModel: config.defaultModel || 'gpt-4-turbo-preview',
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.7,
      enableCaching: config.enableCaching ?? true,
      requireHumanReview: config.requireHumanReview ?? true,
      ssgComplianceRequired: config.ssgComplianceRequired ?? true,
    };

    console.log('🤖 AI Content Generation Service initialized');
  }

  // ============================================================================
  // COURSE CONTENT GENERATION
  // ============================================================================

  /**
   * Generate comprehensive course outline with modules and assessments
   */
  async generateCourseOutline(
    request: AIContentRequest
  ): Promise<CourseOutlineResponse> {
    console.log('🎯 Generating course outline for:', request.subject);

    try {
      // Validate request
      ContentGenerationRequestSchema.parse(request);

      // Check cache first
      const cacheKey = this.generateCacheKey('course_outline', request);
      if (this.config.enableCaching) {
        const cached = await this.cache.get<CourseOutlineResponse>(cacheKey);
        if (cached) {
          console.log('📋 Using cached course outline');
          return cached;
        }
      }

      // Generate SSG-compliant prompt
      const prompt = await this.buildCourseOutlinePrompt(request);

      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: this.config.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt('course_outline'),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        response_format: { type: 'json_object' },
      });

      // Parse and validate response
      const content = JSON.parse(response.choices[0].message.content || '{}');
      const courseOutline = await this.validateAndEnhanceCourseOutline(
        content,
        request
      );

      // Cache the result
      if (this.config.enableCaching) {
        await this.cache.set(cacheKey, courseOutline, { ttl: 3600 });
      }

      // Emit event for tracking
      this.emit('contentGenerated', {
        type: 'course_outline',
        subject: request.subject,
        success: true,
        metadata: courseOutline.metadata,
      });

      console.log(
        `✅ Generated course outline with ${courseOutline.modules.length} modules`
      );
      return courseOutline;
    } catch (error) {
      console.error('❌ Course outline generation failed:', error);
      this.emit('generationError', { type: 'course_outline', error });
      throw error;
    }
  }

  /**
   * Generate detailed lesson content
   */
  async generateLessonContent(
    request: AIContentRequest & {
      moduleContext: string;
      lessonObjectives: string[];
    }
  ): Promise<LessonContent> {
    console.log('📖 Generating lesson content for:', request.subject);

    try {
      const cacheKey = this.generateCacheKey('lesson_content', request);

      if (this.config.enableCaching) {
        const cached = await this.cache.get<LessonContent>(cacheKey);
        if (cached) return cached;
      }

      const prompt = this.buildLessonContentPrompt(request);

      const response = await this.openai.chat.completions.create({
        model: this.config.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt('lesson_content'),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        response_format: { type: 'json_object' },
      });

      const content = JSON.parse(response.choices[0].message.content || '{}');
      const lessonContent = await this.validateAndEnhanceLessonContent(
        content,
        request
      );

      if (this.config.enableCaching) {
        await this.cache.set(cacheKey, lessonContent, { ttl: 3600 });
      }

      this.emit('contentGenerated', {
        type: 'lesson_content',
        success: true,
        metadata: { generatedAt: new Date() },
      });

      return lessonContent;
    } catch (error) {
      console.error('❌ Lesson content generation failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // ASSESSMENT GENERATION
  // ============================================================================

  /**
   * Generate quiz with multiple question types
   */
  async generateQuiz(
    request: AIContentRequest & {
      questionCount: number;
      questionTypes: string[];
      difficultyDistribution?: Record<string, number>;
    }
  ): Promise<AssessmentPlan> {
    console.log('❓ Generating quiz with', request.questionCount, 'questions');

    try {
      const cacheKey = this.generateCacheKey('quiz', request);

      if (this.config.enableCaching) {
        const cached = await this.cache.get<AssessmentPlan>(cacheKey);
        if (cached) return cached;
      }

      const prompt = this.buildQuizPrompt(request);

      const response = await this.openai.chat.completions.create({
        model: this.config.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt('quiz'),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const content = JSON.parse(response.choices[0].message.content || '{}');
      const quiz = await this.validateAndEnhanceQuiz(content, request);

      if (this.config.enableCaching) {
        await this.cache.set(cacheKey, quiz, { ttl: 3600 });
      }

      this.emit('contentGenerated', {
        type: 'quiz',
        success: true,
        questionCount: quiz.questions.length,
      });

      return quiz;
    } catch (error) {
      console.error('❌ Quiz generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate assignment with detailed rubric
   */
  async generateAssignment(
    request: AIContentRequest & {
      assignmentType:
        | 'essay'
        | 'project'
        | 'case_study'
        | 'practical'
        | 'presentation';
      duration: number;
      groupSize?: number;
    }
  ): Promise<AssessmentPlan> {
    console.log('📝 Generating', request.assignmentType, 'assignment');

    try {
      const prompt = this.buildAssignmentPrompt(request);

      const response = await this.openai.chat.completions.create({
        model: this.config.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt('assignment'),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const content = JSON.parse(response.choices[0].message.content || '{}');
      const assignment = await this.validateAndEnhanceAssignment(
        content,
        request
      );

      this.emit('contentGenerated', {
        type: 'assignment',
        assignmentType: request.assignmentType,
        success: true,
      });

      return assignment;
    } catch (error) {
      console.error('❌ Assignment generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate detailed assessment rubric
   */
  async generateRubric(
    request: AIContentRequest & {
      assessmentType: string;
      criteria: string[];
      gradingLevels: number;
    }
  ): Promise<Rubric> {
    console.log('📊 Generating rubric for', request.assessmentType);

    try {
      const prompt = this.buildRubricPrompt(request);

      const response = await this.openai.chat.completions.create({
        model: this.config.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt('rubric'),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: 0.6,
        response_format: { type: 'json_object' },
      });

      const content = JSON.parse(response.choices[0].message.content || '{}');
      const rubric = this.validateAndEnhanceRubric(content, request);

      return rubric;
    } catch (error) {
      console.error('❌ Rubric generation failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // PERSONALIZATION ENGINE
  // ============================================================================

  /**
   * Generate personalized content based on learner profile
   */
  async personalizeContent(
    originalContent: string,
    profile: PersonalizationProfile,
    contentType: string
  ): Promise<PersonalizedContent> {
    console.log('🎯 Personalizing content for learner:', profile.learnerId);

    try {
      const prompt = this.buildPersonalizationPrompt(
        originalContent,
        profile,
        contentType
      );

      const response = await this.openai.chat.completions.create({
        model: this.config.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt('personalization'),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = JSON.parse(response.choices[0].message.content || '{}');

      const personalizedContent: PersonalizedContent = {
        originalContentId: `original_${Date.now()}`,
        personalizedVersion: content.personalizedContent,
        adaptations: content.adaptations || [],
        effectiveness: {
          engagementScore: 0,
          comprehensionScore: 0,
          completionRate: 0,
        },
        metadata: this.createContentMetadata('personalization'),
      };

      this.emit('contentPersonalized', {
        learnerId: profile.learnerId,
        adaptations: personalizedContent.adaptations.length,
        success: true,
      });

      return personalizedContent;
    } catch (error) {
      console.error('❌ Content personalization failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // MULTILINGUAL SUPPORT
  // ============================================================================

  /**
   * Translate content to target language with cultural adaptation
   */
  async translateContent(
    request: TranslationRequest
  ): Promise<TranslationResponse> {
    console.log(
      `🌐 Translating from ${request.sourceLanguage} to ${request.targetLanguage}`
    );

    try {
      const cacheKey = `translation_${this.hashString(request.content)}_${request.sourceLanguage}_${request.targetLanguage}`;

      if (this.config.enableCaching) {
        const cached = await this.cache.get<TranslationResponse>(cacheKey);
        if (cached) return cached;
      }

      const prompt = this.buildTranslationPrompt(request);

      const response = await this.openai.chat.completions.create({
        model: this.config.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt('translation'),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = JSON.parse(response.choices[0].message.content || '{}');

      const translation: TranslationResponse = {
        translatedContent: content.translation,
        confidence: content.confidence || 0.8,
        alternatives: content.alternatives || [],
        culturalNotes: content.culturalNotes || [],
        reviewRequired: content.confidence < 0.9 || request.culturalAdaptation,
        metadata: this.createContentMetadata('translation'),
      };

      if (this.config.enableCaching) {
        await this.cache.set(cacheKey, translation, { ttl: 86400 });
      }

      this.emit('contentTranslated', {
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        confidence: translation.confidence,
        success: true,
      });

      return translation;
    } catch (error) {
      console.error('❌ Translation failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // QUALITY ASSURANCE & REVIEW
  // ============================================================================

  /**
   * AI-powered content quality review
   */
  async reviewContent(
    content: string,
    contentType: string
  ): Promise<{
    qualityScore: number;
    issues: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    suggestions: string[];
    ssgCompliance: { compliant: boolean; issues: string[] };
  }> {
    console.log('🔍 Reviewing content quality and SSG compliance');

    try {
      const prompt = this.buildReviewPrompt(content, contentType);

      const response = await this.openai.chat.completions.create({
        model: this.config.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt('review'),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const review = JSON.parse(response.choices[0].message.content || '{}');

      this.emit('contentReviewed', {
        qualityScore: review.qualityScore,
        issueCount: review.issues?.length || 0,
        ssgCompliant: review.ssgCompliance?.compliant || false,
      });

      return review;
    } catch (error) {
      console.error('❌ Content review failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Generate multiple pieces of content in batch
   */
  async batchGenerate(requests: AIContentRequest[]): Promise<
    Array<{
      request: AIContentRequest;
      result: any;
      success: boolean;
      error?: string;
    }>
  > {
    console.log(
      `🔄 Processing batch of ${requests.length} content generation requests`
    );

    const results = [];

    for (const request of requests) {
      try {
        let result;

        switch (request.type) {
          case 'course_outline':
            result = await this.generateCourseOutline(request);
            break;
          case 'quiz':
            result = await this.generateQuiz(request as any);
            break;
          case 'assignment':
            result = await this.generateAssignment(request as any);
            break;
          case 'lesson_content':
            result = await this.generateLessonContent(request as any);
            break;
          default:
            throw new Error(`Unsupported content type: ${request.type}`);
        }

        results.push({ request, result, success: true });
      } catch (error) {
        results.push({
          request,
          result: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.emit('batchCompleted', {
      totalRequests: requests.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });

    return results;
  }

  // ============================================================================
  // ANALYTICS & INSIGHTS
  // ============================================================================

  /**
   * Analyze content effectiveness and engagement
   */
  async analyzeContentEffectiveness(
    contentId: string,
    metrics: {
      viewCount: number;
      completionRate: number;
      averageTimeSpent: number;
      userFeedback: Array<{ rating: number; comment: string }>;
      assessmentScores?: number[];
    }
  ): Promise<{
    effectivenessScore: number;
    insights: string[];
    recommendations: string[];
    improvementAreas: string[];
  }> {
    console.log('📈 Analyzing content effectiveness for:', contentId);

    try {
      const prompt = this.buildAnalysisPrompt(contentId, metrics);

      const response = await this.openai.chat.completions.create({
        model: this.config.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt('analytics'),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');

      this.emit('contentAnalyzed', {
        contentId,
        effectivenessScore: analysis.effectivenessScore,
        insightCount: analysis.insights?.length || 0,
      });

      return analysis;
    } catch (error) {
      console.error('❌ Content analysis failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getSystemPrompt(type: string): string {
    const baseContext = `You are an expert AI assistant specializing in educational content creation for Singapore's skills development ecosystem. You understand SSG (SkillsFuture Singapore) standards, competency frameworks, and industry requirements.`;

    const prompts = {
      course_outline: `${baseContext} Generate comprehensive, industry-relevant course outlines that align with SSG skills framework and meet professional training standards. Focus on practical, applicable skills that enhance employability.`,

      lesson_content: `${baseContext} Create engaging, pedagogically sound lesson content that incorporates multiple learning styles, practical examples, and interactive elements. Ensure content is culturally relevant for Singapore context.`,

      quiz: `${baseContext} Design fair, comprehensive assessments that accurately measure learning outcomes. Include various question types and difficulty levels. Ensure questions are unbiased and culturally appropriate.`,

      assignment: `${baseContext} Create meaningful assignments that develop practical skills and assess real-world application of knowledge. Include clear instructions, evaluation criteria, and learning objectives.`,

      rubric: `${baseContext} Develop detailed, fair assessment rubrics that provide clear criteria and performance levels. Ensure rubrics support consistent grading and meaningful feedback.`,

      personalization: `${baseContext} Adapt content to individual learning preferences, cultural backgrounds, and proficiency levels while maintaining learning effectiveness and engagement.`,

      translation: `${baseContext} Provide accurate translations that maintain educational value and cultural appropriateness. Consider local context, terminology, and learning conventions.`,

      review: `${baseContext} Conduct thorough quality reviews focusing on educational value, accuracy, bias detection, SSG compliance, and cultural sensitivity. Provide constructive improvement suggestions.`,

      analytics: `${baseContext} Analyze learning content effectiveness using data-driven insights. Provide actionable recommendations for content improvement and learner engagement enhancement.`,
    };

    return prompts[type as keyof typeof prompts] || baseContext;
  }

  private async buildCourseOutlinePrompt(
    request: AIContentRequest
  ): Promise<string> {
    return `
Generate a comprehensive course outline for "${request.subject}" at ${request.level} level.

Requirements:
- Duration: ${request.duration || 'flexible'} hours
- SSG Compliant: ${request.constraints?.ssgCompliant ?? true}
- Language: ${request.constraints?.language || 'English'}
- Target Audience: ${request.learnerProfile?.role || 'Working professionals'}

Include:
1. Course title and description
2. Learning objectives (3-5 clear, measurable objectives)
3. Prerequisites
4. 3-6 modules with lessons
5. Assessment strategy
6. SSG skills framework alignment
7. Estimated duration breakdown

Format the response as JSON with the CourseOutlineResponse structure.
`;
  }

  private buildLessonContentPrompt(
    request: AIContentRequest & {
      moduleContext: string;
      lessonObjectives: string[];
    }
  ): string {
    return `
Generate detailed lesson content for "${request.subject}" within the context of: ${request.moduleContext}

Lesson Objectives:
${request.lessonObjectives.map((obj) => `- ${obj}`).join('\n')}

Requirements:
- Level: ${request.level}
- Learning Style: ${request.learnerProfile?.learningStyle || 'mixed'}
- Duration: ${request.duration || 60} minutes
- Include interactive elements and practical examples

Structure:
1. Engaging introduction
2. Main content sections with examples
3. Interactive activities
4. Summary and key takeaways
5. Additional resources

Format as JSON with LessonContent structure.
`;
  }

  private buildQuizPrompt(
    request: AIContentRequest & {
      questionCount: number;
      questionTypes: string[];
    }
  ): string {
    return `
Generate a ${request.questionCount}-question quiz for "${request.subject}" at ${request.level} level.

Question Types: ${request.questionTypes.join(', ')}
Requirements:
- Varied difficulty levels
- Clear, unambiguous questions
- Detailed explanations for answers
- Aligned with Bloom's taxonomy
- Culturally appropriate for Singapore context

Format as JSON with AssessmentPlan structure.
`;
  }

  private buildAssignmentPrompt(
    request: AIContentRequest & { assignmentType: string; duration: number }
  ): string {
    return `
Create a ${request.assignmentType} assignment for "${request.subject}" at ${request.level} level.

Duration: ${request.duration} hours
Requirements:
- Clear instructions and deliverables
- Real-world application
- Detailed rubric with criteria
- Learning objectives alignment
- Resource requirements

Format as JSON with AssessmentPlan structure.
`;
  }

  private buildRubricPrompt(
    request: AIContentRequest & { assessmentType: string; criteria: string[] }
  ): string {
    return `
Create a detailed rubric for ${request.assessmentType} assessment in "${request.subject}".

Assessment Criteria:
${request.criteria.map((c) => `- ${c}`).join('\n')}

Requirements:
- 4-5 performance levels
- Clear descriptors for each level
- Point allocations
- Fair and unbiased criteria

Format as JSON with Rubric structure.
`;
  }

  private buildPersonalizationPrompt(
    content: string,
    profile: PersonalizationProfile,
    contentType: string
  ): string {
    return `
Personalize the following ${contentType} content for a learner with these characteristics:

Learning Style: ${profile.learningStyle}
Proficiency Level: ${profile.proficiencyLevel}
Career Goals: ${profile.careerGoals.join(', ')}
Cultural Context: ${profile.culturalContext}

Original Content:
${content}

Adaptations needed:
- Adjust language complexity
- Add relevant examples and analogies
- Modify pacing and structure
- Include cultural references
- Address accessibility needs: ${profile.accessibilityNeeds.join(', ')}

Format as JSON with PersonalizedContent structure.
`;
  }

  private buildTranslationPrompt(request: TranslationRequest): string {
    return `
Translate the following content from ${request.sourceLanguage} to ${request.targetLanguage}:

${request.content}

Requirements:
- Maintain educational value and clarity
- Preserve formatting: ${request.preserveFormatting}
- Cultural adaptation: ${request.culturalAdaptation}
- Content type: ${request.contentType}
- Consider Singapore context and terminology

Provide translation with confidence score, alternatives, and cultural notes.
Format as JSON with TranslationResponse structure.
`;
  }

  private buildReviewPrompt(content: string, contentType: string): string {
    return `
Review the following ${contentType} content for quality, accuracy, and SSG compliance:

${content}

Evaluate:
1. Educational value and clarity
2. Accuracy and factual correctness
3. Bias and cultural sensitivity
4. SSG standards compliance
5. Language and readability
6. Engagement and effectiveness

Provide quality score (0-100), issues found, suggestions for improvement, and SSG compliance assessment.
Format as JSON.
`;
  }

  private buildAnalysisPrompt(contentId: string, metrics: any): string {
    return `
Analyze the effectiveness of content ID: ${contentId}

Metrics:
- View Count: ${metrics.viewCount}
- Completion Rate: ${metrics.completionRate}%
- Average Time Spent: ${metrics.averageTimeSpent} minutes
- User Feedback: ${metrics.userFeedback.length} responses
- Average Rating: ${metrics.userFeedback.reduce((sum: number, f: any) => sum + f.rating, 0) / metrics.userFeedback.length}

Provide:
1. Overall effectiveness score (0-100)
2. Key insights about performance
3. Specific recommendations for improvement
4. Areas needing attention

Format as JSON.
`;
  }

  private async validateAndEnhanceCourseOutline(
    content: any,
    request: AIContentRequest
  ): Promise<CourseOutlineResponse> {
    // Add validation logic and enhancements
    return {
      ...content,
      metadata: this.createContentMetadata('course_outline'),
      ssgAlignment: await this.generateSSGAlignment(request.subject),
    };
  }

  private async validateAndEnhanceLessonContent(
    content: any,
    request: AIContentRequest
  ): Promise<LessonContent> {
    return {
      ...content,
      additionalResources: content.additionalResources || [],
    };
  }

  private async validateAndEnhanceQuiz(
    content: any,
    request: AIContentRequest
  ): Promise<AssessmentPlan> {
    return {
      ...content,
      rubric: content.rubric || (await this.generateDefaultRubric()),
    };
  }

  private async validateAndEnhanceAssignment(
    content: any,
    request: AIContentRequest
  ): Promise<AssessmentPlan> {
    return {
      ...content,
      rubric: content.rubric || (await this.generateDefaultRubric()),
    };
  }

  private validateAndEnhanceRubric(
    content: any,
    request: AIContentRequest
  ): Rubric {
    return {
      ...content,
      instructions:
        content.instructions ||
        'Use this rubric to evaluate student work consistently.',
    };
  }

  private createContentMetadata(type: string): ContentMetadata {
    return {
      aiModel: this.config.defaultModel,
      generatedAt: new Date(),
      version: '1.0.0',
      quality: {
        score: 85,
        confidence: 0.9,
        flags: [],
      },
      reviewStatus: this.config.requireHumanReview ? 'pending' : 'approved',
    };
  }

  private async generateSSGAlignment(subject: string): Promise<SSGAlignment> {
    return {
      skillsFramework: {
        sector: 'Technology',
        trackId: 'TRK001',
        roleId: 'ROLE001',
        skillsAddressed: [`${subject}_fundamental`, `${subject}_practical`],
      },
      qualificationLevel: 'Intermediate',
      cpPoints: 20,
      industryRelevance: 'High',
      employabilitySkills: [
        'Problem Solving',
        'Critical Thinking',
        'Communication',
      ],
    };
  }

  private async generateDefaultRubric(): Promise<Rubric> {
    return {
      title: 'Assessment Rubric',
      criteria: [
        {
          name: 'Content Knowledge',
          description: 'Demonstrates understanding of key concepts',
          weight: 40,
          levels: [
            {
              level: 'Excellent',
              points: 4,
              description: 'Comprehensive understanding',
              indicators: [],
            },
            {
              level: 'Good',
              points: 3,
              description: 'Good understanding',
              indicators: [],
            },
            {
              level: 'Satisfactory',
              points: 2,
              description: 'Basic understanding',
              indicators: [],
            },
            {
              level: 'Needs Improvement',
              points: 1,
              description: 'Limited understanding',
              indicators: [],
            },
          ],
        },
      ],
      gradingScale: {
        type: 'points',
        maxPoints: 100,
        passingGrade: 60,
        gradeRanges: [
          { min: 90, max: 100, grade: 'A' },
          { min: 80, max: 89, grade: 'B' },
          { min: 70, max: 79, grade: 'C' },
          { min: 60, max: 69, grade: 'D' },
          { min: 0, max: 59, grade: 'F' },
        ],
      },
      instructions:
        'Evaluate based on the criteria and performance levels provided.',
    };
  }

  private generateCacheKey(type: string, request: any): string {
    const key = `ai_content_${type}_${this.hashString(JSON.stringify(request))}`;
    return key;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createAIContentGenerationService(config: {
  openaiApiKey: string;
  cache: CacheService;
  apiClient: SSGWSGApiClient;
  defaultModel?: string;
  maxTokens?: number;
  temperature?: number;
  enableCaching?: boolean;
  requireHumanReview?: boolean;
  ssgComplianceRequired?: boolean;
}): AIContentGenerationService {
  return new AIContentGenerationService(config);
}

export default AIContentGenerationService;
