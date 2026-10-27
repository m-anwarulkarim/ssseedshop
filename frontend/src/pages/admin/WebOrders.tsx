import { API_URL } from "@/config/env";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Search, Loader2, Package, Clock, PhoneOff, ThumbsUp,
  PhoneCall, Pause, CalendarClock, CheckCircle2, XCircle,
  Pencil, AlertTriangle, RotateCcw, Phone, Check, X,
  ArrowRightCircle, ChevronLeft, ChevronRight, Trash2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { SourceBadge } from "@/components/admin/SourceBadge";
import { InlineFraudBar } from "@/components/admin/InlineFraudBar";

const PAGE_SIZE = 50;

import { useNavigate, useSearchParams } from "react-router-dom";
import { bn } from "date-fns/locale";
import { DateRangeFilter, DateRangeValue, getDateRangeISO } from "@/components/admin/DateRangeFilter";
import { setWebCounts, useWebCounts, applyStatusChange } from "@/stores/orderCountsStore";
import { getActiveAdminId } from "@/lib/adminAccess";
import { dispatchOrderNotification } from "@/lib/orderNotifications";

const WEB_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", labelBn: "পেন্ডিং", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  { value: "no_response", label: "No Response", labelBn: "নো রেসপন্স", color: "bg-orange-100 text-orange-800 border-orange-200", icon: PhoneOff },
  { value: "good_but_no_response", label: "Good But No Response", labelBn: "গুড বাট নো রেসপন্স", color: "bg-amber-100 text-amber-800 border-amber-200", icon: ThumbsUp },
  { value: "busy", label: "Busy", labelBn: "বিজি", color: "bg-slate-100 text-slate-800 border-slate-200", icon: PhoneCall },
  { value: "hold", label: "Hold", labelBn: "হোল্ড", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Pause },
  { value: "pre", label: "Pre", labelBn: "প্রি", color: "bg-violet-100 text-violet-800 border-violet-200", icon: CalendarClock },
  { value: "cancelled", label: "Cancel", labelBn: "বাতিল", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  { value: "confirmed", label: "Confirmed", labelBn: "কনফার্মড", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
];

// Same as OPTIONS — used for dropdown status changes (includes confirmed)
const WEB_STATUS_WITH_CONFIRM = WEB_STATUS_OPTIONS;

const WEB_STATUS_VALUES = WEB_STATUS_OPTIONS.map((s) => s.value);
const WEB_ORDER_SOURCE_FILTER = "traffic_source.is.null,traffic_source.neq.ecomdrive";

const normalizeFraudPayload = (payload: any) => {
  if (!payload || typeof payload !== "object") return null;
  return { phone: payload.phone ?? null, fraudchecker_data: payload };
};

const hasDisplayableFraudData = (payload: any) => {
  if (!payload || typeof payload !== "object" || payload.error) return false;

  const totalOrders = Number(
    payload.total_orders
      ?? payload.total_parcels
      ?? payload.courierData?.summary?.total_parcels
      ?? payload.courierData?.summary?.total_parcel
      ?? payload.raw?.courierData?.summary?.total_parcels
      ?? payload.raw?.courierData?.summary?.total_parcel
      ?? 0,
  );
  const totalReceived = Number(
    payload.total_received
      ?? payload.total_delivered
      ?? payload.courierData?.summary?.successful_deliveries
      ?? payload.courierData?.summary?.success_parcel
      ?? payload.raw?.courierData?.summary?.successful_deliveries
      ?? payload.raw?.courierData?.summary?.success_parcel
      ?? 0,
  );
  const hasCourierBreakdown = Array.isArray(payload.courier_breakdown)
    && payload.courier_breakdown.some((item: any) => Number(item?.orders ?? 0) > 0 || Number(item?.received ?? 0) > 0);

  return hasCourierBreakdown || totalOrders > 0 || totalReceived > 0 || typeof payload.success_rate === "number";
};

const getFraudMessage = (payload: any) => {
  if (!payload || typeof payload !== "object") return null;
  if (payload.error) return payload.error;
  return hasDisplayableFraudData(payload) ? null : "কোনো ফ্রড ডাটা পাওয়া যায়নি";
};

export default function WebOrders() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get("filter") || "pending");
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => (searchParams.get("range") as DateRangeValue) || "lifetime");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Sync filter state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "pending") params.set("filter", statusFilter);
    if (dateRange !== "lifetime") params.set("range", dateRange);
    setSearchParams(params, { replace: true });
  }, [statusFilter, dateRange, setSearchParams]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [preDateDialog, setPreDateDialog] = useState<{ orderId: string; oldStatus: string; phone?: string } | null>(null);
  const [preDateValue, setPreDateValue] = useState("");
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  useEffect(() => { setPage(0); }, [search, statusFilter, dateRange, customFrom, customTo]);

  // Realtime: instantly refresh when orders change
  useEffect(() => {
    const channel = supabase
      .channel("web-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ queryKey: ["web-orders"] });
        queryClient.invalidateQueries({ queryKey: ["web-orders-counts"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const saveFieldMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: string }) => {
      const url = API_URL;
      const res = await fetch(`${url}/orders/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value, last_status_changed_by: getActiveAdminId() })
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Update failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["web-orders"] });
      toast.success(t("আপডেট হয়েছে", "Updated"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const normalizedSearch = search.trim();

  const getStatusInfo = (status: string) =>
    WEB_STATUS_WITH_CONFIRM.find((s) => s.value === status) || WEB_STATUS_OPTIONS[0];

  // Server-side paginated data query
  const { data: ordersResult, isLoading } = useQuery({
    queryKey: ["web-orders", search, statusFilter, dateRange, customFrom, customTo, page],
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 10000,
    queryFn: async () => {
      const url = API_URL;
      const res = await fetch(`${url}/orders/get.php?admin=1&_t=${Date.now()}`, { cache: "no-store" });
      let data = await res.json();
      data = data.filter((o: any) => !o.is_deleted);

      const isGlobalSearch = !!normalizedSearch;
      if (isGlobalSearch) {
        data = data.filter((o: any) => 
          (o.order_id && o.order_id.toLowerCase().includes(normalizedSearch.toLowerCase())) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(normalizedSearch.toLowerCase())) ||
          (o.phone && o.phone.toLowerCase().includes(normalizedSearch.toLowerCase()))
        );
      } else {
        data = data.filter((o: any) => {
          if (o.order_id && o.order_id.startsWith("OLD")) return false;
          // In a real migration we'd check source, but local json might not have it. Include all for now.
          return true;
        });
        
        if (statusFilter && statusFilter !== "all" && statusFilter !== "incomplete") {
          data = data.filter((o: any) => o.status === statusFilter);
        } else {
          data = data.filter((o: any) => WEB_STATUS_VALUES.includes(o.status));
        }

        const since = getDateRangeISO(dateRange, customFrom, customTo);
        if (since) {
          data = data.filter((o: any) => o.created_at >= since);
        }
        if (dateRange === "custom" && customTo) {
          const toDate = new Date(customTo);
          toDate.setHours(23, 59, 59, 999);
          data = data.filter((o: any) => o.created_at <= toDate.toISOString());
        }
      }

      data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      const count = data.length;
      const paginated = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

      return { orders: paginated, totalCount: count };
    },
  });

  const orders = ordersResult?.orders || [];
  const totalCount = ordersResult?.totalCount || 0;

  // Per-status counts - paginated fetch in 1000-row chunks (Supabase max)
  const { data: statusCounts } = useQuery({
    queryKey: ["web-orders-counts", search, dateRange, customFrom, customTo],
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 10000,
    queryFn: async () => {
      const url = API_URL;
      const res = await fetch(`${url}/orders/get.php?admin=1&_t=${Date.now()}`, { cache: "no-store" });
      let data = await res.json();
      data = data.filter((o: any) => !o.is_deleted && WEB_STATUS_VALUES.includes(o.status));

      const since = normalizedSearch ? null : getDateRangeISO(dateRange, customFrom, customTo);

      if (normalizedSearch) {
        const s = normalizedSearch.toLowerCase();
        data = data.filter((o: any) => 
          (o.order_id && o.order_id.toLowerCase().includes(s)) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(s)) ||
          (o.phone && o.phone.toLowerCase().includes(s))
        );
      } else {
        data = data.filter((o: any) => !(o.order_id && o.order_id.startsWith("OLD")));
        if (since) {
          data = data.filter((o: any) => o.created_at >= since);
        }
        if (dateRange === "custom" && customTo) {
          const toDate = new Date(customTo);
          toDate.setHours(23, 59, 59, 999);
          data = data.filter((o: any) => o.created_at <= toDate.toISOString());
        }
      }

      const counts: Record<string, number> = {};
      let totalAll = 0;
      data.forEach((o: any) => {
        counts[o.status] = (counts[o.status] || 0) + 1;
        totalAll++;
      });
      counts["all"] = totalAll;
      setWebCounts(counts);
      return counts;
    },
  });
  const liveWebCounts = useWebCounts();
  const effectiveCounts = liveWebCounts ?? statusCounts;

  // Fetch order items for all visible orders
  const orderIds = useMemo(() => orders.map((o: any) => o.id), [orders]);
  const { data: allOrderItems } = useQuery({
    queryKey: ["all-order-items", orderIds],
    enabled: orderIds.length > 0,
    queryFn: async () => {
      const items: any[] = [];
      orders.forEach((o: any) => {
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach((i: any) => {
            items.push({
              ...i,
              order_id: o.id
            });
          });
        }
      });
      return items;
    },
  });

  const itemsByOrder = useMemo(() => {
    const map: Record<string, typeof allOrderItems> = {};
    allOrderItems?.forEach((item) => {
      if (!map[item.order_id]) map[item.order_id] = [];
      map[item.order_id]!.push(item);
    });
    return map;
  }, [allOrderItems]);

  // On-demand fraud data loading per phone (click call button to load)
  const [fraudDataMap, setFraudDataMap] = useState<Record<string, any>>({});
  const [loadingFraudPhones, setLoadingFraudPhones] = useState<Record<string, boolean>>({});
  const loadingRef = useRef<Set<string>>(new Set());

  const loadFraudData = useCallback(async (phone: string, action: "check" | "force_check" = "check") => {
    if (!phone || phone.length < 11 || loadingRef.current.has(phone)) return null;
    loadingRef.current.add(phone);
    setLoadingFraudPhones(prev => ({ ...prev, [phone]: true }));
    try {
      const url = API_URL;
      const res = await fetch(`${url}/orders/fraud_checker.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, phone }),
      });
      if (!res.ok) throw new Error("Fraud check failed");
      const data = await res.json();

      const normalized = normalizeFraudPayload(data?.data?.fraudchecker_data || data?.data);
      setFraudDataMap(prev => ({ ...prev, [phone]: normalized }));

      return normalized;
    } catch (e) {
      console.error("Fraud data load error:", e);
      setFraudDataMap(prev => ({ ...prev, [phone]: { phone, fraudchecker_data: { error: "Fraud data load failed" } } }));
      return null;
    } finally {
      loadingRef.current.delete(phone);
      setLoadingFraudPhones(prev => { const n = { ...prev }; delete n[phone]; return n; });
    }
  }, []);

  // Cache loader from local PHP API
  useEffect(() => {
    const phones: string[] = Array.from(
      new Set(
        orders
          .map((o: any) => String(o?.phone || ""))
          .filter((p: string) => Boolean(p && p.length >= 11))
      )
    );
    const missing: string[] = phones.filter((p: string) => !(p in fraudDataMap));
    if (missing.length === 0) return;
    let cancelled = false;

    (async () => {
      try {
        const url = API_URL;
        const res = await fetch(`${url}/orders/fraud_checker.php?action=get_all_cached`);
        if (cancelled || !res.ok) return;
        const json = await res.json();
        const cacheMap = json.data || {};

        setFraudDataMap((prev) => {
          const next: Record<string, any> = { ...prev };
          missing.forEach((phone: string) => {
            const clean = phone.replace(/\D/g, "").slice(-11);
            if (cacheMap[clean]) {
              const entry = cacheMap[clean];
              next[phone] = normalizeFraudPayload(entry.fraudchecker_data || entry);
            }
          });
          return next;
        });
      } catch (err) {
        console.error("Failed to load cached fraud data:", err);
      }
    })();

    return () => { cancelled = true; };
  }, [orders, fraudDataMap]);

  // Detail dialog items
  const selectedOrderItems = selectedOrder ? itemsByOrder[selectedOrder.id] || [] : [];

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, oldStatus, phone }: { id: string; status: string; oldStatus?: string; phone?: string }) => {
      // Optimistic local badge update
      applyStatusChange(oldStatus, status);
      const url = API_URL;
      const res = await fetch(`${url}/orders/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, last_status_changed_by: getActiveAdminId() })
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        applyStatusChange(status, oldStatus);
        throw new Error(json.error || "Update failed");
      }
      // Fire fail-safe notification
      const curOrder = orders.find((o) => o.id === id);
      dispatchOrderNotification({
        orderId: curOrder?.order_id || id,
        newStatus: status,
        oldStatus,
        phone: phone || curOrder?.phone,
        customerName: curOrder?.customer_name,
        totalAmount: curOrder?.total_amount,
      }).catch(console.error);
      // Clean up matching incomplete_orders by phone
      if (phone) {
        const apiUrl = API_URL;
        fetch(`${apiUrl}/orders/incomplete.php`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        }).catch(console.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["web-orders"] });
      queryClient.invalidateQueries({ queryKey: ["web-orders-counts"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
      queryClient.invalidateQueries({ queryKey: ["incomplete-orders"] });
      toast.success(t("স্ট্যাটাস আপডেট হয়েছে", "Status updated"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete order mutation via PHP API
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingOrderId(id);
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/orders/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || "Failed to delete order");
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueriesData({ queryKey: ["web-orders"] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          orders: (old.orders || []).filter((o: any) => o.id !== deletedId),
          totalCount: Math.max(0, (old.totalCount || 1) - 1),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["web-orders"] });
      queryClient.invalidateQueries({ queryKey: ["web-orders-counts"] });
      toast.success(t("অর্ডারটি মুছে ফেলা হয়েছে", "Order deleted"));
    },
    onError: (err: Error) => toast.error(err.message),
    onSettled: () => setDeletingOrderId(null),
  });

  // Incomplete orders query
  const { data: incompleteOrders, isLoading: incompleteLoading } = useQuery({
    queryKey: ["incomplete-orders", dateRange],
    queryFn: async () => {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/orders/incomplete.php?admin=1&_t=${Date.now()}`, { cache: "no-store" });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || result.message || "Failed to load incomplete orders");
      let data = result.data || [];
      const since = getDateRangeISO(dateRange);
      if (since) {
        data = data.filter((item: any) => new Date(item.created_at || item.updated_at) >= new Date(since));
      }
      return data;
    },
  });


  // Convert incomplete order to real order
  const convertMutation = useMutation({
    mutationFn: async (inc: any) => {
      const cart = Array.isArray(inc.cart_snapshot) ? inc.cart_snapshot : [];
      const totalAmount = cart.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);

      // Create order via RPC
      const { data: orderData, error: orderErr } = await supabase.rpc("place_order", {
        p_customer_name: inc.customer_name || "Unknown",
        p_phone: inc.phone,
        p_address: inc.address || "",
        p_total_amount: totalAmount,
      });
      if (orderErr) throw orderErr;
      const newOrder = (orderData as any)?.[0];
      if (!newOrder) throw new Error("Order creation failed");

      // Insert order items from cart snapshot
      if (cart.length > 0) {
        const items = cart.map((item: any) => ({
          order_id: newOrder.id,
          product_id: item.id || "00000000-0000-0000-0000-000000000000",
          product_name: item.name || "Unknown",
          product_image: item.image || null,
          quantity: item.quantity || 1,
          unit_price: item.price || 0,
        }));
        const { error: itemErr } = await supabase.from("order_items").insert(items);
        if (itemErr) throw itemErr;
      }

      // Delete incomplete order
      const apiUrl = API_URL;
      await fetch(`${apiUrl}/orders/incomplete.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inc.id }),
      });

      return newOrder;
    },
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ["incomplete-orders"] });
      queryClient.invalidateQueries({ queryKey: ["web-orders"] });
      // ❌ Removed auto fraud-check on convert (quota saving). Click fraud button on demand.
      toast.success(t("অর্ডারে রূপান্তর হয়েছে", "Converted to order"));
      navigate(`/admin/orders/edit/${newOrder.order_id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const [selectedIncompleteIds, setSelectedIncompleteIds] = useState<string[]>([]);

  // Delete single incomplete order
  const deleteIncompleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/orders/incomplete.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || result.message || "Failed to delete");
    },
    onSuccess: (_, id) => {
      setSelectedIncompleteIds((prev) => prev.filter((i) => i !== id));
      queryClient.invalidateQueries({ queryKey: ["incomplete-orders"] });
      toast.success(t("ইনকমপ্লিট অর্ডার মুছে ফেলা হয়েছে", "Incomplete order deleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Bulk delete incomplete orders
  const bulkDeleteIncompleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/orders/incomplete.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || result.message || "Failed to delete");
    },
    onSuccess: () => {
      setSelectedIncompleteIds([]);
      queryClient.invalidateQueries({ queryKey: ["incomplete-orders"] });
      toast.success(t("নির্বাচিত ইনকমপ্লিট অর্ডারগুলো মুছে ফেলা হয়েছে", "Selected incomplete orders deleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">

      {/* Status filter badges */}
      <div className="flex flex-wrap gap-2">
        {/* Pending */}
        {(() => {
          const s = WEB_STATUS_OPTIONS[0];
          const Icon = s.icon;
          const count = effectiveCounts?.[s.value] || 0;
          return (
            <Badge
              key={s.value}
              className={`cursor-pointer gap-1 ${statusFilter === s.value ? s.color + " ring-2 ring-offset-1 ring-primary/30" : "bg-muted text-muted-foreground"}`}
              onClick={() => setStatusFilter(s.value)}
            >
              <Icon className="w-3 h-3" />
              {t(s.labelBn, s.label)} ({count})
            </Badge>
          );
        })()}
        {/* Incomplete - between Pending and No Response */}
        <Badge
          className={`cursor-pointer gap-1 ${statusFilter === "incomplete" ? "bg-red-100 text-red-800 border-red-200 ring-2 ring-offset-1 ring-primary/30" : "bg-muted text-muted-foreground"}`}
          onClick={() => setStatusFilter("incomplete")}
        >
          <AlertTriangle className="w-3 h-3" />
          {t("ইনকমপ্লিট", "Incomplete")} ({incompleteOrders?.length || 0})
        </Badge>
        {/* Rest of statuses (skip index 0 which is pending) */}
        {WEB_STATUS_OPTIONS.slice(1).map((s) => {
          const Icon = s.icon;
          const count = effectiveCounts?.[s.value] || 0;
          return (
            <Badge
              key={s.value}
              className={`cursor-pointer gap-1 ${statusFilter === s.value ? s.color + " ring-2 ring-offset-1 ring-primary/30" : "bg-muted text-muted-foreground"}`}
              onClick={() => setStatusFilter(s.value)}
            >
              <Icon className="w-3 h-3" />
              {t(s.labelBn, s.label)} ({count})
            </Badge>
          );
        })}
        {/* All - at the end */}
        <Badge
          className={`cursor-pointer ${statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          onClick={() => setStatusFilter("all")}
        >
          {t("সব", "All")} ({(effectiveCounts?.["all"] || 0) + (incompleteOrders?.length || 0)})
        </Badge>
      </div>

      {statusFilter !== "incomplete" && (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("অর্ডার আইডি, নাম বা ফোন...", "Order ID, name or phone...")}
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              customFrom={customFrom}
              customTo={customTo}
              onCustomChange={(f, t) => { setCustomFrom(f); setCustomTo(t); }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !orders?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mb-3 opacity-40" />
              <p>{t("কোনো অর্ডার পাওয়া যায়নি", "No orders found")}</p>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">{t("অর্ডার", "Order")}</TableHead>
                    <TableHead className="w-[140px]">{t("নাম", "Name")}</TableHead>
                    <TableHead className="w-[22%]">{t("লোকেশন", "Location")}</TableHead>
                    <TableHead className="w-[150px]">{t("নাম্বার", "Number")}</TableHead>
                    <TableHead className="w-[80px]">{t("পণ্য", "Products")}</TableHead>
                    <TableHead className="w-[80px] text-right">{t("মোট", "Total")}</TableHead>
                    <TableHead className="w-[180px] text-center">{t("এডিট", "Edit")}</TableHead>
                    <TableHead className="w-[100px]">{t("সোর্স", "Source")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const si = getStatusInfo(order.status);
                    const items = itemsByOrder[order.id] || [];
                    const timeAgo = formatDistanceToNow(new Date(order.created_at), { addSuffix: true });

                    return (
                      <TableRow key={order.id}>
                        {/* Order ID + time ago */}
                        <TableCell className="min-w-[100px]">
                          <button
                            className="font-bold text-primary hover:underline cursor-pointer text-left"
                            onClick={() => setSelectedOrder(order)}
                          >
                            {order.order_id}
                          </button>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo}</p>
                        </TableCell>

                        {/* Name */}
                        <TableCell className="min-w-[120px]">
                          <p className="font-medium text-sm">
                            {order.customer_name}
                          </p>
                        </TableCell>

                        {/* Location */}
                        <TableCell className="min-w-[140px] max-w-[250px]">
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{order.address}</p>
                        </TableCell>

                        {/* Phone + alt phone */}
                        <TableCell className="min-w-[110px]">
                          <div className="flex items-center gap-1">
                            <p className="text-sm">{order.phone}</p>
                            <button
                              onClick={async () => {
                                await loadFraudData(order.phone);
                                window.location.href = `tel:${order.phone}`;
                              }}
                              className="p-0.5 rounded hover:bg-muted transition-colors shrink-0"
                              title={t("কল করুন ও ফ্রড ডাটা লোড করুন", "Call & load fraud data")}
                            >
                              <Phone className="w-3.5 h-3.5 text-green-600" />
                            </button>
                          </div>
                          {order.alt_phone && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <p className="text-[11px] text-muted-foreground">{order.alt_phone}</p>
                              <a href={`tel:${order.alt_phone}`} className="p-0.5 rounded hover:bg-muted transition-colors shrink-0" title={t("কল করুন", "Call")}>
                                <Phone className="w-3 h-3 text-green-600" />
                              </a>
                            </div>
                          )}
                          {hasDisplayableFraudData(fraudDataMap[order.phone]?.fraudchecker_data) && <InlineFraudBar fraudData={fraudDataMap[order.phone]} />}
                          {!loadingFraudPhones[order.phone] && !hasDisplayableFraudData(fraudDataMap[order.phone]?.fraudchecker_data) && getFraudMessage(fraudDataMap[order.phone]?.fraudchecker_data) && <p className="text-[9px] text-muted-foreground mt-0.5">{getFraudMessage(fraudDataMap[order.phone]?.fraudchecker_data)}</p>}
                          {loadingFraudPhones[order.phone] && <p className="text-[9px] text-muted-foreground mt-0.5 animate-pulse">{t("লোড হচ্ছে...", "Loading...")}</p>}
                        </TableCell>

                        {/* Product images + note */}
                        <TableCell className="min-w-[60px]">
                          <div className="flex items-center gap-1.5">
                            {items.length > 0 ? (
                              <>
                                {items.slice(0, 3).map((item) => (
                                  <TooltipProvider key={item.id}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedOrder(order)}
                                          className="w-8 h-8 flex-shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                          {item.product_image ? (
                                            <img
                                              src={item.product_image}
                                              alt={item.product_name}
                                              className="w-8 h-8 rounded border border-border object-cover"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded border border-border bg-muted flex items-center justify-center">
                                              <Package className="w-3 h-3 text-muted-foreground" />
                                            </div>
                                          )}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs max-w-[200px]">
                                        {item.product_name} × {item.quantity}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))}
                                {items.length > 3 && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-[11px] text-muted-foreground font-medium whitespace-nowrap hover:text-foreground"
                                  >
                                    & More {items.length - 3}
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Total */}
                        <TableCell className="text-right font-semibold whitespace-nowrap">
                          ৳{order.total_amount}
                        </TableCell>


                        {/* Edit */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Select
                              value={order.status}
                              onValueChange={(val) => {
                                if (val === "pre") {
                                  setPreDateDialog({ orderId: order.id, oldStatus: order.status, phone: order.phone });
                                  setPreDateValue("");
                                  return;
                                }
                                statusMutation.mutate({ id: order.id, status: val, oldStatus: order.status, phone: order.phone });
                              }}
                            >
                              <SelectTrigger className={`h-7 w-[100px] text-[10px] font-semibold border ${si.color}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {WEB_STATUS_WITH_CONFIRM.map((s) => {
                                  const SIcon = s.icon;
                                  return (
                                    <SelectItem key={s.value} value={s.value}>
                                      <div className="flex items-center gap-1.5">
                                        <SIcon className="w-3 h-3" />
                                        {t(s.labelBn, s.label)}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" className="h-7 px-2 gap-1" onClick={() => navigate(`/admin/orders/edit/${order.order_id}`)}>
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="text-[11px]">{t("এডিট", "Edit")}</span>
                            </Button>
                            {order.status !== "confirmed" && (
                              <Button
                                id={`quick-confirm-${order.order_id}`}
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                title={t("এক ক্লিকে কনফার্ম", "Quick Confirm")}
                                disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({ id: order.id, status: "confirmed", oldStatus: order.status, phone: order.phone })}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {order.status !== "cancelled" && (
                              <Button
                                id={`quick-cancel-${order.order_id}`}
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-red-50 hover:text-destructive"
                                title={t("এক ক্লিকে বাতিল", "Quick Cancel")}
                                disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({ id: order.id, status: "cancelled", oldStatus: order.status, phone: order.phone })}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              id={`quick-delete-${order.order_id}`}
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title={t("অর্ডার ডিলিট", "Delete Order")}
                              disabled={deleteOrderMutation.isPending}
                              onClick={() => {
                                if (window.confirm(t("অর্ডারটি মুছে ফেলতে চান?", "Are you sure you want to delete this order?"))) {
                                  deleteOrderMutation.mutate(order.id);
                                }
                              }}
                            >
                              {deletingOrderId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-destructive" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                          {order.note && (
                            <p className="mt-1 text-[10px] text-muted-foreground block mx-auto max-w-[160px] truncate" title={order.note}>
                              {order.note}
                            </p>
                          )}
                        </TableCell>

                        {/* Source */}
                        <TableCell>
                          <SourceBadge source={(order as any).visitors?.traffic_source || (order as any).traffic_source} createdByAdminId={(order as any).created_by_admin_id} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {totalCount > PAGE_SIZE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} / {totalCount.toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {Math.ceil(totalCount / PAGE_SIZE)}
                  </span>
                  <Button variant="outline" size="sm" disabled={(page + 1) * PAGE_SIZE >= totalCount} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
          )}
        </CardContent>
      </Card>
      )}
      {statusFilter === "incomplete" && (
        <Card>
          <CardContent className="p-0">
            {incompleteLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !incompleteOrders?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mb-3 opacity-40" />
                <p>{t("কোনো ইনকমপ্লিট অর্ডার নেই", "No incomplete orders")}</p>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Bulk action header if selected */}
                {selectedIncompleteIds.length > 0 && (
                  <div className="p-3 bg-muted/60 border-b flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {t(`${selectedIncompleteIds.length}টি ইনকমপ্লিট অর্ডার সিলেক্ট করা হয়েছে`, `${selectedIncompleteIds.length} incomplete orders selected`)}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      disabled={bulkDeleteIncompleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(t(`সিলেক্ট করা ${selectedIncompleteIds.length}টি ইনকমপ্লিট অর্ডার মুছে ফেলতে চান?`, `Are you sure you want to delete ${selectedIncompleteIds.length} selected incomplete orders?`))) {
                          bulkDeleteIncompleteMutation.mutate(selectedIncompleteIds);
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t("মুছে ফেলুন", "Delete Selected")}</span>
                    </Button>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10 text-center">
                          <Checkbox
                            checked={incompleteOrders.length > 0 && selectedIncompleteIds.length === incompleteOrders.length}
                            onCheckedChange={(checked) =>
                              setSelectedIncompleteIds(checked ? incompleteOrders.map((i: any) => i.id) : [])
                            }
                          />
                        </TableHead>
                        <TableHead>{t("কাস্টমার", "Customer")}</TableHead>
                        <TableHead>{t("নাম্বার", "Phone")}</TableHead>
                        <TableHead>{t("কারণ", "Reason")}</TableHead>
                        <TableHead className="text-center">{t("চেষ্টা", "Attempts")}</TableHead>
                        <TableHead>{t("কার্ট", "Cart")}</TableHead>
                        <TableHead>{t("সময়", "Time")}</TableHead>
                        <TableHead className="text-center">{t("অ্যাকশন", "Action")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incompleteOrders.map((inc: any) => {
                        const cart = Array.isArray(inc.cart_snapshot) ? inc.cart_snapshot : [];
                        const timeAgo = formatDistanceToNow(new Date(inc.updated_at), { addSuffix: true, locale: bn });
                        const isSelected = selectedIncompleteIds.includes(inc.id);

                        return (
                          <TableRow key={inc.id} className={isSelected ? "bg-muted/40" : ""}>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                  setSelectedIncompleteIds((prev) =>
                                    checked ? [...prev, inc.id] : prev.filter((id) => id !== inc.id)
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="min-w-[120px]">
                              <p className="font-medium text-sm">{inc.customer_name || "—"}</p>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{inc.address || ""}</p>
                            </TableCell>
                            <TableCell className="text-sm font-mono">{inc.phone}</TableCell>
                            <TableCell className="min-w-[160px]">
                              <p className="text-xs text-destructive font-medium">{inc.reason}</p>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={inc.attempt_count > 1 ? "destructive" : "secondary"} className="text-xs">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                {inc.attempt_count}
                              </Badge>
                            </TableCell>
                            <TableCell className="min-w-[60px]">
                              <div className="flex items-center gap-1">
                                {cart.slice(0, 2).map((item: any, idx: number) => (
                                  item.image ? (
                                    <img key={idx} src={item.image} alt={item.name} className="w-7 h-7 rounded border border-border object-cover" />
                                  ) : (
                                    <div key={idx} className="w-7 h-7 rounded border border-border bg-muted flex items-center justify-center">
                                      <Package className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                  )
                                ))}
                                {cart.length > 2 && <span className="text-[11px] text-muted-foreground">+{cart.length - 2}</span>}
                                {cart.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                        disabled={convertMutation.isPending}
                                        onClick={() => convertMutation.mutate(inc)}
                                      >
                                        <ArrowRightCircle className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      {t("অর্ডারে কনভার্ট করুন", "Convert to Order")}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        disabled={deleteIncompleteMutation.isPending}
                                        onClick={() => {
                                          if (window.confirm(t("এই ইনকমপ্লিট অর্ডারটি মুছে ফেলতে চান?", "Are you sure you want to delete this incomplete order?"))) {
                                            deleteIncompleteMutation.mutate(inc.id);
                                          }
                                        }}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      {t("মুছে ফেলুন", "Delete Order")}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order detail / edit dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {t("অর্ডার", "Order")}: <span className="text-primary">{selectedOrder?.order_id}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("কাস্টমার", "Customer")}</p>
                  <p className="font-semibold">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("ফোন", "Phone")}</p>
                  <p className="font-semibold">{selectedOrder.phone}</p>
                </div>
                {selectedOrder.alt_phone && (
                  <div>
                    <p className="text-muted-foreground">{t("বিকল্প নম্বর", "Alt. Number")}</p>
                    <p className="font-semibold">{selectedOrder.alt_phone}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-muted-foreground">{t("ঠিকানা", "Address")}</p>
                  <p className="font-semibold">{selectedOrder.address}</p>
                </div>
                {selectedOrder.note && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">{t("নোট", "Note")}</p>
                    <p className="font-semibold">{selectedOrder.note}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">{t("স্ট্যাটাস", "Status")}</p>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(val) => {
                      if (val === "pre") {
                        setPreDateDialog({ orderId: selectedOrder.id, oldStatus: selectedOrder.status, phone: selectedOrder.phone });
                        setPreDateValue("");
                        return;
                      }
                      statusMutation.mutate({ id: selectedOrder.id, status: val, oldStatus: selectedOrder.status, phone: selectedOrder.phone });
                      setSelectedOrder({ ...selectedOrder, status: val });
                    }}
                  >
                    <SelectTrigger className={`w-full h-9 text-xs font-semibold border ${getStatusInfo(selectedOrder.status).color}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEB_STATUS_WITH_CONFIRM.map((s) => {
                        const SIcon = s.icon;
                        return (
                          <SelectItem key={s.value} value={s.value}>
                            <div className="flex items-center gap-2">
                              <SIcon className="w-3.5 h-3.5" />
                              {t(s.labelBn, s.label)}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("মোট", "Total")}</p>
                  <p className="font-bold text-primary text-lg">৳{selectedOrder.total_amount}</p>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="font-semibold mb-2">{t("পণ্যসমূহ", "Products")}</p>
                <div className="space-y-2">
                  {selectedOrderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">৳{item.unit_price} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-primary">৳{item.unit_price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pre-date picker dialog */}
      <Dialog open={!!preDateDialog} onOpenChange={() => setPreDateDialog(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-violet-600" />
              {t("প্রি ডেট সিলেক্ট করুন", "Select Pre Date")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="date"
              value={preDateValue}
              onChange={(e) => setPreDateValue(e.target.value)}
              className="w-full"
              min={new Date().toISOString().split("T")[0]}
            />
            <Button
              className="w-full"
              disabled={!preDateValue}
              onClick={async () => {
                if (!preDateDialog || !preDateValue) return;
                // Save pre_date and update status to "pre"
                const url = API_URL;
                const res = await fetch(`${url}/orders/update.php`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: preDateDialog.orderId, pre_date: preDateValue })
                });
                const json = await res.json();
                if (!res.ok || json.error) { toast.error(json.error || "Update failed"); return; }
                statusMutation.mutate({ id: preDateDialog.orderId, status: "pre", oldStatus: preDateDialog.oldStatus, phone: preDateDialog.phone });
                if (selectedOrder?.id === preDateDialog.orderId) {
                  setSelectedOrder({ ...selectedOrder, status: "pre", pre_date: preDateValue });
                }
                setPreDateDialog(null);
                setPreDateValue("");
              }}
            >
              <CalendarClock className="w-4 h-4 mr-2" />
              {t("প্রি সেট করুন", "Set Pre")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
