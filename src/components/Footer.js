'use client';

import Link from 'next/link';

// Same top-level categories used across the admin panel & homepage filters,
// so these links actually take the customer to a filtered, populated view
// instead of a dead "#" anchor.
const FOOTER_CATEGORIES = [
  'Cricket Store',
  'Shoes',
  'Caps',
  'Football & Multiple Balls',
  'Shirt & Trouser',
  'Indoor Games',
  'Trophies & Medals',
];

export default function Footer() {
  const mapSearchQuery = encodeURIComponent("Kamran Sports, Landhi Rd, Sector 35 E Landhi Town, Karachi");

  return (
    <footer className="bg-[#0B120D] text-[#F4F1EA] border-t-4 border-[#C79A44] pt-14 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* BRAND INFO */}
        <div>
          <h3 className="text-xl font-black uppercase text-[#F4F1EA] mb-3 tracking-wider">
            KAMRAN <span className="text-[#C79A44]">SPORTS</span>
          </h3>
          <p className="text-xs text-white/50 leading-relaxed mb-5">
            Pakistan&apos;s trusted destination for high-performance cricket gear, balls, sports accessories, and professional bat repair services.
          </p>
          <div className="text-xs text-white/60 space-y-2">
            <p><strong className="text-[#C79A44] font-bold">Address:</strong> Landhi Rd, Sector 35 E, Landhi Town, Karachi</p>
            <p><strong className="text-[#C79A44] font-bold">Phone / WhatsApp:</strong> +92 312 3623584</p>
            <p><strong className="text-[#C79A44] font-bold">Delivery:</strong> Nationwide Across Pakistan</p>
          </div>
        </div>

        {/* QUICK LINKS — CATEGORIES */}
        <div className="md:pl-8">
          <h4 className="text-[11px] font-mono font-black uppercase tracking-[0.2em] text-[#F4F1EA] mb-5 pb-3 border-b border-white/10">
            Shop by Category
          </h4>
          <ul className="text-xs space-y-3 font-bold uppercase tracking-wide">
            {FOOTER_CATEGORIES.map((cat) => (
              <li key={cat}>
                <Link
                  href={`/?category=${encodeURIComponent(cat)}`}
                  className="group inline-flex items-center gap-2 text-white/55 hover:text-[#C79A44] transition-colors duration-200"
                >
                  <span className="w-1 h-1 rounded-full bg-[#A6362B] group-hover:bg-[#C79A44] transition-colors shrink-0" />
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* GOOGLE MAP LOCATION */}
        <div>
          <h4 className="text-[11px] font-mono font-black uppercase tracking-[0.2em] text-[#F4F1EA] mb-5 pb-3 border-b border-white/10">
            Store Location
          </h4>
          <div className="w-full h-40 border border-white/10 overflow-hidden relative rounded-xl">
            <iframe
              title="Kamran Sports Landhi Location"
              src={`https://maps.google.com/maps?q=${mapSearchQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0 grayscale-[30%] contrast-[1.1]"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#C79A44] hover:text-white mt-3 transition-colors"
          >
            Open Location in Google Maps <span aria-hidden>&rarr;</span>
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/10 text-center text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">
        &copy; {new Date().getFullYear()} Kamran Sports. All Rights Reserved.
      </div>
    </footer>
  );
}