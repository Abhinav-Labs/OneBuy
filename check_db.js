import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const reviewSchema = new mongoose.Schema({}, { strict: false });
const Review = mongoose.model('Review', reviewSchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const reviews = await Review.find({});
  console.log("Total reviews:", reviews.length);
  const uniqueProducts = new Set(reviews.map(r => r.product?.toString()));
  console.log("Unique products in reviews:", uniqueProducts.size);
  process.exit(0);
}
check();
