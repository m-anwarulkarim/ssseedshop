import { useState, useRef, useEffect, useMemo } from "react";
import { Search, RotateCw, X, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAllProducts, Product } from "@/hooks/useCatalog";
import { resolveImageUrl, handleImageError } from "@/lib/imageFallback";

export const POPULAR_PRESETS = [
  [
    { tag: "হাইব্রিড টমেটো", isHot: true },
    { tag: "লাল সালভিয়া ফুল", isHot: true },
    { tag: "কাঁচা মরিচ বীজ", isHot: false },
    { tag: "দেশি ধনিয়া পাতা", isHot: false },
    { tag: "হাইব্রিড শসা", isHot: false },
    { tag: "লাল শাক", isHot: false },
    { tag: "করলা বীজ", isHot: false },
    { tag: "লাউ বীজ", isHot: false },
  ],
  [
    { tag: "থাই লাল শাক", isHot: true },
    { tag: "মিষ্টি কুমড়া", isHot: true },
    { tag: "কলমি শাক", isHot: false },
    { tag: "তরমুজ বীজ", isHot: false },
    { tag: "হাইব্রিড বেগুন", isHot: false },
    { tag: "শিম বীজ", isHot: false },
    { tag: "পুদিনা পাতা", isHot: false },
    { tag: "গাজর বীজ", isHot: false },
  ],
  [
    { tag: "সূর্যমুখী ফুল", isHot: true },
    { tag: "বোম্বাই মরিচ", isHot: true },
    { tag: "ঢ্যাঁড়শ বীজ", isHot: false },
    { tag: "বাঁধাকপি বীজ", isHot: false },
    { tag: "ফুলকপি বীজ", isHot: false },
    { tag: "চিচিঙ্গা বীজ", isHot: false },
    { tag: "পটল বীজ", isHot: false },
    { tag: "লেটুস পাতা", isHot: false },
  ],
];

export default function DesktopSearchBar() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { data: allProducts } = useAllProducts();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [presetIndex, setPresetIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle popular presets on refresh button click
  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpinning(true);
    setPresetIndex((prev) => (prev + 1) % POPULAR_PRESETS.length);
    setTimeout(() => setIsSpinning(false), 500);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation: Escape closes dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (overrideQuery?: string) => {
    const target = overrideQuery !== undefined ? overrideQuery : query;
    const trimmed = target.trim();
    setIsOpen(false);
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/products");
    }
  };

  const handleSelectTag = (tag: string) => {
    setQuery(tag);
    handleSubmit(tag);
  };

  // Instant live search results (< 1ms)
  const filteredProducts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || !allProducts) return [];

    return allProducts
      .filter((p: Product) => {
        const nameMatch = p.name && p.name.toLowerCase().includes(trimmed);
        const skuMatch = p.sku && p.sku.toLowerCase().includes(trimmed);
        const catMatch =
          (p.category && p.category.toLowerCase().includes(trimmed)) ||
          (Array.isArray(p.categories) && p.categories.some((c) => String(c).toLowerCase().includes(trimmed)));
        return nameMatch || skuMatch || catMatch;
      })
      .slice(0, 6);
  }, [query, allProducts]);

  const activePresets = POPULAR_PRESETS[presetIndex];

  return (
    <div ref={containerRef} className="relative w-full max-w-xl lg:max-w-2xl">
      {/* Search Bar Input Container */}
      <div
        className={`flex items-center h-11 pl-4 pr-1.5 rounded-xl bg-white border-2 transition-all shadow-sm ${
          isOpen
            ? "border-pink-300 ring-4 ring-pink-50/80 shadow-md"
            : "border-gray-200/90 hover:border-pink-200"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={lang === "en" ? "Search seeds, plants & gardening..." : "বীজ বা পছন্দের পণ্য খুঁজুন..."}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />

        {/* Clear query button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            aria-label="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Pink Search Action Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-50 text-[#e41d56] hover:bg-pink-100 active:scale-95 transition-all shrink-0 cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Floating Dropdown Attached Directly Underneath (Matches Reference Screenshot) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* STATE 1: Empty Query - Show "Popular Right Now" */}
          {!query.trim() ? (
            <div>
              {/* Header: Popular Right Now + Refresh button */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {lang === "en" ? "Popular Right Now" : "জনপ্রিয় অনুসন্ধান"}
                </span>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  title={lang === "en" ? "Shuffle suggestions" : "নতুন পরামর্শ দেখুন"}
                  aria-label="Refresh"
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
                    onClick={() => handleSelectTag(item.tag)}
                    className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-pink-50/70 hover:border-pink-300 hover:text-[#e41d56] text-gray-700 text-xs font-medium transition-all active:scale-95"
                  >
                    {item.isHot && <span className="text-xs leading-none">🔥</span>}
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* STATE 2: User is Typing - Live Instant Product Results */
            <div>
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-50 text-xs text-gray-500">
                <span className="font-semibold text-gray-600">
                  {lang === "en" ? "Search Results" : "পণ্য ফলাফল"} ({filteredProducts.length}টি)
                </span>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="text-xs font-medium text-[#e41d56] hover:underline flex items-center gap-1"
                >
                  <span>{lang === "en" ? "View all" : "সবগুলো দেখুন"}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm font-medium text-gray-700">
                    "{query}" {lang === "en" ? "not found" : "দিয়ে কোনো পণ্য পাওয়া যায়নি"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "en" ? "Try another keyword or seed name" : "অন্য কোনো বীজ বা শাকসবজির নাম লিখে খুঁজুন"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto [scrollbar-width:thin]">
                  {filteredProducts.map((p) => {
                    const price = p.offer_price ?? p.regular_price ?? 0;
                    const oldPrice = p.offer_price ? p.regular_price : null;
                    const imgUrl = resolveImageUrl(p.product_image || (p.images && p.images[0]));
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/product/${p.slug || p.id}`);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-pink-50/40 cursor-pointer transition-colors group"
                      >
                        <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                          <img
                            src={imgUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={handleImageError}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-[#e41d56] transition-colors">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {p.category && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                {p.category}
                              </span>
                            )}
                            {p.in_stock === false && (
                              <span className="text-[10px] text-red-500 font-semibold">স্টক আউট</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-emerald-700 tabular-nums">
                            ৳{price}
                          </div>
                          {oldPrice && (
                            <div className="text-[10px] text-gray-400 line-through tabular-nums">
                              ৳{oldPrice}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Quick Action */}
              <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-pink-50 text-xs font-semibold text-gray-700 hover:text-[#e41d56] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    "{query}" {lang === "en" ? "search all products" : "এর সম্পূর্ণ তালিকা দেখুন"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
