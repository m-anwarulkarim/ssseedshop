export const FREE_GIFT_SETTINGS_KEY = "free_gift_offer";

export interface FreeGiftTier {
  minAmount: number;
  productId: string;
  productName: string;
  productImage: string | null;
  note: string;
}

export interface FreeGiftConfig {
  enabled: boolean;
  tiers: FreeGiftTier[];
}

export const EMPTY_FREE_GIFT_CONFIG: FreeGiftConfig = { enabled: false, tiers: [] };

export function normalizeConfig(raw: unknown): FreeGiftConfig {
  const obj = (raw || {}) as Partial<FreeGiftConfig>;
  const tiers = Array.isArray(obj.tiers) ? obj.tiers : [];
  return {
    enabled: !!obj.enabled,
    tiers: tiers
      .filter((tr) => tr && tr.productId)
      .map((tr) => ({
        minAmount: Number(tr.minAmount) || 0,
        productId: String(tr.productId),
        productName: String(tr.productName || ""),
        productImage: tr.productImage || null,
        note: String(tr.note || ""),
      }))
      .sort((a, b) => a.minAmount - b.minAmount),
  };
}

export async function fetchFreeGiftConfig(): Promise<FreeGiftConfig> {
  try {
    const url = import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";
    const res = await fetch(`${url}/settings/get.php?key=${FREE_GIFT_SETTINGS_KEY}`);
    if (!res.ok) return EMPTY_FREE_GIFT_CONFIG;
    const data = await res.json();
    if (!data?.value) return EMPTY_FREE_GIFT_CONFIG;
    return normalizeConfig(JSON.parse(data.value));
  } catch {
    return EMPTY_FREE_GIFT_CONFIG;
  }
}

/** Highest tier the subtotal already qualifies for. */
export function matchTier(config: FreeGiftConfig, subtotal: number): FreeGiftTier | null {
  if (!config.enabled) return null;
  const eligible = config.tiers.filter((tr) => subtotal >= tr.minAmount && tr.minAmount > 0);
  return eligible.length ? eligible[eligible.length - 1] : null;
}

/** Next tier still to unlock (for the progress hint). */
export function nextTier(config: FreeGiftConfig, subtotal: number): FreeGiftTier | null {
  if (!config.enabled) return null;
  return config.tiers.find((tr) => tr.minAmount > subtotal) || null;
}

export const FREE_GIFT_SUFFIX = "(ফ্রি উপহার)";
