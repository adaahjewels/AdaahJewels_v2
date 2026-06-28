import { useState, useEffect } from 'react';
import { ChevronRight, Lock, Truck, Check, Banknote, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cartService, couponService } from '../api/backendServices';
import { createOrder } from '../services/orderService';
import RazorpayCheckout from '../components/RazorpayCheckout';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PAYMENT_OPTIONS = [
  { id: 'online',     label: 'Pay Online',         sub: 'Card / UPI / Net Banking via Razorpay', icon: CreditCard },
  { id: 'cod',        label: 'Cash on Delivery',   sub: 'Pay ₹49 extra. Available on orders up to ₹5000', icon: Banknote },
];

const COD_FEE      = 49;   // ₹ extra for COD
const COD_MAX      = 5000; // max order value for COD

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [currentStep,    setCurrentStep]    = useState(1);
  const [cartItems,      setCartItems]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [submitting,     setSubmitting]     = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [showRazorpay,   setShowRazorpay]   = useState(false);

  // Shipping
  const [shippingData, setShippingData] = useState({
    fullName: '', phoneNumber: '', email: user?.Email || user?.email || '',
    address: '', city: '', state: '', zipCode: '',
  });
  const [shippingErrors, setShippingErrors] = useState({});

  // Pre-fill from user
  useEffect(() => {
    if (user) {
      setShippingData(prev => ({
        ...prev,
        fullName:    prev.fullName    || user.Name    || user.name    || '',
        phoneNumber: prev.phoneNumber || user.MobileNumber || user.phone || '',
        email:       user.Email || user.email || '',
      }));
    }
  }, [user]);

  // Shipping method (delivery option id)
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [shippingMethod, setShippingMethod] = useState(null);

  // Coupon
  const [couponCode,     setCouponCode]     = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied,  setCouponApplied]  = useState(false);
  const [couponData,     setCouponData]     = useState(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('online');

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadCart();
    loadDeliveryOptions();
  }, [user, navigate]); // eslint-disable-line

  const loadDeliveryOptions = async () => {
    try {
      const opts = await (await import('../api/backendServices')).deliveryService.getAll();
      setDeliveryOptions(opts || []);
      if (opts && opts.length > 0) setShippingMethod(opts[0].id);
    } catch (err) {
      console.error('Failed to load delivery options', err);
    }
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      const items = await cartService.get();
      if (!items || items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      setCartItems(items.map(i => ({
        ...i,
        ProductId:   i.productId   || i.ProductId,
        ProductName: i.name        || i.ProductName  || '',
        ProductImage:i.image       || i.ImageUrl     || '',
        Price:       i.price       ?? i.Price        ?? 0,
        Quantity:    i.quantity    ?? i.Quantity      ?? 1,
      })));
    } catch {
      toast.error('Failed to load cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  // ── Calculations ────────────────────────────────────────────────────────────
  const subtotal     = cartItems.reduce((s, i) => s + i.Price * i.Quantity, 0);
  const selectedOption = deliveryOptions.find(o => String(o.id) === String(shippingMethod));
  const shippingCost = selectedOption ? (selectedOption.price || 0) : (subtotal >= 999 ? 0 : 99);
  const codFee       = paymentMethod === 'cod' ? COD_FEE : 0;
  const gst          = Math.round((subtotal + shippingCost) * 0.18 * 100) / 100;
  const total        = Math.max(0, subtotal + shippingCost + gst + codFee - couponDiscount);
  const codAvailable = subtotal <= COD_MAX;

  useEffect(() => {
    if (!codAvailable && paymentMethod === 'cod') {
      setPaymentMethod('online');
      toast(`COD is only available for orders up to ₹${COD_MAX}. Switched to online payment.`);
    }
  }, [codAvailable, paymentMethod]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateShipping = () => {
    const errors = {};
    if (!shippingData.fullName.trim())    errors.fullName    = 'Full name required';
    if (!shippingData.phoneNumber.trim()) errors.phoneNumber = 'Phone required';
    if (!shippingData.address.trim())     errors.address     = 'Address required';
    if (!shippingData.city.trim())        errors.city        = 'City required';
    if (!shippingData.state.trim())       errors.state       = 'State required';
    if (!shippingData.zipCode.trim())     errors.zipCode     = 'Pincode required';
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingChange = e => {
    const { name, value } = e.target;
    setShippingData(prev => ({ ...prev, [name]: value }));
    if (shippingErrors[name]) setShippingErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Coupon ──────────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return; }
    try {
      const result = await couponService.validate(couponCode.trim());
      const discount = result.discount_type === 'percentage'
        ? Math.round((subtotal * result.discount_value) / 100 * 100) / 100
        : result.discount_value;
      setCouponDiscount(discount);
      setCouponApplied(true);
      setCouponData(result);
      toast.success(`Coupon applied! You save ₹${discount.toFixed(2)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode(''); setCouponDiscount(0); setCouponApplied(false); setCouponData(null);
  };

  // ── Continue step 1 with validation ─────────────────────────────────────────
  const handleContinueShipping = () => {
    if (validateShipping()) setCurrentStep(2);
  };

  // ── Place Order ─────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!validateShipping()) { setCurrentStep(1); return; }

    // COD availability check
    if (paymentMethod === 'cod' && !codAvailable) {
      toast.error(`COD is only available for orders up to ₹${COD_MAX}`);
      return;
    }

    setSubmitting(true);
    try {
      const items = cartItems.map(item => ({
        product:  item.ProductId,
        quantity: item.Quantity,
        price:    item.Price,
      }));

      const order = await createOrder({
        items,
        totalAmount:     total,
        paymentMethod:   paymentMethod, // 'online' | 'cod'
        shippingAddress: {
          name:    shippingData.fullName,
          phone:   shippingData.phoneNumber,
          address: shippingData.address,
          city:    shippingData.city,
          state:   shippingData.state,
          pincode: shippingData.zipCode,
        },
        // Map shipping method to a delivery option id if available
        deliveryOptionId: shippingMethod,
      });

      const ordId = order?.OrderId || order?.id;
      if (!ordId) throw new Error('No order ID returned');

      if (paymentMethod === 'cod') {
        // COD — no payment gateway, order is already created
        await cartService.clear().catch(() => {});
        toast.success('Order placed! Pay on delivery.');
        navigate(`/order-confirmation/${ordId}`);
      } else {
        // Online payment via Razorpay
        setCreatedOrderId(ordId);
        setShowRazorpay(true);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to place order');
      console.error('Place order error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await cartService.clear().catch(() => {});
    toast.success('Payment successful! Order confirmed.');
    navigate(`/order-confirmation/${createdOrderId}`);
  };

  const handlePaymentFailure = errMsg => {
    toast.error(errMsg || 'Payment failed');
    setShowRazorpay(false);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen"
        style={{ background: 'var(--color-cream-100)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4"
          style={{ borderColor: 'var(--color-brand-100)', borderTopColor: 'var(--color-brand-500)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12" style={{ background: 'var(--color-cream-100)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl md:text-4xl mb-1"
            style={{ color: 'var(--color-ink)' }}>Checkout</h1>
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
            Complete your purchase securely
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10 max-w-sm">
          {[
            { n: 1, label: 'Shipping' },
            { n: 2, label: 'Delivery' },
            { n: 3, label: 'Payment' },
          ].map(({ n, label }, idx) => (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => n < currentStep && setCurrentStep(n)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  n < currentStep ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{
                  background: currentStep >= n ? 'var(--color-brand-600)' : 'var(--color-neutral-200)',
                  color: currentStep >= n ? 'white' : 'var(--color-ink-muted)',
                }}
              >
                {n < currentStep ? <Check className="w-4 h-4" /> : n}
              </button>
              <span className="ml-2 text-xs font-semibold hidden sm:block shrink-0"
                style={{ color: currentStep >= n ? 'var(--color-ink)' : 'var(--color-ink-muted)' }}>
                {label}
              </span>
              {idx < 2 && (
                <div className="flex-1 h-0.5 mx-2"
                  style={{ background: currentStep > n ? 'var(--color-brand-400)' : 'var(--color-neutral-200)' }} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Steps ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Step 1: Shipping */}
            <StepCard title="Shipping Address" step={1} current={currentStep}
              onEdit={() => setCurrentStep(1)}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" required error={shippingErrors.fullName}>
                    <input name="fullName" value={shippingData.fullName}
                      onChange={handleShippingChange} placeholder="Priya Sharma"
                      className="input-premium w-full" />
                  </Field>
                  <Field label="Phone Number" required error={shippingErrors.phoneNumber}>
                    <input name="phoneNumber" value={shippingData.phoneNumber}
                      onChange={handleShippingChange} placeholder="9876543210" type="tel"
                      className="input-premium w-full" />
                  </Field>
                </div>
                <Field label="Email">
                  <input name="email" value={shippingData.email} readOnly type="email"
                    className="input-premium w-full opacity-70 cursor-not-allowed" />
                </Field>
                <Field label="Street Address" required error={shippingErrors.address}>
                  <input name="address" value={shippingData.address}
                    onChange={handleShippingChange} placeholder="123, Main Street, Apartment 4B"
                    className="input-premium w-full" />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="City" required error={shippingErrors.city}>
                    <input name="city" value={shippingData.city}
                      onChange={handleShippingChange} placeholder="Mumbai"
                      className="input-premium w-full" />
                  </Field>
                  <Field label="State" required error={shippingErrors.state}>
                    <input name="state" value={shippingData.state}
                      onChange={handleShippingChange} placeholder="Maharashtra"
                      className="input-premium w-full" />
                  </Field>
                  <Field label="Pincode" required error={shippingErrors.zipCode}>
                    <input name="zipCode" value={shippingData.zipCode}
                      onChange={handleShippingChange} placeholder="400001"
                      className="input-premium w-full" />
                  </Field>
                </div>
                <button onClick={handleContinueShipping}
                  className="btn-primary w-full justify-center mt-2">
                  Continue to Delivery →
                </button>
              </div>
            </StepCard>

            {/* Step 2: Shipping Method */}
            {currentStep >= 2 && (
              <StepCard title="Delivery Method" step={2} current={currentStep}
                onEdit={() => setCurrentStep(2)}>
                <div className="space-y-3">
                  {deliveryOptions.map(opt => (
                    <label key={opt.id}
                      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${
                        String(shippingMethod) === String(opt.id)
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-neutral-200 hover:border-brand-300'
                      }`}>
                      <div className="flex items-center gap-3">
                        <RadioDot checked={String(shippingMethod) === String(opt.id)} />
                        <input type="radio" name="shipping" value={opt.id}
                          checked={String(shippingMethod) === String(opt.id)}
                          onChange={() => setShippingMethod(opt.id)}
                          className="sr-only" />
                        <div>
                          <p className="font-semibold text-sm"
                            style={{ color: 'var(--color-ink)' }}>{opt.name}</p>
                          <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                            {opt.estimated_days ? `${opt.estimated_days} business days` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-sm"
                        style={{ color: 'var(--color-ink)' }}>
                        {opt.price === 0 ? 'FREE' : `₹${opt.price}`}
                      </span>
                    </label>
                  ))}
                  <button onClick={() => setCurrentStep(3)}
                    className="btn-primary w-full justify-center mt-2">
                    Continue to Payment →
                  </button>
                </div>
              </StepCard>
            )}

            {/* Step 3: Payment Method */}
            {currentStep >= 3 && (
              <StepCard title="Payment Method" step={3} current={currentStep}>
                <div className="space-y-3 mb-5">
                  {PAYMENT_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const disabled = opt.id === 'cod' && !codAvailable;
                    return (
                      <label key={opt.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                          disabled
                            ? 'opacity-40 cursor-not-allowed border-neutral-100'
                            : paymentMethod === opt.id
                              ? 'border-brand-500 bg-brand-50 cursor-pointer'
                              : 'border-neutral-200 hover:border-brand-300 cursor-pointer'
                        }`}>
                        <RadioDot checked={paymentMethod === opt.id && !disabled} />
                        <input type="radio" name="payment" value={opt.id}
                          checked={paymentMethod === opt.id}
                          disabled={disabled}
                          onChange={() => !disabled && setPaymentMethod(opt.id)}
                          className="sr-only" />
                        <Icon className="w-5 h-5 shrink-0 mt-0.5"
                          style={{ color: 'var(--color-brand-500)' }} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm" style={{ color: 'var(--color-ink)' }}>
                            {opt.label}
                            {opt.id === 'cod' && codFee > 0 && paymentMethod === 'cod' && (
                              <span className="ml-2 text-xs font-normal"
                                style={{ color: 'var(--color-ink-muted)' }}>
                                (+₹{COD_FEE} COD fee)
                              </span>
                            )}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
                            {disabled ? `Not available for orders above ₹${COD_MAX}` : opt.sub}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {paymentMethod === 'cod' && (
                  <div className="p-3 rounded-xl mb-4 text-sm"
                    style={{ background: '#FFF8E1', border: '1px solid #F5E199', color: '#7A5800' }}>
                    💡 Cash on Delivery — please keep exact change ready. Our delivery partner will collect payment at your door.
                  </div>
                )}

                <div className="p-3 rounded-xl flex items-center gap-2 mb-5 text-sm"
                  style={{ background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)' }}>
                  <Lock className="w-4 h-4 shrink-0"
                    style={{ color: 'var(--color-brand-500)' }} />
                  <span style={{ color: 'var(--color-ink-secondary)' }}>
                    Your payment is 256-bit SSL encrypted and secure.
                  </span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="btn-primary w-full justify-center text-base py-4"
                >
                  {submitting
                    ? 'Placing Order…'
                    : paymentMethod === 'cod'
                      ? `Place Order — Pay ₹${total.toFixed(0)} on Delivery`
                      : `Pay ₹${total.toFixed(0)} Securely`}
                </button>
              </StepCard>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl p-6"
              style={{ background: 'white', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-md)' }}>
              <h2 className="font-display font-bold text-lg mb-5"
                style={{ color: 'var(--color-ink)' }}>Order Summary</h2>

              {/* Items */}
              <div className="space-y-2 mb-5 max-h-44 overflow-y-auto"
                style={{ borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '1rem' }}>
                {cartItems.map(item => (
                  <div key={item.ProductId} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-ink-secondary)' }}>
                      {item.ProductName}
                      <span className="font-semibold ml-1" style={{ color: 'var(--color-ink)' }}>
                        ×{item.Quantity}
                      </span>
                    </span>
                    <span className="font-medium" style={{ color: 'var(--color-ink)' }}>
                      ₹{(item.Price * item.Quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-5" style={{ borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '1rem' }}>
                {!couponApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Promo code"
                      className="input-premium flex-1 text-sm"
                    />
                    <button onClick={handleApplyCoupon}
                      className="px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--color-brand-900)', color: 'white' }}>
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl text-sm"
                    style={{ background: '#E8F5EE', border: '1px solid #B2DFCA' }}>
                    <div>
                      <span className="font-bold" style={{ color: '#2E7D32' }}>{couponCode}</span>
                      <span className="ml-2 text-xs" style={{ color: '#388E3C' }}>
                        −₹{couponDiscount.toFixed(0)} off
                      </span>
                    </div>
                    <button onClick={handleRemoveCoupon}
                      className="text-xs font-semibold" style={{ color: '#388E3C' }}>✕</button>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm mb-5">
                <SummaryRow label="Subtotal"  value={`₹${subtotal.toFixed(0)}`} />
                <SummaryRow label="Shipping"  value={shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  accent={shippingCost === 0} />
                <SummaryRow label="GST (18%)" value={`₹${gst.toFixed(0)}`} />
                {codFee > 0 && (
                  <SummaryRow label="COD Fee" value={`₹${codFee}`} />
                )}
                {couponApplied && (
                  <SummaryRow label="Discount" value={`−₹${couponDiscount.toFixed(0)}`} accent />
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3"
                style={{ borderTop: '2px solid var(--color-brand-100)' }}>
                <span className="font-display font-bold text-base"
                  style={{ color: 'var(--color-ink)' }}>Total</span>
                <span className="font-display font-black text-2xl"
                  style={{ color: 'var(--color-brand-700)' }}>₹{total.toFixed(0)}</span>
              </div>

              {paymentMethod === 'cod' && (
                <p className="mt-3 text-xs text-center font-medium"
                  style={{ color: 'var(--color-ink-muted)' }}>
                  💰 Pay on Delivery
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Razorpay Modal ── */}
      {showRazorpay && createdOrderId && (
        <RazorpayCheckout
          autoOpen
          orderId={createdOrderId}
          amount={total}
          customerName={shippingData.fullName}
          customerEmail={shippingData.email}
          customerPhone={shippingData.phoneNumber}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </div>
  );
};

/* ── Small reusable components ─────────────────────────────────────────────── */
const StepCard = ({ title, step, current, onEdit, children }) => (
  <div className="rounded-2xl p-6 md:p-7"
    style={{ background: 'white', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}>
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'var(--color-brand-600)', color: 'white' }}>
          {current > step ? <Check className="w-4 h-4" /> : step}
        </div>
        <h2 className="font-display font-bold text-lg" style={{ color: 'var(--color-ink)' }}>
          {title}
        </h2>
      </div>
      {current > step && onEdit && (
        <button onClick={onEdit}
          className="text-xs font-semibold underline"
          style={{ color: 'var(--color-brand-600)' }}>
          Edit
        </button>
      )}
    </div>
    {children}
  </div>
);

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
      style={{ color: 'var(--color-ink-secondary)' }}>
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const RadioDot = ({ checked }) => (
  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
    style={{
      borderColor: checked ? 'var(--color-brand-500)' : 'var(--color-neutral-300)',
      background: 'transparent',
    }}>
    {checked && (
      <div className="w-2.5 h-2.5 rounded-full"
        style={{ background: 'var(--color-brand-500)' }} />
    )}
  </div>
);

const SummaryRow = ({ label, value, accent }) => (
  <div className="flex justify-between">
    <span style={{ color: 'var(--color-ink-muted)' }}>{label}</span>
    <span className="font-medium"
      style={{ color: accent ? 'var(--color-brand-600)' : 'var(--color-ink)' }}>
      {value}
    </span>
  </div>
);

export default CheckoutPage;
