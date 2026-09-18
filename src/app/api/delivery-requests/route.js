// app/api/delivery-requests/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DeliveryRequest from '@/models/DeliveryRequest';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name, phone, city, address, product, quantity, items,
      invoiceNumber, amount, paymentMethod, paymentStatus,
      notes, orderSource, status,
    } = body;

    if (!name || !phone || !address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    const newRequest = await DeliveryRequest.create({
      name, phone, city, address, product, quantity, items,
      invoiceNumber, amount, paymentMethod, paymentStatus, notes,
      orderSource: orderSource || 'online',
      status: status || 'pending',
    });

    return NextResponse.json({ success: true, request: newRequest }, { status: 201 });
  } catch (err) {
    console.error('delivery-requests POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const requests = await DeliveryRequest.find().sort({ createdAt: -1 });
    return NextResponse.json({ requests });
  } catch (err) {
    console.error('delivery-requests GET error:', err);
    return NextResponse.json({ requests: [] }, { status: 500 });
  }
}

// Fields the admin panel is allowed to edit. Keeping this as an explicit
// whitelist (rather than spreading the whole request body) stops stray or
// unexpected keys from ever reaching the database.
const EDITABLE_FIELDS = [
  'name', 'phone', 'city', 'address', 'product', 'quantity', 'items',
  'invoiceNumber', 'amount', 'paymentMethod', 'paymentStatus', 'notes',
  'orderSource', 'status',
];

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    // Build the update from only the fields that were actually sent, so a
    // quick status-only update (e.g. "mark dispatched") still works exactly
    // as before, while a full edit form updates every field it submits.
    const update = {};
    for (const field of EDITABLE_FIELDS) {
      if (body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    await dbConnect();
    const updated = await DeliveryRequest.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (err) {
    console.error('delivery-requests PUT error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    await dbConnect();
    const deleted = await DeliveryRequest.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('delivery-requests DELETE error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}