const { body, param, validationResult } = require('express-validator');

// Common error formatter
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Inventory category validators
const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 30 }).withMessage('Name must be between 2-30 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  handleValidationErrors
];

// Inventory item validators
const validateItem = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 30 }).withMessage('Name must be between 2-30 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .isMongoId().withMessage('Invalid category ID format')
    .custom(async (value) => {
      const category = await require('../models/category').findById(value);
      if (!category) throw new Error('Category not found');
      return true;
    }),
  body('inStock')
    .optional()
    .isBoolean().withMessage('inStock must be a boolean value'),
  handleValidationErrors
];

// ID parameter validator
const validateId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];

module.exports = {
  validateCategory,
  validateItem,
  validateId
};