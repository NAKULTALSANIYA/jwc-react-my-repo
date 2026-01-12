
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['home', 'office', 'other'],
    default: 'home',
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(phone) {
        return /^[6-9]\d{9}$/.test(phone);
      },
      message: 'Please enter a valid 10-digit phone number',
    },
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
    maxlength: [100, 'Address line 1 cannot exceed 100 characters'],
  },
  addressLine2: {
    type: String,
    trim: true,
    maxlength: [100, 'Address line 2 cannot exceed 100 characters'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters'],
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'India',
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    validate: {
      validator: function(code) {
        return /^\d{6}$/.test(code);
      },
      message: 'Please enter a valid 6-digit postal code',
    },
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for better query performance
addressSchema.index({ user: 1 });
addressSchema.index({ user: 1, isDefault: 1 });

const Address = mongoose.model('Address', addressSchema);

export default Address;
