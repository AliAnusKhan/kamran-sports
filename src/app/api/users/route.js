import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';   // Update path according to your folder structure
import User from '@/models/User';   // Update path to your User model

export async function GET() {
  try {
    // 1. Connect to MongoDB using your db.js helper
    await connectDB();

    // 2. Fetch data directly using Mongoose
    // .lean() converts Mongoose documents into plain JS objects
    const rawUsers = await User.find({}).sort({ createdAt: -1 }).lean();
    const totalUsers = await User.countDocuments();

    // 3. Serialize ObjectId and Date fields for React
    const users = rawUsers.map((user) => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    }));

    return NextResponse.json({ users, totalUsers });
  } catch (err) {
    console.error('Database Fetch Error:', err);
    return NextResponse.json(
      { error: 'Failed to load users data from MongoDB.' },
      { status: 500 }
    );
  }
}