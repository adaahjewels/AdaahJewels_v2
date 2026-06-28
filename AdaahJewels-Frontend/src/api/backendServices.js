/**
 * backendServices.js  —  All API calls to the AdaahJewels backend
 *
 * Each function maps directly to a backend route.
 * No mock data. No stored-procedure gateway.
 *
 * Backend routes (base: /api):
 *   /auth/*          — authentication
 *   /otp/*           — OTP send/verify
 *   /products/*      — product catalogue
 *   /categories/*    — categories (self-referencing tree)
 *   /orders/*        — orders + invoice
 *   /payment/*       — Razorpay
 *   /settings        — site settings
 *   /cart/*          — cart (added in backend integration)
 *   /wishlist/*      — wishlist (added in backend integration)
 */

import api, { setToken, setStoredUser, clearAuth } from './apiClient';

// ============================================================================
// AUTH
// ============================================================================

/**
 * Normalize backend user object so field names match what the frontend expects.
 * Backend returns: { id, name, email, phone, role }
 * Frontend reads:  user.userId, user.Name, user.Email, user.MobileNumber
 */
const normalizeUser = (user) => ({
  userId:       user.id,
  id:           user.id,
  Name:         user.name,
  name:         user.name,
  Email:        user.email,
  email:        user.email,
  MobileNumber: user.phone || '',
  phone:        user.phone || '',
  role:         user.role || 'customer',
});

export const authService = {

  /** Register — POST /api/auth/register */
  register: async ({ name, email, phone, password }) => {
    const { data } = await api.post('/auth/register', { name, email, phone, password });
    const user = normalizeUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setStoredUser(user);
    return { user, accessToken: data.accessToken };
  },

  /** Login — POST /api/auth/login */
  login: async (emailOrPhone, password) => {
    const { data } = await api.post('/auth/login', { emailOrPhone, password });
    const user = normalizeUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setStoredUser(user);
    return { user, accessToken: data.accessToken };
  },

  /** Get profile — GET /api/auth/profile */
  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return normalizeUser(data.user);
  },

  /** Update profile — PUT /api/auth/profile */
  updateProfile: async ({ name, email, phone }) => {
    const { data } = await api.put('/auth/profile', { name, email, phone });
    return normalizeUser(data.user);
  },

  /** Change password — PUT /api/auth/change-password */
  changePassword: async (currentPassword, newPassword) => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
    return data;
  },

  /** Forgot password — POST /api/auth/forgot-password */
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  /** Reset password with token — POST /api/auth/reset-password */
  resetPassword: async (resetToken, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { resetToken, newPassword });
    return data;
  },

  /** Logout — clear local storage */
  logout: () => {
    clearAuth();
    localStorage.removeItem('refreshToken');
  },
};

// ============================================================================
// OTP
// ============================================================================

export const otpService = {

  /** Send OTP — POST /api/otp/send */
  send: async (email, phone, type) => {
    const { data } = await api.post('/otp/send', {
      email:  email || undefined,
      phone:  phone || undefined,
      type,                          // 'registration' | 'login' | 'password-reset'
    });
    return data;
  },

  /** Verify OTP — POST /api/otp/verify */
  verify: async (email, phone, otp, type) => {
    const { data } = await api.post('/otp/verify', {
      email: email || undefined,
      phone: phone || undefined,
      otp,
      type,
    });
    return data;
  },

  /** OTP-based login/register — POST /api/auth/otp-auth */
  otpAuth: async ({ email, phone, name, isNewUser }) => {
    const { data } = await api.post('/auth/otp-auth', { email, phone, name, isNewUser });
    const user = normalizeUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setStoredUser(user);
    return { user, accessToken: data.accessToken };
  },
};

// ============================================================================
// PRODUCTS
// ============================================================================

export const productService = {

  /** GET /api/products — with optional filters */
  getAll: async ({ categoryId, materialType, minPrice, maxPrice, search, limit, offset } = {}) => {
    const params = {};
    if (categoryId)   params.categoryId   = categoryId;
    if (materialType) params.materialType = materialType;
    if (minPrice)     params.minPrice     = minPrice;
    if (maxPrice)     params.maxPrice     = maxPrice;
    if (search)       params.search       = search;
    if (limit)        params.limit        = limit;
    if (offset)       params.offset       = offset;
    const { data } = await api.get('/products', { params });
    return Array.isArray(data) ? data : [];
  },

  /** GET /api/products/:id */
  getById: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  /** GET /api/products/best-sellers */
  getBestSellers: async (limit, days, category) => {
    const params = { limit };
    if (Number.isFinite(Number(days))) params.timeframe = `${Number(days)}d`;
    if (Number.isFinite(Number(category))) params.category = Number(category);
    const { data } = await api.get('/products/best-sellers', { params });
    return Array.isArray(data) ? data : [];
  },
};

// ============================================================================
// CATEGORIES
// ============================================================================

export const categoryService = {

  /** GET /api/categories — active top-level categories */
  getAll: async () => {
    const { data } = await api.get('/categories');
    return Array.isArray(data) ? data : [];
  },

  /** GET /api/subcategories?category=<parentId> */
  getSubcategories: async (parentId) => {
    const params = parentId ? { category: parentId } : {};
    const { data } = await api.get('/subcategories', { params });
    return Array.isArray(data) ? data : [];
  },
};

// ============================================================================
// CART  (backend endpoints to be added — see backend integration guide)
// ============================================================================

export const cartService = {

  /** GET /api/cart */
  get: async () => {
    const { data } = await api.get('/cart');
    return Array.isArray(data.items) ? data.items : [];
  },

  /** POST /api/cart/add */
  add: async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/add', { productId, quantity });
    return data;
  },

  /** PUT /api/cart/update */
  update: async (productId, quantity) => {
    const { data } = await api.put('/cart/update', { productId, quantity });
    return data;
  },

  /** DELETE /api/cart/remove/:productId */
  remove: async (productId) => {
    const { data } = await api.delete(`/cart/remove/${productId}`);
    return data;
  },

  /** DELETE /api/cart/clear */
  clear: async () => {
    const { data } = await api.delete('/cart/clear');
    return data;
  },
};

// ============================================================================
// WISHLIST  (backend endpoints to be added — see backend integration guide)
// ============================================================================

export const wishlistService = {

  /** GET /api/wishlist */
  get: async () => {
    const { data } = await api.get('/wishlist');
    return Array.isArray(data.items) ? data.items : [];
  },

  /** POST /api/wishlist/add */
  add: async (productId) => {
    const { data } = await api.post('/wishlist/add', { productId });
    return data;
  },

  /** DELETE /api/wishlist/remove/:productId */
  remove: async (productId) => {
    const { data } = await api.delete(`/wishlist/remove/${productId}`);
    return data;
  },
};

// ============================================================================
// ORDERS
// ============================================================================

export const orderService = {

  /**
   * POST /api/orders
   * Creates order. Backend auto-assigns the logged-in user from JWT.
   */
  create: async ({ items, totalAmount, shippingAddress, paymentMethod, deliveryOptionId = null }) => {
    const { data } = await api.post('/orders', {
      items,           // [{ product: id, quantity, price }]
      totalAmount,
      shippingAddress, // { name, phone, address, city, state, pincode }
      paymentMethod,   // 'online' | 'cod'
      deliveryOptionId,
    });
    return data;
  },

  /** GET /api/orders/my-orders */
  getMyOrders: async () => {
    const { data } = await api.get('/orders/my-orders');
    return Array.isArray(data) ? data : [];
  },

  /** GET /api/orders/:id — admin */
  getById: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  /**
   * GET /api/orders/:id/invoice
   * Returns PDF as blob.
   */
  downloadInvoice: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob',
    });
    // Create download link
    const url    = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link   = document.createElement('a');
    link.href    = url;
    link.download = `invoice-${orderId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * POST /api/orders/:id/send-invoice
   * Backend generates PDF and emails it to the customer.
   */
  sendInvoiceByEmail: async (orderId) => {
    const { data } = await api.post(`/orders/${orderId}/send-invoice`);
    return data;
  },
};

// ============================================================================
// PAYMENT  (Razorpay)
// ============================================================================

export const paymentService = {

  /** GET /api/payment/key — get Razorpay public key */
  getRazorpayKey: async () => {
    const { data } = await api.get('/payment/key');
    return data.key;
  },

  /**
   * POST /api/payment/create-order
   * Creates a Razorpay order. Returns { id, amount, currency }.
   */
  createRazorpayOrder: async (amount, receipt) => {
    const { data } = await api.post('/payment/create-order', {
      amount,    // in INR (backend multiplies by 100)
      currency: 'INR',
      receipt,
    });
    return data;
  },

  /**
   * POST /api/payment/verify-payment
   * Verifies payment signature after Razorpay callback.
   */
  verifyPayment: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }) => {
    const { data } = await api.post('/payment/verify-payment', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    });
    return data;
  },
};

// ============================================================================
// SITE SETTINGS
// ============================================================================

export const settingsService = {
  get: async () => {
    const { data } = await api.get('/settings');
    return data;
  },
};

// Delivery options
export const deliveryService = {
  getAll: async () => {
    const { data } = await api.get('/delivery-options');
    return Array.isArray(data) ? data : [];
  },
};

// ============================================================================
// COUPON VALIDATION  (uses backend endpoint)
// ============================================================================

export const couponService = {
  /**
   * Validate a coupon code.
   * Backend: GET /api/coupons/validate?code=XXXX
   * (To be added to backend — see integration guide)
   */
  validate: async (code) => {
    const { data } = await api.get('/coupons/validate', { params: { code } });
    return data; // { valid, discount_type, discount_value, code }
  },
  getActive: async () => {
    const { data } = await api.get('/coupons/active');
    return Array.isArray(data) ? data : [];
  },
};
