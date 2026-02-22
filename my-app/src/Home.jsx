import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="home">
      <div className="hero">
        <h1>Game Screenshot Identifier</h1>
        <p className="subtitle">
          {isAuthenticated 
            ? `Welcome back, ${user?.username}! Identify any game from a screenshot using AI`
            : "Identify any game from a screenshot using AI"
          }
        </p>
        {isAuthenticated ? (
          <Link to="/identify" className="cta-button">
            Start Identifying
          </Link>
        ) : (
          <Link to="/login" className="cta-button">
            Login to Get Started
          </Link>
        )}
      </div>
      <div className="features">
        <div className="feature-card">
          <h3>🔐 Secure Authentication</h3>
          <p>Create an account to save your game identification history</p>
        </div>
        <div className="feature-card">
          <h3>📸 Upload Screenshot</h3>
          <p>Simply upload a screenshot of any game</p>
        </div>
        <div className="feature-card">
          <h3>🤖 AI Identification</h3>
          <p>Our ML model identifies game automatically</p>
        </div>
        <div className="feature-card">
          <h3>💾 Save & Track</h3>
          <p>Save identifications and view your personal history</p>
        </div>
        <div className="feature-card">
          <h3>� Analytics Dashboard</h3>
          <p>View detailed statistics and charts of your game identifications</p>
        </div>
        <div className="feature-card">
          <h3>�💬 Smart Chatbot</h3>
          <p>Ask questions about games and get help with chat history</p>
        </div>
        <div className="feature-card">
          <h3>🎮 Multiple Games</h3>
          <p>Supports popular games like Minecraft, Fortnite, Valorant & more</p>
        </div>
        <div className="feature-card">
          <h3>📈 Data Visualization</h3>
          <p>Interactive charts showing your identification patterns and trends</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
