
import express from 'express';
import UserController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { isAdmin, isManager } from '../middlewares/role.js';

const router = express.Router();

// Customer profile management
router.get('/profile/me', authenticate, UserController.getProfile);
router.put('/profile/me', authenticate, UserController.updateProfile);

// Address management
router.get('/addresses', authenticate, UserController.getUserAddresses);
router.post('/addresses', authenticate, UserController.addUserAddress);
router.put('/addresses/:addressId', authenticate, UserController.updateUserAddress);
router.delete('/addresses/:addressId', authenticate, UserController.deleteUserAddress);

// Customer orders
router.get('/orders', authenticate, UserController.getCustomerOrders);

// Admin routes - User CRUD (keep parameter routes last to avoid shadowing specific paths)
router.get('/', authenticate, isAdmin, UserController.getAllUsers);
router.get('/:id', authenticate, isAdmin, UserController.getUserById);
router.put('/:id', authenticate, isAdmin, UserController.updateUser);
router.delete('/:id', authenticate, isAdmin, UserController.deleteUser);
router.patch('/:id/toggle-status', authenticate, isAdmin, UserController.toggleUserStatus);

export default router;
