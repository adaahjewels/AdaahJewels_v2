/**
 * Testimonials routes  —  /api/testimonials
 *
 * GET    /api/testimonials           — public: list active testimonials
 * POST   /api/testimonials           — admin: create testimonial
 * PUT    /api/testimonials/:id       — admin: update testimonial
 * DELETE /api/testimonials/:id       — admin: delete testimonial
 *
 * NOTE: No stored procedure exists for testimonials.
 * Table is auto-created on first request if missing.
 */

import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import { getPool } from '../config/db';

const router = express.Router();

// Ensure the testimonials table exists
const ensureTable = async () => {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(255)  NOT NULL,
      review_text   TEXT          NOT NULL,
      rating        TINYINT       NOT NULL DEFAULT 5,
      is_active     TINYINT(1)    NOT NULL DEFAULT 1,
      created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

// ── GET /api/testimonials  (public — active only) ─────────────────────────────
router.get('/', async (_req, res) => {
  try {
    await ensureTable();
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM testimonials WHERE is_active = 1 ORDER BY created_at DESC'
    ) as any;
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
});

// ── GET /api/testimonials/admin  (admin — all) ─────────────────────────────────
router.get('/admin', authenticate, isAdmin, async (_req, res) => {
  try {
    await ensureTable();
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM testimonials ORDER BY created_at DESC'
    ) as any;
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
});

// ── POST /api/testimonials  (admin) ────────────────────────────────────────────
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    await ensureTable();
    const pool = getPool();
    const { customerName, reviewText, rating = 5, isActive = true } = req.body;

    if (!customerName || !reviewText) {
      return res.status(400).json({ message: 'customerName and reviewText are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO testimonials (customer_name, review_text, rating, is_active) VALUES (?, ?, ?, ?)',
      [customerName, reviewText, Number(rating), isActive ? 1 : 0]
    ) as any;

    const [rows] = await pool.execute(
      'SELECT * FROM testimonials WHERE id = ?',
      [result.insertId]
    ) as any;

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create testimonial' });
  }
});

// ── PUT /api/testimonials/:id  (admin) ─────────────────────────────────────────
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await ensureTable();
    const pool = getPool();
    const id = Number(req.params.id);
    const { customerName, reviewText, rating, isActive } = req.body;

    await pool.execute(
      `UPDATE testimonials
       SET customer_name = COALESCE(?, customer_name),
           review_text   = COALESCE(?, review_text),
           rating        = COALESCE(?, rating),
           is_active     = COALESCE(?, is_active)
       WHERE id = ?`,
      [customerName || null, reviewText || null,
       rating !== undefined ? Number(rating) : null,
       isActive !== undefined ? (isActive ? 1 : 0) : null,
       id]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM testimonials WHERE id = ?', [id]
    ) as any;

    if (!rows[0]) return res.status(404).json({ message: 'Testimonial not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update testimonial' });
  }
});

// ── DELETE /api/testimonials/:id  (admin) ──────────────────────────────────────
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await ensureTable();
    const pool = getPool();
    await pool.execute('DELETE FROM testimonials WHERE id = ?', [Number(req.params.id)]);
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete testimonial' });
  }
});

export default router;
