/**
 * RazorpayCheckout.jsx
 *
 * Handles the full Razorpay payment flow:
 *   1. Create backend order  → POST /api/payment/create-order
 *   2. Open Razorpay modal
 *   3. On success → verify   → POST /api/payment/verify-payment
 *   4. On verified → call onSuccess(paymentId)
 *   5. On failure  → call onFailure(error)
 *
 * Usage:
 *   <RazorpayCheckout
 *     amount={total}           // in INR (whole number)
 *     orderId={createdOrderId} // your DB order id
 *     customerName="John Doe"
 *     customerEmail="john@example.com"
 *     customerPhone="9876543210"
 *     onSuccess={(paymentId) => navigate('/order-confirmation/' + orderId)}
 *     onFailure={(err) => toast.error(err)}
 *   />
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { paymentService } from '../api/backendServices';
import toast from 'react-hot-toast';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script   = document.createElement('script');
    script.src     = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const RazorpayCheckout = ({
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
  children,
  disabled = false,
  autoOpen = false,
}) => {
  const [loading, setLoading] = useState(false);
  const openedRef = useRef(false);

  const handlePayment = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay SDK failed to load. Check your internet connection.');

      // 2. Get Razorpay public key
      const razorpayKey = await paymentService.getRazorpayKey();

      // 3. Create Razorpay order on backend
      const rzpOrder = await paymentService.createRazorpayOrder(
        Math.round(amount),             // INR
        `receipt_order_${orderId}`
      );

      // 4. Open Razorpay modal
      const options = {
        key:          razorpayKey,
        amount:       rzpOrder.amount,    // in paise (backend already did *100)
        currency:     rzpOrder.currency || 'INR',
        name:         'Adaah Jewels',
        description:  `Order #${orderId}`,
        order_id:     rzpOrder.id,
        prefill: {
          name:    customerName  || '',
          email:   customerEmail || '',
          contact: customerPhone || '',
        },
        theme: { color: '#b8860b' },     // gold to match jewellery brand

        handler: async (response) => {
          // 5. Verify payment on backend
          try {
            const verified = await paymentService.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId,
            });

            if (verified.success) {
              toast.success('Payment successful!');
              onSuccess?.(response.razorpay_payment_id);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Verification failed';
            toast.error(msg);
            onFailure?.(msg);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled');
            onFailure?.('Payment cancelled by user');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        const msg = response.error?.description || 'Payment failed';
        toast.error(msg);
        onFailure?.(msg);
      });
      rzp.open();

    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Payment initiation failed';
      toast.error(msg);
      onFailure?.(msg);
    } finally {
      setLoading(false);
    }
  }, [amount, customerEmail, customerName, customerPhone, onFailure, onSuccess, orderId]);

  useEffect(() => {
    if (autoOpen && !openedRef.current) {
      openedRef.current = true;
      handlePayment();
    }
  }, [autoOpen, handlePayment]);

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full px-4 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400
                 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          Initiating Payment...
        </>
      ) : (
        children || `Pay ₹${amount.toFixed(2)}`
      )}
    </button>
  );
};

export default RazorpayCheckout;
