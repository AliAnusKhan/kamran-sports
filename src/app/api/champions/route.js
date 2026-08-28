import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Champion from '@/models/Champion';

export async function GET() {
  try {
    await connectDB();
    // Filter hataya gaya hai taake sab champions fetch hon
    const champions = await Champion.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: champions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Automatically sets isActive to true on creation
    const champion = await Champion.create({
      isActive: true,
      ...body,
    });
    
    return NextResponse.json({ success: true, data: champion });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const { _id, ...updateData } = await request.json();
    const champion = await Champion.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json({ success: true, data: champion });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await Champion.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}