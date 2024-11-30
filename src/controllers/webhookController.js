const botService = require('../services/botService');
const logger = require('../services/logService');

exports.handleWebhook = async (req, res) => {
  try {
    const { entry } = req.body;

    if (!entry || !entry[0].changes || !entry[0].changes[0].value.messages) {
      return res.sendStatus(200);
    }

    const message = entry[0].changes[0].value.messages[0];
    const isGroup = message.group_id !== undefined;

    if (isGroup) {
      logger.info('Received group message', {
        groupId: message.group_id,
        userId: message.from
      });
      await botService.handleGroupMessage(message);
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error('Webhook error:', {
      error: error.message,
      stack: error.stack
    });
    res.sendStatus(500);
  }
};

exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    logger.warn('Webhook verification failed', {
      mode,
      token
    });
    res.sendStatus(403);
  }
}; 