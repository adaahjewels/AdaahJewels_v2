/**
 * Cart routes  —  /api/cart
 *
 * In-memory cart store keyed by userId (number).
 * Replace with DB-backed cart table when ready.
 *
 * GET    /api/cart          — get current user's cart
 * POST   /api/cart/add      — add item to cart
 * PUT    /api/cart/update   — update quantity
 * DELETE /api/cart/remove/:productId  — remove item
 * DELETE /api/cart/clear    — clear cart
 */

import express from 'express';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import * as productRepo from '../repositories/product.repository';

const router = express.Router();

interface CartItem {
  productId: number;
  quantity:  number;
  price:     number;
  name:      string;
  image:     string;
}

// In-memory store: userId → CartItem[]
const cartStore: Record<number, CartItem[]> = {};

const getUserCart = (userId: number): CartItem[] => cartStore[userId] || [];
const saveUserCart = (userId: number, items: CartItem[]) => { cartStore[userId] = items; };

// ── GET /api/cart ─────────────────────────────────────────────────────────────
router.get('/', authenticate, (req: AuthRequest, res) => {
  try {
    const items = getUserCart(req.user!.id);
    res.json({ items, count: items.reduce((s, i) => s + i.quantity, 0) });
  } catch {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// ── POST /api/cart/add ────────────────────────────────────────────────────────
router.post('/add', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId            = req.user!.id;
    const { productId, quantity = 1 } = req.body;
    const pid = Number(productId);

    const product = await productRepo.getProductById(pid);
    if (!product)        return res.status(404).json({ message: 'Product not found' });
    if (!product.is_active)  return res.status(400).json({ message: 'Product is unavailable' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    const items    = getUserCart(userId);
    const existing = items.find(i => i.productId === pid);

    if (existing) {
      existing.quantity += quantity;
    } else {
      const images = productRepo.parseImages(product);
      items.push({
        productId: pid,
        quantity,
        price: product.price,
        name:  product.name,
        image: images[0] || '',
      });
    }

    saveUserCart(userId, items);
    res.json({ message: 'Item added to cart', items });
  } catch {
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// ── PUT /api/cart/update ──────────────────────────────────────────────────────
router.put('/update', authenticate, (req: AuthRequest, res) => {
  try {
    const userId              = req.user!.id;
    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1) return res.status(400).json({ message: 'Invalid quantity' });

    const items = getUserCart(userId);
    const item  = items.find(i => i.productId === Number(productId));
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    item.quantity = quantity;
    saveUserCart(userId, items);
    res.json({ message: 'Cart updated', items });
  } catch {
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

// ── DELETE /api/cart/remove/:productId ───────────────────────────────────────
router.delete('/remove/:productId', authenticate, (req: AuthRequest, res) => {
  try {
    const userId    = req.user!.id;
    const productId = Number(req.params.productId);
    saveUserCart(userId, getUserCart(userId).filter(i => i.productId !== productId));
    res.json({ message: 'Item removed', items: getUserCart(userId) });
  } catch {
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

// ── DELETE /api/cart/clear ────────────────────────────────────────────────────
router.delete('/clear', authenticate, (req: AuthRequest, res) => {
  try {
    saveUserCart(req.user!.id, []);
    res.json({ message: 'Cart cleared', items: [] });
  } catch {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

export default router;
