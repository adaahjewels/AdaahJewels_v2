import { executeProcedure } from '../api/dynamicApi';

export const getTestimonials = async (filters = {}) => {
  return await executeProcedure('SP_TestimonialList', filters);
};

export const createTestimonial = async (data) => {
  return await executeProcedure('SP_TestimonialInsert', {
    p_CustomerName: data.customerName,
    p_ReviewText: data.reviewText,
    p_Rating: data.rating,
    p_Status: data.status,
  });
};

export const updateTestimonial = async (testimonialId, data) => {
  return await executeProcedure('SP_TestimonialUpdate', {
    p_TestimonialId: testimonialId,
    p_CustomerName: data.customerName,
    p_ReviewText: data.reviewText,
    p_Rating: data.rating,
    p_Status: data.status,
  });
};

export const deleteTestimonial = async (testimonialId) => {
  return await executeProcedure('SP_TestimonialDelete', { p_TestimonialId: testimonialId });
};

export default { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
