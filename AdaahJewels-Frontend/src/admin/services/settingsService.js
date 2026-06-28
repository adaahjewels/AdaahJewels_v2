import { executeProcedure } from '../api/dynamicApi';

export const getSettings = async () => {
  const result = await executeProcedure('SP_WebsiteSettingsGet', {});
  return Array.isArray(result) ? result[0] : result;
};

export const updateSettings = async (settings) => {
  return await executeProcedure('SP_WebsiteSettingsUpdate', {
    p_WebsiteName: settings.websiteName,
    p_Logo: settings.logo,
    p_Favicon: settings.favicon,
    p_Email: settings.email,
    p_Phone: settings.phone,
    p_Address: settings.address,
    p_FacebookUrl: settings.facebookUrl,
    p_TwitterUrl: settings.twitterUrl,
    p_InstagramUrl: settings.instagramUrl,
    p_LinkedInUrl: settings.linkedInUrl,
    p_FooterContent: settings.footerContent,
    p_SEOTitle: settings.seoTitle,
    p_SEODescription: settings.seoDescription,
    p_SEOKeywords: settings.seoKeywords,
  });
};

export default { getSettings, updateSettings };
