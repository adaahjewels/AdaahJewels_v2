/**
 * Wishlist routes  —  /api/wishlist
 *
 * GET    /api/wishlist              — get wishlist
 * POST   /api/wishlist/add          — add product
 * DELETE /api/wishlist/remove/:id   — remove product
 *
 * Note: wishlist is stored in-memory (keyed by userId).
 * Replace with DB-backed wishlist table when needed.
 */

import express from 'express';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import * as productRepo from '../repositories/product.repository';

const router = express.Router();

// In-memory store: userId (number) → productId (number)[]
const wishlistStore: Record<number, number[]> = {};

// ── GET /api/wishlist ─────────────────────────────────────────────────────────
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId     = req.user!.id;
    const productIds = wishlistStore[userId] || [];

    // Fetch each product from MySQL
    const products = await Promise.all(
      productIds.map(id => productRepo.getProductById(id))
    );

    const items = products
      .filter(Boolean)
      .filter(p => p!.is_active)
      .map(p => ({ ...p, images: productRepo.parseImages(p!) }));

    res.json({ items });
  } catch {
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

// ── POST /api/wishlist/add ────────────────────────────────────────────────────
router.post('/add', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId    = req.user!.id;
    const productId = Number(req.body.productId);

    const product = await productRepo.getProductById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!wishlistStore[userId]) wishlistStore[userId] = [];
    if (!wishlistStore[userId].includes(productId)) {
      wishlistStore[userId].push(productId);
    }

    res.json({ message: 'Added to wishlist' });
  } catch {
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
});

// ── DELETE /api/wishlist/remove/:productId ────────────────────────────────────
router.delete('/remove/:productId', authenticate, (req: AuthRequest, res) => {
  try {
    const userId    = req.user!.id;
    const productId = Number(req.params.productId);

    if (wishlistStore[userId]) {
      wishlistStore[userId] = wishlistStore[userId].filter(id => id !== productId);
    }

    res.json({ message: 'Removed from wishlist' });
  } catch {
    res.status(500).json({ message: 'Failed to remove from wishlist' });
  }
});

export default router;
