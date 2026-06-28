import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as settingsRepo from '../repositories/settings.repository';

const router = express.Router();

// ── GET /api/settings ─────────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    let settings = await settingsRepo.getSiteSettings();

    // Bootstrap default settings if none exist
    if (!settings) {
      settings = await settingsRepo.upsertSiteSettings({
        logo:     '/logo.svg',
        siteName: 'Adaah Jewels',
        tagline:  'Elegance in Every Thread',
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// ── PUT /api/settings  (admin) ────────────────────────────────────────────────
router.put('/', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      logo, siteName, tagline,
      contactEmail, contactPhone, socialMedia,
    } = req.body;

    const settings = await settingsRepo.upsertSiteSettings({
      logo,
      siteName,
      tagline,
      contactEmail,
      contactPhone,
      socialInstagram: socialMedia?.instagram,
      socialFacebook:  socialMedia?.facebook,
      socialTwitter:   socialMedia?.twitter,
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

export default router;
