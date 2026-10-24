import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

import { deleteEcomahApiKey, ECOMAH_SETTING_KEY, saveEcomahApiKey } from "@/lib/ecomahSettings";
import { checkEcomahBalance, sendEcomahSms, type EcomahBalanceData } from "@/lib/ecomahClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Check, Eye, EyeOff, Save, Loader2, Settings, MessageSquare,
  Wallet, Send, Trash2, RefreshCw, ShieldCheck, AlertCircle
} from "lucide-react";

export function SmsApiDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [savingKeys, setSavingKeys] = useState(false);
  const [editingKeys, setEditingKeys] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [balance, setBalance] = useState<EcomahBalanceData | null>(null);

  // Test SMS
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("Ss Seed Shop টেস্ট মেসেজ। সফলভাবে এসএমএস পাঠানো হয়েছে!");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const { data: savedKey, isLoading } = useQuery({
    queryKey: ["app-settings-ecomah"],
    enabled: open,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${url}/settings/get.php?keys=${ECOMAH_SETTING_KEY}`);
      const data = await res.json();
      return data?.[0]?.value || "";
    },
  });

  const hasKeys = !!savedKey;

  // Auto-fetch balance on opening if key exists
  useEffect(() => {
    if (open && savedKey && !balance && !checkingBalance) {
      handleCheckBalance(savedKey);
    }
  }, [open, savedKey]);

  const startEditing = () => {
    setEditingKeys(true);
    setApiKey(savedKey || "");
  };

  const handleSaveKeys = async () => {
    if (!apiKey.trim()) {
      toast.error(t("API Key প্রয়োজন", "API Key is required"));
      return;
    }
    setSavingKeys(true);
    try {
      await saveEcomahApiKey(apiKey);
      queryClient.invalidateQueries({ queryKey: ["app-settings-ecomah"] });
      queryClient.invalidateQueries({ queryKey: ["ecomah-status"] });
      toast.success(t("E-COMAH API কনফিগার হয়েছে", "E-COMAH API configured"));
      setApiKey("");
      setEditingKeys(false);
      handleCheckBalance(apiKey.trim());
    } catch {
      toast.error(t("সেভ ব্যর্থ", "Save failed"));
    } finally {
      setSavingKeys(false);
    }
  };

  const handleDeleteKeys = async () => {
    try {
      await deleteEcomahApiKey();
      queryClient.invalidateQueries({ queryKey: ["app-settings-ecomah"] });
      queryClient.invalidateQueries({ queryKey: ["ecomah-status"] });
      toast.success(t("API Key ডিলিট হয়েছে", "API Key deleted"));
      setBalance(null);
    } catch {
      toast.error(t("ডিলিট ব্যর্থ", "Delete failed"));
    }
  };

  const handleCheckBalance = async (keyOverride?: string) => {
    const key = keyOverride || savedKey;
    if (!key) return;
    setCheckingBalance(true);
    try {
      const data = await checkEcomahBalance(key);
      if (data && data.success) {
        setBalance(data);
        toast.success(t("ব্যালেন্স তথ্য আপডেট হয়েছে", "Balance info updated"));
      } else {
        setBalance(data);
        toast.error(data?.error || t("ব্যালেন্স চেক ব্যর্থ", "Balance check failed"));
      }
    } catch (err: any) {
      toast.error(err?.message || t("ব্যালেন্স চেক ব্যর্থ", "Balance check failed"));
    } finally {
      setCheckingBalance(false);
    }
  };

  const handleSendTest = async () => {
    if (!testNumber.trim() || !testMessage.trim()) {
      toast.error(t("নম্বর ও মেসেজ প্রয়োজন", "Number and message required"));
      return;
    }
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendEcomahSms({
        phone: testNumber,
        message: testMessage,
        reason: "manual_test",
        providedKey: savedKey,
      });

      setTestResult(res?.result || res);
      if (res?.success) {
        toast.success(t("✓ SMS সফলভাবে পাঠানো হয়েছে!", "SMS sent successfully!"));
        // Auto refresh balance after sending
        setTimeout(() => handleCheckBalance(), 1000);
      } else {
        toast.error(`Error: ${res?.error || "SMS পাঠাতে ব্যর্থ"}`);
      }
    } catch (err: any) {
      toast.error(err?.message || t("SMS পাঠানো ব্যর্থ", "Failed to send SMS"));
    } finally {
      setSendingTest(false);
    }
  };

  const maskValue = (val: string) => {
    if (!val) return "";
    if (val.length <= 8) return "••••••••";
    return val.substring(0, 4) + "••••" + val.substring(val.length - 4);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t("E-COMAH SMS API", "E-COMAH SMS API")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : null}

          {/* Configured View */}
          {hasKeys && !editingKeys ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
                        {t("E-COMAH API কনফিগার করা আছে", "E-COMAH API configured")}
                      </span>
                      <p className="text-xs text-muted-foreground font-mono">
                        API Key: {maskValue(savedKey || "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" onClick={startEditing} className="gap-1.5 h-8">
                      <Settings className="w-3.5 h-3.5" />
                      {t("এডিট", "Edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteKeys}
                      className="gap-1.5 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                {hasKeys ? t("API Key এডিট", "Edit API Key") : t("API Key যোগ করুন", "Add API Key")}
              </Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="E-COMAH API Key (যেমন: ek_...)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-9 font-mono text-sm"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t(
                  "একটি E-COMAH API Key দিয়ে গ্রাহক SMS এবং ফ্রড চেকার উভয়ই স্বয়ংক্রিয়ভাবে কাজ করবে",
                  "Single E-COMAH API Key powers both SMS notifications and Fraud Checker"
                )}
              </p>
              <div className="flex gap-2">
                <Button onClick={handleSaveKeys} disabled={savingKeys} size="sm" className="gap-1.5">
                  {savingKeys ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {savingKeys ? t("সেভ হচ্ছে...", "Saving...") : t("সেভ করুন", "Save")}
                </Button>
                {hasKeys && (
                  <Button variant="ghost" size="sm" onClick={() => { setEditingKeys(false); setApiKey(""); }}>
                    {t("বাতিল", "Cancel")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Balance Check Section */}
          {hasKeys && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                  {t("ক্রেডিট ব্যালেন্স ও কোটা", "Credit Balance & Quota")}
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCheckBalance()}
                  disabled={checkingBalance}
                  className="gap-1.5 h-8 text-xs font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingBalance ? "animate-spin" : ""}`} />
                  {checkingBalance ? t("চেক হচ্ছে...", "Checking...") : t("ব্যালেন্স চেক", "Check Balance")}
                </Button>
              </div>

              {/* Guarded balance card rendering — guarantees ZERO raw "0" is output */}
              {Boolean(balance && typeof balance === "object" && balance.success) && balance?.sms && (
                <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      {balance.label || "Ss Seed Shop"} Gateway
                    </span>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] bg-emerald-50/50 dark:bg-emerald-950/30">
                      সক্রিয় গেটওয়ে
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* SMS Credits */}
                    <div className="rounded-lg border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/10 p-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        SMS ক্রেডিট
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center pt-1">
                        <div className="p-2 rounded bg-background border shadow-xs">
                          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                            {balance.sms.remaining}
                          </p>
                          <p className="text-[10px] font-medium text-muted-foreground">{t("বাকি SMS", "Remaining")}</p>
                        </div>
                        <div className="p-2 rounded bg-background border shadow-xs">
                          <p className="text-lg font-bold text-foreground">
                            {balance.sms.used}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{t("ব্যবহৃত", "Used")}</p>
                        </div>
                        <div className="p-2 rounded bg-background border shadow-xs">
                          <p className="text-lg font-bold text-foreground">
                            {balance.sms.limit}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{t("মোট কোটা", "Total")}</p>
                        </div>
                      </div>
                    </div>

                    {/* Fraud Credits */}
                    {balance.fraud && (
                      <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          🛡️ Fraud Check ক্রেডিট
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center pt-1">
                          <div className="p-2 rounded bg-background border shadow-xs">
                            <p className="text-lg font-bold text-primary">
                              {balance.fraud.remaining}
                            </p>
                            <p className="text-[10px] font-medium text-muted-foreground">{t("বাকি চেক", "Remaining")}</p>
                          </div>
                          <div className="p-2 rounded bg-background border shadow-xs">
                            <p className="text-lg font-bold text-foreground">
                              {balance.fraud.used}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{t("ব্যবহৃত", "Used")}</p>
                          </div>
                          <div className="p-2 rounded bg-background border shadow-xs">
                            <p className="text-lg font-bold text-foreground">
                              {balance.fraud.limit}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{t("মোট কোটা", "Total")}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error box if balance check failed */}
              {Boolean(balance && typeof balance === "object" && !balance.success) && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{t("ব্যালেন্স লোড করা যায়নি", "Failed to load balance")}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {balance?.error || "অনুগ্রহ করে API Key সঠিক কিনা যাচাই করুন।"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Test SMS Section */}
          {hasKeys && (
            <div className="space-y-3 border-t pt-4">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-primary" />
                {t("টেস্ট SMS পাঠান", "Send Test SMS")}
              </Label>
              <div className="space-y-3">
                <Input
                  placeholder={t("মোবাইল নম্বর (01XXXXXXXXX)", "Mobile number (01XXXXXXXXX)")}
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  className="font-mono text-sm"
                />
                <Textarea
                  placeholder={t("মেসেজ লিখুন...", "Type your message...")}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
                <Button onClick={handleSendTest} disabled={sendingTest} size="sm" className="gap-1.5">
                  {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {sendingTest ? t("পাঠানো হচ্ছে...", "Sending...") : t("টেস্ট SMS পাঠান", "Send Test SMS")}
                </Button>
                {testResult && (
                  <div className="bg-muted/50 rounded-lg p-3 border">
                    <p className="text-xs font-semibold text-foreground mb-1">{t("রেসপন্স স্ট্যাটাস", "Response Status")}</p>
                    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-muted/40 rounded-xl p-3.5 border text-xs space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              📋 {t("নির্দেশনা ও নিয়ম", "Instructions & Guidelines")}
            </p>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside pt-1">
              <li>{t("একটি E-COMAH API Key দিয়ে অর্ডার নোটিফিকেশন SMS এবং Fraud Checker উভয়ই কাজ করে।", "Single E-COMAH API Key powers order notifications and fraud checker.")}</li>
              <li>{t("ব্যালেন্স চেক বাটনে ক্লিক করলে রিয়েল-টাইম অবশিষ্ট SMS সংখ্যা দেখতে পাবেন।", "Click Check Balance to see real-time remaining SMS quota.")}</li>
              <li>{t("ইংরেজি SMS: ১৬০ অক্ষর/পার্ট, বাংলা: ৭০ অক্ষর/পার্ট।", "English SMS: 160 chars/part, Bangla: 70 chars/part.")}</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
