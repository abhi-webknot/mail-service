const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();
console.log("brevo key",process.env.BREVO_KEY);

class BrevoService {
  constructor() {
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const apiKeyInstance = SibApiV3Sdk.ApiClient.instance.authentications["api-key"];
    apiKeyInstance.apiKey = process.env.BREVO_KEY;
  }

  async sendEmail(config) {
    try {
      // Create a new SendSmtpEmail instance
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      // Configure the email using the provided config
      sendSmtpEmail.sender = config.sender;
      sendSmtpEmail.to = config.to;
      sendSmtpEmail.subject = config.subject;
      sendSmtpEmail.htmlContent = config.htmlContent;

      // Send the email using the properly formatted object
      return await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

module.exports = new BrevoService();