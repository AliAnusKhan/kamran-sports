'use client';

import { useEffect, useState } from 'react';

/**
 * Replaces the old "Grade-1 Willow" stat box (the one showing a static "1").
 * Fetches willow images managed from the admin panel via /api/willow-gallery
 * and rotates them inside the same small square that used to hold the "1".
 *
 * ADMIN PANEL TODO:
 * Add a simple CRUD screen in your admin panel that lets you upload/delete
 * images into a "willowGallery" collection, and expose it at /api/willow-gallery
 * (GET returns { images: [{ _id, url }] }).
 */
export default function WillowShowcaseCard() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/willow-gallery', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.images || [];
          if (!cancelled && items.length) setImages(items);
        }
      } catch (e) {
        console.error('Willow gallery fetch error:', e);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images.length]);

  const activeImg = images[current]?.url || images[current]?.image;

  return (
    <div className="reveal-flip group p-6 bg-white border border-[#E8E4D9] rounded-xl hover:border-[#A6362B]/30 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="shrink-0 relative w-12 h-12 rounded-xl overflow-hidden bg-[#A6362B]/[0.06] border border-[#A6362B]/15">
          {activeImg ? (
            images.map((img, i) => (
              <img
                key={img._id || i}
                src={img.url || img.image}
                alt="Willow"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  i === current ? 'opacity-100' : 'opacity-0'
                }`}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ))
          ) : (
            <span className="w-full h-full flex items-center justify-center font-mono text-base font-bold text-[#A6362B]">1</span>
          )}
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#0B120D]">Grade-1 Willow</h4>
          <p className="text-[11px] text-neutral-500 font-medium mt-1 leading-relaxed">
            Hand-selected English &amp; Kashmir willow, pressed and shaped by master craftsmen.
          </p>
        </div>
      </div>
    </div>
  );
}