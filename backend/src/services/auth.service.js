import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import UserDAO from '../dao/user.dao.js';
import CartService from './cart.service.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenGenerator.js';
import { generateOTP } from '../utils/helpers.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import PasswordReset from '../models/passwordReset.model.js';
import emailService from './email.service.js';

class AuthService {
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await UserDAO.findByEmail(userData.email);
      if (existingUser) {
        throw new ApiError(400, 'User already exists with this email');
      }

      // Create user
      const user = await UserDAO.create(userData);

      // Generate tokens
      const accessToken = generateAccessToken({ id: user._id, role: user.role });
      const refreshToken = generateRefreshToken({ id: user._id });

      // Save refresh token
      await UserDAO.updateRefreshToken(user._id, refreshToken);

      logger.info(`New user registered: ${user.email}`);

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(email, password, guestCartItems) {
    try {
      // Find user
      const user = await UserDAO.findByEmail(email);
      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ApiError(401, 'Account is deactivated');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Generate tokens
      const accessToken = generateAccessToken({ id: user._id, role: user.role });
      const refreshToken = generateRefreshToken({ id: user._id });

      // Save refresh token and update last login
      await UserDAO.updateRefreshToken(user._id, refreshToken);
      await UserDAO.updateLastLogin(user._id);

      let cartMerged = false;
      
      // Merge guest cart if provided
      if (guestCartItems && Array.isArray(guestCartItems) && guestCartItems.length > 0) {
        try {
          await CartService.mergeGuestCart(user._id, guestCartItems);
          cartMerged = true;
          logger.info(`Guest cart merged for user ${user.email}: ${guestCartItems.length} items`);
        } catch (error) {
          logger.warn(`Failed to merge guest cart for user ${user.email}:`, error.message);
          // Don't fail login if cart merge fails
        }
      }

      logger.info(`User logged in: ${user.email}`);

      return {
        user,
        accessToken,
        refreshToken,
        cartMerged
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async googleLogin(profileOrUser) {
    try {
      let user;

      // Handle both OAuth profile object and database user object
      if (profileOrUser._id) {
        // This is a database user object (already authenticated)
        user = profileOrUser;
      } else if (profileOrUser.id) {
        // This is an OAuth profile object
        user = await UserDAO.findByGoogleId(profileOrUser.id);

        if (!user) {
          user = await UserDAO.create({
            name: profileOrUser.displayName,
            email: profileOrUser.emails?.[0]?.value,
            googleId: profileOrUser.id,
            avatar: profileOrUser.photos?.[0]?.value,
            role: 'customer',
            isEmailVerified: true,
          });
        }
      } else {
        throw new ApiError(400, 'Invalid profile data');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ApiError(401, 'Account is deactivated');
      }

      // Generate tokens
      const accessToken = generateAccessToken({ id: user._id, role: user.role });
      const refreshToken = generateRefreshToken({ id: user._id });

      // Save refresh token and update last login
      await UserDAO.updateRefreshToken(user._id, refreshToken);
      await UserDAO.updateLastLogin(user._id);

      logger.info(`User logged in via Google: ${user.email}`);

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Google login error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await UserDAO.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ApiError(401, 'Account is deactivated');
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
      const newRefreshToken = generateRefreshToken({ id: user._id });

      // Update refresh token
      await UserDAO.updateRefreshToken(user._id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  async logout(userId) {
    try {
      await UserDAO.removeRefreshToken(userId);
      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const user = await UserDAO.findByEmail(email);
      if (!user) {
        // Only registered users can request OTP
        throw new ApiError(404, 'No account found with this email address. Please check your email or register for an account.');
      }

      // Generate OTP and session ID
      const otp = generateOTP();
      const resetSessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing reset sessions for this email
      await PasswordReset.deleteMany({ email: user.email });

      // Create new reset session
      await PasswordReset.create({
        resetSessionId,
        email: user.email,
        otp,
        expiresAt,
        isVerified: false,
        attempts: 0,
      });

      // Send email with OTP
      try {
        await emailService.sendPasswordResetOTP(user.email, otp);
        logger.info(`Password reset OTP email sent to: ${user.email}`);
      } catch (emailError) {
        logger.error(`Failed to send OTP email to ${user.email}:`, emailError);
        // Still log OTP to console as fallback for development
        logger.info(`Password reset OTP for ${user.email}: ${otp}`);
      }

      logger.info(`Password reset requested for: ${user.email}`);

      return { 
        message: 'OTP has been sent to your email.',
        resetSessionId 
      };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  async verifyOTP(resetSessionId, otp) {
    try {
      const resetSession = await PasswordReset.findOne({ resetSessionId });
      
      if (!resetSession) {
        throw new ApiError(400, 'Invalid or expired reset session');
      }

      // Check if already verified
      if (resetSession.isVerified) {
        return { 
          message: 'OTP already verified',
          verified: true 
        };
      }

      // Check if expired
      if (new Date() > resetSession.expiresAt) {
        await PasswordReset.deleteOne({ resetSessionId });
        throw new ApiError(400, 'OTP has expired. Please request a new one.');
      }

      // Check max attempts
      if (resetSession.attempts >= resetSession.maxAttempts) {
        await PasswordReset.deleteOne({ resetSessionId });
        throw new ApiError(400, 'Maximum OTP attempts exceeded. Please request a new OTP.');
      }

      // Increment attempts
      resetSession.attempts += 1;
      await resetSession.save();

      // Verify OTP
      if (resetSession.otp !== otp) {
        throw new ApiError(400, `Invalid OTP. ${resetSession.maxAttempts - resetSession.attempts} attempts remaining.`);
      }

      // Mark as verified
      resetSession.isVerified = true;
      resetSession.verifiedAt = new Date();
      await resetSession.save();

      logger.info(`OTP verified for reset session: ${resetSessionId}`);

      return { 
        message: 'OTP verified successfully',
        verified: true 
      };
    } catch (error) {
      logger.error('Verify OTP error:', error);
      throw error;
    }
  }

  async resendOTP(resetSessionId) {
    try {
      const resetSession = await PasswordReset.findOne({ resetSessionId });
      
      if (!resetSession) {
        throw new ApiError(400, 'Invalid or expired reset session');
      }

      // Check if already verified
      if (resetSession.isVerified) {
        throw new ApiError(400, 'OTP already verified. Please proceed to reset password.');
      }

      // Generate new OTP
      const newOTP = generateOTP();
      const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update session
      resetSession.otp = newOTP;
      resetSession.expiresAt = newExpiresAt;
      resetSession.attempts = 0; // Reset attempts
      await resetSession.save();

      // Send email with new OTP
      try {
        await emailService.sendPasswordResetOTP(resetSession.email, newOTP);
        logger.info(`Resent OTP email to: ${resetSession.email}`);
      } catch (emailError) {
        logger.error(`Failed to resend OTP email to ${resetSession.email}:`, emailError);
        // Still log OTP to console as fallback for development
        logger.info(`Resent OTP for ${resetSession.email}: ${newOTP}`);
      }

      logger.info(`OTP resent for reset session: ${resetSessionId}`);

      return { message: 'New OTP has been sent to your email.' };
    } catch (error) {
      logger.error('Resend OTP error:', error);
      throw error;
    }
  }

  async resetPassword(resetSessionId, newPassword) {
    try {
      const resetSession = await PasswordReset.findOne({ resetSessionId });
      
      if (!resetSession) {
        throw new ApiError(400, 'Invalid or expired reset session');
      }

      // Check if OTP was verified
      if (!resetSession.isVerified) {
        throw new ApiError(400, 'OTP not verified. Please verify OTP first.');
      }

      // Check if expired (even after verification)
      if (new Date() > resetSession.expiresAt) {
        await PasswordReset.deleteOne({ resetSessionId });
        throw new ApiError(400, 'Reset session has expired. Please request a new OTP.');
      }

      // Find user
      const user = await UserDAO.findByEmail(resetSession.email);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Update password using the model's pre-save hook
      user.password = newPassword;
      await user.save();

      // Delete the reset session
      await PasswordReset.deleteOne({ resetSessionId });

      // Clear any old reset tokens from user model
      await UserDAO.clearPasswordResetToken(user._id);

      logger.info(`Password reset successful for: ${user.email}`);

      return { message: 'Password reset successful' };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  async verifyEmail(token) {
    try {
      const user = await UserDAO.findByEmailVerificationToken(token);
      if (!user) {
        throw new ApiError(400, 'Invalid or expired verification token');
      }

      await UserDAO.verifyEmail(user._id);

      logger.info(`Email verified for: ${user.email}`);

      return { message: 'Email verified successfully' };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  async resendVerificationEmail(email) {
    try {
      const user = await UserDAO.findByEmail(email);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (user.isEmailVerified) {
        throw new ApiError(400, 'Email already verified');
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      await UserDAO.setEmailVerificationToken(user._id, verificationToken, verificationExpires);

      // TODO: Send verification email
      // await emailService.sendVerificationEmail(user.email, verificationToken);

      logger.info(`Verification email resent to: ${user.email}`);

      return { message: 'Verification email sent' };
    } catch (error) {
      logger.error('Resend verification email error:', error);
      throw error;
    }
  }
}

export default new AuthService();
