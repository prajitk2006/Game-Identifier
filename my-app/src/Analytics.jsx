import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import './Analytics.css';

const Analytics = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsResponse, chartsResponse] = await Promise.all([
        fetch('/api/analytics/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/analytics/charts', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsResponse.ok && chartsResponse.ok) {
        const statsData = await statsResponse.json();
        const chartsData = await chartsResponse.json();
        
        setStats(statsData);
        setChartData(chartsData);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>Game Identification Analytics</h1>
        <p>Track your game identification patterns and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Identifications</h3>
          <div className="stat-value">{stats.totalIdentifications}</div>
        </div>
        <div className="stat-card">
          <h3>Unique Games</h3>
          <div className="stat-value">{stats.uniqueGames}</div>
        </div>
        <div className="stat-card">
          <h3>Average Confidence</h3>
          <div className="stat-value">{stats.averageConfidence}%</div>
        </div>
        <div className="stat-card">
          <h3>Most Identified</h3>
          <div className="stat-value">{stats.mostIdentifiedGame}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Confidence Distribution Chart */}
        <div className="chart-container">
          <h3>Confidence Distribution</h3>
          <div className="chart">
            {chartData.confidenceChart.map((item, index) => (
              <div key={index} className="bar-chart-item">
                <div className="bar-label">{item.range}%</div>
                <div 
                  className="bar" 
                  style={{ 
                    height: `${Math.max(item.count * 10, 5)}px`,
                    backgroundColor: getConfidenceColor(item.range)
                  }}
                ></div>
                <div className="bar-value">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Distribution Chart */}
        <div className="chart-container">
          <h3>Genre Distribution</h3>
          <div className="chart">
            {chartData.genreChart.map((item, index) => (
              <div key={index} className="pie-chart-item">
                <div 
                  className="pie-segment" 
                  style={{ 
                    backgroundColor: getGenreColor(item.genre),
                    width: `${(item.count / stats.totalIdentifications) * 100}%`
                  }}
                ></div>
                <div className="pie-label">
                  {item.genre} ({item.count})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="chart-container">
          <h3>30-Day Activity</h3>
          <div className="chart timeline-chart">
            {chartData.timelineChart.map((item, index) => (
              <div key={index} className="timeline-item">
                <div 
                  className="timeline-bar" 
                  style={{ 
                    height: `${Math.max(item.count * 20, 2)}px`
                  }}
                ></div>
                <div className="timeline-date">
                  {new Date(item.date).getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="chart-container">
          <h3>Platform Distribution</h3>
          <div className="chart">
            {chartData.platformChart.map((item, index) => (
              <div key={index} className="platform-item">
                <div className="platform-name">{item.platform}</div>
                <div className="platform-bar-container">
                  <div 
                    className="platform-bar" 
                    style={{ 
                      width: `${(item.count / stats.totalIdentifications) * 100}%`,
                      backgroundColor: getPlatformColor(item.platform)
                    }}
                  ></div>
                </div>
                <div className="platform-count">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-game">{activity.gameName}</div>
              <div className="activity-confidence">{activity.confidence}%</div>
              <div className="activity-date">
                {new Date(activity.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions for colors
function getConfidenceColor(range) {
  const colors = {
    '0-20': '#ff4444',
    '21-40': '#ff8844',
    '41-60': '#ffaa44',
    '61-80': '#44ff44',
    '81-100': '#44ff88'
  };
  return colors[range] || '#888888';
}

function getGenreColor(genre) {
  const colors = {
    'Sandbox': '#4CAF50',
    'Battle Royale': '#FF9800',
    'Tactical FPS': '#F44336',
    'Social Deduction': '#9C27B0',
    'Open World Action': '#2196F3',
    'MOBA': '#FF5722',
    'Game Platform': '#795548',
    'FPS': '#607D8B'
  };
  return colors[genre] || '#888888';
}

function getPlatformColor(platform) {
  const colors = {
    'Multi-platform': '#4CAF50',
    'PC': '#2196F3',
    'Unknown': '#888888'
  };
  return colors[platform] || '#888888';
}

export default Analytics;
