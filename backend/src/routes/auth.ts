import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { validateRegister, validateLogin, validateChangePassword } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.post('/change-password', authenticateToken, validateChangePassword, AuthController.changePassword);
router.post('/refresh', authenticateToken, AuthController.refreshToken);
router.get('/users', authenticateToken, AuthController.getUsers);

export default router;