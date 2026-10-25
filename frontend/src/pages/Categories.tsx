import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCategories } from "@/hooks/useCatalog";
import { resolveImageUrl, handleImageError } from "@/lib/imageFallback";
import { detectDomainInfo, buildDynamicKeywords, buildBreadcrumbSchema } from "@/lib/seoDomain";

export default function Categories() {
  const { t } = useLanguage();
  const { data: categories, isLoading } = useCategories();
  const domainInfo = useMemo(() => detectDomainInfo(), []);
  const catHubCanonical = `${domainInfo.origin}/categories`;

  const catKeywords = useMemo(() => {
    return buildDynamicKeywords({
      customKeywords: [
        "বীজের ক্যাটাগরি",
        "বীজ তালিকা",
        "সবজি বীজ তালিকা",
        "ফুলের বীজ তালিকা",
        "হাইব্রিড বীজ তালিকা",
        "seed categories bangladesh",
      ],
    });
  }, []);

  const catHubJsonLd = useMemo(() => {
    return [
      buildBreadcrumbSchema([
        { name: "হোম", url: domainInfo.origin },
        { name: "বীজের ক্যাটাগরি", url: catHubCanonical },
      ]),
    ];
  }, [domainInfo, catHubCanonical]);

  const catHubTitle = `বীজের সকল ক্যাটাগরি — ফুল, ফল ও সবজি বীজের বিশ্বস্ত তালিকা | Ss Seed Shop`;
  const catHubDesc = `ফুল বীজ, শাক-সবজি বীজ, ফল বীজ, হাইব্রিড বীজ সহ সকল ক্যাটাগরি থেকে আপনার পছন্দের বীজ বেছে নিন। ১০০% আসল ও পরীক্ষিত বীজ কিনুন — Ss Seed Shop (AB Seed)।`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <SideCart />

      <SEOHead
        title={catHubTitle}
        description={catHubDesc}
        keywords={catKeywords}
        url={catHubCanonical}
        jsonLd={catHubJsonLd}
      />
      <main className="flex-1">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-muted-foreground mb-3">{t("ক্যাটাগরি অনুযায়ী পণ্য দেখুন", "Browse products by category")}</p>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !categories?.length ? (
            <p className="text-center py-16 text-muted-foreground">{t("কোনো ক্যাটাগরি পাওয়া যায়নি", "No categories found")}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${encodeURIComponent(cat.name)}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {cat.image ? (
                      <img
                        src={resolveImageUrl(cat.image)}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-3xl">{cat.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="font-display font-bold text-base md:text-lg text-foreground">{cat.display_name || cat.name}</h3>
                    {cat.description && (
                      <p className="text-xs md:text-sm text-muted-foreground font-body mt-1 line-clamp-2">{cat.description}</p>
                    )}
                    <span className="inline-block mt-3 text-xs md:text-sm font-display font-semibold text-secondary group-hover:underline">
                      {t("পণ্য দেখুন →", "View products →")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
