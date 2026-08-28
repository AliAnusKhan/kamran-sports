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

const CATEGORY_MAP = {
  'Cricket Store': [
    'English Willow', 'Kashmir Willow', 'Tennis Bat', 'My First Kit', 'Cricket Kit',
    'Leather Ball', 'Tennis Ball', 'Trolley', 'Wheelie Kit', 'Wheelie Duffle',
    'Kit', 'Duffle', 'Batting Gloves', 'W.K. Gloves', 'Inner Gloves',
    'Batting Leg Guard', 'Wicket Keeping Leg Guard', 'Elbow Guard', 'Chest Guard',
    'Thigh Pad', 'Inner Thigh Pad', 'Abdo Guard', 'Helmets',
  ],
  'Shoes': ['Spike Shoes', 'Rubber Studs', 'Turf Shoes', 'Running Shoes', 'Training Shoes', 'Indoor Shoes'],
  'Caps': ['Cricket Caps', 'Sun Hats', 'Training Caps', 'Baseball Caps', 'Visors'],
  'Football': ['Match Footballs', 'Training Footballs', 'Futsal Balls', 'Shin Guards', 'Goalkeeper Gloves', 'Football Socks'],
  'Shirt & Trouser': ['Cricket Whites', 'T20 Jerseys', 'Team Shirts', 'Track Trousers', 'Polo Shirts', 'Jackets', 'Compression Wear'],
  'Indoor Games': ['Chess', 'Ludo', 'Cards', 'UNO', 'Carrom', 'Table Tennis', 'Dart Boards'],
  'Bat Repair': ['Grip Replacement', 'Toe Guard Repair', 'Refurbishment', 'Thread Binding'],
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
      alt={alt}
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
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('manage');
  const [products, setProducts] = useState([]);
  const [stars, setStars] = useState([]);
  
  // Product Form State
  const [formData, setFormData] = useState(EMPTY_PRODUCT_FORM);
  const [editingId, setEditingId] = useState(null);

  // Star Form State
  const [starFormData, setStarFormData] = useState(EMPTY_STAR_FORM);
  const [editingStarId, setEditingStarId] = useState(null);
  const [editingStarSource, setEditingStarSource] = useState(null);

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

  const fetchProducts = async () => {
    try {
      const data = await safeFetch('/api/products');
      const list = Array.isArray(data) ? data : (data.data || data.products || []);
      setProducts(list);
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

  useEffect(() => {
    fetchProducts();
    fetchStars();
    return () => dismissTimer.current && clearTimeout(dismissTimer.current);
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
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

  const handleStarChange = (e) => {
    const { name, value } = e.target;
    setStarFormData((prev) => ({ ...prev, [name]: value }));
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
      const isHardball = starFormData.category.toLowerCase().includes('hardball');
      const targetEndpoint = isHardball ? '/api/champions' : '/api/tapeball-stars';

      // Switch target database if editing category changed
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

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans antialiased">
      <header className="bg-white border-b-4 border-[#A6362B] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#F4F1EA] rounded-lg p-2 flex items-center justify-center shrink-0">
              <img src="/logo.jpg" alt="Kamran Sports" className="h-9 w-auto object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-[#0B120D] tracking-wide uppercase leading-tight">
                Kamran Sports
              </h1>
              <p className="text-[11px] font-medium text-[#A6362B] tracking-[0.2em] uppercase">
                Inventory & Stars Admin
              </p>
            </div>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-[#0B120D] hover:bg-[#A6362B] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all uppercase tracking-wider"
          >
            <span>Live Store</span>
            <Icon path={ICONS.external} className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl border border-[#E8E4D9] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-neutral-400 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-[#0B120D] font-mono">{products.length}</p>
              </div>
              <div className="p-3 bg-[#0B120D] rounded-xl">
                <Icon path={ICONS.inventory} className="w-5 h-5 text-[#C79A44]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E8E4D9] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-emerald-600 mb-1">In Stock</p>
                <p className="text-3xl font-bold text-emerald-700 font-mono">{inStockCount}</p>
              </div>
              <div className="p-3 bg-emerald-600 rounded-xl">
                <Icon path={ICONS.stock} className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E8E4D9] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-[#A6362B] mb-1">Out of Stock</p>
                <p className="text-3xl font-bold text-[#A6362B] font-mono">{outOfStockCount}</p>
              </div>
              <div className="p-3 bg-[#A6362B] rounded-xl">
                <Icon path={ICONS.outOfStock} className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E8E4D9] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-[#C79A44] mb-1">Total Stars</p>
                <p className="text-3xl font-bold text-[#0B120D] font-mono">{stars.length}</p>
              </div>
              <div className="p-3 bg-[#C79A44] rounded-xl">
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

        {/* Tab Switcher */}
        <div className="bg-[#F4F1EA] border border-[#E8E4D9] p-1.5 rounded-xl mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              activeTab === 'manage' ? 'bg-[#0B120D] text-white' : 'text-neutral-500 hover:text-[#0B120D]'
            }`}
          >
            <Icon path={ICONS.package} className="w-4 h-4" />
            <span>Manage Catalog ({filteredProducts.length})</span>
          </button>

          <button
            onClick={() => {
              handleCancelEdit();
              setActiveTab('add');
            }}
            className={`px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              activeTab === 'add' ? 'bg-[#A6362B] text-white' : 'text-neutral-500 hover:text-[#0B120D]'
            }`}
          >
            <Icon path={editingId ? ICONS.edit : ICONS.plus} className="w-4 h-4" />
            <span>{editingId ? 'Edit Product' : 'Add Product'}</span>
          </button>

          <button
            onClick={() => setActiveTab('manage-stars')}
            className={`px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              activeTab === 'manage-stars' ? 'bg-[#0B120D] text-white' : 'text-neutral-500 hover:text-[#0B120D]'
            }`}
          >
            <Icon path={ICONS.star} className="w-4 h-4" />
            <span>Manage Stars ({stars.length})</span>
          </button>

          <button
            onClick={() => {
              handleCancelStarEdit();
              setActiveTab('add-star');
            }}
            className={`px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              activeTab === 'add-star' ? 'bg-[#C79A44] text-white' : 'text-neutral-500 hover:text-[#0B120D]'
            }`}
          >
            <Icon path={editingStarId ? ICONS.edit : ICONS.plus} className="w-4 h-4" />
            <span>{editingStarId ? 'Edit Star' : 'Add Star'}</span>
          </button>
        </div>

        {/* TAB 1: ADD PRODUCT */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-sm p-8">
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
                      <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Product Code *</label>
                      <input
                        type="text"
                        name="productId"
                        value={formData.productId}
                        onChange={handleChange}
                        required
                        placeholder="KS-101"
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-lg text-sm font-mono focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Product Title *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Kamran Gold Edition English Willow"
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-lg text-sm focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Price (PKR) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        placeholder="25000"
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-lg text-sm font-mono focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-lg text-sm focus:outline-none focus:border-[#C79A44]"
                      >
                        {MAIN_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Subcategory *</label>
                      <select
                        name="subCategory"
                        value={formData.subCategory}
                        onChange={handleChange}
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-lg text-sm focus:outline-none focus:border-[#C79A44]"
                      >
                        {CATEGORY_MAP[formData.category]?.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Kamran Sports"
                      className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-lg text-sm focus:outline-none focus:border-[#C79A44]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Enter specifications..."
                      className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-lg text-sm focus:outline-none focus:border-[#C79A44]"
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
                    <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Image Upload</label>
                    <div className="relative border-2 border-dashed border-[#E0DCD1] rounded-xl p-2 text-center">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      {imagePreview ? (
                        <div className="relative group">
                          <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={handleClearImage}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md transition"
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

        {/* TAB 2: MANAGE PRODUCTS */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-sm overflow-hidden">
            <div className="p-4 bg-[#FAFAF7] border-b border-[#E8E4D9] flex flex-col sm:flex-row gap-4">
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

            <div className="divide-y divide-[#F0EDE4]">
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

        {/* TAB 3: ADD / EDIT STAR */}
        {activeTab === 'add-star' && (
          <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-sm p-8">
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
                      <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Player Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={starFormData.name}
                        onChange={handleStarChange}
                        required
                        placeholder="e.g. Babar Azam"
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-lg text-sm focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={starFormData.city}
                        onChange={handleStarChange}
                        required
                        placeholder="e.g. LAHORE"
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-lg text-sm focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Player Role / Tag *</label>
                      <input
                        type="text"
                        name="role"
                        value={starFormData.role}
                        onChange={handleStarChange}
                        required
                        placeholder="e.g. HARDBALL KING / TOP BATSMAN"
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-lg text-sm focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Category *</label>
                      <select
                        name="category"
                        value={starFormData.category}
                        onChange={handleStarChange}
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-lg text-sm focus:outline-none focus:border-[#C79A44]"
                      >
                        <option value="Tapeball">Tapeball Star</option>
                        <option value="Hardball Star">Hardball Star</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B120D] uppercase mb-2">Player Image</label>
                    <div className="relative border-2 border-dashed border-[#E0DCD1] rounded-xl p-2 text-center">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      {imagePreview ? (
                        <div className="relative group">
                          <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={handleClearImage}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md transition"
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

        {/* TAB 4: MANAGE STARS */}
        {activeTab === 'manage-stars' && (
          <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-sm overflow-hidden">
            <div className="p-4 bg-[#FAFAF7] border-b border-[#E8E4D9] flex justify-between items-center">
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

            <div className="divide-y divide-[#F0EDE4]">
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
      </main>
    </div>
  );
}