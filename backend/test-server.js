require('dotenv').config({ path: './temp.env' });
const express = require('express');
const { logger } = require('./utils/logger');

const app = express();
app.use(express.json());

// Test route for email
app.post('/test-email', async (req, res) => {
  const fetch = require('node-fetch');
  const { email } = req.body;

  logger.info('Testing email with Brevo API', { email });

  const url = 'https://api.sendinblue.com/v3/smtp/email';
  const options = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: "JayaBharathi Store Test",
        email: process.env.EMAIL_USER
      },
      to: [{ email }],
      subject: "Test Email - JayaBharathi Store",
      htmlContent: `
        <div>
          <h1>Test Email</h1>
          <p>This is a test email from JayaBharathi Store.</p>
          <p>If you received this, the email configuration is working!</p>
        </div>
      `
    })
  };

  try {
    logger.info('Sending test email request to Brevo API');
    const response = await fetch(url, options);
    const data = await response.json();
    
    logger.info('Brevo API response:', {
      status: response.status,
      data
    });

    if (!response.ok) {
      logger.error('Brevo API error:', data);
      return res.status(500).json({
        error: 'Failed to send email',
        details: data
      });
    }

    res.json({
      message: 'Test email sent successfully',
      messageId: data.messageId
    });
  } catch (error) {
    logger.error('Error sending test email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message
    });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  logger.info(`Test server running on port ${PORT}`);
  console.log(`Test server running on port ${PORT}`);
}); 