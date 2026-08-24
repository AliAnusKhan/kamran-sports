'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 500);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
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