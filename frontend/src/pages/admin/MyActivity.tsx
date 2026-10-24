import { API_URL } from "@/config/env";
import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentAdminAccess, getActiveAdminUser } from "@/lib/adminAccess";
import { toast } from "sonner";
import { compressAvatarImage } from "@/lib/imageCompressor";
import {
  Loader2, CheckCircle, Truck, XCircle, Clock, Package,
  ShieldCheck, Shield, User as UserIcon, RotateCcw, Activity, Calendar,
  Search, ExternalLink, Plus, ShoppingBag, ArrowRight, DollarSign, RefreshCw, Sparkles, Camera
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";

const SUPER_ADMIN_EMAIL = "ssseedshop220@gmail.com";

export default function MyActivity() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"my" | "all">("my");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Current admin resolution (PHP Session + LocalStorage + Fallbacks)
  const { data: currentUser, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ["my-activity-user"],
    queryFn: async () => {
      const activeUser = getActiveAdminUser();
      const access = await getCurrentAdminAccess();

      let supaUser: any = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) supaUser = session.user;
      } catch {}

      const email = activeUser?.email || (access.status === "authorized" ? access.email : "") || supaUser?.email || "ssseedshop220@gmail.com";
      const id = activeUser?.id || supaUser?.id || (email ? email.replace(/[^a-zA-Z0-9]/g, "_") : "admin_001");
      const isSuperAdmin = Boolean(
        activeUser?.is_super_admin ||
        (access.status === "authorized" && access.isSuperAdmin) ||
        email === SUPER_ADMIN_EMAIL
      );
      let role = activeUser?.role || (access.status === "authorized" ? access.role : "admin");
      let name = activeUser?.name || supaUser?.user_metadata?.name || email.split("@")[0] || "Admin";
      let photo = activeUser?.photo_url || activeUser?.photo || supaUser?.user_metadata?.photo_url || null;
      let joiningDate = activeUser?.join_date || activeUser?.joining_date || activeUser?.created_at || null;

      // Enrich from backend admins list if accessible
      try {
        const apiUrl = API_URL;
        const res = await fetch(`${apiUrl}/admin/manage.php?action=list`);
        if (res.ok) {
          const admins = await res.json();
          if (Array.isArray(admins)) {
            const matched = admins.find((a: any) =>
              (a.id && (a.id === id || a.id === activeUser?.id)) ||
              (a.email && a.email.toLowerCase() === email.toLowerCase())
            );
            if (matched) {
              if (matched.user_metadata?.name) name = matched.user_metadata.name;
              if (matched.user_metadata?.photo_url) photo = matched.user_metadata.photo_url;
              if (matched.user_metadata?.join_date) joiningDate = matched.user_metadata.join_date;
              if (matched.role) role = matched.role;
            }
          }
        }
      } catch {}

      return {
        id,
        email,
        role,
        isSuperAdmin,
        name,
        photo,
        joining_date: joiningDate,
      };
    },
  });

  // Fetch all orders from PHP backend
  const { data: allOrders = [], isLoading: ordersLoading, refetch: refetchOrders, isRefetching } = useQuery({
    queryKey: ["my-activity-orders-list"],
    queryFn: async () => {
      const apiUrl = API_URL;
      try {
        const res = await fetch(`${apiUrl}/orders/get.php`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            return data.filter((o: any) => !o.is_deleted);
          }
        }
      } catch (err) {
        console.warn("PHP orders fetch failed, trying Supabase fallback", err);
      }

      // Supabase fallback
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, order_id, customer_name, phone, status, created_at, updated_at, total_amount, created_by_admin_id, last_status_changed_by, is_deleted")
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .limit(500);
        if (!error && data) return data;
      } catch {}

      return [];
    },
  });

  // Orders specifically handled by current admin
  const myHandledOrders = useMemo(() => {
    if (!currentUser || !allOrders.length) return [];
    if (currentUser.isSuperAdmin) return allOrders; // Super Admin sees all store operations in activity view

    const uid = String(currentUser.id || "").toLowerCase();
    const uemail = String(currentUser.email || "").toLowerCase();
    const legacyAdminIds = ["7633ce5f-48dc-422f-b4cd-34d967538448", "admin_super_001", "admin_super_002", "admin@agroseed.bd", "admin"];

    return allOrders.filter((o: any) => {
      const creator = String(o.created_by_admin_id || "").toLowerCase();
      const modifier = String(o.last_status_changed_by || "").toLowerCase();
      if (creator && (creator === uid || creator === uemail || legacyAdminIds.includes(creator))) return true;
      if (modifier && (modifier === uid || modifier === uemail || legacyAdminIds.includes(modifier))) return true;
      return false;
    });
  }, [allOrders, currentUser]);

  // Which orders set to display based on viewMode
  const activeOrders = useMemo(() => {
    if (viewMode === "my") {
      // If user has specific orders tagged, show them. Otherwise fallback to store orders.
      return myHandledOrders.length > 0 ? myHandledOrders : allOrders;
    }
    return allOrders;
  }, [viewMode, myHandledOrders, allOrders]);

  // Calculated statistics
  const stats = useMemo(() => {
    const list = activeOrders;
    const totalProcessed = list.length;
    const totalCreated = list.filter((o: any) => {
      if (viewMode === "my" && currentUser) {
        if (currentUser.isSuperAdmin) return true;
        const c = String(o.created_by_admin_id || "").toLowerCase();
        return c === String(currentUser.id).toLowerCase() ||
               c === String(currentUser.email).toLowerCase() ||
               ["7633ce5f-48dc-422f-b4cd-34d967538448", "admin_super_001", "admin_super_002", "admin@agroseed.bd", "admin"].includes(c);
      }
      return true;
    }).length;

    const confirmed = list.filter((o: any) =>
      ["confirmed", "printed", "entry_done", "shipped"].includes(o.status)
    ).length;

    const delivered = list.filter((o: any) => o.status === "delivered").length;

    const cancelled = list.filter((o: any) =>
      ["cancelled", "order_cancelled", "cancelled_approval_pending", "no_response"].includes(o.status)
    ).length;

    const returned = list.filter((o: any) =>
      ["return", "rtn_received", "pending_return"].includes(o.status)
    ).length;

    const totalRevenue = list
      .filter((o: any) => !["cancelled", "order_cancelled", "return", "rtn_received"].includes(o.status))
      .reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);

    return { totalCreated, totalProcessed, confirmed, delivered, cancelled, returned, totalRevenue };
  }, [activeOrders, viewMode, currentUser]);

  // Chart data: orders per day over the last 14 days
  const chartData = useMemo(() => {
    if (!activeOrders.length) return [];
    const now = new Date();
    const days = eachDayOfInterval({ start: subDays(now, 13), end: now });

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOrders = activeOrders.filter((o: any) => {
        const d = o.created_at || o.updated_at;
        return d && format(new Date(d), "yyyy-MM-dd") === dayStr;
      });
      return {
        label: format(day, "dd MMM"),
        orders: dayOrders.length,
      };
    });
  }, [activeOrders]);

  // Filter recent orders by search query
  const filteredRecentOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeOrders.slice(0, 20);

    return activeOrders
      .filter((o: any) =>
        (o.order_id && String(o.order_id).toLowerCase().includes(q)) ||
        (o.customer_name && String(o.customer_name).toLowerCase().includes(q)) ||
        (o.phone && String(o.phone).includes(q))
      )
      .slice(0, 20);
  }, [activeOrders, searchQuery]);

  const roleLabel = (role: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) return t("সুপার অ্যাডমিন", "Super Admin");
    if (role === "admin") return t("অ্যাডমিন", "Admin");
    if (role === "moderator") return t("মডারেটর", "Moderator");
    return role;
  };

  const roleIcon = (role: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    if (role === "admin") return <Shield className="w-4 h-4 text-blue-500" />;
    return <UserIcon className="w-4 h-4 text-muted-foreground" />;
  };

  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("অ্যাক্টিভিটি তথ্য লোড হচ্ছে...", "Loading activity data...")}</p>
      </div>
    );
  }

  const user = currentUser || {
    id: "admin_super_001",
    email: "ssseedshop220@gmail.com",
    role: "admin",
    isSuperAdmin: true,
    name: "Ss Seed Shop Admin",
    photo: null,
    joining_date: null,
  };



  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user.id) return;
    setUploadingAvatar(true);
    try {
      const compressed = await compressAvatarImage(file);
      const formData = new FormData();
      formData.append("file", compressed, compressed.name || "admin_avatar.webp");
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/media/upload.php`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data?.status === "success" && data?.url) {
        // Save to admin profile
        await fetch(`${apiUrl}/admin/manage.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            user_id: user.id,
            photo_url: data.url,
          }),
        });
        toast.success(t("প্রোফাইল ছবি WebP ফরম্যাটে আপডেট হয়েছে", "Profile photo updated as WebP"));
        const localStr = localStorage.getItem("admin_session");
        if (localStr) {
          try {
            const parsed = JSON.parse(localStr);
            parsed.photo = data.url;
            parsed.photo_url = data.url;
            localStorage.setItem("admin_session", JSON.stringify(parsed));
          } catch {}
        }
        refetchUser();
      } else {
        toast.error(data?.message || t("ছবি আপলোড ব্যর্থ", "Upload failed"));
      }
    } catch {
      toast.error(t("ছবি আপলোড ব্যর্থ", "Upload failed"));
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 6) return t("শুভ রাত্রি", "Good Night");
    if (hour < 12) return t("শুভ সকাল", "Good Morning");
    if (hour < 17) return t("শুভ দুপুর", "Good Afternoon");
    if (hour < 20) return t("শুভ সন্ধ্যা", "Good Evening");
    return t("শুভ রাত্রি", "Good Night");
  })();

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Profile & Welcome Card */}
      <Card className="border-muted/80 shadow-sm bg-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="w-16 h-16 border-2 border-emerald-500/20 shadow-sm">
                  <AvatarImage src={user.photo || undefined} />
                  <AvatarFallback className="bg-emerald-50 text-emerald-700 text-xl font-bold dark:bg-emerald-950/50 dark:text-emerald-300">
                    {(user.name || "?")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  aria-label={t("ছবি পরিবর্তন (WebP)", "Change photo (WebP)")}
                  title={t("ছবি পরিবর্তন (WebP)", "Change photo (WebP)")}
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow border-2 border-background hover:bg-emerald-700 transition-colors"
                >
                  {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight">{user.name}</h1>
                  <Badge variant="outline" className="text-xs gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                    {roleIcon(user.role, user.isSuperAdmin)}
                    <span>{roleLabel(user.role, user.isSuperAdmin)}</span>
                  </Badge>
                  {user.joining_date && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {t("যোগদান:", "Joined:")} {user.joining_date}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{greeting}, {user.name}! {t("আপনার আজকের কার্যক্রমের সামারি নিচে দেখুন।", "Here is your activity overview.")}</span>
                </p>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2 flex-wrap md:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchOrders()}
                disabled={isRefetching}
                className="text-xs gap-1.5 h-9"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
                <span>{t("রিফ্রেশ", "Refresh")}</span>
              </Button>
              <Button asChild size="sm" className="text-xs gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link to="/admin/orders/create">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("নতুন অর্ডার", "New Order")}</span>
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Switcher Tabs (My Handled vs All Store Orders) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "my" | "all")} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-2 w-full sm:w-[360px] h-10 p-1 bg-muted/60">
            <TabsTrigger value="my" className="text-xs font-medium gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>{t("আমার অ্যাক্টিভিটি", "My Activity")}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                {myHandledOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs font-medium gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t("সমগ্র স্টোর", "All Store")}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                {allOrders.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {viewMode === "my" && myHandledOrders.length === 0 && (
          <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span>ℹ️</span>
            <span>{t("নির্দিষ্ট কোনো অর্ডার আপনার আইডিতে ট্যাগ না থাকায় স্টোরের সামগ্রিক কার্যক্রম প্রদর্শিত হচ্ছে।", "No specific orders tagged with your ID yet; showing store activity.")}</span>
          </div>
        )}
      </div>

      {/* Stats Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard
          icon={Package}
          label={t("তৈরিকৃত", "Created")}
          value={String(stats.totalCreated)}
          sub={t("অর্ডার", "Orders")}
        />
        <StatCard
          icon={CheckCircle}
          label={t("কনফার্মড", "Confirmed")}
          value={String(stats.confirmed)}
          color="text-blue-600 dark:text-blue-400"
          sub={t("প্রক্রিয়াধীন", "In Pipeline")}
        />
        <StatCard
          icon={Truck}
          label={t("ডেলিভার্ড", "Delivered")}
          value={String(stats.delivered)}
          color="text-emerald-600 dark:text-emerald-400"
          sub={t("সফল", "Success")}
        />
        <StatCard
          icon={XCircle}
          label={t("ক্যানসেলড", "Cancelled")}
          value={String(stats.cancelled)}
          color="text-rose-600 dark:text-rose-400"
          sub={t("বাতিলকৃত", "Cancelled")}
        />
        <StatCard
          icon={RotateCcw}
          label={t("রিটার্ন", "Return")}
          value={String(stats.returned)}
          color="text-orange-500 dark:text-orange-400"
          sub={t("ফেরত", "Returned")}
        />
        <StatCard
          icon={Activity}
          label={t("মোট কাজ", "Processed")}
          value={String(stats.totalProcessed)}
          color="text-purple-600 dark:text-purple-400"
          sub={t("সর্বমোট", "Total")}
        />
        <StatCard
          icon={DollarSign}
          label={t("মোট বিক্রয়", "Sales Volume")}
          value={`৳${stats.totalRevenue.toLocaleString()}`}
          color="text-emerald-700 dark:text-emerald-400"
          sub={t("সক্রিয় অর্ডার", "Active Orders")}
        />
      </div>

      {/* 14-Day Activity Chart */}
      <Card className="border-muted/80 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              {t("গত ১৪ দিনের কার্যক্রম চার্ট", "Activity Chart (Last 14 Days)")}
            </CardTitle>
            <span className="text-xs text-muted-foreground font-mono">
              {activeOrders.length} {t("টি অর্ডার ট্র্যাক করা হয়েছে", "orders tracked")}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-[220px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-25" />
                  <XAxis dataKey="label" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={11} allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value: number) => [value, t("অর্ডার", "Orders")]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="orders" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders List with Search & Direct Links */}
      <Card className="border-muted/80 shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              {t("সাম্প্রতিক অর্ডারের তালিকা", "Recent Activity Orders")}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {viewMode === "my" && myHandledOrders.length > 0
                ? t("আপনার প্রক্রিয়াকৃত সর্বশেষ অর্ডারসমূহ", "Orders managed by you")
                : t("স্টোরের সর্বশেষ প্রক্রিয়াকৃত অর্ডারসমূহ", "Latest orders in store")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("গ্রাহক, ফোন বা অর্ডার নং...", "Search order, name, phone...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Badge variant="outline" className="text-xs font-mono shrink-0">
              {filteredRecentOrders.length} {t("টি", "orders")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredRecentOrders.map((order: any) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <StatusIcon status={order.status} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {order.customer_name || t("গ্রাহক", "Customer")}
                      </span>
                      {order.phone && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          ({order.phone})
                        </span>
                      )}
                      <Badge variant="secondary" className="text-[10px] capitalize px-2 py-0 h-4 font-mono">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {order.order_id ? `#${order.order_id}` : String(order.id).slice(0, 8)} •{" "}
                      {format(new Date(order.created_at || order.updated_at || Date.now()), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                    ৳{Number(order.total_amount || 0).toLocaleString()}
                  </span>
                  <Button asChild size="sm" variant="ghost" className="h-8 text-xs gap-1 px-2.5 hover:text-emerald-600">
                    <Link to={`/admin/orders/edit/${order.id}`}>
                      <span>{t("দেখুন", "View")}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            {filteredRecentOrders.length === 0 && (
              <div className="text-center py-10 px-4 text-muted-foreground space-y-1">
                <Package className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium">{t("কোনো অর্ডার ডেটা পাওয়া যায়নি", "No order data found")}</p>
                <p className="text-xs">{t("ফিল্টার পরিবর্তন করুন অথবা নতুন অর্ডার যোগ করুন", "Try changing filters or create a new order")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation Footer */}
      <Card className="border-muted/80 shadow-sm bg-muted/20">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground font-medium">
            {t("প্রয়োজনীয় শর্টকাট লিংক:", "Quick shortcuts:")}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
              <Link to="/admin/web-orders">
                <span>{t("ওয়েব অর্ডারসমূহ", "Web Orders")}</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
              <Link to="/admin/confirmed-orders">
                <span>{t("কনফার্মড অর্ডারসমূহ", "Confirmed Orders")}</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
              <Link to="/admin/products">
                <span>{t("পণ্য তালিকা", "Products")}</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "pending":
    case "pre":
      return <Clock className="w-4 h-4 text-yellow-500 shrink-0" />;
    case "confirmed":
    case "printed":
    case "entry_done":
    case "shipped":
      return <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />;
    case "delivered":
      return <Truck className="w-4 h-4 text-emerald-500 shrink-0" />;
    case "cancelled":
    case "order_cancelled":
    case "cancelled_approval_pending":
      return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
    case "return":
    case "rtn_received":
    case "pending_return":
      return <RotateCcw className="w-4 h-4 text-orange-500 shrink-0" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground shrink-0" />;
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: any;
  label: string;
  value: string;
  color?: string;
  sub?: string;
}) {
  return (
    <Card className="border-muted/80 shadow-sm bg-card hover:border-emerald-500/30 transition-all">
      <CardContent className="p-3.5">
        <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
          <span className="truncate">{label}</span>
          <Icon className={`w-3.5 h-3.5 shrink-0 ${color || "text-muted-foreground"}`} />
        </div>
        <p className={`text-xl font-bold tracking-tight truncate ${color || "text-foreground"}`}>
          {value}
        </p>
        {sub && <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">{sub}</p>}
      </CardContent>
    </Card>
  );
}
