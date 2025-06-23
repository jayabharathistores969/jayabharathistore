const express = require('express');
const router = express.Router();
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Set API key
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    to: [{ email: 'jayabharathistores969@gmail.com' }], // Admin email
    sender: {
      email: 'jayabharathistores969@gmail.com', // VERIFIED sender
      name: 'Jayabharathi Store Contact Form',
    },
    replyTo: {
      email: email, // Customer's email from contact form
      name: name,
    },
    subject: `📬 New Message from ${name}`,
    htmlContent: `
      <h3>New Contact Message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Failed to send email:', error?.response?.body || error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

module.exports = router;
