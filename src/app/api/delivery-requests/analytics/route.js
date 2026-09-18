// app/api/delivery-requests/analytics/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DeliveryRequest from '@/models/DeliveryRequest';

export async function GET() {
  try {
    await dbConnect();
    const requests = await DeliveryRequest.find({});

    // Schema field is `amount` (matches what the app actually sends).
    const totalRevenue = requests.reduce((sum, r) => sum + (r.amount || 0), 0);

    const dispatchedRevenue = requests
      .filter((r) => r.status === 'dispatched')
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    const pendingRevenue = requests
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    // Online vs offline breakdown
    const onlineOrders = requests.filter((r) => r.orderSource === 'online').length;
    const offlineOrders = requests.filter((r) => r.orderSource === 'offline').length;

    const onlineRevenue = requests
      .filter((r) => r.orderSource === 'online')
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    const offlineRevenue = requests
      .filter((r) => r.orderSource === 'offline')
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        dispatchedRevenue,
        pendingRevenue,
        totalOrders: requests.length,
        onlineOrders,
        offlineOrders,
        onlineRevenue,
        offlineRevenue,
      },
    });
  } catch (error) {
    console.error('delivery-requests analytics GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}