import { body, param, query } from 'express-validator';

// Auth validation
export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email valida richiesta'),
    body('password')
        .notEmpty()
        .withMessage('Password richiesta')
];

export const validateRegister = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email valida richiesta'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password deve essere di almeno 6 caratteri'),
    body('firstName')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Nome richiesto'),
    body('lastName')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Cognome richiesto')
];

// Customer validation
export const validateCustomer = [
    body('name')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Nome cliente richiesto'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email valida richiesta'),
    body('status')
        .optional()
        .isIn(['prospect', 'active', 'inactive', 'lost'])
        .withMessage('Status non valido')
];

// Opportunity validation
export const validateOpportunity = [
    body('title')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Titolo opportunità richiesto'),
    body('customerId')
        .isInt({ min: 1 })
        .withMessage('ID cliente valido richiesto'),
    body('value')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Valore deve essere positivo'),
    body('stage')
        .optional()
        .isIn(['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'])
        .withMessage('Stage non valido')
];

// Activity validation
export const validateActivity = [
    body('title')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Titolo attività richiesto'),
    body('customerId')
        .isInt({ min: 1 })
        .withMessage('ID cliente valido richiesto'),
    body('type')
        .optional()
        .isIn(['call', 'email', 'meeting', 'task', 'note', 'follow-up'])
        .withMessage('Tipo attività non valido'),
    body('status')
        .optional()
        .isIn(['pending', 'in_progress', 'completed', 'cancelled', 'overdue'])
        .withMessage('Status attività non valido')
];

// Interaction validation
export const validateInteraction = [
    body('description')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Descrizione richiesta'),
    body('customerId')
        .isInt({ min: 1 })
        .withMessage('ID cliente valido richiesto'),
    body('type')
        .optional()
        .isIn(['phone', 'email', 'meeting', 'chat', 'social', 'website', 'other'])
        .withMessage('Tipo interazione non valido'),
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Data valida richiesta')
];

// Common validation
export const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID valido richiesto')
];

export const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Numero pagina deve essere positivo'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limite deve essere tra 1 e 100')
];

export default {
    validateLogin,
    validateRegister,
    validateCustomer,
    validateOpportunity,
    validateActivity,
    validateInteraction,
    validateId,
    validatePagination
};