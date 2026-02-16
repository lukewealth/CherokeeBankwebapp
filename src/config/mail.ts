// Cherokee Bank - Email Configuration
import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export function getMailTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Development: use ethereal email (write to console)
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'dev@cherokeebank.test',
          pass: 'dev',
        },
      });
    }
  }
  return transporter;
}

export const mailConfig = {
  from: process.env.SMTP_FROM || 'Cherokee Bank <noreply@cherokeebank.com>',
  templates: {
    otpVerification: 'otp-verification',
    welcomeEmail: 'welcome',
    passwordReset: 'password-reset',
    transactionAlert: 'transaction-alert',
    kycApproved: 'kyc-approved',
    kycRejected: 'kyc-rejected',
    accountFrozen: 'account-frozen',
    fraudAlert: 'fraud-alert',
  },
};
