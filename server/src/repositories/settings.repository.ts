import { callProcedure } from '../config/db';

export interface DBSiteSettings {
  id: number;
  logo: string;
  site_name: string;
  tagline: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  updated_at: Date;
}

export const getSiteSettings = async (): Promise<DBSiteSettings | null> => {
  const rows = await callProcedure<DBSiteSettings>('sp_get_site_settings', []);
  return rows[0] || null;
};

export const upsertSiteSettings = async (data: {
  logo: string; siteName: string; tagline?: string;
  contactEmail?: string; contactPhone?: string;
  socialInstagram?: string; socialFacebook?: string; socialTwitter?: string;
}): Promise<DBSiteSettings> => {
  const rows = await callProcedure<DBSiteSettings>('sp_upsert_site_settings', [
    data.logo, data.siteName, data.tagline || '',
    data.contactEmail || '', data.contactPhone || '',
    data.socialInstagram || '', data.socialFacebook || '', data.socialTwitter || '',
  ]);
  return rows[0];
};
