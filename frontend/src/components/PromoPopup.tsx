import { API_URL } from "@/config/env";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Gift, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { handleImageError, PLACEHOLDER_IMAGE } from "@/lib/imageFallback";

interface PromoRow {
  id: string;
  title: string;
  subtitle: string | null;
  badge_text: string | null;
  image_url: string | null;
  button_text: string;
  link_url: string;
  delay_seconds: number;
  show_once: boolean;
  start_at: string | null;
  end_at: string | null;
  buy_product_id: string | null;
  free_product_id: string | null;
  free_note: string | null;
}

interface MiniProduct {
  id: string;
  name: string | null;
  slug: string | null;
  offer_price: number | null;
  regular_price: number | null;
  product_image: string | null;
}

const SEEN_KEY = "promo_popup_seen";

export default function PromoPopup() {
  const location = useLocation();
  const navigate = useNavigate();
  const [promo, setPromo] = useState<PromoRow | null>(null);
  const [buyProduct, setBuyProduct] = useState<MiniProduct | null>(null);
  const [freeProduct, setFreeProduct] = useState<MiniProduct | null>(null);
  const [open, setOpen] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();


  const hidden =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/order-confirmed");

  useEffect(() => {
    if (hidden) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    (async () => {
      let data: any[] = [];
      try {
        const url = API_URL;
        const res = await fetch(`${url}/settings/get.php?key=promo_popups`);
        if (res.ok) {
          const json = await res.json();
          if (json?.value) {
            const parsed = JSON.parse(json.value);
            if (Array.isArray(parsed)) data = parsed.filter((p) => p.is_active);
          }
        }
      } catch {}

      if (cancelled || !data?.length) return;

      const now = Date.now();
      const row = (data as PromoRow[]).find((r) => {
        if (r.start_at && new Date(r.start_at).getTime() > now) return false;
        if (r.end_at && new Date(r.end_at).getTime() < now) return false;
        if (r.show_once && sessionStorage.getItem(`${SEEN_KEY}:${r.id}`)) return false;
        return true;
      });
      if (!row) return;

      const ids = [row.buy_product_id, row.free_product_id].filter(Boolean) as string[];
      if (ids.length) {
        const url = API_URL;
        const res = await fetch(`${url}/products/get.php`);
        const allProducts = await res.json();
        const prods = allProducts.filter((p: any) => ids.includes(p.id));
        if (!cancelled && prods) {
          const list = prods as MiniProduct[];
          setBuyProduct(list.find((p) => p.id === row.buy_product_id) || null);
          setFreeProduct(list.find((p) => p.id === row.free_product_id) || null);
        }
      }

      if (cancelled) return;
      setPromo(row);
      timer = setTimeout(() => {
        if (cancelled) return;
        setOpen(true);
        if (row.show_once) sessionStorage.setItem(`${SEEN_KEY}:${row.id}`, "1");
      }, Math.max(0, (row.delay_seconds ?? 3) * 1000));
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Load once per session start (not on every route change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!promo || !open || hidden) return null;



  const go = () => {
    setOpen(false);
    // If a buy product is configured, add it to cart (with its set price) and go straight to checkout
    if (buyProduct) {
      addItem({
        id: buyProduct.id,
        name: buyProduct.name || "",
        price: buyProduct.offer_price ?? buyProduct.regular_price ?? 0,
        oldPrice:
          buyProduct.offer_price != null && buyProduct.regular_price != null && buyProduct.regular_price > buyProduct.offer_price
            ? buyProduct.regular_price
            : null,
        image: buyProduct.product_image || PLACEHOLDER_IMAGE,
        variationId: null,
        variationName: null,
      });
      if (freeProduct) {
        // Free gift goes to cart at ৳0 alongside the buy product
        addItem({
          id: freeProduct.id,
          name: `${freeProduct.name || ""} (ফ্রি উপহার)`,
          price: 0,
          oldPrice: freeProduct.offer_price ?? freeProduct.regular_price ?? null,
          image: freeProduct.product_image || PLACEHOLDER_IMAGE,
          variationId: null,
          variationName: "ফ্রি",
          isFreeGift: true,
        });
        toast({
          title: "অভিনন্দন!",
          description: `${freeProduct.name || "ফ্রি প্রোডাক্ট"} অর্ডারের সাথে একদম ফ্রি পাচ্ছেন!`,
        });
      }
      navigate("/checkout");
      return;
    }
    const url = promo.link_url?.trim() || "/";
    if (/^https?:\/\//i.test(url)) {
      window.location.href = url;
    } else {
      navigate(url.startsWith("/") ? url : `/${url}`);
    }
  };

  const heroImage = promo.image_url || buyProduct?.product_image || null;
  const buyPrice = buyProduct?.offer_price ?? buyProduct?.regular_price ?? null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-card border border-border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {heroImage && !buyProduct && (
          <button onClick={go} className="block w-full aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={heroImage}
              alt={promo.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </button>
        )}

        {buyProduct && (
          <div className="p-3 pt-10 bg-primary/5">
            <div className="flex items-center gap-2">
              <button onClick={go} className="flex-1 min-w-0 text-left">
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-border">
                  <img
                    src={promo.image_url || buyProduct.product_image || PLACEHOLDER_IMAGE}
                    alt={buyProduct.name || ""}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
                <p className="mt-1.5 text-[12px] font-semibold text-foreground line-clamp-2">{buyProduct.name}</p>
                {buyPrice != null && (
                  <p className="text-[12px] font-bold text-primary">৳{buyPrice}</p>
                )}
              </button>

              {freeProduct && (
                <>
                  <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0 relative">
                    <div className="aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-dashed border-primary/50">
                      <img
                        src={freeProduct.product_image || PLACEHOLDER_IMAGE}
                        alt={freeProduct.name || ""}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1">
                      <Gift className="w-3 h-3" /> ফ্রি
                    </span>
                    <p className="mt-1.5 text-[12px] font-semibold text-foreground line-clamp-2">{freeProduct.name}</p>
                    <p className="text-[12px] font-bold text-primary">{promo.free_note || "একদম ফ্রি"}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="p-4 text-center">
          {promo.badge_text && (
            <span className="inline-block mb-2 px-2.5 py-1 rounded-full bg-primary/12 text-primary text-[11px] font-bold">
              {promo.badge_text}
            </span>
          )}
          {promo.title && (
            <h3 className="font-display font-bold text-[17px] text-foreground leading-snug mb-1">{promo.title}</h3>
          )}
          {promo.subtitle && (
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 whitespace-pre-line">{promo.subtitle}</p>
          )}
          <button
            onClick={go}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground font-bold text-[15px] shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            {promo.button_text}
          </button>
        </div>
      </div>
    </div>
  );
}
