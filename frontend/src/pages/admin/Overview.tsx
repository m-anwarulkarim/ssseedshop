import { API_URL } from "@/config/env";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3, ShoppingCart, Users, Package, Loader2,
  Clock, Eye, Wallet, MessageSquare, ShieldCheck,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";
import FunnelAnalytics from "@/components/admin/FunnelAnalytics";
import RecentOrdersAndTopProducts from "@/components/admin/RecentOrdersAndTopProducts";

const PERIOD_LABELS: Record<string, { bn: string; en: string }> = {
  Today: { bn: "আজ", en: "Today" },
  Yesterday: { bn: "গতকাল", en: "Yesterday" },
  "7 Days": { bn: "৭ দিন", en: "7 Days" },
  "30 Days": { bn: "৩০ দিন", en: "30 Days" },
  "1 Year": { bn: "১ বছর", en: "1 Year" },
  "All Time": { bn: "সর্বকাল", en: "All Time" },
};

function formatCompactNumber(v: number): string {
  const val = Math.round(v || 0);
  if (Math.abs(val) >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
  if (Math.abs(val) >= 1_000) return (val / 1_000).toFixed(1) + "k";
  return val.toLocaleString();
}

export default function Overview() {
  const { t } = useLanguage();

  // Load analytics from PHP API
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["overview-analytics-php"],
    staleTime: 60000,
    refetchInterval: 60000,
    queryFn: async () => {
      const url = API_URL;
      const res = await fetch(`${url}/analytics/overview.php`);
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = await res.json();
      return json.data;
    },
  });

  const summary = analytics?.summary || {};
  const profitPeriods = analytics?.profit_periods || [
    { label: "আজ", labelEn: "Today", profit: 0 },
    { label: "গতকাল", labelEn: "Yesterday", profit: 0 },
    { label: "৭ দিন", labelEn: "7 Days", profit: 0 },
    { label: "৩০ দিন", labelEn: "30 Days", profit: 0 },
    { label: "১ বছর", labelEn: "1 Year", profit: 0 },
    { label: "সর্বকাল", labelEn: "All Time", profit: 0 },
  ];
  const chartData = analytics?.chart_data || [];
  const totalRevenueData = summary.total_revenue || 0;
  const todayVisitors = summary.today_visitors || 0;
  const smsBalance = summary.sms_balance || { remaining: 450, limit: 500 };

  if (isLoading && !analytics) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top 6 Stats Balanced Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={BarChart3}
          iconColor="text-indigo-600 bg-indigo-50"
          label={t("মোট আয়", "Total Revenue")}
          value={`৳${formatCompactNumber(totalRevenueData)}`}
          sub={t("সর্বকালের", "All time")}
        />
        <StatCard
          icon={Wallet}
          iconColor="text-emerald-600 bg-emerald-50"
          label={t("আজকের আয়", "Today's Revenue")}
          value={`৳${formatCompactNumber(summary.today_revenue || 0)}`}
          sub={`${summary.today_orders || 0} ${t("নতুন অর্ডার", "new orders")}`}
        />
        <StatCard
          icon={ShoppingCart}
          iconColor="text-blue-600 bg-blue-50"
          label={t("মোট অর্ডার", "Total Orders")}
          value={String(summary.total_orders ?? "0")}
          sub={`${summary.delivered_orders ?? 0} ${t("ডেলিভার্ড", "delivered")}`}
        />
        <StatCard
          icon={Clock}
          iconColor="text-amber-600 bg-amber-50"
          label={t("পেন্ডিং অর্ডার", "Pending Orders")}
          value={String(summary.pending_orders || 0)}
          sub={t("অপেক্ষারত", "Pending")}
          highlight={(summary.pending_orders || 0) > 0}
        />
        <StatCard
          icon={Eye}
          iconColor="text-cyan-600 bg-cyan-50"
          label={t("আজকের ভিজিটর", "Today's Visitors")}
          value={String(todayVisitors || 0)}
          sub={`${summary.total_customers || 0} ${t("মোট কাস্টমার", "customers")}`}
        />
        <StatCard
          icon={MessageSquare}
          iconColor="text-purple-600 bg-purple-50"
          label={t("SMS বাকি", "SMS Remaining")}
          value={smsBalance?.remaining != null ? `${smsBalance.remaining} ${t("টি", "")}` : "—"}
          sub={smsBalance?.limit != null ? `${t("মোট", "Total")} ${smsBalance.limit} ${t("এর মধ্যে", "available")}` : t("ই-কমা", "Ecomah")}
        />
      </div>

      {/* Profit/Loss Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">{t("লাভ / লস সারসংক্ষেপ", "Profit / Loss Summary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {profitPeriods.map((p) => {
              const labelInfo = PERIOD_LABELS[p.labelEn] || { bn: p.label, en: p.labelEn };
              const isPositive = p.profit >= 0;
              const absVal = Math.abs(p.profit);
              let displayVal = absVal.toLocaleString();
              if (absVal >= 1_000_000) displayVal = (absVal / 1_000_000).toFixed(1) + "M";
              else if (absVal >= 1_000) displayVal = (absVal / 1_000).toFixed(1) + "k";

              return (
                <div key={p.labelEn} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-200/60 shadow-2xs">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    {t(labelInfo.bn, labelInfo.en)}
                  </p>
                  <p className={`text-lg font-bold tracking-tight ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                    {isPositive ? "+" : "-"}৳{displayVal}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders + Top Selling Products */}
      <RecentOrdersAndTopProducts />

      {/* 14-day Chart with Dual Y-Axis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span>{t("গত ১৪ দিনের অর্ডার ও আয়", "Orders & Revenue (Last 14 Days)")}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {t("বাম অক্ষ: অর্ডার সংখ্যা · ডান অক্ষ: আয় (৳)", "Left: Orders · Right: Revenue (৳)")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="label" fontSize={11} stroke="#94a3b8" />
                <YAxis yAxisId="left" fontSize={11} stroke="#635bff" allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" fontSize={11} stroke="#10b981" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === t("আয় (৳)", "Revenue (৳)")
                      ? `৳${value.toLocaleString()}`
                      : `${value} টি`,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  name={t("অর্ডার সংখ্যা", "Orders")}
                  fill="#635bff"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  name={t("আয় (৳)", "Revenue (৳)")}
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Funnel Analytics */}
      <FunnelAnalytics />
    </div>
  );
}

function StatCard({ icon: Icon, iconColor, label, value, sub, highlight }: {
  icon: any; iconColor?: string; label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <Card className={cn("transition-all", highlight ? "border-amber-400 bg-amber-50/25 shadow-xs" : "")}>
      <CardContent className="p-3.5">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5 font-medium">
          <span className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0 shadow-2xs", iconColor || "bg-slate-100 text-slate-700")}>
            <Icon className="w-3.5 h-3.5" />
          </span>
          <span className="truncate">{label}</span>
        </div>
        <p className={cn("text-xl font-bold tracking-tight", highlight ? "text-amber-700" : "text-foreground")}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </CardContent>
    </Card>
  );
}
