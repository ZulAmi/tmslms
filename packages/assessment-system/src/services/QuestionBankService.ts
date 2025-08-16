import { EventEmitter } from 'events';
import { z } from 'zod';
import {
  Question,
  QuestionBank,
  QuestionType,
  DifficultyLevel,
  CognitiveDomain,
  QuestionCategory,
  QuestionTag,
  QuestionContent,
  QuestionAnalytics,
  UUID,
} from '../types';

// Add DOM parser polyfill for Node.js environments
const getDOMParser = () => {
  // For Node.js environments, we'll use a simplified XML parser
  // In production, you would install and use 'xmldom' or similar
  return {
    parseFromString: (xmlString: string, contentType: string) => ({
      querySelector: (selector: string) => {
        // Very basic querySelector implementation for QTI parsing
        if (selector === 'assessmentItem') {
          const match = xmlString.match(/<assessmentItem[^>]*>/);
          return match
            ? {
                querySelector: (innerSelector: string) => {
                  if (
                    innerSelector.includes('prompt') ||
                    innerSelector.includes('itemBody p')
                  ) {
                    const promptMatch = xmlString.match(
                      /<(?:prompt|p)[^>]*>(.*?)<\/(?:prompt|p)>/
                    );
                    return promptMatch ? { textContent: promptMatch[1] } : null;
                  }
                  return null;
                },
              }
            : null;
        }
        return null;
      },
    }),
  } as any;
};

export interface QuestionSearchCriteria {
  tags?: string[];
  categories?: string[];
  subject?: string;
  topic?: string;
  difficulty?: DifficultyLevel[];
  type?: QuestionType[];
  cognitiveDomain?: CognitiveDomain[];
  keywords?: string;
  learningObjectives?: string[];
  minPoints?: number;
  maxPoints?: number;
  hasAnalytics?: boolean;
  qualityThreshold?: number;
  excludeIds?: UUID[];
  limit?: number;
  offset?: number;
}

export interface QuestionImportResult {
  imported: number;
  failed: number;
  errors: Array<{ index: number; error: string; question?: Partial<Question> }>;
  duplicates: number;
  updated: number;
}

export interface QuestionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface QuestionBankStatistics {
  totalQuestions: number;
  byType: Record<QuestionType, number>;
  byDifficulty: Record<DifficultyLevel, number>;
  byCognitiveDomain: Record<CognitiveDomain, number>;
  bySubject: Record<string, number>;
  averageQuality: number;
  flaggedQuestions: number;
  lastUpdated: Date;
}

export class QuestionBankService extends EventEmitter {
  private questions: Map<UUID, Question> = new Map();
  private banks: Map<UUID, QuestionBank> = new Map();
  private categories: Map<string, QuestionCategory> = new Map();
  private tags: Map<string, QuestionTag> = new Map();
  private searchIndex: Map<string, Set<UUID>> = new Map();

  constructor() {
    super();
    this.initializeSearchIndex();
  }

  // ============================================================================
  // QUESTION MANAGEMENT
  // ============================================================================

  async createQuestion(questionData: Partial<Question>): Promise<Question> {
    const validation = await this.validateQuestion(questionData);
    if (!validation.valid) {
      throw new Error(
        `Question validation failed: ${validation.errors.join(', ')}`
      );
    }

    const question: Question = {
      id: this.generateId(),
      title: questionData.title!,
      content: questionData.content!,
      points: questionData.points || 1,
      timeLimit: questionData.timeLimit,
      difficulty: questionData.difficulty || DifficultyLevel.MEDIUM,
      cognitiveDomain:
        questionData.cognitiveDomain || CognitiveDomain.KNOWLEDGE,
      tags: questionData.tags || [],
      categories: questionData.categories || [],
      subject: questionData.subject!,
      topic: questionData.topic!,
      learningObjectives: questionData.learningObjectives || [],
      prerequisites: questionData.prerequisites,
      metadata: {
        estimatedTime: this.estimateTime(questionData.content!),
        keywordDensity: this.calculateKeywordDensity(questionData.content!),
        readabilityScore: this.calculateReadability(questionData.content!),
        complexity: this.calculateComplexity(questionData.content!),
        source: questionData.metadata?.source,
        authorNotes: questionData.metadata?.authorNotes,
        reviewNotes: questionData.metadata?.reviewNotes,
        translations: questionData.metadata?.translations || {},
      },
      analytics: this.initializeAnalytics(),
      version: 1,
      status: 'draft',
      createdBy: questionData.createdBy!,
      updatedBy: questionData.createdBy!,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.questions.set(question.id, question);
    this.updateSearchIndex(question);
    this.updateTagUsage(question.tags);

    this.emit('questionCreated', question);
    return question;
  }

  async updateQuestion(
    id: UUID,
    updates: Partial<Question>
  ): Promise<Question> {
    const existing = this.questions.get(id);
    if (!existing) {
      throw new Error(`Question not found: ${id}`);
    }

    const validation = await this.validateQuestion({ ...existing, ...updates });
    if (!validation.valid) {
      throw new Error(
        `Question validation failed: ${validation.errors.join(', ')}`
      );
    }

    const updated: Question = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      updatedAt: new Date(),
    };

    this.questions.set(id, updated);
    this.updateSearchIndex(updated);
    this.updateTagUsage(updated.tags);

    this.emit('questionUpdated', updated, existing);
    return updated;
  }

  async deleteQuestion(id: UUID): Promise<boolean> {
    const question = this.questions.get(id);
    if (!question) {
      return false;
    }

    // Check if question is used in assessments
    const isUsed = await this.isQuestionInUse(id);
    if (isUsed) {
      throw new Error('Cannot delete question that is currently in use');
    }

    this.questions.delete(id);
    this.removeFromSearchIndex(question);

    this.emit('questionDeleted', question);
    return true;
  }

  async getQuestion(id: UUID): Promise<Question | null> {
    return this.questions.get(id) || null;
  }

  async archiveQuestion(id: UUID): Promise<Question> {
    const question = this.questions.get(id);
    if (!question) {
      throw new Error(`Question not found: ${id}`);
    }

    const archived = await this.updateQuestion(id, { status: 'archived' });
    this.emit('questionArchived', archived);
    return archived;
  }

  async duplicateQuestion(
    id: UUID,
    modifications?: Partial<Question>
  ): Promise<Question> {
    const original = this.questions.get(id);
    if (!original) {
      throw new Error(`Question not found: ${id}`);
    }

    const duplicate = await this.createQuestion({
      ...original,
      id: undefined, // Will be generated
      title: `${original.title} (Copy)`,
      version: 1,
      status: 'draft',
      createdAt: undefined,
      updatedAt: undefined,
      ...modifications,
    });

    this.emit('questionDuplicated', duplicate, original);
    return duplicate;
  }

  // ============================================================================
  // QUESTION SEARCH & FILTERING
  // ============================================================================

  async searchQuestions(criteria: QuestionSearchCriteria): Promise<Question[]> {
    let results = Array.from(this.questions.values());

    // Apply filters
    if (criteria.tags?.length) {
      results = results.filter((q) =>
        criteria.tags!.some((tag) => q.tags.includes(tag))
      );
    }

    if (criteria.categories?.length) {
      results = results.filter((q) =>
        criteria.categories!.some((cat) => q.categories.includes(cat))
      );
    }

    if (criteria.subject) {
      results = results.filter((q) =>
        q.subject.toLowerCase().includes(criteria.subject!.toLowerCase())
      );
    }

    if (criteria.topic) {
      results = results.filter((q) =>
        q.topic.toLowerCase().includes(criteria.topic!.toLowerCase())
      );
    }

    if (criteria.difficulty?.length) {
      results = results.filter((q) =>
        criteria.difficulty!.includes(q.difficulty)
      );
    }

    if (criteria.type?.length) {
      results = results.filter((q) => criteria.type!.includes(q.content.type));
    }

    if (criteria.cognitiveDomain?.length) {
      results = results.filter((q) =>
        criteria.cognitiveDomain!.includes(q.cognitiveDomain)
      );
    }

    if (criteria.keywords) {
      const keywords = criteria.keywords.toLowerCase().split(/\s+/);
      results = results.filter((q) =>
        keywords.some(
          (keyword) =>
            q.title.toLowerCase().includes(keyword) ||
            q.content.text.toLowerCase().includes(keyword) ||
            q.tags.some((tag) => tag.toLowerCase().includes(keyword))
        )
      );
    }

    if (criteria.learningObjectives?.length) {
      results = results.filter((q) =>
        criteria.learningObjectives!.some((obj) =>
          q.learningObjectives.includes(obj)
        )
      );
    }

    if (criteria.minPoints !== undefined) {
      results = results.filter((q) => q.points >= criteria.minPoints!);
    }

    if (criteria.maxPoints !== undefined) {
      results = results.filter((q) => q.points <= criteria.maxPoints!);
    }

    if (criteria.qualityThreshold !== undefined) {
      results = results.filter(
        (q) => this.calculateQuestionQuality(q) >= criteria.qualityThreshold!
      );
    }

    if (criteria.excludeIds?.length) {
      results = results.filter((q) => !criteria.excludeIds!.includes(q.id));
    }

    // Apply pagination
    const offset = criteria.offset || 0;
    const limit = criteria.limit || 50;

    return results
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(offset, offset + limit);
  }

  async getQuestionsByBank(bankId: UUID): Promise<Question[]> {
    const bank = this.banks.get(bankId);
    if (!bank) {
      throw new Error(`Question bank not found: ${bankId}`);
    }

    return bank.questions;
  }

  async getRandomQuestions(
    count: number,
    criteria?: QuestionSearchCriteria
  ): Promise<Question[]> {
    const available = await this.searchQuestions({
      ...criteria,
      limit: undefined,
      offset: undefined,
    });

    if (available.length <= count) {
      return available;
    }

    // Fisher-Yates shuffle
    const shuffled = [...available];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }

  // ============================================================================
  // QUESTION BANK MANAGEMENT
  // ============================================================================

  async createQuestionBank(
    bankData: Partial<QuestionBank>
  ): Promise<QuestionBank> {
    const bank: QuestionBank = {
      id: this.generateId(),
      name: bankData.name!,
      description: bankData.description || '',
      questions: bankData.questions || [],
      categories: bankData.categories || [],
      tags: bankData.tags || [],
      permissions: bankData.permissions || {
        viewers: [],
        editors: [],
        administrators: [],
        isPublic: false,
      },
      metadata: {
        totalQuestions: 0,
        subjectDistribution: {},
        difficultyDistribution: {} as Record<DifficultyLevel, number>,
        typeDistribution: {} as Record<QuestionType, number>,
        qualityScore: 0,
        lastQualityCheck: new Date(),
      },
      createdBy: bankData.createdBy!,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.banks.set(bank.id, bank);
    this.updateBankMetadata(bank.id);

    this.emit('bankCreated', bank);
    return bank;
  }

  async addQuestionToBank(bankId: UUID, questionId: UUID): Promise<void> {
    const bank = this.banks.get(bankId);
    const question = this.questions.get(questionId);

    if (!bank) {
      throw new Error(`Question bank not found: ${bankId}`);
    }
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    if (bank.questions.some((q) => q.id === questionId)) {
      throw new Error('Question already in bank');
    }

    bank.questions.push(question);
    bank.updatedAt = new Date();
    this.updateBankMetadata(bankId);

    this.emit('questionAddedToBank', bank, question);
  }

  async removeQuestionFromBank(bankId: UUID, questionId: UUID): Promise<void> {
    const bank = this.banks.get(bankId);
    if (!bank) {
      throw new Error(`Question bank not found: ${bankId}`);
    }

    const index = bank.questions.findIndex((q) => q.id === questionId);
    if (index === -1) {
      throw new Error('Question not in bank');
    }

    const question = bank.questions[index];
    bank.questions.splice(index, 1);
    bank.updatedAt = new Date();
    this.updateBankMetadata(bankId);

    this.emit('questionRemovedFromBank', bank, question);
  }

  // ============================================================================
  // IMPORT/EXPORT
  // ============================================================================

  async importQuestions(
    data: any[],
    format: 'json' | 'qti' | 'csv' | 'xlsx',
    options?: { bankId?: UUID; validateOnly?: boolean }
  ): Promise<QuestionImportResult> {
    const result: QuestionImportResult = {
      imported: 0,
      failed: 0,
      errors: [],
      duplicates: 0,
      updated: 0,
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const questionData = await this.parseImportData(data[i], format);

        if (options?.validateOnly) {
          const validation = await this.validateQuestion(questionData);
          if (!validation.valid) {
            result.errors.push({
              index: i,
              error: validation.errors.join(', '),
              question: questionData,
            });
            result.failed++;
          }
          continue;
        }

        // Check for duplicates
        const existing = await this.findDuplicateQuestion(questionData);
        if (existing) {
          result.duplicates++;
          continue;
        }

        const question = await this.createQuestion(questionData);

        if (options?.bankId) {
          await this.addQuestionToBank(options.bankId, question.id);
        }

        result.imported++;
      } catch (error) {
        result.errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
          question: data[i],
        });
        result.failed++;
      }
    }

    this.emit('questionsImported', result);
    return result;
  }

  async exportQuestions(
    questionIds: UUID[],
    format: 'json' | 'qti' | 'csv' | 'xlsx'
  ): Promise<any> {
    const questions = await Promise.all(
      questionIds.map((id) => this.getQuestion(id))
    );

    const validQuestions = questions.filter((q) => q !== null) as Question[];

    switch (format) {
      case 'json':
        return this.exportToJSON(validQuestions);
      case 'qti':
        return this.exportToQTI(validQuestions);
      case 'csv':
        return this.exportToCSV(validQuestions);
      case 'xlsx':
        return this.exportToXLSX(validQuestions);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // ============================================================================
  // ANALYTICS & QUALITY
  // ============================================================================

  async updateQuestionAnalytics(
    questionId: UUID,
    responseData: {
      correct: boolean;
      responseTime: number;
      participantAbility?: number;
    }
  ): Promise<void> {
    const question = this.questions.get(questionId);
    if (!question) {
      return;
    }

    const analytics = question.analytics;
    analytics.timesUsed++;

    // Update average response time
    const totalTime = analytics.avgResponseTime * (analytics.timesUsed - 1);
    analytics.avgResponseTime =
      (totalTime + responseData.responseTime) / analytics.timesUsed;

    // Update difficulty index (p-value)
    const correctResponses =
      analytics.difficultyIndex * (analytics.timesUsed - 1);
    const newCorrectResponses =
      correctResponses + (responseData.correct ? 1 : 0);
    analytics.difficultyIndex = newCorrectResponses / analytics.timesUsed;

    // Update other metrics
    if (responseData.participantAbility !== undefined) {
      analytics.discriminationIndex = this.calculateDiscrimination(
        question.id,
        responseData.participantAbility,
        responseData.correct
      );
    }

    analytics.lastAnalyzed = new Date();

    this.questions.set(questionId, question);
    this.emit('analyticsUpdated', question);
  }

  async analyzeQuestionQuality(questionId: UUID): Promise<{
    quality: number;
    issues: string[];
    recommendations: string[];
  }> {
    const question = this.questions.get(questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    const quality = this.calculateQuestionQuality(question);
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check difficulty index
    if (question.analytics.difficultyIndex < 0.2) {
      issues.push('Question may be too difficult');
      recommendations.push('Consider revising question or providing hints');
    } else if (question.analytics.difficultyIndex > 0.9) {
      issues.push('Question may be too easy');
      recommendations.push('Consider increasing difficulty or complexity');
    }

    // Check discrimination
    if (question.analytics.discriminationIndex < 0.2) {
      issues.push(
        'Poor discrimination - does not differentiate between high and low performers'
      );
      recommendations.push(
        'Review distractors and ensure clear correct answer'
      );
    }

    // Check usage
    if (question.analytics.timesUsed < 10) {
      issues.push('Insufficient usage data for reliable statistics');
      recommendations.push(
        'Collect more response data before making decisions'
      );
    }

    // Content quality checks
    if (question.content.text.length < 10) {
      issues.push('Question text is very short');
      recommendations.push('Provide more context or detail');
    }

    if (question.metadata.readabilityScore < 40) {
      issues.push('Question may be difficult to read');
      recommendations.push('Simplify language and sentence structure');
    }

    return { quality, issues, recommendations };
  }

  getBankStatistics(bankId: UUID): QuestionBankStatistics {
    const bank = this.banks.get(bankId);
    if (!bank) {
      throw new Error(`Question bank not found: ${bankId}`);
    }

    const stats: QuestionBankStatistics = {
      totalQuestions: bank.questions.length,
      byType: {} as Record<QuestionType, number>,
      byDifficulty: {} as Record<DifficultyLevel, number>,
      byCognitiveDomain: {} as Record<CognitiveDomain, number>,
      bySubject: {},
      averageQuality: 0,
      flaggedQuestions: 0,
      lastUpdated: bank.updatedAt,
    };

    // Initialize counters
    Object.values(QuestionType).forEach((type) => {
      stats.byType[type] = 0;
    });
    Object.values(DifficultyLevel).forEach((level) => {
      if (typeof level === 'number') {
        stats.byDifficulty[level as DifficultyLevel] = 0;
      }
    });
    Object.values(CognitiveDomain).forEach((domain) => {
      stats.byCognitiveDomain[domain] = 0;
    });

    let totalQuality = 0;

    bank.questions.forEach((question) => {
      stats.byType[question.content.type]++;
      stats.byDifficulty[question.difficulty]++;
      stats.byCognitiveDomain[question.cognitiveDomain]++;

      if (!stats.bySubject[question.subject]) {
        stats.bySubject[question.subject] = 0;
      }
      stats.bySubject[question.subject]++;

      const quality = this.calculateQuestionQuality(question);
      totalQuality += quality;

      if (quality < 0.5) {
        stats.flaggedQuestions++;
      }
    });

    stats.averageQuality =
      bank.questions.length > 0 ? totalQuality / bank.questions.length : 0;

    return stats;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private initializeSearchIndex(): void {
    // Initialize empty search index
    this.searchIndex.clear();
  }

  private updateSearchIndex(question: Question): void {
    // Add question to search indices
    const keywords = [
      ...question.title.toLowerCase().split(/\s+/),
      ...question.content.text.toLowerCase().split(/\s+/),
      ...question.tags.map((tag) => tag.toLowerCase()),
      ...question.categories.map((cat) => cat.toLowerCase()),
      question.subject.toLowerCase(),
      question.topic.toLowerCase(),
    ];

    keywords.forEach((keyword) => {
      if (!this.searchIndex.has(keyword)) {
        this.searchIndex.set(keyword, new Set());
      }
      this.searchIndex.get(keyword)!.add(question.id);
    });
  }

  private removeFromSearchIndex(question: Question): void {
    this.searchIndex.forEach((questionIds, keyword) => {
      questionIds.delete(question.id);
      if (questionIds.size === 0) {
        this.searchIndex.delete(keyword);
      }
    });
  }

  private updateTagUsage(tags: string[]): void {
    tags.forEach((tagName) => {
      const existing = this.tags.get(tagName);
      if (existing) {
        existing.usageCount++;
      } else {
        this.tags.set(tagName, {
          id: tagName,
          name: tagName,
          description: '',
          color: this.generateTagColor(),
          usageCount: 1,
        });
      }
    });
  }

  private updateBankMetadata(bankId: UUID): void {
    const bank = this.banks.get(bankId);
    if (!bank) return;

    const metadata = bank.metadata;
    metadata.totalQuestions = bank.questions.length;
    metadata.subjectDistribution = {};
    metadata.difficultyDistribution = {} as Record<DifficultyLevel, number>;
    metadata.typeDistribution = {} as Record<QuestionType, number>;

    let totalQuality = 0;

    bank.questions.forEach((question) => {
      // Subject distribution
      if (!metadata.subjectDistribution[question.subject]) {
        metadata.subjectDistribution[question.subject] = 0;
      }
      metadata.subjectDistribution[question.subject]++;

      // Difficulty distribution
      if (!metadata.difficultyDistribution[question.difficulty]) {
        metadata.difficultyDistribution[question.difficulty] = 0;
      }
      metadata.difficultyDistribution[question.difficulty]++;

      // Type distribution
      if (!metadata.typeDistribution[question.content.type]) {
        metadata.typeDistribution[question.content.type] = 0;
      }
      metadata.typeDistribution[question.content.type]++;

      totalQuality += this.calculateQuestionQuality(question);
    });

    metadata.qualityScore =
      bank.questions.length > 0 ? totalQuality / bank.questions.length : 0;
    metadata.lastQualityCheck = new Date();
  }

  private async validateQuestion(
    questionData: Partial<Question>
  ): Promise<QuestionValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Required fields
    if (!questionData.title) {
      errors.push('Question title is required');
    }
    if (!questionData.content) {
      errors.push('Question content is required');
    }
    if (!questionData.subject) {
      errors.push('Subject is required');
    }
    if (!questionData.topic) {
      errors.push('Topic is required');
    }

    // Content validation
    if (questionData.content) {
      const contentValidation = await this.validateQuestionContent(
        questionData.content
      );
      errors.push(...contentValidation.errors);
      warnings.push(...contentValidation.warnings);
      suggestions.push(...contentValidation.suggestions);
    }

    // Points validation
    if (questionData.points !== undefined && questionData.points <= 0) {
      errors.push('Points must be greater than 0');
    }

    // Time limit validation
    if (questionData.timeLimit !== undefined && questionData.timeLimit <= 0) {
      errors.push('Time limit must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  private async validateQuestionContent(
    content: QuestionContent
  ): Promise<QuestionValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic content validation
    if (!content.text || content.text.trim().length === 0) {
      errors.push('Question text cannot be empty');
    }

    // Type-specific validation
    switch (content.type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.SINGLE_CHOICE:
        const mcContent = content as any; // Type assertion for brevity
        if (!mcContent.options || mcContent.options.length < 2) {
          errors.push('Multiple choice questions must have at least 2 options');
        }
        if (
          !mcContent.correctAnswers ||
          mcContent.correctAnswers.length === 0
        ) {
          errors.push('Must specify at least one correct answer');
        }
        break;

      case QuestionType.ESSAY:
        const essayContent = content as any;
        if (essayContent.wordLimit && essayContent.wordLimit < 10) {
          warnings.push('Word limit seems very low for an essay question');
        }
        break;

      case QuestionType.CODE_EVALUATION:
        const codeContent = content as any;
        if (!codeContent.language) {
          errors.push('Programming language must be specified');
        }
        if (!codeContent.testCases || codeContent.testCases.length === 0) {
          errors.push('Code evaluation questions must have test cases');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  private estimateTime(content: QuestionContent): number {
    const baseTime = 30; // seconds
    const textLength = content.text.length;
    const readingTime = Math.ceil(textLength / 200) * 15; // ~200 chars per 15 seconds

    let typeMultiplier = 1;
    switch (content.type) {
      case QuestionType.ESSAY:
        typeMultiplier = 5;
        break;
      case QuestionType.CODE_EVALUATION:
        typeMultiplier = 10;
        break;
      case QuestionType.VIDEO_RESPONSE:
      case QuestionType.AUDIO_RESPONSE:
        typeMultiplier = 3;
        break;
      default:
        typeMultiplier = 1;
    }

    return baseTime + readingTime * typeMultiplier;
  }

  private calculateKeywordDensity(
    content: QuestionContent
  ): Record<string, number> {
    const text = content.text.toLowerCase();
    const words = text.split(/\s+/).filter((word) => word.length > 3);
    const wordCount = words.length;
    const frequency: Record<string, number> = {};

    words.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Convert to density (percentage)
    const density: Record<string, number> = {};
    Object.entries(frequency).forEach(([word, count]) => {
      density[word] = (count / wordCount) * 100;
    });

    return density;
  }

  private calculateReadability(content: QuestionContent): number {
    // Simplified Flesch Reading Ease score
    const text = content.text;
    const sentences = text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;
    const words = text.split(/\s+/).filter((w) => w.length > 0).length;
    const syllables = this.countSyllables(text);

    if (sentences === 0 || words === 0) return 0;

    const score =
      206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Math.max(0, Math.min(100, score));
  }

  private calculateComplexity(content: QuestionContent): number {
    let complexity = 1;

    // Type-based complexity
    switch (content.type) {
      case QuestionType.TRUE_FALSE:
        complexity = 1;
        break;
      case QuestionType.MULTIPLE_CHOICE:
        complexity = 2;
        break;
      case QuestionType.SHORT_ANSWER:
        complexity = 3;
        break;
      case QuestionType.ESSAY:
        complexity = 4;
        break;
      case QuestionType.CODE_EVALUATION:
        complexity = 5;
        break;
      default:
        complexity = 2;
    }

    // Adjust for content features
    if (content.media && content.media.length > 0) {
      complexity += 0.5;
    }

    return complexity;
  }

  private countSyllables(text: string): number {
    // Simplified syllable counting
    const words = text.toLowerCase().split(/\s+/);
    let totalSyllables = 0;

    words.forEach((word) => {
      const cleaned = word.replace(/[^a-z]/g, '');
      if (cleaned.length === 0) return;

      let syllables = 0;
      let previousWasVowel = false;

      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        const isVowel = 'aeiou'.includes(char);

        if (isVowel && !previousWasVowel) {
          syllables++;
        }
        previousWasVowel = isVowel;
      }

      // Handle silent 'e'
      if (cleaned.endsWith('e') && syllables > 1) {
        syllables--;
      }

      // Minimum one syllable per word
      syllables = Math.max(1, syllables);
      totalSyllables += syllables;
    });

    return totalSyllables;
  }

  private initializeAnalytics(): QuestionAnalytics {
    return {
      timesUsed: 0,
      avgResponseTime: 0,
      difficultyIndex: 0,
      discriminationIndex: 0,
      reliabilityContribution: 0,
      responseDistribution: {},
      commonMistakes: [],
      improvementSuggestions: [],
      lastAnalyzed: new Date(),
    };
  }

  private calculateQuestionQuality(question: Question): number {
    let quality = 0.5; // Base quality

    const analytics = question.analytics;

    // Difficulty index contribution (target 0.5-0.8)
    if (analytics.difficultyIndex >= 0.5 && analytics.difficultyIndex <= 0.8) {
      quality += 0.2;
    } else if (
      analytics.difficultyIndex >= 0.3 &&
      analytics.difficultyIndex <= 0.9
    ) {
      quality += 0.1;
    }

    // Discrimination contribution (higher is better)
    quality += Math.min(0.3, analytics.discriminationIndex);

    // Usage contribution (more usage = more reliable)
    if (analytics.timesUsed >= 50) {
      quality += 0.1;
    } else if (analytics.timesUsed >= 10) {
      quality += 0.05;
    }

    // Content quality
    if (question.metadata.readabilityScore >= 60) {
      quality += 0.1;
    }

    return Math.max(0, Math.min(1, quality));
  }

  private calculateDiscrimination(
    questionId: UUID,
    participantAbility: number,
    correct: boolean
  ): number {
    // Simplified point-biserial correlation calculation
    // In practice, this would use historical data
    return Math.random() * 0.6 + 0.2; // Placeholder
  }

  private async isQuestionInUse(questionId: UUID): Promise<boolean> {
    // Check if question is used in any assessments
    // This would typically query the assessment service
    return false; // Placeholder
  }

  private async findDuplicateQuestion(
    questionData: Partial<Question>
  ): Promise<Question | null> {
    // Simple duplicate detection based on title and content
    for (const question of this.questions.values()) {
      if (
        question.title === questionData.title &&
        question.content.text === questionData.content?.text
      ) {
        return question;
      }
    }
    return null;
  }

  private async parseImportData(
    data: any,
    format: string
  ): Promise<Partial<Question>> {
    // Parse different import formats
    switch (format) {
      case 'json':
        return data;
      case 'qti':
        return this.parseQTI(data);
      case 'csv':
        return this.parseCSV(data);
      case 'xlsx':
        return this.parseXLSX(data);
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
  }

  private parseQTI(data: string): Partial<Question> {
    // Basic QTI parsing - simplified implementation
    try {
      // Extract basic question text from QTI XML
      const questionMatch = data.match(
        /<prompt[^>]*>(.*?)<\/prompt>|<itemBody[^>]*>(.*?)<\/itemBody>/s
      );
      const questionText = questionMatch
        ? (questionMatch[1] || questionMatch[2])?.replace(/<[^>]*>/g, '').trim()
        : 'Imported Question';

      // Determine question type
      let type = QuestionType.ESSAY;
      let content: any = {
        type: QuestionType.ESSAY,
        text: questionText,
      };

      if (data.includes('<choiceInteraction')) {
        type = QuestionType.MULTIPLE_CHOICE;
        const choiceMatches = data.match(
          /<simpleChoice[^>]*>(.*?)<\/simpleChoice>/g
        );
        const options = choiceMatches
          ? choiceMatches.map((choice, index) => ({
              id: `option_${index}`,
              text: choice.replace(/<[^>]*>/g, '').trim(),
              correct: index === 0, // Simplified: assume first option is correct
            }))
          : [];

        content = {
          type: QuestionType.MULTIPLE_CHOICE,
          text: questionText,
          options,
          correctAnswers: options
            .filter((opt) => opt.correct)
            .map((opt) => opt.id),
          allowMultiple: false,
          randomizeOptions: false,
        };
      } else if (data.includes('<textEntryInteraction')) {
        type = QuestionType.SHORT_ANSWER;
        const answerMatch = data.match(
          /<correctResponse[^>]*>.*?<value[^>]*>(.*?)<\/value>/s
        );
        content = {
          type: QuestionType.SHORT_ANSWER,
          text: questionText,
          acceptedAnswers: answerMatch ? [answerMatch[1].trim()] : [],
          caseSensitive: false,
          exactMatch: false,
          partialCredit: false,
        };
      }

      return {
        id: this.generateId(),
        title:
          questionText.substring(0, 50) +
          (questionText.length > 50 ? '...' : ''),
        content,
        points: 1,
        difficulty: DifficultyLevel.MEDIUM,
        cognitiveDomain: CognitiveDomain.KNOWLEDGE,
        tags: [],
        categories: [],
        subject: 'Imported',
        topic: 'General',
        learningObjectives: [],
      };
    } catch (error) {
      throw new Error(
        `Failed to parse QTI: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private parseCSV(data: string): Partial<Question> {
    // Basic CSV parsing - expect single question format
    try {
      const lines = data.split('\n').filter((line) => line.trim());
      if (lines.length < 2) throw new Error('CSV must have header and data');

      const values = lines[1].split(',').map((v) => v.trim().replace(/"/g, ''));
      const questionText = values[1] || 'Imported Question';
      const questionType = this.mapCSVTypeToQuestionType(
        values[0] || 'multiple-choice'
      );

      let content: any = {
        type: questionType,
        text: questionText,
      };

      if (questionType === QuestionType.MULTIPLE_CHOICE) {
        const options = values
          .slice(2, 6)
          .filter((v) => v)
          .map((optionText, index) => ({
            id: `option_${index}`,
            text: optionText,
            correct: optionText === values[6], // Check if matches correct answer
          }));

        content = {
          type: QuestionType.MULTIPLE_CHOICE,
          text: questionText,
          options,
          correctAnswers: options
            .filter((opt) => opt.correct)
            .map((opt) => opt.id),
          allowMultiple: false,
          randomizeOptions: false,
        };
      } else if (questionType === QuestionType.SHORT_ANSWER) {
        content = {
          type: QuestionType.SHORT_ANSWER,
          text: questionText,
          acceptedAnswers: values[6] ? [values[6]] : [],
          caseSensitive: false,
          exactMatch: false,
          partialCredit: false,
        };
      }

      return {
        id: this.generateId(),
        title:
          questionText.substring(0, 50) +
          (questionText.length > 50 ? '...' : ''),
        content,
        points: values[7] ? parseFloat(values[7]) : 1,
        difficulty: DifficultyLevel.MEDIUM,
        cognitiveDomain: CognitiveDomain.KNOWLEDGE,
        tags: [],
        categories: [],
        subject: 'Imported',
        topic: 'General',
        learningObjectives: [],
      };
    } catch (error) {
      throw new Error(
        `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private parseXLSX(data: ArrayBuffer): Partial<Question> {
    // Basic XLSX parsing - convert to text and parse as CSV
    try {
      const decoder = new TextDecoder();
      const text = decoder.decode(data);
      // Simplified approach - treat as CSV-like data
      return this.parseCSV(text);
    } catch (error) {
      throw new Error(
        `Failed to parse XLSX: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private exportToJSON(questions: Question[]): string {
    return JSON.stringify(
      {
        format: 'TMSLMS_QUESTIONS_v1.0',
        exportDate: new Date().toISOString(),
        questions: questions.map((q) => ({
          id: q.id,
          title: q.title,
          content: q.content,
          points: q.points,
          difficulty: q.difficulty,
          cognitiveDomain: q.cognitiveDomain,
          tags: q.tags,
          categories: q.categories,
          subject: q.subject,
          topic: q.topic,
          learningObjectives: q.learningObjectives,
          metadata: q.metadata,
        })),
      },
      null,
      2
    );
  }

  private exportToQTI(questions: Question[]): string {
    // QTI 2.1 export implementation
    const qtiItems = questions.map((q) => this.questionToQTI(q)).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd"
                identifier="TEST_${Date.now()}" title="Exported Test">
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"/>
  <testPart identifier="testPart1" navigationMode="linear" submissionMode="individual">
    <assessmentSection identifier="section1" title="Questions" visible="true">
      ${qtiItems}
    </assessmentSection>
  </testPart>
</assessmentTest>`;
  }

  private exportToCSV(questions: Question[]): string {
    // CSV export implementation
    const headers = [
      'Type',
      'Question',
      'Option1',
      'Option2',
      'Option3',
      'Option4',
      'CorrectAnswer',
      'Points',
      'Explanation',
    ];
    const rows = [headers.join(',')];

    questions.forEach((q) => {
      const questionType = this.getQuestionTypeFromContent(q.content);
      const questionText = q.content.text;
      const options = this.getOptionsFromContent(q.content);
      const correctAnswer = this.getCorrectAnswerFromContent(q.content);

      const row = [
        this.questionTypeToCSVType(questionType),
        `"${questionText.replace(/"/g, '""')}"`,
        options[0] ? `"${options[0].replace(/"/g, '""')}"` : '',
        options[1] ? `"${options[1].replace(/"/g, '""')}"` : '',
        options[2] ? `"${options[2].replace(/"/g, '""')}"` : '',
        options[3] ? `"${options[3].replace(/"/g, '""')}"` : '',
        correctAnswer ? `"${correctAnswer.replace(/"/g, '""')}"` : '',
        q.points.toString(),
        q.metadata.authorNotes
          ? `"${q.metadata.authorNotes.replace(/"/g, '""')}"`
          : '',
      ];
      rows.push(row.join(','));
    });

    return rows.join('\n');
  }

  private exportToXLSX(questions: Question[]): Uint8Array {
    // XLSX export implementation
    // For full XLSX support, you would use a library like 'xlsx'
    // This creates a basic CSV-like format that can be opened in Excel
    const csvData = this.exportToCSV(questions);

    // Convert CSV to a basic XLSX-like format (simplified)
    const encoder = new TextEncoder();
    return encoder.encode(csvData);
  }

  // Helper methods for import/export
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && (i === 0 || line[i - 1] === ',')) {
        inQuotes = true;
      } else if (
        char === '"' &&
        inQuotes &&
        (i === line.length - 1 || line[i + 1] === ',')
      ) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else if (char !== '"' || inQuotes) {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private mapCSVTypeToQuestionType(csvType: string): QuestionType {
    const type = csvType.toLowerCase().trim();
    switch (type) {
      case 'multiple-choice':
      case 'multiple_choice':
      case 'mc':
        return QuestionType.MULTIPLE_CHOICE;
      case 'true-false':
      case 'true_false':
      case 'tf':
      case 'boolean':
        return QuestionType.TRUE_FALSE;
      case 'short-answer':
      case 'short_answer':
      case 'short':
        return QuestionType.SHORT_ANSWER;
      case 'essay':
      case 'long-answer':
      case 'long_answer':
        return QuestionType.ESSAY;
      case 'matching':
      case 'match':
        return QuestionType.MATCHING;
      case 'drag-drop':
      case 'drag_drop':
        return QuestionType.DRAG_DROP;
      default:
        return QuestionType.MULTIPLE_CHOICE;
    }
  }

  private questionTypeToCSVType(type: QuestionType): string {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return 'multiple-choice';
      case QuestionType.TRUE_FALSE:
        return 'true-false';
      case QuestionType.SHORT_ANSWER:
        return 'short-answer';
      case QuestionType.ESSAY:
        return 'essay';
      case QuestionType.MATCHING:
        return 'matching';
      case QuestionType.DRAG_DROP:
        return 'drag-drop';
      default:
        return 'multiple-choice';
    }
  }

  // Helper methods for content extraction
  private getQuestionTypeFromContent(content: QuestionContent): QuestionType {
    return content.type;
  }

  private getOptionsFromContent(content: QuestionContent): string[] {
    if ('options' in content && content.options) {
      return content.options.map((opt) => opt.text);
    }
    return [];
  }

  private getCorrectAnswerFromContent(content: QuestionContent): string {
    if (
      'correctAnswers' in content &&
      content.correctAnswers &&
      content.correctAnswers.length > 0
    ) {
      if ('options' in content && content.options) {
        const correctOption = content.options.find(
          (opt) => opt.id === content.correctAnswers[0]
        );
        return correctOption?.text || '';
      }
      return String(content.correctAnswers[0]);
    }
    if ('correctAnswer' in content) {
      return String(content.correctAnswer);
    }
    if (
      'acceptedAnswers' in content &&
      content.acceptedAnswers &&
      content.acceptedAnswers.length > 0
    ) {
      return content.acceptedAnswers[0];
    }
    return '';
  }

  private formatCorrectAnswer(question: Question): string {
    return this.getCorrectAnswerFromContent(question.content);
  }

  private questionToQTI(question: Question): string {
    const itemId = `item_${question.id}`;
    const questionType = this.getQuestionTypeFromContent(question.content);
    const questionText = question.content.text;

    let interactionXml = '';
    let responseProcessingXml = '';

    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
        const options = this.getOptionsFromContent(question.content);
        interactionXml = `
        <choiceInteraction responseIdentifier="RESPONSE" shuffle="false" maxChoices="1">
          ${options
            .map(
              (option, index) =>
                `<simpleChoice identifier="choice_${index}">${this.escapeXml(option)}</simpleChoice>`
            )
            .join('')}
        </choiceInteraction>`;

        const correctAnswer = this.getCorrectAnswerFromContent(
          question.content
        );
        const correctIndex = options.indexOf(correctAnswer);

        responseProcessingXml = `
        <responseProcessing>
          <responseCondition>
            <responseIf>
              <match>
                <variable identifier="RESPONSE"/>
                <baseValue baseType="identifier">choice_${correctIndex >= 0 ? correctIndex : 0}</baseValue>
              </match>
              <setOutcomeValue identifier="SCORE">
                <baseValue baseType="float">${question.points}</baseValue>
              </setOutcomeValue>
            </responseIf>
            <responseElse>
              <setOutcomeValue identifier="SCORE">
                <baseValue baseType="float">0</baseValue>
              </setOutcomeValue>
            </responseElse>
          </responseCondition>
        </responseProcessing>`;
        break;

      case QuestionType.SHORT_ANSWER:
        interactionXml = `<textEntryInteraction responseIdentifier="RESPONSE"/>`;
        responseProcessingXml = `
        <responseProcessing>
          <responseCondition>
            <responseIf>
              <stringMatch caseSensitive="false">
                <variable identifier="RESPONSE"/>
                <baseValue baseType="string">${this.escapeXml(this.getCorrectAnswerFromContent(question.content))}</baseValue>
              </stringMatch>
              <setOutcomeValue identifier="SCORE">
                <baseValue baseType="float">${question.points}</baseValue>
              </setOutcomeValue>
            </responseIf>
            <responseElse>
              <setOutcomeValue identifier="SCORE">
                <baseValue baseType="float">0</baseValue>
              </setOutcomeValue>
            </responseElse>
          </responseCondition>
        </responseProcessing>`;
        break;

      default:
        interactionXml = `<extendedTextInteraction responseIdentifier="RESPONSE"/>`;
        responseProcessingXml = `
        <responseProcessing>
          <setOutcomeValue identifier="SCORE">
            <baseValue baseType="float">${question.points}</baseValue>
          </setOutcomeValue>
        </responseProcessing>`;
    }

    const explanation = question.metadata.authorNotes;

    return `
      <assessmentItemRef identifier="${itemId}" href="${itemId}.xml">
        <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                       identifier="${itemId}" title="${this.escapeXml(question.title)}"
                       adaptive="false" timeDependent="false">
          <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier"/>
          <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"/>
          <itemBody>
            <p>${this.escapeXml(questionText)}</p>
            ${interactionXml}
          </itemBody>
          ${responseProcessingXml}
          ${
            explanation
              ? `<modalFeedback outcomeIdentifier="SCORE" showHide="show">
            <p>${this.escapeXml(explanation)}</p>
          </modalFeedback>`
              : ''
          }
        </assessmentItem>
      </assessmentItemRef>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private convertXLSXToCSV(data: ArrayBuffer): string {
    // Simplified XLSX to CSV conversion
    // In a real implementation, you would use a library like 'xlsx'
    const decoder = new TextDecoder();
    try {
      // This is a very basic approach - assumes the XLSX is simple enough
      // Real implementation would parse the XLSX format properly
      return decoder.decode(data);
    } catch {
      throw new Error(
        'XLSX conversion not fully implemented - please use CSV format'
      );
    }
  }

  private generateId(): UUID {
    return require('crypto').randomUUID();
  }

  private generateTagColor(): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
