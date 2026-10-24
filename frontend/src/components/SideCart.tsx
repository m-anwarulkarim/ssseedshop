import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import DeliveryProgressBar from "@/components/DeliveryProgressBar";
import { getDeliveryCharge } from "@/lib/delivery";
import { useFreeGiftOffer } from "@/hooks/useFreeGiftOffer";
import { matchTier, nextTier } from "@/lib/freeGiftOffer";
import { Gift } from "lucide-react";
import { handleImageError, resolveImageUrl } from "@/lib/imageFallback";

export default function SideCart() {
  const navigate = useNavigate();
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalItems, totalPrice } = useCart();
  const { t } = useLanguage();
  const giftConfig = useFreeGiftOffer();

  const regularSubtotal = items.reduce((sum, i) => sum + (i.oldPrice && i.oldPrice > i.price ? i.oldPrice : i.price) * i.quantity, 0);
  const offerDiscount = Math.max(0, regularSubtotal - totalPrice);
  const paidSubtotal = items.filter((i) => !i.isFreeGift).reduce((sum, i) => sum + i.price * i.quantity, 0);
  const wonGift = matchTier(giftConfig, paidSubtotal);
  const upcomingGift = nextTier(giftConfig, paidSubtotal);
  const deliveryCharge = getDeliveryCharge(totalPrice);
  const grandTotal = totalPrice + deliveryCharge;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] backdrop-blur-sm bg-slate-900/40 transition-all duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Side Cart Panel */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-[92%] max-w-md flex flex-col transition-transform duration-300 ease-out bg-white ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ boxShadow: "-20px 0 60px -20px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShoppingBag className="w-4.5 h-4.5 text-blue-600" strokeWidth={2.2} />
            </div>
            <h2 className="text-[17px] font-bold text-slate-800">
              {t("শপিং কার্ট", "Shopping Cart")}
            </h2>
            {totalItems > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-slate-50/40">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <ShoppingBag className="w-9 h-9 text-blue-500/70" strokeWidth={1.5} />
              </div>
              <p className="text-base font-bold text-slate-800">
                {t("কার্ট এখনো খালি", "Your cart is empty")}
              </p>
              <p className="text-xs text-slate-500 mt-1.5">
                {t("পছন্দের পণ্য যোগ করে শুরু করুন।", "Add products to get started.")}
              </p>
              <button
                onClick={closeCart}
                className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                {t("পণ্য দেখুন", "Browse Products")}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variationId ? `${item.id}::${item.variationId}` : item.id}
                className="relative flex gap-3 p-2.5 bg-white rounded-xl border border-slate-100"
              >
                {/* Thumb */}
                <img
                  src={resolveImageUrl(item.image)}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-slate-50"
                  onError={handleImageError}
                />

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13.5px] font-semibold text-slate-800 leading-snug line-clamp-1">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeItem(item.id, item.variationId)}
                      className="p-1 -mt-0.5 -mr-0.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.shortDescription && (
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                      {item.shortDescription}
                    </p>
                  )}

                  {item.variationName && (
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {item.variationName}
                    </p>
                  )}


                  <div className="flex items-center justify-between mt-1.5">
                    <span className="flex items-baseline gap-1.5 tabular-nums">
                      {item.oldPrice && item.oldPrice > item.price && (
                        <span className="text-[12px] text-slate-400 line-through">৳{item.oldPrice}</span>
                      )}
                      <span className="text-[15px] font-bold text-emerald-700">
                        {item.isFreeGift ? t("ফ্রি", "Free") : `৳${item.price}`}
                      </span>
                    </span>

                    {/* Quantity stepper - flat horizontal */}
                    <div className="inline-flex items-center border border-slate-200 rounded-md overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variationId)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" strokeWidth={2.2} />
                      </button>
                      <span className="w-8 text-center text-[13px] font-semibold text-slate-800 tabular-nums border-x border-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variationId)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer summary */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 bg-white px-4 pt-3 pb-4">
            {/* Delivery progress (unified with /delivery-charge tiers) */}
            <div className="mb-3">
              <DeliveryProgressBar totalPrice={totalPrice} />
            </div>

            {/* Free gift by order value */}
            {(wonGift || upcomingGift) && (
              <div
                className={`mb-3 flex items-start gap-2 rounded-xl px-3 py-2 text-[12.5px] leading-snug ${
                  wonGift ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                }`}
              >
                <Gift className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2.2} />
                <span className="font-medium">
                  {wonGift
                    ? t(
                        `অভিনন্দন! আপনি “${wonGift.productName}” ফ্রি পাচ্ছেন`,
                        `Congratulations! You are getting “${wonGift.productName}” free`
                      )
                    : t(
                        `আর ৳${Math.max(0, (upcomingGift!.minAmount - paidSubtotal))} টাকার অর্ডার করলে “${upcomingGift!.productName}” ফ্রি পাবেন`,
                        `Add ৳${Math.max(0, (upcomingGift!.minAmount - paidSubtotal))} more to get “${upcomingGift!.productName}” free`
                      )}
                  {wonGift?.note ? ` — ${wonGift.note}` : ""}
                </span>
              </div>
            )}



            {/* Totals */}
            <div className="space-y-2 text-[13.5px] border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">{t("সাবটোটাল", "Subtotal")}</span>
                <span className="flex items-baseline gap-2 tabular-nums">
                  {regularSubtotal > totalPrice && (
                    <span className="text-slate-400 line-through text-[13px]">৳{regularSubtotal}</span>
                  )}
                  <span className="font-bold text-emerald-700 text-[15px]">৳{totalPrice}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{t("ডেলিভারি চার্জ", "Delivery charge")}</span>
                <span className="font-semibold text-slate-800 tabular-nums">৳{deliveryCharge}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[15px] font-bold text-slate-800">{t("মোট", "Total")}</span>
              <span className="flex items-baseline gap-2 tabular-nums">
                {regularSubtotal + deliveryCharge > grandTotal && (
                  <span className="text-slate-400 line-through text-[13px]">৳{regularSubtotal + deliveryCharge}</span>
                )}
                <span className="text-[18px] font-extrabold text-emerald-700">৳{grandTotal}</span>
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                closeCart();
                navigate("/checkout");
              }}
              disabled={items.length === 0}
              className="mt-3.5 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] shadow-[0_6px_20px_-8px_rgba(37,99,235,0.6)] active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {t("অর্ডার করুন", "Place Order")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
