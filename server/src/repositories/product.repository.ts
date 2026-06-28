import { callProcedure, getPool } from '../config/db';

export interface DBProduct {
  id: number;
  name: string;
  category_id: number;
  material_type: string;
  price: number;
  discount: number;
  delivery_days: number;
  description: string;
  care_instructions: string | null;
  stock: number;
  is_active: number;
  created_at: Date;
  // joined fields
  subcategory_name?: string;
  subcategory_image?: string;
  parent_category_id?: number;
  parent_category_name?: string;
  images?: string; // comma-separated from GROUP_CONCAT
}

export const createProduct = async (data: {
  name: string; categoryId: number; materialType: string;
  price: number; discount: number; deliveryDays: number;
  description: string; careInstructions: string | null; stock: number;
}): Promise<{ id: number }> => {
  const rows = await callProcedure<{ id: number }>('sp_create_product', [
    data.name, data.categoryId, data.materialType,
    data.price, data.discount, data.deliveryDays,
    data.description, data.careInstructions || '', data.stock,
  ]);
  return rows[0];
};

export const addProductImage = async (
  productId: number, imageUrl: string, sortOrder: number
): Promise<void> => {
  await callProcedure('sp_add_product_image', [productId, imageUrl, sortOrder]);
};

export const replaceProductImages = async (productId: number): Promise<void> => {
  await callProcedure('sp_replace_product_images', [productId]);
};

export const getProducts = async (filters: {
  categoryId?: number; materialType?: string;
  minPrice?: number; maxPrice?: number;
  search?: string; limit?: number; offset?: number;
}): Promise<DBProduct[]> => {
  const {
    categoryId = 0, materialType = '', minPrice = null,
    maxPrice = null, search = '', limit = 50, offset = 0,
  } = filters;
  return callProcedure<DBProduct>('sp_get_products', [
    categoryId || null, materialType || null,
    minPrice || null, maxPrice || null,
    search || null, limit, offset,
  ]);
};

export const getBestSellers = async (
  limit = 6,
  days = 30,
  categoryId?: number
): Promise<DBProduct[]> => {
  const pool = getPool();
  try {
    // compute since date in JS to allow parameterized query
    const since = new Date(Date.now() - Math.max(0, Number(days || 30)) * 24 * 60 * 60 * 1000);

    const params: any[] = [since];
    let categoryFilter = '';
    if (Number.isFinite(Number(categoryId))) {
      categoryFilter = ' AND p.category_id = ?';
      params.push(Number(categoryId));
    }
    params.push(Number(limit));

    const [rows]: any = await pool.execute(
      `SELECT
         p.id                         AS id,
         p.name                       AS name,
         p.category_id                AS category_id,
         p.material_type              AS material_type,
         p.price                      AS price,
         p.discount                   AS discount,
         p.delivery_days              AS delivery_days,
         p.description                AS description,
         p.care_instructions          AS care_instructions,
         p.stock                      AS stock,
         p.is_active                  AS is_active,
         p.created_at                 AS created_at,
         GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order SEPARATOR ',') AS images,
         COALESCE(SUM(oi.quantity),0) AS sales_count,
         COALESCE(SUM(oi.quantity * oi.price),0) AS total_revenue
       FROM products p
       LEFT JOIN order_items oi ON oi.product_id = p.id
       LEFT JOIN product_images pi ON pi.product_id = p.id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('delivered','confirmed','processing') AND o.created_at >= ?
       WHERE p.is_active = 1 ${categoryFilter}
       GROUP BY p.id
       ORDER BY sales_count DESC
       LIMIT ?`,
      params
    );

    return Array.isArray(rows) ? rows : [];
  } catch (error: any) {
    console.error('getBestSellers query error:', error?.message || error);
    // rethrow so caller can decide how to respond
    throw error;
  }
};

export const getProductById = async (id: number): Promise<DBProduct | null> => {
  const rows = await callProcedure<DBProduct>('sp_get_product_by_id', [id]);
  return rows[0] || null;
};

export const updateProduct = async (id: number, data: {
  name: string; categoryId: number; materialType: string;
  price: number; discount: number; deliveryDays: number;
  description: string; careInstructions: string | null;
  stock: number; isActive: boolean;
}): Promise<{ affected: number }> => {
  const rows = await callProcedure<{ affected: number }>('sp_update_product', [
    id, data.name, data.categoryId, data.materialType,
    data.price, data.discount, data.deliveryDays,
    data.description, data.careInstructions || '',
    data.stock, data.isActive ? 1 : 0,
  ]);
  return rows[0];
};

export const deleteProduct = async (id: number): Promise<void> => {
  await callProcedure('sp_delete_product', [id]);
};

export const updateStock = async (productId: number, delta: number): Promise<number> => {
  const rows = await callProcedure<{ stock: number }>(
    'sp_update_product_stock', [productId, delta]
  );
  return rows[0]?.stock ?? 0;
};

/** Parse comma-separated images string → string[] */
export const parseImages = (product: DBProduct): string[] =>
  product.images ? product.images.split(',').filter(Boolean) : [];
