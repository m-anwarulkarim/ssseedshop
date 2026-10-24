import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Loader2, CalendarClock, Edit, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

type Tab = "today" | "upcoming" | "past" | "all" | "custom";

export default function PreOrders() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("today");
  const [customDate, setCustomDate] = useState<string>("");
  const [editingOrder, setEditingOrder] = useState<{ id: string; order_id: string; pre_date: string } | null>(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Fetch pre-orders directly from local PHP API
  const { data: allPreOrders = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["pre-orders-all"],
    refetchInterval: 30000,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${url}/orders/get.php?status=pre`);
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.filter((o: any) => !o.is_deleted);
    },
  });

  // Calculate live counts per tab
  const counts = useMemo(() => {
    let todayCount = 0;
    let upcomingCount = 0;
    let pastCount = 0;
    let allCount = allPreOrders.length;

    allPreOrders.forEach((o: any) => {
      if (o.pre_date === today) todayCount++;
      else if (o.pre_date && o.pre_date > today) upcomingCount++;
      else if (o.pre_date && o.pre_date < today) pastCount++;
    });

    return {
      today: todayCount,
      upcoming: upcomingCount,
      past: pastCount,
      all: allCount,
    };
  }, [allPreOrders, today]);

  // Filter and sort pre-orders
  const orders = useMemo(() => {
    let list = allPreOrders;

    if (tab === "today") list = list.filter((o: any) => o.pre_date === today);
    else if (tab === "upcoming") list = list.filter((o: any) => o.pre_date && o.pre_date > today);
    else if (tab === "past") list = list.filter((o: any) => o.pre_date && o.pre_date < today);
    else if (tab === "custom" && customDate) list = list.filter((o: any) => o.pre_date === customDate);

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((o: any) =>
        (o.order_id && String(o.order_id).toLowerCase().includes(s)) ||
        (o.customer_name && String(o.customer_name).toLowerCase().includes(s)) ||
        (o.phone && String(o.phone).toLowerCase().includes(s))
      );
    }

    return [...list].sort((a: any, b: any) => {
      if (a.pre_date && b.pre_date) {
        const cmp = a.pre_date.localeCompare(b.pre_date);
        if (cmp !== 0) return cmp;
      } else if (a.pre_date) return -1;
      else if (b.pre_date) return 1;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [allPreOrders, tab, customDate, search, today]);

  // Update pre_date mutation via PHP API
  const updatePreDateMutation = useMutation({
    mutationFn: async ({ id, pre_date }: { id: string; pre_date: string }) => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${url}/orders/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pre_date }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Update failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-orders-all"] });
      queryClient.invalidateQueries({ queryKey: ["web-orders"] });
      toast.success(t("প্রি-অর্ডার তারিখ আপডেট হয়েছে", "Pre-order date updated"));
      setEditingOrder(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update pre-order date");
    },
  });

  const fmtDate = (d?: string | null) => {
    if (!d) return "—";
    try {
      return format(new Date(d), "dd MMM yyyy", { locale: lang === "bn" ? bn : undefined });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-emerald-600" />
                <h1 className="text-lg font-bold">{t("প্রি-অর্ডার", "Pre Orders")}</h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  refetch();
                  queryClient.invalidateQueries({ queryKey: ["pre-orders-all"] });
                }}
                disabled={isFetching}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
                {t("রিফ্রেশ", "Refresh")}
              </Button>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
              <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="today" className="gap-1.5">
                  {t("আজকের", "Today")}
                  <Badge variant="secondary" className="ml-1">{counts.today}</Badge>
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="gap-1.5">
                  {t("আসন্ন", "Upcoming")}
                  <Badge variant="secondary" className="ml-1">{counts.upcoming}</Badge>
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-1.5">
                  {t("পেরিয়ে যাওয়া", "Past")}
                  <Badge variant="secondary" className="ml-1">{counts.past}</Badge>
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-1.5">
                  {t("সব", "All")}
                  <Badge variant="secondary" className="ml-1">{counts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="custom">{t("কাস্টম তারিখ", "Custom Date")}</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("অর্ডার আইডি, নাম বা মোবাইল...", "Order ID, name or mobile...")}
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {tab === "custom" && (
                <Input
                  type="date"
                  className="max-w-[180px]"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !orders?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CalendarClock className="w-12 h-12 mb-3 opacity-40" />
              <p>{t("কোনো প্রি-অর্ডার নেই", "No pre-orders found")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("অর্ডার আইডি", "Order ID")}</TableHead>
                    <TableHead>{t("নাম", "Name")}</TableHead>
                    <TableHead>{t("ফোন", "Phone")}</TableHead>
                    <TableHead>{t("আইটেম", "Items")}</TableHead>
                    <TableHead className="text-right">{t("মোট", "Total")}</TableHead>
                    <TableHead>{t("ডেলিভারি তারিখ", "Pre Date")}</TableHead>
                    <TableHead className="text-right w-28">{t("অ্যাকশন", "Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o: any) => {
                    const isToday = o.pre_date === today;
                    const isPast = o.pre_date && o.pre_date < today;
                    const itemCount = (o.items && Array.isArray(o.items)) ? o.items.length : (o.order_items?.length || 0);

                    return (
                      <TableRow
                        key={o.id}
                        className="hover:bg-muted/40"
                      >
                        <TableCell
                          className="font-mono text-sm font-semibold cursor-pointer text-primary hover:underline"
                          onClick={() => navigate(`/admin/orders/edit/${o.id}`)}
                        >
                          {o.order_id || o.id}
                        </TableCell>
                        <TableCell className="font-medium">{o.customer_name || "-"}</TableCell>
                        <TableCell className="font-mono text-sm">{o.phone || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {itemCount} {t("টি", " items")}
                        </TableCell>
                        <TableCell className="text-right font-semibold">৳{o.total_amount ?? 0}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              isToday
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isPast
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }
                          >
                            {fmtDate(o.pre_date)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              id={`edit-date-${o.order_id || o.id}`}
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1"
                              title={t("তারিখ পরিবর্তন", "Change Date")}
                              onClick={() => setEditingOrder({ id: o.id, order_id: o.order_id || o.id, pre_date: o.pre_date || "" })}
                            >
                              <CalendarIcon className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{t("তারিখ", "Date")}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title={t("এডিট করুন", "Edit Order")}
                              onClick={() => navigate(`/admin/orders/edit/${o.id}`)}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date Change Modal Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("ডেলিভারি তারিখ পরিবর্তন", "Change Pre-order Date")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                {t("অর্ডার", "Order")}: <span className="font-mono font-semibold text-foreground">{editingOrder?.order_id}</span>
              </p>
              <Input
                type="date"
                id="pre-date-input"
                value={editingOrder?.pre_date || ""}
                onChange={(e) => setEditingOrder((prev) => prev ? { ...prev, pre_date: e.target.value } : null)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditingOrder(null)}>
                {t("বাতিল", "Cancel")}
              </Button>
              <Button
                id="save-pre-date-btn"
                size="sm"
                disabled={updatePreDateMutation.isPending}
                onClick={() => {
                  if (editingOrder) {
                    updatePreDateMutation.mutate({ id: editingOrder.id, pre_date: editingOrder.pre_date });
                  }
                }}
              >
                {updatePreDateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                {t("সংরক্ষণ", "Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
