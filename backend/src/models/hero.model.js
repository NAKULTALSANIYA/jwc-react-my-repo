import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  position: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
    unique: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const Hero = mongoose.model('Hero', heroSchema);

export default Hero;
