import { sendEmail } from '../config/email.js';
import { logger } from '../utils/logger.js';
import env from '../config/env.js';

class EmailService {
  /**
   * Send password reset OTP email
   */
  async sendPasswordResetOTP(email, otp) {
    const subject = 'Password Reset OTP - Jalaram Wedding Collection';
    
    const text = `
Your password reset OTP is: ${otp}

This OTP will expire in 10 minutes.

If you didn't request a password reset, please ignore this email.

Best regards,
Jalaram Wedding Collection Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding: 40px 0;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" width="100%" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0dc93c 0%, #0bc038 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Jalaram Wedding Collection</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a261e; font-size: 24px; font-weight: bold;">Password Reset Request</h2>
              
              <p style="margin: 0 0 20px; color: #3b5441; font-size: 16px; line-height: 1.5;">
                You requested to reset your password. Use the OTP below to proceed:
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #f8faf9; border: 2px solid #0dc93c; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #3b5441; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your OTP</p>
                <p style="margin: 0; color: #1a261e; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </p>
              </div>
              
              <p style="margin: 20px 0; color: #3b5441; font-size: 14px; line-height: 1.5;">
                ⏱️ <strong>This OTP will expire in 10 minutes.</strong>
              </p>
              
              <p style="margin: 20px 0; color: #3b5441; font-size: 14px; line-height: 1.5;">
                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a261e; padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px; color: #9db9a6; font-size: 14px;">
                Best regards,<br>
                <strong>Jalaram Wedding Collection Team</strong>
              </p>
              <p style="margin: 10px 0 0; color: #9db9a6; font-size: 12px;">
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      const sent = await sendEmail({ to: email, subject, text, html });
      if (sent) {
        logger.info(`Password reset OTP email sent to: ${email}`);
        return true;
      } else {
        logger.warn(`Failed to send password reset OTP email to: ${email}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error sending password reset OTP email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to Jalaram Wedding Collection!';
    
    const text = `
Hi ${name},

Welcome to Jalaram Wedding Collection!

Thank you for joining us. We're excited to have you as part of our community.

Explore our exclusive collection of ethnic wear crafted for your special moments.

Visit our website: ${env.FRONTEND_URL || 'https://jalaramwedding.com'}

Best regards,
Jalaram Wedding Collection Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding: 40px 0;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" width="100%" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0dc93c 0%, #0bc038 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Welcome to Jalaram!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a261e; font-size: 24px; font-weight: bold;">Hi ${name}! 👋</h2>
              
              <p style="margin: 0 0 20px; color: #3b5441; font-size: 16px; line-height: 1.5;">
                Thank you for joining <strong>Jalaram Wedding Collection</strong>. We're thrilled to have you!
              </p>
              
              <p style="margin: 0 0 20px; color: #3b5441; font-size: 16px; line-height: 1.5;">
                Explore our exclusive collection of ethnic wear, crafted with love for your special moments.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${env.FRONTEND_URL || 'https://jalaramwedding.com'}" style="display: inline-block; background-color: #0dc93c; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                  Start Shopping
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a261e; padding: 30px; text-align: center;">
              <p style="margin: 0; color: #9db9a6; font-size: 14px;">
                Best regards,<br>
                <strong>Jalaram Wedding Collection Team</strong>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      const sent = await sendEmail({ to: email, subject, text, html });
      if (sent) {
        logger.info(`Welcome email sent to: ${email}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error sending welcome email to ${email}:`, error);
      return false;
    }
  }
}

export default new EmailService();
