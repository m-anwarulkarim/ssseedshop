import { API_URL } from "@/config/env";
import { ShoppingCart, Search, Menu, Home, LayoutGrid, ClipboardList, Sprout, UserRoundCog, ArrowRight, Palette, Check, HelpCircle, Image as ImageIcon, Languages, LogIn, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme, ThemeMode } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import shikderLogo from "@/assets/ssseedshop-logo.png";
import SearchPopup from "@/components/SearchPopup";
import DesktopSearchBar from "@/components/DesktopSearchBar";
import { getCustomerSession, clearCustomerSession } from "@/components/CustomerLogin";
import { useQuery } from "@tanstack/react-query";
import { NAVBAR_ICONS, DEFAULT_NAVBAR_ITEMS } from "@/lib/navbarIcons";
import woodTexture from "@/assets/wood-texture.webp";



const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { openCart, totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [session, setSession] = useState(() => getCustomerSession());

  useEffect(() => {
    if (menuOpen) setSession(getCustomerSession());
  }, [menuOpen]);


  const handleLogout = () => {
    clearCustomerSession();
    setSession(null);
    setMenuOpen(false);
    navigate("/profile");
  };

  return (

    <>
      {/* Sticky top wrapper */}
      <div className="sticky top-0 z-40">

      {/* Top notice marquee */}
      <Link
        to="/delivery-charge"
        className="block bg-primary text-primary-foreground text-[11px] overflow-hidden hover:bg-primary/90 transition-colors"
      >
        <div className="text-center py-1 font-medium">
          {lang === "en" ? "🚚 Free delivery on orders ৳600+!" : "🚚 ৳৬০০+ অর্ডার করলেই ডেলিভারি সম্পূর্ণ ফ্রি!"}
        </div>
      </Link>



      {/* Top header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        {/* Mobile Header: Styled exactly as reference screenshot */}
        <div className="flex md:hidden items-center gap-2.5 h-14 px-3 w-full">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="p-1.5 -ml-1 rounded-lg text-gray-700 hover:bg-gray-100 active:scale-95 transition-transform shrink-0"
          >
            <Menu className="w-6 h-6 stroke-[2]" />
          </button>

          {/* Styled Search Bar with Action Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex-1 flex items-center justify-between h-10 pl-3.5 pr-1.5 rounded-lg bg-[#f5f6f8] hover:bg-[#eaecee] transition-colors text-left border border-gray-200/80 focus:outline-none"
            aria-label="Search"
          >
            <span className="text-xs sm:text-sm text-gray-400 font-normal truncate">
              {lang === "en" ? "Search seeds & products..." : "বীজ বা পছন্দের পণ্য খুঁজুন..."}
            </span>
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-50 text-[#e41d56] shrink-0">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </span>
          </button>
        </div>

        {/* Desktop Header: 2-Tier Modern Layout Matching Reference Screenshot */}
        <div className="hidden md:block w-full">
          {/* Tier 1: Main Header (Logo | Centered Search Bar with Popup | Account & Cart) */}
          <div className="flex items-center justify-between gap-4 h-16 px-4 max-w-screen-2xl mx-auto w-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <img
                src={shikderLogo}
                alt="Ss Seed Shop"
                className="w-10 h-10 rounded-full object-contain ring-2 ring-primary/30 group-hover:scale-105 transition-transform"
              />
              <div className="hidden lg:block text-left">
                <div className="font-extrabold text-base text-primary leading-tight flex items-center gap-1">
                  <span>Ss Seed Shop</span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">
                  {lang === "en" ? "Trusted Seed Brand" : "সেরা বীজের বিশ্বস্ত ঠিকানা"}
                </div>
              </div>
            </Link>

            {/* Centered Search Bar with Attached Popup (Matches Screenshot) */}
            <div className="flex-1 flex justify-center max-w-2xl px-2">
              <DesktopSearchBar />
            </div>

            {/* Right Controls: Account, Cart, Theme, Lang */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Account / Profile (Matches Screenshot: Hello, ... / Account & Lists) */}
              <Link
                to="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-pink-50 text-[#e41d56] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="hidden xl:block">
                  <div className="text-[10px] text-gray-500 font-medium leading-none">
                    {session ? `Hello, ${session.name || "Customer"}` : (lang === "en" ? "Hello, Sign In" : "লগইন করুন")}
                  </div>
                  <div className="text-xs font-bold text-gray-800 leading-tight mt-0.5">
                    {lang === "en" ? "Account & Lists" : "একাউন্ট ও অর্ডার"}
                  </div>
                </div>
              </Link>

              {/* Cart Button with Total Count Badge */}
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-50/70 hover:bg-pink-100/80 border border-pink-200/60 text-[#e41d56] font-bold text-xs transition-all active:scale-95"
                aria-label="Open cart"
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-[#e41d56] text-white text-[9px] font-extrabold ring-1 ring-white">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-bold">
                  {lang === "en" ? "Cart" : "কার্ট"}
                </span>
              </button>

              {/* Theme & Language Controls */}
              <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                <DesktopThemeButton />
                <DesktopLangButton />
              </div>
            </div>
          </div>

          {/* Tier 2: Sub-Nav Bar (All Categories | Menu Items) */}
          <div className="border-t border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2 h-10 px-4 max-w-screen-2xl mx-auto w-full">
              {/* All Categories shortcut */}
              <Link
                to="/categories"
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-gray-800 hover:text-[#e41d56] hover:bg-white transition-colors border border-transparent hover:border-gray-200"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#e41d56]" />
                <span>{lang === "en" ? "All Categories" : "সকল ক্যাটাগরি"}</span>
              </Link>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Menu items */}
              <nav className="flex items-center gap-1">
                <DesktopNavItems />
              </nav>
            </div>
          </div>
        </div>
      </header>
      </div>



      {/* Search Popup */}
      <SearchPopup open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Slide-in menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col"
          >
            <div className="flex items-center gap-2 p-4 border-b border-gray-100">
              <img src={shikderLogo} alt="" className="w-9 h-9 rounded-full" />
              <div>
                <div className="font-bold text-sm text-primary">Ss Seed Shop</div>
                <div className="text-[10px] text-gray-500">{lang === "en" ? "Trusted source of seeds" : "নির্ভরযোগ্য বীজের ঠিকানা"}</div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 text-sm">
              <NavMenuItems onNavigate={(to) => { setMenuOpen(false); navigate(to); }} />


              <ThemePicker />

              {/* Login / Logout */}
              {session ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-red-50 border-b border-gray-50 text-red-600"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>{lang === "en" ? "Logout" : "লগ আউট করুন"}</span>
                </button>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                  className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 text-primary font-semibold"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span>{lang === "en" ? "Login" : "লগ ইন করুন"}</span>
                </button>
              )}

              {/* Language toggle */}
              <div className="px-4 py-3 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-700">
                  <Languages className="w-3.5 h-3.5" />
                  {lang === "en" ? "Language" : "ভাষা"}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "bn" as const, label: "বাংলা" },
                    { value: "en" as const, label: "English" },
                  ]).map((l) => {
                    const active = lang === l.value;
                    return (
                      <button
                        key={l.value}
                        onClick={() => setLang(l.value)}
                        className={cn(
                          "rounded-lg border-2 py-2 text-xs font-medium transition-all",
                          active ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-700 hover:border-gray-300"
                        )}
                      >
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              </div>


            </nav>
          </aside>
        </div>
      )}

      {/* Bottom tab bar (fixed) */}
      <BottomNav pathname={location.pathname} />
    </>
  );
};

function DesktopThemeButton() {
  const [open, setOpen] = useState(false);
  const { publicTheme, setPublicTheme } = useTheme();
  const { lang } = useLanguage();
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Theme"
        className="inline-flex items-center justify-center w-9 h-9 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Palette className="w-5 h-5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-50">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-700">
              <Palette className="w-3.5 h-3.5" />
              {lang === "en" ? "Select Theme" : "থিম নির্বাচন করুন"}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((th) => {
                const active = publicTheme === th.value;
                return (
                  <button
                    key={th.value}
                    onClick={() => { setPublicTheme(th.value); setOpen(false); }}
                    className={cn(
                      "relative rounded-lg border-2 p-2 text-center transition-all",
                      active ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {active && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <div className="flex gap-0.5 justify-center mb-1">
                      {th.colors.map((c, i) => (
                        <div key={i} className={cn("w-3 h-3 rounded-full border border-gray-200", c)} />
                      ))}
                    </div>
                    <p className="text-[10px] font-medium text-gray-700">{th.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DesktopLangButton() {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        className="inline-flex items-center justify-center h-9 px-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors gap-1"
      >
        <Languages className="w-5 h-5" />
        <span className="text-[11px] font-semibold uppercase">{lang}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50">
            {([
              { value: "bn" as const, label: "বাংলা" },
              { value: "en" as const, label: "English" },
            ]).map((l) => {
              const active = lang === l.value;
              return (
                <button
                  key={l.value}
                  onClick={() => { setLang(l.value); setOpen(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const NAV_LABEL_EN: Record<string, string> = {
  "/": "Home",
  "/products": "All Products",
  "/categories": "Categories",
  "/cultivation-guide": "Guide",
  "/profile": "Account",
  "/help": "Help",
};

function translateNavLabel(it: { label: string; href: string }, lang: string) {
  if (lang !== "en") return it.label;
  return NAV_LABEL_EN[it.href] || it.label;
}

async function fetchNavbarItems() {
  try {
    const url = API_URL;
    const res = await fetch(`${url}/settings/get.php?key=navbar_menu_items`);
    if (!res.ok) return DEFAULT_NAVBAR_ITEMS;
    const data = await res.json();
    if (data?.value) {
      const parsed = JSON.parse(data.value);
      if (Array.isArray(parsed) && parsed.length) return parsed as typeof DEFAULT_NAVBAR_ITEMS;
    }
  } catch {}
  return DEFAULT_NAVBAR_ITEMS;
}

function DesktopNavItems() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { data: items } = useQuery({
    queryKey: ["navbar-menu-items"],
    queryFn: fetchNavbarItems,
    staleTime: 5 * 60 * 1000,
  });
  const list = items || DEFAULT_NAVBAR_ITEMS;
  return (
    <>
      {list.map((it, idx) => {
        const Icon = NAVBAR_ICONS[it.icon] || Home;
        return (
          <button
            key={`${it.label}-${idx}`}
            onClick={() => navigate(it.href)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
          >
            <Icon className="w-4 h-4 text-primary shrink-0" />
            <span>{translateNavLabel(it, lang)}</span>
          </button>
        );
      })}
    </>
  );
}


function NavMenuItems({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { lang } = useLanguage();
  const { data: items } = useQuery({
    queryKey: ["navbar-menu-items"],
    queryFn: fetchNavbarItems,
    staleTime: 5 * 60 * 1000,
  });
  const list = items || DEFAULT_NAVBAR_ITEMS;
  return (
    <>
      {list.map((it, idx) => {
        const Icon = NAVBAR_ICONS[it.icon] || Home;
        return (
          <button
            key={`${it.label}-${idx}`}
            onClick={() => onNavigate(it.href)}
            className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50"
          >
            <Icon className="w-4 h-4 text-primary shrink-0" />
            <span>{translateNavLabel(it, lang)}</span>
          </button>
        );
      })}
    </>
  );
}


function BottomNav({ pathname }: { pathname: string }) {
  const { lang } = useLanguage();
  const { openCart, totalItems } = useCart();

  // Hide mobile bottom tab bar on desktop, and on product details / checkout / landing pages
  if (
    pathname.startsWith("/product/") ||
    pathname.startsWith("/lp/") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order-confirmed") ||
    pathname.startsWith("/invoice/")
  ) {
    return null;
  }

  const isHomeActive = pathname === "/";
  const isCategoriesActive = pathname.startsWith("/categories") || pathname.startsWith("/category");
  const isAccountActive = pathname.startsWith("/profile");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-40 bg-white border-t border-gray-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-4 h-14">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] transition-colors ${
            isHomeActive ? "text-[#e41d56] font-semibold" : "text-gray-500 hover:text-gray-800 font-medium"
          }`}
        >
          <Home
            className={`w-5 h-5 ${isHomeActive ? "fill-current text-[#e41d56]" : "text-gray-500"}`}
            strokeWidth={isHomeActive ? 2.2 : 1.8}
          />
          <span className="leading-tight">{lang === "en" ? "Home" : "হোম"}</span>
        </Link>

        {/* 2. Categories */}
        <Link
          to="/categories"
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] transition-colors ${
            isCategoriesActive ? "text-[#e41d56] font-semibold" : "text-gray-500 hover:text-gray-800 font-medium"
          }`}
        >
          <LayoutGrid
            className={`w-5 h-5 ${isCategoriesActive ? "text-[#e41d56]" : "text-gray-500"}`}
            strokeWidth={isCategoriesActive ? 2.2 : 1.8}
          />
          <span className="leading-tight">{lang === "en" ? "Categories" : "ক্যাটাগরি"}</span>
        </Link>

        {/* 3. Cart */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center gap-0.5 text-[11px] text-gray-500 hover:text-gray-800 font-medium transition-colors"
          aria-label="Cart"
        >
          <div className="relative flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#e41d56] text-white text-[9px] font-extrabold flex items-center justify-center ring-1 ring-white">
                {totalItems}
              </span>
            )}
          </div>
          <span className="leading-tight">{lang === "en" ? "Cart" : "কার্ট"}</span>
        </button>

        {/* 4. Account */}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] transition-colors ${
            isAccountActive ? "text-[#e41d56] font-semibold" : "text-gray-500 hover:text-gray-800 font-medium"
          }`}
        >
          <User
            className={`w-5 h-5 ${isAccountActive ? "text-[#e41d56]" : "text-gray-500"}`}
            strokeWidth={isAccountActive ? 2.2 : 1.8}
          />
          <span className="leading-tight">{lang === "en" ? "Account" : "একাউন্ট"}</span>
        </Link>
      </div>
    </nav>
  );
}

const THEME_OPTIONS: { value: ThemeMode; label: string; colors: string[] }[] = [
  { value: "light", label: "লাইট", colors: ["bg-white", "bg-green-700", "bg-amber-500"] },
  { value: "leaf", label: "লিফ", colors: ["bg-green-50", "bg-green-700", "bg-lime-600"] },
  { value: "sky", label: "স্কাই", colors: ["bg-sky-50", "bg-sky-500", "bg-indigo-500"] },
  { value: "ocean", label: "ওশান", colors: ["bg-blue-50", "bg-blue-600", "bg-purple-500"] },
  { value: "sunset", label: "সানসেট", colors: ["bg-orange-50", "bg-pink-600", "bg-orange-500"] },
  { value: "rose", label: "রোজ", colors: ["bg-pink-50", "bg-pink-500", "bg-orange-400"] },
  { value: "doodle", label: "ডুডল", colors: ["bg-amber-50", "bg-amber-600", "bg-orange-600"] },
  { value: "dark", label: "ডার্ক", colors: ["bg-slate-800", "bg-green-500", "bg-amber-500"] },
  { value: "midnight", label: "মিডনাইট", colors: ["bg-slate-900", "bg-blue-500", "bg-purple-500"] },
  { value: "silver", label: "সিলভার", colors: ["bg-gray-900", "bg-gray-600", "bg-gray-300"] },
];

function ThemePicker() {
  const { publicTheme, setPublicTheme } = useTheme();
  const { lang } = useLanguage();
  return (
    <div className="px-4 py-3 border-t border-gray-100 mt-2">
      <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-gray-700">
        <Palette className="w-3.5 h-3.5" />
        {lang === "en" ? "Select Theme" : "থিম নির্বাচন করুন"}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {THEME_OPTIONS.map((th) => {
          const active = publicTheme === th.value;
          return (
            <button
              key={th.value}
              onClick={() => setPublicTheme(th.value)}
              className={cn(
                "relative rounded-lg border-2 p-2 text-center transition-all",
                active ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:border-gray-300"
              )}
            >
              {active && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <div className="flex gap-0.5 justify-center mb-1">
                {th.colors.map((c, i) => (
                  <div key={i} className={cn("w-3 h-3 rounded-full border border-gray-200", c)} />
                ))}
              </div>
              <p className="text-[10px] font-medium text-gray-700">{th.label}</p>
            </button>
          );
        })}
      </div>
      <TexturePicker />
    </div>
  );
}

const TEXTURE_OPTIONS: { value: "bamboo" | "tropical" | "golden" | "shadow" | "wood"; label: string; preview: string }[] = [
  { value: "bamboo", label: "বাঁশপাতা", preview: "linear-gradient(135deg,#dcfce7,#86efac)" },
  { value: "tropical", label: "ট্রপিক্যাল", preview: "linear-gradient(135deg,#d1fae5,#10b981)" },
  { value: "golden", label: "গোল্ডেন", preview: "linear-gradient(135deg,#fef3c7,#f59e0b)" },
  { value: "shadow", label: "শ্যাডো", preview: "linear-gradient(135deg,#e2e8f0,#475569)" },
  { value: "wood", label: "উড গ্রেইন", preview: `url(${woodTexture}) center/cover` },
];

function TexturePicker() {
  const { texture, setTexture, textureEnabled, setTextureEnabled } = useTheme();
  const { lang } = useLanguage();
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <ImageIcon className="w-3.5 h-3.5" />
          {lang === "en" ? "Texture" : "টেক্সচার"}
        </div>
        <button
          onClick={() => setTextureEnabled(!textureEnabled)}
          className={cn(
            "relative w-9 h-5 rounded-full transition-colors",
            textureEnabled ? "bg-primary" : "bg-gray-300"
          )}
          aria-label="Toggle texture"
        >
          <span
            className={cn(
               "absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
               textureEnabled ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
      </div>
      {textureEnabled && (
      <div className="grid grid-cols-2 gap-2">

        {TEXTURE_OPTIONS.map((tx) => {
          const active = texture === tx.value;
          return (
            <button
              key={tx.value}
              onClick={() => setTexture(tx.value)}
              className={cn(
                "relative rounded-lg border-2 p-2 text-center transition-all",
                active ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:border-gray-300"
              )}
            >
              {active && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center z-10 shadow">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <div className="h-8 rounded-md mb-1 overflow-hidden" style={{ background: tx.preview }} />
              <p className="text-[10px] font-medium text-gray-700">{tx.label}</p>
            </button>
          );
        })}
      </div>
      )}
    </div>

  );
}

export default Navbar;
