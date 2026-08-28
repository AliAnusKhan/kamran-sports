import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HeroSlide from '@/models/HeroSlide';

// Get all Hero Slides for frontend
export async function GET() {
  try {
    await dbConnect();
    const slides = await HeroSlide.find({}).sort({ createdAt: -1 });
    return NextResponse.json(slides, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
  }
}

// Add new Hero Slide from Admin
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const newSlide = await HeroSlide.create(body);
    return NextResponse.json(newSlide, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 });
  }
}