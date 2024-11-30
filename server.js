require('dotenv').config();
const express = require('express');
const webhookController = require('./src/controllers/webhookController');
const db = require('./src/database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.post('/webhook', webhookController.handleWebhook);
app.get('/webhook', webhookController.verifyWebhook);

// Database is automatically initialized when imported
console.log('SQLite database initialized');

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 