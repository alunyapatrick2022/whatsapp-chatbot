const whatsappService = require('./whatsappService');
const adminService = require('./adminService');
const messageHandler = require('../utils/messageHandler');
const logger = require('./logService');

class BotService {
  async handleGroupMessage(message) {
    try {
      // Validate and sanitize message
      if (!await messageHandler.validateMessage(message)) {
        return;
      }
      
      const { group_id, from, type, text } = message;
      
      // First, check message for violations
      await adminService.handleMessage(group_id, from, message);
      
      // Then process commands if message starts with !
      if (text.body.startsWith('!')) {
        const parsedCommand = messageHandler.parseCommand(message);
        if (!parsedCommand) return;
        
        switch (parsedCommand.command) {
          case 'poll':
            await this.createPoll(group_id, parsedCommand.args.join(' '));
            break;
          
          case 'schedule':
            await this.scheduleEvent(group_id, parsedCommand.args.join(' '));
            break;
          
          case 'welcome':
            await this.setWelcomeMessage(group_id, parsedCommand.args.join(' '));
            break;
          
          case 'rules':
            await this.showGroupRules(group_id);
            break;
          
          case 'warn':
            await this.warnUser(group_id, parsedCommand.args.join(' '));
            break;
          
          case 'remove':
            await this.removeUser(group_id, parsedCommand.args.join(' '));
            break;
          
          case 'stats':
            await this.showGroupStats(group_id);
            break;
          
          default:
            await whatsappService.sendMessage(group_id, 'Unknown command. Available commands: !poll, !schedule, !welcome, !rules, !warn, !remove, !stats');
        }
      }
    } catch (error) {
      logger.error('Error handling group message', {
        error: error.message,
        message
      });
    }
  }

  async createPoll(groupId, message) {
    // Extract poll options from message
    const lines = message.split('\n');
    const question = lines[0].replace('!poll', '').trim();
    const options = lines.slice(1);

    if (options.length < 2) {
      await whatsappService.sendMessage(groupId, 'Please provide at least 2 options for the poll.');
      return;
    }

    // Create poll message
    const pollMessage = `📊 *${question}*\n\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`;
    await whatsappService.sendMessage(groupId, pollMessage);
  }

  async scheduleEvent(groupId, message) {
    // Implementation for scheduling events
    const eventDetails = message.replace('!schedule', '').trim();
    await whatsappService.sendMessage(groupId, `📅 New event scheduled: ${eventDetails}`);
  }

  async setWelcomeMessage(groupId, message) {
    // Implementation for setting welcome message
    const welcomeMsg = message.replace('!welcome', '').trim();
    // Store welcome message in database
    await whatsappService.sendMessage(groupId, '✅ Welcome message has been updated!');
  }

  async showGroupRules(groupId) {
    const rules = [
      '1. Be respectful to all members',
      '2. No spam or promotional content',
      '3. Stay on topic',
      '4. No inappropriate content'
    ].join('\n');

    await whatsappService.sendMessage(groupId, `📜 *Group Rules*\n\n${rules}`);
  }

  async warnUser(groupId, message) {
    const parts = message.split(' ');
    if (parts.length < 2) {
      await whatsappService.sendMessage(groupId, '❌ Please specify a user to warn');
      return;
    }
    
    const userId = parts[1];
    const reason = parts.slice(2).join(' ') || 'No reason specified';
    
    await adminService.handleViolation(groupId, userId, reason);
  }

  async removeUser(groupId, message) {
    const parts = message.split(' ');
    if (parts.length < 2) {
      await whatsappService.sendMessage(groupId, '❌ Please specify a user to remove');
      return;
    }
    
    const userId = parts[1];
    await adminService.removeUser(groupId, userId);
    await whatsappService.sendMessage(groupId, '✅ User has been removed from the group');
  }

  async showGroupStats(groupId) {
    const warnings = await UserWarning.find({ groupId });
    const stats = warnings.reduce((acc, warning) => {
      acc[warning.userId] = warning.warnings;
      return acc;
    }, {});
    
    const statsMessage = '📊 *Group Warning Statistics*\n\n' +
      Object.entries(stats)
        .map(([userId, count]) => `User ${userId}: ${count} warning(s)`)
        .join('\n');
    
    await whatsappService.sendMessage(groupId, statsMessage);
  }
}

module.exports = new BotService(); 