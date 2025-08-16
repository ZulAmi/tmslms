import { EventEmitter } from 'events';
import {
  Assessment,
  AssessmentType,
  AssessmentConfiguration,
  AssessmentQuestion,
  Question,
  AssessmentAttempt,
  AttemptStatus,
  QuestionResponse,
  CATConfiguration,
  CATSession,
  GradingConfiguration,
  GradingMethod,
  SecurityConfiguration,
  ProctoringConfiguration,
  AssessmentAnalytics,
  NotificationChannel,
  UUID,
  Timestamp,
} from '../types';

export interface AssessmentCreationData {
  title: string;
  description: string;
  instructions: string;
  type: AssessmentType;
  configuration: Partial<AssessmentConfiguration>;
  questions: Array<{
    questionId: UUID;
    points: number;
    required?: boolean;
    timeLimit?: number;
  }>;
  grading?: Partial<GradingConfiguration>;
  security?: Partial<SecurityConfiguration>;
  proctoring?: Partial<ProctoringConfiguration>;
}

export interface AssessmentSession {
  id: UUID;
  assessmentId: UUID;
  participantId: UUID;
  attemptId: UUID;
  currentQuestionIndex: number;
  startTime: Timestamp;
  lastActivity: Timestamp;
  timeRemaining?: number;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'expired';
  responses: Map<UUID, QuestionResponse>;
  catSession?: CATSession;
}

export interface AssessmentDeliveryConfig {
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  allowBackNavigation: boolean;
  showProgress: boolean;
  autoSave: boolean;
  adaptiveTesting: boolean;
  proctoringEnabled: boolean;
  securityLevel: 'low' | 'medium' | 'high';
}

export class AssessmentService extends EventEmitter {
  private assessments: Map<UUID, Assessment> = new Map();
  private attempts: Map<UUID, AssessmentAttempt> = new Map();
  private sessions: Map<UUID, AssessmentSession> = new Map();
  private analytics: Map<UUID, AssessmentAnalytics> = new Map();

  // Service dependencies (would be injected)
  private questionBankService: any;
  private catEngine: any;
  private gradingService: any;
  private securityService: any;
  private proctoringService: any;
  private analyticsService: any;

  constructor(services?: {
    questionBankService?: any;
    catEngine?: any;
    gradingService?: any;
    securityService?: any;
    proctoringService?: any;
    analyticsService?: any;
  }) {
    super();

    // Initialize service dependencies
    this.questionBankService = services?.questionBankService;
    this.catEngine = services?.catEngine;
    this.gradingService = services?.gradingService;
    this.securityService = services?.securityService;
    this.proctoringService = services?.proctoringService;
    this.analyticsService = services?.analyticsService;
  }

  // ============================================================================
  // ASSESSMENT MANAGEMENT
  // ============================================================================

  async createAssessment(
    data: AssessmentCreationData,
    createdBy: UUID
  ): Promise<Assessment> {
    const assessmentId = this.generateId();

    // Validate questions exist and are accessible
    await this.validateQuestions(data.questions.map((q) => q.questionId));

    // Build assessment questions
    const assessmentQuestions: AssessmentQuestion[] = data.questions.map(
      (q, index) => ({
        id: this.generateId(),
        questionId: q.questionId,
        position: index + 1,
        points: q.points,
        timeLimit: q.timeLimit,
        required: q.required || true,
        randomizeOptions: data.configuration.randomizeAnswers || false,
        conditions: [],
      })
    );

    // Create assessment configuration with defaults
    const configuration: AssessmentConfiguration = {
      timeLimit: data.configuration.timeLimit,
      attempts: data.configuration.attempts || 1,
      questionCount: data.questions.length,
      randomizeQuestions: data.configuration.randomizeQuestions || false,
      randomizeAnswers: data.configuration.randomizeAnswers || false,
      showProgress: data.configuration.showProgress !== false,
      allowBackNavigation: data.configuration.allowBackNavigation !== false,
      showCorrectAnswers:
        data.configuration.showCorrectAnswers || 'after_submission',
      showScore: data.configuration.showScore || 'immediately',
      passingScore: data.configuration.passingScore,
      gradingMethod: data.configuration.gradingMethod || 'latest',
      autoSubmit: data.configuration.autoSubmit || false,
      saveProgress: data.configuration.saveProgress !== false,
      requireCompleteSubmission:
        data.configuration.requireCompleteSubmission || false,
    };

    // Create default grading configuration
    const gradingConfig: GradingConfiguration = {
      method: data.grading?.method || GradingMethod.POINTS,
      rubrics: data.grading?.rubrics || [],
      autoGrading: {
        enabled: true,
        confidenceThreshold: 0.8,
        humanReviewRequired: false,
        mlModels: [],
        fallbackToManual: true,
        ...data.grading?.autoGrading,
      },
      manualGrading: {
        blindGrading: false,
        multipleGraders: false,
        gradersPerResponse: 1,
        conflictResolution: 'average',
        calibrationRequired: false,
        ...data.grading?.manualGrading,
      },
      feedback: {
        immediate: true,
        detailed: true,
        constructive: true,
        includeCorrectAnswers: false,
        includeSolutions: false,
        includeResources: true,
        personalized: false,
        aiGenerated: true,
        ...data.grading?.feedback,
      },
      analytics: {
        gradingTime: 0,
        gradingConsistency: 0,
        interRaterReliability: 0,
        bias: {
          demographic: {},
          linguistic: {},
          temporal: {},
        },
        improvementAreas: [],
      },
    };

    // Create default security configuration
    const securityConfig: SecurityConfiguration = {
      browserLockdown: {
        enabled: false,
        preventCopyPaste: false,
        preventPrint: false,
        preventRightClick: false,
        preventNewTabs: false,
        preventAltTab: false,
        fullScreen: false,
        disableDevTools: false,
        blockWebsites: [],
        allowedApplications: [],
        ...data.security?.browserLockdown,
      },
      behaviorAnalysis: {
        enabled: false,
        trackMouseMovement: false,
        trackKeystrokes: false,
        trackFocusLoss: false,
        trackTabSwitching: false,
        trackScrollBehavior: false,
        flagSuspiciousActivity: false,
        suspicionThreshold: 0.7,
        realTimeAlerts: false,
        ...data.security?.behaviorAnalysis,
      },
      plagiarismDetection: {
        enabled: false,
        textSimilarity: false,
        codeSimilarity: false,
        imageComparison: false,
        externalSources: false,
        similarityThreshold: 0.8,
        databases: [],
        ...data.security?.plagiarismDetection,
      },
      randomization: {
        questionOrder: configuration.randomizeQuestions,
        answerOrder: configuration.randomizeAnswers,
        questionSelection: false,
        parameterVariation: false,
        preserveGroups: false,
        ...data.security?.randomization,
      },
      monitoring: {
        screenRecording: false,
        webcamMonitoring: false,
        audioMonitoring: false,
        environmentScan: false,
        periodicChecks: false,
        checkInterval: 30,
        ...data.security?.monitoring,
      },
      authentication: {
        multiFactorAuth: false,
        biometricAuth: false,
        idVerification: false,
        photoCapture: false,
        signatureVerification: false,
        geolocationVerification: false,
        ...data.security?.authentication,
      },
    };

    // Create assessment object
    const assessment: Assessment = {
      id: assessmentId,
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      type: data.type,
      configuration,
      questions: assessmentQuestions,
      grading: gradingConfig,
      security: securityConfig,
      accessibility: {
        enabled: true,
        accommodations: [],
        assistiveTechnology: {
          screenReaders: {
            compatible: ['JAWS', 'NVDA', 'VoiceOver'],
            ariaLabels: true,
            structuredNavigation: true,
            skipLinks: true,
            readingOrder: true,
            mathMLSupport: false,
          },
          magnification: {
            zoomLevels: [1, 1.25, 1.5, 2, 3],
            panAndZoom: true,
            focusTracking: true,
            smoothScrolling: true,
            colorEnhancement: false,
          },
          speechRecognition: {
            voiceCommands: false,
            dictation: false,
            customVocabulary: false,
            languageSupport: ['en-US'],
            noiseReduction: false,
          },
          eyeTracking: {
            gazeControl: false,
            dwellClick: false,
            calibration: false,
            heatmapTracking: false,
            attentionMetrics: false,
          },
          switchNavigation: {
            singleSwitch: false,
            dualSwitch: false,
            scanning: false,
            customTiming: false,
            repeatRate: 500,
          },
        },
        universalDesign: {
          multipleFormats: true,
          clearNavigation: true,
          consistentLayout: true,
          errorPrevention: true,
          flexibleTiming: true,
          multipleWaysToAccess: true,
          clearInstructions: true,
        },
        compliance: {
          wcag: {
            version: '2.1',
            level: 'AA',
            guidelines: [],
            lastAudit: new Date(),
            auditScore: 85,
          },
          section508: true,
          ada: true,
          iso14289: false,
          enEuropean: false,
          customStandards: [],
        },
      },
      proctoring: {
        enabled: false,
        provider: 'custom' as any,
        type: 'automated' as any,
        configuration: {
          preExamCheck: false,
          identityVerification: false,
          roomScan: false,
          screenRecording: false,
          webcamRequired: false,
          microphoneRequired: false,
          allowCalculator: false,
          allowNotes: false,
          allowBreaks: false,
          maxBreakTime: 0,
        },
        monitoring: {
          faceDetection: false,
          eyeTracking: false,
          audioDetection: false,
          motionDetection: false,
          multiPersonDetection: false,
          phoneDetection: false,
          backgroundNoiseDetection: false,
        },
        alerts: {
          realTime: false,
          severity: 'medium',
          autoFlag: false,
          notifyProctor: false,
          alertTypes: [],
        },
        review: {
          required: false,
          reviewerCount: 1,
          flaggedContentReview: false,
          fullSessionReview: false,
          automaticScoring: false,
          humanReviewThreshold: 0.8,
        },
        ...data.proctoring,
      },
      scheduling: {
        availability: [],
        timeZones: ['UTC'],
        scheduling: {
          advanceBooking: 1,
          cancellationDeadline: 24,
          rescheduleLimit: 2,
          noShowPolicy: 'forfeit',
          waitlistEnabled: false,
          autoConfirm: true,
        },
        notifications: {
          enabled: true,
          channels: [NotificationChannel.EMAIL],
          reminders: {
            enabled: true,
            intervals: [24, 2],
            channels: [NotificationChannel.EMAIL],
            customMessage: undefined,
          },
          escalation: {
            enabled: false,
            triggers: [],
            actions: [],
          },
        },
        calendar: {
          enabled: false,
          providers: [],
          syncBidirectional: false,
          conflictDetection: false,
          autoBlock: false,
        },
      },
      analytics: {
        id: this.generateId(),
        assessmentId,
        generatedAt: new Date(),
        participantCount: 0,
        completionRate: 0,
        averageScore: 0,
        averageTime: 0,
        reliability: {
          cronbachAlpha: 0,
          splitHalf: 0,
          sem: 0,
          confidence: 0,
        },
        validity: {
          contentValidity: 0,
          constructValidity: 0,
          faceValidity: 0,
          discriminantValidity: 0,
        },
        itemAnalysis: {
          items: [],
          flaggedItems: [],
          recommendedRevisions: [],
          qualityDistribution: {},
        },
        performanceDistribution: {
          histogram: [],
          percentiles: {},
          mean: 0,
          median: 0,
          mode: 0,
          standardDeviation: 0,
          skewness: 0,
          kurtosis: 0,
        },
        trends: {
          timeBasedTrends: [],
          demographicTrends: [],
          cohortComparisons: [],
          predictiveIndicators: [],
        },
        recommendations: {
          assessmentLevel: [],
          questionLevel: [],
          participantLevel: [],
          systemLevel: [],
        },
      },
      status: 'draft',
      createdBy,
      updatedBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store assessment
    this.assessments.set(assessmentId, assessment);
    this.analytics.set(assessmentId, assessment.analytics);

    this.emit('assessmentCreated', assessment);
    return assessment;
  }

  async updateAssessment(
    assessmentId: UUID,
    updates: Partial<Assessment>,
    updatedBy: UUID
  ): Promise<Assessment> {
    const existing = this.assessments.get(assessmentId);
    if (!existing) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    // Validate that assessment is not in use
    if (existing.status === 'published') {
      const activeAttempts = await this.getActiveAttempts(assessmentId);
      if (activeAttempts.length > 0) {
        throw new Error('Cannot update assessment with active attempts');
      }
    }

    const updated: Assessment = {
      ...existing,
      ...updates,
      id: assessmentId, // Ensure ID doesn't change
      updatedBy,
      updatedAt: new Date(),
    };

    this.assessments.set(assessmentId, updated);
    this.emit('assessmentUpdated', updated, existing);
    return updated;
  }

  async deleteAssessment(assessmentId: UUID): Promise<boolean> {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      return false;
    }

    // Check for dependent data
    const attempts = await this.getAssessmentAttempts(assessmentId);
    if (attempts.length > 0) {
      throw new Error('Cannot delete assessment with existing attempts');
    }

    this.assessments.delete(assessmentId);
    this.analytics.delete(assessmentId);

    this.emit('assessmentDeleted', assessment);
    return true;
  }

  async publishAssessment(assessmentId: UUID): Promise<Assessment> {
    const existingAssessment = this.assessments.get(assessmentId);
    if (!existingAssessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    const assessment = await this.updateAssessment(
      assessmentId,
      { status: 'published' },
      existingAssessment.createdBy
    );

    // Perform pre-publication validation
    await this.validateAssessmentForPublication(assessment);

    this.emit('assessmentPublished', assessment);
    return assessment;
  }

  // ============================================================================
  // ASSESSMENT DELIVERY & SESSIONS
  // ============================================================================

  async startAssessment(
    assessmentId: UUID,
    participantId: UUID,
    config?: Partial<AssessmentDeliveryConfig>
  ): Promise<AssessmentSession> {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    if (assessment.status !== 'published') {
      throw new Error('Assessment is not published');
    }

    // Check if participant can start this assessment
    await this.validateParticipantEligibility(assessmentId, participantId);

    // Create new attempt
    const attempt = await this.createAssessmentAttempt(
      assessmentId,
      participantId
    );

    // Initialize session
    const sessionId = this.generateId();
    const session: AssessmentSession = {
      id: sessionId,
      assessmentId,
      participantId,
      attemptId: attempt.id,
      currentQuestionIndex: 0,
      startTime: new Date(),
      lastActivity: new Date(),
      timeRemaining: assessment.configuration.timeLimit
        ? assessment.configuration.timeLimit * 60
        : undefined,
      status: 'in_progress',
      responses: new Map(),
    };

    // Initialize CAT session if adaptive testing is enabled
    if (config?.adaptiveTesting && this.catEngine) {
      const questions = await this.getAssessmentQuestions(assessmentId);
      const catConfig: CATConfiguration = {
        enabled: true,
        algorithm: 'irt-2pl' as any,
        parameters: {
          startingAbility: 0,
          minQuestions: 5,
          maxQuestions: Math.min(20, questions.length),
          targetSEM: 0.3,
          targetReliability: 0.8,
          exposureControl: 'none' as any,
          contentConstraints: [],
        },
        stoppingCriteria: {
          maxSEM: 0.3,
          minReliability: 0.8,
          maxQuestions: 20,
          minQuestions: 5,
          confidenceInterval: 0.95,
        },
        itemSelection: 'maximum-information' as any,
        abilityEstimation: 'mle' as any,
        contentBalancing: {
          enforceConstraints: false,
          balanceSubjects: false,
          balanceDifficulty: false,
          balanceTypes: false,
          penalties: {},
        },
      };

      session.catSession = await this.catEngine.startCATSession(
        assessmentId,
        participantId,
        catConfig,
        questions
      );
    }

    // Initialize proctoring if enabled
    if (config?.proctoringEnabled && this.proctoringService) {
      await this.proctoringService.startSession(
        sessionId,
        assessment.proctoring
      );
    }

    // Initialize security monitoring if enabled
    if (
      assessment.security.monitoring.screenRecording ||
      assessment.security.behaviorAnalysis.enabled
    ) {
      await this.securityService?.startMonitoring(
        sessionId,
        assessment.security
      );
    }

    this.sessions.set(sessionId, session);

    this.emit('assessmentStarted', session);
    return session;
  }

  async getNextQuestion(sessionId: UUID): Promise<Question | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'in_progress') {
      throw new Error('Invalid or inactive session');
    }

    const assessment = this.assessments.get(session.assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Check time limits
    if (session.timeRemaining !== undefined && session.timeRemaining <= 0) {
      await this.completeAssessment(sessionId, 'time_expired');
      return null;
    }

    // CAT-based question selection
    if (session.catSession && this.catEngine) {
      const nextQuestionId = await this.catEngine.getNextItem(
        session.catSession.id,
        {} as CATConfiguration // Would be passed from assessment config
      );

      if (!nextQuestionId) {
        await this.completeAssessment(sessionId, 'completed');
        return null;
      }

      return await this.questionBankService?.getQuestion(nextQuestionId);
    }

    // Traditional sequential delivery
    if (session.currentQuestionIndex >= assessment.questions.length) {
      await this.completeAssessment(sessionId, 'completed');
      return null;
    }

    const assessmentQuestion =
      assessment.questions[session.currentQuestionIndex];
    const question = await this.questionBankService?.getQuestion(
      assessmentQuestion.questionId
    );

    session.currentQuestionIndex++;
    session.lastActivity = new Date();

    return question;
  }

  async submitResponse(
    sessionId: UUID,
    questionId: UUID,
    responseData: any
  ): Promise<QuestionResponse> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'in_progress') {
      throw new Error('Invalid or inactive session');
    }

    // Create response object
    const response: QuestionResponse = {
      id: this.generateId(),
      questionId,
      attemptId: session.attemptId,
      response: responseData,
      responseTime: Date.now() - session.lastActivity.getTime(),
      startTime: session.lastActivity,
      endTime: new Date(),
      flagged: false,
      version: 1,
    };

    // Store response
    session.responses.set(questionId, response);
    session.lastActivity = new Date();

    // Process with CAT engine if adaptive
    if (session.catSession && this.catEngine) {
      await this.catEngine.processResponse(
        session.catSession.id,
        questionId,
        response,
        {} as CATConfiguration
      );
    }

    // Auto-grade if possible
    if (this.gradingService) {
      try {
        const gradingResult = await this.gradingService.gradeResponse({
          id: this.generateId(),
          questionId,
          response,
          context: {
            courseId: session.assessmentId,
            participantLevel: 'intermediate',
          },
        });

        response.score = gradingResult.score.points;
        response.feedback = gradingResult.feedback;
        response.flagged = gradingResult.flagged;
        response.flagReason = gradingResult.flagReasons.join(', ');
      } catch (error) {
        console.warn('Auto-grading failed:', error);
      }
    }

    this.emit('responseSubmitted', session, response);
    return response;
  }

  async completeAssessment(
    sessionId: UUID,
    reason: 'completed' | 'time_expired' | 'terminated'
  ): Promise<AssessmentAttempt> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'completed';

    // Get the attempt and update it
    const attempt = this.attempts.get(session.attemptId);
    if (!attempt) {
      throw new Error('Attempt not found');
    }

    attempt.endTime = new Date();
    attempt.submitTime = new Date();
    attempt.status = AttemptStatus.SUBMITTED;
    attempt.responses = Array.from(session.responses.values());

    // Calculate final score
    if (this.gradingService) {
      const totalPoints = attempt.responses.reduce(
        (sum, r) => sum + (r.score || 0),
        0
      );
      const maxPoints = attempt.responses.length * 10; // Simplified

      attempt.score = {
        points: totalPoints,
        maxPoints,
        percentage: maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0,
        passed: maxPoints > 0 ? totalPoints / maxPoints >= 0.6 : false,
        breakdown: {
          questionScores: Object.fromEntries(
            attempt.responses.map((r) => [r.questionId, r.score || 0])
          ),
          categoryScores: {},
          objectiveScores: {},
        },
      };
    }

    // Finalize CAT session if applicable
    if (session.catSession && this.catEngine) {
      await this.catEngine.terminateSession(session.catSession.id, reason);
    }

    // Stop proctoring and security monitoring
    await this.proctoringService?.stopSession(sessionId);
    await this.securityService?.stopMonitoring(sessionId);

    this.attempts.set(attempt.id, attempt);

    this.emit('assessmentCompleted', session, attempt);
    return attempt;
  }

  // ============================================================================
  // ATTEMPT MANAGEMENT
  // ============================================================================

  private async createAssessmentAttempt(
    assessmentId: UUID,
    participantId: UUID
  ): Promise<AssessmentAttempt> {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Check attempt limits
    const existingAttempts = await this.getParticipantAttempts(
      assessmentId,
      participantId
    );
    if (existingAttempts.length >= assessment.configuration.attempts) {
      throw new Error('Maximum attempts exceeded');
    }

    const attempt: AssessmentAttempt = {
      id: this.generateId(),
      assessmentId,
      participantId,
      attemptNumber: existingAttempts.length + 1,
      startTime: new Date(),
      responses: [],
      status: AttemptStatus.IN_PROGRESS,
      metadata: {
        browser: 'Unknown',
        device: 'Unknown',
        ipAddress: '0.0.0.0',
        userAgent: 'Unknown',
        screenResolution: '1920x1080',
        timeZone: 'UTC',
        sessionId: this.generateId(),
      },
      security: {
        violations: [],
        behaviorMetrics: {
          keystrokePattern: {
            averageSpeed: 0,
            pauseFrequency: 0,
            deletionRate: 0,
            typingRhythm: [],
            unusual: false,
          },
          mouseMovement: {
            averageSpeed: 0,
            clickAccuracy: 0,
            movementSmoothness: 0,
            clickPattern: [],
            unusual: false,
          },
          responsePattern: {
            averageThinkTime: 0,
            consistencyScore: 0,
            difficultyCorrelation: 0,
            speedAccuracyTrade: 0,
            unusual: false,
          },
          timingPattern: {
            totalTime: 0,
            timePerQuestion: [],
            rushingIndicators: 0,
            pauseFrequency: 0,
            unusual: false,
          },
          focusPattern: {
            focusLossCount: 0,
            averageFocusTime: 0,
            timeOffScreen: 0,
            suspiciousLosses: 0,
            unusual: false,
          },
        },
        integrityScore: 100,
        riskLevel: 'low',
      },
    };

    this.attempts.set(attempt.id, attempt);
    this.emit('attemptCreated', attempt);
    return attempt;
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  async generateAssessmentAnalytics(
    assessmentId: UUID
  ): Promise<AssessmentAnalytics> {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    const attempts = await this.getAssessmentAttempts(assessmentId);
    const completedAttempts = attempts.filter(
      (a) => a.status === 'submitted' || a.status === 'graded'
    );

    // Calculate basic metrics
    const participantCount = new Set(attempts.map((a) => a.participantId)).size;
    const completionRate =
      attempts.length > 0 ? completedAttempts.length / attempts.length : 0;

    const scores = completedAttempts
      .map((a) => a.score?.percentage || 0)
      .filter((s) => s > 0);

    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;

    const times = completedAttempts
      .filter((a) => a.endTime && a.startTime)
      .map((a) => a.endTime!.getTime() - a.startTime.getTime());

    const averageTime =
      times.length > 0
        ? times.reduce((sum, t) => sum + t, 0) / times.length
        : 0;

    // Update analytics
    const analytics: AssessmentAnalytics = {
      ...assessment.analytics,
      generatedAt: new Date(),
      participantCount,
      completionRate,
      averageScore,
      averageTime,
    };

    this.analytics.set(assessmentId, analytics);
    this.emit('analyticsGenerated', analytics);
    return analytics;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async validateQuestions(questionIds: UUID[]): Promise<void> {
    if (!this.questionBankService) return;

    for (const questionId of questionIds) {
      const question = await this.questionBankService.getQuestion(questionId);
      if (!question) {
        throw new Error(`Question not found: ${questionId}`);
      }
    }
  }

  private async validateAssessmentForPublication(
    assessment: Assessment
  ): Promise<void> {
    if (assessment.questions.length === 0) {
      throw new Error('Assessment must have at least one question');
    }

    if (!assessment.title.trim()) {
      throw new Error('Assessment must have a title');
    }

    // Additional validation rules...
  }

  private async validateParticipantEligibility(
    assessmentId: UUID,
    participantId: UUID
  ): Promise<void> {
    // Check prerequisites, permissions, etc.
    // This would integrate with user management and course enrollment systems
  }

  private async getAssessmentQuestions(
    assessmentId: UUID
  ): Promise<Question[]> {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment || !this.questionBankService) {
      return [];
    }

    const questions = await Promise.all(
      assessment.questions.map((q) =>
        this.questionBankService.getQuestion(q.questionId)
      )
    );

    return questions.filter((q) => q !== null);
  }

  private generateId(): UUID {
    return require('crypto').randomUUID();
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  async getAssessment(assessmentId: UUID): Promise<Assessment | null> {
    return this.assessments.get(assessmentId) || null;
  }

  async getAssessments(filters?: {
    status?: string;
    type?: AssessmentType;
    createdBy?: UUID;
  }): Promise<Assessment[]> {
    let assessments = Array.from(this.assessments.values());

    if (filters?.status) {
      assessments = assessments.filter((a) => a.status === filters.status);
    }
    if (filters?.type) {
      assessments = assessments.filter((a) => a.type === filters.type);
    }
    if (filters?.createdBy) {
      assessments = assessments.filter(
        (a) => a.createdBy === filters.createdBy
      );
    }

    return assessments;
  }

  async getAssessmentAttempts(
    assessmentId: UUID
  ): Promise<AssessmentAttempt[]> {
    return Array.from(this.attempts.values()).filter(
      (attempt) => attempt.assessmentId === assessmentId
    );
  }

  async getParticipantAttempts(
    assessmentId: UUID,
    participantId: UUID
  ): Promise<AssessmentAttempt[]> {
    return Array.from(this.attempts.values()).filter(
      (attempt) =>
        attempt.assessmentId === assessmentId &&
        attempt.participantId === participantId
    );
  }

  async getActiveAttempts(assessmentId: UUID): Promise<AssessmentAttempt[]> {
    return Array.from(this.attempts.values()).filter(
      (attempt) =>
        attempt.assessmentId === assessmentId &&
        attempt.status === AttemptStatus.IN_PROGRESS
    );
  }

  async getSession(sessionId: UUID): Promise<AssessmentSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getActiveSessions(): Promise<AssessmentSession[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.status === 'in_progress'
    );
  }

  async getAssessmentAnalytics(
    assessmentId: UUID
  ): Promise<AssessmentAnalytics | null> {
    return this.analytics.get(assessmentId) || null;
  }

  // Pause/Resume functionality
  async pauseAssessment(sessionId: UUID): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session && session.status === 'in_progress') {
      session.status = 'paused';
      this.emit('assessmentPaused', session);
    }
  }

  async resumeAssessment(sessionId: UUID): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session && session.status === 'paused') {
      session.status = 'in_progress';
      session.lastActivity = new Date();
      this.emit('assessmentResumed', session);
    }
  }

  // Time management
  async getRemainingTime(sessionId: UUID): Promise<number | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (session.timeRemaining === undefined) return null;

    const elapsed = Date.now() - session.startTime.getTime();
    const remaining = session.timeRemaining * 1000 - elapsed;
    return Math.max(0, Math.floor(remaining / 1000));
  }

  async extendTime(sessionId: UUID, additionalMinutes: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session && session.timeRemaining !== undefined) {
      session.timeRemaining += additionalMinutes;
      this.emit('timeExtended', session, additionalMinutes);
    }
  }
}
