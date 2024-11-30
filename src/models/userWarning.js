const db = require('../database/db');

class UserWarning {
  static async findOne(conditions) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM user_warnings WHERE group_id = ? AND user_id = ?',
        [conditions.groupId, conditions.userId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  static async create(data) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO user_warnings (group_id, user_id, warnings, spam_count) VALUES (?, ?, ?, ?)',
        [data.groupId, data.userId, 0, 0],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, ...data });
        }
      );
    });
  }

  static async updateWarnings(groupId, userId, warnings) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE user_warnings SET warnings = ?, last_warning_date = CURRENT_TIMESTAMP WHERE group_id = ? AND user_id = ?',
        [warnings, groupId, userId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  static async delete(conditions) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM user_warnings WHERE group_id = ? AND user_id = ?',
        [conditions.groupId, conditions.userId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }
}

module.exports = UserWarning; 