import { Router } from 'express';
import { adminAuthController } from '../controllers/admin-auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { adminLoginSchema, adminUpdateProfileSchema, adminUpdatePasswordSchema } from '../validations/admin-auth.validation';
import { requireAdmin } from '../middlewares/auth-admin.middleware';

const router = Router();

// Public - Login
router.post('/login', validate(adminLoginSchema, 'body'), adminAuthController.login);

// Protected - Logout & Profile
router.post('/logout', requireAdmin, adminAuthController.logout);
router.get('/me', adminAuthController.me);
router.put('/profile', requireAdmin, validate(adminUpdateProfileSchema, 'body'), adminAuthController.updateProfile);
router.put('/password', requireAdmin, validate(adminUpdatePasswordSchema, 'body'), adminAuthController.updatePassword);

export default router;
