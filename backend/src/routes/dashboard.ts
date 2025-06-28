import { Router } from 'express';
import { DashboardController } from '../controller/DashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Tutte le routes del dashboard richiedono autenticazione
router.use(authenticateToken);

router.get('/stats', DashboardController.getStats);
router.get('/metrics', DashboardController.getMetrics);
router.get('/recent-activity', DashboardController.getRecentActivity);
router.get('/pipeline', DashboardController.getPipeline);

export default router;