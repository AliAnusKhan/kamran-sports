'use client';

export default function Footer() {
  const mapSearchQuery = encodeURIComponent("Kamran Sports, Landhi Rd, Sector 35 E Landhi Town, Karachi");

  return (
    <footer className="bg-neutral-950 text-white border-t-4 border-red-600 pt-12 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* BRAND INFO */}
        <div>
          <h3 className="text-xl font-black uppercase text-white mb-3 tracking-wider">
            KAMRAN <span className="text-red-600">SPORTS</span>
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            Pakistan's trusted destination for high-performance cricket gear, balls, sports accessories, and professional bat repair services.
          </p>
          <div className="text-xs text-neutral-300 space-y-1.5">
            <p><strong className="text-white">Address:</strong> Landhi Rd, Sector 35 E, Landhi Town, Karachi</p>
            <p><strong className="text-white">Phone / WhatsApp:</strong> +92 312 3623584</p>
            <p><strong className="text-white">Delivery:</strong> Nationwide Across Pakistan</p>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="md:pl-8">
          <h4 className="text-sm font-black uppercase text-white mb-4 border-b border-neutral-800 pb-2">
            Categories
          </h4>
          <ul className="text-xs space-y-2.5 text-neutral-400 font-semibold uppercase">
            <li><a href="#" className="hover:text-red-600 transition">Cricket Bats (Hardball & Tapeball)</a></li>
            <li><a href="#" className="hover:text-red-600 transition">Match Balls & Footballs</a></li>
            <li><a href="#" className="hover:text-red-600 transition">Batting Gloves & Inners</a></li>
            <li><a href="#" className="hover:text-red-600 transition">Pads & Protection Gear</a></li>
            <li><a href="#" className="hover:text-red-600 transition">Spike & Turf Shoes</a></li>
            <li><a href="#" className="hover:text-red-600 transition">Bat Repairing Services</a></li>
          </ul>
        </div>

        {/* GOOGLE MAP LOCATION */}
        <div>
          <h4 className="text-sm font-black uppercase text-white mb-4 border-b border-neutral-800 pb-2">
            Store Location
          </h4>
          <div className="w-full h-40 bg-neutral-800 border border-neutral-700 overflow-hidden relative rounded-sm">
            <iframe
              title="Kamran Sports Landhi Location"
              src={`https://maps.google.com/maps?q=${mapSearchQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] font-bold uppercase text-red-500 hover:text-white mt-2 transition"
          >
            Open Location in Google Maps &rarr;
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-neutral-800 text-center text-[11px] text-neutral-500 uppercase tracking-wider">
        &copy; {new Date().getFullYear()} Kamran Sports. All Rights Reserved.
      </div>
    </footer>
  );
}