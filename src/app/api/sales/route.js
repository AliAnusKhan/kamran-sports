import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db'; // Aapka DB connection helper
import DeliveryRequest from '@/models/DeliveryRequest'; // Aapka Order/Delivery Schema

export async function GET() {
  try {
    await dbConnect();
    const requests = await DeliveryRequest.find({});

    const totalRevenue = requests.reduce((sum, r) => sum + (r.amount || 0), 0);
    const dispatchedRevenue = requests
      .filter((r) => r.status === 'dispatched')
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    const pendingRevenue = requests
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        dispatchedRevenue,
        pendingRevenue,
        totalOrders: requests.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}