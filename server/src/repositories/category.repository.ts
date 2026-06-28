import { callProcedure } from '../config/db';

export interface DBCategory {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image_url: string | null;
  description: string | null;
  is_active: number;
  created_at: Date;
  subcategory_count?: number;
  parent_name?: string;
}

// ── Top-level categories ────────────────────────────────────────────────────

export const createCategory = async (
  name: string, slug: string, imageUrl: string | null, description: string | null
): Promise<DBCategory> => {
  const rows = await callProcedure<DBCategory>(
    'sp_create_category', [name, slug, imageUrl || '', description || '']
  );
  return rows[0];
};

export const getCategories = async (): Promise<DBCategory[]> =>
  callProcedure<DBCategory>('sp_get_categories', []);

export const getCategoriesAdmin = async (): Promise<DBCategory[]> =>
  callProcedure<DBCategory>('sp_get_categories_admin', []);

export const getCategoryById = async (id: number): Promise<DBCategory | null> => {
  const rows = await callProcedure<DBCategory>('sp_get_category_by_id', [id]);
  return rows[0] || null;
};

export const updateCategory = async (
  id: number, name: string, slug: string,
  imageUrl: string | null, description: string | null, isActive: boolean
): Promise<DBCategory | null> => {
  const rows = await callProcedure<DBCategory>(
    'sp_update_category', [id, name, slug, imageUrl || '', description || '', isActive ? 1 : 0]
  );
  return rows[0] || null;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await callProcedure('sp_delete_category', [id]);
};

// ── Subcategories (children of a top-level category) ───────────────────────

export const createSubcategory = async (
  name: string, slug: string, parentId: number,
  imageUrl: string | null, description: string | null
): Promise<DBCategory> => {
  const rows = await callProcedure<DBCategory>(
    'sp_create_subcategory', [name, slug, parentId, imageUrl || '', description || '']
  );
  return rows[0];
};

export const getSubcategories = async (parentId?: number): Promise<DBCategory[]> =>
  callProcedure<DBCategory>('sp_get_subcategories', [parentId || 0]);

export const getSubcategoriesAdmin = async (): Promise<DBCategory[]> =>
  callProcedure<DBCategory>('sp_get_subcategories_admin', []);

export const getSubcategoryById = async (id: number): Promise<DBCategory | null> => {
  const rows = await callProcedure<DBCategory>('sp_get_subcategory_by_id', [id]);
  return rows[0] || null;
};

export const updateSubcategory = async (
  id: number, name: string, slug: string, parentId: number,
  imageUrl: string | null, description: string | null, isActive: boolean
): Promise<DBCategory | null> => {
  const rows = await callProcedure<DBCategory>(
    'sp_update_subcategory',
    [id, name, slug, parentId, imageUrl || '', description || '', isActive ? 1 : 0]
  );
  return rows[0] || null;
};

export const deleteSubcategory = async (id: number): Promise<void> => {
  await callProcedure('sp_delete_subcategory', [id]);
};

export const getCategoryTree = async (): Promise<{ parents: DBCategory[]; children: DBCategory[] }> => {
  const pool = (await import('../config/db')).getPool();
  const [results] = await pool.execute('CALL sp_get_category_tree()') as any;
  return { parents: results[0] || [], children: results[1] || [] };
};
