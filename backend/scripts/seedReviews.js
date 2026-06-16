const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');

dotenv.config(); // loads backend/.env when run from backend/ directory

// The 8 dummy reviewer users
const dummyUsers = [
  {
    name: 'Olivia Vance',
    email: 'olivia@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: 'Alexander Smith',
    email: 'alexander@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: 'Sophia Jenkins',
    email: 'sophia@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: 'Daniel Lee',
    email: 'daniel@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: 'Elena Rostova',
    email: 'elena@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: 'Marcus Wright',
    email: 'marcus@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: 'Chloe Patel',
    email: 'chloe@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: "Liam O'Connor",
    email: 'liam@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80'
  }
];

// Product review templates mapped by product name
const reviewsMap = {
  'Heavyweight Cotton Tee': [
    { text: "This cotton tee is amazing! The weight is perfect and it has a really nice drape. Doesn't feel cheap at all.", rating: 5 },
    { text: "Best t-shirt I own. The off-white color is perfect and it holds up great after washing. Super soft fabric.", rating: 5 },
    { text: "Love the relaxed fit. It is thick enough to feel premium but still breathable. Will buy in charcoal next.", rating: 5 },
    { text: "Really good quality cotton. The fit is slightly oversized, which I like. Docked one star just because shipping took a day longer than expected, but the tee itself is a 5/5.", rating: 4 },
    { text: "Great everyday tee. It is comfortable and goes with everything. Highly recommend this brand.", rating: 5 }
  ],
  'Chunky Knit Sweater': [
    { text: "So warm and cozy! The chunky knit looks very high-end and the wool blend is not scratchy at all.", rating: 5 },
    { text: "Perfect sweater for the winter. The cream color is gorgeous and the fit is just right. Worth the price.", rating: 5 },
    { text: "Very thick and heavy. You can feel the quality of the materials. Looks great styled with denim.", rating: 5 },
    { text: "Excellent knitwear. It runs a bit large, so keep that in mind, but it adds to the cozy aesthetic. Very satisfied.", rating: 4 },
    { text: "Perfect layering piece. Kept me warm throughout my trip. Very happy with the quality.", rating: 4 }
  ],
  'Essential Lounge Pants': [
    { text: "The most comfortable lounge pants I've ever owned. The fabric is incredibly soft and the fit is perfect.", rating: 5 },
    { text: "Great for working from home or quick runs to the store. Simple, clean, and minimalist design.", rating: 5 },
    { text: "Love the heather grey color. The waistband is soft and doesn't pinch. Durable material.", rating: 5 },
    { text: "Very comfortable but a little long for my height. Still, the quality of the fleece is fantastic.", rating: 4 },
    { text: "Excellent lounge pants. Will definitely get another pair in black.", rating: 4 }
  ],
  'Classic Denim Jacket': [
    { text: "Absolutely stunning jacket. The vintage blue wash looks exactly like the pictures. Very durable denim.", rating: 5 },
    { text: "A timeless piece. The hardware feels robust and it fits perfectly over a hoodie. Highly recommend!", rating: 5 },
    { text: "Great weight to it. The wash is perfect and it feels like a jacket that will last for years.", rating: 5 },
    { text: "I love the fit and the wash. Buttons are high quality. Fits true to size.", rating: 5 },
    { text: "Fantastic denim jacket. The only minor issue is the pockets are a bit stiff initially, but it breaks in quickly.", rating: 4 },
    { text: "Love this jacket! High quality material, perfectly matches my style.", rating: 5 },
    { text: "Exceptional look and feel. Heavyweight but very soft once washed once.", rating: 5 }
  ],
  'Luxurious Cashmere Scarf': [
    { text: "This scarf is incredibly soft! The camel color is so elegant and it goes with every winter coat I have.", rating: 5 },
    { text: "Unbelievable cashmere quality. Feels very luxurious against the skin and keeps me extremely warm.", rating: 5 },
    { text: "Perfect gift. The texture is premium and the size is great for wrapping around comfortably.", rating: 5 },
    { text: "Super soft and beautifully packaged. It sheds a tiny bit at first but stops after a couple of wears.", rating: 4 },
    { text: "Excellent quality scarf. Definitely worth the investment for the winter months.", rating: 4 },
    { text: "A touch of class. Really keeps the cold wind out while looking smart.", rating: 5 }
  ],
  'Plush Fleece Zip-Up': [
    { text: "So fluffy and warm! The cream color looks very clean and premium. Perfect for chilly days.", rating: 5 },
    { text: "This fleece zip-up is my new favorite outer layer. Extremely cozy and the zip operates smoothly.", rating: 5 },
    { text: "The quality of the fleece is amazing. Doesn't pill after washing. Very happy with my purchase.", rating: 5 },
    { text: "Super comfortable fleece. The fit is great, just a bit snug around the waist, but otherwise perfect.", rating: 4 },
    { text: "Very warm and stylish. Great for casual wear. Highly recommended.", rating: 5 }
  ],
  'Tailored Wool Coat': [
    { text: "An absolute masterpiece. The tailoring is sharp, the navy blue color is rich, and the wool feels heavy and warm.", rating: 5 },
    { text: "Looks extremely elegant and premium. Got so many compliments at work. Fits perfectly.", rating: 5 },
    { text: "Beautiful structure and stitching. This coat looks twice as expensive as it is. A great investment.", rating: 5 },
    { text: "Very warm and formal coat. The sleeves are slightly long for me, but nothing a quick tailor visit can't fix.", rating: 4 },
    { text: "High quality wool. Keeps me warm and looks sophisticated.", rating: 4 }
  ],
  'Vintage Washed Jeans': [
    { text: "The vintage wash is perfect and the straight-leg cut is very flattering. Super comfortable denim.", rating: 5 },
    { text: "Great pair of everyday jeans. Incredibly soft denim with just the right amount of structure.", rating: 5 },
    { text: "Love the lightweight and broken-in feel. Fits true to size and the faded black look is awesome.", rating: 5 },
    { text: "Excellent fit and color. The denim feels high quality. Might run a tiny bit long but works great with boots.", rating: 4 },
    { text: "Highly recommend these pants. They feel like a premium vintage find.", rating: 4 },
    { text: "Best jeans I've bought in years. Straight cut fits exactly how it should.", rating: 5 }
  ],
  'Relaxed Fit Cargo Pants': [
    { text: "Very stylish and functional. The olive color is spot on and the pockets are well-placed.", rating: 5 },
    { text: "Incredibly comfortable cargo pants. The material is durable but feels soft and high-quality.", rating: 5 },
    { text: "Great streetwear look. The fit is relaxed without being overly baggy. Highly recommend.", rating: 5 },
    { text: "Perfect pants for outdoor activities or casual outfits. Drawstrings and buttons are durable.", rating: 4 },
    { text: "Excellent cargos. The fabric is slightly thinner than expected, but perfect for spring/summer.", rating: 4 }
  ]
};

const seedReviews = async () => {
  try {
    // 1. Connect to DB
    await connectDB();

    // 2. Clear old reviews
    console.log('🧹 Clearing existing reviews...');
    await Review.deleteMany({});

    // 3. Upsert dummy reviewer users
    console.log('👤 Seeding reviewer users...');
    const users = [];
    for (const u of dummyUsers) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(`   Created user: ${user.name}`);
      } else {
        console.log(`   Found existing user: ${user.name}`);
      }
      users.push(user);
    }

    // 4. Fetch all products from DB
    console.log('📦 Fetching products from database...');
    const dbProducts = await Product.find({});
    console.log(`   Found ${dbProducts.length} products.`);

    // 5. Seed reviews for each product
    for (const product of dbProducts) {
      console.log(`📝 Seeding reviews for: "${product.name}"`);
      const reviewDataArray = reviewsMap[product.name];
      if (!reviewDataArray) {
        console.warn(`   ⚠️ No custom reviews defined for "${product.name}". Skipping.`);
        continue;
      }

      // Insert reviews
      let totalRatingSum = 0;
      let count = 0;

      for (let i = 0; i < reviewDataArray.length; i++) {
        // Assign each review to a different user to prevent unique compound index violation
        const reviewer = users[i % users.length];
        const rData = reviewDataArray[i];

        await Review.create({
          product: product._id,
          user: reviewer._id,
          rating: rData.rating,
          text: rData.text
        });

        totalRatingSum += rData.rating;
        count++;
      }

      // Recalculate average rating and review count
      const avgRating = Math.round((totalRatingSum / count) * 10) / 10;
      product.rating = avgRating;
      product.numReviews = count;
      await product.save();

      console.log(`   Created ${count} reviews. Recalculated rating: ${avgRating} stars (${count} reviews).`);
    }

    console.log('✅ Reviews seeded and product ratings updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during reviews seeding:', error);
    process.exit(1);
  }
};

seedReviews();
