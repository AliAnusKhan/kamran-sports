'use client';

import { useEffect, useState } from 'react';

const SHOP_WHATSAPP = '923123623584';

/**
 * Fast Dispatch stat card. Clicking it opens a modal form so the user can
 * request/track online delivery. Submits to POST /api/delivery-requests
 * (so it shows up on the admin panel) AND auto-opens WhatsApp to the shop's
 * number with the order details pre-filled, so the shopkeeper gets notified
 * instantly without needing to check the admin panel first.
 */
export default function FastDispatchCard() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', productCode: '', notes: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  useEffect(() => {
    if (!open || products.length) return;
    (async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.products || data.data || []);
          setProducts(items);
        }
      } catch (e) {
        console.error('Products fetch error:', e);
      }
    })();
  }, [open, products.length]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const selectedProduct = products.find(
    (p) => (p.productId || p._id) === form.productCode
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        product: selectedProduct
          ? `${selectedProduct.productId || selectedProduct._id} - ${selectedProduct.name || selectedProduct.title}`
          : form.productCode,
        notes: form.notes,
      };

      const res = await fetch('/api/delivery-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');

      // Auto-notify the shop on WhatsApp with the order details.
      const waText = encodeURIComponent(
        `New Delivery Request\n` +
        `Name: ${payload.name}\n` +
        `Phone: ${payload.phone}\n` +
        `Address: ${payload.address}, ${payload.city}\n` +
        `Product: ${payload.product || 'N/A'}\n` +
        (payload.notes ? `Notes: ${payload.notes}` : '')
      );
      window.open(`https://wa.me/${SHOP_WHATSAPP}?text=${waText}`, '_blank');

      setStatus('success');
      setForm({ name: '', phone: '', address: '', city: '', productCode: '', notes: '' });
    } catch (err) {
      console.error('Delivery request error:', err);
      setStatus('error');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setStatus('idle'); }}
        className="reveal-flip group p-6 bg-white border border-[#E8E4D9] rounded-xl hover:border-[#A6362B]/30 hover:shadow-lg transition-all duration-300 text-left w-full"
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-[#A6362B]/[0.06] border border-[#A6362B]/15 flex items-center justify-center">
            <span className="font-mono text-base font-bold text-[#A6362B]">24H</span>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#0B120D]">Fast Dispatch</h4>
            <p className="text-[11px] text-neutral-500 font-medium mt-1 leading-relaxed">
              Nationwide delivery with real-time tracking across Pakistan. <span className="text-[#A6362B] font-bold">Tap to request →</span>
            </p>
          </div>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-[#A6362B] hover:bg-[#F4F1EA] transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-2xl">✓</div>
                <h3 className="font-bold text-lg text-[#0B120D]">Request Received</h3>
                <p className="text-sm text-neutral-500 mt-2">
                  We've opened WhatsApp for you — just hit send so our team can confirm your delivery right away.
                </p>
                <button onClick={() => setOpen(false)} className="mt-6 bg-[#0B120D] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl">
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-black uppercase text-[#0B120D] mb-1">Request Delivery</h3>
                <p className="text-xs text-neutral-500 mb-6">Fill your details and our team will dispatch your order within 24 hours.</p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input required placeholder="Full Name" value={form.name} onChange={update('name')}
                    className="w-full border border-[#E8E4D9] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#A6362B]" />
                  <input required placeholder="Phone Number" value={form.phone} onChange={update('phone')}
                    className="w-full border border-[#E8E4D9] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#A6362B]" />
                  <input required placeholder="Delivery Address" value={form.address} onChange={update('address')}
                    className="w-full border border-[#E8E4D9] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#A6362B]" />
                  <input required placeholder="City" value={form.city} onChange={update('city')}
                    className="w-full border border-[#E8E4D9] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#A6362B]" />

                  <select
                    value={form.productCode}
                    onChange={update('productCode')}
                    className="w-full border border-[#E8E4D9] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#A6362B] bg-white"
                  >
                    <option value="">Select Product Code (optional)</option>
                    {products.map((p) => (
                      <option key={p._id} value={p.productId || p._id}>
                        {(p.productId ? `${p.productId} — ` : '')}{p.name || p.title}
                      </option>
                    ))}
                  </select>

                  <textarea placeholder="Notes (optional)" value={form.notes} onChange={update('notes')} rows={3}
                    className="w-full border border-[#E8E4D9] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#A6362B] resize-none" />

                  {status === 'error' && (
                    <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-[#0B120D] hover:bg-[#A6362B] text-white text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {status === 'submitting' ? 'Sending...' : 'Submit Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}