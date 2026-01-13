import AuthService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';
import env from '../config/env.js';

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        throw new ApiError(400, 'Name, email, and password are required');
      }

      const result = await AuthService.register({
        name,
        email,
        password,
        role: 'customer' // Default role
      });

      // Set cookies for auth
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      return ApiResponse.success(res, 'User registered successfully', {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password, guestCartItems } = req.body;

      if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
      }

      const result = await AuthService.login(email, password, guestCartItems);

      // Set cookies for auth
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      return ApiResponse.success(res, 'User logged in successfully', {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        cartMerged: result.cartMerged || false
      });
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req, res, next) {
    try {
      // This method is called after Google OAuth authentication
      const user = req.user;
      
      if (!user) {
        throw new ApiError(401, 'Google authentication failed');
      }

      const result = await AuthService.googleLogin(user);

      // Set cookies for auth
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      // Redirect to frontend with tokens in URL (for localStorage compatibility)
      const frontendURL = env.FRONTEND_URL || (env.FRONTEND_URLS ? env.FRONTEND_URLS.split(',')[0].trim() : null);
      if (!frontendURL) {
        // If no frontend URL is configured, return a clear error to avoid relative redirects
        throw new ApiError(500, 'FRONTEND_URL is not configured on the server');
      }
      const redirectURL = `${frontendURL}/auth/callback?accessToken=${encodeURIComponent(result.accessToken)}&refreshToken=${encodeURIComponent(result.refreshToken)}&userId=${encodeURIComponent(result.user._id)}`;
      res.redirect(redirectURL);
    } catch (error) {
      const frontendURL = env.FRONTEND_URL || (env.FRONTEND_URLS ? env.FRONTEND_URLS.split(',')[0].trim() : null);
      if (frontendURL) {
        res.redirect(`${frontendURL}/login?error=missing_params`);
      } else {
        res.status(500).json({ success: false, message: 'OAuth callback failed and FRONTEND_URL is not configured' });
      }
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }

      const result = await AuthService.refreshToken(refreshToken);

      // Rotate cookies with new tokens
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      return ApiResponse.success(res, 'Token refreshed successfully', {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.user.id;
      await AuthService.logout(userId);

      // Clear auth cookies
      clearAuthCookies(res);

      return ApiResponse.success(res, 'User logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError(400, 'Email is required');
      }

      const result = await AuthService.forgotPassword(email);

      return ApiResponse.success(res, result.message, { resetSessionId: result.resetSessionId });
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req, res, next) {
    try {
      const { resetSessionId, otp } = req.body;

      if (!resetSessionId || !otp) {
        throw new ApiError(400, 'Reset session ID and OTP are required');
      }

      const result = await AuthService.verifyOTP(resetSessionId, otp);

      return ApiResponse.success(res, result.message, { verified: result.verified });
    } catch (error) {
      next(error);
    }
  }

  async resendOTP(req, res, next) {
    try {
      const { resetSessionId } = req.body;

      if (!resetSessionId) {
        throw new ApiError(400, 'Reset session ID is required');
      }

      const result = await AuthService.resendOTP(resetSessionId);

      return ApiResponse.success(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { resetSessionId, password } = req.body;

      if (!resetSessionId || !password) {
        throw new ApiError(400, 'Reset session ID and new password are required');
      }

      if (password.length < 6) {
        throw new ApiError(400, 'Password must be at least 6 characters long');
      }

      const result = await AuthService.resetPassword(resetSessionId, password);

      return ApiResponse.success(res, 'Password reset successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError(400, 'Verification token is required');
      }

      const result = await AuthService.verifyEmail(token);

      return ApiResponse.success(res, 'Email verified successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError(400, 'Email is required');
      }

      const result = await AuthService.resendVerificationEmail(email);

      return ApiResponse.success(res, 'Verification email sent', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();