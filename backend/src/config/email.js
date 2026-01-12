import nodemailer from 'nodemailer';
import env from './env.js';
import { logger } from '../utils/logger.js';

// Create reusable transporter
let transporter = null;

const createTransporter = () => {
  if (transporter) {
    return transporter;
  }

  // Check if email credentials are configured
  if (!env.EMAIL_HOST || !env.EMAIL_USER || !env.EMAIL_PASS) {
    logger.warn('Email credentials not configured. Email sending will be disabled.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });

    logger.info('Email transporter created successfully');
    return transporter;
  } catch (error) {
    logger.error('Failed to create email transporter:', error);
    return null;
  }
};

// Verify connection configuration
export const verifyEmailConnection = async () => {
  const transport = createTransporter();
  if (!transport) {
    return false;
  }

  try {
    await transport.verify();
    logger.info('Email server connection verified');
    return true;
  } catch (error) {
    logger.error('Email server connection failed:', error);
    return false;
  }
};

// Send email function
export const sendEmail = async ({ to, subject, text, html }) => {
  const transport = createTransporter();
  
  if (!transport) {
    logger.warn('Email not sent - transporter not configured');
    return false;
  }

  try {
    const info = await transport.sendMail({
      from: `"Jalaram Wedding Collection" <${env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    return false;
  }
};

export default {
  sendEmail,
  verifyEmailConnection,
};