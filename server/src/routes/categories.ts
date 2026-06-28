import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as catRepo from '../repositories/category.repository';

const router = express.Router();

// ── GET /api/categories ───────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const categories = await catRepo.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// ── GET /api/categories/admin ─────────────────────────────────────────────────
router.get('/admin', authenticate, isAdmin, async (_req, res) => {
  try {
    const categories = await catRepo.getCategoriesAdmin();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// ── GET /api/categories/tree ──────────────────────────────────────────────────
router.get('/tree', async (_req, res) => {
  try {
    const tree = await catRepo.getCategoryTree();
    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category tree' });
  }
});

// ── GET /api/categories/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const category = await catRepo.getCategoryById(Number(req.params.id));
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category' });
  }
});

// ── POST /api/categories  (admin) ────────────────────────────────────────────
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const category = await catRepo.createCategory(
      name, slug, imageUrl || null, description || null
    );
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category already exists' });
    }
    // MySQL procedure SIGNAL for child categories
    if (error.sqlState === '45000') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create category' });
  }
});

// ── PUT /api/categories/:id  (admin) ─────────────────────────────────────────
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, isActive, imageUrl } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const category = await catRepo.updateCategory(
      Number(req.params.id), name, slug,
      imageUrl || null, description || null, isActive !== false
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category' });
  }
});

// ── DELETE /api/categories/:id  (admin) ──────────────────────────────────────
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await catRepo.deleteCategory(Number(req.params.id));
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    if (error.sqlState === '45000') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

export default router;
