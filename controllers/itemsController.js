const Item = require('../models/item');
const { validateItem, validateId } = require('../middleware/validator');

const getAllItems = async (req, res, next) => {
  try {
    const items = await Item.find()
      .populate('category', 'name description')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

const createItem = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Check if item with same name already exists
    const existingItem = await Item.findOne({ name });
    if (existingItem) {
      return res.status(400).json({
        errors: [{
          msg: 'Item with this name already exists',
          param: 'name',
          location: 'body'
        }]
      });
    }

    const item = new Item({
      name,
      description,
      price,
      category,
      stock: stock || 0
    });

    await item.save();
    
    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: await item.populate('category')
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

const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('category');
    
    if (!item) {
      return res.status(404).json({
        errors: [{
          msg: 'Item not found',
          param: 'id',
          location: 'params'
        }]
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;

    // Check if item exists
    const existingItem = await Item.findById(id);
    if (!existingItem) {
      return res.status(404).json({ 
        errors: [{
          msg: 'Item not found',
          param: 'id',
          location: 'params'
        }]
      });
    }

    // Check for name conflict with other items
    if (name && name !== existingItem.name) {
      const nameExists = await Item.findOne({ name, _id: { $ne: id } });
      if (nameExists) {
        return res.status(400).json({
          errors: [{
            msg: 'Item with this name already exists',
            param: 'name',
            location: 'body'
          }]
        });
      }
    }

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { name, description, price, category, stock },
      { new: true, runValidators: true }
    ).populate('category');

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
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

const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        errors: [{
          msg: 'Item not found',
          param: 'id',
          location: 'params'
        }]
      });
    }
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllItems,
  createItem,
  getItemById,
  updateItem,
  deleteItem
};