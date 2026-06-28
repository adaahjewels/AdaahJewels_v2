import { callProcedure } from '../config/db';

export interface DBBanner {
  id: number;
  title: string;
  image_url: string;
  link: string | null;
  position: 'hero' | 'sidebar' | 'footer' | 'category';
  display_order: number;
  is_active: number;
  created_at: Date;
}

export const createBanner = async (data: {
  title: string; imageUrl: string; link: string | null;
  position: 'hero' | 'sidebar' | 'footer' | 'category';
  displayOrder: number; isActive: boolean;
}): Promise<DBBanner> => {
  const rows = await callProcedure<DBBanner>('sp_create_banner', [
    data.title, data.imageUrl, data.link || '',
    data.position, data.displayOrder, data.isActive ? 1 : 0,
  ]);
  return rows[0];
};

export const getBanners = async (position?: string): Promise<DBBanner[]> =>
  callProcedure<DBBanner>('sp_get_banners', [position || '']);

export const getBannersAdmin = async (): Promise<DBBanner[]> =>
  callProcedure<DBBanner>('sp_get_banners_admin', []);

export const getBannerById = async (id: number): Promise<DBBanner | null> => {
  const rows = await callProcedure<DBBanner>('sp_get_banner_by_id', [id]);
  return rows[0] || null;
};

export const updateBanner = async (id: number, data: {
  title: string; imageUrl: string; link: string | null;
  position: 'hero' | 'sidebar' | 'footer' | 'category';
  displayOrder: number; isActive: boolean;
}): Promise<DBBanner | null> => {
  const rows = await callProcedure<DBBanner>('sp_update_banner', [
    id, data.title, data.imageUrl, data.link || '',
    data.position, data.displayOrder, data.isActive ? 1 : 0,
  ]);
  return rows[0] || null;
};

export const deleteBanner = async (id: number): Promise<void> => {
  await callProcedure('sp_delete_banner', [id]);
};
