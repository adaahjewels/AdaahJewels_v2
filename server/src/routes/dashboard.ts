/**
 * Admin dashboard routes  —  /api/dashboard
 *
 * All routes require admin authentication.
 *
 * GET /api/dashboard/summary          — key stat cards
 * GET /api/dashboard/top-products     — best sellers (by order item count)
 * GET /api/dashboard/recent-orders    — most recent orders
 * GET /api/dashboard/revenue-chart    — daily revenue for current month/week
 * GET /api/dashboard/orders-chart     — daily order count for current month/week
 * GET /api/dashboard/top-categories   — categories by revenue
 */

import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import { getPool } from '../config/db';

const router = express.Router();

// Middleware — every dashboard route requires admin
router.use(authenticate, isAdmin);

// ── GET /api/dashboard/summary ─────────────────────────────────────────────
router.get('/summary', async (_req, res) => {
  try {
    const pool = getPool();

    const [[totals]]: any = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM orders)                              AS TotalOrders,
        (SELECT COALESCE(SUM(total_amount),0) FROM orders)        AS TotalRevenue,
        (SELECT COUNT(*) FROM products WHERE is_active = 1)       AS TotalProducts,
        (SELECT COUNT(*) FROM users WHERE role = 'customer')      AS TotalCustomers,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending')    AS PendingOrders,
        (SELECT COUNT(*) FROM products WHERE stock <= 5 AND is_active = 1) AS LowStockProducts
    `);

    res.json(totals ?? {});
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
});

// ── GET /api/dashboard/top-products ────────────────────────────────────────
router.get('/top-products', async (req, res) => {
  try {
    const pool  = getPool();
    const limit = Number(req.query.limit || 5);

    const [rows]: any = await pool.execute(
      `SELECT
         p.id                         AS ProductId,
         p.name                       AS ProductName,
         p.price                      AS Price,
         COALESCE(SUM(oi.quantity),0) AS SalesCount,
         COALESCE(SUM(oi.quantity * oi.price),0) AS TotalRevenue
       FROM products p
       LEFT JOIN order_items oi ON oi.product_id = p.id
       WHERE p.is_active = 1
       GROUP BY p.id
       ORDER BY SalesCount DESC
       LIMIT ?`,
      [limit]
    );

    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch top products' });
  }
});

// ── GET /api/dashboard/recent-orders ───────────────────────────────────────
router.get('/recent-orders', async (req, res) => {
  try {
    const pool  = getPool();
    const limit = Number(req.query.limit || 8);

    const [rows]: any = await pool.execute(
      `SELECT
         o.id            AS OrderId,
         o.id            AS OrderNumber,
         o.total_amount  AS TotalAmount,
         o.status        AS OrderStatus,
         o.created_at    AS CreatedAt,
         u.email         AS CustomerEmail,
         u.name          AS CustomerName
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recent orders' });
  }
});

// ── GET /api/dashboard/revenue-chart ───────────────────────────────────────
router.get('/revenue-chart', async (req, res) => {
  try {
    const pool      = getPool();
    const timeRange = String(req.query.timeRange || 'month');

    // Last 30 days for 'month', last 7 days for 'week'
    const days = timeRange === 'week' ? 7 : 30;

    const [rows]: any = await pool.execute(
      `SELECT
         DATE(created_at)             AS date,
         COALESCE(SUM(total_amount),0) AS revenue,
         COUNT(*)                      AS orders
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [days]
    );

    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revenue chart' });
  }
});

// ── GET /api/dashboard/orders-chart ────────────────────────────────────────
router.get('/orders-chart', async (req, res) => {
  try {
    const pool      = getPool();
    const timeRange = String(req.query.timeRange || 'month');
    const days      = timeRange === 'week' ? 7 : 30;

    const [rows]: any = await pool.execute(
      `SELECT
         DATE(created_at) AS date,
         COUNT(*)          AS orders
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [days]
    );

    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders chart' });
  }
});

// ── GET /api/dashboard/top-categories ──────────────────────────────────────
router.get('/top-categories', async (req, res) => {
  try {
    const pool  = getPool();
    const limit = Number(req.query.limit || 5);

    const [rows]: any = await pool.execute(
      `SELECT
         c.id                              AS CategoryId,
         c.name                            AS CategoryName,
         COUNT(DISTINCT oi.id)             AS SalesCount,
         COALESCE(SUM(oi.quantity * oi.price), 0) AS TotalRevenue
       FROM categories c
       JOIN products p   ON p.category_id = c.id
       JOIN order_items oi ON oi.product_id = p.id
       GROUP BY c.id
       ORDER BY TotalRevenue DESC
       LIMIT ?`,
      [limit]
    );

    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch top categories' });
  }
});

export default router;
