import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import ProductCard from "@/components/ProductCard";
import { Loader2, ChevronRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { detectDomainInfo, buildDynamicKeywords, buildBreadcrumbSchema } from "@/lib/seoDomain";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCategories, useAllProducts } from "@/hooks/useCatalog";
import { resolveImageUrl, handleImageError } from "@/lib/imageFallback";

export default function CategoryPage() {
  const { t } = useLanguage();
  const { name } = useParams();
  const decodedName = decodeURIComponent(name || "");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const category = useMemo(() => {
    return categories?.find((c) => c.name.toLowerCase() === decodedName.toLowerCase()) || null;
  }, [categories, decodedName]);

  const { data: subcategories = [] } = useQuery({
    queryKey: ["subcategories", decodedName],
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_name", decodedName)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: allProducts, isLoading } = useAllProducts();

  const products = useMemo(() => {
    if (!allProducts) return [];
    const filtered = allProducts.filter((p: any) => {
      const mainCatMatch = p.category?.toLowerCase() === decodedName.toLowerCase();
      const catListMatch =
        Array.isArray(p.categories) &&
        p.categories.some((c: string) => c.toLowerCase() === decodedName.toLowerCase());
      return mainCatMatch || catListMatch;
    });
    return filtered;
  }, [allProducts, decodedName]);

  const filteredProducts = selectedSub
    ? (products || []).filter((p: any) =>
        (p.subcategory || "").split(",").map((s: string) => s.trim()).includes(selectedSub)
      )
    : products;

  const domainInfo = useMemo(() => detectDomainInfo(), []);
  const catDisplay = category?.display_name || decodedName;
  const catCanonical = `${domainInfo.origin}/category/${encodeURIComponent(decodedName)}`;

  const catSeoTitle = `${catDisplay} বীজ — উন্নত জাত, উচ্চ অঙ্কুরোদগম ও সেরা দর | Ss Seed Shop`;
  const catSeoDesc = category?.description ||
    `উন্নত জাতের ${catDisplay} বীজ সংগ্রহ করুন Ss Seed Shop থেকে। উচ্চ অঙ্কুরোদগম হার (≥৮০%), সুলভ মূল্য ও সারাদেশে দ্রুত ক্যাশ অন হোম ডেলিভারি — Ss Seed Shop (AB Seed)।`;

  const catKeywords = useMemo(() => {
    return buildDynamicKeywords({
      category: decodedName,
      subcategory: selectedSub || undefined,
    });
  }, [decodedName, selectedSub]);

  const catJsonLd = useMemo(() => {
    const breadcrumb = buildBreadcrumbSchema([
      { name: "হোম", url: domainInfo.origin },
      { name: "বীজের ক্যাটাগরি", url: `${domainInfo.origin}/categories` },
      { name: `${catDisplay} বীজ`, url: catCanonical },
    ]);

    const collectionPage = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${catCanonical}#webpage`,
      url: catCanonical,
      name: catSeoTitle,
      description: catSeoDesc,
      isPartOf: {
        "@id": `${domainInfo.origin}/#website`,
      },
    };

    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: (filteredProducts || []).slice(0, 24).map((p: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${domainInfo.origin}/product/${p.slug || p.id}`,
        name: p.name,
      })),
    };

    return [breadcrumb, collectionPage, itemList];
  }, [domainInfo, catDisplay, catCanonical, catSeoTitle, catSeoDesc, filteredProducts]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={catSeoTitle}
        description={catSeoDesc}
        keywords={catKeywords}
        image={category?.image}
        url={catCanonical}
        category={`${catDisplay} বীজ`}
        jsonLd={catJsonLd}
      />
      <Navbar />
      <SideCart />

      {/* Cover Photo Hero */}
      <div className="relative w-full h-48 md:h-64 lg:h-72 overflow-hidden bg-muted">
        {category?.image ? (
          <>
            <img
              src={resolveImageUrl(category.image)}
              alt={decodedName}
              className="w-full h-full object-cover scale-105"
              onError={handleImageError}
            />
            <div className="absolute inset-0 backdrop-blur-[1px]" />
            <div className="absolute bottom-0 left-0 right-0 h-2/3 backdrop-blur-sm" />
          </>
        ) : (
          <div className="w-full h-full bg-primary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/60 to-white/30" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 max-w-screen-2xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground transition-colors">{t("হোম", "Home")}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/categories" className="hover:text-foreground transition-colors">{t("ক্যাটাগরি", "Categories")}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{decodedName}</span>
          </nav>
          <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground">{decodedName}</h1>
          {category?.description && (
            <div className="mt-2 max-w-2xl">
              <p className={`text-sm text-foreground/80 ${showFullDesc ? "" : "line-clamp-2"}`}>
                {category.description}
              </p>
              {category.description.length > 120 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="text-xs text-primary font-bold mt-1 hover:underline"
                >
                  {showFullDesc ? t("সংক্ষেপে দেখুন", "Show less") : t("আরো পড়ুন", "Read more")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {subcategories.length > 0 && (
            <div className="sticky top-[72px] md:top-[88px] z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 mb-4 overflow-x-auto scrollbar-hide bg-background/95 backdrop-blur-md border-b border-border">

              <div className="flex items-center gap-2 min-w-max sm:flex-wrap sm:min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                    selectedSub === null
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {t("সব", "All")}
                </button>
                {subcategories.map((sub: any) => {
                  const isSel = selectedSub === sub.name;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSub(isSel ? null : sub.name)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                        isSel
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !filteredProducts?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>{t("এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি", "No products in this category")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 md:gap-2.5">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="flex justify-center mt-10 mb-4">
            <Link
              to="/categories"
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              {t("সকল ক্যাটাগরি দেখুন", "View All Categories")}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
