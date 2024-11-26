const express = require("express");
const brevoService = require("../service/mailService");
const router = express.Router();

router.post("/send-feedback-email/:lvl", async (req, res) => {
  try {
    const { lvl } = req.params; // Extract 'lvl' from route parameters
    const formData = req.body;
    console.log("Received formData:", formData);

    // Collect and validate email addresses
    let recipients = [
      ...(formData.accountManagerEmail?.split(",") || []),
      ...(formData.deliveryManagerEmail?.split(",") || []),
      ...(formData.projectManagerEmail?.split(",") || []),
    ]
      .map(email => email.trim())

    if (formData.rating < 4 && formData.escalationTeam) {
      const escalationEmails = (formData.escalationTeam?.split(",") || [])
        .map(email => email.trim())
      recipients = [...recipients, ...escalationEmails];
    }

    if (!recipients.length) {
      return res.status(400).json({
        message: "No valid email recipients provided.",
      });
    }

    console.log("Validated recipients:", recipients);

    // Format recipients for Brevo API
    const formattedRecipients = recipients.map(email => ({
      email: email,
    }));

    const date = new Date();

    // Determine email subject and body based on 'lvl' and rating
    let subject = "";
    let bodyContent = "";

    if (lvl === "proj") {
      subject = formData.rating > 4 ? "Green PULCE" : "Red PULCE";
      subject += ` - ${formData.clientName || "Client"} - ${formData.projectName || "Project"}`;
      bodyContent = `
        <h1>Project Feedback</h1>
        <p><strong>Client Name:</strong> ${formData.clientName || "N/A"}</p>
        <p><strong>Account Manager:</strong> ${formData.accountManager || "N/A"}</p>
        <p><strong>Project Name:</strong> ${formData.projectName || "N/A"}</p>
        <p><strong>Client Delivery Manager:</strong> ${formData.deliveryManager || "N/A"}</p>
        <p><strong>Project Manager:</strong> ${formData.projectManager || "N/A"}</p>
        <p><strong>Escalation Team:</strong> ${formData.escalation || "N/A"}</p>
        <br />
        <p><strong>Feedback Message:</strong> ${formData.feedback || "N/A"}</p>
        <p><strong>Feedback Rating:</strong> ${formData.rating || "N/A"}</p>
        <p><strong>Date:</strong> ${date.toISOString()}</p>
      `;
    } else if (lvl === "client") {
      subject = formData.rating > 4 ? "Green PULCE" : "Red PULCE";
      subject += ` - ${formData.clientName || "Client"}`;
      bodyContent = `
        <h1>Client Feedback</h1>
        <p><strong>Client Name:</strong> ${formData.clientName || "N/A"}</p>
        <p><strong>Account Manager:</strong> ${formData.accountManager || "N/A"}</p>
        <p><strong>Escalation Team:</strong> ${formData.escalation || "N/A"}</p>
        <br />
        <p><strong>Feedback Message:</strong> ${formData.feedback || "N/A"}</p>
        <p><strong>Feedback Rating:</strong> ${formData.rating || "N/A"}</p>
        <p><strong>Date:</strong> ${date.toISOString()}</p>
      `;
    } else {
      return res.status(400).json({
        message: "Invalid level specified. Use 'proj' or 'client'.",
      });
    }

    const emailConfig = {
      subject,
      sender: {
        email: process.env.BREVO_EMAIL_SENDER,
        name: "Feedback Team",
      },
      to: formattedRecipients,
      htmlContent: bodyContent,
    };

    console.log("Sending email with config:", {
      ...emailConfig,
      to: emailConfig.to.map(r => r.email),
    });

    const response = await brevoService.sendEmail(emailConfig);
    res.status(200).json({
      message: "Emails sent successfully",
      recipients,
    });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    res.status(500).json({
      message: "Failed to send emails",
      error: error.message,
      details: error.response?.text,
    });
  }
});

module.exports = router;
