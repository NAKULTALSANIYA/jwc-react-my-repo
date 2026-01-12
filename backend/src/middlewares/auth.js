
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies (if using cookies)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ApiError(401, 'Access denied. No token provided.'));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new ApiError(401, 'Token is not valid. User not found.'));
      }

      if (!user.isActive) {
        return next(new ApiError(401, 'Account is deactivated.'));
      }

      // Add user to request object
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      };

      next();
    } catch (error) {
      return next(new ApiError(401, 'Token is not valid.'));
    }
  } catch (error) {
    next(error);
  }
};

// Middleware to optionally authenticate (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.isActive) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

// Middleware to check if user owns resource
export const checkOwnership = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const resourceId = req.params[resourceIdParam];
    if (req.user.id.toString() !== resourceId && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Access denied. You can only access your own resources.'));
    }

    next();
  };
};
