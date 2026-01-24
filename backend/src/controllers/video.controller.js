import VideoService from '../services/video.service.js';

// Controller to get all videos
export const getAllVideos = async (req, res) => {
    try {
        const videos = await VideoService.getAllVideos(req.query);
            
        res.json({
            success: true,
            data: videos
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error fetching videos'
        });
    }
};

// Controller to get a single video by ID
export const getVideoById = async (req, res) => {
    try {
        const video = await VideoService.getVideoById(req.params.id);
        
        res.json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ 
            success: false,
            message: error.message || 'Error fetching video'
        });
    }
};

// Controller to add a new video
export const addVideo = async (req, res) => {
    try {
        const newVideo = await VideoService.createVideo(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Video added successfully',
            data: newVideo
        });
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(400).json({ 
            success: false,
            message: error.message || 'Error adding video'
        });
    }
};

// Controller to update a video
export const updateVideo = async (req, res) => {
    try {
        const video = await VideoService.updateVideo(req.params.id, req.body);
        
        res.json({
            success: true,
            message: 'Video updated successfully',
            data: video
        });
    } catch (error) {
        console.error('Error updating video:', error);
        const statusCode = error.message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({ 
            success: false,
            message: error.message || 'Error updating video'
        });
    }
};

// Controller to delete a video
export const deleteVideo = async (req, res) => {
    try {
        await VideoService.deleteVideo(req.params.id);
        
        res.json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ 
            success: false,
            message: error.message || 'Error deleting video'
        });
    }
};

// Controller to upload video file
export const uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file provided'
            });
        }

        // Construct an absolute video URL so the frontend can play it reliably
        const relativePath = `/uploads/videos/${req.file.filename}`;
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const videoUrl = `${baseUrl}${relativePath}`;
        
        res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            data: {
                url: videoUrl,
                relativePath,
                filename: req.file.filename,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error uploading video'
        });
    }
};