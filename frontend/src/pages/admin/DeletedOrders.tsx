import { API_URL } from "@/config/env";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Loader2, Trash2, Undo2, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { DateRangeFilter, DateRangeValue, getDateRangeISO } from "@/components/admin/DateRangeFilter";

const PAGE_SIZE = 50;

export default function DeletedOrders() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeValue>("lifetime");
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => { setPage(0); }, [search, dateRange]);

  // Fetch deleted orders from local PHP API
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["deleted-orders", search, dateRange],
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const url = API_URL;
      const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
      const since = getDateRangeISO(dateRange);
      const sinceParam = since ? `&since=${encodeURIComponent(since)}` : "";
      const res = await fetch(`${url}/orders/get.php?deleted_only=1&admin=1&_t=${Date.now()}${searchParam}${sinceParam}`, { cache: "no-store" });
      let data = await res.json();
      if (!Array.isArray(data)) return [];

      if (search.trim()) {
        const s = search.trim().toLowerCase();
        data = data.filter((o: any) =>
          (o.order_id && String(o.order_id).toLowerCase().includes(s)) ||
          (o.customer_name && String(o.customer_name).toLowerCase().includes(s)) ||
          (o.phone && String(o.phone).toLowerCase().includes(s))
        );
      }

      data.sort((a: any, b: any) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
      return data;
    },
  });

  // Restore mutation (single or multiple)
  const restoreMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const url = API_URL;
      const res = await fetch(`${url}/orders/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ ids, is_deleted: false }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || (data && data.error)) throw new Error(data?.error || "Restore failed");
      return ids;
    },
    onSuccess: (restoredIds) => {
      queryClient.setQueriesData(
        { queryKey: ["deleted-orders"] },
        (old: any) => Array.isArray(old) ? old.filter((o: any) => !restoredIds.includes(o.id)) : old
      );
      queryClient.invalidateQueries({ queryKey: ["deleted-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-list-data"] });
      queryClient.invalidateQueries({ queryKey: ["web-orders"] });
      queryClient.invalidateQueries({ queryKey: ["web-orders-counts"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
      toast.success(t("অর্ডার রিস্টোর হয়েছে", "Orders restored"));
      setSelected([]);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Permanent Delete mutation (single or multiple)
  const permanentDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const url = API_URL;
      const res = await fetch(`${url}/orders/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ ids, permanent: true }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || (data && data.error)) throw new Error(data?.error || "Permanent delete failed");
      return ids;
    },
    onSuccess: (deletedIds) => {
      queryClient.setQueriesData(
        { queryKey: ["deleted-orders"] },
        (old: any) => Array.isArray(old) ? old.filter((o: any) => !deletedIds.includes(o.id)) : old
      );
      queryClient.invalidateQueries({ queryKey: ["deleted-orders"] });
      toast.success(t("অর্ডার স্থায়ীভাবে মুছে ফেলা হয়েছে", "Orders permanently deleted"));
      setSelected((prev) => prev.filter((id) => !deletedIds.includes(id)));
      setDeleteTargetId(null);
      setShowBulkDeleteConfirm(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (!orders.length) return;
    if (selected.length === orders.length) {
      setSelected([]);
    } else {
      setSelected(orders.map((o: any) => o.id));
    }
  };

  const paginatedOrders = orders.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center flex-1 max-w-xl">
              <div className="relative flex-1 min-w-[200px] w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("অর্ডার আইডি, নাম বা মোবাইল...", "Order ID, name or mobile...")}
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>
            {selected.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selected.length} {t("টি সিলেক্টেড", " selected")}
                </span>
                <Button
                  id="bulk-restore-btn"
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => restoreMutation.mutate(selected)}
                  disabled={restoreMutation.isPending}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  {t("সিলেক্টেড রিস্টোর", "Restore Selected")}
                </Button>
                <Button
                  id="bulk-delete-btn"
                  size="sm"
                  variant="destructive"
                  className="gap-1.5"
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  disabled={permanentDeleteMutation.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t("স্থায়ীভাবে মুছুন", "Permanently Delete")}
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
          ) : !orders.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Trash2 className="w-12 h-12 mb-3 opacity-40" />
              <p>{t("কোনো ডিলিটেড অর্ডার নেই", "No deleted orders")}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selected.length === orders.length && orders.length > 0}
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>{t("অর্ডার আইডি", "Order ID")}</TableHead>
                      <TableHead>{t("নাম", "Name")}</TableHead>
                      <TableHead>{t("ফোন", "Phone")}</TableHead>
                      <TableHead>{t("আইটেম", "Items")}</TableHead>
                      <TableHead className="text-right">{t("মোট", "Total")}</TableHead>
                      <TableHead>{t("স্ট্যাটাস", "Status")}</TableHead>
                      <TableHead>{t("সময়", "Time")}</TableHead>
                      <TableHead className="text-right w-[140px]">{t("অ্যাকশন", "Actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((o: any) => {
                      const itemCount = (o.items && Array.isArray(o.items)) ? o.items.length : (o.order_items?.length || 0);
                      return (
                        <TableRow key={o.id} className={selected.includes(o.id) ? "bg-muted/50" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selected.includes(o.id)}
                              onCheckedChange={() => toggleSelect(o.id)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold">{o.order_id || o.id}</TableCell>
                          <TableCell className="font-medium">{o.customer_name || "-"}</TableCell>
                          <TableCell className="font-mono text-sm">{o.phone || "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {itemCount} {t("টি আইটেম", " items")}
                          </TableCell>
                          <TableCell className="text-right font-semibold">৳{o.total_amount ?? 0}</TableCell>
                          <TableCell>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted capitalize">{o.status}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {o.updated_at || o.created_at ? formatDistanceToNow(new Date(o.updated_at || o.created_at), { addSuffix: true, locale: bn }) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                id={`restore-${o.order_id || o.id}`}
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title={t("রিস্টোর করুন", "Restore")}
                                disabled={restoreMutation.isPending}
                                onClick={() => restoreMutation.mutate([o.id])}
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t("রিস্টোর", "Restore")}</span>
                              </Button>
                              <Button
                                id={`perm-delete-${o.order_id || o.id}`}
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                title={t("চিরতরে মুছুন", "Delete Forever")}
                                disabled={permanentDeleteMutation.isPending}
                                onClick={() => setDeleteTargetId(o.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {orders.length > PAGE_SIZE && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, orders.length)} / {orders.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={(page + 1) * PAGE_SIZE >= orders.length} onClick={() => setPage((p) => p + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Single Permanent Delete Confirm Dialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(o) => { if (!o) setDeleteTargetId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {t("স্থায়ীভাবে মুছে ফেলবেন?", "Permanently delete?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "এই অর্ডারটি ডাটাবেস থেকে চিরতরে মুছে যাবে। এটি আর কখনো ফিরিয়ে আনা যাবে না।",
                "This order will be permanently erased from database. This cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            <Button
              id="confirm-perm-delete-btn"
              variant="destructive"
              disabled={permanentDeleteMutation.isPending}
              onClick={() => {
                if (deleteTargetId) permanentDeleteMutation.mutate([deleteTargetId]);
              }}
              className="gap-2"
            >
              {permanentDeleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("মুছে ফেলা হচ্ছে...", "Deleting...")}</span>
                </>
              ) : (
                t("হ্যাঁ, চিরতরে মুছুন", "Yes, Erase Forever")
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Permanent Delete Confirm Dialog */}
      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {t("নির্বাচিত সব অর্ডার মুছে ফেলবেন?", "Permanently delete selected?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `সিলেক্ট করা ${selected.length}টি অর্ডার স্থায়ীভাবে মুছে ফেলা হবে। এটি আর ফেরত আনা যাবে না।`,
                `${selected.length} selected order(s) will be permanently deleted. This cannot be undone.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={permanentDeleteMutation.isPending}
              onClick={() => permanentDeleteMutation.mutate(selected)}
              className="gap-2"
            >
              {permanentDeleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("মুছে ফেলা হচ্ছে...", "Deleting...")}</span>
                </>
              ) : (
                t("হ্যাঁ, সব মুছে ফেলুন", "Yes, Delete All")
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
