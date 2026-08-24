'use client';

export default function Logo() {
  return (
    <div className="flex items-center select-none cursor-pointer">
      <img 
        src="/logo.jpg" 
        alt="Kamran Sports Logo" 
        className="h-14 w-auto object-contain"
      />
    </div>
  );
}