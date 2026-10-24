import { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useFreeGiftOffer } from "@/hooks/useFreeGiftOffer";
import { matchTier, FREE_GIFT_SUFFIX } from "@/lib/freeGiftOffer";

/**
 * Keeps the order-value based free gift in sync with the cart:
 * adds it once the subtotal reaches a configured amount, removes it if the cart drops below.
 */
export default function FreeGiftWatcher() {
  const config = useFreeGiftOffer();
  const { items, addItem, removeItem } = useCart();

  useEffect(() => {
    if (!config.enabled || config.tiers.length === 0) return;

    const tierIds = new Set(config.tiers.map((tr) => tr.productId));
    const paidSubtotal = items
      .filter((i) => !i.isFreeGift)
      .reduce((sum, i) => sum + i.price * i.quantity, 0);

    const tier = paidSubtotal > 0 ? matchTier(config, paidSubtotal) : null;
    const currentGifts = items.filter((i) => i.isFreeGift && tierIds.has(i.id));

    // Drop gifts that no longer apply
    currentGifts.forEach((g) => {
      if (!tier || g.id !== tier.productId) removeItem(g.id, g.variationId);
    });

    if (tier && !currentGifts.some((g) => g.id === tier.productId)) {
      addItem({
        id: tier.productId,
        name: `${tier.productName} ${FREE_GIFT_SUFFIX}`,
        price: 0,
        oldPrice: null,
        image: tier.productImage || "/placeholder.svg",
        shortDescription: tier.note || null,
        isFreeGift: true,
      });
    }
  }, [config, items, addItem, removeItem]);

  return null;
}
