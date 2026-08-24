'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    title: 'PREMIUM CRICKET BATS',
    subtitle: 'English Willow & High-Performance Tapeball Bats',
    category: 'Cricket Bats',
    bgImage: 'https://images.unsplash.com/photo-1593766788306-28561086694d?q=80&w=1200',
    buttonText: 'Shop Cricket Bats',
  },
  {
    id: 2,
    title: 'TOURNAMENT MATCH BALLS',
    subtitle: 'Red Leather Hardballs, Heavy Tennis & Match Footballs',
    category: 'Balls',
    bgImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200',
    buttonText: 'Explore Balls',
  },
  {
    id: 3,
    title: 'PRO BATTING GLOVES',
    subtitle: 'Hardball Protection Gloves & Tapeball Cotton Inners',
    category: 'Gloves',
    bgImage: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=400',
    buttonText: 'View Gloves',
  },
  {
    id: 4,
    title: 'SPIKE & TURF SHOES',
    subtitle: 'Built For Maximum Pitch Grip, Speed & Protection',
    category: 'Shoes',
    bgImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200',
    buttonText: 'Shop Shoes',
  },
  {
    id: 5,
    title: 'PRO SPORTSWEAR & TROUSERS',
    subtitle: 'Breathable Dry-Fit T-Shirts & Flexible Trousers',
    category: 'Trousers',
    bgImage: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=1200',
    buttonText: 'Explore Apparel',
  },
];

export default function HeroSlider({ onSelectCategory }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // HAR 6 SECONDS BAAD AUTOMATIC SLIDE CHANGE HOGA
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[360px] md:h-[450px] bg-neutral-900 overflow-hidden mb-10 group border-b-4 border-red-600">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* BACKGROUND IMAGE WITH GRADIENT OVERLAY */}
          <img
            src={slide.bgImage}
            alt={slide.title}
            className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-10000"
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-xl text-white">
                <span className="text-red-600 text-xs font-black uppercase tracking-widest block mb-2">
                  Featured Collection
                </span>
                <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight mb-3 tracking-tight">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-base text-neutral-300 mb-6 font-medium">
                  {slide.subtitle}
                </p>
                <button
                  onClick={() => onSelectCategory(slide.category)}
                  className="bg-red-600 hover:bg-white hover:text-black text-white text-xs md:text-sm font-black px-6 py-3 uppercase tracking-wider transition duration-300"
                >
                  {slide.buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* MANUAL NAVIGATION ARROWS */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-red-600 text-white w-10 h-10 flex items-center justify-center transition opacity-0 group-hover:opacity-100 font-bold"
      >
        &#10094;
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-red-600 text-white w-10 h-10 flex items-center justify-center transition opacity-0 group-hover:opacity-100 font-bold"
      >
        &#10095;
      </button>

      {/* SLIDE INDICATOR DOTS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}