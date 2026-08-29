import mongoose from 'mongoose';

const DeliveryRequestSchema = new mongoose.Schema(
  {
    // Online vs Offline track karne ke liye
    orderSource: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
      required: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    // Product details (Optional agar details save karni hain)
    items: [
      {
        productName: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Cash', 'Card', 'Bank Transfer'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid'],
      default: 'unpaid',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String, // Manual entries ke waqt koi extra details likhne ke liye
    },
  },
  { timestamps: true }
);

export default mongoose.models.DeliveryRequest ||
  mongoose.model('DeliveryRequest', DeliveryRequestSchema);