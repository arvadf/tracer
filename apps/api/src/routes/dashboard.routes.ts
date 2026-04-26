import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { requireAdmin } from '../middlewares/auth-admin.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(requireAdmin);

router.get('/charts', dashboardController.getCharts);

export default router;
