import { ErrorBoundary } from "./components/ErrorBoundary";
import { useEffect, lazy, Suspense } from "react";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { IconPackProvider } from "./contexts/IconPackContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ensureVisitorTracked } from "./lib/visitorTracking";
import TrackingScripts from "./components/TrackingScripts.tsx";
import { ScrollToTop } from "./components/ScrollToTop.tsx";
import { RedirectHandler } from "./components/RedirectHandler";
import PromoPopup from "./components/PromoPopup";
import FreeGiftWatcher from "./components/FreeGiftWatcher";
import { supabase } from "@/integrations/supabase/client";

import { useActivityHeartbeat } from "./hooks/useActivityHeartbeat";
import { Loader2 } from "lucide-react";


// Retries a dynamic import once (with a cache-busting reload fallback) so a
// transient chunk fetch failure doesn't blank the screen.
function lazyRetry<T extends { default: React.ComponentType<any> }>(factory: () => Promise<T>) {
  return lazy(() =>
    factory().catch(async (err) => {
      await new Promise((r) => setTimeout(r, 500));
      try {
        return await factory();
      } catch {
        const key = "chunk-reload-once";
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          window.location.reload();
        }
        throw err;
      }
    })
  );
}

const Index = lazyRetry(() => import("./pages/Index.tsx"));
const AllProducts = lazyRetry(() => import("./pages/AllProducts.tsx"));
const ProductDetail = lazyRetry(() => import("./pages/ProductDetail.tsx"));
const Categories = lazyRetry(() => import("./pages/Categories.tsx"));
const CategoryPage = lazyRetry(() => import("./pages/CategoryPage.tsx"));
const Checkout = lazyRetry(() => import("./pages/Checkout.tsx"));
const OrderConfirmed = lazyRetry(() => import("./pages/OrderConfirmed.tsx"));
const PublicInvoice = lazyRetry(() => import("./pages/PublicInvoice.tsx"));
const Profile = lazyRetry(() => import("./pages/Profile.tsx"));
const Help = lazyRetry(() => import("./pages/Help.tsx"));
const Services = lazyRetry(() => import("./pages/Services.tsx"));
const BlogDetail = lazyRetry(() => import("./pages/BlogDetail.tsx"));
const DeliveryCharge = lazyRetry(() => import("./pages/DeliveryCharge.tsx"));
const PrivacyPolicy = lazyRetry(() => import("./pages/PrivacyPolicy.tsx"));
const TermsConditions = lazyRetry(() => import("./pages/TermsConditions.tsx"));
const ReturnPolicy = lazyRetry(() => import("./pages/ReturnPolicy.tsx"));
const CultivationGuide = lazyRetry(() => import("./pages/CultivationGuide.tsx"));
const NotFound = lazyRetry(() => import("./pages/NotFound.tsx"));
const MintLeafLanding = lazyRetry(() => import("./pages/lp/MintLeafLanding.tsx"));
const CosmosLanding = lazyRetry(() => import("./pages/lp/CosmosLanding.tsx"));
const PudinaLanding = lazyRetry(() => import("./pages/lp/PudinaLanding.tsx"));


// Admin
const AdminLayout = lazyRetry(() => import("./components/admin/AdminLayout.tsx").then(m => ({ default: m.AdminLayout })));
const AdminLogin = lazyRetry(() => import("./pages/admin/AdminLogin.tsx"));
const Overview = lazyRetry(() => import("./pages/admin/Overview.tsx"));
const MyActivity = lazyRetry(() => import("./pages/admin/MyActivity.tsx"));
const ProductList = lazyRetry(() => import("./pages/admin/ProductList.tsx"));
const ProductForm = lazyRetry(() => import("./pages/admin/ProductForm.tsx"));
const CategoryList = lazyRetry(() => import("./pages/admin/CategoryList.tsx"));
const TagList = lazyRetry(() => import("./pages/admin/TagList.tsx"));
const WebOrders = lazyRetry(() => import("./pages/admin/WebOrders.tsx"));
const ConfirmedOrders = lazyRetry(() => import("./pages/admin/ConfirmedOrders.tsx"));
const OrderList = lazyRetry(() => import("./pages/admin/OrderList.tsx"));
const PreOrders = lazyRetry(() => import("./pages/admin/PreOrders.tsx"));
const OrderSearch = lazyRetry(() => import("./pages/admin/OrderSearch.tsx"));
const CustomerList = lazyRetry(() => import("./pages/admin/CustomerList.tsx"));
const ThemeSettings = lazyRetry(() => import("./pages/admin/ThemeSettings.tsx"));
const LanguageSettings = lazyRetry(() => import("./pages/admin/LanguageSettings.tsx"));
const CursorSettings = lazyRetry(() => import("./pages/admin/CursorSettings.tsx"));
const MenuControl = lazyRetry(() => import("./pages/admin/MenuControl.tsx"));
const FooterEditor = lazyRetry(() => import("./pages/admin/FooterEditor.tsx"));
const DeliveryChargeEditor = lazyRetry(() => import("./pages/admin/DeliveryChargeEditor.tsx"));
const KeyboardShortcuts = lazyRetry(() => import("./pages/admin/KeyboardShortcuts.tsx"));
const MediaManagement = lazyRetry(() => import("./pages/admin/MediaManagement.tsx"));
const ApiManagement = lazyRetry(() => import("./pages/admin/ApiManagement.tsx"));
const OrderEdit = lazyRetry(() => import("./pages/admin/OrderEdit.tsx"));
const AdminList = lazyRetry(() => import("./pages/admin/AdminList.tsx"));
const DeletedOrders = lazyRetry(() => import("./pages/admin/DeletedOrders.tsx"));
const ImportExport = lazyRetry(() => import("./pages/admin/ImportExport.tsx"));

const OrderNotifications = lazyRetry(() => import("./pages/admin/Notifications.tsx"));
const HelpSupport = lazyRetry(() => import("./pages/admin/HelpSupport.tsx"));
const LandingPagesList = lazyRetry(() => import("./pages/admin/LandingPagesList.tsx"));
const BlogList = lazyRetry(() => import("./pages/admin/BlogList.tsx"));
const ExpenseTracker = lazyRetry(() => import("./pages/admin/ExpenseTracker.tsx"));
const OrderControl = lazyRetry(() => import("./pages/admin/OrderControl.tsx"));
const PromoPopupSettings = lazyRetry(() => import("./pages/admin/PromoPopupSettings.tsx"));
const FreeGiftSettings = lazyRetry(() => import("./pages/admin/FreeGiftSettings.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale-While-Revalidate: show cached data instantly, never block UI
      staleTime: 5 * 60 * 1000,        // 5 min — cached data displays in 0ms
      gcTime: 24 * 60 * 60 * 1000,     // 24 hr — keep cache in memory/storage
      refetchOnWindowFocus: false,     // avoid unnecessary refetches
      refetchOnReconnect: "always",
      refetchOnMount: false,           // render instantly from cache
      retry: 1,
      networkMode: "online",
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "ssseedshop-query-cache-v2",
});



function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-7 h-7 animate-spin text-primary" />
    </div>
  );
}

function ActivityHeartbeatWrapper() {
  useActivityHeartbeat();
  return null;
}

function ProductStockRealtime() {
  const client = useQueryClient();

  useEffect(() => {
    const invalidate = (keys: string[]) => () => {
      void client.invalidateQueries({
        predicate: ({ queryKey }) => {
          const key = String(queryKey[0] ?? "");
          return keys.some((k) => key.includes(k));
        },
      });
    };

    const channel = supabase
      .channel("app-realtime-all")
      // Products — stock/price/visibility changes
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, invalidate(["product", "shop-products", "category", "products", "products-public", "all-products", "featured-products", "admin-products"]))
      .on("postgres_changes", { event: "*", schema: "public", table: "product_variations" }, invalidate(["product", "shop-products"]))
      // Categories
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, invalidate(["categories", "category"]))
      // Tags / badges
      .on("postgres_changes", { event: "*", schema: "public", table: "tags" }, invalidate(["all-tags", "admin-tags"]))
      // App settings (footer, delivery, promos etc)
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, invalidate(["app-settings", "footer-settings", "delivery", "promo"]))
      // Orders & Order Items (admin panel & activity live updates)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, invalidate(["orders", "admin-orders", "web-orders", "confirmed-orders", "pre-orders", "deleted-orders", "my-activity", "notifications"]))
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, invalidate(["orders", "admin-orders", "web-orders", "confirmed-orders", "pre-orders", "my-activity"]))
      // Expenses
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, invalidate(["expenses", "admin-expenses"]))
      // Visitor profiles
      .on("postgres_changes", { event: "*", schema: "public", table: "visitor_profiles" }, invalidate(["customers", "visitor-profiles", "admin-customers"]))
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [client]);

  return null;
}

function CustomerWidthWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin") || location.pathname === "/admin";
  if (isAdmin) return <>{children}</>;
  return (
    <div className="w-full min-h-screen bg-background pb-16">
      {children}
    </div>
  );
}

const App = () => {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    void ensureVisitorTracked();
  }, []);

  return (
    <ErrorBoundary>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: 5 * 60 * 1000 }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CartProvider>
          <BrowserRouter>
            <ThemeProvider>
            <IconPackProvider>
            <LanguageProvider>
            <TrackingScripts />
            <ScrollToTop />
            <ActivityHeartbeatWrapper />
             <ProductStockRealtime />
            <RedirectHandler />
            <PromoPopup />
            <FreeGiftWatcher />
            <Suspense fallback={<PageLoader />}>
              <CustomerWidthWrapper>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/all-products" element={<AllProducts />} />
                <Route path="/products" element={<AllProducts />} />
                <Route path="/shop" element={<Navigate to="/" replace />} />
                <Route path="/shop/:categorySlug" element={<Index />} />
                <Route path="/products/:categorySlug" element={<Navigate to="/" replace />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/category/:name" element={<CategoryPage />} />
                <Route path="/tag/:name" element={<Navigate to="/" replace />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
                <Route path="/invoice/:orderId" element={<PublicInvoice />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/offers" element={<Navigate to="/" replace />} />
                <Route path="/help" element={<Help />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:slug" element={<BlogDetail />} />
                <Route path="/delivery-charge" element={<DeliveryCharge />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/cultivation-guide" element={<CultivationGuide />} />
                <Route path="/u/:username" element={<Navigate to="/profile" replace />} />
                <Route path="/lp/mint-leaf-seeds" element={<MintLeafLanding />} />
                <Route path="/lp/cosmos" element={<CosmosLanding />} />
            <Route path="/lp/pudina" element={<PudinaLanding />} />
            <Route path="/lp/pudina-pata" element={<PudinaLanding />} />
                <Route path="/mint-leaf-seeds" element={<Navigate to="/lp/mint-leaf-seeds" replace />} />

                {/* Admin */}
                <Route path="/admin">
                  <Route index element={<AdminLogin />} />
                  <Route element={<AdminLayout />}>
                    <Route path="my-activity" element={<MyActivity />} />
                    <Route path="overview" element={<Overview />} />
                    <Route path="expenses" element={<ExpenseTracker />} />

                    <Route path="products" element={<ProductList />} />
                    <Route path="products/create" element={<ProductForm />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/edit/:id" element={<ProductForm />} />
                    <Route path="categories" element={<CategoryList />} />
                    <Route path="product-tags" element={<TagList />} />
                    <Route path="blogs" element={<BlogList />} />

                    <Route path="orders" element={<Navigate to="/admin/orders/list" replace />} />
                    <Route path="orders/:id" element={<OrderEdit />} />
                    <Route path="orders/create" element={<OrderEdit />} />
                    <Route path="orders/edit/:id" element={<OrderEdit />} />
                    <Route path="orders/search" element={<OrderSearch />} />
                    <Route path="orders/web" element={<WebOrders />} />
                    <Route path="orders/list" element={<OrderList />} />
                    <Route path="orders/pre" element={<PreOrders />} />
                    <Route path="orders/confirmed" element={<ConfirmedOrders />} />
                    <Route path="orders/deleted" element={<DeletedOrders />} />

                    <Route path="users/admins" element={<AdminList />} />
                    <Route path="users/customers" element={<CustomerList />} />
                    <Route path="customers" element={<CustomerList />} />

                    <Route path="website/api" element={<ApiManagement />} />
                    <Route path="website/media" element={<MediaManagement />} />
                    <Route path="website/import-export" element={<ImportExport />} />

                    <Route path="website/landing-pages" element={<LandingPagesList />} />
                    <Route path="landing-pages" element={<LandingPagesList />} />

                    <Route path="settings/theme" element={<ThemeSettings />} />
                    <Route path="settings/language" element={<LanguageSettings />} />
                    <Route path="settings/cursor" element={<CursorSettings />} />
                    <Route path="settings/menu" element={<MenuControl />} />
                    <Route path="settings/footer" element={<FooterEditor />} />
                    <Route path="settings/delivery-charge" element={<DeliveryChargeEditor />} />
                    <Route path="settings/shortcuts" element={<KeyboardShortcuts />} />
                    <Route path="settings/order-control" element={<OrderControl />} />
                    <Route path="settings/promo-popup" element={<PromoPopupSettings />} />
                    <Route path="settings/free-gift" element={<FreeGiftSettings />} />
                    <Route path="notifications" element={<OrderNotifications />} />
                    <Route path="help-support" element={<HelpSupport />} />
                    <Route path="help" element={<HelpSupport />} />
                    <Route path="support" element={<HelpSupport />} />
                    <Route path="whats-new" element={<Navigate to="/admin/help-support" replace />} />

                    <Route path="settings/import-export" element={<ImportExport />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              </CustomerWidthWrapper>
            </Suspense>
            </LanguageProvider>
            </IconPackProvider>
            </ThemeProvider>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </PersistQueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
