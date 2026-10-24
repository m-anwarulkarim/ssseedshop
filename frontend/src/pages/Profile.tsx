import { API_URL } from "@/config/env";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SideCart from "@/components/SideCart";
import Footer from "@/components/Footer";

const getApiUrl = () => API_URL;
import CustomerLogin, {
  getCustomerSession,
  clearCustomerSession,
  setCustomerSession,
  CustomerSession,
} from "@/components/CustomerLogin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User, Phone, MapPin, ShoppingBag, Package, Clock, Camera, Loader2,
  CheckCircle2, Truck, X, LogOut, Save, KeyRound, Home, UserCircle2, Search,
  FileText, ExternalLink, Copy,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { districts, getThanas } from "@/data/bangladeshLocations";
import { compressImageToWebP } from "@/lib/imageCompressor";

interface FullProfile {
  id: string;
  name: string | null;
  phone: string;
  alt_phone: string | null;
  district: string | null;
  thana: string | null;
  address: string | null;
  gender: string | null;
  age: number | null;
  bio: string | null;
  username: string | null;
  profile_picture: string | null;
  avatar_url?: string | null;
  email?: string | null;
  auth_provider?: string | null;
  phone_verified: boolean | null;
  created_at: string | null;
}

interface Order {
  id: string;
  order_id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

const getStatusConfig = (t: <T,>(bn: T, en: T) => T): Record<string, { label: string; icon: React.ReactNode; color: string }> => ({
  pending: { label: t("অপেক্ষমান", "Pending"), icon: <Clock className="w-3.5 h-3.5" />, color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: t("কনফার্মড", "Confirmed"), icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "bg-green-100 text-green-800" },
  printed: { label: t("প্যাকেজিং", "Packaging"), icon: <Package className="w-3.5 h-3.5" />, color: "bg-cyan-100 text-cyan-800" },
  entry_done: { label: t("কুরিয়ারে", "Courier"), icon: <Truck className="w-3.5 h-3.5" />, color: "bg-teal-100 text-teal-800" },
  shipped: { label: t("শিপড", "Shipped"), icon: <Truck className="w-3.5 h-3.5" />, color: "bg-indigo-100 text-indigo-800" },
  delivered: { label: t("ডেলিভারড", "Delivered"), icon: <Package className="w-3.5 h-3.5" />, color: "bg-green-100 text-green-800" },
  cancelled: { label: t("বাতিল", "Cancelled"), icon: <X className="w-3.5 h-3.5" />, color: "bg-red-100 text-red-800" },
  return: { label: t("রিটার্ন", "Return"), icon: <Package className="w-3.5 h-3.5" />, color: "bg-rose-100 text-rose-800" },
});

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const statusConfig = getStatusConfig(t);
  const [session, setSession] = useState<CustomerSession | null>(getCustomerSession());
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // editable form state
  const [form, setForm] = useState({
    name: "", alt_phone: "", district: "", thana: "", address: "",
    gender: "", age: "", bio: "", username: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // password change
  const [pwd, setPwd] = useState({ old_password: "", new_password: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);

  // order filters
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState("");

  // Quick phone update state for Google users
  const [quickPhone, setQuickPhone] = useState("");
  const [savingQuickPhone, setSavingQuickPhone] = useState(false);

  const handleSaveQuickPhone = async () => {
    const trimmed = quickPhone.trim();
    if (!trimmed || trimmed.length < 11) {
      toast.error(t("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01XXXXXXXXX)", "Enter valid 11 digit mobile number"));
      return;
    }
    setSavingQuickPhone(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/customer/profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          profile_id: session?.profile_id,
          phone: trimmed,
        }),
      });
      const data = await res.json();
      if (data?.status === "success") {
        toast.success(t("মোবাইল নম্বর সফলভাবে যুক্ত হয়েছে!", "Mobile number added successfully!"));
        const updatedSession = { ...session, phone: trimmed, phone_verified: true };
        setCustomerSession(updatedSession as CustomerSession);
        setSession(updatedSession as CustomerSession);
        setQuickPhone("");
        fetchData();
      } else {
        toast.error(data?.message || t("নম্বর সংরক্ষণ করা যায়নি", "Could not save phone"));
      }
    } catch {
      toast.error(t("নম্বর সংরক্ষণ করা যায়নি", "Could not save phone"));
    } finally {
      setSavingQuickPhone(false);
    }
  };

  useEffect(() => {
    if (session) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.profile_id]);

  async function fetchData() {
    if (!session) return;
    setLoading(true);
    const apiUrl = getApiUrl();

    try {
      // 1. Fetch Profile from PHP profile.php
      const profileRes = await fetch(
        `${apiUrl}/customer/profile.php?id=${encodeURIComponent(session.profile_id)}&phone=${encodeURIComponent(session.phone || "")}`
      );
      const profileJson = await profileRes.json();

      if (profileJson?.status === "success" && profileJson?.profile) {
        const p = profileJson.profile as unknown as FullProfile;
        setProfile(p);
        setForm({
          name: p.name || "",
          alt_phone: p.alt_phone || "",
          district: p.district || "",
          thana: p.thana || "",
          address: p.address || "",
          gender: p.gender || "",
          age: p.age ? String(p.age) : "",
          bio: p.bio || "",
          username: p.username || "",
        });
      }

      // 2. Fetch Orders from PHP orders.php
      const ordersRes = await fetch(
        `${apiUrl}/customer/orders.php?profile_id=${encodeURIComponent(session.profile_id)}&phone=${encodeURIComponent(session.phone || "")}&email=${encodeURIComponent(session.email || "")}`
      );
      const ordersJson = await ordersRes.json();
      if (ordersJson?.orders) {
        setOrders(ordersJson.orders as Order[]);
      }
    } catch (err) {
      console.error("Profile/Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    clearCustomerSession();
    setSession(null);
    setProfile(null);
    setOrders([]);
  };

  async function saveProfile() {
    if (!session) return;
    if (form.name.trim().length > 100) return toast.error(t("নাম অনেক বড়", "Name too long"));
    if (form.age && (Number(form.age) < 5 || Number(form.age) > 120)) {
      return toast.error(t("সঠিক বয়স দিন", "Enter a valid age"));
    }
    if (form.alt_phone && !/^01[0-9]{9}$/.test(form.alt_phone.trim())) {
      return toast.error(t("সঠিক বিকল্প নাম্বার দিন (01XXXXXXXXX)", "Enter a valid alt phone (01XXXXXXXXX)"));
    }
    setSaving(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/customer/profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          profile_id: session.profile_id,
          phone: session.phone,
          name: form.name.trim() || null,
          alt_phone: form.alt_phone.trim() || null,
          district: form.district || null,
          thana: form.thana || null,
          address: form.address.trim().slice(0, 500) || null,
          gender: form.gender || null,
          age: form.age ? Number(form.age) : null,
          bio: form.bio.trim().slice(0, 300) || null,
          username: form.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "") || null,
        }),
      });
      const data = await res.json();
      if (data?.status === "success") {
        toast.success(t("প্রোফাইল আপডেট হয়েছে", "Profile updated"));
        setCustomerSession({ ...session, name: form.name.trim() || session.name });
        fetchData();
      } else {
        toast.error(data?.message || t("সেভ করা যায়নি", "Could not save"));
      }
    } catch {
      toast.error(t("সেভ করা যায়নি", "Could not save"));
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    if (!file.type.startsWith("image/")) return toast.error(t("ছবি নির্বাচন করুন", "Select an image"));
    setUploading(true);
    try {
      const webp = await compressImageToWebP(file, { maxWidth: 600, maxHeight: 600, quality: 0.82 });
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const apiUrl = getApiUrl();
          const res = await fetch(`${apiUrl}/customer/profile.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update",
              profile_id: session.profile_id,
              phone: session.phone,
              profile_picture: base64Data,
            }),
          });
          const data = await res.json();
          if (data?.status === "success") {
            const newAvatar = data.profile?.avatar_url || data.profile?.profile_picture || base64Data;
            setProfile((p) => (p ? { ...p, profile_picture: newAvatar, avatar_url: newAvatar } : data.profile));
            setCustomerSession({ ...session, avatar_url: newAvatar });
            toast.success(t("ছবি আপডেট হয়েছে", "Photo updated"));
          } else {
            toast.error(data?.message || t("ছবি আপলোড ব্যর্থ", "Photo upload failed"));
          }
        } catch {
          toast.error(t("ছবি আপলোড ব্যর্থ", "Photo upload failed"));
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(webp);
    } catch {
      toast.error(t("ছবি আপলোড ব্যর্থ", "Photo upload failed"));
      setUploading(false);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function changePassword() {
    if (!session) return;
    if (pwd.new_password.length < 6) return toast.error(t("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর", "Password must be 6+ characters"));
    if (pwd.new_password !== pwd.confirm) return toast.error(t("পাসওয়ার্ড মিলছে না", "Passwords do not match"));
    setPwdSaving(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/customer/profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          profile_id: session.profile_id,
          phone: session.phone,
          old_password: pwd.old_password,
          new_password: pwd.new_password,
        }),
      });
      const data = await res.json();
      if (data?.status === "success") {
        toast.success(t("পাসওয়ার্ড পরিবর্তন হয়েছে", "Password changed"));
        setPwd({ old_password: "", new_password: "", confirm: "" });
      } else {
        toast.error(data?.error || data?.message || t("পরিবর্তন ব্যর্থ", "Change failed"));
      }
    } catch {
      toast.error(t("পরিবর্তন ব্যর্থ", "Change failed"));
    } finally {
      setPwdSaving(false);
    }
  }


  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const okStatus =
        orderFilter === "all" ? true
          : orderFilter === "processing" ? ["pending", "confirmed", "printed", "entry_done", "shipped"].includes(o.status)
            : orderFilter === "delivered" ? o.status === "delivered"
              : ["cancelled", "return", "rtn_received"].includes(o.status);
      const q = orderSearch.trim().toLowerCase();
      return okStatus && (!q || o.order_id.toLowerCase().includes(q));
    });
  }, [orders, orderFilter, orderSearch]);

  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered");
    return {
      total: orders.length,
      delivered: delivered.length,
      spent: delivered.reduce((s, o) => s + Number(o.total_amount || 0), 0),
    };
  }, [orders]);

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <CustomerLogin onLogin={(s) => setSession(s)} />
        <SideCart />
        <Footer />
      </div>
    );
  }

  const displayName = profile?.name || session.name || t("কাস্টমার", "Customer");
  const displayPhone = profile?.phone || session.phone;
  const location = [profile?.thana, profile?.district].filter(Boolean).join(", ");
  const thanaOptions = form.district ? getThanas(form.district) : [];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="max-w-3xl mx-auto px-3 py-4 space-y-4">
        {/* ── Daraz-style header ── */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="bg-gradient-to-r from-primary to-primary/70 h-20" />
          <CardContent className="p-4 pt-0">
            <div className="flex items-end justify-between -mt-10 mb-3">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-background shadow-md">
                  <AvatarImage src={profile?.profile_picture || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  aria-label={t("ছবি পরিবর্তন", "Change photo")}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow border-2 border-background"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="mb-1">
                <LogOut className="w-4 h-4 mr-1" /> {t("লগআউট", "Logout")}
              </Button>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-lg text-foreground">{displayName}</p>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-0 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Google {t("ভেরিফাইড", "Verified")}
                </Badge>
              </div>
              {(profile?.email || session?.email) && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" /> {profile?.email || session?.email}
                </p>
              )}
              {displayPhone ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {displayPhone}
                </p>
              ) : (
                <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {t("ডেলিভারি ফোন নম্বর যুক্ত করা নেই", "No delivery phone number added")}
                </p>
              )}
              {location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {location}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { label: t("মোট অর্ডার", "Orders"), value: stats.total },
                { label: t("ডেলিভারড", "Delivered"), value: stats.delivered },
                { label: t("মোট কেনাকাটা", "Spent"), value: `৳${stats.spent.toLocaleString("bn-BD")}` },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-muted/60 py-2 text-center">
                  <p className="font-bold text-foreground text-sm">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Google login quick phone addition banner ── */}
        {(!displayPhone || displayPhone.trim() === "") && (
          <Card className="border-amber-200 bg-amber-50/70 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-amber-100 text-amber-700 mt-0.5 sm:mt-0 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-amber-900">
                    {t("অর্ডার ডেলিভারির জন্য আপনার মোবাইল নম্বর যুক্ত করুন", "Add phone number for order delivery")}
                  </h4>
                  <p className="text-xs text-amber-700/90 mt-0.5">
                    {t(
                      "সরাসরি অর্ডার করতে ও দ্রুত ডেলিভারি আপডেট পেতে ১১ সংখ্যার মোবাইল নম্বর দিন।",
                      "Provide 11-digit mobile number for ordering and quick delivery updates."
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  className="bg-white h-9 text-xs sm:w-44"
                />
                <Button
                  size="sm"
                  className="h-9 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                  disabled={savingQuickPhone}
                  onClick={handleSaveQuickPhone}
                >
                  {savingQuickPhone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t("যুক্ত করুন", "Add Phone")}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ── Tabs ── */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid grid-cols-4 w-full h-auto">
            <TabsTrigger value="orders" className="text-xs py-2 gap-1"><ShoppingBag className="w-3.5 h-3.5" />{t("অর্ডার", "Orders")}</TabsTrigger>
            <TabsTrigger value="account" className="text-xs py-2 gap-1"><UserCircle2 className="w-3.5 h-3.5" />{t("প্রোফাইল", "Profile")}</TabsTrigger>
            <TabsTrigger value="address" className="text-xs py-2 gap-1"><Home className="w-3.5 h-3.5" />{t("ঠিকানা", "Address")}</TabsTrigger>
            <TabsTrigger value="security" className="text-xs py-2 gap-1"><KeyRound className="w-3.5 h-3.5" />{t("পাসওয়ার্ড", "Security")}</TabsTrigger>
          </TabsList>

          {/* ── ORDERS ── */}
          <TabsContent value="orders" className="space-y-3 mt-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder={t("অর্ডার আইডি দিয়ে খুঁজুন", "Search by order ID")}
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { k: "all", l: t("সব", "All") },
                { k: "processing", l: t("প্রসেসিং", "Processing") },
                { k: "delivered", l: t("ডেলিভারড", "Delivered") },
                { k: "cancelled", l: t("বাতিল/রিটার্ন", "Cancelled") },
              ].map((f) => (
                <Button
                  key={f.k}
                  size="sm"
                  variant={orderFilter === f.k ? "default" : "outline"}
                  onClick={() => setOrderFilter(f.k)}
                  className="shrink-0 h-8 text-xs"
                >
                  {f.l}
                </Button>
              ))}
            </div>

            {loading && orders.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">
                {t("কোনো অর্ডার নেই", "No orders yet")}
              </CardContent></Card>
            ) : (
              filteredOrders.map((order) => {
                const sc = statusConfig[order.status] || statusConfig.pending;
                const invoiceUrl = `${window.location.origin}/invoice/${order.order_id || order.id}`;
                return (
                  <Card key={order.id} className="overflow-hidden border-border/80">
                    <CardContent className="p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm font-mono text-primary">#{order.order_id}</span>
                        <Badge variant="secondary" className={`${sc.color} text-xs flex items-center gap-1 border-0`}>
                          {sc.icon} {sc.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                        <span>{new Date(order.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" })}</span>
                        <span className="font-bold text-foreground text-sm">৳{Number(order.total_amount).toLocaleString("bn-BD")}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/invoice/${order.order_id || order.id}`)}
                          className="h-8 flex-1 text-xs font-semibold text-primary rounded-lg"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" /> {t("ইনভয়েস দেখুন", "View Invoice")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(invoiceUrl);
                            toast.success(t("ইনভয়েস লিংক কপি করা হয়েছে!", "Invoice link copied!"));
                          }}
                          className="h-8 text-xs font-medium rounded-lg border-border"
                          title={t("ইনভয়েস লিংক কপি করুন", "Copy Invoice Link")}
                        >
                          <Copy className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> {t("লিংক কপি", "Copy Link")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* ── ACCOUNT ── */}
          <TabsContent value="account" className="mt-3">
            <Card><CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label>{t("পূর্ণ নাম", "Full name")}</Label>
                <Input value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("ইউজারনেম", "Username")}</Label>
                <Input
                  value={form.username}
                  maxLength={30}
                  placeholder="username"
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">{t("শুধু ছোট হাতের অক্ষর, সংখ্যা, . ও _", "Lowercase letters, numbers, . and _ only")}</p>
              </div>
              <div className="space-y-1.5">
                <Label>{t("ফোন নাম্বার", "Phone number")}</Label>
                <Input value={displayPhone} disabled />
                <p className="text-[11px] text-muted-foreground">{t("ফোন নাম্বার পরিবর্তন করতে সাপোর্টে যোগাযোগ করুন", "Contact support to change your phone number")}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("লিঙ্গ", "Gender")}</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger><SelectValue placeholder={t("নির্বাচন করুন", "Select")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("পুরুষ", "Male")}</SelectItem>
                      <SelectItem value="female">{t("মহিলা", "Female")}</SelectItem>
                      <SelectItem value="other">{t("অন্যান্য", "Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("বয়স", "Age")}</Label>
                  <Input type="number" min={5} max={120} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("বায়ো", "Bio")}</Label>
                <Textarea rows={3} maxLength={300} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <Button onClick={saveProfile} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {t("সেভ করুন", "Save changes")}
              </Button>
            </CardContent></Card>
          </TabsContent>

          {/* ── ADDRESS ── */}
          <TabsContent value="address" className="mt-3">
            <Card><CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label>{t("জেলা", "District")}</Label>
                <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v, thana: "" })}>
                  <SelectTrigger><SelectValue placeholder={t("জেলা নির্বাচন করুন", "Select district")} /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("থানা / উপজেলা", "Thana / Upazila")}</Label>
                <Select value={form.thana} onValueChange={(v) => setForm({ ...form, thana: v })} disabled={!form.district}>
                  <SelectTrigger><SelectValue placeholder={t("থানা নির্বাচন করুন", "Select thana")} /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {thanaOptions.map((th) => <SelectItem key={th} value={th}>{th}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("বিস্তারিত ঠিকানা", "Full address")}</Label>
                <Textarea rows={3} maxLength={500} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("বিকল্প মোবাইল নাম্বার", "Alternate phone")}</Label>
                <Input value={form.alt_phone} maxLength={11} placeholder="01XXXXXXXXX" onChange={(e) => setForm({ ...form, alt_phone: e.target.value.replace(/\D/g, "") })} />
              </div>
              <Separator />
              <Button onClick={saveProfile} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {t("ঠিকানা সেভ করুন", "Save address")}
              </Button>
            </CardContent></Card>
          </TabsContent>

          {/* ── SECURITY ── */}
          <TabsContent value="security" className="mt-3">
            <Card><CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label>{t("বর্তমান পাসওয়ার্ড", "Current password")}</Label>
                <Input type="password" value={pwd.old_password} onChange={(e) => setPwd({ ...pwd, old_password: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("নতুন পাসওয়ার্ড", "New password")}</Label>
                <Input type="password" value={pwd.new_password} onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("নতুন পাসওয়ার্ড আবার লিখুন", "Confirm new password")}</Label>
                <Input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
              </div>
              <Button onClick={changePassword} disabled={pwdSaving} className="w-full">
                {pwdSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                {t("পাসওয়ার্ড পরিবর্তন করুন", "Change password")}
              </Button>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>

      <SideCart />
      <Footer />
    </div>
  );
}
