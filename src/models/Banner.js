import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  slideIndex: { type: Number, required: true, unique: true }, // 0, 1, 2
  badge: { type: String, required: true },
  title: { type: String, required: true }, // use \n for line break
  subtitle: { type: String, required: true },
  cta: { type: String, default: 'Shop Now' },
  link: { type: String, default: '#collection' },
  image: { type: String, required: true }, // Cloudinary URL
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);