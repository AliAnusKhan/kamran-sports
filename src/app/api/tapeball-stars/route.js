import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TapeballStar from '@/models/TapeballStar';

// Next.js ko dynamic fetch par force karne ke liye
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const stars = await TapeballStar.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(
      { success: true, data: stars },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const star = await TapeballStar.create(body);
    return NextResponse.json({ success: true, data: star });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const { _id, ...updateData } = await request.json();
    const star = await TapeballStar.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json({ success: true, data: star });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await TapeballStar.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}