import { executeProcedure } from '../api/dynamicApi';

export const getBanners = async () => {
  return await executeProcedure('SP_BannerList', {});
};

export const createBanner = async (data) => {
  return await executeProcedure('SP_BannerInsert', {
    p_DesktopImage: data.desktopImage,
    p_MobileImage: data.mobileImage,
    p_RedirectUrl: data.redirectUrl,
    p_SortOrder: data.sortOrder,
    p_Status: data.status,
  });
};

export const updateBanner = async (bannerId, data) => {
  return await executeProcedure('SP_BannerUpdate', {
    p_BannerId: bannerId,
    p_DesktopImage: data.desktopImage,
    p_MobileImage: data.mobileImage,
    p_RedirectUrl: data.redirectUrl,
    p_SortOrder: data.sortOrder,
    p_Status: data.status,
  });
};

export const deleteBanner = async (bannerId) => {
  return await executeProcedure('SP_BannerDelete', { p_BannerId: bannerId });
};

export default { getBanners, createBanner, updateBanner, deleteBanner };
