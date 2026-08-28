'use client';

import { useEffect, useState } from 'react';

function Stars({ value, onChange, size = 'text-lg' }) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === 'function';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => interactive && onChange(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${size} ${interactive ? 'cursor-pointer' : ''} ${
            n <= (hover || value) ? 'text-[#C79A44]' : 'text-neutral-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * Satisfaction stat card. Clicking it opens a modal showing customer
 * reviews (with star ratings) and lets a customer who purchased something
 * leave their own review. Backed by GET/POST /api/reviews.
 */
export default function SatisfactionReviewsCard() {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', product: '', rating: 5, comment: '' });
  const [status, setStatus] = useState('idle');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.reviews || [];
        setReviews(list);
        setAverage(
          typeof data.average === 'number'
            ? data.average
            : list.length
            ? list.reduce((s, r) => s + Number(r.rating || 0), 0) / list.length
            : null
        );
      }
    } catch (e) {
      console.error('Reviews fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      setForm({ name: '', product: '', rating: 5, comment: '' });
      loadReviews();
    } catch (err) {
      console.error('Review submit error:', err);
      setStatus('error');
    }
  };

  const displayPct = average != null ? Math.round((average / 5) * 100) : 100;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="reveal-flip group p-6 bg-white border border-[#E8E4D9] rounded-xl hover:border-[#A6362B]/30 hover:shadow-lg transition-all duration-300 text-left w-full"
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-[#A6362B]/[0.06] border border-[#A6362B]/15 flex items-center justify-center">
            <span className="font-mono text-base font-bold text-[#A6362B]">{displayPct}%</span>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#0B120D]">Satisfaction</h4>
            <p className="text-[11px] text-neutral-500 font-medium mt-1 leading-relaxed">
              {reviews.length > 0 ? `${reviews.length} customer reviews.` : 'Premium quality guaranteed.'} <span className="text-[#A6362B] font-bold">Tap to view →</span>
            </p>
          </div>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-[#A6362B] hover:bg-[#F4F1EA] transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            <h3 className="font-[family-name:var(--font-display)] text-2xl font-black uppercase text-[#0B120D] mb-1">Customer Reviews</h3>
            <div className="flex items-center gap-2 mb-6">
              <Stars value={Math.round(average || 5)} />
              <span className="text-xs text-neutral-500">{average != null ? average.toFixed(1) : '—'} / 5 ({reviews.length})</span>
            </div>

            {/* Existing reviews */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1 mb-6">
              {loading ? (
                <p className="text-xs text-neutral-400">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-neutral-400">Be the first to leave a review.</p>
              ) : (
                reviews.map((r, i) => (
                  <div key={r._id || i} className="border border-[#E8E4D9] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#0B120D]">{r.name || 'Customer'}</span>
                      <Stars value={Number(r.rating) || 0} size="text-xs" />
                    </div>
                    {r.product && <p className="text-[10px] uppercase tracking-wider text-[#A6362B] font-mono mt-1">{r.product}</p>}
                    {r.comment && <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{r.comment}</p>}
                  </div>
                ))
              )}
            </div>

            {/* New review form */}
            {status === 'success' ? (
              <p className="text-xs text-emerald-600 font-bold">Thanks! Your review has been submitted.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 border-t border-[#E8E4D9] pt-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#0B120D]">Leave a Review</p>
                <input required placeholder="Your Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-[#E8E4D9] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#A6362B]" />
                <input required placeholder="Product You Bought" value={form.product} onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
                  className="w-full border border-[#E8E4D9] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#A6362B]" />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">Rating:</span>
                  <Stars value={form.rating} onChange={(n) => setForm((f) => ({ ...f, rating: n }))} />
                </div>
                <textarea placeholder="Your experience..." rows={3} value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  className="w-full border border-[#E8E4D9] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#A6362B] resize-none" />
                {status === 'error' && <p className="text-xs text-red-600">Something went wrong. Please try again.</p>}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-[#0B120D] hover:bg-[#A6362B] text-white text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-colors disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}