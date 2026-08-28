import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TapeballStar from '@/models/TapeballStar';

export async function GET() {
  try {
    await dbConnect();
    const stars = await TapeballStar.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: stars });
  } catch (error) {
    console.error('GET /api/stars Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch stars' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.name || !body.city || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Name, City, and Role are required fields.' },
        { status: 400 }
      );
    }

    const star = await TapeballStar.create(body);
    return NextResponse.json({ success: true, data: star }, { status: 201 });
  } catch (error) {
    console.error('POST /api/stars Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create star' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;

    const updated = await TapeballStar.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/stars Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update star' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Star ID missing' }, { status: 400 });
    }

    await TapeballStar.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/stars Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete star' },
      { status: 500 }
    );
  }
}