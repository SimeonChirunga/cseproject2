const express = require('express');
const router = express.Router();
const { validateCategory, validateItem, validateId } = require('../middleware/validator');
const itemsController = require('../controllers/itemsController');
const categoriesController = require('../controllers/categoriesController');
const { isAuthenticated } = require("../middleware/authenticate");

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Product category management
 *   - name: Items
 *     description: Inventory items management
 */

// ===== CATEGORY ROUTES ===== //

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Server error
 */
router.get('/categories', (req, res, next) => {
  if (!isProduction) console.log('Fetching all categories');
  categoriesController.getAllCategories(req, res, next);
});

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       400:
 *         description: Invalid ID format
 */
router.get('/categories/:id', validateId, (req, res, next) => {
  if (!isProduction) console.log(`Fetching category with ID: ${req.params.id}`);
  categoriesController.getCategoryById(req, res, next);
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/categories', isAuthenticated, validateCategory, (req, res, next) => {
  if (!isProduction) console.log('Creating new category:', req.body);
  categoriesController.createCategory(req, res, next);
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.put('/categories/:id', isAuthenticated, validateId, validateCategory, (req, res, next) => {
  if (!isProduction) console.log(`Updating category ${req.params.id}:`, req.body);
  categoriesController.updateCategory(req, res, next);
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted
 *       400:
 *         description: Cannot delete (contains items)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.delete('/categories/:id', isAuthenticated, validateId, (req, res, next) => {
  if (!isProduction) console.log(`Deleting category ${req.params.id}`);
  categoriesController.deleteCategory(req, res, next);
});

// ===== ITEM ROUTES ===== //

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       500:
 *         description: Server error
 */
router.get('/items', (req, res, next) => {
  if (!isProduction) {
    console.log('Fetching all items');
    if (req.query.category) console.log(`Filtering by category: ${req.query.category}`);
  }
  itemsController.getAllItems(req, res, next);
});

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *       400:
 *         description: Invalid ID format
 */
router.get('/items/:id', validateId, (req, res, next) => {
  if (!isProduction) console.log(`Fetching item with ID: ${req.params.id}`);
  itemsController.getItemById(req, res, next);
});

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemInput'
 *     responses:
 *       201:
 *         description: Item created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/items', isAuthenticated, validateItem, (req, res, next) => {
  if (!isProduction) console.log('Creating new item:', req.body);
  itemsController.createItem(req, res, next);
});

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemInput'
 *     responses:
 *       200:
 *         description: Item updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.put('/items/:id', isAuthenticated, validateId, validateItem, (req, res, next) => {
  if (!isProduction) console.log(`Updating item ${req.params.id}:`, req.body);
  itemsController.updateItem(req, res, next);
});

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Item deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.delete('/items/:id', isAuthenticated, validateId, (req, res, next) => {
  if (!isProduction) console.log(`Deleting item ${req.params.id}`);
  itemsController.deleteItem(req, res, next);
});

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 63f4a1e2f5d2b3a8f7e6c5d4
 *         name:
 *           type: string
 *           example: Electronics
 *         description:
 *           type: string
 *           example: Electronic devices
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CategoryInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Electronics
 *         description:
 *           type: string
 *           maxLength: 255
 *           example: Electronic devices
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 63f4a1e2f5d2b3a8f7e6c5d5
 *         name:
 *           type: string
 *           example: Smartphone
 *         description:
 *           type: string
 *           example: Latest model
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 999.99
 *         inStock:
 *           type: boolean
 *           example: true
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ItemInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Smartphone
 *         description:
 *           type: string
 *           maxLength: 500
 *           example: Latest model
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 999.99
 *         inStock:
 *           type: boolean
 *           default: true
 *         category:
 *           type: string
 *           example: 63f4a1e2f5d2b3a8f7e6c5d4
 */

module.exports = router;