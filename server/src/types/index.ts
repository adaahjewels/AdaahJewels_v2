import { Request } from 'express';

export interface IUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  role: 'customer' | 'admin';
  reset_password_token?: string | null;
  reset_password_expires?: Date | null;
  refresh_token?: string | null;
  created_at: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface IProduct {
  id: number;
  name: string;
  category_id: number;
  material_type: string;
  price: number;
  discount: number;
  delivery_days: number;
  description: string;
  care_instructions?: string | null;
  stock: number;
  is_active: number;
  created_at: Date;
  // joined fields
  subcategory_name?: string;
  images?: string; // comma-separated
}

export interface IOrder {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_id?: string | null;
  razorpay_order_id?: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  created_at: Date;
}
