import { API_URL } from "@/config/env";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Key, Webhook, Copy, Check, Eye, EyeOff, RefreshCw, Truck, Shield, Link2, Save,
  Trash2, Database, Loader2, Settings, MessageSquare, CreditCard, ChevronRight, BarChart3, Code2,
  Bell,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FraudCheckerDialog } from "@/components/admin/FraudCheckerDialog";
import { PixelDialog, GtmDialog } from "@/components/admin/TrackingDialog";
import { ECOMAH_SETTING_KEY } from "@/lib/ecomahSettings";


// ─── Courier API Dialog ───
function CourierApiDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [savingKeys, setSavingKeys] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [editingKeys, setEditingKeys] = useState(false);
  const [courierNote, setCourierNote] = useState("");
  const [savedCourierNote, setSavedCourierNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const callbackUrl = `${API_URL}/settings/steadfast_webhook.php`;

  const { data: savedSettings, isLoading } = useQuery({
    queryKey: ["app-settings-courier"],
    enabled: open,
    staleTime: 0,
    queryFn: async () => {
      const url = API_URL;
      const keys = ["steadfast_api_key", "steadfast_secret_key", "steadfast_webhook_token", "steadfast_courier_note"].join(",");
      const res = await fetch(`${url}/settings/get.php?keys=${keys}&_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      const map: Record<string, string> = {};
      data?.forEach((r: any) => {
        if (r && r.key && r.value) {
          map[r.key] = String(r.value).trim();
        }
      });
      return map;
    },
  });

  const savedApiKey = savedSettings?.["steadfast_api_key"] || "";
  const savedSecretKey = savedSettings?.["steadfast_secret_key"] || "";
  const webhookToken = savedSettings?.["steadfast_webhook_token"] || "";

  useEffect(() => {
    if (savedSettings) {
      const note = savedSettings["steadfast_courier_note"] || "";
      setCourierNote(note);
      setSavedCourierNote(note);
    }
  }, [savedSettings]);

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      const url = API_URL;
      await fetch(`${url}/settings/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "steadfast_courier_note", value: courierNote.trim() })
      });
      setSavedCourierNote(courierNote.trim());
      queryClient.invalidateQueries({ queryKey: ["app-settings-courier"] });
      toast.success(t("কুরিয়ার নোট সেভ হয়েছে", "Courier note saved"));
    } catch {
      toast.error(t("সেভ ব্যর্থ", "Save failed"));
    } finally {
      setSavingNote(false);
    }
  };

  const maskValue = (val: string) => {
    if (!val) return "";
    if (val.length <= 8) return "••••••••";
    return val.substring(0, 4) + "••••••••" + val.substring(val.length - 4);
  };

  const hasKeys = !!(savedApiKey && savedSecretKey);

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      const url = API_URL;
      await fetch(`${url}/settings/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
      });
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["app-settings-courier"] });
      queryClient.removeQueries({ queryKey: ["courier-status"] });
      queryClient.invalidateQueries({ queryKey: ["app-settings-courier"] });
      queryClient.invalidateQueries({ queryKey: ["courier-status"] });
      toast.success(t("ডিলিট হয়েছে", "Deleted"));
    },
    onError: () => toast.error(t("ডিলিট ব্যর্থ", "Delete failed")),
  });

  const generateToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleGenerateToken = async () => {
    setGeneratingToken(true);
    try {
      const token = generateToken();
      const url = API_URL;
      const res = await fetch(`${url}/settings/steadfast.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_webhook_token", token })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      queryClient.invalidateQueries({ queryKey: ["app-settings-courier"] });
      toast.success(t("টোকেন তৈরি ও সেভ হয়েছে", "Token generated and saved"));
    } catch {
      toast.error(t("টোকেন তৈরি ব্যর্থ", "Failed to generate token"));
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleSaveKeys = async () => {
    if (!apiKey.trim() || !secretKey.trim()) {
      toast.error(t("উভয় কী প্রয়োজন", "Both keys are required"));
      return;
    }
    setSavingKeys(true);
    try {
      const url = API_URL;
      const updateRes = await fetch(`${url}/settings/steadfast.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_keys", api_key: apiKey, secret_key: secretKey })
      });
      const updateResult = await updateRes.json();
      if (!updateResult.success) throw new Error(updateResult.error);
      if (updateResult?.success === false || updateResult?.error) throw new Error(updateResult?.error || "API key verification failed");
      const balRes = await fetch(`${url}/settings/steadfast.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_balance" })
      });
      const data = await balRes.json();
      if (data?.success === false || data?.error) throw new Error(data?.error || "API key verification failed");
      queryClient.invalidateQueries({ queryKey: ["app-settings-courier"] });
      queryClient.invalidateQueries({ queryKey: ["courier-status"] });
      toast.success(t("API কী আপডেট হয়েছে", "API keys updated"));
      setApiKey("");
      setSecretKey("");
      setEditingKeys(false);
    } catch (err: any) {
      toast.error(err?.message || t("API কী আপডেট ব্যর্থ", "Failed to update API keys"));
    } finally {
      setSavingKeys(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(t("কপি হয়েছে", "Copied"));
    setTimeout(() => setCopied(null), 2000);
  };

  const settingsLabels: Record<string, string> = {
    steadfast_api_key: "API Key",
    steadfast_secret_key: "Secret Key",
    steadfast_webhook_token: "Webhook Token",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            {t("Steadfast কুরিয়ার API", "Steadfast Courier API")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <></>
          )}

          {/* Update/Add Keys */}
          {hasKeys && !editingKeys ? (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{t("API কী কনফিগার করা আছে", "API keys configured")}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingKeys(true)} className="gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                {t("এডিট", "Edit")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                {hasKeys ? t("API কী এডিট", "Edit API Keys") : t("API কী যোগ করুন", "Add API Keys")}
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    placeholder="API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-9"
                  />
                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showSecretKey ? "text" : "password"}
                    placeholder="Secret Key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="pr-9"
                  />
                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowSecretKey(!showSecretKey)}>
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveKeys} disabled={savingKeys} size="sm" className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  {savingKeys ? t("সেভ হচ্ছে...", "Saving...") : t("সেভ করুন", "Save")}
                </Button>
                {hasKeys && (
                  <Button variant="ghost" size="sm" onClick={() => { setEditingKeys(false); setApiKey(""); setSecretKey(""); }}>
                    {t("বাতিল", "Cancel")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Webhook */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Webhook className="w-3.5 h-3.5" />
              {t("ওয়েবহুক সেটআপ", "Webhook Setup")}
            </Label>

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1"><Link2 className="w-3 h-3" /> Callback URL</Label>
              <div className="flex gap-2">
                <Input value={callbackUrl} readOnly className="font-mono text-xs bg-muted" />
                <Button size="icon" variant="outline" className="shrink-0" onClick={() => copyToClipboard(callbackUrl, "url")}>
                  {copied === "url" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1"><Shield className="w-3 h-3" /> Auth Token (Bearer)</Label>
              <div className="flex gap-2">
                <Input value={webhookToken || t("টোকেন তৈরি করুন →", "Generate token →")} readOnly className="font-mono text-xs bg-muted" />
                <Button size="icon" variant="outline" className="shrink-0" onClick={() => webhookToken && copyToClipboard(webhookToken, "token")} disabled={!webhookToken}>
                  {copied === "token" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerateToken} disabled={generatingToken} className="gap-1.5">
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingToken ? "animate-spin" : ""}`} />
                  {webhookToken ? t("রিজেনারেট", "Regenerate") : t("তৈরি করুন", "Generate")}
                </Button>
                {webhookToken && (
                  <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                    <Key className="w-3 h-3 mr-1" />{t("সক্রিয়", "Active")}
                  </Badge>
                )}
              </div>
            </div>

          {/* Courier Note */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              📝 {t("কুরিয়ার নোট", "Courier Note")}
            </Label>
            <p className="text-xs text-muted-foreground">{t("কুরিয়ারে এন্ট্রির সময় এই নোটটি অটো যুক্ত হবে", "This note will be auto-attached when entering orders to courier")}</p>
            <Textarea
              placeholder={t("যেমন: ভঙ্গুর পণ্য, সাবধানে হ্যান্ডেল করুন", "e.g: Fragile product, handle with care")}
              value={courierNote}
              onChange={(e) => setCourierNote(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <Button
              size="sm"
              onClick={handleSaveNote}
              disabled={savingNote || courierNote.trim() === savedCourierNote}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {savingNote ? t("সেভ হচ্ছে...", "Saving...") : t("সেভ করুন", "Save")}
            </Button>
          </div>

            <div className="bg-muted/50 rounded-lg p-3 border">
              <p className="text-xs font-medium text-foreground mb-1">{t("📋 নির্দেশনা", "📋 Instructions")}</p>
              <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
                <li>{t("portal.packzy.com এ লগইন করুন", "Login to portal.packzy.com")}</li>
                <li>{t("Settings → Webhook এ যান", "Go to Settings → Webhook")}</li>
                <li>{t("Callback URL ও Bearer Token পেস্ট করুন", "Paste Callback URL & Bearer Token")}</li>
                <li>{t("সেভ করুন — অটো আপডেট চালু!", "Save — auto updates enabled!")}</li>
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── API Card Item ───
interface ApiCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  status?: "active" | "inactive";
  onClick: () => void;
}

function ApiCard({ icon: Icon, title, description, status, onClick }: ApiCardProps) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors text-left group"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {status === "active" && (
          <Badge variant="outline" className="border-primary/30 text-primary text-xs">{t("সক্রিয়", "Active")}</Badge>
        )}
        {status === "inactive" && (
          <Badge variant="outline" className="text-muted-foreground text-xs">{t("নিষ্ক্রিয়", "Inactive")}</Badge>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </button>
  );
}

// ─── Main Page ───
export default function ApiManagement() {
  const { t } = useLanguage();
  const [courierOpen, setCourierOpen] = useState(false);
  const [fraudOpen, setFraudOpen] = useState(false);
  const [pixelOpen, setPixelOpen] = useState(false);
  const [gtmOpen, setGtmOpen] = useState(false);

  const { data: courierStatus } = useQuery({
    queryKey: ["courier-status"],
    staleTime: 0,
    queryFn: async () => {
      const url = API_URL;
      const res = await fetch(`${url}/settings/steadfast.php?_t=${Date.now()}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_balance" })
      });
      const data = await res.json();
      const error = data.error;
      if (error || data?.success === false || data?.status === 401) return "inactive";
      return data?.status === 200 ? "active" : "inactive";
    },
  });

  const { data: ecomahStatus } = useQuery({
    queryKey: ["ecomah-status"],
    staleTime: 0,
    queryFn: async () => {
      const url = API_URL;
      const res = await fetch(`${url}/settings/get.php?keys=${ECOMAH_SETTING_KEY}&_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      const val = data?.[0]?.value;
      return val && typeof val === "string" && val.trim() !== "" ? "active" : "inactive";
    },
  });

  const { data: pixelStatus } = useQuery({
    queryKey: ["pixel-status"],
    staleTime: 0,
    queryFn: async () => {
      const url = API_URL;
      const res = await fetch(`${url}/settings/get.php?keys=meta_pixel_id&_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      const val = data?.[0]?.value;
      return val && typeof val === "string" && val.trim() !== "" ? "active" : "inactive";
    },
  });

  const { data: gtmStatus } = useQuery({
    queryKey: ["gtm-status"],
    staleTime: 0,
    queryFn: async () => {
      const url = API_URL;
      const res = await fetch(`${url}/settings/get.php?keys=gtm_id&_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      const val = data?.[0]?.value;
      return val && typeof val === "string" && val.trim() !== "" ? "active" : "inactive";
    },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <ApiCard
          icon={Truck}
          title={t("কুরিয়ার API (Steadfast)", "Courier API (Steadfast)")}
          description={t("API Key, Secret Key ও Webhook Token কনফিগার করুন", "Configure API Key, Secret Key & Webhook Token")}
          status={courierStatus as "active" | "inactive" | undefined}
          onClick={() => setCourierOpen(true)}
        />
        <ApiCard
          icon={Shield}
          title={t("ফ্রড চেকার", "Fraud Checker")}
          description={t("ফেক অর্ডার ও ফ্রড ডিটেকশন", "Fake order & fraud detection")}
          status={ecomahStatus as "active" | "inactive" | undefined}
          onClick={() => setFraudOpen(true)}
        />
        <ApiCard
          icon={BarChart3}
          title={t("Meta Pixel ও Conversions API", "Meta Pixel & Conversions API")}
          description={t("ফেসবুক পিক্সেল ও সার্ভার-সাইড ট্র্যাকিং", "Facebook Pixel & server-side tracking")}
          status={pixelStatus as "active" | "inactive" | undefined}
          onClick={() => setPixelOpen(true)}
        />
      </div>

      <CourierApiDialog open={courierOpen} onOpenChange={setCourierOpen} />
      <FraudCheckerDialog open={fraudOpen} onOpenChange={setFraudOpen} />
      <PixelDialog open={pixelOpen} onOpenChange={setPixelOpen} />
      <GtmDialog open={gtmOpen} onOpenChange={setGtmOpen} />
    </div>
  );
}
