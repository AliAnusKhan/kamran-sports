import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db'; // FIX: was '@/lib/mongodb' with a named import — file/export didn't match
import Admin from '@/models/Admin';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Admin ID/Email aur Password dono zaroori hain' },
        { status: 400 }
      );
    }

    await connectDB();

    // Allow login with either Admin ID or Email
    const admin = await Admin.findOne({
      $or: [
        { adminId: identifier.trim() },
        { email: identifier.toLowerCase().trim() },
      ],
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin account not found' },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Admin ID/Email or Password is Incorrect' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        admin: {
          id: admin._id,
          adminId: admin.adminId,
          name: admin.name,
          email: admin.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('>>> ADMIN LOGIN ERROR:', error);
    return NextResponse.json(
      { success: false, message: 'Server Error', error: error.message },
      { status: 500 }
    );
  }
}