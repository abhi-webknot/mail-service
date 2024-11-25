const express = require("express");
const brevoService = require("../service/mailService");
const router = express.Router();
const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: ['https://webknot-webflow.webflow.io', 'http://localhost:3000'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

const isValidEmail = (email) => {
  return email && 
         typeof email === 'string' && 
         email.includes('@') && 
         email.includes('.') && 
         email.trim().length > 0;
};

router.use(cors(corsOptions));
router.options('/api/send-feedback-email', cors(corsOptions));

router.post("/send-feedback-email", async (req, res) => {
  try {
    const formData = req.body;
    console.log("Received formData:", formData);
    
    // Collect and validate email addresses
    let recipients = [
      ...(formData.accountManagerEmail?.split(",") || []),
      ...(formData.deliveryManagerEmail?.split(",") || []),
      ...(formData.projectManagerEmail?.split(",") || []),
    ]
    .map(email => email.trim())
    .filter(isValidEmail);

    if (formData.rating < 4 && formData.escalationTeam) {
      const escalationEmails = (formData.escalationTeam?.split(",") || [])
        .map(email => email.trim())
        .filter(isValidEmail);
      recipients = [...new Set([...recipients, ...escalationEmails])];
    }

    if (!recipients.length) {
      return res.status(400).json({ 
        message: "No valid email recipients provided."
      });
    }

    console.log("Validated recipients:", recipients);

    // Format recipients for Brevo API
    const formattedRecipients = recipients.map(email => ({
      email: email,
      name: email.split('@')[0]
    }));

    const date=new Date()

    const emailConfig = {
      subject: `Feedback Received from ${formData.clientName || 'Client'}`,
      sender: {
        email: process.env.BREVO_EMAIL_SENDER,
        name: "Feedback Team"
      },
      to: formattedRecipients,
      htmlContent: `
        <h1>Client Feedback</h1>
        <p><strong>Client Name:</strong> ${formData.clientName || 'N/A'}</p>
        <p><strong>Account Manager:</strong> ${formData.accountManager || 'N/A'}</p>
        <p><strong>Project Name:</strong> ${formData.projectName || 'N/A'}</p>
        <p><strong>Client Delivery Manager:</strong> ${formData.deliveryManager || 'N/A'}</p>
        <p><strong>Project Manager:</strong> ${formData.projectManager || 'N/A'}</p>
        <p><strong>Escalation Team:</strong> ${formData.escalation || 'N/A'}</p>
        <br />
        <h2>Project Feedback</h2>
        <p><strong>Feedback Message:</strong> ${formData.feedback || 'N/A'}</p>
        <p><strong>Feedback Rating:</strong> ${formData.rating || 'N/A'}</p>
        <p><strong>Date:</strong> ${date.toISOString() || 'N/A'}</p>
      `
    };

    console.log("Sending email with config:", {
      ...emailConfig,
      to: emailConfig.to.map(r => r.email)
    });

    const response = await brevoService.sendEmail(emailConfig);
    res.status(200).json({ 
      message: "Emails sent successfully", 
      recipients: recipients
    });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    res.status(500).json({ 
      message: "Failed to send emails",
      error: error.message,
      details: error.response?.text
    });
  }
});


module.exports = router;