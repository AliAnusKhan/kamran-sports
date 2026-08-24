import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

// Fetch all products
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({});
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error(">>> REAL DB ERROR:", error);
    return NextResponse.json(
      { success: false, errorName: error.name, message: error.message },
      { status: 500 }
    );
  }
}

// Create and save a new product
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const newProduct = await Product.create(body);
    
    return NextResponse.json(
      { success: true, data: newProduct }, 
      { status: 201 }
    );
  } catch (error) {
    console.error(">>> REAL DB ERROR:", error);
    return NextResponse.json(
      { success: false, errorName: error.name, message: error.message },
      { status: 500 }
    );
  }
}