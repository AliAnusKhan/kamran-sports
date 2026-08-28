// app/api/reviews/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';

export async function GET() {
  // Returns ALL customer reviews — shown directly on the website, no approval wait.
  try {
    await connectDB();
    const reviews = await Review.find().sort({ createdAt: -1 });

    const average = reviews.length
      ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length
      : null;

    return NextResponse.json({ reviews, average });
  } catch (err) {
    console.error('reviews GET error:', err);
    return NextResponse.json({ reviews: [], average: null }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json(); // { name, product, rating, comment }
    if (!body.name || !body.product || !body.rating) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const rating = Math.min(5, Math.max(1, Number(body.rating)));

    await connectDB();
    const created = await Review.create({
      name: body.name,
      product: body.product,
      rating,
      comment: body.comment || '',
    });

    return NextResponse.json({ success: true, review: created }, { status: 201 });
  } catch (err) {
    console.error('reviews POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  // Admin can still remove spam/fake reviews.
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    await connectDB();
    await Review.findByIdAndDelete(id);

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('reviews DELETE error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}