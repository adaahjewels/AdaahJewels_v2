import { callProcedure } from '../config/db';

export interface DBOtp {
  id: number;
  email: string | null;
  phone: string | null;
  otp: string;
  expires_at: Date;
  attempts: number;
  type: 'registration' | 'login' | 'password-reset';
  verified: number; // tinyint 0/1
  created_at: Date;
}

export const createOtp = async (
  email: string | null,
  phone: string | null,
  otp: string,
  expiresAt: Date,
  type: 'registration' | 'login' | 'password-reset'
): Promise<{ id: number }> => {
  const rows = await callProcedure<{ id: number }>(
    'sp_create_otp', [email || null, phone || null, otp, expiresAt, type]
  );
  return rows[0];
};

export const getOtp = async (
  email: string | null,
  phone: string | null,
  type: 'registration' | 'login' | 'password-reset',
  verified: boolean
): Promise<DBOtp | null> => {
  const rows = await callProcedure<DBOtp>(
    'sp_get_otp', [email || null, phone || null, type, verified ? 1 : 0]
  );
  return rows[0] || null;
};

export const incrementOtpAttempts = async (id: number): Promise<void> => {
  await callProcedure('sp_increment_otp_attempts', [id]);
};

export const verifyOtp = async (id: number): Promise<void> => {
  await callProcedure('sp_verify_otp', [id]);
};

export const deleteOtp = async (id: number): Promise<void> => {
  await callProcedure('sp_delete_otp', [id]);
};
