import { callProcedure } from '../config/db';

export interface DBUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  role: 'customer' | 'admin';
  reset_password_token: string | null;
  reset_password_expires: Date | null;
  refresh_token: string | null;
  created_at: Date;
}

export const createUser = async (
  name: string, email: string, phone: string | null,
  password: string, role: 'customer' | 'admin' = 'customer'
): Promise<{ id: number }> => {
  const rows = await callProcedure<{ id: number }>(
    'sp_create_user', [name, email, phone || null, password, role]
  );
  return rows[0];
};

export const getUserById = async (id: number): Promise<DBUser | null> => {
  const rows = await callProcedure<DBUser>('sp_get_user_by_id', [id]);
  return rows[0] || null;
};

export const getUserByEmail = async (email: string): Promise<DBUser | null> => {
  const rows = await callProcedure<DBUser>('sp_get_user_by_email', [email]);
  return rows[0] || null;
};

export const getUserByEmailOrPhone = async (identifier: string): Promise<DBUser | null> => {
  const rows = await callProcedure<DBUser>('sp_get_user_by_email_or_phone', [identifier]);
  return rows[0] || null;
};

export const updateRefreshToken = async (id: number, token: string | null): Promise<void> => {
  await callProcedure('sp_update_user_refresh_token', [id, token]);
};

export const updateProfile = async (
  id: number, name: string, email: string, phone: string | null
): Promise<DBUser | null> => {
  const rows = await callProcedure<DBUser>('sp_update_user_profile', [id, name, email, phone]);
  return rows[0] || null;
};

export const updatePassword = async (id: number, hashedPassword: string): Promise<void> => {
  await callProcedure('sp_update_user_password', [id, hashedPassword]);
};

export const setResetToken = async (
  id: number, token: string, expires: Date
): Promise<void> => {
  await callProcedure('sp_set_reset_password_token', [id, token, expires]);
};

export const getUserByResetToken = async (token: string): Promise<DBUser | null> => {
  const rows = await callProcedure<DBUser>('sp_get_user_by_reset_token', [token]);
  return rows[0] || null;
};

export const checkEmailExcluding = async (email: string, excludeId: number): Promise<number> => {
  const rows = await callProcedure<{ cnt: number }>(
    'sp_check_email_exists_excluding', [email, excludeId]
  );
  return rows[0]?.cnt || 0;
};

export const checkPhoneExcluding = async (phone: string, excludeId: number): Promise<number> => {
  const rows = await callProcedure<{ cnt: number }>(
    'sp_check_phone_exists_excluding', [phone, excludeId]
  );
  return rows[0]?.cnt || 0;
};

export const getUsers = async (limit = 20, offset = 0): Promise<DBUser[]> => {
  return callProcedure<DBUser>('sp_get_users', [limit, offset]);
};
