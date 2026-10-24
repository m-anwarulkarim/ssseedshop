import { useLanguage } from "@/contexts/LanguageContext";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, XCircle, Truck } from "lucide-react";

interface FraudData {
  fraudchecker_data?: any;
  steadfast_data?: any;
}

function parseFraudStats(raw: FraudData | null) {
  if (!raw?.fraudchecker_data) return null;
  const d = raw.fraudchecker_data;

  const courierDataObj = d.courierData || {};
  const summary = courierDataObj.summary;

  const totalParcels = summary?.total_parcels ?? summary?.total_parcel ?? d.total_orders ?? 0;
  const totalDelivered = summary?.successful_deliveries ?? summary?.success_parcel ?? d.total_received ?? 0;
  const totalCancel = summary?.cancelled_deliveries ?? summary?.cancelled_parcel ?? d.total_cancel ?? (totalParcels - totalDelivered);
  const rate = summary?.success_rate
    ? parseFloat(summary.success_rate)
    : summary?.success_ratio
      ? parseFloat(summary.success_ratio)
      : d.success_rate ?? (totalParcels > 0 ? Math.round((totalDelivered / totalParcels) * 100) : 0);

  const couriers: { name: string; total: number; success: number }[] = [];
  const courierBreakdown = d.courier_breakdown || [];
  if (courierBreakdown.length > 0) {
    courierBreakdown.forEach((c: any) => {
      const t = c.orders ?? 0;
      if (t > 0) couriers.push({ name: c.courier, total: t, success: c.received ?? 0 });
    });
  } else if (courierDataObj.couriers?.length > 0) {
    courierDataObj.couriers.forEach((c: any) => {
      const t = c.total_parcels ?? c.total ?? 0;
      if (t > 0) couriers.push({ name: c.courier_name ?? c.name ?? c.courier, total: t, success: c.successful_deliveries ?? c.success ?? 0 });
    });
  }

  return { totalParcels, totalDelivered, totalCancel, rate, couriers };
}

function rateColor(r: number) {
  if (r >= 70) return { bar: "bg-emerald-400/80", text: "text-emerald-600", icon: "text-emerald-500" };
  if (r >= 40) return { bar: "bg-amber-400/80", text: "text-amber-600", icon: "text-amber-500" };
  return { bar: "bg-red-400/80", text: "text-red-600", icon: "text-red-500" };
}

export function InlineFraudBar({ fraudData }: { fraudData: FraudData | null }) {
  const { t } = useLanguage();
  const stats = parseFraudStats(fraudData);

  if (!stats || stats.totalParcels === 0) return null;

  const { totalParcels, totalDelivered, totalCancel, rate, couriers } = stats;
  const c = rateColor(rate);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="mt-1 cursor-default max-w-[150px]">
            <div className="relative h-[18px] bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${c.bar}`} style={{ width: `${Math.max(rate, 10)}%` }} />
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <span className="flex items-center gap-1 text-[9px] font-semibold">
                  <span className="flex items-center gap-0.5 text-emerald-600"><CheckCircle2 className="w-2.5 h-2.5" />{totalDelivered}</span>
                  <span className="flex items-center gap-0.5 text-red-500"><XCircle className="w-2.5 h-2.5" />{totalCancel}</span>
                </span>
                <span className={`text-[9px] font-bold ${c.text}`}>{rate}%</span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="w-[280px] p-4 space-y-3">
          <p className="text-sm font-bold">{t("ফ্রড চেক সামারি", "Fraud Check Summary")}</p>
          <div className="relative h-7 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${c.bar}`} style={{ width: `${Math.max(rate, 10)}%` }} />
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <span className="flex items-center gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" />{totalDelivered}</span>
                <span className="flex items-center gap-1 text-red-500"><XCircle className="w-3.5 h-3.5" />{totalCancel}</span>
                <span className="text-muted-foreground font-normal">/ {totalParcels}</span>
              </span>
              <span className={`text-xs font-bold ${c.text}`}>{rate}%</span>
            </div>
          </div>
          {couriers.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{t("কুরিয়ার ভিত্তিক", "By Courier")}</p>
              {couriers.map((cr, i) => {
                const pct = cr.total > 0 ? Math.round((cr.success / cr.total) * 100) : 0;
                const cc = rateColor(pct);
                return (
                  <div key={i} className="relative h-6 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cc.bar}`} style={{ width: `${Math.max(pct, 10)}%` }} />
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                      <span className="text-[11px] font-medium text-foreground/90 flex items-center gap-1.5">
                        <Truck className="w-3 h-3 shrink-0" />{cr.name}
                      </span>
                      <span className={`text-[11px] font-bold ${cc.text}`}>{cr.success}/{cr.total} · {pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-[8px] text-muted-foreground/50 text-right pt-1">powered by ecomah</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
