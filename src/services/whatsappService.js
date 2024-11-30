const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL;
    this.token = process.env.WHATSAPP_API_TOKEN;
    this.phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;
  }

  async sendMessage(groupId, message) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'group',
          to: groupId,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async removeGroupParticipant(groupId, userId) {
    try {
      const response = await axios.delete(
        `${this.apiUrl}/${groupId}/participants/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error removing group participant:', error);
      throw error;
    }
  }

  async getGroupAdmins(groupId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${groupId}/admins`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error getting group admins:', error);
      throw error;
    }
  }

  async joinGroup(inviteLink) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/groups/join`,
        {
          messaging_product: 'whatsapp',
          invite_link: inviteLink
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }
}

module.exports = new WhatsAppService(); 