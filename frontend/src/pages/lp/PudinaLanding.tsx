import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Lock, ShoppingCart, Phone, Star, ChevronDown, Check, ChevronLeft, ChevronRight,
  Leaf, PartyPopper, Flame, Truck, Timer, MessageCircle, Sprout, Gift,
  BadgeCheck, Palette, Package, Home, BookOpen, Wallet, HelpCircle, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getTrafficSource } from "@/lib/trafficSource";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { trackInitiateCheckout, trackAddToCart, trackViewContent } from "@/components/TrackingScripts";
import { trackCatalogPurchase } from "@/lib/metaPurchase";
import { DevelopedByHaqPlus } from "@/components/DevelopedByHaqPlus";
import { handleImageError } from "@/lib/imageFallback";

// ==== Theme ====
const PRIMARY = "#1b7a3e";
const ACCENT = "#c8ecd3";
const GREEN = "#2d7d0e";
const GOLD = "#ffc107";
const CTA_A = "#25a04f";
const CTA_B = "#14682f";
const SOFT_BG = "#f1fbf4";

const PRODUCT_ID = "47762a3d-37aa-425f-bc68-f306cfe233e6";
const PRODUCT_SKU = "VAG-1534";
const PHONE_NUMBER = "01805-080556";
// ==== Product Images (bundled in /public/cosmos for Cloudflare deploy) ====
const IMAGES: string[] = [
  "/pudina/pudina-hero.webp",
  "/pudina/pudina-hands.webp",
  "/pudina/pudina-packet.webp",
];

const HERO_IMG = IMAGES[0];

const FONT: React.CSSProperties = {
  fontFamily: "'Hind Siliguri','Anek Bangla',system-ui,sans-serif",
};

type Pkg = "one" | "two" | "three";
const PACKAGES: Record<Pkg, { qty: number; price: number; old: number; label: string; badge?: string; save: number; bonus?: string }> = {
  one: { qty: 1, price: 250, old: 320, label: "১ প্যাকেট হাইব্রিড পুদিনা বীজ", save: 70 },
  two: { qty: 2, price: 400, old: 640, label: "২ প্যাকেট হাইব্রিড পুদিনা বীজ", badge: "সবচেয়ে জনপ্রিয়", save: 240 },
  three: { qty: 3, price: 500, old: 960, label: "৩ প্যাকেট হাইব্রিড পুদিনা বীজ", save: 460, bonus: "সাথে ১ প্যাকেট ধনিয়া পাতা বীজ ফ্রি" },

};

const money = (n: number) => `${n}৳`;

// Scroll-reveal wrapper
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Floating petals
function Petals() {
  const petals = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((_, i) => {
        const left = (i * 7.3) % 100;
        const size = 10 + ((i * 3) % 14);
        const dur = 14 + (i % 6) * 2;
        const delay = (i % 8) * 1.2;
        const color = i % 3 === 0 ? PRIMARY : i % 3 === 1 ? ACCENT : GOLD;
        return (
          <span
            key={i}
            className="cosmos-petal"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              background: color,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

// Countdown to next midnight
function useMidnightCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = new Date(); end.setHours(24, 0, 0, 0);
  const diff = Math.max(0, end.getTime() - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

function FlipDigit({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div key={v} className="cosmos-flip rounded-xl px-3 py-2 md:px-4 md:py-3 text-2xl md:text-4xl font-extrabold min-w-[54px] md:min-w-[72px] text-center"
        style={{ background: "linear-gradient(180deg,#0d3d1c,#062510)", color: GOLD, boxShadow: `0 0 20px rgba(255,193,7,0.25)` }}>
        {v}
      </div>
      <span className="mt-1 text-[11px] md:text-xs font-semibold text-white/90">{label}</span>
    </div>
  );
}

// Hero image carousel — supports unlimited images with swipe, arrows & thumbnails
function HeroCarousel({ images }: { images: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(images.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setIdx(clamped);
  };

  // Auto-advance every 4s
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setIdx((prev) => {
        const next = (prev + 1) % images.length;
        const el = trackRef.current;
        if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
        return next;
      });
    }, 4000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div className="mt-6 mx-auto max-w-md md:max-w-3xl lg:max-w-4xl">
      <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ border: `3px solid ${PRIMARY}` }}>
        <div
          ref={trackRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIdx(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt={`পুদিনা পাতা ${i + 1}`}
              className="w-full h-64 md:h-[420px] lg:h-[500px] object-cover flex-shrink-0 snap-center"
              style={{ width: "100%" }}
              loading={i === 0 ? "eager" : "lazy"}
              onError={handleImageError}
            />
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button" aria-label="আগের ছবি"
              onClick={() => goTo(idx - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center shadow"
            >
              <ChevronLeft className="h-5 w-5" style={{ color: PRIMARY }} />
            </button>
            <button
              type="button" aria-label="পরের ছবি"
              onClick={() => goTo(idx + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center shadow"
            >
              <ChevronRight className="h-5 w-5" style={{ color: PRIMARY }} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`ছবি ${i + 1}`}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: idx === i ? 18 : 6,
                    background: idx === i ? "#fff" : "rgba(255,255,255,0.6)",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {images.map((src, i) => (
            <button
              key={src + "-thumb-" + i}
              onClick={() => goTo(i)}
              className="flex-shrink-0 rounded-lg overflow-hidden transition"
              style={{
                border: idx === i ? `2px solid ${PRIMARY}` : `2px solid transparent`,
                opacity: idx === i ? 1 : 0.65,
              }}
            >
              <img src={src} alt="" className="h-14 w-14 object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type Review = { name: string; city: string; text: string; rating: number };
function ReviewsSlider({ reviews }: { reviews: Review[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [drag, setDrag] = useState<{ startX: number; dx: number; w: number } | null>(null);

  useEffect(() => {
    if (paused || drag || reviews.length <= 1) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % reviews.length), 3500);
    return () => clearInterval(t);
  }, [paused, drag, reviews.length]);

  const go = (dir: -1 | 1) => {
    setIdx((p) => (p + dir + reviews.length) % reviews.length);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setPaused(true);
    setDrag({ startX: e.clientX, dx: 0, w: e.currentTarget.clientWidth });
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setDrag({ ...drag, dx: e.clientX - drag.startX });
  };
  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const threshold = Math.max(40, drag.w * 0.15);
    if (drag.dx <= -threshold) go(1);
    else if (drag.dx >= threshold) go(-1);
    setDrag(null);
    try { (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId); } catch {}
    setTimeout(() => setPaused(false), 400);
  };

  const dragOffset = drag ? (drag.dx / drag.w) * 100 : 0;

  return (
    <div
      className="relative mx-auto max-w-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="overflow-hidden rounded-2xl select-none touch-pan-y cursor-grab active:cursor-grabbing"
        style={{ background: SOFT_BG, border: `1px solid ${ACCENT}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div
          className={drag ? "flex" : "flex transition-transform duration-500 ease-out"}
          style={{ transform: `translateX(calc(-${idx * 100}% + ${dragOffset}%))` }}
        >
          {reviews.map((r, i) => (
            <div key={i} className="w-full flex-shrink-0 p-5 md:p-6 pointer-events-none">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" style={{ color: GOLD }} />
                ))}
              </div>
              <p className="text-sm md:text-base text-neutral-700 leading-relaxed">"{r.text}"</p>
              <div className="mt-3 text-sm font-bold" style={{ color: PRIMARY }}>— {r.name}</div>
              <div className="text-xs text-neutral-500">{r.city}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`রিভিউ ${i + 1}`}
            className="h-2 rounded-full transition-all"
            style={{
              width: idx === i ? 22 : 8,
              background: idx === i ? PRIMARY : ACCENT,
            }}
          />
        ))}
      </div>
    </div>
  );
}




export default function PudinaLanding() {
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Pkg>("two");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const icFired = useRef(false);
  const submitRef = useRef(false);
  const { h, m, s } = useMidnightCountdown();

  useEffect(() => {
    const id = "hind-siliguri-font";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  const current = PACKAGES[pkg];
  const unit = Math.round(current.price / current.qty);
  const total = current.price;

  const scrollToOrder = (e?: React.MouseEvent) => {
    e?.preventDefault();
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#order");
  };
  const scrollToOffers = (e?: React.MouseEvent) => {
    e?.preventDefault();
    document.getElementById("offers")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fireIC = () => {
    if (icFired.current) return;
    icFired.current = true;
    trackInitiateCheckout(total, current.qty);
  };

  const selectPkg = (p: Pkg) => {
    setPkg(p);
    trackAddToCart({ id: PRODUCT_ID, sku: PRODUCT_SKU }, PACKAGES[p].price);
  };

  // Meta Pixel ViewContent — landing page is a product page
  const vcFired = useRef(false);
  useEffect(() => {
    if (vcFired.current) return;
    vcFired.current = true;
    trackViewContent({ id: PRODUCT_ID, sku: PRODUCT_SKU, name: "হাইব্রিড পুদিনা পাতার বীজ" }, total);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitRef.current) return;
    submitRef.current = true;
    setTouched(true);
    const cleanPhone = phone.replace(/\D/g, "");
    const isValidPhone = /^01\d{9}$/.test(cleanPhone);
    if (!isValidPhone || !address.trim()) {
      toast.error("সঠিক ১১ ডিজিট মোবাইল নম্বর দিন (01...) এবং ঠিকানা লিখুন");
      submitRef.current = false;
      return;
    }
    setSubmitting(true);
    try {
      const heroUrl = `${window.location.origin}/pudina/pudina-hero.webp`;
      let validVisitorId = typeof window !== "undefined" ? localStorage.getItem("visitor-id") : null;
      if (validVisitorId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validVisitorId)) {
        validVisitorId = null;
      }
      const { data, error } = await (supabase.rpc as any)("place_landing_cosmos_order", {
        p_customer_name: name || "Customer",
        p_phone: cleanPhone,
        p_address: address.trim(),
        p_product_id: PRODUCT_ID,
        p_product_name: current.label,
        p_product_image: heroUrl,
        p_quantity: current.qty,
        p_unit_price: unit,
        p_note: `[Landing: pudina] ${current.label} — ${current.price}৳`,
        p_total_amount: total,
        p_visitor_id: validVisitorId,
        p_traffic_source: getTrafficSource() || "direct",
        p_discount: 0,
        p_delivery_charge: 0,
      });
      if (error) throw error;
      const order = data?.[0];
      const orderId = order?.order_id;

      if (!order?.id) throw new Error("অর্ডার তৈরি হয়নি");

      if (orderId) {
        try {
          sessionStorage.setItem("last-order-details", JSON.stringify({
            orderId,
            customerName: name || "Customer",
            phone: cleanPhone,
            address: address.trim(),
            items: [{ name: current.label, image: heroUrl, quantity: current.qty, price: unit, oldPrice: null }],
            subtotal: current.price,
            oldTotal: current.old,
            deliveryCharge: 0,
            grandTotal: total,
          }));
        } catch {}
        toast.success("অর্ডার নেওয়া হয়েছে! আমরা শীঘ্রই কল করব।");
        trackCatalogPurchase({
          orderId,
          value: total,
          phone: cleanPhone,
          customerName: name || "Customer",
          items: [{ sku: PRODUCT_SKU, quantity: current.qty, price: unit }],
        });
        navigate(`/order-confirmed/${orderId}`);
      }
    } catch (err: any) {
      toast.error(err.message || "অর্ডার করতে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
      submitRef.current = false;
    }
  };

  const benefits: { Icon: ComponentType<{ className?: string; style?: React.CSSProperties }>; title: string; desc: string }[] = [
    { Icon: Palette, title: "তীব্র সুগন্ধি জাত", desc: "হাইব্রিড পুদিনা — ঘন পাতা, দারুণ ঘ্রাণ" },
    { Icon: Sprout, title: "৯০%+ অঙ্কুরোদগম", desc: "উন্নত মানের পরিক্ষিত বীজ" },
    { Icon: Timer, title: "২৫–৩০ দিনে পাতা", desc: "বপনের ২৫–৩০ দিনেই পাতা তোলা যায়" },
    { Icon: Package, title: "৩০০+ বীজ প্রতি প্যাকেট", desc: "একবার লাগান, বার বার পাতা তুলুন" },
    { Icon: Home, title: "টব-ছাদ-বারান্দায় চাষযোগ্য", desc: "অল্প জায়গাতেই দারুণ ফলন" },
    { Icon: BookOpen, title: "সহজ চাষ পদ্ধতি", desc: "টবে বা জমিতে সহজেই চাষ করা যায়" },
  ];

  const reviews = [
    { name: "রাশেদা বেগম", city: "ঢাকা", text: "মাত্র ২৮ দিনেই টব ভরে পুদিনা! রান্নায় আর কিনতে হয় না।", rating: 5 },
    { name: "মাহবুব হাসান", city: "চট্টগ্রাম", text: "প্যাকেটে অনেক বীজ ছিল, বন্ধুদেরও দিয়েছি। প্রায় সব বীজেই চারা এসেছে। ধন্যবাদ Ss Seed Shop!", rating: 5 },
    { name: "সাবরিনা আক্তার", city: "রাজশাহী", text: "ডেলিভারি ফ্রি ছিল, ক্যাশ অন — খুবই নির্ভরযোগ্য সেবা।", rating: 5 },
  ];

  const steps = [
    { n: 1, t: "মাটি প্রস্তুতি", d: "দোআঁশ মাটি ও কম্পোস্ট মিশিয়ে টব/জমি প্রস্তুত করুন।" },
    { n: 2, t: "বীজ বপন", d: "১/৪ ইঞ্চি গভীরে বীজ ছড়িয়ে হালকা মাটি দিন।" },
    { n: 3, t: "নিয়মিত পানি", d: "প্রথম ৭ দিন হালকা পানি, এরপর মাটি শুকালে দিন।" },
    { n: 4, t: "পাতা সংগ্রহ", d: "২৫–৩০ দিনে গাছ থেকে সতেজ পুদিনা পাতা তুলুন।" },
  ];

  const faqs = [
    { q: "বীজ কতদিনে অঙ্কুরিত হয়?", a: "সঠিকভাবে বপন করলে ৫–৮ দিনের মধ্যে চারা গজায়।" },
    { q: "ডেলিভারি চার্জ কত?", a: "সারা বাংলাদেশে ফ্রি হোম ডেলিভারি — ক্যাশ অন ডেলিভারি সুবিধা।" },
    { q: "কতদিনে পাতা তোলা যাবে?", a: "বপনের ২৫–৩০ দিনের মধ্যে পাতা তোলা শুরু করা যায়।" },
    { q: "টব বা ছাদে চাষ করা যাবে?", a: "হ্যাঁ, ছোট টবেও দারুণ হয় — ছাদ, বারান্দা ও জমিতেও চাষযোগ্য।" },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 text-black" style={FONT}>
      <SEOHead
        title="হাইব্রিড পুদিনা পাতার বীজ — মাত্র ২৫০৳ | Ss Seed Shop"
        description="প্রিমিয়াম হাইব্রিড পুদিনা পাতার বীজ। ২৫–৩০ দিনেই ঘরে সতেজ পুদিনা। ৯০%+ অঙ্কুরোদগম, ফ্রি হোম ডেলিভারি সারা বাংলাদেশে।"
      />

      <style>{`
        @keyframes cosmosFadeUp { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
        @keyframes cosmosPulseWiggle {
          0%,100% { transform: scale(1) rotate(-2deg); box-shadow: 0 0 0 0 rgba(255,193,7,0.6); }
          50% { transform: scale(1.06) rotate(2deg); box-shadow: 0 0 0 16px rgba(255,193,7,0); }
        }
        @keyframes cosmosShine {
          0% { transform: translateX(-120%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
        @keyframes cosmosMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes cosmosStrike {
          from { width: 0; } to { width: 100%; }
        }
        @keyframes cosmosPetalFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: .85; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes cosmosSavePulse {
          0%,100% { transform: scale(1); } 50% { transform: scale(1.08); }
        }
        @keyframes cosmosFlipIn {
          0% { transform: rotateX(-90deg); opacity: 0; } 100% { transform: rotateX(0); opacity: 1; }
        }
        .cosmos-hero-title { animation: cosmosFadeUp .8s ease .1s both; }
        .cosmos-hero-sub { animation: cosmosFadeUp .8s ease .3s both; }
        .cosmos-hero-badge { animation: cosmosPulseWiggle 2.2s ease-in-out infinite; }
        .cosmos-cta { position: relative; overflow: hidden; }
        .cosmos-cta::after {
          content: ""; position: absolute; top: 0; left: 0; width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
          animation: cosmosShine 3s ease-in-out infinite;
        }
        .cosmos-marquee-track { display: inline-flex; gap: 3rem; animation: cosmosMarquee 22s linear infinite; }
        .cosmos-strike { position: relative; display: inline-block; }
        .cosmos-strike::before {
          content: ""; position: absolute; left: 0; top: 55%; height: 2px; background: ${CTA_A};
          animation: cosmosStrike 1.2s ease .3s both;
        }
        .cosmos-petal {
          position: absolute; top: -10vh; border-radius: 50% 0 50% 50%;
          opacity: .8; transform: rotate(0deg);
          animation-name: cosmosPetalFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .cosmos-save-pulse { animation: cosmosSavePulse 1.6s ease-in-out infinite; }
        .cosmos-flip { animation: cosmosFlipIn .5s ease; transform-origin: 50% 0; }
        .cosmos-lift { transition: transform .3s ease, box-shadow .3s ease; }
        .cosmos-lift:hover { transform: translateY(-6px); box-shadow: 0 12px 32px -8px rgba(27,122,62,0.35); }
        .cosmos-ribbon-shine { position: relative; overflow: hidden; }
        .cosmos-ribbon-shine::after {
          content: ""; position: absolute; top: 0; left: -50%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent);
          animation: cosmosShine 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* ==== FLASH OFFER BAR (sticky) ==== */}
      <div className="sticky top-0 z-40 text-white overflow-hidden" style={{ background: PRIMARY }}>
        <div className="py-2 whitespace-nowrap">
          <div className="cosmos-marquee-track text-sm md:text-base font-bold px-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="inline-flex items-center gap-8">
                <span className="inline-flex items-center gap-1.5"><Flame className="h-4 w-4" /> আজকের অফার: ১ প্যাকেট ২৫০৳</span>
                <span>| ২ প্যাকেট মাত্র ৪০০৳</span>
                <span>| ৩ প্যাকেট ৫০০৳ + ১ প্যাকেট ধনিয়া পাতা বীজ ফ্রি</span>

                <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4" /> ফ্রি ডেলিভারি সারা বাংলাদেশে!</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ==== 1. HERO ==== */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${ACCENT} 0%, #ffffff 60%)` }}>
        <Petals />
        <div className="relative mx-auto w-full max-w-5xl px-4 pt-8 pb-10 text-center">
          <h1 className="cosmos-hero-title font-extrabold leading-snug text-2xl md:text-4xl inline-flex items-center justify-center flex-wrap gap-2" style={{ color: "#0d3d1c" }}>
            <Leaf className="h-7 w-7 md:h-9 md:w-9" style={{ color: PRIMARY }} />
            <span>হাইব্রিড পুদিনা পাতার বীজ — টবেই সারা বছর সতেজ পুদিনা!</span>
          </h1>
          <p className="cosmos-hero-sub mt-3 text-base md:text-lg font-semibold text-neutral-700">
            ছাদ, বারান্দা বা রান্নাঘরের জানালায় ২৫–৩০ দিনেই পাতা তোলা শুরু।
          </p>

          <div className="mt-5 flex justify-center">
            <span className="cosmos-hero-badge inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm md:text-base font-extrabold"
              style={{ background: GOLD, color: "#0d3d1c", boxShadow: "0 6px 20px -4px rgba(255,193,7,0.6)" }}>
              <PartyPopper className="h-4 w-4" /> ৩২% ছাড় — আজকের জন্য!
            </span>
          </div>

          <HeroCarousel images={IMAGES} />

          <div className="mt-6">
            <a href="#order" onClick={scrollToOrder}
              className="cosmos-cta inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base md:text-lg font-extrabold text-white"
              style={{ background: `linear-gradient(90deg, ${CTA_A}, ${CTA_B})`, boxShadow: `0 8px 24px -6px ${CTA_A}` }}>
              <ShoppingCart className="h-5 w-5" /> এখনই অর্ডার করুন
            </a>
          </div>
        </div>
      </section>

      {/* ==== 3. COUNTDOWN ==== */}
      <Reveal>
        <section className="py-8" style={{ background: SOFT_BG }}>
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="rounded-2xl px-4 py-6 md:py-8" style={{ background: `linear-gradient(135deg, ${CTA_B}, #0d3d1c)` }}>
              <p className="text-white font-bold text-base md:text-lg inline-flex items-center gap-2"><Clock className="h-5 w-5" /> অফার শেষ হতে বাকি</p>
              <div className="mt-4 flex justify-center gap-3 md:gap-5">
                <FlipDigit value={h} label="ঘণ্টা" />
                <FlipDigit value={m} label="মিনিট" />
                <FlipDigit value={s} label="সেকেন্ড" />
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ==== 4. BENEFITS ==== */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal>
            <h2 className="text-center font-extrabold text-2xl md:text-3xl mb-8" style={{ color: PRIMARY }}>
              কেন এই পুদিনা বীজ কিনবেন?
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {benefits.map((b, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="cosmos-lift h-full rounded-2xl p-4 md:p-5 bg-white text-center"
                  style={{ border: `2px solid ${ACCENT}`, background: `linear-gradient(180deg,#fff,${SOFT_BG})` }}>
                  <div className="mb-2 flex justify-center">
                    <span className="inline-flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full" style={{ background: PRIMARY }}>
                      <b.Icon className="h-6 w-6 md:h-7 md:w-7" style={{ color: "#fff" }} />
                    </span>
                  </div>
                  <div className="font-extrabold text-sm md:text-base" style={{ color: PRIMARY }}>{b.title}</div>
                  <div className="mt-1 pb-1 text-xs md:text-sm leading-relaxed text-neutral-600 break-words">{b.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==== 5. OFFER PACKAGES ==== */}
      <section id="offers" className="py-10" style={{ background: SOFT_BG }}>
        <div className="mx-auto max-w-5xl px-4">
          <Reveal>
            <h2 className="text-center font-extrabold text-2xl md:text-3xl mb-2 inline-flex items-center justify-center gap-2 w-full" style={{ color: PRIMARY }}>
              <Gift className="h-6 w-6 md:h-7 md:w-7" /> প্যাকেজ বাছাই করুন
            </h2>
            <p className="text-center text-sm md:text-base text-neutral-600 mb-8">
              বেশি প্যাকেট = বেশি সাশ্রয়! সীমিত সময়ের জন্য।
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
            {(Object.keys(PACKAGES) as Pkg[]).map((key, i) => {
              const p = PACKAGES[key];
              const active = pkg === key;
              const isPopular = key === "two";
              return (
                <Reveal key={key} delay={i * 120}>
                  <div
                    className={`cosmos-lift relative rounded-3xl bg-white p-5 md:p-6 text-center h-full flex flex-col ${isPopular ? "md:scale-105" : ""}`}
                    style={{
                      border: active ? `3px solid ${PRIMARY}` : `2px solid ${ACCENT}`,
                      boxShadow: isPopular ? `0 20px 40px -10px rgba(27,122,62,0.35)` : `0 6px 20px -8px rgba(27,122,62,0.15)`,
                    }}
                  >
                    {isPopular && (
                      <div className="cosmos-ribbon-shine absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-extrabold whitespace-nowrap inline-flex items-center gap-1"
                        style={{ background: `linear-gradient(90deg,${GOLD},#ffb300)`, color: "#0d3d1c", boxShadow: `0 4px 12px -2px rgba(255,193,7,0.6)` }}>
                        <Star className="h-3 w-3 fill-current" /> {p.badge}
                      </div>
                    )}
                    <div className="mt-2 text-lg md:text-xl font-extrabold" style={{ color: PRIMARY }}>{p.label}</div>
                    <div className="mt-3">
                      <div className="cosmos-strike inline-block text-neutral-500 text-lg">{money(p.old)}</div>
                      <div className="mt-1 text-4xl md:text-5xl font-extrabold" style={{ color: CTA_B }}>{money(p.price)}</div>
                    </div>
                    <div className="mt-2 flex justify-center">
                      <span className="cosmos-save-pulse inline-block rounded-full px-3 py-1 text-xs font-extrabold"
                        style={{ background: GOLD, color: "#0d3d1c" }}>
                        {p.save}৳ সাশ্রয়!
                      </span>
                    </div>
                    <ul className="mt-4 space-y-1.5 text-sm text-neutral-700 text-left mx-auto max-w-[220px]">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: GREEN }} /> {p.qty * 300}+ বীজ</li>
                      {p.bonus && (
                        <li className="flex items-center gap-2 font-extrabold" style={{ color: CTA_B }}>
                          <Gift className="h-4 w-4" /> {p.bonus}
                        </li>
                      )}
                      <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: GREEN }} /> ফ্রি ডেলিভারি</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: GREEN }} /> ক্যাশ অন ডেলিভারি</li>
                    </ul>

                    <button
                      onClick={() => { selectPkg(key); scrollToOrder(); }}
                      className="cosmos-cta mt-5 w-full rounded-full px-5 py-3 text-sm md:text-base font-extrabold text-white inline-flex items-center justify-center gap-2"
                      style={{ background: active ? `linear-gradient(90deg,${CTA_A},${CTA_B})` : `linear-gradient(90deg,${PRIMARY},${CTA_B})` }}
                    >
                      {active ? <><BadgeCheck className="h-4 w-4" /> নির্বাচিত — অর্ডার করুন</> : "এই প্যাকেজ নিন"}
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==== 6. SOCIAL PROOF ==== */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal>
            <h2 className="text-center font-extrabold text-2xl md:text-3xl mb-8 inline-flex items-center justify-center gap-2 w-full" style={{ color: PRIMARY }}>
              <MessageCircle className="h-6 w-6 md:h-7 md:w-7" /> কাস্টমার রিভিউ
            </h2>
          </Reveal>
          <ReviewsSlider reviews={reviews} />
        </div>
      </section>

      {/* ==== 7. HOW TO GROW ==== */}
      <section className="py-10" style={{ background: SOFT_BG }}>
        <div className="mx-auto max-w-4xl px-4">
          <Reveal>
            <h2 className="text-center font-extrabold text-2xl md:text-3xl mb-8 inline-flex items-center justify-center gap-2 w-full" style={{ color: PRIMARY }}>
              <Sprout className="h-6 w-6 md:h-7 md:w-7" /> কীভাবে চাষ করবেন
            </h2>
          </Reveal>
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-0.5" style={{ background: `repeating-linear-gradient(90deg, ${PRIMARY} 0 8px, transparent 8px 16px)` }} />
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 150}>
                <div className="relative bg-white rounded-2xl p-4 text-center h-full" style={{ border: `2px solid ${ACCENT}` }}>
                  <div className="mx-auto -mt-8 mb-2 flex h-12 w-12 items-center justify-center rounded-full text-white font-extrabold text-lg"
                    style={{ background: `linear-gradient(135deg,${PRIMARY},${CTA_B})`, boxShadow: `0 6px 16px -4px ${PRIMARY}` }}>
                    {s.n}
                  </div>
                  <div className="font-extrabold text-sm md:text-base" style={{ color: PRIMARY }}>{s.t}</div>
                  <div className="mt-1 text-xs md:text-sm text-neutral-600">{s.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==== 8. ORDER FORM ==== */}
      <section id="order" className="py-10 bg-white">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <div className="rounded-3xl p-5 md:p-8 shadow-xl" style={{ background: "#fff", border: `2px solid ${PRIMARY}`, boxShadow: `0 20px 60px -20px rgba(27,122,62,0.4)` }}>
              <h2 className="text-center font-extrabold text-xl md:text-2xl mb-5 inline-flex items-center justify-center gap-2 w-full" style={{ color: PRIMARY }}>
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" /> অর্ডার কনফার্ম করুন
              </h2>

              {/* Package selector synced */}
              <div className="mb-5">
                <div className="text-sm font-bold text-black mb-2">প্যাকেজ নির্বাচন করুন</div>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(PACKAGES) as Pkg[]).map((key) => {
                    const p = PACKAGES[key];
                    const active = pkg === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => selectPkg(key)}
                        className={`rounded-xl p-3 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${active ? "scale-[1.03] shadow-lg animate-scale-in" : ""}`}
                        style={{
                          border: active ? `2px solid ${PRIMARY}` : `1px solid #e5e5e5`,
                          background: active ? SOFT_BG : "#fff",
                        }}
                      >
                        <div className="text-xs font-bold text-black">{p.label}</div>
                        <div className="mt-1 text-sm">
                          <span className="text-neutral-400 line-through mr-1.5">{money(p.old)}</span>
                          <span className="font-extrabold" style={{ color: CTA_B }}>{money(p.price)}</span>
                        </div>
                      </button>

                    );
                  })}
                </div>
              </div>

              <form onSubmit={onSubmit} onFocus={fireIC} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">আপনার নাম</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="নাম লিখুন"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none bg-white"
                    style={{ border: `2px solid ${ACCENT}` }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">১১ সংখ্যার মোবাইল নম্বর *</label>
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none bg-white"
                    style={{ border: `2px solid ${touched && !phone ? CTA_A : ACCENT}` }}
                  />
                  {touched && !phone && <p className="mt-1 text-xs" style={{ color: CTA_A }}>মোবাইল নম্বর দিন</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">সম্পূর্ণ ঠিকানা *</label>
                  <textarea
                    value={address} onChange={(e) => setAddress(e.target.value)} rows={3}
                    placeholder="গ্রাম/বাসা, থানা, জেলা"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none bg-white"
                    style={{ border: `2px solid ${touched && !address ? CTA_A : ACCENT}` }}
                  />
                  {touched && !address && <p className="mt-1 text-xs" style={{ color: CTA_A }}>ঠিকানা দিন</p>}
                </div>

                <div className="rounded-xl p-4" style={{ background: SOFT_BG, border: `1px dashed ${PRIMARY}` }}>
                  <div className="flex justify-between text-sm text-black">
                    <span>{current.label} × {current.qty}</span>
                    <span className="font-semibold">{money(current.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-black mt-1">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="font-semibold" style={{ color: GREEN }}>ফ্রি</span>
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-extrabold text-base" style={{ borderColor: ACCENT }}>
                    <span>মোট</span>
                    <span key={total} style={{ color: CTA_B, animation: "cosmosFadeUp .3s ease" }}>{money(total)}</span>
                  </div>
                </div>

                <div className="rounded-xl p-3 text-sm text-black inline-flex items-center gap-2 w-full" style={{ background: "#fff8ec", border: `1px solid ${GOLD}` }}>
                  <Wallet className="h-4 w-4 shrink-0" style={{ color: "#c17c00" }} /> <span><b>ক্যাশ অন ডেলিভারি</b> — পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।</span>
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="cosmos-cta w-full rounded-xl px-5 py-4 text-base md:text-lg font-extrabold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: `linear-gradient(90deg,${CTA_A},${CTA_B})`, boxShadow: `0 10px 30px -8px ${CTA_A}` }}
                >
                  <Lock className="h-5 w-5" />
                  {submitting ? "অর্ডার হচ্ছে..." : `অর্ডার কনফার্ম করুন — ${money(total)}`}
                </button>
                <p className="text-center text-xs text-neutral-500">অর্ডার করার পর আমরা ফোনে যোগাযোগ করে কনফার্ম করব।</p>
              </form>
            </div>
          </Reveal>

          <div className="mt-6 text-center">
            <a href={`tel:${PHONE_NUMBER.replace(/-/g, "")}`}
              className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: PRIMARY }}>
              <Phone className="h-4 w-4" /> সাহায্যের জন্য কল করুন: {PHONE_NUMBER}
            </a>
          </div>
        </div>
      </section>

      {/* ==== 9. FAQ ==== */}
      <section className="pt-8 pb-5" style={{ background: SOFT_BG }}>
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <h2 className="text-center font-extrabold text-2xl md:text-3xl mb-6 inline-flex items-center justify-center gap-2 w-full" style={{ color: PRIMARY }}>
              <HelpCircle className="h-6 w-6 md:h-7 md:w-7" /> প্রশ্নোত্তর
            </h2>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="rounded-xl bg-white overflow-hidden" style={{ border: `1px solid ${ACCENT}` }}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-sm md:text-base font-bold"
                    style={{ color: PRIMARY }}
                  >
                    {f.q}
                    <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    className="px-4 text-sm text-neutral-700 overflow-hidden transition-all"
                    style={{ maxHeight: open ? 200 : 0, paddingBottom: open ? 14 : 0, paddingTop: 0 }}
                  >
                    {f.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t pt-4 pb-20 md:pb-4 text-center text-xs text-neutral-600 bg-white flex flex-col items-center justify-center gap-2">
        <p>© {new Date().getFullYear()} Ss Seed Shop. সর্বস্বত্ব সংরক্ষিত।</p>
        <DevelopedByHaqPlus siteName="Ss Seed Shop" theme="light" />
      </footer>

      {/* ==== 10. STICKY BOTTOM BAR (mobile) ==== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white md:hidden" style={{ boxShadow: "0 -4px 20px -6px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <div className="min-w-0">
            <div className="truncate text-xs font-bold text-black">হাইব্রিড পুদিনা বীজ</div>
            <div className="text-xs">
              <span className="mr-1.5 text-neutral-400 line-through">{money(current.old)}</span>
              <span className="font-extrabold" style={{ color: CTA_B }}>{money(current.price)}</span>
            </div>
          </div>
          <a href="#order" onClick={scrollToOrder}
            className="cosmos-cta inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-extrabold text-white"
            style={{ background: `linear-gradient(90deg,${CTA_A},${CTA_B})` }}>
            <ShoppingCart className="h-4 w-4" /> অর্ডার করুন
          </a>
        </div>
      </div>
    </div>
  );
}
