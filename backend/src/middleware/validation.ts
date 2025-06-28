import { body, param, query } from 'express-validator';
import { UserRole } from '../entity/User';
import { CustomerStatus } from '../entity/Customer';
import { OpportunityStage } from '../entity/Opportunity';
import { ActivityType, ActivityStatus, ActivityPriority } from '../entity/Activity';
import { InteractionType, InteractionDirection } from '../entity/Interaction';

// Auth validations
export const validateRegister = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Name must be between 1 and 255 characters'),
    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('First name must be max 100 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Last name must be max 100 characters'),
    body('role')
        .optional()
        .isIn(Object.values(UserRole))
        .withMessage(`Role must be one of: ${Object.values(UserRole).join(', ')}`)
];

export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

export const validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
];

// Customer validations
export const validateCustomer = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Name is required and must be max 255 characters'),
    body('company')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Company must be max 255 characters'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('phone')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Phone must be max 50 characters'),
    body('status')
        .optional()
        .isIn(Object.values(CustomerStatus))
        .withMessage(`Status must be one of: ${Object.values(CustomerStatus).join(', ')}`)
];

// Opportunity validations
export const validateOpportunity = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Title is required and must be max 255 characters'),
    body('value')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Value must be a positive number'),
    body('stage')
        .optional()
        .isIn(Object.values(OpportunityStage))
        .withMessage(`Stage must be one of: ${Object.values(OpportunityStage).join(', ')}`),
    body('probability')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Probability must be between 0 and 100'),
    body('customerId')
        .isInt({ min: 1 })
        .withMessage('Valid customer ID is required')
];

// Activity validations
export const validateActivity = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Title is required and must be max 255 characters'),
    body('type')
        .optional()
        .isIn(Object.values(ActivityType))
        .withMessage(`Type must be one of: ${Object.values(ActivityType).join(', ')}`),
    body('status')
        .optional()
        .isIn(Object.values(ActivityStatus))
        .withMessage(`Status must be one of: ${Object.values(ActivityStatus).join(', ')}`),
    body('priority')
        .optional()
        .isIn(Object.values(ActivityPriority))
        .withMessage(`Priority must be one of: ${Object.values(ActivityPriority).join(', ')}`),
    body('customerId')
        .isInt({ min: 1 })
        .withMessage('Valid customer ID is required'),
    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid ISO8601 date')
];

// Interaction validations
export const validateInteraction = [
    body('description')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Description is required'),
    body('type')
        .optional()
        .isIn(Object.values(InteractionType))
        .withMessage(`Type must be one of: ${Object.values(InteractionType).join(', ')}`),
    body('direction')
        .optional()
        .isIn(Object.values(InteractionDirection))
        .withMessage(`Direction must be one of: ${Object.values(InteractionDirection).join(', ')}`),
    body('customerId')
        .isInt({ min: 1 })
        .withMessage('Valid customer ID is required'),
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be a valid ISO8601 date')
];

// Common parameter validations
export const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid ID is required')
];

// Query parameter validations
export const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('search')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters')
];

export const validateDateRange = [
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO8601 date'),
    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO8601 date')
];

export default {
    validateRegister,
    validateLogin,
    validateChangePassword,
    validateCustomer,
    validateOpportunity,
    validateActivity,
    validateInteraction,
    validateId,
    validatePagination,
    validateDateRange
};