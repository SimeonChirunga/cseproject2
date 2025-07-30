const express = require('express');
const router = express.Router();
const { validateCategory, validateItem, validateId } = require('../middleware/validator');
const itemsController = require('../controllers/itemsController');
const categoriesController = require('../controllers/categoriesController');
const { isAuthenticated } = require("../middleware/authenticate");

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Product category management
 *   - name: Items
 *     description: Inventory items management
 */

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
 */
router.get('/categories', categoriesController.getAllCategories);

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
 */

router.get('/categories/:id', validateId, categoriesController.getCategoryById);



/**
 * @swagger
 * /categories:
 * post:
 *   summary: Create a new category
 *   tags: [Categories]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/Category'
 *   responses:
 *     201:
 *       description: Category created successfully
 *     400:
 *       description: Invalid input
 */
router.post('/categories', isAuthenticated, validateCategory, categoriesController.createCategory);


/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Category not found
 */
router.put('/categories/:id', isAuthenticated, validateId, validateCategory, categoriesController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       204:
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with items
 *       404:
 *         description: Category not found
 */
router.delete('/categories/:id', isAuthenticated, validateId, categoriesController.deleteCategory);

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: List of all items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get('/items', itemsController.getAllItems);

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/items', isAuthenticated, validateItem, itemsController.createItem);

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 */
router.get('/items/:id', validateId, itemsController.getItemById);

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Item not found
 */
router.put('/items/:id', isAuthenticated, validateId, validateItem, itemsController.updateItem);

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Item ID
 *     responses:
 *       204:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */
router.delete('/items/:id', isAuthenticated, validateId, itemsController.deleteItem);

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the category
 *         name:
 *           type: string
 *           description: The category name
 *       example:
 *         id: 63f4a1e2f5d2b3a8f7e6c5d4
 *         name: Electronics
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the item
 *         name:
 *           type: string
 *           description: The item name
 *         categoryId:
 *           type: string
 *           description: The ID of the category this item belongs to
 *       example:
 *         id: 63f4a1e2f5d2b3a8f7e6c5d5
 *         name: Smartphone
 *         categoryId: 63f4a1e2f5d2b3a8f7e6c5d4
 */

module.exports = router;