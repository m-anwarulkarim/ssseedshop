import { API_URL } from "@/config/env";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import DOMPurify from "dompurify";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { getCustomerSession, setCustomerSession } from "@/components/CustomerLogin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import { toast } from "sonner";
import {
  Loader2,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Phone,
  MapPin,
  StickyNote,
  PhoneCall,
  Star,
  Home as HomeIcon,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getUserPrice, getUserType } from "@/hooks/useUserType";
import { getDeliveryCharge } from "@/lib/delivery";
import { upsertVisitorProfileFromOrder } from "@/lib/visitorTracking";
import { trackViewContent } from "@/components/TrackingScripts";
import { trackCatalogPurchase } from "@/lib/metaPurchase";
import { trackEvent } from "@/hooks/useAnalyticsTracker";
import SEOHead from "@/components/SEOHead";
import { detectDomainInfo, buildDynamicKeywords, stripHtml, buildBreadcrumbSchema } from "@/lib/seoDomain";
import { useProductViewTracker } from "@/hooks/useAnalyticsTracker";
import ProductComments from "@/components/ProductComments";
import ProductBadges from "@/components/ProductBadges";
import { handleImageError, PLACEHOLDER_IMAGE, resolveImageUrl } from "@/lib/imageFallback";
import { dispatchOrderNotification } from "@/lib/orderNotifications";

const VISITOR_ID_KEY = "visitor-id";
const DELIVERY_INFO_KEY = "checkout-delivery-info";
const ORDER_COOLDOWN_KEY = "last-order-timestamp";
const ORDER_COOLDOWN_HOURS = 48;

export interface ProductPackageTier {
  id: string;
  name: string;
  quantity: number;
  regular_price: number;
  offer_price: number;
  delivery_charge: number;
  is_free_delivery: boolean;
  badge?: string;
}

function loadDeliveryInfo() {
  try {
    const stored = localStorage.getItem(DELIVERY_INFO_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export default function ProductDetail() {
  const queryClient = useQueryClient();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { removeItem } = useCart();
  const session = getCustomerSession();
  const userType = getUserType();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activeSlide, setActiveSlide] = useState(0);

  const onSlideSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSlideSelect);
    return () => {
      emblaApi.off("select", onSlideSelect);
    };
  }, [emblaApi, onSlideSelect]);

  // Product Query
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    initialData: () => {
      if (!slug) return undefined;
      const all = queryClient.getQueryData<any[]>(["all-products"]);
      return all?.find((p: any) => p.slug === slug || String(p.id) === slug);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!slug) return null;
      const url = API_URL;
      const res = await fetch(`${url}/products/get_single.php?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) return null;
      return await res.json();
    },
  });

  // Redirect to canonical slug if matched via ID fallback
  useEffect(() => {
    if (product && (product as any).slug && slug && (product as any).slug !== slug) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(slug);
      if (!isUuid) {
        navigate(`/product/${(product as any).slug}`, { replace: true });
      }
    }
  }, [product, slug, navigate]);

  useProductViewTracker(product);

  const [activeTab, setActiveTab] = useState<"description" | "policy" | "reviews">("description");
  const SUPPORT_PHONE = "01933819799";

  const categoryName: string | null = (product as any)?.category || null;
  const { data: categoryInfo } = useQuery({
    queryKey: ["product-category", categoryName],
    enabled: !!categoryName,
    queryFn: async () => {
      try {
        const url = API_URL;
        const res = await fetch(`${url}/categories/get.php?name=${encodeURIComponent(categoryName!)}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.error ? null : data;
      } catch {
        return null;
      }
    },
  });



  // Reviews count
  const { data: reviewsCount = 0 } = useQuery({
    queryKey: ["reviews-count", product?.id],
    enabled: !!product?.id,
    queryFn: async () => {
      const { count } = await (supabase.from("product_comments" as any).select("*", { count: "exact", head: true }) as any).eq("product_id", product!.id!);
      return count || 0;
    },
  });

  // Meta Pixel ViewContent
  const viewContentFired = useRef<string | null>(null);
  useEffect(() => {
    if (product?.id && viewContentFired.current !== product.id) {
      viewContentFired.current = product.id;
      const price = Number((product as any).offer_price ?? (product as any).regular_price ?? 0);
      trackViewContent(product as any, price, "BDT");
    }
  }, [product?.id]);

  // Form State
  const saved = loadDeliveryInfo();
  const [name, setName] = useState(saved.name || "");
  const [phone, setPhone] = useState(saved.phone || "");
  const [address, setAddress] = useState(saved.address || "");
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<any | null>(null);

  const [visitorProfileId, setVisitorProfileId] = useState<string | null>(null);
  const [cooldownDialogOpen, setCooldownDialogOpen] = useState(false);
  const [cooldownSaving, setCooldownSaving] = useState(false);
  const submitRef = useRef(false);

  // Auto-fill from profile
  useEffect(() => {
    if (!session) return;
    if (session.name && !name) setName(session.name);
    if (session.phone && !phone) setPhone(session.phone);

    const apiUrl = API_URL;
    const queryParam = session.profile_id
      ? `id=${encodeURIComponent(session.profile_id)}`
      : session.phone
      ? `phone=${encodeURIComponent(session.phone)}`
      : "";

    if (queryParam) {
      fetch(`${apiUrl}/customer/profile.php?${queryParam}`)
        .then((r) => r.json())
        .then((res) => {
          const p = res?.profile;
          if (!p) return;
          if (p.name) setName(p.name);
          if (p.phone) setPhone(p.phone);
          if (p.address) setAddress(p.address);
        })
        .catch(() => null);
    }
  }, []);

  useEffect(() => {
    const profileId = session?.profile_id;
    const visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (profileId) {
      setVisitorProfileId(profileId);
    } else if (visitorId) {
      supabase
        .from("visitor_profiles_safe")
        .select("id")
        .eq("visitor_id", visitorId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setVisitorProfileId(data.id);
        });
    }
  }, [session?.profile_id]);

  useEffect(() => {
    localStorage.setItem(
      DELIVERY_INFO_KEY,
      JSON.stringify({ name, phone, address })
    );
  }, [name, phone, address]);

  const isValidPhone = (p: string) => /^01\d{9}$/.test(p);

  const getOrderCooldownRemaining = () => {
    try {
      const lastOrderTime = localStorage.getItem(ORDER_COOLDOWN_KEY);
      if (!lastOrderTime) return 0;
      const elapsed = Date.now() - parseInt(lastOrderTime, 10);
      return Math.max(0, ORDER_COOLDOWN_HOURS * 3600000 - elapsed);
    } catch {
      return 0;
    }
  };

  const variations: any[] = useMemo(() => {
    if (!product?.variations) return [];
    if (Array.isArray(product.variations)) return product.variations;
    try {
      const parsed = JSON.parse(product.variations);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [product?.variations]);

  const { price: basePrice, oldPrice: baseOldPrice } = getUserPrice(product, userType);
  const currentPrice = selectedVariation
    ? (selectedVariation.offer_price ?? selectedVariation.selling_price)
    : basePrice;
  const currentOldPrice = selectedVariation
    ? (selectedVariation.offer_price ? selectedVariation.selling_price : null)
    : baseOldPrice;

  // Package Tiers Generation & Selection
  const rawTiers: ProductPackageTier[] = useMemo(() => {
    if (!product) return [];
    const pt = (product as any).package_tiers;
    if (Array.isArray(pt)) return pt;
    if (typeof pt === "string" && pt.trim()) {
      try {
        const parsed = JSON.parse(pt);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [product]);

  const packageTiers: ProductPackageTier[] = useMemo(() => {
    if (rawTiers && rawTiers.length > 0) {
      return rawTiers.map((t, idx) => ({
        ...t,
        id: t.id || `tier-${idx + 1}`,
        quantity: Math.max(1, Number(t.quantity) || 1),
        regular_price: Number(t.regular_price) || 0,
        offer_price: Number(t.offer_price) || 0,
        delivery_charge: t.is_free_delivery ? 0 : (Number(t.delivery_charge) || 0),
        is_free_delivery: Boolean(t.is_free_delivery),
        badge: t.badge || "",
      }));
    }
    // Zero-Maintenance Intelligent Auto-Generation:
    // If admin hasn't customized package tiers yet, create 1, 2, and 5 pack offers from the product's price!
    const p = currentPrice > 0 ? currentPrice : 200;
    const reg = (currentOldPrice && currentOldPrice > p) ? currentOldPrice : Math.round(p * 1.5);
    return [
      {
        id: "auto-tier-1",
        name: "১ প্যাকেট",
        quantity: 1,
        regular_price: reg,
        offer_price: p,
        delivery_charge: 50,
        is_free_delivery: false,
        badge: "",
      },
      {
        id: "auto-tier-2",
        name: "২ প্যাকেট",
        quantity: 2,
        regular_price: reg * 2,
        offer_price: Math.round(p * 1.8), // Combo saving
        delivery_charge: 0,
        is_free_delivery: true,
        badge: "জনপ্রিয়",
      },
      {
        id: "auto-tier-5",
        name: "৫ প্যাকেট",
        quantity: 5,
        regular_price: reg * 5,
        offer_price: Math.round(p * 4.0), // Mega Saver saving
        delivery_charge: 0,
        is_free_delivery: true,
        badge: "মেগা সেভার",
      },
    ];
  }, [rawTiers, currentPrice, currentOldPrice]);

  const [selectedTierId, setSelectedTierId] = useState<string>("");

  useEffect(() => {
    if (packageTiers.length > 0 && !selectedTierId) {
      const popular = packageTiers.find((t) => t.badge?.includes("জনপ্রিয়") || t.quantity === 2);
      setSelectedTierId((popular || packageTiers[0]).id);
    }
  }, [packageTiers, selectedTierId]);

  const activeTier = useMemo(() => {
    return packageTiers.find((t) => t.id === selectedTierId) || packageTiers[0];
  }, [packageTiers, selectedTierId]);

  const activeTierPrice = activeTier ? Number(activeTier.offer_price) : currentPrice;
  const activeTierRegPrice = activeTier ? Number(activeTier.regular_price) : (currentOldPrice || Math.round(currentPrice * 1.5));
  const activeTierDelivery = activeTier ? (activeTier.is_free_delivery ? 0 : Number(activeTier.delivery_charge ?? 50)) : 50;
  const activeGrandTotal = activeTierPrice + activeTierDelivery;

  const discountPercent = activeTierRegPrice > activeTierPrice
    ? Math.round(((activeTierRegPrice - activeTierPrice) / activeTierRegPrice) * 100)
    : 0;

  // Custom or Default Trust Copywriting
  const trustCard1Title = (product as any)?.trust_card_1_title || "নিশ্চিন্তে অর্ডার করুন";
  const trustCard1Text =
    (product as any)?.trust_card_1_text ||
    "অর্ডার দেওয়ার পর আমাদের প্রতিনিধি আপনাকে কল করে বিস্তারিত আলোচনা করবেন এবং তারপরই অর্ডারটি কনফার্ম করা হবে। কোনো প্রশ্ন বা জিজ্ঞাসা থাকলে তখনই জেনে নিতে পারবেন।";

  const trustCard2Title = (product as any)?.trust_card_2_title || "🤝 আমাদের প্রতিশ্রুতি";
  const trustCard2Text =
    (product as any)?.trust_card_2_text ||
    "আমরা বাংলাদেশের সবচেয়ে কম দামে পণ্য দিচ্ছি — আমাদের লক্ষ্য কম লাভে বেশি বিক্রি। তাই অনুরোধ থাকবে, আন্তরিকতার সাথে পার্সেলটি রিসিভ করবেন। ইনশাআল্লাহ আমরা কথা দিচ্ছি, আপনাকে সেরা মানের পণ্যটিই পৌঁছে দেব।";

  const highlightFeatures = (product as any)?.highlight_features || product?.short_description || "";

  // Images Setup
  const rawGallery = Array.isArray(product?.image_gallery)
    ? product.image_gallery
    : typeof product?.image_gallery === "string"
    ? [product.image_gallery]
    : [];
  const cleanGallery = rawGallery.flatMap((img: any) =>
    typeof img === "string" ? img.split(/[|]/).map((s: string) => s.trim()).filter(Boolean) : []
  );
  const rawImages = [product?.product_image, ...cleanGallery].filter(Boolean) as string[];
  const uniqueImages = Array.from(new Set(rawImages));
  const allImages = uniqueImages.length > 0 ? uniqueImages : [PLACEHOLDER_IMAGE];

  const rawAvail = (product as any)?.available_stock;
  const rawStock = (product as any)?.stock;
  const availableStock =
    typeof rawAvail === "number" && rawAvail > 0
      ? rawAvail
      : typeof rawStock === "number" && rawStock > 0
      ? rawStock
      : rawAvail ?? rawStock ?? null;
  const isOutOfStock = product?.in_stock === false || (availableStock !== null && availableStock <= 0);

  // Lead auto-capture for incomplete orders
  const saveIncompleteOrder = async (reason: string) => {
    const currentVisitorId = localStorage.getItem(VISITOR_ID_KEY) || null;
    try {
      const apiUrl = API_URL;
      await fetch(`${apiUrl}/orders/incomplete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim() || null,
          phone: phone.trim() || "unknown",
          address: address.trim() || null,
          visitor_id: currentVisitorId,
          reason,
          cart_snapshot: [
            {
              id: product?.id,
              name: `${product?.name} (${activeTier?.name || "১ প্যাকেট"})`,
              price: activeTierPrice,
              quantity: activeTier?.quantity || 1,
              image: product?.product_image,
              variation_id: selectedVariation?.id || null,
              variation_name: selectedVariation?.name || null,
            },
          ],
        }),
      });
    } catch {
      // Silent fail
    }
  };

  const handleDirectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitRef.current) return;
    submitRef.current = true;

    const cooldownRemaining = getOrderCooldownRemaining();
    if (cooldownRemaining > 0) {
      setCooldownDialogOpen(true);
      setCooldownSaving(true);
      await saveIncompleteOrder("৪৮ ঘণ্টার মধ্যে পুনরায় অর্ডার চেষ্টা");
      setCooldownSaving(false);
      submitRef.current = false;
      return;
    }

    if (!name.trim()) {
      toast.error("আপনার নাম লিখুন");
      submitRef.current = false;
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error("সঠিক ১১ ডিজিট ফোন নম্বর দিন (যেমন: 01XXXXXXXXX)");
      submitRef.current = false;
      return;
    }
    if (!address.trim()) {
      toast.error("ডেলিভারি ঠিকানা লিখুন");
      submitRef.current = false;
      return;
    }

    const tierQty = activeTier ? activeTier.quantity : 1;
    if (typeof availableStock === "number" && tierQty > availableStock) {
      toast.error(availableStock > 0 ? `স্টকে মাত্র ${availableStock} টি আছে` : "পণ্যটি বর্তমানে স্টকে নেই");
      submitRef.current = false;
      return;
    }

    setLoading(true);
    try {
      const currentVisitorId = localStorage.getItem(VISITOR_ID_KEY) || null;
      const validProfileId = session?.profile_id || visitorProfileId || null;
      const apiUrl = API_URL;
      const baseItemName = selectedVariation ? selectedVariation.name : product.name;
      const fullItemName = `${baseItemName} — ${activeTier?.name || "১ প্যাকেট"}`;

      const payload = {
        customer_name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        alt_phone: null,
        note: showNote && note.trim() ? note.trim() : null,
        total_amount: activeGrandTotal,
        discount: 0,
        delivery_charge: activeTierDelivery,
        subtotal: activeTierPrice,
        profile_id: validProfileId,
        customer_id: validProfileId,
        visitor_profile_id: validProfileId,
        visitor_id: currentVisitorId,
        traffic_source: sessionStorage.getItem("traffic-source") || "direct",
        items: [
          {
            product_id: product.id!,
            product_name: fullItemName,
            product_image: product.product_image || null,
            quantity: tierQty,
            unit_price: Math.round(activeTierPrice / tierQty),
            variation_id: selectedVariation?.id || null,
            sku: product.sku || null,
          },
        ],
      };

      const res = await fetch(`${apiUrl}/orders/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error || data.status !== "success") {
        throw new Error(data.error || "Order creation failed");
      }

      const order = data.data;

      await upsertVisitorProfileFromOrder({
        name,
        phone,
        address,
        altPhone: null,
      }).catch(() => null);

      if (!session?.profile_id && data.profile_id) {
        setCustomerSession({
          phone: phone.trim(),
          profile_id: data.profile_id,
          name: name.trim(),
          phone_verified: false,
          user_type: "customer",
          auth_provider: "phone",
        });
      }

      sessionStorage.setItem(
        "last-order-details",
        JSON.stringify({
          orderId: order.order_id,
          customerName: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          items: [
            {
              name: fullItemName,
              image: product.product_image,
              quantity: tierQty,
              price: activeTierPrice,
              oldPrice: activeTierRegPrice || null,
            },
          ],
          subtotal: activeTierPrice,
          oldTotal: activeTierRegPrice,
          deliveryCharge: activeTierDelivery,
          grandTotal: activeGrandTotal,
        })
      );

      dispatchOrderNotification({
        orderId: order.order_id || order.id,
        newStatus: "pending",
        phone: phone.trim(),
        customerName: name.trim(),
        totalAmount: activeGrandTotal,
      }).catch(console.error);

      removeItem(product.id!, selectedVariation?.id);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["web-orders"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
      queryClient.invalidateQueries({ queryKey: ["pre-orders"] });
      queryClient.invalidateQueries({ queryKey: ["my-activity"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-public"] });
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });

      trackEvent("order_placed", { metadata: { orderId: order.order_id } as any });
      trackCatalogPurchase({
        orderId: order.order_id,
        value: activeGrandTotal,
        phone,
        customerName: name,
        items: [{ id: product.id, sku: product.sku, quantity: tierQty, price: activeTierPrice }],
      });

      navigate(`/order-confirmed/${order.order_id}`);
    } catch (err: any) {
      await saveIncompleteOrder(`অর্ডার ব্যর্থ: ${err.message}`);
      toast.error(`অর্ডার ব্যর্থ: ${err.message}`);
    } finally {
      setLoading(false);
      submitRef.current = false;
    }
  };

  const scrollToOrderForm = () => {
    const el =
      (typeof window !== "undefined" && window.innerWidth >= 1024
        ? document.getElementById("order-form-desktop")
        : document.getElementById("order-form-mobile")) ||
      document.getElementById("order-form-desktop") ||
      document.getElementById("order-form-mobile") ||
      document.getElementById("order-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      const firstInput = el.querySelector("input");
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 350);
      }
    }
  };

  // --- Modular Sub-Renderers for Responsive PC & Mobile Composition ---
  const renderBreadcrumb = () => (
    <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground mb-3 sm:mb-4 overflow-x-auto whitespace-nowrap">
      <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
        <HomeIcon className="w-3 h-3" /> হোম
      </Link>
      <ChevronRight className="w-3 h-3 shrink-0" />
      {categoryInfo ? (
        <>
          <Link
            to={`/category/${encodeURIComponent((categoryInfo as any).name || categoryName!)}`}
            className="hover:text-primary transition-colors"
          >
            {(categoryInfo as any).display_name || (categoryInfo as any).name}
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
        </>
      ) : categoryName ? (
        <>
          <Link to={`/category/${categoryName}`} className="hover:text-primary transition-colors">
            {categoryName}
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
        </>
      ) : null}
      <span className="text-foreground font-semibold truncate">{product?.name}</span>
    </nav>
  );

  const renderTitleAndBadges = (isDesktop = false) => (
    <div className="space-y-2.5">
      <div className="space-y-1.5">
        <h1 className={`${isDesktop ? "text-2xl xl:text-3xl" : "text-xl sm:text-2xl"} font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight tracking-tight`}>
          {product?.name}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <ProductBadges tagNames={(product as any)?.tags} size="md" />
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold">
              স্টক শেষ
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              ✓ স্টকে আছে
            </span>
          )}
        </div>
      </div>

      {highlightFeatures && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 border border-amber-500/25 text-amber-950 dark:text-amber-200 text-xs sm:text-[13px] font-semibold leading-relaxed shadow-xs flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{highlightFeatures}</span>
        </div>
      )}
    </div>
  );

  const renderGallery = () => (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden border border-border bg-white shadow-sm">
        <div className="relative aspect-square max-h-[480px] lg:max-h-[520px] w-full bg-white" ref={emblaRef}>
          <div className="flex h-full">
            {allImages.map((img, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0 h-full aspect-square bg-white flex items-center justify-center p-2">
                <img
                  src={resolveImageUrl(img)}
                  alt={product?.name || ""}
                  className="w-full h-full object-contain"
                  loading={i === 0 ? "eager" : "lazy"}
                  onError={handleImageError}
                />
              </div>
            ))}
          </div>

          {/* Floating Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs shadow-md tracking-wider">
                −{discountPercent}%
              </span>
            </div>
          )}

          {/* Verified Brand Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-xs text-emerald-200 font-bold text-[10px] shadow-md tracking-wide">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              SS SEED SHOP
            </span>
          </div>

          {/* Carousel Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                aria-label="Previous"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-border shadow-md flex items-center justify-center hover:bg-white text-zinc-800 transition-transform active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                aria-label="Next"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-border shadow-md flex items-center justify-center hover:bg-white text-zinc-800 transition-transform active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 z-10">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeSlide === i ? "w-6 bg-primary" : "w-1.5 bg-zinc-300"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Thumbnails row (Both Desktop & Mobile) */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white cursor-pointer ${
                activeSlide === i
                  ? "border-primary ring-2 ring-primary/20 scale-102 shadow-sm"
                  : "border-border hover:border-zinc-400 opacity-75 hover:opacity-100"
              }`}
            >
              <img
                src={resolveImageUrl(img)}
                alt=""
                className="w-full h-full object-contain p-1"
                onError={handleImageError}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderVariations = () => {
    if (variations.length === 0) return null;
    return (
      <div className="p-3 rounded-xl border border-border bg-card space-y-1.5 shadow-xs">
        <p className="text-xs font-bold text-muted-foreground">ভ্যারিয়েন্ট নির্বাচন করুন:</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedVariation(null)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              !selectedVariation
                ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                : "border-border hover:border-primary/50 text-foreground"
            }`}
          >
            {product?.name}
          </button>
          {variations.map((v) => (
            <button
              key={v.id || v.name}
              type="button"
              onClick={() => setSelectedVariation(v)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                selectedVariation?.id === v.id
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                  : "border-border hover:border-primary/50 text-foreground"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderPackageSelector = () => (
    <div className="relative rounded-2xl p-3 sm:p-3.5 bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-1 h-5 rounded-full"
            style={{ background: "linear-gradient(rgb(251, 191, 36), rgb(180, 83, 9))" }}
          />
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            প্যাকেজ সিলেক্ট করুন
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
          ১টি বেছে নিন
        </span>
      </div>

      {/* 3-Card Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {packageTiers.map((tier) => {
          const isSelected = activeTier?.id === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setSelectedTierId(tier.id)}
              className={`relative rounded-xl bg-white dark:bg-zinc-900 text-left transition-all active:scale-[0.98] overflow-hidden flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "ring-2 ring-rose-500 shadow-[0_8px_20px_-8px_rgba(244,63,94,0.4)] -translate-y-0.5"
                  : "ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-rose-300 shadow-xs"
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow z-10 ring-2 ring-white">
                  <Check className="w-3 h-3 text-white stroke-[3.5]" />
                </div>
              )}

              {tier.badge && (
                <span className="absolute -top-px left-0 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-br-md shadow-xs z-10">
                  {tier.badge}
                </span>
              )}

              <div className={`p-2 sm:p-2.5 text-center border-b border-zinc-100 dark:border-zinc-800 ${isSelected ? "bg-rose-50/50 dark:bg-rose-950/20" : "bg-zinc-50/50 dark:bg-zinc-900/50"}`}>
                <div className="text-[13px] sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {tier.name}
                </div>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  {tier.regular_price > tier.offer_price && (
                    <span className="text-[11px] text-zinc-400 line-through">
                      ৳{tier.regular_price}
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-extrabold text-rose-600 dark:text-rose-400">
                    ৳{tier.offer_price}
                  </span>
                </div>
              </div>

              <div className="p-1.5 sm:p-2 text-center bg-white dark:bg-zinc-900">
                <div className="text-[10px] text-zinc-500 font-medium">ডেলিভারি চার্জ</div>
                <div className="mt-0.5">
                  {tier.is_free_delivery || Number(tier.delivery_charge) === 0 ? (
                    <span className="inline-block text-[11px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.2 rounded">
                      ফ্রি
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      ৳{tier.delivery_charge}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderTrustCards = (isDesktop = false) => (
    <div className={isDesktop ? "grid grid-cols-1 sm:grid-cols-2 gap-3.5" : "space-y-3"}>
      {/* Trust Card 1: Emerald Theme */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 dark:from-emerald-950/30 dark:via-zinc-900 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[14px] font-extrabold text-emerald-950 dark:text-emerald-200 mb-1 leading-tight">
              {trustCard1Title}
            </h4>
            <p className="text-xs text-emerald-900/85 dark:text-emerald-300/85 leading-relaxed">
              {trustCard1Text}
            </p>
          </div>
        </div>
      </div>

      {/* Trust Card 2: Amber/Rose Theme */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-white to-rose-50/50 dark:from-amber-950/30 dark:via-zinc-900 dark:to-rose-950/20 border border-amber-200/80 dark:border-amber-800/40 p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[14px] font-extrabold text-amber-950 dark:text-amber-200 mb-1 leading-tight">
              {trustCard2Title}
            </h4>
            <p className="text-xs text-amber-900/85 dark:text-amber-300/85 leading-relaxed">
              {trustCard2Text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderForm = (formId: string) => (
    <div
      id={formId}
      className="rounded-2xl border-2 border-emerald-600/35 bg-card shadow-lg overflow-hidden scroll-mt-4"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold leading-tight">দ্রুত অর্ডার ফর্ম</h2>
              <p className="text-[11px] text-emerald-100/90">৩০ সেকেন্ডে সম্পন্ন · ক্যাশ অন ডেলিভারি</p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-white">
            ক্যাশ অন ডেলিভারি
          </span>
        </div>

        {/* Stepper Header: 1 নাম | 2 ফোন | 3 ঠিকানা */}
        <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-white/20 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-white">
            <span className="w-4 h-4 rounded-full bg-white text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">
              1
            </span>
            <span>নাম</span>
          </div>
          <div className="flex items-center gap-1.5 text-white">
            <span className="w-4 h-4 rounded-full bg-white text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">
              2
            </span>
            <span>ফোন</span>
          </div>
          <div className="flex items-center gap-1.5 text-white">
            <span className="w-4 h-4 rounded-full bg-white text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">
              3
            </span>
            <span>ঠিকানা</span>
          </div>
        </div>
      </div>

      {/* Form Inputs */}
      <form onSubmit={handleDirectOrder} className="p-4 sm:p-5 space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            আপনার নাম <span className="text-rose-500">*</span>
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="আপনার সম্পূর্ণ নাম লিখুন"
            required
            className="h-11 text-sm bg-muted/20 border-border focus:border-primary"
          />
        </div>

        {/* Mobile with +88 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-primary" />
            মোবাইল নম্বর <span className="text-rose-500">*</span>
          </Label>
          <div className="flex items-center rounded-md border border-border bg-muted/20 overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
            <span className="px-3 py-2.5 bg-muted text-xs font-bold text-muted-foreground border-r border-border select-none">
              +88
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
              onBlur={() => {
                if (phone.length >= 11) {
                  saveIncompleteOrder("অর্ডার ফর্মে ফোন নম্বর পূরণ করে রেখে দিয়েছেন");
                }
              }}
              placeholder="01XXXXXXXXX"
              required
              maxLength={11}
              className="flex-1 h-11 px-3 text-sm bg-transparent outline-none font-semibold text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
          </Label>
          <Textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="গ্রাম/রোড, এলাকা/ইউনিয়ন, থানা ও জেলার নাম লিখুন"
            required
            rows={2}
            className="text-sm bg-muted/20 border-border focus:border-primary resize-none"
          />
          <p className="text-[11px] text-muted-foreground leading-normal">
            সঠিক তথ্য দিন। অর্ডার কনফার্ম করতে আমাদের প্রতিনিধি আপনাকে কল করবেন।
          </p>
        </div>

        {/* Optional Note */}
        <div>
          {!showNote ? (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <StickyNote className="w-3 h-3" /> কোনো বিশেষ নির্দেশনা থাকলে লিখুন (ঐচ্ছিক)
            </button>
          ) : (
            <div className="space-y-1 mt-2">
              <Label className="text-xs font-semibold text-muted-foreground">বিশেষ নির্দেশনা:</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="যেমন: বিকেলে ডেলিভারি দিলে ভালো হয়"
                className="h-9 text-xs bg-muted/20"
              />
            </div>
          )}
        </div>

        {/* Live Order Summary Breakdown */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>নির্বাচিত প্যাকেজ:</span>
            <span className="font-bold text-foreground">{product?.name} ({activeTier?.name})</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>মূল্য ({activeTier?.name}):</span>
            <span className="font-bold text-foreground">৳{activeTierPrice}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>ডেলিভারি চার্জ:</span>
            {activeTierDelivery === 0 ? (
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ফ্রি</span>
            ) : (
              <span className="font-bold text-foreground">৳{activeTierDelivery}</span>
            )}
          </div>
          <div className="pt-2 border-t border-border flex items-center justify-between text-sm sm:text-base font-extrabold text-foreground">
            <span>সর্বমোট:</span>
            <span className="text-lg font-extrabold text-amber-700 dark:text-amber-400">৳{activeGrandTotal}</span>
          </div>
        </div>

        {/* Shimmer Glowing Confirm CTA Button */}
        <button
          type="submit"
          disabled={loading || isOutOfStock}
          className="relative w-full h-12 rounded-xl text-zinc-950 font-extrabold text-base tracking-wide flex items-center justify-center gap-2 overflow-hidden shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: "linear-gradient(to right, rgb(251, 191, 36), rgb(245, 158, 11))",
          }}
        >
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-sweep" />
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>অর্ডার প্রসেস হচ্ছে...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                <span>অর্ডার কনফার্ম করুন — ৳{activeGrandTotal}</span>
              </>
            )}
          </span>
        </button>

        {/* Direct Call to Order Button */}
        <div className="text-center pt-1 border-t border-border/60">
          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            সরাসরি কল করে অর্ডার করুন: {SUPPORT_PHONE}
          </a>
        </div>

        {/* Security Reassurance */}
        <div className="text-center">
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5">
            <span>🔒</span> পণ্য হাতে পেয়ে টাকা পরিশোধ করুন • ক্যাশ অন ডেলিভারি
          </p>
        </div>
      </form>
    </div>
  );

  const renderDescriptionTabs = () => (
    <div id="product-tabs" className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="flex border-b border-border overflow-x-auto">
        {[
          { id: "description" as const, label: "বিস্তারিত বিবরণ" },
          { id: "policy" as const, label: "অর্ডার পলিসি" },
          { id: "reviews" as const, label: `রিভিউ (${reviewsCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[110px] px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === "description" && (
          <div className="space-y-4">
            {product?.short_description && (
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-medium">
                {product.short_description}
              </p>
            )}
            {product?.full_description ? (
              /<[a-z][\s\S]*>/i.test(product.full_description) ? (
                <div
                  className="rte-content text-[13.5px] sm:text-sm text-foreground/80 leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{
                    __html:
                      typeof DOMPurify !== "undefined" && DOMPurify && typeof (DOMPurify as any).sanitize === "function"
                        ? (DOMPurify as any).sanitize(product.full_description)
                        : product.full_description,
                  }}
                />
              ) : (
                typeof product.full_description === "string" &&
                product.full_description
                  .split("\n")
                  .filter((p: string) => p.trim())
                  .map((para: string, idx: number) => (
                    <p key={idx} className="text-[13.5px] sm:text-sm text-foreground/80 leading-relaxed">
                      {para}
                    </p>
                  ))
              )
            ) : !product?.short_description ? (
              <p className="text-sm text-muted-foreground italic">কোনো বিবরণ পাওয়া যায়নি।</p>
            ) : null}
          </div>
        )}

        {activeTab === "policy" && (
          <div className="space-y-2.5 text-sm text-foreground/85 leading-relaxed">
            <p>✓ সারাদেশে দ্রুত হোম ডেলিভারি সুবিধা।</p>
            <p>✓ ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ)।</p>
            <p>✓ অর্ডার কনফার্ম করার ২৪-৪৮ ঘণ্টার মধ্যে পার্সেল পাঠানো হয়।</p>
            <p>✓ পণ্য বুঝে পেয়ে ডেলিভারিম্যানের সামনে চেক করে নিন।</p>
            <p>
              ✓ যেকোনো জিজ্ঞাসায় সরাসরি কল করুন:{" "}
              <a href={`tel:${SUPPORT_PHONE}`} className="text-primary font-bold hover:underline">
                {SUPPORT_PHONE}
              </a>
            </p>
          </div>
        )}

        {activeTab === "reviews" && product?.id && <ProductComments productId={product.id} />}
      </div>
    </div>
  );



  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <SideCart />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <SideCart />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">পণ্যটি পাওয়া যায়নি</p>
        </div>
      </div>
    );
  }

  const domainInfo = detectDomainInfo();
  const productCanonicalUrl = `${domainInfo.origin}/product/${product.slug || product.id}`;
  const cleanName = (product.name || "পণ্য").trim();
  const seoCategoryName = (categoryName || product.category || "বাগান").trim();
  const cleanDesc = stripHtml(product.short_description || product.full_description || "");

  // Highly optimized title for Google CTR & Seed queries
  const productSeoTitle = `${cleanName} — উন্নত জাতের ${seoCategoryName} বীজ | Ss Seed Shop`;

  // Rich description highlighting price, germination rate, fast delivery, and brand
  const productSeoDesc = cleanDesc.length > 20
    ? `${cleanName} কিনুন সেরা অফার মূল্যে মাত্র ৳${activeTierPrice}। ${cleanDesc.slice(0, 95)}... শতভাগ আসল বীজ, উচ্চ অঙ্কুরোদগম ও সারাদেশে ক্যাশ অন ডেলিভারি — SS Seed (Ss Seed Shop)।`
    : `${cleanName} — উন্নত জাতের ${seoCategoryName} বীজ কিনুন ৳${activeTierPrice} মূল্যে। উচ্চ অঙ্কুরোদগম হার (≥৮০%), ক্যাশ অন হোম ডেলিভারি সারাদেশে — SS Seed (Ss Seed Shop)।`;

  // Keywords combining product details and universal seed keywords
  const productKeywords = buildDynamicKeywords({
    productName: cleanName,
    category: product.category,
    subcategory: product.subcategory,
    tags: product.tags,
  });

  // Images list (main image + gallery images)
  const productImages: string[] = [];
  if (product.product_image) productImages.push(product.product_image);
  if (Array.isArray(product.image_gallery)) {
    product.image_gallery.forEach((img: any) => {
      if (typeof img === "string" && img.trim() && !productImages.includes(img.trim())) {
        productImages.push(img.trim());
      }
    });
  }
  if (productImages.length === 0) {
    productImages.push(domainInfo.logoUrl);
  }

  // Schema.org Product Rich Snippet
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productCanonicalUrl}#product`,
    name: cleanName,
    description: cleanDesc || productSeoDesc,
    image: productImages,
    sku: product.sku || product.id,
    mpn: product.id,
    category: seoCategoryName,
    brand: {
      "@type": "Brand",
      name: domainInfo.primaryBrandName,
      alternateName: [domainInfo.alternateBrandName, domainInfo.primaryBrandBn, "AB Seed", "Ss Seed Shop"],
    },
    offers: {
      "@type": "Offer",
      url: productCanonicalUrl,
      priceCurrency: "BDT",
      price: activeTierPrice || product.offer_price || product.regular_price || 0,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: domainInfo.primaryBrandName,
        url: domainInfo.origin,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "BD",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 70,
          currency: "BDT",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "BD",
        },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "85",
      bestRating: "5",
      worstRating: "1",
    },
  };

  // Schema.org BreadcrumbList for Product
  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: "হোম", url: domainInfo.origin },
    { name: "বীজের ক্যাটাগরি", url: `${domainInfo.origin}/categories` },
    ...(product.category
      ? [{ name: `${seoCategoryName} বীজ`, url: `${domainInfo.origin}/category/${encodeURIComponent(product.category)}` }]
      : []),
    { name: cleanName, url: productCanonicalUrl },
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-8">
      <SEOHead
        title={productSeoTitle}
        description={productSeoDesc}
        keywords={productKeywords}
        image={product.product_image || productImages[0]}
        imageAlt={`${cleanName} — ${domainInfo.primaryBrandName}`}
        url={productCanonicalUrl}
        type="product"
        category={`${seoCategoryName} বীজ`}
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />
      <Navbar />
      <SideCart />

      <main className="flex-1 bg-muted/20">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6">
          {renderBreadcrumb()}

          {/* Desktop Responsive Layout (>= 1024px) */}
          <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            {/* Left Column (7 cols): Gallery, Thumbnails, Trust Cards, Description Tabs */}
            <div className="lg:col-span-7 space-y-6">
              {renderGallery()}
              {renderTrustCards(true)}
              {renderDescriptionTabs()}
            </div>

            {/* Right Column (5 cols, sticky): Title, Badges, Variations, Package Tiers, Fast Order Form */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
              {renderTitleAndBadges(true)}
              {renderVariations()}
              {renderPackageSelector()}
              {renderOrderForm("order-form-desktop")}
            </div>
          </div>

          {/* Mobile Responsive Layout (< 1024px) */}
          <div className="lg:hidden space-y-4">
            {renderTitleAndBadges(false)}
            {renderGallery()}
            {renderVariations()}
            {renderPackageSelector()}
            {renderTrustCards(false)}
            {renderOrderForm("order-form-mobile")}
            {renderDescriptionTabs()}
          </div>


        </div>
      </main>

      <Footer />

      {/* Mobile Sticky Bottom Floating Action Bar - ONLY on Mobile (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-8px_24px_-18px_rgba(0,0,0,0.35)] px-3 py-2.5 flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] leading-tight uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold truncate">
            {activeTier?.name}
          </span>
          <span className="text-lg font-extrabold text-amber-700 dark:text-amber-400 leading-tight">
            ৳{activeGrandTotal}
          </span>
        </div>
        <button
          type="button"
          onClick={scrollToOrderForm}
          className="relative flex-1 max-w-[210px] h-11 rounded-xl overflow-hidden font-extrabold text-sm tracking-wide text-zinc-950 active:scale-[0.98] transition-transform flex items-center justify-center shadow-md shadow-amber-500/25 cursor-pointer"
          style={{
            background: "linear-gradient(to right, rgb(251, 191, 36), rgb(245, 158, 11))",
          }}
        >
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-sweep" />
          <span className="relative z-10 flex items-center gap-1.5 font-bold">
            <Zap className="w-4 h-4 fill-current" />
            অর্ডার করুন
          </span>
        </button>
      </div>

      {/* Cooldown Dialog */}
      <Dialog open={cooldownDialogOpen} onOpenChange={setCooldownDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> অর্ডার সম্পন্ন হয়নি
            </DialogTitle>
            <DialogDescription className="text-foreground/80 pt-2">
              আপনি ইতোমধ্যে একটি অর্ডার করেছেন। নতুন অর্ডার করতে কাস্টমার সাপোর্টে যোগাযোগ করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              📞 কল করুন — {SUPPORT_PHONE}
            </a>
            <button
              type="button"
              onClick={() => {
                setCooldownDialogOpen(false);
                navigate("/help");
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium"
            >
              💬 সাহায্য নিন
            </button>
          </div>
          {cooldownSaving && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
              <Loader2 className="w-3 h-3 animate-spin" /> সংরক্ষণ হচ্ছে...
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
