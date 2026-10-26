import { useState, useCallback, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import CategoryTabs from "@/components/CategoryTabs";
import ProductsSection from "@/components/ProductsSection";
import CategoryProductsSections from "@/components/CategoryProductsSections";
import CategoriesShowcase from "@/components/CategoriesShowcase";
import ProductCard from "@/components/ProductCard";
// import FeaturesSection from "@/components/FeaturesSection";
import { useParams, useNavigate } from "react-router-dom";
import { usePageViewTracker } from "@/hooks/useAnalyticsTracker";
import SEOHead from "@/components/SEOHead";
import {
  detectDomainInfo,
  buildDynamicKeywords,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildFAQSchema,
  buildBreadcrumbSchema,
} from "@/lib/seoDomain";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCategories, useAllProducts } from "@/hooks/useCatalog";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

const PAGE_SIZE = 12;

export default function Index() {
  const { t } = useLanguage();
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [search] = useState("");
  usePageViewTracker();
  const [activeCategory, setActiveCategory] = useState("সকল");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: categoriesList } = useCategories();
  const { data: allProducts, isLoading } = useAllProducts();

  useEffect(() => {
    if (!categoriesList) return;
    if (categorySlug) {
      let rawSlug = categorySlug;
      try {
        rawSlug = decodeURIComponent(categorySlug);
      } catch {}
      const targetSlug = rawSlug.trim().toLowerCase().replace(/\s+/g, "-");
      const match = categoriesList.find((c) => {
        const cleanName = c.name.trim().toLowerCase();
        const slugified = cleanName.replace(/\s+/g, "-");
        const cSlug = (c.slug || "").trim().toLowerCase();
        return (
          cleanName === targetSlug ||
          slugified === targetSlug ||
          cSlug === targetSlug ||
          cleanName === rawSlug.trim().toLowerCase()
        );
      });
      setActiveCategory(match ? match.name : "সকল");
    } else {
      setActiveCategory("সকল");
    }
  }, [categorySlug, categoriesList]);

  const handleCategoryChange = useCallback((cat: string) => {
    setVisibleCount(PAGE_SIZE);
    setActiveCategory(cat);
    if (cat === "সকল") {
      navigate(`/`, { replace: true });
    } else {
      const slug = cat.trim().toLowerCase().replace(/\s+/g, "-");
      navigate(`/shop/${encodeURIComponent(slug)}`, { replace: true });
    }
  }, [navigate]);

  // Client-side instant filtering (< 1ms)
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    let list = allProducts.filter((p: any) => !p.is_hidden);

    if (search) {
      const lowerSearch = search.toLowerCase();
      list = list.filter((p: any) =>
        (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
        (p.sku && p.sku.toLowerCase().includes(lowerSearch))
      );
    }

    if (activeCategory && activeCategory !== "সকল") {
      const cleanTarget = activeCategory.trim().toLowerCase();
      list = list.filter((p: any) => {
        const mainCatMatch = (p.category || "").trim().toLowerCase() === cleanTarget;
        const catListMatch =
          Array.isArray(p.categories) &&
          p.categories.some((c: string) => String(c).trim().toLowerCase() === cleanTarget);
        return mainCatMatch || catListMatch;
      });
    }

    return list;
  }, [allProducts, search, activeCategory]);

  const products = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasNextPage = visibleCount < filteredProducts.length;
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  const sentinelRef = useInfiniteScroll(loadMore, hasNextPage, false);

  const domainInfo = useMemo(() => detectDomainInfo(), []);
  const currentCatObj = categoriesList?.find((c) => c.name === activeCategory);
  const activeCatDisplay = currentCatObj?.display_name || activeCategory;

  const homeSeoTitle =
    activeCategory === "সকল"
      ? "Ss Seed Shop — দেশী ও বিদেশী ফুল, ফল ও সবজি বীজের বিশ্বস্ত অনলাইন শপ"
      : `${activeCatDisplay} বীজ — উন্নত জাত ও সর্বোচ্চ অঙ্কুরোদগম | Ss Seed Shop`;

  const homeSeoDesc =
    activeCategory === "সকল"
      ? "SS Seed (Ss Seed Shop / এস এস সিড) — বাংলাদেশের শীর্ষস্থানীয় অনলাইন বীজ শপ। উন্নত মানের ফুল, ফল, সবজি ও হাইব্রিড বীজ কিনুন। সারাদেশে দ্রুত ক্যাশ অন হোম ডেলিভারি ও ১০০% খাঁটি বীজের নিশ্চয়তা।"
      : `${activeCatDisplay} ক্যাটাগরির সেরা বীজ সংগ্রহ করুন SS Seed (Ss Seed Shop) থেকে। উচ্চ অঙ্কুরোদগম, সাশ্রয়ী মূল্য ও সারাদেশে ক্যাশ অন ডেলিভারি।`;

  const homeKeywords = useMemo(() => {
    return buildDynamicKeywords({
      category: activeCategory !== "সকল" ? activeCategory : undefined,
    });
  }, [activeCategory]);

  const homeJsonLd = useMemo(() => {
    if (activeCategory === "সকল") {
      const org = buildOrganizationSchema(domainInfo);
      const web = buildWebSiteSchema(domainInfo);
      const faqs = buildFAQSchema([
        {
          question: "আপনারা কি সারাদেশে হোম ডেলিভারি দেন?",
          answer: "হ্যাঁ, আমরা ঢাকা সহ বাংলাদেশের প্রতিটি জেলা ও উপজেলায় দ্রুত ক্যাশ অন হোম ডেলিভারি দিয়ে থাকি।",
        },
        {
          question: "আপনাদের বীজের অঙ্কুরোদগম ক্ষমতা কেমন?",
          answer: "আমাদের প্রতিটি বীজ পরীক্ষিত এবং এর অঙ্কুরোদগম ক্ষমতা ন্যূনতম ৮০% বা তার বেশি।",
        },
        {
          question: "অনলাইনে বীজ অর্ডার করার নিয়ম কী?",
          answer: "পছন্দের বীজ নির্বাচন করে সরাসরি 'অর্ডার করুন' বাটনে ক্লিক করে নাম, ঠিকানা ও মোবাইল নম্বর দিলেই অর্ডার কনফার্ম হবে।",
        },
      ]);
      return [org, web, faqs];
    } else {
      return [
        buildBreadcrumbSchema([
          { name: "হোম", url: domainInfo.origin },
          { name: "ক্যাটাগরি", url: `${domainInfo.origin}/categories` },
          { name: `${activeCatDisplay} বীজ`, url: `${domainInfo.origin}/category/${encodeURIComponent(activeCategory)}` },
        ]),
      ];
    }
  }, [activeCategory, activeCatDisplay, domainInfo]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={homeSeoTitle}
        description={homeSeoDesc}
        keywords={homeKeywords}
        url={domainInfo.origin}
        jsonLd={homeJsonLd}
      />
      <Navbar />
      <SideCart />
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
      
      {activeCategory === "সকল" && <ProductsSection />}
      
      {activeCategory === "সকল" && <CategoryProductsSections />}
      {activeCategory !== "সকল" && (
        <main className="flex-1">
          <div className="max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                <h1 className="text-base sm:text-xl font-bold text-foreground leading-tight">
                  {categoriesList?.find((c) => c.name === activeCategory)?.display_name || activeCategory}
                </h1>
                <span className="text-xs text-muted-foreground font-medium">
                  ({filteredProducts.length}টি পণ্য)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCategoryChange("সকল")}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
              >
                {t("সকল পণ্য দেখুন", "View All")}
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">{t("পণ্য লোড হচ্ছে...", "Loading products...")}</p>
              </div>
            ) : !products.length ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg mb-1">{t("কোনো পণ্য পাওয়া যায়নি", "No products found")}</p>
                <p className="text-sm">{t("অন্য ক্যাটাগরি বেছে নিন", "Try a different category")}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
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
      )}
      {/* <FeaturesSection /> */}
      <Footer showDevelopedBy={true} />
    </div>
  );
}
