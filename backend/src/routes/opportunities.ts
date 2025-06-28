import { Router } from 'express';
import { OpportunityController } from '../controller/OpportunityController';
import { validateOpportunity, validateId, validatePagination } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Opportunity CRUD routes
router.get('/', validatePagination, OpportunityController.getAll);
router.get('/:id', validateId, OpportunityController.getById);
router.post('/', validateOpportunity, OpportunityController.create);
router.put('/:id', validateId, validateOpportunity, OpportunityController.update);
router.delete('/:id', validateId, OpportunityController.delete);

// Additional opportunity routes
router.get('/:id/activities', validateId, OpportunityController.getActivities);
router.post('/:id/close', validateId, OpportunityController.close);
router.get('/stage/:stage', OpportunityController.getByStage);
router.get('/stats/pipeline', OpportunityController.getPipelineStats);

export default router;