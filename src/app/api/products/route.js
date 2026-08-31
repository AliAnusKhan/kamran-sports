import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

// Prevent Next.js from caching GET requests statically
export const dynamic = 'force-dynamic';

// GET: Fetch products with flexible filtering
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    // Support all variations of subcategory parameters
    const subCategory =
      searchParams.get('subCategory') ||
      searchParams.get('subcategory') ||
      searchParams.get('sub');
      
    const search = searchParams.get('search');

    const query = {};

    // Flexible Category Search (handles hyphens and case mismatch)
    if (category && category !== 'All') {
      const cleanCategory = category.replace(/-/g, ' ');
      query.category = { $regex: new RegExp(`^${cleanCategory}$`, 'i') };
    }

    // Flexible SubCategory Search (checks both subCategory & subcategory DB fields)
    if (subCategory && subCategory !== 'All') {
      const cleanSubCategory = subCategory.replace(/-/g, ' ');
      const subRegex = new RegExp(`^${cleanSubCategory}$`, 'i');
      
      query.$or = [
        { subCategory: subRegex },
        { subcategory: subRegex }
      ];
    }

    // Keyword Search
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = [
        { name: searchRegex },
        { title: searchRegex },
        { productId: searchRegex },
      ];

      if (query.$or) {
        // Combine subCategory $or and search $or safely
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    console.error('>>> DB FETCH ERROR:', error);
    return NextResponse.json(
      { success: false, errorName: error.name, message: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new product
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const productName = body.name || body.title;

    if (!productName || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, message: 'Missing required product fields: name/title, price, or category.' },
        { status: 400 }
      );
    }

    const productPayload = {
      ...body,
      name: productName,
      title: productName,
    };

    const newProduct = await Product.create(productPayload);

    return NextResponse.json(
      { success: true, data: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('>>> DB CREATE ERROR:', error);
    return NextResponse.json(
      { success: false, errorName: error.name, message: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update an existing product by _id
export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required product field: _id.' },
        { status: 400 }
      );
    }

    if (updateData.name || updateData.title) {
      const productName = updateData.name || updateData.title;
      updateData.name = productName;
      updateData.title = productName;
    }

    const updatedProduct = await Product.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('>>> DB UPDATE ERROR:', error);
    return NextResponse.json(
      { success: false, errorName: error.name, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove product by query parameter ID (?id=...)
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing product ID parameter.' },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: deletedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('>>> DB DELETE ERROR:', error);
    return NextResponse.json(
      { success: false, errorName: error.name, message: error.message },
      { status: 500 }
    );
  }
}