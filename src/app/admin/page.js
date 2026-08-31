'use client';

import { useState, useEffect, useRef } from 'react';

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" fill="#F5F3ED"/>
      <path d="M40 80 L60 40 L80 80 Z" fill="none" stroke="#E5E1D4" stroke-width="2"/>
      <circle cx="60" cy="60" r="5" fill="#C79A44"/>
    </svg>`
  );

// NOTE: These categories & subcategory VALUES are kept in exact sync with
// Navbar.js's CATEGORY_TREE. Whatever value a customer clicks on the storefront
// (e.g. "Cricket Store" -> "Tennis Bat") must be saved here with the SAME exact
// spelling/casing, otherwise the storefront filter (which matches on this exact
// text) will not find the product. If you ever add/rename an item in Navbar.js,
// update it here too.
const CATEGORY_MAP = {
  'Cricket Store': [
    // Bats
    'English Willow', 'Kashmir Willow', 'Tennis Bat', 'Bat Grips', 'Cricket Kit',
    // Balls
    'Leather Ball', 'Tennis Ball',
    // Cricket Bags
    'Trolley', 'Wheelie Kit', 'Wheelie Duffle', 'Kit', 'Duffle',
    // Gloves
    'Batting Gloves', 'Tapeball Batting Gloves', 'W.K. Gloves', 'Inner Gloves',
    // Leg Guards
    'Batting Leg Guard', 'Wicket Keeping Leg Guard',
    // Protective Gear
    'Elbow Guard', 'Chest Guard', 'Thigh Pad', 'Inner Thigh Pad', 'Abdo Guard', 'Helmets',
  ],
  'Shoes': [
    // Cricket Shoes
    'Spike Shoes', 'Rubber Studs', 'Turf Shoes',
    // Sports & Training
    'Running Shoes', 'Training Shoes', 'Indoor Shoes',
  ],
  'Caps': [
    'Fixed Cap', 'Adjustable Cap',
  ],
  'Football & Multiple Balls': [
    // Footballs
    'Match Footballs', 'Training Footballs', 'Futsal Balls',
    // Gear & Accessories
    'Shin Guards', 'Goalkeeper Gloves', 'Football Socks',
    // Other Balls
    'Basketball', 'Volleyball', 'Throwball', 'Rugby Ball',
  ],
  'Shirt & Trouser': [
    // Cricket Kits & Whites
    'Cricket Whites', 'T20 Jerseys', 'Team Shirts',
    // Apparel & Training
    'Track Trousers', 'Polo Shirts', 'Jackets', 'Compression Wear',
  ],
  'Indoor Games': [
    // Board & Family Games
    'Chess', 'Ludo', 'Cards', 'UNO',
    // Table & Action Games
    'Carrom', 'Table Tennis', 'Dart Boards',
    // Badminton & Racket
    'Shuttle Cock', 'Table Tennis Set', 'Rackets & Balls', 'Tennis Racket', 'Tennis Ball', 'Padel Racket', 'Foosball',
  ],
  'Trophies & Medals': [
    // Trophies
    'Plastic Trophies', 'Metal Trophies', 'Imported Trophies', 'Autograph Bat',
    // Medals
    'Shield', 'Plastic Shield', 'Ready Made', 'Customize',
  ],
};

const MAIN_CATEGORIES = Object.keys(CATEGORY_MAP);

const EMPTY_PRODUCT_FORM = {
  productId: '',
  name: '',
  price: '',
  category: 'Cricket Store',
  subCategory: 'English Willow',
  brand: 'Kamran Sports',
  image: '',
  description: '',
  inStock: true,
};

const EMPTY_STAR_FORM = {
  name: '',
  city: '',
  role: '',
  category: 'Tapeball',
  image: '',
};

const EMPTY_HERO_FORM = {
  badge: '',
  title: '',
  subtitle: '',
  cta: 'SHOP FOOTWEAR',
  link: '#collection',
  image: '',
};

const EMPTY_WILLOW_FORM = {
  image: '',
};

const EMPTY_MANUAL_ORDER_FORM = {
  name: '',
  phone: '',
  city: '',
  address: '',
  product: '',
  amount: '',
  paymentMethod: 'Cash',
  notes: '',
  orderSource: 'offline',
};

async function safeFetch(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(`Server response error (${res.status}): ${text.substring(0, 100) || 'Empty Response'}`);
  }
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

function SafeImage({ src, alt, className }) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={!src || errored ? FALLBACK_IMG : src}
      alt={alt || 'Image'}
      onError={() => setErrored(true)}
      className={className}
      draggable="false"
    />
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
  inventory: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  stock: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  outOfStock: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  plus: "M12 4v16m8-8H4",
  edit: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125",
  external: "M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25",
  close: "M6 18L18 6M6 6l12 12",
  package: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  star: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.116.488-.41.868-.834.613l-4.71-2.834a.563.563 0 00-.582 0l-4.71 2.834c-.423.255-.95-.125-.834-.613l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.948.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  image: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  chart: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  download: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
  compare: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m-3-9L18 12m0 0l-4.5 4.5M18 12H4.5",
  globe: "M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8",
  store: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25A2.25 2.25 0 010 18.75V10.5M21 10.5V18.75A2.25 2.25 0 0118.75 21H13.5",
  menu: "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5",
  chevron: "M8.25 4.5l7.5 7.5-7.5 7.5",
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [stars, setStars] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [willowImages, setWillowImages] = useState([]);
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // API Sales Data State
  const [salesAnalytics, setSalesAnalytics] = useState(null);

  // Manual Offline Order State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualFormData, setManualFormData] = useState(EMPTY_MANUAL_ORDER_FORM);

  // Product Comparison States
  const [productA, setProductA] = useState('');
  const [productB, setProductB] = useState('');

  // Willow Form State
  const [willowFormData, setWillowFormData] = useState(EMPTY_WILLOW_FORM);

  // Filters
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('All');
  const [deliverySourceFilter, setDeliverySourceFilter] = useState('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('All');

  // Product Form State
  const [formData, setFormData] = useState(EMPTY_PRODUCT_FORM);
  const [editingId, setEditingId] = useState(null);

  // Star Form State
  const [starFormData, setStarFormData] = useState(EMPTY_STAR_FORM);
  const [editingStarId, setEditingStarId] = useState(null);
  const [editingStarSource, setEditingStarSource] = useState(null);

  // Hero Form State
  const [heroFormData, setHeroFormData] = useState(EMPTY_HERO_FORM);
  const [editingHeroId, setEditingHeroId] = useState(null);

  // Upload & UI States
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [starCategoryFilter, setStarCategoryFilter] = useState('All');

  const dismissTimer = useRef(null);
  const fileInputRef = useRef(null);

  const fetchSalesAnalytics = async () => {
    try {
      const data = await safeFetch('/api/sales');
      const sales = data.analytics || data.data || data;
      setSalesAnalytics(sales);
    } catch (err) {
      console.error('Fetch sales analytics error:', err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await safeFetch('/api/products');
      const list = Array.isArray(data) ? data : (data.data || data.products || []);
      setProducts(list);
      if (list.length >= 2) {
        setProductA(list[0]?.name || list[0]?.title || '');
        setProductB(list[1]?.name || list[1]?.title || '');
      }
    } catch (err) {
      console.error('Fetch products error:', err.message);
    }
  };

  const fetchStars = async () => {
    try {
      const [championsRes, tapeballRes] = await Promise.allSettled([
        safeFetch('/api/champions'),
        safeFetch('/api/tapeball-stars'),
      ]);

      const extractList = (res) => {
        if (res.status !== 'fulfilled') return [];
        const data = res.value;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        if (data && Array.isArray(data.champions)) return data.champions;
        if (data && Array.isArray(data.stars)) return data.stars;
        if (data && Array.isArray(data.tapeballStars)) return data.tapeballStars;
        return [];
      };

      const championsList = extractList(championsRes).map((item) => ({
        ...item,
        name: item.name || item.title || '',
        city: item.city || item.location || '',
        role: item.role || item.designation || '',
        image: item.image || item.img || item.photo || '',
        category: item.category || 'Hardball Star',
        _source: 'champions',
      }));

      const tapeballList = extractList(tapeballRes).map((item) => ({
        ...item,
        name: item.name || item.title || '',
        city: item.city || item.location || '',
        role: item.role || item.designation || '',
        image: item.image || item.img || item.photo || '',
        category: item.category || 'Tapeball',
        _source: 'tapeball',
      }));

      setStars([...championsList, ...tapeballList]);
    } catch (err) {
      console.error('Fetch stars error:', err.message);
    }
  };

  const fetchHeroSlides = async () => {
    try {
      const data = await safeFetch('/api/hero-slides');
      const list = Array.isArray(data) ? data : (data.data || data.slides || []);
      setHeroSlides(list);
    } catch (err) {
      console.error('Fetch hero slides error:', err.message);
    }
  };

  const fetchWillowImages = async () => {
    try {
      const data = await safeFetch('/api/willow-gallery');
      const list = Array.isArray(data) ? data : (data.images || data.data || []);
      setWillowImages(list);
    } catch (err) {
      console.error('Fetch willow images error:', err.message);
    }
  };

  const fetchDeliveryRequests = async () => {
    try {
      const data = await safeFetch('/api/delivery-requests');
      const list = Array.isArray(data) ? data : (data.requests || data.data || []);
      setDeliveryRequests(list);
    } catch (err) {
      console.error('Fetch delivery requests error:', err.message);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await safeFetch('/api/reviews?all=true');
      const list = Array.isArray(data) ? data : (data.reviews || data.data || []);
      setReviews(list);
    } catch (err) {
      console.error('Fetch reviews error:', err.message);
    }
  };

  useEffect(() => {
    fetchSalesAnalytics();
    fetchProducts();
    fetchStars();
    fetchHeroSlides();
    fetchWillowImages();
    fetchDeliveryRequests();
    fetchReviews();
    return () => dismissTimer.current && clearTimeout(dismissTimer.current);
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const switchTab = (tabName) => {
    handleClearImage();
    setActiveTab(tabName);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'category') {
      const firstSub = CATEGORY_MAP[value]?.[0] || '';
      setFormData((prev) => ({ ...prev, category: value, subCategory: firstSub }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarChange = (e) => {
    const { name, value } = e.target;
    setStarFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeroChange = (e) => {
    const { name, value } = e.target;
    setHeroFormData((prev) => ({ ...prev, [name]: value }));
  };

  const processFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image size must be under 5MB.');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: '' }));
    setStarFormData((prev) => ({ ...prev, image: '' }));
    setHeroFormData((prev) => ({ ...prev, image: '' }));
    setWillowFormData(EMPTY_WILLOW_FORM);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- MANUAL ORDER ENTRY HANDLER ---
  const handleManualOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: manualFormData.name,
        phone: manualFormData.phone,
        city: manualFormData.city || 'Counter / Store',
        address: manualFormData.address || 'Manual Entry Point',
        product: manualFormData.product,
        amount: Number(manualFormData.amount) || getProductPrice(manualFormData.product),
        paymentMethod: manualFormData.paymentMethod,
        notes: manualFormData.notes,
        orderSource: 'offline',
        status: 'dispatched',
      };

      const data = await safeFetch('/api/delivery-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (data.success || data._id) {
        showMessage('success', 'Manual offline order recorded successfully!');
        setManualFormData(EMPTY_MANUAL_ORDER_FORM);
        setIsManualModalOpen(false);
        fetchDeliveryRequests();
        fetchSalesAnalytics();
      }
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- PRODUCT HANDLERS ---
  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormData({
      productId: product.productId || '',
      name: product.name || product.title || '',
      price: product.price || '',
      category: product.category || 'Cricket Store',
      subCategory: product.subCategory || product.subcategory || CATEGORY_MAP[product.category || 'Cricket Store']?.[0] || '',
      brand: product.brand || 'Kamran Sports',
      image: product.image || '',
      description: product.description || '',
      inStock: product.inStock !== false,
    });
    setImagePreview(product.image || '');
    setSelectedFile(null);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_PRODUCT_FORM);
    handleClearImage();
  };

  const handleDeleteClick = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const data = await safeFetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (data.success || data.message) {
        showMessage('success', 'Product deleted successfully.');
        fetchProducts();
      }
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image && !selectedFile) {
      showMessage('error', 'Please select or upload a product image.');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = formData.image;
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        const uploadData = await safeFetch('/api/upload', { method: 'POST', body: uploadFormData });
        if (!uploadData.success && !uploadData.url) throw new Error(uploadData.error || 'Image upload failed.');
        finalImageUrl = uploadData.url;
      }

      const isUpdating = !!editingId;
      const method = isUpdating ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        name: formData.name,
        title: formData.name,
        subCategory: formData.subCategory,
        subcategory: formData.subCategory,
        image: finalImageUrl,
        price: Number(formData.price),
        ...(isUpdating && { _id: editingId }),
      };

      const data = await safeFetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (data.success || data.message || data._id) {
        showMessage('success', isUpdating ? 'Product updated successfully!' : 'New product published to store!');
        handleCancelEdit();
        fetchProducts();
        setActiveTab('manage');
      }
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- STAR HANDLERS ---
  const handleEditStarClick = (star) => {
    setEditingStarId(star._id);
    setEditingStarSource(star._source || (star.category?.toLowerCase().includes('hardball') ? 'champions' : 'tapeball'));
    setStarFormData({
      name: star.name || star.title || '',
      city: star.city || star.location || '',
      role: star.role || star.designation || '',
      category: star.category || (star._source === 'champions' ? 'Hardball Star' : 'Tapeball'),
      image: star.image || star.img || star.photo || '',
    });
    setImagePreview(star.image || star.img || star.photo || '');
    setSelectedFile(null);
    setActiveTab('add-star');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelStarEdit = () => {
    setEditingStarId(null);
    setEditingStarSource(null);
    setStarFormData(EMPTY_STAR_FORM);
    handleClearImage();
  };

  const handleDeleteStarClick = async (id) => {
    if (!confirm('Are you sure you want to delete this star?')) return;
    try {
      const starToDelete = stars.find((s) => s._id === id);
      const isHardball = starToDelete?.category?.toLowerCase().includes('hardball') || starToDelete?._source === 'champions';
      const endpoint = isHardball ? `/api/champions?id=${id}` : `/api/tapeball-stars?id=${id}`;

      const data = await safeFetch(endpoint, { method: 'DELETE' });
      if (data.success || data.message || data.ok) {
        showMessage('success', 'Star deleted successfully.');
        fetchStars();
      }
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleStarSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = starFormData.image;
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        const uploadData = await safeFetch('/api/upload', { method: 'POST', body: uploadFormData });
        if (!uploadData.success && !uploadData.url) throw new Error(uploadData.error || 'Image upload failed.');
        finalImageUrl = uploadData.url;
      }

      const isUpdating = !!editingStarId;
      const isHardball = starFormData.category?.toLowerCase().includes('hardball');
      const targetEndpoint = isHardball ? '/api/champions' : '/api/tapeball-stars';

      if (isUpdating && editingStarSource && ((isHardball && editingStarSource === 'tapeball') || (!isHardball && editingStarSource === 'champions'))) {
        const oldEndpoint = editingStarSource === 'champions' ? `/api/champions?id=${editingStarId}` : `/api/tapeball-stars?id=${editingStarId}`;
        try {
          await safeFetch(oldEndpoint, { method: 'DELETE' });
        } catch (e) {
          console.warn('Old collection entry removal skipped:', e.message);
        }
      }

      const payload = {
        name: starFormData.name,
        title: starFormData.name,
        city: starFormData.city,
        location: starFormData.city,
        role: starFormData.role,
        designation: starFormData.role,
        category: starFormData.category,
        image: finalImageUrl,
        img: finalImageUrl,
        photo: finalImageUrl,
        ...(isUpdating && { _id: editingStarId }),
      };

      const data = await safeFetch(targetEndpoint, {
        method: isUpdating && (!editingStarSource || (isHardball && editingStarSource === 'champions') || (!isHardball && editingStarSource === 'tapeball')) ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (data.success || data.message || data._id || data.id) {
        showMessage('success', isUpdating ? 'Star updated successfully!' : 'New player saved successfully!');
        handleCancelStarEdit();
        fetchStars();
        setActiveTab('manage-stars');
      }
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HERO SLIDES HANDLERS ---
  const handleEditHeroClick = (slide) => {
    setEditingHeroId(slide._id);
    setHeroFormData({
      badge: slide.badge || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      cta: slide.cta || 'SHOP FOOTWEAR',
      link: slide.link || '#collection',
      image: slide.image || '',
    });
    setImagePreview(slide.image || '');
    setSelectedFile(null);
    setActiveTab('add-hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelHeroEdit = () => {
    setEditingHeroId(null);
    setHeroFormData(EMPTY_HERO_FORM);
    handleClearImage();
  };

  const handleDeleteHeroClick = async (id) => {
    if (!confirm('Are you sure you want to delete this Hero Slide?')) return;
    try {
      const data = await safeFetch(`/api/hero-slides?id=${id}`, { method: 'DELETE' });
      if (data.success || data.message || data.ok) {
        showMessage('success', 'Hero slide deleted successfully.');
        fetchHeroSlides();
      }
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    if (!heroFormData.image && !selectedFile) {
      showMessage('error', 'Please upload or provide an image for the hero slide.');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = heroFormData.image;
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        const uploadData = await safeFetch('/api/upload', { method: 'POST', body: uploadFormData });
        if (!uploadData.success && !uploadData.url) throw new Error(uploadData.error || 'Image upload failed.');
        finalImageUrl = uploadData.url;
      }

      const isUpdating = !!editingHeroId;
      const payload = {
        ...heroFormData,
        image: finalImageUrl,
        ...(isUpdating && { _id: editingHeroId }),
      };

      const data = await safeFetch('/api/hero-slides', {
        method: isUpdating ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (data.success || data.message || data._id) {
        showMessage('success', isUpdating ? 'Hero Slide updated successfully!' : 'Hero Slide added successfully!');
        handleCancelHeroEdit();
        fetchHeroSlides();
        setActiveTab('manage-hero');
      }
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- WILLOW GALLERY HANDLERS ---
  const handleWillowSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !willowFormData.image) {
      showMessage('error', 'Please upload a willow image.');
      return;
    }
    setLoading(true);
    try {
      let finalImageUrl = willowFormData.image;
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        const uploadData = await safeFetch('/api/upload', { method: 'POST', body: uploadFormData });
        if (!uploadData.success && !uploadData.url) throw new Error(uploadData.error || 'Image upload failed.');
        finalImageUrl = uploadData.url;
      }

      const data = await safeFetch('/api/willow-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalImageUrl }),
      });

      if (data.success || data._id) {
        showMessage('success', 'Willow image added successfully!');
        setWillowFormData(EMPTY_WILLOW_FORM);
        handleClearImage();
        fetchWillowImages();
        setActiveTab('manage-willow');
      }
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWillowClick = async (id) => {
    if (!confirm('Delete this willow image?')) return;
    try {
      const data = await safeFetch(`/api/willow-gallery?id=${id}`, { method: 'DELETE' });
      if (data.success) {
        showMessage('success', 'Willow image deleted.');
        fetchWillowImages();
      }
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  // --- DELIVERY REQUEST HANDLERS ---
  const handleMarkDispatched = async (id, status) => {
    try {
      const data = await safeFetch(`/api/delivery-requests?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (data.success) {
        showMessage('success', `Marked as ${status}.`);
        fetchDeliveryRequests();
        fetchSalesAnalytics();
      }
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteDeliveryClick = async (id) => {
    if (!confirm('Delete this delivery request?')) return;
    try {
      const data = await safeFetch(`/api/delivery-requests?id=${id}`, { method: 'DELETE' });
      if (data.success) {
        showMessage('success', 'Request deleted.');
        fetchDeliveryRequests();
        fetchSalesAnalytics();
      }
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const openWhatsAppForRequest = (req) => {
    const cleanPhone = (req.phone || req.phoneNumber || '').replace(/[^0-9]/g, '');
    const phone = cleanPhone.startsWith('92') ? cleanPhone : `92${cleanPhone.replace(/^0/, '')}`;
    const text = encodeURIComponent(
      `Assalam-o-Alaikum ${req.name || req.customerName}, aapki delivery request Kamran Sports ne receive kar li hai. ${req.product ? `Order: ${req.product}. ` : ''}Hum jald hi aapse rabta karenge.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // --- REVIEW HANDLERS ---
  const handleApproveReview = async (id, approved) => {
    try {
      const data = await safeFetch(`/api/reviews?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (data.success) {
        showMessage('success', approved ? 'Review approved — now live on site.' : 'Review hidden.');
        fetchReviews();
      }
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteReviewClick = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      const data = await safeFetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      if (data.success) {
        showMessage('success', 'Review deleted.');
        fetchReviews();
      }
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  // --- SALES ANALYTICS & ONLINE vs OFFLINE COMPUTATION ---
  const getProductPrice = (reqProduct) => {
    if (!reqProduct) return 0;
    const found = products.find(
      (p) => (p.name || p.title || '').toLowerCase() === reqProduct.toLowerCase() || p.productId === reqProduct
    );
    return found ? Number(found.price) || 0 : 5000;
  };

  const localTotalSalesRevenue = deliveryRequests.reduce((sum, req) => {
    const price = req.price || req.amount || req.totalAmount || getProductPrice(req.product);
    return sum + price;
  }, 0);

  const localDispatchedRevenue = deliveryRequests
    .filter((req) => (req.status || 'pending') === 'dispatched')
    .reduce((sum, req) => sum + (req.price || req.amount || req.totalAmount || getProductPrice(req.product)), 0);

  const localPendingRevenue = deliveryRequests
    .filter((req) => (req.status || 'pending') === 'pending')
    .reduce((sum, req) => sum + (req.price || req.amount || req.totalAmount || getProductPrice(req.product)), 0);

  // Online vs Offline Metrics
  const onlineRequests = deliveryRequests.filter((r) => (r.orderSource || 'online') === 'online');
  const offlineRequests = deliveryRequests.filter((r) => r.orderSource === 'offline');

  const onlineRevenue = onlineRequests.reduce((sum, r) => sum + (r.price || r.amount || r.totalAmount || getProductPrice(r.product)), 0);
  const offlineRevenue = offlineRequests.reduce((sum, r) => sum + (r.price || r.amount || r.totalAmount || getProductPrice(r.product)), 0);

  const localAvgOrderValue = deliveryRequests.length > 0 ? Math.round(localTotalSalesRevenue / deliveryRequests.length) : 0;

  const itemSalesCount = {};
  deliveryRequests.forEach((req) => {
    const item = req.product || req.productName || 'Standard Product';
    itemSalesCount[item] = (itemSalesCount[item] || 0) + 1;
  });
  const localTopSellingItems = Object.entries(itemSalesCount)
    .map(([name, count]) => ({ name, count, revenue: count * getProductPrice(name) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalSalesRevenue = salesAnalytics?.totalRevenue ?? salesAnalytics?.totalSalesRevenue ?? localTotalSalesRevenue;
  const dispatchedRevenue = salesAnalytics?.dispatchedRevenue ?? localDispatchedRevenue;
  const pendingRevenue = salesAnalytics?.pendingRevenue ?? localPendingRevenue;
  const avgOrderValue = salesAnalytics?.avgOrderValue ?? localAvgOrderValue;
  const topSellingItems = salesAnalytics?.topSellingItems || salesAnalytics?.topItems || localTopSellingItems;

  // --- PRODUCT VS PRODUCT COMPARISON HELPER ---
  const getProductStats = (prodName) => {
    if (!prodName) return null;
    const prodObj = products.find((p) => (p.name || p.title) === prodName);
    const relatedOrders = deliveryRequests.filter(
      (r) => (r.product || r.productName || '').toLowerCase() === prodName.toLowerCase()
    );
    const unitsSold = relatedOrders.length;
    const revenue = relatedOrders.reduce(
      (sum, r) => sum + (r.price || r.amount || r.totalAmount || Number(prodObj?.price) || 0),
      0
    );
    const onlineOrders = relatedOrders.filter((r) => (r.orderSource || 'online') === 'online').length;
    const offlineOrders = relatedOrders.filter((r) => r.orderSource === 'offline').length;

    return {
      details: prodObj,
      unitsSold,
      revenue,
      onlineOrders,
      offlineOrders,
    };
  };

  const statsA = getProductStats(productA);
  const statsB = getProductStats(productB);

  // --- PDF EXPORT GENERATOR ---
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales & Revenue Report - Kamran Sports</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #1a1a1a; }
            .header { border-bottom: 3px solid #A6362B; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-between: space-between; align-items: center; }
            .title { font-size: 22px; font-weight: bold; color: #0B120D; text-transform: uppercase; }
            .subtitle { font-size: 12px; color: #A6362B; font-weight: bold; }
            .date { text-align: right; font-size: 12px; color: #666; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .kpi-card { background: #FAFAF7; border: 1px solid #E8E4D9; padding: 15px; border-radius: 8px; }
            .kpi-title { font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; margin-bottom: 5px; }
            .kpi-value { font-size: 18px; font-weight: bold; color: #0B120D; font-family: monospace; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { background: #0B120D; color: #fff; padding: 10px; text-align: left; text-transform: uppercase; font-size: 10px; }
            td { padding: 10px; border-bottom: 1px solid #E8E4D9; }
            tr:nth-child(even) { background: #FAFAF7; }
            .status { font-weight: bold; text-transform: uppercase; font-size: 10px; padding: 3px 6px; border-radius: 4px; }
            .dispatched { background: #d1fae5; color: #047857; }
            .pending { background: #ffedd5; color: #c2410c; }
            .source { font-weight: bold; text-transform: uppercase; font-size: 9px; padding: 2px 5px; border-radius: 3px; }
            .online { background: #dbeafe; color: #1e40af; }
            .offline { background: #fef3c7; color: #92400e; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Kamran Sports</div>
              <div class="subtitle">Official Sales & Revenue Analytics Report</div>
            </div>
            <div class="date">
              Report Generated:<br><strong>${dateStr}</strong>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Total Gross Revenue</div>
              <div class="kpi-value">PKR ${totalSalesRevenue.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Online Revenue</div>
              <div class="kpi-value">PKR ${onlineRevenue.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Offline Revenue</div>
              <div class="kpi-value">PKR ${offlineRevenue.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Orders</div>
              <div class="kpi-value">${deliveryRequests.length}</div>
            </div>
          </div>

          <h3 style="font-size: 14px; text-transform: uppercase; margin-bottom: 10px; color: #0B120D;">Order Details & Delivery Requests</h3>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Source</th>
                <th>Phone</th>
                <th>City</th>
                <th>Product</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${deliveryRequests.map(r => `
                <tr>
                  <td><strong>${r.name || r.customerName}</strong></td>
                  <td><span class="source ${r.orderSource === 'offline' ? 'offline' : 'online'}">${r.orderSource || 'online'}</span></td>
                  <td>${r.phone || r.phoneNumber}</td>
                  <td>${r.city || 'N/A'}</td>
                  <td>${r.product || r.productName || 'Standard Product'}</td>
                  <td><span class="status ${r.status === 'dispatched' ? 'dispatched' : 'pending'}">${r.status || 'pending'}</span></td>
                  <td style="font-family: monospace;">PKR ${(r.price || r.amount || r.totalAmount || getProductPrice(r.product)).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Generated automatically by Kamran Sports Admin Panel Dashboard System.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredDeliveryRequests = deliveryRequests.filter((r) => {
    const matchesStatus = deliveryStatusFilter === 'All' ? true : (r.status || 'pending') === deliveryStatusFilter;
    const matchesSource = deliverySourceFilter === 'All' ? true : (r.orderSource || 'online') === deliverySourceFilter;
    return matchesStatus && matchesSource;
  });
  const pendingDeliveryCount = deliveryRequests.filter((r) => (r.status || 'pending') === 'pending').length;

  const filteredReviews = reviews.filter((r) =>
    reviewStatusFilter === 'All'
      ? true
      : reviewStatusFilter === 'Approved'
      ? r.approved
      : !r.approved
  );
  const pendingReviewCount = reviews.filter((r) => !r.approved).length;

  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const query = searchQuery.toLowerCase();
    const subCat = p.subCategory || p.subcategory || '';
    const pName = p.name || p.title || '';
    return matchesCategory && (pName.toLowerCase().includes(query) || p.productId?.toLowerCase().includes(query) || subCat.toLowerCase().includes(query));
  });

  const filteredStars = stars.filter((s) => {
    if (starCategoryFilter === 'All') return true;
    return s.category?.toLowerCase().includes(starCategoryFilter.toLowerCase());
  });

  const inStockCount = products.filter((p) => p.inStock !== false).length;
  const outOfStockCount = products.length - inStockCount;

  const navBtnClass = (active) =>
    `group relative w-full flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl text-[11.5px] font-bold uppercase tracking-wider transition-all duration-150 ${
      active
        ? 'bg-white/[0.08] text-white shadow-[inset_3px_0_0_0_#C79A44]'
        : 'text-white/45 hover:bg-white/[0.04] hover:text-white/80'
    }`;

  const PAGE_TITLES = {
    sales: 'Sales & Revenue Dashboard',
    'manage-hero': 'Hero Slides',
    'add-hero': editingHeroId ? 'Edit Hero Slide' : 'Add Hero Slide',
    manage: 'Product Catalog',
    add: editingId ? 'Edit Product' : 'Add New Product',
    'manage-stars': 'Store Stars',
    'add-star': editingStarId ? 'Edit Star' : 'Add New Star',
    'manage-willow': 'Willow Gallery',
    'add-willow': 'Add Willow Image',
    'delivery-requests': 'Delivery Requests & Sales',
    reviews: 'Customer Reviews',
  };

  const NavBadge = ({ children }) => (
    <span className="ml-auto text-[10px] font-bold bg-white/10 text-white/70 px-1.5 py-0.5 rounded-full">{children}</span>
  );

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#1a1a1a] font-sans antialiased flex">
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[272px] shrink-0 bg-gradient-to-b from-[#0B120D] to-[#0e1712] border-r border-white/5 z-50 flex flex-col transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="bg-white/[0.06] rounded-xl p-2 flex items-center justify-center shrink-0 ring-1 ring-white/10">
            <img src="/logo.jpg" alt="Kamran Sports" className="h-9 w-auto object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-[15px] text-white tracking-wide uppercase leading-tight truncate">Kamran Sports</h1>
            <p className="text-[10px] font-semibold text-[#C79A44] tracking-[0.2em] uppercase">Admin Portal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-white/50 hover:text-white shrink-0">
            <Icon path={ICONS.close} className="w-5 h-5" />
          </button>
        </div>
        <div className="mx-5 h-px bg-white/[0.06]" />

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
          <div className="space-y-1">
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Overview</p>
            <button onClick={() => { switchTab('sales'); setSidebarOpen(false); }} className={navBtnClass(activeTab === 'sales')}>
              <Icon path={ICONS.chart} className="w-4 h-4 shrink-0" />
              <span>Sales & Analytics</span>
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Catalog</p>
            <button onClick={() => { switchTab('manage'); setSidebarOpen(false); }} className={navBtnClass(activeTab === 'manage')}>
              <Icon path={ICONS.package} className="w-4 h-4 shrink-0" />
              <span>Products</span>
              <NavBadge>{filteredProducts.length}</NavBadge>
            </button>
            <button onClick={() => { handleCancelEdit(); switchTab('add'); setSidebarOpen(false); }} className={navBtnClass(activeTab === 'add')}>
              <Icon path={editingId ? ICONS.edit : ICONS.plus} className="w-4 h-4 shrink-0" />
              <span>{editingId ? 'Edit Product' : 'Add Product'}</span>
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Storefront</p>
            <button onClick={() => { switchTab('manage-hero'); setSidebarOpen(false); }} className={navBtnClass(activeTab === 'manage-hero')}>
              <Icon path={ICONS.image} className="w-4 h-4 shrink-0" />
              <span>Hero Slides</span>
              <NavBadge>{heroSlides.length}</NavBadge>
            </button>
            <button
              onClick={() => { handleCancelHeroEdit(); switchTab('add-hero'); setSidebarOpen(false); }}
              className={navBtnClass(activeTab === 'add-hero')}
            >
              <Icon path={editingHeroId ? ICONS.edit : ICONS.plus} className="w-4 h-4 shrink-0" />
              <span>{editingHeroId ? 'Edit Hero Slide' : 'Add Hero Slide'}</span>
            </button>
            <button onClick={() => { switchTab('manage-willow'); setSidebarOpen(false); }} className={navBtnClass(activeTab === 'manage-willow')}>
              <Icon path={ICONS.image} className="w-4 h-4 shrink-0" />
              <span>Willow Gallery</span>
              <NavBadge>{willowImages.length}</NavBadge>
            </button>
            <button
              onClick={() => { setWillowFormData(EMPTY_WILLOW_FORM); switchTab('add-willow'); setSidebarOpen(false); }}
              className={navBtnClass(activeTab === 'add-willow')}
            >
              <Icon path={ICONS.plus} className="w-4 h-4 shrink-0" />
              <span>Add Willow Image</span>
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Team</p>
            <button onClick={() => { switchTab('manage-stars'); setSidebarOpen(false); }} className={navBtnClass(activeTab === 'manage-stars')}>
              <Icon path={ICONS.star} className="w-4 h-4 shrink-0" />
              <span>Stars</span>
              <NavBadge>{stars.length}</NavBadge>
            </button>
            <button
              onClick={() => { handleCancelStarEdit(); switchTab('add-star'); setSidebarOpen(false); }}
              className={navBtnClass(activeTab === 'add-star')}
            >
              <Icon path={editingStarId ? ICONS.edit : ICONS.plus} className="w-4 h-4 shrink-0" />
              <span>{editingStarId ? 'Edit Star' : 'Add Star'}</span>
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Orders & Feedback</p>
            <button onClick={() => { switchTab('delivery-requests'); setSidebarOpen(false); }} className={navBtnClass(activeTab === 'delivery-requests')}>
              <Icon path={ICONS.package} className="w-4 h-4 shrink-0" />
              <span>Delivery Requests</span>
              {pendingDeliveryCount > 0 && <NavBadge>{pendingDeliveryCount}</NavBadge>}
            </button>
            <button onClick={() => { switchTab('reviews'); setSidebarOpen(false); }} className={navBtnClass(activeTab === 'reviews')}>
              <Icon path={ICONS.star} className="w-4 h-4 shrink-0" />
              <span>Reviews</span>
              {pendingReviewCount > 0 && <NavBadge>{pendingReviewCount}</NavBadge>}
            </button>
          </div>
        </nav>

        <div className="p-4 pt-3">
          <div className="mx-1 mb-3 h-px bg-white/[0.06]" />
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white text-[11px] font-bold px-4 py-3 rounded-xl transition-colors uppercase tracking-wider ring-1 ring-white/10"
          >
            <span>View Live Store</span>
            <Icon path={ICONS.external} className="w-3.5 h-3.5 text-[#C79A44]" />
          </a>
        </div>
      </aside>

      {/* MAIN COLUMN */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 bg-[#F5F3ED]/90 backdrop-blur-md border-b border-[#E8E4D9]">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#0B120D] shrink-0">
                <Icon path={ICONS.menu} className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h2 className="font-bold text-lg text-[#0B120D] tracking-wide truncate">{PAGE_TITLES[activeTab] || 'Dashboard'}</h2>
                <p className="text-[11px] text-neutral-400 hidden sm:block">Inventory, Sales & Admin Portal</p>
              </div>
            </div>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="bg-[#0B120D] hover:bg-[#A6362B] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Icon path={ICONS.plus} className="w-4 h-4 text-[#C79A44]" />
              <span className="hidden sm:inline">Record Manual Entry</span>
              <span className="sm:hidden">Add Order</span>
            </button>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          {/* STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-neutral-400 mb-1">Total Products</p>
                  <p className="text-3xl font-bold text-[#0B120D] font-mono">{products.length}</p>
                </div>
                <div className="p-3 bg-[#0B120D] rounded-xl group-hover:scale-105 transition-transform">
                  <Icon path={ICONS.inventory} className="w-5 h-5 text-[#C79A44]" />
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-emerald-600 mb-1">In Stock</p>
                  <p className="text-3xl font-bold text-emerald-700 font-mono">{inStockCount}</p>
                </div>
                <div className="p-3 bg-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
                  <Icon path={ICONS.stock} className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-[#A6362B] mb-1">Out of Stock</p>
                  <p className="text-3xl font-bold text-[#A6362B] font-mono">{outOfStockCount}</p>
                </div>
                <div className="p-3 bg-[#A6362B] rounded-xl group-hover:scale-105 transition-transform">
                  <Icon path={ICONS.outOfStock} className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-[#C79A44] mb-1">Total Stars</p>
                  <p className="text-3xl font-bold text-[#0B120D] font-mono">{stars.length}</p>
                </div>
                <div className="p-3 bg-[#C79A44] rounded-xl group-hover:scale-105 transition-transform">
                  <Icon path={ICONS.star} className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-blue-600 mb-1">Hero Slides</p>
                  <p className="text-3xl font-bold text-[#0B120D] font-mono">{heroSlides.length}</p>
                </div>
                <div className="p-3 bg-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                  <Icon path={ICONS.image} className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-orange-600 mb-1">Pending Deliveries</p>
                  <p className="text-3xl font-bold text-orange-700 font-mono">{pendingDeliveryCount}</p>
                </div>
                <div className="p-3 bg-orange-600 rounded-xl group-hover:scale-105 transition-transform">
                  <Icon path={ICONS.package} className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-purple-600 mb-1">Pending Reviews</p>
                  <p className="text-3xl font-bold text-purple-700 font-mono">{pendingReviewCount}</p>
                </div>
                <div className="p-3 bg-purple-600 rounded-xl group-hover:scale-105 transition-transform">
                  <Icon path={ICONS.star} className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {message.text && (
            <div className={`mb-6 rounded-xl border p-4 flex items-center justify-between ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-[#A6362B]'
            }`}>
              <p className="text-sm font-semibold">{message.text}</p>
              <button onClick={() => setMessage({ type: '', text: '' })}>
                <Icon path={ICONS.close} className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 0: SALES & REVENUE DASHBOARD */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              {/* Header Action Bar */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8E4D9]/80 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                <div>
                  <h2 className="font-bold text-lg text-[#0B120D] tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#A6362B] rounded-full inline-block" />
                    Sales & Revenue Dashboard
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1 ml-4">Real-time revenue analytics, online/offline breakdown & order metrics</p>
                </div>

                <div className="flex items-center gap-2.5 w-full lg:w-auto">
                  <button
                    onClick={() => setIsManualModalOpen(true)}
                    className="flex-1 lg:flex-none bg-[#C79A44] hover:bg-[#b58a3a] text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Icon path={ICONS.plus} className="w-4 h-4" />
                    <span>Manual Order</span>
                  </button>
                  <button
                    onClick={fetchSalesAnalytics}
                    className="flex-1 lg:flex-none bg-white hover:bg-[#FAFAF7] text-[#0B120D] border border-[#E0DCD1] text-xs font-bold px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon path={ICONS.chart} className="w-4 h-4 text-neutral-400" />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 lg:flex-none bg-[#0B120D] hover:bg-[#1a251c] text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Icon path={ICONS.download} className="w-4 h-4 text-[#C79A44]" />
                    <span>PDF Report</span>
                  </button>
                </div>
              </div>

              {/* KPI Revenue Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative bg-white p-6 rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <span className="absolute top-0 left-0 w-full h-1 bg-[#0B120D]" />
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">Total Gross Revenue</p>
                    <div className="p-2 bg-[#0B120D]/5 text-[#0B120D] rounded-lg">
                      <Icon path={ICONS.chart} className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold font-mono text-[#0B120D] tracking-tight">PKR {totalSalesRevenue.toLocaleString()}</h3>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-md mt-3 inline-block">
                    Calculated across all orders
                  </span>
                </div>

                <div className="relative bg-white p-6 rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <span className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">Online Store Revenue</p>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Icon path={ICONS.globe} className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold font-mono text-blue-800 tracking-tight">PKR {onlineRevenue.toLocaleString()}</h3>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded-md mt-3 inline-block">
                    {onlineRequests.length} Online Web Orders
                  </span>
                </div>

                <div className="relative bg-white p-6 rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <span className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">Offline Counter Revenue</p>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <Icon path={ICONS.store} className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold font-mono text-amber-800 tracking-tight">PKR {offlineRevenue.toLocaleString()}</h3>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-md mt-3 inline-block">
                    {offlineRequests.length} Manual Counter Entries
                  </span>
                </div>

                <div className="relative bg-white p-6 rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <span className="absolute top-0 left-0 w-full h-1 bg-[#C79A44]" />
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#C79A44]">Average Order Value</p>
                    <div className="p-2 bg-[#FDF8EE] text-[#C79A44] rounded-lg">
                      <Icon path={ICONS.package} className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold font-mono text-[#0B120D] tracking-tight">PKR {avgOrderValue.toLocaleString()}</h3>
                  <span className="text-[10px] text-[#96742f] font-bold bg-[#FDF8EE] px-2 py-1 rounded-md mt-3 inline-block">
                    Per Order Average
                  </span>
                </div>
              </div>

              {/* PRODUCT VS PRODUCT COMPARISON */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E4D9]/80 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 pb-5 border-b border-[#E8E4D9]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#A6362B]/10 text-[#A6362B] rounded-xl">
                      <Icon path={ICONS.compare} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wide text-[#0B120D]">Product vs Product Comparison</h3>
                      <p className="text-xs text-neutral-500">Compare sales volume, total revenue, and channel distribution</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none lg:w-56">
                      <select
                        value={productA}
                        onChange={(e) => setProductA(e.target.value)}
                        className="w-full appearance-none bg-[#FAFAF7] border border-[#E0DCD1] text-xs font-bold pl-3 pr-9 py-2.5 rounded-xl text-[#0B120D] focus:outline-none focus:border-[#C79A44]"
                      >
                        <option value="">Select Product A</option>
                        {products.map((p) => (
                          <option key={p._id} value={p.name || p.title}>{p.name || p.title}</option>
                        ))}
                      </select>
                      <Icon path={ICONS.chevron} className="w-3.5 h-3.5 text-neutral-400 rotate-90 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#0B120D] text-[#C79A44] text-[10px] font-bold uppercase">
                      Vs
                    </span>

                    <div className="relative flex-1 lg:flex-none lg:w-56">
                      <select
                        value={productB}
                        onChange={(e) => setProductB(e.target.value)}
                        className="w-full appearance-none bg-[#FAFAF7] border border-[#E0DCD1] text-xs font-bold pl-3 pr-9 py-2.5 rounded-xl text-[#0B120D] focus:outline-none focus:border-[#C79A44]"
                      >
                        <option value="">Select Product B</option>
                        {products.map((p) => (
                          <option key={p._id} value={p.name || p.title}>{p.name || p.title}</option>
                        ))}
                      </select>
                      <Icon path={ICONS.chevron} className="w-3.5 h-3.5 text-neutral-400 rotate-90 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="relative bg-[#FAFAF7] rounded-2xl border border-[#E8E4D9] overflow-hidden">
                    <span className="absolute top-0 left-0 w-full h-1 bg-[#0B120D]" />
                    <div className="p-5">
                      {statsA ? (
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <SafeImage src={statsA.details?.image} alt={productA} className="w-14 h-14 object-cover rounded-xl border border-[#E0DCD1]" />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase bg-[#0B120D] text-white px-2 py-0.5 rounded-full">Product A</span>
                              <h4 className="font-bold text-sm text-[#0B120D] mt-1.5 truncate">{productA}</h4>
                              <p className="text-xs text-neutral-500 font-mono">PKR {Number(statsA.details?.price || 0).toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-white p-3 rounded-xl border border-[#E0DCD1]">
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Units Sold</p>
                              <p className="text-xl font-bold font-mono text-[#0B120D]">{statsA.unitsSold}</p>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-[#E0DCD1]">
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Total Revenue</p>
                              <p className="text-xl font-bold font-mono text-[#A6362B]">PKR {statsA.revenue.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#E0DCD1] flex justify-between gap-2">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">Online: {statsA.onlineOrders}</span>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">Offline: {statsA.offlineOrders}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 italic text-center py-8">Select Product A to compare</p>
                      )}
                    </div>
                  </div>

                  <div className="relative bg-[#FAFAF7] rounded-2xl border border-[#E8E4D9] overflow-hidden">
                    <span className="absolute top-0 left-0 w-full h-1 bg-[#A6362B]" />
                    <div className="p-5">
                      {statsB ? (
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <SafeImage src={statsB.details?.image} alt={productB} className="w-14 h-14 object-cover rounded-xl border border-[#E0DCD1]" />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase bg-[#A6362B] text-white px-2 py-0.5 rounded-full">Product B</span>
                              <h4 className="font-bold text-sm text-[#0B120D] mt-1.5 truncate">{productB}</h4>
                              <p className="text-xs text-neutral-500 font-mono">PKR {Number(statsB.details?.price || 0).toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-white p-3 rounded-xl border border-[#E0DCD1]">
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Units Sold</p>
                              <p className="text-xl font-bold font-mono text-[#0B120D]">{statsB.unitsSold}</p>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-[#E0DCD1]">
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Total Revenue</p>
                              <p className="text-xl font-bold font-mono text-[#A6362B]">PKR {statsB.revenue.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#E0DCD1] flex justify-between gap-2">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">Online: {statsB.onlineOrders}</span>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">Offline: {statsB.offlineOrders}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 italic text-center py-8">Select Product B to compare</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#E8E4D9]/80 shadow-sm">
                  <h3 className="font-bold text-sm uppercase text-[#0B120D] mb-4">Sales Source Breakdown</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-blue-700 uppercase">Online Website Sales</span>
                        <span>
                          {deliveryRequests.length > 0
                            ? Math.round((onlineRequests.length / deliveryRequests.length) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${deliveryRequests.length > 0 ? (onlineRequests.length / deliveryRequests.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-amber-700 uppercase">Offline Counter Sales</span>
                        <span>
                          {deliveryRequests.length > 0
                            ? Math.round((offlineRequests.length / deliveryRequests.length) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${deliveryRequests.length > 0 ? (offlineRequests.length / deliveryRequests.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#E8E4D9]/80 shadow-sm">
                  <h3 className="font-bold text-sm uppercase text-[#0B120D] mb-4">Top Selling Items Breakdown</h3>
                  {topSellingItems.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">No sales data recorded yet.</p>
                  ) : (
                    <div className="divide-y divide-[#F0EDE4]/80">
                      {topSellingItems.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-xs text-[#0B120D]">{item.name}</p>
                            <p className="text-[10px] text-neutral-400">{item.count} total orders</p>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#A6362B]">
                            PKR {item.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: ADD / EDIT HERO SLIDE */}
          {activeTab === 'add-hero' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E8E4D9]">
                <h2 className="font-bold text-sm uppercase text-[#0B120D]">
                  {editingHeroId ? 'Edit Hero Slide Details' : 'Add New Hero Slide Image'}
                </h2>
                {editingHeroId && (
                  <button onClick={handleCancelHeroEdit} className="text-xs text-[#A6362B] font-bold uppercase">
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleHeroSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Badge Text *</label>
                      <input
                        type="text"
                        name="badge"
                        value={heroFormData.badge}
                        onChange={handleHeroChange}
                        required
                        placeholder="STEP UP YOUR GAME"
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Main Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={heroFormData.title}
                        onChange={handleHeroChange}
                        required
                        placeholder="SPIKE INTO ACTION"
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Subtitle *</label>
                      <textarea
                        name="subtitle"
                        value={heroFormData.subtitle}
                        onChange={handleHeroChange}
                        required
                        rows="3"
                        placeholder="Cricket & football footwear engineered for grip..."
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">CTA Button Text</label>
                        <input
                          type="text"
                          name="cta"
                          value={heroFormData.cta}
                          onChange={handleHeroChange}
                          placeholder="SHOP FOOTWEAR"
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Link URL</label>
                        <input
                          type="text"
                          name="link"
                          value={heroFormData.link}
                          onChange={handleHeroChange}
                          placeholder="#collection"
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Hero Image *</label>
                      <div className="relative border-2 border-dashed border-[#E0DCD1] rounded-xl p-2 text-center">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        {imagePreview ? (
                          <div className="relative group">
                            <img src={imagePreview} alt="Hero Preview" className="w-full h-48 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={handleClearImage}
                              className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md"
                            >
                              ✕ Clear Image
                            </button>
                          </div>
                        ) : (
                          <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer py-10 hover:bg-[#FAFAF7] transition rounded-lg">
                            <p className="text-xs text-neutral-400 font-semibold">Upload Banner Image (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase py-4 rounded-xl transition"
                    >
                      {loading ? 'Processing...' : editingHeroId ? 'Update Hero Slide' : 'Save Hero Slide'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MANAGE HERO SLIDES */}
          {activeTab === 'manage-hero' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAFAF7]/70 border-b border-[#E8E4D9]/80 flex justify-between items-center">
                <h2 className="font-bold text-sm uppercase text-[#0B120D]">Active Hero Slides Banner List</h2>
                <button
                  onClick={() => {
                    handleCancelHeroEdit();
                    switchTab('add-hero');
                  }}
                  className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition"
                >
                  + Add New Slide
                </button>
              </div>

              <div className="divide-y divide-[#F0EDE4]/80">
                {heroSlides.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No hero slides found in database.
                  </div>
                ) : (
                  heroSlides.map((slide) => (
                    <div key={slide._id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-[#FAFAF7]">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <SafeImage src={slide.image} alt={slide.title} className="w-24 h-16 object-cover rounded-lg border border-[#E8E4D9]" />
                        <div>
                          <span className="text-[10px] font-bold uppercase bg-[#0B120D] text-white px-2 py-0.5 rounded">
                            {slide.badge || 'TAGLINE'}
                          </span>
                          <h3 className="font-bold text-sm text-[#0B120D] mt-1">{slide.title}</h3>
                          <p className="text-xs text-neutral-500 line-clamp-1">{slide.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleEditHeroClick(slide)}
                          className="bg-[#0B120D] hover:bg-[#C79A44] text-white text-xs font-bold px-3 py-1.5 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHeroClick(slide._id)}
                          className="bg-red-50 text-[#A6362B] border border-red-200 text-xs font-bold px-3 py-1.5 rounded hover:bg-[#A6362B] hover:text-white transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADD PRODUCT */}
          {activeTab === 'add' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E8E4D9]">
                <h2 className="font-bold text-sm uppercase text-[#0B120D]">
                  {editingId ? 'Edit Product Details' : 'Add New Product'}
                </h2>
                {editingId && (
                  <button onClick={handleCancelEdit} className="text-xs text-[#A6362B] font-bold uppercase">
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Product Code *</label>
                        <input
                          type="text"
                          name="productId"
                          value={formData.productId}
                          onChange={handleChange}
                          required
                          placeholder="KS-101"
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm font-mono focus:outline-none focus:border-[#C79A44]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Product Title *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Kamran Gold Edition English Willow"
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Price (PKR) *</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          placeholder="25000"
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm font-mono focus:outline-none focus:border-[#C79A44]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Category *</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                        >
                          {MAIN_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Subcategory *</label>
                        <select
                          name="subCategory"
                          value={formData.subCategory}
                          onChange={handleChange}
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                        >
                          {CATEGORY_MAP[formData.category]?.map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="Kamran Sports"
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Enter specifications..."
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-[#FAFAF7] p-4 rounded-lg border border-[#E0DCD1]">
                      <span className="text-xs font-bold uppercase text-[#0B120D]">In Stock Availability</span>
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleChange}
                        className="w-5 h-5 accent-[#A6362B] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Image Upload</label>
                      <div className="relative border-2 border-dashed border-[#E0DCD1] rounded-xl p-2 text-center">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        {imagePreview ? (
                          <div className="relative group">
                            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={handleClearImage}
                              className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md"
                            >
                              ✕ Clear Image
                            </button>
                          </div>
                        ) : (
                          <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer py-10 hover:bg-[#FAFAF7] transition rounded-lg">
                            <p className="text-xs text-neutral-400 font-semibold">Click or drag image here (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#A6362B] hover:bg-[#8C2C22] text-white text-xs font-bold uppercase py-4 rounded-xl transition"
                    >
                      {loading ? 'Processing...' : editingId ? 'Update Product' : 'Publish Product'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: MANAGE PRODUCTS */}
          {activeTab === 'manage' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAFAF7]/70 border-b border-[#E8E4D9]/80 flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-white border border-[#E0DCD1] px-4 py-2 rounded-lg text-sm focus:outline-none"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white border border-[#E0DCD1] px-4 py-2 rounded-lg text-sm focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {MAIN_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="divide-y divide-[#F0EDE4]/80">
                {filteredProducts.map((p) => (
                  <div key={p._id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <SafeImage src={p.image} alt={p.name || p.title} className="w-14 h-14 object-cover rounded-lg border border-[#E8E4D9]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-[#0B120D] text-white text-[10px] font-mono px-2 py-0.5 rounded">{p.productId || 'N/A'}</span>
                          <span className="text-[10px] font-bold uppercase bg-[#F0EDE4] px-2 py-0.5 rounded">{p.category}</span>
                          <span className="text-[10px] font-bold uppercase bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">{p.subCategory || p.subcategory}</span>
                        </div>
                        <h3 className="font-bold text-sm text-[#0B120D] mt-1">{p.name || p.title}</h3>
                        <p className="text-xs font-mono font-bold text-neutral-500">PKR {p.price?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="bg-[#0B120D] hover:bg-[#C79A44] text-white text-xs font-bold px-3 py-1.5 rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p._id)}
                        className="bg-red-50 text-[#A6362B] border border-red-200 text-xs font-bold px-3 py-1.5 rounded hover:bg-[#A6362B] hover:text-white transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ADD / EDIT STAR */}
          {activeTab === 'add-star' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E8E4D9]">
                <h2 className="font-bold text-sm uppercase text-[#0B120D]">
                  {editingStarId ? 'Edit Star Details' : 'Add New Player / Star'}
                </h2>
                {editingStarId && (
                  <button onClick={handleCancelStarEdit} className="text-xs text-[#A6362B] font-bold uppercase">
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleStarSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Player Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={starFormData.name}
                          onChange={handleStarChange}
                          required
                          placeholder="e.g. Babar Azam"
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={starFormData.city}
                          onChange={handleStarChange}
                          required
                          placeholder="e.g. LAHORE"
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Player Role / Tag *</label>
                        <input
                          type="text"
                          name="role"
                          value={starFormData.role}
                          onChange={handleStarChange}
                          required
                          placeholder="e.g. HARDBALL KING / TOP BATSMAN"
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Category *</label>
                        <select
                          name="category"
                          value={starFormData.category}
                          onChange={handleStarChange}
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                        >
                          <option value="Tapeball">Tapeball Star</option>
                          <option value="Hardball Star">Hardball Star</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Player Image</label>
                      <div className="relative border-2 border-dashed border-[#E0DCD1] rounded-xl p-2 text-center">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        {imagePreview ? (
                          <div className="relative group">
                            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={handleClearImage}
                              className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md"
                            >
                              ✕ Clear Image
                            </button>
                          </div>
                        ) : (
                          <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer py-10 hover:bg-[#FAFAF7] transition rounded-lg">
                            <p className="text-xs text-neutral-400 font-semibold">Upload player photo (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#C79A44] hover:bg-[#b58a3a] text-white text-xs font-bold uppercase py-4 rounded-xl transition"
                    >
                      {loading ? 'Processing...' : editingStarId ? 'Update Star' : 'Save Star'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: MANAGE STARS */}
          {activeTab === 'manage-stars' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAFAF7]/70 border-b border-[#E8E4D9]/80 flex justify-between items-center">
                <h2 className="font-bold text-sm uppercase text-[#0B120D]">All Registered Stars</h2>
                <select
                  value={starCategoryFilter}
                  onChange={(e) => setStarCategoryFilter(e.target.value)}
                  className="bg-white border border-[#E0DCD1] px-4 py-2 rounded-lg text-sm focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Tapeball">Tapeball</option>
                  <option value="Hardball">Hardball</option>
                </select>
              </div>

              <div className="divide-y divide-[#F0EDE4]/80">
                {filteredStars.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No stars added yet.</div>
                ) : (
                  filteredStars.map((s) => (
                    <div key={s._id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <SafeImage src={s.image} alt={s.name} className="w-14 h-14 object-cover rounded-lg border border-[#E8E4D9]" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase bg-[#0B120D] text-white px-2 py-0.5 rounded">
                              📍 {s.city}
                            </span>
                            <span className="text-[10px] font-bold uppercase bg-[#C79A44] text-white px-2 py-0.5 rounded">
                              {s.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-[#0B120D] mt-1">{s.name}</h3>
                          <p className="text-xs font-mono font-bold text-[#A6362B]">{s.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditStarClick(s)}
                          className="bg-[#0B120D] hover:bg-[#C79A44] text-white text-xs font-bold px-3 py-1.5 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStarClick(s._id)}
                          className="bg-red-50 text-[#A6362B] border border-red-200 text-xs font-bold px-3 py-1.5 rounded hover:bg-[#A6362B] hover:text-white transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: ADD WILLOW IMAGE */}
          {activeTab === 'add-willow' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm p-8 max-w-xl">
              <h2 className="font-bold text-sm uppercase text-[#0B120D] mb-6 pb-4 border-b border-[#E8E4D9]">
                Add Willow Image
              </h2>
              <form onSubmit={handleWillowSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Willow Wood Photo</label>
                  <div className="relative border-2 border-dashed border-[#E0DCD1] rounded-xl p-2 text-center">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    {imagePreview ? (
                      <div className="relative group">
                        <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover rounded-lg" />
                        <button type="button" onClick={handleClearImage}
                          className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                          ✕ Clear Image
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer py-14 hover:bg-[#FAFAF7] transition rounded-lg">
                        <p className="text-xs text-neutral-400 font-semibold">Upload plain willow-wood photo (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#C79A44] hover:bg-[#b58a3a] text-white text-xs font-bold uppercase py-4 rounded-xl transition">
                  {loading ? 'Uploading...' : 'Save Willow Image'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 8: MANAGE WILLOW GALLERY */}
          {activeTab === 'manage-willow' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAFAF7]/70 border-b border-[#E8E4D9]/80">
                <h2 className="font-bold text-sm uppercase text-[#0B120D]">Willow Gallery ({willowImages.length})</h2>
              </div>
              {willowImages.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No willow images added yet.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
                  {willowImages.map((img) => (
                    <div key={img._id} className="relative group rounded-xl overflow-hidden border border-[#E8E4D9]">
                      <SafeImage src={img.url || img.image} alt="Willow" className="w-full h-32 object-cover" />
                      <button
                        onClick={() => handleDeleteWillowClick(img._id)}
                        className="absolute top-2 right-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: DELIVERY REQUESTS & SALES RECORDS */}
          {activeTab === 'delivery-requests' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAFAF7]/70 border-b border-[#E8E4D9]/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="font-bold text-sm uppercase text-[#0B120D]">Delivery Requests & Sales Records ({filteredDeliveryRequests.length})</h2>
                
                <div className="flex items-center gap-3">
                  <select
                    value={deliverySourceFilter}
                    onChange={(e) => setDeliverySourceFilter(e.target.value)}
                    className="bg-white border border-[#E0DCD1] px-3 py-1.5 rounded-lg text-xs font-bold text-[#0B120D] focus:outline-none"
                  >
                    <option value="All">All Sources (Online & Offline)</option>
                    <option value="online">Online Orders</option>
                    <option value="offline">Offline Counter Sales</option>
                  </select>

                  <select
                    value={deliveryStatusFilter}
                    onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                    className="bg-white border border-[#E0DCD1] px-3 py-1.5 rounded-lg text-xs font-bold text-[#0B120D] focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="dispatched">Dispatched</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-[#F0EDE4]/80">
                {filteredDeliveryRequests.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No sales or delivery requests found matching filters.</div>
                ) : (
                  filteredDeliveryRequests.map((req) => {
                    const price = req.price || req.amount || req.totalAmount || getProductPrice(req.product);
                    const isOffline = req.orderSource === 'offline';
                    const isDispatched = req.status === 'dispatched';

                    return (
                      <div key={req._id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#FAFAF7]">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${isOffline ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                              {isOffline ? 'Offline Counter' : 'Online Website'}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${isDispatched ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                              {req.status || 'pending'}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-PK') : 'Recent'}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-[#0B120D]">{req.name || req.customerName || 'Customer'}</h3>
                          <p className="text-xs text-neutral-600">
                            <span className="font-semibold">Phone:</span> {req.phone || req.phoneNumber || 'N/A'} | <span className="font-semibold">City:</span> {req.city || 'N/A'}
                          </p>
                          {req.address && (
                            <p className="text-xs text-neutral-500 mt-0.5">
                              <span className="font-semibold">Address:</span> {req.address}
                            </p>
                          )}
                          <p className="text-xs text-[#0B120D] font-medium mt-1">
                            <span className="font-semibold">Product:</span> {req.product || req.productName || 'Standard Order'}
                          </p>
                          {req.notes && (
                            <p className="text-xs italic text-neutral-400 mt-0.5">
                              Note: {req.notes}
                            </p>
                          )}
                          <p className="text-xs font-mono font-bold text-[#A6362B] mt-1">
                            PKR {price.toLocaleString()} ({req.paymentMethod || 'Cash'})
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          {!isOffline && (
                            <button
                              onClick={() => openWhatsAppForRequest(req)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                            >
                              WhatsApp
                            </button>
                          )}
                          <button
                            onClick={() => handleMarkDispatched(req._id, isDispatched ? 'pending' : 'dispatched')}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                              isDispatched
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            {isDispatched ? 'Mark Pending' : 'Mark Dispatched'}
                          </button>
                          <button
                            onClick={() => handleDeleteDeliveryClick(req._id)}
                            className="bg-red-50 text-[#A6362B] border border-red-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#A6362B] hover:text-white transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 10: CUSTOMER REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAFAF7]/70 border-b border-[#E8E4D9]/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="font-bold text-sm uppercase text-[#0B120D]">Customer Reviews ({filteredReviews.length})</h2>
                <select
                  value={reviewStatusFilter}
                  onChange={(e) => setReviewStatusFilter(e.target.value)}
                  className="bg-white border border-[#E0DCD1] px-3 py-1.5 rounded-lg text-xs font-bold text-[#0B120D] focus:outline-none"
                >
                  <option value="All">All Reviews</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending Approval</option>
                </select>
              </div>

              <div className="divide-y divide-[#F0EDE4]/80">
                {filteredReviews.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No reviews found matching filter.</div>
                ) : (
                  filteredReviews.map((rev) => (
                    <div key={rev._id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#FAFAF7]">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${rev.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                            {rev.approved ? 'Approved' : 'Pending Approval'}
                          </span>
                          <span className="text-xs text-amber-500 font-bold">
                            {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-[#0B120D]">{rev.userName || rev.name || 'Anonymous'}</h3>
                        <p className="text-xs text-neutral-500 mb-1">
                          Product: <span className="font-semibold">{rev.productName || rev.product || 'General'}</span>
                        </p>
                        <p className="text-xs text-neutral-700 italic bg-[#FAFAF7] p-2.5 rounded-lg border border-[#E8E4D9]">
                          "{rev.comment || rev.review || rev.message}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => handleApproveReview(rev._id, !rev.approved)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                            rev.approved
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {rev.approved ? 'Hide Review' : 'Approve & Publish'}
                        </button>
                        <button
                          onClick={() => handleDeleteReviewClick(rev._id)}
                          className="bg-red-50 text-[#A6362B] border border-red-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#A6362B] hover:text-white transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MANUAL ENTRY MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-[#E8E4D9]">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E8E4D9]">
              <div>
                <h3 className="font-bold text-base text-[#0B120D] uppercase tracking-wide">Record Offline Sales Entry</h3>
                <p className="text-xs text-neutral-400">Manual counter/offline sale recording</p>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-neutral-400 hover:text-[#0B120D] transition"
              >
                <Icon path={ICONS.close} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#0B120D] mb-1">Customer Name *</label>
                <input
                  type="text"
                  name="name"
                  value={manualFormData.name}
                  onChange={handleManualChange}
                  required
                  placeholder="Walk-in Customer / Name"
                  className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-2.5 rounded-xl text-xs focus:outline-none focus:border-[#C79A44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D] mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={manualFormData.phone}
                    onChange={handleManualChange}
                    placeholder="03001234567"
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-2.5 rounded-xl text-xs focus:outline-none focus:border-[#C79A44]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D] mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={manualFormData.city}
                    onChange={handleManualChange}
                    placeholder="Sialkot / Store Counter"
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-2.5 rounded-xl text-xs focus:outline-none focus:border-[#C79A44]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#0B120D] mb-1">Product Title / Item *</label>
                <input
                  type="text"
                  name="product"
                  value={manualFormData.product}
                  onChange={handleManualChange}
                  required
                  placeholder="Select or enter item name"
                  className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-2.5 rounded-xl text-xs focus:outline-none focus:border-[#C79A44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D] mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={manualFormData.amount}
                    onChange={handleManualChange}
                    required
                    placeholder="5000"
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-[#C79A44]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D] mb-1">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={manualFormData.paymentMethod}
                    onChange={handleManualChange}
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-2.5 rounded-xl text-xs focus:outline-none focus:border-[#C79A44]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online Transfer">Online Transfer</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#0B120D] mb-1">Notes / Address Details</label>
                <textarea
                  name="notes"
                  value={manualFormData.notes}
                  onChange={handleManualChange}
                  rows="2"
                  placeholder="Optional notes or address details..."
                  className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-2.5 rounded-xl text-xs focus:outline-none focus:border-[#C79A44]"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#0B120D] hover:bg-[#A6362B] text-white text-xs font-bold py-3 rounded-xl transition"
                >
                  {loading ? 'Recording...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}