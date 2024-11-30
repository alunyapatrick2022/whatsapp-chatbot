const db = require('../database/db');
const logger = require('./logService');
const whatsappService = require('./whatsappService');

class AppealService {
  async createAppeal(groupId, userId, reason) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO appeals (group_id, user_id, reason) VALUES (?, ?, ?)',
        [groupId, userId, reason],
        function(err) {
          if (err) reject(err);
          
          logger.info('Appeal created', {
            groupId,
            userId,
            reason,
            appealId: this.lastID
          });
          
          resolve({ id: this.lastID });
        }
      );
    });
  }

  async handleAppeal(appealId, approved) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM appeals WHERE id = ?', [appealId], async (err, appeal) => {
        if (err) reject(err);
        if (!appeal) reject(new Error('Appeal not found'));

        const status = approved ? 'approved' : 'rejected';
        
        try {
          await this.updateAppealStatus(appealId, status);
          
          if (approved) {
            // Reset warnings for the user
            await db.run(
              'UPDATE user_warnings SET warnings = 0 WHERE group_id = ? AND user_id = ?',
              [appeal.group_id, appeal.user_id]
            );
            
            // Notify group about the approved appeal
            await whatsappService.sendMessage(
              appeal.group_id,
              `✅ Appeal approved for user ${appeal.user_id}. They can be added back to the group.`
            );
          }

          logger.info('Appeal handled', {
            appealId,
            status,
            groupId: appeal.group_id,
            userId: appeal.user_id
          });

          resolve({ status });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async updateAppealStatus(appealId, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE appeals SET status = ? WHERE id = ?',
        [status, appealId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }
}

module.exports = new AppealService(); 