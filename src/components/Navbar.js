'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import '../app/motion.css';

function CartIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3.6-8H5.4M7 13L5.4 5M7 13l-1.7 4.6A1 1 0 006.24 19H18M9 19a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
    </svg>
  );
}

function ChevronIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SearchIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function CloseIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const CATEGORY_TREE = [
  { name: 'All products', value: 'All' },
  {
    name: 'Cricket Store',
    value: 'Cricket Store',
    isMegaMenu: true,
    gridCols: 'grid-cols-3',
    dropdownWidth: 'w-[680px] xl:w-[750px]',
    sections: [
      {
        title: 'Bats',
        items: [
          { name: 'English Willow', value: 'English Willow' },
          { name: 'Kashmir Willow', value: 'Kashmir Willow' },
          { name: 'Tennis Bat', value: 'Tennis Bat' },
          { name: 'Cricket Kit', value: 'Cricket Kit' },
        ],
      },
      {
        title: 'Balls & Bags',
        items: [
          { name: 'Leather Ball', value: 'Leather Ball' },
          { name: 'Tennis Ball', value: 'Tennis Ball' },
          { name: 'Trolley Bags', value: 'Trolley' },
          { name: 'Wheelie Duffle', value: 'Wheelie Duffle' },
        ],
      },
      {
        title: 'Protective Gear',
        items: [
          { name: 'Batting Gloves', value: 'Batting Gloves' },
          { name: 'Batting Leg Guard', value: 'Batting Leg Guard' },
          { name: 'Helmets', value: 'Helmets' },
          { name: 'Thigh & Elbow Pads', value: 'Thigh Pad' },
        ],
      },
    ],
  },
  {
    name: 'Shoes',
    value: 'Shoes',
    isMegaMenu: true,
    gridCols: 'grid-cols-2',
    dropdownWidth: 'w-[450px]',
    sections: [
      {
        title: 'Cricket Shoes',
        items: [
          { name: 'Spike Shoes', value: 'Spike Shoes' },
          { name: 'Rubber Studs', value: 'Rubber Studs' },
          { name: 'Turf Shoes', value: 'Turf Shoes' },
        ],
      },
      {
        title: 'Sports & Training',
        items: [
          { name: 'Running Shoes', value: 'Running Shoes' },
          { name: 'Gym & Training Shoes', value: 'Training Shoes' },
          { name: 'Indoor Court Shoes', value: 'Indoor Shoes' },
        ],
      },
    ],
  },
  {
    name: 'Shirt & Trouser',
    value: 'Shirt & Trouser',
    isMegaMenu: true,
    gridCols: 'grid-cols-2',
    dropdownWidth: 'w-[480px]',
    sections: [
      {
        title: 'Cricket Kits & Whites',
        items: [
          { name: 'Test Cricket Whites', value: 'Cricket Whites' },
          { name: 'T20 Colored Jerseys', value: 'T20 Jerseys' },
          { name: 'Sublimation Team Shirts', value: 'Team Shirts' },
        ],
      },
      {
        title: 'Apparel & Training',
        items: [
          { name: 'Track Trousers', value: 'Track Trousers' },
          { name: 'Polo Shirts', value: 'Polo Shirts' },
          { name: 'Sleeveless Jackets', value: 'Jackets' },
          { name: 'Compression Wear', value: 'Compression Wear' },
        ],
      },
    ],
  },
  {
    name: 'Indoor Games',
    value: 'Indoor Games',
    isMegaMenu: true,
    gridCols: 'grid-cols-2',
    dropdownWidth: 'w-[460px]',
    sections: [
      {
        title: 'Board & Family Games',
        items: [
          { name: 'Chess Sets', value: 'Chess' },
          { name: 'Ludo Boards', value: 'Ludo' },
          { name: 'Playing Cards', value: 'Cards' },
          { name: 'UNO Cards', value: 'UNO' },
        ],
      },
      {
        title: 'Table & Action Games',
        items: [
          { name: 'Carrom Boards & Accessories', value: 'Carrom' },
          { name: 'Table Tennis Rackets & Balls', value: 'Table Tennis' },
          { name: 'Dart Boards', value: 'Dart Boards' },
        ],
      },
    ],
  },
  { name: 'Bat repair', value: 'Bat Repair', isSpecial: true },
];

export default function Navbar({
  activeCategory = 'All',
  setActiveCategory,
  setBatTypeFilter,
  setBallTypeFilter,
  setGloveTypeFilter,
  searchTerm = '',
  setSearchTerm,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { setIsOpen, totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileSection, setOpenMobileSection] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const navRef = useRef(null);
  const prevTotalRef = useRef(0);

  const [internalSearch, setInternalSearch] = useState('');
  const currentSearch = setSearchTerm ? searchTerm : internalSearch;

  const handleSearchChange = (value) => {
    if (setSearchTerm) {
      setSearchTerm(value);
    } else {
      setInternalSearch(value);
    }
    if (pathname !== '/') router.push('/');
  };

  const handleClearSearch = () => {
    handleSearchChange('');
  };

  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const words = [
    'KAMRAN SPORTS — BRAND OF KARACHI',
    '100% ORIGINAL CRICKET GEAR',
    'PREMIUM HANDCRAFTED BATS',
    'NATIONWIDE DELIVERY IN PAKISTAN',
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mounted && totalItems > prevTotalRef.current) {
      setCartBump(true);
      const t = window.setTimeout(() => setCartBump(false), 420);
      prevTotalRef.current = totalItems;
      return () => window.clearTimeout(t);
    }
    prevTotalRef.current = totalItems;
  }, [totalItems, mounted]);

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[loopNum % words.length];
      const updatedText = isDeleting
        ? currentWord.substring(0, typedText.length - 1)
        : currentWord.substring(0, typedText.length + 1);

      setTypedText(updatedText);

      if (!isDeleting && updatedText === currentWord) {
        setTimeout(() => setIsDeleting(true), 2000);
        setTypingSpeed(80);
      } else if (isDeleting && updatedText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(100);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearInterval(timer);
  }, [typedText, isDeleting, loopNum, typingSpeed]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateHome = () => {
    if (pathname !== '/') router.push('/');
  };

  const handleSubClick = (subValue) => {
    if (typeof setActiveCategory === 'function') setActiveCategory(subValue);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenMobileSection(null);
    navigateHome();
  };

  return (
    <header
      className={`w-full sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-md border-[#D9D4C4] shadow-md'
          : 'bg-white border-[#D9D4C4] shadow-sm'
      }`}
    >
      {/* ANNOUNCEMENT BAR */}
      <div className="bg-[#0B120D] py-2 px-4 flex items-center justify-center gap-2.5 overflow-hidden">
        <span className="shrink-0 bg-white rounded-sm p-[3px] flex items-center justify-center">
          <img src="/logo.jpg" alt="Kamran Sports Karachi" className="h-4 sm:h-5 w-auto object-contain" />
        </span>
        <div className="flex items-center gap-1 max-w-full">
          <span className="text-[#C79A44] font-[family-name:var(--font-mono,'IBM_Plex_Mono',monospace)] text-[10px] sm:text-xs font-medium tracking-[0.15em] uppercase whitespace-nowrap">
            {typedText}
          </span>
          <span className="text-[#C79A44] font-medium text-xs sm:text-sm animate-pulse" aria-hidden="true">
            |
          </span>
        </div>
      </div>

      {/* MAIN NAVIGATION */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 lg:gap-4 transition-all duration-300 ${
          scrolled ? 'py-2' : 'py-3'
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-[#0B120D] hover:text-[#A6362B] transition cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link href="/" className="flex items-center">
            <img
              src="/logo.jpg"
              alt="Kamran Sports Karachi"
              className={`logo-tilt w-auto object-contain transition-[height] duration-300 ${
                scrolled ? 'h-8 sm:h-10' : 'h-10 sm:h-13'
              }`}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav ref={navRef} className="hidden lg:flex items-center gap-3 xl:gap-5 text-xs xl:text-sm font-semibold uppercase tracking-wide">
          {CATEGORY_TREE.map((cat) => {
            if (cat.isSpecial) {
              return (
                <button
                  key={cat.name}
                  onClick={() => handleSubClick(cat.value)}
                  className="bg-[#A6362B] hover:bg-[#8C2C22] text-white px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer shrink-0"
                >
                  {cat.name}
                </button>
              );
            }

            if (cat.isMegaMenu) {
              const isOpen = openDropdown === cat.name;
              return (
                <div
                  key={cat.name}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(cat.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    onClick={() => handleSubClick(cat.value)}
                    className="relative pb-2 pt-1 flex items-center gap-1 cursor-pointer transition-colors text-[#0B120D] hover:text-[#A6362B] whitespace-nowrap"
                  >
                    {cat.name}
                    <ChevronIcon className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* MEGA MENU DROPDOWN */}
                  {isOpen && (
                    <div className={`absolute top-full -left-4 pt-2 z-50 ${cat.dropdownWidth}`}>
                      <div className={`bg-white border border-[#D9D4C4] rounded-sm shadow-2xl p-6 grid ${cat.gridCols} gap-6`}>
                        {cat.sections.map((section) => (
                          <div key={section.title} className="space-y-2">
                            <h4 className="text-xs font-bold text-[#0B120D] uppercase border-b border-[#D9D4C4] pb-1.5 tracking-wider">
                              {section.title}
                            </h4>
                            <ul className="space-y-1">
                              {section.items.map((item) => (
                                <li key={item.name}>
                                  <button
                                    onClick={() => handleSubClick(item.value)}
                                    className="text-xs font-normal text-neutral-600 hover:text-[#A6362B] transition-colors py-0.5 block normal-case cursor-pointer text-left"
                                  >
                                    {item.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={cat.name}
                onClick={() => handleSubClick(cat.value)}
                className="pb-2 pt-1 text-[#0B120D] hover:text-[#A6362B] transition-colors cursor-pointer whitespace-nowrap"
              >
                {cat.name}
              </button>
            );
          })}
        </nav>

        {/* Search & Cart */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center relative w-36 lg:w-44 xl:w-52">
            <input
              type="text"
              placeholder="Search bats, gear..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#F1EFE6] border border-[#D9D4C4] text-xs px-3 py-2 pl-8 pr-7 rounded-sm focus:outline-none focus:border-[#A6362B] text-[#0B120D] placeholder-neutral-500 transition-all"
            />
            <SearchIcon className="w-3.5 h-3.5 absolute left-2.5 text-neutral-500 pointer-events-none" />
            {currentSearch && (
              <button onClick={handleClearSearch} className="absolute right-2 text-neutral-400 hover:text-[#A6362B]">
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#0B120D] hover:bg-[#A6362B] text-white pl-3.5 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold uppercase flex items-center gap-2.5 rounded-sm transition-all duration-300 shadow-sm cursor-pointer"
          >
            <CartIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline tracking-wider">Cart</span>
            <span className={`bg-[#C79A44] text-[#0B120D] px-1.5 py-0.5 rounded-sm text-[11px] font-mono font-semibold min-w-[20px] text-center ${cartBump ? 'badge-bump' : ''}`}>
              {mounted ? totalItems : 0}
            </span>
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B120D] text-white py-4 px-5 border-t border-white/10 space-y-3 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="relative w-full pb-1">
            <input
              type="text"
              placeholder="Search products..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-xs px-3 py-2.5 pl-9 pr-8 rounded-sm text-white placeholder-neutral-400"
            />
            <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
          </div>

          <div className="space-y-1.5">
            {CATEGORY_TREE.map((cat) => {
              if (cat.isMegaMenu) {
                const isExpanded = openMobileSection === cat.name;
                return (
                  <div key={cat.name}>
                    <button
                      onClick={() => setOpenMobileSection(isExpanded ? null : cat.name)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-sm text-sm font-semibold uppercase tracking-wide text-neutral-300 hover:bg-white/5"
                    >
                      {cat.name}
                      <ChevronIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="mt-2 ml-3 pl-3 border-l border-white/10 space-y-4">
                        {cat.sections.map((sec) => (
                          <div key={sec.title} className="space-y-1">
                            <p className="text-xs font-bold text-[#C79A44] uppercase tracking-wider">{sec.title}</p>
                            {sec.items.map((item) => (
                              <button
                                key={item.name}
                                onClick={() => handleSubClick(item.value)}
                                className="w-full text-left px-2 py-1.5 text-xs text-neutral-400 hover:text-white block normal-case"
                              >
                                {item.name}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={cat.name}
                  onClick={() => handleSubClick(cat.value)}
                  className={`w-full text-left px-4 py-3 rounded-sm text-sm font-semibold uppercase tracking-wide ${
                    cat.isSpecial ? 'bg-[#A6362B] text-white' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}