import { useState, useCallback, useEffect, useMemo } from "react";
import { Search, Mic, ArrowRight, RotateCw, X, ArrowLeft, TrendingUp } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAllProducts, useCategories, Product } from "@/hooks/useCatalog";
import { resolveImageUrl, handleImageError } from "@/lib/imageFallback";
import { POPULAR_PRESETS } from "@/components/DesktopSearchBar";

interface SearchPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchPopup({ open, onOpenChange }: SearchPopupProps) {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { data: allProducts } = useAllProducts();
  const { data: categories = [] } = useCategories();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("সব");
  const [presetIndex, setPresetIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // Cycle popular presets on refresh button click
  const handleRefresh = () => {
    setIsSpinning(true);
    setPresetIndex((prev) => (prev + 1) % POPULAR_PRESETS.length);
    setTimeout(() => setIsSpinning(false), 500);
  };

  // Voice input
  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "bn-BD";
    rec.onresult = (e: any) => setSearchQuery(e.results[0][0].transcript);
    rec.start();
  };

  const closePopup = () => {
    onOpenChange(false);
    setSearchQuery("");
    setActiveCategory("সব");
  };

  const handleSubmit = (overrideQuery?: string) => {
    const target = overrideQuery !== undefined ? overrideQuery : searchQuery;
    const trimmed = target.trim();
    closePopup();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/products");
    }
  };

  // Instant filtering (< 1ms)
  const filteredResults = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed && activeCategory === "সব") return [];
    if (!allProducts) return [];

    let list = allProducts;

    if (trimmed) {
      list = list.filter((p: Product) => {
        const nameMatch = p.name && p.name.toLowerCase().includes(trimmed);
        const skuMatch = p.sku && p.sku.toLowerCase().includes(trimmed);
        const descMatch = p.short_description && p.short_description.toLowerCase().includes(trimmed);
        const catMatch =
          (p.category && p.category.toLowerCase().includes(trimmed)) ||
          (Array.isArray(p.categories) && p.categories.some((c) => String(c).toLowerCase().includes(trimmed)));
        return nameMatch || skuMatch || descMatch || catMatch;
      });
    }

    if (activeCategory && activeCategory !== "সব") {
      list = list.filter(
        (p: Product) =>
          p.category === activeCategory ||
          (Array.isArray(p.categories) && p.categories.includes(activeCategory))
      );
    }

    return list.slice(0, 30);
  }, [searchQuery, activeCategory, allProducts]);

  const activePresets = POPULAR_PRESETS[presetIndex];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && closePopup()}>
      <SheetContent
        side="top"
        className="p-0 border-0 max-h-[92vh] overflow-hidden flex flex-col bg-white [&>button:last-child]:hidden"
      >
        {/* Top Search Bar Row */}
        <div className="px-3 pt-3 pb-2 flex items-center gap-2 border-b border-gray-100">
          <button
            type="button"
            onClick={closePopup}
            className="p-2 -ml-1 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Search Input Box */}
          <div className="flex-1 flex items-center h-11 pl-3.5 pr-1.5 rounded-xl bg-gray-50 border-2 border-pink-200 focus-within:border-[#e41d56] focus-within:ring-2 focus-within:ring-pink-100 transition-all">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={lang === "en" ? "Search seeds & products..." : "বীজ বা পছন্দের পণ্য খুঁজুন..."}
              autoFocus
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full"
                aria-label="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleVoice}
              className="p-1.5 text-gray-400 hover:text-gray-600 mr-1"
              aria-label="Voice"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Pink Search Action Button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-100/90 text-[#e41d56] active:scale-95 transition-all shrink-0"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Category Pills (Horizontal Scroll) */}
        <div className="px-3 py-2 bg-gray-50/60 border-b border-gray-100">
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {["সব", ...categories.map((c) => c.name)].map((cat) => {
              const active = activeCategory === cat;
              const label =
                cat === "সব"
                  ? (lang === "en" ? "All" : "সকল")
                  : categories.find((c) => c.name === cat)?.display_name || cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? "bg-[#e41d56] text-white border-[#e41d56] shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:border-pink-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {/* STATE 1: Empty Query - Popular Right Now (Matches Screenshot) */}
          {!searchQuery.trim() && activeCategory === "সব" && (
            <div>
              <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <TrendingUp className="w-4 h-4 text-[#e41d56]" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {lang === "en" ? "Popular Right Now" : "জনপ্রিয় অনুসন্ধান"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
                  title="Refresh"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 transition-transform duration-500 ${
                      isSpinning ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Pill Tags */}
              <div className="flex flex-wrap gap-2">
                {activePresets.map((item, idx) => (
                  <button
                    key={`${item.tag}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item.tag);
                      handleSubmit(item.tag);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-pink-50 hover:border-pink-300 hover:text-[#e41d56] text-gray-700 text-xs font-medium transition-all active:scale-95"
                  >
                    {item.isHot && <span className="text-xs">🔥</span>}
                    <span>{item.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STATE 2: Has Results */}
          {filteredResults.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">
                <span className="font-bold text-[#e41d56]">{filteredResults.length}</span>{" "}
                {lang === "en" ? "products found" : "টি পণ্য পাওয়া গেছে"}
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {filteredResults.map((p) => {
                  const price = p.offer_price ?? p.regular_price ?? 0;
                  const oldPrice = p.offer_price ? p.regular_price : null;
                  const imgUrl = resolveImageUrl(p.product_image || (p.images && p.images[0]));
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        closePopup();
                        navigate(`/product/${p.slug || p.id}`);
                      }}
                      className="flex flex-col rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-pink-200 transition-all cursor-pointer"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        <img
                          src={imgUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[32px]">
                          {p.name}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
                            ৳{price}
                          </span>
                          {oldPrice && (
                            <span className="text-[10px] line-through text-gray-400 tabular-nums">
                              ৳{oldPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View all button */}
              <div className="pt-3 mt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="w-full py-2.5 rounded-xl bg-[#e41d56] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <span>{lang === "en" ? "View All Search Results" : "সকল সার্চ ফলাফল দেখুন"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: No Results */}
          {searchQuery.trim() && filteredResults.length === 0 && (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-[#e41d56] mb-2">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-800">কোনো পণ্য পাওয়া যায়নি</p>
              <p className="text-xs text-gray-400 mt-1">অন্য কীওয়ার্ড বা বীজের নাম লিখে চেষ্টা করুন</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
