import express from 'express';
import WishlistController from '../controllers/wishlist.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Customer routes - Wishlist management
router.get('/', authenticate, WishlistController.getWishlist);
router.post('/add', authenticate, WishlistController.addToWishlist);
router.delete('/item/:variantId', authenticate, WishlistController.removeFromWishlist);
router.delete('/clear', authenticate, WishlistController.clearWishlist);
router.get('/check', authenticate, WishlistController.checkWishlistStatus);
router.get('/validate', authenticate, WishlistController.validateWishlist);
router.post('/move-to-cart/:variantId', authenticate, WishlistController.moveToCart);

// Admin routes - Wishlist analytics
router.get('/stats', authenticate, WishlistController.getWishlistStats);
router.get('/most-wished', authenticate, WishlistController.getMostWishedProducts);

export default router;
