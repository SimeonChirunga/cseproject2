const Category  = require('../models/category');
const Item = require('../models/item');
const { validateCategory, validateId } = require('../middleware/validator');

// Get all categories
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

// Get single category
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        errors: [{
          msg: 'Category not found',
          param: 'id',
          location: 'params'
        }]
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// Create category
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    // Check for existing category with same name
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        errors: [{
          msg: 'Category with this name already exists',
          param: 'name',
          location: 'body'
        }]
      });
    }
    
    const category = new Category({
      name,
      description: description || ''
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => ({
        msg: error.message,
        param: error.path,
        location: 'body'
      }));
      return res.status(400).json({ errors });
    }
    next(err);
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ 
        errors: [{
          msg: 'Category not found',
          param: 'id',
          location: 'params'
        }]
      });
    }

    // Check for name conflict with other categories
    if (name && name !== existingCategory.name) {
      const nameExists = await Category.findOne({ name, _id: { $ne: id } });
      if (nameExists) {
        return res.status(400).json({
          errors: [{
            msg: 'Category with this name already exists',
            param: 'name',
            location: 'body'
          }]
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => ({
        msg: error.message,
        param: error.path,
        location: 'body'
      }));
      return res.status(400).json({ errors });
    }
    next(err);
  }
};

// Delete category
const deleteCategory = async (req, res, next) => {
  try {
    const itemsCount = await Item.countDocuments({ category: req.params.id });
    if (itemsCount > 0) {
      return res.status(400).json({
        errors: [{
          msg: 'Cannot delete category with associated items',
          param: 'id',
          location: 'params'
        }]
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        errors: [{
          msg: 'Category not found',
          param: 'id',
          location: 'params'
        }]
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};