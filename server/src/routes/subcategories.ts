import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as catRepo from '../repositories/category.repository';

const router = express.Router();

// ── GET /api/subcategories ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const parentId = req.query.category ? Number(req.query.category) : undefined;
    const subcategories = await catRepo.getSubcategories(parentId);
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subcategories' });
  }
});

// ── GET /api/subcategories/admin ──────────────────────────────────────────────
router.get('/admin', authenticate, isAdmin, async (_req, res) => {
  try {
    const subcategories = await catRepo.getSubcategoriesAdmin();
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subcategories' });
  }
});

// ── GET /api/subcategories/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const sub = await catRepo.getSubcategoryById(Number(req.params.id));
    if (!sub) return res.status(404).json({ message: 'Subcategory not found' });
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subcategory' });
  }
});

// ── POST /api/subcategories  (admin) ──────────────────────────────────────────
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, category, description, imageUrl } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const sub = await catRepo.createSubcategory(
      name, slug, Number(category), imageUrl || null, description || null
    );
    res.status(201).json(sub);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Subcategory already exists in this category' });
    }
    if (error.sqlState === '45000') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create subcategory' });
  }
});

// ── PUT /api/subcategories/:id  (admin) ───────────────────────────────────────
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, category, description, isActive, imageUrl } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const sub = await catRepo.updateSubcategory(
      Number(req.params.id), name, slug, Number(category),
      imageUrl || null, description || null, isActive !== false
    );
    if (!sub) return res.status(404).json({ message: 'Subcategory not found' });
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subcategory' });
  }
});

// ── DELETE /api/subcategories/:id  (admin) ────────────────────────────────────
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await catRepo.deleteSubcategory(Number(req.params.id));
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error: any) {
    if (error.sqlState === '45000') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to delete subcategory' });
  }
});

export default router;
