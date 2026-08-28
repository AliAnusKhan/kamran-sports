import mongoose from 'mongoose';

const HeroSlideSchema = new mongoose.Schema({
  badge: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  cta: { type: String, default: 'Shop Now' },
  link: { type: String, default: '#collection' },
  image: { type: String, required: true }, // Image URL (Cloudinary ya Local Upload Path)
}, { timestamps: true });

export default mongoose.models.HeroSlide || mongoose.model('HeroSlide', HeroSlideSchema);