'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SplashScreen from '@/components/SplashScreen';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

// Updated: Bracket `{}` k sath import kar diya gaya hai 
// taake agar aap ki component files mein 'export function' use hua ho to error na aaye
import  WillowShowcaseCard  from '@/components/WillowShowcaseCard';
import FastDispatchCard  from '@/components/FastDispatchCard';
import  SatisfactionReviewsCard  from '@/components/SatisfactionReviewsCard';

import { useCart } from '@/context/CartContext';
import './motion.css';

const PHONE_NUMBER = '923123623584';

/* ═══════════════════════════════════════════
   DEFAULT FALLBACK DATA
═══════════════════════════════════════════ */
const DEFAULT_HERO_SLIDES = [
  {
    _id: 'hero-1',
    badge: 'CRAFTED FOR CHAMPIONS',
    title: 'English Willow\nMaster Edition',
    subtitle: 'Hand-pressed Grade 1 willow bats. Limited drop — only 50 pieces crafted this season.',
    cta: 'Shop Bats',
    link: '#collection',
    image: '/hero/slide-bat.jpg',
  },
  {
    _id: 'hero-2',
    badge: 'PRO GEAR',
    title: 'Armor Up\nFor Battle',
    subtitle: 'Professional pads, gloves & helmets. Lightweight protection trusted by international players.',
    cta: 'Shop Protection',
    link: '#collection',
    image: '/hero/slide-protection.jpg',
  },
  {
    _id: 'hero-3',
    badge: 'ALL SPORTS',
    title: 'Beyond The\nBoundary',
    subtitle: 'Football, swimming, indoor games — complete sporting destination under one roof.',
    cta: 'Explore All',
    link: '#collection',
    image: '/hero/slide-multi.jpg',
  },
  {
    _id: 'hero-4',
    badge: 'STEP UP YOUR GAME',
    title: 'Spike Into\nAction',
    subtitle: 'Cricket & football footwear engineered for grip, speed and support on any pitch.',
    cta: 'Shop Footwear',
    link: '#collection',
    image: '/hero/slide-footwear.jpg',
  },
  {
    _id: 'hero-5',
    badge: 'GIFT A LEGEND',
    title: 'Kits Built\nFor Teams',
    subtitle: 'Bulk team kits, custom jerseys and accessories — outfit your whole squad in one order.',
    cta: 'Shop Team Kits',
    link: '#collection',
    image: '/hero/slide-team.jpg',
  },
];

const DEFAULT_CHAMPIONS = [
  { _id: 'c1', name: 'Babar Azam', role: 'Captain Pakistan', image: '/champions/babar.jpg' },
  { _id: 'c2', name: 'Shaheen Afridi', role: 'Fast Bowler', image: '/champions/shaheen.jpg' },
  { _id: 'c3', name: 'Mohammad Rizwan', role: 'Wicket Keeper', image: '/champions/rizwan.jpg' },
  { _id: 'c4', name: 'Shadab Khan', role: 'All Rounder', image: '/champions/shadab.jpg' },
];

const DEFAULT_TAPEBALL_STARS = [
  { _id: 't1', name: 'Asif Ali', role: 'Tapeball King', location: 'Karachi', image: '/tapeball-stars/asif.jpg' },
  { _id: 't2', name: 'Nadeem Khan', role: 'Hard Hitter', location: 'Lahore', image: '/tapeball-stars/nadeem.jpg' },
  { _id: 't3', name: 'Faisal Sixer', role: 'Six Hitter', location: 'Rawalpindi', image: '/tapeball-stars/faisal.jpg' },
  { _id: 't4', name: 'Bilal Yorker', role: 'Yorker Specialist', location: 'Faisalabad', image: '/tapeball-stars/bilal.jpg' },
];

const FEATURED_CATEGORIES_LIST = [
  { name: 'Cricket Bats', key: 'bat', accent: '#A6362B' },
  { name: 'Protection', key: 'protect', accent: '#C79A44' },
  { name: 'Footwear', key: 'shoe', accent: '#0B120D' },
  { name: 'Caps & Hats', key: 'cap', accent: '#A6362B' },
  { name: 'T-Shirts', key: 'shirt', accent: '#C79A44' },
  { name: 'Trousers', key: 'trouser', accent: '#0B120D' },
  { name: 'Indoor Games', key: 'indoor', accent: '#A6362B' },
];

const HERITAGE_BADGES = [
  'Custom Willow Pressing',
  'Nationwide Cash on Delivery',
  '24H Fast Dispatch',
];

const GRAIN_TEXTURE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/* ═══════════════════════════════════════════
   UTILITY COMPONENTS
═══════════════════════════════════════════ */
function SeamStitch({ className = '', color = '#A6362B', opacity = 0.9 }) {
  return (
    <svg className={className} viewBox="0 0 400 10" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 5 Q 12.5 1, 25 5 T 50 5 T 75 5 T 100 5 T 125 5 T 150 5 T 175 5 T 200 5 T 225 5 T 250 5 T 275 5 T 300 5 T 325 5 T 350 5 T 375 5 T 400 5"
        stroke={color} strokeWidth="1.4" fill="none" strokeDasharray="2.5 5" strokeLinecap="round" opacity={opacity} />
    </svg>
  );
}

function SeamCircle({ className = '', color = '#C79A44', opacity = 0.7 }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="47" fill="none" stroke={color} strokeWidth="1.2" opacity={opacity * 0.5} />
      <path
        d="M50 6 Q 58 25 50 44 T 50 82 T 50 94"
        fill="none" stroke={color} strokeWidth="1.4" strokeDasharray="2.2 4" strokeLinecap="round" opacity={opacity}
      />
    </svg>
  );
}

function Icon({ path, className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  arrowRight: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
  location: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
};

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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, deps);
}

function useCountUp(ref, target, { duration = 1400 } = {}) {
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
            el.textContent = Math.round(target * eased).toString();
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
  }, [ref, target, duration]);
}

function StatCard({ index, value, suffix, label, copy }) {
  const numRef = useRef(null);
  const numeric = parseFloat(value);
  const hasNumber = !isNaN(numeric);
  useCountUp(numRef, hasNumber ? numeric : null);

  return (
    <div className="reveal-flip group p-6 bg-white border border-[#E8E4D9] rounded-xl hover:border-[#A6362B]/30 hover:shadow-lg transition-all duration-300" style={{ transitionDelay: `${index * 90}ms` }}>
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-[#A6362B]/[0.06] border border-[#A6362B]/15 flex items-center justify-center">
          <span className="font-mono text-base font-bold text-[#A6362B]">
            {hasNumber ? <span ref={numRef}>0</span> : value}{suffix}
          </span>
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#0B120D]">{label}</h4>
          <p className="text-[11px] text-neutral-500 font-medium mt-1 leading-relaxed">{copy}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DYNAMIC CATEGORY SLIDER CARD COMPONENT
═══════════════════════════════════════════ */
function DynamicCategoryCard({ cat, products, onSelect, index }) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const matchingProducts = products.filter((p) => {
    const pCat = (p.category || '').toLowerCase();
    const pSub = (p.subCategory || p.type || '').toLowerCase();
    const pTitle = (p.name || p.title || '').toLowerCase();
    const fullText = `${pCat} ${pSub} ${pTitle}`;
    const kw = cat.key.toLowerCase();

    if (kw === 'cap') return fullText.includes('cap') || fullText.includes('hat');
    if (kw === 'shirt') return fullText.includes('shirt') || fullText.includes('t-shirt') || fullText.includes('jersey') || fullText.includes('apparel');
    if (kw === 'trouser') return fullText.includes('trouser') || fullText.includes('pant') || fullText.includes('tracksuit') || fullText.includes('lower');
    if (kw === 'indoor') return fullText.includes('indoor') || fullText.includes('board') || fullText.includes('ludo') || fullText.includes('carrom') || fullText.includes('chess') || fullText.includes('table tennis');
    if (kw === 'shoe') return fullText.includes('shoe') || fullText.includes('spike') || fullText.includes('footwear');
    if (kw === 'protect') return fullText.includes('protect') || fullText.includes('pad') || fullText.includes('helmet') || fullText.includes('glove') || fullText.includes('guard');
    if (kw === 'bat') return (fullText.includes('bat') || fullText.includes('willow')) && !fullText.includes('glove') && !fullText.includes('pad');

    return fullText.includes(kw);
  });

  const categoryImages = matchingProducts
    .flatMap((p) => [p.image, ...(Array.isArray(p.images) ? p.images : [])])
    .filter(Boolean);

  const fallbackImg = `https://placehold.co/600x800/F4F1EA/0B120D?text=${encodeURIComponent(cat.name)}`;
  const displayImages = categoryImages.length > 0 ? categoryImages : [fallbackImg];

  useEffect(() => {
    if (displayImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIdx((prev) => (prev + 1) % displayImages.length);
    }, 10000 + (index % 3) * 1000);

    return () => clearInterval(interval);
  }, [displayImages.length, index]);

  return (
    <div
      onClick={() => onSelect(cat.name)}
      className="reveal group relative h-80 sm:h-[26rem] overflow-hidden cursor-pointer rounded-2xl border border-[#E8E4D9] shadow-sm hover:shadow-2xl transition-all duration-500"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {displayImages.map((imgUrl, imgI) => (
        <img
          key={imgI}
          src={imgUrl}
          alt={cat.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ease-out ${
            imgI === currentImgIdx ? 'opacity-100 z-0' : 'opacity-0 z-0'
          }`}
          onError={(e) => {
            e.target.src = fallbackImg;
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0B120D] via-[#0B120D]/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity z-10" />

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
        <div className="w-12 h-1 mb-3 transition-all duration-300 group-hover:w-20" style={{ backgroundColor: cat.accent }} />
        <h3 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1">
          {cat.name}
        </h3>
        <p className="text-xs font-mono uppercase tracking-wider text-white/70">
          {matchingProducts.length} Products
        </p>
      </div>

      {displayImages.length > 1 && (
        <div className="absolute top-4 left-4 z-20 flex gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
          {displayImages.slice(0, 6).map((_, dotIdx) => (
            <div
              key={dotIdx}
              className={`h-1 rounded-full transition-all duration-500 ${
                dotIdx === currentImgIdx % Math.min(displayImages.length, 6)
                  ? 'w-4 bg-[#C79A44]'
                  : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 backdrop-blur-sm bg-white/10 z-20">
        <Icon path={ICONS.arrowRight} className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DOMINANT COLOR EXTRACTION
═══════════════════════════════════════════ */
function useDominantColors(imageUrls) {
  const cacheRef = useRef({});
  const [, bump] = useState(0);

  useEffect(() => {
    let cancelled = false;

    imageUrls.forEach((src, idx) => {
      if (!src || cacheRef.current[idx]) return;

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (cancelled) return;
        try {
          const size = 24;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, size, size);
          const data = ctx.getImageData(0, 0, size, size).data;

          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 128) continue;
            r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
          }
          if (!n) return;
          r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);

          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          const boost = max - min < 40 ? 1 : 1.15;
          const avg = (r + g + b) / 3;
          r = Math.min(255, Math.max(0, Math.round(avg + (r - avg) * boost)));
          g = Math.min(255, Math.max(0, Math.round(avg + (g - avg) * boost)));
          b = Math.min(255, Math.max(0, Math.round(avg + (b - avg) * boost)));

          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          cacheRef.current[idx] = { rgb: `${r}, ${g}, ${b}`, luminance };
          if (!cancelled) bump((n2) => n2 + 1);
        } catch (err) {
          // Cross-origin image tainted the canvas
        }
      };
      img.onerror = () => {};
      img.src = src;
    });

    return () => { cancelled = true; };
  }, [imageUrls]);

  return cacheRef.current;
}

/* ═══════════════════════════════════════════
   MAIN HOME CONTENT
═══════════════════════════════════════════ */
function HomeContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState([]);
  const [heroSlides, setHeroSlides] = useState(DEFAULT_HERO_SLIDES);
  const [champions, setChampions] = useState(DEFAULT_CHAMPIONS);
  const [tapeballStars, setTapeballStars] = useState(DEFAULT_TAPEBALL_STARS);

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

  const searchParams = useSearchParams();
  const heroRef = useRef(null);

  const heroImageUrls = useMemo(
    () => heroSlides.map((s) => s.image || s.imageUrl),
    [heroSlides]
  );
  const slideAccents = useDominantColors(heroImageUrls);

  useEffect(() => {
    const urlCategory = searchParams.get('category') || searchParams.get('cat');
    const urlSubCategory = searchParams.get('subcategory') || searchParams.get('sub');
    const urlSearch = searchParams.get('search') || searchParams.get('q');

    if (urlSubCategory) {
      setActiveCategory(urlSubCategory);
    } else if (urlCategory) {
      setActiveCategory(urlCategory);
    }

    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  useRevealObserver([loading, products.length, activeCategory, searchTerm]);

  const handleCategorySelect = (categoryName) => {
    setActiveCategory(categoryName);
    setTimeout(() => {
      const collectionSection = document.getElementById('collection');
      if (collectionSection) {
        collectionSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleExploreStar = (starName) => {
    if (!starName) return;
    setSearchTerm(starName);
    setTimeout(() => {
      const collectionSection = document.getElementById('collection');
      if (collectionSection) {
        collectionSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    if (paused || heroSlides.length === 0) return;
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % heroSlides.length), 6000);
    return () => clearInterval(timer);
  }, [paused, heroSlides.length]);

  useEffect(() => {
    async function fetchPageData() {
      try {
        setLoading(true);

        try {
          const resProd = await fetch('/api/products', { cache: 'no-store' });
          if (resProd.ok) {
            const data = await resProd.json();
            const items = Array.isArray(data) ? data : (data.products || data.data || []);
            setProducts(items);
          }
        } catch (e) {
          console.error('Products fetch error:', e);
        }

        try {
          const resHero = await fetch('/api/hero-slides', { cache: 'no-store' });
          if (resHero.ok) {
            const heroData = await resHero.json();
            const slides = Array.isArray(heroData) ? heroData : (heroData.slides || heroData.data || []);
            if (slides && slides.length > 0) setHeroSlides(slides);
          }
        } catch (e) {
          console.error('Hero slides fetch error:', e);
        }

        try {
          const resChamp = await fetch('/api/champions', { cache: 'no-store' });
          if (resChamp.ok) {
            const champData = await resChamp.json();
            const champs = Array.isArray(champData) ? champData : (champData.champions || champData.data || []);
            if (champs && champs.length > 0) setChampions(champs);
          }
        } catch (e) {
          console.error('Champions fetch error:', e);
        }

        try {
          let resTape = await fetch('/api/tapeball-stars', { cache: 'no-store' });
          if (!resTape.ok) resTape = await fetch('/api/tapeball', { cache: 'no-store' });

          if (resTape.ok) {
            const tapeData = await resTape.json();
            const stars = Array.isArray(tapeData)
              ? tapeData
              : (tapeData.tapeballStars || tapeData.tapeBallStars || tapeData.tapeball_stars || tapeData.stars || tapeData.data || tapeData.tapeball || tapeData.players || tapeData.items || []);

            if (Array.isArray(stars) && stars.length > 0) {
              setTapeballStars(stars);
            }
          }
        } catch (e) {
          console.error('Tapeball stars fetch error:', e);
        }

      } catch (err) {
        console.error('Data loading error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPageData();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setBouncingId(product._id);
    setAddedId(product._id);
    window.setTimeout(() => setBouncingId(null), 450);
    window.setTimeout(() => setAddedId(null), 1100);
  };

  const isFiltered =
    activeCategory !== 'All' ||
    searchTerm.trim() !== '' ||
    batTypeFilter !== 'All' ||
    ballTypeFilter !== 'All' ||
    gloveTypeFilter !== 'All';

  const filteredProducts = products.filter((p) => {
    const pCat = (p.category || '').toLowerCase().trim();
    const pSub = (p.subCategory || p.type || '').toLowerCase().trim();
    const pTitle = (p.name || p.title || '').toLowerCase().trim();
    const pDesc = (p.description || '').toLowerCase().trim();
    const fullText = `${pCat} ${pSub} ${pTitle} ${pDesc}`;
    const activeCat = activeCategory.toLowerCase().trim();

    const query = searchTerm.trim().toLowerCase();
    if (query && !fullText.includes(query)) return false;

    if (activeCategory === 'All') return true;

    if (activeCategory === 'Cricket Bats' && batTypeFilter !== 'All') {
      if (!fullText.includes(batTypeFilter.toLowerCase())) return false;
    }
    if (activeCategory === 'Balls' && ballTypeFilter !== 'All') {
      if (!fullText.includes(ballTypeFilter.toLowerCase())) return false;
    }
    if (activeCategory === 'Gloves' && gloveTypeFilter !== 'All') {
      if (!fullText.includes(gloveTypeFilter.toLowerCase())) return false;
    }

    if (activeCat.includes('cap') || activeCat.includes('hat')) {
      return fullText.includes('cap') || fullText.includes('hat');
    }
    if (activeCat.includes('shirt') || activeCat.includes('jersey') || activeCat.includes('apparel')) {
      return fullText.includes('shirt') || fullText.includes('t-shirt') || fullText.includes('jersey') || fullText.includes('apparel');
    }
    if (activeCat.includes('trouser') || activeCat.includes('pant') || activeCat.includes('tracksuit')) {
      return fullText.includes('trouser') || fullText.includes('pant') || fullText.includes('tracksuit') || fullText.includes('lower');
    }
    if (activeCat.includes('indoor')) {
      return fullText.includes('indoor') || fullText.includes('board') || fullText.includes('ludo') || fullText.includes('carrom') || fullText.includes('chess') || fullText.includes('table tennis');
    }
    if (activeCat.includes('shoe') || activeCat.includes('spike') || activeCat.includes('footwear')) {
      return fullText.includes('shoe') || fullText.includes('spike') || fullText.includes('footwear');
    }
    if (activeCat.includes('glove')) {
      return fullText.includes('glove');
    }
    if (activeCat.includes('bat')) {
      return (fullText.includes('bat') || fullText.includes('willow')) &&
             !fullText.includes('glove') && !fullText.includes('pad') &&
             !fullText.includes('cap') && !fullText.includes('shoe') && !fullText.includes('spike');
    }
    if (activeCat.includes('protect') || activeCat.includes('pad') || activeCat.includes('helmet')) {
      return (fullText.includes('protect') || fullText.includes('pad') || fullText.includes('helmet') || fullText.includes('guard')) &&
             !fullText.includes('bat') && !fullText.includes('cap');
    }
    if (activeCat.includes('ball')) {
      return fullText.includes('ball') && !fullText.includes('bat');
    }

    return pCat === activeCat || pSub === activeCat || pCat.includes(activeCat) || pSub.includes(activeCat);
  });

  const slide = heroSlides[currentSlide] || DEFAULT_HERO_SLIDES[0];

  const heroAccent = slideAccents[currentSlide] || { rgb: '166, 54, 43', luminance: 92 };
  const heroOverlayAlpha = Math.min(0.94, Math.max(0.52, 0.42 + (heroAccent.luminance / 255) * 0.5));

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <div className="min-h-screen bg-white font-[family-name:var(--font-body)] text-[#0B120D] flex flex-col overflow-x-hidden">
        <Navbar
          activeCategory={activeCategory} 
          setActiveCategory={handleCategorySelect}
          setBatTypeFilter={setBatTypeFilter} 
          setBallTypeFilter={setBallTypeFilter}
          setGloveTypeFilter={setGloveTypeFilter}
          searchTerm={searchTerm} 
          setSearchTerm={(term) => {
            setSearchTerm(term);
            if (term) handleCategorySelect('All');
          }}
        />

        {!isFiltered && (
          <>
            {/* HERO SECTION */}
            <section ref={heroRef} className="relative overflow-hidden min-h-screen flex items-center">
              <div className="absolute inset-0 bg-[#0B120D]">
                {heroSlides.map((s, idx) => (
                  <div
                    key={s._id || idx}
                    className={`absolute inset-0 transition-opacity ease-out ${
                      idx === currentSlide ? 'opacity-100 duration-[1200ms] z-0' : 'opacity-0 duration-[800ms] z-0'
                    }`}
                  >
                    <img
                      src={s.image || s.imageUrl}
                      alt={s.title ? s.title.replace('\n', ' ') : 'Kamran Sports'}
                      className={`w-full h-full object-cover transition-transform duration-[7000ms] ease-out ${
                        idx === currentSlide ? 'scale-110' : 'scale-100'
                      }`}
                      onError={(e) => { e.target.src = `https://placehold.co/1600x1000/0B120D/F4F1EA?text=Kamran+Sports`; }}
                    />
                  </div>
                ))}
              </div>

              <div
                className="absolute inset-0 transition-[background] duration-[1400ms] ease-out"
                style={{
                  background: `linear-gradient(100deg, rgba(11,18,13,${Math.min(0.97, heroOverlayAlpha + 0.1)}) 0%, rgba(11,18,13,${heroOverlayAlpha}) 48%, rgba(11,18,13,${Math.max(0.14, heroOverlayAlpha - 0.42)}) 100%)`,
                }}
              />
              <div
                className="absolute inset-0 transition-[background] duration-[1400ms] ease-out"
                style={{
                  background: `linear-gradient(0deg, rgba(11,18,13,${Math.min(0.95, heroOverlayAlpha + 0.06)}) 0%, rgba(11,18,13,0) 55%, rgba(11,18,13,${Math.max(0.18, heroOverlayAlpha - 0.28)}) 100%)`,
                }}
              />
              <div className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("${GRAIN_TEXTURE}")`, backgroundSize: '320px 320px' }} />

              <div
                className="absolute top-1/3 right-[8%] w-[420px] h-[420px] rounded-full blur-[160px] pointer-events-none transition-colors duration-[1400ms] ease-out"
                style={{ backgroundColor: `rgba(${heroAccent.rgb}, 0.22)` }}
              />
              <div
                className="absolute bottom-0 left-[12%] w-[320px] h-[320px] rounded-full blur-[140px] pointer-events-none transition-colors duration-[1400ms] ease-out"
                style={{ backgroundColor: `rgba(${heroAccent.rgb}, 0.14)` }}
              />

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full py-24 flex flex-col justify-between min-h-screen sm:min-h-0">
                <div className="max-w-3xl space-y-8 mt-16 sm:mt-0">
                  <div className="overflow-hidden">
                    <span key={`badge-${currentSlide}`} className="inline-flex items-center gap-2.5 text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#C79A44] mb-2" style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                      <span className="w-6 h-[2px] bg-[#A6362B]" />
                      {slide.badge || 'EXCLUSIVE COLLECTION'}
                      <span
                        className="w-2 h-2 rounded-full border border-white/40 shadow-[0_0_10px_rgba(0,0,0,0.4)] transition-colors duration-[1400ms]"
                        style={{ backgroundColor: `rgb(${heroAccent.rgb})` }}
                        title="Theme colour"
                      />
                    </span>
                  </div>

                  <h1 key={`title-${currentSlide}`} className="font-[family-name:var(--font-display)] text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-[#F4F1EA] drop-shadow-[0_4px_30px_rgba(0,0,0,0.35)]" style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    {(slide.title || '').split('\n').map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </h1>

                  <p key={`sub-${currentSlide}`} className="text-[#F4F1EA]/75 text-sm sm:text-base leading-relaxed max-w-lg" style={{ animation: 'fadeUp 0.8s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
                    {slide.subtitle || slide.description}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-4" style={{ animation: 'fadeUp 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
                    <button onClick={() => handleCategorySelect('All')} className="group relative inline-flex items-center gap-3 bg-[#F4F1EA] hover:bg-[#A6362B] text-[#0B120D] hover:text-white font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(166,54,43,0.35)] overflow-hidden">
                      <span className="relative z-10">{slide.cta || 'Shop Now'}</span>
                      <Icon path={ICONS.arrowRight} className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={() => handleCategorySelect('All')} className="inline-flex items-center gap-2 border border-[#F4F1EA]/25 hover:border-[#C79A44] hover:text-[#C79A44] text-[#F4F1EA]/85 font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all duration-300 backdrop-blur-sm">
                      View Collection
                    </button>
                  </div>
                </div>

                <div className="flex items-end sm:items-center justify-between gap-6 sm:gap-8 pt-14 mt-14 border-t border-[#F4F1EA]/10" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                  <div className="flex items-center gap-5 sm:gap-10 overflow-x-auto scrollbar-hide">
                    {heroSlides.map((s, idx) => (
                      <button key={s._id || idx} onClick={() => setCurrentSlide(idx)} className="group flex flex-col items-start gap-2.5 shrink-0 cursor-pointer focus:outline-none">
                        <span className={`text-[10px] font-mono font-bold transition-colors ${currentSlide === idx ? 'text-[#C79A44]' : 'text-[#F4F1EA]/30'}`}>
                          0{idx + 1}
                        </span>
                        <div className="relative h-[2px] w-10 sm:w-14 rounded-full bg-[#F4F1EA]/15 overflow-hidden">
                          <span
                            className={`absolute inset-y-0 left-0 rounded-full bg-[#C79A44] ${currentSlide === idx ? '' : 'w-0'} ${currentSlide !== idx ? 'group-hover:w-1/3 group-hover:bg-[#F4F1EA]/40 transition-all duration-300' : ''}`}
                            style={currentSlide === idx ? { animation: paused ? 'none' : 'heroProgress 6s linear forwards', width: paused ? '100%' : undefined } : undefined}
                          />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      aria-label="Previous slide"
                      onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
                      className="w-11 h-11 rounded-full border border-[#F4F1EA]/25 hover:border-[#C79A44] hover:text-[#C79A44] text-[#F4F1EA]/70 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                    >
                      <Icon path={ICONS.arrowRight} className="w-4 h-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next slide"
                      onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)}
                      className="w-11 h-11 rounded-full border border-[#F4F1EA]/25 hover:border-[#C79A44] hover:text-[#C79A44] text-[#F4F1EA]/70 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                    >
                      <Icon path={ICONS.arrowRight} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <SeamStitch className="absolute bottom-0 left-0 w-full h-3 z-10" color={`rgb(${heroAccent.rgb})`} opacity={0.55} />

              <style jsx>{`
                @keyframes heroProgress {
                  from { width: 0%; }
                  to { width: 100%; }
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
            </section>

            {/* SCORECARD STRIP */}
            <section className="relative bg-[#F4F1EA] border-b border-[#E8E4D9] py-10 px-4">
              <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
                <WillowShowcaseCard />
                <FastDispatchCard />
                <SatisfactionReviewsCard />
              </div>
            </section>

            {/* FEATURED CATEGORIES SECTION */}
            <section className="py-24 px-4 sm:px-8 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="reveal flex flex-col sm:flex-row justify-between items-end mb-14 gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#A6362B] block mb-2">Shop by Category</span>
                    <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#0B120D]">Gear Up</h2>
                  </div>
                  <button onClick={() => handleCategorySelect('All')} className="group flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0B120D] hover:text-[#A6362B] transition-colors">
                    View All <Icon path={ICONS.arrowRight} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {FEATURED_CATEGORIES_LIST.slice(0, 3).map((cat, idx) => (
                    <DynamicCategoryCard
                      key={cat.name}
                      cat={cat}
                      products={products}
                      onSelect={handleCategorySelect}
                      index={idx}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {FEATURED_CATEGORIES_LIST.slice(3).map((cat, idx) => (
                    <DynamicCategoryCard
                      key={cat.name}
                      cat={cat}
                      products={products}
                      onSelect={handleCategorySelect}
                      index={idx + 3}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* TRUSTED BY CHAMPIONS */}
            <section className="relative bg-[#F4F1EA] py-24 sm:py-32 px-4 overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #A6362B 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <div className="relative z-10 max-w-7xl mx-auto">
                <div className="reveal text-center mb-16 space-y-4">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="h-px w-16 bg-[#A6362B]/40" />
                    <span className="text-[10px] font-mono font-medium uppercase tracking-[0.4em] text-[#A6362B]">Our Brand Ambassadors</span>
                    <div className="h-px w-16 bg-[#A6362B]/40" />
                  </div>
                  <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#0B120D]">
                    Trusted by Champions
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
                  {champions.map((player, idx) => {
                    const champName = player.name || player.title || 'Champion';
                    return (
                      <div key={player._id || player.id || idx} className="reveal group text-center flex flex-col justify-between items-center" style={{ transitionDelay: `${idx * 100}ms` }}>
                        <div className="w-full">
                          <div className="relative mx-auto w-full max-w-[260px] aspect-[3/4] mb-6 overflow-hidden rounded-2xl bg-white border border-[#E8E4D9] shadow-sm group-hover:border-[#A6362B]/30 group-hover:shadow-lg transition-all duration-500">
                            <img 
                              src={player.image || player.imageUrl || player.photo || player.img} 
                              alt={champName} 
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110" 
                              onError={(e) => { e.target.src = `https://placehold.co/400x530/F4F1EA/A6362B?text=${encodeURIComponent(champName)}`; }} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B120D]/50 via-transparent to-transparent opacity-70" />
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#A6362B] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>
                          <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-black uppercase tracking-wider text-[#0B120D] group-hover:text-[#A6362B] transition-colors duration-300">
                            {champName}
                          </h3>
                          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mt-2">{player.role || player.speciality}</p>
                        </div>

                        <button
                          onClick={() => handleExploreStar(champName)}
                          className="mt-5 w-full max-w-[260px] bg-[#0B120D] hover:bg-[#A6362B] text-white text-[10px] font-mono font-bold uppercase py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <span>Explore Gear</span>
                          <Icon path={ICONS.arrowRight} className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <SeamStitch className="absolute bottom-0 left-0 w-full h-3" color="#A6362B" opacity={0.25} />
            </section>

            {/* TAPEBALL STARS */}
            <section className="relative bg-white py-24 sm:py-32 px-4 overflow-hidden">
              <div className="max-w-7xl mx-auto">
                <div className="reveal text-center mb-16 space-y-4">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="h-px w-16 bg-[#C79A44]/50" />
                    <span className="text-[10px] font-mono font-medium uppercase tracking-[0.4em] text-[#C79A44]">Street Legends</span>
                    <div className="h-px w-16 bg-[#C79A44]/50" />
                  </div>
                  <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#0B120D]">
                    Tapeball Stars
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                  {tapeballStars.map((star, idx) => {
                    const starName = star.name || star.title || star.playerName || 'Tapeball Star';
                    const starRole = star.role || star.designation || star.speciality || 'Street Legend';
                    const starLocation = star.city || star.location || star.address || star.town || 'Pakistan';
                    const starImage = star.image || star.imageUrl || star.img || star.photo || star.avatar;

                    return (
                      <div key={star._id || star.id || idx} className="reveal group flex flex-col justify-between" style={{ transitionDelay: `${idx * 100}ms` }}>
                        <div>
                          <div className="relative mb-4 overflow-hidden rounded-2xl bg-[#F4F1EA] border border-[#E8E4D9] shadow-sm group-hover:shadow-xl group-hover:border-[#A6362B]/20 transition-all duration-500">
                            <div className="aspect-[3/4] relative overflow-hidden">
                              <img 
                                src={starImage} 
                                alt={starName} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                                onError={(e) => { e.target.src = `https://placehold.co/400x530/F4F1EA/A6362B?text=${encodeURIComponent(starName)}`; }} 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0B120D]/80 via-[#0B120D]/15 to-transparent" />
                              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#E8E4D9] shadow-sm">
                                <Icon path={ICONS.location} className="w-3 h-3 text-[#A6362B]" />
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#0B120D]">
                                  {starLocation}
                                </span>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-5">
                                <h3 className="font-[family-name:var(--font-display)] text-lg font-black uppercase tracking-wider text-white group-hover:text-[#C79A44] transition-colors">
                                  {starName}
                                </h3>
                                <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/80 mt-1">{starRole}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleExploreStar(starName)}
                          className="w-full bg-[#0B120D] hover:bg-[#C79A44] text-white text-[10px] font-mono font-bold uppercase py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <span>Explore Gear</span>
                          <Icon path={ICONS.arrowRight} className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Dynamic Products Grid */}
        <main id="collection" className={`bg-[#F4F1EA] px-4 sm:px-8 ${isFiltered ? 'pt-28 sm:pt-36 pb-24 min-h-[70vh]' : 'py-24'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="reveal text-center mb-14 space-y-3">
              <span className="text-[10px] font-mono font-medium uppercase tracking-[0.3em] text-[#A6362B]">
                {searchTerm ? 'Search Results' : isFiltered ? 'Category View' : 'The Collection'}
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#0B120D]">
                {searchTerm ? `"${searchTerm}"` : activeCategory === 'All' ? 'Latest Arrivals' : activeCategory}
              </h2>
              {isFiltered && (
                <button 
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchTerm('');
                    setBatTypeFilter('All');
                    setBallTypeFilter('All');
                    setGloveTypeFilter('All');
                  }} 
                  className="inline-block text-xs font-mono font-bold text-[#A6362B] uppercase tracking-widest mt-2 underline cursor-pointer hover:opacity-80 transition-opacity"
                >
                  ← Back to Home Page
                </button>
              )}
              <SeamStitch className="w-20 h-3 mx-auto mt-4" color="#A6362B" opacity={0.6} />
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative bg-white h-96 rounded-xl overflow-hidden border border-[#E8E4D9]">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.03] to-transparent animate-shimmer" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="reveal text-center py-24 bg-white rounded-2xl border border-[#E8E4D9]">
                <p className="text-neutral-500 font-bold text-sm uppercase tracking-wider mb-2">
                  {searchTerm ? `No gear found for "${searchTerm}"` : `No products found in "${activeCategory}"`}
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('All');
                    setBatTypeFilter('All');
                    setBallTypeFilter('All');
                    setGloveTypeFilter('All');
                  }} 
                  className="text-xs text-[#A6362B] underline font-bold uppercase tracking-wider mt-2"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
                {filteredProducts.map((product, i) => {
                  const title = product.name || product.title || 'Product';
                  const imgUrl = product.image || product.images?.[0] || 'https://placehold.co/400x500/F4F1EA/0B120D?text=No+Image';
                  const price = Number(product.price || 0).toLocaleString();

                  return (
                    <div key={product._id || product.id || i} className="reveal group relative bg-white border border-[#E8E4D9] rounded-xl overflow-hidden flex flex-col hover:border-[#A6362B]/30 hover:shadow-xl transition-all duration-500" style={{ transitionDelay: `${(i % 8) * 60}ms` }}>
                      <Link href={`/products/${product._id}`} className="block relative bg-[#F4F1EA] aspect-[4/5] overflow-hidden">
                        <span className="absolute top-4 left-4 z-10 bg-[#0B120D] text-white text-[9px] font-mono font-bold uppercase px-3 py-1.5 tracking-widest">
                          {product.category || 'Gear'}
                        </span>
                        {product.inStock === false && (
                          <span className="absolute top-4 right-4 z-10 bg-[#A6362B] text-white text-[9px] font-mono font-bold uppercase px-3 py-1.5 tracking-widest">Sold Out</span>
                        )}
                        <img src={imgUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                      </Link>

                      <div className="p-5 flex flex-col flex-1">
                        <Link href={`/products/${product._id}`}>
                          <h3 className="font-bold text-xs sm:text-sm text-[#0B120D] uppercase tracking-wide line-clamp-1 group-hover:text-[#A6362B] transition-colors">{title}</h3>
                        </Link>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">{product.subCategory || product.category || 'Cricket'}</p>
                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <span className="font-mono text-sm sm:text-base font-bold text-[#0B120D]">Rs. {price}</span>
                          <button onClick={() => handleAddToCart(product)} disabled={addedId === product._id || product.inStock === false}
                            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${addedId === product._id ? 'bg-emerald-600 text-white' : 'bg-[#0B120D] text-white hover:bg-[#A6362B] hover:scale-110'} ${bouncingId === product._id ? 'animate-bounce' : ''}`}>
                            {addedId === product._id ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* BRAND HERITAGE — MASTERCRAFT EDITION */}
        {!isFiltered && (
          <section className="relative isolate overflow-hidden bg-[#080D0A] text-[#F4F1EA] border-y border-white/[0.08]">
            {/* Premium ambient lighting */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[650px] rounded-full bg-[#C79A44]/[0.07] blur-[150px]" />
              <div className="absolute -bottom-72 -left-72 w-[650px] h-[650px] rounded-full bg-[#A6362B]/[0.08] blur-[160px]" />
              <div className="absolute -top-72 -right-72 w-[600px] h-[600px] rounded-full bg-[#C79A44]/[0.05] blur-[160px]" />
            </div>

            {/* Architectural grid */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.035]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(244,241,234,0.8) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(244,241,234,0.8) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px'
              }}
            />

            {/* Grain texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.10] mix-blend-soft-light"
              style={{
                backgroundImage: `url("${GRAIN_TEXTURE}")`,
                backgroundSize: '320px 320px'
              }}
            />

            {/* Oversized heritage watermark */}
            <div className="absolute -right-8 sm:right-8 top-16 select-none pointer-events-none">
              <span className="font-[family-name:var(--font-display)] text-[180px] sm:text-[280px] lg:text-[360px] font-black leading-none text-white/[0.018] tracking-[-0.08em]">
                20
              </span>
            </div>

            {/* Main content */}
            <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-32 lg:py-40">
              {/* Editorial header */}
              <div className="reveal flex items-center justify-between gap-6 mb-16 sm:mb-24">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#C79A44]/40">
                    <span className="w-2 h-2 rounded-full bg-[#C79A44] shadow-[0_0_12px_rgba(199,154,68,0.6)]" />
                  </span>

                  <div>
                    <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.35em] text-[#C79A44]">
                      The Heritage
                    </p>
                    <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/35 mt-1">
                      Karachi · Pakistan
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-3">
                  <span className="h-px w-12 bg-white/15" />
                  <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">
                    Est. 2005
                  </span>
                </div>
              </div>

              {/* Main editorial layout */}
              <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-20 items-end">
                {/* Typography */}
                <div>
                  <p className="reveal text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-[#A6362B] mb-6">
                    Crafted by hand. Built for pressure.
                  </p>

                  <h2 className="reveal font-[family-name:var(--font-display)] uppercase tracking-[-0.055em] leading-[0.82] text-6xl sm:text-8xl lg:text-[8.5rem]">
                    <span className="block font-light text-[#F4F1EA]/45">
                      We don&apos;t just
                    </span>
                    <span className="block font-black text-[#F4F1EA]">
                      make
                    </span>
                    <span className="relative inline-block mt-1">
                      <span className="block font-black text-[#F4F1EA]">
                        Bats.
                      </span>
                      <span className="absolute -bottom-2 left-0 w-[72%] h-[3px] bg-gradient-to-r from-[#A6362B] via-[#C79A44] to-transparent" />
                    </span>
                    <span className="block font-light text-[#F4F1EA]/45 mt-5">
                      We forge
                    </span>
                    <span className="block font-black bg-gradient-to-r from-[#C79A44] via-[#F7E8B8] to-[#C79A44] bg-clip-text text-transparent">
                      Winners.
                    </span>
                  </h2>
                </div>

                {/* Brand story */}
                <div className="reveal lg:pb-3">
                  <div className="w-12 h-[2px] bg-[#C79A44] mb-7" />
                  <p className="text-base sm:text-lg lg:text-xl leading-[1.7] text-[#F4F1EA]/65 max-w-xl">
                    For over two decades, our craftsmen have turned carefully selected
                    willow into equipment made for moments that matter.
                  </p>

                  <p className="text-sm leading-relaxed text-white/35 max-w-lg mt-5">
                    Every press, every grain, every finish carries the discipline of
                    traditional craftsmanship — refined for the modern game.
                  </p>

                  <div className="flex items-center gap-4 mt-9">
                    <div className="h-px w-16 bg-white/15" />
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/30">
                      Master craftsmanship
                    </span>
                  </div>
                </div>
              </div>

              {/* Heritage statistics */}
              <div className="reveal mt-20 sm:mt-28 border-t border-white/[0.09]">
                <div className="grid grid-cols-1 sm:grid-cols-3">
                  {[
                    {
                      number: '20+',
                      label: 'Years of Craft',
                      text: 'Two decades of refining the art of willow.'
                    },
                    {
                      number: '50K+',
                      label: 'Players Equipped',
                      text: 'Gear trusted across grounds throughout Pakistan.'
                    },
                    {
                      number: '100%',
                      label: 'Hand Pressed',
                      text: 'Every willow selected, pressed and finished with care.'
                    }
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      className={`
                        group relative py-9 sm:py-11
                        ${index !== 2 ? 'sm:border-r border-white/[0.08]' : ''}
                        ${index !== 0 ? 'border-t sm:border-t-0 border-white/[0.08]' : ''}
                        sm:px-8
                        transition-all duration-500
                        hover:bg-white/[0.025]
                      `}
                    >
                      {/* Index */}
                      <span className="absolute top-5 right-6 text-[9px] font-mono text-white/20">
                        0{index + 1}
                      </span>

                      <p className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-black tracking-tight text-[#F4F1EA] group-hover:text-[#C79A44] transition-colors duration-500">
                        {stat.number}
                      </p>

                      <p className="mt-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C79A44]">
                        {stat.label}
                      </p>

                      <p className="mt-3 max-w-xs text-[11px] leading-relaxed text-white/35">
                        {stat.text}
                      </p>

                      {/* Hover line */}
                      <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-[#C79A44]/0 via-[#C79A44]/40 to-[#C79A44]/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Heritage badges */}
              <div className="reveal flex flex-wrap gap-x-8 gap-y-4 mt-12 sm:mt-16">
                {HERITAGE_BADGES.map((label, index) => (
                  <div key={label} className="flex items-center gap-3 group">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full border border-white/15 group-hover:border-[#C79A44]/50 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A6362B] group-hover:bg-[#C79A44] transition-colors" />
                    </span>

                    <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-white/45 group-hover:text-white/75 transition-colors">
                      {label}
                    </span>

                    {index < HERITAGE_BADGES.length - 1 && (
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-white/10 ml-4" />
                    )}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="reveal flex flex-col sm:flex-row sm:items-center justify-between gap-8 mt-16 sm:mt-20 pt-10 border-t border-white/[0.08]">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#C79A44] mb-2">
                    Built for your next innings
                  </p>
                  <p className="text-sm text-white/40">
                    Talk to our team about your cricket gear.
                  </p>
                </div>

                <a
                  href={`https://wa.me/${PHONE_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-4 bg-[#F4F1EA] text-[#080D0A] hover:bg-[#C79A44] px-8 sm:px-10 py-4 text-[10px] font-mono font-black uppercase tracking-[0.22em] transition-all duration-500 overflow-hidden"
                >
                  <span className="relative z-10 group-hover:text-[#080D0A] transition-colors duration-300">
                    Speak to the Craftsmen
                  </span>
                  <Icon
                    path={ICONS.arrowRight}
                    className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                  />
                  <span className="absolute inset-0 bg-[#C79A44] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </a>
              </div>
            </div>

            {/* Vertical brand signature */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden xl:block">
              <div className="flex flex-col items-center gap-4">
                <span className="w-px h-24 bg-gradient-to-b from-transparent via-[#C79A44]/40 to-transparent" />
                <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-white/20 [writing-mode:vertical-rl]">
                  Kamran Sports
                </span>
                <span className="w-px h-24 bg-gradient-to-b from-transparent via-[#C79A44]/40 to-transparent" />
              </div>
            </div>

            {/* Bottom stitch */}
            <SeamStitch
              className="absolute bottom-0 left-0 w-full h-3"
              color="#C79A44"
              opacity={0.35}
            />
          </section>
        )}

        <Footer />
        <WhatsAppButton phoneNumber={PHONE_NUMBER} />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HomeContent />
    </Suspense>
  );
}