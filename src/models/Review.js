// models/Review.js
import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    product: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// Prevents Next.js dev-mode hot-reload from redefining the model repeatedly.
export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);