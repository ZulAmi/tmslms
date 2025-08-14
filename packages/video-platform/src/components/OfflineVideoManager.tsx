import React from 'react';
import { OfflineVideo, DownloadProgress } from '../types';

interface OfflineVideoManagerProps {
  offlineVideos: OfflineVideo[];
  downloadProgress: Record<string, DownloadProgress>;
  onDownload: (videoId: string, quality?: string) => Promise<void>;
  onPause: (videoId: string) => Promise<void>;
  onResume: (videoId: string) => Promise<void>;
  onCancel: (videoId: string) => Promise<void>;
  onDelete: (videoId: string) => Promise<void>;
  className?: string;
}

export function OfflineVideoManager({
  offlineVideos,
  downloadProgress,
  onDownload,
  onPause,
  onResume,
  onCancel,
  onDelete,
  className = ''
}: OfflineVideoManagerProps) {
  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'downloading': return 'text-blue-600';
      case 'paused': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'downloading':
        return (
          <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'paused':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`offline-video-manager ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Offline Video Manager</h2>

        {/* Storage Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Storage Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Total Videos:</span>
              <p className="text-xl font-bold">{offlineVideos.length}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Size:</span>
              <p className="text-xl font-bold">
                {formatFileSize(offlineVideos.reduce((sum, video) => sum + video.size, 0))}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Active Downloads:</span>
              <p className="text-xl font-bold">
                {Object.values(downloadProgress).filter(p => p.status === 'downloading').length}
              </p>
            </div>
          </div>
        </div>

        {/* Active Downloads */}
        {Object.keys(downloadProgress).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Active Downloads</h3>
            <div className="space-y-3">
              {Object.entries(downloadProgress).map(([videoId, progress]) => (
                <div key={videoId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(progress.status)}
                      <span className="font-medium">Video {videoId}</span>
                      <span className={`text-sm ${getStatusColor(progress.status)}`}>
                        {progress.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {progress.status === 'downloading' && (
                        <button
                          onClick={() => onPause(videoId)}
                          className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                          Pause
                        </button>
                      )}
                      {progress.status === 'paused' && (
                        <button
                          onClick={() => onResume(videoId)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Resume
                        </button>
                      )}
                      <button
                        onClick={() => onCancel(videoId)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatFileSize(progress.downloadedBytes)} / {formatFileSize(progress.totalBytes)}</span>
                    <span>
                      {progress.status === 'downloading' && progress.speed > 0 && (
                        <>
                          {formatFileSize(progress.speed)}/s • {formatTimeRemaining(progress.timeRemaining)} remaining
                        </>
                      )}
                      {progress.status === 'completed' && 'Download completed'}
                      {progress.status === 'failed' && progress.error}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offline Videos List */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Downloaded Videos</h3>
          {offlineVideos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p>No offline videos available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offlineVideos.map((video) => (
                <div key={video.videoId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 truncate">
                        Video {video.videoId}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {video.quality} • {video.format.toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => onDelete(video.videoId)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete offline video"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span>{formatFileSize(video.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Downloaded:</span>
                      <span>{video.downloadedAt.toLocaleDateString()}</span>
                    </div>
                    {video.expiresAt && (
                      <div className="flex justify-between">
                        <span>Expires:</span>
                        <span className={video.expiresAt < new Date() ? 'text-red-600' : ''}>
                          {video.expiresAt.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="flex items-center space-x-1">
                        {video.encrypted && (
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="text-green-600">Available</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors">
                      Play Offline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Download New Video */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Download New Video</h3>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Enter video ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="720p">720p</option>
              <option value="480p">480p</option>
              <option value="360p">360p</option>
              <option value="1080p">1080p</option>
            </select>
            <button
              onClick={() => onDownload('example-video-id', '720p')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
