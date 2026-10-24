import { API_URL } from "@/config/env";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Copy, ExternalLink, Check, ArrowRight, Package } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const LANDING_PAGES = [
  {
    id: "pudina",
    nameBn: "হাইব্রিড পুদিনা পাতার বীজ",
    path: "/lp/pudina",
    sku: "VAG-1534",
    badgeBn: "জনপ্রিয়",
  },
  {
    id: "cosmos",
    nameBn: "হাইব্রিড কসমস ফুলের বীজ",
    path: "/lp/cosmos",
    sku: "FUL-1502",
    badgeBn: "ফুলের বীজ",
  },
  {
    id: "mint-leaf",
    nameBn: "মিন্ট লিফ বীজ (সিঙ্গেল ফর্ম)",
    path: "/lp/mint-leaf-seeds",
    sku: "VAG-1534",
    badgeBn: "ফাস্ট ফর্ম",
  },
];

export default function LandingPagesOverviewCard() {
  const { t } = useLanguage();
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const { data: productsMap } = useQuery({
    queryKey: ["landing-overview-products"],
    queryFn: async () => {
      const skus = Array.from(new Set(LANDING_PAGES.map((lp) => lp.sku)));
      const url = API_URL;
      const map: Record<string, any> = {};
      try {
        const res = await fetch(`${url}/products/get.php`);
        if (res.ok) {
          const prods = await res.json();
          (prods || []).forEach((p: any) => {
            if (p.sku && skus.includes(p.sku)) {
              map[p.sku] = p;
            }
          });
          if (Object.keys(map).length > 0) return map;
        }
      } catch {}

      try {
        const { data } = await supabase
          .from("products")
          .select("sku, name, stock, offer_price, regular_price, product_image")
          .in("sku", skus);
        (data || []).forEach((p) => {
          map[p.sku] = p;
        });
      } catch {}
      return map;
    },
  });

  const origin = window.location.origin;

  const handleCopyLink = (path: string) => {
    const fullUrl = `${origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedPath(path);
    toast.success(t("লিঙ্ক কপি হয়েছে!", "Link copied!"));
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <Card className="border-muted/80 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-base font-bold">
              {t("ল্যান্ডিং পেজসমূহ (Quick Links)", "Landing Pages (Quick Links)")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs mt-1">
            {t("সরাসরি লিঙ্ক কপি বা ভিজিট করুন", "Directly copy link or visit landing pages")}
          </CardDescription>
        </div>

        <Button variant="ghost" size="sm" asChild className="gap-1 text-xs text-emerald-600 hover:text-emerald-700">
          <Link to="/admin/website/landing-pages">
            <span>{t("সবগুলো দেখুন", "View All")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {LANDING_PAGES.map((lp) => {
          const product = productsMap?.[lp.sku];
          const fullUrl = `${origin}${lp.path}`;
          const isCopied = copiedPath === lp.path;
          const hasStock = (product?.stock ?? 0) > 0;

          return (
            <div
              key={lp.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {product?.product_image ? (
                  <img
                    src={product.product_image}
                    alt={lp.nameBn}
                    className="w-10 h-10 rounded-lg object-cover border bg-background shrink-0"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/placeholder.svg"; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {lp.nameBn}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {lp.badgeBn}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <code className="font-mono text-emerald-600 font-medium truncate">{fullUrl}</code>
                    <span>•</span>
                    <span className={hasStock ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>
                      {hasStock ? `${product?.stock} টি স্টক` : "স্টক আউট"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <Button
                  variant={isCopied ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCopyLink(lp.path)}
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "কপিড" : "কপি"}</span>
                </Button>

                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a href={lp.path} target="_blank" rel="noopener noreferrer" title="ভিজিট করুন">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
