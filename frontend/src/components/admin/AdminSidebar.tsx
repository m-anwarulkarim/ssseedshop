import { useLocation, useNavigate } from "react-router-dom";
import { isLovablePreview } from "@/lib/previewMode";
import { getSavedPath } from "@/lib/adminPageState";
import ssseedshopLogo from "@/assets/ssseedshop-logo.png";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWebCounts, useListCounts } from "@/stores/orderCountsStore";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  LayoutDashboard, Package, Users, ShoppingCart, Plus, Search,
  ClipboardList, Trash2, Globe, Settings, Palette, Languages, Eye,
  ChevronDown, MousePointer2, Headphones, UserCog, UsersRound, Code,
  FileImage, Activity, Share2, ListOrdered, BookOpen, CalendarClock,
  ArrowUpDown, BellRing, ChevronsLeftRight, Keyboard, LogOut, Truck,
 Sparkles, Tag as TagIcon, ShieldBan, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import { getCurrentAdminAccess, getActiveAdminUser } from "@/lib/adminAccess";

const SUPER_ADMIN_EMAIL = "admin@ssseedshop.com";
const WEB_ORDER_SOURCE_FILTER = "traffic_source.is.null,traffic_source.neq.ecomdrive";

// Permission key → sidebar URL mapping
const permissionToUrl: Record<string, string> = {
  "overview": "/admin/overview",
  
  "product-list": "/admin/products",
  "categories": "/admin/categories",
  "product-tags": "/admin/product-tags",
  "orders-create": "/admin/orders/create",
  "orders-search": "/admin/orders/search",
  "orders-web": "/admin/orders/web",
  "orders-pre": "/admin/orders/pre",
  "orders-list": "/admin/orders/list",
  "orders-reports": "/admin/orders/reports",
  "orders-deleted": "/admin/orders/deleted",
  "users-admins": "/admin/users/admins",
  "users-customers": "/admin/users/customers",
  "website-api": "/admin/website/api",
  "website-media": "/admin/website/media",
  "website-ai": "/admin/website/ai",
  "website-ai-training": "/admin/website/ai-training",
  "website-rag": "/admin/website/rag",
  "website-meta-go": "/admin/website/meta-go",
  "website-landing-pages": "/admin/website/landing-pages",
  "settings-theme": "/admin/settings/theme",
  "settings-language": "/admin/settings/language",
  "settings-cursor": "/admin/settings/cursor",
  "settings-menu": "/admin/settings/menu",
  "settings-footer": "/admin/settings/footer",
  "settings-delivery-charge": "/admin/settings/delivery-charge",
  "settings-shortcuts": "/admin/settings/shortcuts",
  "settings-order-control": "/admin/settings/order-control",
  "settings-promo-popup": "/admin/settings/promo-popup",
  "settings-free-gift": "/admin/settings/free-gift",
  "support-inbox": "/admin/support/ai-inbox",
};

// Reverse: URL → permission key
const urlToPermission: Record<string, string> = {};
Object.entries(permissionToUrl).forEach(([k, v]) => { urlToPermission[v] = k; });

interface SubItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
  badgeVariant?: "default" | "destructive";
  hideFromParent?: boolean;
  permissionKey?: string;
  iconColor?: string;
  iconBg?: string;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  url?: string;
  subItems?: SubItem[];
  menuKey?: string;
  iconColor?: string;
  iconBg?: string;
}

// Shared style helpers for professional SaaS sidebar
const itemBase =
  "rounded-xl transition-all duration-150 px-3 py-2 my-0.5 text-[14px] flex items-center justify-between font-semibold select-none group w-full cursor-pointer h-auto";
const itemIdle =
  "text-slate-700 hover:bg-slate-100/90 hover:text-slate-950";
const itemActive =
  "bg-[#635bff] text-white shadow-md shadow-[#635bff]/25 font-bold hover:bg-[#5850ec] hover:text-white [&_svg]:!text-white [&>span]:!text-white";

function HoverSubmenu({ item, currentPath, navigate }: { item: MenuItem; currentPath: string; navigate: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const hasActive = item.subItems?.some((sub) => currentPath === sub.url);

  const enter = () => {
    clearTimeout(timeout.current);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopoverStyle({ position: "fixed", top: rect.top, left: rect.right + 4, zIndex: 9999 });
    }
    setOpen(true);
  };
  const leave = () => { timeout.current = setTimeout(() => setOpen(false), 150); };

  return (
    <SidebarGroup className="p-0" ref={triggerRef} onMouseEnter={enter} onMouseLeave={leave}>
      <SidebarMenuButton
        className={cn(
          itemBase,
          "w-full justify-center px-0 py-2.5",
          hasActive ? itemActive : itemIdle
        )}
      >
        <span className="flex items-center justify-center">
          <span
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
              hasActive
                ? "bg-white/20 text-white"
                : item.iconBg && item.iconColor
                ? cn(item.iconBg, item.iconColor)
                : "bg-slate-100 text-slate-700"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
          </span>
        </span>
      </SidebarMenuButton>

      {open && (
        <div
          className="bg-white text-slate-800 border border-slate-200/90 rounded-2xl shadow-xl py-2 px-1.5 min-w-[210px]"
          style={popoverStyle}
          onMouseEnter={enter}
          onMouseLeave={leave}
        >
          <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center gap-2">
            {item.iconBg && item.iconColor && (
              <span className={cn("w-2 h-2 rounded-full", item.iconBg.replace("-50", "-500"))} />
            )}
            {item.title}
          </div>
          <div className="space-y-0.5">
            {item.subItems?.map((sub) => {
              const isActive = currentPath === sub.url;
              return (
                <button
                  key={sub.url}
                  onClick={() => { navigate(getSavedPath(sub.url)); setOpen(false); }}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-2.5 py-2 text-[13px] font-semibold rounded-xl transition-all text-left group/pop",
                    isActive
                      ? "bg-[#635bff] text-white font-bold shadow-sm shadow-[#635bff]/25"
                      : "text-slate-700 hover:bg-slate-100/90 hover:text-slate-950"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover/pop:scale-105",
                      isActive
                        ? "bg-white/20 text-white"
                        : sub.iconBg && sub.iconColor
                        ? cn(sub.iconBg, sub.iconColor)
                        : "bg-slate-100 text-slate-700"
                    )}
                  >
                    <sub.icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex-1 truncate">{sub.title}</span>
                  {sub.badge ? (
                    <Badge variant={sub.badgeVariant || "default"} className="h-4 min-w-[16px] px-1 text-[9px] font-bold leading-none bg-rose-500 text-white">
                      {sub.badge}
                    </Badge>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </SidebarGroup>
  );
}

function CollapsibleMenu({ item, currentPath, navigate, openMenus, onToggleMenu }: { 
  item: MenuItem; currentPath: string; navigate: (url: string) => void;
  openMenus: Set<string>; onToggleMenu: (title: string, open: boolean) => void;
}) {
  const isOpen = openMenus.has(item.title);
  const hasActiveChild = item.subItems?.some((sub) => currentPath === sub.url);
  const totalBadge = item.subItems?.reduce((sum, sub) => sum + (sub.hideFromParent ? 0 : (sub.badge || 0)), 0) || 0;
  const hasDestructiveBadge = item.subItems?.some(sub => (sub.badge || 0) > 0 && sub.badgeVariant === "destructive") || false;

  return (
    <Collapsible open={isOpen} onOpenChange={(open) => onToggleMenu(item.title, open)} className="group/collapsible">
      <SidebarGroup className="p-0">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(
              itemBase,
              "w-full justify-between",
              isOpen
                ? "bg-slate-100/90 text-slate-900 font-bold border border-slate-200/60"
                : hasActiveChild
                ? "bg-slate-100/70 text-slate-900 font-bold"
                : itemIdle
            )}
          >
            <span className="flex items-center gap-2.5">
              <span
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs",
                  isOpen
                    ? "bg-slate-900 text-white"
                    : hasActiveChild
                    ? "bg-[#635bff] text-white"
                    : item.iconBg && item.iconColor
                    ? cn(item.iconBg, item.iconColor)
                    : "bg-slate-100 text-slate-700"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
              </span>
              <span className="font-semibold text-[14px]">{item.title}</span>
              {!isOpen && totalBadge > 0 && (
                <Badge
                  variant={hasDestructiveBadge ? "destructive" : "default"}
                  className={cn(
                    "h-[18px] min-w-[18px] px-1.5 text-[10px] font-bold leading-none rounded-full border-0 shadow-xs",
                    !hasDestructiveBadge ? "bg-rose-500 text-white" : "bg-rose-600 text-white"
                  )}
                >
                  {totalBadge}
                </Badge>
              )}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-1.5 my-1.5 ml-3.5 space-y-1 shadow-2xs">
            {item.subItems?.map((sub) => {
              const isActive = currentPath === sub.url;
              return (
                <button
                  key={sub.url}
                  onClick={() => navigate(getSavedPath(sub.url))}
                  className={cn(
                    "flex items-center gap-2.5 w-full rounded-xl px-2.5 py-2 text-[13px] transition-all text-left group/sub cursor-pointer",
                    isActive
                      ? "bg-white text-[#635bff] font-bold shadow-xs border border-slate-200/90 ring-1 ring-[#635bff]/25"
                      : "text-slate-700 hover:bg-white hover:text-slate-950 hover:shadow-2xs font-semibold"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover/sub:scale-110",
                      isActive
                        ? "bg-[#635bff] text-white shadow-xs"
                        : sub.iconBg && sub.iconColor
                        ? cn(sub.iconBg, sub.iconColor)
                        : "bg-slate-200/70 text-slate-700"
                    )}
                  >
                    <sub.icon className="w-3.5 h-3.5 shrink-0" />
                  </span>
                  <span className="flex-1 truncate">{sub.title}</span>
                  {sub.badge ? (
                    <Badge
                      variant={sub.badgeVariant || "default"}
                      className="h-[18px] min-w-[18px] px-1.5 text-[10px] font-bold leading-none ml-auto rounded-full bg-rose-500 text-white border-0 shadow-xs"
                    >
                      {sub.badge}
                    </Badge>
                  ) : null}
                </button>
              );
            })}
          </div>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function AdminSidebar() {
  const { state: sidebarState, toggleSidebar } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { t } = useLanguage();

  // Track which menus are open
  const [openMenus, setOpenMenus] = useState<Set<string>>(() => new Set());
  const [autoCollapse, setAutoCollapse] = useState(() => localStorage.getItem("admin_menu_auto_collapse") === "true");

  useEffect(() => {
    const handler = () => setAutoCollapse(localStorage.getItem("admin_menu_auto_collapse") === "true");
    window.addEventListener("admin-menu-auto-collapse-toggle", handler);
    return () => window.removeEventListener("admin-menu-auto-collapse-toggle", handler);
  }, []);

  const onToggleMenu = useCallback((title: string, open: boolean) => {
    setOpenMenus(prev => {
      if (open) {
        if (autoCollapse) {
          return new Set([title]);
        }
        return new Set(prev).add(title);
      } else {
        const next = new Set(prev);
        next.delete(title);
        return next;
      }
    });
  }, [autoCollapse]);

  // Synchronous immediate resolution of active admin user
  const syncAdminUser = getActiveAdminUser();
  const isSyncAdmin = Boolean(
    syncAdminUser?.is_super_admin ||
    syncAdminUser?.role === "admin" ||
    syncAdminUser?.email === "admin@ssseedshop.com" ||
    syncAdminUser?.email === SUPER_ADMIN_EMAIL ||
    syncAdminUser?.permissions?.includes("*") ||
    (typeof window !== "undefined" && (
      localStorage.getItem("admin_dev_bypass") === "true" ||
      sessionStorage.getItem("admin_dev_bypass") === "true" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ))
  );

  // Fetch current user's role & permissions
  const { data: userAccess } = useQuery({
    queryKey: ["current-admin-access"],
    queryFn: async () => {
      const access = await getCurrentAdminAccess();
      if (access.status !== "authorized") {
        return { role: null, permissions: [] as string[], email: "", isSuperAdmin: false };
      }

      return {
        role: access.role,
        permissions: access.permissions,
        email: access.email,
        isSuperAdmin: access.isSuperAdmin,
      };
    },
    initialData: syncAdminUser?.email ? {
      role: syncAdminUser.role || "admin",
      permissions: syncAdminUser.permissions || ["*"],
      email: syncAdminUser.email,
      isSuperAdmin: Boolean(syncAdminUser.is_super_admin || isSyncAdmin),
    } : undefined,
  });

  // In Lovable preview or local dev or admin role, treat as admin
  const PREVIEW_ALL_ACCESS = isLovablePreview();
  const isAdmin =
    PREVIEW_ALL_ACCESS ||
    isSyncAdmin ||
    userAccess?.role === "admin" ||
    userAccess?.isSuperAdmin ||
    userAccess?.permissions?.includes("*");

  const userPermissions = userAccess?.permissions?.length
    ? userAccess.permissions
    : (syncAdminUser?.permissions || (isAdmin ? ["*"] : []));

  // Check if a sub-item is allowed
  const hasPermission = (_permKey: string) => {
    if (isAdmin) return true; // Admins (and dev/preview) see everything
    if (userPermissions.includes("*")) return true; // Wildcard permission
    return userPermissions.includes(_permKey);
  };

  const queryClient = useQueryClient();
  const liveWebCounts = useWebCounts();
  const liveListCounts = useListCounts();

  // Realtime subscription to invalidate sidebar order counts immediately when orders change
  useEffect(() => {
    const channel = supabase
      .channel("sidebar-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ queryKey: ["sidebar-order-counts"] });
        queryClient.invalidateQueries({ queryKey: ["header-order-counts"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Unified single fetch for order counts without artificial cutoffs
  const { data: sidebarCounts } = useQuery({
    queryKey: ["sidebar-order-counts"],
    enabled: isAdmin,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${url}/orders/get.php?include_deleted=1`);
      const data = await res.json();
      if (!Array.isArray(data)) return { pending: 0, pre: 0, confirmed: 0, deleted: 0 };

      const today = new Date().toISOString().split("T")[0];
      let pending = 0;
      let pre = 0;
      let confirmed = 0;
      let deleted = 0;

      for (const o of data) {
        if (o.is_deleted) {
          deleted++;
          continue;
        }
        if (o.status === "pending") {
          pending++;
        } else if (o.status === "pre" && o.pre_date === today) {
          pre++;
        } else if (o.status === "confirmed") {
          confirmed++;
        }
      }

      return { pending, pre, confirmed, deleted };
    },
    refetchInterval: 15000,
  });

  const pendingOrderCount = liveWebCounts?.pending ?? sidebarCounts?.pending ?? 0;
  const confirmedOrderCount = liveListCounts?.confirmed ?? sidebarCounts?.confirmed ?? 0;
  const preOrderCount = sidebarCounts?.pre ?? 0;
  const deletedOrderCount = sidebarCounts?.deleted ?? 0;



  const allMenuItems: (MenuItem & { permissionKey?: string })[] = [
    {
      menuKey: "dashboard",
      title: t("ড্যাশবোর্ড", "Dashboard"),
      icon: LayoutDashboard,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      url: "/admin/overview",
      permissionKey: "overview",
    },
    {
      menuKey: "my-activity",
      title: t("মাই একটিভিটি", "My Activity"),
      icon: Activity,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50",
      url: "/admin/my-activity",
      // No permissionKey — always visible for all roles
    },
    {
      menuKey: "customer-support",
      title: t("কাস্টমার সাপোর্ট", "Customer Support"),
      icon: Headphones,
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-50",
      subItems: [],
    },
    {
      menuKey: "order-search",
      title: t("অর্ডার সার্চ", "Order Search"),
      icon: Search,
      iconColor: "text-sky-600",
      iconBg: "bg-sky-50",
      url: "/admin/orders/search",
      permissionKey: "orders-search",
    },
    {
      menuKey: "product",
      title: t("পণ্য", "Product"),
      icon: Package,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      subItems: [
        { title: t("পণ্য তালিকা", "Product List"), url: "/admin/products", icon: ListOrdered, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", permissionKey: "product-list" },
        { title: t("ক্যাটাগরি", "Category"), url: "/admin/categories", icon: BookOpen, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", permissionKey: "categories" },
        { title: t("প্রোডাক্ট ব্যাজ", "Product Badges"), url: "/admin/product-tags", icon: TagIcon, iconColor: "text-amber-600", iconBg: "bg-amber-50", permissionKey: "categories" },
      ],
    },
    {
      menuKey: "all-orders",
      title: t("অর্ডারসমূহ", "All Orders"),
      icon: ShoppingCart,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      subItems: [
        { title: t("নতুন তৈরি", "Create New"), url: "/admin/orders/create", icon: Plus, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", permissionKey: "orders-create" },
        { title: t("ওয়েব অর্ডার", "Web Orders"), url: "/admin/orders/web", icon: ClipboardList, iconColor: "text-rose-600", iconBg: "bg-rose-50", badge: pendingOrderCount || 0, permissionKey: "orders-web" },
        { title: t("প্রি-অর্ডার", "Pre Orders"), url: "/admin/orders/pre", icon: CalendarClock, iconColor: "text-amber-600", iconBg: "bg-amber-50", badge: preOrderCount || 0, permissionKey: "orders-pre" },
        { title: t("অর্ডার তালিকা", "Order List"), url: "/admin/orders/list", icon: ClipboardList, iconColor: "text-blue-600", iconBg: "bg-blue-50", badge: confirmedOrderCount || 0, permissionKey: "orders-list" },
        { title: t("মুছে ফেলা", "Deleted"), url: "/admin/orders/deleted", icon: Trash2, iconColor: "text-red-600", iconBg: "bg-red-50", badge: deletedOrderCount || 0, hideFromParent: true, permissionKey: "orders-deleted" },
      ],
    },
    {
      menuKey: "users",
      title: t("ইউজার", "Users"),
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      subItems: [
        { title: t("অ্যাডমিন", "Admins"), url: "/admin/users/admins", icon: UserCog, iconColor: "text-purple-600", iconBg: "bg-purple-50", permissionKey: "users-admins" },
        { title: t("কাস্টমার", "Customers"), url: "/admin/users/customers", icon: UsersRound, iconColor: "text-blue-600", iconBg: "bg-blue-50", permissionKey: "users-customers" },
      ],
    },
    {
      menuKey: "website",
      title: t("ওয়েবসাইট", "Website"),
      icon: Globe,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50",
      subItems: [
        { title: t("ল্যান্ডিং পেজসমূহ", "Landing Pages"), url: "/admin/website/landing-pages", icon: Globe, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", permissionKey: "website-landing-pages" },
        { title: "API", url: "/admin/website/api", icon: Code, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", permissionKey: "website-api" },
        { title: t("মিডিয়া", "Media"), url: "/admin/website/media", icon: FileImage, iconColor: "text-pink-600", iconBg: "bg-pink-50", permissionKey: "website-media" },
        { title: t("ইমপোর্ট/এক্সপোর্ট", "Import/Export"), url: "/admin/website/import-export", icon: ArrowUpDown, iconColor: "text-cyan-600", iconBg: "bg-cyan-50", permissionKey: "settings-import-export" },
      ],
    },
    {
      menuKey: "settings",
      title: t("সেটিংস", "Settings"),
      icon: Settings,
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100",
      subItems: [
        { title: t("থিম", "Theme"), url: "/admin/settings/theme", icon: Palette, iconColor: "text-violet-600", iconBg: "bg-violet-50", permissionKey: "settings-theme" },
        { title: t("ভাষা", "Language"), url: "/admin/settings/language", icon: Languages, iconColor: "text-blue-600", iconBg: "bg-blue-50", permissionKey: "settings-language" },
        { title: t("কার্সর ইফেক্ট", "Cursor Effect"), url: "/admin/settings/cursor", icon: MousePointer2, iconColor: "text-orange-600", iconBg: "bg-orange-50", permissionKey: "settings-cursor" },
        { title: t("মেনু কন্ট্রোল", "Menu Control"), url: "/admin/settings/menu", icon: ChevronsLeftRight, iconColor: "text-teal-600", iconBg: "bg-teal-50", permissionKey: "settings-menu" },
        { title: t("ফুটার এডিটর", "Footer Editor"), url: "/admin/settings/footer", icon: ChevronsLeftRight, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", permissionKey: "settings-footer" },
        { title: t("ডেলিভারি চার্জ", "Delivery Charge"), url: "/admin/settings/delivery-charge", icon: Truck, iconColor: "text-green-600", iconBg: "bg-green-50", permissionKey: "settings-delivery-charge" },
        { title: t("কীবোর্ড শর্টকাট", "Keyboard Shortcuts"), url: "/admin/settings/shortcuts", icon: Keyboard, iconColor: "text-amber-600", iconBg: "bg-amber-50", permissionKey: "settings-shortcuts" },
        { title: t("অর্ডার কন্ট্রোল", "Order Control"), url: "/admin/settings/order-control", icon: ShieldBan, iconColor: "text-rose-600", iconBg: "bg-rose-50", permissionKey: "settings-order-control" },
        { title: t("অফার পপআপ", "Offer Popup"), url: "/admin/settings/promo-popup", icon: Sparkles, iconColor: "text-pink-600", iconBg: "bg-pink-50", permissionKey: "settings-promo-popup" },
        { title: t("ফ্রি পণ্য অফার", "Free Gift Offer"), url: "/admin/settings/free-gift", icon: Gift, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", permissionKey: "settings-free-gift" },
      ],
    },
    {
      menuKey: "notification",
      title: t("নোটিফিকেশন", "Notification"),
      icon: BellRing,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50",
      url: "/admin/notifications",
      permissionKey: "notifications-orders",
    },
    {
      menuKey: "help-support",
      title: t("হেল্প ও সাপোর্ট", "Help & Support"),
      icon: Headphones,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      url: "/admin/help-support",
      // Always visible — no permissionKey
    },
  ];

  // Menu order from localStorage
  const [menuOrderVersion, setMenuOrderVersion] = useState(0);
  useEffect(() => {
    const handler = () => setMenuOrderVersion(v => v + 1);
    window.addEventListener("admin-menu-order-changed", handler);
    return () => window.removeEventListener("admin-menu-order-changed", handler);
  }, []);

  const savedOrder: string[] = (() => {
    try {
      const saved = localStorage.getItem("admin_menu_order");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  })();

  // Filter menu items by permissions (admins see all, moderators see only permitted)
  let menuItems = allMenuItems.map((group) => {
    // Top-level item with permissionKey: check permission
    if (!group.subItems && group.permissionKey && !hasPermission(group.permissionKey)) return null;
    if (!group.subItems) return group;
    const filteredSubs = group.subItems.filter((sub) =>
      hasPermission(sub.permissionKey || "")
    );
    if (filteredSubs.length === 0) return null;
    return { ...group, subItems: filteredSubs };
  }).filter(Boolean) as MenuItem[];

  // Sort by saved order if available
  if (savedOrder) {
    menuItems = [...menuItems].sort((a, b) => {
      const ai = savedOrder.indexOf(a.menuKey || "");
      const bi = savedOrder.indexOf(b.menuKey || "");
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }

  // Initialize open menus with active route's parent on first render
  const initializedRef = useRef(false);
  if (!initializedRef.current && menuItems.length > 0) {
    initializedRef.current = true;
    const activeParent = menuItems.find(m => m.subItems?.some(sub => currentPath === sub.url));
    if (activeParent && !openMenus.has(activeParent.title)) {
      setOpenMenus(new Set([activeParent.title]));
    }
  }

  return (
    
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/90 bg-white [&>div]:bg-white [&>div]:text-slate-800 shadow-xs"
    >
      <SidebarHeader className="p-4 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 p-0.5">
              <img src={ssseedshopLogo} alt="Ss Seed Shop" className="w-full h-full object-contain" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden min-w-0">
              <h2 className="font-bold text-[15px] text-slate-900 tracking-tight truncate leading-tight">Ss Seed Shop</h2>
              <p className="text-[11px] font-medium text-slate-400 truncate leading-tight mt-0.5">{t("অ্যাডমিন প্যানেল", "Admin Dashboard")}</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="group-data-[collapsible=icon]:hidden w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <ChevronsLeftRight className="w-4 h-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-3">
        {menuItems.map((item) => 
          item.url && !item.subItems ? (
            <SidebarGroup key={item.title} className="p-0">
              <SidebarMenuButton
                className={cn(
                  itemBase,
                  "w-full",
                  currentPath === item.url ? itemActive : itemIdle
                )}
                onClick={() => navigate(getSavedPath(item.url!))}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs",
                      currentPath === item.url
                        ? "bg-white/20 text-white"
                        : item.iconBg && item.iconColor
                        ? cn(item.iconBg, item.iconColor)
                        : "bg-slate-100 text-slate-700"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                  </span>
                  <span className="group-data-[collapsible=icon]:hidden font-semibold text-[14px]">{item.title}</span>
                </span>
              </SidebarMenuButton>
            </SidebarGroup>
          ) : isCollapsed ? (
            <HoverSubmenu
              key={item.title}
              item={item}
              currentPath={currentPath}
              navigate={navigate}
            />
          ) : (
          <CollapsibleMenu
            key={item.title}
            item={item}
            currentPath={currentPath}
            navigate={navigate}
            openMenus={openMenus}
            onToggleMenu={onToggleMenu}
          />
          )
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 bg-white p-3">
        <div className="flex gap-2 group-data-[collapsible=icon]:flex-col">
          <SidebarMenuButton
            className="flex-1 justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs shadow-xs"
            onClick={() => window.open("/", "_blank")}
          >
            <Eye className="w-4 h-4" />
            <span className="group-data-[collapsible=icon]:hidden">{t("ওয়েবসাইট", "Website")}</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className="flex-1 justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-semibold text-xs"
            onClick={async () => {
              localStorage.removeItem("admin_session");
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_dev_bypass");
              sessionStorage.removeItem("admin_session");
              sessionStorage.removeItem("admin_dev_bypass");
              navigate("/admin", { replace: true });
            }}
          >
            <LogOut className="w-4 h-4" />
            <span className="group-data-[collapsible=icon]:hidden">{t("লগআউট", "Logout")}</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
    
  );
}
