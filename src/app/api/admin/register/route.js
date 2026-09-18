import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { adminId, name, email, password } = await request.json();

    if (!adminId || !name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingAdmin = await Admin.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { adminId: adminId.trim() }],
    });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin ID or Email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      adminId: adminId.trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Admin account created successfully. You can now login.',
        admin: {
          id: newAdmin._id,
          adminId: newAdmin.adminId,
          name: newAdmin.name,
          email: newAdmin.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('>>> ADMIN REGISTER ERROR:', error);

    // Handle duplicate-key race condition (unique index) gracefully
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Admin ID or Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Server Error', error: error.message },
      { status: 500 }
    );
  }
}