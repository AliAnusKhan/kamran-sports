import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // bcrypt-hashed, never plain text
    role: { type: String, default: 'admin' },
    resetPasswordToken: { type: String, default: null }, // sha256 hash of the raw token sent by email
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);