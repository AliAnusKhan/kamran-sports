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
    'English Willow', 'Kashmir Willow', 'Tennis Bat', 'Bat Grips', 'Cricket Kit',
    'Leather Ball', 'Tennis Ball',
    'Trolley', 'Wheelie Kit', 'Wheelie Duffle', 'Kit', 'Duffle',
    'Batting Gloves', 'Tapeball Batting Gloves', 'W.K. Gloves', 'Inner Gloves',
    'Batting Leg Guard', 'Wicket Keeping Leg Guard',
    'Elbow Guard', 'Chest Guard', 'Thigh Pad', 'Inner Thigh Pad', 'Abdo Guard', 'Helmets',
  ],
  'Shoes': [
    'Spike Shoes', 'Rubber Studs', 'Turf Shoes',
    'Running Shoes', 'Training Shoes', 'Indoor Shoes',
  ],
  'Caps': [
    'Fixed Cap', 'Adjustable Cap',
  ],
  'Football & Multiple Balls': [
    'Match Footballs', 'Training Footballs', 'Futsal Balls',
    'Shin Guards', 'Goalkeeper Gloves', 'Football Socks',
    'Basketball', 'Volleyball', 'Throwball', 'Rugby Ball',
  ],
  'Shirt & Trouser': [
    'Cricket Whites', 'T20 Jerseys', 'Team Shirts',
    'Track Trousers', 'Polo Shirts', 'Jackets', 'Compression Wear',
  ],
  'Indoor Games': [
    'Chess', 'Ludo', 'Cards', 'UNO',
    'Carrom', 'Table Tennis', 'Dart Boards',
    'Shuttle Cock', 'Table Tennis Set', 'Rackets & Balls', 'Tennis Racket', 'Tennis Ball', 'Padel Racket', 'Foosball',
  ],
  'Trophies & Medals': [
    'Plastic Trophies', 'Metal Trophies', 'Imported Trophies', 'Autograph Bat',
    'Shield', 'Plastic Shield', 'Ready Made', 'Customize',
  ],
  'Others': ['Others'],
};

const MAIN_CATEGORIES = Object.keys(CATEGORY_MAP);

const EMPTY_PRODUCT_FORM = {
  productId: '',
  name: '',
  price: '',
  quantity: 1,
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

const EMPTY_MANUAL_ORDER_FORM = {
  invoiceNumber: '',
  customerName: 'Counter Customer',
  customerPhone: '',
  city: 'In-Store',
  address: 'Counter Cash Sale',
  product: '',
  price: 0,
  quantity: 1,
  paymentMethod: 'Cash',
  notes: '',
  orderSource: 'offline',
  status: 'dispatched',
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
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
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
  lock: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0119.5 12.75v6.75A2.25 2.25 0 0117.25 21.75H6.75A2.25 2.25 0 014.5 19.5v-6.75a2.25 2.25 0 012.25-2.25z",
  users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  print: "M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231a1.125 1.125 0 01-1.12-1.227L6.34 18m11.32 0H6.34M12 3v6m0 0l3-3m-3 3L9 6",
  search: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginNotice, setLoginNotice] = useState(''); // brief green confirmation shown on the login screen (e.g. after "Send Reset Link")
  const [authLoading, setAuthLoading] = useState(false);

  const [authMode, setAuthMode] = useState('login');
  const [registerForm, setRegisterForm] = useState({
    adminId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Forgot Password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Reset Password state (reached via emailed link: /admin?reset_token=...)
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('sales');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [stars, setStars] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  const [salesAnalytics, setSalesAnalytics] = useState(null);

  // Manual Offline Order State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualFormData, setManualFormData] = useState(EMPTY_MANUAL_ORDER_FORM);
  const [editingDeliveryId, setEditingDeliveryId] = useState(null); // sales/delivery entry currently being edited (online or offline)

  const [salesSearchQuery, setSalesSearchQuery] = useState('');
  const [salesSourceFilter, setSalesSourceFilter] = useState('All');

  const [productA, setProductA] = useState('');
  const [productB, setProductB] = useState('');

  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('All');
  const [deliverySourceFilter, setDeliverySourceFilter] = useState('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('All');

  const [formData, setFormData] = useState(EMPTY_PRODUCT_FORM);
  const [editingId, setEditingId] = useState(null);

  const [starFormData, setStarFormData] = useState(EMPTY_STAR_FORM);
  const [editingStarId, setEditingStarId] = useState(null);
  const [editingStarSource, setEditingStarSource] = useState(null);

  const [heroFormData, setHeroFormData] = useState(EMPTY_HERO_FORM);
  const [editingHeroId, setEditingHeroId] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [starCategoryFilter, setStarCategoryFilter] = useState('All');

  const dismissTimer = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }

    // If the admin arrived via the emailed reset link (?reset_token=...),
    // drop them straight into the "set new password" screen.
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('reset_token');
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setAuthMode('reset');
    }
  }, []);

  const openManualModal = (entry = null) => {
    if (entry) {
      // Edit mode — prefill the form with the existing sales entry's data.
      const parts = String(entry.notes || '').split('|').map((s) => s.trim());
      const invMatch = parts.find((p) => p.toLowerCase().startsWith('invoice:'));
      const qtyMatch = parts.find((p) => p.toLowerCase().startsWith('qty:'));
      const invoiceFromNotes = invMatch ? invMatch.replace(/invoice:/i, '').trim() : '';
      const qtyFromNotes = qtyMatch ? Number(qtyMatch.replace(/qty:/i, '').trim()) || 1 : 1;

      setEditingDeliveryId(entry._id);
      setManualFormData({
        invoiceNumber: entry.invoiceNumber || invoiceFromNotes || `KS-INV-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: entry.name || entry.customerName || 'Counter Customer',
        customerPhone: entry.phone || entry.phoneNumber || '',
        city: entry.city || 'In-Store',
        address: entry.address || 'Counter Cash Sale',
        product: entry.product || entry.productName || products[0]?.name || products[0]?.title || '',
        price: entry.price || entry.amount || entry.totalAmount || getProductPrice(entry.product) || 0,
        quantity: entry.quantity || qtyFromNotes || 1,
        paymentMethod: entry.paymentMethod || 'Cash',
        notes: entry.notes || '',
        orderSource: entry.orderSource || 'online',
        status: entry.status || 'pending',
      });
    } else {
      // Add mode — fresh counter sale.
      const autoInv = `KS-INV-${Math.floor(100000 + Math.random() * 900000)}`;
      setEditingDeliveryId(null);
      setManualFormData({
        ...EMPTY_MANUAL_ORDER_FORM,
        invoiceNumber: autoInv,
        product: products[0]?.name || products[0]?.title || 'Custom Cricket Equipment',
        price: products[0]?.price || 0,
      });
    }
    setIsManualModalOpen(true);
  };

  const closeManualModal = () => {
    setIsManualModalOpen(false);
    setEditingDeliveryId(null);
    setManualFormData(EMPTY_MANUAL_ORDER_FORM);
  };

  const handleEditDeliveryClick = (req) => {
    openManualModal(req);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setAuthLoading(true);
    try {
      const data = await safeFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginId.trim(), password: loginPassword }),
      });

      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      if (data.admin) {
        sessionStorage.setItem('admin_info', JSON.stringify(data.admin));
      }
    } catch (err) {
      setLoginError(err.message || 'Incorrect Admin ID/Email or Password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('Password and Confirm Password do not match.');
      return;
    }
    if (registerForm.password.length < 6) {
      setRegisterError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      const data = await safeFetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: registerForm.adminId.trim(),
          name: registerForm.name.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password,
        }),
      });

      setRegisterSuccess(data.message || 'Admin account created successfully!');
      setRegisterForm({ adminId: '', name: '', email: '', password: '', confirmPassword: '' });
      setLoginId(registerForm.adminId.trim());
      setTimeout(() => setAuthMode('login'), 1200);
    } catch (err) {
      setRegisterError(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      const data = await safeFetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });
      // Don't show a separate confirmation screen — go straight back to the
      // login screen and show the confirmation there instead.
      setForgotIdentifier('');
      setAuthMode('login');
      setLoginNotice(data.message || 'If an account exists with this detail, a reset link has been sent to your email.');
    } catch (err) {
      setForgotError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (resetPassword !== resetConfirmPassword) {
      setResetError('Password and Confirm Password do not match.');
      return;
    }
    if (resetPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }

    setResetLoading(true);
    try {
      const data = await safeFetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: resetPassword }),
      });
      setResetSuccess(data.message || 'Password has been reset successfully.');
      setResetPassword('');
      setResetConfirmPassword('');
      setTimeout(() => {
        // Clean the token out of the URL and send them back to the login form.
        window.history.replaceState({}, '', window.location.pathname);
        setAuthMode('login');
      }, 1800);
    } catch (err) {
      setResetError(err.message || 'This link is invalid or has expired.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_info');
    setLoginId('');
    setLoginPassword('');
  };

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

  const fetchUsers = async () => {
    try {
      const data = await safeFetch('/api/users');
      const list = Array.isArray(data) ? data : (data.users || data.data || []);
      setUsers(list);
      setTotalUsers(data.totalUsers ?? list.length);
    } catch (err) {
      console.error('Fetch users error:', err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSalesAnalytics();
      fetchProducts();
      fetchStars();
      fetchHeroSlides();
      fetchDeliveryRequests();
      fetchReviews();
      fetchUsers();
    }
    return () => dismissTimer.current && clearTimeout(dismissTimer.current);
  }, [isAuthenticated]);

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
    if (name === 'product') {
      const selectedProd = products.find((p) => (p.name || p.title) === value);
      setManualFormData((prev) => ({
        ...prev,
        product: value,
        price: selectedProd ? Number(selectedProd.price) || 0 : prev.price,
      }));
    } else {
      setManualFormData((prev) => ({ ...prev, [name]: value }));
    }
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const printSingleInvoice = (orderData) => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const total = (Number(orderData.price) || 0) * (Number(orderData.quantity) || 1);

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${orderData.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #111; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; text-transform: uppercase; color: #0B120D; }
            .sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #C79A44; font-weight: bold; }
            .inv-title { text-align: center; font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; text-decoration: underline; }
            .flex-between { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
            .info-box { background: #f9f9f9; padding: 12px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #eee; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
            th { text-align: left; background: #0B120D; color: #fff; padding: 8px; text-transform: uppercase; font-size: 11px; }
            td { padding: 8px; border-bottom: 1px solid #eee; }
            .total-row { font-size: 16px; font-weight: bold; text-align: right; margin-top: 15px; padding-top: 10px; border-top: 2px solid #000; }
            .footer { text-align: center; font-size: 11px; color: #666; margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">KAMRAN SPORTS</div>
            <div class="sub">Official Sales & Cash Receipt</div>
            <p style="font-size: 11px; margin: 4px 0 0 0; color: #555;">Main Market, Pakistan | Contact: WhatsApp Support</p>
          </div>

          <div class="inv-title">OFFICIAL SALES INVOICE</div>

          <div class="info-box">
            <div class="flex-between"><span><strong>Invoice #:</strong> ${orderData.invoiceNumber}</span> <span><strong>Date:</strong> ${dateStr}</span></div>
            <div class="flex-between"><span><strong>Customer Name:</strong> ${orderData.customerName || 'Counter Sale'}</span> <span><strong>Payment:</strong> ${orderData.paymentMethod || 'Cash'}</span></div>
            <div class="flex-between"><span><strong>Phone:</strong> ${orderData.customerPhone || 'N/A'}</span> <span><strong>Location:</strong> ${orderData.city || 'Store Outlet'}</span></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${orderData.product}</strong></td>
                <td style="text-align: center;">${orderData.quantity || 1}</td>
                <td style="text-align: right;">PKR ${(Number(orderData.price) || 0).toLocaleString()}</td>
                <td style="text-align: right;">PKR ${total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-row">
            Grand Total: PKR ${total.toLocaleString()}
          </div>

          <div class="footer">
            Thank you for shopping at Kamran Sports!<br>
            <em>Goods once sold can be exchanged within 7 days with valid receipt.</em>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  const handleManualOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const lineTotal = (Number(manualFormData.price) || 0) * (Number(manualFormData.quantity) || 1);
      const isEditing = !!editingDeliveryId;

      const payload = {
        name: manualFormData.customerName || 'Counter Customer',
        phone: manualFormData.customerPhone || 'Counter Sale',
        city: manualFormData.city || 'In-Store',
        address: manualFormData.address || 'Counter Cash Sale',
        product: manualFormData.product,
        invoiceNumber: manualFormData.invoiceNumber,
        amount: lineTotal,
        paymentMethod: manualFormData.paymentMethod || 'Cash',
        notes: `Invoice: ${manualFormData.invoiceNumber} | Qty: ${manualFormData.quantity} | ${manualFormData.notes}`,
        orderSource: manualFormData.orderSource || 'offline',
        status: manualFormData.status || 'dispatched',
      };

      const data = isEditing
        ? await safeFetch(`/api/delivery-requests?id=${editingDeliveryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await safeFetch('/api/delivery-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (data.success || data._id) {
        showMessage('success', isEditing ? 'Sales entry updated successfully!' : 'Manual offline order recorded & invoice generated!');
        closeManualModal();
        if (!isEditing) printSingleInvoice(manualFormData);
        fetchDeliveryRequests();
        fetchSalesAnalytics();
      }
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormData({
      productId: product.productId || '',
      name: product.name || product.title || '',
      price: product.price || '',
      quantity: product.quantity || 1,
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
        productId: formData.productId || `PRD-${Date.now()}`,
        name: formData.name,
        title: formData.name,
        subCategory: formData.subCategory,
        subcategory: formData.subCategory,
        image: finalImageUrl,
        price: Number(formData.price),
        quantity: Number(formData.quantity) || 1,
        totalPrice: (Number(formData.price) || 0) * (Number(formData.quantity) || 1),
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
  const avgOrderValue = salesAnalytics?.avgOrderValue ?? localAvgOrderValue;
  const topSellingItems = salesAnalytics?.topSellingItems || salesAnalytics?.topItems || localTopSellingItems;

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

    return { details: prodObj, unitsSold, revenue, onlineOrders, offlineOrders };
  };

  const statsA = getProductStats(productA);
  const statsB = getProductStats(productB);

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
            .header { border-bottom: 3px solid #A6362B; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
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
            <div class="date">Report Generated:<br><strong>${dateStr}</strong></div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card"><div class="kpi-title">Total Revenue</div><div class="kpi-value">PKR ${totalSalesRevenue.toLocaleString()}</div></div>
            <div class="kpi-card"><div class="kpi-title">Online Revenue</div><div class="kpi-value">PKR ${onlineRevenue.toLocaleString()}</div></div>
            <div class="kpi-card"><div class="kpi-title">Offline Revenue</div><div class="kpi-value">PKR ${offlineRevenue.toLocaleString()}</div></div>
            <div class="kpi-card"><div class="kpi-title">Total Orders</div><div class="kpi-value">${deliveryRequests.length}</div></div>
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

          <div class="footer">Generated automatically by Kamran Sports Admin Panel Dashboard System.</div>
          <script>window.onload = function() { window.print(); }</script>
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

  // Recent Sales Transactions — used by the editable table inside the Sales & Analytics dashboard.
  const filteredSalesEntries = deliveryRequests
    .filter((r) => {
      const matchesSource = salesSourceFilter === 'All' ? true : (r.orderSource || 'online') === salesSourceFilter;
      const q = salesSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (r.name || r.customerName || '').toLowerCase().includes(q) ||
        (r.phone || r.phoneNumber || '').toLowerCase().includes(q) ||
        (r.product || r.productName || '').toLowerCase().includes(q) ||
        (r.invoiceNumber || '').toLowerCase().includes(q);
      return matchesSource && matchesSearch;
    })
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

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

  const filteredUsers = users.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
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
        ? 'bg-[#F5F3ED] text-[#0B120D] shadow-[inset_3px_0_0_0_#C79A44]'
        : 'text-neutral-500 hover:bg-[#FAFAF7] hover:text-[#0B120D]'
    }`;

  const PAGE_TITLES = {
    sales: 'Sales & Revenue Dashboard',
    'manage-hero': 'Hero Slides',
    'add-hero': editingHeroId ? 'Edit Hero Slide' : 'Add Hero Slide',
    manage: 'Product Catalog',
    add: editingId ? 'Edit Product' : 'Add New Product',
    'manage-stars': 'Store Stars',
    'add-star': editingStarId ? 'Edit Star' : 'Add New Star',
    'delivery-requests': 'Delivery Requests & Sales',
    reviews: 'Customer Reviews',
    users: 'Registered Users',
  };

  const NavBadge = ({ children }) => (
    <span className="ml-auto text-[10px] font-bold bg-[#0B120D]/[0.06] text-[#0B120D]/70 px-1.5 py-0.5 rounded-full">{children}</span>
  );

  // AUTH SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B120D] flex items-center justify-center p-4">
        <div className="bg-[#FAFAF7] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#E8E4D9]">
          <div className="text-center mb-6">
            <div className="bg-[#0B120D] w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ring-2 ring-[#C79A44]">
              <img src="/logo.jpg" alt="Kamran Sports" className="h-10 w-auto object-contain rounded-lg" />
            </div>
            <h2 className="font-bold text-2xl text-[#0B120D] uppercase tracking-wide">Admin Portal</h2>
            <p className="text-xs text-[#C79A44] font-semibold uppercase tracking-widest mt-1">Kamran Sports Gatekeeper</p>
          </div>

          {(authMode === 'login' || authMode === 'register') && (
            <div className="flex bg-[#F0EDE4] rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setRegisterError(''); setRegisterSuccess(''); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition ${
                  authMode === 'login' ? 'bg-[#0B120D] text-white shadow' : 'text-neutral-500'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setLoginError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition ${
                  authMode === 'register' ? 'bg-[#0B120D] text-white shadow' : 'text-neutral-500'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {authMode === 'login' ? (
            <>
              {loginNotice && (
                <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3.5 rounded-xl text-center">
                  {loginNotice}
                </div>
              )}
              {loginError && (
                <div className="mb-5 bg-red-50 border border-red-200 text-[#A6362B] text-xs font-bold p-3.5 rounded-xl text-center">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D]/70 tracking-wide mb-1.5">Admin ID or Email</label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                    placeholder="Enter Admin ID or Email"
                    className="w-full bg-white border border-[#E0DCD1] p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase text-[#0B120D]/70 tracking-wide">Password</label>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('forgot'); setForgotError(''); setForgotSuccess(''); setLoginNotice(''); setForgotIdentifier(loginId); }}
                      className="text-[11px] font-bold text-[#C79A44] hover:text-[#A6362B] uppercase tracking-wide"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#E0DCD1] p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#0B120D] hover:bg-[#A6362B] text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition duration-200 shadow-md mt-2 disabled:opacity-60"
                >
                  {authLoading ? 'Checking...' : 'Access Dashboard'}
                </button>
              </form>
            </>
          ) : authMode === 'forgot' ? (
            <>
              <p className="text-xs text-neutral-500 mb-5 text-center">
                Enter your Admin ID or Email — we'll send you a password reset link.
              </p>

              {forgotError && (
                <div className="mb-5 bg-red-50 border border-red-200 text-[#A6362B] text-xs font-bold p-3.5 rounded-xl text-center">
                  {forgotError}
                </div>
              )}
              {forgotSuccess && (
                <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3.5 rounded-xl text-center">
                  {forgotSuccess}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D]/70 tracking-wide mb-1.5">Admin ID or Email</label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    required
                    placeholder="Enter Admin ID or Email"
                    className="w-full bg-white border border-[#E0DCD1] p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-[#0B120D] hover:bg-[#A6362B] text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition duration-200 shadow-md mt-2 disabled:opacity-60"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => { setAuthMode('login'); setForgotError(''); setForgotSuccess(''); }}
                className="w-full text-center text-[11px] font-bold text-neutral-500 hover:text-[#0B120D] uppercase tracking-wide mt-5"
              >
                ← Back to Login
              </button>
            </>
          ) : authMode === 'reset' ? (
            <>
              <p className="text-xs text-neutral-500 mb-5 text-center">
                Enter your new password.
              </p>

              {resetError && (
                <div className="mb-5 bg-red-50 border border-red-200 text-[#A6362B] text-xs font-bold p-3.5 rounded-xl text-center">
                  {resetError}
                </div>
              )}
              {resetSuccess && (
                <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3.5 rounded-xl text-center">
                  {resetSuccess}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D]/70 tracking-wide mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full bg-white border border-[#E0DCD1] p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D]/70 tracking-wide mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    className="w-full bg-white border border-[#E0DCD1] p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-[#0B120D] hover:bg-[#A6362B] text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition duration-200 shadow-md mt-2 disabled:opacity-60"
                >
                  {resetLoading ? 'Saving...' : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <>
              {registerError && (
                <div className="mb-5 bg-red-50 border border-red-200 text-[#A6362B] text-xs font-bold p-3.5 rounded-xl text-center">
                  {registerError}
                </div>
              )}
              {registerSuccess && (
                <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3.5 rounded-xl text-center">
                  {registerSuccess}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D]/70 tracking-wide mb-1.5">Admin ID</label>
                  <input
                    type="text"
                    name="adminId"
                    value={registerForm.adminId}
                    onChange={handleRegisterChange}
                    required
                    placeholder="e.g. KS-ADMIN-01"
                    className="w-full bg-white border border-[#E0DCD1] p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D]/70 tracking-wide mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Enter Full Name"
                    className="w-full bg-white border border-[#E0DCD1] p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D]/70 tracking-wide mb-1.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    required
                    placeholder="admin@kamransports.com"
                    className="w-full bg-white border border-[#E0DCD1] p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D]/70 tracking-wide mb-1.5">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full bg-white border border-[#E0DCD1] p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#0B120D]/70 tracking-wide mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Re-enter Password"
                    className="w-full bg-white border border-[#E0DCD1] p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#0B120D] hover:bg-[#A6362B] text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition duration-200 shadow-md mt-2 disabled:opacity-60"
                >
                  {authLoading ? 'Creating Account...' : 'Create Admin Account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD UI
  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#1a1a1a] font-sans antialiased">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-[#0B120D]/40 backdrop-blur-[2px] z-40 lg:hidden" />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 w-[272px] shrink-0 bg-white border-r border-[#E8E4D9] z-50 flex flex-col transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="bg-[#F5F3ED] rounded-xl p-2 flex items-center justify-center shrink-0 ring-1 ring-black/[0.06]">
            <img src="/logo.jpg" alt="Kamran Sports" className="h-9 w-auto object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-[15px] text-[#0B120D] tracking-wide uppercase leading-tight truncate">Kamran Sports</h1>
            <p className="text-[10px] font-semibold text-[#C79A44] tracking-[0.2em] uppercase">Admin Portal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-neutral-400 hover:text-[#0B120D] shrink-0">
            <Icon path={ICONS.close} className="w-5 h-5" />
          </button>
        </div>
        <div className="mx-5 h-px bg-[#E8E4D9]" />

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
          <div className="space-y-1">
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Overview</p>
            <button onClick={() => { switchTab('sales'); setSidebarOpen(false); }} className={navBtnClass(activeTab === 'sales')}>
              <Icon path={ICONS.chart} className="w-4 h-4 shrink-0" />
              <span>Sales & Analytics</span>
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Catalog</p>
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
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Storefront</p>
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
          </div>

          <div className="space-y-1">
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Team</p>
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
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Orders & Feedback</p>
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

          <div className="space-y-1">
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Accounts</p>
            <button onClick={() => { switchTab('users'); setSidebarOpen(false); }} className={navBtnClass(activeTab === 'users')}>
              <Icon path={ICONS.users} className="w-4 h-4 shrink-0" />
              <span>Users</span>
              <NavBadge>{totalUsers}</NavBadge>
            </button>
          </div>
        </nav>

        <div className="p-4 pt-3 space-y-2 border-t border-[#E8E4D9]">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-[#F5F3ED] hover:bg-[#EDE9DD] text-[#0B120D]/80 hover:text-[#0B120D] text-[11px] font-bold px-4 py-3 rounded-xl transition-colors uppercase tracking-wider ring-1 ring-black/[0.06]"
          >
            <span>View Live Store</span>
            <Icon path={ICONS.external} className="w-3.5 h-3.5 text-[#C79A44]" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-[#A6362B] text-[11px] font-bold px-4 py-2.5 rounded-xl transition-colors uppercase tracking-wider ring-1 ring-red-200"
          >
            <span>Logout System</span>
            <Icon path={ICONS.lock} className="w-3.5 h-3.5 text-[#A6362B]" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="min-w-0 flex flex-col lg:ml-[272px]">
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
              onClick={openManualModal}
              className="bg-[#0B120D] hover:bg-[#A6362B] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Icon path={ICONS.plus} className="w-4 h-4 text-[#C79A44]" />
              <span className="hidden sm:inline">Record Manual Entry</span>
              <span className="sm:hidden">Add Order</span>
            </button>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          
          {/* UPDATED & ENHANCED STAT CARDS WITH CLEAR TEXT & BIG ICONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-9 gap-4 mb-8">
            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-neutral-500 tracking-wider mb-1 truncate">Total Products</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#0B120D] font-mono leading-tight">{products.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#0B120D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Icon path={ICONS.inventory} className="w-6 h-6 text-[#C79A44]" />
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-emerald-600 tracking-wider mb-1 truncate">In Stock</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono leading-tight">{inStockCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Icon path={ICONS.stock} className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-[#A6362B] tracking-wider mb-1 truncate">Out of Stock</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#A6362B] font-mono leading-tight">{outOfStockCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#A6362B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Icon path={ICONS.outOfStock} className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-[#96742f] tracking-wider mb-1 truncate">Total Stars</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#0B120D] font-mono leading-tight">{stars.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#C79A44] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Icon path={ICONS.star} className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-blue-600 tracking-wider mb-1 truncate">Hero Slides</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#0B120D] font-mono leading-tight">{heroSlides.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Icon path={ICONS.image} className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-orange-600 tracking-wider mb-1 truncate">Pending Deliveries</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-orange-700 font-mono leading-tight">{pendingDeliveryCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Icon path={ICONS.package} className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-purple-600 tracking-wider mb-1 truncate">Pending Reviews</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-mono leading-tight">{pendingReviewCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Icon path={ICONS.star} className="w-6 h-6 text-white" />
              </div>
            </div>

            <button
              onClick={() => switchTab('sales')}
              className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-blue-600 tracking-wider mb-1 truncate">Online Sales Entries</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono leading-tight">{onlineRequests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Icon path={ICONS.globe} className="w-6 h-6 text-white" />
              </div>
            </button>

            <button
              onClick={() => switchTab('sales')}
              className="group bg-white rounded-2xl border border-[#E8E4D9] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-amber-600 tracking-wider mb-1 truncate">Offline Sales Entries</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono leading-tight">{offlineRequests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Icon path={ICONS.store} className="w-6 h-6 text-white" />
              </div>
            </button>
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
                    onClick={openManualModal}
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

                    <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#0B120D] text-[#C79A44] text-[10px] font-bold uppercase">Vs</span>

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

              {/* CHANNEL BREAKDOWN */}
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

              {/* RECENT SALES TRANSACTIONS — full edit/delete access for every online & offline entry */}
              <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden">
                <div className="p-6 pb-5 border-b border-[#E8E4D9] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#0B120D]/5 text-[#0B120D] rounded-xl">
                      <Icon path={ICONS.package} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wide text-[#0B120D]">Recent Sales Transactions</h3>
                      <p className="text-xs text-neutral-500">Every online & offline sale — search, edit, or remove any entry directly here</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                      <Icon path={ICONS.search} className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={salesSearchQuery}
                        onChange={(e) => setSalesSearchQuery(e.target.value)}
                        placeholder="Search by customer, phone, product, invoice..."
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] text-xs pl-8 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-[#C79A44]"
                      />
                    </div>
                    <select
                      value={salesSourceFilter}
                      onChange={(e) => setSalesSourceFilter(e.target.value)}
                      className="bg-[#FAFAF7] border border-[#E0DCD1] text-xs font-bold p-2.5 rounded-xl focus:outline-none focus:border-[#C79A44]"
                    >
                      <option value="All">All Channels</option>
                      <option value="online">Online Only</option>
                      <option value="offline">Offline Only</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0B120D] text-white text-[11px] font-bold uppercase">
                        <th className="p-4">Channel</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Product</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EDE4]/80 text-xs">
                      {filteredSalesEntries.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-10 text-center text-gray-400 italic">
                            {salesSearchQuery || salesSourceFilter !== 'All' ? 'No matching sales found.' : 'No sales recorded yet — use "Manual Order" to add one.'}
                          </td>
                        </tr>
                      ) : (
                        filteredSalesEntries.slice(0, 50).map((entry) => (
                          <tr key={entry._id} className="hover:bg-[#FAFAF7] transition-colors">
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${entry.orderSource === 'offline' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                {entry.orderSource || 'online'}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-[#0B120D]">{entry.name || entry.customerName || 'N/A'}</p>
                              <p className="text-[10px] text-neutral-500">{entry.phone || entry.phoneNumber || 'No phone'} • {entry.city || 'N/A'}</p>
                            </td>
                            <td className="p-4 font-semibold">{entry.product || entry.productName || 'Equipment'}</td>
                            <td className="p-4 font-mono font-bold text-[#0B120D]">
                              PKR {(entry.price || entry.amount || entry.totalAmount || getProductPrice(entry.product)).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${(entry.status || 'pending') === 'dispatched' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                                {entry.status || 'pending'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => handleEditDeliveryClick(entry)}
                                className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-700 hover:text-white transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteDeliveryClick(entry._id)}
                                className="bg-red-50 text-[#A6362B] text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-[#A6362B] hover:text-white transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredSalesEntries.length > 50 && (
                  <div className="p-4 text-center border-t border-[#F0EDE4]">
                    <button
                      onClick={() => switchTab('delivery-requests')}
                      className="text-[11px] font-bold text-[#0B120D] hover:text-[#A6362B] uppercase tracking-wide"
                    >
                      Showing latest 50 of {filteredSalesEntries.length} — view full list in Delivery Requests →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: ADD HERO SLIDE */}
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
                  onClick={() => { handleCancelHeroEdit(); switchTab('add-hero'); }}
                  className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition"
                >
                  + Add New Slide
                </button>
              </div>

              <div className="divide-y divide-[#F0EDE4]/80">
                {heroSlides.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No hero slides found in database.</div>
                ) : (
                  heroSlides.map((slide) => (
                    <div key={slide._id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-[#FAFAF7]">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <SafeImage src={slide.image} alt={slide.title} className="w-24 h-16 object-cover rounded-lg border border-[#E8E4D9]" />
                        <div>
                          <span className="text-[10px] font-bold uppercase bg-[#0B120D] text-white px-2 py-0.5 rounded">{slide.badge || 'TAGLINE'}</span>
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
                <h2 className="font-bold text-sm uppercase text-[#0B120D]">{editingId ? 'Edit Product Details' : 'Add New Product'}</h2>
                {editingId && (
                  <button onClick={handleCancelEdit} className="text-xs text-[#A6362B] font-bold uppercase">Cancel Edit</button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-5">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
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
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Quantity *</label>
                        <input
                          type="number"
                          name="quantity"
                          min="1"
                          value={formData.quantity}
                          onChange={handleChange}
                          required
                          placeholder="1"
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm font-mono focus:outline-none focus:border-[#C79A44]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Total Price (PKR)</label>
                        <input
                          type="text"
                          readOnly
                          value={((Number(formData.price) || 0) * (Number(formData.quantity) || 0)).toLocaleString()}
                          className="w-full bg-[#F0EDE4] border border-[#E0DCD1] p-3 rounded-xl text-sm font-mono font-bold text-[#0B120D] cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-5 h-5 accent-[#0B120D] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Product Image *</label>
                      <div className="relative border-2 border-dashed border-[#E0DCD1] rounded-xl p-4 text-center">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        {imagePreview ? (
                          <div className="relative group">
                            <img src={imagePreview} alt="Product Preview" className="w-full h-52 object-contain rounded-lg bg-[#FAFAF7]" />
                            <button
                              type="button"
                              onClick={handleClearImage}
                              className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md"
                            >
                              ✕ Clear
                            </button>
                          </div>
                        ) : (
                          <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer py-12 hover:bg-[#FAFAF7] transition rounded-lg flex flex-col items-center justify-center">
                            <Icon path={ICONS.image} className="w-8 h-8 text-neutral-400 mb-2" />
                            <p className="text-xs text-neutral-500 font-semibold">Click to upload product image</p>
                            <p className="text-[10px] text-neutral-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#0B120D] hover:bg-[#A6362B] text-white text-xs font-bold uppercase tracking-wider py-4 rounded-xl transition duration-200 shadow-md disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : editingId ? 'Update Product' : 'Publish Product'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: MANAGE PRODUCTS */}
          {activeTab === 'manage' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAFAF7]/70 border-b border-[#E8E4D9]/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search by name, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-[#E0DCD1] text-xs p-2.5 rounded-xl w-full sm:w-64 focus:outline-none focus:border-[#C79A44]"
                  />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white border border-[#E0DCD1] text-xs p-2.5 rounded-xl focus:outline-none focus:border-[#C79A44]"
                  >
                    <option value="All">All Categories</option>
                    {MAIN_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => { handleCancelEdit(); switchTab('add'); }}
                  className="bg-[#0B120D] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#A6362B] transition w-full sm:w-auto"
                >
                  + Add New Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B120D] text-white text-[11px] font-bold uppercase">
                      <th className="p-4">Item</th>
                      <th className="p-4">Code</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EDE4]/80 text-xs">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500 italic">
                          No products matching your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p._id} className="hover:bg-[#FAFAF7]">
                          <td className="p-4 flex items-center gap-3">
                            <SafeImage src={p.image} alt={p.name || p.title} className="w-12 h-12 object-cover rounded-lg border border-[#E8E4D9]" />
                            <span className="font-bold text-[#0B120D]">{p.name || p.title}</span>
                          </td>
                          <td className="p-4 font-mono font-semibold text-neutral-600">{p.productId || 'N/A'}</td>
                          <td className="p-4 text-neutral-500">{p.category} / <span className="text-[#C79A44] font-semibold">{p.subCategory || p.subcategory}</span></td>
                          <td className="p-4 font-mono font-bold text-[#0B120D]">PKR {Number(p.price || 0).toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${p.inStock !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-[#A6362B]'}`}>
                              {p.inStock !== false ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => handleEditClick(p)} className="bg-[#0B120D] text-white px-3 py-1.5 rounded-lg hover:bg-[#C79A44] transition">Edit</button>
                            <button onClick={() => handleDeleteClick(p._id)} className="bg-red-50 text-[#A6362B] border border-red-200 px-3 py-1.5 rounded-lg hover:bg-[#A6362B] hover:text-white transition">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ADD STAR */}
          {activeTab === 'add-star' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E8E4D9]">
                <h2 className="font-bold text-sm uppercase text-[#0B120D]">{editingStarId ? 'Edit Star Player' : 'Add New Player Star'}</h2>
                {editingStarId && (
                  <button onClick={handleCancelStarEdit} className="text-xs text-[#A6362B] font-bold uppercase">Cancel Edit</button>
                )}
              </div>

              <form onSubmit={handleStarSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-5">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">City / Location *</label>
                        <input
                          type="text"
                          name="city"
                          value={starFormData.city}
                          onChange={handleStarChange}
                          required
                          placeholder="Lahore, Pakistan"
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Role / Specialty *</label>
                        <input
                          type="text"
                          name="role"
                          value={starFormData.role}
                          onChange={handleStarChange}
                          required
                          placeholder="Top-Order Batsman"
                          className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Star Category *</label>
                      <select
                        name="category"
                        value={starFormData.category}
                        onChange={handleStarChange}
                        className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl text-sm focus:outline-none focus:border-[#C79A44]"
                      >
                        <option value="Tapeball">Tapeball Star</option>
                        <option value="Hardball Star">Hardball Champion</option>
                      </select>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B120D]/80 uppercase tracking-wide mb-2">Player Photo *</label>
                      <div className="relative border-2 border-dashed border-[#E0DCD1] rounded-xl p-4 text-center">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        {imagePreview ? (
                          <div className="relative group">
                            <img src={imagePreview} alt="Star Preview" className="w-full h-52 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={handleClearImage}
                              className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md"
                            >
                              ✕ Clear
                            </button>
                          </div>
                        ) : (
                          <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer py-12 hover:bg-[#FAFAF7] transition rounded-lg">
                            <p className="text-xs text-neutral-400 font-semibold">Upload Photo (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#C79A44] hover:bg-[#b58a3a] text-white text-xs font-bold uppercase tracking-wider py-4 rounded-xl transition duration-200 shadow-md disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : editingStarId ? 'Update Star' : 'Save Star Player'}
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
                <select
                  value={starCategoryFilter}
                  onChange={(e) => setStarCategoryFilter(e.target.value)}
                  className="bg-white border border-[#E0DCD1] text-xs p-2.5 rounded-xl focus:outline-none focus:border-[#C79A44]"
                >
                  <option value="All">All Categories</option>
                  <option value="Tapeball">Tapeball Stars</option>
                  <option value="Hardball">Hardball Champions</option>
                </select>

                <button
                  onClick={() => { handleCancelStarEdit(); switchTab('add-star'); }}
                  className="bg-[#C79A44] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#b58a3a] transition"
                >
                  + Add Star Player
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredStars.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-gray-500 text-sm italic">No stars found.</div>
                ) : (
                  filteredStars.map((s) => (
                    <div key={s._id} className="bg-[#FAFAF7] border border-[#E8E4D9] p-4 rounded-2xl flex items-center gap-4">
                      <SafeImage src={s.image} alt={s.name} className="w-16 h-16 object-cover rounded-xl border border-[#E8E4D9]" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold uppercase bg-[#0B120D] text-[#C79A44] px-2 py-0.5 rounded">{s.category}</span>
                        <h3 className="font-bold text-sm text-[#0B120D] mt-1 truncate">{s.name}</h3>
                        <p className="text-xs text-neutral-500 truncate">{s.role} • {s.city}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button onClick={() => handleEditStarClick(s)} className="bg-[#0B120D] text-white text-[10px] font-bold px-2.5 py-1 rounded">Edit</button>
                        <button onClick={() => handleDeleteStarClick(s._id)} className="bg-red-50 text-[#A6362B] text-[10px] font-bold px-2.5 py-1 rounded border border-red-200">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: DELIVERY REQUESTS */}
          {activeTab === 'delivery-requests' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAFAF7]/70 border-b border-[#E8E4D9]/80 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <select
                    value={deliveryStatusFilter}
                    onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                    className="bg-white border border-[#E0DCD1] text-xs p-2.5 rounded-xl focus:outline-none focus:border-[#C79A44]"
                  >
                    <option value="All">All Delivery Statuses</option>
                    <option value="pending">Pending Only</option>
                    <option value="dispatched">Dispatched / Completed</option>
                  </select>

                  <select
                    value={deliverySourceFilter}
                    onChange={(e) => setDeliverySourceFilter(e.target.value)}
                    className="bg-white border border-[#E0DCD1] text-xs p-2.5 rounded-xl focus:outline-none focus:border-[#C79A44]"
                  >
                    <option value="All">All Order Sources</option>
                    <option value="online">Online Web Orders</option>
                    <option value="offline">Offline Counter Sales</option>
                  </select>
                </div>

                <button
                  onClick={openManualModal}
                  className="bg-[#0B120D] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#A6362B] transition"
                >
                  + Record Manual Entry
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B120D] text-white text-[11px] font-bold uppercase">
                      <th className="p-4">Source</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EDE4]/80 text-xs">
                    {filteredDeliveryRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500 italic">No delivery requests found.</td>
                      </tr>
                    ) : (
                      filteredDeliveryRequests.map((req) => (
                        <tr key={req._id} className="hover:bg-[#FAFAF7]">
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.orderSource === 'offline' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                              {req.orderSource || 'online'}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-[#0B120D]">{req.name || req.customerName}</p>
                            <p className="text-[10px] text-neutral-500">{req.phone || req.phoneNumber} • {req.city || 'N/A'}</p>
                          </td>
                          <td className="p-4 font-semibold">{req.product || req.productName || 'Equipment'}</td>
                          <td className="p-4 font-mono font-bold text-[#0B120D]">
                            PKR {(req.price || req.amount || req.totalAmount || getProductPrice(req.product)).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${(req.status || 'pending') === 'dispatched' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                              {req.status || 'pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {req.status !== 'dispatched' && (
                              <button
                                onClick={() => handleMarkDispatched(req._id, 'dispatched')}
                                className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-700"
                              >
                                Dispatch
                              </button>
                            )}
                            <button
                              onClick={() => openWhatsAppForRequest(req)}
                              className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-600"
                            >
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleEditDeliveryClick(req)}
                              className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-700 hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDeliveryClick(req._id)}
                              className="bg-red-50 text-[#A6362B] text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-[#A6362B] hover:text-white"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAFAF7]/70 border-b border-[#E8E4D9]/80 flex justify-between items-center">
                <select
                  value={reviewStatusFilter}
                  onChange={(e) => setReviewStatusFilter(e.target.value)}
                  className="bg-white border border-[#E0DCD1] text-xs p-2.5 rounded-xl focus:outline-none focus:border-[#C79A44]"
                >
                  <option value="All">All Reviews</option>
                  <option value="Approved">Approved Only</option>
                  <option value="Pending">Pending Approval</option>
                </select>
              </div>

              <div className="divide-y divide-[#F0EDE4]/80">
                {filteredReviews.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm italic">No reviews found.</div>
                ) : (
                  filteredReviews.map((rev) => (
                    <div key={rev._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#FAFAF7]">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-[#0B120D]">{rev.name || rev.author || 'Anonymous'}</span>
                          <span className="text-yellow-500 text-xs">★ {rev.rating || 5}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${rev.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                            {rev.approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600">{rev.comment || rev.text}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveReview(rev._id, !rev.approved)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg text-white ${rev.approved ? 'bg-gray-600 hover:bg-gray-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                          {rev.approved ? 'Unapprove' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeleteReviewClick(rev._id)}
                          className="bg-red-50 text-[#A6362B] border border-red-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#A6362B] hover:text-white"
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

          {/* TAB 9: USERS */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-[#E8E4D9]/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAFAF7]/70 border-b border-[#E8E4D9]/80">
                <input
                  type="text"
                  placeholder="Search registered users..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="bg-white border border-[#E0DCD1] text-xs p-2.5 rounded-xl w-full sm:w-64 focus:outline-none focus:border-[#C79A44]"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B120D] text-white text-[11px] font-bold uppercase">
                      <th className="p-4">User Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EDE4]/80 text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-gray-500 italic">No registered users found.</td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, i) => (
                        <tr key={u._id || i} className="hover:bg-[#FAFAF7]">
                          <td className="p-4 font-bold text-[#0B120D]">{u.name || u.adminId || 'User'}</td>
                          <td className="p-4 text-neutral-600">{u.email || 'N/A'}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                              {u.role || 'Member'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MANUAL / EDIT SALES ENTRY MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E8E4D9] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E8E4D9] pb-3">
              <h3 className="font-bold text-base uppercase text-[#0B120D]">
                {editingDeliveryId ? 'Edit Sales Entry' : 'Record Manual Offline Order'}
              </h3>
              <button onClick={closeManualModal} className="text-gray-400 hover:text-black">
                <Icon path={ICONS.close} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualOrderSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0B120D] uppercase mb-1">Sale Channel</label>
                  <select
                    name="orderSource"
                    value={manualFormData.orderSource}
                    onChange={handleManualChange}
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl focus:outline-none focus:border-[#C79A44]"
                  >
                    <option value="offline">Offline Counter Sale</option>
                    <option value="online">Online Website Order</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#0B120D] uppercase mb-1">Status</label>
                  <select
                    name="status"
                    value={manualFormData.status}
                    onChange={handleManualChange}
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl focus:outline-none focus:border-[#C79A44]"
                  >
                    <option value="pending">Pending</option>
                    <option value="dispatched">Dispatched / Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0B120D] uppercase mb-1">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={manualFormData.invoiceNumber}
                  onChange={handleManualChange}
                  required
                  className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl font-mono focus:outline-none focus:border-[#C79A44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0B120D] uppercase mb-1">Customer Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={manualFormData.customerName}
                    onChange={handleManualChange}
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl focus:outline-none focus:border-[#C79A44]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0B120D] uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="customerPhone"
                    value={manualFormData.customerPhone}
                    onChange={handleManualChange}
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl focus:outline-none focus:border-[#C79A44]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0B120D] uppercase mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={manualFormData.city}
                    onChange={handleManualChange}
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl focus:outline-none focus:border-[#C79A44]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0B120D] uppercase mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={manualFormData.address}
                    onChange={handleManualChange}
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl focus:outline-none focus:border-[#C79A44]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0B120D] uppercase mb-1">Select Product</label>
                <select
                  name="product"
                  value={manualFormData.product}
                  onChange={handleManualChange}
                  className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl focus:outline-none focus:border-[#C79A44]"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p.name || p.title}>{p.name || p.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0B120D] uppercase mb-1">Unit Price (PKR)</label>
                  <input
                    type="number"
                    name="price"
                    value={manualFormData.price}
                    onChange={handleManualChange}
                    required
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl font-mono focus:outline-none focus:border-[#C79A44]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0B120D] uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={manualFormData.quantity}
                    onChange={handleManualChange}
                    required
                    className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl font-mono focus:outline-none focus:border-[#C79A44]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0B120D] uppercase mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={manualFormData.paymentMethod}
                  onChange={handleManualChange}
                  className="w-full bg-[#FAFAF7] border border-[#E0DCD1] p-3 rounded-xl focus:outline-none focus:border-[#C79A44]"
                >
                  <option value="Cash">Cash Sale</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Credit/Debit Card</option>
                </select>
              </div>

              <div className="flex gap-3">
                {editingDeliveryId && (
                  <button
                    type="button"
                    onClick={closeManualModal}
                    className="flex-1 bg-white border border-[#E0DCD1] text-[#0B120D] font-bold uppercase tracking-wider py-3.5 rounded-xl hover:bg-[#FAFAF7] transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-[#0B120D] hover:bg-[#A6362B] text-white font-bold uppercase tracking-wider py-3.5 rounded-xl transition shadow-md disabled:opacity-60"
                >
                  {loading
                    ? 'Saving...'
                    : editingDeliveryId
                    ? 'Update Sales Entry'
                    : 'Confirm Order & Print Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}