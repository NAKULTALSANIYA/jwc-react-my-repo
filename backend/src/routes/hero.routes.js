import express from 'express';
import { 
  getAllHeroes, 
  getHeroByPosition, 
  upsertHero, 
  deleteHero, 
  updateHeroStatus 
} from '../controllers/hero.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/role.js';

const router = express.Router();

// Public route: Get all hero images
router.get('/', getAllHeroes);

// Public route: Get hero by position
router.get('/:position', getHeroByPosition);

// Admin routes (protected)
router.post('/', authenticate, authorize('admin'), upsertHero);
router.put('/:position', authenticate, authorize('admin'), upsertHero);
router.patch('/:position/status', authenticate, authorize('admin'), updateHeroStatus);
router.delete('/:position', authenticate, authorize('admin'), deleteHero);

export default router;
