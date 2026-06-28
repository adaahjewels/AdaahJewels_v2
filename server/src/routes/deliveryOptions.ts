import express from 'express';
import { executeQuery } from '../config/db';

const router = express.Router();

// GET /api/delivery-options  — public
router.get('/', async (_req, res) => {
  try {
    const rows = await executeQuery('SELECT id, name, price_cents, estimated_days FROM delivery_options WHERE is_active = 1 ORDER BY id');
    const out = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      price_cents: r.price_cents,
      price: Math.round((r.price_cents || 0) / 100),
      estimated_days: r.estimated_days,
    }));
    res.json(out);
  } catch (err: any) {
    console.error('Failed to fetch delivery options', err?.message || err);
    res.status(500).json({ message: 'Failed to fetch delivery options' });
  }
});

export default router;
