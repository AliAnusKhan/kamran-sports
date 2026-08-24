import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    productId: { 
      type: String, 
      required: true, 
      trim: true 
    }, // Short ID (e.g. KS-101 ya 101)
    name: { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    category: { 
      type: String, 
      required: true 
    },
    batType: { type: String, default: '' },
    ballType: { type: String, default: '' },
    gloveType: { type: String, default: '' },
    brand: { type: String, default: '' },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);