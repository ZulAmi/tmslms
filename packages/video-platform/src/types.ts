// Video Platform Types
export interface VideoSource {
  id: string;
  url: string;
  quality: '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p';
  bitrate: number;
  codec: 'h264' | 'h265' | 'av1';
  type: 'mp4' | 'webm' | 'm3u8' | 'mpd';
}

export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  duration: number; // in seconds
  thumbnail: string;
  poster?: string;
  captions?: CaptionTrack[];
  chapters?: VideoChapter[];
  tags?: string[];
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
}

export interface CaptionTrack {
  id: string;
  language: string;
  label: string;
  src: string;
  default?: boolean;
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
}

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  thumbnail?: string;
  description?: string;
}

// Interactive Elements
export interface VideoAnnotation {
  id: string;
  type: 'text' | 'link' | 'hotspot' | 'overlay';
  startTime: number;
  endTime: number;
  position: {
    x: number; // percentage
    y: number; // percentage
    width?: number;
    height?: number;
  };
  content: {
    text?: string;
    url?: string;
    html?: string;
    imageUrl?: string;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    fontSize?: string;
  };
  interactive?: boolean;
  pauseOnShow?: boolean;
}

export interface VideoQuiz {
  id: string;
  title: string;
  triggerTime: number;
  pauseVideo: boolean;
  questions: QuizQuestion[];
  passingScore?: number;
  allowRetry?: boolean;
  showCorrectAnswers?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'drag-drop';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

// Analytics Types
export interface VideoAnalytics {
  videoId: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  event: VideoEvent;
  data: Record<string, any>;
}

export interface VideoEvent {
  type: 'play' | 'pause' | 'seek' | 'ended' | 'quality_change' | 'fullscreen' | 
        'volume_change' | 'quiz_start' | 'quiz_complete' | 'annotation_click' |
        'chapter_change' | 'speed_change' | 'caption_toggle' | 'replay' | 'exit';
  timestamp: number; // video timestamp
  value?: any;
}

export interface WatchProgress {
  videoId: string;
  userId: string;
  totalWatchTime: number;
  completionPercentage: number;
  lastWatchedTime: number;
  watchedSegments: TimeSegment[];
  quizAttempts: QuizAttempt[];
  annotationInteractions: AnnotationInteraction[];
  updatedAt: Date;
}

export interface TimeSegment {
  start: number;
  end: number;
  watchCount: number;
}

export interface QuizAttempt {
  quizId: string;
  attemptNumber: number;
  score: number;
  answers: Record<string, any>;
  completedAt: Date;
  timeTaken: number;
}

export interface AnnotationInteraction {
  annotationId: string;
  type: 'view' | 'click' | 'hover';
  timestamp: number;
  interactedAt: Date;
}

// Player Configuration
export interface VideoPlayerConfig {
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playbackRates?: number[];
  defaultQuality?: string;
  adaptiveStreaming?: boolean;
  hlsConfig?: any;
  dashConfig?: any;
  seekPreview?: boolean;
  thumbnail?: boolean;
  analytics?: boolean;
  offline?: boolean;
  drm?: DRMConfig;
  accessibility?: AccessibilityConfig;
  branding?: BrandingConfig;
}

export interface DRMConfig {
  enabled: boolean;
  widevine?: string;
  playready?: string;
  fairplay?: string;
}

export interface AccessibilityConfig {
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  highContrast: boolean;
  focusIndicators: boolean;
  skipLinks: boolean;
}

export interface BrandingConfig {
  logo?: string;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  watermark?: string;
  customCSS?: string;
  theme?: 'light' | 'dark' | 'custom';
  primaryColor?: string;
  accentColor?: string;
}

// CDN and Streaming
export interface CDNConfig {
  provider: 'cloudflare' | 'aws' | 'azure' | 'gcp' | 'custom';
  regions: string[];
  edgeCaching: boolean;
  compressionEnabled: boolean;
  adaptiveBitrate: boolean;
}

export interface StreamingQuality {
  resolution: string;
  bitrate: number;
  fps: number;
  codec: string;
}

// Offline Support
export interface OfflineVideo {
  videoId: string;
  downloadedAt: Date;
  expiresAt?: Date;
  size: number; // bytes
  quality: string;
  format: string;
  path: string;
  encrypted: boolean;
}

export interface DownloadProgress {
  videoId: string;
  progress: number; // 0-100
  downloadedBytes: number;
  totalBytes: number;
  speed: number; // bytes/sec
  timeRemaining: number; // seconds
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'failed';
  error?: string;
}

// Engagement Analytics
export interface EngagementMetrics {
  videoId: string;
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number;
  completionRate: number;
  dropOffPoints: DropOffPoint[];
  replaySegments: ReplaySegment[];
  interactionRate: number;
  quizPerformance: QuizPerformanceMetrics;
  deviceBreakdown: DeviceMetrics;
  geographicDistribution: GeographicMetrics;
}

export interface DropOffPoint {
  timestamp: number;
  dropOffRate: number;
  viewersRemaining: number;
  commonExitReasons: string[];
}

export interface ReplaySegment {
  startTime: number;
  endTime: number;
  replayCount: number;
  averageReplays: number;
}

export interface QuizPerformanceMetrics {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  questionAnalytics: QuestionAnalytics[];
}

export interface QuestionAnalytics {
  questionId: string;
  correctRate: number;
  averageTimeToAnswer: number;
  commonWrongAnswers: string[];
}

export interface DeviceMetrics {
  desktop: number;
  mobile: number;
  tablet: number;
  tv: number;
  unknown: number;
}

export interface GeographicMetrics {
  [countryCode: string]: {
    views: number;
    watchTime: number;
    completionRate: number;
  };
}
