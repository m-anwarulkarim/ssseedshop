import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Copy, ExternalLink, Check, Search, Sparkles,
  Package, ShoppingBag, Eye, Link as LinkIcon, QrCode, RefreshCw, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface LandingPageDef {
  id: string;
  nameBn: string;
  nameEn: string;
  path: string;
  altPaths?: string[];
  sku: string;
  categoryBn: string;
  descriptionBn: string;
  badgeBn: string;
  badgeColor: string;
}

const LANDING_PAGES: LandingPageDef[] = [
  {
    id: "pudina",
    nameBn: "হাইব্রিড পুদিনা পাতার বীজ ল্যান্ডিং পেজ",
    nameEn: "Hybrid Pudina Leaf Seeds Landing Page",
    path: "/lp/pudina",
    altPaths: ["/lp/pudina-pata"],
    sku: "VAG-1534",
    categoryBn: "সবজি বীজ",
    descriptionBn: "স্পেশাল প্যাকেজ অফার, কাউন্টডাউন টাইমার ও রিভিউ সহ প্রিমিয়াম পুদিনা ল্যান্ডিং পেজ",
    badgeBn: "জনপ্রিয় পেজ",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  {
    id: "cosmos",
    nameBn: "চায়না ইম্পোর্টেড হাইব্রিড কসমস ফুলের বীজ ল্যান্ডিং পেজ",
    nameEn: "China Imported Cosmos Flower Seeds Landing Page",
    path: "/lp/cosmos",
    sku: "FUL-1502",
    categoryBn: "ফুলের বীজ",
    descriptionBn: "মিক্স কালার কসমস ফুলের জন্য কালারফুল রিচ ডিজাইন ল্যান্ডিং পেজ",
    badgeBn: "ফুলের স্পেশাল",
    badgeColor: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  },
  {
    id: "mint-leaf",
    nameBn: "মিন্ট লিফ বীজ সিঙ্গেল অর্ডার ল্যান্ডিং পেজ",
    nameEn: "Mint Leaf Seeds Single Form Landing Page",
    path: "/lp/mint-leaf-seeds",
    altPaths: ["/mint-leaf-seeds"],
    sku: "VAG-1534",
    categoryBn: "সবজি বীজ",
    descriptionBn: "সহজ ও দ্রুত অর্ডারের জন্য ক্লাসিক্যাল মিন্ট সিড ল্যান্ডিং পেজ",
    badgeBn: "ফাস্ট অর্ডার",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
];

export default function LandingPagesList() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ open: boolean; title: string; url: string }>({
    open: false,
    title: "",
    url: "",
  });

  // Fetch product data corresponding to landing page SKUs
  const { data: productsMap, isLoading: productsLoading, refetch } = useQuery({
    queryKey: ["landing-page-products-data"],
    queryFn: async () => {
      const skus = Array.from(new Set(LANDING_PAGES.map((lp) => lp.sku)));
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, stock, regular_price, offer_price, product_image")
        .in("sku", skus);
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((p) => {
        map[p.sku] = p;
      });
      return map;
    },
  });

  const origin = window.location.origin;

  const handleCopyLink = (path: string) => {
    const fullUrl = `${origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedPath(path);
    toast.success(t("লিঙ্ক কপি করা হয়েছে!", "Link copied to clipboard!"));
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleShowQr = (name: string, path: string) => {
    const fullUrl = `${origin}${path}`;
    setQrModal({ open: true, title: name, url: fullUrl });
  };

  const filteredPages = LANDING_PAGES.filter(
    (lp) =>
      lp.nameBn.toLowerCase().includes(search.toLowerCase()) ||
      lp.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      lp.path.toLowerCase().includes(search.toLowerCase()) ||
      lp.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Globe className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("ল্যান্ডিং পেজসমূহ", "Landing Pages")}
            </h1>
            <Badge variant="outline" className="ml-2 font-mono">
              {LANDING_PAGES.length} {t("টি পেজ", "Pages")}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {t(
              "ওয়েবসাইটের সকল স্পেশাল ল্যান্ডিং পেজের লিঙ্ক, প্রোডাক্ট তথ্য ও লাইব প্রিভিউ এখান থেকে দেখুন এবং কপি করুন।",
              "View and copy links, product details, and live previews of all landing pages."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("রিফ্রেশ", "Refresh")}
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("ল্যান্ডিং পেজের নাম, পাথ বা SKU দিয়ে খুঁজুন...", "Search landing page name, path or SKU...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Landing Pages Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map((lp) => {
          const product = productsMap?.[lp.sku];
          const fullUrl = `${origin}${lp.path}`;
          const isCopied = copiedPath === lp.path;
          const hasStock = (product?.stock ?? 0) > 0;

          return (
            <Card key={lp.id} className="group hover:shadow-md transition-all border-muted/80 flex flex-col">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className={lp.badgeColor}>
                    {lp.badgeBn}
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    SKU: {lp.sku}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold leading-snug mt-2 group-hover:text-emerald-600 transition-colors">
                  {lp.nameBn}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {lp.descriptionBn}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                {/* Target Product Box */}
                <div className="bg-muted/40 p-3 rounded-xl border flex items-center gap-3 mt-2">
                  {product?.product_image ? (
                    <img
                      src={product.product_image}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover border bg-background"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      <Package className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {product?.name || t("প্রোডাক্ট লোড হচ্ছে...", "Loading product...")}
                    </p>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-emerald-600 font-bold">
                        ৳{product?.offer_price || product?.regular_price || "0"}
                      </span>
                      {product && (
                        <Badge
                          variant="outline"
                          className={
                            hasStock
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                              : "bg-destructive/10 text-destructive border-destructive/20 text-[10px]"
                          }
                        >
                          {hasStock ? `${product.stock} টি স্টকে আছে` : "স্টক আউট"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Path display */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("ল্যান্ডিং পেজ URL", "Landing Page URL")}
                  </label>
                  <div className="flex items-center gap-1.5 bg-background border p-2 rounded-lg font-mono text-xs overflow-hidden">
                    <LinkIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate text-foreground select-all">{fullUrl}</span>
                  </div>

                  {lp.altPaths && lp.altPaths.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span>{t("বিকল্প পাথ:", "Alt paths:")}</span>
                      {lp.altPaths.map((ap) => (
                        <code key={ap} className="bg-muted px-1 rounded font-mono text-[10px]">
                          {ap}
                        </code>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <Button
                    variant={isCopied ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCopyLink(lp.path)}
                    className="w-full gap-1 text-xs"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>কপিড</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>কপি লিঙ্ক</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full gap-1 text-xs hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
                  >
                    <a href={lp.path} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>ভিজিট</span>
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowQr(lp.nameBn, lp.path)}
                    className="w-full gap-1 text-xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR কোড</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrModal.open} onOpenChange={(open) => setQrModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-center">{qrModal.title}</DialogTitle>
            <DialogDescription className="text-center font-mono text-xs break-all">
              {qrModal.url}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border my-2">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrModal.url)}`}
              alt="QR Code"
              className="w-48 h-48 rounded-xl border bg-white p-2 shadow-sm"
            />
            <p className="text-xs text-muted-foreground mt-3">
              ক্যামেরা দিয়ে স্ক্যান করে সরাসরি ল্যান্ডিং পেজে প্রবেশ করুন
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="flex-1 gap-2"
              onClick={() => {
                navigator.clipboard.writeText(qrModal.url);
                toast.success("লিঙ্ক কপি করা হয়েছে!");
              }}
            >
              <Copy className="w-4 h-4" />
              লিঙ্ক কপি করুন
            </Button>
            <Button variant="outline" asChild className="flex-1 gap-2">
              <a href={qrModal.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                পেজে যান
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
