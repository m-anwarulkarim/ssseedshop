import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Search, Loader2, Package, Eye, Truck, Pencil, AlertTriangle, Repeat, Copy, Share2, ExternalLink, ChevronLeft, ChevronRight, ClipboardCheck, ArrowRightLeft, Printer, CheckCircle2, PackageX, RotateCcw, XCircle, HelpCircle, PackageCheck, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SourceBadge } from "@/components/admin/SourceBadge";
import { format, formatDistanceToNow } from "date-fns";
import { DateRangeFilter, DateRangeValue, getDateRangeISO } from "@/components/admin/DateRangeFilter";
import { setListCounts, useListCounts, applyStatusChange } from "@/stores/orderCountsStore";
import { getActiveAdminId } from "@/lib/adminAccess";
import ssseedshopLogo from "@/assets/ssseedshop-logo.png";
import { InlineFraudBar } from "@/components/admin/InlineFraudBar";

const PAGE_SIZE = 250;
import { API_BASE } from "@/lib/apiConfig";
import { bn } from "date-fns/locale";

// Filter tab definitions for Order List UI
const STATUS_OPTIONS = [
  { value: "confirmed", labelBn: "কনফার্মড", labelEn: "Confirmed", icon: Package, color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "printed", labelBn: "প্রিন্টেড", labelEn: "Printed", icon: Printer, color: "bg-teal-100 text-teal-800 border-teal-200" },
  { value: "entry_done", labelBn: "এন্ট্রি ডান", labelEn: "Entry Done", icon: PackageCheck, color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { value: "shipped", labelBn: "শিপড", labelEn: "Shipped", icon: Package, color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "delivered", labelBn: "ডেলিভারড", labelEn: "Delivered", icon: CheckCircle2, color: "bg-green-100 text-green-800 border-green-200" },
  { value: "partial", labelBn: "পার্শিয়াল", labelEn: "Partial", icon: PackageCheck, color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "pending_return", labelBn: "পেন্ডিং রিটার্ন", labelEn: "Pending Return", icon: AlertTriangle, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "return", labelBn: "রিটার্ন", labelEn: "Return", icon: RotateCcw, color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "cancelled", labelBn: "বাতিল", labelEn: "Cancel", icon: XCircle, color: "bg-red-100 text-red-800 border-red-200" },
  { value: "missing", labelBn: "মিসিং", labelEn: "Missing", icon: HelpCircle, color: "bg-gray-100 text-gray-800 border-gray-200" },
];

// 🔒 DO_NOT_MODIFY_START — Order List filter group mapping
const FILTER_GROUPS: Record<string, string[]> = {
  confirmed: ["confirmed"],
  printed: ["printed"],
  entry_done: ["entry_done"],
  shipped: ["shipped", "on_the_way", "hold"],
  delivered: ["delivered", "delivered_approval_pending"],
  partial: ["partial", "partial_delivered", "partial_delivered_approval_pending"],
  pending_return: ["pending_return", "cancelled_approval_pending"],
  return: ["return", "rtn_received"],
  cancelled: ["cancelled"],
  missing: ["missing", "unknown_approval_pending"],
};
// 🔒 DO_NOT_MODIFY_END

// All DB status values for "all" tab query
const ALL_STATUS_VALUES = Object.values(FILTER_GROUPS).flat();
const LEGACY_ORDER_SOURCE_FILTER = "traffic_source.is.null,traffic_source.neq.ecomdrive";

// Display labels for granular statuses shown on badges
const GRANULAR_STATUS_LABELS: Record<string, { labelBn: string; labelEn: string; color: string }> = {
  confirmed: { labelBn: "কনফার্মড", labelEn: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200" },
  printed: { labelBn: "প্যাকড", labelEn: "Packed", color: "bg-teal-100 text-teal-800 border-teal-200" },
  entry_done: { labelBn: "এন্ট্রি ডান", labelEn: "Entry Done", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  in_review: { labelBn: "ইন রিভিউ", labelEn: "In Review", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  pending: { labelBn: "পেন্ডিং", labelEn: "Pending", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  shipped: { labelBn: "শিপড", labelEn: "Shipped", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  on_the_way: { labelBn: "অন দ্য ওয়ে", labelEn: "On The Way", color: "bg-purple-100 text-purple-800 border-purple-200" },
  hold: { labelBn: "হোল্ড ইন কুরিয়ার", labelEn: "Hold in Courier", color: "bg-orange-100 text-orange-800 border-orange-200" },
  delivered: { labelBn: "ডেলিভারড", labelEn: "Delivered", color: "bg-green-100 text-green-800 border-green-200" },
  delivered_approval_pending: { labelBn: "DAP", labelEn: "DAP", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  partial: { labelBn: "পার্শিয়াল", labelEn: "Partial", color: "bg-amber-100 text-amber-800 border-amber-200" },
  partial_delivered: { labelBn: "পার্শিয়াল ডেলিভারড", labelEn: "P-Delivered", color: "bg-amber-100 text-amber-800 border-amber-200" },
  partial_delivered_approval_pending: { labelBn: "P-DAP", labelEn: "P-DAP", color: "bg-amber-100 text-amber-800 border-amber-200" },
  pending_return: { labelBn: "পেন্ডিং রিটার্ন", labelEn: "Pending Return", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  cancelled_approval_pending: { labelBn: "C-AP", labelEn: "C-AP", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  return: { labelBn: "রিটার্ন", labelEn: "Return", color: "bg-orange-100 text-orange-800 border-orange-200" },
  rtn_received: { labelBn: "RTN রিসিভড", labelEn: "RTN Received", color: "bg-lime-100 text-lime-800 border-lime-200" },
  cancelled: { labelBn: "বাতিল", labelEn: "Cancel", color: "bg-red-100 text-red-800 border-red-200" },
  missing: { labelBn: "মিসিং", labelEn: "Missing", color: "bg-gray-100 text-gray-800 border-gray-200" },
  unknown_approval_pending: { labelBn: "U-AP", labelEn: "U-AP", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

export default function OrderList() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get("filter") || "confirmed");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => (searchParams.get("range") as DateRangeValue) || "lifetime");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [syncingCourier, setSyncingCourier] = useState(false);

  const syncCourierStatus = async (silent = false, specificId?: string) => {
    setSyncingCourier(true);
    try {
      const url = import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";
      const res = await fetch(`${url}/courier/steadfast.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_statuses", id: specificId, limit: 200 }),
      });
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["order-list-data"] });
      queryClient.invalidateQueries({ queryKey: ["order-list-counts-rpc-v2"] });
      if (!silent) {
        if (data?.synced > 0) {
          toast.success(t(`${data.synced}টি অর্ডারের রিয়েল কুরিয়ার স্ট্যাটাস আপডেট হয়েছে!`, `Synced ${data.synced} order courier statuses!`));
        } else {
          toast.info(t("কুরিয়ারে কোনো নতুন স্ট্যাটাস আপডেট নেই (সব আপ-টু-ডেট)।", "All courier statuses are already up to date."));
        }
      }
    } catch (err: any) {
      if (!silent) toast.error(err?.message || t("কুরিয়ার সিঙ্ক ব্যর্থ হয়েছে", "Courier sync failed"));
    } finally {
      setSyncingCourier(false);
    }
  };

  // Auto-sync courier status once on mount and whenever navigating to entry_done tab
  useEffect(() => {
    syncCourierStatus(true);
  }, [statusFilter === "entry_done"]);

  // Sync filter state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "confirmed") params.set("filter", statusFilter);
    if (dateRange !== "lifetime") params.set("range", dateRange);
    setSearchParams(params, { replace: true });
  }, [statusFilter, dateRange]);

  useEffect(() => { setPage(0); }, [search, statusFilter, dateRange, customFrom, customTo]);

  // Realtime: instantly refresh when orders / items / status history change
  useEffect(() => {
    const RELATED_KEYS = [
      "order-list-data",
      "order-list-counts-rpc-v2",
      "order-items",
      "repeat-counts-for-tags",
      "double-visitor-tags",
      "order-status-history-batch",
      "incomplete-phones-for-tags",
    ];
    const refreshAll = () => {
      queryClient.invalidateQueries({
        predicate: (q) => RELATED_KEYS.includes(String(q.queryKey[0])),
      });
    };

    const channel = supabase
      .channel("order-list-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, refreshAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, refreshAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_status_history" }, refreshAll)
      .subscribe();

    const onVisible = () => { if (document.visibilityState === "visible") refreshAll(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refreshAll);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refreshAll);
    };
  }, [queryClient]);

  const normalizedSearch = search.trim();

  const getGranularStatus = (status: string) => GRANULAR_STATUS_LABELS[status] || { labelBn: status, labelEn: status, color: "bg-muted text-muted-foreground" };

  // Server-side paginated data query
  const { data: ordersResult, isLoading } = useQuery({
    queryKey: ["order-list-data", search, statusFilter, page, dateRange, customFrom, customTo],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,

    queryFn: async () => {
      const isGlobalSearch = !!normalizedSearch;
      const url = API_BASE;
      const res = await fetch(`${url}/orders/get.php`);
      let data = await res.json();
      data = data.filter((o: any) => !o.is_deleted);

      // format order_items to match what UI expects
      data = data.map((o: any) => ({
        ...o,
        order_items: (o.items || []).map((i: any) => ({
          ...i,
          products: { short_description: i.product_name, regular_price: i.unit_price, product_image: i.product_image }
        }))
      }));

      if (isGlobalSearch) {
        data = data.filter((o: any) => 
          (o.order_id && o.order_id.toLowerCase().includes(normalizedSearch.toLowerCase())) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(normalizedSearch.toLowerCase())) ||
          (o.phone && o.phone.toLowerCase().includes(normalizedSearch.toLowerCase()))
        );
      } else {
        if (statusFilter === "all") {
          data = data.filter((o: any) => ALL_STATUS_VALUES.includes(o.status));
        } else {
          data = data.filter((o: any) => !(o.order_id && o.order_id.startsWith("OLD")));
          const groupValues = FILTER_GROUPS[statusFilter] || [statusFilter];
          data = data.filter((o: any) => groupValues.includes(o.status));
        }

        const dateISO = getDateRangeISO(dateRange, customFrom, customTo);
        if (dateISO) data = data.filter((o: any) => o.created_at >= dateISO);
        if (dateRange === "custom" && customTo) {
          const toEnd = new Date(customTo);
          toEnd.setHours(23, 59, 59, 999);
          data = data.filter((o: any) => o.created_at <= toEnd.toISOString());
        }
      }

      data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      const count = data.length;
      const paginated = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

      return { orders: paginated, totalCount: count };
    },
  });

  const rawOrders = ordersResult?.orders || [];
  const totalCount = ordersResult?.totalCount || 0;

  const orders = rawOrders;

  // Per-status counts using database RPC for accuracy with 41k+ orders
  const { data: statusCounts } = useQuery({
    queryKey: ["order-list-counts-rpc-v2", search, dateRange, customFrom, customTo],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,

    queryFn: async () => {
      const url = API_BASE;
      const res = await fetch(`${url}/orders/get.php`);
      let data = await res.json();
      data = data.filter((o: any) => !o.is_deleted);

      const isGlobalSearch = !!normalizedSearch;
      let filterData = data;
      if (isGlobalSearch) {
        filterData = data.filter((o: any) => 
          (o.order_id && o.order_id.toLowerCase().includes(normalizedSearch.toLowerCase())) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(normalizedSearch.toLowerCase())) ||
          (o.phone && o.phone.toLowerCase().includes(normalizedSearch.toLowerCase()))
        );
      } else {
        filterData = data.filter((o: any) => !(o.order_id && o.order_id.startsWith("OLD")));
        const dateISO = getDateRangeISO(dateRange, customFrom, customTo);
        if (dateISO) filterData = filterData.filter((o: any) => o.created_at >= dateISO);
        if (dateRange === "custom" && customTo) {
          const toEnd = new Date(customTo);
          toEnd.setHours(23, 59, 59, 999);
          filterData = filterData.filter((o: any) => o.created_at <= toEnd.toISOString());
        }
      }

      const counts: Record<string, number> = {};
      STATUS_OPTIONS.forEach(opt => {
        const groupValues = FILTER_GROUPS[opt.value] || [opt.value];
        counts[opt.value] = filterData.filter((o: any) => groupValues.includes(o.status)).length;
      });

      let allData = data.filter((o: any) => ALL_STATUS_VALUES.includes(o.status));
      if (isGlobalSearch) {
        allData = allData.filter((o: any) => 
          (o.order_id && o.order_id.toLowerCase().includes(normalizedSearch.toLowerCase())) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(normalizedSearch.toLowerCase())) ||
          (o.phone && o.phone.toLowerCase().includes(normalizedSearch.toLowerCase()))
        );
      } else {
        const dateISO = getDateRangeISO(dateRange, customFrom, customTo);
        if (dateISO) allData = allData.filter((o: any) => o.created_at >= dateISO);
        if (dateRange === "custom" && customTo) {
          const toEnd = new Date(customTo);
          toEnd.setHours(23, 59, 59, 999);
          allData = allData.filter((o: any) => o.created_at <= toEnd.toISOString());
        }
      }
      counts["all"] = allData.length;
      
      setListCounts(counts);
      return counts;
    },
  });
  const liveListCounts = useListCounts();
  const effectiveCounts = liveListCounts ?? statusCounts;

  const { data: orderItems } = useQuery({
    queryKey: ["order-items", selectedOrder?.id],
    enabled: !!selectedOrder,
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*, products(product_image)").eq("order_id", selectedOrder.id);
      if (error) throw error;
      return (data || []).map((i: any) => ({
        ...i,
        product_image: i.product_image || i.products?.product_image || null,
      }));
    },
  });

  // Incomplete phones for tag
  const allOrderPhones = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o: any) => set.add(o.phone));
    return Array.from(set);
  }, [orders]);

  const { data: rawIncompletePhones } = useQuery({
    queryKey: ["incomplete-phones-for-tags", allOrderPhones],
    enabled: allOrderPhones.length > 0,
    queryFn: async () => {
      try {
        const url = API_BASE;
        const res = await fetch(`${url}/orders/incomplete.php`);
        const json = await res.json();
        const list = json.data || [];
        return list.filter((d: any) => allOrderPhones.includes(d.phone)).map((d: any) => d.phone);
      } catch {
        return [];
      }
    },
  });
  const incompletePhonesList = useMemo(() => new Set(Array.isArray(rawIncompletePhones) ? rawIncompletePhones : []), [rawIncompletePhones]);

  // Repeat order count
  const { data: repeatCounts } = useQuery({
    queryKey: ["repeat-counts-for-tags", allOrderPhones],
    enabled: allOrderPhones.length > 0,
    queryFn: async () => {
      const url = API_BASE;
      const res = await fetch(`${url}/orders/get.php`);
      let data = await res.json();
      const counts: Record<string, number> = {};
      data?.forEach((o: any) => { 
        if (!o.is_deleted && o.status === "confirmed" && allOrderPhones.includes(o.phone)) {
          counts[o.phone] = (counts[o.phone] || 0) + 1; 
        }
      });
      return counts;
    },
  });

  // Fraud data cache from local PHP API
  const { data: fraudDataMap = {} } = useQuery<Record<string, any>>({
    queryKey: ["fraud-cache-data", allOrderPhones],
    enabled: allOrderPhones.length > 0,
    queryFn: async () => {
      try {
        const url = API_BASE;
        const res = await fetch(`${url}/orders/fraud_checker.php?action=get_all_cached`);
        if (!res.ok) return {};
        const json = await res.json();
        const cache = json.data || {};
        const map: Record<string, any> = {};
        allOrderPhones.forEach((p) => {
          const clean = p.replace(/\D/g, "").slice(-11);
          if (cache[clean]) {
            const entry = cache[clean];
            map[p] = { phone: p, fraudchecker_data: entry.fraudchecker_data || entry };
          }
        });
        return map;
      } catch (e) {
        return {};
      }
    },
  });

  // Double order: same visitor_id with multiple orders
  const allVisitorIds = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o: any) => { if (o.visitor_id) set.add(o.visitor_id); });
    return Array.from(set);
  }, [orders]);

  const { data: rawDoubleVisitorIds } = useQuery({
    queryKey: ["double-visitor-tags", allVisitorIds],
    enabled: allVisitorIds.length > 0,
    queryFn: async () => {
      const url = API_BASE;
      const res = await fetch(`${url}/orders/get.php`);
      let data = await res.json();
      const counts: Record<string, number> = {};
      data?.forEach((o: any) => { 
        if (!o.is_deleted && o.status !== "confirmed" && o.visitor_id && allVisitorIds.includes(o.visitor_id)) {
          counts[o.visitor_id] = (counts[o.visitor_id] || 0) + 1; 
        }
      });
      return Object.entries(counts).filter(([, c]) => c > 1).map(([vid]) => vid);
    },
  });
  const doubleVisitorIds = useMemo(() => new Set(Array.isArray(rawDoubleVisitorIds) ? rawDoubleVisitorIds : []), [rawDoubleVisitorIds]);

  // Batch fetch status history for all visible orders
  const allOrderIds = useMemo(() => orders.map((o: any) => o.id), [orders]);
  const { data: statusHistoryMap } = useQuery({
    queryKey: ["order-status-history-batch", allOrderIds],
    enabled: allOrderIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_status_history")
        .select("*")
        .in("order_id", allOrderIds)
        .order("changed_at", { ascending: true });
      if (error) throw error;
      const map: Record<string, any[]> = {};
      (data || []).forEach((h: any) => {
        if (!map[h.order_id]) map[h.order_id] = [];
        map[h.order_id].push(h);
      });
      return map;
    },
  });

  // Bulk status change quick buttons by active tab
  const ALLOWED_STATUS_TRANSITIONS: Record<string, { value: string; labelBn: string; labelEn: string }[]> = {
    confirmed: [
      { value: "printed", labelBn: "প্রিন্টেড", labelEn: "Printed" },
      { value: "entry_done", labelBn: "এন্ট্রি ডান", labelEn: "Entry Done" },
      { value: "cancelled", labelBn: "বাতিল", labelEn: "Cancel" },
    ],
    printed: [
      { value: "entry_done", labelBn: "এন্ট্রি ডান", labelEn: "Entry Done" },
      { value: "confirmed", labelBn: "কনফার্মড", labelEn: "Confirmed" },
      { value: "cancelled", labelBn: "বাতিল", labelEn: "Cancel" },
    ],
    entry_done: [
      { value: "shipped", labelBn: "শিপড", labelEn: "Shipped" },
      { value: "delivered", labelBn: "ডেলিভারড", labelEn: "Delivered" },
      { value: "return", labelBn: "রিটার্ন", labelEn: "Return" },
      { value: "printed", labelBn: "প্রিন্টেড", labelEn: "Printed" },
      { value: "cancelled", labelBn: "বাতিল", labelEn: "Cancel" },
    ],
    shipped: [
      { value: "delivered", labelBn: "ডেলিভারড", labelEn: "Delivered" },
      { value: "partial", labelBn: "পার্শিয়াল", labelEn: "Partial" },
      { value: "return", labelBn: "রিটার্ন", labelEn: "Return" },
    ],
    delivered: [
      { value: "return", labelBn: "রিটার্ন", labelEn: "Return" },
      { value: "partial", labelBn: "পার্শিয়াল", labelEn: "Partial" },
    ],
    partial: [
      { value: "delivered", labelBn: "ডেলিভারড", labelEn: "Delivered" },
      { value: "return", labelBn: "রিটার্ন", labelEn: "Return" },
    ],
    pending_return: [
      { value: "return", labelBn: "রিটার্ন", labelEn: "Return" },
      { value: "delivered", labelBn: "ডেলিভারড", labelEn: "Delivered" },
    ],
    return: [
      { value: "pending_return", labelBn: "পেন্ডিং রিটার্ন", labelEn: "Pending Return" },
    ],
    cancelled: [
      { value: "confirmed", labelBn: "পুনরায় কনফার্ম", labelEn: "Re-confirm" },
    ],
    missing: [
      { value: "confirmed", labelBn: "পুনরায় কনফার্ম", labelEn: "Re-confirm" },
    ],
  };

  const [changingStatus, setChangingStatus] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [entryProgress, setEntryProgress] = useState<{ total: number; done: number; failed: number; current: string; results: { id: string; orderId: string; success: boolean; error?: string }[] }>({ total: 0, done: 0, failed: 0, current: "", results: [] });

  const printSelected = () => {
    const ids = Array.from(selectedIds);
    const selectedOrders = orders.filter((o: any) => ids.includes(o.id));
    if (!selectedOrders.length) return;

    const toBnRaw = (v: any) => String(v ?? "").replace(/[0-9]/g, (d) => ["০","১","২","৩","৪","৫","৬","৭","৮","৯"][Number(d)]);
    const toBn = (v: any) => `<span class="num">${toBnRaw(v)}</span>`;
    const fmtDate = (d: Date) => toBn(`${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`);

    const pages = selectedOrders.map((o: any) => {
      const items = (o.order_items || []);
      const itemRows = items.map((i: any, idx: number) => {
        const price = Number(i.unit_price ?? 0);
        const regPrice = Number(i.products?.regular_price ?? 0);
        const hasDiscount = regPrice > 0 && regPrice > price;
        const qty = Number(i.quantity || 0);
        const displayUnit = hasDiscount ? regPrice : price;
        const lineTotal = displayUnit * qty;
        const name = i.product_name || "";
        const img = i.product_image || i.image_url || "/placeholder.svg";
        const zebra = idx % 2 === 1 ? "background:#f1f8ef" : "background:#ffffff";
        return `<tr style="${zebra};border-bottom:1px solid #e7f0e2">
          <td style="padding:14px 10px;text-align:center;color:#1f2937;font-size:13px;vertical-align:middle;width:38px">${toBn(idx + 1)}</td>
          <td style="padding:10px;vertical-align:middle;width:64px"><div style="width:48px;height:48px;border-radius:8px;background:#eef6ea;overflow:hidden;display:flex;align-items:center;justify-content:center"><img src="${img}" onerror="this.onerror=null;this.src='/placeholder.svg'" style="width:100%;height:100%;object-fit:cover" alt=""/></div></td>
          <td style="padding:10px;vertical-align:middle;color:#0f172a;font-size:13px;line-height:1.45"><div style="font-weight:700">${name}</div>${(i.products?.short_description || i.short_description) ? `<div style="color:#6b7280;font-size:11px;margin-top:2px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-height:2.8em">${String(i.products?.short_description || i.short_description).replace(/<[^>]*>/g, '')}</div>` : ''}</td>
          <td style="padding:10px;text-align:center;color:#1f2937;font-size:13px;vertical-align:middle;white-space:nowrap">${toBn(qty)} প্যাকেট</td>
          <td style="padding:10px;text-align:center;vertical-align:middle;white-space:nowrap"><div style="color:#0f172a;font-size:14px;font-weight:700;line-height:1.2">৳ ${toBn(displayUnit.toFixed(0))}</div></td>
          <td style="padding:10px;text-align:right;color:#0f172a;font-size:13px;font-weight:700;vertical-align:middle;white-space:nowrap;padding-right:14px">৳ ${toBn(lineTotal.toFixed(0))}</td>
        </tr>`;
      }).join("");

      const subtotal = items.reduce((s: number, i: any) => s + Number(i.unit_price || 0) * Number(i.quantity || 0), 0);
      const regularSubtotal = items.reduce((s: number, i: any) => {
        const reg = Number(i.products?.regular_price || i.unit_price || 0);
        const unit = Number(i.unit_price || 0);
        return s + Math.max(reg, unit) * Number(i.quantity || 0);
      }, 0);
      const itemSavings = Math.max(0, regularSubtotal - subtotal);
      const delivery = Number(o.delivery_charge || 0);
      const discount = Number(o.discount || 0) + Number(o.advance || 0);
      const totalSavings = itemSavings + discount;
      const grandTotal = Number(o.total_amount || 0);
      const dateStr = fmtDate(new Date(o.created_at));
      const orderNo = o.order_id || "";
      const paid = String(o.payment_status || "").toLowerCase() === "paid" ? "পরিশোধিত" : "বকেয়া";

      return `
        <div style="page-break-after:always;font-family:'Hind Siliguri','Noto Sans Bengali','SolaimanLipi','Segoe UI',Arial,sans-serif;color:#0f172a;background:#fff;padding:18px 22px;min-height:281mm;box-sizing:border-box;display:flex;flex-direction:column"><div style="flex:1 0 auto">
          <!-- HEADER -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:54px;height:54px;border-radius:50%;background:#eaf5e3;display:flex;align-items:center;justify-content:center;border:2px solid #d4ead0;overflow:hidden"><img src="${window.location.origin}${ssseedshopLogo}" alt="Ss Seed Shop" style="width:100%;height:100%;object-fit:cover"/></div>
              <div>
                <div style="font-size:22px;font-weight:800;color:#1f2937;letter-spacing:-0.3px">Ss Seed Shop</div>
                <div style="font-size:11px;color:#4b5563;margin-top:2px">সবজি, ফুল, ফল ও ঔষধি বীজের নির্ভরযোগ্য অনলাইন প্ল্যাটফর্ম।</div>
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:24px;font-weight:800;color:#1f2937">অর্ডার চালান</div>
              <div style="font-size:11px;color:#4b5563;margin-top:6px">চালান নং: <span style="font-weight:700;color:#0f172a">${orderNo}</span></div>
              <div style="font-size:11px;color:#4b5563;margin-top:2px">তারিখ: <span style="font-weight:700;color:#0f172a">${dateStr}</span></div>
            </div>
          </div>

          <!-- PARTIES -->
          <div style="display:flex;gap:14px;margin-top:18px">
            <div style="flex:1;background:#eef6ea;border:1px solid #d4ead0;border-radius:10px;padding:12px 14px">
              <div style="font-size:11px;color:#4b5563;margin-bottom:4px">Sender</div>
              <div style="font-size:14px;font-weight:700;color:#0f172a">Ss Seed Shop</div>
              <div style="font-size:11px;color:#374151;margin-top:3px;line-height:1.55">Poran Mondol Tak, Boro Dewra, Tongi, Gazipur-1711</div>
              <div style="font-size:11px;color:#374151;margin-top:2px">Phone: <span style="font-family:'Roboto Mono','Courier New',monospace;font-weight:700;color:#0f172a;letter-spacing:0.5px">01805080556</span></div>
              <div style="font-size:11px;color:#374151;margin-top:2px">Help: ssseedshop.com/help</div>
            </div>
            <div style="flex:1;background:#eef6ea;border:1px solid #d4ead0;border-radius:10px;padding:12px 14px">
              <div style="font-size:11px;color:#4b5563;margin-bottom:4px">প্রাপক</div>
              <div style="font-size:14px;font-weight:700;color:#0f172a">${o.customer_name || ""}</div>
              <div style="font-size:11px;color:#374151;margin-top:3px">মোবাইল: <span style="font-family:'Roboto Mono','Courier New',monospace;font-weight:700;color:#0f172a;letter-spacing:0.5px">${o.phone || ""}${o.alt_phone ? " · " + o.alt_phone : ""}</span></div>
              <div style="font-size:11px;color:#374151;margin-top:2px;line-height:1.55">ঠিকানা: ${[o.address, o.thana, o.district].filter(Boolean).join(", ")}</div>
            </div>
          </div>

          <!-- ITEMS -->
          <table style="width:100%;border-collapse:collapse;margin-top:18px">
            <thead>
              <tr style="background:#1c4530">
                <th style="padding:10px;text-align:center;font-size:12px;font-weight:700;color:#ffffff;width:38px">ক্র.</th>
                <th style="padding:10px;text-align:left;font-size:12px;font-weight:700;color:#ffffff;width:64px">ছবি</th>
                <th style="padding:10px;text-align:left;font-size:12px;font-weight:700;color:#ffffff">পণ্যের বিবরণ</th>
                <th style="padding:10px;text-align:center;font-size:12px;font-weight:700;color:#ffffff">পরিমাণ</th>
                <th style="padding:10px;text-align:center;font-size:12px;font-weight:700;color:#ffffff">একক মূল্য</th>
                <th style="padding:10px;text-align:right;font-size:12px;font-weight:700;color:#ffffff;padding-right:14px">মোট</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <!-- TOTALS -->
          <div style="display:flex;justify-content:flex-end;margin-top:14px">
            <table style="width:300px;border-collapse:collapse;font-size:13px">
              <tr><td style="padding:6px 0;color:#4b5563">সাবটোটাল</td><td style="padding:6px 0;text-align:right;color:#0f172a;font-weight:600">৳ ${toBn(regularSubtotal.toFixed(0))}</td></tr>
              <tr><td style="padding:6px 0;color:#4b5563">ডেলিভারি চার্জ</td><td style="padding:6px 0;text-align:right;color:#0f172a;font-weight:600">${delivery > 0 ? "৳ " + toBn(delivery.toFixed(0)) : "ফ্রি"}</td></tr>
              ${totalSavings > 0 ? `<tr><td style="padding:6px 0;color:#4b5563">ছাড়</td><td style="padding:6px 0;text-align:right;color:#dc2626;font-weight:600">- ৳ ${toBn(totalSavings.toFixed(0))}</td></tr>` : ""}
              <tr><td colspan="2" style="padding:0"><div style="border-top:1.5px solid #0f172a;margin:4px 0"></div></td></tr>
              <tr><td style="padding:8px 0;font-size:15px;font-weight:800;color:#0f172a">সর্বমোট</td><td style="padding:8px 0;text-align:right;font-size:18px;font-weight:800;color:#0f172a">৳ ${toBn(grandTotal.toFixed(0))}</td></tr>
              ${totalSavings > 0 ? `<tr><td colspan="2" style="padding:6px 0 0"><div style="background:#ecfdf5;border:1px dashed #10b981;border-radius:6px;padding:6px 10px;text-align:center;color:#047857;font-size:12px;font-weight:700">🎉 আপনি সাশ্রয় করেছেন ৳ ${toBn(totalSavings.toFixed(0))}</div></td></tr>` : ""}
            </table>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:10px">
            <div style="background:#eef6ea;border:1px solid #d4ead0;color:#1f2937;font-size:12px;padding:6px 12px;border-radius:6px">পেমেন্ট স্ট্যাটাস: ${paid}</div>
          </div>

          </div>
          <!-- FOOTER -->
          <div style="margin-top:18px;padding-top:12px;border-top:1px dashed #cbd5e1;text-align:center;page-break-inside:avoid;flex-shrink:0">
            <div style="font-size:14px;font-weight:700;color:#0f172a">আমাদের সাথে থাকার জন্য আন্তরিক ধন্যবাদ! 🪴</div>
            <div style="font-size:11px;color:#4b5563;margin-top:3px">আপনার বাগান সবুজ ও সতেজ হোক — Ss Seed Shop সবসময় আপনার পাশে।</div>
            <div style="font-size:10px;color:#6b7280;margin-top:8px">এটি একটি কম্পিউটার-জেনারেটেড চালান। যেকোনো জিজ্ঞাসার জন্য যোগাযোগ করুন: <span style="font-family:'Roboto Mono','Courier New',monospace;font-weight:700;font-size:12px;color:#0f172a;letter-spacing:0.5px">01805080556</span> / <span style="font-family:'Roboto Mono','Courier New',monospace;font-weight:600;color:#0f172a">info@ssseedshop.com</span></div>
          </div>
        </div>`;
    }).join("");

    const w = window.open("", "_blank");
    if (!w) { toast.error(t("পপ-আপ ব্লকড", "Popup blocked")); return; }
    w.document.write(`<html><head><title>Invoice — ${selectedOrders.length} order(s)</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&family=Tiro+Bangla:ital@0;1&family=Roboto+Mono:wght@500;600;700&display=swap" rel="stylesheet"><style>@page{size:A4;margin:8mm}html,body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-family:'Hind Siliguri','Noto Sans Bengali',Arial,sans-serif}.num{font-family:'Tiro Bangla','Noto Sans Bengali',serif;font-weight:700;letter-spacing:0.6px;font-variant-numeric:tabular-nums;font-feature-settings:"tnum";color:#0b1220}</style></head><body>${pages}<script>window.onload=()=>{setTimeout(()=>window.print(),600);}</script></body></html>`);
    w.document.close();

    // Mark as printed but KEEP selection so user can directly hit "Courier Entry" next
    const printingOrders = orders.filter((o: any) => ids.includes(o.id));
    printingOrders.forEach((o: any) => applyStatusChange(o.status, "printed"));
    const url = API_BASE;
    Promise.all(ids.map(id => fetch(`${url}/orders/update.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "printed", is_printed: true })
    }))).then(() => {
      queryClient.invalidateQueries({ queryKey: ["order-list-data"] });
      queryClient.invalidateQueries({ queryKey: ["order-list-counts-rpc-v2"] });
    });
  };

  const runCourierEntry = async () => {
    const ids = Array.from(selectedIds);
    const selectedOrders = orders.filter((o: any) => ids.includes(o.id));
    if (!selectedOrders.length) return;

    setEntryProgress({ total: selectedOrders.length, done: 0, failed: 0, current: selectedOrders[0]?.order_id || "", results: [] });
    setEntryDialogOpen(true);

    const results: { id: string; orderId: string; success: boolean; error?: string }[] = [];
    let doneCount = 0;
    let failCount = 0;

    for (const o of selectedOrders) {
      setEntryProgress((prev) => ({ ...prev, current: o.order_id }));
      try {
        const url = API_BASE;
        const res = await fetch(`${url}/courier/steadfast.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_order",
            orders: [{
              id: o.id, order_id: o.order_id, customer_name: o.customer_name,
              phone: o.phone, alt_phone: o.alt_phone, address: o.address,
              total_amount: o.total_amount, note: o.note,
            }],
          }),
        });
        const data = await res.json();
        if (data?.error) throw new Error(data.error);
        if (data?.success === false) throw new Error(data.message || "Courier entry failed");
        doneCount++;
        results.push({ id: o.id, orderId: o.order_id, success: true });
      } catch (err: any) {
        failCount++;
        results.push({ id: o.id, orderId: o.order_id, success: false, error: err.message });
      }
      setEntryProgress((prev) => ({ ...prev, done: doneCount, failed: failCount, results: [...results] }));
    }

    setEntryProgress((prev) => ({ ...prev, current: "" }));
    queryClient.invalidateQueries({ queryKey: ["order-list-data"] });
    queryClient.invalidateQueries({ queryKey: ["order-list-counts-rpc-v2"] });
    // Keep only FAILED orders selected so user can retry; successful ones move to Entry Done tab
    const failedIds = new Set(results.filter(r => !r.success).map(r => r.id));
    setSelectedIds(failedIds);
    if (doneCount > 0) toast.success(t(`${doneCount}টি অর্ডার সফলভাবে কুরিয়ারে এন্ট্রি হয়েছে`, `${doneCount} orders entered to courier`));
    if (failCount > 0) toast.error(t(`${failCount}টি অর্ডার ব্যর্থ — পুনরায় চেষ্টা করুন`, `${failCount} failed — please retry`));
  };

  const updateSingleOrderStatus = async (orderId: string, newStatus: string, currentStatus?: string) => {
    if (newStatus === currentStatus) return;
    const adminId = getActiveAdminId();
    const adminEmail = localStorage.getItem("admin_email") || adminId || "admin";

    if (currentStatus) {
      applyStatusChange(currentStatus, newStatus);
    }
    const url = import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";

    try {
      const res = await fetch(`${url}/orders/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus, last_status_changed_by: adminId })
      });
      const updateResult = await res.json();
      if (!res.ok || updateResult.error) {
        if (currentStatus) applyStatusChange(newStatus, currentStatus);
        throw new Error(updateResult.error || "Failed to update order");
      }

      // Also sync with supabase if available (silent fail)
      try {
        await supabase
          .from("orders")
          .update({ status: newStatus, last_status_changed_by: adminId, updated_at: new Date().toISOString() })
          .eq("id", orderId);
      } catch {}

      try {
        await supabase.from("order_status_history").insert([{
          order_id: orderId,
          status: newStatus,
          changed_by: adminId,
          changed_by_name: adminEmail,
        }]);
      } catch {}

      const label = STATUS_OPTIONS.find(s => s.value === newStatus);
      toast.success(t(
        `অর্ডার স্ট্যাটাস "${label?.labelBn || newStatus}" এ পরিবর্তন হয়েছে`,
        `Order status changed to "${label?.labelEn || newStatus}"`
      ));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }
      queryClient.invalidateQueries({ queryKey: ["order-list-data"] });
      queryClient.invalidateQueries({ queryKey: ["order-list-counts-rpc-v2"] });
      queryClient.invalidateQueries({ queryKey: ["order-status-history-batch"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
      queryClient.invalidateQueries({ queryKey: ["order-list-data"] });
    }
  };

  const bulkChangeStatus = async (newStatus: string) => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setChangingStatus(true);
    try {
      const adminId = getActiveAdminId();
      const adminEmail = localStorage.getItem("admin_email") || adminId || "admin";

      const targetOrders = orders.filter((o: any) => ids.includes(o.id));
      targetOrders.forEach((o: any) => applyStatusChange(o.status, newStatus));

      const url = import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";
      const res = await fetch(`${url}/orders/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status: newStatus, last_status_changed_by: adminId })
      });
      const updateResult = await res.json();
      if (!res.ok || updateResult.error) {
        targetOrders.forEach((o: any) => applyStatusChange(newStatus, o.status));
        throw new Error(updateResult.error || "Failed to update orders");
      }

      // Also sync with supabase if available (silent fail)
      try {
        await supabase
          .from("orders")
          .update({ status: newStatus, last_status_changed_by: adminId, updated_at: new Date().toISOString() })
          .in("id", ids);
      } catch {}

      // Insert status history
      const historyRows = ids.map(id => ({
        order_id: id,
        status: newStatus,
        changed_by: adminId,
        changed_by_name: adminEmail,
      }));
      await supabase.from("order_status_history").insert(historyRows);

      const label = STATUS_OPTIONS.find(s => s.value === newStatus) || ALLOWED_STATUS_TRANSITIONS[statusFilter]?.find(s => s.value === newStatus);
      toast.success(t(
        `${ids.length}টি অর্ডার "${label?.labelBn || newStatus}" এ পরিবর্তন হয়েছে`,
        `${ids.length} orders changed to "${label?.labelEn || newStatus}"`
      ));
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["order-list-data"] });
      queryClient.invalidateQueries({ queryKey: ["order-list-counts-rpc-v2"] });
      queryClient.invalidateQueries({ queryKey: ["order-status-history-batch"] });
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setChangingStatus(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!orders.length) return;
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o: any) => o.id)));
    }
  };

  const hasSelected = selectedIds.size > 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const getRelativeTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: bn,
    });
  };

  return (
    <div className="space-y-4">
      {/* Status filter badges */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => {
          const count = effectiveCounts?.[s.value] || 0;
          const IconComp = s.icon;
          return (
            <Badge
              key={s.value}
              className={`cursor-pointer ${statusFilter === s.value ? s.color + " ring-2 ring-offset-1 ring-primary/30" : "bg-muted text-muted-foreground"}`}
              onClick={() => setStatusFilter(s.value)}
            >
              <IconComp className="w-3.5 h-3.5 mr-1" /> {t(s.labelBn, s.labelEn)} ({count})
            </Badge>
          );
        })}
        <Badge
          className={`cursor-pointer ${statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          onClick={() => setStatusFilter("all")}
        >
          {t("সব", "All")} ({effectiveCounts?.["all"] || 0})
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
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
              onCustomChange={(from, to) => { setCustomFrom(from); setCustomTo(to); }}
            />

            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 ml-auto sm:ml-0"
              disabled={syncingCourier}
              onClick={() => syncCourierStatus(false)}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingCourier ? "animate-spin" : ""}`} />
              {t("কুরিয়ার সিঙ্ক", "Sync Courier")}
            </Button>

            {hasSelected && (
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                  {selectedIds.size} {t("টি সিলেক্টেড", " selected")}
                </span>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={printSelected}>
                  <Printer className="w-3.5 h-3.5" />
                  {t("প্রিন্ট", "Print")}
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={runCourierEntry} disabled={entryDialogOpen}>
                  <Truck className="w-3.5 h-3.5" />
                  {t("এন্ট্রি", "Entry")}
                </Button>
                {ALLOWED_STATUS_TRANSITIONS[statusFilter]?.map((target) => (
                  <Button
                    key={target.value}
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={changingStatus}
                    onClick={() => bulkChangeStatus(target.value)}
                  >
                    {changingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                    {t(target.labelBn, target.labelEn)}
                  </Button>
                ))}
                <Select disabled={changingStatus} onValueChange={(val) => bulkChangeStatus(val)}>
                  <SelectTrigger className="h-8 text-xs font-medium min-w-[130px] border-primary/40 bg-background">
                    <SelectValue placeholder={t("স্ট্যাটাস পরিবর্তন...", "Change Status...")} />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {STATUS_OPTIONS.map((opt) => {
                      const OptIcon = opt.icon;
                      return (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          <div className="flex items-center gap-2">
                            <OptIcon className="w-3.5 h-3.5" />
                            <span>{t(opt.labelBn, opt.labelEn)}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !orders.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mb-3 opacity-40" />
              <p>{t("কোনো অর্ডার পাওয়া যায়নি", "No orders found")}</p>
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={orders.length > 0 && selectedIds.size === orders.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>{t("কনফার্ম", "Confirmed")}</TableHead>
                  <TableHead>{t("অর্ডার", "Order")}</TableHead>
                  <TableHead>{t("কাস্টমার", "Customer")}</TableHead>
                  <TableHead>{t("নম্বর", "Number")}</TableHead>
                  <TableHead>{t("পণ্য", "Products")}</TableHead>
                  <TableHead>{t("সোর্স", "Source")}</TableHead>
                  <TableHead className="text-right">{t("মোট", "Total")}</TableHead>
                  <TableHead className="text-center">{t("স্ট্যাটাস", "Status")}</TableHead>
                  <TableHead>{t("ট্যাগ", "Tag")}</TableHead>
                  <TableHead className="text-right">{t("অ্যাকশন", "Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => {
                  const gs = getGranularStatus(order.status);
                  
                  
                  return (
                    <TableRow key={order.id} data-state={selectedIds.has(order.id) ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(order.id)}
                          onCheckedChange={() => toggleSelect(order.id)}
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {getRelativeTime(order.updated_at)}
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        <div>{order.order_id}</div>
                        {order.consignment_id && (
                          <div className="flex items-center gap-1 mt-0.5 font-normal">
                            <span 
                              className="text-[10px] font-mono font-medium text-cyan-800 bg-cyan-50 dark:bg-cyan-950/50 dark:text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-200/60 inline-flex items-center gap-1 max-w-[130px] truncate" 
                              title={`CID: ${order.consignment_id}${order.tracking_code ? ` | Tracking: ${order.tracking_code}` : ''}`}
                            >
                              <Truck className="w-2.5 h-2.5 text-cyan-600 shrink-0" />
                              <span className="truncate">{order.courier_status || "Steadfast"}</span>
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">{order.address}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div>{order.phone}</div>
                        {order.phone && fraudDataMap[order.phone] && (
                          <div className="mt-1">
                            <InlineFraudBar fraudData={fraudDataMap[order.phone]} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[60px]">
                        <div className="flex flex-row flex-nowrap items-center gap-1.5">
                          {(() => {
                            const items = order.order_items || [];
                            if (items.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
                            return (
                              <>
                                {items.slice(0, 3).map((item: any) => (
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
                                              loading="lazy"
                                              className="w-8 h-8 rounded border border-border object-cover bg-muted"
                                              onError={(e) => {
                                                const img = e.currentTarget;
                                                if (!img.dataset.fallback) {
                                                  img.dataset.fallback = "1";
                                                  img.src = "/placeholder.svg";
                                                }
                                              }}
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
                                    +{items.length - 3}
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <SourceBadge source={(order as any).visitors?.traffic_source || order.traffic_source} createdByAdminId={(order as any).created_by_admin_id} />
                      </TableCell>
                      <TableCell className="text-right font-semibold">৳{order.total_amount}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Select
                            value={order.status}
                            onValueChange={(val) => updateSingleOrderStatus(order.id, val, order.status)}
                          >
                            <SelectTrigger className={`h-7 min-w-[105px] max-w-[130px] text-[11px] font-semibold border ${gs.color} px-2 py-0.5 focus:ring-0`}>
                              <SelectValue>
                                {t(gs.labelBn, gs.labelEn)}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent align="center">
                              {STATUS_OPTIONS.map((opt) => {
                                const OptIcon = opt.icon;
                                return (
                                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                    <div className="flex items-center gap-2">
                                      <OptIcon className="w-3.5 h-3.5" />
                                      <span>{t(opt.labelBn, opt.labelEn)}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {order.consignment_id && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    disabled={syncingCourier}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      syncCourierStatus(false, order.consignment_id || order.id);
                                    }}
                                    className="p-1 rounded text-muted-foreground hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-colors disabled:opacity-50"
                                  >
                                    <RefreshCw className={`w-3 h-3 ${syncingCourier ? "animate-spin" : ""}`} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  {t(`কুরিয়ার চেক (${order.courier_status || 'Steadfast'})`, `Check Courier (${order.courier_status || 'Steadfast'})`)}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {(() => {
                            const history = statusHistoryMap?.[order.id];
                            if (!history || history.length <= 1) return null;
                            return (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-[10px] text-muted-foreground cursor-pointer bg-muted/60 px-1 py-0.5 rounded border border-border">
                                      +{history.length - 1}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="text-xs space-y-1 max-w-[220px]">
                                    {history.map((h: any) => (
                                      <div key={h.id} className="flex items-center justify-between gap-3">
                                        <span className="font-medium">{GRANULAR_STATUS_LABELS[h.status]?.labelEn || h.status}</span>
                                        <span className="text-muted-foreground whitespace-nowrap">{format(new Date(h.changed_at), "hh:mm a")}</span>
                                      </div>
                                    ))}
                                    {history[0]?.changed_by_name && (
                                      <div className="text-muted-foreground border-t pt-1 mt-1">{history[history.length - 1].changed_by_name}</div>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <div className="flex flex-wrap gap-1">
                          {incompletePhonesList?.has(order.phone) && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {t("ইনকমপ্লিট", "Incomplete")}
                            </Badge>
                          )}
                          {repeatCounts && (repeatCounts[order.phone] || 0) > 1 && (
                            <Badge className="text-[10px] px-1.5 py-0 gap-0.5 bg-emerald-100 text-emerald-800 border-emerald-200">
                              <Repeat className="w-2.5 h-2.5" />
                              {t("রিপিট", "Repeat")} ({repeatCounts[order.phone]})
                            </Badge>
                          )}
                          {order.visitor_id && doubleVisitorIds?.has(order.visitor_id) && (
                            <Badge className="text-[10px] px-1.5 py-0 gap-0.5 bg-orange-100 text-orange-800 border-orange-200">
                              <Copy className="w-2.5 h-2.5" />
                              {t("ডাবল", "Double")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            title={t("ইনভয়েস লিংক কপি করুন", "Copy Invoice Link")}
                            onClick={() => {
                              const url = `${window.location.origin}/invoice/${order.order_id || order.id}`;
                              navigator.clipboard.writeText(url);
                              toast.success(t("ইনভয়েস লিংক কপি করা হয়েছে!", "Invoice link copied!"));
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/orders/edit/${order.order_id}`)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {/* Pagination */}
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
                    {page + 1} / {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>



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
                  <p className="text-muted-foreground">{t("মোট", "Total")}</p>
                  <p className="font-bold text-primary text-lg">৳{selectedOrder.total_amount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("তারিখ", "Date")}</p>
                  <p className="font-semibold">{format(new Date(selectedOrder.created_at), "dd/MM/yyyy hh:mm a")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">{t("স্ট্যাটাস", "Status")}</p>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(val) => updateSingleOrderStatus(selectedOrder.id, val, selectedOrder.status)}
                  >
                    <SelectTrigger className={`h-8 w-full text-xs font-semibold border ${getGranularStatus(selectedOrder.status).color}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => {
                        const OptIcon = opt.icon;
                        return (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            <div className="flex items-center gap-2">
                              <OptIcon className="w-3.5 h-3.5" />
                              <span>{t(opt.labelBn, opt.labelEn)}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="font-semibold mb-2">{t("পণ্যসমূহ", "Products")}</p>
                <div className="space-y-2">
                  {orderItems?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          loading="lazy"
                          className="w-10 h-10 rounded object-cover bg-muted"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.dataset.fallback) {
                              img.dataset.fallback = "1";
                              img.src = "/placeholder.svg";
                            }
                          }}
                        />
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


      <Dialog open={entryDialogOpen} onOpenChange={(open) => { if (!open && entryProgress.done + entryProgress.failed >= entryProgress.total) setEntryDialogOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("কুরিয়ার এন্ট্রি", "Courier Entry")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {entryProgress.results.map((r) => (
                <div key={r.id} className="flex items-center gap-2 text-xs">
                  <span className="font-mono w-16 shrink-0">{r.orderId}</span>
                  <div className="flex-1"><Progress value={100} className={`h-2 ${r.success ? "[&>div]:bg-green-500" : "[&>div]:bg-destructive"}`} /></div>
                  <span className={`shrink-0 ${r.success ? "text-green-600" : "text-destructive"}`}>{r.success ? "✓" : "✗"}</span>
                </div>
              ))}
              {entryProgress.current && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono w-16 shrink-0">{entryProgress.current}</span>
                  <div className="flex-1"><Progress className="h-2 animate-pulse" /></div>
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground shrink-0" />
                </div>
              )}
            </div>
            <div className="border-t pt-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">
                  {entryProgress.done + entryProgress.failed < entryProgress.total
                    ? t("এন্ট্রি হচ্ছে...", "Entering...")
                    : entryProgress.failed > 0 ? t("কিছু এন্ট্রি ব্যর্থ", "Some failed") : t("সম্পন্ন!", "Complete!")}
                </span>
                <span className="font-medium tabular-nums">{entryProgress.done + entryProgress.failed}/{entryProgress.total}</span>
              </div>
              <Progress value={entryProgress.total > 0 ? ((entryProgress.done + entryProgress.failed) / entryProgress.total) * 100 : 0} className="h-3" />
            </div>
            {entryProgress.done + entryProgress.failed >= entryProgress.total && entryProgress.total > 0 && (
              <Button className="w-full" onClick={() => setEntryDialogOpen(false)}>{t("বন্ধ করুন", "Close")}</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
