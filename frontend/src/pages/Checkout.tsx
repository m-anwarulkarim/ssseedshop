import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, ShoppingBag, ArrowLeft, Minus, Plus, Trash2, Ticket, Check, X, User, Phone, MapPin, StickyNote, PhoneCall, Sprout, ShieldCheck, Truck, PackageCheck, Leaf } from "lucide-react";
import { getDeliveryCharge } from "@/lib/delivery";
import SEOHead from "@/components/SEOHead";
import { upsertVisitorProfileFromOrder } from "@/lib/visitorTracking";
import { getCustomerSession, setCustomerSession } from "@/components/CustomerLogin";
import { trackInitiateCheckout } from "@/components/TrackingScripts";
import { trackCatalogPurchase } from "@/lib/metaPurchase";
import { trackEvent } from "@/hooks/useAnalyticsTracker";
import { useLanguage } from "@/contexts/LanguageContext";
import { checkOrderAllowed, formatCooldownRemaining } from "@/lib/orderGuard";
import { handleImageError } from "@/lib/imageFallback";
import { dispatchOrderNotification } from "@/lib/orderNotifications";


const VISITOR_ID_KEY = "visitor-id";
const VISITOR_FINGERPRINT_KEY = "visitor-fingerprint";

const DELIVERY_INFO_KEY = "checkout-delivery-info";

const ORDER_COOLDOWN_KEY = "last-order-timestamp";

const ORDER_COOLDOWN_HOURS = 48;

function loadDeliveryInfo() {
  try {
    const stored = localStorage.getItem(DELIVERY_INFO_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export default function Checkout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  const oldTotalPrice = items.reduce(
    (sum, i) => sum + (i.oldPrice || i.price) * i.quantity,
    0
  );
  const [loading, setLoading] = useState(false);
  const [visitorProfileId, setVisitorProfileId] = useState<string | null>(null);
  const [cooldownDialogOpen, setCooldownDialogOpen] = useState(false);
  const [cooldownSaving, setCooldownSaving] = useState(false);

  const customerSession = getCustomerSession();
  const saved = loadDeliveryInfo();
  const [name, setName] = useState(saved.name || "");
  const [phone, setPhone] = useState(saved.phone || "");
  const [address, setAddress] = useState(saved.address || "");
  const [showAltPhone, setShowAltPhone] = useState(!!saved.altPhone);
  const [altPhone, setAltPhone] = useState(saved.altPhone || "");
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string; code: string; discount_type: string; discount_value: number;
    max_discount_amount: number | null; min_order_amount: number;
  } | null>(null);

  // Auto-fill from logged-in profile (overrides cached delivery info)
  useEffect(() => {
    if (!customerSession) return;
    if (customerSession.name && !name) setName(customerSession.name);
    if (customerSession.phone && !phone) setPhone(customerSession.phone);

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
    const queryParam = customerSession.profile_id
      ? `id=${encodeURIComponent(customerSession.profile_id)}`
      : customerSession.phone
      ? `phone=${encodeURIComponent(customerSession.phone)}`
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

  // Fetch visitor profile id
  useEffect(() => {
    const profileId = customerSession?.profile_id;
    const visitorId = localStorage.getItem(VISITOR_ID_KEY);

    if (profileId) {
      setVisitorProfileId(profileId);
    } else if (visitorId) {
      supabase.from("visitor_profiles_safe").select("id").eq("visitor_id", visitorId).maybeSingle()
        .then(({ data }) => {
          if (data) setVisitorProfileId(data.id);
        });
    }
  }, [customerSession?.profile_id]);

  // Fire InitiateCheckout event once
  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout(totalPrice, items.reduce((s, i) => s + i.quantity, 0));
      trackEvent("checkout_start", { metadata: { itemCount: items.length, total: totalPrice } as any });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist delivery info
  useEffect(() => {
    localStorage.setItem(DELIVERY_INFO_KEY, JSON.stringify({
      name, phone, address, altPhone: showAltPhone ? altPhone : "",
    }));
  }, [name, phone, address, altPhone, showAltPhone]);

  const deliveryCharge = getDeliveryCharge(totalPrice);
  const isFreeDelivery = deliveryCharge === 0;
  // Calculate coupon discount
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === "fixed"
      ? Math.min(appliedCoupon.discount_value, totalPrice)
      : (() => {
          const pct = totalPrice * (appliedCoupon.discount_value / 100);
          return appliedCoupon.max_discount_amount ? Math.min(pct, appliedCoupon.max_discount_amount) : pct;
        })()
    : 0;

  const grandTotal = Math.max(0, totalPrice + deliveryCharge - couponDiscount);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return toast.error(t("কুপন কোড লিখুন","Enter coupon code"));
    setCouponLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${apiUrl}/orders/coupons.php?code=${encodeURIComponent(code)}&amount=${totalPrice}`);
      const result = await res.json();
      
      if (!res.ok || !result.success || !result.data) {
        return toast.error(result.message || t("কুপন কোড সঠিক নয়","Invalid coupon code"));
      }

      const data = result.data;
      setAppliedCoupon({
        id: data.id,
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        max_discount_amount: data.max_discount_amount,
        min_order_amount: data.min_order_amount,
      });
      toast.success(`${t("কুপন","Coupon")} "${data.code}" ${t("যোগ হয়েছে!","added!")}`);
    } catch (err: any) {
      toast.error(err.message || t("কুপন যাচাই ব্যর্থ হয়েছে", "Failed to verify coupon"));
    } finally {
      setCouponLoading(false);
    }
  };

  const isValidPhone = (p: string) => /^01\d{9}$/.test(p);

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info(t("কুপন সরানো হয়েছে","Coupon removed"));
  };

  // Cooldown disabled — anyone can order anytime
  const getOrderCooldownRemaining = () => 0;

  const cooldownRemaining = 0;
  const isInCooldown = false;

  // Save incomplete order (cooldown or any failure) via PHP API
  const saveIncompleteOrder = async (reason: string) => {
    const currentVisitorId = localStorage.getItem(VISITOR_ID_KEY) || null;
    const cartSnapshot = items.map(i => ({
      id: i.id, name: i.name, image: i.image, price: i.price, oldPrice: i.oldPrice, quantity: i.quantity,
    }));

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
          cart_snapshot: cartSnapshot,
        }),
      });
    } catch {
      // Silent fail — don't block the user experience
    }
  };

  const submitRef = useRef(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitRef.current) return;
    submitRef.current = true;

    // Cooldown removed — anyone can order anytime, no popup needed

    const fail = (msg: string) => { toast.error(msg); submitRef.current = false; };
    if (!name.trim()) return fail(t("নাম লিখুন","Please enter your name"));
    if (!isValidPhone(phone)) return fail(t("সঠিক ১১ ডিজিট ফোন নম্বর দিন (01...)","Enter a valid 11-digit phone number (01...)"));
    if (!address.trim()) return fail(t("ডেলিভারি ঠিকানা লিখুন","Enter delivery address"));
    if (showAltPhone && altPhone && !isValidPhone(altPhone)) return fail(t("বিকল্প নম্বরটি সঠিক নয়","Alternate number is invalid"));
    if (items.length === 0) return fail(t("কার্ট খালি","Cart is empty"));
    setLoading(true);

    // Admin-controlled order guard: re-order time limit + IP/device block list
    const guard = await checkOrderAllowed(phone.trim());
    if (!guard.allowed) {
      setLoading(false);
      submitRef.current = false;
      if (guard.reason === "blocked") {
        toast.error(guard.message || t("এই মুহূর্তে অর্ডার করা সম্ভব হচ্ছে না।", "Ordering is not possible right now."));
      } else {
        const left = formatCooldownRemaining(guard.remaining_minutes || 0, true);
        const leftEn = formatCooldownRemaining(guard.remaining_minutes || 0, false);
        toast.error(t(`আপনি সম্প্রতি অর্ডার করেছেন। আবার অর্ডার করতে ${left} বাকি আছে।`, `You ordered recently. You can order again in ${leftEn}.`));
      }
      saveIncompleteOrder(guard.reason === "blocked" ? "blocked" : "cooldown").catch(() => null);
      return;
    }
    try {
      // Live stock validation — re-check against current available stock
      const productIds = [...new Set(items.map((i) => i.id))];
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const pRes = await fetch(`${url}/products/get.php`);
      let stockRows = await pRes.json();
      stockRows = stockRows.filter((p: any) => productIds.includes(String(p.id)));
      const stockMap = new Map((stockRows || []).map((r: any) => [r.id, r.available_stock]));
      const qtyByProduct = new Map<string, number>();
      items.forEach((i) => qtyByProduct.set(i.id, (qtyByProduct.get(i.id) || 0) + i.quantity));
      for (const [pid, totalQty] of qtyByProduct) {
        const avail = stockMap.get(pid);
        if (typeof avail === "number" && totalQty > avail) {
          const itemName = items.find((i) => i.id === pid)?.name || t("পণ্যটি","this product");
          items
            .filter((i) => i.id === pid)
            .forEach((i) => updateQuantity(i.id, Math.min(i.quantity, Math.max(avail, 0)), i.variationId));
          setLoading(false);
          submitRef.current = false;
          toast.error(avail > 0 ? `"${itemName}" ${t("স্টকে মাত্র","only")} ${avail} ${t("টি আছে। পরিমাণ ঠিক করা হয়েছে, আবার অর্ডার করুন।","left in stock. Quantity adjusted — try again.")}` : `"${itemName}" ${t("বর্তমানে স্টকে নেই","is currently out of stock")}`);
          return;
        }
      }

      // Create order
      const currentVisitorId = localStorage.getItem(VISITOR_ID_KEY) || null;
      
      
      // Validate visitor_profile_id exists before passing to avoid FK constraint errors
      let validProfileId = customerSession?.profile_id || visitorProfileId || null;
      if (validProfileId) {
        const { data: profileCheck } = await supabase
          .from("visitor_profiles")
          .select("id")
          .eq("id", validProfileId)
          .maybeSingle();
        if (!profileCheck) validProfileId = null;
      }
      
      // Validate visitor_id exists
      let validVisitorId = currentVisitorId;
      if (validVisitorId) {
        const { data: visitorCheck } = await supabase
          .from("visitors")
          .select("id")
          .eq("id", validVisitorId)
          .maybeSingle();
        if (!visitorCheck) {
          localStorage.removeItem(VISITOR_ID_KEY);
          localStorage.removeItem(VISITOR_FINGERPRINT_KEY);
          validVisitorId = null;
        }
      }
      
      const totalDiscount = couponDiscount;

      // Validate products and create order via PHP API
      
      const payload = {
        customer_name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        alt_phone: showAltPhone && altPhone.trim() ? altPhone.trim() : null,
        note: showNote && note.trim() ? note.trim() : null,
        total_amount: grandTotal,
        discount: totalDiscount,
        delivery_charge: deliveryCharge,
        profile_id: customerSession?.profile_id || null,
        customer_id: customerSession?.profile_id || null,
        visitor_profile_id: validProfileId,
        visitor_id: validVisitorId,
        traffic_source: sessionStorage.getItem("traffic-source") || "direct",
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.image || null,
          quantity: item.quantity,
          unit_price: item.price,
          variation_id: item.variationId || null,
          sku: item.sku || null
        }))
      };

      const res = await fetch(`${url}/orders/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok || data.error || data.status !== 'success') {
        throw new Error(data.error || "Order creation failed");
      }
      
      const order = data.data;

      // Resolve SKUs from cart items
      const skuMap = new Map<string, string>();
      items.forEach(i => {
        if (i.sku) skuMap.set(String(i.id), String(i.sku));
      });
      trackCatalogPurchase({
        orderId: order.order_id,
        value: grandTotal,
        phone,
        customerName: name,
        items: items.map((item) => ({
          sku: skuMap.get(item.id) || item.sku,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // Update coupon usage atomically via PHP API
      if (appliedCoupon && couponDiscount > 0) {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
        await fetch(`${apiUrl}/orders/coupons.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "increment_usage",
            coupon_id: appliedCoupon.id,
            discount_amount: couponDiscount,
          }),
        }).catch(console.error);
      }

      await upsertVisitorProfileFromOrder({
        name,
        phone,
        address,
        altPhone: showAltPhone ? altPhone : null,
      }).catch(() => null);

      // Auto-save or update customer session if not logged in
      if (!customerSession?.profile_id && data.profile_id) {
        setCustomerSession({
          phone: phone.trim(),
          profile_id: data.profile_id,
          name: name.trim(),
          phone_verified: false,
          user_type: "customer",
          auth_provider: "phone",
        });
      }

      // Save order details for receipt before clearing cart
      sessionStorage.setItem("last-order-details", JSON.stringify({
        orderId: order.order_id,
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: items.map(i => ({
          name: i.name,
          image: i.image || null,
          quantity: i.quantity,
          price: i.price,
          oldPrice: i.oldPrice || null,
        })),
        subtotal: totalPrice,
        oldTotal: oldTotalPrice,
        deliveryCharge,
        grandTotal,
      }));

      // Set cooldown timestamp
      localStorage.setItem(ORDER_COOLDOWN_KEY, Date.now().toString());

      // Trigger fail-safe SMS notification for new order (pending status)
      dispatchOrderNotification({
        orderId: order.order_id || order.id,
        newStatus: "pending",
        phone: phone.trim(),
        customerName: name.trim(),
        totalAmount: grandTotal,
      }).catch(console.error);
      // ❌ Removed auto fraud-check on order creation (quota saving).
      // Fraud check will run on-demand from admin panel only.

      clearCart();
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
      navigate(`/order-confirmed/${order.order_id}`);
    } catch (err: any) {
      // Save as incomplete on any failure
      await saveIncompleteOrder(`${t("অর্ডার ব্যর্থ","Order failed")}: ${err.message}`);
      toast.error(`${t("অর্ডার ব্যর্থ","Order failed")}: ${err.message}`);
    } finally {
      setLoading(false);
      submitRef.current = false;
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 flex items-center justify-center p-6">
        <div className="text-center space-y-5 max-w-xs">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Sprout className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-display font-bold text-foreground">{t("ঝুড়িতে কিছু নেই","Your cart is empty")}</h2>
            <p className="text-sm text-muted-foreground">{t("প্রিয় বীজ বেছে নিন, আমরা যত্ন করে আপনার দরজায় পৌঁছে দেবো।","Choose your favourite seeds; we will deliver them with care.")}</p>
          </div>
          <Button onClick={() => navigate("/")} className="rounded-full">
            <Leaf className="w-4 h-4 mr-2" /> {t("বীজ দেখুন","Browse Seeds")}
          </Button>
        </div>
      </div>
    );
  }

  const productDiscount = oldTotalPrice - totalPrice;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-32">
      <SEOHead title="অর্ডার সম্পন্ন করুন — Ss Seed Shop" description="Ss Seed Shop — মাটি, ভালোবাসা ও বিশ্বাসের সঙ্গে আপনার বাগানের জন্য বাছাই করা বীজ। সারাদেশে নিরাপদ ডেলিভারি।" />

      {/* === Top Strip === */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/60">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t("পিছনে যান","Go back")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-display font-bold text-foreground leading-tight">{t("অর্ডার করতে নিচের ফর্মটি পূরণ করুন","Fill the form below to place your order")}</h1>
            <p className="text-[11px] text-muted-foreground">{t("সহজেই অর্ডার করুন, অসুবিধা হলে জানান","Order easily — let us know if you need help")}</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3" /> {t("নিরাপদ","Secure")}
          </div>
        </div>
        {/* Step bar */}
        <div className="max-w-2xl mx-auto px-4 pb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 rounded-full bg-primary" />
            <div className="flex-1 h-1 rounded-full bg-primary" />
            <div className="flex-1 h-1 rounded-full bg-muted" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            {t("ধাপ ২ / ৩ — ঠিকানা ও কনফার্মেশন","Step 2 / 3 — Address & Confirmation")}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-5">

        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">

          {/* === Section 1: Delivery details === */}
          <section className="rounded-2xl bg-card border border-border/70 overflow-hidden">
            <header className="px-4 pt-4 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">১</span>
                <h2 className="text-[14px] font-display font-bold text-foreground">{t("ডেলিভারি ঠিকানা দিন","Enter Delivery Address")}</h2>
              </div>
              <span className="text-[10px] text-muted-foreground">* {t("আবশ্যক","Required")}</span>
            </header>

            <div className="px-4 pb-4 space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-[11px] font-medium text-muted-foreground">{t("নাম","Name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                  <Input
                    id="name"
                    placeholder={t("এখানে আপনার নাম লিখুন","Enter your name here")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                    className="pl-9 h-11 bg-muted/30 border-border/70 focus:bg-card focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-[11px] font-medium text-muted-foreground">{t("মোবাইল নম্বর","Mobile Number")} *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    maxLength={11}
                    required
                    className="pl-9 h-11 bg-muted/30 border-border/70 focus:bg-card focus:border-primary tracking-wider"
                  />
                </div>
                
              </div>

              <div className="space-y-1">
                <Label htmlFor="address" className="text-[11px] font-medium text-muted-foreground">{t("বিস্তারিত ঠিকানা","Full Address")} *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/70" />
                  <Textarea
                    id="address"
                    placeholder={t("এখানে আপনার সম্পূর্ণ ঠিকানা লিখুন","Enter your full address here")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    maxLength={500}
                    rows={3}
                    required
                    className="pl-9 pt-2.5 bg-muted/30 border-border/70 focus:bg-card focus:border-primary resize-none"
                  />
                </div>
              </div>

              {/* Optional toggles */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAltPhone((v) => !v)}
                  className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
                    showAltPhone ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {showAltPhone ? "−" : "+"} {t("বিকল্প নম্বর","Alt. number")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNote((v) => !v)}
                  className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
                    showNote ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {showNote ? "−" : "+"} {t("বিশেষ নির্দেশনা","Special instructions")}
                </button>
              </div>

              {showAltPhone && (
                <div className="relative animate-in fade-in slide-in-from-top-1 duration-200">
                  <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                  <Input
                    placeholder={t("বিকল্প নম্বর (পরিবারের কারো)","Alternate number (family member)")}
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    maxLength={11}
                    className="pl-9 h-10 bg-muted/30 border-border/70 focus:bg-card focus:border-primary tracking-wider"
                  />
                </div>
              )}
              {showNote && (
                <div className="relative animate-in fade-in slide-in-from-top-1 duration-200">
                  <StickyNote className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/70" />
                  <Textarea
                    placeholder={t("যেমন: দুপুরের পরে কল করবেন","e.g. Call after noon")}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                    rows={2}
                    className="pl-9 pt-2.5 bg-muted/30 border-border/70 focus:bg-card focus:border-primary resize-none"
                  />
                </div>
              )}
            </div>
          </section>

          {/* === Section 2: Order summary === */}
          <section className="rounded-2xl bg-card border border-border/70 overflow-hidden">
            <header className="px-4 pt-4 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">২</span>
                <h2 className="text-[14px] font-display font-bold text-foreground">{t("আপনার অর্ডার","Your Order")}</h2>
              </div>
              <span className="text-[11px] text-muted-foreground">{totalItems}{t(" টি আইটেম"," items")}</span>
            </header>

            <ul className="divide-y divide-border/60">
              {items.map((item) => (
                <li
                  key={item.variationId ? `${item.id}::${item.variationId}` : item.id}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={handleImageError}
                    className="w-14 h-14 rounded-xl object-cover bg-muted flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground line-clamp-1">{item.name}</p>
                    {item.variationName && (
                      <span className="inline-block mt-0.5 text-[10px] font-medium text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">
                        {item.variationName}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1.5 mt-1">
                      {item.oldPrice && item.oldPrice > item.price && (
                        <span className="text-[10px] text-muted-foreground line-through">৳{item.oldPrice}</span>
                      )}
                      <span className="text-[12px] font-bold text-primary">৳{item.price}</span>
                      <span className="text-[10px] text-muted-foreground"></span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <div className="flex items-center bg-muted/60 rounded-full overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variationId)}
                        className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                        aria-label={t("কমান","Decrease")}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-[12px] font-bold text-foreground">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variationId)}
                        className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                        aria-label={t("বাড়ান","Increase")}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.variationId)}
                      className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> {t("রিমুভ","Remove")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Coupon Code Section */}
            <div className="border-t border-dashed border-border/70 mx-4" />
            <div className="px-4 py-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <div>
                      <span className="font-bold text-primary tracking-wider">{appliedCoupon.code}</span>
                      <span className="text-[11px] text-muted-foreground ml-2">
                        (−৳{couponDiscount.toFixed(0)} {t("ছাড়","off")})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-destructive hover:underline font-medium flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t("বাতিল","Remove")}
                  </button>
                </div>
              ) : !showCoupon ? (
                <button
                  type="button"
                  id="toggle-coupon-btn"
                  onClick={() => setShowCoupon(true)}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  {t("কুপন বা ডিসকাউন্ট কোড আছে?","Have a coupon code?")}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <Input
                        id="coupon-code-input"
                        placeholder={t("কুপন কোড লিখুন (যেমন: WELCOME50)","Enter coupon code")}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="pl-9 h-10 uppercase text-xs tracking-wider bg-muted/30 border-border/70"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            applyCoupon();
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      id="apply-coupon-btn"
                      size="sm"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="h-10 px-4 text-xs font-bold"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        t("প্রয়োগ","Apply")
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCoupon(false)}
                      className="h-10 px-2 text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bill split */}
            <div className="border-t border-dashed border-border/70 mx-4" />
            <div className="px-4 py-3.5 space-y-1.5 text-[13px]">
              {productDiscount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("মূল মূল্য","Original price")}</span>
                  <span className="line-through">৳{oldTotalPrice}</span>
                </div>
              )}
              {productDiscount > 0 && (
                <div className="flex justify-between text-secondary">
                  <span>{t("আজকের ছাড়","Today's discount")}</span>
                  <span>− ৳{productDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-foreground">
                <span>{t("পণ্যের মোট","Subtotal")}</span>
                <span className="font-medium">৳{totalPrice}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-muted-foreground" /> {t("ডেলিভারি চার্জ","Delivery charge")}
                </span>
                <span className={isFreeDelivery ? "font-semibold text-secondary" : "font-medium"}>
                  {isFreeDelivery ? t("ফ্রি 🎉","Free 🎉") : `৳${deliveryCharge}`}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" /> {t("কুপন","Coupon")} ({appliedCoupon?.code})
                  </span>
                  <span>− ৳{couponDiscount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between pt-2.5 mt-1 border-t border-border/60">
                <span className="text-[14px] font-display font-bold text-foreground">{t("টোটাল মূল্য","Total")} </span>
                <span className="text-xl font-display font-bold text-primary">৳{grandTotal}</span>
              </div>
              <p className="text-[10px] text-muted-foreground text-right">{t("ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন","Cash on delivery — pay when you receive")}</p>
            </div>
          </section>

          {/* === Section 3: Trust strip === */}
          <section className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-card border border-border/60 px-2 py-3 text-center">
              <PackageCheck className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-[10px] font-semibold text-foreground leading-tight">{t("যত্নশীল প্যাকেজিং","Careful packaging")}</p>
            </div>
            <div className="rounded-xl bg-card border border-border/60 px-2 py-3 text-center">
              <Truck className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-[10px] font-semibold text-foreground leading-tight">{t("সারাদেশে ডেলিভারি","Nationwide delivery")}</p>
            </div>
            <div className="rounded-xl bg-card border border-border/60 px-2 py-3 text-center">
              <ShieldCheck className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-[10px] font-semibold text-foreground leading-tight">{t("গুণমানের নিশ্চয়তা","Quality guarantee")}</p>
            </div>
          </section>

          <p className="text-[11px] text-center text-muted-foreground px-4 leading-relaxed">
            {t("অনুগ্রহ করে সঠিক মোবাইল নম্বর দিয়েছেন কিনা একবার চেক করুন।","Please double-check your mobile number.")}
          </p>
        </form>
      </div>

      {/* === Sticky bottom action === */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/70">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{t("মোট","Total")}</p>
            <p className="text-lg font-display font-bold text-foreground leading-none">৳{grandTotal}</p>
          </div>
          <Button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="flex-1 h-12 rounded-xl text-[14px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t("অপেক্ষা করুন...","Please wait...")}</>
            ) : (
              <><Check className="w-4 h-4 mr-1.5" /> {t("অর্ডার কনফার্ম করুন","Confirm Order")}</>
            )}
          </Button>
        </div>
      </div>


    </div>
  );
}
