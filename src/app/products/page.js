'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();

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

  // Reusable back bar — uses next/link + router.back() so navigation stays
  // client-side (no full page reload) whether the visitor arrived from the
  // homepage, a category filter, or an external/direct link.
  const BackBar = () => (
    <div className="max-w-5xl mx-auto px-4 pt-6 flex items-center gap-4 text-xs font-bold uppercase tracking-wide">
      <button
        onClick={() => (window.history.length > 1 ? router.back() : router.push('/'))}
        className="inline-flex items-center gap-1.5 text-[#0B120D]/70 hover:text-[#A6362B] transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <span className="text-[#0B120D]/20">/</span>
      <Link href="/" className="text-[#0B120D]/70 hover:text-[#C79A44] transition-colors">
        Home
      </Link>
      {product && (
        <>
          <span className="text-[#0B120D]/20">/</span>
          <span className="text-[#0B120D]/40 truncate normal-case font-semibold tracking-normal">
            {product.name}
          </span>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] font-sans">
        <Navbar />
        <BackBar />
        <div className="text-center py-20 font-bold text-neutral-400 text-sm uppercase tracking-wide">
          Loading item details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] font-sans">
        <Navbar />
        <BackBar />
        <div className="text-center py-20">
          <p className="font-bold text-[#A6362B] text-sm uppercase tracking-wide mb-4">Product not found.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#0B120D] hover:bg-[#A6362B] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans">
      <Navbar />
      <BackBar />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-[#E8E4D9] p-6 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
          {/* Image */}
          <div className="border border-[#E8E4D9] rounded-xl overflow-hidden bg-[#F4F1EA]">
            <img
              src={product.image || 'https://via.placeholder.com/500'}
              alt={product.name}
              className="w-full h-80 md:h-96 object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A6362B] bg-[#A6362B]/10 px-2.5 py-1 rounded">
                {product.category}
              </span>
              <h1 className="text-2xl font-black uppercase text-[#0B120D] mt-3">{product.name}</h1>
              <p className="text-xl font-black text-[#0B120D] mt-2">PKR {product.price?.toLocaleString()}</p>

              {product.description && (
                <div className="mt-4 text-xs font-semibold text-neutral-600 leading-relaxed border-t border-[#F0EDE4] pt-3">
                  {product.description}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-[#0B120D] hover:bg-[#A6362B] text-white py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>🛒</span>
                <span>Add to Cart</span>
              </button>

              <Link
                href="/"
                className="w-full border border-[#E0DCD1] hover:border-[#C79A44] text-[#0B120D] py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition duration-300 flex items-center justify-center gap-2"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}