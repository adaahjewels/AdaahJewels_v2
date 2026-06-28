import { callProcedure } from '../config/db';

export interface DBCoupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  valid_from: Date | null;
  valid_to: Date | null;
  is_active: number;
  created_at: Date;
}

export const createCoupon = async (data: {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number | null;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
}): Promise<DBCoupon> => {
  const rows = await callProcedure<DBCoupon>('sp_create_coupon', [
    data.code, data.discountType, data.discountValue,
    data.maxUses || 0, data.validFrom || '', data.validTo || '',
    data.isActive ? 1 : 0,
  ]);
  return rows[0];
};

export const getCoupons = async (): Promise<DBCoupon[]> =>
  callProcedure<DBCoupon>('sp_get_coupons', []);

export const getCouponById = async (id: number): Promise<DBCoupon | null> => {
  const rows = await callProcedure<DBCoupon>('sp_get_coupon_by_id', [id]);
  return rows[0] || null;
};

export const getCouponByCode = async (code: string): Promise<DBCoupon | null> => {
  const rows = await callProcedure<DBCoupon>('sp_get_coupon_by_code', [code]);
  return rows[0] || null;
};

export const updateCoupon = async (id: number, data: {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number | null;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
}): Promise<DBCoupon | null> => {
  const rows = await callProcedure<DBCoupon>('sp_update_coupon', [
    id, data.code, data.discountType, data.discountValue,
    data.maxUses || 0, data.validFrom || '', data.validTo || '',
    data.isActive ? 1 : 0,
  ]);
  return rows[0] || null;
};

export const deleteCoupon = async (id: number): Promise<void> => {
  await callProcedure('sp_delete_coupon', [id]);
};

export const incrementCouponUsage = async (code: string): Promise<void> => {
  await callProcedure('sp_increment_coupon_usage', [code]);
};
