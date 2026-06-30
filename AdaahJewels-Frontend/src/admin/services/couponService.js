import axiosInstance from '../api/axiosInstance';

export const getCoupons = async () => {
  const { data } = await axiosInstance.get('/coupons');
  return Array.isArray(data) ? data : [];
};

export const createCoupon = async (data) => {
  const { data: result } = await axiosInstance.post('/coupons', {
    code:          data.couponCode || data.code,
    discountType:  data.discountType,
    discountValue: data.discountValue,
    maxUses:       data.minimumOrder || data.maxUses || null,
    validFrom:     data.startDate   || data.validFrom  || null,
    validTo:       data.endDate     || data.validTo    || null,
    isActive:      data.isActive !== false,
  });
  return result;
};

export const updateCoupon = async (couponId, data) => {
  const { data: result } = await axiosInstance.put(`/coupons/${couponId}`, {
    code:          data.couponCode || data.code,
    discountType:  data.discountType,
    discountValue: data.discountValue,
    maxUses:       data.minimumOrder || data.maxUses || null,
    validFrom:     data.startDate   || data.validFrom  || null,
    validTo:       data.endDate     || data.validTo    || null,
    isActive:      data.isActive !== false,
  });
  return result;
};

export const deleteCoupon = async (couponId) => {
  const { data } = await axiosInstance.delete(`/coupons/${couponId}`);
  return data;
};

export default { getCoupons, createCoupon, updateCoupon, deleteCoupon };
