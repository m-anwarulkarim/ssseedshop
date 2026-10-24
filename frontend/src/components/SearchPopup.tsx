import { API_URL } from "@/config/env";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Search, Mic, Sparkles, ArrowRight, SlidersHorizontal, Package, TrendingUp } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { handleImageError } from "@/lib/imageFallback";

interface SearchPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const POPULAR_SEARCHES = [
  "তরমুজ",
  "মিষ্টি কুমড়া",
  "করলা",
  "শসা",
  "টমেটো",
  "ঢেঁড়স",
  "লাউ",
  "ক্যাপসিকাম",
];

const MAX_PRICE = 2000;

export default function SearchPopup({ open, onOpenChange }: SearchPopupProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("সব");
  const [maxPrice, setMaxPrice] = useState<number>(MAX_PRICE);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Voice input
  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "bn-BD";
    rec.onresult = (e: any) => setSearchQuery(e.results[0][0].transcript);
    rec.start();
  };

  const runSearch = useCallback(async (q: string) => {
    setSearching(true);
    setHasSearched(true);
    
    const url = API_URL;
    const res = await fetch(`${url}/products/get.php`);
    let data = await res.json();
    data = data.filter((p: any) => !p.is_hidden);
    
    if (q) {
      const lowerQ = q.toLowerCase();
      data = data.filter((p: any) => 
        (p.name && p.name.toLowerCase().includes(lowerQ)) || 
        (p.sku && p.sku.toLowerCase().includes(lowerQ)) ||
        (p.short_description && p.short_description.toLowerCase().includes(lowerQ))
      );
    }
    
    if (activeCategory && activeCategory !== "সব") {
      data = data.filter((p: any) => p.category === activeCategory || (Array.isArray(p.categories) && p.categories.includes(activeCategory)));
    }
    
    setSearchResults(data.slice(0, 50));
    setSearching(false);
  }, [activeCategory]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q && activeCategory === "সব") {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    const t = setTimeout(() => runSearch(q), 200);
    return () => clearTimeout(t);
  }, [searchQuery, activeCategory, runSearch]);

  useEffect(() => {
    if (!open) return;
    const url = API_URL;
    fetch(`${url}/categories/get.php`)
      .then((res) => res.json())
      .then((data) => {
        data = data.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        setCategories(data || []);
      });
  }, [open]);

  const closePopup = () => {
    onOpenChange(false);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setActiveCategory("সব");
    setMaxPrice(MAX_PRICE);
    setInStockOnly(false);
  };

  // Client-side filter by max price
  const filteredResults = useMemo(() => {
    return searchResults.filter((p) => {
      const price = p.offer_price ?? p.regular_price ?? 0;
      return price <= maxPrice;
    });
  }, [searchResults, maxPrice]);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && closePopup()}>
      <SheetContent
        side="top"
        className="p-0 border-0 max-h-[92vh] overflow-hidden flex flex-col bg-white"
      >
        {/* Top CTA — সকল পণ্য দেখুন */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              closePopup();
              navigate("/products");
            }}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-700 to-emerald-800 text-white font-bold text-[15px] flex items-center justify-between px-4 shadow-[0_8px_22px_-10px_rgba(16,80,30,0.6)]"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              সকল পণ্য দেখুন
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar row */}
        <div className="px-3 pt-3 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্যের নাম লিখুন..."
              autoFocus
              className="w-full h-11 rounded-full bg-white border border-emerald-200 pl-9 pr-10 text-[14px] text-emerald-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 shadow-sm"
            />
            <button
              type="button"
              onClick={handleVoice}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-emerald-700 hover:bg-emerald-50"
              aria-label="Voice"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={closePopup}
            className="text-[14px] font-medium text-emerald-700 hover:text-emerald-900 px-2"
          >
            বাতিল
          </button>
        </div>

        {/* Category pills */}
        <div className="px-3 pt-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {["সব", ...categories.map((c) => c.name)].map((cat) => {
              const active = activeCategory === cat;
              const label =
                cat === "সব"
                  ? "সব"
                  : categories.find((c) => c.name === cat)?.display_name || cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                    active
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-white text-emerald-900 border-emerald-200 hover:border-emerald-400"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price slider + stock toggle */}
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between text-[12px] mb-1.5">
            <div className="flex items-center gap-1.5 text-emerald-900">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>দাম পর্যন্ত</span>
              <span className="font-bold">৳{maxPrice}</span>
            </div>
            <button
              onClick={() => setInStockOnly((v) => !v)}
              className="flex items-center gap-1.5"
              aria-label="In stock toggle"
            >
              <Package className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-emerald-900">স্টকে</span>
              <span
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  inStockOnly ? "bg-emerald-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    inStockOnly ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={50}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {/* Popular searches */}
          {!hasSearched && !searching && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-emerald-900">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[12px] font-bold">পপুলার সার্চ</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[12.5px] text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searching && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-9 h-9 border-[3px] border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
              <p className="text-[12.5px] text-emerald-800 font-medium mt-3">খুঁজছি...</p>
            </div>
          )}

          {!searching && hasSearched && filteredResults.length === 0 && (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 mb-2">
                <Search className="w-7 h-7 text-amber-500" />
              </div>
              <p className="text-[14px] font-bold text-emerald-950">কোনো পণ্য পাওয়া যায়নি</p>
              <p className="text-[12px] text-gray-500 mt-1">অন্য কীওয়ার্ড চেষ্টা করুন</p>
            </div>
          )}

          {!searching && filteredResults.length > 0 && (
            <>
              <p className="text-[11.5px] text-gray-500 mb-2 mt-1">
                <span className="font-bold text-emerald-800">{filteredResults.length}</span> টি ফলাফল
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredResults.map((p: any) => (
                  <a
                    key={p.id}
                    href={`/product/${p.slug || p.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      closePopup();
                      navigate(`/product/${p.slug || p.id}`);
                    }}
                    className="group flex flex-col rounded-xl border border-emerald-100 bg-white overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all"
                  >
                    {p.product_image && (
                      <div className="relative aspect-square overflow-hidden bg-emerald-50">
                        <img
                          src={p.product_image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={handleImageError}
                        />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-[12px] font-semibold text-emerald-950 line-clamp-2 leading-snug min-h-[30px]">
                        {p.name}
                      </p>
                      <div className="flex items-baseline gap-1 mt-1">
                        {p.offer_price ? (
                          <>
                            <span className="text-[13px] font-extrabold text-emerald-700 tabular-nums">
                              ৳{p.offer_price}
                            </span>
                            <span className="text-[10px] line-through text-gray-400 tabular-nums">
                              ৳{p.regular_price}
                            </span>
                          </>
                        ) : (
                          <span className="text-[13px] font-extrabold text-emerald-700 tabular-nums">
                            ৳{p.regular_price}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
