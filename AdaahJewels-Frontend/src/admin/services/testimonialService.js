import axiosInstance from '../api/axiosInstance';

export const getTestimonials = async () => {
  try {
    const { data } = await axiosInstance.get('/testimonials');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const createTestimonial = async (data) => {
  const { data: result } = await axiosInstance.post('/testimonials', {
    customerName: data.customerName,
    reviewText:   data.reviewText,
    rating:       data.rating,
    isActive:     data.status !== 0 && data.status !== false,
  });
  return result;
};

export const updateTestimonial = async (testimonialId, data) => {
  const { data: result } = await axiosInstance.put(`/testimonials/${testimonialId}`, {
    customerName: data.customerName,
    reviewText:   data.reviewText,
    rating:       data.rating,
    isActive:     data.status !== 0 && data.status !== false,
  });
  return result;
};

export const deleteTestimonial = async (testimonialId) => {
  const { data } = await axiosInstance.delete(`/testimonials/${testimonialId}`);
  return data;
};

export default { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
