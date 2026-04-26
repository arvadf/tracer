import { Router } from 'express';
import alumniRoutes from './alumni.routes';
import authRoutes from './auth.routes';
import adminAuthRoutes from './admin-auth.routes';
import adminAlumniRoutes from './admin-alumni.routes';
import adminSurveyRoutes from './admin-survey.routes';
import dashboardRoutes from './dashboard.routes';
import { generalLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

// Apply general rate limiter to all routes
router.use(generalLimiter);

// --- Public Routes ---
router.use('/alumni', alumniRoutes);
router.use('/auth', authRoutes);

// --- Admin Routes ---
router.use('/admin/auth', adminAuthRoutes);
router.use('/admin/alumni', adminAlumniRoutes);
router.use('/admin/surveys', adminSurveyRoutes);
router.use('/admin/dashboard', dashboardRoutes);

export default router;
