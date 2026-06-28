# AdaahJewels — Frontend ↔ Backend Integration Guide

## What Was Done

### New Files Created

| File | Purpose |
|---|---|
| `frontend/src/api/apiClient.js` | Single Axios instance, token management, auto-refresh |
| `frontend/src/api/backendServices.js` | All API calls mapped to actual backend routes |
| `frontend/src/components/RazorpayCheckout.jsx` | Full Razorpay payment flow component |
| `server/src/routes/cart.ts` | Cart API (in-memory store — swap with DB later) |
| `server/src/routes/wishlist.ts` | Wishlist API (in-memory store) |
| `server/src/routes/coupons.ts` | Coupon CRUD + validation endpoint |
| `server/.env.example` | Updated with all required env vars |
| `frontend/.env.local.example` | Clean frontend env with correct backend URL |

### Files Modified

| File | Change |
|---|---|
| `server/src/index.ts` | Added cart/wishlist/coupon routes; fixed CORS (was `cors()` with no config) |

---

## Critical Fixes Required in Existing Frontend Files

The existing frontend service layer (`dynamicApiService.js`, `authApi.js`, etc.) targets a *different* backend that doesn't exist here. You need to swap the data source in each page/hook.

### 1. Fix the Base URL (Immediate)

Your `.env.local` currently has:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1.0
```
Change it to:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Fix Auth (Login / Register)

The existing `authApi.js` sends requests to dynamic endpoints from env vars and expects `{ status: true, data: { token, user } }`.

The actual backend returns `{ accessToken, refreshToken, user: { id, name, email, phone, role } }`.

**Replace calls in `useAuth.js`** — swap `loginUser()`/`registerUser()` from `authApi.js` with `authService.login()`/`authService.register()` from `backendServices.js`.

```js
// BEFORE (useAuth.js line ~65)
const response = await loginUser(emailOrMobile, password);
const userData = response.data?.user;

// AFTER
import { authService } from '../api/backendServices';
const { user: userData } = await authService.login(emailOrMobile, password);
setUser(userData);
```

### 3. Fix ProductService

```js
// BEFORE (productService.js)
import { productApi } from '../api/dynamicApiService';
const result = await productApi.getProducts(filters);

// AFTER
import { productService } from '../api/backendServices';
const result = await productService.getAll(filters);
```

### 4. Fix OrderService

```js
// BEFORE (orderService.js)
import { orderApi } from '../api/dynamicApiService';
await orderApi.createOrder(user.userId, shippingDetails, paymentMethod, notes);

// AFTER
import { orderService } from '../api/backendServices';
await orderService.create({ items, totalAmount, shippingAddress, paymentMethod });
```

### 5. Fix CartContext / useCart

Replace calls to `cartApi` from `dynamicApiService.js` with `cartService` from `backendServices.js`.

### 6. Fix CheckoutPage — Add Razorpay

Replace the fake payment radio buttons with `<RazorpayCheckout>`:

```jsx
import RazorpayCheckout from '../components/RazorpayCheckout';
import { orderService } from '../api/backendServices';

const handlePlaceOrder = async () => {
  // 1. Create order in DB first (status: pending)
  const order = await orderService.create({
    items: cartItems.map(i => ({
      product:  i.productId,
      quantity: i.quantity,
      price:    i.price,
    })),
    totalAmount: total,
    shippingAddress: {
      name:    shippingData.fullName,
      phone:   shippingData.phoneNumber,
      address: shippingData.address,
      city:    shippingData.city,
      state:   shippingData.state,
      pincode: shippingData.zipCode,
    },
    paymentMethod: 'online',
  });

  setCreatedOrderId(order._id);
  setShowPayment(true);  // then render RazorpayCheckout
};

// In JSX:
{showPayment && (
  <RazorpayCheckout
    amount={total}
    orderId={createdOrderId}
    customerName={shippingData.fullName}
    customerEmail={user.email}
    customerPhone={shippingData.phoneNumber}
    onSuccess={(paymentId) => {
      navigate(`/order-confirmation/${createdOrderId}`);
    }}
    onFailure={(err) => toast.error(err)}
  />
)}
```

### 7. Add Invoice Download to OrdersPage

Add a download button in the orders table:

```jsx
import { orderService } from '../api/backendServices';

// In the actions column:
<button
  onClick={() => orderService.downloadInvoice(order._id)}
  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
  title="Download Invoice"
>
  <Download className="w-4 h-4" />
</button>

// For email invoice:
<button
  onClick={async () => {
    await orderService.sendInvoiceByEmail(order._id);
    toast.success('Invoice sent to your email!');
  }}
  title="Email Invoice"
>
  <Mail className="w-4 h-4" />
</button>
```

### 8. Fix Coupon Validation in CheckoutPage

Replace hardcoded test coupons:

```js
// BEFORE — hardcoded in CheckoutPage
const testCoupons = { 'WELCOME50': { discount: 50, type: 'fixed' }, ... };

// AFTER
import { couponService } from '../api/backendServices';
const handleApplyCoupon = async () => {
  try {
    const result = await couponService.validate(couponCode);
    const discount = result.discountType === 'percentage'
      ? subtotal * result.discountValue / 100
      : result.discountValue;
    setCouponDiscount(discount);
    setCouponApplied(true);
    toast.success(`Coupon applied! Saved ₹${discount.toFixed(2)}`);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Invalid coupon');
  }
};
```

---

## API Reference (This Backend)

### Authentication
| Method | Path | Auth | Body/Params |
|---|---|---|---|
| POST | `/api/au th/register` | No | `{ name, email, phone, password }` |
| POST | `/api/auth/login` | No | `{ emailOrPhone, password }` |
| POST | `/api/auth/refresh-token` | No | `{ refreshToken }` |
| GET  | `/api/auth/profile` | Yes | — |
| PUT  | `/api/auth/profile` | Yes | `{ name, email, phone }` |
| PUT  | `/api/auth/change-password` | Yes | `{ currentPassword, newPassword }` |
| POST | `/api/auth/forgot-password` | No | `{ email }` |
| POST | `/api/auth/reset-password` | No | `{ resetToken, newPassword }` |

### OTP
| Method | Path | Body |
|---|---|---|
| POST | `/api/otp/send` | `{ email?, phone?, type }` — type: `registration\|login\|password-reset` |
| POST | `/api/otp/verify` | `{ email?, phone?, otp, type }` |

### Products
| Method | Path | Query Params |
|---|---|---|
| GET | `/api/products` | `subCategory, materialType, minPrice, maxPrice, search` |
| GET | `/api/products/:id` | — |
| POST | `/api/products` | Admin only |
| PUT | `/api/products/:id` | Admin only |
| DELETE | `/api/products/:id` | Admin only (soft delete) |

### Categories
| Method | Path | Notes |
|---|---|---|
| GET | `/api/categories` | Active top-level categories |
| GET | `/api/subcategories?category=<id>` | Filter by parent category |

### Cart (new)
| Method | Path | Body |
|---|---|---|
| GET | `/api/cart` | — |
| POST | `/api/cart/add` | `{ productId, quantity }` |
| PUT | `/api/cart/update` | `{ productId, quantity }` |
| DELETE | `/api/cart/remove/:productId` | — |
| DELETE | `/api/cart/clear` | — |

### Orders
| Method | Path | Body/Notes |
|---|---|---|
| POST | `/api/orders` | `{ items, totalAmount, shippingAddress, paymentMethod }` |
| GET | `/api/orders/my-orders` | Customer's own orders |
| GET | `/api/orders` | Admin: all orders |
| PATCH | `/api/orders/:id/status` | Admin: `{ status }` |
| GET | `/api/orders/:id/invoice` | Returns PDF blob |
| POST | `/api/orders/:id/send-invoice` | Emails PDF to customer |

### Payment
| Method | Path | Body |
|---|---|---|
| GET | `/api/payment/key` | Returns Razorpay public key |
| POST | `/api/payment/create-order` | `{ amount, currency, receipt }` |
| POST | `/api/payment/verify-payment` | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }` |

### Coupons (new)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/coupons/validate?code=XXX` | Public — validates coupon |
| GET | `/api/coupons` | Admin |
| POST | `/api/coupons` | Admin |
| PUT | `/api/coupons/:id` | Admin |
| DELETE | `/api/coupons/:id` | Admin |

### Wishlist (new)
| Method | Path | Body |
|---|---|---|
| GET | `/api/wishlist` | — |
| POST | `/api/wishlist/add` | `{ productId }` |
| DELETE | `/api/wishlist/remove/:productId` | — |

---

## Response Shape Mapping

The existing frontend code expects some field names that differ from the backend. `backendServices.js` normalizes these internally.

| Backend Returns | Frontend Needs | Handled By |
|---|---|---|
| `user.id` | `user.userId` | `normalizeUser()` in backendServices.js |
| `user.name` | `user.Name` | Same |
| `user.email` | `user.Email` | Same |
| `user.phone` | `user.MobileNumber` | Same |
| `accessToken` | stored as `authToken` | `apiClient.js` setToken() |
| `order._id` | was expected as `OrderId` | Update pages to use `order._id` |

---

## Quick Start

```bash
# 1. Backend
cd server
cp .env.example .env
# Fill in .env (MONGODB_URI, JWT_SECRET, EMAIL_*, TWILIO_*, RAZORPAY_*)
npm run dev                  # starts on port 5000

# 2. Frontend
cd AdaahJewels-Frontend
cp .env.local.example .env.local
# Verify VITE_API_BASE_URL=http://localhost:5000/api
npm run dev                  # starts on port 5173
```

---

## Testing Checklist

- [ ] `GET http://localhost:5000/` returns `{ message: 'Adaah Jewels API is running' }`
- [ ] `POST /api/auth/register` creates user, returns `{ accessToken, refreshToken, user }`
- [ ] `POST /api/auth/login` returns tokens
- [ ] `GET /api/products` returns product array
- [ ] `GET /api/categories` returns category tree
- [ ] `POST /api/cart/add` (with Authorization header) adds item
- [ ] `POST /api/orders` (with Authorization header) creates order
- [ ] `GET /api/orders/:id/invoice` returns PDF file
- [ ] `POST /api/payment/create-order` returns Razorpay order id
- [ ] `POST /api/payment/verify-payment` with valid signature returns `{ success: true }`
- [ ] Email is received after order invoice send (requires EMAIL_USER + EMAIL_PASSWORD)
- [ ] SMS is received after order status change (requires TWILIO_* vars)

---

## What the Developer Should Also Know

1. **The existing `dynamicApiService.js` targets a different backend** — it calls `SP_GetProducts`, `SP_CreateOrder` etc. via a stored-procedure gateway that doesn't exist in this project. Don't delete it yet (admin panel uses it), but all customer-facing pages should be migrated to `backendServices.js`.

2. **Admin panel uses `dynamicApiService.js` too** — `Categories.jsx`, `Products.jsx`, `Orders.jsx` etc. all call SPs that don't exist in this backend. These need to be refactored to call the REST endpoints directly (use `backendServices.js` equivalents or call `api` directly).

3. **Cart and Wishlist are currently in-memory** — they reset on server restart. For production, add `cart` and `cart_items` tables to the MySQL migration schema (already defined in `01_schema.sql` design notes), then replace the in-memory store in `cart.ts` / `wishlist.ts` with DB calls.

4. **OTP paths differ** — frontend calls `/auth/send-otp` but backend has `/otp/send`. `backendServices.js` already uses the correct paths. Make sure you use `otpService.send()` from `backendServices.js` not the old `authApi.js` functions.

5. **Refresh token rotation** — `apiClient.js` automatically retries requests after refreshing the access token. No manual handling needed in components.
