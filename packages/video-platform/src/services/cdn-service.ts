import { CDNConfig, VideoSource, StreamingQuality } from '../types';

export interface CDNService {
  getOptimalSource(videoId: string, userLocation?: string, deviceType?: string): Promise<VideoSource>;
  getAvailableQualities(videoId: string): Promise<StreamingQuality[]>;
  preloadVideo(videoId: string, quality?: string): Promise<void>;
  getRegionalCDNs(): Promise<string[]>;
  getBandwidthRecommendation(): Promise<string>;
  warmCache(videoId: string, regions?: string[]): Promise<void>;
  getEdgeStatus(videoId: string): Promise<Record<string, boolean>>;
}

export class InMemoryCDNService implements CDNService {
  private cdnConfig: CDNConfig;
  private cachedVideos: Map<string, VideoSource[]> = new Map();
  private bandwidthHistory: number[] = [];
  private regionalCDNs: string[] = [
    'us-east-1.cdn.tmslms.com',
    'us-west-1.cdn.tmslms.com',
    'eu-west-1.cdn.tmslms.com',
    'ap-southeast-1.cdn.tmslms.com',
    'ap-northeast-1.cdn.tmslms.com'
  ];

  constructor(config: CDNConfig) {
    this.cdnConfig = config;
    this.initializeBandwidthMonitoring();
  }

  async getOptimalSource(videoId: string, userLocation?: string, deviceType?: string): Promise<VideoSource> {
    const availableQualities = await this.getAvailableQualities(videoId);
    const bandwidthRec = await this.getBandwidthRecommendation();
    const optimalCDN = await this.selectOptimalCDN(userLocation);
    
    // Select quality based on bandwidth and device
    let targetQuality = this.selectQualityForBandwidth(bandwidthRec, deviceType);
    
    // Find the best matching quality
    const availableQuality = availableQualities.find(q => q.resolution === targetQuality) ||
                             availableQualities[Math.floor(availableQualities.length / 2)]; // fallback to middle quality

    const videoSources = this.cachedVideos.get(videoId) || await this.generateVideoSources(videoId);
    
    // Find source with optimal CDN and quality
    const optimalSource = videoSources.find(source => 
      source.quality === availableQuality.resolution &&
      source.url.includes(optimalCDN)
    ) || videoSources[0]; // fallback to first available

    return optimalSource;
  }

  async getAvailableQualities(videoId: string): Promise<StreamingQuality[]> {
    // In real implementation, this would query the video processing service
    return [
      { resolution: '240p', bitrate: 400000, fps: 30, codec: 'h264' },
      { resolution: '360p', bitrate: 800000, fps: 30, codec: 'h264' },
      { resolution: '480p', bitrate: 1200000, fps: 30, codec: 'h264' },
      { resolution: '720p', bitrate: 2500000, fps: 30, codec: 'h264' },
      { resolution: '1080p', bitrate: 5000000, fps: 30, codec: 'h264' },
      { resolution: '1440p', bitrate: 9000000, fps: 30, codec: 'h265' },
      { resolution: '2160p', bitrate: 20000000, fps: 30, codec: 'h265' }
    ];
  }

  async preloadVideo(videoId: string, quality = '720p'): Promise<void> {
    const sources = await this.generateVideoSources(videoId);
    const targetSource = sources.find(s => s.quality === quality);
    
    if (!targetSource) {
      throw new Error(`Quality ${quality} not available for video ${videoId}`);
    }

    // Simulate preloading by making a range request for the first few chunks
    try {
      console.log(`Preloading video ${videoId} at ${quality} from ${targetSource.url}`);
      
      // In real implementation, make HTTP range requests
      const preloadPromises = this.regionalCDNs.map(async (cdn) => {
        const cdnUrl = targetSource.url.replace(/^https?:\/\/[^\/]+/, `https://${cdn}`);
        
        // Simulate range request for first 1MB
        return this.simulateRangeRequest(cdnUrl, 0, 1024 * 1024);
      });

      await Promise.allSettled(preloadPromises);
      console.log(`Preloading completed for video ${videoId}`);
    } catch (error) {
      console.error(`Preloading failed for video ${videoId}:`, error);
    }
  }

  async getRegionalCDNs(): Promise<string[]> {
    return [...this.regionalCDNs];
  }

  async getBandwidthRecommendation(): Promise<string> {
    const currentBandwidth = await this.estimateBandwidth();
    
    if (currentBandwidth >= 20000000) return '2160p'; // 20 Mbps
    if (currentBandwidth >= 9000000) return '1440p';  // 9 Mbps
    if (currentBandwidth >= 5000000) return '1080p';  // 5 Mbps
    if (currentBandwidth >= 2500000) return '720p';   // 2.5 Mbps
    if (currentBandwidth >= 1200000) return '480p';   // 1.2 Mbps
    if (currentBandwidth >= 800000) return '360p';    // 800 Kbps
    return '240p'; // fallback
  }

  async warmCache(videoId: string, regions?: string[]): Promise<void> {
    const targetRegions = regions || this.regionalCDNs;
    const sources = await this.generateVideoSources(videoId);

    const warmupPromises = targetRegions.map(async (region) => {
      return Promise.all(sources.map(async (source) => {
        const regionalUrl = source.url.replace(/^https?:\/\/[^\/]+/, `https://${region}`);
        
        try {
          // Simulate cache warming with HEAD request
          await this.simulateHeadRequest(regionalUrl);
          console.log(`Cache warmed for ${videoId} on ${region}`);
        } catch (error) {
          console.error(`Cache warming failed for ${videoId} on ${region}:`, error);
        }
      }));
    });

    await Promise.allSettled(warmupPromises);
    console.log(`Cache warming completed for video ${videoId}`);
  }

  async getEdgeStatus(videoId: string): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};
    
    const statusPromises = this.regionalCDNs.map(async (cdn) => {
      try {
        // Simulate edge server health check
        const isHealthy = await this.checkEdgeHealth(cdn, videoId);
        status[cdn] = isHealthy;
      } catch (error) {
        status[cdn] = false;
      }
    });

    await Promise.allSettled(statusPromises);
    return status;
  }

  private async selectOptimalCDN(userLocation?: string): Promise<string> {
    // Simplified CDN selection based on location
    const locationToCDN: Record<string, string> = {
      'US': 'us-east-1.cdn.tmslms.com',
      'EU': 'eu-west-1.cdn.tmslms.com',
      'AS': 'ap-southeast-1.cdn.tmslms.com',
      'JP': 'ap-northeast-1.cdn.tmslms.com'
    };

    if (userLocation && locationToCDN[userLocation]) {
      return locationToCDN[userLocation];
    }

    // Fallback to latency-based selection
    return await this.selectCDNByLatency();
  }

  private async selectCDNByLatency(): Promise<string> {
    const latencyTests = this.regionalCDNs.map(async (cdn) => {
      const startTime = Date.now();
      try {
        await this.simulateHeadRequest(`https://${cdn}/health`);
        return { cdn, latency: Date.now() - startTime };
      } catch {
        return { cdn, latency: Infinity };
      }
    });

    const results = await Promise.allSettled(latencyTests);
    const validResults = results
      .filter((result): result is PromiseFulfilledResult<{ cdn: string; latency: number }> => 
        result.status === 'fulfilled' && result.value.latency !== Infinity
      )
      .map(result => result.value);

    if (validResults.length === 0) {
      return this.regionalCDNs[0]; // fallback
    }

    return validResults.sort((a, b) => a.latency - b.latency)[0].cdn;
  }

  private selectQualityForBandwidth(bandwidth: string, deviceType?: string): string {
    // Adjust quality based on device type
    if (deviceType === 'mobile') {
      // Mobile devices typically use lower quality to save data
      const mobileQualityMap: Record<string, string> = {
        '2160p': '1080p',
        '1440p': '720p',
        '1080p': '720p',
        '720p': '480p',
        '480p': '360p',
        '360p': '240p',
        '240p': '240p'
      };
      return mobileQualityMap[bandwidth] || '480p';
    }

    return bandwidth;
  }

  private async estimateBandwidth(): Promise<number> {
    if (this.bandwidthHistory.length === 0) {
      // Default bandwidth estimate
      return 5000000; // 5 Mbps
    }

    // Calculate average of recent measurements
    const recentMeasurements = this.bandwidthHistory.slice(-5);
    return recentMeasurements.reduce((sum, bw) => sum + bw, 0) / recentMeasurements.length;
  }

  private initializeBandwidthMonitoring(): void {
    // Simulate bandwidth monitoring
    setInterval(() => {
      // Simulate network conditions variation
      const baseBandwidth = 5000000; // 5 Mbps base
      const variation = (Math.random() - 0.5) * 2 * 2000000; // ±2 Mbps variation
      const currentBandwidth = Math.max(1000000, baseBandwidth + variation); // minimum 1 Mbps
      
      this.bandwidthHistory.push(currentBandwidth);
      
      // Keep only last 10 measurements
      if (this.bandwidthHistory.length > 10) {
        this.bandwidthHistory.shift();
      }
    }, 30000); // Update every 30 seconds
  }

  private async generateVideoSources(videoId: string): Promise<VideoSource[]> {
    const qualities = await this.getAvailableQualities(videoId);
    const sources: VideoSource[] = [];

    qualities.forEach(quality => {
      // Generate sources for different formats and CDNs
      this.regionalCDNs.forEach(cdn => {
        // HLS source
        sources.push({
          id: `${videoId}-${quality.resolution}-hls-${cdn}`,
          url: `https://${cdn}/videos/${videoId}/${quality.resolution}/playlist.m3u8`,
          quality: quality.resolution as any,
          bitrate: quality.bitrate,
          codec: quality.codec as any,
          type: 'm3u8'
        });

        // DASH source
        sources.push({
          id: `${videoId}-${quality.resolution}-dash-${cdn}`,
          url: `https://${cdn}/videos/${videoId}/${quality.resolution}/manifest.mpd`,
          quality: quality.resolution as any,
          bitrate: quality.bitrate,
          codec: quality.codec as any,
          type: 'mpd'
        });

        // Progressive MP4 source
        sources.push({
          id: `${videoId}-${quality.resolution}-mp4-${cdn}`,
          url: `https://${cdn}/videos/${videoId}/${quality.resolution}/video.mp4`,
          quality: quality.resolution as any,
          bitrate: quality.bitrate,
          codec: quality.codec as any,
          type: 'mp4'
        });
      });
    });

    this.cachedVideos.set(videoId, sources);
    return sources;
  }

  private async simulateRangeRequest(url: string, start: number, end: number): Promise<void> {
    // Simulate HTTP range request
    return new Promise((resolve, reject) => {
      const delay = Math.random() * 100 + 50; // 50-150ms delay
      setTimeout(() => {
        if (Math.random() > 0.05) { // 95% success rate
          resolve();
        } else {
          reject(new Error('Network error'));
        }
      }, delay);
    });
  }

  private async simulateHeadRequest(url: string): Promise<void> {
    // Simulate HTTP HEAD request
    return new Promise((resolve, reject) => {
      const delay = Math.random() * 50 + 10; // 10-60ms delay
      setTimeout(() => {
        if (Math.random() > 0.02) { // 98% success rate
          resolve();
        } else {
          reject(new Error('Network error'));
        }
      }, delay);
    });
  }

  private async checkEdgeHealth(cdn: string, videoId: string): Promise<boolean> {
    try {
      await this.simulateHeadRequest(`https://${cdn}/videos/${videoId}/health`);
      return true;
    } catch {
      return false;
    }
  }
}
