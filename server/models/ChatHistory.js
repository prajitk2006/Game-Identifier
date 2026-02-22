const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    id: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  sessionStart: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to get or create chat session
chatHistorySchema.statics.getOrCreateSession = async function(userId) {
  let chatSession = await this.findOne({ userId }).sort({ lastActivity: -1 });
  
  if (!chatSession || (Date.now() - chatSession.lastActivity) > 24 * 60 * 60 * 1000) {
    // Create new session if none exists or last session is older than 24 hours
    chatSession = new this({ userId });
    await chatSession.save();
  }
  
  return chatSession;
};

// Method to add message
chatHistorySchema.methods.addMessage = function(message) {
  this.messages.push(message);
  this.lastActivity = new Date();
  return this.save();
};

// Method to get recent messages
chatHistorySchema.methods.getRecentMessages = function(limit = 50) {
  return this.messages
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
