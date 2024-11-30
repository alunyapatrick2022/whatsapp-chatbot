const UserWarning = require('../models/userWarning');
const whatsappService = require('./whatsappService');
const logger = require('./logService');
const appealService = require('./appealService');

class AdminService {
  constructor() {
    this.SPAM_THRESHOLD = 8; // Increased threshold
    this.SPAM_TIMEFRAME = 120000; // Increased to 2 minutes
    this.MAX_WARNINGS = 3;
    this.messageCache = new Map(); // Store recent messages for spam detection
    this.inappropriateWords = [
      'spam', 'scam', 'xxx', 'porn', 'gambling',
      'bitcoin', 'crypto', 'investment scheme',
      'make money fast', 'get rich quick',
      // Add more inappropriate words as needed
    ];
  }

  async handleMessage(groupId, userId, message) {
    try {
      const isSpam = await this.isSpam(groupId, userId, message);
      const hasLinks = this.containsLinks(message);
      const isInappropriate = this.containsInappropriateContent(message);

      if (isSpam || (hasLinks && !await this.isAdmin(userId, groupId)) || isInappropriate) {
        const violationType = isSpam ? 'spam' : hasLinks ? 'unauthorized links' : 'inappropriate content';
        
        logger.info('Violation detected', {
          groupId,
          userId,
          violationType,
          messageContent: message.text.body
        });

        await this.handleViolation(groupId, userId, violationType);
      }
    } catch (error) {
      logger.error('Error handling message', {
        error: error.message,
        groupId,
        userId
      });
      throw error;
    }
  }

  async isSpam(groupId, userId, message) {
    const key = `${groupId}:${userId}`;
    const now = Date.now();
    
    // Get user's recent messages
    if (!this.messageCache.has(key)) {
      this.messageCache.set(key, []);
    }
    
    const userMessages = this.messageCache.get(key);
    
    // Remove old messages
    const recentMessages = userMessages.filter(
      timestamp => now - timestamp < this.SPAM_TIMEFRAME
    );
    
    // Add current message timestamp
    recentMessages.push(now);
    this.messageCache.set(key, recentMessages);
    
    return recentMessages.length >= this.SPAM_THRESHOLD;
  }

  containsLinks(message) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(message.text.body);
  }

  containsInappropriateContent(message) {
    const messageText = message.text.body.toLowerCase();
    return this.inappropriateWords.some(word => messageText.includes(word));
  }

  async handleViolation(groupId, userId, violationType) {
    try {
      let warning = await UserWarning.findOne({ groupId, userId });
      
      if (!warning) {
        warning = await UserWarning.create({ groupId, userId });
      }

      warning.warnings += 1;
      await UserWarning.updateWarnings(groupId, userId, warning.warnings);

      logger.info('Warning issued', {
        groupId,
        userId,
        warningCount: warning.warnings,
        violationType
      });

      if (warning.warnings >= this.MAX_WARNINGS) {
        await this.removeUser(groupId, userId);
        
        // Send appeal instructions
        await whatsappService.sendMessage(groupId,
          `⚠️ User ${userId} has been removed after ${this.MAX_WARNINGS} warnings.\n` +
          'To appeal this decision, send "!appeal <reason>" in a private message to the bot.'
        );
      } else {
        const warningMessage = `⚠️ Warning ${warning.warnings}/${this.MAX_WARNINGS}: Please avoid ${violationType}. ` +
          `Further violations will result in removal from the group.`;
        await whatsappService.sendMessage(groupId, warningMessage);
      }
    } catch (error) {
      logger.error('Error handling violation', {
        error: error.message,
        groupId,
        userId,
        violationType
      });
      throw error;
    }
  }

  async removeUser(groupId, userId) {
    await whatsappService.removeGroupParticipant(groupId, userId);
    // Clean up user warnings
    await UserWarning.deleteOne({ groupId, userId });
  }
}

module.exports = new AdminService(); 