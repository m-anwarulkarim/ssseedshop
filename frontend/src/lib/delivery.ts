export const FULL_DELIVERY_CHARGE = 120;

export function getDeliveryCharge(totalPrice = 0, _userType?: string): number {
  if (totalPrice >= 600) return 0;
  if (totalPrice >= 400) return 50;
  if (totalPrice >= 200) return 70;
  return FULL_DELIVERY_CHARGE;
}

export function getMinOrderAmount(_userType?: string): number {
  return 0;
}

export function getDeliveryLabel(charge: number): string {
  return `৳${charge}`;
}
