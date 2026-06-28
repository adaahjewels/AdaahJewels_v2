import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import * as userRepo from '../repositories/user.repository';
import * as otpRepo  from '../repositories/otp.repository';

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

const generateAccessToken = (userId: number) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || '', { expiresIn: '15m' });

const generateRefreshToken = (userId: number) =>
  jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || '',
    { expiresIn: '7d' }
  );

const toPublicUser = (user: userRepo.DBUser) => ({
  id:    user.id,
  name:  user.name,
  email: user.email,
  phone: user.phone,
  role:  user.role,
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;

    // If OTP provided, verify it was completed
    if (otp) {
      const otpDoc = await otpRepo.getOtp(email, null, 'registration', true);
      if (!otpDoc || new Date(otpDoc.expires_at) < new Date()) {
        return res.status(400).json({ message: 'OTP verification failed' });
      }
      await otpRepo.deleteOtp(otpDoc.id);
    }

    // Duplicate checks
    const existingByEmail = await userRepo.getUserByEmail(email);
    if (existingByEmail) return res.status(400).json({ message: 'Email already registered' });

    if (phone) {
      const existingByPhone = await userRepo.getUserByEmailOrPhone(phone);
      if (existingByPhone?.phone === phone)
        return res.status(400).json({ message: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { id } = await userRepo.createUser(name, email, phone || null, hashedPassword);

    const accessToken  = generateAccessToken(id);
    const refreshToken = generateRefreshToken(id);
    await userRepo.updateRefreshToken(id, refreshToken);

    const user = await userRepo.getUserById(id);
    res.status(201).json({ accessToken, refreshToken, user: toPublicUser(user!) });
  } catch (error: any) {
    console.error('Registration error:', error);
    // MySQL duplicate key error
    if (error.code === 'ER_DUP_ENTRY') {
      const field = /email/i.test(error.message) ? 'Email' : 'Phone';
      return res.status(400).json({ message: `${field} already registered` });
    }
    res.status(500).json({
      message: 'Registration failed',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// ── POST /api/auth/otp-auth ───────────────────────────────────────────────────
router.post('/otp-auth', async (req, res) => {
  try {
    const { email, phone, isNewUser, name } = req.body;

    const otpDoc = await otpRepo.getOtp(email || null, phone || null, 'registration', true);
    if (!otpDoc || new Date(otpDoc.expires_at) < new Date()) {
      return res.status(400).json({ message: 'OTP verification failed' });
    }

    let user = await userRepo.getUserByEmailOrPhone(email || phone);

    if (isNewUser && !user) {
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      const { id } = await userRepo.createUser(
        name || (email?.split('@')[0] ?? 'User'),
        email, phone || null, randomPassword
      );
      user = await userRepo.getUserById(id);
    } else if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await otpRepo.deleteOtp(otpDoc.id);

    const accessToken  = generateAccessToken(user!.id);
    const refreshToken = generateRefreshToken(user!.id);
    await userRepo.updateRefreshToken(user!.id, refreshToken);

    res.json({ accessToken, refreshToken, user: toPublicUser(user!) });
  } catch (error) {
    console.error('OTP auth error:', error);
    res.status(500).json({ message: 'OTP authentication failed' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await userRepo.getUserByEmailOrPhone(emailOrPhone);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken  = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await userRepo.updateRefreshToken(user.id, refreshToken);

    res.json({ accessToken, refreshToken, user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// ── POST /api/auth/refresh-token ─────────────────────────────────────────────
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || ''
    ) as { userId: string | number };

    const user = await userRepo.getUserById(Number(decoded.userId));
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user.id);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userRepo.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await userRepo.setResetToken(user.id, hashedToken, expires);

    res.json({ message: 'Password reset token generated', resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process request' });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await userRepo.getUserByResetToken(hashedToken);
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepo.updatePassword(user.id, hashedPassword);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// ── GET /api/auth/profile ─────────────────────────────────────────────────────
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await userRepo.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user!.id;

    // Duplicate checks (excluding current user)
    if (email) {
      const cnt = await userRepo.checkEmailExcluding(email, userId);
      if (cnt > 0) return res.status(400).json({ message: 'Email already in use' });
    }
    if (phone) {
      const cnt = await userRepo.checkPhoneExcluding(phone, userId);
      if (cnt > 0) return res.status(400).json({ message: 'Phone number already in use' });
    }

    const updated = await userRepo.updateProfile(
      userId,
      name  || req.user!.name,
      email || req.user!.email,
      phone ?? req.user!.phone ?? null
    );

    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ user: toPublicUser(updated) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// ── PUT /api/auth/change-password ────────────────────────────────────────────
router.put('/change-password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await userRepo.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepo.updatePassword(user.id, hashedPassword);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password' });
  }
});

export default router;
