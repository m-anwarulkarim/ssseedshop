import { useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, ShoppingBag, ClipboardList, Search, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWebCounts } from "@/stores/orderCountsStore";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/config/env";
import { cn } from "@/lib/utils";

export function AdminBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { t } = useLanguage();
  const { setOpenMobile, toggleSidebar } = useSidebar();

  const liveCounts = useWebCounts();
  const { data: stats } = useQuery({
    queryKey: ["bottom-nav-order-counts"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/orders/stats.php`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    refetchInterval: 20000,
  });

  const pendingCount =
    liveCounts?.pending ??
    stats?.data?.summary?.pending_orders ??
    stats?.pending_orders ??
    0;

  const isDashboardActive =
    pathname === "/admin" ||
    pathname === "/admin/overview";

  const isProductActive =
    pathname.startsWith("/admin/products") ||
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/product-tags");

  const isOrderActive =
    pathname.startsWith("/admin/orders") &&
    !pathname.includes("search");

  const isSearchActive =
    pathname === "/admin/orders/search";

  const navItems = [
    {
      id: "dashboard",
      label: t("ড্যাশবোর্ড", "Dashboard"),
      icon: LayoutGrid,
      isActive: isDashboardActive,
      onClick: () => {
        setOpenMobile(false);
        navigate("/admin/overview");
      },
    },
    {
      id: "product",
      label: t("প্রোডাক্ট", "Product"),
      icon: ShoppingBag,
      isActive: isProductActive,
      onClick: () => {
        setOpenMobile(false);
        navigate("/admin/products");
      },
    },
    {
      id: "orders",
      label: t("অর্ডার লিস্ট", "Order List"),
      icon: ClipboardList,
      isActive: isOrderActive,
      badge: pendingCount > 0 ? (pendingCount > 99 ? "99+" : pendingCount) : undefined,
      onClick: () => {
        setOpenMobile(false);
        navigate("/admin/orders/web");
      },
    },
    {
      id: "search",
      label: t("সার্চ", "Search"),
      icon: Search,
      isActive: isSearchActive,
      onClick: () => {
        setOpenMobile(false);
        navigate("/admin/orders/search");
      },
    },
    {
      id: "menu",
      label: t("মেনু", "Menu"),
      icon: Menu,
      isActive: false,
      onClick: () => {
        toggleSidebar();
      },
    },
  ];

  return (
    <nav
      aria-label="Admin Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-1 transition-all select-none relative group",
                item.isActive
                  ? "text-purple-600 dark:text-purple-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              {/* Icon Container with active pill highlight matching reference image */}
              <div
                className={cn(
                  "relative flex items-center justify-center transition-all duration-200",
                  item.isActive
                    ? "bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 px-3.5 py-1 rounded-2xl shadow-xs"
                    : "p-1 rounded-xl group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60"
                )}
              >
                <Icon className={cn("w-5 h-5", item.isActive ? "stroke-[2.25]" : "stroke-[1.75]")} />
                
                {/* Badge for notifications */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs border-2 border-white dark:border-slate-900 animate-in zoom-in-75">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Text Label */}
              <span
                className={cn(
                  "text-[10.5px] mt-0.5 tracking-tight truncate max-w-[64px] text-center",
                  item.isActive ? "font-bold text-purple-600 dark:text-purple-400" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
