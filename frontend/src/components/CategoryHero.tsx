import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { handleImageError } from "@/lib/imageFallback";

interface CategoryHeroProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryHero = ({ activeCategory, onCategoryChange }: CategoryHeroProps) => {
  const { data: categories } = useQuery({
    queryKey: ["public-categories"],
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${url}/categories/get.php`);
      let data = await res.json();
      data = data.sort((a: any, b: any) => (a.position || 0) - (b.position || 0) || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return data;
    },
  });

  const tabs = [
    { name: "সকল", display: "সকল", image: null as string | null },
    ...(categories?.map((c) => ({
      name: c.name,
      display: c.display_name || c.name,
      image: c.image as string | null,
    })) || []),
  ];

  return (
    <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-md border-b border-border/60 py-2">
      <div className="max-w-screen-2xl mx-auto px-2 sm:px-4">
        <div
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollPaddingLeft: "0.5rem" }}
        >
          {tabs.map((t) => {
            const isActive = activeCategory === t.name;
            return (
              <button
                key={t.name}
                onClick={() => onCategoryChange(t.name)}
                className={`snap-start flex-shrink-0 flex flex-col items-center gap-1 group transition-all duration-200 ${
                  isActive ? "scale-105" : ""
                }`}
                style={{ width: "calc((100% - 1.5rem) / 4)", maxWidth: 96, minWidth: 70 }}
                aria-pressed={isActive}
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-all duration-200 ${
                    isActive
                      ? "border-primary shadow-lg shadow-primary/30"
                      : "border-border group-hover:border-primary/50"
                  }`}
                >
                  {t.image ? (
                    <img
                      src={t.image}
                      alt={t.display}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      ALL
                    </div>
                  )}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-semibold text-center leading-tight line-clamp-1 ${
                    isActive ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {t.display}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryHero;
