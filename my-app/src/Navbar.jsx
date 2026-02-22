import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          GameID
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>
          {isAuthenticated && (
            <li className="nav-item">
              <Link 
                to="/identify" 
                className={`nav-link ${isActiveLink('/identify') ? 'active' : ''}`}
              >
                Identify Game
              </Link>
            </li>
          )}
          {isAuthenticated && (
            <li className="nav-item">
              <Link 
                to="/history" 
                className={`nav-link ${isActiveLink('/history') ? 'active' : ''}`}
              >
                History
              </Link>
            </li>
          )}
          {isAuthenticated && (
            <li className="nav-item">
              <Link 
                to="/analytics" 
                className={`nav-link ${isActiveLink('/analytics') ? 'active' : ''}`}
              >
                Analytics
              </Link>
            </li>
          )}
          <li className="nav-item">
            <Link 
              to="/about" 
              className={`nav-link ${isActiveLink('/about') ? 'active' : ''}`}
            >
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/chat" 
              className={`nav-link ${isActiveLink('/chat') ? 'active' : ''}`}
            >
              Chat
            </Link>
          </li>
          {isAuthenticated ? (
            <li className="nav-item nav-user">
              <span className="user-info">
                Welcome, {user?.username}
              </span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          ) : (
            <li className="nav-item">
              <Link 
                to="/login" 
                className={`nav-link ${isActiveLink('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
