export type UserType = "regular";

export function getUserType(): UserType {
  return "regular";
}

/**
 * Get the display price for a product.
 * Always uses offer_price if available, otherwise regular_price.
 */
export function getUserPrice(product: {
  regular_price?: number | string | null;
  offer_price?: number | string | null;
  price?: number | string | null;
  paikari_maximum?: number | string | null;
  nursery_price?: number | string | null;
  [key: string]: any;
}, _userType: UserType = "regular"): { price: number; oldPrice: number | null } {
  const reg = product?.regular_price !== null && product?.regular_price !== undefined
    ? Number(product.regular_price)
    : (product?.price !== null && product?.price !== undefined ? Number(product.price) : 0);
  const off = product?.offer_price !== null && product?.offer_price !== undefined
    ? Number(product.offer_price)
    : null;
  const price = (off !== null && off > 0) ? off : (product?.price ? Number(product.price) : reg);
  const oldPrice = (off !== null && off > 0 && off < reg) ? reg : null;
  return { price, oldPrice };
}

export function getUserCashback(cashBack: number, _userType: UserType = "regular"): number {
  if (!cashBack || cashBack <= 0) return 0;
  return cashBack;
}

export function getUserTypeLabel(_userType: string | null | undefined): string {
  return "রেগুলার";
}
