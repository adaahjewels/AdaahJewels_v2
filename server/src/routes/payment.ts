import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth';
import { updateOrderPayment } from '../repositories/order.repository';

const router = express.Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_1234567890',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key',
});

// ── POST /api/payment/create-order ────────────────────────────────────────────
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const order = await razorpay.orders.create({
      amount:          amount * 100, // paise
      currency,
      receipt:         receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    } as any);

    res.json(order);
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
});

// ── POST /api/payment/verify-payment ─────────────────────────────────────────
router.post('/verify-payment', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const sign        = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret_key')
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update order to confirmed with payment details
    if (orderId) {
      await updateOrderPayment(
        Number(orderId),
        'confirmed',
        'online',
        razorpay_payment_id,
        razorpay_order_id
      );
    }

    res.json({
      success:   true,
      message:   'Payment verified successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// ── GET /api/payment/key ──────────────────────────────────────────────────────
router.get('/key', (_req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890' });
});

export default router;
