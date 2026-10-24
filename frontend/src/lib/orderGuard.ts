export interface OrderGuardResult {
  allowed: boolean;
  reason?: "blocked" | "cooldown";
  message?: string;
  remaining_minutes?: number;
  cooldown_hours?: number;
}

/** Human readable remaining time in Bengali/English */
export function formatCooldownRemaining(minutes: number, bn: boolean): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (bn) {
    if (h > 0) return `${h} ঘন্টা ${m > 0 ? `${m} মিনিট` : ""}`.trim();
    return `${m} মিনিট`;
  }
  if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ""}`.trim();
  return `${m}m`;
}

/**
 * Server-side order guard (safe offline / local mode: allows orders)
 */
export async function checkOrderAllowed(_phone: string): Promise<OrderGuardResult> {
  return { allowed: true };
}
