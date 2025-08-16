import { z } from 'zod';

// ============================================================================
// BASE TYPES
// ============================================================================

export type UUID = string;
export type Timestamp = Date;

// ============================================================================
// QUESTION TYPES & CONTENT
// ============================================================================

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  SINGLE_CHOICE = 'single-choice',
  TRUE_FALSE = 'true-false',
  ESSAY = 'essay',
  SHORT_ANSWER = 'short-answer',
  FILL_IN_BLANK = 'fill-in-blank',
  DRAG_DROP = 'drag-drop',
  HOTSPOT = 'hotspot',
  CODE_EVALUATION = 'code-evaluation',
  AUDIO_RESPONSE = 'audio-response',
  VIDEO_RESPONSE = 'video-response',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  MATRIX = 'matrix',
  CALCULATION = 'calculation',
  FILE_UPLOAD = 'file-upload',
}

export enum DifficultyLevel {
  VERY_EASY = 1,
  EASY = 2,
  MEDIUM = 3,
  HARD = 4,
  VERY_HARD = 5,
}

export enum CognitiveDomain {
  KNOWLEDGE = 'knowledge',
  COMPREHENSION = 'comprehension',
  APPLICATION = 'application',
  ANALYSIS = 'analysis',
  SYNTHESIS = 'synthesis',
  EVALUATION = 'evaluation',
}

// Question Content Interfaces
export interface BaseQuestionContent {
  type: QuestionType;
  text: string;
  instructions?: string;
  media?: MediaContent[];
  accessibility?: AccessibilityFeatures;
}

export interface MultipleChoiceContent extends BaseQuestionContent {
  type: QuestionType.MULTIPLE_CHOICE | QuestionType.SINGLE_CHOICE;
  options: QuestionOption[];
  correctAnswers: string[]; // Option IDs
  allowMultiple: boolean;
  randomizeOptions: boolean;
  maxSelections?: number;
}

export interface TrueFalseContent extends BaseQuestionContent {
  type: QuestionType.TRUE_FALSE;
  correctAnswer: boolean;
  explanation?: string;
}

export interface EssayContent extends BaseQuestionContent {
  type: QuestionType.ESSAY;
  wordLimit?: number;
  minWords?: number;
  rubric?: GradingRubric;
  sampleAnswers?: string[];
  keywords?: string[];
  requiredElements?: string[];
}

export interface ShortAnswerContent extends BaseQuestionContent {
  type: QuestionType.SHORT_ANSWER;
  acceptedAnswers: string[];
  caseSensitive: boolean;
  exactMatch: boolean;
  partialCredit: boolean;
  synonyms?: Record<string, string[]>;
}

export interface FillInBlankContent extends BaseQuestionContent {
  type: QuestionType.FILL_IN_BLANK;
  template: string; // Text with {{blank}} placeholders
  blanks: BlankAnswer[];
  showDropdowns: boolean;
}

export interface DragDropContent extends BaseQuestionContent {
  type: QuestionType.DRAG_DROP;
  draggableItems: DraggableItem[];
  dropZones: DropZone[];
  allowMultipleInZone: boolean;
  requireAllItems: boolean;
}

export interface HotspotContent extends BaseQuestionContent {
  type: QuestionType.HOTSPOT;
  image: MediaContent;
  hotspots: Hotspot[];
  allowMultipleSelections: boolean;
  tolerance: number; // pixels
}

export interface CodeEvaluationContent extends BaseQuestionContent {
  type: QuestionType.CODE_EVALUATION;
  language: string;
  starterCode?: string;
  solution: string;
  testCases: CodeTestCase[];
  allowedLibraries?: string[];
  timeLimit: number; // seconds
  memoryLimit: number; // MB
}

export interface AudioResponseContent extends BaseQuestionContent {
  type: QuestionType.AUDIO_RESPONSE;
  maxDuration: number; // seconds
  autoTranscribe: boolean;
  expectedKeywords?: string[];
  sampleAudio?: MediaContent;
}

export interface VideoResponseContent extends BaseQuestionContent {
  type: QuestionType.VIDEO_RESPONSE;
  maxDuration: number; // seconds
  requireCamera: boolean;
  autoAnalyze: boolean;
  expectedGestures?: string[];
  sampleVideo?: MediaContent;
}

export interface MatchingContent extends BaseQuestionContent {
  type: QuestionType.MATCHING;
  leftColumn: MatchingItem[];
  rightColumn: MatchingItem[];
  allowOneToMany: boolean;
}

export interface OrderingContent extends BaseQuestionContent {
  type: QuestionType.ORDERING;
  items: OrderingItem[];
  correctOrder: string[]; // Item IDs in correct order
  partialCredit: boolean;
}

export interface MatrixContent extends BaseQuestionContent {
  type: QuestionType.MATRIX;
  rows: MatrixRow[];
  columns: MatrixColumn[];
  cells: MatrixCell[];
  allowMultiplePerRow: boolean;
}

export interface CalculationContent extends BaseQuestionContent {
  type: QuestionType.CALCULATION;
  expression: string;
  variables: CalculationVariable[];
  tolerance: number;
  units?: string;
  showWork: boolean;
}

export interface FileUploadContent extends BaseQuestionContent {
  type: QuestionType.FILE_UPLOAD;
  allowedTypes: string[];
  maxFileSize: number; // MB
  maxFiles: number;
  autoGrade: boolean;
  rubric?: GradingRubric;
}

export type QuestionContent =
  | MultipleChoiceContent
  | TrueFalseContent
  | EssayContent
  | ShortAnswerContent
  | FillInBlankContent
  | DragDropContent
  | HotspotContent
  | CodeEvaluationContent
  | AudioResponseContent
  | VideoResponseContent
  | MatchingContent
  | OrderingContent
  | MatrixContent
  | CalculationContent
  | FileUploadContent;

// Supporting Types
export interface QuestionOption {
  id: string;
  text: string;
  image?: MediaContent;
  isCorrect: boolean;
  feedback?: string;
  points?: number;
}

export interface MediaContent {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
  transcript?: string;
  captions?: Caption[];
  duration?: number;
}

export interface Caption {
  start: number;
  end: number;
  text: string;
  language: string;
}

export interface AccessibilityFeatures {
  screenReaderText?: string;
  highContrast?: boolean;
  largeText?: boolean;
  keyboardNavigation?: boolean;
  extendedTime?: number; // percentage increase
  brailleSupport?: boolean;
  signLanguageVideo?: MediaContent;
  audioDescription?: MediaContent;
}

export interface BlankAnswer {
  id: string;
  position: number;
  acceptedAnswers: string[];
  caseSensitive: boolean;
  points: number;
  feedback?: string;
}

export interface DraggableItem {
  id: string;
  content: string;
  image?: MediaContent;
  group?: string;
}

export interface DropZone {
  id: string;
  label: string;
  acceptedItems: string[]; // Item IDs or groups
  position: { x: number; y: number; width: number; height: number };
  feedback?: string;
}

export interface Hotspot {
  id: string;
  area: { x: number; y: number; width: number; height: number };
  shape: 'rectangle' | 'circle' | 'polygon';
  coordinates?: number[]; // For polygon
  isCorrect: boolean;
  feedback?: string;
  points: number;
}

export interface CodeTestCase {
  id: string;
  input: any;
  expectedOutput: any;
  points: number;
  timeout: number;
  description?: string;
  hidden: boolean;
}

export interface MatchingItem {
  id: string;
  content: string;
  image?: MediaContent;
  matchWith: string[]; // IDs of matching items
}

export interface OrderingItem {
  id: string;
  content: string;
  image?: MediaContent;
  position: number;
}

export interface MatrixRow {
  id: string;
  label: string;
}

export interface MatrixColumn {
  id: string;
  label: string;
}

export interface MatrixCell {
  rowId: string;
  columnId: string;
  isCorrect: boolean;
  points: number;
}

export interface CalculationVariable {
  name: string;
  min: number;
  max: number;
  precision: number;
  unit?: string;
}

// ============================================================================
// QUESTION BANK & CATEGORIZATION
// ============================================================================

export interface Question {
  id: UUID;
  title: string;
  content: QuestionContent;
  points: number;
  timeLimit?: number; // seconds
  difficulty: DifficultyLevel;
  cognitiveDomain: CognitiveDomain;
  tags: string[];
  categories: string[];
  subject: string;
  topic: string;
  learningObjectives: string[];
  prerequisites?: string[];
  metadata: QuestionMetadata;
  analytics: QuestionAnalytics;
  version: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  createdBy: UUID;
  updatedBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface QuestionMetadata {
  estimatedTime: number; // seconds
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  complexity: number;
  source?: string;
  authorNotes?: string;
  reviewNotes?: string;
  translations?: Record<string, string>;
}

export interface QuestionAnalytics {
  timesUsed: number;
  avgResponseTime: number;
  difficultyIndex: number; // p-value (proportion correct)
  discriminationIndex: number; // point-biserial correlation
  reliabilityContribution: number;
  responseDistribution: Record<string, number>;
  commonMistakes: string[];
  improvementSuggestions: string[];
  lastAnalyzed: Timestamp;
}

export interface QuestionBank {
  id: UUID;
  name: string;
  description: string;
  questions: Question[];
  categories: QuestionCategory[];
  tags: QuestionTag[];
  permissions: BankPermissions;
  metadata: BankMetadata;
  createdBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface QuestionCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
}

export interface QuestionTag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  usageCount: number;
}

export interface BankPermissions {
  viewers: UUID[];
  editors: UUID[];
  administrators: UUID[];
  isPublic: boolean;
  shareCode?: string;
}

export interface BankMetadata {
  totalQuestions: number;
  subjectDistribution: Record<string, number>;
  difficultyDistribution: Record<DifficultyLevel, number>;
  typeDistribution: Record<QuestionType, number>;
  qualityScore: number;
  lastQualityCheck: Timestamp;
}

// ============================================================================
// ASSESSMENT CONFIGURATION
// ============================================================================

export interface Assessment {
  id: UUID;
  title: string;
  description: string;
  instructions: string;
  type: AssessmentType;
  configuration: AssessmentConfiguration;
  questions: AssessmentQuestion[];
  grading: GradingConfiguration;
  security: SecurityConfiguration;
  accessibility: AssessmentAccessibility;
  proctoring: ProctoringConfiguration;
  scheduling: SchedulingConfiguration;
  analytics: AssessmentAnalytics;
  status: 'draft' | 'published' | 'archived';
  createdBy: UUID;
  updatedBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export enum AssessmentType {
  PRACTICE = 'practice',
  QUIZ = 'quiz',
  EXAM = 'exam',
  SURVEY = 'survey',
  ADAPTIVE = 'adaptive',
  PLACEMENT = 'placement',
  CERTIFICATION = 'certification',
}

export interface AssessmentConfiguration {
  timeLimit?: number; // minutes
  attempts: number;
  questionCount?: number;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showProgress: boolean;
  allowBackNavigation: boolean;
  showCorrectAnswers: 'never' | 'after_submission' | 'after_due_date';
  showScore: 'never' | 'immediately' | 'after_due_date';
  passingScore?: number;
  gradingMethod: 'highest' | 'latest' | 'average';
  autoSubmit: boolean;
  saveProgress: boolean;
  requireCompleteSubmission: boolean;
}

export interface AssessmentQuestion {
  id: UUID;
  questionId: UUID;
  position: number;
  points: number;
  timeLimit?: number;
  required: boolean;
  randomizeOptions: boolean;
  customInstructions?: string;
  conditions?: QuestionCondition[];
}

export interface QuestionCondition {
  type: 'previous_answer' | 'score_threshold' | 'time_spent' | 'attempt_number';
  questionId?: UUID;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
  action: 'show' | 'hide' | 'require' | 'skip';
}

// ============================================================================
// COMPUTER ADAPTIVE TESTING (CAT)
// ============================================================================

export interface CATConfiguration {
  enabled: boolean;
  algorithm: CATAlgorithm;
  parameters: CATParameters;
  stoppingCriteria: CATStoppingCriteria;
  itemSelection: ItemSelectionMethod;
  abilityEstimation: AbilityEstimationMethod;
  contentBalancing: ContentBalancingRules;
}

export enum CATAlgorithm {
  IRT_1PL = 'irt-1pl', // Rasch Model
  IRT_2PL = 'irt-2pl', // 2-Parameter Logistic
  IRT_3PL = 'irt-3pl', // 3-Parameter Logistic
  GPCM = 'gpcm', // Generalized Partial Credit Model
  GRM = 'grm', // Graded Response Model
}

export interface CATParameters {
  startingAbility: number;
  minQuestions: number;
  maxQuestions: number;
  targetSEM: number; // Standard Error of Measurement
  targetReliability: number;
  exposureControl: ExposureControlMethod;
  contentConstraints: ContentConstraint[];
}

export interface CATStoppingCriteria {
  maxSEM: number;
  minReliability: number;
  maxQuestions: number;
  minQuestions: number;
  timeLimit?: number;
  confidenceInterval: number;
}

export enum ItemSelectionMethod {
  MAXIMUM_INFORMATION = 'maximum-information',
  WEIGHTED_INFORMATION = 'weighted-information',
  BAYESIAN = 'bayesian',
  CONSTRAINT_BASED = 'constraint-based',
}

export enum AbilityEstimationMethod {
  MLE = 'mle', // Maximum Likelihood Estimation
  WLE = 'wle', // Weighted Likelihood Estimation
  EAP = 'eap', // Expected A Posteriori
  MAP = 'map', // Maximum A Posteriori
}

export enum ExposureControlMethod {
  NONE = 'none',
  SYMPSON_HETTER = 'sympson-hetter',
  RANDOMESQUE = 'randomesque',
  PROGRESSIVE = 'progressive',
}

export interface ContentConstraint {
  category: string;
  minItems: number;
  maxItems: number;
  weight: number;
}

export interface ContentBalancingRules {
  enforceConstraints: boolean;
  balanceSubjects: boolean;
  balanceDifficulty: boolean;
  balanceTypes: boolean;
  penalties: Record<string, number>;
}

export interface CATSession {
  id: UUID;
  assessmentId: UUID;
  participantId: UUID;
  currentAbility: number;
  abilityHistory: AbilityEstimate[];
  administeredItems: AdministeredItem[];
  remainingPool: UUID[];
  sem: number;
  reliability: number;
  status: 'active' | 'completed' | 'terminated';
  startTime: Timestamp;
  endTime?: Timestamp;
}

export interface AbilityEstimate {
  value: number;
  sem: number;
  timestamp: Timestamp;
  itemsUsed: number;
}

export interface AdministeredItem {
  questionId: UUID;
  response: any;
  responseTime: number;
  isCorrect: boolean;
  abilityBeforeItem: number;
  abilityAfterItem: number;
  informationValue: number;
  timestamp: Timestamp;
}

// ============================================================================
// GRADING & SCORING
// ============================================================================

export interface GradingConfiguration {
  method: GradingMethod;
  rubrics: GradingRubric[];
  autoGrading: AutoGradingConfig;
  manualGrading: ManualGradingConfig;
  feedback: FeedbackConfiguration;
  analytics: GradingAnalytics;
}

export enum GradingMethod {
  POINTS = 'points',
  PERCENTAGE = 'percentage',
  RUBRIC = 'rubric',
  COMPETENCY = 'competency',
  PASS_FAIL = 'pass-fail',
}

export interface GradingRubric {
  id: UUID;
  name: string;
  description: string;
  criteria: RubricCriterion[];
  levels: RubricLevel[];
  weightings: Record<string, number>;
  holistic: boolean;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  required: boolean;
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
  qualityDescriptors: Record<string, string>; // criterion ID -> descriptor
}

export interface AutoGradingConfig {
  enabled: boolean;
  confidenceThreshold: number;
  humanReviewRequired: boolean;
  mlModels: MLGradingModel[];
  fallbackToManual: boolean;
}

export interface MLGradingModel {
  id: string;
  type: 'essay' | 'short-answer' | 'code' | 'audio' | 'video';
  modelPath: string;
  version: string;
  accuracy: number;
  trainedOn: string[];
  lastUpdated: Timestamp;
}

export interface ManualGradingConfig {
  blindGrading: boolean;
  multipleGraders: boolean;
  gradersPerResponse: number;
  conflictResolution: 'average' | 'highest' | 'lowest' | 'manual-review';
  calibrationRequired: boolean;
}

export interface FeedbackConfiguration {
  immediate: boolean;
  detailed: boolean;
  constructive: boolean;
  includeCorrectAnswers: boolean;
  includeSolutions: boolean;
  includeResources: boolean;
  personalized: boolean;
  aiGenerated: boolean;
}

export interface GradingAnalytics {
  gradingTime: number;
  gradingConsistency: number;
  interRaterReliability: number;
  bias: BiasAnalysis;
  improvementAreas: string[];
}

export interface BiasAnalysis {
  demographic: Record<string, number>;
  linguistic: Record<string, number>;
  temporal: Record<string, number>;
}

// ============================================================================
// SECURITY & ANTI-CHEATING
// ============================================================================

export interface SecurityConfiguration {
  browserLockdown: BrowserLockdownConfig;
  behaviorAnalysis: BehaviorAnalysisConfig;
  plagiarismDetection: PlagiarismConfig;
  randomization: RandomizationConfig;
  monitoring: MonitoringConfig;
  authentication: AuthenticationConfig;
}

export interface BrowserLockdownConfig {
  enabled: boolean;
  preventCopyPaste: boolean;
  preventPrint: boolean;
  preventRightClick: boolean;
  preventNewTabs: boolean;
  preventAltTab: boolean;
  fullScreen: boolean;
  disableDevTools: boolean;
  blockWebsites: string[];
  allowedApplications: string[];
}

export interface BehaviorAnalysisConfig {
  enabled: boolean;
  trackMouseMovement: boolean;
  trackKeystrokes: boolean;
  trackFocusLoss: boolean;
  trackTabSwitching: boolean;
  trackScrollBehavior: boolean;
  flagSuspiciousActivity: boolean;
  suspicionThreshold: number;
  realTimeAlerts: boolean;
}

export interface PlagiarismConfig {
  enabled: boolean;
  textSimilarity: boolean;
  codeSimilarity: boolean;
  imageComparison: boolean;
  externalSources: boolean;
  similarityThreshold: number;
  databases: string[];
}

export interface RandomizationConfig {
  questionOrder: boolean;
  answerOrder: boolean;
  questionSelection: boolean;
  parameterVariation: boolean;
  seed?: string;
  preserveGroups: boolean;
}

export interface MonitoringConfig {
  screenRecording: boolean;
  webcamMonitoring: boolean;
  audioMonitoring: boolean;
  environmentScan: boolean;
  periodicChecks: boolean;
  checkInterval: number; // minutes
}

export interface AuthenticationConfig {
  multiFactorAuth: boolean;
  biometricAuth: boolean;
  idVerification: boolean;
  photoCapture: boolean;
  signatureVerification: boolean;
  geolocationVerification: boolean;
}

// ============================================================================
// PROCTORING INTEGRATION
// ============================================================================

export interface ProctoringConfiguration {
  enabled: boolean;
  provider: ProctoringProvider;
  type: ProctoringType;
  configuration: ProctoringSettings;
  monitoring: ProctoringMonitoring;
  alerts: ProctoringAlerts;
  review: ProctoringReview;
}

export enum ProctoringProvider {
  PROCTORIO = 'proctorio',
  EXAMITY = 'examity',
  HONORLOCK = 'honorlock',
  PROCTOR_U = 'proctor-u',
  RESPONDUS = 'respondus',
  CUSTOM = 'custom',
}

export enum ProctoringType {
  LIVE = 'live',
  RECORDED = 'recorded',
  AUTOMATED = 'automated',
  HYBRID = 'hybrid',
}

export interface ProctoringSettings {
  preExamCheck: boolean;
  identityVerification: boolean;
  roomScan: boolean;
  screenRecording: boolean;
  webcamRequired: boolean;
  microphoneRequired: boolean;
  allowCalculator: boolean;
  allowNotes: boolean;
  allowBreaks: boolean;
  maxBreakTime: number; // minutes
}

export interface ProctoringMonitoring {
  faceDetection: boolean;
  eyeTracking: boolean;
  audioDetection: boolean;
  motionDetection: boolean;
  multiPersonDetection: boolean;
  phoneDetection: boolean;
  backgroundNoiseDetection: boolean;
}

export interface ProctoringAlerts {
  realTime: boolean;
  severity: 'low' | 'medium' | 'high';
  autoFlag: boolean;
  notifyProctor: boolean;
  alertTypes: AlertType[];
}

export enum AlertType {
  FACE_NOT_VISIBLE = 'face-not-visible',
  MULTIPLE_FACES = 'multiple-faces',
  LOOKING_AWAY = 'looking-away',
  AUDIO_DETECTED = 'audio-detected',
  MOTION_DETECTED = 'motion-detected',
  BROWSER_CHANGE = 'browser-change',
  UNAUTHORIZED_AID = 'unauthorized-aid',
}

export interface ProctoringReview {
  required: boolean;
  reviewerCount: number;
  flaggedContentReview: boolean;
  fullSessionReview: boolean;
  automaticScoring: boolean;
  humanReviewThreshold: number;
}

// ============================================================================
// RESPONSES & SUBMISSIONS
// ============================================================================

export interface AssessmentAttempt {
  id: UUID;
  assessmentId: UUID;
  participantId: UUID;
  attemptNumber: number;
  startTime: Timestamp;
  endTime?: Timestamp;
  submitTime?: Timestamp;
  responses: QuestionResponse[];
  score?: Score;
  feedback?: AttemptFeedback;
  status: AttemptStatus;
  metadata: AttemptMetadata;
  security: SecurityData;
  proctoring?: ProctoringData;
}

export enum AttemptStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  PAUSED = 'paused',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  REVIEWED = 'reviewed',
  FLAGGED = 'flagged',
  INVALIDATED = 'invalidated',
}

export interface QuestionResponse {
  id: UUID;
  questionId: UUID;
  attemptId: UUID;
  response: ResponseData;
  responseTime: number; // seconds
  startTime: Timestamp;
  endTime: Timestamp;
  score?: number;
  feedback?: ResponseFeedback;
  flagged: boolean;
  flagReason?: string;
  gradedBy?: UUID;
  gradedAt?: Timestamp;
  version: number;
}

export type ResponseData =
  | { type: 'choice'; selected: string[] }
  | { type: 'text'; content: string }
  | { type: 'number'; value: number }
  | { type: 'file'; files: UploadedFile[] }
  | { type: 'audio'; recording: MediaFile }
  | { type: 'video'; recording: MediaFile }
  | { type: 'code'; code: string; language: string; output?: string }
  | { type: 'hotspot'; coordinates: Coordinate[] }
  | { type: 'drag-drop'; placements: ItemPlacement[] }
  | { type: 'matching'; pairs: MatchPair[] }
  | { type: 'ordering'; order: string[] };

export interface UploadedFile {
  id: UUID;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Timestamp;
}

export interface MediaFile {
  id: UUID;
  duration: number;
  format: string;
  size: number;
  url: string;
  transcript?: string;
  recordedAt: Timestamp;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface ItemPlacement {
  itemId: string;
  zoneId: string;
  position: Coordinate;
}

export interface MatchPair {
  leftId: string;
  rightId: string;
}

export interface Score {
  points: number;
  maxPoints: number;
  percentage: number;
  grade?: string;
  passed: boolean;
  breakdown: ScoreBreakdown;
  rubricScores?: RubricScore[];
}

export interface ScoreBreakdown {
  questionScores: Record<UUID, number>;
  categoryScores: Record<string, number>;
  objectiveScores: Record<string, number>;
  timeBonus?: number;
  penalties?: number;
}

export interface RubricScore {
  rubricId: UUID;
  criterionScores: Record<string, RubricCriterionScore>;
  totalScore: number;
  maxScore: number;
}

export interface RubricCriterionScore {
  criterionId: string;
  levelId: string;
  points: number;
  comment?: string;
}

export interface AttemptFeedback {
  overall: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  resources: Resource[];
  nextSteps: string[];
  estimatedStudyTime: number; // hours
}

export interface ResponseFeedback {
  correct: boolean;
  explanation: string;
  hints: string[];
  correctAnswer?: string;
  resources: Resource[];
  improvements: string[];
}

export interface Resource {
  title: string;
  type: 'article' | 'video' | 'book' | 'course' | 'practice';
  url: string;
  description: string;
  duration?: number;
  difficulty: DifficultyLevel;
}

export interface AttemptMetadata {
  browser: string;
  device: string;
  ipAddress: string;
  userAgent: string;
  screenResolution: string;
  timeZone: string;
  location?: GeolocationData;
  sessionId: string;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Timestamp;
}

export interface SecurityData {
  violations: SecurityViolation[];
  behaviorMetrics: BehaviorMetrics;
  integrityScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SecurityViolation {
  type: ViolationType;
  severity: 'minor' | 'major' | 'critical';
  timestamp: Timestamp;
  description: string;
  evidence?: any;
  resolved: boolean;
}

export enum ViolationType {
  TAB_SWITCH = 'tab-switch',
  WINDOW_BLUR = 'window-blur',
  RIGHT_CLICK = 'right-click',
  COPY_PASTE = 'copy-paste',
  DEVELOPER_TOOLS = 'developer-tools',
  MULTIPLE_FACES = 'multiple-faces',
  NO_FACE = 'no-face',
  AUDIO_DETECTED = 'audio-detected',
  UNAUTHORIZED_AID = 'unauthorized-aid',
  SUSPICIOUS_BEHAVIOR = 'suspicious-behavior',
}

export interface BehaviorMetrics {
  keystrokePattern: KeystrokePattern;
  mouseMovement: MouseMovementPattern;
  responsePattern: ResponsePattern;
  timingPattern: TimingPattern;
  focusPattern: FocusPattern;
}

export interface KeystrokePattern {
  averageSpeed: number; // WPM
  pauseFrequency: number;
  deletionRate: number;
  typingRhythm: number[];
  unusual: boolean;
}

export interface MouseMovementPattern {
  averageSpeed: number;
  clickAccuracy: number;
  movementSmoothness: number;
  clickPattern: number[];
  unusual: boolean;
}

export interface ResponsePattern {
  averageThinkTime: number;
  consistencyScore: number;
  difficultyCorrelation: number;
  speedAccuracyTrade: number;
  unusual: boolean;
}

export interface TimingPattern {
  totalTime: number;
  timePerQuestion: number[];
  rushingIndicators: number;
  pauseFrequency: number;
  unusual: boolean;
}

export interface FocusPattern {
  focusLossCount: number;
  averageFocusTime: number;
  timeOffScreen: number;
  suspiciousLosses: number;
  unusual: boolean;
}

export interface ProctoringData {
  sessionId: string;
  provider: ProctoringProvider;
  recordings: ProctoringRecording[];
  flags: ProctoringFlag[];
  review: ProctoringReviewData;
}

export interface ProctoringRecording {
  type: 'screen' | 'webcam' | 'audio';
  url: string;
  duration: number;
  startTime: Timestamp;
  endTime: Timestamp;
  size: number;
}

export interface ProctoringFlag {
  type: AlertType;
  severity: 'low' | 'medium' | 'high';
  timestamp: Timestamp;
  description: string;
  screenshot?: string;
  videoTimestamp?: number;
  resolved: boolean;
  reviewerNotes?: string;
}

export interface ProctoringReviewData {
  reviewerId?: UUID;
  reviewTime?: Timestamp;
  integrityScore: number;
  verdict: 'clear' | 'minor-violation' | 'major-violation' | 'invalid';
  notes: string;
  flagsReviewed: number;
  recommendations: string[];
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

export interface AssessmentAnalytics {
  id: UUID;
  assessmentId: UUID;
  generatedAt: Timestamp;
  participantCount: number;
  completionRate: number;
  averageScore: number;
  averageTime: number;
  reliability: ReliabilityMetrics;
  validity: ValidityMetrics;
  itemAnalysis: ItemAnalysisData;
  performanceDistribution: PerformanceDistribution;
  trends: PerformanceTrends;
  recommendations: AnalyticsRecommendations;
}

export interface ReliabilityMetrics {
  cronbachAlpha: number;
  splitHalf: number;
  testRetest?: number;
  interRater?: number;
  sem: number; // Standard Error of Measurement
  confidence: number;
}

export interface ValidityMetrics {
  contentValidity: number;
  constructValidity: number;
  criterionValidity?: number;
  faceValidity: number;
  discriminantValidity: number;
}

export interface ItemAnalysisData {
  items: ItemAnalysis[];
  flaggedItems: UUID[];
  recommendedRevisions: ItemRevision[];
  qualityDistribution: Record<string, number>;
}

export interface ItemAnalysis {
  questionId: UUID;
  difficultyIndex: number; // p-value
  discriminationIndex: number; // point-biserial correlation
  distractorAnalysis: DistractorAnalysis[];
  responseTimeAnalysis: ResponseTimeAnalysis;
  flagged: boolean;
  flagReasons: string[];
  qualityScore: number;
  improvementSuggestions: string[];
}

export interface DistractorAnalysis {
  optionId: string;
  selectedBy: number; // count
  selectedByHigh: number; // top 27%
  selectedByLow: number; // bottom 27%
  discrimination: number;
  effectiveness: number;
}

export interface ResponseTimeAnalysis {
  average: number;
  median: number;
  standardDeviation: number;
  outliers: number;
  timeEfficiency: number;
}

export interface ItemRevision {
  questionId: UUID;
  issue: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  impact: number;
}

export interface PerformanceDistribution {
  histogram: PerformanceBin[];
  percentiles: Record<number, number>;
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  skewness: number;
  kurtosis: number;
}

export interface PerformanceBin {
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface PerformanceTrends {
  timeBasedTrends: TimeTrend[];
  demographicTrends: DemographicTrend[];
  cohortComparisons: CohortComparison[];
  predictiveIndicators: PredictiveIndicator[];
}

export interface TimeTrend {
  period: string;
  averageScore: number;
  completionRate: number;
  participantCount: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface DemographicTrend {
  category: string;
  subcategory: string;
  averageScore: number;
  count: number;
  compared: number; // compared to overall average
}

export interface CohortComparison {
  cohortId: string;
  cohortName: string;
  averageScore: number;
  completionRate: number;
  rank: number;
  improvement: number;
}

export interface PredictiveIndicator {
  factor: string;
  correlation: number;
  significance: number;
  impact: 'positive' | 'negative' | 'neutral';
  recommendation: string;
}

export interface AnalyticsRecommendations {
  assessmentLevel: AssessmentRecommendation[];
  questionLevel: QuestionRecommendation[];
  participantLevel: ParticipantRecommendation[];
  systemLevel: SystemRecommendation[];
}

export interface AssessmentRecommendation {
  type: 'difficulty' | 'time' | 'content' | 'format';
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
}

export interface QuestionRecommendation {
  questionId: UUID;
  type: 'remove' | 'revise' | 'replace' | 'enhance';
  description: string;
  specifics: string[];
  impact: number;
}

export interface ParticipantRecommendation {
  participantId: UUID;
  type: 'remediation' | 'advancement' | 'support' | 'intervention';
  description: string;
  resources: Resource[];
  timeline: string;
}

export interface SystemRecommendation {
  component: 'security' | 'accessibility' | 'performance' | 'usability';
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
}

// ============================================================================
// ACCESSIBILITY FEATURES
// ============================================================================

export interface AssessmentAccessibility {
  enabled: boolean;
  accommodations: Accommodation[];
  assistiveTechnology: AssistiveTechnologySupport;
  universalDesign: UniversalDesignFeatures;
  compliance: AccessibilityCompliance;
}

export interface Accommodation {
  id: UUID;
  participantId: UUID;
  type: AccommodationType;
  description: string;
  configuration: AccommodationConfig;
  approvedBy: UUID;
  approvalDate: Timestamp;
  expiryDate?: Timestamp;
  documentation?: string;
}

export enum AccommodationType {
  EXTENDED_TIME = 'extended-time',
  BREAKS = 'breaks',
  LARGE_PRINT = 'large-print',
  SCREEN_READER = 'screen-reader',
  VOICE_RECOGNITION = 'voice-recognition',
  ALTERNATIVE_FORMAT = 'alternative-format',
  SIGN_LANGUAGE = 'sign-language',
  SCRIBES = 'scribes',
  REDUCED_DISTRACTION = 'reduced-distraction',
  ALTERNATIVE_LOCATION = 'alternative-location',
}

export interface AccommodationConfig {
  timeMultiplier?: number; // e.g., 1.5 for 50% extra time
  breakDuration?: number; // minutes
  breakFrequency?: number; // per hour
  fontSize?: number;
  contrast?: 'high' | 'reverse';
  colorScheme?: 'default' | 'high-contrast' | 'dark' | 'custom';
  audioSpeed?: number; // playback speed
  captions?: boolean;
  transcript?: boolean;
  alternativeInput?: 'voice' | 'eye-tracking' | 'switch' | 'joystick';
  customInstructions?: string;
}

export interface AssistiveTechnologySupport {
  screenReaders: ScreenReaderSupport;
  magnification: MagnificationSupport;
  speechRecognition: SpeechRecognitionSupport;
  eyeTracking: EyeTrackingSupport;
  switchNavigation: SwitchNavigationSupport;
}

export interface ScreenReaderSupport {
  compatible: string[]; // JAWS, NVDA, VoiceOver, etc.
  ariaLabels: boolean;
  structuredNavigation: boolean;
  skipLinks: boolean;
  readingOrder: boolean;
  mathMLSupport: boolean;
}

export interface MagnificationSupport {
  zoomLevels: number[];
  panAndZoom: boolean;
  focusTracking: boolean;
  smoothScrolling: boolean;
  colorEnhancement: boolean;
}

export interface SpeechRecognitionSupport {
  voiceCommands: boolean;
  dictation: boolean;
  customVocabulary: boolean;
  languageSupport: string[];
  noiseReduction: boolean;
}

export interface EyeTrackingSupport {
  gazeControl: boolean;
  dwellClick: boolean;
  calibration: boolean;
  heatmapTracking: boolean;
  attentionMetrics: boolean;
}

export interface SwitchNavigationSupport {
  singleSwitch: boolean;
  dualSwitch: boolean;
  scanning: boolean;
  customTiming: boolean;
  repeatRate: number;
}

export interface UniversalDesignFeatures {
  multipleFormats: boolean;
  clearNavigation: boolean;
  consistentLayout: boolean;
  errorPrevention: boolean;
  flexibleTiming: boolean;
  multipleWaysToAccess: boolean;
  clearInstructions: boolean;
}

export interface AccessibilityCompliance {
  wcag: WCAGCompliance;
  section508: boolean;
  ada: boolean;
  iso14289: boolean;
  enEuropean: boolean;
  customStandards: string[];
}

export interface WCAGCompliance {
  version: '2.0' | '2.1' | '2.2';
  level: 'A' | 'AA' | 'AAA';
  guidelines: WCAGGuideline[];
  lastAudit: Timestamp;
  auditScore: number;
}

export interface WCAGGuideline {
  number: string;
  title: string;
  level: 'A' | 'AA' | 'AAA';
  compliant: boolean;
  notes?: string;
}

// ============================================================================
// SCHEDULING & AVAILABILITY
// ============================================================================

export interface SchedulingConfiguration {
  availability: AvailabilityWindow[];
  timeZones: string[];
  scheduling: SchedulingRules;
  notifications: NotificationSettings;
  calendar: CalendarIntegration;
}

export interface AvailabilityWindow {
  id: UUID;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  timeSlots: TimeSlot[];
  restrictions: SchedulingRestriction[];
  capacity?: number;
}

export interface TimeSlot {
  dayOfWeek: number; // 0 = Sunday
  startTime: string; // HH:MM format
  endTime: string;
  timeZone: string;
}

export interface SchedulingRestriction {
  type:
    | 'before_date'
    | 'after_date'
    | 'time_limit'
    | 'attempts'
    | 'prerequisites';
  value: any;
  message: string;
}

export interface SchedulingRules {
  advanceBooking: number; // days
  cancellationDeadline: number; // hours
  rescheduleLimit: number;
  noShowPolicy: 'forfeit' | 'reschedule' | 'extend';
  waitlistEnabled: boolean;
  autoConfirm: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  channels: NotificationChannel[];
  reminders: ReminderSettings;
  escalation: EscalationSettings;
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in-app',
}

export interface ReminderSettings {
  enabled: boolean;
  intervals: number[]; // hours before
  channels: NotificationChannel[];
  customMessage?: string;
}

export interface EscalationSettings {
  enabled: boolean;
  triggers: EscalationTrigger[];
  actions: EscalationAction[];
}

export interface EscalationTrigger {
  condition:
    | 'no_show'
    | 'late_start'
    | 'technical_issue'
    | 'security_violation';
  threshold: number;
  timeframe: number; // minutes
}

export interface EscalationAction {
  action: 'notify_supervisor' | 'extend_time' | 'reschedule' | 'cancel';
  delay: number; // minutes
  recipients: UUID[];
}

export interface CalendarIntegration {
  enabled: boolean;
  providers: CalendarProvider[];
  syncBidirectional: boolean;
  conflictDetection: boolean;
  autoBlock: boolean;
}

export enum CalendarProvider {
  GOOGLE = 'google',
  OUTLOOK = 'outlook',
  APPLE = 'apple',
  EXCHANGE = 'exchange',
  CALDAV = 'caldav',
}

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export interface SystemConfiguration {
  features: FeatureFlags;
  performance: PerformanceSettings;
  storage: StorageSettings;
  integration: IntegrationSettings;
  monitoring: MonitoringSettings;
}

export interface FeatureFlags {
  adaptiveTesting: boolean;
  mlGrading: boolean;
  proctoring: boolean;
  behaviorAnalysis: boolean;
  plagiarismDetection: boolean;
  voiceRecognition: boolean;
  faceRecognition: boolean;
  advancedAnalytics: boolean;
  realTimeCollaboration: boolean;
  offlineMode: boolean;
}

export interface PerformanceSettings {
  maxConcurrentUsers: number;
  requestTimeout: number;
  cachePolicy: CachePolicy;
  compressionEnabled: boolean;
  cdnEnabled: boolean;
  loadBalancing: LoadBalancingConfig;
}

export interface CachePolicy {
  enabled: boolean;
  duration: number; // seconds
  levels: CacheLevel[];
  invalidationStrategy: 'time' | 'event' | 'manual';
}

export enum CacheLevel {
  BROWSER = 'browser',
  CDN = 'cdn',
  APPLICATION = 'application',
  DATABASE = 'database',
}

export interface LoadBalancingConfig {
  algorithm: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
  healthChecks: boolean;
  failover: boolean;
  sessionAffinity: boolean;
}

export interface StorageSettings {
  primary: StorageProvider;
  backup: StorageProvider;
  archival: StorageProvider;
  retention: RetentionPolicy;
  encryption: EncryptionSettings;
}

export interface StorageProvider {
  type: 'local' | 'aws-s3' | 'azure-blob' | 'gcp-storage' | 'custom';
  configuration: Record<string, any>;
  capacity: number; // GB
  bandwidth: number; // Mbps
}

export interface RetentionPolicy {
  assessments: number; // years
  responses: number;
  recordings: number;
  analytics: number;
  logs: number;
  autoArchive: boolean;
  autoPurge: boolean;
}

export interface EncryptionSettings {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
  keyRotation: boolean;
  rotationInterval: number; // days
}

export interface IntegrationSettings {
  lms: LMSIntegration[];
  sis: SISIntegration[];
  sso: SSOIntegration[];
  apis: APIIntegration[];
}

export interface LMSIntegration {
  provider: string;
  enabled: boolean;
  configuration: Record<string, any>;
  syncSettings: SyncSettings;
}

export interface SISIntegration {
  provider: string;
  enabled: boolean;
  configuration: Record<string, any>;
  syncSettings: SyncSettings;
}

export interface SSOIntegration {
  provider: string;
  protocol: 'saml' | 'oauth' | 'oidc' | 'ldap';
  enabled: boolean;
  configuration: Record<string, any>;
}

export interface APIIntegration {
  name: string;
  endpoint: string;
  authentication: 'api-key' | 'oauth' | 'basic' | 'jwt';
  enabled: boolean;
  rateLimit: number;
}

export interface SyncSettings {
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  direction: 'import' | 'export' | 'bidirectional';
  conflictResolution: 'source-wins' | 'target-wins' | 'manual' | 'merge';
}

export interface MonitoringSettings {
  logging: LoggingSettings;
  metrics: MetricsSettings;
  alerting: AlertingSettings;
  reporting: ReportingSettings;
}

export interface LoggingSettings {
  level: 'debug' | 'info' | 'warn' | 'error';
  destinations: LogDestination[];
  retention: number; // days
  sampling: number; // percentage
}

export interface LogDestination {
  type: 'file' | 'database' | 'syslog' | 'cloud';
  configuration: Record<string, any>;
}

export interface MetricsSettings {
  enabled: boolean;
  collectors: MetricCollector[];
  dashboards: DashboardConfig[];
  retention: number; // days
}

export interface MetricCollector {
  name: string;
  type: 'system' | 'application' | 'business';
  interval: number; // seconds
  enabled: boolean;
}

export interface DashboardConfig {
  name: string;
  widgets: DashboardWidget[];
  refreshInterval: number; // seconds
  permissions: UUID[];
}

export interface DashboardWidget {
  type: 'chart' | 'table' | 'metric' | 'alert';
  title: string;
  dataSource: string;
  configuration: Record<string, any>;
}

export interface AlertingSettings {
  enabled: boolean;
  rules: AlertRule[];
  channels: AlertChannel[];
  escalation: AlertEscalation[];
}

export interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
}

export interface AlertChannel {
  type: 'email' | 'sms' | 'slack' | 'webhook';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface AlertEscalation {
  rule: string;
  delay: number; // minutes
  channels: string[];
  recipients: UUID[];
}

export interface ReportingSettings {
  automated: AutomatedReport[];
  customReports: CustomReport[];
  distribution: ReportDistribution[];
}

export interface AutomatedReport {
  name: string;
  type: 'performance' | 'security' | 'usage' | 'compliance';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: UUID[];
  format: 'pdf' | 'html' | 'csv' | 'json';
}

export interface CustomReport {
  id: UUID;
  name: string;
  query: string;
  parameters: ReportParameter[];
  template: string;
  permissions: UUID[];
}

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: any;
}

export interface ReportDistribution {
  reportId: UUID;
  schedule: string; // cron expression
  recipients: UUID[];
  delivery: 'email' | 'download' | 'api';
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const QuestionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.any(), // Will be validated based on type
  points: z.number().min(0).max(1000),
  timeLimit: z.number().min(0).optional(),
  difficulty: z.nativeEnum(DifficultyLevel),
  cognitiveDomain: z.nativeEnum(CognitiveDomain),
  tags: z.array(z.string()).max(20),
  categories: z.array(z.string()).max(10),
  subject: z.string().min(1).max(100),
  topic: z.string().min(1).max(100),
  learningObjectives: z.array(z.string()).max(10),
  status: z.enum(['draft', 'review', 'published', 'archived']),
  version: z.number().min(1),
});

export const AssessmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  instructions: z.string().max(5000),
  type: z.nativeEnum(AssessmentType),
  questions: z.array(z.any()).min(1).max(1000),
  status: z.enum(['draft', 'published', 'archived']),
});

export const ResponseSchema = z.object({
  id: z.string().uuid(),
  questionId: z.string().uuid(),
  attemptId: z.string().uuid(),
  response: z.any(), // Validated based on question type
  responseTime: z.number().min(0),
});

// Export all types for external use
// Note: These module imports are commented out as the separate files don't exist yet
// All types are defined in this single file for now
// export * from './question-types';
// export * from './grading-types';
// export * from './security-types';
// export * from './analytics-types';
