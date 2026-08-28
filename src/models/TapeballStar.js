import mongoose from 'mongoose';

delete mongoose.models.TapeballStar;

const TapeballStarSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    location: { type: String, required: false },
    role: { type: String, required: true },
    category: { type: String, default: 'Tapeball' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('TapeballStar', TapeballStarSchema);