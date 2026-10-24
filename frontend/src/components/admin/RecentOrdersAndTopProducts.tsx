import { API_URL } from "@/config/env";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ShoppingBag, TrendingUp, Loader2, Trophy } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  printed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  entry_done: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-cyan-100 text-cyan-800 border-cyan-200",
  on_the_way: "bg-cyan-100 text-cyan-800 border-cyan-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  hold: "bg-orange-100 text-orange-800 border-orange-200",
  return: "bg-slate-200 text-slate-700 border-slate-300",
};

function statusClass(s: string) {
  return STATUS_COLORS[s] || "bg-slate-100 text-slate-700 border-slate-200";
}

type TopOrderPeriod = "1d" | "7d" | "30d" | "2y" | "lifetime";

const TOP_ORDER_PERIODS: { value: TopOrderPeriod; bn: string; en: string }[] = [
  { value: "1d", bn: "১ দিন", en: "1 Day" },
  { value: "7d", bn: "৭ দিন", en: "7 Days" },
  { value: "30d", bn: "৩০ দিন", en: "30 Days" },
  { value: "2y", bn: "২ বছর", en: "2 Years" },
  { value: "lifetime", bn: "লাইফটাইম", en: "Lifetime" },
];

function getPeriodStart(period: TopOrderPeriod) {
  if (period === "lifetime") return null;
  const start = new Date();
  const days = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 730;
  start.setDate(start.getDate() - days);
  return start.toISOString();
}

export default function RecentOrdersAndTopProducts() {
  const { t } = useLanguage();
  const [topOrderPeriod, setTopOrderPeriod] = useState<TopOrderPeriod>("30d");

  // Overview Analytics from PHP API
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["overview-analytics-php"],
    refetchInterval: 60_000,
    staleTime: 60_000,
    queryFn: async () => {
      const url = API_URL;
      const res = await fetch(`${url}/analytics/overview.php`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const recentOrders = analyticsData?.recent_orders || [];
  const loadingOrders = loadingAnalytics;

  const topProducts = analyticsData?.top_products || [];
  const loadingTop = loadingAnalytics;

  // Highest-value orders (calculated from local orders list)
  const allOrders = analyticsData?.orders || [];
  const loadingTopOrders = loadingAnalytics;
  const topOrders = (() => {
    const periodStart = getPeriodStart(topOrderPeriod);
    let list = [...allOrders];
    if (periodStart) {
      const startMs = new Date(periodStart).getTime();
      list = list.filter((o: any) => new Date(o.created_at).getTime() >= startMs);
    }
    return list
      .sort((a: any, b: any) => (Number(b.total_amount) || 0) - (Number(a.total_amount) || 0))
      .slice(0, 10);
  })();

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            {t("সাম্প্রতিক অর্ডার", "Recent Orders")}
          </CardTitle>
          <Link to="/admin/orders/list" className="text-xs text-primary hover:underline">
            {t("সব দেখুন", "View Orders")}
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !recentOrders?.length ? (
            <div className="text-center text-xs text-muted-foreground py-8">
              {t("কোনো অর্ডার নেই", "No orders yet")}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((o: any) => (
                <li key={o.id}>
                  <Link
                    to={`/admin/orders/edit/${o.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-foreground">
                          #{o.order_id}
                        </span>
                        <span className="text-muted-foreground">
                          {format(new Date(o.created_at), "dd MMM yyyy | hh:mm a")}
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-foreground truncate mt-0.5">
                        {o.customer_name || "—"}
                      </p>
                      {o.address && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {o.address}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize shrink-0 ${statusClass(o.status)}`}
                    >
                      {(o.status || "").replace(/_/g, " ")}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {t("টপ সেলিং প্রোডাক্ট", "Top Selling Products")}
          </CardTitle>
          <span className="text-xs text-muted-foreground">{t("সর্বকালের", "All-time")}</span>
        </CardHeader>
        <CardContent className="p-0">
          {loadingTop ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !topProducts?.length ? (
            <div className="text-center text-xs text-muted-foreground py-8">
              {t("কোনো অর্ডার নেই", "No orders yet")}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {topProducts.map((p, idx) => (
                <li key={p.product_id || idx} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      ৳{Math.round(p.revenue).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      {p.qty}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t("বিক্রিত", "sold")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Highest-value Orders */}
      <Card>
        <CardHeader className="pb-2 space-y-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            {t("সর্বোচ্চ টাকার অর্ডার", "Highest-value Orders")}
          </CardTitle>
          <div className="flex flex-wrap gap-1">
            {TOP_ORDER_PERIODS.map((period) => (
              <Button
                key={period.value}
                type="button"
                size="sm"
                variant={topOrderPeriod === period.value ? "default" : "outline"}
                className="h-7 px-2 text-[10px]"
                onClick={() => setTopOrderPeriod(period.value)}
              >
                {t(period.bn, period.en)}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingTopOrders ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !topOrders?.length ? (
            <div className="text-center text-xs text-muted-foreground py-8">
              {t("এই সময়ে কোনো অর্ডার নেই", "No orders in this period")}
            </div>
          ) : (
            <ul className="divide-y divide-border max-h-[520px] overflow-y-auto">
              {topOrders.map((o: any, idx) => (
                <li key={o.id}>
                  <Link
                    to={`/admin/orders/edit/${o.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-foreground truncate">
                        #{o.order_id} · {o.customer_name || "—"}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-[9px] capitalize ${statusClass(o.status)}`}
                      >
                        {(o.status || "").replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-primary tabular-nums shrink-0">
                      ৳{Math.round(Number(o.total_amount) || 0).toLocaleString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
