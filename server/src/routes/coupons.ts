/**
 * Coupon routes  —  /api/coupons
 *
 * GET  /api/coupons/validate?code=WELCOME50  — validate coupon (public)
 * GET  /api/coupons          — admin: list all coupons
 * POST /api/coupons         — admin: create coupon
 * PUT  /api/coupons/:id     — admin: update coupon
 * DELETE /api/coupons/:id   — admin: delete coupon
 */

import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as couponRepo from '../repositories/coupon.repository';

const router = express.Router();

// ── GET /api/coupons/validate?code=XXX  (public) ─────────────────────────────
router.get('/validate', async (req, res) => {
  try {
    const { code } = req.query as { code: string };
    if (!code) return res.status(400).json({ message: 'Coupon code required' });

    // sp_get_coupon_by_code already checks active, date range, and usage limit
    const coupon = await couponRepo.getCouponByCode(code);

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
    }

    res.json({
      valid:         true,
      code:          coupon.code,
      discountType:  coupon.discount_type,
      discountValue: coupon.discount_value,
    });
  } catch {
    res.status(500).json({ message: 'Failed to validate coupon' });
  }
});

// ── GET /api/coupons/active  (public) ───────────────────────────────────────
router.get('/active', async (_req, res) => {
  try {
    const coupons = await couponRepo.getCoupons();
    const now = new Date();
    const active = (coupons || []).filter(c => {
      const isActive = Number(c.is_active) === 1;
      const from = c.valid_from ? new Date(c.valid_from) : null;
      const to   = c.valid_to   ? new Date(c.valid_to)   : null;
      if (!isActive) return false;
      if (from && now < from) return false;
      if (to && now > to) return false;
      return true;
    }).map((c: any) => ({ code: c.code, discountType: c.discount_type, discountValue: c.discount_value }));
    res.json(active);
  } catch (err: any) {
    console.error('Failed to fetch active coupons', err?.message || err);
    res.status(500).json({ message: 'Failed to fetch active coupons' });
  }
});

// ── GET /api/coupons  (admin) ─────────────────────────────────────────────────
router.get('/', authenticate, isAdmin, async (_req, res) => {
  try {
    const coupons = await couponRepo.getCoupons();
    res.json(coupons);
  } catch {
    res.status(500).json({ message: 'Failed to fetch coupons' });
  }
});

// ── POST /api/coupons  (admin) ────────────────────────────────────────────────
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      code, discountType, discountValue,
      maxUses = null, validFrom = null, validTo = null, isActive = true,
    } = req.body;

    const coupon = await couponRepo.createCoupon({
      code: (code || '').toUpperCase(),
      discountType, discountValue: Number(discountValue),
      maxUses: maxUses ? Number(maxUses) : null,
      validFrom: validFrom || null,
      validTo:   validTo   || null,
      isActive:  Boolean(isActive),
    });
    res.status(201).json(coupon);
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    res.status(500).json({ message: 'Failed to create coupon' });
  }
});

// ── PUT /api/coupons/:id  (admin) ─────────────────────────────────────────────
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      code, discountType, discountValue,
      maxUses = null, validFrom = null, validTo = null, isActive = true,
    } = req.body;

    const coupon = await couponRepo.updateCoupon(Number(req.params.id), {
      code: (code || '').toUpperCase(),
      discountType, discountValue: Number(discountValue),
      maxUses: maxUses ? Number(maxUses) : null,
      validFrom: validFrom || null,
      validTo:   validTo   || null,
      isActive:  Boolean(isActive),
    });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch {
    res.status(500).json({ message: 'Failed to update coupon' });
  }
});

// ── DELETE /api/coupons/:id  (admin) ─────────────────────────────────────────
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await couponRepo.deleteCoupon(Number(req.params.id));
    res.json({ message: 'Coupon deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete coupon' });
  }
});

export default router;
