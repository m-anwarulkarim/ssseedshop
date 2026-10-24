import { API_URL } from "@/config/env";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Loader2, Eye, Users, Save, BadgeCheck, Ban, ShieldCheck, MessageSquare, RefreshCw, Star, Calendar } from "lucide-react";
import { format } from "date-fns";
import { CustomerExportButton } from "@/components/admin/CustomerExportButton";
import { CustomerOrderHistory } from "@/components/admin/CustomerOrderHistory";

interface CustomerRow {
  id: string;
  visitor_id: string;
  phone: string;
  name: string | null;
  address: string | null;
  district: string | null;
  thana: string | null;
  user_type: string | null;
  alt_phone: string | null;
  profile_picture?: string | null;
  cover_photo?: string | null;
  gender?: string | null;
  admin_notes?: string | null;
  phone_verified?: boolean;
  access_allowed: boolean;
  orderCount: number;
  orderTotal: number;
  last_order_date?: string | null;
}

export default function CustomerList() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [countFilter, setCountFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [banConfirm, setBanConfirm] = useState<{ visitor_id: string; ban: boolean; name: string } | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const ORDER_COUNT_FILTERS = [
    { value: "all", label: t("সব", "All") },
    { value: "1+", label: "১+" },
    { value: "5+", label: "৫+" },
    { value: "10+", label: "১০+" },
    { value: "20+", label: "২০+" },
  ];

  const AMOUNT_FILTERS = [
    { value: "all", label: t("সব", "All") },
    { value: "1000+", label: "৳১,০০০+" },
    { value: "5000+", label: "৳৫,০০০+" },
    { value: "10000+", label: "৳১০,০০০+" },
    { value: "50000+", label: "৳৫০,০০০+" },
  ];

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [search, typeFilter, countFilter, amountFilter, statusFilter]);

  // Load customer list from local PHP API
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", search, typeFilter, countFilter, amountFilter, statusFilter],
    queryFn: async () => {
      const url = API_URL;
      const searchParam = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
      const res = await fetch(`${url}/customer/get.php${searchParam}`);
      let data = await res.json();
      if (!Array.isArray(data)) return [];

      let result: CustomerRow[] = data;

      if (typeFilter !== "all") {
        result = result.filter((c) => c.user_type === typeFilter);
      }

      const countMin = countFilter === "all" ? 0 : parseInt(countFilter);
      if (countMin > 0) result = result.filter((c) => (c.orderCount || 0) >= countMin);

      const amountMin = amountFilter === "all" ? 0 : parseInt(amountFilter);
      if (amountMin > 0) result = result.filter((c) => (c.orderTotal || 0) >= amountMin);

      if (statusFilter === "banned") result = result.filter((c) => c.access_allowed === false);
      else if (statusFilter === "active") result = result.filter((c) => c.access_allowed !== false);

      return result;
    },
  });

  // Update customer info via PHP API
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = API_URL;
      const res = await fetch(`${url}/customer/profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: data.id,
          phone: data.phone,
          name: data.name,
          address: data.address,
          district: data.district,
          thana: data.thana,
          user_type: data.user_type,
          alt_phone: data.alt_phone,
          gender: data.gender,
          admin_notes: data.admin_notes,
        }),
      });
      const resData = await res.json();
      if (!res.ok || resData.status !== "success") throw new Error(resData.message || "Failed to update customer");
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(t("কাস্টমার আপডেট হয়েছে", "Customer updated"));
      setSelectedCustomer(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Ban/Unban customer via PHP API
  const banMutation = useMutation({
    mutationFn: async ({ visitor_id, ban }: { visitor_id: string; ban: boolean }) => {
      const url = API_URL;
      const res = await fetch(`${url}/customer/profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: visitor_id,
          access_allowed: !ban,
        }),
      });
      const resData = await res.json();
      if (!res.ok || resData.status !== "success") throw new Error(resData.message || "Failed to update ban status");
      return resData;
    },
    onSuccess: (_, { ban }) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(ban ? t("ইউজার ব্যান করা হয়েছে", "User banned") : t("ব্যান তুলে নেওয়া হয়েছে", "User unbanned"));
      setSelectedCustomer(null);
      setBanConfirm(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openDetail = (c: CustomerRow) => {
    setSelectedCustomer(c);
    setEditData({
      id: c.id,
      visitor_id: c.visitor_id,
      phone: c.phone,
      name: c.name || "",
      address: c.address || "",
      district: c.district || "",
      thana: c.thana || "",
      user_type: c.user_type || "regular",
      alt_phone: c.alt_phone || "",
      gender: c.gender || "",
      admin_notes: c.admin_notes || "",
    });
  };

  const bannedCount = customers?.filter((c) => !c.access_allowed).length || 0;
  const activeCount = customers?.filter((c) => c.access_allowed).length || 0;
  const totalCount = customers?.length || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const paginatedCustomers = customers?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {activeCount > 0 && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✅ {activeCount} {t("অ্যাক্টিভ", "Active")}</span>
        )}
        {bannedCount > 0 && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">🚫 {bannedCount} {t("ব্যান", "Banned")}</span>
        )}
        <div className="ml-auto flex gap-2">
          <CustomerExportButton customers={customers || []} />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="customer-search-input"
                placeholder={t("নাম বা মোবাইল নম্বর...", "Name or mobile number...")}
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={countFilter} onValueChange={setCountFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t("অর্ডার", "Orders")} />
              </SelectTrigger>
              <SelectContent>
                {ORDER_COUNT_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={amountFilter} onValueChange={setAmountFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("অ্যামাউন্ট", "Amount")} />
              </SelectTrigger>
              <SelectContent>
                {AMOUNT_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t("স্ট্যাটাস", "Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("সব", "All")}</SelectItem>
                <SelectItem value="active">{t("সক্রিয়", "Active")}</SelectItem>
                <SelectItem value="banned">{t("🚫 ব্যান", "🚫 Banned")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !customers?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mb-3 opacity-40" />
              <p>{t("কোনো কাস্টমার পাওয়া যায়নি", "No customers found")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("নাম", "Name")}</TableHead>
                    <TableHead>{t("মোবাইল", "Mobile")}</TableHead>
                    <TableHead>{t("লোকেশন", "Location")}</TableHead>
                    <TableHead>{t("ধরন", "Type")}</TableHead>
                    <TableHead className="text-center">{t("অর্ডার", "Orders")}</TableHead>
                    <TableHead className="text-right">{t("মোট কেনাকাটা", "Total Spent")}</TableHead>
                    <TableHead>{t("শেষ অর্ডার", "Last Order")}</TableHead>
                    <TableHead>{t("মন্তব্য", "Notes")}</TableHead>
                    <TableHead className="text-right">{t("অ্যাকশন", "Action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((c) => (
                    <TableRow
                      key={c.id}
                      className={`cursor-pointer hover:bg-muted/40 ${!c.access_allowed ? "bg-destructive/5" : ""}`}
                      onClick={() => openDetail(c)}
                    >
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-1.5">
                          {!c.access_allowed && <Ban className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
                          {c.name || "—"}
                          {c.orderCount >= 2 ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary"><RefreshCw className="w-2.5 h-2.5" />Repeat</span>
                          ) : c.orderCount === 1 ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700"><Star className="w-2.5 h-2.5" />New</span>
                          ) : null}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <span className="flex items-center gap-1.5">
                          {c.phone}
                          {c.phone_verified && (
                            <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {[c.thana, c.district].filter(Boolean).join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted capitalize">{c.user_type || "regular"}</span>
                      </TableCell>
                      
                      <TableCell className="text-center font-bold">{c.orderCount}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">৳{c.orderTotal}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {c.last_order_date ? format(new Date(c.last_order_date), "dd/MM/yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">{c.admin_notes || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          id={`view-customer-${c.phone}`}
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); openDetail(c); }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} / {totalCount}
              </span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  {t("আগের", "Prev")}
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  {t("পরের", "Next")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail and Order History Modal Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{t("কাস্টমার বিস্তারিত", "Customer Details")}</DialogTitle>
            <DialogDescription>{t("তথ্য দেখুন ও এডিট করুন", "View and edit information")}</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("নাম", "Name")}</Label>
                  <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div>
                  <Label>{t("জেন্ডার", "Gender")}</Label>
                  <Select value={editData.gender} onValueChange={(v) => setEditData({ ...editData, gender: v })}>
                    <SelectTrigger><SelectValue placeholder={t("নির্বাচন করুন", "Select")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("পুরুষ", "Male")}</SelectItem>
                      <SelectItem value="female">{t("মহিলা", "Female")}</SelectItem>
                      <SelectItem value="other">{t("অন্যান্য", "Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("মোবাইল", "Mobile")}</Label>
                  <Input value={selectedCustomer.phone} disabled className="bg-muted" />
                </div>
                <div>
                  <Label>{t("বিকল্প নম্বর", "Alt. Number")}</Label>
                  <Input value={editData.alt_phone} onChange={(e) => setEditData({ ...editData, alt_phone: e.target.value })} />
                </div>
                <div>
                  <Label>{t("জেলা", "District")}</Label>
                  <Input value={editData.district} onChange={(e) => setEditData({ ...editData, district: e.target.value })} />
                </div>
                <div>
                  <Label>{t("থানা", "Thana")}</Label>
                  <Input value={editData.thana} onChange={(e) => setEditData({ ...editData, thana: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>{t("ঠিকানা", "Address")}</Label>
                  <Input value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} />
                </div>
                <div>
                  <Label>{t("কাস্টমার ধরন", "Customer Type")}</Label>
                  <Select value={editData.user_type} onValueChange={(v) => setEditData({ ...editData, user_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Order Statistics Banner */}
              <div className="border-t border-border pt-3">
                <div className="grid grid-cols-3 gap-2 text-sm bg-muted/40 p-3 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("মোট অর্ডার", "Total Orders")}</p>
                    <p className="font-bold text-base flex items-center gap-1.5 mt-0.5">
                      {selectedCustomer.orderCount}
                      {selectedCustomer.orderCount >= 2 ? (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-primary/10 text-primary">Repeat</span>
                      ) : selectedCustomer.orderCount === 1 ? (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-700">New</span>
                      ) : null}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("মোট কেনাকাটা", "Total Spent")}</p>
                    <p className="font-bold text-base text-primary mt-0.5">৳{selectedCustomer.orderTotal}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("সর্বশেষ অর্ডার", "Last Order")}</p>
                    <p className="text-xs font-medium mt-1">
                      {selectedCustomer.last_order_date ? format(new Date(selectedCustomer.last_order_date), "dd/MM/yyyy") : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order History component */}
              <div className="border-t border-border pt-3">
                <Label className="mb-2 block font-semibold">{t("অর্ডার হিস্ট্রি", "Order History")}</Label>
                <CustomerOrderHistory phone={selectedCustomer.phone} />
              </div>

              <div>
                <Label>{t("এডমিন মন্তব্য", "Admin Notes")}</Label>
                <Textarea value={editData.admin_notes} onChange={(e) => setEditData({ ...editData, admin_notes: e.target.value })} rows={2} />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  id="ban-customer-btn"
                  variant={selectedCustomer.access_allowed ? "destructive" : "outline"}
                  onClick={() => setBanConfirm({
                    visitor_id: selectedCustomer.visitor_id,
                    ban: selectedCustomer.access_allowed,
                    name: selectedCustomer.name || selectedCustomer.phone,
                  })}
                  className="w-full sm:w-auto"
                >
                  {selectedCustomer.access_allowed ? <Ban className="w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  {selectedCustomer.access_allowed ? t("ব্যান করুন", "Ban User") : t("আনব্যান করুন", "Unban User")}
                </Button>
                <Button
                  id="save-customer-btn"
                  onClick={() => updateMutation.mutate(editData)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {t("সেভ করুন", "Save")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={!!banConfirm} onOpenChange={() => setBanConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {banConfirm?.ban ? <Ban className="w-5 h-5 text-destructive" /> : <ShieldCheck className="w-5 h-5 text-green-600" />}
              {banConfirm?.ban ? t("ব্যান নিশ্চিত করুন", "Confirm Ban") : t("আনব্যান নিশ্চিত করুন", "Confirm Unban")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banConfirm?.ban
                ? t(
                    `"${banConfirm?.name}" কে ব্যান করলে এই ইউজার আর সাইটে প্রবেশ বা অর্ডার করতে পারবে না। আপনি কি নিশ্চিত?`,
                    `Banning "${banConfirm?.name}" will block site access and ordering. Are you sure?`
                  )
                : t(
                    `"${banConfirm?.name}" এর ব্যান তুলে নিলে সে আবার সাইটে প্রবেশ ও অর্ডার করতে পারবে।`,
                    `Unbanning "${banConfirm?.name}" will restore site access and ordering.`
                  )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              id="confirm-ban-action-btn"
              className={banConfirm?.ban ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              disabled={banMutation.isPending}
              onClick={() => {
                if (banConfirm) banMutation.mutate({ visitor_id: banConfirm.visitor_id, ban: banConfirm.ban });
              }}
            >
              {banMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {banConfirm?.ban ? t("ব্যান করুন", "Ban") : t("আনব্যান করুন", "Unban")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
