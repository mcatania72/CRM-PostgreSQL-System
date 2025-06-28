import { Router } from 'express';
import { body } from 'express-validator';
import { ActivityController } from '../controller/ActivityController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Tutte le routes richiedono autenticazione
router.use(authenticateToken);

// Validazioni per activity
const activityValidation = [
    body('title').notEmpty().withMessage('Titolo richiesto'),
    body('type').isIn(['call', 'email', 'meeting', 'task', 'note', 'follow-up']).withMessage('Tipo non valido'),
    body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled', 'overdue']).withMessage('Status non valido'),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priorità non valida'),
    body('customerId').isInt().withMessage('Customer ID richiesto')
];

router.get('/', ActivityController.getAll);
router.get('/:id', ActivityController.getById);
router.post('/', activityValidation, ActivityController.create);
router.put('/:id', activityValidation, ActivityController.update);
router.delete('/:id', ActivityController.delete);
router.patch('/:id/complete', ActivityController.markAsCompleted);

export default router;