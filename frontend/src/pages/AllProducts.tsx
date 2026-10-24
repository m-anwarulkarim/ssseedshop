import { useState, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import ProductCard from "@/components/ProductCard";
import SEOHead from "@/components/SEOHead";
import CategoryTabs from "@/components/CategoryTabs";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { usePageViewTracker } from "@/hooks/useAnalyticsTracker";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAllProducts } from "@/hooks/useCatalog";

const PAGE_SIZE = 12;

export default function AllProducts() {
  usePageViewTracker();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const handleCategoryChange = useCallback((cat: string) => {
    if (cat === "সকল") return;
    const slug = cat.trim().toLowerCase().replace(/\s+/g, "-");
    navigate(`/shop/${encodeURIComponent(slug)}`);
  }, [navigate]);

  const { data: allProducts, isLoading } = useAllProducts();

  const products = useMemo(() => {
    return (allProducts || []).slice(0, visibleCount);
  }, [allProducts, visibleCount]);

  const hasNextPage = (allProducts?.length || 0) > visibleCount;
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  const sentinelRef = useInfiniteScroll(loadMore, hasNextPage, false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="সকল পণ্য"
        description="আমাদের সকল বীজের সংগ্রহ দেখুন।"
      />
      <Navbar />
      <SideCart />
      <CategoryTabs activeCategory="সকল" onCategoryChange={handleCategoryChange} />
      <main className="flex-1">
        <div className="max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 px-4 py-3 mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
              {t("সকল পণ্য", "All Products")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t("আমাদের সকল পণ্যের সংগ্রহ", "Our complete product collection")}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">{t("পণ্য লোড হচ্ছে...", "Loading products...")}</p>
            </div>
          ) : !products.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">{t("কোনো পণ্য পাওয়া যায়নি", "No products found")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div ref={sentinelRef} className="flex justify-center py-6">
                {hasNextPage && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
