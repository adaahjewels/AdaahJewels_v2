import { executeProcedure } from '../api/dynamicApi';

export const getCoupons = async () => {
  const result = await executeProcedure('SP_CouponList', {});
  return Array.isArray(result) ? result : [];
};

export const createCoupon = async (data) => {
  return await executeProcedure('SP_CouponInsert', {
    p_CouponCode: data.couponCode,
    p_Description: data.description,
    p_DiscountType: data.discountType,
    p_DiscountValue: data.discountValue,
    p_MinimumOrder: data.minimumOrder,
    p_StartDate: data.startDate,
    p_EndDate: data.endDate,
    p_Status: data.isActive ? 1 : 0,
  });
};

export const updateCoupon = async (couponId, data) => {
  return await executeProcedure('SP_CouponUpdate', {
    p_CouponId: couponId,
    p_CouponCode: data.couponCode,
    p_Description: data.description,
    p_DiscountType: data.discountType,
    p_DiscountValue: data.discountValue,
    p_MinimumOrder: data.minimumOrder,
    p_StartDate: data.startDate,
    p_EndDate: data.endDate,
    p_Status: data.isActive ? 1 : 0,
  });
};

export const deleteCoupon = async (couponId) => {
  return await executeProcedure('SP_CouponDelete', { p_CouponId: couponId });
};

export default { getCoupons, createCoupon, updateCoupon, deleteCoupon };
