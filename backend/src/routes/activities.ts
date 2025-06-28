import { Router } from 'express';
import { ActivityController } from '../controller/ActivityController';
import { validateActivity, validateId, validatePagination, validateDateRange } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Activity CRUD routes
router.get('/', validatePagination, validateDateRange, ActivityController.getAll);
router.get('/:id', validateId, ActivityController.getById);
router.post('/', validateActivity, ActivityController.create);
router.put('/:id', validateId, validateActivity, ActivityController.update);
router.delete('/:id', validateId, ActivityController.delete);

// Additional activity routes
router.post('/:id/complete', validateId, ActivityController.complete);
router.post('/:id/cancel', validateId, ActivityController.cancel);
router.get('/user/:userId', validateId, ActivityController.getByUser);
router.get('/due/today', ActivityController.getDueToday);
router.get('/due/overdue', ActivityController.getOverdue);

export default router;