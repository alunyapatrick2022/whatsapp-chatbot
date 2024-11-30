const whatsappService = require('./whatsappService');
const logger = require('./logService');

class GroupService {
  async joinGroup(inviteLink) {
    try {
      const response = await whatsappService.joinGroup(inviteLink);
      logger.info('Bot joined group', {
        groupId: response.groupId,
        inviteLink
      });
      return response;
    } catch (error) {
      logger.error('Failed to join group', {
        error: error.message,
        inviteLink
      });
      throw error;
    }
  }

  async initializeGroup(groupId) {
    try {
      // Send welcome message
      await whatsappService.sendMessage(groupId, 
        '👋 Hello! I am your group management bot. I will help maintain order and enforce rules.\n\n' +
        'Available commands:\n' +
        '!poll - Create a poll\n' +
        '!schedule - Schedule an event\n' +
        '!rules - Show group rules\n' +
        '!warn - Warn a user\n' +
        '!stats - Show warning statistics'
      );

      // Set default rules
      await whatsappService.sendMessage(groupId, 
        '📜 Default Group Rules:\n\n' +
        '1. Be respectful to all members\n' +
        '2. No spam or promotional content\n' +
        '3. Stay on topic\n' +
        '4. No inappropriate content'
      );

      logger.info('Group initialized', { groupId });
    } catch (error) {
      logger.error('Failed to initialize group', {
        error: error.message,
        groupId
      });
      throw error;
    }
  }
}

module.exports = new GroupService(); 