import React from 'react';
import { 
  AdvancedVideoPlayer, 
  VideoAnalyticsDashboard, 
  OfflineVideoManager,
  InteractiveVideoOverlay,
  InMemoryVideoAnalyticsService,
  InMemoryOfflineVideoService,
  InMemoryCDNService,
  VideoMetadata,
  VideoPlayerConfig,
  EngagementMetrics,
  OfflineVideo,
  DownloadProgress,
  VideoAnnotation,
  VideoQuiz
} from '../index';

export function VideoPlatformDemo() {
  // Mock data for demonstration
  const videoMetadata: VideoMetadata = {
    id: 'demo-video-1',
    title: 'Advanced React Concepts',
    description: 'Learn about hooks, context, and performance optimization',
    duration: 1800, // 30 minutes
    thumbnail: 'https://via.placeholder.com/640x360?text=Video+Thumbnail',
    poster: 'https://via.placeholder.com/640x360?text=Video+Poster',
    captions: [
      {
        id: 'en',
        language: 'en',
        label: 'English',
        src: '/captions/demo-en.vtt',
        default: true,
        kind: 'subtitles'
      },
      {
        id: 'es',
        language: 'es',
        label: 'Español',
        src: '/captions/demo-es.vtt',
        kind: 'subtitles'
      }
    ],
    chapters: [
      {
        id: 'ch1',
        title: 'Introduction',
        startTime: 0,
        endTime: 300,
        description: 'Course overview and objectives'
      },
      {
        id: 'ch2',
        title: 'React Hooks',
        startTime: 300,
        endTime: 900,
        description: 'Understanding useState, useEffect, and custom hooks'
      },
      {
        id: 'ch3',
        title: 'Context API',
        startTime: 900,
        endTime: 1350,
        description: 'State management with React Context'
      },
      {
        id: 'ch4',
        title: 'Performance',
        startTime: 1350,
        endTime: 1800,
        description: 'Optimization techniques and best practices'
      }
    ],
    tags: ['react', 'javascript', 'frontend', 'programming'],
    courseId: 'course-react-advanced',
    moduleId: 'module-1',
    lessonId: 'lesson-1'
  };

  const playerConfig: VideoPlayerConfig = {
    autoplay: false,
    muted: false,
    controls: true,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    defaultQuality: '720p',
    adaptiveStreaming: true,
    seekPreview: true,
    analytics: true,
    accessibility: {
      keyboardNavigation: true,
      screenReaderSupport: true,
      highContrast: false,
      focusIndicators: true,
      skipLinks: true
    },
    branding: {
      logo: 'https://via.placeholder.com/120x40?text=TMS+LMS',
      logoPosition: 'top-right',
      theme: 'dark',
      primaryColor: '#2563eb',
      accentColor: '#1d4ed8'
    }
  };

  const mockAnalytics: EngagementMetrics = {
    videoId: 'demo-video-1',
    totalViews: 1247,
    uniqueViewers: 892,
    averageWatchTime: 1425, // 23.75 minutes
    completionRate: 0.78,
    dropOffPoints: [
      {
        timestamp: 180,
        dropOffRate: 0.12,
        viewersRemaining: 784,
        commonExitReasons: ['user_navigation', 'content_difficulty']
      },
      {
        timestamp: 540,
        dropOffRate: 0.18,
        viewersRemaining: 640,
        commonExitReasons: ['technical_issue', 'user_navigation']
      },
      {
        timestamp: 1080,
        dropOffRate: 0.25,
        viewersRemaining: 480,
        commonExitReasons: ['content_complete', 'time_constraint']
      }
    ],
    replaySegments: [
      {
        startTime: 420,
        endTime: 480,
        replayCount: 156,
        averageReplays: 2.3
      },
      {
        startTime: 960,
        endTime: 1020,
        replayCount: 98,
        averageReplays: 1.8
      }
    ],
    interactionRate: 0.67,
    quizPerformance: {
      totalAttempts: 734,
      averageScore: 82.4,
      passRate: 0.89,
      questionAnalytics: []
    },
    deviceBreakdown: {
      desktop: 456,
      mobile: 312,
      tablet: 89,
      tv: 34,
      unknown: 5
    },
    geographicDistribution: {
      'US': { views: 423, watchTime: 18540, completionRate: 0.82 },
      'CA': { views: 167, watchTime: 7234, completionRate: 0.76 },
      'UK': { views: 234, watchTime: 9876, completionRate: 0.79 },
      'AU': { views: 123, watchTime: 5432, completionRate: 0.73 },
      'DE': { views: 89, watchTime: 3821, completionRate: 0.71 },
      'FR': { views: 67, watchTime: 2987, completionRate: 0.68 }
    }
  };

  const mockOfflineVideos: OfflineVideo[] = [
    {
      videoId: 'demo-video-1',
      downloadedAt: new Date('2024-01-15'),
      expiresAt: new Date('2024-02-15'),
      size: 450 * 1024 * 1024, // 450MB
      quality: '720p',
      format: 'mp4',
      path: '/offline/demo-video-1-720p.mp4',
      encrypted: true
    },
    {
      videoId: 'demo-video-2',
      downloadedAt: new Date('2024-01-10'),
      size: 280 * 1024 * 1024, // 280MB
      quality: '480p',
      format: 'mp4',
      path: '/offline/demo-video-2-480p.mp4',
      encrypted: true
    }
  ];

  const mockDownloadProgress: Record<string, DownloadProgress> = {
    'demo-video-3': {
      videoId: 'demo-video-3',
      progress: 67,
      downloadedBytes: 335 * 1024 * 1024,
      totalBytes: 500 * 1024 * 1024,
      speed: 2.1 * 1024 * 1024, // 2.1 MB/s
      timeRemaining: 78,
      status: 'downloading'
    },
    'demo-video-4': {
      videoId: 'demo-video-4',
      progress: 45,
      downloadedBytes: 180 * 1024 * 1024,
      totalBytes: 400 * 1024 * 1024,
      speed: 0,
      timeRemaining: 0,
      status: 'paused'
    }
  };

  const mockAnnotations: VideoAnnotation[] = [
    {
      id: 'anno-1',
      type: 'text',
      startTime: 120,
      endTime: 140,
      position: { x: 15, y: 20, width: 25, height: 15 },
      content: {
        text: '💡 Key Concept: React Hooks were introduced in version 16.8'
      },
      style: {
        backgroundColor: '#1f2937',
        textColor: '#ffffff',
        fontSize: '14px'
      },
      interactive: true,
      pauseOnShow: false
    },
    {
      id: 'anno-2',
      type: 'link',
      startTime: 480,
      endTime: 500,
      position: { x: 60, y: 30, width: 30, height: 12 },
      content: {
        text: 'React Documentation',
        url: 'https://reactjs.org/docs/hooks-intro.html'
      },
      style: {
        backgroundColor: '#2563eb',
        textColor: '#ffffff'
      },
      interactive: true,
      pauseOnShow: true
    },
    {
      id: 'anno-3',
      type: 'hotspot',
      startTime: 840,
      endTime: 870,
      position: { x: 40, y: 50, width: 8, height: 8 },
      content: {
        text: 'Click to learn more about useEffect cleanup'
      },
      interactive: true,
      pauseOnShow: false
    }
  ];

  const mockQuiz: VideoQuiz = {
    id: 'quiz-hooks',
    title: 'React Hooks Knowledge Check',
    triggerTime: 600,
    pauseVideo: true,
    passingScore: 70,
    allowRetry: true,
    showCorrectAnswers: true,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which React version introduced Hooks?',
        options: ['16.6', '16.7', '16.8', '17.0'],
        correctAnswer: '16.8',
        explanation: 'React Hooks were introduced in React 16.8.0 in February 2019.',
        points: 25
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'useState can only be used in functional components.',
        correctAnswer: 'true',
        explanation: 'Hooks, including useState, can only be used in functional components, not class components.',
        points: 25
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'What does useEffect replace from class components?',
        options: [
          'constructor',
          'componentDidMount and componentDidUpdate', 
          'render method',
          'setState'
        ],
        correctAnswer: 'componentDidMount and componentDidUpdate',
        explanation: 'useEffect combines the functionality of componentDidMount, componentDidUpdate, and componentWillUnmount.',
        points: 25
      },
      {
        id: 'q4',
        type: 'fill-blank',
        question: 'The _____ hook is used to manage local state in functional components.',
        correctAnswer: 'useState',
        explanation: 'useState is the hook used for managing local state in functional components.',
        points: 25
      }
    ]
  };

  // Mock services
  const analyticsService = new InMemoryVideoAnalyticsService();
  const offlineService = new InMemoryOfflineVideoService();
  const cdnService = new InMemoryCDNService({
    provider: 'cloudflare',
    regions: ['us-east-1', 'us-west-1', 'eu-west-1', 'ap-southeast-1'],
    edgeCaching: true,
    compressionEnabled: true,
    adaptiveBitrate: true
  });

  // Event handlers
  const handleVideoProgress = (progress: any) => {
    console.log('Video progress:', progress);
  };

  const handleVideoEvent = (event: any) => {
    console.log('Video event:', event);
  };

  const handleAnnotationClick = (annotation: VideoAnnotation) => {
    console.log('Annotation clicked:', annotation);
    if (annotation.content.url) {
      window.open(annotation.content.url, '_blank');
    }
  };

  const handleQuizComplete = (quizId: string, answers: Record<string, any>) => {
    console.log('Quiz completed:', { quizId, answers });
    // Calculate score and provide feedback
    const totalQuestions = mockQuiz.questions.length;
    const correctAnswers = mockQuiz.questions.filter(q => 
      answers[q.id] === q.correctAnswer
    ).length;
    const score = (correctAnswers / totalQuestions) * 100;
    
    alert(`Quiz completed! Score: ${score.toFixed(1)}% (${correctAnswers}/${totalQuestions} correct)`);
  };

  const handleQuizSkip = (quizId: string) => {
    console.log('Quiz skipped:', quizId);
  };

  const handleDownload = async (videoId: string, quality?: string) => {
    console.log('Starting download:', { videoId, quality });
    try {
      await offlineService.downloadVideo(videoId, quality);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="video-platform-demo max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎥 Advanced Video Learning Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience our comprehensive video platform with adaptive streaming, 
          interactive elements, detailed analytics, and offline support.
        </p>
      </div>

      {/* Video Player Section */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">📹 Advanced Video Player</h2>
        <p className="text-gray-600 mb-6">
          Full-featured HTML5 video player with custom branding, adaptive streaming, 
          accessibility features, and comprehensive analytics tracking.
        </p>
        
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <AdvancedVideoPlayer
            videoId={videoMetadata.id}
            metadata={videoMetadata}
            config={playerConfig}
            onProgress={handleVideoProgress}
            onEvent={handleVideoEvent}
            userId="demo-user"
            className="w-full h-full"
          />
        </div>

        {/* Interactive Overlay Demo */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">🎯 Interactive Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Annotations:</span> Clickable hotspots and information overlays
            </div>
            <div>
              <span className="font-medium">Quizzes:</span> In-video knowledge checks with multiple question types
            </div>
            <div>
              <span className="font-medium">Chapters:</span> Navigate to specific video sections
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Section */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">📊 Analytics Dashboard</h2>
        <p className="text-gray-600 mb-6">
          Comprehensive analytics with engagement metrics, drop-off analysis, 
          replay tracking, and geographic distribution insights.
        </p>
        
        <VideoAnalyticsDashboard
          videoId={videoMetadata.id}
          metrics={mockAnalytics}
        />
      </section>

      {/* Offline Video Manager Section */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">📱 Offline Video Manager</h2>
        <p className="text-gray-600 mb-6">
          Download videos for offline viewing with smart storage management, 
          progress tracking, and quality optimization for mobile devices.
        </p>
        
        <OfflineVideoManager
          offlineVideos={mockOfflineVideos}
          downloadProgress={mockDownloadProgress}
          onDownload={handleDownload}
          onPause={async (videoId) => {
            console.log('Pausing download:', videoId);
            await offlineService.pauseDownload(videoId);
          }}
          onResume={async (videoId) => {
            console.log('Resuming download:', videoId);
            await offlineService.resumeDownload(videoId);
          }}
          onCancel={async (videoId) => {
            console.log('Cancelling download:', videoId);
            await offlineService.cancelDownload(videoId);
          }}
          onDelete={async (videoId) => {
            console.log('Deleting offline video:', videoId);
            await offlineService.deleteOfflineVideo(videoId);
          }}
        />
      </section>

      {/* Interactive Elements Demo */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">🎯 Interactive Elements</h2>
        <p className="text-gray-600 mb-6">
          Engage learners with interactive annotations, knowledge check quizzes, 
          and clickable hotspots that enhance the learning experience.
        </p>
        
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Sample Interactive Elements:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">📝 Annotations</h4>
              <div className="space-y-2 text-sm">
                {mockAnnotations.map((annotation) => (
                  <div key={annotation.id} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{annotation.content.text}</span>
                    <span className="text-gray-500">(@{Math.floor(annotation.startTime / 60)}:{(annotation.startTime % 60).toString().padStart(2, '0')})</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">🧠 Knowledge Check Quiz</h4>
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium">{mockQuiz.title}</h5>
                <p className="text-sm text-gray-600 mt-1">
                  {mockQuiz.questions.length} questions • Passing score: {mockQuiz.passingScore}%
                </p>
                <div className="mt-3 text-sm">
                  <div>✓ Multiple choice questions</div>
                  <div>✓ True/false questions</div>
                  <div>✓ Fill-in-the-blank questions</div>
                  <div>✓ Instant feedback and explanations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">🚀 Platform Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🎥</div>
            <h3 className="font-semibold mb-2">Adaptive Streaming</h3>
            <p className="text-sm opacity-90">HLS/DASH support with automatic quality adjustment</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Rich Analytics</h3>
            <p className="text-sm opacity-90">Detailed engagement metrics and learner insights</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-semibold mb-2">Mobile Optimized</h3>
            <p className="text-sm opacity-90">Responsive design with offline capabilities</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="font-semibold mb-2">Global CDN</h3>
            <p className="text-sm opacity-90">Multi-region delivery with edge caching</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-6 text-sm">
            <span>✓ Accessibility compliant</span>
            <span>✓ DRM protected</span>
            <span>✓ Real-time analytics</span>
            <span>✓ Interactive elements</span>
          </div>
        </div>
      </section>
    </div>
  );
}
