import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Gift, Loader2, Plus, Save, Trash2 } from "lucide-react";
import {
  FREE_GIFT_SETTINGS_KEY,
  FreeGiftConfig,
  FreeGiftTier,
  EMPTY_FREE_GIFT_CONFIG,
  fetchFreeGiftConfig,
} from "@/lib/freeGiftOffer";

interface MiniProduct {
  id: string;
  name: string;
  product_image: string | null;
}

export default function FreeGiftSettings() {
  const qc = useQueryClient();
  const [config, setConfig] = useState<FreeGiftConfig>(EMPTY_FREE_GIFT_CONFIG);
  const [products, setProducts] = useState<MiniProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [cfg, { data: prods }] = await Promise.all([
        fetchFreeGiftConfig(),
        supabase
          .from("products_public")
          .select("id, name, product_image")
          .eq("is_hidden", false)
          .order("name", { ascending: true }),
      ]);
      setConfig(cfg);
      setProducts(
        ((prods || []) as { id: string | null; name: string | null; product_image: string | null }[])
          .filter((p) => p.id && p.name)
          .map((p) => ({ id: p.id as string, name: p.name as string, product_image: p.product_image }))
      );
      setLoading(false);
    })();
  }, []);

  const patchTier = (i: number, patch: Partial<FreeGiftTier>) => {
    setConfig((prev) => ({
      ...prev,
      tiers: prev.tiers.map((tr, idx) => (idx === i ? { ...tr, ...patch } : tr)),
    }));
  };

  const addTier = () =>
    setConfig((prev) => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        { minAmount: 1000, productId: "", productName: "", productImage: null, note: "" },
      ],
    }));

  const removeTier = (i: number) =>
    setConfig((prev) => ({ ...prev, tiers: prev.tiers.filter((_, idx) => idx !== i) }));

  const save = async () => {
    const invalid = config.tiers.find((tr) => !tr.productId || tr.minAmount <= 0);
    if (invalid) {
      toast.error("প্রতিটি শর্তে টাকার পরিমাণ ও পণ্য নির্বাচন করতে হবে");
      return;
    }
    setSaving(true);
    const payload: FreeGiftConfig = {
      enabled: config.enabled,
      tiers: [...config.tiers].sort((a, b) => a.minAmount - b.minAmount),
    };
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: FREE_GIFT_SETTINGS_KEY, value: JSON.stringify(payload) }, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast.error("সেভ ব্যর্থ হয়েছে");
      return;
    }
    setConfig(payload);
    qc.invalidateQueries({ queryKey: ["free-gift-offer"] });
    toast.success("সেভ হয়েছে");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Gift className="w-5 h-5 text-emerald-600" /> ফ্রি পণ্য অফার
        </h1>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          সেভ করুন
        </Button>
      </div>

      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">অফার চালু</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            নির্দিষ্ট টাকার বেশি অর্ডার করলে কার্টে নিজে থেকেই ফ্রি পণ্য যোগ হবে।
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(v) => setConfig((p) => ({ ...p, enabled: v }))}
        />
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">শর্ত ও ফ্রি পণ্য</h2>
          <Button size="sm" variant="outline" onClick={addTier}>
            <Plus className="w-4 h-4 mr-1" /> নতুন শর্ত
          </Button>
        </div>

        {config.tiers.length === 0 && (
          <p className="text-xs text-muted-foreground">এখনো কোনো শর্ত যোগ করা হয়নি।</p>
        )}

        {config.tiers.map((tier, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
              <Button size="sm" variant="ghost" onClick={() => removeTier(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="text-xs">সর্বনিম্ন অর্ডার (৳)</Label>
                <Input
                  type="number"
                  min={1}
                  value={tier.minAmount}
                  onChange={(e) => patchTier(i, { minAmount: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-xs">ফ্রি পণ্য</Label>
                <Select
                  value={tier.productId || undefined}
                  onValueChange={(val) => {
                    const p = products.find((pr) => pr.id === val);
                    patchTier(i, {
                      productId: val,
                      productName: p?.name || "",
                      productImage: p?.product_image || null,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="পণ্য নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">কাস্টম নোট (ঐচ্ছিক)</Label>
              <Input
                placeholder="যেমন: ১টি ধনিয়া পাতার বীজ প্যাকেট ফ্রি"
                value={tier.note}
                onChange={(e) => patchTier(i, { note: e.target.value })}
              />
            </div>

            {tier.productId && (
              <p className="text-[11px] text-emerald-700 font-medium">
                ৳{tier.minAmount} বা তার বেশি অর্ডারে “{tier.productName}” ফ্রি
              </p>
            )}
          </div>
        ))}
      </Card>

      <div className="pb-8">
        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          সেভ করুন
        </Button>
      </div>
    </div>
  );
}
