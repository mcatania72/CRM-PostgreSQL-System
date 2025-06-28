import { Router } from 'express';
import { DashboardController } from '../controller/DashboardController';
import { validateDateRange } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Dashboard routes
router.get('/stats', validateDateRange, DashboardController.getStats);
router.get('/metrics', validateDateRange, DashboardController.getMetrics);
router.get('/recent-activity', DashboardController.getRecentActivity);
router.get('/pipeline', DashboardController.getPipeline);
router.get('/performance', validateDateRange, DashboardController.getPerformance);
router.get('/charts/revenue', validateDateRange, DashboardController.getRevenueChart);
router.get('/charts/pipeline', DashboardController.getPipelineChart);
router.get('/charts/activities', validateDateRange, DashboardController.getActivityChart);

export default router;