# Video Platform Integration Guide

## Quick Start

The Advanced Video Learning Platform has been successfully integrated into the TMS/LMS monorepo. Here's how to get started:

### 1. Install Dependencies

The video platform package is already configured in the monorepo. Simply run:

```bash
npm install
```

This will install all dependencies for the video platform including:

- hls.js for HLS streaming
- dashjs for DASH streaming
- video.js for video player foundation
- chart.js for analytics visualization

### 2. Import Components

```typescript
import {
  AdvancedVideoPlayer,
  VideoAnalyticsDashboard,
  OfflineVideoManager,
  VideoPlatformDemo,
} from "@tmslms/video-platform";
```

### 3. Basic Usage

```tsx
import React from "react";
import {
  AdvancedVideoPlayer,
  VideoMetadata,
  VideoPlayerConfig,
} from "@tmslms/video-platform";

export function VideoLessonPage() {
  const videoMetadata: VideoMetadata = {
    id: "lesson-1",
    title: "Introduction to React",
    duration: 1200,
    thumbnail: "/thumbnails/lesson-1.jpg",
    sources: [
      {
        url: "/videos/lesson-1/manifest.m3u8",
        type: "application/vnd.apple.mpegurl", // HLS
        quality: "auto",
      },
      {
        url: "/videos/lesson-1/manifest.mpd",
        type: "application/dash+xml", // DASH
        quality: "auto",
      },
    ],
    captions: [
      {
        id: "en",
        language: "en",
        label: "English",
        src: "/captions/lesson-1-en.vtt",
        default: true,
      },
    ],
  };

  const config: VideoPlayerConfig = {
    autoplay: false,
    analytics: true,
    adaptiveStreaming: true,
    branding: {
      logo: "/logo.png",
      theme: "dark",
      primaryColor: "#2563eb",
    },
  };

  return (
    <div className="lesson-container">
      <h1>{videoMetadata.title}</h1>

      <AdvancedVideoPlayer
        videoId={videoMetadata.id}
        metadata={videoMetadata}
        config={config}
        userId="current-user-id"
        onProgress={progress => {
          // Save progress to backend
          console.log("Video progress:", progress);
        }}
      />
    </div>
  );
}
```

### 4. Demo Components

To see all features in action, use the demo component:

```tsx
import { VideoPlatformDemo } from "@tmslms/video-platform";

export function DemoPage() {
  return <VideoPlatformDemo />;
}
```

## Architecture Integration

### Course Management Integration

The video platform integrates seamlessly with the existing course structure:

```typescript
// In course authoring system
import { VideoPlayerConfig } from "@tmslms/video-platform";

interface CourseLesson {
  id: string;
  title: string;
  description: string;
  videoMetadata?: VideoMetadata; // From video platform
  playerConfig?: VideoPlayerConfig; // Custom player settings
  interactiveElements?: {
    quizzes: VideoQuiz[];
    annotations: VideoAnnotation[];
  };
}
```

### Analytics Integration

Video analytics integrate with the existing analytics dashboard:

```typescript
// In analytics service
import { InMemoryVideoAnalyticsService } from "@tmslms/video-platform";

class AnalyticsService {
  private videoAnalytics = new InMemoryVideoAnalyticsService();

  async getCourseAnalytics(courseId: string) {
    const videos = await this.getVideosByCourse(courseId);
    const videoMetrics = await Promise.all(
      videos.map(video => this.videoAnalytics.getVideoMetrics(video.id))
    );

    return {
      courseEngagement: this.calculateCourseEngagement(videoMetrics),
      videoPerformance: videoMetrics,
      learnerProgress: await this.getLearnerProgress(courseId),
    };
  }
}
```

### CDN Configuration

Configure CDN settings for optimal video delivery:

```typescript
// In environment configuration
const cdnConfig = {
  provider: "cloudflare", // or 'aws', 'azure', 'gcp'
  regions: ["us-east-1", "us-west-1", "eu-west-1", "ap-southeast-1"],
  edgeCaching: true,
  compressionEnabled: true,
  adaptiveBitrate: true,
  customDomain: "videos.yourdomain.com",
};
```

## Mobile App Integration

### React Native Integration

For mobile apps, use the core services with native video components:

```typescript
// In React Native app
import {
  InMemoryVideoAnalyticsService,
  InMemoryOfflineVideoService,
} from "@tmslms/video-platform";

// Use native video player with platform services
const VideoScreen = ({ videoId }: { videoId: string }) => {
  const analyticsService = new InMemoryVideoAnalyticsService();
  const offlineService = new InMemoryOfflineVideoService();

  // Use React Native Video component with platform analytics
};
```

## Production Deployment

### Docker Configuration

Add video platform build to Docker setup:

```dockerfile
# In apps/web/Dockerfile
COPY packages/video-platform ./packages/video-platform
RUN npm run build:video-platform
```

### Environment Variables

Configure video platform settings:

```env
# Video Platform Configuration
VIDEO_CDN_PROVIDER=cloudflare
VIDEO_CDN_DOMAIN=videos.yourdomain.com
VIDEO_ANALYTICS_ENABLED=true
VIDEO_OFFLINE_ENABLED=true
VIDEO_MAX_QUALITY=1080p
VIDEO_DEFAULT_QUALITY=720p
```

## Testing

### Unit Tests

```typescript
// Video player component tests
import { render, screen } from '@testing-library/react';
import { AdvancedVideoPlayer } from '@tmslms/video-platform';

describe('AdvancedVideoPlayer', () => {
  it('renders video with correct metadata', () => {
    const metadata = {
      id: 'test-video',
      title: 'Test Video',
      duration: 600
    };

    render(<AdvancedVideoPlayer videoId="test" metadata={metadata} />);
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// Analytics service integration tests
import { InMemoryVideoAnalyticsService } from "@tmslms/video-platform";

describe("Video Analytics Integration", () => {
  it("tracks video events correctly", async () => {
    const service = new InMemoryVideoAnalyticsService();

    await service.trackEvent("video-1", "play", { timestamp: 0 });
    await service.trackEvent("video-1", "pause", { timestamp: 30 });

    const metrics = await service.getVideoMetrics("video-1");
    expect(metrics.totalViews).toBe(1);
  });
});
```

## Monitoring and Performance

### Performance Metrics

Monitor key video platform metrics:

- **Video Load Time**: Time to first frame
- **Buffering Events**: Frequency and duration
- **Quality Switches**: Adaptive streaming performance
- **Completion Rates**: Learning engagement
- **Error Rates**: Playback failures

### Analytics Dashboard Integration

Add video metrics to existing admin dashboard:

```typescript
// In admin dashboard
import { VideoAnalyticsDashboard } from '@tmslms/video-platform';

export function AdminAnalyticsPage() {
  return (
    <div>
      <h1>Platform Analytics</h1>

      {/* Existing course analytics */}
      <CourseAnalyticsDashboard />

      {/* New video analytics */}
      <VideoAnalyticsDashboard
        videoId="all" // Show platform-wide metrics
      />
    </div>
  );
}
```

## Next Steps

1. **Configure CDN**: Set up video hosting and delivery infrastructure
2. **Integrate Analytics**: Connect video metrics to existing reporting
3. **Test Mobile**: Validate responsive design and touch controls
4. **Security Setup**: Configure DRM and content protection
5. **Performance Tuning**: Optimize for your specific use case

The video platform is now ready for production use with comprehensive features for enterprise learning management systems.
