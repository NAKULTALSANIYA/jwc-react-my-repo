
import Address from '../models/address.model.js';

class AddressDAO {
  async create(addressData) {
    const address = new Address(addressData);
    return await address.save();
  }

  async findById(id) {
    return await Address.findById(id);
  }

  async findByUserId(userId) {
    return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async findByUserIdAndId(userId, addressId) {
    return await Address.findOne({ _id: addressId, user: userId });
  }

  async updateById(id, updateData) {
    return await Address.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async deleteById(id) {
    return await Address.findByIdAndDelete(id);
  }

  async setDefaultAddress(userId, addressId) {
    // First, remove default from all addresses for this user
    await Address.updateMany(
      { user: userId },
      { $unset: { isDefault: 1 } }
    );

    // Then set the selected address as default
    return await Address.findByIdAndUpdate(
      addressId,
      { isDefault: true },
      { new: true, runValidators: true }
    );
  }

  async getDefaultAddress(userId) {
    return await Address.findOne({ user: userId, isDefault: true });
  }

  async countByUserId(userId) {
    return await Address.countDocuments({ user: userId });
  }
}

export default new AddressDAO();
