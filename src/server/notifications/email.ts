// Cherokee Bank - Email Notification Service
import { getMailTransporter, mailConfig } from '@/src/config/mail';

export class EmailService {
  /**
   * Send OTP verification email
   */
  static async sendOTP(to: string, code: string, name: string): Promise<void> {
    const transporter = getMailTransporter();
    try {
      await transporter.sendMail({
        from: mailConfig.from,
        to,
        subject: 'Cherokee Bank - Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">Cherokee Bank</h2>
            <p>Hello ${name},</p>
            <p>Your verification code is:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e;">${code}</span>
            </div>
            <p>This code expires in 5 minutes. Do not share it with anyone.</p>
            <p style="color: #666; font-size: 12px;">If you did not request this code, please ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send OTP email:', error);
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcome(to: string, name: string): Promise<void> {
    const transporter = getMailTransporter();
    try {
      await transporter.sendMail({
        from: mailConfig.from,
        to,
        subject: 'Welcome to Cherokee Bank',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">Welcome to Cherokee Bank!</h2>
            <p>Hello ${name},</p>
            <p>Your Cherokee Bank account has been created successfully.</p>
            <p>You can now:</p>
            <ul>
              <li>Manage multi-currency wallets (USD, EUR, GBP, ₵Chero)</li>
              <li>Send and receive payments instantly</li>
              <li>Trade cryptocurrencies (BTC, ETH, USDT)</li>
              <li>Access AI-powered banking assistant</li>
            </ul>
            <p>Please complete your KYC verification to unlock all features.</p>
            <p>Best regards,<br/>Cherokee Bank Team</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  /**
   * Send transaction alert
   */
  static async sendTransactionAlert(
    to: string,
    name: string,
    type: string,
    amount: string,
    reference: string
  ): Promise<void> {
    const transporter = getMailTransporter();
    try {
      await transporter.sendMail({
        from: mailConfig.from,
        to,
        subject: `Cherokee Bank - Transaction ${type}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">Transaction Alert</h2>
            <p>Hello ${name},</p>
            <p>A ${type.toLowerCase()} of <strong>${amount}</strong> has been processed.</p>
            <p>Reference: ${reference}</p>
            <p style="color: #666; font-size: 12px;">If you did not authorize this transaction, please contact support immediately.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send transaction alert:', error);
    }
  }
}
