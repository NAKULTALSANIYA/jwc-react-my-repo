import Video from '../models/video.model.js';
import Product from '../models/product.model.js';

class VideoService {
  // Get all videos with optional filters
  async getAllVideos(filters = {}) {
    try {
      const query = {};
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === 'true' || filters.isActive === true;
      }
      
      if (filters.productId) {
        query.productId = filters.productId;
      }

      const videos = await Video.find(query)
        .populate('productId', 'name slug price images description originalPrice')
        .sort({ order: 1, createdAt: -1 })
        .lean();

      return videos;
    } catch (error) {
      throw new Error(`Error fetching videos: ${error.message}`);
    }
  }

  // Get a single video by ID
  async getVideoById(videoId) {
    try {
      const video = await Video.findById(videoId)
        .populate('productId', 'name slug price images description originalPrice category')
        .lean();

      if (!video) {
        throw new Error('Video not found');
      }

      return video;
    } catch (error) {
      throw new Error(`Error fetching video: ${error.message}`);
    }
  }

  // Create a new video
  async createVideo(videoData) {
    try {
      // Validate product exists if productId is provided
      if (videoData.productId) {
        const product = await Product.findById(videoData.productId);
        if (!product) {
          throw new Error('Associated product not found');
        }
      }

      const video = new Video(videoData);
      await video.save();

      // Populate product details before returning
      await video.populate('productId', 'name slug price images description');

      return video;
    } catch (error) {
      throw new Error(`Error creating video: ${error.message}`);
    }
  }

  // Update a video
  async updateVideo(videoId, videoData) {
    try {
      // Validate product exists if productId is being updated
      if (videoData.productId) {
        const product = await Product.findById(videoData.productId);
        if (!product) {
          throw new Error('Associated product not found');
        }
      }

      const video = await Video.findByIdAndUpdate(
        videoId,
        videoData,
        { new: true, runValidators: true }
      ).populate('productId', 'name slug price images description');

      if (!video) {
        throw new Error('Video not found');
      }

      return video;
    } catch (error) {
      throw new Error(`Error updating video: ${error.message}`);
    }
  }

  // Delete a video
  async deleteVideo(videoId) {
    try {
      const video = await Video.findByIdAndDelete(videoId);

      if (!video) {
        throw new Error('Video not found');
      }

      return video;
    } catch (error) {
      throw new Error(`Error deleting video: ${error.message}`);
    }
  }

  // Get videos by product ID
  async getVideosByProduct(productId) {
    try {
      const videos = await Video.find({ 
        productId, 
        isActive: true 
      })
        .sort({ order: 1, createdAt: -1 })
        .lean();

      return videos;
    } catch (error) {
      throw new Error(`Error fetching videos for product: ${error.message}`);
    }
  }

  // Reorder videos
  async reorderVideos(videoOrders) {
    try {
      // videoOrders should be an array of { id, order } objects
      const updates = videoOrders.map(({ id, order }) => 
        Video.findByIdAndUpdate(id, { order }, { new: true })
      );

      const results = await Promise.all(updates);
      return results;
    } catch (error) {
      throw new Error(`Error reordering videos: ${error.message}`);
    }
  }

  // Toggle video active status
  async toggleVideoStatus(videoId) {
    try {
      const video = await Video.findById(videoId);
      
      if (!video) {
        throw new Error('Video not found');
      }

      video.isActive = !video.isActive;
      await video.save();

      return video;
    } catch (error) {
      throw new Error(`Error toggling video status: ${error.message}`);
    }
  }
}

export default new VideoService();
