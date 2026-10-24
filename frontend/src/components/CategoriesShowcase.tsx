import { Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { handleImageError } from "@/lib/imageFallback";
import { useCategories } from "@/hooks/useCatalog";

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

const CategoriesShowcase = () => {
  const { t } = useLanguage();
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-5 md:py-7">
      <div className="section-container">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100/60 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-base sm:text-xl font-bold text-foreground leading-tight">
              {t("ক্যাটাগরি অনুযায়ী","Browse by")}{" "}
              <span className="text-emerald-600 dark:text-emerald-400">{t("পণ্য দেখুন","Category")}</span>
            </h2>
            <Link
              to="/categories"
              className="flex items-center gap-1 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 whitespace-nowrap"
            >
              {t("সব দেখুন","View all")}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to={`/shop/${toSlug(cat.name)}`}
                className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.display_name || cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary/40">
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight mb-0.5">
                    {cat.display_name || cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 mb-1.5">
                      {cat.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {t("পণ্য দেখুন","View products")}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesShowcase;
