import { useEffect, useMemo } from "react";
import { detectDomainInfo, CORE_SEED_KEYWORDS } from "@/lib/seoDomain";

export interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string | string[];
  image?: string | null;
  imageAlt?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
  category?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const JSON_LD_CLASS = "seo-json-ld-dynamic";

function setMeta(property: string, content: string, isName = false) {
  if (typeof document === "undefined") return;
  const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    if (isName) el.setAttribute("name", property);
    else el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(property: string, isName = false) {
  if (typeof document === "undefined") return;
  const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
  const el = document.querySelector(selector);
  if (el) el.remove();
}

/**
 * Enhanced Dynamic SEO Component.
 * Supports domain-based brand adaptation, dynamic seed keyword injection,
 * Open Graph, Twitter Cards, canonical tracking cleanup, and JSON-LD Rich Snippets.
 */
export default function SEOHead({
  title,
  description,
  keywords,
  image,
  imageAlt,
  url,
  type = "website",
  noindex = false,
  jsonLd,
  category,
  publishedTime,
  modifiedTime,
}: SEOHeadProps) {
  const domainInfo = useMemo(() => detectDomainInfo(), []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // 1. Build Title with domain-adaptive brand suffix
    const primaryName = domainInfo.primaryBrandName;
    const primaryBn = domainInfo.primaryBrandBn;
    const alternateName = domainInfo.alternateBrandName;
    
    let fullTitle = title.trim();
    const hasBrand =
      fullTitle.toLowerCase().includes(primaryName.toLowerCase()) ||
      fullTitle.toLowerCase().includes("ss seed") ||
      fullTitle.includes(primaryBn);

    if (!hasBrand) {
      fullTitle = `${fullTitle} | ${primaryName}`;
    }

    document.title = fullTitle;

    // 2. Build Description
    const desc = (description || domainInfo.defaultDescription).trim().slice(0, 200);
    setMeta("description", desc, true);

    // 3. Build Keywords
    const keywordSet = new Set<string>();
    if (Array.isArray(keywords)) {
      keywords.forEach((k) => k && keywordSet.add(k.trim()));
    } else if (typeof keywords === "string" && keywords.trim()) {
      keywords.split(",").forEach((k) => k && keywordSet.add(k.trim()));
    }
    // Guarantee inclusion of core seed keywords + primary brands
    keywordSet.add("SS Seed");
    keywordSet.add("ss seed");
    keywordSet.add("SS Seeds");
    keywordSet.add("ss seeds");
    keywordSet.add("Ss Seed Shop");
    keywordSet.add("ss seed shop");
    keywordSet.add("ssseedshop");
    keywordSet.add("এস এস সিড");
    keywordSet.add("এসএস সিড");
    keywordSet.add("এস এস সিড শপ");
    keywordSet.add("বীজ");
    keywordSet.add("অনলাইন বীজ শপ");
    keywordSet.add("সবজি বীজ");
    keywordSet.add("ফুলের বীজ");
    keywordSet.add("হাইব্রিড বীজ");
    keywordSet.add("ab seed");
    keywordSet.add("AB Seed");
    keywordSet.add("abseed");
    keywordSet.add("এবি সিড");
    keywordSet.add(primaryName);
    keywordSet.add(primaryBn);
    keywordSet.add(alternateName);
    if (category) {
      keywordSet.add(`${category} বীজ`);
    }

    const keywordString = Array.from(keywordSet).slice(0, 40).join(", ");
    setMeta("keywords", keywordString, true);
    setMeta("author", `SS Seed / ${primaryName}`, true);

    // 4. Canonical URL (Strips tracking params like ?fbclid=..., ?utm_source=...)
    const rawUrl = url || window.location.href;
    const cleanCanonicalUrl = rawUrl.split("?")[0].replace(/\/+$/, "") || domainInfo.origin;

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", cleanCanonicalUrl);

    // 5. Robots Meta Tag
    if (noindex) {
      setMeta("robots", "noindex, nofollow", true);
    } else {
      setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1", true);
    }

    // 6. Open Graph Tags
    const previewImage = image || domainInfo.logoUrl;
    setMeta("og:type", type);
    setMeta("og:site_name", primaryName);
    setMeta("og:url", cleanCanonicalUrl);
    setMeta("og:title", fullTitle);
    setMeta("og:description", desc);
    setMeta("og:locale", "bn_BD");
    if (previewImage) {
      setMeta("og:image", previewImage);
      setMeta("og:image:alt", imageAlt || fullTitle);
    }

    // 7. Twitter Card Tags
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", fullTitle, true);
    setMeta("twitter:description", desc, true);
    if (previewImage) {
      setMeta("twitter:image", previewImage, true);
      setMeta("twitter:image:alt", imageAlt || fullTitle, true);
    }

    // 8. Article specific OG tags if applicable
    if (type === "article") {
      if (publishedTime) setMeta("article:published_time", publishedTime);
      if (modifiedTime) setMeta("article:modified_time", modifiedTime);
      if (category) setMeta("article:section", category);
    }

    // 9. Structured Data (JSON-LD)
    document.querySelectorAll(`script.${JSON_LD_CLASS}`).forEach((el) => el.remove());
    
    if (jsonLd) {
      const ldItems = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      ldItems.forEach((item) => {
        if (!item) return;
        const script = document.createElement("script");
        script.className = JSON_LD_CLASS;
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(item);
        document.head.appendChild(script);
      });
    }

    // Cleanup on unmount or route change
    return () => {
      document.querySelectorAll(`script.${JSON_LD_CLASS}`).forEach((el) => el.remove());
    };
  }, [
    title,
    description,
    keywords,
    image,
    imageAlt,
    url,
    type,
    noindex,
    jsonLd,
    category,
    publishedTime,
    modifiedTime,
    domainInfo,
  ]);

  return null;
}
