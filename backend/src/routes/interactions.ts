import { Router } from 'express';
import { body } from 'express-validator';
import { InteractionController } from '../controller/InteractionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Tutte le routes richiedono autenticazione
router.use(authenticateToken);

// Validazioni per interaction
const interactionValidation = [
    body('type').isIn(['phone', 'email', 'meeting', 'chat', 'social', 'website', 'other']).withMessage('Tipo non valido'),
    body('direction').isIn(['inbound', 'outbound']).withMessage('Direzione non valida'),
    body('description').notEmpty().withMessage('Descrizione richiesta'),
    body('customerId').isInt().withMessage('Customer ID richiesto'),
    body('date').isISO8601().withMessage('Data non valida')
];

router.get('/', InteractionController.getAll);
router.get('/:id', InteractionController.getById);
router.post('/', interactionValidation, InteractionController.create);
router.put('/:id', interactionValidation, InteractionController.update);
router.delete('/:id', InteractionController.delete);

export default router;