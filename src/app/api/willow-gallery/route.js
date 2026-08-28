// app/api/willow-gallery/route.js
// Wire this to your DB the same way you wired /api/products or /api/hero-slides.
// Below is a minimal shape-only example — replace the TODOs with your real DB calls.

import { NextResponse } from 'next/server';
// import { connectDB } from '@/lib/db';
// import WillowImage from '@/models/WillowImage';

export async function GET() {
  try {
    // await connectDB();
    // const images = await WillowImage.find().sort({ createdAt: -1 });
    const images = []; // TODO: replace with real DB query
    return NextResponse.json({ images });
  } catch (err) {
    console.error('willow-gallery GET error:', err);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}

export async function POST(req) {
  // Used by the admin panel to add a new willow image.
  try {
    const body = await req.json(); // { url }
    // await connectDB();
    // const created = await WillowImage.create(body);
    return NextResponse.json({ success: true, image: body }, { status: 201 });
  } catch (err) {
    console.error('willow-gallery POST error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req) {
  // Used by the admin panel to remove a willow image. Expects ?id=<image_id>
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    // await connectDB();
    // await WillowImage.findByIdAndDelete(id);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('willow-gallery DELETE error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}