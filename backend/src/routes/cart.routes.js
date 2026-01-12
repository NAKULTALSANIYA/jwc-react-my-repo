
import express from 'express';
import CartController from '../controllers/cart.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Customer routes - Cart management
router.get('/', authenticate, CartController.getCart);
router.post('/add', authenticate, CartController.addToCart);
router.patch('/item/:variantId', authenticate, CartController.updateCartItem);
router.delete('/item/:variantId', authenticate, CartController.removeFromCart);
router.delete('/clear', authenticate, CartController.clearCart);
router.get('/validate', authenticate, CartController.validateCart);
router.get('/checkout', authenticate, CartController.getCartForCheckout);
router.post('/merge-guest', authenticate, CartController.mergeGuestCart);

// Admin routes - Cart analytics
router.get('/stats', authenticate, CartController.getCartStats);

export default router;
