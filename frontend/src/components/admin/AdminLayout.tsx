import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2, AlertTriangle, X, ShieldAlert, Plus, Search, List, Globe, CalendarClock, Package, Layers, Tag, BarChart3, Users, ShieldCheck, Settings, Palette, Languages, MousePointer2, MessageSquare, FileText, Image, ArrowDownUp, Bell, MessageCircle, Share2, DollarSign, ArrowRightLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CursorProvider } from "@/contexts/CursorContext";
import { CustomCursor } from "./CustomCursor";
import { WhatsNewPopup } from "./WhatsNewPopup";


import { useQuery } from "@tanstack/react-query";
import { useWebCounts } from "@/stores/orderCountsStore";
import { getCurrentAdminAccess } from "@/lib/adminAccess";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { savePageState, restoreScroll } from "@/lib/adminPageState";
import { useAuthReady } from "@/hooks/useAuthReady";
import { isLovablePreview } from "@/lib/previewMode";

const PREVIEW_BYPASS = isLovablePreview();

const SUPER_ADMIN_EMAIL = "admin@ssseedshop.com";
const WEB_ORDER_SOURCE_FILTER = "traffic_source.is.null,traffic_source.neq.ecomdrive";

// URL → permission key mapping (must match AdminSidebar)
const urlToPermission: Record<string, string> = {
  "/admin/overview": "overview",
  
  "/admin/products": "product-list",
  "/admin/categories": "categories",
  "/admin/product-tags": "product-tags",
  
  "/admin/orders/create": "orders-create",
  "/admin/orders/search": "orders-search",
  "/admin/orders/web": "orders-web",
  "/admin/orders/pre": "orders-pre",
  "/admin/orders/list": "orders-list",
  "/admin/orders/reports": "orders-reports",
  "/admin/orders/deleted": "orders-deleted",
  "/admin/users/admins": "users-admins",
  "/admin/users/customers": "users-customers",
  "/admin/website/api": "website-api",
  "/admin/website/media": "website-media",
  "/admin/website/import-export": "settings-import-export",
  
  
  "/admin/settings/theme": "settings-theme",
  "/admin/settings/language": "settings-language",
  "/admin/settings/cursor": "settings-cursor",
  "/admin/support/ai-inbox": "support-inbox",
  "/admin/notifications/orders": "notifications-orders",
};

// Route → page title/subtitle mapping
const routeTitles: Record<string, { bn: string; en: string; subBn?: string; subEn?: string }> = {
  "/admin/overview": { bn: "ওভারভিউ", en: "Overview", subBn: "আপনার ব্যবসার সারসংক্ষেপ", subEn: "Your business summary" },
  "/admin/my-activity": { bn: "আমার অ্যাক্টিভিটি", en: "My Activity" },
  
  "/admin/products": { bn: "পণ্য তালিকা", en: "Product List", subBn: "সকল পণ্য পরিচালনা করুন", subEn: "Manage all products" },
  "/admin/products/new": { bn: "নতুন পণ্য", en: "New Product" },
  "/admin/categories": { bn: "ক্যাটাগরি", en: "Categories" },
  "/admin/orders/create": { bn: "নতুন অর্ডার", en: "Create Order" },
  "/admin/orders/search": { bn: "অর্ডার সার্চ", en: "Order Search" },
  "/admin/orders/web": { bn: "অর্ডারসমূহ", en: "All Orders" },
  
  "/admin/orders/pre": { bn: "প্রি-অর্ডার", en: "Pre Orders", subBn: "প্রি-অর্ডার স্ট্যাটাসের সকল অর্ডার", subEn: "All orders with pre status" },
  "/admin/orders/list": { bn: "অর্ডার তালিকা", en: "Order List" },
  "/admin/orders/deleted": { bn: "মুছে ফেলা অর্ডার", en: "Deleted Orders" },
  "/admin/users/admins": { bn: "অ্যাডমিন তালিকা", en: "Admin List" },
  "/admin/users/customers": { bn: "কাস্টমার তালিকা", en: "Customer List" },
  "/admin/website/api": { bn: "API ম্যানেজমেন্ট", en: "API Management" },
  "/admin/website/media": { bn: "মিডিয়া", en: "Media Management" },
  "/admin/website/import-export": { bn: "ইমপোর্ট / এক্সপোর্ট", en: "Import / Export" },
  "/admin/website/ai-training": { bn: "AI ট্রেনিং", en: "AI Training" },
  "/admin/website/rag": { bn: "RAG ডকুমেন্ট", en: "RAG Documents" },
  "/admin/website/meta-go": { bn: "Meta Go", en: "Meta Go", subBn: "মেটা ইকোসিস্টেমের সব ফিচার", subEn: "All Meta ecosystem features" },
  "/admin/settings/theme": { bn: "থিম সেটিংস", en: "Theme Settings" },
  "/admin/settings/language": { bn: "ভাষা সেটিংস", en: "Language Settings" },
  "/admin/settings/cursor": { bn: "কার্সর সেটিংস", en: "Cursor Settings" },
  "/admin/support/ai-inbox": { bn: "ইনবক্স", en: "Inbox", subBn: "কাস্টমার চ্যাট সেশন", subEn: "Customer chat sessions" },
  "/admin/notifications/orders": { bn: "অর্ডার নোটিফিকেশন", en: "Order Notifications" },
  
  "/admin/help-support": { bn: "হেল্প ও সাপোর্ট", en: "Help & Support", subBn: "ডেভেলপার সহায়তা ও সাপোর্ট সেন্টার", subEn: "Developer Assistance & Support Center" },
  "/admin/support": { bn: "হেল্প ও সাপোর্ট", en: "Help & Support", subBn: "ডেভেলপার সহায়তা ও সাপোর্ট সেন্টার", subEn: "Developer Assistance & Support Center" },
  "/admin/help": { bn: "হেল্প ও সাপোর্ট", en: "Help & Support", subBn: "ডেভেলপার সহায়তা ও সাপোর্ট সেন্টার", subEn: "Developer Assistance & Support Center" },
  "/admin/whats-new": { bn: "হেল্প ও সাপোর্ট", en: "Help & Support", subBn: "ডেভেলপার সহায়তা ও সাপোর্ট সেন্টার", subEn: "Developer Assistance & Support Center" },
};

// My Activity is always accessible — no permission needed


function usePageCounts(pathname: string) {
  const liveWebCounts = useWebCounts();
  const { data: stats } = useQuery({
    queryKey: ["header-order-counts"],
    enabled: pathname === "/admin/orders/pre" || pathname === "/admin/orders/web",
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${apiUrl}/orders/stats.php`);
      return await res.json();
    },
    refetchInterval: 15000,
  });

  const pendingCount = liveWebCounts?.pending ?? stats?.data?.summary?.pending_orders ?? stats?.pending_orders;
  const preCount = stats?.data?.summary?.pre_orders ?? stats?.pre_orders;

  if (pathname === "/admin/orders/pre") return preCount !== undefined ? preCount : 0;
  if (pathname === "/admin/orders/web") return pendingCount !== undefined ? pendingCount : 0;
  return undefined;
}

// Section shortcut definitions
type Shortcut = { icon: React.ElementType; label: string; labelBn: string; to: string };

const sectionShortcuts: Record<string, Shortcut[]> = {
  orders: [
    { icon: Plus, label: "Create", labelBn: "নতুন", to: "/admin/orders/create" },
    { icon: Search, label: "Search", labelBn: "সার্চ", to: "/admin/orders/search" },
    { icon: Globe, label: "Web", labelBn: "ওয়েব", to: "/admin/orders/web" },
    { icon: CalendarClock, label: "Pre", labelBn: "প্রি", to: "/admin/orders/pre" },
    { icon: List, label: "List", labelBn: "লিস্ট", to: "/admin/orders/list" },
  ],
  products: [
    { icon: Plus, label: "New", labelBn: "নতুন", to: "/admin/products/new" },
    { icon: Package, label: "Products", labelBn: "পণ্য", to: "/admin/products" },
    { icon: List, label: "Categories", labelBn: "ক্যাটাগরি", to: "/admin/categories" },
  ],
  reports: [],
  users: [
    { icon: ShieldCheck, label: "Admins", labelBn: "অ্যাডমিন", to: "/admin/users/admins" },
    { icon: Users, label: "Customers", labelBn: "কাস্টমার", to: "/admin/users/customers" },
  ],
  website: [
    { icon: Settings, label: "API", labelBn: "API", to: "/admin/website/api" },
    { icon: Image, label: "Media", labelBn: "মিডিয়া", to: "/admin/website/media" },
    { icon: ArrowDownUp, label: "Import/Export", labelBn: "ইমপোর্ট", to: "/admin/website/import-export" },
    { icon: Share2, label: "Meta Go", labelBn: "Meta Go", to: "/admin/website/meta-go" },
  ],
  settings: [
    { icon: Palette, label: "Theme", labelBn: "থিম", to: "/admin/settings/theme" },
    { icon: Languages, label: "Language", labelBn: "ভাষা", to: "/admin/settings/language" },
    { icon: MousePointer2, label: "Cursor", labelBn: "কার্সর", to: "/admin/settings/cursor" },
  ],
  support: [],
  notifications: [
    { icon: Bell, label: "Orders", labelBn: "অর্ডার", to: "/admin/notifications/orders" },
  ],
  myActivity: [
    { icon: Search, label: "Search", labelBn: "সার্চ", to: "/admin/orders/search" },
    { icon: Plus, label: "Add Order", labelBn: "নতুন অর্ডার", to: "/admin/orders/create" },
    { icon: Globe, label: "All Orders", labelBn: "অর্ডারসমূহ", to: "/admin/orders/web" },
  ],
};

// Map routes to their section
function getShortcutsForPath(pathname: string): Shortcut[] {
  if (pathname.startsWith("/admin/orders/")) return sectionShortcuts.orders;
  if (pathname.startsWith("/admin/products") || pathname === "/admin/categories" || pathname === "/admin/product-tags") return sectionShortcuts.products;
  
  if (pathname.startsWith("/admin/users/")) return sectionShortcuts.users;
  if (pathname.startsWith("/admin/website/")) return sectionShortcuts.website;
  if (pathname.startsWith("/admin/settings/")) return sectionShortcuts.settings;
  if (pathname.startsWith("/admin/support/")) return sectionShortcuts.support;
  if (pathname.startsWith("/admin/notifications/")) return sectionShortcuts.notifications;
  if (pathname === "/admin/my-activity") return sectionShortcuts.myActivity;
  if (pathname === "/admin/overview") return sectionShortcuts.myActivity;
  return [];
}

function AdminHeader() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const count = usePageCounts(pathname);

  // Find matching route title (exact match first, then check for dynamic routes)
  let titleInfo = routeTitles[pathname];
  if (!titleInfo) {
    if (pathname.startsWith("/admin/orders/edit/")) {
      const orderId = pathname.split("/").pop();
      titleInfo = { bn: `অর্ডার এডিট`, en: `Edit Order`, subBn: `#${orderId}`, subEn: `#${orderId}` };
    } else if (pathname.startsWith("/admin/products/edit/")) {
      titleInfo = { bn: "পণ্য এডিট", en: "Edit Product" };
    }
  }

  const title = titleInfo ? t(titleInfo.bn, titleInfo.en) : t("অ্যাডমিন প্যানেল", "Admin Panel");
  const subtitle = titleInfo?.subBn ? t(titleInfo.subBn, titleInfo.subEn || "") : undefined;
  const shortcuts = getShortcutsForPath(pathname).filter((s) => s.to !== pathname);

  return (
    <header className="h-14 flex items-center gap-4 border-b border-border bg-background px-4 sticky top-0 z-20">
      <SidebarTrigger />
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="font-display text-lg font-semibold text-foreground truncate">{title}</h1>
        {(subtitle || count !== undefined) && (
          <p className="text-xs text-muted-foreground truncate hidden sm:block">
            {subtitle}{count !== undefined ? ` (${count})` : ""}
          </p>
        )}
        {/* Portal target for page-specific header actions */}
        <div id="admin-header-actions" className="flex items-center" />
      </div>
      {shortcuts.length > 0 && (
        <div className="ml-auto flex items-center gap-1.5">
          {shortcuts.map((s) => (
            <button
              key={s.to}
              onClick={() => navigate(s.to)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <s.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t(s.labelBn, s.label)}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function AccessDeniedRedirect() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/admin/my-activity", { replace: true });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isReady, session } = useAuthReady();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [authCheckError, setAuthCheckError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Activate global keyboard shortcuts
  useKeyboardShortcuts();

  // Save page state (filters, scroll) on route change & restore scroll on mount
  const prevPathRef = useRef<string>("");
  useEffect(() => {
    const currentFull = location.pathname + location.search;
    // Save previous page state before switching
    if (prevPathRef.current && prevPathRef.current !== currentFull) {
      const prevUrl = new URL(prevPathRef.current, window.location.origin);
      savePageState(prevUrl.pathname, prevUrl.search);
    }
    prevPathRef.current = currentFull;
    // Restore scroll for current page (Disabled temporarily to prevent shaking)
    // restoreScroll(location.pathname);
  }, [location.pathname, location.search]);

  const checkAdmin = useCallback(async () => {
    if (!isReady) return;

    setChecking(true);
    setAuthCheckError(null);

    const access = await getCurrentAdminAccess();

    if (access.status === "no-session") {
      setAuthorized(false);
      setChecking(false);
      navigate("/admin", { replace: true });
      return;
    }

    if (access.status === "error") {
      console.error("Admin access check failed:", access.message);
      setAuthorized(false);
      setChecking(false);
      setAuthCheckError("সেশন আছে, কিন্তু অ্যাডমিন ভেরিফিকেশন সাময়িকভাবে ব্যর্থ হয়েছে।");
      return;
    }

    if (access.status === "unauthorized") {
      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_dev_bypass");
      navigate("/admin", { replace: true });
      return;
    }

    setIsSuperAdmin(access.isSuperAdmin);
    setUserRole(access.role);
    setUserPermissions(access.permissions);
    setAuthorized(true);
    setChecking(false);
  }, [isReady, navigate]);

  useEffect(() => {
    if (!isReady) return;
    void checkAdmin();
  }, [checkAdmin, isReady]);

  // Route-level permission check
  const isRouteAllowed = () => {
    if (!authorized) return true; // Still loading
    if (PREVIEW_BYPASS) return true; // Preview: all menus public
    if (isSuperAdmin || userRole === "admin" || userPermissions.includes("*") || (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))) return true; // Admins and local dev see everything

    const currentPath = location.pathname;
    
    // Check exact match first
    const permKey = urlToPermission[currentPath];
    if (permKey) {
      return userPermissions.includes(permKey);
    }

    // Check if it's a sub-route of an allowed path (e.g. /admin/orders/edit/123)
    for (const [url, key] of Object.entries(urlToPermission)) {
      if (currentPath.startsWith(url + "/") && userPermissions.includes(key)) {
        return true;
      }
    }

    // Product form routes like /admin/products/new or /admin/products/edit/:id
    if (currentPath.startsWith("/admin/products/")) {
      return userPermissions.includes("product-list");
    }

    // Order edit routes
    if (currentPath.startsWith("/admin/orders/edit/")) {
      return userPermissions.includes("orders-list") || userPermissions.includes("orders-web");
    }

    // If route not in the map, DENY for moderators (security-first approach)
    // Only /admin/my-activity is implicitly allowed (no permKey needed)
    if (!permKey) {
      if (
        currentPath === "/admin/my-activity" ||
        currentPath === "/admin/help-support" ||
        currentPath === "/admin/help" ||
        currentPath === "/admin/support" ||
        currentPath === "/admin/whats-new"
      ) return true;
      return false;
    }

    return false;
  };

  if (!isReady || (checking && !authorized && !!session)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (authCheckError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <div className="max-w-md rounded-2xl border bg-background p-6 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">অটো লগআউট bug fix করা হয়েছে</h2>
          <p className="mt-2 text-sm text-muted-foreground">{authCheckError}</p>
          <button
            type="button"
            onClick={() => void checkAdmin()}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  const routeAllowed = isRouteAllowed();

  return (
    <CursorProvider>
    <SidebarProvider>
      <CustomCursor />
      <WhatsNewPopup />
      <div className="admin-layout min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Suspense fallback={<div className="flex items-center justify-center h-full py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
              {routeAllowed ? <Outlet /> : <AccessDeniedRedirect />}
            </Suspense>
          </main>
          
          
        </div>
      </div>
    </SidebarProvider>
    </CursorProvider>
  );
}
