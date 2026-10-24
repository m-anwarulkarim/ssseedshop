import { Loader2, ArrowRight, Trophy, Flame, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAllProducts } from "@/hooks/useCatalog";

const ProductsSection = () => {
  const { t } = useLanguage();
  const limit = 6;

  const { data: allProducts, isLoading } = useAllProducts();

  const products = (allProducts || [])
    .filter((p: any) => !p.is_hidden)
    .sort((a: any, b: any) => {
      if (a.is_popular && !b.is_popular) return -1;
      if (!a.is_popular && b.is_popular) return 1;
      return (a.position || 0) - (b.position || 0) || new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    })
    .slice(0, limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="py-5 md:py-7">
      <div className="max-w-screen-2xl mx-auto px-0">
        <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100/60 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-emerald-900/20 p-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-base sm:text-xl font-bold text-foreground leading-tight">
              {t("জনপ্রিয় পণ্যসমূহ", "Popular Products")}
            </h2>
            <Link
              to="/products"
              className="flex items-center gap-1 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 whitespace-nowrap"
            >
              {t("সকল পণ্য দেখুন", "View All")}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {products.map((product, idx) => (
              <div key={product.id} className="relative">
                <PopularBadge index={idx} />
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;

function PopularBadge({ index }: { index: number }) {
  const { t } = useLanguage();
  const badges = [
    { label: t("#১ সেরা বিক্রিত", "#1 Best Seller"), icon: Trophy, cls: "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-amber-500/40" },
    { label: t("#২ হট", "#2 Hot"), icon: Flame, cls: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-red-500/40" },
    { label: t("#৩ ট্রেন্ডিং", "#3 Trending"), icon: TrendingUp, cls: "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-purple-500/40" },
    { label: t("জনপ্রিয়", "Popular"), icon: Sparkles, cls: "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/40" },
  ];
  const b = badges[Math.min(index, badges.length - 1)];
  const Icon = b.icon;
  return (
    <div className={`absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold shadow-md ${b.cls}`}>
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      <span className="leading-none">{b.label}</span>
    </div>
  );
}

