'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      
      const finishTimer = setTimeout(() => {
        setHidden(true);
        if (typeof onFinish === 'function') {
          onFinish();
        }
      }, 500);

      return () => clearTimeout(finishTimer);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  // Screen complete ho kar DOM se hat jaye gi
  if (hidden) return null;

  return (
    <div 
      className={`fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="animate-pulse flex flex-col items-center">
        <img 
          src="/logo.jpg" 
          alt="Kamran Sports Logo" 
          className="w-48 h-auto object-contain"
        />
      </div>
    </div>
  );
}