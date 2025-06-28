import { Router } from 'express';
import { InteractionController } from '../controller/InteractionController';
import { validateInteraction, validateId, validatePagination, validateDateRange } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Interaction CRUD routes
router.get('/', validatePagination, validateDateRange, InteractionController.getAll);
router.get('/:id', validateId, InteractionController.getById);
router.post('/', validateInteraction, InteractionController.create);
router.put('/:id', validateId, validateInteraction, InteractionController.update);
router.delete('/:id', validateId, InteractionController.delete);

// Additional interaction routes
router.get('/customer/:customerId', validateId, InteractionController.getByCustomer);
router.get('/user/:userId', validateId, InteractionController.getByUser);
router.get('/recent/:days', InteractionController.getRecent);
router.get('/stats/summary', InteractionController.getStats);

export default router;