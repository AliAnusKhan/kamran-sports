// app/api/delivery-requests/route.js
import { NextResponse } from 'next/server';
// import { connectDB } from '@/lib/db';
// import DeliveryRequest from '@/models/DeliveryRequest';

export async function POST(req) {
  try {
    const body = await req.json(); // { name, phone, address, city, product, notes }
    if (!body.name || !body.phone || !body.address || !body.city) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // await connectDB();
    // await DeliveryRequest.create({ ...body, status: 'pending', createdAt: new Date() });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('delivery-requests POST error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  // Admin panel uses this to list all incoming delivery requests.
  try {
    // await connectDB();
    // const requests = await DeliveryRequest.find().sort({ createdAt: -1 });
    const requests = []; // TODO: replace with real DB query
    return NextResponse.json({ requests });
  } catch (err) {
    console.error('delivery-requests GET error:', err);
    return NextResponse.json({ requests: [] }, { status: 500 });
  }
}

export async function PUT(req) {
  // Admin uses this to mark a request as dispatched / cancelled.
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json(); // { status: 'pending' | 'dispatched' | 'cancelled' }

    // await connectDB();
    // await DeliveryRequest.findByIdAndUpdate(id, { status: body.status });

    return NextResponse.json({ success: true, id, status: body.status });
  } catch (err) {
    console.error('delivery-requests PUT error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    // await connectDB();
    // await DeliveryRequest.findByIdAndDelete(id);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('delivery-requests DELETE error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}