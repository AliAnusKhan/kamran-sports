import mongoose from 'mongoose';

const DeliveryRequestSchema = new mongoose.Schema(
  {
    orderSource: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    city: {
      type: String,
      default: 'N/A',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    product: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    items: [
      {
        productName: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
      },
    ],
    amount: {
      type: Number,
      default: 0,
    },
    invoiceNumber: {
      type: String,
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
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.DeliveryRequest ||
  mongoose.model('DeliveryRequest', DeliveryRequestSchema);