/**
 * User Profile System - Core Types & Interfaces
 * 
 * Comprehensive type definitions for dynamic user profiles with skills tracking,
 * learning preferences, social features, and PDPA compliance.
 */

// ===========================================
// Core Profile Types
// ===========================================

export interface UserProfile {
  id: string;
  userId: string;
  personalInfo: PersonalInformation;
  professionalInfo: ProfessionalInformation;
  skills: SkillProfile;
  learningPreferences: LearningPreferences;
  accessibility: AccessibilitySettings;
  privacy: PrivacySettings;
  social: SocialProfile;
  goals: GoalProfile;
  progress: ProgressTracking;
  hrIntegration: HRIntegrationData;
  metadata: ProfileMetadata;
}

// ===========================================
// Personal Information
// ===========================================

export interface PersonalInformation {
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  nationality?: string;
  languages: LanguageProficiency[];
  timeZone: string;
  location: LocationInfo;
  profilePicture?: string;
  biography?: string;
  interests: string[];
}

export interface LanguageProficiency {
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'native';
  certifications?: string[];
}

export interface LocationInfo {
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
  remote: boolean;
}

// ===========================================
// Professional Information
// ===========================================

export interface ProfessionalInformation {
  employeeId?: string;
  jobTitle: string;
  department: string;
  division?: string;
  manager?: string;
  directReports?: string[];
  startDate: Date;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  workLocation: 'office' | 'remote' | 'hybrid';
  costCenter?: string;
  grade?: string;
  band?: string;
  experience: WorkExperience[];
  education: EducationRecord[];
  certifications: ProfessionalCertification[];
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  department?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
  achievements: string[];
  skills: string[];
}

export interface EducationRecord {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  honors?: string[];
  relevant: boolean;
}

export interface ProfessionalCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
  skills: string[];
  isActive: boolean;
}

// ===========================================
// Skills Framework (SSG Integration)
// ===========================================

export interface SkillProfile {
  skillsets: Skillset[];
  competencies: CompetencyMapping[];
  assessments: SkillAssessment[];
  endorsements: SkillEndorsement[];
  developmentPlan: SkillDevelopmentPlan;
  ssgMapping: SSGSkillMapping;
}

export interface Skillset {
  id: string;
  category: SkillCategory;
  name: string;
  level: SkillLevel;
  proficiency: number; // 0-100
  lastAssessed: Date;
  selfRated: boolean;
  validated: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relevantToRole: boolean;
  yearsOfExperience?: number;
  certifications: string[];
  projects: string[];
}

export type SkillCategory = 
  | 'technical' 
  | 'soft-skills' 
  | 'leadership' 
  | 'domain-specific' 
  | 'digital-literacy'
  | 'compliance'
  | 'safety';

export type SkillLevel = 
  | 'novice' 
  | 'advanced-beginner' 
  | 'competent' 
  | 'proficient' 
  | 'expert';

export interface CompetencyMapping {
  id: string;
  competencyFramework: string; // SSG, internal, industry-standard
  competencyId: string;
  competencyName: string;
  currentLevel: number;
  targetLevel: number;
  gapAnalysis: CompetencyGap[];
  developmentActions: string[];
}

export interface CompetencyGap {
  area: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  priority: 'low' | 'medium' | 'high';
  recommendedActions: string[];
}

export interface SkillAssessment {
  id: string;
  skillId: string;
  assessmentType: 'self' | 'peer' | 'supervisor' | 'external' | 'automated';
  assessorId?: string;
  score: number;
  maxScore: number;
  assessmentDate: Date;
  notes?: string;
  validUntil?: Date;
  evidence: AssessmentEvidence[];
}

export interface AssessmentEvidence {
  type: 'project' | 'certification' | 'observation' | 'test' | 'portfolio';
  description: string;
  url?: string;
  verifiedBy?: string;
  date: Date;
}

export interface SkillEndorsement {
  id: string;
  skillId: string;
  endorsedBy: string;
  endorserRole: string;
  relationship: 'colleague' | 'supervisor' | 'client' | 'subordinate';
  endorsementDate: Date;
  comment?: string;
  strength: 1 | 2 | 3 | 4 | 5;
}

export interface SkillDevelopmentPlan {
  id: string;
  createdDate: Date;
  lastUpdated: Date;
  targetRole?: string;
  skillGaps: CompetencyGap[];
  developmentGoals: SkillGoal[];
  timeline: DevelopmentTimeline;
  budget?: number;
  approvedBy?: string;
  status: 'draft' | 'approved' | 'in-progress' | 'completed' | 'cancelled';
}

export interface SkillGoal {
  id: string;
  skillId: string;
  currentLevel: number;
  targetLevel: number;
  targetDate: Date;
  learningPath: string[];
  milestones: SkillMilestone[];
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
}

export interface SkillMilestone {
  id: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
  evidence?: string[];
}

export interface DevelopmentTimeline {
  phases: DevelopmentPhase[];
  totalDuration: number; // in days
  estimatedCost?: number;
}

export interface DevelopmentPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  activities: LearningActivity[];
  prerequisites?: string[];
  deliverables: string[];
}

export interface LearningActivity {
  id: string;
  type: 'course' | 'workshop' | 'mentoring' | 'project' | 'reading' | 'practice';
  name: string;
  provider?: string;
  duration: number; // in hours
  cost?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'enrolled' | 'in-progress' | 'completed' | 'cancelled';
}

// ===========================================
// SSG Skills Framework Integration
// ===========================================

export interface SSGSkillMapping {
  ssgFrameworkVersion: string;
  mappedSkills: SSGSkillMap[];
  competencyLevels: SSGCompetencyLevel[];
  industryAlignment: IndustryAlignment;
  lastSyncDate: Date;
}

export interface SSGSkillMap {
  internalSkillId: string;
  ssgSkillCode: string;
  ssgSkillName: string;
  ssgCategory: string;
  ssgSubCategory?: string;
  mappingConfidence: number; // 0-1
  lastValidated: Date;
  validatedBy?: string;
}

export interface SSGCompetencyLevel {
  ssgLevelCode: string;
  ssgLevelName: string;
  internalLevelMapping: SkillLevel;
  description: string;
  requirements: string[];
}

export interface IndustryAlignment {
  industry: string;
  subIndustry?: string;
  relevantFrameworks: string[];
  complianceRequirements: string[];
  mandatorySkills: string[];
}

// ===========================================
// Learning Preferences & Accessibility
// ===========================================

export interface LearningPreferences {
  learningStyles: LearningStyle[];
  contentFormats: ContentFormatPreference[];
  pace: LearningPace;
  schedule: LearningSchedule;
  environment: LearningEnvironment;
  motivation: MotivationFactors;
  feedback: FeedbackPreferences;
}

export interface LearningStyle {
  style: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';
  preference: number; // 1-5 scale
}

export interface ContentFormatPreference {
  format: 'video' | 'text' | 'interactive' | 'audio' | 'simulation' | 'vr-ar';
  preference: number; // 1-5 scale
  accessibility: boolean;
}

export interface LearningPace {
  preferredPace: 'self-paced' | 'instructor-led' | 'blended';
  sessionDuration: number; // preferred minutes per session
  frequency: 'daily' | 'few-times-week' | 'weekly' | 'bi-weekly' | 'monthly';
  intensivePreference: boolean;
}

export interface LearningSchedule {
  timeZone: string;
  preferredTimes: TimeSlot[];
  availability: WeeklyAvailability;
  deadlinePreference: 'flexible' | 'structured' | 'strict';
}

export interface TimeSlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface WeeklyAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface LearningEnvironment {
  location: 'office' | 'home' | 'library' | 'cafe' | 'flexible';
  quietEnvironment: boolean;
  collaborativePreference: boolean;
  devicePreferences: DevicePreference[];
}

export interface DevicePreference {
  device: 'desktop' | 'laptop' | 'tablet' | 'mobile';
  preference: number; // 1-5 scale
  primaryDevice: boolean;
}

export interface MotivationFactors {
  intrinsicMotivators: string[];
  extrinsicMotivators: string[];
  gamificationPreference: boolean;
  competitionComfort: boolean;
  recognitionPreference: 'public' | 'private' | 'none';
}

export interface FeedbackPreferences {
  frequency: 'immediate' | 'daily' | 'weekly' | 'on-completion';
  style: 'detailed' | 'summary' | 'visual' | 'minimal';
  source: 'automated' | 'instructor' | 'peer' | 'mixed';
  deliveryMethod: 'email' | 'app' | 'dashboard' | 'verbal';
}

// ===========================================
// Accessibility Settings
// ===========================================

export interface AccessibilitySettings {
  enabled: boolean;
  visualImpairments: VisualAccessibility;
  hearingImpairments: HearingAccessibility;
  motorImpairments: MotorAccessibility;
  cognitiveSupport: CognitiveAccessibility;
  assistiveTechnology: AssistiveTechnology[];
  compliance: AccessibilityCompliance;
}

export interface VisualAccessibility {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  fontSize: number;
  colorBlindness: ColorBlindnessType;
  magnification: number;
  reduceMotion: boolean;
}

export type ColorBlindnessType = 
  | 'none' 
  | 'protanopia' 
  | 'deuteranopia' 
  | 'tritanopia' 
  | 'achromatopsia';

export interface HearingAccessibility {
  closedCaptions: boolean;
  signLanguage: boolean;
  audioDescriptions: boolean;
  transcripts: boolean;
  visualAlerts: boolean;
  amplification: boolean;
}

export interface MotorAccessibility {
  keyboardNavigation: boolean;
  voiceControl: boolean;
  stickyKeys: boolean;
  slowKeys: boolean;
  bounceKeys: boolean;
  mouseAlternatives: boolean;
  customShortcuts: KeyboardShortcut[];
}

export interface KeyboardShortcut {
  action: string;
  keys: string[];
  enabled: boolean;
}

export interface CognitiveAccessibility {
  simplifiedInterface: boolean;
  reducedCognitive: boolean;
  extraTime: boolean;
  timeExtensionFactor: number;
  reminderSettings: ReminderSettings;
  focusSupport: boolean;
  distractionReduction: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  frequency: number; // minutes
  methods: ('notification' | 'email' | 'sms')[];
  customMessages: boolean;
}

export interface AssistiveTechnology {
  type: string;
  name: string;
  version?: string;
  compatibility: boolean;
  settings?: Record<string, any>;
}

export interface AccessibilityCompliance {
  wcagLevel: 'A' | 'AA' | 'AAA';
  section508: boolean;
  ada: boolean;
  localCompliance: string[];
  lastAudit?: Date;
  auditResult?: string;
}

// ===========================================
// Privacy & Data Protection (PDPA)
// ===========================================

export interface PrivacySettings {
  dataProcessingConsent: DataConsent;
  profileVisibility: ProfileVisibilityType;
  dataSharing: DataSharingSettings;
  retention: DataRetentionSettings;
  rights: DataSubjectRights;
  auditTrail: PrivacyAuditLog[];
  compliance: PrivacyCompliance;
  lastUpdated: Date;
  // Additional fields for comprehensive privacy management
  dataMinimization: boolean;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  dataRetention: {
    profileData: number;
    activityLogs: number;
    assessmentData: number;
  };
  anonymization: {
    enableAutoAnonymization: boolean;
    anonymizeAfterInactivity: number;
  };
  cookieConsent: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
}

export interface DataConsent {
  personalData: ConsentRecord;
  sensitiveData: ConsentRecord;
  marketing: ConsentRecord;
  analytics: ConsentRecord;
  thirdParty: ConsentRecord;
  research: ConsentRecord;
  lastUpdated: Date;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  grantedDate?: Date;
  withdrawnDate?: Date;
  withdrawn: boolean;
  purpose: string[];
  legalBasis: 'consent' | 'contract' | 'legal-obligation' | 'vital-interests' | 'public-task' | 'legitimate-interests';
  consentVersion: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ProfileVisibility {
  public: boolean;
  organization: boolean;
  team: boolean;
  mentors: boolean;
  peers: boolean;
  specific: string[];
  hiddenFields: string[];
  searchable: boolean;
}

export type ProfileVisibilityType = ProfileVisibility | 'public' | 'private' | 'organization' | 'team';

export interface DataSharingSettings {
  hrSystem: boolean;
  learningPlatforms: boolean;
  assessmentProviders: boolean;
  certificationBodies: boolean;
  mentorshipPlatforms: boolean;
  recruiters: boolean;
  analytics: boolean;
  thirdParty: boolean;
  research: boolean;
  marketing: boolean;
  thirdPartyAnalytics: boolean;
  researchPartners: boolean;
  approvedPartners: string[];
}

export interface DataRetentionSettings {
  retentionPeriod: number; // in years
  autoDelete: boolean;
  archiveAfter: number; // in years
  deleteAfterTermination: boolean;
  gracePeriod: number; // in days
  exceptions: string[];
}

export interface DataSubjectRights {
  accessRequests: AccessRequest[];
  rectificationRequests: RectificationRequest[];
  erasureRequests: ErasureRequest[];
  portabilityRequests: PortabilityRequest[];
  objectionRequests: ObjectionRequest[];
}

export interface AccessRequest {
  id: string;
  requestDate: Date;
  processedDate?: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  deliveryMethod: 'email' | 'download' | 'mail';
  deliveredDate?: Date;
}

export interface RectificationRequest {
  id: string;
  requestDate: Date;
  processedDate?: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  fields: string[];
  justification: string;
}

export interface ErasureRequest {
  id: string;
  requestDate: Date;
  processedDate?: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  scope: 'partial' | 'complete';
  exceptions: string[];
  reason: string;
}

export interface PortabilityRequest {
  id: string;
  requestDate: Date;
  processedDate?: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  format: 'json' | 'xml' | 'csv' | 'pdf';
  scope: string[];
  deliveryMethod: 'download' | 'email' | 'api';
}

export interface ObjectionRequest {
  id: string;
  requestDate: Date;
  processedDate?: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  processingActivity: string;
  reason: string;
  outcome: 'upheld' | 'rejected' | 'partial';
}

export interface PrivacyAuditLog {
  id: string;
  userId: string;
  timestamp: Date;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  details?: any;
  performedBy: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PrivacyCompliance {
  pdpaCompliant: boolean;
  gdprCompliant: boolean;
  localRegulations: string[];
  lastAssessment: Date;
  assessmentResult: string;
  remedialActions: string[];
  dpoContact?: string;
}

// ===========================================
// Social Features & Networking
// ===========================================

export interface SocialProfile {
  networking: NetworkingProfile;
  mentorship: MentorshipProfile;
  collaboration: CollaborationProfile;
  community: CommunityParticipation;
  reputation: ReputationSystem;
  connections: SocialConnections;
}

export interface NetworkingProfile {
  openToNetworking: boolean;
  networkingGoals: string[];
  industries: string[];
  roles: string[];
  experienceLevels: string[];
  geographicPreferences: string[];
  languagePreferences: string[];
  meetingPreferences: MeetingPreferences;
}

export interface MeetingPreferences {
  virtual: boolean;
  inPerson: boolean;
  groupSettings: boolean;
  oneOnOne: boolean;
  preferredDuration: number; // in minutes
  timeZoneFlexibility: boolean;
}

export interface MentorshipProfile {
  role: 'mentor' | 'mentee' | 'both' | 'none';
  mentorProfile?: MentorProfile;
  menteeProfile?: MenteeProfile;
  relationships: MentorshipRelationship[];
  availability: MentorshipAvailability;
}

export interface MentorProfile {
  expertiseAreas: string[];
  mentoringExperience: number; // in years
  maxMentees: number;
  currentMentees: number;
  mentoringStyle: string[];
  approach: 'structured' | 'informal' | 'flexible';
  commitment: 'short-term' | 'long-term' | 'project-based';
  certifications: string[];
}

export interface MenteeProfile {
  developmentAreas: string[];
  careerGoals: string[];
  currentChallenges: string[];
  preferredMentorProfile: MentorPreferences;
  commitment: 'short-term' | 'long-term' | 'project-based';
  previousMentorships: number;
}

export interface MentorPreferences {
  experienceLevel: 'any' | 'senior' | 'executive' | 'peer';
  industryBackground: string[];
  mentoringStyle: string[];
  gender?: 'any' | 'male' | 'female' | 'non-binary';
  languages: string[];
  timeZoneCompatibility: boolean;
}

export interface MentorshipRelationship {
  id: string;
  partnerId: string;
  role: 'mentor' | 'mentee';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  goals: string[];
  meetingFrequency: string;
  lastMeeting?: Date;
  nextMeeting?: Date;
  progress: MentorshipProgress[];
}

export interface MentorshipProgress {
  date: Date;
  milestone: string;
  status: 'achieved' | 'in-progress' | 'postponed';
  notes?: string;
  rating?: number;
}

export interface MentorshipAvailability {
  hoursPerWeek: number;
  timeSlots: TimeSlot[];
  blackoutDates: DateRange[];
  responseTime: string;
}

export interface DateRange {
  start: Date;
  end: Date;
  reason?: string;
}

export interface CollaborationProfile {
  openToCollaboration: boolean;
  collaborationTypes: CollaborationType[];
  projectInterests: string[];
  skills: string[];
  availability: CollaborationAvailability;
  pastCollaborations: CollaborationHistory[];
}

export type CollaborationType = 
  | 'project-work'
  | 'research'
  | 'knowledge-sharing'
  | 'skill-exchange'
  | 'innovation'
  | 'community-building';

export interface CollaborationAvailability {
  hoursPerWeek: number;
  duration: 'short-term' | 'medium-term' | 'long-term' | 'flexible';
  commitment: 'low' | 'medium' | 'high';
  remoteFriendly: boolean;
}

export interface CollaborationHistory {
  id: string;
  projectName: string;
  collaborators: string[];
  startDate: Date;
  endDate?: Date;
  outcome: string;
  skills: string[];
  rating: number;
  testimonial?: string;
}

export interface CommunityParticipation {
  groups: CommunityGroup[];
  forums: ForumParticipation[];
  events: EventParticipation[];
  contributions: CommunityContribution[];
  reputation: number;
}

export interface CommunityGroup {
  id: string;
  name: string;
  type: 'professional' | 'interest' | 'learning' | 'project';
  role: 'member' | 'moderator' | 'admin' | 'founder';
  joinDate: Date;
  participationLevel: 'active' | 'moderate' | 'passive';
  contributions: number;
}

export interface ForumParticipation {
  forumId: string;
  posts: number;
  replies: number;
  likes: number;
  reputation: number;
  badges: string[];
  expertiseAreas: string[];
}

export interface EventParticipation {
  eventId: string;
  eventType: 'workshop' | 'webinar' | 'conference' | 'meetup' | 'hackathon';
  role: 'attendee' | 'speaker' | 'organizer' | 'sponsor';
  participationDate: Date;
  feedback?: EventFeedback;
}

export interface EventFeedback {
  rating: number;
  feedback: string;
  wouldRecommend: boolean;
  followUpInterest: boolean;
}

export interface CommunityContribution {
  id: string;
  type: 'article' | 'tutorial' | 'code' | 'template' | 'resource' | 'answer';
  title: string;
  description: string;
  url?: string;
  publishDate: Date;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  tags: string[];
}

export interface ReputationSystem {
  overallScore: number;
  categoryScores: CategoryReputation[];
  badges: Badge[];
  achievements: Achievement[];
  endorsements: number;
  testimonials: Testimonial[];
}

export interface CategoryReputation {
  category: string;
  score: number;
  rank: string;
  percentile: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  earnedDate: Date;
  criteria: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: Date;
  points: number;
  category: string;
  evidence?: string[];
}

export interface Testimonial {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  skills: string[];
  relationship: string;
  date: Date;
  verified: boolean;
}

export interface SocialConnections {
  connections: Connection[];
  pendingInvitations: Invitation[];
  blockedUsers: string[];
  followedUsers: string[];
  followers: string[];
  networkStrength: NetworkAnalytics;
}

export interface Connection {
  userId: string;
  connectionType: 'colleague' | 'mentor' | 'mentee' | 'collaborator' | 'friend' | 'professional';
  connectionDate: Date;
  strength: number; // 1-5
  mutualConnections: number;
  interactions: number;
  lastInteraction?: Date;
  tags: string[];
}

export interface Invitation {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: 'connection' | 'mentorship' | 'collaboration' | 'group-invitation';
  message?: string;
  sentDate: Date;
  expiryDate: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface NetworkAnalytics {
  totalConnections: number;
  connectionGrowthRate: number;
  networkDiversity: number;
  influenceScore: number;
  bridgingCapital: number;
  bondingCapital: number;
  networkHealth: number;
}

// ===========================================
// Goals & Progress Tracking
// ===========================================

export interface GoalProfile {
  personalGoals: Goal[];
  professionalGoals: Goal[];
  learningGoals: Goal[];
  careerGoals: Goal[];
  goalTemplates: GoalTemplate[];
  goalTracking: GoalTracking;
}

export interface Goal {
  id: string;
  type: 'personal' | 'professional' | 'learning' | 'career' | 'skill' | 'project';
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  visibility: 'private' | 'team' | 'organization' | 'public';
  createdDate: Date;
  startDate: Date;
  targetDate: Date;
  completedDate?: Date;
  progress: number; // 0-100
  metrics: GoalMetric[];
  milestones: Milestone[];
  dependencies: string[];
  stakeholders: Stakeholder[];
  resources: Resource[];
  challenges: Challenge[];
  successCriteria: string[];
  tags: string[];
}

export interface GoalMetric {
  id: string;
  name: string;
  type: 'numeric' | 'percentage' | 'boolean' | 'duration' | 'frequency';
  currentValue: number | boolean | string;
  targetValue: number | boolean | string;
  unit?: string;
  lastUpdated: Date;
  trend: 'improving' | 'stable' | 'declining';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
  dependencies: string[];
  deliverables: string[];
  evidence: Evidence[];
}

export interface Evidence {
  type: 'document' | 'certificate' | 'project' | 'assessment' | 'testimonial';
  title: string;
  description?: string;
  url?: string;
  uploadDate: Date;
  verifiedBy?: string;
  verificationDate?: Date;
}

export interface Stakeholder {
  userId: string;
  role: 'owner' | 'sponsor' | 'mentor' | 'reviewer' | 'collaborator' | 'observer';
  involvement: 'high' | 'medium' | 'low';
  permissions: ('view' | 'edit' | 'approve' | 'delete')[];
}

export interface Resource {
  id: string;
  type: 'course' | 'book' | 'mentor' | 'tool' | 'budget' | 'time' | 'facility';
  name: string;
  description?: string;
  availability: 'available' | 'allocated' | 'unavailable';
  cost?: number;
  url?: string;
  estimatedTime?: number;
}

export interface Challenge {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'mitigating' | 'resolved' | 'escalated';
  identifiedDate: Date;
  resolvedDate?: Date;
  mitigationPlan?: string;
  impact: string;
  lessons: string[];
}

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: Partial<Goal>;
  usageCount: number;
  rating: number;
  isPublic: boolean;
  createdBy: string;
  tags: string[];
}

export interface GoalTracking {
  updateFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  lastUpdate: Date;
  automaticTracking: boolean;
  reminderSettings: TrackingReminder[];
  reportingPreferences: ReportingPreferences;
  analytics: GoalAnalytics;
}

export interface TrackingReminder {
  type: 'progress-update' | 'milestone-due' | 'goal-due' | 'review-scheduled';
  frequency: string;
  method: 'email' | 'app' | 'sms' | 'calendar';
  enabled: boolean;
  customMessage?: string;
}

export interface ReportingPreferences {
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
  format: 'dashboard' | 'email' | 'pdf' | 'presentation';
  recipients: string[];
  includeAnalytics: boolean;
  includeRecommendations: boolean;
}

export interface GoalAnalytics {
  completionRate: number;
  averageTimeToComplete: number;
  successFactors: string[];
  commonChallenges: string[];
  recommendedAdjustments: string[];
  performanceTrends: PerformanceTrend[];
}

export interface PerformanceTrend {
  period: string;
  metric: string;
  value: number;
  change: number;
  changePercent: number;
}

// ===========================================
// Progress Tracking & Analytics
// ===========================================

export interface ProgressTracking {
  overall: OverallProgress;
  skills: SkillProgress[];
  learning: LearningProgress;
  goals: GoalProgressSummary;
  social: SocialProgress;
  analytics: ProgressAnalytics;
  insights: ProgressInsights;
}

export interface OverallProgress {
  profileCompletion: number; // 0-100
  skillsDevelopment: number; // 0-100
  learningEngagement: number; // 0-100
  goalAchievement: number; // 0-100
  socialParticipation: number; // 0-100
  overallScore: number; // 0-100
  lastCalculated: Date;
  trend: 'improving' | 'stable' | 'declining';
}

export interface SkillProgress {
  skillId: string;
  skillName: string;
  category: string;
  initialLevel: number;
  currentLevel: number;
  targetLevel: number;
  progressRate: number;
  timeToTarget: number; // in days
  activities: SkillActivity[];
  assessments: ProgressAssessment[];
}

export interface SkillActivity {
  id: string;
  type: 'course' | 'project' | 'assessment' | 'practice' | 'mentoring';
  name: string;
  date: Date;
  duration: number; // in hours
  skillGain: number;
  feedback?: string;
}

export interface ProgressAssessment {
  id: string;
  date: Date;
  score: number;
  maxScore: number;
  assessorType: 'self' | 'peer' | 'supervisor' | 'external';
  feedback?: string;
  improvement: number;
}

export interface LearningProgress {
  coursesEnrolled: number;
  coursesCompleted: number;
  coursesInProgress: number;
  totalLearningHours: number;
  averageCompletionRate: number;
  averageRating: number;
  certificates: number;
  streakDays: number;
  lastActivity: Date;
  weeklyGoal: number;
  weeklyActual: number;
}

export interface GoalProgressSummary {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  overdueGoals: number;
  completionRate: number;
  averageCompletionTime: number;
  nextMilestone?: Date;
  urgentActions: string[];
}

export interface SocialProgress {
  connections: number;
  mentorshipRelationships: number;
  communityContributions: number;
  reputationScore: number;
  endorsements: number;
  eventParticipation: number;
  knowledgeSharing: number;
  networkGrowth: number;
}

export interface ProgressAnalytics {
  trends: TrendAnalysis[];
  correlations: CorrelationAnalysis[];
  predictions: PredictionModel[];
  benchmarks: BenchmarkComparison[];
  recommendations: Recommendation[];
}

export interface TrendAnalysis {
  metric: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  dataPoints: DataPoint[];
  trendDirection: 'up' | 'down' | 'stable';
  trendStrength: number; // 0-1
  seasonality?: boolean;
}

export interface DataPoint {
  date: Date;
  value: number;
  context?: string;
}

export interface CorrelationAnalysis {
  metric1: string;
  metric2: string;
  correlation: number; // -1 to 1
  significance: number; // 0-1
  interpretation: string;
}

export interface PredictionModel {
  metric: string;
  horizon: number; // days
  prediction: number;
  confidence: number; // 0-1
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  factor: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface BenchmarkComparison {
  metric: string;
  userValue: number;
  benchmarkValue: number;
  benchmarkType: 'peer' | 'role' | 'organization' | 'industry';
  percentile: number;
  gap: number;
}

export interface Recommendation {
  id: string;
  type: 'skill-development' | 'goal-setting' | 'learning-activity' | 'networking' | 'career-move';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  rationale: string;
  actions: RecommendedAction[];
  expectedOutcome: string;
  timeframe: string;
  effort: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
  personalization: number; // 0-1
}

export interface RecommendedAction {
  action: string;
  type: 'immediate' | 'short-term' | 'long-term';
  effort: number; // 1-5
  impact: number; // 1-5
  resources?: string[];
  dependencies?: string[];
}

export interface ProgressInsights {
  strengths: string[];
  improvementAreas: string[];
  achievementHighlights: string[];
  upcomingOpportunities: string[];
  riskFactors: string[];
  motivationalMessages: string[];
  personalizedTips: string[];
}

// ===========================================
// HR System Integration
// ===========================================

export interface HRIntegrationData {
  systemInfo: HRSystemInfo;
  employeeData: HREmployeeData;
  organizationalData: OrganizationalData;
  syncSettings: SyncSettings;
  syncHistory: SyncRecord[];
  dataMapping: FieldMapping[];
  conflicts: DataConflict[];
}

export interface HRSystemInfo {
  systemName: string;
  version: string;
  vendor: string;
  lastSync: Date;
  syncStatus: 'connected' | 'disconnected' | 'error' | 'syncing';
  apiVersion: string;
  capabilities: string[];
  limitations: string[];
}

export interface HREmployeeData {
  employeeId: string;
  payrollNumber?: string;
  workEmail: string;
  managerEmployeeId?: string;
  hrBusinessPartner?: string;
  department: string;
  division?: string;
  location: string;
  costCenter: string;
  jobFamily: string;
  jobLevel: string;
  salaryGrade?: string;
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'on-leave';
  contractType: 'permanent' | 'contract' | 'temporary' | 'intern';
  workingHours: number;
  fte: number; // Full-time equivalent
  probationEndDate?: Date;
  lastPromotionDate?: Date;
  performanceRating?: string;
  skills: HRSkillRecord[];
  competencies: HRCompetencyRecord[];
}

export interface HRSkillRecord {
  skillCode: string;
  skillName: string;
  category: string;
  level: string;
  certificationRequired: boolean;
  lastAssessed?: Date;
  assessor?: string;
  validUntil?: Date;
}

export interface HRCompetencyRecord {
  competencyCode: string;
  competencyName: string;
  framework: string;
  currentLevel: number;
  targetLevel: number;
  assessmentDate?: Date;
  developmentPlan?: string;
}

export interface OrganizationalData {
  organizationChart: OrgChartNode[];
  departments: Department[];
  locations: Location[];
  jobFamilies: JobFamily[];
  competencyFrameworks: CompetencyFramework[];
  skillCatalogs: SkillCatalog[];
}

export interface OrgChartNode {
  employeeId: string;
  managerId?: string;
  level: number;
  span: number; // number of direct reports
  children: string[];
}

export interface Department {
  code: string;
  name: string;
  parentDepartment?: string;
  head: string;
  budget?: number;
  headcount: number;
  description?: string;
}

export interface Location {
  code: string;
  name: string;
  type: 'office' | 'remote' | 'hybrid' | 'field';
  address: string;
  timeZone: string;
  capacity?: number;
  facilities: string[];
}

export interface JobFamily {
  code: string;
  name: string;
  description: string;
  levels: JobLevel[];
  careerPaths: CareerPath[];
  requiredSkills: string[];
  optionalSkills: string[];
}

export interface JobLevel {
  code: string;
  name: string;
  grade: string;
  experience: string;
  responsibilities: string[];
  requirements: string[];
  competencies: string[];
}

export interface CareerPath {
  fromLevel: string;
  toLevel: string;
  typical: boolean;
  requirements: string[];
  averageTime: number; // in months
  successRate: number; // 0-1
}

export interface CompetencyFramework {
  id: string;
  name: string;
  version: string;
  applicableRoles: string[];
  competencies: CompetencyDefinition[];
  assessmentMethods: string[];
}

export interface CompetencyDefinition {
  code: string;
  name: string;
  description: string;
  category: string;
  levels: CompetencyLevelDefinition[];
  behavioralIndicators: string[];
  assessmentCriteria: string[];
}

export interface CompetencyLevelDefinition {
  level: number;
  name: string;
  description: string;
  behaviorExamples: string[];
  assessmentCriteria: string[];
}

export interface SkillCatalog {
  id: string;
  name: string;
  version: string;
  domain: string;
  skills: SkillDefinition[];
  taxonomy: SkillTaxonomy;
}

export interface SkillDefinition {
  code: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  type: 'technical' | 'soft' | 'domain' | 'certification';
  proficiencyLevels: ProficiencyLevelDefinition[];
  relatedSkills: string[];
  certifications: string[];
}

export interface ProficiencyLevelDefinition {
  level: number;
  name: string;
  description: string;
  criteria: string[];
  examples: string[];
  assessmentMethods: string[];
}

export interface SkillTaxonomy {
  categories: SkillTaxonomyCategory[];
  relationships: SkillRelationship[];
  mapping: ExternalMapping[];
}

export interface SkillTaxonomyCategory {
  code: string;
  name: string;
  parent?: string;
  children: string[];
  description: string;
}

export interface SkillRelationship {
  sourceSkill: string;
  targetSkill: string;
  relationship: 'prerequisite' | 'complementary' | 'alternative' | 'builds-on';
  strength: number; // 0-1
}

export interface ExternalMapping {
  internalCode: string;
  externalSystem: string;
  externalCode: string;
  mappingConfidence: number; // 0-1
  lastValidated: Date;
}

export interface SyncSettings {
  autoSync: boolean;
  syncFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  syncTime?: string; // HH:MM format
  fieldsToSync: string[];
  conflictResolution: ConflictResolution;
  dataValidation: boolean;
  errorHandling: ErrorHandling;
}

export interface ConflictResolution {
  strategy: 'hr-wins' | 'lms-wins' | 'newest-wins' | 'manual-review';
  manualReviewThreshold: number;
  autoResolveRules: ResolutionRule[];
}

export interface ResolutionRule {
  field: string;
  condition: string;
  action: 'use-hr' | 'use-lms' | 'merge' | 'flag-review';
  priority: number;
}

export interface ErrorHandling {
  maxRetries: number;
  retryDelay: number; // in seconds
  errorNotification: boolean;
  fallbackBehavior: 'skip' | 'use-cached' | 'manual-intervention';
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface SyncRecord {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental' | 'manual';
  status: 'success' | 'partial' | 'failed';
  recordsProcessed: number;
  recordsUpdated: number;
  recordsSkipped: number;
  recordsErrors: number;
  duration: number; // in seconds
  errors: SyncError[];
  warnings: SyncWarning[];
}

export interface SyncError {
  recordId: string;
  field?: string;
  error: string;
  severity: 'critical' | 'error' | 'warning';
  resolution?: string;
}

export interface SyncWarning {
  recordId: string;
  field?: string;
  warning: string;
  recommendation?: string;
}

export interface FieldMapping {
  lmsField: string;
  hrField: string;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  required: boolean;
  transformation?: TransformationRule;
  validation?: ValidationRule;
}

export interface TransformationRule {
  type: 'format' | 'lookup' | 'calculate' | 'concatenate' | 'split';
  rule: string;
  parameters?: Record<string, any>;
}

export interface ValidationRule {
  type: 'range' | 'pattern' | 'lookup' | 'custom';
  rule: string;
  errorMessage: string;
}

export interface DataConflict {
  id: string;
  recordId: string;
  field: string;
  lmsValue: any;
  hrValue: any;
  detectedDate: Date;
  status: 'pending' | 'resolved' | 'ignored';
  resolution?: ConflictResolutionAction;
  resolvedBy?: string;
  resolvedDate?: Date;
}

export interface ConflictResolutionAction {
  action: 'use-hr' | 'use-lms' | 'merge' | 'custom';
  finalValue: any;
  reason: string;
  confidence: number; // 0-1
}

// ===========================================
// Profile Metadata & System Information
// ===========================================

export interface ProfileMetadata {
  version: string;
  createdDate: Date;
  lastUpdated: Date;
  lastLogin: Date;
  profileCompleteness: ProfileCompleteness;
  dataQuality: DataQualityMetrics;
  systemInfo: SystemInfo;
  auditInfo: AuditInfo;
}

export interface ProfileCompleteness {
  overall: number; // 0-100
  sections: SectionCompleteness[];
  missingCritical: string[];
  recommendations: string[];
  lastCalculated: Date;
}

export interface SectionCompleteness {
  section: string;
  completeness: number; // 0-100
  requiredFields: number;
  completedFields: number;
  criticalMissing: string[];
}

export interface DataQualityMetrics {
  accuracy: number; // 0-100
  completeness: number; // 0-100
  consistency: number; // 0-100
  timeliness: number; // 0-100
  validity: number; // 0-100
  uniqueness: number; // 0-100
  issues: DataQualityIssue[];
  lastAssessment: Date;
}

export interface DataQualityIssue {
  field: string;
  issue: 'missing' | 'invalid' | 'outdated' | 'duplicate' | 'inconsistent';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  autoFixable: boolean;
}

export interface SystemInfo {
  platform: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  region: string;
  features: FeatureFlag[];
  integrations: IntegrationStatus[];
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  conditions?: Record<string, any>;
}

export interface IntegrationStatus {
  system: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  health: 'healthy' | 'degraded' | 'down';
}

export interface AuditInfo {
  createdBy: string;
  lastModifiedBy: string;
  accessHistory: AccessRecord[];
  changeHistory: ChangeRecord[];
  exportHistory: ExportRecord[];
  complianceChecks: ComplianceCheck[];
}

export interface AccessRecord {
  timestamp: Date;
  userId: string;
  action: 'view' | 'edit' | 'export' | 'delete';
  section?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason?: string;
}

export interface ChangeRecord {
  timestamp: Date;
  userId: string;
  field: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  automated: boolean;
  source: 'user' | 'system' | 'integration' | 'migration';
}

export interface ExportRecord {
  timestamp: Date;
  userId: string;
  format: string;
  scope: string[];
  purpose: string;
  ipAddress: string;
  fileSize?: number;
  downloadCompleted: boolean;
}

export interface ComplianceCheck {
  timestamp: Date;
  regulation: string;
  status: 'compliant' | 'non-compliant' | 'requires-review';
  issues: string[];
  remedialActions: string[];
  nextCheckDate: Date;
}

// ===========================================
// Form Configuration Types
// ===========================================

export interface ProfileFormConfig {
  formId: string;
  version: string;
  name: string;
  description: string;
  applicableRoles: string[];
  applicableOrganizations: string[];
  sections: FormSection[];
  validation: FormValidation;
  permissions: FormPermissions;
  workflow: FormWorkflow;
  localization: FormLocalization;
}

export interface FormSection {
  id: string;
  name: string;
  description?: string;
  order: number;
  required: boolean;
  conditional: ConditionalLogic;
  fields: FormField[];
  layout: SectionLayout;
  permissions: SectionPermissions;
}

export interface FormField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  validation: FieldValidation[];
  options?: FieldOption[];
  dependencies: FieldDependency[];
  permissions: FieldPermissions;
  defaultValue?: any;
  helpText?: string;
  formatting?: FieldFormatting;
  // Extended properties for form configuration
  visible?: boolean;
  editable?: boolean;
  priority?: 'high' | 'medium' | 'low';
  section?: string;
  constraints?: FieldConstraints;
  conditional?: ConditionalField;
  group?: string;
  ordering?: number;
}

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'phone' 
  | 'number' 
  | 'date' 
  | 'datetime'
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio'
  | 'textarea' 
  | 'file' 
  | 'image'
  | 'skills-selector'
  | 'goal-tracker'
  | 'availability-calendar'
  | 'org-chart-selector';

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
  metadata?: Record<string, any>;
}

export interface FieldValidation {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom' | 'unique';
  value?: any;
  message: string;
  condition?: string;
}

export interface FieldDependency {
  field: string;
  condition: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater' | 'less';
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable' | 'clear';
}

export interface FieldPermissions {
  view: string[];
  edit: string[];
  required: string[];
  sensitive: boolean;
}

export interface FieldFormatting {
  mask?: string;
  prefix?: string;
  suffix?: string;
  currency?: string;
  dateFormat?: string;
  numberFormat?: string;
}

export interface ConditionalLogic {
  conditions: LogicCondition[];
  operator: 'AND' | 'OR';
  action: 'show' | 'hide' | 'require' | 'disable';
}

export interface LogicCondition {
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'empty' | 'not-empty';
  value: any;
}

export interface SectionLayout {
  columns: number;
  spacing: 'compact' | 'normal' | 'loose';
  collapsible: boolean;
  defaultExpanded: boolean;
  customCss?: string;
}

export interface SectionPermissions {
  view: string[];
  edit: string[];
  admin: string[];
}

export interface FormValidation {
  rules: ValidationRule[];
  customValidators: CustomValidator[];
  crossFieldValidation: CrossFieldValidation[];
}

export interface CustomValidator {
  name: string;
  function: string; // JavaScript function as string
  async: boolean;
  errorMessage: string;
}

export interface CrossFieldValidation {
  fields: string[];
  validator: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface FormPermissions {
  create: string[];
  view: string[];
  edit: string[];
  delete: string[];
  export: string[];
  audit: string[];
}

export interface FormWorkflow {
  approval: ApprovalWorkflow;
  notifications: NotificationWorkflow;
  automation: AutomationWorkflow;
}

export interface ApprovalWorkflow {
  required: boolean;
  approvers: ApprovalRule[];
  escalation: EscalationRule[];
  timeout: number; // in days
}

export interface ApprovalRule {
  condition: string;
  approvers: string[];
  approvalType: 'any' | 'all' | 'majority';
  order: number;
}

export interface EscalationRule {
  condition: string;
  escalateTo: string[];
  delay: number; // in hours
}

export interface NotificationWorkflow {
  events: NotificationEvent[];
  templates: NotificationTemplate[];
  channels: NotificationChannel[];
}

export interface NotificationEvent {
  event: 'created' | 'updated' | 'approved' | 'rejected' | 'escalated';
  recipients: string[];
  template: string;
  channels: string[];
  conditions?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  format: 'html' | 'text' | 'markdown';
  variables: string[];
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'in-app' | 'slack' | 'teams';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AutomationWorkflow {
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  schedules: AutomationSchedule[];
}

export interface AutomationTrigger {
  event: string;
  condition?: string;
  actions: string[];
  enabled: boolean;
}

export interface AutomationAction {
  id: string;
  type: 'email' | 'webhook' | 'integration' | 'calculation' | 'validation';
  config: Record<string, any>;
  async: boolean;
}

export interface AutomationSchedule {
  id: string;
  name: string;
  cron: string;
  action: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface FormLocalization {
  defaultLanguage: string;
  supportedLanguages: string[];
  translations: Record<string, Translation>;
  dateFormats: Record<string, string>;
  numberFormats: Record<string, NumberFormat>;
}

export interface Translation {
  language: string;
  translations: Record<string, string>;
  completeness: number; // 0-100
  lastUpdated: Date;
}

export interface NumberFormat {
  decimal: string;
  thousands: string;
  currency: string;
  pattern: string;
}

// ===========================================
// Additional Privacy and Compliance Types
// ===========================================

export type ConsentType = 
  | 'data-processing' 
  | 'marketing' 
  | 'analytics' 
  | 'third-party-sharing' 
  | 'cookies' 
  | 'profiling';

export type DataCategory = 
  | 'personal' 
  | 'sensitive' 
  | 'financial' 
  | 'health' 
  | 'biometric' 
  | 'location' 
  | 'behavioral';

export interface DataSubjectRequest {
  id?: string;
  subjectId: string;
  requestType: 'access' | 'portability' | 'erasure' | 'rectification' | 'restriction';
  description: string;
  submittedDate?: Date;
  processedDate?: Date;
  status: 'submitted' | 'processing' | 'completed' | 'rejected';
  response?: any;
  evidence?: string[];
}

export interface PersonalDataMapping {
  dataCategory: DataCategory;
  fields: string[];
  purpose: string[];
  legalBasis: string;
  retentionPeriod: number;
  isTransferred: boolean;
  transferDestinations?: string[];
}

export interface RetentionPolicy {
  id: string;
  name: string;
  dataCategory: DataCategory;
  retentionPeriod: number; // in days
  autoDelete: boolean;
  anonymizeAfter?: number; // in days
  conditions: string[];
  exceptions: string[];
  isActive: boolean;
}

export interface DataProcessingActivity {
  id: string;
  name: string;
  purpose: string[];
  dataTypes: DataCategory[];
  dataSubjects: string[];
  legalBases: string[];
  recipients: string[];
  retention: number;
  technicalMeasures: string[];
  organizationalMeasures: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PrivacyImpactAssessment {
  id: string;
  activityId: string;
  conductedDate: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  dataTypes: DataCategory[];
  legalBases: string[];
  safeguards: string[];
  mitigationMeasures: string[];
  reviewDate: Date;
  status: 'draft' | 'completed' | 'approved';
}

export interface DataBreachIncident {
  id?: string;
  title: string;
  description: string;
  discoveredDate: Date;
  reportedDate?: Date;
  dataTypes: DataCategory[];
  affectedUserIds?: string[];
  containmentMeasures: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  rootCause?: string;
  impact?: any;
  status: 'reported' | 'investigating' | 'contained' | 'resolved';
}

// ===========================================
// Form Configuration Additional Types
// ===========================================

export interface ConditionalField {
  showWhen: FieldCondition[];
  logic: 'AND' | 'OR';
}

export interface FieldCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface ExtendedValidationRule {
  type: string;
  message: string;
  params: any;
}

export interface FieldConstraints {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minDate?: string;
  maxDate?: string;
  pattern?: string;
}

// ===========================================
// Form Configuration Support Types
// ===========================================

export interface ConditionalField {
  showWhen: FieldCondition[];
  logic: 'AND' | 'OR';
}

export interface FieldCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface FieldPolicy {
  required?: boolean;
  visible?: boolean;
  editable?: boolean;
  constraints?: FieldConstraints;
  options?: FieldOption[];
}
