const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import models and middleware
const User = require('./models/User');
const ChatHistory = require('./models/ChatHistory');
const { authenticate, optionalAuth } = require('./middleware/auth');
const GameIdentifier = require('./gameIdentifier');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// In-memory storage fallback
let games = [];
let gameIdCounter = 1;
let useMongoDB = false;

// Initialize game identifier
const gameIdentifier = new GameIdentifier();

// MongoDB Connection (optional)
let Game = null;
let UserModel = null;
let ChatHistoryModel = null;
const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gameidentifier', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000, // 2 second timeout
    });
    
    console.log('MongoDB connected successfully');
    
    // Game Model
    const gameSchema = new mongoose.Schema({
      gameName: {
        type: String,
        required: true,
      },
      gameId: String,
      screenshotUrl: {
        type: String,
        required: true,
      },
      screenshotPath: {
        type: String,
        required: true,
      },
      confidence: {
        type: Number,
        default: 0,
      },
      metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    });

    Game = mongoose.model('Game', gameSchema);
    UserModel = User;
    ChatHistoryModel = ChatHistory;
    useMongoDB = true;
  } catch (error) {
    console.log('MongoDB not available, using in-memory storage');
    useMongoDB = false;
  }
};

// Try to connect to MongoDB but don't wait
connectToMongo();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    let user;
    if (useMongoDB && UserModel) {
      user = await UserModel.findOne({ 
        $or: [{ email }, { username }] 
      });
    } else {
      user = games.find(u => u.email === email || u.username === username);
    }

    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = {
      username,
      email,
      password,
      createdAt: new Date()
    };

    let savedUser;
    if (useMongoDB && UserModel) {
      savedUser = await UserModel.create(newUser);
    } else {
      savedUser = { ...newUser, _id: gameIdCounter++ };
      games.push(savedUser);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: savedUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    let user;
    if (useMongoDB && UserModel) {
      user = await UserModel.findOne({ email });
    } else {
      user = games.find(u => u.email === email);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    let isPasswordValid;
    if (useMongoDB && UserModel) {
      isPasswordValid = await user.comparePassword(password);
    } else {
      // For in-memory storage, compare plain text (not secure, just for demo)
      isPasswordValid = user.password === password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    if (useMongoDB && UserModel) {
      await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    } else {
      user.lastLogin = new Date();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// Chat History Endpoints (Protected)
app.get('/api/chat/history', authenticate, async (req, res) => {
  try {
    let chatHistory;
    
    if (useMongoDB && ChatHistoryModel) {
      chatHistory = await ChatHistoryModel.getOrCreateSession(req.user._id);
      const messages = chatHistory.getRecentMessages();
      res.json({ messages, sessionId: chatHistory._id });
    } else {
      // In-memory fallback
      const userChatHistory = global.chatHistory || {};
      const userMessages = userChatHistory[req.user._id] || [];
      res.json({ messages: userMessages, sessionId: 'in-memory' });
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

app.post('/api/chat/message', authenticate, async (req, res) => {
  try {
    const { message, sender } = req.body;
    
    if (!message || !sender) {
      return res.status(400).json({ error: 'Message and sender are required' });
    }

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: sender,
      timestamp: new Date()
    };

    if (useMongoDB && ChatHistoryModel) {
      const chatSession = await ChatHistoryModel.getOrCreateSession(req.user._id);
      await chatSession.addMessage(newMessage);
    } else {
      // In-memory fallback
      if (!global.chatHistory) global.chatHistory = {};
      if (!global.chatHistory[req.user._id]) {
        global.chatHistory[req.user._id] = [];
      }
      global.chatHistory[req.user._id].push(newMessage);
    }

    res.json({ message: 'Message saved successfully', newMessage });
  } catch (error) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Analytics Endpoints (Protected)
app.get('/api/analytics/stats', authenticate, async (req, res) => {
  try {
    let userGames;
    
    if (useMongoDB && Game) {
      userGames = await Game.find({ userId: req.user._id });
    } else {
      userGames = games.filter(game => game.userId === req.user._id);
    }

    const stats = {
      totalIdentifications: userGames.length,
      uniqueGames: [...new Set(userGames.map(g => g.gameName))].length,
      averageConfidence: userGames.length > 0 
        ? Math.round(userGames.reduce((sum, g) => sum + (g.confidence || 0), 0) / userGames.length)
        : 0,
      mostIdentifiedGame: getMostIdentifiedGame(userGames),
      recentActivity: getRecentActivity(userGames),
      genreDistribution: getGenreDistribution(userGames),
      monthlyTrend: getMonthlyTrend(userGames)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/analytics/charts', authenticate, async (req, res) => {
  try {
    let userGames;
    
    if (useMongoDB && Game) {
      userGames = await Game.find({ userId: req.user._id });
    } else {
      userGames = games.filter(game => game.userId === req.user._id);
    }

    const chartData = {
      confidenceChart: getConfidenceChartData(userGames),
      genreChart: getGenreChartData(userGames),
      timelineChart: getTimelineChartData(userGames),
      platformChart: getPlatformChartData(userGames)
    };

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// Helper functions for analytics
function getMostIdentifiedGame(userGames) {
  const gameCounts = {};
  userGames.forEach(game => {
    gameCounts[game.gameName] = (gameCounts[game.gameName] || 0) + 1;
  });
  
  const mostIdentified = Object.entries(gameCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  return mostIdentified ? mostIdentified[0] : 'None';
}

function getRecentActivity(userGames) {
  const recentGames = userGames
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  return recentGames.map(game => ({
    gameName: game.gameName,
    confidence: game.confidence,
    date: game.createdAt
  }));
}

function getGenreDistribution(userGames) {
  const genreCounts = {};
  userGames.forEach(game => {
    const genre = game.metadata?.genre || 'Unknown';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });
  
  return genreCounts;
}

function getMonthlyTrend(userGames) {
  const monthlyData = {};
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toISOString().slice(0, 7);
    monthlyData[monthKey] = 0;
  }
  
  userGames.forEach(game => {
    const monthKey = new Date(game.createdAt).toISOString().slice(0, 7);
    if (monthlyData.hasOwnProperty(monthKey)) {
      monthlyData[monthKey]++;
    }
  });
  
  return Object.entries(monthlyData).map(([month, count]) => ({ month, count }));
}

function getConfidenceChartData(userGames) {
  const ranges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  
  userGames.forEach(game => {
    const confidence = game.confidence || 0;
    if (confidence <= 20) ranges['0-20']++;
    else if (confidence <= 40) ranges['21-40']++;
    else if (confidence <= 60) ranges['41-60']++;
    else if (confidence <= 80) ranges['61-80']++;
    else ranges['81-100']++;
  });
  
  return Object.entries(ranges).map(([range, count]) => ({ range, count }));
}

function getGenreChartData(userGames) {
  const genreCounts = getGenreDistribution(userGames);
  return Object.entries(genreCounts).map(([genre, count]) => ({ genre, count }));
}

function getTimelineChartData(userGames) {
  const dailyData = {};
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().slice(0, 10);
    dailyData[dateKey] = 0;
  }
  
  userGames.forEach(game => {
    const dateKey = new Date(game.createdAt).toISOString().slice(0, 10);
    if (dailyData.hasOwnProperty(dateKey)) {
      dailyData[dateKey]++;
    }
  });
  
  return Object.entries(dailyData).map(([date, count]) => ({ date, count }));
}

function getPlatformChartData(userGames) {
  const platformCounts = {};
  userGames.forEach(game => {
    const platform = game.metadata?.platform || 'Unknown';
    platformCounts[platform] = (platformCounts[platform] || 0) + 1;
  });
  
  return Object.entries(platformCounts).map(([platform, count]) => ({ platform, count }));
}

// Game Identification Endpoint (Protected)
app.post('/api/games/identify', authenticate, upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No screenshot uploaded' });
    }

    const screenshotUrl = `/uploads/${req.file.filename}`;
    const screenshotPath = req.file.path;

    // Use the game identifier to identify the game
    const identificationResult = await gameIdentifier.identifyGame(screenshotPath);

    res.json({
      ...identificationResult,
      screenshotUrl,
      screenshotPath,
      userId: req.user._id
    });
  } catch (error) {
    console.error('Error identifying game:', error);
    res.status(500).json({ error: 'Failed to identify game', message: error.message });
  }
});

// Save game identification to database (Protected)
app.post('/api/games/save', authenticate, upload.single('screenshot'), async (req, res) => {
  try {
    const { gameName, gameId, confidence, metadata } = req.body;

    if (!gameName) {
      return res.status(400).json({ error: 'Game name is required' });
    }

    let screenshotUrl = '';
    let screenshotPath = '';

    // If a new screenshot is uploaded, use it; otherwise use existing path
    if (req.file) {
      screenshotUrl = `/uploads/${req.file.filename}`;
      screenshotPath = req.file.path;
    } else if (req.body.screenshotUrl) {
      screenshotUrl = req.body.screenshotUrl;
      screenshotPath = req.body.screenshotPath || '';
    } else {
      return res.status(400).json({ error: 'Screenshot is required' });
    }

    const gameData = {
      _id: gameIdCounter++,
      gameName,
      gameId: gameId || null,
      screenshotUrl,
      screenshotPath,
      confidence: confidence ? parseFloat(confidence) : 0,
      metadata: metadata ? JSON.parse(metadata) : {},
      userId: req.user._id, // Associate with logged-in user
      createdAt: new Date(),
    };

    let game;
    if (useMongoDB && Game) {
      // Use MongoDB
      game = new Game(gameData);
      await game.save();
    } else {
      // Use in-memory storage
      games.push(gameData);
      game = gameData;
    }

    res.json({
      message: 'Game identification saved successfully',
      game: game,
    });
  } catch (error) {
    console.error('Error saving game:', error);
    res.status(500).json({ error: 'Failed to save game', message: error.message });
  }
});

// Get all saved games (Protected - user's games only)
app.get('/api/games', authenticate, async (req, res) => {
  try {
    let gamesList;
    if (useMongoDB && Game) {
      // Use MongoDB - get only user's games
      gamesList = await Game.find({ userId: req.user._id }).sort({ createdAt: -1 });
    } else {
      // Use in-memory storage - get only user's games
      gamesList = games
        .filter(game => game.userId === req.user._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json(gamesList);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games', message: error.message });
  }
});

// Get single game by ID (Protected)
app.get('/api/games/:id', authenticate, async (req, res) => {
  try {
    let game;
    if (useMongoDB && Game) {
      // Use MongoDB - get user's game only
      game = await Game.findOne({ _id: req.params.id, userId: req.user._id });
    } else {
      // Use in-memory storage - get user's game only
      game = games.find(g => g._id == req.params.id && g.userId === req.user._id);
    }
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game', message: error.message });
  }
});

// Delete game by ID (Protected)
app.delete('/api/games/:id', authenticate, async (req, res) => {
  try {
    let game;
    if (useMongoDB && Game) {
      // Use MongoDB - delete user's game only
      game = await Game.findOne({ _id: req.params.id, userId: req.user._id });
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      // Delete the screenshot file
      if (game.screenshotPath && fs.existsSync(game.screenshotPath)) {
        fs.unlinkSync(game.screenshotPath);
      }

      await Game.findByIdAndDelete(req.params.id);
    } else {
      // Use in-memory storage - delete user's game only
      const gameIndex = games.findIndex(g => g._id == req.params.id && g.userId === req.user._id);
      if (gameIndex === -1) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      game = games[gameIndex];
      
      // Delete the screenshot file
      if (game.screenshotPath && fs.existsSync(game.screenshotPath)) {
        fs.unlinkSync(game.screenshotPath);
      }
      
      games.splice(gameIndex, 1);
    }
    
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Failed to delete game', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
