import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BarChart3, Save, Settings, Check, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

export function MetaAdsApiDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [accessToken, setAccessToken] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const { data: savedSettings, isLoading } = useQuery({
    queryKey: ["app-settings-meta-ads"],
    enabled: open,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const keys = ["meta_ads_access_token", "meta_ad_account_id"].join(",");
      const res = await fetch(`${url}/settings/get.php?keys=${keys}`);
      const data = await res.json();
      const map: Record<string, string> = {};
      data?.forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
  });

  const savedToken = savedSettings?.["meta_ads_access_token"] || "";
  const savedAccountId = savedSettings?.["meta_ad_account_id"] || "";
  const hasKeys = !!(savedToken && savedAccountId);

  const handleSave = async () => {
    if (!accessToken.trim() || !adAccountId.trim()) {
      toast.error(t("উভয় ফিল্ড প্রয়োজন", "Both fields are required"));
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      await fetch(`${url}/settings/update.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "meta_ads_access_token", value: accessToken.trim() })
      });
      await fetch(`${url}/settings/update.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "meta_ad_account_id", value: adAccountId.trim().replace(/^act_/, "") })
      });
      queryClient.invalidateQueries({ queryKey: ["app-settings-meta-ads"] });
      queryClient.invalidateQueries({ queryKey: ["meta-ads-status"] });
      toast.success(t("Meta Ads API সেভ হয়েছে", "Meta Ads API saved"));
      setAccessToken("");
      setAdAccountId("");
      setEditing(false);
    } catch {
      toast.error(t("সেভ ব্যর্থ", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      await fetch(`${url}/settings/delete.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "meta_ads_access_token" }) });
      await fetch(`${url}/settings/delete.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "meta_ad_account_id" }) });
      queryClient.invalidateQueries({ queryKey: ["app-settings-meta-ads"] });
      queryClient.invalidateQueries({ queryKey: ["meta-ads-status"] });
      toast.success(t("ডিলিট হয়েছে", "Deleted"));
    } catch {
      toast.error(t("ডিলিট ব্যর্থ", "Delete failed"));
    }
  };

  const maskValue = (val: string) => {
    if (!val) return "";
    if (val.length <= 8) return "••••••••";
    return val.substring(0, 4) + "••••••••" + val.substring(val.length - 4);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t("Meta Ads API", "Meta Ads API")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : hasKeys && !editing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{t("API কনফিগার করা আছে", "API configured")}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
                    <Settings className="w-3.5 h-3.5" />
                    {t("এডিট", "Edit")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete} className="gap-1.5 text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Access Token: {maskValue(savedToken)}</p>
                <p>Ad Account ID: act_{savedAccountId}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">{t("অ্যাক্সেস টোকেন", "Access Token")}</Label>
                <div className="relative mt-1">
                  <Input
                    type={showToken ? "text" : "password"}
                    placeholder="EAAxxxxxxx..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="pr-9"
                  />
                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowToken(!showToken)}>
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-xs">{t("অ্যাড অ্যাকাউন্ট ID", "Ad Account ID")}</Label>
                <Input
                  placeholder="act_123456789"
                  value={adAccountId}
                  onChange={(e) => setAdAccountId(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  {saving ? t("সেভ হচ্ছে...", "Saving...") : t("সেভ করুন", "Save")}
                </Button>
                {hasKeys && (
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setAccessToken(""); setAdAccountId(""); }}>
                    {t("বাতিল", "Cancel")}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3 border">
            <p className="text-xs font-medium text-foreground mb-1">{t("📋 কিভাবে পাবেন", "📋 How to get credentials")}</p>
            <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
              <li>{t("business.facebook.com এ লগইন করুন", "Login to business.facebook.com")}</li>
              <li>{t("Business Settings → System Users → Generate Token (ads_read)", "Business Settings → System Users → Generate Token (ads_read)")}</li>
              <li>{t("Ad Account ID কপি করুন (act_ সহ)", "Copy Ad Account ID (with act_)")}</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
