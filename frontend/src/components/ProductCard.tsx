import { API_URL } from "@/config/env";
import { useState } from "react";
import { Eye, ShoppingBag, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useQueryClient } from "@tanstack/react-query";
import { getUserPrice, getUserType } from "@/hooks/useUserType";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductDetailPopup from "@/components/ProductDetailPopup";
import { handleImageError, PLACEHOLDER_IMAGE, resolveImageUrl } from "@/lib/imageFallback";

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

export default function ProductCard({ product, reviewStats, hideOrderButton = false }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const userType = getUserType();
  const { price, oldPrice } = getUserPrice(product, userType);

  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const targetSlug = product.slug || String(product.id);

  const handlePrefetch = () => {
    if (!targetSlug) return;
    queryClient.prefetchQuery({
      queryKey: ["product", targetSlug],
      queryFn: async () => {
        const res = await fetch(`${API_URL}/products/get_single.php?slug=${encodeURIComponent(targetSlug)}`);
        if (!res.ok) throw new Error("Failed to prefetch");
        return res.json();
      },
      staleTime: 5 * 60 * 1000,
    });
  };

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

  // Calculate discount percentage
  const discountPercent =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  // Extract clean plain text for short description
  const rawDesc = product.short_description || product.description || "";
  const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, "").trim();

  return (
    <>
      <div className="group bg-white rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3 border border-slate-100 hover:border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.09)] transition-all duration-300 flex flex-col h-full">
        {/* Product Image Frame */}
        <div className="relative aspect-square w-full rounded-[15px] sm:rounded-[18px] overflow-hidden bg-slate-50 shrink-0">
          <Link
            to={`/product/${targetSlug}`}
            onMouseEnter={handlePrefetch}
            onTouchStart={handlePrefetch}
            className="block w-full h-full"
          >
            <img
              src={resolveImageUrl(product.product_image || product.image_url)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
              loading="lazy"
              decoding="async"
            />
          </Link>

          {/* Top-Right Discount Badge (Vivid pill style matching design) */}
          {discountPercent > 0 && (
            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-[#ff1e56] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md z-10 flex items-center justify-center tracking-tight pointer-events-none">
              -{discountPercent}%
            </div>
          )}

          {/* Subtle Review Badge (if reviews exist) */}
          {reviewStats && reviewStats.count >= 10 && (
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 shadow-sm pointer-events-none">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-slate-800">{reviewStats.avg.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="pt-2.5 pb-1 px-0.5 sm:px-1 flex flex-col flex-1">
          {/* Title */}
          <Link
            to={`/product/${targetSlug}`}
            onMouseEnter={handlePrefetch}
            className="block group/title"
          >
            <h3 className="font-bold text-sm sm:text-[16px] text-slate-900 group-hover/title:text-emerald-700 transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle / Short Description */}
          {cleanDesc ? (
            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5 sm:mt-1 font-normal" title={cleanDesc}>
              {cleanDesc}
            </p>
          ) : (
            <div className="h-4" />
          )}

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mt-2 mb-3">
            <span className="text-xl sm:text-2xl font-black text-[#0e7646] tracking-tight">
              ৳{price}
            </span>
            {oldPrice && oldPrice > price && (
              <span className="text-xs sm:text-sm text-slate-400 line-through font-normal">
                ৳{oldPrice}
              </span>
            )}
          </div>

          {/* Stacked Action Buttons */}
          {!hideOrderButton && (
            <div className="mt-auto flex flex-col gap-2 pt-1">
              {/* Button 1: বিস্তারিত (View Details) */}
              <Link
                to={`/product/${targetSlug}`}
                onMouseEnter={handlePrefetch}
                className="w-full h-9 sm:h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
              >
                <Eye className="w-4 h-4 text-slate-700" />
                <span>{t("বিস্তারিত", "View Details")}</span>
              </Link>

              {/* Button 2: কার্টে যুক্ত করুন (Add to Cart / Quantity Stepper) */}
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full h-10 sm:h-11 rounded-full bg-slate-100 text-slate-400 font-semibold text-xs sm:text-sm flex items-center justify-center cursor-not-allowed"
                >
                  {t("স্টক নেই", "Out of Stock")}
                </button>
              ) : qty > 0 ? (
                <div className="flex items-center justify-between w-full h-10 sm:h-11 rounded-full bg-[#15803d] text-white px-2.5 shadow-[0_4px_14px_rgba(21,128,61,0.3)]">
                  <button
                    onClick={handleDecrement}
                    aria-label="Decrease quantity"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/15 hover:bg-black/25 active:bg-black/35 flex items-center justify-center text-lg font-bold leading-none transition-colors"
                  >
                    −
                  </button>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{qty} {t("টি কার্টে আছে", "in cart")}</span>
                  </div>
                  <button
                    onClick={handleIncrement}
                    aria-label="Increase quantity"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/15 hover:bg-black/25 active:bg-black/35 flex items-center justify-center text-lg font-bold leading-none transition-colors"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full h-10 sm:h-11 rounded-full bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(21,128,61,0.3)] hover:shadow-[0_6px_20px_rgba(21,128,61,0.45)] active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                  <span>{t("কার্টে যুক্ত করুন", "Add to Cart")}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ProductDetailPopup
        product={product}
        open={showDetailPopup}
        onOpenChange={setShowDetailPopup}
      />
    </>
  );
}
