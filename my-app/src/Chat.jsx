import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import './Chat.css';

const Chat = () => {
  const { isAuthenticated, user, token } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: isAuthenticated 
        ? `Hello ${user?.username}! I'm here to help you with game identification. You can upload screenshots on the 'Identify Game' page, or ask me questions about games!`
        : "Hello! I'm here to help you with game identification. Please login to upload screenshots and identify games!",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadChatHistory();
    }
  }, [isAuthenticated, token]);

  const loadChatHistory = async () => {
    if (!token) return;
    
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/chat/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveMessage = async (message) => {
    if (!token) return;
    
    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Save user message to history
    await saveMessage(userMessage);

    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: generateBotResponse(userMessage.text),
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Save bot response to history
      saveMessage(botResponse);
      
      setLoading(false);
    }, 1000);
  };

  const generateBotResponse = (userText) => {
    const lowerText = userText.toLowerCase();
    
    if (!isAuthenticated) {
      return "Please login first to access all game identification features. You can register on the login page!";
    }
    
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
      return `Hello ${user?.username}! How can I help you with game identification today?`;
    }
    if (lowerText.includes('help') || lowerText.includes('how')) {
      return "To identify a game, go to 'Identify Game' page and upload a screenshot. I can also tell you about popular games if you ask!";
    }
    if (lowerText.includes('history') || lowerText.includes('saved')) {
      return "You can view all your saved game identifications in 'History' page. It shows all games you've identified and saved.";
    }
    if (lowerText.includes('upload') || lowerText.includes('screenshot')) {
      return "Upload your screenshot on 'Identify Game' page. Supported formats: PNG, JPG, GIF (up to 10MB). Our AI will analyze it and identify the game!";
    }
    if (lowerText.includes('minecraft')) {
      return "Minecraft is a sandbox game developed by Mojang Studios. It features blocky graphics and endless creativity. Upload a screenshot and I'll help you identify it!";
    }
    if (lowerText.includes('fortnite')) {
      return "Fortnite is a popular battle royale game by Epic Games. It features building mechanics and colorful graphics. I can identify it from screenshots!";
    }
    if (lowerText.includes('valorant')) {
      return "Valorant is a tactical FPS game by Riot Games. It features agents with special abilities. Upload a screenshot for accurate identification!";
    }
    if (lowerText.includes('among us')) {
      return "Among Us is a social deduction game by InnerSloth. It features colorful crewmate characters in a spaceship setting.";
    }
    if (lowerText.includes('gta') || lowerText.includes('grand theft auto')) {
      return "Grand Theft Auto V is an open-world action-adventure game by Rockstar Games. It features a vast modern city with endless activities.";
    }
    if (lowerText.includes('games') || lowerText.includes('what games')) {
      return "I can identify many popular games including Minecraft, Fortnite, Valorant, Among Us, GTA V, League of Legends, Roblox, and Call of Duty. Upload any game screenshot and I'll try to identify it!";
    }
    if (lowerText.includes('thank')) {
      return `You're welcome ${user?.username}! Feel free to ask if you need any more help with game identification.`;
    }
    if (lowerText.includes('accuracy') || lowerText.includes('how accurate')) {
      return "Our game identification AI is quite accurate for popular games! The confidence score shows how certain I am about the identification. Higher confidence means better accuracy!";
    }
    
    return `I'm here to help with game identification ${user?.username}! Try uploading a screenshot on 'Identify Game' page, or ask me about specific games like Minecraft, Fortnite, or Valorant!`;
  };

  return (
    <div className="chat">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Chat</h1>
          <p className="chat-subtitle">Ask me anything about game identification</p>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
            >
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message message-bot">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={!inputMessage.trim() || loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
