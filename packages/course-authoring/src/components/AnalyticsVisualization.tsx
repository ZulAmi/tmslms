// Simplified Analytics Visualization Component
import { CourseAnalytics, UUID } from '../types';
import { InMemoryAnalyticsService, TimeRange } from '../analytics/analytics';

interface AnalyticsVisualizationProps {
  courseId?: UUID;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  onClose?: () => void;
}

interface MetricCard {
  title: string;
  value: string;
  trend: number; // percentage change
  icon: string;
  color: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export const AnalyticsVisualization = (props: AnalyticsVisualizationProps) => {
  const { courseId, timeRange = 'month', onClose } = props;
  
  // Mock analytics data
  const mockAnalytics = {
    enrollments: 245,
    completions: 198,
    avgTimeSpentMins: 127,
    engagementScore: 82,
    dropOffRate: 0.19
  };

  const loading = false;
  let activeChart = 'engagement';

  const analyticsService = new InMemoryAnalyticsService();

  const createTimeRange = (range: string): TimeRange => {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    
    return { start, end };
  };

  const loadAnalytics = async () => {
    if (!courseId) return;
    console.log('Loading analytics for course:', courseId);
  };

  const getMetricCards = (): MetricCard[] => {
    return [
      {
        title: 'Total Enrollments',
        value: mockAnalytics.enrollments.toString(),
        trend: 12.5, // Mock trend data
        icon: '👥',
        color: '#2196f3'
      },
      {
        title: 'Completion Rate',
        value: `${Math.round((mockAnalytics.completions / mockAnalytics.enrollments) * 100)}%`,
        trend: 8.2,
        icon: '✅',
        color: '#4caf50'
      },
      {
        title: 'Avg. Time Spent',
        value: `${Math.round(mockAnalytics.avgTimeSpentMins)} min`,
        trend: -3.1,
        icon: '⏱️',
        color: '#ff9800'
      },
      {
        title: 'Engagement Score',
        value: `${mockAnalytics.engagementScore}/100`,
        trend: 15.7,
        icon: '📊',
        color: '#9c27b0'
      },
      {
        title: 'Drop-off Rate',
        value: `${Math.round(mockAnalytics.dropOffRate * 100)}%`,
        trend: -5.4, // Negative trend is good for drop-off
        icon: '📉',
        color: '#f44336'
      }
    ];
  };

  const renderChart = (data: ChartDataPoint[], type: 'line' | 'bar' = 'line') => {
    if (data.length === 0) return <div className="no-data">No data available</div>;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="chart-container">
        <svg className="chart" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 40}
              x2="400"
              y2={i * 40}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Data visualization */}
          {type === 'line' ? (
            <>
              {/* Line chart */}
              <polyline
                points={data.map((d, i) => {
                  const x = (i / (data.length - 1)) * 400;
                  const y = 180 - ((d.value - minValue) / range) * 160;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#2196f3"
                strokeWidth="2"
              />
              
              {/* Data points */}
              {data.map((d, i) => {
                const x = (i / (data.length - 1)) * 400;
                const y = 180 - ((d.value - minValue) / range) * 160;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#2196f3"
                    className="data-point"
                  />
                );
              })}
            </>
          ) : (
            /* Bar chart */
            data.map((d, i) => {
              const x = (i / data.length) * 400;
              const width = 400 / data.length - 10;
              const height = ((d.value - minValue) / range) * 160;
              const y = 180 - height;
              return (
                <rect
                  key={i}
                  x={x + 5}
                  y={y}
                  width={width}
                  height={height}
                  fill="#2196f3"
                  className="bar"
                />
              );
            })
          )}
          
          {/* X-axis labels */}
          {data.map((d, i) => {
            if (i % Math.ceil(data.length / 6) === 0) {
              const x = (i / (data.length - 1)) * 400;
              return (
                <text
                  key={i}
                  x={x}
                  y="195"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#666"
                >
                  {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    );
  };

  const generateMockData = (type: 'engagement' | 'completion'): ChartDataPoint[] => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365;
    const data: ChartDataPoint[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      let value: number;
      if (type === 'engagement') {
        value = 50 + Math.random() * 40 + Math.sin(i / 7) * 10; // Simulated engagement score
      } else {
        value = Math.random() * 20 + i * 0.1; // Simulated completion count
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 10) / 10
      });
    }
    
    return data;
  };

  const handleChartChange = (chart: string) => {
    activeChart = chart;
    console.log('Chart changed to:', chart);
  };

  const handleTimeRangeChange = () => {
    console.log('Time range changed, reloading page');
    window.location.reload();
  };

  const metricCards = getMetricCards();
  const chartData = activeChart === 'engagement' 
    ? generateMockData('engagement')
    : generateMockData('completion');

  if (loading) {
    return (
      <div className="analytics-visualization">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="analytics-visualization">
        <div className="no-course">Please select a course to view analytics.</div>
      </div>
    );
  }

  return (
    <div className="analytics-visualization">
      <div className="header">
        <h2>Course Analytics</h2>
        <div className="controls">
          <select value={timeRange} onChange={handleTimeRangeChange}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button onClick={() => loadAnalytics()}>Refresh</button>
          {onClose && <button onClick={onClose}>Close</button>}
        </div>
      </div>

      <div className="metrics-grid">
        {metricCards.map((metric, index) => (
          <div key={index} className="metric-card" style={{ borderLeftColor: metric.color }}>
            <div className="metric-header">
              <span className="metric-icon">{metric.icon}</span>
              <span className="metric-title">{metric.title}</span>
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className={`metric-trend ${metric.trend >= 0 ? 'positive' : 'negative'}`}>
              {metric.trend >= 0 ? '↗' : '↘'} {Math.abs(metric.trend)}%
            </div>
          </div>
        ))}
      </div>

      <div className="charts-section">
        <div className="chart-tabs">
          <button 
            className={activeChart === 'engagement' ? 'active' : ''}
            onClick={() => handleChartChange('engagement')}
          >
            Engagement Trend
          </button>
          <button 
            className={activeChart === 'completion' ? 'active' : ''}
            onClick={() => handleChartChange('completion')}
          >
            Completion Trend
          </button>
          <button 
            className={activeChart === 'progress' ? 'active' : ''}
            onClick={() => handleChartChange('progress')}
          >
            Learning Progress
          </button>
        </div>

        <div className="chart-content">
          {activeChart === 'engagement' && (
            <div className="chart-panel">
              <h3>Engagement Score Over Time</h3>
              <p>Average daily engagement score based on user interactions</p>
              {renderChart(chartData, 'line')}
            </div>
          )}
          
          {activeChart === 'completion' && (
            <div className="chart-panel">
              <h3>Course Completions</h3>
              <p>Number of students completing the course over time</p>
              {renderChart(chartData, 'bar')}
            </div>
          )}
          
          {activeChart === 'progress' && (
            <div className="chart-panel">
              <h3>Learning Progress Distribution</h3>
              <div className="progress-breakdown">
                <div className="progress-item">
                  <div className="progress-label">Not Started</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '25%', backgroundColor: '#f44336' }}></div>
                  </div>
                  <div className="progress-value">25%</div>
                </div>
                <div className="progress-item">
                  <div className="progress-label">In Progress</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '45%', backgroundColor: '#ff9800' }}></div>
                  </div>
                  <div className="progress-value">45%</div>
                </div>
                <div className="progress-item">
                  <div className="progress-label">Completed</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '30%', backgroundColor: '#4caf50' }}></div>
                  </div>
                  <div className="progress-value">30%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="insights-section">
        <h3>Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>🎯 Engagement Peak</h4>
            <p>Highest engagement occurs on weekdays between 2-4 PM. Consider scheduling live sessions during this time.</p>
          </div>
          <div className="insight-card">
            <h4>📚 Content Performance</h4>
            <p>Video content has 40% higher engagement than text-based lessons. Consider adding more interactive videos.</p>
          </div>
          <div className="insight-card">
            <h4>⚠️ Drop-off Points</h4>
            <p>Most students drop off at Module 3. Review content difficulty and add more support materials.</p>
          </div>
          <div className="insight-card">
            <h4>🚀 Completion Boost</h4>
            <p>Students who complete assessments are 60% more likely to finish the course. Encourage early assessment participation.</p>
          </div>
        </div>
      </div>

      <style>{`
        .analytics-visualization {
          padding: 24px;
          background: #f8f9fa;
          min-height: 100vh;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          background: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header h2 {
          margin: 0;
        }
        .controls {
          display: flex;
          gap: 12px;
        }
        .controls select, .controls button {
          padding: 8px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .metric-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .metric-icon {
          font-size: 20px;
        }
        .metric-title {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }
        .metric-value {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        .metric-trend {
          font-size: 14px;
          font-weight: 500;
        }
        .metric-trend.positive {
          color: #4caf50;
        }
        .metric-trend.negative {
          color: #f44336;
        }
        .charts-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 32px;
        }
        .chart-tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
        }
        .chart-tabs button {
          padding: 16px 24px;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
        }
        .chart-tabs button.active {
          border-bottom-color: #2196f3;
          color: #2196f3;
          font-weight: 500;
        }
        .chart-content {
          padding: 24px;
        }
        .chart-panel h3 {
          margin: 0 0 8px 0;
          color: #333;
        }
        .chart-panel p {
          margin: 0 0 24px 0;
          color: #666;
        }
        .chart-container {
          width: 100%;
          height: 300px;
          margin-bottom: 16px;
        }
        .chart {
          width: 100%;
          height: 100%;
        }
        .data-point:hover, .bar:hover {
          fill: #1976d2;
          cursor: pointer;
        }
        .progress-breakdown {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .progress-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .progress-label {
          min-width: 100px;
          font-weight: 500;
        }
        .progress-bar {
          flex: 1;
          height: 20px;
          background: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        .progress-value {
          min-width: 50px;
          text-align: right;
          font-weight: 500;
        }
        .insights-section {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .insights-section h3 {
          margin: 0 0 20px 0;
          color: #333;
        }
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }
        .insight-card {
          padding: 16px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: #f8f9fa;
        }
        .insight-card h4 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 16px;
        }
        .insight-card p {
          margin: 0;
          color: #666;
          font-size: 14px;
          line-height: 1.4;
        }
        .loading, .no-course, .no-data {
          padding: 48px;
          text-align: center;
          color: #666;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};
