import Hero from '../models/hero.model.js';

// Get all hero images
export const getAllHeroes = async (req, res) => {
  try {
    const heroes = await Hero.find().sort({ position: 1 });
    res.json({
      success: true,
      data: heroes || [],
    });
  } catch (error) {
    console.error('Error fetching heroes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero images',
      error: error.message,
    });
  }
};

// Get hero image by position
export const getHeroByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const hero = await Hero.findOne({ position: parseInt(position) });
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero image not found',
      });
    }

    res.json({
      success: true,
      data: hero,
    });
  } catch (error) {
    console.error('Error fetching hero:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero image',
      error: error.message,
    });
  }
};

// Create or update hero image
export const upsertHero = async (req, res) => {
  try {
    const { position, imageUrl, isActive } = req.body;

    if (!position || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Position and imageUrl are required',
      });
    }

    if (position < 1 || position > 4) {
      return res.status(400).json({
        success: false,
        message: 'Position must be between 1 and 4',
      });
    }

    let hero = await Hero.findOne({ position });

    if (hero) {
      // Update existing
      hero.imageUrl = imageUrl;
      hero.isActive = isActive !== undefined ? isActive : hero.isActive;
      await hero.save();
    } else {
      // Create new
      hero = new Hero({
        position,
        imageUrl,
        isActive: isActive !== false,
      });
      await hero.save();
    }

    res.json({
      success: true,
      message: hero.position === position ? 'Hero image updated' : 'Hero image created',
      data: hero,
    });
  } catch (error) {
    console.error('Error upserting hero:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save hero image',
      error: error.message,
    });
  }
};

// Delete hero image
export const deleteHero = async (req, res) => {
  try {
    const { position } = req.params;
    const hero = await Hero.findOneAndDelete({ position: parseInt(position) });

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero image not found',
      });
    }

    res.json({
      success: true,
      message: 'Hero image deleted',
      data: hero,
    });
  } catch (error) {
    console.error('Error deleting hero:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hero image',
      error: error.message,
    });
  }
};

// Update hero image status
export const updateHeroStatus = async (req, res) => {
  try {
    const { position } = req.params;
    const { isActive } = req.body;

    const hero = await Hero.findOneAndUpdate(
      { position: parseInt(position) },
      { isActive },
      { new: true }
    );

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero image not found',
      });
    }

    res.json({
      success: true,
      message: 'Hero image status updated',
      data: hero,
    });
  } catch (error) {
    console.error('Error updating hero status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hero image status',
      error: error.message,
    });
  }
};
