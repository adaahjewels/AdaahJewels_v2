/**
 * Admin user/customer management routes  —  /api/users
 *
 * GET    /api/users          — admin: list all customers (with order stats)
 * GET    /api/users/:id      — admin: get single user
 * GET    /api/users/:id/orders — admin: get user's orders
 * DELETE /api/users/:id      — admin: delete user
 */

import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import { getPool } from '../config/db';
import * as userRepo from '../repositories/user.repository';

const router = express.Router();

// ── GET /api/users  (admin — all customers with stats) ─────────────────────
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const limit  = Number(req.query.limit  || 100);
    const offset = Number(req.query.offset || 0);

    const pool = getPool();

    // Fetch users with order stats in one query
    const [rows] = await pool.execute(
      `SELECT
         u.id, u.name, u.email, u.phone, u.role, u.created_at,
         COUNT(DISTINCT o.id)       AS total_orders,
         COALESCE(SUM(o.total_amount), 0) AS total_spent
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id
       WHERE u.role = 'customer'
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    ) as any;

    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error('GET /api/users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// ── GET /api/users/:id  (admin) ────────────────────────────────────────────
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await userRepo.getUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Strip sensitive fields
    const { password: _pw, refresh_token: _rt, reset_password_token: _rpt, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// ── GET /api/users/:id/orders  (admin) ─────────────────────────────────────
router.get('/:id/orders', authenticate, isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, total_amount, status, payment_method, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [Number(req.params.id)]
    ) as any;

    // Normalize field names for admin frontend
    const normalized = (Array.isArray(rows) ? rows : []).map((o: any) => ({
      ...o,
      OrderId:     o.id,
      OrderNumber: o.id,
      TotalAmount: o.total_amount,
      OrderStatus: o.status,
      CreatedAt:   o.created_at,
    }));

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user orders' });
  }
});

// ── DELETE /api/users/:id  (admin) ─────────────────────────────────────────
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const id = Number(req.params.id);

    // Check user exists and is not an admin
    const user = await userRepo.getUserById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete an admin account' });
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

export default router;
