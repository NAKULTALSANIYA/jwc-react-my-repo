
import UserService from '../services/user.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class UserController {
  // Admin routes - User CRUD
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, role, isActive } = req.query;
      
      const filters = {};
      if (role) filters.role = role;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const result = await UserService.getAllUsers(filters, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, 'Users retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      
      return ApiResponse.success(res, 'User retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.updateUser(id, req.body);
      
      return ApiResponse.success(res, 'User updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(id);
      
      return ApiResponse.success(res, 'User deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.toggleUserStatus(id);
      
      return ApiResponse.success(res, 'User status updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  // Customer profile management
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await UserService.updateProfile(userId, req.body);
      
      return ApiResponse.success(res, 'Profile updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await UserService.getUserById(userId);
      
      return ApiResponse.success(res, 'Profile retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  // Address management
  async getUserAddresses(req, res, next) {
    try {
      const userId = req.user.id;
      const addresses = await UserService.getUserAddresses(userId);
      
      return ApiResponse.success(res, 'Addresses retrieved successfully', { addresses });
    } catch (error) {
      next(error);
    }
  }

  async addUserAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const address = await UserService.addUserAddress(userId, req.body);
      
      return ApiResponse.success(res, 'Address added successfully', { address });
    } catch (error) {
      next(error);
    }
  }

  async updateUserAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      const address = await UserService.updateUserAddress(userId, addressId, req.body);
      
      return ApiResponse.success(res, 'Address updated successfully', { address });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      const result = await UserService.deleteUserAddress(userId, addressId);
      
      return ApiResponse.success(res, 'Address deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await UserService.getCustomerOrders(userId, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, 'Customer orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
