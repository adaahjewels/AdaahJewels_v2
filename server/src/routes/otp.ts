import express from 'express';
import crypto from 'crypto';
import { getUserByEmailOrPhone } from '../repositories/user.repository';
import * as otpRepo from '../repositories/otp.repository';
import { sendOTPEmail } from '../services/emailService';
import { sendOTPSMS } from '../services/smsService';

const router = express.Router();

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ── POST /api/otp/send ────────────────────────────────────────────────────────
router.post('/send', async (req, res) => {
  try {
    const { email, phone, type } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone is required' });
    }
    if (!['registration', 'login', 'password-reset'].includes(type)) {
      return res.status(400).json({ message: 'Invalid OTP type' });
    }

    // For login/password-reset, user must already exist
    if (type !== 'registration' && email) {
      const user = await getUserByEmailOrPhone(email);
      if (!user && type !== 'password-reset') {
        return res.status(400).json({ message: 'User not found' });
      }
    }

    const otp       = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // sp_create_otp already deletes previous OTPs for the same contact+type
    await otpRepo.createOtp(email || null, phone || null, otp, expiresAt, type);

    if (email) await sendOTPEmail(email, otp, type);
    if (phone) await sendOTPSMS(phone, otp, type);

    res.json({
      message: 'OTP sent successfully',
      medium: email ? 'email' : phone ? 'sms' : 'both',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// ── POST /api/otp/verify ──────────────────────────────────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const { email, phone, otp, type } = req.body;

    if (!otp) return res.status(400).json({ message: 'OTP is required' });
    if (!['registration', 'login', 'password-reset'].includes(type)) {
      return res.status(400).json({ message: 'Invalid OTP type' });
    }

    const otpDoc = await otpRepo.getOtp(email || null, phone || null, type, false);
    if (!otpDoc) return res.status(400).json({ message: 'Invalid or expired OTP' });

    if (new Date(otpDoc.expires_at) < new Date()) {
      await otpRepo.deleteOtp(otpDoc.id);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (otpDoc.attempts >= 3) {
      await otpRepo.deleteOtp(otpDoc.id);
      return res.status(400).json({ message: 'Too many failed attempts. Request a new OTP.' });
    }

    if (otpDoc.otp !== otp) {
      await otpRepo.incrementOtpAttempts(otpDoc.id);
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await otpRepo.verifyOtp(otpDoc.id);
    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// ── POST /api/otp/check-verification ─────────────────────────────────────────
router.post('/check-verification', async (req, res) => {
  try {
    const { email, phone, type } = req.body;

    const otpDoc = await otpRepo.getOtp(email || null, phone || null, type, true);
    if (!otpDoc || new Date(otpDoc.expires_at) < new Date()) {
      return res.json({ verified: false });
    }
    res.json({ verified: true });
  } catch (error) {
    console.error('Check verification error:', error);
    res.status(500).json({ message: 'Failed to check verification' });
  }
});

export default router;
