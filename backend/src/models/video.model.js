import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    url: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true,
        trim: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false
    },
    thumbnailUrl: {
        type: String,
        trim: true
    },
    duration: {
        type: Number, // in seconds
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient queries
videoSchema.index({ isActive: 1, order: 1 });
videoSchema.index({ productId: 1 });

const Video = mongoose.model('Video', videoSchema);
export default Video;