import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingDown, Eye, ShoppingCart, CreditCard, Package, MousePointerClick } from "lucide-react";
import { subDays, format } from "date-fns";

const FUNNEL_STEPS = [
  { key: "page_view", icon: Eye, labelBn: "পেজ ভিউ", labelEn: "Page Views" },
  { key: "product_view", icon: MousePointerClick, labelBn: "পণ্য দেখা", labelEn: "Product Views" },
  { key: "add_to_cart", icon: ShoppingCart, labelBn: "কার্টে যোগ", labelEn: "Add to Cart" },
  { key: "checkout_start", icon: CreditCard, labelBn: "চেকআউট শুরু", labelEn: "Checkout Start" },
  { key: "order_placed", icon: Package, labelBn: "অর্ডার সম্পন্ন", labelEn: "Order Placed" },
];

export default function FunnelAnalytics() {
  const { t } = useLanguage();

  const { data: analytics, isLoading: funnelLoading } = useQuery({
    queryKey: ["overview-analytics-php"],
    staleTime: 60_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";
      const res = await fetch(`${url}/analytics/overview.php`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const counts: Record<string, number> = analytics?.funnel || {};
  const topProducts = analytics?.top_viewed_products || [];
  const topLoading = funnelLoading;
  const maxCount = Math.max(...FUNNEL_STEPS.map((s) => counts[s.key] || 0), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            {t("কনভার্সন ফানেল (৭ দিন)", "Conversion Funnel (7 Days)")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {funnelLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {FUNNEL_STEPS.map((step, i) => {
                const count = counts[step.key] || 0;
                const prevCount = i > 0 ? counts[FUNNEL_STEPS[i - 1].key] || 0 : 0;
                const dropRate = i > 0 && prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : null;
                const barWidth = maxCount > 0 ? Math.max((count / maxCount) * 100, 4) : 4;
                const Icon = step.icon;

                return (
                  <div key={step.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">{t(step.labelBn, step.labelEn)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{count.toLocaleString()}</span>
                        {dropRate !== null && dropRate > 0 && (
                          <span className="text-[10px] text-destructive font-medium">-{dropRate}%</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${barWidth}%`, opacity: 1 - i * 0.15 }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Conversion rate summary */}
              {(counts.page_view || 0) > 0 && (counts.order_placed || 0) >= 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("সামগ্রিক কনভার্সন রেট", "Overall Conversion Rate")}</span>
                    <span className="font-bold text-primary">
                      {((counts.order_placed || 0) / (counts.page_view || 1) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Viewed Products */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            {t("সবচেয়ে বেশি দেখা পণ্য (৭ দিন)", "Most Viewed Products (7 Days)")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !topProducts?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("এখনো কোনো ডাটা নেই", "No data yet")}
            </p>
          ) : (
            <div className="divide-y divide-border">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                    <p className="text-sm font-medium truncate">{p.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary flex-shrink-0">
                    {p.views} {t("বার", "views")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
