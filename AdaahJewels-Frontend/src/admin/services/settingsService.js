import axiosInstance from '../api/axiosInstance';

export const getSettings = async () => {
  const { data } = await axiosInstance.get('/settings');
  return data;
};

export const updateSettings = async (settings) => {
  const { data } = await axiosInstance.put('/settings', {
    logo:         settings.logo,
    siteName:     settings.websiteName || settings.siteName,
    tagline:      settings.tagline     || null,
    contactEmail: settings.email       || settings.contactEmail,
    contactPhone: settings.phone       || settings.contactPhone,
    socialMedia: {
      instagram: settings.instagramUrl || settings.socialInstagram,
      facebook:  settings.facebookUrl  || settings.socialFacebook,
      twitter:   settings.twitterUrl   || settings.socialTwitter,
    },
  });
  return data;
};

export default { getSettings, updateSettings };
