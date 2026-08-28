'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  // Convert search parameters to string format for exact API forwarding
  const searchString = searchParams.toString();
  const categoryParam = searchParams.get('category');
  const subCategoryParam =
    searchParams.get('subcategory') ||
    searchParams.get('subCategory') ||
    searchParams.get('sub');

  const selectedFilter = subCategoryParam || categoryParam || 'All';

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        // Fetch products directly forwarding current URL search parameters
        const res = await fetch(`/api/products?${searchString}`, { cache: 'no-store' });
        const data = await res.json();

        if (data.success) {
          setProducts(data.data || []);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching filtered products:', error);
        setProducts([]);
      } finally { // Fixed syntax error: replaced 'font-medium' with 'finally'
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchString]); // Re-fetch whenever URL query parameters change

  // Clean title for UI header display
  const cleanDisplayTitle = decodeURIComponent(selectedFilter).replace(/-/g, ' ');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500 font-medium text-base">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[70vh]">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          {cleanDisplayTitle === 'All' ? 'All Products' : cleanDisplayTitle}
        </h1>
        <span className="text-sm font-semibold text-gray-500">
          Total Items: {products.length}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
          <p className="text-lg text-gray-600 font-medium">
            No products found for "{cleanDisplayTitle}".
          </p>
          <Link
            href="/products"
            className="inline-block mt-4 text-sm font-bold text-[#A6362B] hover:underline"
          >
            View All Products &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
            >
              <div className="h-48 bg-gray-100 overflow-hidden relative">
                <img
                  src={product.image || '/fallback.png'}
                  alt={product.name || product.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] font-bold uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      {product.category}
                    </span>
                    {(product.subCategory || product.subcategory) && (
                      <span className="text-[10px] font-bold uppercase bg-red-50 text-[#A6362B] px-2 py-0.5 rounded">
                        {product.subCategory || product.subcategory}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2">
                    {product.name || product.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-base font-bold text-emerald-600 font-mono">
                    PKR {product.price?.toLocaleString()}
                  </span>
                  <Link
                    href={`/products/${product._id}`}
                    className="bg-[#0B120D] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#A6362B] transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ProductsList />
    </Suspense>
  );
}