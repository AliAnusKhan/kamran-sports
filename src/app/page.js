'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SplashScreen from '@/components/SplashScreen';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useCart } from '@/context/CartContext';
// Fonts, design tokens, and every keyframe/utility class used below (reveal,
// tilt-card, sheen, magnetic-btn, seam-anim, cart-bounce, nav-dropdown, etc.)
// live in this single stylesheet. Keeping it as a real CSS import — instead
// of a styled-jsx <style> tag — avoids the dev-mode hydration mismatch that
// styled-jsx's scope-id can produce (server/client compiling the same
// component to different "jsx-xxxx" class hashes).
import './motion.css';

const PHONE_NUMBER = '923123623584';

/* Cricket-ball seam divider, kept as the site's signature motif */
function SeamStitch({ className = '', color = '#A6362B', opacity = 0.9, animated = false }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 10"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 5 Q 12.5 1, 25 5 T 50 5 T 75 5 T 100 5 T 125 5 T 150 5 T 175 5 T 200 5 T 225 5 T 250 5 T 275 5 T 300 5 T 325 5 T 350 5 T 375 5 T 400 5"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeDasharray="2.5 5"
        strokeLinecap="round"
        opacity={opacity}
        className={animated ? 'seam-anim' : ''}
      />
    </svg>
  );
}

/* A small CSS-only "3D" cricket ball used as an ambient hero prop */
function CricketBallOrb({ className = '', size = 120 }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 32% 28%, #d8503f 0%, #a6362b 42%, #6e211a 78%, #4a1611 100%)',
        boxShadow: '0 30px 60px -20px rgba(166,54,43,0.55), inset -10px -14px 24px rgba(0,0,0,0.45), inset 8px 10px 16px rgba(255,255,255,0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <path d="M50 2 Q 30 25 30 50 Q 30 75 50 98" stroke="#f1efe6" strokeWidth="1.6" fill="none" strokeDasharray="2 3" opacity="0.85" />
        <path d="M50 2 Q 70 25 70 50 Q 70 75 50 98" stroke="#f1efe6" strokeWidth="1.6" fill="none" strokeDasharray="2 3" opacity="0.85" />
      </svg>
    </div>
  );
}

/* Reveal-on-scroll wrapper using IntersectionObserver (no extra deps).
   IMPORTANT: takes a deps array so it re-scans the DOM after the product
   grid actually renders. Product cards don't exist yet on first mount
   (they're still "loading"), so an empty deps array here would observe
   zero cards and they'd sit at opacity:0 forever — that's what made the
   images disappear. Re-running once `loading`/the product list settles
   picks up the newly rendered .reveal cards. */
function useRevealObserver(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-flip');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* Lightweight count-up for the scorecard strip numbers */
function useCountUp(ref, target, { duration = 1400, decimals = 0 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof target !== 'number') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toString();
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, target, duration, decimals]);
}

/* Imperative 3D tilt — mutates transform directly on the hovered node so
   hovering never triggers a React re-render. Skipped on touch devices
   and when the user prefers reduced motion. */
function useTiltHandlers({ max = 10, scale = 1.02 } = {}) {
  const enabled = useRef(true);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    enabled.current = !coarse && !reduced;
  }, []);

  const onMouseMove = useCallback(
    (e) => {
      if (!enabled.current) return;
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rotY = px * max * 2;
      const rotX = -py * max * 2;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
      card.style.boxShadow = `${-rotY}px ${18 - rotX}px 34px -12px rgba(11,18,13,0.35)`;
    },
    [max, scale]
  );

  const onMouseLeave = useCallback((e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    card.style.boxShadow = '';
  }, []);

  return { onMouseMove, onMouseLeave };
}

/* One scorecard stat, with count-up + flip-in reveal */
function StatCard({ index, value, suffix, label, copy }) {
  const numRef = useRef(null);
  const numeric = parseFloat(value);
  const hasNumber = !isNaN(numeric);
  useCountUp(numRef, hasNumber ? numeric : null);

  return (
    <div
      className="reveal-flip p-5 flex items-center gap-4 bg-[#F1EFE6] border border-[#D9D4C4] rounded-lg hover:border-[#A6362B]/50 hover:shadow-lg transition-shadow duration-300"
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[#A6362B] shrink-0 tabular-nums border border-[#A6362B]/30 rounded px-2 py-1 min-w-[64px] text-center">
        {hasNumber ? (
          <>
            <span ref={numRef}>0</span>
            {suffix}
          </>
        ) : (
          value
        )}
      </div>
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-[#0B120D]">{label}</h4>
        <p className="text-[11px] text-neutral-500 font-medium mt-0.5">{copy}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [batTypeFilter, setBatTypeFilter] = useState('All');
  const [ballTypeFilter, setBallTypeFilter] = useState('All');
  const [gloveTypeFilter, setGloveTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bouncingId, setBouncingId] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  const heroRef = useRef(null);
  const layerBackRef = useRef(null);
  const layerMidRef = useRef(null);
  const labelPanelRef = useRef(null);

  const tilt = useTiltHandlers({ max: 9, scale: 1.03 });
  const panelTilt = useTiltHandlers({ max: 6, scale: 1.0 });

  useRevealObserver([loading, products.length, activeCategory, searchTerm, batTypeFilter, ballTypeFilter, gloveTypeFilter]);

  const slides = [
    {
      badge: 'CRAFTED FOR CHAMPIONS',
      title: 'TIMELESS POWER. MADE TO PERFORM.',
      subtitle:
        'Grade-1 English willow and premium tape-ball bats, hand-finished for power, precision, and perfect balance.',
      tag: 'MASTER EDITION',
      tagSub: 'Est. Karachi',
    },
    {
      badge: 'PRO PROTECTION GEAR',
      title: 'LIGHTWEIGHT & UNMATCHED COMFORT.',
      subtitle:
        'Full impact protection with ultra-light ergonomics, built for uninterrupted long innings.',
      tag: 'PRO APPROVED',
      tagSub: 'Match-ready',
    },
    {
      badge: 'EXPERT CRAFTSMANSHIP',
      title: 'MASTER BAT REPAIR & REGROOVING.',
      subtitle:
        'Give your favourite bat a second life — expert knocking, toe guarding, and thread binding.',
      tag: 'HERITAGE CARE',
      tagSub: 'Since day one',
    },
  ];

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();

        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data.data)) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Ambient parallax for the hero art layers — imperative, rAF-throttled,
  // and disabled for touch / reduced-motion users.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduced) return;

    let raf = null;
    const handleMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        if (layerBackRef.current) {
          layerBackRef.current.style.transform = `translate3d(${px * -26}px, ${py * -18}px, 0)`;
        }
        if (layerMidRef.current) {
          layerMidRef.current.style.transform = `translate3d(${px * 18}px, ${py * 14}px, 0) rotate(${px * 6}deg)`;
        }
        raf = null;
      });
    };
    hero.addEventListener('mousemove', handleMove);
    return () => hero.removeEventListener('mousemove', handleMove);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setBouncingId(product._id);
    setAddedId(product._id);
    window.setTimeout(() => setBouncingId(null), 450);
    window.setTimeout(() => setAddedId(null), 1100);
  };

  const filteredProducts = products.filter((p) => {
    const pCategory = (p.category || '').toLowerCase();
    const activeCat = activeCategory.toLowerCase();

    // Category Filter
    let matchesCategory = activeCategory === 'All' || pCategory === activeCat;

    // Sub-type Filters
    if (activeCategory === 'Cricket Bats' && batTypeFilter !== 'All') {
      const pType = (p.type || p.subCategory || '').toLowerCase();
      matchesCategory = matchesCategory && pType.includes(batTypeFilter.toLowerCase());
    }

    if (activeCategory === 'Balls' && ballTypeFilter !== 'All') {
      const pType = (p.type || p.subCategory || '').toLowerCase();
      matchesCategory = matchesCategory && pType.includes(ballTypeFilter.toLowerCase());
    }

    if (activeCategory === 'Gloves' && gloveTypeFilter !== 'All') {
      const pType = (p.type || p.subCategory || '').toLowerCase();
      matchesCategory = matchesCategory && pType.includes(gloveTypeFilter.toLowerCase());
    }

    // Live Search Filter (Title / Name / Category)
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.title && p.title.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Grain texture sits above everything for a tactile, leather-like finish */}
      <svg className="grain-overlay" aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      <div className="min-h-screen bg-[#F1EFE6] font-[family-name:var(--font-body)] text-[#0B120D] flex flex-col justify-between overflow-x-hidden">
        <div>
          <Navbar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            setBatTypeFilter={setBatTypeFilter}
            setBallTypeFilter={setBallTypeFilter}
            setGloveTypeFilter={setGloveTypeFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* HERO SECTION */}
          <section
            ref={heroRef}
            className="relative bg-[#0B120D] text-white overflow-hidden py-16 sm:py-24 px-4 sm:px-8"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#C79A44_1px,transparent_1px)] [background-size:28px_28px]" />

            {/* Ambient parallax art: distant glow + floating ball */}
            <div
              ref={layerBackRef}
              className="absolute -top-10 -right-10 sm:top-0 sm:right-0 pointer-events-none"
              style={{ transition: 'transform 0.2s ease-out' }}
              aria-hidden="true"
            >
              <div
                className="w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(199,154,68,0.25), transparent 70%)', animation: 'pulseGlow 6s ease-in-out infinite' }}
              />
            </div>
            <div
              ref={layerMidRef}
              className="hidden sm:block absolute top-10 right-10 lg:right-24 pointer-events-none"
              style={{ transition: 'transform 0.2s ease-out', animation: 'floatY 7s ease-in-out infinite', '--float-rot': '-8deg' }}
              aria-hidden="true"
            >
              <CricketBallOrb size={128} />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-5 max-w-2xl text-center md:text-left">
                <span className="inline-block text-[#C79A44] text-[10px] sm:text-xs font-[family-name:var(--font-mono)] font-medium uppercase tracking-[0.3em]">
                  {slides[currentSlide].badge}
                </span>
                <h1
                  key={currentSlide}
                  className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] text-white"
                  style={{ animation: 'fadeUp 0.6s var(--ease-out-expo)' }}
                >
                  {slides[currentSlide].title}
                </h1>
                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto md:mx-0">
                  {slides[currentSlide].subtitle}
                </p>

                <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
                  <a
                    href="#collection"
                    className="magnetic-btn bg-[#A6362B] hover:bg-[#8C2C22] hover:shadow-[0_10px_28px_-8px_rgba(166,54,43,0.65)] text-white font-semibold text-xs uppercase tracking-widest px-7 py-3.5 transition-all shadow-lg active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C79A44]"
                  >
                    Shop collection
                  </a>
                  <a
                    href="#heritage"
                    className="magnetic-btn border border-neutral-700 hover:border-[#C79A44] hover:text-[#C79A44] text-white font-semibold text-xs uppercase tracking-widest px-7 py-3.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C79A44]"
                  >
                    Explore craft
                  </a>
                </div>
              </div>

              <div
                ref={labelPanelRef}
                onMouseMove={panelTilt.onMouseMove}
                onMouseLeave={panelTilt.onMouseLeave}
                className="tilt-card relative bg-[#141B15] border border-[#C79A44]/30 p-8 text-center min-w-[240px] hidden md:block"
              >
                <span className="absolute -top-2 left-6 bg-[#141B15] px-2 text-[9px] font-[family-name:var(--font-mono)] text-[#C79A44] uppercase tracking-[0.25em]">
                  On the label
                </span>
                <div className="font-[family-name:var(--font-display)] text-2xl font-black text-[#C79A44] tracking-widest uppercase">
                  {slides[currentSlide].tag}
                </div>
                <div className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-neutral-400 mt-2">
                  {slides[currentSlide].tagSub} · Kamran Sports
                </div>
              </div>
            </div>

            <div
              className="flex justify-center md:justify-start max-w-7xl mx-auto gap-2.5 mt-10 relative z-10"
              role="tablist"
              aria-label="Hero slides"
            >
              {slides.map((slide, idx) => (
                <button
                  key={slide.tag}
                  role="tab"
                  aria-selected={currentSlide === idx}
                  aria-label={`Slide ${idx + 1}: ${slide.badge}`}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 transition-all duration-300 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C79A44] ${
                    currentSlide === idx ? 'w-10 bg-[#C79A44]' : 'w-3 bg-neutral-800 hover:bg-neutral-600'
                  }`}
                />
              ))}
            </div>

            <SeamStitch className="absolute bottom-0 left-0 w-full h-2.5" color="#A6362B" opacity={0.6} animated />
          </section>

          {/* SCORECARD STRIP */}
          <section className="bg-white border-b border-[#D9D4C4] py-8 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard index={0} value="1" suffix="" label="Grade-1" copy="Handcrafted willow and refined specs." />
              <StatCard index={1} value="COD" label="Cash on delivery" copy="Convenient doorstep ordering across Pakistan." />
              <StatCard index={2} value="24" suffix="–48H" label="Fast dispatch" copy="Safe packaging with real-time tracking." />
            </div>
          </section>

          {/* PRODUCT GRID */}
          <main id="collection" className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
            <div className="reveal text-center mb-12 space-y-3">
              <span className="text-[10px] font-[family-name:var(--font-mono)] font-medium uppercase tracking-[0.3em] text-[#A6362B]">
                {searchTerm ? 'Search Results' : 'The collection'}
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0B120D]">
                {searchTerm
                  ? `Showing results for "${searchTerm}"`
                  : activeCategory === 'All'
                  ? 'Designed for every match'
                  : activeCategory}
              </h2>
              <SeamStitch className="w-16 h-2.5 mx-auto" color="#A6362B" />
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="relative bg-[#E4E1D5] h-80 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)',
                        animation: 'shimmerSweep 1.6s ease-in-out infinite',
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="reveal text-center py-20 bg-white rounded-lg border border-[#D9D4C4] p-8 space-y-3">
                <p className="text-neutral-600 font-semibold text-xs uppercase tracking-wider">
                  {searchTerm
                    ? `No gear found matching "${searchTerm}"`
                    : `No gear currently available in "${activeCategory}"`}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs text-[#A6362B] underline font-medium hover:text-[#0B120D] transition"
                  >
                    Clear search term
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7" style={{ perspective: '1400px' }}>
                {filteredProducts.map((product, i) => (
                  <div
                    key={product._id}
                    onMouseMove={tilt.onMouseMove}
                    onMouseLeave={tilt.onMouseLeave}
                    className="tilt-card reveal group relative bg-white border border-[#D9D4C4] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#0B120D]"
                    style={{ transitionDelay: `${(i % 8) * 60}ms` }}
                  >
                    <div className="sheen" aria-hidden="true" />
                    <div>
                      <Link
                        href={`/products/${product._id}`}
                        className="block relative bg-[#F1EFE6] aspect-square overflow-hidden border-b border-[#D9D4C4]"
                        style={{ transform: 'translateZ(20px)' }}
                      >
                        <span className="absolute top-3 left-3 z-10 bg-[#A6362B] text-white text-[8px] sm:text-[9px] font-[family-name:var(--font-mono)] font-semibold uppercase px-2.5 py-1 tracking-widest rounded-sm shadow-sm">
                          {product.category || 'Gear'}
                        </span>

                        <img
                          src={product.image || 'https://via.placeholder.com/400'}
                          alt={product.name || product.title || 'Product image'}
                          className="w-full h-full object-cover group-hover:scale-105 motion-reduce:transform-none transition-transform duration-700 ease-out"
                        />
                      </Link>

                      <div className="p-4 text-center flex flex-col justify-between" style={{ transform: 'translateZ(12px)' }}>
                        <Link href={`/products/${product._id}`}>
                          <h3 className="font-semibold text-xs sm:text-sm text-[#0B120D] line-clamp-1 group-hover:text-[#A6362B] transition-colors">
                            {product.name || product.title}
                          </h3>
                        </Link>
                        <div className="mt-2 font-[family-name:var(--font-mono)] text-sm sm:text-base font-bold text-[#0B120D]">
                          Rs. {product.price ? product.price.toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0" style={{ transform: 'translateZ(12px)' }}>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addedId === product._id}
                        className={`magnetic-btn w-full text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider py-2.5 rounded-sm transition-colors duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C79A44] ${
                          addedId === product._id ? 'bg-[#3F6B3F]' : 'bg-[#0B120D] hover:bg-[#A6362B]'
                        } ${bouncingId === product._id ? 'cart-bounce' : ''}`}
                      >
                        {addedId === product._id ? 'Added ✓' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* HERITAGE & CRAFT SECTION */}
          <section id="heritage" className="bg-[#0B120D] text-white py-16 px-4 sm:px-8 border-t border-[#D9D4C4]/20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="reveal space-y-4">
                <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#C79A44] uppercase tracking-[0.3em]">
                  Heritage & Craftsmanship
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-black uppercase tracking-tight">
                  Hand-Pressed Willow. Built for Match Winners.
                </h2>
                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                  Based in Karachi, Kamran Sports brings decades of specialized bat pressing, grain selection, and weight distribution mastery directly to your game. From hardball matches to intense tapeball tournaments, every piece is tuned for durability and maximal sweet-spot response.
                </p>
              </div>
              <div
                onMouseMove={panelTilt.onMouseMove}
                onMouseLeave={panelTilt.onMouseLeave}
                className="tilt-card reveal bg-[#141B15] border border-[#C79A44]/30 p-6 sm:p-8 rounded-lg space-y-4"
                style={{ transitionDelay: '120ms' }}
              >
                <div className="font-[family-name:var(--font-display)] text-2xl text-[#C79A44] font-black uppercase tracking-wide">
                  Bat Repair & Custom Services
                </div>
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                  Extend the life of your prized willow with our custom repair services: toe guarding, thread binding, custom grip application, and professional knocking.
                </p>
                <a
                  href={`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent('Hi Kamran Sports, I am interested in bat repair and custom services.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="magnetic-btn inline-block bg-[#A6362B] hover:bg-[#8C2C22] text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-sm transition-colors"
                >
                  Inquire via WhatsApp
                </a>
              </div>
            </div>
          </section>
        </div>

        <Footer />
        <WhatsAppButton phoneNumber={PHONE_NUMBER} />
      </div>
    </>
  );
}