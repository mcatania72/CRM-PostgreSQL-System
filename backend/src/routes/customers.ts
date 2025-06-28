import { Router } from 'express';
import { body } from 'express-validator';
import { CustomerController } from '../controller/CustomerController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Tutte le routes richiedono autenticazione
router.use(authenticateToken);

// Validazioni per customer
const customerValidation = [
    body('name').notEmpty().withMessage('Nome richiesto'),
    body('email').optional().isEmail().withMessage('Email non valida'),
    body('status').isIn(['prospect', 'active', 'inactive', 'lost']).withMessage('Status non valido')
];

router.get('/', CustomerController.getAll);
router.get('/:id', CustomerController.getById);
router.post('/', customerValidation, CustomerController.create);
router.put('/:id', customerValidation, CustomerController.update);
router.delete('/:id', CustomerController.delete);

export default router;