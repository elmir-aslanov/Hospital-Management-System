import nodemailer from 'nodemailer';
import logger from './logger.js';

const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587),
  secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE || 'false') === 'true',
  auth: {
    user: smtpUser,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

/**
 * Send an email.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.EMAIL_FROM || `"Hospital System" <${smtpUser}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
  } catch (err) {
    logger.error(`Email send failed: ${err.message}`);
    throw err;
  }
};

export default sendEmail;
