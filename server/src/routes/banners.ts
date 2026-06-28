/**
 * Banner routes  —  /api/banners
 *
 * GET    /api/banners           — public: list active banners (optionally filter by ?position=hero)
 * GET    /api/banners/admin     — admin: list ALL banners
 * POST   /api/banners           — admin: create banner
 * PUT    /api/banners/:id       — admin: update banner
 * DELETE /api/banners/:id       — admin: delete banner
 */

import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as bannerRepo from '../repositories/banner.repository';

const router = express.Router();

// ── GET /api/banners  (public — only active banners) ───────────────────────
router.get('/', async (req, res) => {
  try {
    const { position } = req.query;
    const banners = await bannerRepo.getBanners(position ? String(position) : undefined);
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch banners' });
  }
});

// ── GET /api/banners/admin  (admin — all banners) ───────────────────────────
router.get('/admin', authenticate, isAdmin, async (_req, res) => {
  try {
    const banners = await bannerRepo.getBannersAdmin();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch banners' });
  }
});

// ── GET /api/banners/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const banner = await bannerRepo.getBannerById(Number(req.params.id));
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch banner' });
  }
});

// ── POST /api/banners  (admin) ──────────────────────────────────────────────
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      title, imageUrl, link = null,
      position = 'hero', displayOrder = 0, isActive = true,
    } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ message: 'title and imageUrl are required' });
    }

    const banner = await bannerRepo.createBanner({
      title,
      imageUrl,
      link:         link || null,
      position:     position as 'hero' | 'sidebar' | 'footer' | 'category',
      displayOrder: Number(displayOrder),
      isActive:     Boolean(isActive),
    });
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create banner' });
  }
});

// ── PUT /api/banners/:id  (admin) ───────────────────────────────────────────
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      title, imageUrl, link = null,
      position = 'hero', displayOrder = 0, isActive = true,
    } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ message: 'title and imageUrl are required' });
    }

    const banner = await bannerRepo.updateBanner(id, {
      title,
      imageUrl,
      link:         link || null,
      position:     position as 'hero' | 'sidebar' | 'footer' | 'category',
      displayOrder: Number(displayOrder),
      isActive:     Boolean(isActive),
    });
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update banner' });
  }
});

// ── DELETE /api/banners/:id  (admin) ────────────────────────────────────────
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await bannerRepo.deleteBanner(Number(req.params.id));
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete banner' });
  }
});

export default router;
