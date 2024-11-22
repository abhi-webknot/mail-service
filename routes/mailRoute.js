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

// Apply CORS middleware to this route
router.use(cors(corsOptions));

// Handle preflight requests
router.options('/api/send-feedback-email', cors(corsOptions));

router.post("/send-feedback-email", async (req, res) => {
  try {
    const formData = req.body;

    console.log("formData",formData);
    

    // Collect all email recipients
    let recipients = [
      ...(formData.accountManagerEmail?.split(",") || []),
      ...(formData.deliveryManagerEmail?.split(",") || []),
      ...(formData.projectManagerEmail?.split(",") || []),
    ].map(email => email.trim()); // Trim spaces

    if (formData.rating < 4) {
      recipients = [
        ...recipients,
        ...(formData.escalationTeam?.split(",") || []).map(email => email.trim()),
      ];
    }

    if (!recipients.length) {
      return res.status(400).json({ message: "No email recipients provided." });
    }

    // Prepare the email content
    const config = {
      sender: { name: "Feedback Team", email: process.env.BREVO_EMAIL_SENDER },
      to: recipients.map(email => ({ email })), // Format for Brevo API
      subject: `Feedback Received from ${formData.clientName}`,
      htmlContent: `
        <h1>Client Feedback</h1>
        <p><strong>Rating:</strong> ${formData.rating}</p>
        <p><strong>Feedback:</strong> ${formData.feedback}</p>
        <p><strong>Client Name:</strong> ${formData.clientName}</p>
        <p><strong>Project Name:</strong> ${formData.projectName}</p>
        <p><strong>Escalation:</strong> ${formData.escalation}</p>
        <p><strong>Escalation Team:</strong> ${formData.escalationTeam}</p>
      `,
    };

    // Send the email
    const response = await brevoService.sendEmail(config);
    res.status(200).json({ message: "Emails sent successfully", response });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    res.status(500).json({ message: "Failed to send emails", error });
  }
});

module.exports = router;
