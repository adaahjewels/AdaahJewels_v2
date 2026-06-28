import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import { AuthRequest } from '../types';
import * as orderRepo   from '../repositories/order.repository';
import * as userRepo    from '../repositories/user.repository';
import * as productRepo from '../repositories/product.repository';
import { generateInvoicePDF } from '../services/invoiceService';
import { sendInvoiceEmail, sendNotificationEmail } from '../services/emailService';
import { enqueueInvoice } from '../jobs/invoiceJob';
import { sendOrderNotificationSMS } from '../services/smsService';

const router = express.Router();

// ── POST /api/orders ──────────────────────────────────────────────────────────
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      totalAmount, paymentMethod,
      // Accept both flat fields AND nested shippingAddress object
      shippingName:    flatName,
      shippingPhone:   flatPhone,
      shippingAddress: flatAddress,
      shippingCity:    flatCity,
      shippingState:   flatState,
      shippingPincode: flatPincode,
      items,
    } = req.body;

    // Nested shippingAddress from frontend checkout
    const addr = req.body.shippingAddress;
    const isNested = addr && typeof addr === 'object' && !Array.isArray(addr);

    const shippingName    = isNested ? (addr.name    || '') : (flatName    || '');
    const shippingPhone   = isNested ? (addr.phone   || '') : (flatPhone   || '');
    const shippingAddress = isNested ? (addr.address || '') : (typeof flatAddress === 'string' ? flatAddress : '');
    const shippingCity    = isNested ? (addr.city    || '') : (flatCity    || '');
    const shippingState   = isNested ? (addr.state   || '') : (flatState   || '');
    const shippingPincode = isNested ? (addr.pincode || '') : (flatPincode || '');

    // Validate required fields
    if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity || !shippingState || !shippingPincode) {
      return res.status(400).json({ message: 'All shipping fields are required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Normalise items — frontend may send { product, quantity, price } or { product_id, qty, price }
    const normalisedItems = items.map((item: any) => ({
      product_id: Number(item.product_id || item.product || item.productId || item.ProductId || 0),
      qty:        Number(item.qty        || item.quantity || item.Quantity || 1),
      price:      Number(item.price      || item.Price   || 0),
    }));

    if (normalisedItems.some(i => !i.product_id)) {
      return res.status(400).json({ message: 'Each item must have a valid product ID' });
    }

    const resolvedPaymentMethod =
      paymentMethod === 'cod' ? 'cod' : 'online';

    const { order } = await orderRepo.createOrder({
      userId:          req.user!.id,
      totalAmount:     Number(totalAmount) || 0,
      paymentMethod:   resolvedPaymentMethod,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      items: normalisedItems,
    });

    // Optionally persist delivery option if provided
    const deliveryOptionId = req.body.deliveryOptionId || req.body.delivery_option_id || null;
    if (deliveryOptionId) {
      try {
        await orderRepo.setDeliveryOption(Number(order.id), Number(deliveryOptionId));
      } catch (err) {
        console.error('Failed to set delivery option for order', order.id, err);
      }
    }

    res.status(201).json(order);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', detail: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// ── GET /api/orders/my-orders ─────────────────────────────────────────────────
router.get('/my-orders', authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await orderRepo.getOrdersByUser(req.user!.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// ── GET /api/orders  (admin) ──────────────────────────────────────────────────
router.get('/', authenticate, isAdmin, async (_req, res) => {
  try {
    const orders = await orderRepo.getOrdersAdmin();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await orderRepo.getOrderById(Number(req.params.id));
    if (!result) return res.status(404).json({ message: 'Order not found' });

    // Only owner or admin can view
    if (result.order.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// ── PATCH /api/orders/:id/status  (admin) ────────────────────────────────────
router.patch('/:id/status', authenticate, isAdmin, async (_req, res) => {
  const req = _req as AuthRequest;
  try {
    const { status } = req.body;
    const order = await orderRepo.updateOrderStatus(Number(req.params.id), status);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Send notification to customer
    const user = await userRepo.getUserById(order.user_id);
    if (user) {
      const message = `Order #${order.id} has been ${status}`;
      if (user.email) await sendNotificationEmail(user.email, 'Order Status Update', message);
      if (user.phone) await sendOrderNotificationSMS(user.phone, String(order.id), status);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order' });
  }
});

// ── POST /api/orders/:id/send-invoice ────────────────────────────────────────
router.post('/:id/send-invoice', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await orderRepo.getOrderById(Number(req.params.id));
    if (!result) return res.status(404).json({ message: 'Order not found' });

    const { order, items } = result;
    if (order.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const user = await userRepo.getUserById(order.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const invoiceItems = items.map(item => ({
      productName: item.product_name || 'Product',
      quantity:    item.quantity,
      price:       item.price,
    }));

    const subtotal    = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax         = subtotal * 0.18;
    const shippingCost = 100;

    // Enqueue invoice generation+email so it runs in background
    await enqueueInvoice(Number(order.id), user.email || null);
    res.json({ message: 'Invoice job queued', orderId: order.id });
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ message: 'Failed to send invoice' });
  }
});

// ── GET /api/orders/:id/invoice ───────────────────────────────────────────────
router.get('/:id/invoice', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await orderRepo.getOrderById(Number(req.params.id));
    if (!result) return res.status(404).json({ message: 'Order not found' });

    const { order, items } = result;
    if (order.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const user = await userRepo.getUserById(order.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const invoiceItems = items.map(item => ({
      productName: item.product_name || 'Product',
      quantity:    item.quantity,
      price:       item.price,
    }));

    const subtotal    = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax         = subtotal * 0.18;
    const shippingCost = 100;

    const pdfBuffer = await generateInvoicePDF({
      orderId:         String(order.id),
      orderDate:       order.created_at,
      customerName:    user.name,
      customerEmail:   user.email,
      customerPhone:   user.phone || 'N/A',
      shippingAddress: {
        address: `${order.shipping_name}, ${order.shipping_phone}, ${order.shipping_address}`,
        city:    order.shipping_city,
        state:   order.shipping_state,
        pincode: order.shipping_pincode,
      },
      items:           invoiceItems,
      subtotal,
      tax,
      shippingCost,
      total:           subtotal + tax + shippingCost,
      paymentMethod:   order.payment_method,
    });

    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
});

export default router;
