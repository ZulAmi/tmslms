import { OfflineVideo, DownloadProgress, VideoMetadata, VideoSource } from '../types';

export interface OfflineVideoService {
  downloadVideo(videoId: string, quality?: string): Promise<DownloadProgress>;
  pauseDownload(videoId: string): Promise<void>;
  resumeDownload(videoId: string): Promise<void>;
  cancelDownload(videoId: string): Promise<void>;
  getDownloadProgress(videoId: string): Promise<DownloadProgress | null>;
  getOfflineVideos(): Promise<OfflineVideo[]>;
  deleteOfflineVideo(videoId: string): Promise<void>;
  isVideoAvailableOffline(videoId: string): Promise<boolean>;
  getOfflineVideoPath(videoId: string): Promise<string | null>;
  checkStorageSpace(): Promise<{ available: number; used: number; total: number }>;
  cleanupExpiredVideos(): Promise<void>;
}

export class InMemoryOfflineVideoService implements OfflineVideoService {
  private downloads: Map<string, DownloadProgress> = new Map();
  private offlineVideos: Map<string, OfflineVideo> = new Map();
  private downloadControllers: Map<string, AbortController> = new Map();
  private maxStorageSize = 5 * 1024 * 1024 * 1024; // 5GB default
  private currentStorageUsed = 0;

  constructor(maxStorageMB?: number) {
    if (maxStorageMB) {
      this.maxStorageSize = maxStorageMB * 1024 * 1024;
    }
    
    // Cleanup expired videos every hour
    setInterval(() => this.cleanupExpiredVideos(), 60 * 60 * 1000);
  }

  async downloadVideo(videoId: string, quality = '720p'): Promise<DownloadProgress> {
    // Check if already downloading or downloaded
    const existingProgress = this.downloads.get(videoId);
    if (existingProgress && existingProgress.status === 'downloading') {
      return existingProgress;
    }

    const existingOffline = this.offlineVideos.get(videoId);
    if (existingOffline) {
      return {
        videoId,
        progress: 100,
        downloadedBytes: existingOffline.size,
        totalBytes: existingOffline.size,
        speed: 0,
        timeRemaining: 0,
        status: 'completed'
      };
    }

    // Check storage space
    const storageInfo = await this.checkStorageSpace();
    const estimatedSize = this.estimateVideoSize(quality);
    
    if (storageInfo.available < estimatedSize) {
      throw new Error('Insufficient storage space for download');
    }

    // Initialize download progress
    const downloadProgress: DownloadProgress = {
      videoId,
      progress: 0,
      downloadedBytes: 0,
      totalBytes: estimatedSize,
      speed: 0,
      timeRemaining: 0,
      status: 'downloading'
    };

    this.downloads.set(videoId, downloadProgress);

    // Create abort controller for cancellation
    const abortController = new AbortController();
    this.downloadControllers.set(videoId, abortController);

    // Start download simulation (in real implementation, use fetch/xhr)
    this.simulateDownload(videoId, quality, estimatedSize, abortController.signal);

    return downloadProgress;
  }

  async pauseDownload(videoId: string): Promise<void> {
    const progress = this.downloads.get(videoId);
    if (progress && progress.status === 'downloading') {
      progress.status = 'paused';
      this.downloads.set(videoId, progress);
    }
  }

  async resumeDownload(videoId: string): Promise<void> {
    const progress = this.downloads.get(videoId);
    if (progress && progress.status === 'paused') {
      progress.status = 'downloading';
      this.downloads.set(videoId, progress);
      
      // Resume download simulation
      const controller = new AbortController();
      this.downloadControllers.set(videoId, controller);
      this.simulateDownload(videoId, '720p', progress.totalBytes, controller.signal, progress.downloadedBytes);
    }
  }

  async cancelDownload(videoId: string): Promise<void> {
    const controller = this.downloadControllers.get(videoId);
    if (controller) {
      controller.abort();
      this.downloadControllers.delete(videoId);
    }

    const progress = this.downloads.get(videoId);
    if (progress) {
      progress.status = 'failed';
      progress.error = 'Download cancelled by user';
      this.downloads.set(videoId, progress);
    }

    // Clean up partial download
    setTimeout(() => {
      this.downloads.delete(videoId);
    }, 5000);
  }

  async getDownloadProgress(videoId: string): Promise<DownloadProgress | null> {
    return this.downloads.get(videoId) || null;
  }

  async getOfflineVideos(): Promise<OfflineVideo[]> {
    return Array.from(this.offlineVideos.values());
  }

  async deleteOfflineVideo(videoId: string): Promise<void> {
    const offlineVideo = this.offlineVideos.get(videoId);
    if (offlineVideo) {
      this.currentStorageUsed -= offlineVideo.size;
      this.offlineVideos.delete(videoId);
      
      // In a real implementation, delete the actual file
      console.log(`Deleted offline video: ${offlineVideo.path}`);
    }
  }

  async isVideoAvailableOffline(videoId: string): Promise<boolean> {
    const offlineVideo = this.offlineVideos.get(videoId);
    if (!offlineVideo) return false;

    // Check if expired
    if (offlineVideo.expiresAt && offlineVideo.expiresAt < new Date()) {
      await this.deleteOfflineVideo(videoId);
      return false;
    }

    return true;
  }

  async getOfflineVideoPath(videoId: string): Promise<string | null> {
    const isAvailable = await this.isVideoAvailableOffline(videoId);
    if (!isAvailable) return null;

    const offlineVideo = this.offlineVideos.get(videoId);
    return offlineVideo?.path || null;
  }

  async checkStorageSpace(): Promise<{ available: number; used: number; total: number }> {
    const used = this.currentStorageUsed;
    const total = this.maxStorageSize;
    const available = total - used;

    return { available, used, total };
  }

  async cleanupExpiredVideos(): Promise<void> {
    const now = new Date();
    const expiredVideos: string[] = [];

    this.offlineVideos.forEach((video, videoId) => {
      if (video.expiresAt && video.expiresAt < now) {
        expiredVideos.push(videoId);
      }
    });

    for (const videoId of expiredVideos) {
      await this.deleteOfflineVideo(videoId);
    }

    console.log(`Cleaned up ${expiredVideos.length} expired offline videos`);
  }

  private estimateVideoSize(quality: string): number {
    // Rough estimates for 1 hour of video (in bytes)
    const sizeEstimates: Record<string, number> = {
      '240p': 150 * 1024 * 1024,   // 150MB
      '360p': 250 * 1024 * 1024,   // 250MB
      '480p': 400 * 1024 * 1024,   // 400MB
      '720p': 800 * 1024 * 1024,   // 800MB
      '1080p': 1500 * 1024 * 1024, // 1.5GB
      '1440p': 3000 * 1024 * 1024, // 3GB
      '2160p': 6000 * 1024 * 1024  // 6GB
    };

    return sizeEstimates[quality] || sizeEstimates['720p'];
  }

  private async simulateDownload(
    videoId: string, 
    quality: string, 
    totalBytes: number, 
    signal: AbortSignal,
    startBytes = 0
  ): Promise<void> {
    const chunkSize = 64 * 1024; // 64KB chunks
    const downloadSpeed = 1024 * 1024; // 1MB/s simulation
    const updateInterval = 100; // Update every 100ms

    let downloadedBytes = startBytes;
    const startTime = Date.now();

    const updateProgress = () => {
      const progress = this.downloads.get(videoId);
      if (!progress || progress.status !== 'downloading' || signal.aborted) {
        return;
      }

      const elapsedTime = (Date.now() - startTime) / 1000;
      const speed = downloadedBytes / elapsedTime;
      const remainingBytes = totalBytes - downloadedBytes;
      const timeRemaining = speed > 0 ? remainingBytes / speed : 0;

      const updatedProgress: DownloadProgress = {
        ...progress,
        progress: (downloadedBytes / totalBytes) * 100,
        downloadedBytes,
        speed,
        timeRemaining
      };

      this.downloads.set(videoId, updatedProgress);

      // Continue downloading
      if (downloadedBytes < totalBytes && !signal.aborted) {
        downloadedBytes += chunkSize;
        setTimeout(updateProgress, updateInterval);
      } else if (downloadedBytes >= totalBytes) {
        // Download completed
        this.completeDownload(videoId, quality, totalBytes);
      }
    };

    updateProgress();
  }

  private completeDownload(videoId: string, quality: string, size: number): void {
    const progress = this.downloads.get(videoId);
    if (!progress) return;

    // Create offline video entry
    const offlineVideo: OfflineVideo = {
      videoId,
      downloadedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      size,
      quality,
      format: 'mp4',
      path: `/offline/videos/${videoId}_${quality}.mp4`,
      encrypted: true
    };

    this.offlineVideos.set(videoId, offlineVideo);
    this.currentStorageUsed += size;

    // Update progress to completed
    const completedProgress: DownloadProgress = {
      ...progress,
      progress: 100,
      downloadedBytes: size,
      status: 'completed',
      speed: 0,
      timeRemaining: 0
    };

    this.downloads.set(videoId, completedProgress);

    // Clean up download progress after 5 minutes
    setTimeout(() => {
      this.downloads.delete(videoId);
      this.downloadControllers.delete(videoId);
    }, 5 * 60 * 1000);

    console.log(`Download completed for video ${videoId} (${quality})`);
  }
}
