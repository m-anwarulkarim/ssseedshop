import { API_URL } from "@/config/env";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Minus, Plus, User, Phone, MapPin, StickyNote, ShieldCheck, Truck } from "lucide-react";
import { getDeliveryCharge } from "@/lib/delivery";
import { useLanguage } from "@/contexts/LanguageContext";
import { upsertVisitorProfileFromOrder } from "@/lib/visitorTracking";
import { getCustomerSession, setCustomerSession } from "@/components/CustomerLogin";
import { trackCatalogPurchase } from "@/lib/metaPurchase";
import { trackEvent } from "@/hooks/useAnalyticsTracker";
import { checkOrderAllowed, formatCooldownRemaining } from "@/lib/orderGuard";
import { dispatchOrderNotification } from "@/lib/orderNotifications";
import { resolveImageUrl, PLACEHOLDER_IMAGE, handleImageError } from "@/lib/imageFallback";

const VISITOR_ID_KEY = "visitor-id";

export interface LandingOrderProduct {
  id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image?: string | null;
  sku?: string | null;
  maxStock?: number | null;
}

interface Props {
  product: LandingOrderProduct;
  title?: string;
}

const isValidPhone = (p: string) => /^01\d{9}$/.test(p.trim());

export default function LandingOrderForm({ product, title }: Props) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const session = getCustomerSession();

  const [qty, setQty] = useState(1);
  const [name, setName] = useState(session?.name || "");
  const [phone, setPhone] = useState(session?.phone || "");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = product.price * qty;
  const oldSubtotal = (product.oldPrice || product.price) * qty;
  const deliveryCharge = getDeliveryCharge(subtotal);
  const grandTotal = subtotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!name.trim()) return toast.error(t("নাম লিখুন", "Please enter your name"));
    if (!isValidPhone(phone)) return toast.error(t("সঠিক ১১ ডিজিট ফোন নম্বর দিন (01...)", "Enter a valid 11-digit phone number (01...)"));
    if (!address.trim()) return toast.error(t("ডেলিভারি ঠিকানা লিখুন", "Enter delivery address"));

    setLoading(true);

    // Admin-controlled order guard: re-order time limit + IP/device block list
    const guard = await checkOrderAllowed(phone.trim());
    if (!guard.allowed) {
      setLoading(false);
      if (guard.reason === "blocked") {
        toast.error(guard.message || t("এই মুহূর্তে অর্ডার করা সম্ভব হচ্ছে না।", "Ordering is not possible right now."));
      } else {
        const left = formatCooldownRemaining(guard.remaining_minutes || 0, true);
        const leftEn = formatCooldownRemaining(guard.remaining_minutes || 0, false);
        toast.error(t(`আপনি সম্প্রতি অর্ডার করেছেন। আবার অর্ডার করতে ${left} বাকি আছে।`, `You ordered recently. You can order again in ${leftEn}.`));
      }
      return;
    }
    try {
      const visitorId = localStorage.getItem(VISITOR_ID_KEY) || null;
      let validVisitorId = visitorId;
      if (validVisitorId) {
        const { data: vc } = await supabase.from("visitors").select("id").eq("id", validVisitorId).maybeSingle();
        if (!vc) validVisitorId = null;
      }
      let validProfileId = session?.profile_id || null;
      if (validProfileId) {
        const { data: pc } = await supabase.from("visitor_profiles").select("id").eq("id", validProfileId).maybeSingle();
        if (!pc) validProfileId = null;
      }

      const apiUrl = API_URL;
      const payload = {
        customer_name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        alt_phone: null,
        note: note.trim() || null,
        total_amount: grandTotal,
        discount: 0,
        delivery_charge: deliveryCharge,
        subtotal: subtotal,
        profile_id: validProfileId,
        customer_id: validProfileId,
        visitor_profile_id: validProfileId,
        visitor_id: validVisitorId,
        traffic_source: sessionStorage.getItem("traffic-source") || "direct",
        items: [{
          product_id: product.id,
          product_name: product.name,
          product_image: product.image || null,
          quantity: qty,
          unit_price: product.price,
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

      const order: any = data.data;

      trackCatalogPurchase({
        orderId: order.order_id,
        value: grandTotal,
        phone,
        customerName: name,
        items: [{ sku: product.sku, quantity: qty, price: product.price }],
      });

      await upsertVisitorProfileFromOrder({
        name, phone, address, altPhone: null,
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

      sessionStorage.setItem("last-order-details", JSON.stringify({
        orderId: order.order_id,
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: [{ name: product.name, image: product.image || null, quantity: qty, price: product.price, oldPrice: product.oldPrice || null }],
        subtotal,
        oldTotal: oldSubtotal,
        deliveryCharge,
        grandTotal,
      }));

      dispatchOrderNotification({
        orderId: order.order_id || order.id,
        newStatus: "pending",
        phone: phone.trim(),
        customerName: name.trim(),
        totalAmount: grandTotal,
      }).catch(() => null);

      trackEvent("order_placed", { metadata: { orderId: order.order_id } as any });
      navigate(`/order-confirmed/${order.order_id}`);
    } catch (err: any) {
      toast.error(`${t("অর্ডার ব্যর্থ", "Order failed")}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="order-form" className="max-w-4xl mx-auto px-3 md:px-6 py-12 md:py-24 scroll-mt-20">
      <div className="bg-card border border-emerald-200/70 dark:border-emerald-900/40 rounded-[2rem] shadow-xl shadow-emerald-500/5 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-4">
          <h2 className="text-lg md:text-xl font-display font-bold text-primary-foreground">
            {title || t("অর্ডার করতে নিচের ফর্মটি পূরণ করুন", "Fill the form below to order")}
          </h2>
          <p className="text-primary-foreground/85 text-xs md:text-sm mt-0.5">
            {t("ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন", "Cash on delivery — pay when you receive")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-bold"><User className="w-4 h-4 text-primary" />{t("আপনার নাম", "Your name")} *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("নাম লিখুন", "Enter your name")} className="h-12 rounded-xl" maxLength={100} required />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-bold"><Phone className="w-4 h-4 text-primary" />{t("মোবাইল নম্বর", "Mobile number")} *</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="01XXXXXXXXX" className="h-12 rounded-xl" inputMode="numeric" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-bold"><MapPin className="w-4 h-4 text-primary" />{t("সম্পূর্ণ ঠিকানা", "Full address")} *</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="rounded-xl resize-none" maxLength={500} placeholder={t("গ্রাম/এলাকা, থানা, জেলা", "Village/area, thana, district")} required />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-bold"><StickyNote className="w-4 h-4 text-primary" />{t("নোট (ঐচ্ছিক)", "Note (optional)")}</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-12 rounded-xl" maxLength={300} placeholder={t("বিশেষ কিছু জানাতে চাইলে লিখুন", "Anything we should know?")} />
          </div>

          {/* Quantity + summary */}
          <div className="rounded-[1.5rem] border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10 p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {product.image && (
                  <img src={resolveImageUrl(product.image)} alt={product.name} onError={handleImageError} className="w-16 h-16 rounded-xl object-cover border border-emerald-100 shadow-sm" />
                )}
                <span className="text-base font-bold text-foreground">{product.name}</span>
              </div>
              <div className="flex items-center justify-center gap-4 bg-background px-4 py-2 rounded-2xl border border-border shrink-0">
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-emerald-50" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-black text-lg">{qty}</span>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-emerald-50" onClick={() => setQty((q) => (product.maxStock ? Math.min(product.maxStock, q + 1) : q + 1))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm pt-4 border-t border-emerald-100/50 dark:border-emerald-900/20">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">{t("সাবটোটাল", "Subtotal")}</span>
                <span className="font-bold text-lg">
                  {product.oldPrice ? <span className="text-muted-foreground line-through mr-2 font-normal text-sm">৳{oldSubtotal}</span> : null}
                  ৳{subtotal}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">{t("ডেলিভারি চার্জ", "Delivery charge")}</span>
                <span className="font-bold text-lg">৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-emerald-200 dark:border-emerald-800 text-xl">
                <span className="font-black">{t("সর্বমোট", "Total")}</span>
                <span className="font-black text-primary text-2xl">৳{grandTotal}</span>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t("অর্ডার হচ্ছে...", "Placing order...")}</> : t("অর্ডার কনফার্ম করুন", "Confirm Order")}
          </Button>

          <div className="flex items-center justify-center gap-6 text-xs font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" />{t("১০০% আসল বীজ", "100% authentic seeds")}</span>
            <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-primary" />{t("সারা দেশে ডেলিভারি", "Nationwide delivery")}</span>
          </div>
        </form>
      </div>
    </section>
  );
}
