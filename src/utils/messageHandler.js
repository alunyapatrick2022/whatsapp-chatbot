const logger = require('../services/logService');

class MessageHandler {
  constructor() {
    this.commandPrefix = '!';
  }

  parseCommand(message) {
    if (!message.text || !message.text.body.startsWith(this.commandPrefix)) {
      return null;
    }

    const parts = message.text.body.split(' ');
    const command = parts[0].substring(1).toLowerCase();
    const args = parts.slice(1);

    return {
      command,
      args,
      fullText: message.text.body
    };
  }

  async validateMessage(message) {
    try {
      // Basic message validation
      if (!message.text || !message.text.body) {
        logger.warn('Invalid message format', { message });
        return false;
      }

      // Check message length
      if (message.text.body.length > 4096) {
        logger.warn('Message too long', {
          length: message.text.body.length,
          limit: 4096
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error validating message', {
        error: error.message,
        message
      });
      return false;
    }
  }

  sanitizeMessage(text) {
    // Remove any potentially harmful characters or patterns
    return text
      .replace(/[<>]/g, '') // Remove HTML-like brackets
      .trim();
  }

  formatResponse(text) {
    // Add any necessary formatting for WhatsApp messages
    return text
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .trim();
  }
}

module.exports = new MessageHandler(); 