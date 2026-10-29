import { useEffect, useRef, useState, useMemo } from "react";
import type { PointerEvent } from "react";
import { useCategories } from "@/hooks/useCatalog";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  const { lang } = useLanguage();
  const { data: categories } = useCategories();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Mouse drag state for desktop
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const categoryTabs = useMemo(() => {
    const list = [
      { name: "সকল", display: lang === "en" ? "All" : "সকল" },
    ];
    if (categories && Array.isArray(categories)) {
      const activeCats = categories
        .filter((c) => !c.is_hidden)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
      for (const c of activeCats) {
        list.push({
          name: c.name,
          display: c.display_name || c.name,
        });
      }
    }
    return list;
  }, [categories, lang]);

  // Check scroll position for desktop arrows
  const checkScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categoryTabs]);

  // Scroll active tab into view smoothly
  useEffect(() => {
    const target = tabRefs.current[activeCategory];
    if (target && scrollerRef.current) {
      target.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
    checkScroll();
  }, [activeCategory]);

  const scrollBy = (offset: number) => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Mouse drag handling on desktop
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const el = scrollerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = el.scrollLeft;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || !isDraggingRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const deltaX = event.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 5) {
      hasDraggedRef.current = true;
      el.scrollLeft = dragStartScrollRef.current - deltaX;
      checkScroll();
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    isDraggingRef.current = false;
    if (hasDraggedRef.current) {
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 50);
    }
  };

  const handleTabClick = (categoryName: string) => {
    if (hasDraggedRef.current) return;
    onCategoryChange(categoryName);
  };

  return (
    <div className="sticky top-[78px] md:top-[128px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="max-w-screen-2xl mx-auto relative px-2 sm:px-4">
        {/* Left Arrow (Desktop only when overflowed) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollBy(-220)}
            aria-label="Scroll left"
            className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 shadow-md border border-gray-200 text-gray-700 items-center justify-center hover:bg-gray-50 hover:text-emerald-700 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}

        {/* Categories Horizontal Scroll Row (PC + Mobile) */}
        <div
          ref={scrollerRef}
          onScroll={checkScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex items-center gap-2 sm:gap-3 py-2.5 px-2 sm:px-4 overflow-x-auto scrollbar-hide no-scrollbar select-none scroll-smooth sm:justify-start lg:justify-center"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.name;
            return (
              <button
                key={tab.name}
                ref={(el) => (tabRefs.current[tab.name] = el)}
                type="button"
                onClick={() => handleTabClick(tab.name)}
                className={`px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-[15px] sm:text-base whitespace-nowrap cursor-pointer select-none transition-all duration-200 leading-none shrink-0 inline-flex items-center justify-center ${
                  isActive
                    ? "bg-[#1b6b3e] text-white font-bold border border-[#1b6b3e] shadow-[0_6px_16px_rgba(27,107,62,0.42)] ring-1 ring-emerald-600/30 scale-[1.02]"
                    : "bg-white text-slate-700 font-semibold border border-slate-200/90 hover:border-emerald-600/40 hover:text-emerald-700 hover:bg-emerald-50/20 active:scale-95"
                }`}
              >
                {tab.display}
              </button>
            );
          })}
        </div>

        {/* Right Arrow (Desktop only when overflowed) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollBy(220)}
            aria-label="Scroll right"
            className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 shadow-md border border-gray-200 text-gray-700 items-center justify-center hover:bg-gray-50 hover:text-emerald-700 active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryTabs;
