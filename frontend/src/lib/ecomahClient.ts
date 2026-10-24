// frontend/src/lib/ecomahClient.ts
// Resilient client-side handler for E-COMAH SMS & Balance checking
// Provides native direct gateway fallback for 100% uptime even if backend proxy fails.

import { API_URL } from "@/config/env";
import { ECOMAH_SETTING_KEY } from "./ecomahSettings";

export interface EcomahBalanceData {
  success: boolean;
  label?: string;
  sms?: {
    limit: number;
    used: number;
    remaining: number;
  };
  fraud?: {
    limit: number;
    used: number;
    remaining: number;
  };
  error?: string;
  raw?: any;
}

let cachedApiKey: string | null = null;
let lastKeyFetchTime = 0;

/**
 * Fetch the configured E-COMAH API Key
 */
export async function getEcomahApiKey(): Promise<string> {
  const now = Date.now();
  if (cachedApiKey && now - lastKeyFetchTime < 30000) {
    return cachedApiKey;
  }

  try {
    const url = API_URL;
    const res = await fetch(`${url}/settings/get.php?keys=${ECOMAH_SETTING_KEY}`);
    const data = await res.json();
    const val = data?.[0]?.value || "";
    cachedApiKey = val;
    lastKeyFetchTime = now;
    return val;
  } catch {
    return cachedApiKey || "";
  }
}

/**
 * Check E-COMAH Balance with multi-stage fallback
 * 1. Tries local/cPanel PHP backend
 * 2. If backend returns 0 or fails, queries E-COMAH Gateway directly via CORS
 */
export async function checkEcomahBalance(providedKey?: string): Promise<EcomahBalanceData> {
  const apiKey = providedKey || (await getEcomahApiKey());
  const url = API_URL;

  // Stage 1: Try backend proxy
  try {
    const res = await fetch(`${url}/settings/sms_api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check_balance" }),
    });

    if (res.ok) {
      const data = await res.json();
      const bal = data?.balance;

      // Check if backend returned valid structured balance
      if (bal && typeof bal === "object" && bal.sms && typeof bal.sms.remaining === "number") {
        return {
          success: true,
          label: bal.label || "Connected",
          sms: {
            limit: Number(bal.sms.limit) || 0,
            used: Number(bal.sms.used) || 0,
            remaining: Number(bal.sms.remaining) || 0,
          },
          fraud: bal.fraud
            ? {
                limit: Number(bal.fraud.limit) || 0,
                used: Number(bal.fraud.used) || 0,
                remaining: Number(bal.fraud.remaining) || 0,
              }
            : undefined,
          raw: bal,
        };
      }
    }
  } catch (e) {
    console.warn("Backend balance check failed, falling back to direct gateway:", e);
  }

  // Stage 2: Direct E-COMAH Gateway check (CORS supported)
  if (apiKey) {
    try {
      const directRes = await fetch("https://api.ecomah.com/manage-external-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_balance",
          api_key: apiKey,
        }),
      });

      if (directRes.ok) {
        const data = await directRes.json();
        if (data && data.success && data.sms) {
          return {
            success: true,
            label: data.label || "Connected",
            sms: {
              limit: Number(data.sms.limit) || 0,
              used: Number(data.sms.used) || 0,
              remaining: Number(data.sms.remaining) || 0,
            },
            fraud: data.fraud
              ? {
                  limit: Number(data.fraud.limit) || 0,
                  used: Number(data.fraud.used) || 0,
                  remaining: Number(data.fraud.remaining) || 0,
                }
              : undefined,
            raw: data,
          };
        }
      }
    } catch (directErr: any) {
      console.error("Direct E-COMAH check error:", directErr);
      return {
        success: false,
        error: directErr?.message || "Failed to contact E-COMAH gateway",
      };
    }
  }

  return {
    success: false,
    error: "API Key not configured or connection failed",
  };
}

/**
 * Dispatch SMS via E-COMAH with instant direct gateway fallback
 */
export async function sendEcomahSms({
  phone,
  message,
  orderId,
  reason = "manual",
  providedKey,
}: {
  phone: string;
  message: string;
  orderId?: string;
  reason?: string;
  providedKey?: string;
}): Promise<{ success: boolean; result?: any; error?: string }> {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const normalizedPhone =
    cleanPhone.length > 11 && cleanPhone.startsWith("88")
      ? cleanPhone.substring(2)
      : cleanPhone;

  if (!normalizedPhone || !message.trim()) {
    return { success: false, error: "ফোন নম্বর ও মেসেজ প্রয়োজন" };
  }

  const apiKey = providedKey || (await getEcomahApiKey());
  const url = API_URL;

  // Stage 1: Try backend endpoint (for DB logging)
  try {
    const res = await fetch(`${url}/settings/sms_api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send_sms",
        number: normalizedPhone,
        message: message.trim(),
        order_id: orderId,
        reason,
      }),
    });

    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      return { success: true, result: data.result };
    }
  } catch (err) {
    console.warn("Backend send_sms failed, trying direct gateway fallback:", err);
  }

  // Stage 2: Direct E-COMAH Gateway call (CORS supported)
  if (apiKey) {
    try {
      const directRes = await fetch("https://api.ecomah.com/sms-api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          action: "send_sms",
          number: normalizedPhone,
          message: message.trim(),
        }),
      });

      const directData = await directRes.json();
      if (directRes.ok && directData?.success) {
        return { success: true, result: directData.result };
      }

      return {
        success: false,
        error: directData?.result?.msg || directData?.error || "SMS sending rejected by gateway",
        result: directData,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || "Gateway connection error" };
    }
  }

  return { success: false, error: "E-COMAH API Key not configured" };
}
