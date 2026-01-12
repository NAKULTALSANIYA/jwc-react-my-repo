
import UserDAO from '../dao/user.dao.js';
import AddressDAO from '../dao/address.dao.js';
import OrderDAO from '../dao/order.dao.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

class UserService {
  // User CRUD operations
  async getAllUsers(filters = {}, page = 1, limit = 10) {
    try {
      // Base users
      const result = await UserDAO.getAllUsers(filters, page, limit);

      // Enrich with order stats for dashboard/admin views
      const usersWithMetrics = await Promise.all((result.users || []).map(async (user) => {
        const stats = await OrderDAO.getCustomerOrderStats(user._id);
        const plain = user.toObject ? user.toObject() : { ...user };
        plain.metrics = {
          totalOrders: stats?.totalOrders || 0,
          totalSpent: stats?.totalSpent || 0,
          avgOrderValue: stats?.avgOrderValue || 0,
          firstOrder: stats?.firstOrder || null,
          lastOrder: stats?.lastOrder || null,
        };
        return plain;
      }));

      return {
        users: usersWithMetrics,
        pagination: result.pagination,
      };
    } catch (error) {
      logger.error('Get all users error:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await UserDAO.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await UserDAO.updateById(userId, updateData);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      logger.info(`User updated: ${userId}`);
      return user;
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await UserDAO.deleteById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      logger.info(`User deleted: ${userId}`);
      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }

  async toggleUserStatus(userId) {
    try {
      const user = await UserDAO.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const updatedUser = await UserDAO.updateById(userId, { isActive: !user.isActive });

      logger.info(`User status toggled: ${userId} - ${updatedUser.isActive ? 'active' : 'inactive'}`);
      return updatedUser;
    } catch (error) {
      logger.error('Toggle user status error:', error);
      throw error;
    }
  }

  // Address operations
  async getUserAddresses(userId) {
    try {
      const addresses = await AddressDAO.findByUserId(userId);
      return addresses;
    } catch (error) {
      logger.error('Get user addresses error:', error);
      throw error;
    }
  }

  async addUserAddress(userId, addressData) {
    try {
      const address = await AddressDAO.create({
        ...addressData,
        user: userId,
      });

      // Add address reference to user
      await UserDAO.addAddress(userId, address._id);

      logger.info(`Address added for user: ${userId}`);
      return address;
    } catch (error) {
      logger.error('Add user address error:', error);
      throw error;
    }
  }

  async updateUserAddress(userId, addressId, addressData) {
    try {
      const address = await AddressDAO.updateById(addressId, {
        ...addressData,
        user: userId,
      });

      if (!address) {
        throw new ApiError(404, 'Address not found');
      }

      logger.info(`Address updated for user: ${userId}`);
      return address;
    } catch (error) {
      logger.error('Update user address error:', error);
      throw error;
    }
  }

  async deleteUserAddress(userId, addressId) {
    try {
      const address = await AddressDAO.deleteById(addressId);
      if (!address) {
        throw new ApiError(404, 'Address not found');
      }

      // Remove address reference from user
      await UserDAO.removeAddress(userId, addressId);

      logger.info(`Address deleted for user: ${userId}`);
      return { message: 'Address deleted successfully' };
    } catch (error) {
      logger.error('Delete user address error:', error);
      throw error;
    }
  }

  // Customer profile management
  async updateProfile(userId, profileData) {
    try {
      const allowedFields = ['name', 'avatar'];
      const filteredData = {};
      
      Object.keys(profileData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = profileData[key];
        }
      });

      const user = await UserDAO.updateById(userId, filteredData);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      logger.info(`Profile updated for user: ${userId}`);
      return user;
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  async getCustomerOrders(userId, page = 1, limit = 10) {
    try {
      // This will be implemented when we create the order module
      // For now, return empty array
      return {
        orders: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      };
    } catch (error) {
      logger.error('Get customer orders error:', error);
      throw error;
    }
  }
}

export default new UserService();
