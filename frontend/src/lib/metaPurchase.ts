import { getEnrichedUserData } from "@/components/TrackingScripts";
import { supabase } from "@/integrations/supabase/client";

interface CatalogPurchaseItem {
  sku: string | null | undefined;
  id?: string | null;
  quantity: number;
  price: number;
}

interface CatalogPurchaseInput {
  orderId: string;
  value: number;
  items: CatalogPurchaseItem[];
  phone?: string;
  customerName?: string;
  currency?: string;
}

const PENDING_KEY = "pending-purchase-event";

/**
 * Queue the Purchase event instead of firing it right away.
 * It is fired once the customer actually lands on /order-confirmed/:id.
 */
export function trackCatalogPurchase(input: CatalogPurchaseInput) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(input));
  } catch {
    firePurchase(input);
  }
}

/** Fires a queued Purchase event once (called from the order confirmation page). */
export function firePendingCatalogPurchase(orderId?: string) {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return;
    const input = JSON.parse(raw) as CatalogPurchaseInput;
    if (orderId && input.orderId && String(input.orderId) !== String(orderId)) return;
    sessionStorage.removeItem(PENDING_KEY);
    firePurchase(input);
  } catch {
    // ignore
  }
}

/** Sends one browser + server Purchase pair with matching event IDs and SKU payloads. */
function firePurchase({
  orderId,
  value,
  items,
  phone,
  customerName,
  currency = "BDT",
}: CatalogPurchaseInput) {
  const contentIds = items
    .map((item) => item.sku || item.id)
    .filter(Boolean) as string[];
  const contents = items.map((item) => ({
    id: item.sku || item.id || "product",
    quantity: item.quantity,
    item_price: item.price,
  }));
  const eventId = `purchase_${orderId}`;

  const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
  fbq?.("track", "Purchase", {
    value,
    currency,
    content_ids: contentIds.length > 0 ? contentIds : ["order_" + orderId],
    contents,
    content_type: "product",
  }, { eventID: eventId });

  const userData = getEnrichedUserData();
  if (phone) userData.ph = phone;
  if (customerName) {
    const parts = customerName.trim().split(/\s+/);
    userData.fn = parts[0];
    if (parts.length > 1) userData.ln = parts.slice(1).join(" ");
  }

  supabase.functions.invoke("meta-capi", {
    body: {
      event_name: "Purchase",
      event_id: eventId,
      event_source_url: window.location.href,
      custom_data: {
        value,
        currency,
        content_ids: contentIds.length > 0 ? contentIds : ["order_" + orderId],
        contents,
        content_type: "product",
      },
      user_data: userData,
    },
  }).catch((err) => console.warn("CAPI Purchase event failed:", err));
}