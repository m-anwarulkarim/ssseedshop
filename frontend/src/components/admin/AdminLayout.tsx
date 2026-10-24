import { API_URL } from "@/config/env";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminBottomNav } from "./AdminBottomNav";
import ssseedshopLogo from "@/assets/ssseedshop-logo.png";
import { Loader2, AlertTriangle, X, ShieldAlert, Plus, Search, List, Globe, CalendarClock, Package, Layers, Tag, BarChart3, Users, ShieldCheck, Settings, Palette, Languages, MousePointer2, MessageSquare, FileText, Image, ArrowDownUp, Bell, MessageCircle, Share2, DollarSign, ArrowRightLeft, Headphones, Activity, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CursorProvider } from "@/contexts/CursorContext";
import { CustomCursor } from "./CustomCursor";
import { WhatsNewPopup } from "./WhatsNewPopup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


import { useQuery } from "@tanstack/react-query";
import { useWebCounts } from "@/stores/orderCountsStore";
import { getCurrentAdminAccess, getActiveAdminUser } from "@/lib/adminAccess";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { savePageState, restoreScroll } from "@/lib/adminPageState";
import { useAuthReady } from "@/hooks/useAuthReady";
import { isLovablePreview } from "@/lib/previewMode";

const PREVIEW_BYPASS = isLovablePreview();

const SUPER_ADMIN_EMAIL = "ssseedshop220@gmail.com";
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
  
  
  "/admin/settings/language": "settings-language",
  "/admin/settings/cursor": "settings-cursor",
  "/admin/support/ai-inbox": "support-inbox",
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
  "/admin/settings/language": { bn: "ভাষা সেটিংস", en: "Language Settings" },
  "/admin/settings/cursor": { bn: "কার্সর সেটিংস", en: "Cursor Settings" },
  "/admin/support/ai-inbox": { bn: "ইনবক্স", en: "Inbox", subBn: "কাস্টমার চ্যাট সেশন", subEn: "Customer chat sessions" },
  
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
      const apiUrl = API_URL;
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
    { icon: Languages, label: "Language", labelBn: "ভাষা", to: "/admin/settings/language" },
    { icon: MousePointer2, label: "Cursor", labelBn: "কার্সর", to: "/admin/settings/cursor" },
  ],
  support: [],
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
  if (pathname === "/admin/my-activity") return sectionShortcuts.myActivity;
  if (pathname === "/admin/overview") return sectionShortcuts.myActivity;
  return [];
}

function AdminHeader() {
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const count = usePageCounts(pathname);

  const activeAdmin = getActiveAdminUser();
  const adminName = activeAdmin?.name || "Admin";
  const adminEmail = activeAdmin?.email || "ssseedshop220@gmail.com";
  const adminRole = activeAdmin?.is_super_admin
    ? "Super Admin"
    : activeAdmin?.role === "admin"
    ? "Admin"
    : "Moderator";
  const adminInitials =
    adminName
      .split(" ")
      .map((w: string) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SS";

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_dev_bypass");
    sessionStorage.removeItem("admin_session");
    sessionStorage.removeItem("admin_dev_bypass");
    navigate("/admin", { replace: true });
  };

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
    <header className="h-16 flex items-center justify-between gap-2 sm:gap-4 border-b border-border bg-background/95 backdrop-blur-md px-3 sm:px-4 sticky top-0 z-30">
      {/* Left: Sidebar trigger, Logo, and Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />
        <div
          onClick={() => navigate("/admin/overview")}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0 group"
          title="SS Seed Shop Dashboard"
        >
          <img
            src={ssseedshopLogo}
            alt="SS Seed Shop"
            className="h-8 sm:h-9 w-auto object-contain rounded transition-transform group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 hidden md:block">
          <h1 className="font-display text-sm sm:text-base font-semibold text-foreground truncate leading-tight">
            {title}
          </h1>
          {(subtitle || count !== undefined) && (
            <p className="text-[11px] text-muted-foreground truncate leading-tight">
              {subtitle}
              {count !== undefined ? ` (${count})` : ""}
            </p>
          )}
        </div>
        {/* Portal target for page-specific header actions */}
        <div id="admin-header-actions" className="flex items-center" />
      </div>

      {/* Middle: Section shortcuts on large screens */}
      {shortcuts.length > 0 && (
        <div className="hidden xl:flex items-center gap-1.5 ml-auto mr-2">
          {shortcuts.map((s) => (
            <button
              key={s.to}
              onClick={() => navigate(s.to)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <s.icon className="w-3.5 h-3.5" />
              <span>{t(s.labelBn, s.label)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right: Quick Action Controls matching mobile SaaS dashboard standard */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto xl:ml-0">
        <TooltipProvider delayDuration={200}>
          {/* 1. Support / Help (Purple rounded button with Headset icon matching user screenshot) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => navigate("/admin/help-support")}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white flex items-center justify-center transition-all shadow-sm shadow-purple-500/25 active:scale-95"
                aria-label="Support & Help"
              >
                <Headphones className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[2.2]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t("হেল্প ও সাপোর্ট", "Help & Support")}</p>
            </TooltipContent>
          </Tooltip>

          {/* 2. Live Website (Circular bordered button with Globe icon) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => window.open("/", "_blank")}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
                aria-label="Live Website"
              >
                <Globe className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t("ওয়েবসাইট দেখুন", "View Live Store")}</p>
            </TooltipContent>
          </Tooltip>

          {/* 3. Language Switcher (Circular bordered button with Languages icon & badge) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setLang(lang === "bn" ? "en" : "bn")}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shadow-2xs active:scale-95 relative"
                aria-label="Toggle Language"
              >
                <Languages className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />
                <span className="absolute -bottom-1 -right-0.5 px-1 py-0.2 bg-purple-600 text-white font-bold text-[8.5px] rounded-full leading-tight shadow-2xs">
                  {lang === "bn" ? "বাং" : "EN"}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{lang === "bn" ? "Switch to English" : "বাংলা ভাষায় পরিবর্তন করুন"}</p>
            </TooltipContent>
          </Tooltip>

          {/* 4. Search (Circular bordered button with Search icon) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => navigate("/admin/orders/search")}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
                aria-label="Order Search"
              >
                <Search className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t("অর্ডার সার্চ", "Order Search")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 5. User Profile Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-purple-500/30 hover:ring-purple-500 ring-offset-2 ring-offset-background transition-all shadow-xs cursor-pointer select-none active:scale-95"
              aria-label="Admin Profile Menu"
            >
              {adminInitials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 z-50">
            <div className="px-2.5 py-2 border-b border-border/80 mb-1">
              <p className="text-xs font-semibold text-foreground truncate">{adminName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{adminEmail}</p>
              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                {adminRole}
              </span>
            </div>
            <DropdownMenuItem onClick={() => navigate("/admin/my-activity")} className="cursor-pointer">
              <Activity className="w-4 h-4 mr-2 text-rose-500" />
              <span>{t("আমার অ্যাক্টিভিটি", "My Activity")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/admin/help-support")} className="cursor-pointer">
              <Headphones className="w-4 h-4 mr-2 text-purple-500" />
              <span>{t("হেল্প ও সাপোর্ট", "Help & Support")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open("/", "_blank")} className="cursor-pointer">
              <Globe className="w-4 h-4 mr-2 text-emerald-500" />
              <span>{t("লাইভ ওয়েবসাইট", "Live Website")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>{t("লগআউট", "Logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
          
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6">
            <Suspense fallback={<div className="flex items-center justify-center h-full py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
              {routeAllowed ? <Outlet /> : <AccessDeniedRedirect />}
            </Suspense>
          </main>
          
          <AdminBottomNav />
        </div>
      </div>
    </SidebarProvider>
    </CursorProvider>
  );
}
