import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import './GameHistory.css';

const GameHistory = () => {
  const { token } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/games', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data);
    } catch (err) {
      setError(err.message || 'Failed to load game history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this game identification?')) {
      return;
    }

    try {
      const response = await fetch(`/api/games/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete game');
      }

      setGames(games.filter(game => game._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete game');
    }
  };

  if (loading) {
    return (
      <div className="game-history">
        <div className="container">
          <div className="loading">Loading game history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-history">
      <div className="container">
        <div className="header">
          <h1>Game Identification History</h1>
          <button onClick={fetchGames} className="btn-refresh">
            Refresh
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {games.length === 0 ? (
          <div className="empty-state">
            <p>No game identifications saved yet.</p>
            <p>Upload a screenshot to get started!</p>
          </div>
        ) : (
          <div className="games-grid">
            {games.map((game) => (
              <div key={game._id} className="game-card">
                {game.screenshotUrl && (
                  <div className="game-image">
                    <img src={game.screenshotUrl} alt={game.gameName} />
                  </div>
                )}
                <div className="game-details">
                  <h3>{game.gameName || 'Unknown Game'}</h3>
                  {game.confidence && (
                    <p className="confidence">
                      Confidence: {(game.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                  {game.metadata && Object.keys(game.metadata).length > 0 && (
                    <div className="metadata">
                      {Object.entries(game.metadata).slice(0, 3).map(([key, value]) => (
                        <p key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="date">
                    Identified: {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleDelete(game._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistory;
