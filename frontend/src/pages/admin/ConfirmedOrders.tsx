import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { applyStatusChange } from "@/stores/orderCountsStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getActiveAdminId } from "@/lib/adminAccess";
import { dispatchOrderNotification } from "@/lib/orderNotifications";
import {
  Search, Loader2, Package, Printer, ClipboardCheck, Truck,
  PackageCheck, PackageMinus, RotateCcw, Undo2, XCircle, HelpCircle,
  Pencil, StickyNote, Tag, Eye, ChevronLeft, ChevronRight, Settings, FileText,
} from "lucide-react";
import { SourceBadge } from "@/components/admin/SourceBadge";

const PAGE_SIZE = 50;
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { DateRangeFilter, DateRangeValue, getDateRangeISO } from "@/components/admin/DateRangeFilter";

const CONFIRMED_STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed", labelBn: "কনফার্মড", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: Package },
  { value: "printed", label: "Printed", labelBn: "প্রিন্টেড", color: "bg-cyan-100 text-cyan-800 border-cyan-200", icon: Printer },
  { value: "entry_done", label: "Entry Done", labelBn: "এন্ট্রি ডান", color: "bg-teal-100 text-teal-800 border-teal-200", icon: ClipboardCheck },
  { value: "shipped", label: "Shipped", labelBn: "শিপড", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Truck },
  { value: "delivered", label: "Delivered", labelBn: "ডেলিভারড", color: "bg-green-100 text-green-800 border-green-200", icon: PackageCheck },
  { value: "partial", label: "Partial", labelBn: "পার্শিয়াল", color: "bg-amber-100 text-amber-800 border-amber-200", icon: PackageMinus },
  { value: "pending_return", label: "Pending Return", labelBn: "পেন্ডিং রিটার্ন", color: "bg-orange-100 text-orange-800 border-orange-200", icon: RotateCcw },
  { value: "return", label: "Return", labelBn: "রিটার্ন", color: "bg-rose-100 text-rose-800 border-rose-200", icon: Undo2 },
  { value: "cancelled", label: "Cancel", labelBn: "বাতিল", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  { value: "missing", label: "Missing", labelBn: "মিসিং", color: "bg-gray-100 text-gray-800 border-gray-200", icon: HelpCircle },
];

const CONFIRMED_STATUS_VALUES = CONFIRMED_STATUS_OPTIONS.map((s) => s.value);
const VISIBLE_STATUSES = CONFIRMED_STATUS_VALUES;
const LEGACY_ORDER_SOURCE_FILTER = "traffic_source.is.null,traffic_source.neq.ecomdrive";


export default function ConfirmedOrders() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("confirmed");
  const [dateRange, setDateRange] = useState<DateRangeValue>("lifetime");
  const [invoiceFilter, setInvoiceFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [entryProgress, setEntryProgress] = useState<{ total: number; done: number; failed: number; current: string; results: { id: string; orderId: string; success: boolean; error?: string }[] }>({ total: 0, done: 0, failed: 0, current: "", results: [] });

  useEffect(() => { setPage(0); }, [search, statusFilter, dateRange, invoiceFilter]);

  const normalizedSearch = search.trim();

  const getStatusInfo = (status: string) => {
    return CONFIRMED_STATUS_OPTIONS.find((s) => s.value === status) || CONFIRMED_STATUS_OPTIONS[0];
  };

  const { data: ordersResult, isLoading } = useQuery({
    queryKey: ["confirmed-orders", search, statusFilter, page, dateRange],
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${url}/orders/get.php`);
      let data = await res.json();
      
      // Default filters
      data = data.filter((o: any) => o.is_deleted !== true);

      const isGlobalSearch = !!normalizedSearch;

      if (isGlobalSearch) {
        data = data.filter((o: any) => 
          (o.order_id && o.order_id.toLowerCase().includes(normalizedSearch)) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(normalizedSearch)) ||
          (o.phone && o.phone.toLowerCase().includes(normalizedSearch))
        );
      } else {
        // filter out old orders if needed
        data = data.filter((o: any) => !(o.order_id && String(o.order_id).startsWith("OLD")));
        
        data = data.filter((o: any) => VISIBLE_STATUSES.includes(o.status));
        
        if (statusFilter && statusFilter !== "all") {
          data = data.filter((o: any) => o.status === statusFilter);
        }
        
        const since = getDateRangeISO(dateRange);
        if (since) {
          data = data.filter((o: any) => new Date(o.created_at) >= new Date(since));
        }
      }

      const count = data.length;
      
      // Pagination
      const paginatedData = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

      return { orders: paginatedData, totalCount: count };
    },
  });

  const orders = ordersResult?.orders || [];
  const totalCount = ordersResult?.totalCount || 0;

  const { data: statusCounts } = useQuery({
    queryKey: ["confirmed-orders-counts-rpc-v1", search, dateRange],
    refetchOnMount: "always",
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${url}/orders/get.php`);
      let allOrders = await res.json();
      
      allOrders = allOrders.filter((o: any) => o.is_deleted !== true);

      if (normalizedSearch) {
        allOrders = allOrders.filter((o: any) => 
          (o.order_id && o.order_id.toLowerCase().includes(normalizedSearch)) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(normalizedSearch)) ||
          (o.phone && o.phone.toLowerCase().includes(normalizedSearch))
        );
      } else {
        allOrders = allOrders.filter((o: any) => !(o.order_id && String(o.order_id).startsWith("OLD")));
        const since = getDateRangeISO(dateRange);
        if (since) {
          allOrders = allOrders.filter((o: any) => new Date(o.created_at) >= new Date(since));
        }
      }

      const counts: Record<string, number> = {};
      let totalAll = 0;
      
      VISIBLE_STATUSES.forEach(status => {
        const count = allOrders.filter((o: any) => o.status === status).length;
        counts[status] = count;
        totalAll += count;
      });
      
      counts.all = totalAll;
      return counts;
    },
  });

  // Fetch unique invoice names for filter dropdown
  const { data: invoiceNames = [] } = useQuery({
    queryKey: ["invoice-names-list"],
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${url}/products/get.php`);
      const pData = await res.json();
      const names = new Set<string>();
      (pData || []).forEach((p: any) => { if (p.sku) names.add(p.sku); });
      return Array.from(names).sort();
    },
  });

  // When invoice filter is active, find matching order IDs
  const { data: invoiceMatchedOrderIds } = useQuery({
    queryKey: ["invoice-filter-orders", invoiceFilter],
    enabled: !!invoiceFilter,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${url}/products/get.php`);
      let pData = await res.json();
      pData = pData.filter((p: any) => p.sku === invoiceFilter);

      if (!pData || pData.length === 0) return [];

      const baseProductMap = new Map<string, { name: string; offer_price: number | null; regular_price: number }>();
      pData.forEach((p: any) => {
        baseProductMap.set(String(p.id), { name: p.name, offer_price: p.offer_price ? Number(p.offer_price) : null, regular_price: Number(p.regular_price) });
      });

      const matchedOrderIds = new Set<string>();
      
      const ordersRes = await fetch(`${url}/orders/get.php`);
      const allOrders = await ordersRes.json();
      
      allOrders.forEach((o: any) => {
        (o.items || []).forEach((item: any) => {
          const base = baseProductMap.get(String(item.product_id));
          if (!base) return;
          const nameMatch = item.product_name === base.name;
          const priceMatch = (base.offer_price !== null && Number(item.unit_price) === Number(base.offer_price)) ||
            Number(item.unit_price) === Number(base.regular_price);
          if (nameMatch && priceMatch) {
            matchedOrderIds.add(o.id);
          }
        });
      });
      return Array.from(matchedOrderIds);
    },
  });

  const orderIds = useMemo(() => orders?.map((o) => o.id) || [], [orders]);

  // Apply invoice filter client-side
  const filteredOrders = useMemo(() => {
    if (!invoiceFilter || !invoiceMatchedOrderIds) return orders;
    const matchSet = new Set(invoiceMatchedOrderIds);
    return orders.filter((o) => matchSet.has(o.id));
  }, [orders, invoiceFilter, invoiceMatchedOrderIds]);

  const { data: allOrderItems } = useQuery({
    queryKey: ["all-confirmed-order-items", orderIds],
    enabled: orderIds.length > 0,
    queryFn: async () => {
      // In PHP JSON, order items are already inside the order object.
      // So we can just map through `orders` and extract items.
      const items: any[] = [];
      orders.forEach((o: any) => {
        const orderItems = (o.items && Array.isArray(o.items)) ? o.items : (o.order_items || []);
        orderItems.forEach((item: any) => {
          items.push({
            ...item,
            order_id: o.id,
            order_code: o.order_id || o.id,
            product_image: item.product_image || null
          });
        });
      });
      return items;
    },
  });

  const itemsByOrder = useMemo(() => {
    const map: Record<string, any[]> = {};
    allOrderItems?.forEach((item: any) => {
      if (item.order_id) {
        if (!map[item.order_id]) map[item.order_id] = [];
        map[item.order_id].push(item);
      }
      if (item.order_code && item.order_code !== item.order_id) {
        if (!map[item.order_code]) map[item.order_code] = [];
        map[item.order_code].push(item);
      }
    });
    return map;
  }, [allOrderItems]);

  const selectedOrderItems = selectedOrder
    ? (itemsByOrder[selectedOrder.id] || itemsByOrder[selectedOrder.order_id] || selectedOrder.items || selectedOrder.order_items || [])
    : [];

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, oldStatus }: { id: string; status: string; oldStatus?: string }) => {
      applyStatusChange(oldStatus, status);
      
      const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const payload = {
        id,
        status,
        last_status_changed_by: getActiveAdminId()
      };
      
      const res = await fetch(`${url}/orders/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok || data.status !== 'success') {
        applyStatusChange(status, oldStatus);
        throw new Error(data.error || "Failed to update status");
      }
      
      // Fire fail-safe notification
      const curOrder = orders?.find((o) => o.id === id);
      dispatchOrderNotification({
        orderId: curOrder?.order_id || id,
        newStatus: status,
        oldStatus,
        phone: curOrder?.phone,
        customerName: curOrder?.customer_name,
        totalAmount: curOrder?.total_amount,
        trackingCode: curOrder?.tracking_code,
      }).catch(console.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
      queryClient.invalidateQueries({ queryKey: ["web-orders"] });
      toast.success(t("স্ট্যাটাস আপডেট হয়েছে", "Status updated"));
    },
    onError: (err: Error) => toast.error(err.message),
  });


  const runCourierEntry = async () => {
    const ids = Array.from(selectedIds);
    const selectedOrders = orders?.filter((o) => ids.includes(o.id)) || [];
    if (!selectedOrders.length) return;

    setEntryProgress({ total: selectedOrders.length, done: 0, failed: 0, current: selectedOrders[0]?.order_id || "", results: [] });
    setEntryDialogOpen(true);

    // Always use single create_order per order (bulk API doesn't save item_description/note)
    const results: { id: string; orderId: string; success: boolean; error?: string }[] = [];
    let doneCount = 0;
    let failCount = 0;

    for (const o of selectedOrders) {
      setEntryProgress((prev) => ({ ...prev, current: o.order_id }));
      try {
        const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
        const res = await fetch(`${url}/courier/steadfast.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_order",
            orders: [{
              id: o.id,
              order_id: o.order_id,
              customer_name: o.customer_name,
              phone: o.phone,
              alt_phone: o.alt_phone,
              address: o.address,
              total_amount: o.total_amount,
              note: o.note,
            }],
          }),
        });
        const data = await res.json();
        if (data?.error) {
          const inactive = data.account_inactive || /account\s+is\s+not\s+active/i.test(String(data.error));
          throw new Error(inactive
            ? t("Steadfast অ্যাকাউন্ট Active না থাকায় এন্ট্রি হয়নি। Steadfast/Packzy সাপোর্টে Merchant Account Active করতে হবে।", "Steadfast account is not active, so courier entry was rejected. Please activate the merchant account with Steadfast/Packzy support.")
            : data.error
          );
        }
        if (data?.success === false) throw new Error(data.message || data.error || "Courier entry failed");
        doneCount++;
        results.push({ id: o.id, orderId: o.order_id, success: true });
      } catch (err: any) {
        failCount++;
        results.push({ id: o.id, orderId: o.order_id, success: false, error: err.message });
      }
      setEntryProgress((prev) => ({ ...prev, done: doneCount, failed: failCount, results: [...results] }));
    }

    setEntryProgress((prev) => ({ ...prev, current: "" }));
    queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
    setSelectedIds(new Set());
    if (doneCount > 0) toast.success(t(`${doneCount}টি অর্ডার এন্ট্রি সফল`, `${doneCount} orders entered successfully`));
    if (failCount > 0) {
      const firstError = results.find((r) => !r.success)?.error;
      toast.error(firstError || t(`${failCount}টি অর্ডার এন্ট্রি ব্যর্থ`, `${failCount} orders failed`));
    }
  };

  const openEntryDialog = () => {
    runCourierEntry();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!filteredOrders) return;
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const hasSelected = selectedIds.size > 0;

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
        {CONFIRMED_STATUS_OPTIONS.map((s) => {
          const Icon = s.icon;
          const count = statusCounts?.[s.value] || 0;
          return (
            <Badge
              key={s.value}
              className={`cursor-pointer gap-1 ${statusFilter === s.value ? s.color + " ring-2 ring-offset-1 ring-primary/30" : "bg-muted text-muted-foreground"}`}
              onClick={() => {
                setStatusFilter(s.value);
                if (s.value === "confirmed" || s.value === "printed") setDateRange("lifetime");
              }}
            >
              <Icon className="w-3 h-3" />
              {t(s.labelBn, s.label)} ({count})
            </Badge>
          );
        })}
        <Badge
          className={`cursor-pointer ${statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          onClick={() => setStatusFilter("all")}
        >
          {t("সব", "All")} ({statusCounts?.all || 0})
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmed-orders-search"
                placeholder={t("অর্ডার আইডি, নাম বা ফোন...", "Order ID, name or phone...")}
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {statusFilter !== "confirmed" && statusFilter !== "printed" && (
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
            )}
            {invoiceNames.length > 0 && (
              <Select value={invoiceFilter} onValueChange={(v) => setInvoiceFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="h-9 w-[160px] text-xs">
                  <SelectValue placeholder={t("ইনভয়েস ফিল্টার", "Invoice Filter")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("সব ইনভয়েস", "All Invoices")}</SelectItem>
                  {invoiceNames.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {invoiceFilter && (
              <Badge className="bg-secondary text-secondary-foreground">
                {t("ইনভয়েস", "Invoice")}: {invoiceFilter} ({filteredOrders.length})
              </Badge>
            )}
            {hasSelected && (
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {selectedIds.size} {t("টি সিলেক্টেড", " selected")}
                </span>
                <Select
                  onValueChange={async (newStatus) => {
                    const ids = Array.from(selectedIds);
                    const targetOrders = orders?.filter((o: any) => ids.includes(o.id)) || [];
                    targetOrders.forEach((o: any) => applyStatusChange(o.status, newStatus));
                    try {
                      const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
                      
                      await Promise.all(ids.map(async (id) => {
                        const res = await fetch(`${url}/orders/update.php`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id, status: newStatus, last_status_changed_by: getActiveAdminId() })
                        });
                        if (!res.ok) throw new Error("Bulk update failed for some items");
                      }));
                      
                      // Fire fail-safe notifications for each order
                      for (const id of ids) {
                        const cur = orders?.find((o) => o.id === id);
                        dispatchOrderNotification({
                          orderId: cur?.order_id || id,
                          newStatus: newStatus,
                          phone: cur?.phone,
                          customerName: cur?.customer_name,
                          totalAmount: cur?.total_amount,
                          trackingCode: cur?.tracking_code,
                        }).catch(console.error);
                      }
                      queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
                      queryClient.invalidateQueries({ queryKey: ["web-orders"] });
                      setSelectedIds(new Set());
                      toast.success(t(`${ids.length}টি অর্ডারের স্ট্যাটাস আপডেট হয়েছে`, `${ids.length} orders status updated`));
                    } catch (err: any) {
                      toast.error(err.message);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue placeholder={t("স্ট্যাটাস চেঞ্জ", "Change Status")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CONFIRMED_STATUS_OPTIONS.map((s) => {
                      const Icon = s.icon;
                      return (
                        <SelectItem key={s.value} value={s.value}>
                          <span className="flex items-center gap-1.5">
                            <Icon className="w-3 h-3" />
                            {t(s.labelBn, s.label)}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => openEntryDialog()}
                  disabled={entryDialogOpen}
                >
                  <Truck className="w-3.5 h-3.5" />
                  {t("এন্ট্রি", "Entry")}
                </Button>
                
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !filteredOrders?.length ? (
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
                    <TableHead className="w-10">
                      <Checkbox
                        checked={filteredOrders.length > 0 && selectedIds.size === filteredOrders.length}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>{t("কনফার্ম", "Confirmed")}</TableHead>
                    <TableHead>{t("অর্ডার", "Order")}</TableHead>
                    <TableHead>{t("কাস্টমার", "Customer")}</TableHead>
                    <TableHead>{t("নাম্বার", "Number")}</TableHead>
                    <TableHead>{t("পণ্য", "Products")}</TableHead>
                    <TableHead>{t("সোর্স", "Source")}</TableHead>
                    <TableHead className="text-center">{t("প্রিন্ট/এন্ট্রি", "Print/Entry")}</TableHead>
                    <TableHead>{t("স্ট্যাটাস", "Status")}</TableHead>
                    <TableHead className="text-right">{t("মোট", "Total")}</TableHead>
                    <TableHead className="text-center">{t("এডিট", "Edit")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const si = getStatusInfo(order.status);
                    const StatusIcon = si.icon;
                    const items = itemsByOrder[order.id] || itemsByOrder[order.order_id] || order.items || order.order_items || [];
                    const isCourierEntered = (order as any).is_courier_entered;

                    return (
                      <TableRow key={order.id} data-state={selectedIds.has(order.id) ? "selected" : undefined}>
                        {/* Checkbox */}
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(order.id)}
                            onCheckedChange={() => toggleSelect(order.id)}
                          />
                        </TableCell>

                        {/* Relative time since confirmed */}
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap min-w-[90px]">
                          {getRelativeTime(order.updated_at)}
                        </TableCell>

                        {/* Order ID */}
                        <TableCell className="min-w-[100px]">
                          <button
                            className="font-bold text-primary hover:underline cursor-pointer text-left"
                            onClick={() => setSelectedOrder(order)}
                          >
                            {order.order_id}
                          </button>
                        </TableCell>

                        {/* Customer name + address */}
                        <TableCell className="min-w-[140px] max-w-[200px]">
                          <p className="font-medium text-sm">{order.customer_name}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{order.address}</p>
                        </TableCell>

                        {/* Phone + alt phone */}
                        <TableCell className="min-w-[110px]">
                          <p className="text-sm">{order.phone}</p>
                          {order.alt_phone && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{order.alt_phone}</p>
                          )}
                        </TableCell>

                        {/* Product images stacked */}
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

                        {/* Source */}
                        <TableCell>
                          <SourceBadge source={(order as any).traffic_source || (order as any).visitors?.traffic_source} createdByAdminId={(order as any).created_by_admin_id} />
                        </TableCell>

                        {/* Courier Entry icon */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
                                      isCourierEntered
                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                        : "bg-muted/50 text-muted-foreground/30"
                                    }`}
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  {isCourierEntered ? t("কুরিয়ার এন্ট্রি হয়েছে", "Courier Entered") : t("এন্ট্রি হয়নি", "Not Entered")}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>

                        {/* Status (read-only) + note */}
                        <TableCell className="min-w-[120px]">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${si.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {t(si.labelBn, si.label)}
                          </div>
                          {order.note && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <StickyNote className="w-3.5 h-3.5 text-muted-foreground mt-1 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[250px] text-xs">
                                  {order.note}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </TableCell>

                        {/* Total */}
                        <TableCell className="text-right font-semibold whitespace-nowrap">
                          ৳{order.total_amount}
                        </TableCell>

                        {/* Edit */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
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
            </div>
            {filteredOrders.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredOrders.length)} / {filteredOrders.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={(page + 1) * PAGE_SIZE >= filteredOrders.length} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
          )}
        </CardContent>
      </Card>

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
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusInfo(selectedOrder.status).color}`}>
                    {(() => { const SI = getStatusInfo(selectedOrder.status).icon; return <SI className="w-3.5 h-3.5" />; })()}
                    {t(getStatusInfo(selectedOrder.status).labelBn, getStatusInfo(selectedOrder.status).label)}
                  </div>
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

      {/* Courier Entry Progress Dialog */}
      <Dialog open={entryDialogOpen} onOpenChange={(open) => { if (!open && entryProgress.done + entryProgress.failed >= entryProgress.total) setEntryDialogOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("কুরিয়ার এন্ট্রি", "Courier Entry")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Individual order list */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {entryProgress.results.map((r) => (
                <div key={r.id} className="space-y-1 rounded-md border border-border bg-muted/30 p-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono w-16 shrink-0">{r.orderId}</span>
                    <div className="flex-1">
                      <Progress value={100} className={`h-2 ${r.success ? "[&>div]:bg-green-500" : "[&>div]:bg-destructive"}`} />
                    </div>
                    <span className={`shrink-0 ${r.success ? "text-green-600" : "text-destructive"}`}>
                      {r.success ? "✓" : "✗"}
                    </span>
                  </div>
                  {!r.success && r.error && (
                    <p className="pl-16 text-[11px] font-medium leading-relaxed text-destructive">
                      {r.error}
                    </p>
                  )}
                </div>
              ))}
              {/* Currently processing */}
              {entryProgress.current && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono w-16 shrink-0">{entryProgress.current}</span>
                  <div className="flex-1">
                    <Progress className="h-2 animate-pulse" />
                  </div>
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground shrink-0" />
                </div>
              )}
            </div>

            {/* Total progress bar */}
            <div className="border-t pt-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">
                  {entryProgress.done + entryProgress.failed < entryProgress.total
                    ? t("এন্ট্রি হচ্ছে...", "Entering...")
                    : entryProgress.failed > 0
                      ? t("কিছু এন্ট্রি ব্যর্থ", "Some entries failed")
                      : t("সম্পন্ন!", "Complete!")}
                </span>
                <span className="font-medium tabular-nums">{entryProgress.done + entryProgress.failed}/{entryProgress.total}</span>
              </div>
              <Progress value={entryProgress.total > 0 ? ((entryProgress.done + entryProgress.failed) / entryProgress.total) * 100 : 0} className="h-3" />
              <div className="flex gap-3 text-xs">
                {entryProgress.done > 0 && <span className="text-green-600 font-medium">✓ {entryProgress.done} {t("সফল", "success")}</span>}
                {entryProgress.failed > 0 && <span className="text-destructive font-medium">✗ {entryProgress.failed} {t("ব্যর্থ", "failed")}</span>}
              </div>
            </div>

            {entryProgress.done + entryProgress.failed >= entryProgress.total && entryProgress.total > 0 && (
              <Button className="w-full" onClick={() => setEntryDialogOpen(false)}>
                {t("বন্ধ করুন", "Close")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
