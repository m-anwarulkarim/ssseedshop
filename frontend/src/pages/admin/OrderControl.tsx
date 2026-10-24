import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ShieldBan, Timer, Trash2, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BlockRow {
  id: string;
  block_type: string;
  block_value: string;
  reason: string | null;
  blocked_at: string;
}

interface VisitorRow {
  id: string;
  fingerprint: string;
  ip_addresses: string[] | null;
  updated_at: string;
}

export default function OrderControl() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [hours, setHours] = useState("48");

  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [newIp, setNewIp] = useState("");
  const [newReason, setNewReason] = useState("");
  const [adding, setAdding] = useState(false);
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);

  const loadAll = async () => {
    const [settingsRes, blocksRes, visitorsRes] = await Promise.all([
      supabase.from("app_settings").select("key, value").in("key", ["order_cooldown_enabled", "order_cooldown_hours"]),
      supabase.from("blocked_devices").select("id, block_type, block_value, reason, blocked_at").order("blocked_at", { ascending: false }),
      supabase.from("visitors").select("id, fingerprint, ip_addresses, updated_at").order("updated_at", { ascending: false }).limit(15),
    ]);

    const map = new Map((settingsRes.data || []).map((r: any) => [r.key, r.value]));
    setEnabled(String(map.get("order_cooldown_enabled") || "false") === "true");
    setHours(String(map.get("order_cooldown_hours") || "48"));
    setBlocks((blocksRes.data as BlockRow[]) || []);
    setVisitors((visitorsRes.data as VisitorRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const saveSettings = async () => {
    const h = Number(hours);
    if (!Number.isFinite(h) || h < 0 || h > 8760) {
      toast.error(t("সময় ০ থেকে ৮৭৬০ ঘন্টার মধ্যে দিন", "Enter hours between 0 and 8760"));
      return;
    }
    setSaving(true);
    const now = new Date().toISOString();
    const { error } = await supabase.from("app_settings").upsert([
      { key: "order_cooldown_enabled", value: enabled ? "true" : "false", updated_at: now },
      { key: "order_cooldown_hours", value: String(h), updated_at: now },
    ], { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast.error(t("সেভ করা যায়নি", "Could not save") + ": " + error.message);
      return;
    }
    toast.success(t("সেটিংস সেভ হয়েছে", "Settings saved"));
  };

  const addBlock = async (value: string, type: "ip" | "device", reason?: string) => {
    const clean = value.trim();
    if (!clean) return;
    setAdding(true);
    const { error } = await supabase.from("blocked_devices").insert({
      block_type: type,
      block_value: clean,
      reason: (reason || "").trim() || null,
    });
    setAdding(false);
    if (error) {
      toast.error(t("ব্লক করা যায়নি", "Could not block") + ": " + error.message);
      return;
    }
    toast.success(t("ব্লক করা হয়েছে", "Blocked") + `: ${clean}`);
    setNewIp("");
    setNewReason("");
    loadAll();
  };

  const removeBlock = async (id: string) => {
    const { error } = await supabase.from("blocked_devices").delete().eq("id", id);
    if (error) {
      toast.error(t("আনব্লক করা যায়নি", "Could not unblock") + ": " + error.message);
      return;
    }
    toast.success(t("আনব্লক করা হয়েছে", "Unblocked"));
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-xl font-bold">{t("অর্ডার কন্ট্রোল", "Order Control")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("অর্ডারের সময়সীমা ও ব্লক লিস্ট এখান থেকে নিয়ন্ত্রণ করুন।", "Control the re-order time limit and the block list here.")}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="h-4 w-4" />
            {t("রি-অর্ডার সময়সীমা", "Re-order time limit")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">{t("সময়সীমা চালু", "Limit enabled")}</p>
              <p className="text-xs text-muted-foreground">
                {t("চালু থাকলে একবার অর্ডার করার পর নির্দিষ্ট সময় পর্যন্ত আবার অর্ডার করা যাবে না।", "When on, a customer cannot order again until the set time passes.")}
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cooldown-hours">{t("কত ঘন্টা পর আবার অর্ডার করতে পারবে", "Hours before ordering again")}</Label>
            <Input
              id="cooldown-hours"
              type="number"
              min={0}
              max={8760}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="max-w-[180px]"
            />
            <p className="text-xs text-muted-foreground">
              {t("উদাহরণ: ৪৮ = ২ দিন। একই ফোন নম্বর বা একই ডিভাইস ধরা হবে।", "Example: 48 = 2 days. Matched by the same phone number or same device.")}
            </p>
          </div>

          <Button onClick={saveSettings} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("সেভ করুন", "Save")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldBan className="h-4 w-4" />
            {t("ব্লক লিস্ট (IP / ডিভাইস)", "Block list (IP / device)")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder={t("IP অ্যাড্রেস (যেমন 103.12.44.9)", "IP address (e.g. 103.12.44.9)")}
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
            />
            <Input
              placeholder={t("কারণ (অপশনাল)", "Reason (optional)")}
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
            />
            <Button onClick={() => addBlock(newIp, "ip", newReason)} disabled={adding || !newIp.trim()}>
              {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {t("ব্লক করুন", "Block")}
            </Button>
          </div>

          {blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("কোনো ব্লক করা IP বা ডিভাইস নেই।", "No blocked IPs or devices yet.")}</p>
          ) : (
            <div className="divide-y rounded-lg border">
              {blocks.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[11px] uppercase">{b.block_type}</span>
                      {b.block_value}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {b.reason || t("কারণ উল্লেখ নেই", "No reason given")} · {new Date(b.blocked_at).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeBlock(b.id)} aria-label={t("আনব্লক", "Unblock")}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">{t("সাম্প্রতিক ভিজিটর", "Recent visitors")}</p>
            <div className="divide-y rounded-lg border">
              {visitors.map((v) => {
                const ips = (v.ip_addresses || []).filter(Boolean);
                return (
                  <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                    <div className="min-w-0 text-xs">
                      <p className="font-medium">{ips.length ? ips.join(", ") : t("IP পাওয়া যায়নি", "No IP found")}</p>
                      <p className="text-muted-foreground">{v.fingerprint} · {new Date(v.updated_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {ips.slice(0, 2).map((ip) => (
                        <Button key={ip} size="sm" variant="outline" onClick={() => addBlock(ip, "ip", "Blocked from Order Control")}>
                          {t("IP ব্লক", "Block IP")} {ip}
                        </Button>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => addBlock(v.fingerprint, "device", "Blocked from Order Control")}>
                        {t("ডিভাইস ব্লক", "Block device")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
