'use client'; // <-- Sab se pehli line par yeh add karein

import { useState, useEffect } from 'react';

export default function TapeballStarsSection() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    fetch('/api/tapeball-stars')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStars(data.data);
      });
  }, []);

  return (
    <div>
      {/* Cards JSX */}
    </div>
  );
}