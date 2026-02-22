const fs = require('fs');
const path = require('path');

class GameIdentifier {
  constructor() {
    this.gameDatabase = {
      'minecraft': {
        name: 'Minecraft',
        genre: 'Sandbox',
        developer: 'Mojang Studios',
        releaseDate: '2011',
        platform: 'Multi-platform',
        keywords: ['block', 'pixel', 'cube', 'craft', 'build', 'survival'],
        colorProfile: ['green', 'brown', 'blue', 'gray'],
        features: ['blocky graphics', 'inventory', 'health bar', 'crosshair']
      },
      'fortnite': {
        name: 'Fortnite',
        genre: 'Battle Royale',
        developer: 'Epic Games',
        releaseDate: '2017',
        platform: 'Multi-platform',
        keywords: ['battle', 'royale', 'building', 'cartoon', 'colorful'],
        colorProfile: ['blue', 'purple', 'yellow', 'orange'],
        features: ['cartoon graphics', 'building mechanics', 'health bar', 'map']
      },
      'valorant': {
        name: 'Valorant',
        genre: 'Tactical FPS',
        developer: 'Riot Games',
        releaseDate: '2020',
        platform: 'PC',
        keywords: ['tactical', 'fps', 'agent', 'ability', 'competitive'],
        colorProfile: ['red', 'white', 'black', 'blue'],
        features: ['realistic graphics', 'crosshair', 'abilities', 'scoreboard']
      },
      'among_us': {
        name: 'Among Us',
        genre: 'Social Deduction',
        developer: 'InnerSloth',
        releaseDate: '2018',
        platform: 'Multi-platform',
        keywords: ['crewmate', 'impostor', 'space', 'tasks', 'social'],
        colorProfile: ['red', 'blue', 'green', 'yellow', 'white', 'black', 'purple', 'orange', 'cyan', 'lime', 'brown', 'pink'],
        features: ['cartoon characters', 'tasks', 'emergency button', 'vents']
      },
      'gta_v': {
        name: 'Grand Theft Auto V',
        genre: 'Open World Action',
        developer: 'Rockstar Games',
        releaseDate: '2013',
        platform: 'Multi-platform',
        keywords: ['open world', 'crime', 'driving', 'shooting', 'modern'],
        colorProfile: ['blue', 'gray', 'green', 'yellow'],
        features: ['realistic graphics', 'minimap', 'wanted level', 'vehicles']
      },
      'league_of_legends': {
        name: 'League of Legends',
        genre: 'MOBA',
        developer: 'Riot Games',
        releaseDate: '2009',
        platform: 'PC',
        keywords: ['moba', 'champion', 'lane', 'tower', 'team'],
        colorProfile: ['blue', 'red', 'green', 'gold'],
        features: ['top-down view', 'minimap', 'abilities', 'shop']
      },
      'roblox': {
        name: 'Roblox',
        genre: 'Game Platform',
        developer: 'Roblox Corporation',
        releaseDate: '2006',
        platform: 'Multi-platform',
        keywords: ['platform', 'create', 'games', 'avatar', 'blocky'],
        colorProfile: ['red', 'yellow', 'blue', 'green'],
        features: ['blocky graphics', 'avatar customization', 'user interface', 'chat']
      },
      'call_of_duty': {
        name: 'Call of Duty',
        genre: 'FPS',
        developer: 'Activision',
        releaseDate: '2003',
        platform: 'Multi-platform',
        keywords: ['military', 'shooting', 'warfare', 'modern', 'battlefield'],
        colorProfile: ['gray', 'black', 'brown', 'green'],
        features: ['realistic graphics', 'crosshair', 'ammo counter', 'radar']
      }
    };
  }

  async identifyGame(imagePath) {
    try {
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error('Image file not found');
      }

      const stats = fs.statSync(imagePath);
      const fileSize = stats.size;
      const fileName = path.basename(imagePath).toLowerCase();

      // Analyze image features
      const imageFeatures = await this.analyzeImage(imagePath);
      
      // Match against game database
      const matches = this.matchGames(fileName, fileSize, imageFeatures);
      
      // Get best match
      const bestMatch = this.getBestMatch(matches);
      
      // Generate confidence score
      const confidence = this.calculateConfidence(bestMatch, imageFeatures);
      
      // Generate detailed analysis
      const analysis = this.generateAnalysis(bestMatch, imageFeatures, confidence);

      return {
        success: true,
        gameName: bestMatch ? bestMatch.game.name : 'Unknown Game',
        gameId: bestMatch ? bestMatch.gameId : null,
        confidence: confidence,
        metadata: bestMatch ? bestMatch.game : {},
        analysis: analysis,
        matches: matches.slice(0, 3), // Top 3 matches
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Game identification error:', error);
      return {
        success: false,
        error: error.message,
        gameName: 'Unknown Game',
        gameId: null,
        confidence: 0,
        metadata: {},
        analysis: 'Failed to analyze image'
      };
    }
  }

  async analyzeImage(imagePath) {
    // Simulate image analysis
    const fileName = path.basename(imagePath).toLowerCase();
    
    // Extract features from filename
    const features = {
      fileName: fileName,
      fileSize: fs.statSync(imagePath).size,
      hasKeywords: [],
      colorHints: [],
      structuralHints: []
    };

    // Check for keywords in filename
    Object.keys(this.gameDatabase).forEach(gameId => {
      const game = this.gameDatabase[gameId];
      game.keywords.forEach(keyword => {
        if (fileName.includes(keyword)) {
          features.hasKeywords.push({ gameId, keyword, match: true });
        }
      });
    });

    // Simulate color detection based on filename patterns
    if (fileName.includes('colorful') || fileName.includes('vibrant')) {
      features.colorHints.push('colorful');
    }
    if (fileName.includes('dark') || fileName.includes('realistic')) {
      features.colorHints.push('dark');
    }
    if (fileName.includes('pixel') || fileName.includes('retro')) {
      features.colorHints.push('pixelated');
    }

    // Simulate structural detection
    if (fileName.includes('ui') || fileName.includes('interface')) {
      features.structuralHints.push('ui_elements');
    }
    if (fileName.includes('character') || fileName.includes('avatar')) {
      features.structuralHints.push('character_visible');
    }

    return features;
  }

  matchGames(fileName, fileSize, imageFeatures) {
    const matches = [];

    Object.keys(this.gameDatabase).forEach(gameId => {
      const game = this.gameDatabase[gameId];
      let score = 0;
      let reasons = [];

      // Filename keyword matching
      imageFeatures.hasKeywords.forEach(match => {
        if (match.gameId === gameId) {
          score += 30;
          reasons.push(`Keyword match: ${match.keyword}`);
        }
      });

      // File size patterns (simulated)
      if (fileSize > 1000000 && fileSize < 5000000) {
        score += 10;
        reasons.push('Typical screenshot size');
      }

      // Color profile matching
      imageFeatures.colorHints.forEach(hint => {
        if (hint === 'colorful' && (gameId === 'fortnite' || gameId === 'roblox')) {
          score += 20;
          reasons.push('Colorful graphics detected');
        }
        if (hint === 'dark' && (gameId === 'valorant' || gameId === 'call_of_duty')) {
          score += 20;
          reasons.push('Dark theme detected');
        }
        if (hint === 'pixelated' && (gameId === 'minecraft' || gameId === 'among_us')) {
          score += 20;
          reasons.push('Pixelated graphics detected');
        }
      });

      // Structural hints
      imageFeatures.structuralHints.forEach(hint => {
        if (hint === 'ui_elements' && (gameId === 'league_of_legends' || gameId === 'gta_v')) {
          score += 15;
          reasons.push('UI elements detected');
        }
        if (hint === 'character_visible' && (gameId === 'among_us' || gameId === 'roblox')) {
          score += 15;
          reasons.push('Character detected');
        }
      });

      // Base confidence for each game
      score += 10;

      if (score > 0) {
        matches.push({
          gameId: gameId,
          game: game,
          score: score,
          reasons: reasons
        });
      }
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  getBestMatch(matches) {
    return matches.length > 0 ? matches[0] : null;
  }

  calculateConfidence(bestMatch, imageFeatures) {
    if (!bestMatch) return 0;

    let confidence = Math.min(bestMatch.score, 100);

    // Adjust confidence based on number of matches
    if (imageFeatures.hasKeywords.length > 0) {
      confidence = Math.min(confidence + 20, 95);
    }

    // Ensure minimum confidence for identified games
    if (confidence > 0 && confidence < 30) {
      confidence = 30;
    }

    return Math.round(confidence);
  }

  generateAnalysis(bestMatch, imageFeatures, confidence) {
    if (!bestMatch) {
      return {
        summary: 'Unable to identify the game from the provided screenshot.',
        detectedFeatures: [],
        recommendations: ['Try uploading a clearer screenshot', 'Ensure the game is well-known in our database']
      };
    }

    const analysis = {
      summary: `Identified ${bestMatch.game.name} with ${confidence}% confidence.`,
      detectedFeatures: [],
      gameInfo: {
        genre: bestMatch.game.genre,
        developer: bestMatch.game.developer,
        releaseYear: bestMatch.game.releaseDate,
        platform: bestMatch.game.platform
      },
      recommendations: []
    };

    // Add detected features
    if (imageFeatures.hasKeywords.length > 0) {
      analysis.detectedFeatures.push(`Filename contains game-specific keywords`);
    }
    if (imageFeatures.colorHints.length > 0) {
      analysis.detectedFeatures.push(`Color profile matches ${bestMatch.game.name}`);
    }
    if (imageFeatures.structuralHints.length > 0) {
      analysis.detectedFeatures.push(`Structural elements detected`);
    }

    // Add recommendations
    if (confidence > 80) {
      analysis.recommendations.push('High confidence identification - likely correct');
    } else if (confidence > 60) {
      analysis.recommendations.push('Moderate confidence - verify with additional screenshots');
    } else {
      analysis.recommendations.push('Low confidence - try a clearer screenshot');
    }

    return analysis;
  }

  getGameStats() {
    const stats = {
      totalGames: Object.keys(this.gameDatabase).length,
      genres: {},
      platforms: {},
      developers: {}
    };

    Object.values(this.gameDatabase).forEach(game => {
      // Count genres
      if (!stats.genres[game.genre]) {
        stats.genres[game.genre] = 0;
      }
      stats.genres[game.genre]++;

      // Count platforms
      if (!stats.platforms[game.platform]) {
        stats.platforms[game.platform] = 0;
      }
      stats.platforms[game.platform]++;

      // Count developers
      if (!stats.developers[game.developer]) {
        stats.developers[game.developer] = 0;
      }
      stats.developers[game.developer]++;
    });

    return stats;
  }
}

module.exports = GameIdentifier;
