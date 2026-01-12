import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
  resetSessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index - document will be auto-deleted when expiresAt is reached
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verifiedAt: {
    type: Date,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 3,
  },
});

// Indexes for performance
passwordResetSchema.index({ email: 1, createdAt: -1 });
passwordResetSchema.index({ resetSessionId: 1, isVerified: 1 });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

export default PasswordReset;
