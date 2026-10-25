import { useState, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import ProductCard from "@/components/ProductCard";
import SEOHead from "@/components/SEOHead";
import {
  detectDomainInfo,
  buildDynamicKeywords,
  buildBreadcrumbSchema,
} from "@/lib/seoDomain";
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

  const domainInfo = useMemo(() => detectDomainInfo(), []);
  const allCanonical = `${domainInfo.origin}/all-products`;

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

  const allKeywords = useMemo(() => {
    return buildDynamicKeywords({
      customKeywords: [
        "সকল বীজ",
        "সব বীজ",
        "বীজ তালিকা",
        "সবজির বীজ কালেকশন",
        "ফুলের বীজ কালেকশন",
        "বীজের মেলা",
        "অনলাইন সিড মার্কেট",
        "buy seeds bangladesh",
      ],
    });
  }, []);

  const allJsonLd = useMemo(() => {
    const breadcrumb = buildBreadcrumbSchema([
      { name: "হোম", url: domainInfo.origin },
      { name: "সকল বীজ ও পণ্য", url: allCanonical },
    ]);

    const collectionPage = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${allCanonical}#webpage`,
      url: allCanonical,
      name: `সকল বীজ ও কৃষি পণ্য কালেকশন | ${domainInfo.primaryBrandName}`,
      description: `উন্নত মানের দেশী ও বিদেশী ফুল, ফল, সবজি ও হাইব্রিড বীজ কালেকশন।`,
      isPartOf: {
        "@id": `${domainInfo.origin}/#website`,
      },
    };

    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: (products || []).slice(0, 24).map((p: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${domainInfo.origin}/product/${p.slug || p.id}`,
        name: p.name,
      })),
    };

    return [breadcrumb, collectionPage, itemList];
  }, [domainInfo, allCanonical, products]);

  const allSeoTitle = `সকল বীজ ও কৃষি পণ্য — দেশী ও বিদেশী হাইব্রিড বীজ কালেকশন | Ss Seed Shop`;
  const allSeoDesc = `উন্নত জাতের ফুল বীজ, সবজি বীজ, ফল বীজ ও হাইব্রিড বীজের বিশাল সমাহার। ১০০% আসল ও পরীক্ষিত বীজ কিনুন সাশ্রয়ী মূল্যে — Ss Seed Shop (AB Seed)। সারাদেশে দ্রুত ক্যাশ অন হোম ডেলিভারি।`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={allSeoTitle}
        description={allSeoDesc}
        keywords={allKeywords}
        url={allCanonical}
        jsonLd={allJsonLd}
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
