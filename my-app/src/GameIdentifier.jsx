import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import './GameIdentifier.css';

const GameIdentifier = () => {
  const { token } = useAuth();
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [identifiedGame, setIdentifiedGame] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Cleanup object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setScreenshot(file);
      setPreview(URL.createObjectURL(file));
      setIdentifiedGame(null);
      setSaved(false);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setScreenshot(file);
      setPreview(URL.createObjectURL(file));
      setIdentifiedGame(null);
      setSaved(false);
      setError('');
    }
  };

  const handleIdentify = async () => {
    if (!screenshot) {
      setError('Please upload a screenshot first');
      return;
    }

    setLoading(true);
    setError('');
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);

      // Upload screenshot and get identification from backend
      const response = await fetch('/api/games/identify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to identify game');
      }

      const data = await response.json();
      setIdentifiedGame(data);
    } catch (err) {
      setError(err.message || 'Failed to identify game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!identifiedGame || !screenshot) {
      setError('No game identified to save');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('gameName', identifiedGame.gameName || '');
      formData.append('gameId', identifiedGame.gameId || '');
      formData.append('confidence', identifiedGame.confidence || 0);
      formData.append('metadata', JSON.stringify(identifiedGame.metadata || {}));

      const response = await fetch('/api/games/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save game identification');
      }

      const data = await response.json();
      setSaved(true);
      setError('');
      
      // Reset after successful save
      setTimeout(() => {
        setScreenshot(null);
        setPreview(null);
        setIdentifiedGame(null);
        setSaved(false);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setScreenshot(null);
    setPreview(null);
    setIdentifiedGame(null);
    setError('');
    setSaved(false);
  };

  return (
    <div className="game-identifier">
      <div className="container">
        <h1>Game Screenshot Identifier</h1>
        <p className="subtitle">Upload a screenshot to identify the game</p>

        <div className="upload-section">
          <div className="upload-area">
            {preview ? (
              <div className="preview-container">
                <img src={preview} alt="Screenshot preview" className="preview-image" />
                <button onClick={handleReset} className="btn-remove">Remove</button>
              </div>
            ) : (
              <label 
                className="upload-label"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                  id="file-upload"
                />
                <div className="upload-content">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p>Click to upload or drag and drop</p>
                  <p className="upload-hint">PNG, JPG, GIF up to 10MB</p>
                </div>
              </label>
            )}
          </div>

          {preview && !identifiedGame && (
            <button
              onClick={handleIdentify}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Identifying...' : 'Identify Game'}
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {identifiedGame && (
          <div className="result-section">
            <h2>Identification Result</h2>
            <div className="game-card">
              <div className="game-info">
                <h3>{identifiedGame.gameName || 'Unknown Game'}</h3>
                {identifiedGame.confidence && (
                  <p className="confidence">
                    Confidence: {(identifiedGame.confidence * 100).toFixed(1)}%
                  </p>
                )}
                {identifiedGame.metadata && Object.keys(identifiedGame.metadata).length > 0 && (
                  <div className="metadata">
                    {Object.entries(identifiedGame.metadata).map(([key, value]) => (
                      <p key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              {!saved && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-save"
                >
                  {loading ? 'Saving...' : 'Save to Database'}
                </button>
              )}
              {saved && (
                <div className="saved-message">
                  ✓ Saved successfully!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameIdentifier;
