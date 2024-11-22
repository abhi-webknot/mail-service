const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

class BrevoService {
  constructor() {
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const apiKeyInstance =
      SibApiV3Sdk.ApiClient.instance.authentications["api-key"];
    apiKeyInstance.apiKey = process.env.BREVO_KEY;
  }

  async sendEmail(config) {
    try {
      return await this.apiInstance.sendTransacEmail(config);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

module.exports = new BrevoService();
