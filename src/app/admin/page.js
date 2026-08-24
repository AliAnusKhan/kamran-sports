'use client';

import { useState, useEffect, useRef } from 'react';

/* ------------------------------------------------------------------
   Kamran Sports Admin — Clean Modern Light Theme
   - Palette: Clean White, Slate Gray, Emerald (In Stock), Rose (Out of Stock), Accent Yellow (#FACC15 / Logo Color)
   - Layout: Fixed, non-tilt standard vertical scroll layout
------------------------------------------------------------------ */

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#F1F5F9"/>
      <path d="M30 68 L50 32 L70 68 Z" fill="none" stroke="#CBD5E1" stroke-width="3"/>
      <circle cx="50" cy="50" r="6" fill="#94A3B8"/>
    </svg>`
  );

// Logo fallback using yellow "K" design
const LOGO_SVG = (
  <svg viewBox="0 0 100 100" className="w-10 h-10 shrink-0">
    <rect width="100" height="100" rx="12" fill="#000000" />
    <path
      d="M20 20 H38 V45 L62 20 H82 L52 50 L85 80 H64 L38 52 V80 H20 Z"
      fill="#FFE500"
      stroke="#000000"
      strokeWidth="2"
    />
  </svg>
);

const CATEGORIES = [
  'Cricket Bats',
  'Balls',
  'Gloves',
  'Pads & Protection',
  'Helmets',
  'Bags & Luggage',
  'Shoes & Footwear',
  'Clothing & Kits',
  'Accessories',
];

const EMPTY_FORM = {
  productId: '',
  name: '',
  price: '',
  category: 'Cricket Bats',
  batType: '',
  ballType: '',
  gloveType: '',
  brand: 'Kamran',
  image: '',
  description: '',
  inStock: true,
};

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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('manage');

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [productsLoaded, setProductsLoaded] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const dismissTimer = useRef(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoaded(true);
    }
  };

  useEffect(() => {
    fetchProducts();
    return () => dismissTimer.current && clearTimeout(dismissTimer.current);
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image size 5MB se choti honi chahiye!');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormData({
      productId: product.productId || '',
      name: product.name || '',
      price: product.price || '',
      category: product.category || 'Cricket Bats',
      batType: product.batType || '',
      ballType: product.ballType || '',
      gloveType: product.gloveType || '',
      brand: product.brand || 'Kamran',
      image: product.image || '',
      description: product.description || '',
      inStock: product.inStock !== false,
    });
    setImagePreview(product.image || '');
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setImagePreview('');
  };

  const handleDeleteClick = async (id) => {
    if (!confirm('Kiya aap waqai is product ko delete karna chahte hain?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showMessage('success', 'Product successfully delete ho gaya!');
        fetchProducts();
      } else {
        showMessage('error', data.error);
      }
    } catch (err) {
      showMessage('error', 'Connection Error: Delete nahi ho saka.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      showMessage('error', 'Barae karam product ki image upload karein!');
      return;
    }

    setLoading(true);
    try {
      const isUpdating = !!editingId;
      const method = isUpdating ? 'PUT' : 'POST';
      const payload = isUpdating
        ? { ...formData, _id: editingId, price: Number(formData.price) }
        : { ...formData, price: Number(formData.price) };

      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showMessage(
          'success',
          isUpdating ? 'Product detail update ho gayi hai!' : 'Naya product store mein add ho gaya hai!'
        );
        handleCancelEdit();
        fetchProducts();
        setActiveTab('manage');
      } else {
        showMessage('error', data.error);
      }
    } catch (err) {
      showMessage('error', 'Connection Error: Save nahi ho saka.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      p.name?.toLowerCase().includes(query) ||
      p.productId?.toLowerCase().includes(query) ||
      p._id?.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const inStockCount = products.filter((p) => p.inStock !== false).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans antialiased overflow-x-hidden w-full select-none">
      <style>{`
        html, body {
          overflow-x: hidden;
          touch-action: pan-y;
          overscroll-behavior-x: none;
        }
        img {
          -webkit-user-drag: none;
          user-drag: none;
        }
        .alert-shell { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 220ms ease, opacity 220ms ease; opacity: 0; }
        .alert-shell.open { grid-template-rows: 1fr; opacity: 1; }
        .alert-inner { overflow: hidden; min-height: 0; }
      `}</style>

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-black border border-slate-200 shrink-0">
              <img
                src="/logo.jpg"
                alt="Kamran Sports"
                className="w-full h-full object-contain"
                draggable="false"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }}>{LOGO_SVG}</div>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none uppercase">
                Kamran Sports
              </h1>
              <p className="text-[11px] font-medium text-slate-500 mt-1 tracking-wider uppercase">Admin Portal</p>
            </div>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition border border-slate-200 flex items-center gap-1.5"
          >
            <span>Live Store</span>
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* SIMPLE STATS STRIP (NO EMOJIS) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Products</span>
            <span className="block text-2xl font-bold text-slate-900 mt-1">{products.length}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">In Stock</span>
            <span className="block text-2xl font-bold text-emerald-600 mt-1">{inStockCount}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Out of Stock</span>
            <span className="block text-2xl font-bold text-rose-600 mt-1">{outOfStockCount}</span>
          </div>
        </div>

        {/* ALERT */}
        <div className={`alert-shell mb-2 ${message.text ? 'open' : ''}`}>
          <div className="alert-inner">
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium flex justify-between items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <span>{message.text}</span>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="text-xs font-semibold underline opacity-70 hover:opacity-100 shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl mb-6 border border-slate-200 max-w-md">
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition flex justify-center items-center gap-2 ${
              activeTab === 'manage'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>Manage Products ({filteredProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition flex justify-center items-center gap-2 ${
              activeTab === 'add'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{editingId ? 'Edit Product' : 'Add Product'}</span>
          </button>
        </div>

        {/* TAB PANELS */}
        <div style={{ minHeight: 520 }}>
          {activeTab === 'add' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="font-bold text-lg text-slate-900 uppercase tracking-tight">
                    {editingId ? 'Edit Product Details' : 'Add New Product'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Enter product specifications and details.</p>
                </div>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition border border-slate-200 shrink-0"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Product ID / Code *
                    </label>
                    <input
                      type="text"
                      name="productId"
                      value={formData.productId}
                      onChange={handleChange}
                      required
                      placeholder="e.g. KS-101"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono font-semibold rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 p-2.5 outline-none transition"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Kamran Gold Edition English Willow"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 p-2.5 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Price (PKR) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      placeholder="22000"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 p-2.5 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 p-2.5 outline-none transition"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="e.g. Kamran"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 p-2.5 outline-none transition"
                    />
                  </div>
                </div>

                <div style={{ minHeight: 74 }}>
                  {formData.category === 'Cricket Bats' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Bat Type</label>
                      <select
                        name="batType"
                        value={formData.batType}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 p-2.5 outline-none transition"
                      >
                        <option value="">Select Bat Type</option>
                        <option value="Hardball">Hardball</option>
                        <option value="Tapeball">Tapeball</option>
                      </select>
                    </div>
                  )}
                  {formData.category === 'Balls' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Ball Type</label>
                      <select
                        name="ballType"
                        value={formData.ballType}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 p-2.5 outline-none transition"
                      >
                        <option value="">Select Ball Type</option>
                        <option value="Hardball">Hardball</option>
                        <option value="Tennis Ball">Tennis Ball</option>
                        <option value="Leather Ball">Leather Ball</option>
                      </select>
                    </div>
                  )}
                  {formData.category === 'Gloves' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Glove Type</label>
                      <select
                        name="gloveType"
                        value={formData.gloveType}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 p-2.5 outline-none transition"
                      >
                        <option value="">Select Glove Type</option>
                        <option value="Hardball Gloves">Hardball Gloves</option>
                        <option value="Tapeball Gloves">Tapeball Gloves</option>
                        <option value="Wicket Keeping Gloves">Wicket Keeping Gloves</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Product Image *
                  </label>
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:cursor-pointer transition"
                    />
                    <div className="w-12 h-12 shrink-0 rounded-lg border border-slate-200 bg-white overflow-hidden">
                      {imagePreview && (
                        <SafeImage src={imagePreview} alt="Preview" className="w-12 h-12 object-cover" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Product details and features..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 p-2.5 outline-none transition resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    name="inStock"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={handleChange}
                    className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                  />
                  <label htmlFor="inStock" className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer">
                    Mark Product as In Stock
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-xs transition disabled:bg-slate-300 ${
                    editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {loading ? 'Saving Details…' : editingId ? 'Update Product' : 'Publish Product to Store'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Filter Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm font-medium rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 p-2.5 outline-none transition"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Search ID / Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search product..."
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm font-medium rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 p-2.5 outline-none transition pl-9"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {!productsLoaded ? (
                <div className="divide-y divide-slate-100">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="p-4 sm:p-5 flex items-center gap-3.5 animate-pulse">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                        <div className="h-3 w-48 bg-slate-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-14 px-4">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-slate-500 font-medium text-sm">Koi product match nahi hua.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <div key={p._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="w-14 h-14 shrink-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
                          <SafeImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                              {p.productId || 'NO-ID'}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              p.inStock !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {p.inStock !== false ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-slate-900 uppercase mt-1 leading-tight truncate">
                            {p.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {p.category} • <span className="text-slate-900 font-bold">PKR {p.price?.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="flex-1 sm:flex-none bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition border border-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p._id)}
                          className="flex-1 sm:flex-none bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition border border-rose-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}