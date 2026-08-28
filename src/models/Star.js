import mongoose from 'mongoose';

const StarSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    role: { type: String, required: true },
    category: { type: String, enum: ['Tapeball', 'Hardball'], default: 'Tapeball' },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Star || mongoose.model('Star', StarSchema);