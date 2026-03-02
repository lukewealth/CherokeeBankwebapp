// Cherokee Bank - SMS Service (stub)
export class SMSService {
  /**
   * Send SMS (placeholder - integrate with Twilio/Vonage in production)
   */
  static async send(to: string, message: string): Promise<void> {
    console.log(`[SMS] To: ${to}, Message: ${message}`);
    // TODO: Integrate with SMS provider
  }

  static async sendOTP(to: string, code: string): Promise<void> {
    await this.send(to, `Your Cherokee Bank verification code: ${code}. Valid for 5 minutes.`);
  }
}
