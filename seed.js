require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/category');
const Item = require('./models/item');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await Category.deleteMany({});
    await Item.deleteMany({});

    // Create categories
    const electronics = await Category.create({
      name: 'Electronics',
      description: 'Electronic devices and components'
    });

    const clothing = await Category.create({
      name: 'Clothing',
      description: 'Apparel and accessories'
    });
    const homeAppliances = await Category.create({
      name: 'HomeAppliances',  
      description: 'Appliances for home use'
    });

    const books = await Category.create({
      name: 'Books',
      description: 'Fiction and non-fiction literature'
    });

    // Create items
    const sampleItems = [
  {
    name: 'Smartphone',
    description: 'Latest model smartphone',
    price: 699.99,
    category: electronics._id,
    inStock: true
  },
  {
    name: 'Laptop',
    description: 'High-performance laptop',
    price: 1299.99,
    category: electronics._id,
    inStock: true
  },
  {
    name: 'T-Shirt',
    description: 'Cotton t-shirt',
    price: 19.99,
    category: clothing._id,
    inStock: true
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'Classic JavaScript book',
    price: 29.99,
    category: books._id,
    inStock: false
  },
  {
    name: 'Headphones',
    description: 'Noise-cancelling headphones',
    price: 199.99,
    category: electronics._id,
    inStock: true
  },
  {
    name: 'Sneakers',
    description: 'Running sneakers',
    price: 89.99,
    category: clothing._id,
    inStock: true
  },
  {
    name: 'Coffee Maker',
    description: 'Automatic coffee maker',
    price: 99.99,
    category: homeAppliances._id,
    inStock: true
  },
  {
    name: 'The Art of War',
    description: 'Classic strategy book',
    price: 19.99,
    category: books._id,
    inStock: true
  },
  {
    name: 'Smartwatch',
    description: 'Fitness tracking smartwatch',
    price: 299.99,
    category: electronics._id,
    inStock: true
  },
  {
    name: 'Jeans',
    description: 'Casual jeans',
    price: 49.99,
    category: clothing._id,
    inStock: true
  },
  {
    name: 'Tablet',
    description: 'Portable tablet',
    price: 399.99,
    category: electronics._id,
    inStock: false
  },
  {
    name: 'Sunglasses',
    description: 'UV protection sunglasses',
    price: 29.99,
    category: clothing._id,
    inStock: true
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Waterproof Bluetooth speaker',
    price: 49.99,
    category: electronics._id,
    inStock: true
  },
  {
    name: 'The Great Gatsby',
    description: 'Classic novel',
    price: 14.99,
    category: books._id,
    inStock: true
  },
  {
    name: 'Gaming Console',
    description: 'Next-gen gaming console',
    price: 499.99,
    category: electronics._id,
    inStock: true
  },
  {
    name: 'Dress Shirt',
    description: 'Formal dress shirt',
    price: 39.99,
    category: clothing._id,
    inStock: true
  },
  {
    name: 'Fitness Tracker',
    description: 'Advanced fitness tracker',
    price: 129.99,
    category: electronics._id,
    inStock: true
  },
  {
    name: 'Toaster',
    description: '2-slice toaster',
    price: 29.99,
    category: homeAppliances._id,
    inStock: true
  },
  {
    name: 'The Catcher in the Rye',
    description: 'Classic coming-of-age novel',
    price: 12.99,
    category: books._id,
    inStock: false
  },
  {
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds',
    price: 99.99,
    category: electronics._id,
    inStock: true
  }
];


    await Item.insertMany(sampleItems);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();