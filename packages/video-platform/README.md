# Video Platform

Advanced video learning platform with comprehensive analytics, interactive features, and offline support.

## Features

### 🎥 Advanced Video Player

- **Custom HTML5 Player**: Fully customizable video player with branding support
- **Adaptive Streaming**: HLS/DASH support for optimal video delivery across devices
- **Quality Selection**: Automatic and manual quality switching
- **Playback Controls**: Speed adjustment, volume control, fullscreen support
- **Accessibility**: Keyboard navigation, screen reader support, closed captions

### 📊 Analytics & Engagement

- **Granular Progress Tracking**: Video segment analytics and watch time tracking
- **Drop-off Analysis**: Identify where viewers stop watching
- **Replay Analysis**: Track most replayed segments
- **Engagement Metrics**: Interaction rates, quiz performance, device breakdown
- **Geographic Distribution**: View analytics by region
- **Real-time Reporting**: Live analytics dashboard with exportable reports

### 🎯 Interactive Elements

- **In-Video Quizzes**: Pause video for knowledge checks with multiple question types
- **Video Annotations**: Clickable hotspots, text overlays, and interactive elements
- **Chapter Navigation**: Jump to specific sections with visual thumbnails
- **Content Overlays**: Rich media annotations with images, links, and HTML content

### 📱 Mobile & Offline Support

- **Responsive Design**: Touch-friendly controls optimized for mobile devices
- **Progressive Download**: Download videos for offline viewing
- **Storage Management**: Smart cleanup of expired downloads
- **Quality Optimization**: Adaptive quality selection based on device and network

### 🌐 CDN Integration

- **Multi-Region Delivery**: Global content delivery with edge caching
- **Bandwidth Optimization**: Automatic quality adjustment based on connection speed
- **Cache Warming**: Preload content across edge servers
- **Latency-Based Routing**: Optimal CDN selection based on user location

## Installation

```bash
npm install @tmslms/video-platform
```

## Usage

### Basic Video Player

```tsx
import { AdvancedVideoPlayer } from "@tmslms/video-platform";

function VideoLesson() {
  const metadata = {
    id: "lesson-1",
    title: "Introduction to React",
    duration: 1800, // 30 minutes
    thumbnail: "/thumbnails/lesson-1.jpg",
    captions: [
      {
        id: "en",
        language: "en",
        label: "English",
        src: "/captions/lesson-1-en.vtt",
        default: true,
        kind: "subtitles",
      },
    ],
  };

  const config = {
    autoplay: false,
    controls: true,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    analytics: true,
    accessibility: {
      keyboardNavigation: true,
      screenReaderSupport: true,
    },
    branding: {
      logo: "/logo.png",
      logoPosition: "top-right",
    },
  };

  return (
    <AdvancedVideoPlayer
      videoId="lesson-1"
      metadata={metadata}
      config={config}
      onProgress={progress => console.log("Progress:", progress)}
      onEvent={event => console.log("Event:", event)}
    />
  );
}
```

### Analytics Dashboard

```tsx
import {
  VideoAnalyticsDashboard,
  InMemoryVideoAnalyticsService,
} from "@tmslms/video-platform";

function AnalyticsPage() {
  const analyticsService = new InMemoryVideoAnalyticsService();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    analyticsService.getEngagementMetrics("lesson-1").then(setMetrics);
  }, []);

  return metrics ? (
    <VideoAnalyticsDashboard videoId="lesson-1" metrics={metrics} />
  ) : (
    <div>Loading analytics...</div>
  );
}
```

### Offline Video Management

```tsx
import {
  OfflineVideoManager,
  InMemoryOfflineVideoService,
} from "@tmslms/video-platform";

function OfflinePage() {
  const offlineService = new InMemoryOfflineVideoService();
  const [offlineVideos, setOfflineVideos] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState({});

  const handleDownload = async (videoId: string, quality?: string) => {
    const progress = await offlineService.downloadVideo(videoId, quality);
    setDownloadProgress(prev => ({ ...prev, [videoId]: progress }));
  };

  return (
    <OfflineVideoManager
      offlineVideos={offlineVideos}
      downloadProgress={downloadProgress}
      onDownload={handleDownload}
      onPause={videoId => offlineService.pauseDownload(videoId)}
      onResume={videoId => offlineService.resumeDownload(videoId)}
      onCancel={videoId => offlineService.cancelDownload(videoId)}
      onDelete={videoId => offlineService.deleteOfflineVideo(videoId)}
    />
  );
}
```

### Interactive Elements

```tsx
import { InteractiveVideoOverlay } from "@tmslms/video-platform";

function InteractiveVideo() {
  const annotations = [
    {
      id: "anno-1",
      type: "text",
      startTime: 30,
      endTime: 45,
      position: { x: 20, y: 30 },
      content: { text: "Important concept!" },
      interactive: true,
      pauseOnShow: true,
    },
  ];

  const quiz = {
    id: "quiz-1",
    title: "Knowledge Check",
    triggerTime: 120,
    pauseVideo: true,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "What is React?",
        options: ["Library", "Framework", "Language", "Database"],
        correctAnswer: "Library",
        points: 10,
      },
    ],
  };

  return (
    <InteractiveVideoOverlay
      annotations={annotations}
      activeQuiz={quiz}
      currentTime={currentTime}
      onAnnotationClick={annotation => console.log("Clicked:", annotation)}
      onQuizComplete={(quizId, answers) =>
        console.log("Quiz completed:", answers)
      }
      onQuizSkip={quizId => console.log("Quiz skipped:", quizId)}
    />
  );
}
```

## API Reference

### Services

#### VideoAnalyticsService

- `trackEvent(videoId, userId, event)` - Track video events
- `updateProgress(videoId, userId, progress)` - Update watch progress
- `getProgress(videoId, userId)` - Get user progress
- `getEngagementMetrics(videoId)` - Get comprehensive analytics
- `generateReport(videoId, format)` - Export analytics report

#### OfflineVideoService

- `downloadVideo(videoId, quality)` - Download video for offline viewing
- `pauseDownload(videoId)` - Pause active download
- `resumeDownload(videoId)` - Resume paused download
- `getOfflineVideos()` - List downloaded videos
- `deleteOfflineVideo(videoId)` - Remove offline video

#### CDNService

- `getOptimalSource(videoId, location, deviceType)` - Get best video source
- `preloadVideo(videoId, quality)` - Preload video chunks
- `warmCache(videoId, regions)` - Warm CDN cache
- `getBandwidthRecommendation()` - Get recommended quality

### Components

#### AdvancedVideoPlayer

Full-featured video player with custom controls, analytics, and interactive elements.

#### VideoAnalyticsDashboard

Comprehensive analytics dashboard with engagement metrics, drop-off analysis, and device breakdown.

#### OfflineVideoManager

Manage video downloads, storage, and offline playback capabilities.

#### InteractiveVideoOverlay

Add quizzes, annotations, and interactive elements to videos.

## Architecture

### Streaming Support

- **HLS (HTTP Live Streaming)**: Apple's adaptive streaming protocol
- **DASH (Dynamic Adaptive Streaming)**: Industry standard for adaptive streaming
- **Progressive MP4**: Fallback for basic video delivery
- **Adaptive Bitrate**: Automatic quality switching based on network conditions

### Analytics Pipeline

1. **Event Collection**: Real-time event tracking with buffering
2. **Data Processing**: Aggregate metrics and calculate engagement
3. **Storage**: In-memory or persistent storage options
4. **Reporting**: Export analytics in JSON, CSV, or PDF formats

### Offline Architecture

1. **Download Manager**: Queue and manage video downloads
2. **Storage Manager**: Optimize device storage usage
3. **Encryption**: Secure offline content with DRM
4. **Sync**: Resume playback across devices

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- iOS Safari 11+
- Android Chrome 60+

## Performance

- **Lazy Loading**: Components load on demand
- **Bundle Size**: Optimized for minimal impact
- **Memory Usage**: Efficient video buffer management
- **CDN Integration**: Global content delivery for optimal performance

## Security

- **DRM Support**: Widevine, PlayReady, and FairPlay
- **Content Encryption**: Secure video delivery
- **Access Control**: Integration with authentication systems
- **Analytics Privacy**: GDPR-compliant data collection
