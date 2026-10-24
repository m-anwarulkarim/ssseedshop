import { Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { handleImageError } from "@/lib/imageFallback";

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

const CategoriesSection = () => {
  const { t } = useLanguage();
  const { data: categories, isLoading } = useQuery({
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

  return (
    <section className="py-8 md:py-12 relative overflow-hidden" id="categories">
      {/* Soft background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />

      <div className="section-container relative">
        {/* Header */}
        <div className="flex flex-col items-center mb-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold mb-2">
            <Sparkles className="w-3 h-3" />
            <span>{t("ক্যাটাগরি অনুযায়ী দেখুন", "Browse by Category")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">
            {t("শীর্ষ ক্যাটাগরি", "Top Category")}
          </h2>
          <div className="mt-2 h-[3px] w-12 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop/${toSlug(cat.name)}`}
                className="group relative flex flex-col items-center"
              >
                {/* Card */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/15 shadow-sm group-hover:shadow-xl group-hover:border-primary/40 group-hover:-translate-y-1 transition-all duration-300">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.display_name || cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl font-display font-bold text-primary/50">
                        {cat.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent opacity-90" />

                  {/* Label inside card */}
                  <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3">
                    <span className="block text-[12px] sm:text-sm font-semibold text-white text-center leading-tight drop-shadow">
                      {cat.display_name || cat.name}
                    </span>
                  </div>

                  {/* Corner shine */}
                  <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
