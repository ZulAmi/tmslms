"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsVisualization = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const analytics_1 = require("../analytics/analytics");
const AnalyticsVisualization = (props) => {
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
    const analyticsService = new analytics_1.InMemoryAnalyticsService();
    const createTimeRange = (range) => {
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
        if (!courseId)
            return;
        console.log('Loading analytics for course:', courseId);
    };
    const getMetricCards = () => {
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
    const renderChart = (data, type = 'line') => {
        if (data.length === 0)
            return (0, jsx_runtime_1.jsx)("div", { className: "no-data", children: "No data available" });
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const range = maxValue - minValue || 1;
        return ((0, jsx_runtime_1.jsx)("div", { className: "chart-container", children: (0, jsx_runtime_1.jsxs)("svg", { className: "chart", viewBox: "0 0 400 200", children: [[0, 1, 2, 3, 4].map(i => ((0, jsx_runtime_1.jsx)("line", { x1: "0", y1: i * 40, x2: "400", y2: i * 40, stroke: "#f0f0f0", strokeWidth: "1" }, i))), type === 'line' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("polyline", { points: data.map((d, i) => {
                                    const x = (i / (data.length - 1)) * 400;
                                    const y = 180 - ((d.value - minValue) / range) * 160;
                                    return `${x},${y}`;
                                }).join(' '), fill: "none", stroke: "#2196f3", strokeWidth: "2" }), data.map((d, i) => {
                                const x = (i / (data.length - 1)) * 400;
                                const y = 180 - ((d.value - minValue) / range) * 160;
                                return ((0, jsx_runtime_1.jsx)("circle", { cx: x, cy: y, r: "4", fill: "#2196f3", className: "data-point" }, i));
                            })] })) : (
                    /* Bar chart */
                    data.map((d, i) => {
                        const x = (i / data.length) * 400;
                        const width = 400 / data.length - 10;
                        const height = ((d.value - minValue) / range) * 160;
                        const y = 180 - height;
                        return ((0, jsx_runtime_1.jsx)("rect", { x: x + 5, y: y, width: width, height: height, fill: "#2196f3", className: "bar" }, i));
                    })), data.map((d, i) => {
                        if (i % Math.ceil(data.length / 6) === 0) {
                            const x = (i / (data.length - 1)) * 400;
                            return ((0, jsx_runtime_1.jsx)("text", { x: x, y: "195", textAnchor: "middle", fontSize: "12", fill: "#666", children: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }, i));
                        }
                        return null;
                    })] }) }));
    };
    const generateMockData = (type) => {
        const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365;
        const data = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - i));
            let value;
            if (type === 'engagement') {
                value = 50 + Math.random() * 40 + Math.sin(i / 7) * 10; // Simulated engagement score
            }
            else {
                value = Math.random() * 20 + i * 0.1; // Simulated completion count
            }
            data.push({
                date: date.toISOString().split('T')[0],
                value: Math.round(value * 10) / 10
            });
        }
        return data;
    };
    const handleChartChange = (chart) => {
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
        return ((0, jsx_runtime_1.jsx)("div", { className: "analytics-visualization", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Loading analytics..." }) }));
    }
    if (!courseId) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "analytics-visualization", children: (0, jsx_runtime_1.jsx)("div", { className: "no-course", children: "Please select a course to view analytics." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "analytics-visualization", children: [(0, jsx_runtime_1.jsxs)("div", { className: "header", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Course Analytics" }), (0, jsx_runtime_1.jsxs)("div", { className: "controls", children: [(0, jsx_runtime_1.jsxs)("select", { value: timeRange, onChange: handleTimeRangeChange, children: [(0, jsx_runtime_1.jsx)("option", { value: "week", children: "Last Week" }), (0, jsx_runtime_1.jsx)("option", { value: "month", children: "Last Month" }), (0, jsx_runtime_1.jsx)("option", { value: "quarter", children: "Last Quarter" }), (0, jsx_runtime_1.jsx)("option", { value: "year", children: "Last Year" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => loadAnalytics(), children: "Refresh" }), onClose && (0, jsx_runtime_1.jsx)("button", { onClick: onClose, children: "Close" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "metrics-grid", children: metricCards.map((metric, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "metric-card", style: { borderLeftColor: metric.color }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "metric-header", children: [(0, jsx_runtime_1.jsx)("span", { className: "metric-icon", children: metric.icon }), (0, jsx_runtime_1.jsx)("span", { className: "metric-title", children: metric.title })] }), (0, jsx_runtime_1.jsx)("div", { className: "metric-value", children: metric.value }), (0, jsx_runtime_1.jsxs)("div", { className: `metric-trend ${metric.trend >= 0 ? 'positive' : 'negative'}`, children: [metric.trend >= 0 ? '↗' : '↘', " ", Math.abs(metric.trend), "%"] })] }, index))) }), (0, jsx_runtime_1.jsxs)("div", { className: "charts-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "chart-tabs", children: [(0, jsx_runtime_1.jsx)("button", { className: activeChart === 'engagement' ? 'active' : '', onClick: () => handleChartChange('engagement'), children: "Engagement Trend" }), (0, jsx_runtime_1.jsx)("button", { className: activeChart === 'completion' ? 'active' : '', onClick: () => handleChartChange('completion'), children: "Completion Trend" }), (0, jsx_runtime_1.jsx)("button", { className: activeChart === 'progress' ? 'active' : '', onClick: () => handleChartChange('progress'), children: "Learning Progress" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "chart-content", children: [activeChart === 'engagement' && ((0, jsx_runtime_1.jsxs)("div", { className: "chart-panel", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Engagement Score Over Time" }), (0, jsx_runtime_1.jsx)("p", { children: "Average daily engagement score based on user interactions" }), renderChart(chartData, 'line')] })), activeChart === 'completion' && ((0, jsx_runtime_1.jsxs)("div", { className: "chart-panel", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Course Completions" }), (0, jsx_runtime_1.jsx)("p", { children: "Number of students completing the course over time" }), renderChart(chartData, 'bar')] })), activeChart === 'progress' && ((0, jsx_runtime_1.jsxs)("div", { className: "chart-panel", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Learning Progress Distribution" }), (0, jsx_runtime_1.jsxs)("div", { className: "progress-breakdown", children: [(0, jsx_runtime_1.jsxs)("div", { className: "progress-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "progress-label", children: "Not Started" }), (0, jsx_runtime_1.jsx)("div", { className: "progress-bar", children: (0, jsx_runtime_1.jsx)("div", { className: "progress-fill", style: { width: '25%', backgroundColor: '#f44336' } }) }), (0, jsx_runtime_1.jsx)("div", { className: "progress-value", children: "25%" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "progress-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "progress-label", children: "In Progress" }), (0, jsx_runtime_1.jsx)("div", { className: "progress-bar", children: (0, jsx_runtime_1.jsx)("div", { className: "progress-fill", style: { width: '45%', backgroundColor: '#ff9800' } }) }), (0, jsx_runtime_1.jsx)("div", { className: "progress-value", children: "45%" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "progress-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "progress-label", children: "Completed" }), (0, jsx_runtime_1.jsx)("div", { className: "progress-bar", children: (0, jsx_runtime_1.jsx)("div", { className: "progress-fill", style: { width: '30%', backgroundColor: '#4caf50' } }) }), (0, jsx_runtime_1.jsx)("div", { className: "progress-value", children: "30%" })] })] })] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "insights-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Key Insights" }), (0, jsx_runtime_1.jsxs)("div", { className: "insights-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "insight-card", children: [(0, jsx_runtime_1.jsx)("h4", { children: "\uD83C\uDFAF Engagement Peak" }), (0, jsx_runtime_1.jsx)("p", { children: "Highest engagement occurs on weekdays between 2-4 PM. Consider scheduling live sessions during this time." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "insight-card", children: [(0, jsx_runtime_1.jsx)("h4", { children: "\uD83D\uDCDA Content Performance" }), (0, jsx_runtime_1.jsx)("p", { children: "Video content has 40% higher engagement than text-based lessons. Consider adding more interactive videos." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "insight-card", children: [(0, jsx_runtime_1.jsx)("h4", { children: "\u26A0\uFE0F Drop-off Points" }), (0, jsx_runtime_1.jsx)("p", { children: "Most students drop off at Module 3. Review content difficulty and add more support materials." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "insight-card", children: [(0, jsx_runtime_1.jsx)("h4", { children: "\uD83D\uDE80 Completion Boost" }), (0, jsx_runtime_1.jsx)("p", { children: "Students who complete assessments are 60% more likely to finish the course. Encourage early assessment participation." })] })] })] }), (0, jsx_runtime_1.jsx)("style", { children: `
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
      ` })] }));
};
exports.AnalyticsVisualization = AnalyticsVisualization;
