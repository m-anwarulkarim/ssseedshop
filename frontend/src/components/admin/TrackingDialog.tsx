import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, Loader2, Trash2, BarChart3, Code2 } from "lucide-react";

// ─── Shared hooks ───
function useTrackingSave() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      await fetch(`${url}/settings/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pixel-settings"] });
      queryClient.invalidateQueries({ queryKey: ["gtm-settings"] });
      queryClient.invalidateQueries({ queryKey: ["pixel-status"] });
      queryClient.invalidateQueries({ queryKey: ["gtm-status"] });
      toast.success(t("সেভ হয়েছে", "Saved"));
    },
    onError: () => toast.error(t("সেভ ব্যর্থ", "Save failed")),
  });

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      await fetch(`${url}/settings/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pixel-settings"] });
      queryClient.invalidateQueries({ queryKey: ["gtm-settings"] });
      queryClient.invalidateQueries({ queryKey: ["pixel-status"] });
      queryClient.invalidateQueries({ queryKey: ["gtm-status"] });
      toast.success(t("ডিলিট হয়েছে", "Deleted"));
    },
    onError: () => toast.error(t("ডিলিট ব্যর্থ", "Delete failed")),
  });

  return { saveMutation, deleteMutation };
}

// ─── Saved row display ───
function SavedRow({ value, masked, onDelete }: { value: string; masked?: boolean; onDelete: () => void }) {
  const { t } = useLanguage();
  const display = masked && value.length > 12
    ? value.substring(0, 8) + "••••" + value.substring(value.length - 4)
    : value;
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-primary/30 text-primary text-xs font-mono">{display}</Badge>
        <Badge variant="outline" className="border-primary/30 text-primary text-xs">{t("সক্রিয়", "Active")}</Badge>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

// 🔒 DO_NOT_MODIFY_START — Meta Pixel & Conversions API Dialog
// ═══════════════════════════════════════════
// Meta Pixel & Conversions API Dialog
// ═══════════════════════════════════════════
interface DialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function PixelDialog({ open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const { saveMutation, deleteMutation } = useTrackingSave();
  const [pixelId, setPixelId] = useState("");
  const [capiToken, setCapiToken] = useState("");

  const { data: saved, isLoading } = useQuery({
    queryKey: ["pixel-settings"],
    enabled: open,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const keys = ["meta_pixel_id", "meta_capi_token"].join(",");
      const res = await fetch(`${url}/settings/get.php?keys=${keys}`);
      const data = await res.json();
      const map: Record<string, string> = {};
      data?.forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
  });

  const savedPixel = saved?.["meta_pixel_id"] || "";
  const savedCapi = saved?.["meta_capi_token"] || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t("Meta Pixel ও Conversions API", "Meta Pixel & Conversions API")}
          </DialogTitle>
          <DialogDescription>
            {t("ফেসবুক পিক্সেল ও সার্ভার-সাইড ট্র্যাকিং কনফিগারেশন", "Facebook Pixel & server-side tracking configuration")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Pixel ID */}
            <div className="space-y-2.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Meta Pixel ID</Label>
              {savedPixel ? (
                <SavedRow value={savedPixel} onDelete={() => deleteMutation.mutate("meta_pixel_id")} />
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="e.g. 123456789012345" value={pixelId} onChange={(e) => setPixelId(e.target.value)} className="font-mono text-sm" />
                  <Button size="sm" onClick={() => {
                    const value = pixelId.trim();
                    if (!/^\d{10,20}$/.test(value)) return toast.error("সঠিক numeric Pixel ID দিন");
                    saveMutation.mutate({ key: "meta_pixel_id", value });
                    setPixelId("");
                  }} disabled={saveMutation.isPending} className="gap-1.5 shrink-0">
                    <Save className="w-3.5 h-3.5" />{t("সেভ", "Save")}
                  </Button>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                {t("Events Manager → Data Sources → Pixel → Settings → Pixel ID (সংখ্যা)", "Events Manager → Data Sources → Pixel → Settings → Pixel ID")}
              </p>
            </div>

            {/* Conversions API Token */}
            <div className="space-y-2.5 border-t pt-4">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Conversions API Token</Label>
              {savedCapi ? (
                <SavedRow value={savedCapi} masked onDelete={() => deleteMutation.mutate("meta_capi_token")} />
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="EAANhGn..." value={capiToken} onChange={(e) => setCapiToken(e.target.value)} className="font-mono text-xs" type="password" />
                  <Button size="sm" onClick={() => { if (!capiToken.trim()) return toast.error("CAPI Token দিন"); saveMutation.mutate({ key: "meta_capi_token", value: capiToken.trim() }); setCapiToken(""); }} disabled={saveMutation.isPending} className="gap-1.5 shrink-0">
                    <Save className="w-3.5 h-3.5" />{t("সেভ", "Save")}
                  </Button>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                {t("Events Manager → Settings → Conversions API → Generate Access Token", "Events Manager → Settings → Conversions API → Generate Access Token")}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-muted/50 rounded-lg p-3 border">
              <p className="text-xs font-medium text-foreground mb-1">{t("📋 কিভাবে পাবেন?", "📋 How to get?")}</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>Pixel ID:</strong> {t("Events Manager → Data Sources → Pixel → Settings → Pixel ID", "Events Manager → Data Sources → Pixel → Settings → Pixel ID")}</li>
                <li><strong>CAPI Token:</strong> {t("Events Manager → Settings → Conversions API → Generate Access Token", "Events Manager → Settings → Conversions API → Generate Access Token")}</li>
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
// 🔒 DO_NOT_MODIFY_END

// ═══════════════════════════════════════════
// Google Tag Manager Dialog
// ═══════════════════════════════════════════
export function GtmDialog({ open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const { saveMutation, deleteMutation } = useTrackingSave();
  const [gtmId, setGtmId] = useState("");

  const { data: saved, isLoading } = useQuery({
    queryKey: ["gtm-settings"],
    enabled: open,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${url}/settings/get.php?keys=gtm_id`);
      const data = await res.json();
      return data?.[0]?.value || "";
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Google Tag Manager
          </DialogTitle>
          <DialogDescription>
            {t("GTM কন্টেইনার কনফিগারেশন", "GTM container configuration")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-5 pt-2">
            <div className="space-y-2.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">GTM Container ID</Label>
              {saved ? (
                <SavedRow value={saved as string} onDelete={() => deleteMutation.mutate("gtm_id")} />
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="e.g. GTM-XXXXXXX" value={gtmId} onChange={(e) => setGtmId(e.target.value)} className="font-mono text-sm" />
                  <Button size="sm" onClick={() => { if (!gtmId.trim()) return toast.error("GTM ID দিন"); saveMutation.mutate({ key: "gtm_id", value: gtmId.trim() }); setGtmId(""); }} disabled={saveMutation.isPending} className="gap-1.5 shrink-0">
                    <Save className="w-3.5 h-3.5" />{t("সেভ", "Save")}
                  </Button>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                {t("tagmanager.google.com → Container → GTM-XXXXXXX আইডি কপি করুন", "tagmanager.google.com → Container → Copy GTM-XXXXXXX ID")}
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 border">
              <p className="text-xs font-medium text-foreground mb-1">{t("📋 কিভাবে পাবেন?", "📋 How to get?")}</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>{t("tagmanager.google.com এ লগইন করুন", "Login to tagmanager.google.com")}</li>
                <li>{t("আপনার Container সিলেক্ট করুন", "Select your Container")}</li>
                <li>{t("GTM-XXXXXXX আইডি কপি করুন", "Copy the GTM-XXXXXXX ID")}</li>
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
