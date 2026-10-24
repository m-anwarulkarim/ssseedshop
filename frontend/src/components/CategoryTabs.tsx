import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";
import { useCategories } from "@/hooks/useCatalog";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  const { data: categories } = useCategories();

  const categoryTabs = [
    { name: "সকল", display: "সকল" },
    ...(categories?.map((c) => ({ name: c.name, display: c.display_name || c.name })) || []),
  ];

  const scrollerRef = useRef<HTMLDivElement>(null);
  const pauseTimer = useRef<number | null>(null);
  const autoPausedRef = useRef(false);
  const startedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const hasCapturedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const pauseAutoScroll = (ms = 4000) => {
    autoPausedRef.current = true;
    if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
    pauseTimer.current = window.setTimeout(() => {
      autoPausedRef.current = false;
    }, ms);
  };

  // Auto-scroll marquee loop with 3s initial delay
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const duration = Math.max(20, categoryTabs.length * 3.5);
    let raf = 0;
    let last = performance.now();
    const startDelay = startedRef.current ? 0 : 3000;
    const startAt = last + startDelay;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (now >= startAt && !autoPausedRef.current && !isDraggingRef.current && el.scrollWidth > el.clientWidth) {
        startedRef.current = true;
        const half = el.scrollWidth / 2;
        const speed = half / duration;
        let next = el.scrollLeft + speed * dt;
        if (next >= half) next -= half;
        el.scrollLeft = next;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [categoryTabs.length]);

  // Desktop mouse drag handling (touch uses native hardware-accelerated scrolling)
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const el = scrollerRef.current;
    if (!el) return;
    pauseAutoScroll();
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    hasCapturedRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = el.scrollLeft;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || !isDraggingRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const deltaX = event.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 10) {
      hasDraggedRef.current = true;
      if (!hasCapturedRef.current) {
        try {
          el.setPointerCapture(event.pointerId);
          hasCapturedRef.current = true;
        } catch {}
      }
      el.scrollLeft = dragStartScrollRef.current - deltaX;
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const el = scrollerRef.current;
    if (el && hasCapturedRef.current) {
      try {
        el.releasePointerCapture(event.pointerId);
      } catch {}
    }
    isDraggingRef.current = false;
    hasCapturedRef.current = false;
    pauseAutoScroll();

    if (hasDraggedRef.current) {
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 50);
    }
  };

  const handleTabClick = (category: string) => {
    if (hasDraggedRef.current) return;
    pauseAutoScroll(6000);
    onCategoryChange(category);
  };

  const renderTab = (tab: { name: string; display: string }, idx: number) => {
    const isActive = activeCategory === tab.name;
    return (
      <button
        key={`${tab.name}-${idx}`}
        type="button"
        onClick={() => handleTabClick(tab.name)}
        className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap border cursor-pointer select-none transition-all duration-200 ${
          isActive
            ? "bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/40 font-semibold"
            : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30 active:scale-95"
        }`}
      >
        {tab.display}
      </button>
    );
  };

  return (
    <div className="sticky top-[78px] z-30 bg-background border-b border-border shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollerRef}
          className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide select-none"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          onMouseEnter={() => (autoPausedRef.current = true)}
          onMouseLeave={() => (autoPausedRef.current = false)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={() => pauseAutoScroll()}
          onTouchStart={() => pauseAutoScroll(5000)}
        >
          {categoryTabs.map((tab, i) => renderTab(tab, i))}
          {/* Duplicate for seamless loop */}
          {categoryTabs.map((tab, i) => renderTab(tab, i + categoryTabs.length))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
