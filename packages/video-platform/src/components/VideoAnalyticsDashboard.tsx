import React from 'react';
import { EngagementMetrics, DropOffPoint, QuizPerformanceMetrics } from '../types';

interface VideoAnalyticsDashboardProps {
  videoId: string;
  metrics: EngagementMetrics;
  className?: string;
}

export function VideoAnalyticsDashboard({
  videoId,
  metrics,
  className = ''
}: VideoAnalyticsDashboardProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className={`video-analytics-dashboard ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Video Analytics Dashboard</h2>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600 mb-1">Total Views</h3>
            <p className="text-2xl font-bold text-blue-900">{metrics.totalViews.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600 mb-1">Unique Viewers</h3>
            <p className="text-2xl font-bold text-green-900">{metrics.uniqueViewers.toLocaleString()}</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-600 mb-1">Avg. Watch Time</h3>
            <p className="text-2xl font-bold text-yellow-900">{formatDuration(metrics.averageWatchTime)}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600 mb-1">Completion Rate</h3>
            <p className="text-2xl font-bold text-purple-900">{formatPercentage(metrics.completionRate)}</p>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Interaction Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Interaction Rate:</span>
                <span className="font-semibold">{formatPercentage(metrics.interactionRate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quiz Attempts:</span>
                <span className="font-semibold">{metrics.quizPerformance.totalAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span>Quiz Pass Rate:</span>
                <span className="font-semibold">{formatPercentage(metrics.quizPerformance.passRate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg. Quiz Score:</span>
                <span className="font-semibold">{metrics.quizPerformance.averageScore.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Desktop:</span>
                <span className="font-semibold">{metrics.deviceBreakdown.desktop}</span>
              </div>
              <div className="flex justify-between">
                <span>Mobile:</span>
                <span className="font-semibold">{metrics.deviceBreakdown.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span>Tablet:</span>
                <span className="font-semibold">{metrics.deviceBreakdown.tablet}</span>
              </div>
              <div className="flex justify-between">
                <span>TV:</span>
                <span className="font-semibold">{metrics.deviceBreakdown.tv}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drop-off Analysis */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Drop-off Analysis</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              {metrics.dropOffPoints.slice(0, 5).map((point, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span>
                    {formatDuration(point.timestamp)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${point.dropOffRate * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {formatPercentage(point.dropOffRate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Replayed Segments */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Most Replayed Segments</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              {metrics.replaySegments.slice(0, 5).map((segment, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span>
                    {formatDuration(segment.startTime)} - {formatDuration(segment.endTime)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {segment.replayCount} replays
                    </span>
                    <span className="text-sm text-gray-600">
                      Avg: {segment.averageReplays.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(metrics.geographicDistribution).slice(0, 6).map(([country, data]) => (
                <div key={country} className="bg-white p-3 rounded">
                  <h4 className="font-medium">{country}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Views: {data.views}</div>
                    <div>Watch Time: {formatDuration(data.watchTime)}</div>
                    <div>Completion: {formatPercentage(data.completionRate)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
