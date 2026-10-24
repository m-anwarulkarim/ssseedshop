import { API_URL } from "@/config/env";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Sparkles, Save } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { handleImageError, resolveImageUrl } from "@/lib/imageFallback";

const API_BASE = API_URL;

interface PromoRow {
  id: string;
  title: string;
  subtitle: string | null;
  badge_text: string | null;
  image_url: string | null;
  button_text: string;
  link_url: string;
  delay_seconds: number;
  is_active: boolean;
  show_once: boolean;
  start_at: string | null;
  end_at: string | null;
  sort_order: number;
  buy_product_id: string | null;
  free_product_id: string | null;
  free_note: string | null;
}

interface MiniProduct {
  id: string;
  name: string;
  slug: string;
}

const toLocalInput = (v: string | null) => (v ? new Date(v).toISOString().slice(0, 16) : "");

export default function PromoPopupSettings() {
  const { t } = useLanguage();
  const [rows, setRows] = useState<PromoRow[]>([]);
  const [products, setProducts] = useState<MiniProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const [settingsRes, prodsRes] = await Promise.all([
        fetch(`${API_BASE}/settings/get.php?key=promo_popups`),
        fetch(`${API_BASE}/products/get.php`),
      ]);
      const settingItem = await settingsRes.json();
      const prods = await prodsRes.json();

      let popupsList: PromoRow[] = [];
      if (settingItem?.value) {
        try {
          popupsList = typeof settingItem.value === "string" ? JSON.parse(settingItem.value) : settingItem.value;
        } catch {
          popupsList = [];
        }
      }

      setRows(Array.isArray(popupsList) ? popupsList : []);
      setProducts(
        (Array.isArray(prods) ? prods : [])
          .filter((p: any) => p && p.id && p.name)
          .map((p: any) => ({ id: String(p.id), name: String(p.name), slug: p.slug || "" }))
      );
    } catch (e: any) {
      console.error("Error loading promo popup settings:", e);
      toast.error(t("সেটিংস লোড ব্যর্থ", "Failed loading settings"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const patch = (id: string, key: keyof PromoRow, value: any) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const addNew = async () => {
    const newRow: PromoRow = {
      id: "promo_" + Date.now().toString(36),
      title: t("বিশেষ অফার!", "Special offer!"),
      subtitle: t("এই পণ্যটি কিনলে সাথে ফ্রি উপহার পাচ্ছেন।", "Buy this product and get a free gift."),
      badge_text: t("ফ্রি অফার", "Free offer"),
      button_text: t("অর্ডার করুন", "Order now"),
      link_url: "/all-products",
      delay_seconds: 3,
      is_active: false,
      show_once: true,
      start_at: null,
      end_at: null,
      sort_order: 0,
      buy_product_id: null,
      free_product_id: null,
      free_note: null,
      image_url: null,
    };
    const updated = [newRow, ...rows];
    setRows(updated);
    try {
      await fetch(`${API_BASE}/settings/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "promo_popups", value: JSON.stringify(updated) }),
      });
      toast.success(t("নতুন অফার পপআপ তৈরি হয়েছে", "New promo popup added"));
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const save = async (row: PromoRow) => {
    setSavingId(row.id);
    const updated = rows.map((r) => (r.id === row.id ? row : r));
    try {
      const res = await fetch(`${API_BASE}/settings/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "promo_popups", value: JSON.stringify(updated) }),
      });
      const result = await res.json();
      if (!result.success && result.status !== "success") throw new Error(result.error || "Save failed");
      toast.success(t("সেভ হয়েছে", "Saved"));
    } catch (err: any) {
      toast.error(err.message || t("সেভ ব্যর্থ হয়েছে", "Save failed"));
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: string) => {
    const updated = rows.filter((r) => r.id !== id);
    setRows(updated);
    try {
      await fetch(`${API_BASE}/settings/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "promo_popups", value: JSON.stringify(updated) }),
      });
      toast.success(t("মুছে ফেলা হয়েছে", "Deleted"));
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 space-y-4 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t("অফার পপআপ", "Offer Popup")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("ভিজিটর সাইটে আসার কিছু সেকেন্ড পরে এই পপআপ দেখবে।", "Visitors see this popup a few seconds after arriving.")}
          </p>
        </div>
        <Button id="btn-add-new-popup" onClick={addNew} size="sm"><Plus className="w-4 h-4 mr-1" />{t("নতুন", "New")}</Button>
      </div>

      {rows.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
          {t("এখনো কোনো পপআপ নেই। 'নতুন' চাপুন।", "No popup yet. Click 'New'.")}
        </CardContent></Card>
      )}

      {rows.map((row) => (
        <Card key={row.id}>
          <CardHeader className="pb-3 flex-row items-center justify-between gap-3">
            <CardTitle className="text-sm truncate">{row.title || t("শিরোনামহীন", "Untitled")}</CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">{row.is_active ? t("চালু", "Active") : t("বন্ধ", "Off")}</span>
              <Switch checked={row.is_active} onCheckedChange={(v) => patch(row.id, "is_active", v)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("ব্যাজ লেখা", "Badge text")}</Label>
                <Input value={row.badge_text || ""} onChange={(e) => patch(row.id, "badge_text", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("শিরোনাম", "Title")}</Label>
                <Input value={row.title} onChange={(e) => patch(row.id, "title", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t("বিবরণ", "Description")}</Label>
              <Textarea rows={2} value={row.subtitle || ""} onChange={(e) => patch(row.id, "subtitle", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t("ছবির লিংক", "Image URL")}</Label>
              <Input placeholder="https://..." value={row.image_url || ""} onChange={(e) => patch(row.id, "image_url", e.target.value)} />
              {row.image_url && (
                <img src={resolveImageUrl(row.image_url)} alt="" className="mt-1.5 w-28 h-20 object-cover rounded-lg border border-border"
                  onError={handleImageError} />
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-muted/40 p-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("কোন পণ্য কিনলে", "Buy this product")}</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={row.buy_product_id || ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    patch(row.id, "buy_product_id", id || null);
                    const p = products.find((x) => x.id === id);
                    if (p?.slug) patch(row.id, "link_url", `/product/${p.slug}`);
                  }}
                >
                  <option value="">{t("নির্বাচন করুন", "Select")}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("কোন পণ্য ফ্রি পাবে", "Free product")}</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={row.free_product_id || ""}
                  onChange={(e) => patch(row.id, "free_product_id", e.target.value || null)}
                >
                  <option value="">{t("নির্বাচন করুন", "Select")}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">{t("ফ্রি অফারের লেখা (যেমন: একদম ফ্রি / মাত্র ১০ টাকায়)", "Free offer note (e.g. Absolutely free)")}</Label>
                <Input value={row.free_note || ""} onChange={(e) => patch(row.id, "free_note", e.target.value)} placeholder={t("একদম ফ্রি", "Absolutely free")} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("বাটনের লেখা", "Button text")}</Label>
                <Input value={row.button_text} onChange={(e) => patch(row.id, "button_text", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("বাটনের লিংক (যেমন /product/slug)", "Button link (e.g. /product/slug)")}</Label>
                <Input value={row.link_url} onChange={(e) => patch(row.id, "link_url", e.target.value)} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("কত সেকেন্ড পরে", "Delay (seconds)")}</Label>
                <Input type="number" min={0} max={120} value={row.delay_seconds}
                  onChange={(e) => patch(row.id, "delay_seconds", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("শুরুর সময় (ঐচ্ছিক)", "Start time (optional)")}</Label>
                <Input type="datetime-local" value={toLocalInput(row.start_at)}
                  onChange={(e) => patch(row.id, "start_at", e.target.value ? new Date(e.target.value).toISOString() : null)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("শেষের সময় (ঐচ্ছিক)", "End time (optional)")}</Label>
                <Input type="datetime-local" value={toLocalInput(row.end_at)}
                  onChange={(e) => patch(row.id, "end_at", e.target.value ? new Date(e.target.value).toISOString() : null)} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch checked={row.show_once} onCheckedChange={(v) => patch(row.id, "show_once", v)} />
                {t("প্রতি ভিজিটে একবারই দেখাবে", "Show once per visit")}
              </label>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(row.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => save(row)} disabled={savingId === row.id}>
                  {savingId === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                  {t("সেভ", "Save")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
