import { useState, useEffect, useRef, useCallback } from "react";
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
import { Loader2, ShoppingCart, ChevronRight, ChevronLeft, icons, Check, User, Phone, MapPin, StickyNote, PhoneCall, Minus, Plus, Trash2, AlertTriangle, Ticket, Calculator, Star, MessageCircle, Home as HomeIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getUserPrice, getUserType, getUserTypeLabel } from "@/hooks/useUserType";
import { getDeliveryCharge } from "@/lib/delivery";
import { upsertVisitorProfileFromOrder } from "@/lib/visitorTracking";
import { trackInitiateCheckout, trackViewContent } from "@/components/TrackingScripts";
import { trackCatalogPurchase } from "@/lib/metaPurchase";
import { trackEvent } from "@/hooks/useAnalyticsTracker";
import SEOHead from "@/components/SEOHead";
import { useProductViewTracker } from "@/hooks/useAnalyticsTracker";
import ProductComments from "@/components/ProductComments";
import ProductBadges from "@/components/ProductBadges";
import { handleImageError, PLACEHOLDER_IMAGE } from "@/lib/imageFallback";
import { dispatchOrderNotification } from "@/lib/orderNotifications";


const VISITOR_ID_KEY = "visitor-id";
const VISITOR_FINGERPRINT_KEY = "visitor-fingerprint";
const DELIVERY_INFO_KEY = "checkout-delivery-info";
const ORDER_COOLDOWN_KEY = "last-order-timestamp";
const ORDER_COOLDOWN_HOURS = 48;

const tagColorMap: Record<string, { bg: string; text: string }> = {
  gray: { bg: "bg-gray-100", text: "text-gray-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-700" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  pink: { bg: "bg-pink-100", text: "text-pink-600" },
  amber: { bg: "bg-amber-100", text: "text-amber-600" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
};

function LucideIcon({ name, className }: { name: string; className?: string }) {
  if (!name || typeof icons === "undefined" || !icons) return null;
  const IconComponent = (icons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}

function loadDeliveryInfo() {
  try {
    const stored = localStorage.getItem(DELIVERY_INFO_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

export default function ProductDetail() {
  const queryClient = useQueryClient();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, items, updateQuantity, removeItem, clearCart } = useCart();
  const session = getCustomerSession();
  const [selectedImage, setSelectedImage] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activeSlide, setActiveSlide] = useState(0);
  const onSlideSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSlideSelect);
    return () => { emblaApi.off('select', onSlideSelect); };
  }, [emblaApi, onSlideSelect]);
  // Auto-play: slide every 3.5s
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 3500);
    return () => clearInterval(interval);
  }, [emblaApi]);

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
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${url}/products/get_single.php?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) return null;
      return await res.json();
    },
  });

  // Redirect to canonical slug URL if we matched via fallback
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
  const SUPPORT_PHONE = "01805080556";

  // Category info for breadcrumb (category is stored as text name/slug)
  const categoryName: string | null = (product as any)?.category || null;
  const { data: categoryInfo } = useQuery({
    queryKey: ["product-category", categoryName],
    enabled: !!categoryName,
    queryFn: async () => {
      try {
        const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${url}/categories/get.php?name=${encodeURIComponent(categoryName!)}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.error ? null : data;
      } catch {
        return null;
      }
    },
  });

  // Related products
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related-products", product?.id, categoryName],
    enabled: !!product?.id,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${url}/products/get_related.php`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.filter((p: any) => p.id !== product?.id);
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

  // Fire Meta Pixel ViewContent (browser + CAPI, deduped) once per product load
  const viewContentFired = useRef<string | null>(null);
  useEffect(() => {
    if (product?.id && viewContentFired.current !== product.id) {
      viewContentFired.current = product.id;
      const price = Number((product as any).offer_price ?? (product as any).regular_price ?? 0);
      trackViewContent(product as any, price, "BDT");
    }
  }, [product?.id]);



  // Variations
  interface VariationItem { id: string; name: string; selling_price: number; offer_price: number | null; image: string | null; note: string | null; }
  const [variations, setVariations] = useState<VariationItem[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<VariationItem | null>(null);

  useEffect(() => {
    if (product?.id) {
      // Variations will be implemented in PHP later
      setVariations([]);
      setSelectedVariation(null);
    }
  }, [product?.id]);

  const userType = getUserType();

  // --- Inline checkout state ---
  const saved = loadDeliveryInfo();
  const [name, setName] = useState(saved.name || "");
  const [phone, setPhone] = useState(saved.phone || "");
  const [address, setAddress] = useState(saved.address || "");
  const [showAltPhone, setShowAltPhone] = useState(!!saved.altPhone);
  const [altPhone, setAltPhone] = useState(saved.altPhone || "");
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [manualQty, setManualQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const [visitorProfileId, setVisitorProfileId] = useState<string | null>(null);
  const [cooldownDialogOpen, setCooldownDialogOpen] = useState(false);
  const [cooldownSaving, setCooldownSaving] = useState(false);
  const submitRef = useRef(false);
  const [calcPhase, setCalcPhase] = useState<'idle' | 'calculating' | 'done'>('idle');
  

  // Auto-fill from profile
  useEffect(() => {
    if (!session) return;
    if (session.name && !name) setName(session.name);
    if (session.phone && !phone) setPhone(session.phone);

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
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
          if (p.alt_phone) {
            setAltPhone(p.alt_phone);
            setShowAltPhone(true);
          }
        })
        .catch(() => null);
    }
  }, []);

  useEffect(() => {
    const profileId = session?.profile_id;
    const visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (profileId) { setVisitorProfileId(profileId); }
    else if (visitorId) {
      supabase.from("visitor_profiles_safe").select("id").eq("visitor_id", visitorId).maybeSingle()
        .then(({ data }) => { if (data) setVisitorProfileId(data.id); });
    }
  }, [session?.profile_id]);

  useEffect(() => {
    localStorage.setItem(DELIVERY_INFO_KEY, JSON.stringify({
      name, phone, address, altPhone: showAltPhone ? altPhone : "",
    }));
  }, [name, phone, address, altPhone, showAltPhone]);

  // Calculation animation effect for price savings
  useEffect(() => {
    if (!product) return;
    const { price: p, oldPrice: op } = getUserPrice(product, userType);
    if (!op || op <= p) return;
    setCalcPhase('calculating');
    const timer = setTimeout(() => setCalcPhase('done'), 3000);
    return () => clearTimeout(timer);
  }, [product, userType]);

  const isValidPhone = (p: string) => /^01\d{9}$/.test(p);

  const getOrderCooldownRemaining = () => {
    try {
      const lastOrderTime = localStorage.getItem(ORDER_COOLDOWN_KEY);
      if (!lastOrderTime) return 0;
      const elapsed = Date.now() - parseInt(lastOrderTime, 10);
      return Math.max(0, ORDER_COOLDOWN_HOURS * 3600000 - elapsed);
    } catch { return 0; }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar /><SideCart />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar /><SideCart />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">পণ্যটি পাওয়া যায়নি</p>
        </div>
      </div>
    );
  }

  const { price: basePrice, oldPrice: baseOldPrice } = getUserPrice(product, userType);
  const price = selectedVariation
    ? (selectedVariation.offer_price ?? selectedVariation.selling_price)
    : basePrice;
  const oldPrice = selectedVariation
    ? (selectedVariation.offer_price ? selectedVariation.selling_price : null)
    : baseOldPrice;
  
  const rawGallery = Array.isArray(product.image_gallery)
    ? product.image_gallery
    : (typeof product.image_gallery === "string" ? [product.image_gallery] : []);
  const cleanGallery = rawGallery.flatMap((img: any) =>
    typeof img === "string" ? img.split(/[|]/).map((s: string) => s.trim()).filter(Boolean) : []
  );
  const rawImages = [product.product_image, ...cleanGallery].filter(Boolean) as string[];
  const allImages = rawImages.length <= 1 && product.product_image
    ? [product.product_image, product.product_image, product.product_image]
    : rawImages;
  const cartKey = selectedVariation ? `${product.id}::${selectedVariation.id}` : product.id;
  const cartItem = items.find((i) => {
    const key = i.variationId ? `${i.id}::${i.variationId}` : i.id;
    return key === cartKey;
  });

  const qty = cartItem?.quantity || 0;
  

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const productUrl = `${origin}/product/${product.slug || product.id}`;
  const productJsonLd = {
    "@context": "https://schema.org", "@type": "Product",
    name: product.name, description: product.short_description || product.full_description || "",
    image: product.product_image || undefined, sku: product.sku, url: productUrl,
    brand: { "@type": "Brand", name: "Ss Seed Shop" },
    offers: { "@type": "Offer", price, priceCurrency: "BDT", availability: "https://schema.org/InStock", url: productUrl },
  };

  const rawAvail = (product as any).available_stock;
  const rawStock = (product as any).stock;
  const availableStock = (typeof rawAvail === "number" && rawAvail > 0)
    ? rawAvail
    : (typeof rawStock === "number" && rawStock > 0 ? rawStock : (rawAvail ?? rawStock ?? null));
  const isOutOfStock = product.in_stock === false || (availableStock !== null && availableStock <= 0);

  const handleAddToCart = () => {
    addItem({
      id: product.id!, name: product.name!, price, oldPrice,
      image: product.product_image || PLACEHOLDER_IMAGE,
      shortDescription: product.short_description,
      variationId: selectedVariation?.id || null,
      variationName: selectedVariation?.name || null,
      maxStock: (availableStock !== null && availableStock > 0) ? availableStock : null,
      sku: product.sku,
    });
    toast.success("কার্টে যোগ হয়েছে");
  };

  // Inline order: add this product to cart then place order
  const deliveryCharge = getDeliveryCharge(price * (qty || 1), userType);
  const orderQty = Math.max(qty || manualQty, 1);
  const subtotal = price * orderQty;
  const grandTotal = subtotal + getDeliveryCharge(subtotal, userType);
  const isFreeDelivery = getDeliveryCharge(subtotal, userType) === 0;


  const saveIncompleteOrder = async (reason: string) => {
    const currentVisitorId = localStorage.getItem(VISITOR_ID_KEY) || null;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
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
              name: product?.name,
              price,
              quantity: orderQty,
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

    if (!name.trim()) { toast.error("নাম লিখুন"); submitRef.current = false; return; }
    if (!isValidPhone(phone)) { toast.error("সঠিক ১১ ডিজিট ফোন নম্বর দিন (01...)"); submitRef.current = false; return; }
    if (!address.trim()) { toast.error("ডেলিভারি ঠিকানা লিখুন"); submitRef.current = false; return; }
    if (showAltPhone && altPhone && !isValidPhone(altPhone)) { toast.error("বিকল্প নম্বরটি সঠিক নয়"); submitRef.current = false; return; }

    // Ensure product is in cart
    if (qty === 0) handleAddToCart();
    const finalQty = Math.max(qty || manualQty, 1);

    // Stock cap validation
    const rawA = (product as any)?.available_stock;
    const rawS = (product as any)?.stock;
    const avail = (typeof rawA === "number" && rawA > 0) ? rawA : (typeof rawS === "number" && rawS > 0 ? rawS : (rawA ?? rawS));
    if (typeof avail === "number" && finalQty > avail) {
      toast.error(avail > 0 ? `স্টকে মাত্র ${avail} টি আছে, ${finalQty} টি অর্ডার করা যাবে না` : "পণ্যটি বর্তমানে স্টকে নেই");
      if (avail > 0) setManualQty(avail);
      submitRef.current = false;
      return;
    }

    const finalSubtotal = price * finalQty;
    const finalDelivery = getDeliveryCharge(finalSubtotal, userType);
    const finalGrand = finalSubtotal + finalDelivery;

    setLoading(true);
    try {
      const currentVisitorId = localStorage.getItem(VISITOR_ID_KEY) || null;
      const validProfileId = session?.profile_id || visitorProfileId || null;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const itemName = selectedVariation ? selectedVariation.name : product.name!;

      const payload = {
        customer_name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        alt_phone: showAltPhone && altPhone.trim() ? altPhone.trim() : null,
        note: showNote && note.trim() ? note.trim() : null,
        total_amount: finalGrand,
        discount: 0,
        delivery_charge: finalDelivery,
        subtotal: finalSubtotal,
        profile_id: validProfileId,
        customer_id: validProfileId,
        visitor_profile_id: validProfileId,
        visitor_id: currentVisitorId,
        traffic_source: sessionStorage.getItem("traffic-source") || "direct",
        items: [{
          product_id: product.id!,
          product_name: itemName,
          product_image: product.product_image || null,
          quantity: finalQty,
          unit_price: price,
          variation_id: selectedVariation?.id || null,
          sku: product.sku || null,
        }],
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
        altPhone: showAltPhone ? altPhone : null,
      }).catch(() => null);

      // Auto-save or update customer session if not logged in
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

      sessionStorage.setItem("last-order-details", JSON.stringify({
        orderId: order.order_id, customerName: name.trim(), phone: phone.trim(), address: address.trim(),
        items: [{ name: product.name, image: product.product_image, quantity: finalQty, price, oldPrice: oldPrice || null }],
        subtotal: finalSubtotal, oldTotal: (oldPrice || price) * finalQty, deliveryCharge: finalDelivery, grandTotal: finalGrand,
      }));

      dispatchOrderNotification({
        orderId: order.order_id || order.id,
        newStatus: "pending",
        phone: phone.trim(),
        customerName: name.trim(),
        totalAmount: finalGrand,
      }).catch(console.error);
      // ❌ Removed auto fraud-check (quota saving). Run on-demand from admin only.
      
      // Remove this product from cart since order is placed directly
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
        value: finalGrand,
        phone,
        customerName: name,
        items: [{ sku: product.sku, quantity: finalQty, price }],
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={product.name || "পণ্য"}
        description={product.short_description || `${product.name} — মূল্য ৳${price}`}
        image={product.product_image}
        type="product"
        jsonLd={[productJsonLd]}
      />
      <Navbar />
      <SideCart />

      <main className="flex-1 bg-muted/30">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground mb-3 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="flex items-center gap-1 hover:text-primary">
              <HomeIcon className="w-3 h-3" /> হোম
            </Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            {categoryInfo ? (
              <>
                <Link to={`/category/${encodeURIComponent((categoryInfo as any).name || categoryName!)}`} className="hover:text-primary">
                  {(categoryInfo as any).display_name || (categoryInfo as any).name}
                </Link>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
              </>
            ) : categoryName ? (
              <>
                <Link to={`/category/${categoryName}`} className="hover:text-primary">{categoryName}</Link>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
              </>
            ) : null}
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </nav>

          {/* Top card: Image + Info */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Left: Images */}
              <div className="p-3 sm:p-5 bg-muted/20 md:border-r border-border">
                <div className="relative group">
                  <div className="overflow-hidden rounded-xl border border-border bg-white" ref={emblaRef}>
                    <div className="flex">
                      {allImages.map((img, i) => (
                        <div key={i} className="flex-[0_0_100%] min-w-0 aspect-square bg-white">
                          <img
                            src={img || PLACEHOLDER_IMAGE}
                            alt={product.name || ""}
                            className="w-full h-full object-contain"
                            loading={i === 0 ? "eager" : "lazy"}
                            onError={handleImageError}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {allImages.length > 1 && (
                    <>
                      <button onClick={() => emblaApi?.scrollPrev()} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-border shadow-sm flex items-center justify-center hover:bg-white">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => emblaApi?.scrollNext()} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-border shadow-sm flex items-center justify-center hover:bg-white">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="flex justify-center gap-1.5 mt-2">
                        {allImages.map((_, i) => (
                          <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={`h-1.5 rounded-full transition-all ${activeSlide === i ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Info */}
              <div className="p-4 sm:p-5 space-y-3">
                <h1 className="text-lg sm:text-xl font-bold text-foreground leading-snug">{product.name}</h1>

                <ProductBadges tagNames={(product as any).tags} size="md" />


                {/* Price */}
                <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">৳{price}</span>
                  {oldPrice && oldPrice > price && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">৳{oldPrice}</span>
                      <span className="text-[11px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                        {Math.round(((oldPrice - price) / oldPrice) * 100)}% ছাড়
                      </span>
                    </>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 pb-2 border-b border-dashed border-border">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 text-muted-foreground/40 fill-muted-foreground/20" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">0.0/5</span>
                  <button onClick={() => { setActiveTab("reviews"); document.getElementById("product-tabs")?.scrollIntoView({ behavior: "smooth" }); }} className="text-xs text-primary hover:underline">
                    রিভিউ দেখুন ({reviewsCount})
                  </button>
                </div>

                {/* Product info rows */}
                <div className="space-y-1 text-xs">
                  {categoryName && (
                    <div className="flex"><span className="w-24 text-muted-foreground">ক্যাটাগরি:</span><span className="font-semibold text-foreground">{(categoryInfo as any)?.display_name || (categoryInfo as any)?.name || categoryName}</span></div>
                  )}
                  <div className="flex">
                    <span className="w-24 text-muted-foreground">স্টক:</span>
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">
                        ✕ স্টকে নেই
                      </span>
                    ) : (
                      <span className="font-semibold text-secondary">✓ স্টকে আছে</span>
                    )}
                  </div>
                  <div className="flex">
                    <span className="w-24 text-muted-foreground">ডেলিভারি:</span>
                    <Link
                      to="/delivery-charge"
                      className="font-semibold text-primary underline underline-offset-4 decoration-primary/50 hover:text-primary/80 transition-colors"
                    >
                      ডেলিভারি চার্জ দেখুন
                    </Link>
                  </div>
                </div>

                {/* Variations (compact) */}
                {variations.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">ভ্যারিয়েন্ট:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" onClick={() => setSelectedVariation(null)} className={`text-xs px-2.5 py-1 rounded-md border transition-all ${!selectedVariation ? "border-primary bg-primary/10 text-primary font-bold" : "border-border hover:border-primary/50"}`}>
                        {product.name}
                      </button>
                      {variations.map((v) => (
                        <button key={v.id} type="button" onClick={() => setSelectedVariation(v)} className={`text-xs px-2.5 py-1 rounded-md border transition-all ${selectedVariation?.id === v.id ? "border-primary bg-primary/10 text-primary font-bold" : "border-border hover:border-primary/50"}`}>
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">পরিমাণ:</span>
                  <div className="flex items-stretch border border-border rounded-md overflow-hidden">
                    <button type="button" onClick={() => {
                      const next = Math.max(1, orderQty - 1);
                      if (qty > 0 && cartItem) updateQuantity(cartItem.id, next, cartItem.variationId);
                      else setManualQty(next);
                    }} className="w-8 h-8 flex items-center justify-center hover:bg-muted" disabled={orderQty <= 1}>
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 flex items-center justify-center text-sm font-bold border-x border-border">{orderQty}</span>
                    <button type="button" onClick={() => {
                      const next = orderQty + 1;
                      if (typeof availableStock === "number" && next > availableStock) {
                        toast.error(`সর্বোচ্চ ${availableStock} টি অর্ডার করা যাবে (স্টক সীমা)`);
                        return;
                      }
                      if (qty > 0 && cartItem) updateQuantity(cartItem.id, next, cartItem.variationId);
                      else setManualQty(next);
                    }} className="w-8 h-8 flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed" disabled={isOutOfStock || (typeof availableStock === "number" && orderQty >= availableStock)}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`w-full h-11 rounded-md text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                      isOutOfStock 
                        ? "bg-muted text-muted-foreground border border-border" 
                        : "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-sm shadow-secondary/20 border border-secondary/20"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isOutOfStock ? "স্টকে নেই" : "কার্টে যোগ করুন"}
                  </button>

                  <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center justify-center gap-2 h-11 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                    <Phone className="w-4 h-4 fill-white" />
                    কল করুন · {SUPPORT_PHONE}
                  </a>
                  <a href={`https://wa.me/88${SUPPORT_PHONE}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 h-11 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    WhatsApp · {SUPPORT_PHONE}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div id="product-tabs" className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-4 scroll-mt-4">
            <div className="flex border-b border-border overflow-x-auto">
              {[
                { id: "description" as const, label: "বিস্তারিত" },
                { id: "policy" as const, label: "অর্ডার পলিসি" },
                { id: "reviews" as const, label: `রিভিউ (${reviewsCount})` },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[110px] px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-4 sm:p-5">
              {activeTab === "description" && (
                <div className="space-y-2">
                  {product.short_description && (
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium">{product.short_description}</p>
                  )}
                  {product.full_description ? (
                    /<[a-z][\s\S]*>/i.test(product.full_description) ? (
                      <div
                        className="rte-content text-[13px] text-foreground/80 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: (typeof DOMPurify !== "undefined" && DOMPurify && typeof (DOMPurify as any).sanitize === "function" ? (DOMPurify as any).sanitize(product.full_description) : product.full_description) }}
                      />
                    ) : (
                      typeof product.full_description === "string" && product.full_description.split('\n').filter((p: string) => p.trim()).map((para: string, idx: number) => (
                        <p key={idx} className="text-[13px] text-foreground/80 leading-relaxed">{para}</p>
                      ))
                    )
                  ) : !product.short_description ? (
                    <p className="text-sm text-muted-foreground italic">কোনো বিবরণ পাওয়া যায়নি।</p>
                  ) : null}
                </div>
              )}
              {activeTab === "policy" && (
                <div className="space-y-2 text-[13px] text-foreground/85 leading-relaxed">
                  <p>
                    ✓{" "}
                    <Link
                      to="/delivery-charge"
                      className="font-semibold text-primary underline underline-offset-4 decoration-primary/50 hover:text-primary/80 transition-colors"
                    >
                      সারাদেশে হোম ডেলিভারি দেখুন
                    </Link>
                  </p>
                  <p>✓ ক্যাশ অন ডেলিভারি সুবিধা উপলব্ধ।</p>
                  <p>✓ অর্ডার করার ২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি হয়।</p>
                  <p>✓ পণ্যে সমস্যা থাকলে রিসিভ করার সময় বুঝে নিন।</p>
                  <p>✓ যেকোনো সাহায্যের জন্য কল করুন: <a href={`tel:${SUPPORT_PHONE}`} className="text-primary font-semibold">{SUPPORT_PHONE}</a></p>
                </div>
              )}
              {activeTab === "reviews" && (
                <ProductComments productId={product.id} />
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3">সম্পর্কিত পণ্য</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {relatedProducts.slice(0, 8).map((rp: any) => {
                  const rPrice = rp.offer_price ?? rp.regular_price;
                  const rOld = rp.offer_price ? rp.regular_price : null;
                  const rAvail = (typeof rp.available_stock === "number" && rp.available_stock > 0) ? rp.available_stock : (typeof rp.stock === "number" && rp.stock > 0 ? rp.stock : (rp.available_stock ?? rp.stock ?? null));
                  const rOut = rp.in_stock === false || (rAvail !== null && rAvail <= 0);
                  const cardInner = (
                    <>
                      <div className="aspect-square bg-muted overflow-hidden relative">
                        <img src={rp.product_image || PLACEHOLDER_IMAGE} alt={rp.name} className={`w-full h-full object-cover transition-transform ${rOut ? "grayscale opacity-60" : "group-hover:scale-105"}`} onError={handleImageError} />
                        {rOut && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="px-2 py-1 rounded-md bg-destructive/90 text-destructive-foreground text-[10px] font-bold">স্টক নেই</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        <h3 className={`text-xs font-semibold line-clamp-2 leading-snug min-h-[2rem] ${rOut ? "text-muted-foreground" : "text-foreground"}`}>{rp.name}</h3>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-sm font-bold ${rOut ? "text-muted-foreground line-through" : "text-primary"}`}>৳{rPrice}</span>
                          {rOld && !rOut && <span className="text-[10px] text-muted-foreground line-through">৳{rOld}</span>}
                        </div>
                      </div>
                    </>
                  );
                  if (rOut) {
                    return (
                      <div key={rp.id} aria-disabled className="group block rounded-xl border border-border bg-muted/40 overflow-hidden cursor-not-allowed opacity-70">
                        {cardInner}
                      </div>
                    );
                  }
                  return (
                    <Link key={rp.id} to={`/product/${rp.slug || rp.id}`} className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-md transition-all">
                      {cardInner}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>



      <Footer />

      {/* Cooldown Dialog */}
      <Dialog open={cooldownDialogOpen} onOpenChange={setCooldownDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> অর্ডার সম্পন্ন হয়নি
            </DialogTitle>
            <DialogDescription className="text-foreground/80 pt-2">
              আপনি অলরেডি একটি অর্ডার করেছেন। নতুন অর্ডার করতে কাস্টমার সাপোর্টে যোগাযোগ করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <a href="tel:01805080556" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              📞 কল করুন — 01805080556
            </a>
            <button type="button" onClick={() => { setCooldownDialogOpen(false); navigate("/help"); }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium">
              💬 সাহায্য নিন
            </button>
          </div>
          {cooldownSaving && <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1"><Loader2 className="w-3 h-3 animate-spin" /> সংরক্ষণ হচ্ছে...</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
