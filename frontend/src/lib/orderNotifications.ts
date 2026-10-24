// frontend/src/lib/orderNotifications.ts
// Bulletproof order SMS notification dispatcher with server + direct fallback

import { sendEcomahSms } from "./ecomahClient";

const DEFAULT_TEMPLATES: Record<string, { enabledKey: string; msgKey: string; defaultMsg: string }> = {
  pending: {
    enabledKey: "sms_on_pending",
    msgKey: "sms_msg_pending",
    defaultMsg: "{order_id} অর্ডার সফল হয়েছে, মোট {total} টাকা। ধন্যবাদ! - Ss Seed Shop",
  },
  confirmed: {
    enabledKey: "sms_on_confirmed",
    msgKey: "sms_msg_confirmed",
    defaultMsg: "অভিনন্দন! আপনার {order_id} অর্ডারটি কনফার্ম হয়েছে। মোট {total} টাকা। - Ss Seed Shop",
  },
  delivered: {
    enabledKey: "sms_on_delivered",
    msgKey: "sms_msg_delivered",
    defaultMsg: "আপনার {order_id} অর্ডারটি সফলভাবে ডেলিভারি হয়েছে। Ss Seed Shop-এর সাথে থাকার জন্য ধন্যবাদ!",
  },
  no_response: {
    enabledKey: "sms_on_no_response",
    msgKey: "sms_msg_no_response",
    defaultMsg: "আপনাকে কল করে পাওয়া যায়নি, অনুগ্রহ করে যোগাযোগ করুন। - Ss Seed Shop",
  },
  entry_done: {
    enabledKey: "sms_on_entry_done",
    msgKey: "sms_msg_entry_done",
    defaultMsg: "আপনার অর্ডার {order_id} কুরিয়ারে বুকিং হয়েছে। {tracking_link} - Ss Seed Shop",
  },
};

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
  payload: OrderNotificationPayload
): Promise<{ success: boolean; smsSent: boolean; message?: string }> {
  const currentStatus = payload.newStatus || payload.status || "pending";
  const url = import.meta.env.VITE_API_URL || "http://localhost:8005";

  // 1. Try PHP API endpoint first (so it writes to database logs)
  try {
    const res = await fetch(`${url}/orders/notify.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: payload.orderId,
        new_status: currentStatus,
        old_status: payload.oldStatus,
        phone: payload.phone,
        customer_name: payload.customerName,
        total_amount: payload.totalAmount,
        tracking_code: payload.trackingCode,
        tracking_link: payload.trackingLink,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.sms_sent) {
        return { success: true, smsSent: true, message: data.message };
      }
    }
  } catch (err) {
    console.warn("Backend notify.php failed, executing client-side failover:", err);
  }

  // 2. Client-side Failover Dispatcher (if backend didn't send SMS or old backend version)
  const phone = payload.phone?.trim();
  if (!phone) {
    return { success: false, smsSent: false, message: "Phone number required for SMS" };
  }

  const tplConfig = DEFAULT_TEMPLATES[currentStatus];
  if (!tplConfig) {
    return { success: true, smsSent: false, message: "No template configured for this status" };
  }

  try {
    // Fetch custom settings if available
    let isEnabled = true;
    let templateText = tplConfig.defaultMsg;

    try {
      const setRes = await fetch(
        `${url}/settings/get.php?keys=${tplConfig.enabledKey},${tplConfig.msgKey}`
      );
      if (setRes.ok) {
        const settings = await setRes.json();
        const map: Record<string, string> = {};
        settings?.forEach((r: any) => {
          map[r.key] = r.value;
        });

        if (map[tplConfig.enabledKey] === "false") {
          isEnabled = false;
        }
        if (map[tplConfig.msgKey]) {
          templateText = map[tplConfig.msgKey];
        }
      }
    } catch {
      // Use defaults
    }

    if (!isEnabled) {
      return { success: true, smsSent: false, message: "SMS for this status is disabled in settings" };
    }

    const trackingLink =
      payload.trackingLink ||
      (payload.trackingCode ? `https://steadfast.com.bd/t/${payload.trackingCode}` : "");

    const finalMessage = templateText
      .replace(/{order_id}/g, String(payload.orderId))
      .replace(/{total}/g, String(payload.totalAmount || 0))
      .replace(/{customer_name}/g, payload.customerName || "সম্মানিত গ্রাহক")
      .replace(/{tracking_link}/g, trackingLink);

    const sendRes = await sendEcomahSms({
      phone,
      message: finalMessage,
      orderId: String(payload.orderId),
      reason: `order_${currentStatus}`,
    });

    return {
      success: true,
      smsSent: sendRes.success,
      message: sendRes.success ? "SMS sent via direct gateway" : sendRes.error,
    };
  } catch (e: any) {
    return { success: false, smsSent: false, message: e?.message };
  }
}
