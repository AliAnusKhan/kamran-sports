'use client';

import { useState, useEffect, useRef, memo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import '../app/motion.css';

const AnnouncementBar = memo(function AnnouncementBar() {
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
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, loopNum, typingSpeed]);

  return (
    <div className="bg-[#0B120D] py-2 px-3 sm:px-4 flex items-center justify-center gap-2 overflow-hidden w-full select-none">
      <span className="shrink-0 bg-white rounded-sm p-[2px] sm:p-[3px] flex items-center justify-center">
        <img src="/logo.jpg" alt="Kamran Sports" className="h-4 sm:h-5 w-auto object-contain" />
      </span>
      <div className="flex items-center gap-1 min-w-0 max-w-[75vw] sm:max-w-none overflow-hidden">
        <span className="text-[#C79A44] font-mono text-[10px] sm:text-xs font-medium tracking-widest uppercase whitespace-nowrap truncate">
          {typedText}
        </span>
        <span className="text-[#C79A44] font-medium text-xs sm:text-sm animate-pulse shrink-0">
          |
        </span>
      </div>
    </div>
  );
});

function CartIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3.6-8H5.4M7 13L5.4 5M7 13l-1.7 4.6A1 1 0 006.24 19H18M9 19a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
    </svg>
  );
}

function ChevronIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SearchIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function CloseIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    dropdownWidth: 'w-[750px] xl:w-[850px]',
    sections: [
      {
        title: 'Bats',
        items: [
          { name: 'English Willow', value: 'English Willow' },
          { name: 'Kashmir Willow', value: 'Kashmir Willow' },
          { name: 'Tennis Bat', value: 'Tennis Bat' },
          { name: 'Bat Grips', value: 'Bat Grips' },
          { name: 'Cricket Kit', value: 'Cricket Kit' },
        ],
      },
      {
        title: 'Balls',
        items: [
          { name: 'Leather Ball', value: 'Leather Ball' },
          { name: 'Tennis Ball', value: 'Tennis Ball' },
        ],
      },
      {
        title: 'Cricket Bags',
        items: [
          { name: 'Trolley', value: 'Trolley' },
          { name: 'Wheelie Kit', value: 'Wheelie Kit' },
          { name: 'Wheelie Duffle', value: 'Wheelie Duffle' },
          { name: 'Kit', value: 'Kit' },
          { name: 'Duffle', value: 'Duffle' },
        ],
      },
      {
        title: 'Gloves',
        items: [
          { name: 'Batting Gloves', value: 'Batting Gloves' },
          { name: 'Tapeball Batting Gloves', value: 'Tapeball Batting Gloves' },
          { name: 'W.K. Gloves', value: 'W.K. Gloves' },
          { name: 'Inner Gloves', value: 'Inner Gloves' },
        ],
      },
      {
        title: 'Leg Guards',
        items: [
          { name: 'Batting Leg Guard', value: 'Batting Leg Guard' },
          { name: 'Wicket Keeping Leg Guard', value: 'Wicket Keeping Leg Guard' },
        ],
      },
      {
        title: 'Protective Gear',
        items: [
          { name: 'Elbow Guard', value: 'Elbow Guard' },
          { name: 'Chest Guard', value: 'Chest Guard' },
          { name: 'Thigh Pad', value: 'Thigh Pad' },
          { name: 'Inner Thigh Pad', value: 'Inner Thigh Pad' },
          { name: 'Abdo Guard', value: 'Abdo Guard' },
          { name: 'Helmets', value: 'Helmets' },
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
    name: 'Caps',
    value: 'Caps',
    isMegaMenu: true,
    gridCols: 'grid-cols-2',
    dropdownWidth: 'w-[400px]',
    sections: [
      {
        title: 'Caps',
        items: [
          { name: 'Fixed Cap', value: 'Fixed Cap' },
          { name: 'Adjustable Cap', value: 'Adjustable Cap' },
        ],
      },
    ],
  },
  {
    name: 'Football & Multiple Balls',
    value: 'Football & Multiple Balls',
    isMegaMenu: true,
    gridCols: 'grid-cols-3',
    dropdownWidth: 'w-[600px]',
    sections: [
      {
        title: 'Footballs',
        items: [
          { name: 'Match Footballs', value: 'Match Footballs' },
          { name: 'Training Footballs', value: 'Training Footballs' },
          { name: 'Futsal Balls', value: 'Futsal Balls' },
        ],
      },
      {
        title: 'Gear & Accessories',
        items: [
          { name: 'Shin Guards', value: 'Shin Guards' },
          { name: 'Goalkeeper Gloves', value: 'Goalkeeper Gloves' },
          { name: 'Football Socks', value: 'Football Socks' },
        ],
      },
      {
        title: 'Other Balls',
        items: [
          { name: 'Basketball', value: 'Basketball' },
          { name: 'Volleyball', value: 'Volleyball' },
          { name: 'Throwball', value: 'Throwball' },
          { name: 'Rugby Ball', value: 'Rugby Ball' },
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
    gridCols: 'grid-cols-3',
    dropdownWidth: 'w-[620px]',
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
      {
        title: 'Badminton & Racket',
        items: [
          { name: 'Shuttle Cock', value: 'Shuttle Cock' },
          { name: 'Table Tennis', value: 'Table Tennis Set' },
          { name: 'Rackets & Balls', value: 'Rackets & Balls' },
          { name: 'Tennis Racket', value: 'Tennis Racket' },
          { name: 'Tennis Ball', value: 'Tennis Ball' },
          { name: 'Padel Racket', value: 'Padel Racket' },
          { name: 'Foosball', value: 'Foosball' },
        ],
      },
    ],
  },
  {
    name: 'Trophies & Medals',
    value: 'Trophies & Medals',
    isMegaMenu: true,
    gridCols: 'grid-cols-2',
    dropdownWidth: 'w-[420px]',
    sections: [
      {
        title: 'Trophies',
        items: [
          { name: 'Plastic Trophies', value: 'Plastic Trophies' },
          { name: 'Metal Trophies', value: 'Metal Trophies' },
          { name: 'Imported Trophies', value: 'Imported Trophies' },
          { name: 'Autograph Bat', value: 'Autograph Bat' },
        ],
      },
      {
        title: 'Medals',
        items: [
          { name: 'Shield', value: 'Shield' },
          { name: 'Plastic Shield', value: 'Plastic Shield' },
          { name: 'Ready Made', value: 'Ready Made' },
          { name: 'Customize', value: 'Customize' },
        ],
      },
    ],
  },
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
  const [cartBump, setCartBump] = useState(false);
  const navRef = useRef(null);
  const prevTotalRef = useRef(0);

  const [internalSearch, setInternalSearch] = useState('');
  const currentSearch = setSearchTerm ? searchTerm : internalSearch;

  const handleSearchChange = (value) => {
    if (setSearchTerm) setSearchTerm(value);
    else setInternalSearch(value);
    if (pathname !== '/products') router.push('/products');
  };

  const handleClearSearch = () => {
    handleSearchChange('');
  };

  useEffect(() => {
    setMounted(true);
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
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // UPDATED: Proper handling of main category vs subcategory query parameters
  const handleSubClick = (subValue, mainCategory = null) => {
    if (typeof setActiveCategory === 'function') {
      setActiveCategory(subValue);
    }

    if (typeof setBatTypeFilter === 'function') {
      setBatTypeFilter(['English Willow', 'Kashmir Willow', 'Tennis Bat'].includes(subValue) ? subValue : 'All');
    }
    if (typeof setBallTypeFilter === 'function') {
      setBallTypeFilter(['Leather Ball', 'Tennis Ball'].includes(subValue) ? subValue : 'All');
    }
    if (typeof setGloveTypeFilter === 'function') {
      setGloveTypeFilter(['Batting Gloves', 'Tapeball Batting Gloves', 'W.K. Gloves', 'Inner Gloves'].includes(subValue) ? subValue : 'All');
    }

    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenMobileSection(null);

    if (subValue === 'All') {
      router.push('/products');
    } else if (mainCategory && mainCategory !== subValue) {
      // Direct push with both category and subcategory
      router.push(`/products?category=${encodeURIComponent(mainCategory)}&subcategory=${encodeURIComponent(subValue)}`);
    } else {
      // Direct push for top-level category click
      router.push(`/products?category=${encodeURIComponent(subValue)}`);
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white border-b border-[#D9D4C4] shadow-sm">
      <AnnouncementBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 lg:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-[#0B120D] hover:text-[#A6362B] transition cursor-pointer"
            aria-label="Toggle menu"
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
            <img src="/logo.jpg" alt="Kamran Sports Karachi" className="logo-tilt h-10 sm:h-12 w-auto object-contain" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav ref={navRef} className="hidden lg:flex items-center gap-2 xl:gap-4 text-xs xl:text-sm font-semibold uppercase tracking-wide">
          {CATEGORY_TREE.map((cat) => {
            const isOpen = openDropdown === cat.name;

            return (
              <div
                key={cat.name}
                className="relative"
                onMouseEnter={() => setOpenDropdown(cat.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {cat.isSpecial ? (
                  <button
                    onClick={() => handleSubClick(cat.value)}
                    className="bg-[#A6362B] hover:bg-[#8C2C22] text-white px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    {cat.name}
                    {cat.isMegaMenu && <ChevronIcon className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubClick(cat.value)}
                    className="relative pb-2 pt-1 flex items-center gap-1 cursor-pointer transition-colors text-[#0B120D] hover:text-[#A6362B] whitespace-nowrap"
                  >
                    {cat.name}
                    {cat.isMegaMenu && <ChevronIcon className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                  </button>
                )}

                {cat.isMegaMenu && isOpen && (
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
                                  onClick={() => handleSubClick(item.value, cat.value)}
                                  className="text-xs font-normal text-neutral-600 hover:text-[#A6362B] transition-colors py-0.5 block normal-case cursor-pointer text-left w-full"
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
          })}
        </nav>

        {/* Search & Cart */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center relative w-28 lg:w-32 xl:w-36">
            <input
              type="text"
              placeholder="Search..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#F1EFE6] border border-[#D9D4C4] text-xs px-2.5 py-1.5 pl-7 pr-6 rounded-sm focus:outline-none focus:border-[#A6362B] text-[#0B120D] placeholder-neutral-500 transition-all"
            />
            <SearchIcon className="w-3.5 h-3.5 absolute left-2 text-neutral-500 pointer-events-none" />
            {currentSearch && (
              <button onClick={handleClearSearch} className="absolute right-1.5 text-neutral-400 hover:text-[#A6362B]">
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 w-full bg-[#0B120D] text-white py-4 px-5 border-t border-white/10 space-y-3 shadow-2xl max-h-[80vh] overflow-y-auto z-50">
          <div className="relative w-full pb-1">
            <input
              type="text"
              placeholder="Search products..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-xs px-3 py-2.5 pl-9 pr-8 rounded-sm text-white placeholder-neutral-400 focus:outline-none"
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
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wide text-neutral-300 hover:bg-white/5"
                    >
                      {cat.name}
                      <ChevronIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="mt-2 ml-3 pl-3 border-l border-white/10 space-y-3">
                        {cat.sections.map((sec) => (
                          <div key={sec.title} className="space-y-1">
                            <p className="text-[11px] font-bold text-[#C79A44] uppercase tracking-wider">{sec.title}</p>
                            {sec.items.map((item) => (
                              <button
                                key={item.name}
                                onClick={() => handleSubClick(item.value, cat.value)}
                                className="w-full text-left px-2 py-1 text-xs text-neutral-400 hover:text-white block normal-case"
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
                  className={`w-full text-left px-3 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wide ${
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