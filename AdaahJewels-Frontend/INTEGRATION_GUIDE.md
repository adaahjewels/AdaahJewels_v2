# Dynamic API Integration Guide - MysticJewel

This document provides a complete guide to the integrated Dynamic API backend with the MysticJewel frontend.

## Overview

The MysticJewel frontend has been fully integrated with the Dynamic API backend, replacing all mock data with real API calls. The integration includes:

- ✅ Authentication (OTP-based login)
- ✅ Product Management
- ✅ Categories
- ✅ Cart Management
- ✅ Wishlist Management  
- ✅ Orders (Service Layer Ready)
- ✅ State Management with Context API
- ✅ Custom Hooks for Data Fetching
- ✅ Error Handling & Loading States
- ✅ Protected Routes

## Architecture

### Folder Structure

```
src/
├── api/                    # API Layer
│   ├── axiosInstance.js   # Configured axios with interceptors
│   ├── authApi.js         # Authentication endpoints
│   ├── dynamicApi.js      # Dynamic API executor
│   └── procedureBuilder.js # Payload builder utility
├── services/              # Business Logic Layer
│   ├── authService.js     # Auth services (if needed)
│   ├── productService.js  # Product operations
│   ├── categoryService.js # Category operations
│   ├── cartService.js     # Cart operations
│   ├── wishlistService.js # Wishlist operations
│   ├── orderService.js    # Order operations
│   └── testimonialService.js # Testimonials
├── hooks/                 # Custom React Hooks
│   ├── useAuth.js        # Authentication hook
│   ├── useProducts.js    # Product fetching hooks
│   ├── useCategories.js  # Category fetching hooks
│   ├── useWishlist.js    # Wishlist management hook
│   └── useCart.js        # Cart management hook
├── context/              # State Management
│   ├── AuthContext.jsx   # Auth context provider
│   ├── CartContext.jsx   # Cart context provider
│   └── WishlistContext.jsx # Wishlist context provider
├── components/
│   ├── ProtectedRoute.jsx # Route protection
│   └── states/            # UI States
│       ├── LoadingState.jsx
│       ├── ErrorState.jsx
│       └── EmptyState.jsx
├── pages/
│   ├── Login.jsx         # Login page (NEW)
│   ├── VerifyOTP.jsx     # OTP verification (NEW)
│   ├── Home.jsx          # Updated
│   ├── ProductList.jsx   # Updated
│   ├── ProductDetail.jsx # Updated
│   └── Wishlist.jsx      # Updated
├── utils/
│   └── storage.js        # LocalStorage utilities
└── .env                  # Environment variables (NEW)
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1.0
VITE_DYNAMIC_API_ENDPOINT=/DynamicApi/DynamicApiExecute
VITE_SEND_OTP_ENDPOINT=/auth/send-otp
VITE_VERIFY_OTP_ENDPOINT=/auth/verify-otp
```

## Authentication Flow

### 1. Login Page (`/login`)

```jsx
import Login from './pages/Login';

// User enters email → System sends OTP
```

**Process:**
- User enters email
- `sendOTPEmail()` is called
- API sends OTP to email
- Redirects to `/verify-otp`

### 2. OTP Verification (`/verify-otp`)

**Process:**
- User enters 6-digit OTP
- `verifyOTPCode()` validates OTP
- JWT token is received and stored
- User is redirected to home page
- `AuthContext` is updated with user data

### 3. Session Persistence

On page refresh:
- Token is read from `localStorage.authToken`
- User data is restored from `localStorage.user`
- Axios interceptor automatically attaches token to requests
- If token is invalid (401), user is redirected to login

## API Integration Examples

### Using Dynamic API Executor

```javascript
import { executeProcedure } from './api/dynamicApi';

// Example: Get products
const result = await executeProcedure('SP_GetProducts', {
  p_Category: 'Earrings',
  p_MinPrice: 100,
  p_MaxPrice: 1000,
});
```

### Using Services

```javascript
import { getProducts, getBestSellers } from './services/productService';

// Get products with filters
const products = await getProducts({
  category: 'Earrings',
  minPrice: 100,
  maxPrice: 1000,
  sortBy: 'price-low'
});

// Get best sellers
const bestSellers = await getBestSellers(6);
```

### Using Custom Hooks

```javascript
import { useProducts, useBestSellers } from './hooks/useProducts';

function MyComponent() {
  const { products, loading, error, fetchProducts } = useProducts();
  
  useEffect(() => {
    fetchProducts({ category: 'Earrings' });
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## State Management

### AuthContext

```javascript
import { useAuthContext } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logoutUser, sendOTPEmail } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <div>Welcome, {user.email}!</div>;
}
```

### CartContext

```javascript
import { useCartContext } from './context/CartContext';

function MyComponent() {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount
  } = useCartContext();

  return (
    <div>
      <p>Items in cart: {getCartCount()}</p>
      <p>Total: ₹{getCartTotal()}</p>
    </div>
  );
}
```

### WishlistContext

```javascript
import { useWishlistContext } from './context/WishlistContext';

function MyComponent() {
  const {
    wishlistItems,
    toggleWishlist,
    isInWishlist,
    removeFromWishlist
  } = useWishlistContext();

  return (
    <div>
      {wishlistItems.map(item => (
        <div key={item.id}>
          <p>{item.name}</p>
          <button onClick={() => removeFromWishlist(item.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Protected Routes

```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/verify-otp" element={<VerifyOTP />} />
  
  {/* Public Routes */}
  <Route path="/" element={<Home />} />
  <Route path="/products" element={<ProductList />} />
  
  {/* Protected Routes */}
  <Route path="/wishlist" element={
    <ProtectedRoute>
      <Wishlist />
    </ProtectedRoute>
  } />
</Routes>
```

## Offline Support

Both Cart and Wishlist support offline functionality:

1. **Unauthenticated Users:** Data is stored in localStorage
2. **Authenticated Users:** 
   - Data syncs with backend
   - localStorage serves as cache
   - Real-time updates on login

```javascript
const { cartItems, addItem, syncCart } = useCart();

// When user logs in
useEffect(() => {
  syncCart(); // Syncs server data with localStorage
}, [isAuthenticated]);
```

## Error Handling

### Global Error Handling

```javascript
// In axiosInstance.js interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Component-Level Error Handling

```javascript
import { ErrorState, ErrorAlert } from './components/states/ErrorState';

function MyComponent() {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <ErrorState 
        message={error}
        onRetry={() => setError(null)}
      />
    );
  }

  return <div>Content</div>;
}
```

## Loading States

```javascript
import { LoadingState, LoadingSpinner } from './components/states/LoadingState';
import { EmptyState } from './components/states/EmptyState';

// Full page loader
{loading && <LoadingState fullScreen message="Loading products..." />}

// Component loader
{loading && <LoadingSpinner size="md" />}

// Empty state
{products.length === 0 && (
  <EmptyState 
    title="No products found"
    actionText="Browse all products"
    actionLink="/products"
  />
)}
```

## Procedures Map

### Stored Procedures Implementation

| Feature | Procedure | Parameters | Status |
|---------|-----------|-----------|--------|
| **Products** | | | |
| Get All | SP_GetProducts | p_Category, p_MinPrice, p_MaxPrice, p_SortBy | ✅ |
| Get One | SP_GetProductById | p_ProductId | ✅ |
| Best Sellers | SP_GetBestSellers | p_Limit | ✅ |
| Recommendations | SP_GetRecommendations | p_ProductId, p_Limit | ✅ |
| **Categories** | | | |
| Get All | SP_GetCategories | - | ✅ |
| Get One | SP_GetCategoryById | p_CategoryId | ✅ |
| **Cart** | | | |
| Get Cart | SP_GetCart | - | ✅ |
| Add Item | SP_AddCartItem | p_ProductId, p_Quantity | ✅ |
| Update Item | SP_UpdateCartItem | p_ProductId, p_Quantity | ✅ |
| Remove Item | SP_RemoveCartItem | p_ProductId | ✅ |
| Clear | SP_ClearCart | - | ✅ |
| **Wishlist** | | | |
| Get All | SP_GetWishlist | - | ✅ |
| Add | SP_AddWishlist | p_ProductId | ✅ |
| Remove | SP_RemoveWishlist | p_ProductId | ✅ |
| **Orders** | | | |
| Create | SP_CreateOrder | p_ShippingAddress, etc. | ✅ |
| Get All | SP_GetOrders | p_Status, p_StartDate, p_EndDate | ✅ |
| Get Details | SP_GetOrderDetails | p_OrderId | ✅ |
| Cancel | SP_CancelOrder | p_OrderId | ✅ |
| **Auth** | | | |
| Send OTP | POST /auth/send-otp | email | ✅ |
| Verify OTP | POST /auth/verify-otp | email, otp | ✅ |

## Testing the Integration

### 1. Start Backend

```bash
cd DynamicApi-Express-MYSQL
npm install
npm start
# Backend runs at http://localhost:3000
```

### 2. Start Frontend

```bash
cd mystic-jewel
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

### 3. Test Login Flow

1. Navigate to http://localhost:5173/login
2. Enter any email address
3. Click "Send OTP"
4. Enter any 6-digit OTP (e.g., 123456)
5. System redirects to home page
6. User is logged in and can access protected features

### 4. Test API Calls

Open browser console and test:

```javascript
import { executeProcedure } from './api/dynamicApi';

// Get products
await executeProcedure('SP_GetProducts', {});

// Get categories
await executeProcedure('SP_GetCategories', {});
```

## Migration Checklist

- [x] Replace mock data with API calls
- [x] Implement authentication (OTP)
- [x] Create service layer
- [x] Create custom hooks
- [x] Implement context providers
- [x] Add protected routes
- [x] Create error handling components
- [x] Create loading states
- [x] Add offline support
- [x] Environment configuration
- [x] Backend integration

## Future Enhancements

1. **Search & Filters**: Implement advanced filtering
2. **Pagination**: Add pagination support
3. **Checkout**: Implement order creation
4. **Payment**: Add payment gateway integration
5. **Reviews**: Add product reviews/ratings
6. **User Profile**: Add user profile management
7. **Order History**: Implement order tracking
8. **Notifications**: Add real-time notifications

## Troubleshooting

### Issue: CORS Error

**Solution**: Check backend CORS configuration in `.env`:
```
CORS_ORIGINS=http://localhost:5173
```

### Issue: 401 Unauthorized

**Solution**: Token may have expired. Clear localStorage and login again:
```javascript
localStorage.clear();
window.location.href = '/login';
```

### Issue: API Returns Empty Data

**Solution**: Check if stored procedure exists on backend:
```sql
SHOW PROCEDURES LIKE 'SP_GetProducts%';
```

### Issue: Cart/Wishlist Not Syncing

**Solution**: Make sure user is authenticated:
```javascript
import { getAuthToken } from './api/authApi';
console.log(getAuthToken()); // Should return token string
```

## Support

For issues or questions, refer to:
- Backend Documentation: `DynamicApi-Express-MYSQL/README.md`
- API Documentation: `http://localhost:3000/api/v1.0/docs` (Swagger)

---

**Last Updated**: June 2026
**Version**: 1.0.0
