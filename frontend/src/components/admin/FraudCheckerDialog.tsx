import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

import { deleteEcomahApiKey, ECOMAH_SETTING_KEY, saveEcomahApiKey } from "@/lib/ecomahSettings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Check, Eye, EyeOff, Save, Loader2, Settings, Shield,
  Trash2, Search, Truck, AlertCircle,
} from "lucide-react";

/* ──────────────────────────── Main Dialog ──────────────────────────── */

export function FraudCheckerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [editingKey, setEditingKey] = useState(false);

  // E-COMAH Test
  const [testPhone, setTestPhone] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Steadfast Test
  const [steadfastTestPhone, setSteadfastTestPhone] = useState("");
  const [steadfastTesting, setSteadfastTesting] = useState(false);
  const [steadfastTestResult, setSteadfastTestResult] = useState<any>(null);

  const { data: savedKey, isLoading } = useQuery({
    queryKey: ["app-settings-ecomah"],
    enabled: open,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${url}/settings/get.php?keys=${ECOMAH_SETTING_KEY}`);
      const data = await res.json();
      return data?.[0]?.value || "";
    },
  });

  const { data: courierSettings } = useQuery({
    queryKey: ["app-settings-courier"],
    enabled: open,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${url}/settings/get.php?keys=steadfast_api_key,steadfast_secret_key`);
      const data = await res.json();
      const map: Record<string, string> = {};
      data?.forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
  });

  const hasKey = !!savedKey;
  const hasSteadfastKeys = !!(courierSettings?.["steadfast_api_key"] && courierSettings?.["steadfast_secret_key"]);

  const maskValue = (val: string) => {
    if (!val) return "";
    if (val.length <= 8) return "••••••••";
    return val.substring(0, 4) + "••••" + val.substring(val.length - 4);
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) { toast.error(t("API Key প্রয়োজন", "API Key is required")); return; }
    setSavingKey(true);
    try {
      await saveEcomahApiKey(apiKey);
      queryClient.invalidateQueries({ queryKey: ["app-settings-ecomah"] });
      queryClient.invalidateQueries({ queryKey: ["ecomah-status"] });
      toast.success(t("E-COMAH API কনফিগার হয়েছে", "E-COMAH API configured"));
      setApiKey(""); setEditingKey(false);
    } catch { toast.error(t("সেভ ব্যর্থ", "Save failed")); }
    finally { setSavingKey(false); }
  };

  const handleDeleteKey = async () => {
    try {
      await deleteEcomahApiKey();
      queryClient.invalidateQueries({ queryKey: ["app-settings-ecomah"] });
      queryClient.invalidateQueries({ queryKey: ["ecomah-status"] });
      toast.success(t("API Key ডিলিট হয়েছে", "API Key deleted"));
      setTestResult(null);
    } catch { toast.error(t("ডিলিট ব্যর্থ", "Delete failed")); }
  };

  const handleTest = async () => {
    if (!testPhone.trim()) { toast.error(t("ফোন নম্বর দিন", "Enter phone number")); return; }
    setTesting(true); setTestResult(null);

    try {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${url}/settings/fraud_checker.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", phone: testPhone })
      });
      const data = await res.json();
      const error = data.error;
      if (!error) setTestResult(data?.data);
    } catch {}

    toast.success(t("চেক সম্পন্ন", "Check complete"));
    setTesting(false);
  };

  const handleSteadfastTest = async () => {
    const p = steadfastTestPhone.trim().replace(/\D/g, "");
    if (!p || p.length < 11) {
      toast.error(t("১১ ডিজিটের ফোন নম্বর দিন", "Enter 11-digit phone number"));
      return;
    }
    setSteadfastTesting(true);
    setSteadfastTestResult(null);
    try {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${url}/courier/steadfast.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fraud_check", phone: p, force: true }),
      });
      const data = await res.json();
      if (data?.data) {
        setSteadfastTestResult(data.data);
        toast.success(t("Steadfast চেক সম্পন্ন", "Steadfast check complete"));
      } else {
        toast.error(data?.error || t("Steadfast চেক ব্যর্থ", "Steadfast check failed"));
      }
    } catch {
      toast.error(t("কানেকশন সমস্যা", "Connection error"));
    } finally {
      setSteadfastTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t("ফ্রড ও ডেলিভারি রিস্ক চেকার", "Fraud & Delivery Risk Checker")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="steadfast" className="w-full pt-2">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="steadfast" className="flex items-center gap-1.5 text-xs font-semibold">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              Steadfast Delivery Risk
            </TabsTrigger>
            <TabsTrigger value="ecomah" className="flex items-center gap-1.5 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-primary" />
              E-COMAH Multi-Courier
            </TabsTrigger>
          </TabsList>

          {/* ══════════════ TAB 1: STEADFAST FRAUD CHECK ══════════════ */}
          <TabsContent value="steadfast" className="space-y-4 m-0">
            {/* Steadfast Status Card */}
            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    Steadfast Courier API
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {hasSteadfastKeys 
                      ? t("API ক্রেডেনশিয়াল সক্রিয় (Live Risk Score)", "API Active (Live Risk Score)")
                      : t("ক্রেডেনশিয়াল আনকনফিগারড (API Management > Courier-এ সেট করুন)", "Unconfigured (Set in Courier API)")
                    }
                  </span>
                </div>
              </div>
              <Badge variant="outline" className={hasSteadfastKeys ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-amber-300 text-amber-700 bg-amber-50"}>
                {hasSteadfastKeys ? t("কানেক্টেড", "Connected") : t("আনকনফিগারড", "Unconfigured")}
              </Badge>
            </div>

            {/* Test Phone Input */}
            <div className="space-y-3 border-t pt-3">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                {t("Steadfast ফোন নম্বর চেক করুন", "Check Phone Number via Steadfast")}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t("ফোন নম্বর (017XXXXXXXX)", "Phone (017XXXXXXXX)")}
                  value={steadfastTestPhone}
                  onChange={(e) => setSteadfastTestPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSteadfastTest()}
                />
                <Button
                  onClick={handleSteadfastTest}
                  disabled={steadfastTesting}
                  size="sm"
                  className="gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Search className="w-3.5 h-3.5" />
                  {steadfastTesting ? t("চেক হচ্ছে...", "Checking...") : t("Steadfast চেক", "Check")}
                </Button>
              </div>

              {steadfastTestResult && (
                <div className="pt-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Steadfast Delivery Record</p>
                  <SteadfastResultCard data={steadfastTestResult} highlighted />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-muted/40 rounded-xl p-3 border">
              <p className="text-xs font-semibold text-foreground mb-1">💡 {t("Steadfast রিস্ক চেক সুবিধা", "Steadfast Risk Check Features")}</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>{t("সরাসরি Steadfast-এর /fraud_check/score/{phone} থেকে কাস্টমারের রিয়েল-টাইম ডেলিভারি রেকর্ড আসে।", "Pulls live customer delivery record from Steadfast API.")}</li>
                <li>{t("মোট কত পার্সেল এসেছে, কতগুলো ডেলিভারি হয়েছে ও কতগুলো রিটার্ন এসেছে তা স্পষ্ট দেখা যায়।", "Shows total parcels, delivered count, and return/cancelled stats.")}</li>
                <li>{t("অর্ডার এডিটরে প্রতি অর্ডারে কাস্টমারের নামের পাশে অটোমেটিক এই কার্ডটি প্রদর্শিত হবে।", "Auto-displays in Order Edit customer sidebar.")}</li>
              </ul>
            </div>
          </TabsContent>

          {/* ══════════════ TAB 2: E-COMAH FRAUD CHECK ══════════════ */}
          <TabsContent value="ecomah" className="space-y-4 m-0">
            {isLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* ─── API Key Section ─── */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                E-COMAH API Key
              </Label>

              {hasKey && !editingKey ? (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <div>
                      <span className="text-sm font-medium text-foreground block">{t("কনফিগার করা আছে", "Configured")}</span>
                      <span className="text-xs text-muted-foreground">Key: {maskValue(savedKey || "")}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setEditingKey(true)} className="gap-1.5">
                      <Settings className="w-3.5 h-3.5" />{t("এডিট", "Edit")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDeleteKey} className="gap-1.5 text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Input type={showApiKey ? "text" : "password"} placeholder="E-COMAH API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="pr-9" />
                    <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("E-COMAH API Key দিয়ে মাল্টি-কুরিয়ার (RedX, Pathao, Paperfly) ফ্রড রেকর্ড চেক করা হয়।", "Checks multi-courier delivery history.")}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveKey} disabled={savingKey} size="sm" className="gap-1.5">
                      <Save className="w-3.5 h-3.5" />{savingKey ? t("সেভ হচ্ছে...", "Saving...") : t("সেভ", "Save")}
                    </Button>
                    {hasKey && <Button variant="ghost" size="sm" onClick={() => { setEditingKey(false); setApiKey(""); }}>{t("বাতিল", "Cancel")}</Button>}
                  </div>
                </div>
              )}
            </div>

            {/* ─── Test Section ─── */}
            {hasKey && (
              <div className="space-y-3 border-t pt-4">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  {t("ফোন নম্বর চেক করুন", "Check Phone Number")}
                </Label>
                <div className="flex gap-2">
                  <Input placeholder={t("ফোন নম্বর (017XXXXXXXX)", "Phone (017XXXXXXXX)")} value={testPhone} onChange={(e) => setTestPhone(e.target.value)} />
                  <Button onClick={handleTest} disabled={testing} size="sm" className="gap-1.5 shrink-0">
                    <Search className="w-3.5 h-3.5" />
                    {testing ? t("চেক হচ্ছে...", "Checking...") : t("চেক", "Check")}
                  </Button>
                </div>
                {testResult && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">E-COMAH Fraud Checker</p>
                    <FraudResultCard data={testResult} />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────── Steadfast Result Card ──────────────────────── */

export function SteadfastResultCard({ data, compact, highlighted }: { data: any; compact?: boolean; highlighted?: boolean }) {
  const { t } = useLanguage();

  if (!data || data.error) {
    return (
      <div className="bg-muted/50 rounded-lg p-3 border text-xs text-muted-foreground">
        {data?.error || t("ডেটা পাওয়া যায়নি", "No data found")}
      </div>
    );
  }

  const success = data.total_delivered ?? data.delivered_count ?? data.success_parcel ?? data.success ?? 0;
  const cancel = data.total_cancelled ?? data.cancelled_count ?? data.cancel_parcel ?? data.cancel ?? 0;
  const total = data.total_parcels ?? data.total_parcel ?? data.total ?? (data.volume_range ? Number(data.volume_range) : (success + cancel));
  const ratio = data.delivery_ratio ?? data.success_ratio ?? (total > 0 ? Math.round((success / total) * 100) : 0);
  const noHistory = total === 0 && !!data.message;

  const getRiskColor = (r: number) => r >= 70 ? "text-green-600" : r >= 40 ? "text-amber-600" : "text-destructive";
  const getRiskBg = (r: number) => r >= 70 ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" : r >= 40 ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800" : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800";
  const getRiskBadge = (r: number) => {
    if (noHistory) return { label: t("ইতিহাস নেই", "No history"), className: "border-border text-muted-foreground bg-muted/50" };
    if (r >= 70) return { label: t("নিরাপদ", "Safe"), className: "border-green-300 text-green-700 bg-green-50" };
    if (r >= 40) return { label: t("সতর্কতা", "Caution"), className: "border-amber-300 text-amber-700 bg-amber-50" };
    return { label: t("ঝুঁকিপূর্ণ", "Risky"), className: "border-red-300 text-red-700 bg-red-50" };
  };

  const risk = getRiskBadge(ratio);

  if (compact) {
    const wrapperClass = highlighted ? `rounded-lg p-3 border ${getRiskBg(ratio)}` : "";
    return (
      <div className={`space-y-2 ${wrapperClass}`}>
        <div className="flex items-center justify-between">
          <span className={`${highlighted ? "text-xs font-semibold text-foreground" : "text-[10px] text-muted-foreground uppercase tracking-wider"} flex items-center gap-1`}>
            <Truck className={highlighted ? "w-3.5 h-3.5" : "w-3 h-3"} /> Steadfast
          </span>
          <Badge variant="outline" className={`text-[10px] ${risk.className}`}>{risk.label}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-background/70 rounded p-1.5 text-center">
            <p className={`${highlighted ? "text-base" : "text-sm"} font-bold text-foreground`}>{total}</p>
            <p className="text-[9px] text-muted-foreground">{t("মোট", "Total")}</p>
          </div>
          <div className="bg-background/70 rounded p-1.5 text-center">
            <p className={`${highlighted ? "text-base" : "text-sm"} font-bold text-green-600`}>{success}</p>
            <p className="text-[9px] text-muted-foreground">{t("ডেলিভারি", "Delivered")}</p>
          </div>
          <div className="bg-background/70 rounded p-1.5 text-center">
            <p className={`${highlighted ? "text-base" : "text-sm"} font-bold text-destructive`}>{cancel}</p>
            <p className="text-[9px] text-muted-foreground">{t("বাতিল", "Cancel")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${ratio >= 70 ? "bg-green-500" : ratio >= 40 ? "bg-amber-500" : "bg-destructive"}`} style={{ width: `${ratio}%` }} />
          </div>
          <span className={`text-xs font-bold ${getRiskColor(ratio)}`}>{ratio}%</span>
        </div>
        {data.message && (
          <p className="text-[10px] text-muted-foreground">{data.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4 border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" /> Steadfast Direct
        </span>
        <Badge variant="outline" className={`text-xs ${risk.className}`}>{risk.label} ({ratio}%)</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-lg font-bold">{total}</p>
          <p className="text-[10px] text-muted-foreground">{t("মোট পার্সেল", "Total Parcels")}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">{success}</p>
          <p className="text-[10px] text-muted-foreground">{t("সাকসেস", "Success")}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-destructive">{cancel}</p>
          <p className="text-[10px] text-muted-foreground">{t("ক্যান্সেল", "Cancel")}</p>
        </div>
      </div>
      {data.message && (
        <p className="text-xs text-muted-foreground">{data.message}</p>
      )}
    </div>
  );
}

/* ──────────────────────── FraudResultCard (E-COMAH) ──────────────────────── */

export function FraudResultCard({ data, compact }: { data: any; compact?: boolean }) {
  const { t } = useLanguage();

  if (!data || data.error) {
    return (
      <div className="bg-muted/50 rounded-lg p-3 border text-xs text-muted-foreground">
        {data?.error || t("ডেটা পাওয়া যায়নি", "No data found")}
      </div>
    );
  }

  const d = data?.fraudchecker_data || data;

  // Support E-COMAH response format
  const totalOrders = d.total_orders ?? 0;
  const totalReceived = d.total_received ?? 0;
  const successRate = d.success_rate ?? (totalOrders > 0 ? Math.round((totalReceived / totalOrders) * 100) : 0);
  const courierBreakdown = d.courier_breakdown || [];

  // Also support old format
  const courierDataObj = d.courierData || {};
  const summary = courierDataObj.summary;
  const totalParcels = summary?.total_parcels ?? summary?.total_parcel ?? d.total_parcels ?? totalOrders;
  const totalDelivered = summary?.successful_deliveries ?? summary?.success_parcel ?? d.total_delivered ?? totalReceived;
  const totalCancel = summary?.cancelled_deliveries ?? summary?.cancelled_parcel ?? d.total_cancel ?? (totalParcels - totalDelivered);
  const rate = summary?.success_rate
    ? parseFloat(summary.success_rate)
    : summary?.success_ratio
    ? parseFloat(summary.success_ratio)
    : successRate;

  const getRiskColor = (r: number) => r >= 70 ? "text-green-600" : r >= 40 ? "text-amber-600" : "text-destructive";
  const getRiskBadge = (r: number) => {
    if (totalParcels === 0) return { label: t("ইতিহাস নেই", "No history"), className: "border-border text-muted-foreground bg-muted/50" };
    if (r >= 70) return { label: t("নিরাপদ", "Safe"), className: "border-green-300 text-green-700 bg-green-50" };
    if (r >= 40) return { label: t("সতর্কতা", "Caution"), className: "border-amber-300 text-amber-700 bg-amber-50" };
    return { label: t("ঝুঁকিপূর্ণ", "Risky"), className: "border-red-300 text-red-700 bg-red-50" };
  };

  const risk = getRiskBadge(rate);

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3 h-3" /> E-COMAH
          </span>
          <Badge variant="outline" className={`text-[10px] ${risk.className}`}>{risk.label}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-muted/50 rounded p-1.5 text-center">
            <p className="text-sm font-bold text-foreground">{totalParcels}</p>
            <p className="text-[9px] text-muted-foreground">{t("মোট", "Total")}</p>
          </div>
          <div className="bg-muted/50 rounded p-1.5 text-center">
            <p className="text-sm font-bold text-green-600">{totalDelivered}</p>
            <p className="text-[9px] text-muted-foreground">{t("রিসিভ", "Received")}</p>
          </div>
          <div className="bg-muted/50 rounded p-1.5 text-center">
            <p className="text-sm font-bold text-destructive">{totalCancel}</p>
            <p className="text-[9px] text-muted-foreground">{t("বাতিল", "Cancel")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${rate >= 70 ? "bg-green-500" : rate >= 40 ? "bg-amber-500" : "bg-destructive"}`} style={{ width: `${rate}%` }} />
          </div>
          <span className={`text-xs font-bold ${getRiskColor(rate)}`}>{rate}%</span>
        </div>
        {/* Courier Breakdown in compact mode */}
        {(() => {
          const items: { name: string; total: number; success: number }[] = [];
          if (courierBreakdown.length > 0) {
            courierBreakdown.forEach((c: any) => {
              const t = c.orders ?? 0;
              if (t > 0) items.push({ name: c.courier, total: t, success: c.received ?? 0 });
            });
          } else if (courierDataObj.couriers?.length > 0) {
            courierDataObj.couriers.forEach((c: any) => {
              const t = c.total_parcels ?? c.total ?? 0;
              if (t > 0) items.push({ name: c.courier_name ?? c.name ?? c.courier, total: t, success: c.successful_deliveries ?? c.success ?? 0 });
            });
          }
          if (items.length === 0) return null;
          return (
            <div className="space-y-1.5 pt-1 border-t border-border/50">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("কুরিয়ার ভিত্তিক", "By Courier")}</p>
              {items.map((c, i) => {
                const pct = c.total > 0 ? Math.round((c.success / c.total) * 100) : 0;
                return (
                  <div key={i} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-foreground flex items-center gap-1">
                        <Truck className="w-2.5 h-2.5" /> {c.name}
                      </span>
                      <span className="text-muted-foreground">
                        {c.success}/{c.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-destructive"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[9px] font-semibold ${getRiskColor(pct)}`}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4 border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> E-COMAH Fraud Checker
        </span>
        <Badge variant="outline" className={`text-xs ${risk.className}`}>{risk.label} ({rate}%)</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-lg font-bold">{totalParcels}</p>
          <p className="text-[10px] text-muted-foreground">{t("মোট অর্ডার", "Total Orders")}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">{totalDelivered}</p>
          <p className="text-[10px] text-muted-foreground">{t("রিসিভ", "Received")}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-destructive">{totalCancel}</p>
          <p className="text-[10px] text-muted-foreground">{t("বাতিল/রিটার্ন", "Cancel/Return")}</p>
        </div>
      </div>
      {/* Courier Breakdown */}
      {courierBreakdown.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("কুরিয়ার ভিত্তিক", "By Courier")}</p>
          {courierBreakdown.map((c: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-foreground flex items-center gap-1">
                <Truck className="w-3 h-3" /> {c.courier}
              </span>
              <span className="text-muted-foreground">
                {c.received}/{c.orders} ({c.orders > 0 ? Math.round((c.received / c.orders) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
