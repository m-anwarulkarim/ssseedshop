import { API_URL } from "@/config/env";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getDeliveryCharge } from "@/lib/delivery";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrderEditLock } from "@/hooks/useOrderEditLock";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getActiveAdminId } from "@/lib/adminAccess";
import {
  Loader2, Package, Plus, Minus, Trash2, Search, Save,
  Clock, PhoneOff, ThumbsUp, PhoneCall, Pause, CalendarClock,
  CheckCircle2, XCircle, User, ArrowLeft, ShoppingBag,
  Printer, ClipboardCheck, Truck, PackageCheck, PackageMinus,
  RotateCcw, Undo2, HelpCircle, Globe, Fingerprint, Monitor, Timer, Shield, AlertTriangle, Ban, ShieldCheck,
  Phone, MessageSquare, Send, LayoutGrid, Tag as TagIcon, ChevronDown, StickyNote, Sparkles, AlertCircle,
  Settings, Copy, Share2, ExternalLink,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X, Check } from "lucide-react";
import { FraudResultCard, SteadfastResultCard } from "@/components/admin/FraudCheckerDialog";
import { SourceBadge } from "@/components/admin/SourceBadge";
import { Progress } from "@/components/ui/progress";
import { dispatchOrderNotification } from "@/lib/orderNotifications";

// Per-order courier entry settings popover
function CourierEntrySettingsPopover({ order }: { order?: any }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [totalLot, setTotalLot] = useState("1");
  const [deliveryType, setDeliveryType] = useState("0");
  const [courierNote, setCourierNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load global courier note only (lot & type are always hardcoded 1 and 0)
  const { data: globalCourierNote } = useQuery({
    queryKey: ["courier-entry-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("key, value")
        .eq("key", "steadfast_courier_note");
      return data?.[0]?.value || "";
    },
  });

  // Initialize: per-order values if set, otherwise defaults
  useEffect(() => {
    if (initialized) return;
    if (globalCourierNote === undefined) return;

    setTotalLot(order?.courier_total_lot != null ? String(order.courier_total_lot) : "1");
    setDeliveryType(order?.courier_delivery_type != null ? String(order.courier_delivery_type) : "0");
    setCourierNote(order?.courier_note ?? globalCourierNote);
    setInitialized(true);
  }, [globalCourierNote, order, initialized]);

  const handleSave = async () => {
    if (!order?.id) {
      toast.error(t("অর্ডার নেই", "No order"));
      return;
    }
    setSaving(true);
    try {
      const url = API_URL;
      const res = await fetch(`${url}/orders/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          courier_total_lot: parseInt(totalLot, 10) || 1,
          courier_delivery_type: parseInt(deliveryType, 10) || 0,
          courier_note: courierNote || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Save failed");
      queryClient.invalidateQueries({ queryKey: ["order-edit", order.order_id] });
      toast.success(t("এই অর্ডারের কুরিয়ার সেটিংস সেভ হয়েছে", "Order courier settings saved"));
    } catch {
      toast.error(t("সেভ ব্যর্থ", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-2 border-border/80 shadow-2xs hover:bg-muted hover:border-primary/50 flex-shrink-0 transition-all" title={t("কুরিয়ার সেটিংস", "Courier Settings")}>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm space-y-3 rounded-2xl shadow-xl border-border/80">
        <DialogHeader>
          <DialogTitle className="text-base">{t("কুরিয়ার এন্ট্রি সেটিংস", "Courier Entry Settings")}</DialogTitle>
          {order?.id && <p className="text-[11px] text-muted-foreground">{t("শুধু এই অর্ডারের জন্য", "For this order only")}</p>}
        </DialogHeader>
        <div className="space-y-1.5">
          <Label className="text-xs">{t("Total Lot (আইটেম সংখ্যা)", "Total Lot")}</Label>
          <Input
            type="number"
            min="1"
            value={totalLot}
            onChange={(e) => setTotalLot(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t("Delivery Type", "Delivery Type")}</Label>
          <Select value={deliveryType} onValueChange={setDeliveryType}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{t("0 — হোম ডেলিভারি", "0 — Home Delivery")}</SelectItem>
              <SelectItem value="1">{t("1 — পয়েন্ট / হাব পিকআপ", "1 — Point / Hub Pickup")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t("কুরিয়ার নোট", "Courier Note")}</Label>
          <Textarea
            placeholder={t("কুরিয়ার নোট...", "Courier note...")}
            value={courierNote}
            onChange={(e) => setCourierNote(e.target.value)}
            className="text-sm min-h-[80px]"
          />
        </div>
        {order?.courier_remarks && (
          <div className="space-y-1.5 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-2.5">
            <Label className="text-xs text-amber-700 dark:text-amber-400">💬 {t("কুরিয়ার রিমার্কস (API)", "Courier Remarks (API)")}</Label>
            <p className="text-xs text-amber-800 dark:text-amber-300">{order.courier_remarks}</p>
          </div>
        )}
        <Button size="sm" onClick={async () => { await handleSave(); setOpen(false); }} disabled={saving} className="w-full">
          {saving ? t("সেভ হচ্ছে...", "Saving...") : t("সেভ করুন", "Save")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// Mina countdown timer component
function MinaCountdown({ expiresAt, onExpired }: { expiresAt: string; onExpired: () => void }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const calc = () => {
      const left = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(left);
      if (left <= 0) onExpired();
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [expiresAt, onExpired]);

  const totalSec = Math.ceil(remaining / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const pct = Math.min(100, (remaining / (5 * 60 * 1000)) * 100);

  return (
    <div className="space-y-1.5 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
          <Timer className="w-4 h-4" />
          আনলক হতে বাকি
        </span>
        <span className="font-mono font-bold text-amber-800 dark:text-amber-300 text-base">
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
      </div>
      <Progress value={pct} className="h-2 bg-amber-200 dark:bg-amber-900 [&>div]:bg-amber-500" />
    </div>
  );
}

const WEB_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", labelBn: "পেন্ডিং", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  { value: "no_response", label: "No Response", labelBn: "নো রেসপন্স", color: "bg-orange-100 text-orange-800 border-orange-200", icon: PhoneOff },
  { value: "good_but_no_response", label: "Good But No Response", labelBn: "গুড বাট নো রেসপন্স", color: "bg-amber-100 text-amber-800 border-amber-200", icon: ThumbsUp },
  { value: "busy", label: "Busy", labelBn: "বিজি", color: "bg-slate-100 text-slate-800 border-slate-200", icon: PhoneCall },
  { value: "hold", label: "Hold", labelBn: "হোল্ড", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Pause },
  { value: "pre", label: "Pre", labelBn: "প্রি", color: "bg-violet-100 text-violet-800 border-violet-200", icon: CalendarClock },
  { value: "confirmed", label: "Confirm", labelBn: "কনফার্ম", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  { value: "cancelled", label: "Cancel", labelBn: "বাতিল", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
];

const CONFIRMED_STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed", labelBn: "কনফার্মড", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: Package },
  { value: "printed", label: "Printed", labelBn: "প্রিন্টেড", color: "bg-cyan-100 text-cyan-800 border-cyan-200", icon: Printer },
  { value: "entry_done", label: "Entry Done", labelBn: "এন্ট্রি ডান", color: "bg-teal-100 text-teal-800 border-teal-200", icon: ClipboardCheck },
  { value: "shipped", label: "Shipped", labelBn: "শিপড", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Truck },
  { value: "delivered", label: "Delivered", labelBn: "ডেলিভারড", color: "bg-green-100 text-green-800 border-green-200", icon: PackageCheck },
  { value: "partial", label: "Partial", labelBn: "পার্শিয়াল", color: "bg-amber-100 text-amber-800 border-amber-200", icon: PackageMinus },
  { value: "pending_return", label: "Pending Return", labelBn: "পেন্ডিং রিটার্ন", color: "bg-orange-100 text-orange-800 border-orange-200", icon: RotateCcw },
  { value: "return", label: "Return", labelBn: "রিটার্ন", color: "bg-rose-100 text-rose-800 border-rose-200", icon: Undo2 },
  { value: "rtn_received", label: "RTN Received", labelBn: "RTN রিসিভড", color: "bg-lime-100 text-lime-800 border-lime-200", icon: PackageCheck },
  { value: "order_cancelled", label: "Cancel", labelBn: "বাতিল", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  { value: "missing", label: "Missing", labelBn: "মিসিং", color: "bg-gray-100 text-gray-800 border-gray-200", icon: HelpCircle },
];

const CONFIRMED_STATUS_VALUES = CONFIRMED_STATUS_OPTIONS.map((s) => s.value);

// Must stay in sync with `manage_order_stock` DB trigger's "reserved" bucket.
// When both saved & final status are in this set the trigger short-circuits,
// so we must adjust products.reserved_stock ourselves for item edits.
const RESERVED_STATUSES = new Set([
  "confirmed","printed","entry_done","shipped","hold","pending","in_review",
  "picked","on_the_way","delivered_approval_pending",
  "partial_delivered_approval_pending","unknown_approval_pending",
  "cancelled_approval_pending","pending_return","return",
]);

const ALL_STATUS_OPTIONS = [...WEB_STATUS_OPTIONS, ...CONFIRMED_STATUS_OPTIONS];

const getStatusInfo = (status: string) =>
  ALL_STATUS_OPTIONS.find((s) => s.value === status) || WEB_STATUS_OPTIONS[0];

interface OrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
}

export default function OrderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const isNew = !id;

  // Order edit lock
  const { isLocked, lockHolder, showWarning, wasKicked, dismissWarning, forceAcquire, acquireLock } = useOrderEditLock(id);

  // Customer form state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [address, setAddress] = useState("");
  const [originalAddress, setOriginalAddress] = useState("");
  const [showNotePopover, setShowNotePopover] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hardDeleteConfirm, setHardDeleteConfirm] = useState(false);
  const [note, setNote] = useState("");
  const [printNote, setPrintNote] = useState(false);
  const [status, setStatus] = useState("confirmed");
  const [savedStatus, setSavedStatus] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  // Snapshot of items as last persisted — used to compute reserved_stock delta on save.
  const [savedItems, setSavedItems] = useState<{ product_id: string; quantity: number }[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [pickerMode, setPickerMode] = useState<"search" | "category" | "tag">("search");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");
  const [discount, setDiscount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [deliveryChargeOverride, setDeliveryChargeOverride] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingFieldValue, setEditingFieldValue] = useState("");
  const [productDetailId, setProductDetailId] = useState<string | null>(null);
  const [banConfirmVisitor, setBanConfirmVisitor] = useState<{ id: string; currentlyAllowed: boolean } | null>(null);
  const [preDateValue, setPreDateValue] = useState("");
  const [showSmsComposer, setShowSmsComposer] = useState(false);
  const [smsText, setSmsText] = useState("");
  const [sendingSms, setSendingSms] = useState(false);
  const [showAltSmsComposer, setShowAltSmsComposer] = useState(false);

  const clearIncompleteByPhone = useCallback(async (rawPhone: string) => {
    const normalizedPhone = rawPhone.trim();
    if (!normalizedPhone) return;

    try {
      const url = API_URL;
      await fetch(`${url}/orders/incomplete.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone }),
      });
    } catch (e) {
      console.error("Failed to clear incomplete order:", e);
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["incomplete-orders"] }),
      queryClient.invalidateQueries({ queryKey: ["incomplete-phones-for-tags"] }),
      queryClient.invalidateQueries({ queryKey: ["web-orders"] }),
    ]);
  }, [queryClient]);
  const [showAltPhoneField, setShowAltPhoneField] = useState(false);
  const [altSmsText, setAltSmsText] = useState("");
  const [sendingAltSms, setSendingAltSms] = useState(false);
  const [customOrderId, setCustomOrderId] = useState("");
  const [editingInvoice, setEditingInvoice] = useState(false);
  const [editingInvoiceValue, setEditingInvoiceValue] = useState("");
  const [showAllPhoneOrders, setShowAllPhoneOrders] = useState(false);
  const [prevCustomerData, setPrevCustomerData] = useState<{ name: string | null; address: string | null; alt_phone: string | null } | null>(null);

  // Lookup previous customer data by phone
  useEffect(() => {
    const trimmedPhone = phone.trim();
    if (trimmedPhone.length < 11) { setPrevCustomerData(null); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("visitor_profiles")
        .select("name, address, alt_phone")
        .eq("phone", trimmedPhone)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data && (data.name || data.address)) {
        setPrevCustomerData(data);
      } else {
        setPrevCustomerData(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [phone]);

  // Fetch full product detail for popup
  const { data: productDetail, isLoading: productDetailLoading } = useQuery({
    queryKey: ["product-detail-popup", productDetailId],
    enabled: !!productDetailId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productDetailId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch order data if editing (by order_id like AB100)
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["order-edit", id],
    enabled: !!id,
    queryFn: async () => {
      const url = API_URL;
      const res = await fetch(`${url}/orders/get.php?id=${id}`);
      if (!res.ok) throw new Error("Order not found");
      return res.json();
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["order-edit-items", order?.id],
    enabled: !!order?.id,
    queryFn: async () => {
      // In PHP JSON DB, items are stored directly inside the order object
      return (order?.items || []).map((i: any) => ({
        ...i,
        product_image: i.product_image || null,
      }));
    },
  });

  // Fill form when order loads
  useEffect(() => {
    if (order) {
      setCustomerName(order.customer_name || "");
      setPhone(order.phone || "");
      setAltPhone(order.alt_phone || "");
      setShowAltPhoneField(!!(order.alt_phone));
      setAddress(order.address || "");
      setOriginalAddress(order.address || "");
      setNote(order.note || "");
      setPrintNote((order as any).print_note || false);
      setSavedStatus(order.status);
      setDiscount(Number((order as any).discount) || 0);
      setAdvance(Number((order as any).advance) || 0);
      const dc = (order as any).delivery_charge;
      setDeliveryChargeOverride(dc != null ? Number(dc) : null);
      // Load pre_date if exists
      if ((order as any).pre_date) {
        setPreDateValue((order as any).pre_date);
      }
      // If order is in confirmed pipeline, keep its status; otherwise default to "confirmed"
      if (CONFIRMED_STATUS_VALUES.includes(order.status)) {
        setStatus(order.status);
      } else {
        setStatus(order.status === "pre" ? "pre" : "confirmed");
      }
    }
  }, [order]);

  // Auto-save note with debounce (only for existing orders)
  const noteInitRef = useRef(false);
  useEffect(() => {
    if (!order || isNew) return;
    if (!noteInitRef.current) { noteInitRef.current = true; return; }
    const timer = setTimeout(async () => {
      const url = API_URL;
      fetch(`${url}/orders/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, note: note.trim() || null }),
      }).catch(console.error);
    }, 800);
    return () => clearTimeout(timer);
  }, [note, order?.id]);

  // Auto-save altPhone with debounce (only for existing orders, when 11+ digits or cleared)
  const altPhoneInitRef = useRef(false);
  useEffect(() => {
    if (!order || isNew) return;
    if (!altPhoneInitRef.current) { altPhoneInitRef.current = true; return; }
    const trimmed = altPhone.trim();
    if (trimmed.length > 0 && trimmed.length < 11) return;
    const timer = setTimeout(async () => {
      const url = API_URL;
      fetch(`${url}/orders/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, alt_phone: trimmed || null }),
      }).catch(console.error);
    }, 800);
    return () => clearTimeout(timer);
  }, [altPhone, order?.id]);




  const isConfirmedPipeline = order && CONFIRMED_STATUS_VALUES.includes(order.status);
  const activeStatusOptions = isConfirmedPipeline ? CONFIRMED_STATUS_OPTIONS : WEB_STATUS_OPTIONS;

  useEffect(() => {
    if (orderItems) {
      setItems(orderItems.map((i) => ({
        id: i.id,
        product_id: i.product_id,
        product_name: i.product_name,
        product_image: i.product_image,
        unit_price: Number(i.unit_price),
        quantity: Number(i.quantity),
      })));
      setSavedItems(orderItems.map((i) => ({
        product_id: i.product_id,
        quantity: Number(i.quantity),
      })));
    }
  }, [orderItems]);

  // Fetch categories and tags for picker
  const { data: pickerCategories } = useQuery({
    queryKey: ["picker-categories"],
    queryFn: async () => {
      const url = API_URL;
      const res = await fetch(`${url}/categories/get.php`);
      let data = await res.json();
      data = data.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
      return data?.map((c: any) => c.name) || [];
    },
  });
  const { data: pickerTags } = useQuery({
    queryKey: ["picker-tags"],
    queryFn: async () => {
      const { data } = await supabase.from("tags").select("name").order("name");
      return data?.map((t) => t.name) || [];
    },
  });

  // Fetch products for picker
  const { data: products } = useQuery({
    queryKey: ["products-picker", pickerMode, productSearch, selectedCategory, selectedTag],
    queryFn: async () => {
      const url = API_URL;
      const res = await fetch(`${url}/products/get.php`);
      if (!res.ok) throw new Error("Failed to fetch products");
      let data = await res.json();
      
      // Filter is_hidden locally
      data = data.filter((p: any) => !p.is_hidden);
      
      if (pickerMode === "search" && productSearch) {
        const search = productSearch.toLowerCase();
        data = data.filter((p: any) => (p.name && p.name.toLowerCase().includes(search)) || (p.sku && p.sku.toLowerCase().includes(search)));
      } else if (pickerMode === "category" && selectedCategory) {
        data = data.filter((p: any) => p.category === selectedCategory || (p.categories && p.categories.includes(selectedCategory)));
      } else if (pickerMode === "tag" && selectedTag) {
        data = data.filter((p: any) => p.tag === selectedTag || (p.tags && p.tags.includes(selectedTag)));
      }
      return data.slice(0, 50);
    },
  });

  // Fetch customer profile by phone
  const { data: customerProfile } = useQuery({
    queryKey: ["customer-profile", phone],
    enabled: phone.length >= 11,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitor_profiles")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch all orders by this phone number
  const { data: phoneOrders } = useQuery({
    queryKey: ["phone-orders", phone],
    enabled: phone.length >= 11,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_id, status, total_amount, created_at, customer_name")
        .eq("phone", phone)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      // Filter out current order
      return (data || []).filter(o => o.order_id !== id);
    },
  });

  // Fetch visitor data linked to this order (via visitor_id or via visitor_profile_id -> visitor_id)
  const { data: visitorData } = useQuery({
    queryKey: ["order-visitor-data", id, order?.visitor_id, order?.visitor_profile_id],
    enabled: !!order,
    queryFn: async () => {
      // Try direct visitor_id first
      let visitorId = (order as any)?.visitor_id;
      
      // Fallback: get visitor_id from visitor_profile
      if (!visitorId && order?.visitor_profile_id) {
        const { data: profile } = await supabase
          .from("visitor_profiles")
          .select("visitor_id")
          .eq("id", order.visitor_profile_id)
          .maybeSingle();
        visitorId = profile?.visitor_id;
      }

      if (!visitorId) return null;

      const { data: visitor } = await supabase
        .from("visitors")
        .select("*")
        .eq("id", visitorId)
        .maybeSingle();
      return visitor;
    },
  });

  // Fetch admin creator name if order was created by admin
  const { data: creatorAdmin } = useQuery({
    queryKey: ["order-creator-admin", id, (order as any)?.created_by_admin_id],
    enabled: !!(order as any)?.created_by_admin_id,
    queryFn: async () => {
      const adminId = (order as any).created_by_admin_id;
      const { data, error } = await supabase.functions.invoke("manage-admin", {
        body: { action: "lookup", user_id: adminId },
      });
      if (error) return { name: null };
      return { name: data?.name || null };
    },
  });

  // IP Geolocation lookup
  const { data: ipGeoData } = useQuery({
    queryKey: ["ip-geo", visitorData?.ip_addresses],
    enabled: !!visitorData?.ip_addresses?.length,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const ips = visitorData!.ip_addresses as string[];
      // ip-api.com supports batch lookup (POST) for up to 100 IPs
      const res = await fetch("http://ip-api.com/batch?fields=query,city,regionName,country,status", {
        method: "POST",
        body: JSON.stringify(ips.map(ip => ({ query: ip }))),
      });
      if (!res.ok) return {};
      const results = await res.json() as Array<{ query: string; city?: string; regionName?: string; country?: string; status: string }>;
      const map: Record<string, string> = {};
      for (const r of results) {
        if (r.status === "success" && r.city) {
          map[r.query] = `${r.city}, ${r.country}`;
        }
      }
      return map;
    },
  });

  // Fetch customer order history: profile-linked + all phone-matched
  const { data: customerOrders } = useQuery({
    queryKey: ["customer-orders", phone, order?.visitor_profile_id],
    enabled: phone.length >= 11,
    queryFn: async () => {
      const { data: phoneOrders, error } = await supabase
        .from("orders")
        .select("id, order_id, total_amount, status, created_at, visitor_profile_id")
        .eq("phone", phone)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      let allOrders = phoneOrders || [];

      // Also fetch profile-linked orders if profile exists
      const profileId = order?.visitor_profile_id;
      if (profileId) {
        const { data: profileOrders } = await supabase
          .from("orders")
          .select("id, order_id, total_amount, status, created_at, visitor_profile_id")
          .eq("visitor_profile_id", profileId)
          .order("created_at", { ascending: false })
          .limit(20);
        
        if (profileOrders) {
          const seenIds = new Set(allOrders.map(o => o.id));
          for (const o of profileOrders) {
            if (!seenIds.has(o.id)) {
              allOrders.push(o);
            }
          }
        }
      }

      allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return allOrders.slice(0, 15);
    },
  });

  // Duplicate order detection (48h window)
  const { data: duplicateWarnings } = useQuery({
    queryKey: ["duplicate-check", id, phone, order?.visitor_id],
    enabled: !!order && !!id,
    queryFn: async () => {
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const warnings: { type: string; orders: any[] }[] = [];

      // Check same phone within 48h
      if (phone.length >= 11) {
        const { data: phoneMatches } = await supabase
          .from("orders")
          .select("id, order_id, status, created_at, customer_name")
          .eq("phone", phone)
          .eq("is_deleted", false)
          .gte("created_at", cutoff)
          .neq("id", id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (phoneMatches && phoneMatches.length > 0) {
          warnings.push({ type: "phone", orders: phoneMatches });
        }
      }

      // Check same visitor_id within 48h
      if (order?.visitor_id) {
        const { data: visitorMatches } = await supabase
          .from("orders")
          .select("id, order_id, status, created_at, customer_name, phone")
          .eq("visitor_id", order.visitor_id)
          .eq("is_deleted", false)
          .gte("created_at", cutoff)
          .neq("id", id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (visitorMatches && visitorMatches.length > 0) {
          // Deduplicate with phone matches
          const phoneIds = new Set(warnings[0]?.orders.map((o: any) => o.id) || []);
          const uniqueVisitorOrders = visitorMatches.filter((o: any) => !phoneIds.has(o.id));
          if (uniqueVisitorOrders.length > 0) {
            warnings.push({ type: "device", orders: uniqueVisitorOrders });
          }
        }
      }

      return warnings.length > 0 ? warnings : null;
    },
  });

  const [fraudRefreshing, setFraudRefreshing] = useState(false);
  const cleanPhone = phone ? phone.trim().replace(/\D/g, "") : "";

  const handleFraudForceRefresh = useCallback(async () => {
    const p = phone ? phone.trim().replace(/\D/g, "") : "";
    if (!p || p.length < 11 || fraudRefreshing) return;
    setFraudRefreshing(true);
    try {
      const url = API_URL;
      const res = await fetch(`${url}/orders/fraud_checker.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "force_check", phone: p }),
      });
      const json = await res.json();
      const fresh = json?.data?.fraudchecker_data || json?.data;
      if (fresh) {
        queryClient.setQueryData(["fraud-check", p], fresh);
      }
      toast.success(t("ফ্রড ডেটা রিফ্রেশ হয়েছে", "Fraud data refreshed"));
    } catch {
      toast.error(t("রিফ্রেশ ব্যর্থ", "Refresh failed"));
    } finally {
      setFraudRefreshing(false);
    }
  }, [phone, fraudRefreshing, queryClient, t]);

  const { data: fraudData, isLoading: fraudLoading } = useQuery({
    queryKey: ["fraud-check", cleanPhone],
    enabled: false, // Inactive per user request (Steadfast Risk Check active)
    queryFn: async () => {
      try {
        const url = API_URL;
        const res = await fetch(`${url}/orders/fraud_checker.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check", phone: cleanPhone }),
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data?.fraudchecker_data || json?.data || null;
      } catch (err) {
        console.warn("Fraud check error:", err);
        return null;
      }
    },
    staleTime: 30 * 60 * 1000,
  });

  const [steadfastRefreshing, setSteadfastRefreshing] = useState(false);

  const { data: steadfastData, isLoading: steadfastLoading } = useQuery({
    queryKey: ["steadfast-fraud-check", cleanPhone],
    enabled: cleanPhone.length >= 11,
    queryFn: async () => {
      try {
        const url = API_URL;
        const res = await fetch(`${url}/courier/steadfast.php?action=fraud_check&phone=${cleanPhone}`);
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data || null;
      } catch (err) {
        console.warn("Steadfast fraud check error:", err);
        return null;
      }
    },
    staleTime: 30 * 60 * 1000,
  });

  const handleSteadfastForceRefresh = useCallback(async () => {
    const p = phone ? phone.trim().replace(/\D/g, "") : "";
    if (!p || p.length < 11 || steadfastRefreshing) return;
    setSteadfastRefreshing(true);
    try {
      const url = API_URL;
      const res = await fetch(`${url}/courier/steadfast.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fraud_check", phone: p, force: true }),
      });
      const json = await res.json();
      if (json?.data) {
        queryClient.setQueryData(["steadfast-fraud-check", p], json.data);
      }
      toast.success(t("Steadfast ফ্রড ডেটা রিফ্রেশ হয়েছে", "Steadfast fraud data refreshed"));
    } catch {
      toast.error(t("রিফ্রেশ ব্যর্থ", "Refresh failed"));
    } finally {
      setSteadfastRefreshing(false);
    }
  }, [phone, steadfastRefreshing, queryClient, t]);



  // Fetch status history for timeline
  const { data: statusHistory } = useQuery({
    queryKey: ["order-status-history", order?.id],
    enabled: !!order?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", order!.id)
        .order("changed_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const [showAllHistory, setShowAllHistory] = useState(false);

  const subtotal = useMemo(() =>
    items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0), [items]);

  const autoDeliveryCharge = getDeliveryCharge(subtotal - discount);
  const deliveryCharge = deliveryChargeOverride !== null ? deliveryChargeOverride : autoDeliveryCharge;
  const totalAmount = subtotal - discount - advance + deliveryCharge;

  const addProduct = (product: any) => {
    const existing = items.find((i) => i.product_id === product.id);
    if (existing) {
      setItems(items.map((i) => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, {
        product_id: product.id,
        product_name: product.name,
        product_image: product.product_image,
        unit_price: product.offer_price || product.regular_price,
        quantity: 1,
      }]);
    }
  };

  const updateItemQty = (productId: string, delta: number) => {
    setItems(items.map((i) => {
      if (i.product_id !== productId) return i;
      const newQty = i.quantity + delta;
      return newQty > 0 ? { ...i, quantity: newQty } : i;
    }));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.product_id !== productId));
  };

  const handleSave = async (newStatus?: string, goBack = false) => {
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      toast.error(t("নাম, ফোন ও ঠিকানা আবশ্যক", "Name, phone and address are required"));
      return;
    }
    if (items.length === 0) {
      toast.error(t("কমপক্ষে একটি পণ্য যোগ করুন", "Add at least one product"));
      return;
    }

    setSaving(true);
    const finalStatus = newStatus || savedStatus || status;

    try {
      const url = API_URL;
      
      const payload = {
        id: isNew ? undefined : order!.id,
        customer_name: customerName.trim(),
        phone: phone.trim(),
        alt_phone: altPhone.trim() || null,
        address: address.trim(),
        note: note.trim() || null,
        print_note: printNote,
        status: finalStatus,
        pre_date: preDateValue || null,
        total_amount: totalAmount,
        discount,
        advance,
        delivery_charge: deliveryChargeOverride,
        created_by_admin_id: isNew ? getActiveAdminId() : ((order as any)?.created_by_admin_id || getActiveAdminId()),
        last_status_changed_by: getActiveAdminId(),
        items: items.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          product_image: i.product_image,
          unit_price: i.unit_price,
          quantity: i.quantity
        }))
      };

      if (isNew) {
        const res = await fetch(`${url}/orders/create.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') throw new Error(data.error || "Order creation failed");
        
        toast.success(t("অর্ডার তৈরি হয়েছে", "Order created"));
        clearIncompleteByPhone(phone);
        if (goBack) {
          navigate(-1);
          return;
        }
        navigate(`/admin/orders/edit/${data.data.order_id}`, { replace: true });
      } else {
        const res = await fetch(`${url}/orders/update.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') throw new Error(data.error || "Order update failed");
        
        // Trigger fail-safe SMS notification if status changed
        if (order?.id && finalStatus !== order?.status) {
          dispatchOrderNotification({
            orderId: order.order_id || order.id,
            newStatus: finalStatus,
            oldStatus: order.status,
            phone: phone.trim(),
            customerName: customerName.trim(),
            totalAmount: totalAmount,
            trackingCode: (order as any)?.tracking_code || (order as any)?.consignment_id || "",
          }).catch(console.error);
        }
        clearIncompleteByPhone(phone);

        toast.success(t("অর্ডার আপডেট হয়েছে", "Order updated"));
      }

      // Auto-create customer profile when order is confirmed
      if (finalStatus === "confirmed") {
        try {
          const trimmedPhone = phone.trim();
          const { data: existingProfile } = await supabase
            .from("visitor_profiles")
            .select("id")
            .eq("phone", trimmedPhone)
            .maybeSingle();

          if (!existingProfile) {
            const { data: newVisitor, error: visitorErr } = await supabase
              .from("visitors")
              .insert({ fingerprint: `order-${trimmedPhone}-${Date.now()}` })
              .select("id")
              .single();
            if (visitorErr) throw visitorErr;

            await supabase.from("visitor_profiles").insert({
              visitor_id: newVisitor.id,
              phone: trimmedPhone,
              name: customerName.trim(),
              address: address.trim(),
              alt_phone: altPhone.trim() || null,
            });
          } else {
            // Update existing profile with latest order info
            await supabase.from("visitor_profiles").update({
              name: customerName.trim(),
              address: address.trim(),
              alt_phone: altPhone.trim() || null,
            }).eq("id", existingProfile.id);
          }
        } catch (profileErr) {
          console.error("Auto-create customer profile error:", profileErr);
        }
      }

      setStatus(finalStatus);
      setSavedStatus(finalStatus);
      setSavedItems(items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })));
      queryClient.invalidateQueries({ queryKey: ["web-orders"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-edit", id] });
      queryClient.invalidateQueries({ queryKey: ["order-edit-items", id] });

      if (goBack) {
        navigate(-1);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  if (!isNew && orderLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const lockInitials = lockHolder?.user_name
    ? lockHolder.user_name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : lockHolder?.user_email?.[0]?.toUpperCase() || "?";

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-6">
      {/* Lock warning dialog: someone else is editing */}
      <AlertDialog open={showWarning && !wasKicked}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              {false
                ? t("মিনা অর্ডার নিচ্ছে", "Mina is Processing Order")
                : t("অর্ডার লক করা আছে", "Order is Locked")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <Avatar className="h-10 w-10 bg-amber-100 text-amber-700">
                  {lockHolder?.user_photo && <AvatarImage src={lockHolder.user_photo} alt={lockHolder.user_name || ""} />}
                  <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">
                    {false ? "🤖" : lockInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{lockHolder?.user_name || lockHolder?.user_email}</p>
                  <p className="text-xs text-muted-foreground">
                    {false
                      ? t("কাস্টমারের সাথে কথা বলে অর্ডার আপডেট করছে", "Talking to customer and updating order")
                      : t("এই অর্ডার এডিট করছেন", "is currently editing this order")}
                  </p>
                </div>
              </div>
              {false && lockHolder?.heartbeat_at && (
                <MinaCountdown expiresAt={lockHolder.heartbeat_at} onExpired={() => { dismissWarning(); acquireLock(); }} />
              )}
              <p className="text-sm">
                {false
                  ? t(
                      "মিনা এই মুহূর্তে কাস্টমারের সাথে কথা বলছে এবং অর্ডার আপডেট করছে। আপনি চাইলে জোর করে এডিট নিতে পারেন।",
                      "Mina is currently talking to the customer and updating the order. You can force take over if needed."
                    )
                  : t(
                      "আপনি চাইলে ফিরে যেতে পারেন অথবা জোর করে এডিট নিতে পারেন। জোর করে নিলে আগের ব্যক্তি স্বয়ংক্রিয়ভাবে বের হয়ে যাবেন।",
                      "You can go back or force take over editing. If you force take over, the previous editor will be kicked out automatically."
                    )}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { dismissWarning(); navigate(-1); }}>
              {t("ফিরে যান", "Go Back")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={forceAcquire} className="bg-amber-600 hover:bg-amber-700">
              {t("জোর করে এডিট নিন", "Force Take Over")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Kicked out dialog */}
      <AlertDialog open={wasKicked}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {t("আপনাকে বের করা হয়েছে", "You've Been Kicked Out")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <Avatar className="h-10 w-10 bg-red-100 text-red-700">
                  {lockHolder?.user_photo && <AvatarImage src={lockHolder.user_photo} alt={lockHolder.user_name || ""} />}
                  <AvatarFallback className="bg-red-100 text-red-700 font-bold">{lockInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{lockHolder?.user_name || lockHolder?.user_email}</p>
                  <p className="text-xs text-muted-foreground">{t("এই অর্ডারের এডিট নিয়ে নিয়েছেন", "has taken over editing this order")}</p>
                </div>
              </div>
              <p className="text-sm text-destructive font-medium">
                {t("আপনার পরিবর্তন সেভ নাও হতে পারে। অনুগ্রহ করে ফিরে যান।", "Your changes may not be saved. Please go back.")}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate(-1)}>
              {t("ফিরে যান", "Go Back")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Active lock indicator in header */}
      {!isNew && lockHolder && !isLocked && (
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300/70 dark:border-emerald-700/60 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-400 shadow-2xs backdrop-blur-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          {t("আপনি এই অর্ডার এডিট করছেন", "You are editing this order")}
        </div>
      )}
      {!isNew && order && (order as any).is_courier_entered && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-rose-50/90 dark:bg-rose-950/40 border border-rose-300/70 dark:border-rose-800/70 rounded-xl text-xs sm:text-sm font-medium text-rose-800 dark:text-rose-300 shadow-2xs backdrop-blur-sm">
          <Truck className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{t("🚚 এই অর্ডারটি কুরিয়ারে এন্ট্রি করা হয়েছে — পরিবর্তন করলে কুরিয়ারেও আপডেট করতে হবে", "🚚 This order is entered in courier — changes will require courier update")}</span>
        </div>
      )}
      {/* Status History Timeline */}
      {!isNew && statusHistory && statusHistory.length > 0 && (() => {
        const displayItems = showAllHistory ? statusHistory : statusHistory.slice(-4);
        const hiddenCount = statusHistory.length - 4;
        const formatDuration = (ms: number) => {
          const mins = Math.floor(ms / 60000);
          if (mins < 60) return `${mins}m`;
          const hrs = Math.floor(mins / 60);
          if (hrs < 24) return `${hrs}h ${mins % 60}m`;
          const days = Math.floor(hrs / 24);
          return `${days}d ${hrs % 24}h`;
        };
        const getStatusLabel = (s: string) => {
          const found = ALL_STATUS_OPTIONS.find(o => o.value === s);
          return found ? t(found.labelBn, found.label) : s;
        };
        return (
          <div className="px-4 py-3 bg-card/70 backdrop-blur-md border border-border/70 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-5 rounded-md bg-muted/80 flex items-center justify-center">
                <Clock className="w-3 h-3 text-muted-foreground" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("স্ট্যাটাস হিস্ট্রি", "Status History")}</span>
              {hiddenCount > 0 && !showAllHistory && (
                <button onClick={() => setShowAllHistory(true)} className="text-[11px] font-medium text-primary hover:underline ml-auto">
                  +{hiddenCount} more
                </button>
              )}
              {showAllHistory && hiddenCount > 0 && (
                <button onClick={() => setShowAllHistory(false)} className="text-[11px] font-medium text-primary hover:underline ml-auto">
                  {t("কম দেখুন", "Show less")}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {displayItems.map((h: any, i: number) => {
                const prevTime = i > 0 ? new Date(displayItems[i - 1].changed_at).getTime() : null;
                const currTime = new Date(h.changed_at).getTime();
                const duration = prevTime ? formatDuration(currTime - prevTime) : null;
                return (
                  <div key={h.id} className="flex items-center gap-1.5">
                    {duration && (
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted/80 border border-border/50 px-2 py-0.5 rounded-md shadow-2xs">
                        {duration}
                      </span>
                    )}
                    {(duration || i > 0) && <span className="text-muted-foreground/60 text-xs">→</span>}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs cursor-default hover:bg-primary/15 transition-colors">
                            {getStatusLabel(h.status)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs space-y-0.5 shadow-md">
                          <p className="font-semibold">{format(new Date(h.changed_at), "dd/MM/yyyy hh:mm a")}</p>
                          {h.changed_by_name && <p className="text-muted-foreground">{h.changed_by_name}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 sm:py-3 rounded-2xl bg-card/70 border border-border/70 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-xl border border-border/70 bg-background/50 hover:bg-muted shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-foreground/80" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-display font-bold text-foreground tracking-tight flex items-center gap-2">
              {isNew ? (
                <span className="flex items-center gap-2">
                  <span className="text-foreground">{t("নতুন অর্ডার", "New Order")}</span>
                  <Input
                    value={customOrderId}
                    onChange={(e) => setCustomOrderId(e.target.value)}
                    placeholder={t("ইনভয়েস (ঐচ্ছিক)", "Invoice (optional)")}
                    className="h-8 w-32 text-xs font-mono rounded-lg border-border/80 focus:border-primary inline-block"
                  />
                </span>
              ) : editingInvoice ? (
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-medium">{t("অর্ডার", "Order")}:</span>
                  <Input
                    autoFocus
                    value={editingInvoiceValue}
                    onChange={(e) => setEditingInvoiceValue(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && editingInvoiceValue.trim() && order) {
                        try {
                          const url = API_URL;
                          const res = await fetch(`${url}/orders/update.php`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: order.id, order_id: editingInvoiceValue.trim() }),
                          });
                          const data = await res.json();
                          if (!res.ok || data.error) throw new Error(data.error || "Update failed");
                          toast.success(t("ইনভয়েস আপডেট হয়েছে", "Invoice updated"));
                          queryClient.invalidateQueries({ queryKey: ["order-edit", id] });
                          navigate(`/admin/orders/edit/${editingInvoiceValue.trim()}`, { replace: true });
                          setEditingInvoice(false);
                        } catch (err: any) {
                          toast.error(err.message);
                          return;
                        }
                      }
                      if (e.key === "Escape") setEditingInvoice(false);
                    }}
                    onBlur={() => setEditingInvoice(false)}
                    className="h-8 w-32 text-sm font-mono rounded-lg border-primary"
                  />
                </span>
              ) : (
                <span
                  onDoubleClick={() => {
                    setEditingInvoiceValue(order?.order_id || "");
                    setEditingInvoice(true);
                  }}
                  className="cursor-pointer group flex items-center gap-1.5"
                  title={t("ডাবল ক্লিক করে ইনভয়েস এডিট করুন", "Double click to edit invoice")}
                >
                  <span className="text-muted-foreground text-sm font-medium">{t("অর্ডার", "Order")}</span>
                  <span className="font-mono font-bold text-foreground px-2.5 py-0.5 rounded-lg bg-muted/60 border border-border/80 group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors">
                    #{order?.order_id}
                  </span>
                </span>
              )}
            </h1>
          </div>
        </div>

        {!isNew && order && (() => {
          const si = getStatusInfo(order.status);
          const SI = si.icon;
          const invoiceUrl = `${window.location.origin}/invoice/${order.order_id || order.id}`;
          return (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${si.color}`}>
                <SI className="w-3.5 h-3.5" />
                {si.label}
              </span>

              <div className="flex items-center gap-1 bg-background/60 p-0.5 rounded-xl border border-border/70 shadow-2xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(invoiceUrl);
                    toast.success(t("ইনভয়েস লিংক কপি করা হয়েছে!", "Invoice link copied!"));
                  }}
                  className="h-7 text-xs gap-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                  title={t("ইনভয়েস লিংক কপি করুন", "Copy Invoice Link")}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="font-medium">{t("লিংক কপি", "Copy Link")}</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(invoiceUrl, "_blank")}
                  className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={t("ইনভয়েস পেজ খুলুন", "Open Invoice Page")}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const msg = `Ss Seed Shop - ইনভয়েস চালান: ${order.order_id}\nলিংক: ${invoiceUrl}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
                  }}
                  className="h-7 w-7 p-0 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  title={t("WhatsApp এ ইনভয়েস লিংক শেয়ার করুন", "Share invoice on WhatsApp")}
                >
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] xl:grid-cols-[1fr_330px] gap-4 items-start">
        {/* Main content */}
        <div className="space-y-4">
          {/* Area 1: Customer Data */}
           <Card className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-xs overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  {t("কাস্টমার তথ্য", "Customer Info")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {note.trim() && (
                    <span className="text-[11px] text-muted-foreground max-w-[200px] truncate bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">{note.length > 50 ? note.slice(0, 50) + '…' : note}</span>
                  )}
                  <Popover open={showNotePopover} onOpenChange={setShowNotePopover}>
                    <PopoverTrigger asChild>
                      <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${note.trim() ? 'bg-primary/10 border-primary/30 text-primary shadow-2xs' : 'border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground'}`} title={t("নোট", "Note")}>
                        {note.trim() ? (
                          <StickyNote className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <>{t("নোট", "Add Note")} <Plus className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3 space-y-2 rounded-2xl shadow-xl border-border/80" align="end">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">{t("নোট", "Note")}</Label>
                        <button type="button" onClick={() => setShowNotePopover(false)} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                       <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("ঐচ্ছিক নোট", "Optional note")} className="min-h-[80px] resize-none rounded-xl text-xs" />
                      {note.trim() && (
                        <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                          <input type="checkbox" checked={printNote} onChange={(e) => {
                            setPrintNote(e.target.checked);
                            if (order && !isNew) {
                              const url = API_URL;
                              fetch(`${url}/orders/update.php`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: order.id, print_note: e.target.checked }),
                              }).catch(console.error);
                            }
                          }} className="rounded border-gray-300" />
                          <span className="text-xs text-muted-foreground">{printNote ? "✅" : "☐"} {t("ইনভয়েসে নোট প্রিন্ট হবে", "Print note on invoice")}</span>
                        </label>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-semibold text-foreground/80 mb-1.5 block">{t("নাম", "Name")} <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("কাস্টমারের নাম", "Customer name")} className="h-10 rounded-xl bg-background/60 focus:bg-background border-border/80 focus:border-primary shadow-2xs text-sm" />
                    {prevCustomerData && !customerName.trim() && !address.trim() && (
                      <button
                        type="button"
                        title={`${prevCustomerData.name || ""} — আগের ডেটা ফিল করুন`}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-transform active:scale-95 p-1 rounded-md hover:bg-primary/10"
                        onClick={() => {
                          if (prevCustomerData.name) setCustomerName(prevCustomerData.name);
                          if (prevCustomerData.alt_phone && !altPhone.trim()) {
                            setAltPhone(prevCustomerData.alt_phone);
                            setShowAltPhoneField(true);
                          }
                          // Fill address and parse for district/thana/area
                          if (prevCustomerData.address) {
                            setAddress(prevCustomerData.address);
                            setOriginalAddress(prevCustomerData.address);
                          }
                          toast.success("আগের ডেটা ফিল করা হয়েছে");
                        }}
                      >
                        <Sparkles className="w-4 h-4 animate-pulse text-amber-500" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground/80 mb-1.5 block">{t("ফোন", "Phone")} <span className="text-destructive">*</span></Label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="h-10 rounded-xl bg-background/60 focus:bg-background border-border/80 focus:border-primary shadow-2xs text-sm font-mono pr-24" />
                      {phone.length >= 11 && (
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60">
                          <button type="button" onClick={() => window.open(`tel:${phone}`, '_self')} className="p-1 rounded-md hover:bg-background transition-colors text-emerald-600 hover:text-emerald-700" title={t("কল করুন", "Call")}>
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => window.open(`https://wa.me/88${phone.replace(/^0/, '')}`, '_blank')} className="p-1 rounded-md hover:bg-background transition-colors text-emerald-500 hover:text-emerald-600" title="WhatsApp">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          </button>
                          <button type="button" onClick={() => setShowSmsComposer(!showSmsComposer)} className={`p-1 rounded-md hover:bg-background transition-colors text-blue-600 hover:text-blue-700 ${showSmsComposer ? 'bg-primary/10' : ''}`} title={t("এসএমএস পাঠান", "Send SMS")}>
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <Popover open={showAltPhoneField} onOpenChange={setShowAltPhoneField}>
                      <PopoverTrigger asChild>
                        <button type="button" className={`h-10 w-10 rounded-xl border border-border/80 hover:bg-muted flex items-center justify-center transition-all flex-shrink-0 shadow-2xs ${altPhone.length >= 11 ? 'bg-primary/10 border-primary/30 text-primary' : 'text-muted-foreground'}`} title={t("এক্সট্রা নম্বর", "Extra number")}>
                          <Plus className={`w-4 h-4 ${altPhone.length >= 11 ? 'text-primary' : 'text-muted-foreground'}`} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3 space-y-2 rounded-2xl shadow-xl border-border/80" align="end">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold">{t("এক্সট্রা নম্বর", "Extra number")}</Label>
                          <button type="button" onClick={() => setShowAltPhoneField(false)} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title={t("বন্ধ করুন", "Close")}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="relative">
                          <Input value={altPhone} onChange={(e) => setAltPhone(e.target.value)} placeholder="01XXXXXXXXX" className="h-9 rounded-xl pr-20 text-xs font-mono" />
                          {altPhone.length >= 11 && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                              <button type="button" onClick={() => window.open(`tel:${altPhone}`, '_self')} className="p-1 rounded hover:bg-muted transition-colors" title={t("কল করুন", "Call")}><Phone className="w-3.5 h-3.5 text-green-600" /></button>
                              <button type="button" onClick={() => window.open(`https://wa.me/88${altPhone.replace(/^0/, '')}`, '_blank')} className="p-1 rounded hover:bg-muted transition-colors" title="WhatsApp"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-green-500 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>
                              <button type="button" onClick={() => setShowAltSmsComposer(!showAltSmsComposer)} className={`p-1 rounded hover:bg-muted transition-colors ${showAltSmsComposer ? 'bg-primary/10' : ''}`} title={t("এসএমএস পাঠান", "Send SMS")}><MessageSquare className="w-3.5 h-3.5 text-blue-600" /></button>
                            </div>
                          )}
                        </div>
                        {showAltSmsComposer && altPhone.length >= 11 && (
                          <div className="space-y-1.5 p-2 rounded-xl border border-border/70 bg-muted/30">
                            <Textarea value={altSmsText} onChange={(e) => setAltSmsText(e.target.value)} placeholder={t("মেসেজ লিখুন...", "Type message...")} className="min-h-[60px] resize-none text-xs rounded-lg" />
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">{altSmsText.length} {t("অক্ষর", "chars")} · {Math.ceil(altSmsText.length / 160) || 0} SMS</span>
                              <Button size="sm" className="h-7 text-xs gap-1 rounded-lg" disabled={!altSmsText.trim() || sendingAltSms} onClick={async () => {
                                setSendingAltSms(true);
                                try {
                                   const { data, error } = await supabase.functions.invoke("sms-api", { body: { action: "send_sms", number: altPhone, message: altSmsText, reason: "manual" } });
                                   if (error) throw error;
                                   if (!data?.success) throw new Error(data?.result?.msg || "SMS পাঠাতে ব্যর্থ");
                                  toast.success(t("এসএমএস পাঠানো হয়েছে", "SMS sent"));
                                  setAltSmsText(""); setShowAltSmsComposer(false);
                                } catch (err: any) { toast.error(err.message || "SMS failed"); } finally { setSendingAltSms(false); }
                              }}>
                                {sendingAltSms ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                {t("পাঠান", "Send")}
                              </Button>
                            </div>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                  {showSmsComposer && phone.length >= 11 && (
                    <div className="mt-2 space-y-1.5 p-2.5 rounded-xl border border-border/70 bg-muted/30">
                      <Textarea
                        value={smsText}
                        onChange={(e) => setSmsText(e.target.value)}
                        placeholder={t("মেসেজ লিখুন...", "Type message...")}
                        className="min-h-[60px] resize-none text-xs rounded-lg"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {smsText.length} {t("অক্ষর", "chars")} · {Math.ceil(smsText.length / 160) || 0} SMS
                        </span>
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1 rounded-lg"
                          disabled={!smsText.trim() || sendingSms}
                          onClick={async () => {
                            setSendingSms(true);
                            try {
                              const { data, error } = await supabase.functions.invoke("sms-api", {
                                body: { action: "send_sms", number: phone, message: smsText, reason: "manual" },
                              });
                              if (error) throw error;
                              if (!data?.success) throw new Error(data?.result?.msg || "SMS পাঠাতে ব্যর্থ");
                              toast.success(t("এসএমএস পাঠানো হয়েছে", "SMS sent"));
                              setSmsText("");
                              setShowSmsComposer(false);
                            } catch (err: any) {
                              toast.error(err.message || "SMS failed");
                            } finally {
                              setSendingSms(false);
                            }
                          }}
                        >
                          {sendingSms ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          {t("পাঠান", "Send")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Label className="text-xs font-semibold text-foreground/80">{t("ঠিকানা", "Address")} <span className="text-destructive">*</span></Label>
                    {originalAddress && originalAddress !== address && (
                      <span className="text-[10px] text-muted-foreground truncate max-w-[200px]" title={originalAddress}>
                        ({originalAddress})
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t("সম্পূর্ণ ঠিকানা", "Full address")}
                      className="h-10 rounded-xl bg-background/60 focus:bg-background border-border/80 focus:border-primary shadow-2xs text-sm pr-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Area 2+3: Order Items & Product Picker side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Area 2: Ordered Items */}
            <Card className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-xs overflow-hidden">
              <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    {t("অর্ডারকৃত পণ্য", "Ordered Items")}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted border border-border/70 text-muted-foreground font-mono">
                    {items.length} {t("আইটেম", "items")} · {items.reduce((s, i) => s + i.quantity, 0)} {t("পিস", "pcs")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-auto max-h-[420px] overflow-auto">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center mb-2.5">
                        <Package className="w-6 h-6 opacity-40 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">{t("কোনো পণ্য যোগ হয়নি", "No products added")}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{t("ডানপাশের তালিকা থেকে পণ্য যোগ করুন", "Add products from the right list")}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {items.map((item) => (
                        <div key={item.product_id} className="flex items-center gap-3 p-3.5 hover:bg-muted/30 transition-colors group">
                          {item.product_image ? (
                            <img src={item.product_image} alt="" className="w-14 h-14 rounded-xl border border-border/80 object-cover flex-shrink-0 cursor-pointer shadow-2xs hover:scale-105 transition-transform" onDoubleClick={() => setProductDetailId(item.product_id)} />
                          ) : (
                            <div className="w-14 h-14 rounded-xl border border-border/80 bg-muted flex items-center justify-center flex-shrink-0 cursor-pointer shadow-2xs" onDoubleClick={() => setProductDetailId(item.product_id)}>
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 mr-auto">
                            <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{item.product_name}</p>
                            {editingPriceId === item.product_id ? (
                              <Input
                                type="number"
                                autoFocus
                                className="h-6 w-20 text-xs px-1.5 py-0 border-primary rounded-md mt-1"
                                value={editingPriceValue}
                                onChange={(e) => setEditingPriceValue(e.target.value)}
                                onBlur={() => {
                                  const val = parseFloat(editingPriceValue);
                                  if (!isNaN(val) && val > 0) {
                                    setItems(items.map(i => i.product_id === item.product_id ? { ...i, unit_price: val } : i));
                                  }
                                  setEditingPriceId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                  if (e.key === "Escape") setEditingPriceId(null);
                                }}
                              />
                            ) : (
                              <p
                                className="text-xs font-mono text-muted-foreground cursor-pointer hover:text-primary hover:underline transition-colors mt-0.5"
                                onDoubleClick={() => {
                                  setEditingPriceId(item.product_id);
                                  setEditingPriceValue(String(item.unit_price));
                                }}
                                title={t("ডাবল ক্লিক করে দাম পরিবর্তন করুন", "Double-click to edit price")}
                              >
                                ৳{item.unit_price}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center bg-muted/70 rounded-xl border border-border/70 p-0.5 shadow-2xs">
                            <button
                              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors"
                              onClick={() => updateItemQty(item.product_id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold font-mono w-7 text-center select-none">{item.quantity}</span>
                            <button
                              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-primary/15 hover:text-primary text-muted-foreground transition-colors"
                              onClick={() => updateItemQty(item.product_id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-bold font-mono text-primary w-14 text-right tabular-nums">৳{item.unit_price * item.quantity}</span>
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => removeItem(item.product_id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Area 3: Product Picker */}
            <Card className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-xs overflow-hidden">
              <CardHeader className="py-2.5 px-4 bg-muted/20 border-b border-border/60">
                <div className="flex items-center gap-2">
                  {/* Search - expands when active, icon when collapsed */}
                  {pickerMode === "search" ? (
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder={t("পণ্য খুঁজুন...", "Search products...")}
                        className="pl-9 h-9 text-xs rounded-xl bg-background border-border/80 focus:border-primary shadow-2xs"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => { setPickerMode("search"); setSelectedCategory(null); setSelectedTag(null); }}
                      className="h-9 w-9 rounded-xl border border-border/80 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted shadow-2xs transition-all flex-shrink-0"
                      title={t("সার্চ", "Search")}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}

                  {/* Category - dropdown when active, icon when collapsed */}
                  {pickerMode === "category" ? (
                    <Select open={catDropdownOpen} onOpenChange={setCatDropdownOpen} value={selectedCategory || ""} onValueChange={(v) => { setSelectedCategory(v || null); setCatDropdownOpen(false); }}>
                      <SelectTrigger className="h-9 text-xs flex-1 rounded-xl bg-background border-border/80 shadow-2xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />
                          <SelectValue placeholder={t("ক্যাটাগরি বাছুন", "Select category")} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-border/80">
                        {pickerCategories?.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-xs rounded-lg">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <button
                      onClick={() => { setPickerMode("category"); setProductSearch(""); setSelectedTag(null); setTagDropdownOpen(false); setTimeout(() => setCatDropdownOpen(true), 100); }}
                      className="h-9 w-9 rounded-xl border border-border/80 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted shadow-2xs transition-all flex-shrink-0"
                      title={t("ক্যাটাগরি", "Category")}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  )}

                  {/* Tag - dropdown when active, icon when collapsed */}
                  {pickerMode === "tag" ? (
                    <Select open={tagDropdownOpen} onOpenChange={setTagDropdownOpen} value={selectedTag || ""} onValueChange={(v) => { setSelectedTag(v || null); setTagDropdownOpen(false); }}>
                      <SelectTrigger className="h-9 text-xs flex-1 rounded-xl bg-background border-border/80 shadow-2xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <SelectValue placeholder={t("ট্যাগ বাছুন", "Select tag")} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-border/80">
                        {pickerTags?.map((tag) => (
                          <SelectItem key={tag} value={tag} className="text-xs rounded-lg">{tag}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <button
                      onClick={() => { setPickerMode("tag"); setProductSearch(""); setSelectedCategory(null); setCatDropdownOpen(false); setTimeout(() => setTagDropdownOpen(true), 100); }}
                      className="h-9 w-9 rounded-xl border border-border/80 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted shadow-2xs transition-all flex-shrink-0"
                      title={t("ট্যাগ", "Tag")}
                    >
                      <TagIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[420px]">
                  <div className="divide-y divide-border/60">
                    {products?.map((product) => {
                      const price = product.offer_price || product.regular_price;
                      const inOrder = items.some((i) => i.product_id === product.id);
                      const orderQty = items.find((i) => i.product_id === product.id)?.quantity || 0;
                      return (
                        <div
                          key={product.id}
                          className={`flex items-center gap-2.5 p-3 cursor-pointer hover:bg-muted/40 transition-colors ${inOrder ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                          onClick={() => addProduct(product)}
                        >
                          {product.product_image ? (
                            <img src={product.product_image} alt="" className="w-12 h-12 rounded-xl border border-border/70 object-cover flex-shrink-0 shadow-2xs" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl border border-border/70 bg-muted flex items-center justify-center flex-shrink-0 shadow-2xs">
                              <Package className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground line-clamp-1">{product.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              <span className="font-mono font-semibold text-primary">৳{price}</span>
                              <span className="mx-1.5 opacity-40">·</span>
                              <span className={product.stock > 0 ? "text-muted-foreground" : "text-destructive font-medium"}>
                                {product.stock} in stock
                              </span>
                            </p>
                          </div>
                          {inOrder ? (
                            <span className="text-[10px] font-bold font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full flex-shrink-0 shadow-2xs">
                              ✓ {orderQty}
                            </span>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-primary hover:bg-primary/10 hover:text-primary flex-shrink-0">
                              <Plus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Bottom bar: Pricing + Actions - Sticky */}
          <Card className="sticky bottom-3 z-30 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl ring-1 ring-black/5 dark:ring-white/5 transition-all">
            <CardContent className="p-3.5 space-y-3">
              {/* Pricing Summary */}
              <div className="grid grid-cols-5 divide-x divide-border/60 bg-muted/30 rounded-xl border border-border/60 p-1 text-center">
                <PricingRow label={t("সাবটোটাল", "Subtotal")} value={subtotal} />
                <PricingRow
                  label={t("ডিসকাউন্ট", "Discount")}
                  value={discount}
                  negative
                  fieldKey="discount"
                  editingField={editingField}
                  editingFieldValue={editingFieldValue}
                  setEditingField={setEditingField}
                  setEditingFieldValue={setEditingFieldValue}
                  onSave={(val) => setDiscount(val)}
                />
                <PricingRow
                  label={t("অগ্রিম", "Advance")}
                  value={advance}
                  negative
                  fieldKey="advance"
                  editingField={editingField}
                  editingFieldValue={editingFieldValue}
                  setEditingField={setEditingField}
                  setEditingFieldValue={setEditingFieldValue}
                  onSave={(val) => setAdvance(val)}
                />
                <PricingRow
                  label={t("ডেলিভারি", "Delivery")}
                  value={deliveryCharge}
                  fieldKey="delivery"
                  editingField={editingField}
                  editingFieldValue={editingFieldValue}
                  setEditingField={setEditingField}
                  setEditingFieldValue={setEditingFieldValue}
                  onSave={(val) => setDeliveryChargeOverride(val)}
                />
                <div className="flex flex-col items-center justify-center py-1.5 px-2 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary leading-none">{t("মোট", "Total")}</span>
                  <span className="text-xl font-black font-mono text-primary mt-1 tabular-nums">৳{totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <Select value={status} onValueChange={(val) => {
                  if (val === "pre") {
                    setStatus("pre");
                    setPreDateValue("");
                    return;
                  }
                  setStatus(val);
                }}>
                  <SelectTrigger className={`w-14 h-11 text-xs font-semibold border-2 rounded-xl shadow-2xs ${statusInfo.color} [&>span]:hidden hover:opacity-90 transition-all`}>
                    <StatusIcon className="w-5 h-5" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-border/80">
                    {activeStatusOptions.map((s) => {
                      const SIcon = s.icon;
                      return (
                        <SelectItem key={s.value} value={s.value} className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <SIcon className="w-3.5 h-3.5" />
                            {t(s.labelBn, s.label)}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {status === "pre" ? (
                  <div className="flex items-center h-11 rounded-xl border-2 overflow-hidden shadow-2xs bg-violet-100 border-violet-200 dark:bg-violet-950/40 dark:border-violet-800">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="h-full px-4 flex items-center gap-2 text-sm font-semibold text-violet-800 dark:text-violet-300 hover:bg-violet-200/70 dark:hover:bg-violet-900/50 transition-colors border-r border-violet-300 dark:border-violet-700">
                          <CalendarClock className="w-4 h-4" />
                          {preDateValue
                            ? format(new Date(preDateValue + "T00:00:00"), "d MMMM")
                            : t("তারিখ", "Date")}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl" align="center">
                        <Calendar
                          mode="single"
                          selected={preDateValue ? new Date(preDateValue + "T00:00:00") : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setPreDateValue(format(date, "yyyy-MM-dd"));
                            }
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <button
                      className="h-full px-6 flex items-center gap-2 text-sm font-bold text-violet-800 dark:text-violet-300 hover:bg-violet-200/70 dark:hover:bg-violet-900/50 transition-colors"
                      disabled={saving}
                      onClick={async () => {
                        if (!preDateValue) {
                          toast.error(t("আগে তারিখ সিলেক্ট করুন", "Please select a date first"));
                          return;
                        }
                        if (!isNew && order) {
                          const url = API_URL;
                          await fetch(`${url}/orders/update.php`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: order.id, pre_date: preDateValue }),
                          }).catch(console.error);
                        }
                        handleSave("pre", true);
                      }}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-5 h-5" />}
                      Pre
                    </button>
                  </div>
                ) : (
                  <Button
                    className={`h-11 w-56 text-sm font-bold gap-2 rounded-xl border-2 shadow-2xs ${statusInfo.color} hover:opacity-90 hover:shadow-md transition-all`}
                    variant="outline"
                    disabled={saving}
                    onClick={() => handleSave(status, true)}
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <StatusIcon className="w-5 h-5" />}
                    {t(statusInfo.labelBn, statusInfo.label)}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl border-2 border-border/80 shadow-2xs hover:bg-muted hover:border-primary/50 flex-shrink-0 transition-all"
                  disabled={saving}
                  onClick={() => handleSave()}
                  title={t("সেভ", "Save")}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-primary" />}
                </Button>

                <CourierEntrySettingsPopover order={order} />

                {/* Delete button - available for all orders */}
                {!isNew && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-11 w-11 rounded-xl border-2 border-destructive/80 shadow-2xs hover:shadow-xs flex-shrink-0 transition-all"
                    disabled={saving}
                    onClick={() => setDeleteDialogOpen(true)}
                    title={t("ডিলিট", "Delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Area 6: Fraud Check + Customer Profile Sidebar */}
        <div className="space-y-3.5">
          {/* Steadfast Direct Delivery Risk Card */}
          {cleanPhone.length >= 11 && (
            <Card className="rounded-2xl border border-emerald-500/30 bg-card/90 backdrop-blur-sm shadow-xs overflow-hidden h-fit">
              <CardContent className="pt-3.5 pb-3 px-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                      <Truck className="w-3 h-3" />
                    </div>
                    {t("Steadfast ফ্রড চেক", "Steadfast Risk Check")}
                  </span>
                  <button
                    onClick={handleSteadfastForceRefresh}
                    disabled={steadfastRefreshing}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    title={t("Steadfast রিচেক", "Recheck Steadfast")}
                  >
                    <RotateCcw className={cn("w-3.5 h-3.5", steadfastRefreshing && "animate-spin")} />
                  </button>
                </div>
                {steadfastLoading && !steadfastData && (
                  <div className="flex items-center justify-center py-4 bg-muted/20 rounded-xl border border-border/40">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-xs text-muted-foreground ml-2 font-medium">{t("Steadfast চেক হচ্ছে...", "Checking Steadfast...")}</span>
                  </div>
                )}
                {steadfastData && <SteadfastResultCard data={steadfastData} compact highlighted />}
                {!steadfastLoading && !steadfastData && (
                  <div className="text-center py-3 bg-muted/20 rounded-xl border border-border/40">
                    <p className="text-xs text-muted-foreground">{t("Steadfast ডেটা নেই বা আনকনফিগারড", "No Steadfast data")}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSteadfastForceRefresh}
                      disabled={steadfastRefreshing}
                      className="mt-2 h-7 text-xs rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      {t("Steadfast চেক করুন", "Check Steadfast")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* E-COMAH Multi-Courier Fraud Check Card (Inactive per user request) */}
          {/* To reactivate later: change 'false' below to 'cleanPhone.length >= 11' */}
          {false && cleanPhone.length >= 11 && (
            <Card className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-xs overflow-hidden h-fit">
              <CardContent className="pt-3.5 pb-3 px-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Shield className="w-3 h-3" />
                    </div>
                    {t("E-COMAH ফ্রড চেক", "E-COMAH Fraud Check")}
                  </span>
                  <button
                    onClick={handleFraudForceRefresh}
                    disabled={fraudRefreshing}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    title={t("রিচেক করুন", "Recheck")}
                  >
                    <RotateCcw className={cn("w-3.5 h-3.5", fraudRefreshing && "animate-spin")} />
                  </button>
                </div>
                {fraudLoading && !fraudData && (
                  <div className="flex items-center justify-center py-4 bg-muted/20 rounded-xl border border-border/40">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground ml-2 font-medium">{t("ফ্রড চেক হচ্ছে...", "Checking fraud...")}</span>
                  </div>
                )}
                {fraudData && <FraudResultCard data={fraudData} compact />}
                {!fraudLoading && !fraudData && (
                  <div className="text-center py-3.5 bg-muted/20 rounded-xl border border-border/40">
                    <p className="text-xs text-muted-foreground">{t("কোনো ফ্রড ডাটা পাওয়া যায়নি", "No fraud data found")}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFraudForceRefresh}
                      disabled={fraudRefreshing}
                      className="mt-2 h-7 text-xs rounded-lg"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      {t("চেক করুন", "Check Now")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Phone Order History */}
          {phoneOrders && phoneOrders.length > 0 && (
            <Card className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-xs overflow-hidden h-fit">
              <CardHeader className="py-2.5 px-3.5 bg-muted/20 border-b border-border/60">
                <CardTitle className="text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <ShoppingBag className="w-3 h-3" />
                    </div>
                    {t("অর্ডার হিস্ট্রি", "Order History")}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-md font-mono">{phoneOrders.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 space-y-1.5">
                {phoneOrders.slice(0, showAllPhoneOrders ? undefined : 3).map((o: any) => {
                  const si = getStatusInfo(o.status);
                  return (
                    <div
                      key={o.id}
                      className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 border cursor-pointer transition-all ${o.order_id === id ? "border-primary bg-primary/10 shadow-2xs ring-1 ring-primary/20" : "border-border/60 hover:border-primary/40 hover:bg-muted/40"}`}
                      onClick={() => navigate(`/admin/orders/edit/${o.order_id}`)}
                    >
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-mono font-bold text-foreground">{o.order_id}</span>
                        <Badge className={`text-[9px] px-1.5 py-0 rounded ${si.color}`}>{si.labelBn || si.label}</Badge>
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        ৳{o.total_amount} · {format(new Date(o.created_at), "dd/MM")}
                      </div>
                    </div>
                  );
                })}
                {phoneOrders.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllPhoneOrders(!showAllPhoneOrders)}
                    className="w-full flex items-center justify-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 py-1 transition-colors"
                  >
                    {showAllPhoneOrders ? t("কম দেখুন", "Show less") : t(`আরও ${phoneOrders.length - 3}টি দেখুন`, `Show ${phoneOrders.length - 3} more`)}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllPhoneOrders ? "rotate-180" : ""}`} />
                  </button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Creator Badge */}
          {!isNew && (order as any)?.created_by_admin_id && (
            <Card className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-xs overflow-hidden h-fit">
              <CardContent className="py-2.5 px-3.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <Shield className="w-3 h-3" />
                  </div>
                  <span className="text-muted-foreground">
                    Created by <span className="font-semibold text-foreground">{creatorAdmin?.name || "Admin"}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Duplicate Order Warning */}
          {duplicateWarnings && duplicateWarnings.length > 0 && (
            <Card className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 backdrop-blur-sm shadow-xs overflow-hidden h-fit">
              <CardHeader className="py-2.5 px-3.5 border-b border-amber-200 dark:border-amber-900/60">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {t("⚠️ ডুপ্লিকেট অর্ডার সতর্কতা", "⚠️ Duplicate Order Warning")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2.5">
                {duplicateWarnings.map((warning: any, wi: number) => (
                  <div key={wi}>
                    <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 mb-1.5">
                      {warning.type === "phone"
                        ? t("একই ফোন নম্বর থেকে ৪৮ ঘণ্টায়:", "Same phone in 48h:")
                        : t("একই ডিভাইস থেকে ৪৮ ঘণ্টায়:", "Same device in 48h:")}
                    </p>
                    {warning.orders.map((o: any) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between bg-card/90 rounded-xl px-2.5 py-1.5 mb-1 border border-amber-200/80 dark:border-amber-800/80 cursor-pointer hover:border-amber-400 shadow-2xs transition-all"
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                      >
                        <div className="text-[10px]">
                          <span className="font-mono font-bold text-amber-900 dark:text-amber-300">{o.order_id}</span>
                          <span className="text-muted-foreground ml-1.5">{o.customer_name}</span>
                          {warning.type === "device" && o.phone && (
                            <span className="text-muted-foreground ml-1">({o.phone})</span>
                          )}
                        </div>
                        <div className="text-[9px] font-mono text-muted-foreground">
                          {format(new Date(o.created_at), "dd/MM HH:mm")}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Visitor/Device Data Card - Always show when order exists */}
          {!isNew && (
            <Card className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-xs overflow-hidden h-fit">
              <CardHeader className="py-2.5 px-3.5 bg-muted/20 border-b border-border/60">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <Monitor className="w-3 h-3" />
                  </div>
                  {t("ডিভাইস ও ভিজিটর তথ্য", "Device & Visitor Info")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {visitorData ? (
                  <div className="space-y-2.5 text-xs">
                    {/* Traffic Source */}
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{t("সোর্স", "Source")}</span>
                      </div>
                      <SourceBadge source={(visitorData as any).traffic_source || (order as any)?.traffic_source} createdByAdminId={(order as any)?.created_by_admin_id} />
                    </div>
                    <div className="flex items-start gap-2">
                      <Fingerprint className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-muted-foreground">{t("ফিঙ্গারপ্রিন্ট", "Fingerprint")}</span>
                        <p className="font-mono text-[10px] font-medium break-all">{visitorData.fingerprint}</p>
                      </div>
                    </div>
                    {visitorData.ip_addresses && visitorData.ip_addresses.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-muted-foreground">{t("আইপি এড্রেস", "IP Addresses")}</span>
                          <div className="space-y-1 mt-0.5">
                            {visitorData.ip_addresses.map((ip: string, i: number) => (
                              <div key={i} className="flex items-center justify-between gap-1">
                                <span className="font-mono text-[10px] font-medium">{ip}</span>
                                {ipGeoData?.[ip] && (
                                  <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full flex-shrink-0">
                                    📍 {ipGeoData[ip]}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Device Type */}
                    {(visitorData as any).user_agent && (() => {
                      const ua = (visitorData as any).user_agent.toLowerCase();
                      let deviceType = "PC";
                      let DevIcon = Monitor;
                      if (/tablet|ipad|playbook|silk/i.test(ua)) {
                        deviceType = "ট্যাবলেট";
                      } else if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
                        deviceType = "ফোন";
                      }
                      // Parse browser
                      let browser = "";
                      if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
                      else if (ua.includes("firefox")) browser = "Firefox";
                      else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
                      else if (ua.includes("edg")) browser = "Edge";

                      return (
                        <div className="flex items-center gap-2">
                          <Monitor className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">{t("ডিভাইস", "Device")}</span>
                          <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 rounded-md">
                            {deviceType}{browser ? ` (${browser})` : ""}
                          </Badge>
                        </div>
                      );
                    })()}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-muted/40 rounded-xl p-2 text-center border border-border/50">
                        <p className="text-sm font-bold text-foreground font-mono">{visitorData.total_visit_count || 0}</p>
                        <p className="text-[9px] text-muted-foreground">{t("মোট ভিজিট", "Total Visits")}</p>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-2 text-center border border-border/50">
                        <p className="text-sm font-bold text-foreground font-mono">
                          {visitorData.total_active_time_seconds > 3600
                            ? `${Math.round(visitorData.total_active_time_seconds / 3600)}h`
                            : visitorData.total_active_time_seconds > 60
                            ? `${Math.round(visitorData.total_active_time_seconds / 60)}m`
                            : `${visitorData.total_active_time_seconds}s`}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{t("মোট সময়", "Active Time")}</p>
                      </div>
                    </div>
                    {(visitorData as any).avg_page_load_ms != null && (
                      <div className="flex items-center gap-2">
                        <Timer className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{t("গড় লোড টাইম", "Avg Load")}</span>
                        <span className="font-medium font-mono ml-auto">{((visitorData as any).avg_page_load_ms / 1000).toFixed(1)}s</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-muted-foreground">{t("প্রথম ভিজিট", "First Visit")}</span>
                      <span className="font-medium font-mono ml-auto">{format(new Date(visitorData.first_visit_at), 'dd/MM/yyyy')}</span>
                    </div>
                    {/* Ban/Unban Button */}
                    <div className="pt-2 border-t border-border">
                      <Button
                        variant={visitorData.access_allowed !== false ? "destructive" : "outline"}
                        size="sm"
                        className="w-full text-xs rounded-xl"
                        onClick={() => setBanConfirmVisitor({ id: visitorData.id, currentlyAllowed: visitorData.access_allowed !== false })}
                      >
                        {visitorData.access_allowed !== false ? (
                          <><Ban className="w-3.5 h-3.5 mr-1.5" />{t("ব্যান করুন", "Ban")}</>
                        ) : (
                          <><ShieldCheck className="w-3.5 h-3.5 mr-1.5" />{t("আনব্যান করুন", "Unban")}</>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                    <Monitor className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-[10px]">{t("ভিজিটর ডাটা পাওয়া যায়নি", "No visitor data found")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Customer Profile Card */}
          <Card className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-xs overflow-hidden h-fit">
            <CardHeader className="py-2.5 px-3.5 bg-muted/20 border-b border-border/60">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                {t("কাস্টমার প্রোফাইল", "Customer Profile")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5">
              {!phone || phone.length < 11 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <User className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-xs text-center">{t("ফোন নম্বর দিলে প্রোফাইল দেখা যাবে", "Enter phone to see profile")}</p>
                </div>
              ) : !customerProfile ? (
                <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                  <User className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-xs">{t("প্রোফাইল পাওয়া যায়নি", "No profile found")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Profile photo */}
                <div className="flex flex-col items-center">
                  {customerProfile.profile_picture ? (
                    <img src={customerProfile.profile_picture} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border shadow-2xs">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  {customerProfile.name && (
                    <p className="font-semibold text-sm mt-2">{customerProfile.name}</p>
                  )}
                  {customerProfile.user_type && (
                    <span className="text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full mt-1">
                      {customerProfile.user_type}
                    </span>
                  )}
                </div>

                {/* Quick stats */}
                {customerOrders && customerOrders.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted/40 border border-border/50 rounded-xl p-2 text-center">
                      <p className="text-lg font-bold font-mono text-foreground">{customerOrders.length}</p>
                      <p className="text-[10px] text-muted-foreground">{t("অর্ডার", "Orders")}</p>
                    </div>
                    <div className="bg-muted/40 border border-border/50 rounded-xl p-2 text-center">
                      <p className="text-lg font-bold font-mono text-primary">৳{customerOrders.reduce((s, o) => s + o.total_amount, 0)}</p>
                      <p className="text-[10px] text-muted-foreground">{t("মোট", "Total")}</p>
                    </div>
                    <div className="bg-muted/40 border border-border/50 rounded-xl p-2 text-center">
                      <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{customerOrders.filter(o => o.status === 'confirmed').length}</p>
                      <p className="text-[10px] text-muted-foreground">{t("কনফার্ম", "Confirmed")}</p>
                    </div>
                  </div>
                )}

                {/* Profile data */}
                <div className="space-y-2 text-xs divide-y divide-border/40 pt-1">
                  <ProfileRow label={t("ফোন", "Phone")} value={customerProfile.phone} />
                  {customerProfile.alt_phone && <ProfileRow label={t("বিকল্প", "Alt")} value={customerProfile.alt_phone} />}
                  {customerProfile.district && <ProfileRow label={t("জেলা", "District")} value={customerProfile.district} />}
                  {customerProfile.thana && <ProfileRow label={t("থানা", "Thana")} value={customerProfile.thana} />}
                  {customerProfile.address && <ProfileRow label={t("ঠিকানা", "Address")} value={customerProfile.address} />}
                  {customerProfile.gender && <ProfileRow label={t("লিঙ্গ", "Gender")} value={customerProfile.gender} />}
                </div>

                {/* Recent orders */}
                {customerOrders && customerOrders.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold mb-2 text-muted-foreground">{t("সাম্প্রতিক অর্ডার", "Recent Orders")}</p>
                    <div className="space-y-1.5">
                      {customerOrders.slice(0, 5).map((o) => {
                        const si = getStatusInfo(o.status);
                        const SIcon = si.icon;
                        const isLocked = ['delivered', 'rtn_received', 'partial_delivered'].includes(o.status);
                        const isCurrent = o.order_id === id;
                        return (
                          <div
                            key={o.id}
                            className={`flex items-center gap-2 p-2 rounded-xl text-[11px] transition-all ${isCurrent ? 'bg-primary/10 border border-primary/30 shadow-2xs' : 'bg-muted/30 border border-border/50'} ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/60 hover:border-primary/40'}`}
                            onClick={() => {
                              if (isCurrent || isLocked) return;
                              navigate(`/admin/orders/edit/${o.order_id}`);
                            }}
                            title={isLocked ? t('এই অর্ডার এডিট করা যাবে না', 'This order cannot be edited') : ''}
                          >
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${si.color}`}>
                              <SIcon className="w-3 h-3" />
                            </span>
                            <span className="font-mono font-bold text-foreground">{o.order_id}</span>
                            <span className="text-muted-foreground font-mono ml-auto">৳{o.total_amount}</span>
                            <span className="text-muted-foreground text-[10px] font-mono">{format(new Date(o.created_at), 'dd/MM')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
      {/* Product Detail Popup */}
      <Dialog open={!!productDetailId} onOpenChange={(open) => { if (!open) setProductDetailId(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{productDetail?.name || t("পণ্যের বিবরণ", "Product Details")}</DialogTitle>
            <DialogDescription className="sr-only">Product detail popup</DialogDescription>
          </DialogHeader>
          {productDetailLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : productDetail ? (
            <div className="space-y-4">
              {/* Image */}
              {productDetail.product_image && (
                <img src={productDetail.product_image} alt={productDetail.name} className="w-full max-h-60 object-contain rounded-lg border border-border bg-muted" />
              )}

              {/* Name & Short Description */}
              <div>
                <h3 className="font-semibold text-foreground">{productDetail.name}</h3>
                {productDetail.short_description && (
                  <p className="text-sm text-muted-foreground mt-1">{productDetail.short_description}</p>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{t("স্টক", "Stock")}:</span>
                <span className={`text-sm font-bold ${productDetail.stock > 0 ? "text-green-600" : "text-destructive"}`}>
                  {productDetail.stock}
                </span>
              </div>

              {/* All Prices */}
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("মূল্য তালিকা", "Price List")}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <span className="text-muted-foreground">{t("রেগুলার", "Regular")}</span>
                  <span className="font-medium text-right">৳{productDetail.regular_price}</span>

                  {productDetail.offer_price != null && (
                    <>
                      <span className="text-muted-foreground">{t("অফার", "Offer")}</span>
                      <span className="font-medium text-right text-primary">৳{productDetail.offer_price}</span>
                    </>
                  )}
                  {productDetail.buying_price != null && (
                    <>
                      <span className="text-muted-foreground">{t("ক্রয়মূল্য", "Buying")}</span>
                      <span className="font-medium text-right">৳{productDetail.buying_price}</span>
                    </>
                  )}
                  {productDetail.nursery_price != null && (
                    <>
                      <span className="text-muted-foreground">{t("নার্সারি", "Nursery")}</span>
                      <span className="font-medium text-right">৳{productDetail.nursery_price}</span>
                    </>
                  )}
                  {(productDetail.paikari_minimum != null || productDetail.paikari_maximum != null) && (
                    <>
                      <span className="text-muted-foreground">{t("পাইকারি", "Wholesale")}</span>
                      <span className="font-medium text-right">
                        ৳{productDetail.paikari_minimum ?? "–"} – ৳{productDetail.paikari_maximum ?? "–"}
                      </span>
                    </>
                  )}
                  {productDetail.cash_back > 0 && (
                    <>
                      <span className="text-muted-foreground">{t("ক্যাশব্যাক", "Cashback")}</span>
                      <span className="font-medium text-right">৳{productDetail.cash_back}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Full Description */}
              {productDetail.full_description && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("বিবরণ", "Description")}</h4>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{productDetail.full_description}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={!!banConfirmVisitor} onOpenChange={() => setBanConfirmVisitor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {banConfirmVisitor?.currentlyAllowed ? <Ban className="w-5 h-5 text-destructive" /> : <ShieldCheck className="w-5 h-5 text-green-600" />}
              {banConfirmVisitor?.currentlyAllowed ? t("ব্যান নিশ্চিত করুন", "Confirm Ban") : t("আনব্যান নিশ্চিত করুন", "Confirm Unban")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banConfirmVisitor?.currentlyAllowed
                ? t("এই ইউজারকে ব্যান করলে সে আর সাইটে প্রবেশ বা অর্ডার করতে পারবে না। আপনি কি নিশ্চিত?", "Banning this user will block site access and ordering. Are you sure?")
                : t("আনব্যান করলে এই ইউজার আবার সাইটে প্রবেশ ও অর্ডার করতে পারবে।", "Unbanning will restore site access and ordering.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={banConfirmVisitor?.currentlyAllowed ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={async () => {
                if (!banConfirmVisitor) return;
                const newVal = !banConfirmVisitor.currentlyAllowed;
                const { error } = await supabase.from("visitors").update({ access_allowed: newVal }).eq("id", banConfirmVisitor.id);
                if (error) { toast.error(error.message); return; }
                toast.success(newVal ? t("আনব্যান করা হয়েছে", "Unbanned") : t("ব্যান করা হয়েছে", "Banned"));
                queryClient.invalidateQueries({ queryKey: ["order"] });
                setBanConfirmVisitor(null);
              }}
            >
              {banConfirmVisitor?.currentlyAllowed ? t("ব্যান করুন", "Ban") : t("আনব্যান করুন", "Unban")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Order Dialog: soft-delete (trash) or permanent delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(o) => { setDeleteDialogOpen(o); if (!o) setHardDeleteConfirm(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {hardDeleteConfirm
                ? t("স্থায়ীভাবে মুছবেন?", "Permanently delete?")
                : t("অর্ডার ডিলিট করবেন?", "Delete this order?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hardDeleteConfirm
                ? t("এই অর্ডার ও এর সব আইটেম ডাটাবেস থেকে চিরতরে মুছে যাবে। এটি আর ফিরিয়ে আনা যাবে না।",
                    "This order and all its items will be erased forever from the database. This cannot be undone.")
                : t("ট্র্যাশে পাঠালে পরে রিস্টোর করা যাবে। স্থায়ীভাবে মুছলে আর ফেরত আনা যাবে না।",
                    "Move to Trash to restore later, or Delete Permanently to erase forever.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            {!hardDeleteConfirm && (
              <>
                <Button
                  variant="outline"
                  disabled={saving}
                  onClick={async () => {
                    if (!order?.id) return;
                    setSaving(true);
                    try {
                      const url = API_URL;
                      const res = await fetch(`${url}/orders/delete.php`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: order.id, permanent: false }),
                      });
                      const data = await res.json();
                      if (!res.ok || data.error) throw new Error(data.error || "Delete failed");
                      toast.success(t("ট্র্যাশে পাঠানো হয়েছে", "Moved to Trash"));
                      queryClient.invalidateQueries({ queryKey: ["web-orders"] });
                      queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
                      queryClient.invalidateQueries({ queryKey: ["deleted-orders"] });
                      setDeleteDialogOpen(false);
                      navigate(-1);
                    } catch (err: any) {
                      toast.error(err.message);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {t("ট্র্যাশে পাঠান", "Move to Trash")}
                </Button>
                <Button
                  variant="destructive"
                  disabled={saving}
                  onClick={() => setHardDeleteConfirm(true)}
                >
                  {t("স্থায়ীভাবে মুছুন", "Delete Permanently")}
                </Button>
              </>
            )}
            {hardDeleteConfirm && (
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={saving}
                onClick={async () => {
                  if (!order?.id) return;
                  setSaving(true);
                  try {
                    const url = API_URL;
                    const res = await fetch(`${url}/orders/delete.php`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: order.id, permanent: true }),
                    });
                    const data = await res.json();
                    if (!res.ok || data.error) throw new Error(data.error || "Delete failed");
                    toast.success(t("স্থায়ীভাবে মুছে ফেলা হয়েছে", "Permanently deleted"));
                    queryClient.invalidateQueries({ queryKey: ["web-orders"] });
                    queryClient.invalidateQueries({ queryKey: ["confirmed-orders"] });
                    queryClient.invalidateQueries({ queryKey: ["deleted-orders"] });
                    setDeleteDialogOpen(false);
                    navigate(-1);
                  } catch (err: any) {
                    toast.error(err.message);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {t("হ্যাঁ, চিরতরে মুছুন", "Yes, Erase Forever")}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[150px] truncate">{value}</span>
    </div>
  );
}

function PricingRow({
  label,
  value,
  negative,
  fieldKey,
  editingField,
  editingFieldValue,
  setEditingField,
  setEditingFieldValue,
  onSave,
}: {
  label: string;
  value: number;
  negative?: boolean;
  fieldKey?: string;
  editingField?: string | null;
  editingFieldValue?: string;
  setEditingField?: (f: string | null) => void;
  setEditingFieldValue?: (v: string) => void;
  onSave?: (val: number) => void;
}) {
  const isEditing = fieldKey && editingField === fieldKey;
  const editable = !!fieldKey && !!onSave;

  return (
    <div className="flex flex-col items-center justify-center py-1.5 px-2 group/price">
      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground leading-none">{label}</span>
      {isEditing ? (
        <input
          type="number"
          autoFocus
          className="w-18 h-7 text-center text-sm font-bold font-mono border-2 border-primary rounded-lg bg-background shadow-2xs outline-none mt-1"
          value={editingFieldValue}
          onChange={(e) => setEditingFieldValue?.(e.target.value)}
          onFocus={(e) => {
            if (e.target.value === "0") {
              setEditingFieldValue?.("");
            }
          }}
          onBlur={() => {
            const raw = editingFieldValue?.trim();
            const val = parseFloat(raw || "0");
            onSave?.(isNaN(val) ? 0 : val);
            setEditingField?.(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setEditingField?.(null);
          }}
        />
      ) : (
        <span
          className={`text-sm sm:text-base font-bold font-mono mt-1 tabular-nums transition-colors ${editable ? "cursor-pointer group-hover/price:text-primary group-hover/price:underline" : ""} ${negative && value > 0 ? "text-destructive" : "text-foreground"}`}
          onDoubleClick={() => {
            if (editable) {
              setEditingField?.(fieldKey!);
              setEditingFieldValue?.(String(value));
            }
          }}
          title={editable ? "Double-click to edit" : undefined}
        >
          {negative && value > 0 ? `-৳${value}` : `৳${value}`}
        </span>
      )}
    </div>
  );
}
