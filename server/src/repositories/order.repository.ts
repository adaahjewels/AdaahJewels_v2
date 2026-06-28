import { callProcedure, getPool } from '../config/db';

export interface DBOrder {
  id: number;
  user_id: number;
  total_amount: number;
  payment_method: string;
  payment_id: string | null;
  razorpay_order_id: string | null;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  created_at: Date;
  // joined
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

export interface DBOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name?: string;
  subcategory_name?: string;
  images?: string;
}

export interface OrderItemInput {
  product_id: number;
  qty: number;
  price: number;
}

export const createOrder = async (data: {
  userId: number;
  totalAmount: number;
  paymentMethod: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  items: OrderItemInput[];
}): Promise<{ order: DBOrder; items: DBOrderItem[] }> => {
  const pool = getPool();
  const itemsJson = JSON.stringify(data.items);
  const [results] = await pool.execute(
    'CALL sp_create_order(?,?,?,?,?,?,?,?,?,?)',
    [
      data.userId, data.totalAmount, data.paymentMethod,
      data.shippingName, data.shippingPhone, data.shippingAddress,
      data.shippingCity, data.shippingState, data.shippingPincode,
      itemsJson,
    ]
  ) as any;
  return { order: results[0][0], items: results[1] || [] };
};

export const getOrderById = async (
  id: number
): Promise<{ order: DBOrder; items: DBOrderItem[] } | null> => {
  const pool = getPool();
  const [results] = await pool.execute('CALL sp_get_order_by_id(?)', [id]) as any;
  if (!results[0]?.[0]) return null;
  return { order: results[0][0], items: results[1] || [] };
};

export const getOrdersByUser = async (userId: number): Promise<any[]> => {
  const rows = await callProcedure<any>('sp_get_orders_by_user', [userId]);
  const ordersMap = new Map<number, any>();

  for (const row of rows) {
    const orderId = Number(row?.id);
    if (!orderId) continue;

    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        id: orderId,
        user_id: row.user_id,
        total_amount: row.total_amount,
        status: row.status,
        payment_method: row.payment_method,
        payment_id: row.payment_id,
        razorpay_order_id: row.razorpay_order_id,
        shipping_name: row.shipping_name,
        shipping_phone: row.shipping_phone,
        shipping_address: row.shipping_address,
        shipping_city: row.shipping_city,
        shipping_state: row.shipping_state,
        shipping_pincode: row.shipping_pincode,
        created_at: row.created_at,
        items: [],
      });
    }

    const order = ordersMap.get(orderId);
    if (row.item_id) {
      order.items.push({
        id: row.item_id,
        product_id: row.product_id,
        quantity: row.quantity,
        price: row.item_price,
        product_name: row.product_name,
      });
    }
  }

  return Array.from(ordersMap.values());
};

export const getOrdersAdmin = async (): Promise<DBOrder[]> => {
  return callProcedure<DBOrder>('sp_get_orders_admin', []);
};

export const updateOrderStatus = async (
  id: number,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
): Promise<DBOrder | null> => {
  const rows = await callProcedure<DBOrder>('sp_update_order_status', [id, status]);
  return rows[0] || null;
};

export const updateOrderPayment = async (
  id: number,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  paymentMethod: string,
  paymentId: string,
  razorpayOrderId: string
): Promise<void> => {
  await callProcedure('sp_update_order_payment', [
    id, status, paymentMethod, paymentId, razorpayOrderId,
  ]);
};

export const setDeliveryOption = async (orderId: number, deliveryOptionId: number | null): Promise<void> => {
  const pool = getPool();
  await pool.execute('UPDATE orders SET delivery_option_id = ? WHERE id = ?', [deliveryOptionId, orderId]);
};
