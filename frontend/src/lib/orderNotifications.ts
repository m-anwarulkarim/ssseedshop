// frontend/src/lib/orderNotifications.ts
// Order Notification Dispatcher (SMS disabled by user request)

export interface OrderNotificationPayload {
  orderId: string | number;
  newStatus?: string;
  status?: string;
  oldStatus?: string;
  phone?: string;
  customerName?: string;
  totalAmount?: number | string;
  trackingCode?: string;
  trackingLink?: string;
}

export async function dispatchOrderNotification(
  _payload: OrderNotificationPayload
): Promise<{ success: boolean; smsSent: boolean; message?: string }> {
  // SMS API disabled completely
  return { success: true, smsSent: false, message: "SMS API is disabled" };
}
