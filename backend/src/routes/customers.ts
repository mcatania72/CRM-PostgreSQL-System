import { Router } from 'express';
import { CustomerController } from '../controller/CustomerController';
import { validateCustomer, validateId, validatePagination } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Customer CRUD routes
router.get('/', validatePagination, CustomerController.getAll);
router.get('/:id', validateId, CustomerController.getById);
router.post('/', validateCustomer, CustomerController.create);
router.put('/:id', validateId, validateCustomer, CustomerController.update);
router.delete('/:id', validateId, CustomerController.delete);

// Additional customer routes
router.get('/:id/opportunities', validateId, CustomerController.getOpportunities);
router.get('/:id/activities', validateId, CustomerController.getActivities);
router.get('/:id/interactions', validateId, CustomerController.getInteractions);
router.get('/:id/summary', validateId, CustomerController.getSummary);

export default router;