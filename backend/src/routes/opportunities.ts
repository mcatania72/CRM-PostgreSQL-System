import { Router } from 'express';
import { body } from 'express-validator';
import { OpportunityController } from '../controller/OpportunityController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Tutte le routes richiedono autenticazione
router.use(authenticateToken);

// Validazioni per opportunity
const opportunityValidation = [
    body('title').notEmpty().withMessage('Titolo richiesto'),
    body('customerId').isInt().withMessage('Customer ID richiesto'),
    body('stage').isIn(['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']).withMessage('Stage non valido'),
    body('value').optional().isFloat({ min: 0 }).withMessage('Valore deve essere positivo')
];

router.get('/', OpportunityController.getAll);
router.get('/:id', OpportunityController.getById);
router.post('/', opportunityValidation, OpportunityController.create);
router.put('/:id', opportunityValidation, OpportunityController.update);
router.delete('/:id', OpportunityController.delete);

export default router;