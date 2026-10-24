import { useState } from "react";
import { ShoppingCart, Star, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getUserPrice, getUserType } from "@/hooks/useUserType";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductDetailPopup from "@/components/ProductDetailPopup";
import ProductBadges from "@/components/ProductBadges";
import { handleImageError, PLACEHOLDER_IMAGE } from "@/lib/imageFallback";

interface ProductCardProps {
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
    description?: string | null;
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
  reviewStats?: { avg: number; count: number } | null;
  hideOrderButton?: boolean;
}

export default function ProductCard({ product, reviewStats: propReviewStats, hideOrderButton = false }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const userType = getUserType();
  const { price, oldPrice } = getUserPrice(product, userType);

  const reviewStats = propReviewStats;

  const [showDetailPopup, setShowDetailPopup] = useState(false);

  const targetSlug = product.slug || String(product.id);

  const handlePrefetch = () => {
    if (!targetSlug) return;
    const apiUrl = import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";
    queryClient.prefetchQuery({
      queryKey: ["product", targetSlug],
      queryFn: async () => {
        const res = await fetch(`${apiUrl}/products/get_single.php?slug=${encodeURIComponent(targetSlug)}`);
        if (!res.ok) throw new Error("Failed to prefetch");
        return res.json();
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const isUnavailableForUser = false;
  const rawAvail = product.available_stock;
  const rawStock = (product as any).stock;
  const effectiveStock = (typeof rawAvail === "number" && rawAvail > 0)
    ? rawAvail
    : (typeof rawStock === "number" && rawStock > 0 ? rawStock : (rawAvail ?? rawStock ?? null));
  const isOutOfStock = product.in_stock === false || (effectiveStock !== null && effectiveStock <= 0);
  const cartItem = items.find((i) => i.id === String(product.id));
  const qty = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: String(product.id),
      name: product.name,
      price,
      oldPrice,
      image: product.product_image || product.image_url || PLACEHOLDER_IMAGE,
      shortDescription: product.short_description || product.description,
      maxStock: (effectiveStock !== null && effectiveStock > 0) ? effectiveStock : null,
      sku: product.sku ?? null,
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(String(product.id), qty + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (qty <= 1) {
      removeItem(String(product.id));
    } else {
      updateQuantity(String(product.id), qty - 1);
    }
  };

  return (
    <>
      <Link
        to={`/product/${targetSlug}`}
        onMouseEnter={handlePrefetch}
        onTouchStart={handlePrefetch}
        className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.product_image || product.image_url || PLACEHOLDER_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
          {/* Discount badge moved next to price below */}
          {reviewStats && reviewStats.count >= 10 && (
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm rounded-full px-1.5 py-0.5">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-bold text-foreground">{reviewStats.avg.toFixed(1)}</span>
              <span className="text-[9px] text-muted-foreground">({reviewStats.count})</span>
            </div>
          )}
        </div>
        <div className="p-2.5 flex flex-col flex-1">
          <h3 className="font-display font-semibold text-sm text-foreground mb-0.5">{product.name}</h3>
          {product.short_description && (
            <p className="text-[11px] text-muted-foreground mb-1.5 line-clamp-2">{product.short_description}</p>
          )}
          <ProductBadges tagNames={product.tags} className="mb-2" />
          {isUnavailableForUser ? (
            <p className="text-[11px] text-muted-foreground italic text-center py-1 mt-auto">{t("পণ্যটি হয়তো আপনার জন্য উপযুক্ত নয়", "This product may not be suitable for you")}</p>
          ) : isOutOfStock ? (
            <div className="mt-auto">
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <span className="font-display font-bold text-sm text-primary whitespace-nowrap">৳{price}</span>
                {oldPrice && <span className="text-[10px] text-muted-foreground line-through whitespace-nowrap">৳{oldPrice}</span>}
              </div>
              <button
                disabled
                className="w-full h-10 rounded-full bg-muted text-muted-foreground font-semibold text-[13px] cursor-not-allowed"
              >
                {t("স্টক নেই", "Out of Stock")}
              </button>
            </div>
          ) : (
            <div className="mt-auto">
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <span className="font-display font-bold text-sm text-primary whitespace-nowrap">৳{price}</span>
                {oldPrice && <span className="text-[10px] text-muted-foreground line-through whitespace-nowrap">৳{oldPrice}</span>}
                {oldPrice && oldPrice > price && (
                  <span className="bg-destructive text-destructive-foreground text-[9px] font-bold px-1 py-0.5 rounded-md whitespace-nowrap">
                    -{Math.round(((oldPrice - price) / oldPrice) * 100)}%
                  </span>
                )}
              </div>

              {qty > 0 ? (
                <div className="relative flex items-stretch w-full h-9 rounded-lg overflow-hidden bg-primary shadow-[0_6px_20px_-6px_hsl(var(--primary)/0.6)] ring-1 ring-primary/40 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <button
                    onClick={handleDecrement}
                    aria-label="Decrease quantity"
                    className="w-9 flex items-center justify-center text-primary-foreground/95 hover:bg-black/15 active:bg-black/25 transition-colors text-xl font-light leading-none border-r border-primary-foreground/20"
                  >
                    −
                  </button>
                  <div className="flex-1 flex items-center justify-center text-primary-foreground text-sm font-bold tabular-nums">
                    {qty}
                  </div>
                  <button
                    onClick={handleIncrement}
                    aria-label="Increase quantity"
                    className="w-9 flex items-center justify-center text-primary-foreground/95 hover:bg-black/15 active:bg-black/25 transition-colors text-lg font-light leading-none border-l border-primary-foreground/20"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="relative flex items-center justify-center gap-2 w-full h-10 rounded-full bg-primary text-primary-foreground font-semibold text-[13px] shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-all duration-200"
                >
                  <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                  <span>{t("কার্টে যোগ করুন", "Add to Cart")}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </Link>

      <ProductDetailPopup
        product={product}
        open={showDetailPopup}
        onOpenChange={setShowDetailPopup}
      />
    </>
  );
}
