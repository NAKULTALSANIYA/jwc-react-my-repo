import express from 'express';
import ContactController from '../controllers/contact.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { isAdmin, isManager } from '../middlewares/role.js';

const router = express.Router();

// Public routes
router.post('/', ContactController.submitContact);

// Admin routes - Protected (order matters: stats before :id)
router.get('/stats', authenticate, isManager, ContactController.getContactStats);
router.get('/', authenticate, isManager, ContactController.getAllContacts);
router.get('/:id', authenticate, isManager, ContactController.getContactById);
router.patch('/:id/status', authenticate, isManager, ContactController.updateContactStatus);
router.patch('/:id/notes', authenticate, isManager, ContactController.addAdminNotes);
router.delete('/:id', authenticate, isManager, ContactController.deleteContact);

export default router;
