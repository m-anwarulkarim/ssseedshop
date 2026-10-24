import { API_URL } from "@/config/env";
import { useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Download, Upload, Loader2, Package, ShoppingCart, Users,
  BookOpen, Tag, FileSpreadsheet, CheckCircle2, AlertCircle, HardDrive,
} from "lucide-react";

const API_BASE = API_URL;

interface TableConfig {
  key: string;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  table: string;
  columns: string[];
  uniqueKey?: string;
}

const TABLE_CONFIGS: TableConfig[] = [
  {
    key: "products",
    label: "পণ্য তালিকা",
    labelEn: "Products",
    icon: Package,
    table: "products.json",
    columns: ["name","sku","category","subcategory","regular_price","offer_price","buying_price","stock","is_hidden","tags","short_description","full_description","product_image"],
    uniqueKey: "sku",
  },
  {
    key: "coupons",
    label: "কুপন তালিকা",
    labelEn: "Coupons",
    icon: Tag,
    table: "coupons.json",
    columns: ["code","discount_type","discount_value","min_order_amount","max_discount_amount","usage_limit","is_active","starts_at","expires_at"],
    uniqueKey: "code",
  },
  {
    key: "categories",
    label: "ক্যাটাগরি",
    labelEn: "Categories",
    icon: BookOpen,
    table: "categories.json",
    columns: ["name","display_name","description","image","position"],
    uniqueKey: "name",
  },
  {
    key: "orders_all",
    label: "সকল অর্ডার",
    labelEn: "All Orders",
    icon: ShoppingCart,
    table: "orders.json",
    columns: ["order_id","customer_name","phone","alt_phone","address","district","thana","delivery_area","status","total_amount","delivery_charge","advance","discount","note","tracking_code","created_at"],
    uniqueKey: "order_id",
  },
  {
    key: "order_items",
    label: "অর্ডার আইটেম",
    labelEn: "Order Items",
    icon: ShoppingCart,
    table: "orders.json",
    columns: ["order_id","product_id","product_name","product_image","quantity","unit_price","created_at"],
  },
  {
    key: "customers",
    label: "কাস্টমার তালিকা",
    labelEn: "Customer List",
    icon: Users,
    table: "customers.json",
    columns: ["phone","name","alt_phone","address","district","thana","total_orders","total_spent","created_at"],
    uniqueKey: "phone",
  },
];

export default function ImportExport() {
  const { t } = useLanguage();
  const [exporting, setExporting] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastResult, setLastResult] = useState<{ key: string; message: string; type: "success" | "error" } | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Full Backup / Restore States
  const [fullBackingUp, setFullBackingUp] = useState(false);
  const [fullRestoring, setFullRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState("");
  const fullRestoreRef = useRef<HTMLInputElement>(null);

  // Single Table CSV Export
  const handleExport = async (config: TableConfig) => {
    setExporting(config.key);
    setProgress(20);
    try {
      const res = await fetch(`${API_BASE}/backup/import_export.php?table=${config.key}&format=csv&download=1`);
      if (!res.ok) throw new Error(t("এক্সপোর্ট ব্যর্থ", "Export failed"));

      setProgress(60);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.key}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      const msg = t("CSV ফাইল সফলভাবে এক্সপোর্ট হয়েছে", "CSV exported successfully");
      setLastResult({ key: config.key, message: msg, type: "success" });
      toast.success(msg);
    } catch (err: any) {
      setLastResult({ key: config.key, message: err.message || t("এক্সপোর্ট ব্যর্থ", "Export failed"), type: "error" });
      toast.error(err.message || t("এক্সপোর্ট ব্যর্থ", "Export failed"));
    } finally {
      setTimeout(() => {
        setExporting(null);
        setProgress(0);
      }, 500);
    }
  };

  // Single Table CSV / JSON Import
  const handleImport = async (config: TableConfig, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(config.key);
    setProgress(30);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("table", config.key);

      setProgress(60);
      const res = await fetch(`${API_BASE}/backup/import_export.php`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || t("ইমপোর্ট ব্যর্থ", "Import failed"));

      setProgress(100);
      const msg = result.message || t(
        `ইমপোর্ট সম্পন্ন: ${result.inserted} নতুন, ${result.updated} আপডেট`,
        `Import done: ${result.inserted} new, ${result.updated} updated`
      );
      setLastResult({ key: config.key, message: msg, type: result.errors > 0 ? "error" : "success" });
      toast.success(msg);
    } catch (err: any) {
      setLastResult({ key: config.key, message: err.message || t("ইমপোর্ট ব্যর্থ", "Import failed"), type: "error" });
      toast.error(err.message || t("ইমপোর্ট ব্যর্থ", "Import failed"));
    } finally {
      setImporting(null);
      setProgress(0);
      const ref = fileRefs.current[config.key];
      if (ref) ref.value = "";
    }
  };

  // Full Backup (JSON)
  const handleFullBackup = async () => {
    setFullBackingUp(true);
    try {
      const res = await fetch(`${API_BASE}/backup/import_export.php?action=full_backup&download=1`);
      if (!res.ok) throw new Error(t("ব্যাকআপ ফাইল সংগ্রহে ত্রুটি", "Failed generating backup"));

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `full-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t("সম্পূর্ণ ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে", "Full backup downloaded successfully"));
    } catch (err: any) {
      toast.error(err.message || t("ব্যাকআপ ব্যর্থ", "Backup failed"));
    } finally {
      setFullBackingUp(false);
    }
  };

  // Full Restore (JSON)
  const handleFullRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(t(
      "⚠️ রিস্টোর করলে বিদ্যমান ডেটা মার্জ ও আপডেট হতে পারে। আপনি কি নিশ্চিত?",
      "⚠️ Restoring will merge and update existing data. Are you sure?"
    ))) {
      if (fullRestoreRef.current) fullRestoreRef.current.value = "";
      return;
    }

    setFullRestoring(true);
    setRestoreProgress(t("রিস্টোর হচ্ছে...", "Restoring..."));

    try {
      const formData = new FormData();
      formData.append("backup_file", file);
      formData.append("action", "full_restore");

      const res = await fetch(`${API_BASE}/backup/import_export.php`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || t("রিস্টোর ব্যর্থ", "Restore failed"));

      const summary = result.results
        ? Object.entries(result.results).map(([k, v]) => `${k}: ${v}`).join(", ")
        : "";

      toast.success(t(
        `সম্পূর্ণ ডেটাবেস সফলভাবে রিস্টোর হয়েছে (${summary})`,
        `Database restored successfully (${summary})`
      ));
    } catch (err: any) {
      toast.error(err.message || t("রিস্টোর ব্যর্থ", "Restore failed"));
    } finally {
      setFullRestoring(false);
      setRestoreProgress("");
      if (fullRestoreRef.current) fullRestoreRef.current.value = "";
    }
  };

  const groupedConfigs = [
    {
      title: t("পণ্য ও কুপন", "Products & Coupons"),
      items: TABLE_CONFIGS.filter(c => ["products", "coupons", "categories"].includes(c.key)),
    },
    {
      title: t("অর্ডার ম্যানেজমেন্ট", "Orders Management"),
      items: TABLE_CONFIGS.filter(c => c.key.startsWith("order")),
    },
    {
      title: t("গ্রাহক তথ্য", "Customers"),
      items: TABLE_CONFIGS.filter(c => c.key === "customers"),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{t("ডাটা ব্যাকআপ ও ইমপোর্ট/এক্সপোর্ট", "Data Backup, Import & Export")}</h1>
          <p className="text-xs text-muted-foreground">
            {t("লোকাল JSON ডাটাবেস থেকে এক ক্লিকে ফুল ব্যাকআপ, রিস্টোর ও CSV ফাইল ট্র্যান্সফার করুন।", "One-click full backup, restore and CSV transfers from local JSON database.")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleFullBackup} disabled={fullBackingUp || fullRestoring} className="gap-2">
            {fullBackingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
            {t("সম্পূর্ণ ব্যাকআপ", "Full Backup")}
          </Button>
          <Button
            variant="outline"
            onClick={() => fullRestoreRef.current?.click()}
            disabled={fullBackingUp || fullRestoring}
            className="gap-2"
          >
            {fullRestoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {fullRestoring ? (restoreProgress || t("রিস্টোর হচ্ছে...", "Restoring...")) : t("সম্পূর্ণ রিস্টোর", "Full Restore")}
          </Button>
          <input
            ref={fullRestoreRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFullRestore}
          />
        </div>
      </div>

      {/* Grouped Table Cards */}
      {groupedConfigs.map((group) => (
        <div key={group.title} className="space-y-3">
          <h2 className="text-lg font-display font-semibold text-foreground">{group.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.items.map((config) => {
              const Icon = config.icon;
              const isExp = exporting === config.key;
              const isImp = importing === config.key;
              const result = lastResult?.key === config.key ? lastResult : null;

              return (
                <Card key={config.key} className="relative overflow-hidden">
                  {(isExp || isImp) && (
                    <div className="absolute bottom-0 left-0 right-0">
                      <Progress value={progress} className="h-1.5 rounded-none" />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{t(config.label, config.labelEn)}</CardTitle>
                        <CardDescription className="text-xs font-mono">
                          {config.table}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleExport(config)}
                        disabled={isExp || isImp}
                      >
                        {isExp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        {t("এক্সপোর্ট", "Export")}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => fileRefs.current[config.key]?.click()}
                        disabled={isExp || isImp}
                      >
                        {isImp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        {t("ইমপোর্ট", "Import")}
                      </Button>
                      <input
                        ref={(el) => { fileRefs.current[config.key] = el; }}
                        type="file"
                        accept=".csv,.json"
                        className="hidden"
                        onChange={(e) => handleImport(config, e)}
                      />
                    </div>

                    {result && !isImp && !isExp && (
                      <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${result.type === "success" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}>
                        {result.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        <span className="line-clamp-2">{result.message}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* CSV & JSON Format Guide */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{t("CSV ও ব্যাকআপ গাইড", "CSV & Backup Guide")}</p>
              <p>{t("• 'সম্পূর্ণ ব্যাকআপ' এ ক্লিক করলে পুরো ডাটাবেসের একটি পূর্ণাঙ্গ JSON ফাইল ডাউনলোড হবে।", "• Clicking 'Full Backup' downloads a complete JSON file of all local databases.")}</p>
              <p>{t("• এক্সপোর্ট বাটনে ক্লিক করলে বাংলা ফন্ট সাপোর্ট সহ UTF-8 ফরম্যাটে CSV ফাইল ডাউনলোড হবে।", "• Export generates UTF-8 CSV files with full Bangla font support.")}</p>
              <p>{t("• পণ্য ও কুপন ইমপোর্টের সময় SKU বা কোড মিলে গেলে স্বয়ংক্রিয়ভাবে আপডেট এবং নতুন হলে ইনসার্ট হবে।", "• Importing products and coupons updates matching SKU/Code and inserts new ones.")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
