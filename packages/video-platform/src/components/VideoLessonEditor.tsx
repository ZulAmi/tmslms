import React from 'react';
import { 
  AdvancedVideoPlayer, 
  VideoAnalyticsDashboard,
  VideoPlatformDemo,
  VideoMetadata, 
  VideoPlayerConfig,
  VideoQuiz,
  VideoAnnotation
} from '../index';

interface VideoLessonEditorProps {
  lessonId: string;
  courseId: string;
  onSave: (lessonData: any) => Promise<void>;
}

// Simplified functional component for demonstration
export function VideoLessonEditor({ lessonId, courseId, onSave }: VideoLessonEditorProps) {
  // Static demo data to showcase the video platform capabilities
  const demoVideoMetadata: VideoMetadata = {
    id: lessonId,
    title: 'Advanced React Concepts - Demo Lesson',
    description: 'Learn about React hooks, context, and performance optimization in this comprehensive video lesson.',
    duration: 1800,
    thumbnail: 'https://via.placeholder.com/640x360?text=React+Lesson+Thumbnail',
    captions: [
      {
        id: 'en',
        language: 'en',
        label: 'English',
        src: '/captions/demo-en.vtt',
        default: true,
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
      }
    ],
    tags: ['react', 'javascript', 'frontend', 'programming'],
    courseId,
    moduleId: 'demo-module',
    lessonId
  };

  const demoPlayerConfig: VideoPlayerConfig = {
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

  const demoQuizzes: VideoQuiz[] = [
    {
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
          explanation: 'React Hooks were introduced in React 16.8.0.',
          points: 25
        }
      ]
    }
  ];

  const demoAnnotations: VideoAnnotation[] = [
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
    }
  ];

  const handleFileUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Video file selected:', file.name);
      // In a real implementation, this would upload to CDN and update metadata
    }
  };

  const handleSaveLesson = async () => {
    const lessonData = {
      videoMetadata: demoVideoMetadata,
      playerConfig: demoPlayerConfig,
      interactiveElements: {
        quizzes: demoQuizzes,
        annotations: demoAnnotations
      }
    };
    
    console.log('Saving lesson data:', lessonData);
    await onSave(lessonData);
  };

  return (
    <div className="video-lesson-editor max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎬 Video Lesson Editor
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create engaging video lessons with interactive elements, analytics tracking, 
          and adaptive streaming capabilities.
        </p>
      </div>

      {/* Feature Overview */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">✨ Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🎥</div>
            <h3 className="font-semibold mb-2">Advanced Video Player</h3>
            <p className="text-sm text-gray-600">Custom HTML5 player with adaptive streaming, branding, and accessibility features</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2">Interactive Elements</h3>
            <p className="text-sm text-gray-600">In-video quizzes, annotations, and clickable hotspots for engagement</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold mb-2">Rich Analytics</h3>
            <p className="text-sm text-gray-600">Detailed engagement metrics, drop-off analysis, and learning insights</p>
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">�️ Lesson Configuration</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Title
              </label>
              <input
                type="text"
                value={demoVideoMetadata.title}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={demoVideoMetadata.description}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Video File
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports MP4, WebM, and AVI. Will be optimized for adaptive streaming.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interactive Quizzes
                </label>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-lg font-semibold text-green-800">{demoQuizzes.length}</div>
                  <div className="text-sm text-green-600">Knowledge checks configured</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Annotations
                </label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-lg font-semibold text-blue-800">{demoAnnotations.length}</div>
                  <div className="text-sm text-blue-600">Interactive notes added</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Player Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Analytics Enabled:</span>
                  <span className="text-green-600">✓ Yes</span>
                </div>
                <div className="flex justify-between">
                  <span>Adaptive Streaming:</span>
                  <span className="text-green-600">✓ Yes</span>
                </div>
                <div className="flex justify-between">
                  <span>Accessibility Features:</span>
                  <span className="text-green-600">✓ Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span>Default Quality:</span>
                  <span className="text-gray-700">{demoPlayerConfig.defaultQuality}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Video Player Preview</h3>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <AdvancedVideoPlayer
                  videoId={demoVideoMetadata.id}
                  metadata={demoVideoMetadata}
                  config={demoPlayerConfig}
                  userId="editor-preview"
                  className="w-full h-full"
                />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Lesson Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">Duration</div>
                  <div className="text-gray-600">
                    {Math.floor(demoVideoMetadata.duration / 60)}:{(demoVideoMetadata.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">Chapters</div>
                  <div className="text-gray-600">{demoVideoMetadata.chapters?.length || 0} sections</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">Captions</div>
                  <div className="text-gray-600">{demoVideoMetadata.captions?.length || 0} languages</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">Tags</div>
                  <div className="text-gray-600">{demoVideoMetadata.tags?.length || 0} keywords</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Demo Section */}
      <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">� Complete Platform Demo</h2>
          <p className="text-gray-600">
            Explore all video platform features including analytics dashboard, 
            offline management, and interactive overlays.
          </p>
        </div>
        
        <VideoPlatformDemo />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleSaveLesson}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          💾 Save Video Lesson
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          🔝 Back to Top
        </button>
      </div>

      {/* Footer Information */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Video Platform v1.0 - Advanced Learning Management System</p>
        <p className="mt-1">
          Featuring adaptive streaming, interactive elements, comprehensive analytics, 
          and mobile-optimized playback.
        </p>
      </div>
    </div>
  );
}

export default VideoLessonEditor;
