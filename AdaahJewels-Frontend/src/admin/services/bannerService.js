import axiosInstance from '../api/axiosInstance';

export const getBanners = async () => {
  const { data } = await axiosInstance.get('/banners/admin');
  return Array.isArray(data) ? data : [];
};

export const createBanner = async (data) => {
  const { data: result } = await axiosInstance.post('/banners', {
    title:        data.title,
    imageUrl:     data.imageUrl,
    link:         data.link || null,
    position:     data.position || 'hero',
    displayOrder: data.displayOrder ?? 0,
    isActive:     data.isActive !== false,
  });
  return result;
};

export const updateBanner = async (bannerId, data) => {
  const { data: result } = await axiosInstance.put(`/banners/${bannerId}`, {
    title:        data.title,
    imageUrl:     data.imageUrl,
    link:         data.link || null,
    position:     data.position || 'hero',
    displayOrder: data.displayOrder ?? 0,
    isActive:     data.isActive !== false,
  });
  return result;
};

export const deleteBanner = async (bannerId) => {
  const { data } = await axiosInstance.delete(`/banners/${bannerId}`);
  return data;
};

export default { getBanners, createBanner, updateBanner, deleteBanner };
