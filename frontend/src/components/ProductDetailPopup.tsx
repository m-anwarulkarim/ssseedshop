import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ChevronRight, Check, Zap } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { getUserPrice, getUserType } from "@/hooks/useUserType";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackViewContent } from "@/components/TrackingScripts";
import { handleImageError, PLACEHOLDER_IMAGE, resolveImageUrl } from "@/lib/imageFallback";

interface ProductDetailPopupProps {
  product: {
    id: string | number;
    name: string;
    slug?: string | null;
    product_image?: string | null;
    image_url?: string | null;
    regular_price?: number | string | null;
    offer_price?: number | string | null;
    price?: number | string | null;
    short_description?: string | null;
    full_description?: string | null;
    description?: string | null;
    image_gallery?: string[] | null;
    tag?: string | null;
    tags?: any[] | null;
    paikari_maximum?: number | null;
    nursery_price?: number | null;
    in_stock?: boolean | null;
    available_stock?: number | null;
    stock?: number | null;
    cash_back?: number | null;
    sku?: string | null;
    [key: string]: any;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductDetailPopup({ product, open, onOpenChange }: ProductDetailPopupProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const userType = getUserType();
  const { price, oldPrice } = getUserPrice(product, userType);
  const { t } = useLanguage();

  const rawAvail = product.available_stock;
  const rawStock = (product as any).stock;
  const effectiveStock = (typeof rawAvail === "number" && rawAvail > 0)
    ? rawAvail
    : (typeof rawStock === "number" && rawStock > 0 ? rawStock : (rawAvail ?? rawStock ?? null));
  const isOutOfStock = product.in_stock === false || (effectiveStock !== null && effectiveStock <= 0);

  useEffect(() => {
    if (!open) return;
    trackViewContent({
      id: String(product.id),
      sku: product.sku ?? null,
      name: product.name,
    }, price, "BDT");
  }, [open, product.id, product.sku, product.name, price]);

  const cartItem = items.find((i) => i.id === String(product.id) && !i.variationId);
  const qty = cartItem?.quantity || 0;
  

  const handleAddToCart = () => {
    addItem({
      id: String(product.id),
      name: product.name,
      price,
      oldPrice,
      image: product.product_image || product.image_url || PLACEHOLDER_IMAGE,
      shortDescription: product.short_description || product.description,
      variationId: null,
      variationName: null,
      maxStock: (effectiveStock !== null && effectiveStock > 0) ? effectiveStock : null,
      sku: product.sku,
    });
    toast.success(t("কার্টে যোগ হয়েছে", "Added to cart"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mt-3 mb-3">
            <img src={resolveImageUrl(product.product_image || product.image_url)} alt={product.name} className="w-full h-full object-cover" onError={handleImageError} />
          </div>


          <h2 className="text-lg font-display font-bold text-foreground mb-1">{product.name}</h2>

          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-2">
            <span className="text-2xl font-display font-bold text-primary">৳{price}</span>
            {oldPrice && <span className="text-sm text-muted-foreground line-through">৳{oldPrice}</span>}
            {oldPrice && (
              <span className="text-xs font-semibold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">
                {Math.round(((oldPrice - price) / oldPrice) * 100)}% {t("ছাড়", "OFF")}
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="text-sm text-muted-foreground mb-3">{product.short_description}</p>
          )}

          {product.full_description && (
            <div className="text-sm text-muted-foreground mb-3 bg-muted/40 rounded-lg p-3">
              <p className="line-clamp-2">{product.full_description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}</p>
              <Link
                to={`/product/${product.slug || product.id}`}
                onClick={() => onOpenChange(false)}
                className="text-xs text-primary font-semibold hover:underline mt-1 inline-block"
              >
                {t("সম্পূর্ণ দেখুন →", "View details →")}
              </Link>
            </div>
          )}

          <div className="space-y-2">
            {isOutOfStock ? (
              <button disabled className="w-full h-12 rounded-2xl bg-muted text-muted-foreground font-bold text-[15px] cursor-not-allowed">
                {t("স্টক নেই", "Out of Stock")}
              </button>
            ) : qty > 0 ? (
              <div className="space-y-2.5">
                <div className="relative flex items-stretch w-full h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 shadow-[0_8px_24px_-8px_hsl(142_70%_35%/0.6)] ring-1 ring-emerald-400/40 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  <button
                    onClick={() => qty <= 1 ? removeItem(String(product.id)) : updateQuantity(String(product.id), qty - 1)}
                    className="relative w-12 flex items-center justify-center text-white text-2xl font-light leading-none hover:bg-black/15 active:bg-black/25 transition-colors border-r border-white/20"
                  >−</button>
                  <div className="relative flex-1 flex items-center justify-center gap-2 text-white">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/25 backdrop-blur-sm">
                      <Check className="w-3.5 h-3.5" strokeWidth={4} />
                    </span>
                    <span className="text-[15px] font-bold tracking-wide tabular-nums">{qty}{t("টি কার্টে আছে", " in cart")}</span>
                  </div>
                  <button
                    onClick={() => updateQuantity(String(product.id), qty + 1)}
                    className="relative w-12 flex items-center justify-center text-white text-2xl font-light leading-none hover:bg-black/15 active:bg-black/25 transition-colors border-l border-white/20"
                  >+</button>
                </div>
                <Button
                  onClick={() => { onOpenChange(false); navigate("/checkout"); }}
                  className="group/order relative w-full h-12 text-[16px] font-extrabold rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 via-rose-500 to-rose-600 hover:shadow-[0_10px_28px_-8px_hsl(15_85%_55%/0.7)] text-white shadow-[0_8px_24px_-8px_hsl(15_85%_55%/0.55)] ring-1 ring-orange-300/40 active:scale-[0.98] transition-all"
                >
                  <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  <span className="absolute inset-0 -translate-x-full group-hover/order:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[800ms] pointer-events-none" />
                  <Zap className="w-4 h-4 mr-1.5 fill-white" />
                  {t("এখনই অর্ডার করুন", "Order Now")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={handleAddToCart}
                  className="group/btn relative flex items-center w-full h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 text-white shadow-[0_8px_24px_-8px_hsl(142_70%_35%/0.6)] ring-1 ring-emerald-400/40 active:scale-[0.98] transition-all"
                >
                  <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[800ms] pointer-events-none" />
                  <span className="relative flex items-center justify-center w-12 h-full bg-white/15 backdrop-blur-sm">
                    <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                  </span>
                  <span className="relative flex-1 text-center text-[16px] font-extrabold tracking-wide pr-3">
                    {t("কার্টে যোগ করুন", "Add to Cart")}
                  </span>
                </button>
                <Button
                  onClick={() => { handleAddToCart(); onOpenChange(false); navigate("/checkout"); }}
                  className="group/order relative w-full h-12 text-[16px] font-extrabold rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 via-rose-500 to-rose-600 text-white shadow-[0_8px_24px_-8px_hsl(15_85%_55%/0.55)] ring-1 ring-orange-300/40 active:scale-[0.98] hover:shadow-[0_10px_28px_-8px_hsl(15_85%_55%/0.7)] transition-all"
                >
                  <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  <span className="absolute inset-0 -translate-x-full group-hover/order:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[800ms] pointer-events-none" />
                  <Zap className="w-4 h-4 mr-1.5 fill-white" />
                  {t("এখনই অর্ডার করুন", "Order Now")}
                </Button>
              </div>
            )}

            {/* "সম্পূর্ণ পণ্য পেজ দেখুন" link hidden as per request */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
