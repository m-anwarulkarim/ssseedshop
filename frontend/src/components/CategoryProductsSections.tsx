import { useState, useMemo } from "react";
import { Loader2, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { handleImageError, resolveImageUrl } from "@/lib/imageFallback";
import { useCategories, useAllProducts } from "@/hooks/useCatalog";

const INITIAL_PER_CATEGORY = 8;
const LOAD_MORE_STEP = 8;

const CategoryProductsSections = () => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<Record<string, number>>({});

  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: allProducts, isLoading: prodLoading } = useAllProducts();

  const grouped = useMemo(() => {
    if (!categories || !allProducts) return {};
    const result: Record<string, any[]> = {};
    categories.forEach((cat) => {
      const catProducts = allProducts.filter((p: any) => {
        const mainCatMatch = p.category === cat.name;
        const catListMatch = Array.isArray(p.categories) && p.categories.includes(cat.name);
        return mainCatMatch || catListMatch;
      });
      result[cat.name] = catProducts;
    });
    return result;
  }, [categories, allProducts]);

  if (catLoading || prodLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  const visibleCats = categories.filter((c) => (grouped?.[c.name]?.length || 0) > 0);

  return (
    <div className="space-y-4 md:space-y-6 pb-6">
      {visibleCats.map((cat) => {
        const allProducts = grouped?.[cat.name] || [];
        const visibleCount = expanded[cat.name] || INITIAL_PER_CATEGORY;
        const products = allProducts.slice(0, visibleCount);
        const hasMore = allProducts.length > visibleCount;
        const slug = cat.name.toLowerCase().replace(/\s+/g, "-");
        const displayName = cat.display_name || cat.name;

        return (
          <section key={cat.id} className="px-0">
            <div className="max-w-screen-2xl mx-auto px-0">
              <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100/60 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-emerald-900/20 p-2">

                {/* Category Header */}
                <div className="flex items-center justify-between mb-3 px-2 sm:px-1 pt-2 sm:pt-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {cat.image && (
                      <img
                        src={resolveImageUrl(cat.image)}
                        alt={displayName}
                        className="w-9 h-9 rounded-lg object-cover ring-1 ring-emerald-100 flex-shrink-0"
                        onError={handleImageError}
                      />
                    )}
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-100 leading-tight truncate">
                        {displayName}
                      </h2>
                      <span className="block h-0.5 w-10 mt-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" />
                    </div>
                  </div>
                  <Link
                    to={`/shop/${slug}`}
                    className="flex items-center gap-1 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 whitespace-nowrap"
                  >
                    {t("সব দেখুন","View all")}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Products grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [cat.name]: visibleCount + LOAD_MORE_STEP,
                        }))
                      }
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    >
                      {t("আরও দেখুন","Show more")} ({allProducts.length - visibleCount})
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default CategoryProductsSections;
