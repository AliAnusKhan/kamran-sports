'use client';

import { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 font-sans">
        <Navbar />
        <div className="text-center py-20 font-bold text-neutral-500">Loading item details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-100 font-sans">
        <Navbar />
        <div className="text-center py-20 font-bold text-red-500">Product not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
          {/* Image */}
          <div className="border border-neutral-200 rounded-md overflow-hidden bg-neutral-50">
            <img
              src={product.image || 'https://via.placeholder.com/500'}
              alt={product.name}
              className="w-full h-80 md:h-96 object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-sky-600 bg-sky-50 px-2.5 py-1 rounded">
                {product.category}
              </span>
              <h1 className="text-2xl font-black uppercase text-neutral-900 mt-3">{product.name}</h1>
              <p className="text-xl font-black text-neutral-900 mt-2">PKR {product.price?.toLocaleString()}</p>

              {product.description && (
                <div className="mt-4 text-xs font-semibold text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                  {product.description}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-neutral-950 hover:bg-sky-600 text-white py-3 text-xs font-black uppercase rounded transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🛒</span>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}