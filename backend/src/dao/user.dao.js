import User from '../models/user.model.js';

class UserDAO {

  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('addresses');
  }

  async findById(id) {
    return await User.findById(id)
      .populate('addresses');
  }

  async findByGoogleId(googleId) {
    return await User.findOne({ googleId });
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('addresses');
  }

  async updateRefreshToken(id, refreshToken) {
    return await User.findByIdAndUpdate(
      id,
      { 
        $set: { 
          refreshToken,
          lastLogin: new Date()
        } 
      },
      { new: true }
    ).select('-password');
  }

  async updateLastLogin(id) {
    return await User.findByIdAndUpdate(
      id,
      { $set: { lastLogin: new Date() } },
      { new: true }
    ).select('-password');
  }

  async removeRefreshToken(id) {
    return await User.findByIdAndUpdate(
      id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    ).select('-password');
  }

  async setPasswordResetToken(id, tokenHash, expires) {
    return await User.findByIdAndUpdate(
      id,
      {
        $set: {
          passwordResetToken: tokenHash,
          passwordResetExpires: expires
        }
      },
      { new: true }
    );
  }

  async findByPasswordResetToken(tokenHash) {
    return await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: Date.now() }
    });
  }

  async clearPasswordResetToken(id) {
    return await User.findByIdAndUpdate(
      id,
      {
        $unset: {
          passwordResetToken: 1,
          passwordResetExpires: 1
        }
      },
      { new: true }
    );
  }

  async verifyEmail(id) {
    return await User.findByIdAndUpdate(
      id,
      {
        $set: { isEmailVerified: true },
        $unset: {
          emailVerificationToken: 1,
          emailVerificationExpires: 1
        }
      },
      { new: true }
    );
  }

  async setEmailVerificationToken(id, token, expires) {
    return await User.findByIdAndUpdate(
      id,
      {
        $set: {
          emailVerificationToken: token,
          emailVerificationExpires: expires
        }
      },
      { new: true }
    );
  }

  async findByEmailVerificationToken(token) {
    return await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
      isEmailVerified: false
    });
  }

  async findByEmailOrGoogleId(email, googleId) {
    const query = {
      $or: [
        { email: email.toLowerCase() },
        { googleId }
      ]
    };
    return await User.findOne(query);
  }

  async updateProfile(id, profileData) {
    const allowedUpdates = ['name', 'avatar', 'addresses'];
    const updates = {};
    
    for (const field of allowedUpdates) {
      if (profileData[field] !== undefined) {
        updates[field] = profileData[field];
      }
    }

    return await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
  }

  async updatePassword(id, newPassword) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.password = newPassword;
    return await user.save();
  }

  async deactivateUser(id) {
    return await User.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    ).select('-password');
  }

  async activateUser(id) {
    return await User.findByIdAndUpdate(
      id,
      { $set: { isActive: true } },
      { new: true }
    ).select('-password');
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  async addAddress(userId, addressId) {
    // Keep addresses unique while returning the populated list for callers
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { addresses: addressId } },
      { new: true }
    ).populate('addresses');
  }

  async removeAddress(userId, addressId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: addressId } },
      { new: true }
    ).populate('addresses');
  }

  async getAllUsers(filters = {}, page = 1, limit = 10, sort = { createdAt: -1 }) {
    const skip = (page - 1) * limit;
    
    const query = {};
    if (filters.role) query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.isEmailVerified !== undefined) query.isEmailVerified = filters.isEmailVerified;
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
          },
          googleUsers: {
            $sum: { $cond: [{ $ne: ['$googleId', null] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalUsers: 1,
          activeUsers: 1,
          verifiedUsers: 1,
          googleUsers: 1,
          unverifiedUsers: { $subtract: ['$totalUsers', '$verifiedUsers'] },
          inactiveUsers: { $subtract: ['$totalUsers', '$activeUsers'] }
        }
      }
    ]);

    return stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      googleUsers: 0,
      unverifiedUsers: 0,
      inactiveUsers: 0
    };
  }
}

export default new UserDAO();
