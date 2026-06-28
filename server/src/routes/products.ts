import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as productRepo from '../repositories/product.repository';

const router = express.Router();

// ── GET /api/products/best-sellers ─────────────────────────────────────────────
router.get('/best-sellers', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 6);
    // timeframe may be sent as '30d' or numeric days
    const tf = String(req.query.timeframe || req.query.timeframeDays || '') || '';
    let days = 30;
    if (tf) {
      const m = String(tf).match(/(\d+)/);
      if (m) days = Number(m[1]);
    } else if (req.query.days) {
      days = Number(req.query.days || 30);
    }
    const categoryId = req.query.category ? Number(req.query.category) : undefined;

    const products = await productRepo.getBestSellers(limit, days, categoryId);
    const result = products.map(p => ({
      ...p,
      images: productRepo.parseImages(p),
    }));
    res.json(result);
  } catch (error) {
    console.error('GET /api/products/best-sellers error:', (error as any)?.message || error);
    res.status(500).json({ message: 'Failed to fetch best sellers' });
  }
});

// ── GET /api/products ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { categoryId, materialType, minPrice, maxPrice, search, limit, offset } = req.query;

    const products = await productRepo.getProducts({
      categoryId:   categoryId   ? Number(categoryId)   : undefined,
      materialType: materialType ? String(materialType)  : undefined,
      minPrice:     minPrice     ? Number(minPrice)      : undefined,
      maxPrice:     maxPrice     ? Number(maxPrice)      : undefined,
      search:       search       ? String(search)        : undefined,
      limit:        limit        ? Number(limit)         : 50,
      offset:       offset       ? Number(offset)        : 0,
    });

    // Parse comma-separated images string → array for each product
    const result = products.map(p => ({
      ...p,
      images: productRepo.parseImages(p),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// ── GET /api/products/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await productRepo.getProductById(Number(req.params.id));
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ ...product, images: productRepo.parseImages(product) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// ── POST /api/products  (admin) ───────────────────────────────────────────────
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      name, categoryId, materialType, price, discount = 0,
      deliveryDays = 5, description, careInstructions, stock = 0, images = [],
    } = req.body;

    const { id } = await productRepo.createProduct({
      name, categoryId: Number(categoryId), materialType,
      price: Number(price), discount: Number(discount),
      deliveryDays: Number(deliveryDays), description,
      careInstructions: careInstructions || null,
      stock: Number(stock),
    });

    // Attach images
    for (let i = 0; i < images.length; i++) {
      await productRepo.addProductImage(id, images[i], i);
    }

    const product = await productRepo.getProductById(id);
    res.status(201).json({ ...product, images: productRepo.parseImages(product!) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// ── PUT /api/products/:id  (admin) ────────────────────────────────────────────
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      name, categoryId, materialType, price, discount,
      deliveryDays, description, careInstructions, stock, isActive, images,
    } = req.body;

    await productRepo.updateProduct(id, {
      name, categoryId: Number(categoryId), materialType,
      price: Number(price), discount: Number(discount ?? 0),
      deliveryDays: Number(deliveryDays ?? 5),
      description, careInstructions: careInstructions || null,
      stock: Number(stock ?? 0), isActive: isActive !== false,
    });

    // Replace images if provided
    if (Array.isArray(images)) {
      await productRepo.replaceProductImages(id);
      for (let i = 0; i < images.length; i++) {
        await productRepo.addProductImage(id, images[i], i);
      }
    }

    const product = await productRepo.getProductById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ ...product, images: productRepo.parseImages(product) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// ── DELETE /api/products/:id  (admin — soft delete) ───────────────────────────
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await productRepo.deleteProduct(Number(req.params.id));
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;
