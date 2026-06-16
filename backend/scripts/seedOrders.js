const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

dotenv.config({ path: '../.env' });

const firstNames = ['James', 'Emma', 'Oliver', 'Charlotte', 'William', 'Sophia', 'Lucas', 'Mia', 'Henry', 'Evelyn'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
const cities = ['New York', 'Los Angeles', 'Houston', 'Miami', 'Chicago', 'Philadelphia', 'Columbus', 'Atlanta', 'Charlotte', 'Detroit'];
const postCodes = ['10001', '90001', '77001', '33101', '60601', '19101', '43085', '30301', '28201', '48201'];

const generateFakeAddress = (index) => {
  const fName = firstNames[index % firstNames.length];
  const lName = lastNames[index % lastNames.length];
  return {
    firstName: fName,
    lastName: lName,
    email: `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`,
    shippingAddress: {
      address: `${100 + index} Main St`,
      city: cities[index % cities.length],
      state: states[index % states.length],
      postalCode: postCodes[index % postCodes.length],
    }
  };
};

const seedOrders = async () => {
  try {
    await connectDB();

    // Clear existing orders
    console.log('🧹 Clearing existing orders...');
    await Order.deleteMany({});

    // Fetch products
    const products = await Product.find({});
    if (products.length === 0) {
      console.error('❌ No products found in the database. Please seed products first.');
      process.exit(1);
    }

    // Fetch users
    const users = await User.find({});
    console.log(`👤 Found ${users.length} users and ${products.length} products to distribute orders.`);

    // Set user "olivia@example.com" as admin so the user can log in and view it easily!
    const testAdmin = await User.findOneAndUpdate(
      { email: 'olivia@example.com' },
      { isAdmin: true },
      { new: true }
    );
    if (testAdmin) {
      console.log(`🔑 Olivia Vance (${testAdmin.email}) is now marked as an ADMIN.`);
    }

    const ordersToSeed = [];
    const now = new Date();

    // Generate ~45 orders spread over the last 30 days
    for (let i = 0; i < 45; i++) {
      // Pick random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date();
      orderDate.setDate(now.getDate() - daysAgo);
      // Random hour/minute
      orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      const addr = generateFakeAddress(i);
      
      // Determine order items (1 to 3 items)
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let itemsPrice = 0;

      // Randomly select items
      const selectedProductIndices = new Set();
      while (selectedProductIndices.size < numItems) {
        selectedProductIndices.add(Math.floor(Math.random() * products.length));
      }

      for (const idx of selectedProductIndices) {
        const prod = products[idx];
        const qty = Math.floor(Math.random() * 2) + 1;
        const price = prod.price;
        itemsPrice += price * qty;

        orderItems.push({
          name: prod.name,
          qty,
          image: prod.images[0],
          price,
          product: prod._id,
          size: prod.sizes[Math.floor(Math.random() * prod.sizes.length)] || 'M',
          color: prod.colors[Math.floor(Math.random() * prod.colors.length)] || 'Default',
        });
      }

      const shippingPrice = itemsPrice > 100 ? 0 : 15.00;
      const totalPrice = itemsPrice + shippingPrice;

      // Assign to a real user in the DB (50% chance) or guest
      const userRef = (Math.random() > 0.5 && users.length > 0) 
        ? users[Math.floor(Math.random() * users.length)]._id 
        : undefined;

      const isPaid = true; // Seeded orders are paid
      const isDelivered = daysAgo > 3; // Orders older than 3 days are delivered

      ordersToSeed.push({
        user: userRef,
        email: addr.email,
        firstName: addr.firstName,
        lastName: addr.lastName,
        orderItems,
        shippingAddress: addr.shippingAddress,
        paymentMethod: 'Credit Card',
        itemsPrice,
        shippingPrice,
        totalPrice,
        isPaid,
        paidAt: orderDate,
        isDelivered,
        deliveredAt: isDelivered ? new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000) : undefined, // 2 days later
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    // Insert all orders
    console.log(`📝 Inserting ${ordersToSeed.length} orders into the database...`);
    await Order.insertMany(ordersToSeed);
    
    console.log('✅ Orders seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during orders seeding:', error);
    process.exit(1);
  }
};

seedOrders();
