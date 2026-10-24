import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8005";

type Tier = { label: string; sub: string; charge: string; isFree: boolean };
type TimeItem = { label: string; value: string };
type DCData = {
  title: string;
  subtitle: string;
  listTitle: string;
  listSubtitle: string;
  tiers: Tier[];
  timeTitle: string;
  timeItems: TimeItem[];
  footerNote: string;
};

const DEFAULTS: DCData = {
  title: "ডেলিভারি চার্জ",
  subtitle: "অর্ডার মূল্য অনুযায়ী ডেলিভারি চার্জ",
  listTitle: "ডেলিভারি চার্জ তালিকা",
  listSubtitle: "সারা বাংলাদেশে হোম ডেলিভারি",
  tiers: [
    { label: "অর্ডার ৳৬০০ বা তার বেশি", sub: "কোনো ডেলিভারি চার্জ লাগবে না 🎉", charge: "ফ্রি", isFree: true },
  ],
  timeTitle: "ডেলিভারি পেতে আনুমানিক সময়",
  timeItems: [{ label: "ঢাকার ভিতরে", value: "১ – ২ দিন" }],
  footerNote: "৳৬০০+ অর্ডার করলেই ডেলিভারি সম্পূর্ণ ফ্রি!",
};

export default function DeliveryChargeEditor() {
  const qc = useQueryClient();
  const [data, setData] = useState<DCData>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const { data: loaded, isLoading } = useQuery({
    queryKey: ["admin-delivery-charge-page"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE}/settings/get.php?key=delivery_charge_page`);
        const item = await res.json();
        if (!item?.value) return DEFAULTS;
        return { ...DEFAULTS, ...(typeof item.value === "string" ? JSON.parse(item.value) : item.value) } as DCData;
      } catch (e) {
        console.error("Error loading delivery charge page settings:", e);
        return DEFAULTS;
      }
    },
  });

  useEffect(() => {
    if (loaded) setData(loaded);
  }, [loaded]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/settings/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "delivery_charge_page",
          value: JSON.stringify(data),
        }),
      });
      const result = await res.json();
      if (!result.success && result.status !== "success") throw new Error(result.error || "Save failed");
      toast.success("সফলভাবে সেভ হয়েছে");
      qc.invalidateQueries({ queryKey: ["delivery-charge-page"] });
      qc.invalidateQueries({ queryKey: ["admin-delivery-charge-page"] });
    } catch (err: any) {
      toast.error(err.message || "সেভ ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const updateTier = (i: number, key: keyof Tier, val: any) => {
    const tiers = [...data.tiers];
    tiers[i] = { ...tiers[i], [key]: val };
    setData({ ...data, tiers });
  };
  const addTier = () =>
    setData({ ...data, tiers: [...data.tiers, { label: "", sub: "", charge: "", isFree: false }] });
  const removeTier = (i: number) =>
    setData({ ...data, tiers: data.tiers.filter((_, idx) => idx !== i) });

  const updateTime = (i: number, key: keyof TimeItem, val: string) => {
    const items = [...data.timeItems];
    items[i] = { ...items[i], [key]: val };
    setData({ ...data, timeItems: items });
  };
  const addTime = () =>
    setData({ ...data, timeItems: [...data.timeItems, { label: "", value: "" }] });
  const removeTime = (i: number) =>
    setData({ ...data, timeItems: data.timeItems.filter((_, idx) => idx !== i) });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2">
        <h1 className="text-xl font-bold">ডেলিভারি চার্জ পেজ এডিটর</h1>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          সেভ করুন
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        <h2 className="font-bold text-sm">হেডার</h2>
        <div>
          <Label>টাইটেল</Label>
          <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
        </div>
        <div>
          <Label>সাব-টাইটেল</Label>
          <Input value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} />
        </div>
        <div>
          <Label>লিস্ট টাইটেল</Label>
          <Input value={data.listTitle} onChange={(e) => setData({ ...data, listTitle: e.target.value })} />
        </div>
        <div>
          <Label>লিস্ট সাব-টাইটেল</Label>
          <Input value={data.listSubtitle} onChange={(e) => setData({ ...data, listSubtitle: e.target.value })} />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">চার্জের তালিকা</h2>
          <Button size="sm" variant="outline" onClick={addTier}>
            <Plus className="w-4 h-4 mr-1" /> নতুন
          </Button>
        </div>
        {data.tiers.map((t, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs">
                  <Switch checked={t.isFree} onCheckedChange={(v) => updateTier(i, "isFree", v)} />
                  ফ্রি ব্যাজ
                </label>
                <Button size="sm" variant="ghost" onClick={() => removeTier(i)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <Input placeholder="লেবেল" value={t.label} onChange={(e) => updateTier(i, "label", e.target.value)} />
            <Input placeholder="সাব টেক্সট" value={t.sub} onChange={(e) => updateTier(i, "sub", e.target.value)} />
            <Input placeholder="চার্জ (যেমন: ৳৫০ বা ফ্রি)" value={t.charge} onChange={(e) => updateTier(i, "charge", e.target.value)} />
          </div>
        ))}
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">ডেলিভারির সময়</h2>
          <Button size="sm" variant="outline" onClick={addTime}>
            <Plus className="w-4 h-4 mr-1" /> নতুন
          </Button>
        </div>
        <div>
          <Label>সেকশন টাইটেল</Label>
          <Input value={data.timeTitle} onChange={(e) => setData({ ...data, timeTitle: e.target.value })} />
        </div>
        {data.timeItems.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <Input placeholder="যেমন: ঢাকার ভিতরে" value={it.label} onChange={(e) => updateTime(i, "label", e.target.value)} />
            <Input placeholder="যেমন: ১ – ২ দিন" value={it.value} onChange={(e) => updateTime(i, "value", e.target.value)} />
            <Button size="sm" variant="ghost" onClick={() => removeTime(i)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-bold text-sm">ফুটার নোট</h2>
        <Textarea value={data.footerNote} onChange={(e) => setData({ ...data, footerNote: e.target.value })} rows={2} />
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
