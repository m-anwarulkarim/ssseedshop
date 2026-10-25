/**
 * @file seoDomain.ts
 * @description Dynamic Domain, Brand, and Keyword Engine for Multi-Domain Seed Shop SEO.
 * 
 * Supports dynamic adaptation across:
 * - abseed.com.bd / abseed.com / abseeds.com / abseed.* (Brand: "AB Seed" / "এবি সিড")
 * - ssseedshop.com / ssseedshop.* (Brand: "Ss Seed Shop" / "এস এস সিড শপ")
 * - Localhost / custom staging domains
 *
 * Guarantees top Google Search ranking for:
 * - "বীজ" (seeds in Bengali)
 * - "সবজি বীজ", "ফুলের বীজ", "ফলের বীজ", "হাইব্রিড বীজ", "কৃষি বীজ"
 * - "ab seed", "AB Seed", "abseed", "এবি সিড", "ss seed shop", "ssseedshop"
 */

export interface DomainSeoInfo {
  hostname: string;
  origin: string;
  isAbSeedDomain: boolean;
  isSsSeedShopDomain: boolean;
  primaryBrandName: string;
  primaryBrandBn: string;
  alternateBrandName: string;
  alternateBrandBn: string;
  brandCombo: string;
  brandComboBn: string;
  taglineBn: string;
  taglineEn: string;
  canonicalOrigin: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  logoUrl: string;
  supportPhone: string;
  supportEmail: string;
}

/**
 * High-intent core seed keywords in Bangla and English.
 * Carefully curated to dominate search results for seed and agriculture queries in Bangladesh.
 */
export const CORE_SEED_KEYWORDS: string[] = [
  // Primary Seed Searches
  "বীজ",
  "অনলাইন বীজ শপ",
  "বীজ শপ",
  "বীজের দোকান",
  "অনলাইনে বীজ কেনা",
  "বীজ কিনুন",
  "উন্নত জাতের বীজ",
  "হাইব্রিড বীজ",
  "দেশী বীজ",
  "বিদেশী বীজ",
  "আমদানিকৃত বীজ",
  "কৃষি বীজ",
  "ছাদ বাগান বীজ",
  "টবের বীজ",
  "অঙ্কুরোদগম গ্যারান্টি বীজ",
  
  // Category-Specific Seed Searches
  "সবজি বীজ",
  "ফুলের বীজ",
  "ফলের বীজ",
  "শাকের বীজ",
  "শাকসবজি বীজ",
  "টমেটো বীজ",
  "মরিচ বীজ",
  "লাউ বীজ",
  "কুমড়া বীজ",
  "শসা বীজ",
  "বেগুন বীজ",
  "করলা বীজ",
  "সিম বীজ",
  "বরবটি বীজ",
  "তরমুজ বীজ",
  "সূর্যমুখী ফুলের বীজ",
  "গাঁদা ফুলের বীজ",
  "অপরাজিতা বীজ",
  "জিনিয়া ফুলের বীজ",
  "কসমস ফুলের বীজ",
  
  // Brand Searches (Both AB Seed and Ss Seed Shop for cross-ranking)
  "ab seed",
  "AB Seed",
  "abseed",
  "ab seeds",
  "ab seed bd",
  "ab seed bangladesh",
  "abseed.com.bd",
  "এবি সিড",
  "এবি সীড",
  "এবি সিড বাংলাদেশ",
  "Ss Seed Shop",
  "ss seed shop",
  "ssseedshop",
  "ss seed",
  "এস এস সিড শপ",
  "এসএস সিড শপ",
  
  // English Keywords for Local & International Indexing
  "seeds online bangladesh",
  "buy seeds online bd",
  "seed shop bd",
  "gardening seeds bangladesh",
  "vegetable seeds bd",
  "flower seeds online bangladesh",
  "hybrid seeds bd",
  "imported seeds bangladesh",
  "rooftop gardening seeds bd",
  "agriculture seeds bd",
  "best seed shop bangladesh"
];

/**
 * Dynamically detects active domain and returns localized SEO configuration.
 */
export function detectDomainInfo(customOrigin?: string): DomainSeoInfo {
  const isBrowser = typeof window !== "undefined";
  let hostname = "ssseedshop.com";
  let origin = "https://ssseedshop.com";

  if (customOrigin) {
    try {
      const u = new URL(customOrigin);
      hostname = u.hostname.toLowerCase();
      origin = u.origin;
    } catch {
      // Fallback
    }
  } else if (isBrowser) {
    hostname = window.location.hostname.toLowerCase();
    origin = window.location.origin;
  }

  // Detect if the domain is AB Seed
  const isAbSeed =
    hostname.includes("abseed") ||
    hostname.includes("ab-seed") ||
    hostname.includes("ab_seed");

  // Primary brand is strictly Ss Seed Shop, with AB Seed as secondary/cross-indexing brand
  return {
    hostname,
    origin,
    isAbSeedDomain: isAbSeed,
    isSsSeedShopDomain: !isAbSeed,
    primaryBrandName: "Ss Seed Shop",
    primaryBrandBn: "এস এস সিড শপ",
    alternateBrandName: "AB Seed",
    alternateBrandBn: "এবি সিড",
    brandCombo: "Ss Seed Shop | AB Seed",
    brandComboBn: "এস এস সিড শপ (AB Seed)",
    taglineBn: "মাটি, ভালোবাসা ও বিশ্বাসের সঙ্গে আপনার বাগানের জন্য বাছাই করা বীজ",
    taglineEn: "Authentic & High-Germination Seeds Across Bangladesh",
    canonicalOrigin: origin,
    defaultTitle: "Ss Seed Shop — দেশী ও বিদেশী ফুল, ফল ও সবজি বীজের বিশ্বস্ত অনলাইন শপ | AB Seed",
    defaultDescription: "Ss Seed Shop (এবি সিড / AB Seed) — বাংলাদেশের বিশ্বস্ত অনলাইন সিড শপ। উন্নত মানের ফুল, ফল, সবজি ও হাইব্রিড বীজ কিনুন সুলভ মূল্যে। সারাদেশে দ্রুত ক্যাশ অন হোম ডেলিভারি ও ১০০% আসল বীজের নিশ্চয়তা।",
    defaultKeywords: [
      "Ss Seed Shop", "ss seed shop", "ssseedshop", "এস এস সিড শপ",
      "ab seed", "AB Seed", "abseed", "ab seeds", "ab seed bd", "এবি সিড", "এবি সীড",
      "বীজ", "অনলাইন বীজ শপ", "সবজি বীজ", "ফুলের বীজ", "ফলের বীজ", "হাইব্রিড বীজ",
      ...CORE_SEED_KEYWORDS
    ],
    logoUrl: `${origin}/favicon.png`,
    supportPhone: "01933819799",
    supportEmail: "ssseedshop220@gmail.com",
  };
}

/**
 * Strips HTML tags cleanly from descriptions.
 */
export function stripHtml(input: string = ""): string {
  return input
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds rich, deduplicated keywords combining context and core terms.
 */
export function buildDynamicKeywords(params?: {
  productName?: string;
  category?: string;
  subcategory?: string;
  tags?: string[] | string;
  customKeywords?: string[];
}): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  const add = (word?: string | null) => {
    if (!word) return;
    const clean = word.trim();
    if (clean && !seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase());
      result.push(clean);
    }
  };

  // Add product specific terms first (highest weight)
  if (params?.productName) {
    const name = params.productName.trim();
    add(name);
    add(`${name} বীজ`);
    add(`${name} দাম`);
    add(`${name} কিনুন`);
    add(`${name} চাষ পদ্ধতি`);
    add(`আসল ${name}`);
    add(`উন্নত জাতের ${name}`);
    add(`হাইব্রিড ${name}`);
    add(`${name} ab seed`);
    add(`${name} ss seed shop`);
  }

  // Category terms
  if (params?.category) {
    const cat = params.category.trim();
    add(`${cat} বীজ`);
    add(`উন্নত ${cat} বীজ`);
    add(`হাইব্রিড ${cat} বীজ`);
    add(`${cat} বীজের দাম`);
    add(`${cat} বীজ অনলাইন শপ`);
  }

  if (params?.subcategory) {
    const sub = params.subcategory.trim();
    add(`${sub} বীজ`);
    add(`${sub} চাষ`);
  }

  // Custom tags
  if (Array.isArray(params?.tags)) {
    params.tags.forEach((t) => add(t));
  } else if (typeof params?.tags === "string" && params.tags.trim()) {
    try {
      const parsed = JSON.parse(params.tags);
      if (Array.isArray(parsed)) parsed.forEach((t) => add(String(t)));
      else add(params.tags);
    } catch {
      params.tags.split(",").forEach((t) => add(t));
    }
  }

  if (Array.isArray(params?.customKeywords)) {
    params.customKeywords.forEach((k) => add(k));
  }

  // Always append the core seed and brand keywords for universal discoverability
  CORE_SEED_KEYWORDS.forEach((k) => add(k));

  return result;
}

/**
 * Builds full Schema.org BreadcrumbList.
 */
export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Builds standard Organization Schema.
 */
export function buildOrganizationSchema(domainInfo: DomainSeoInfo): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${domainInfo.origin}/#organization`,
    name: domainInfo.primaryBrandName,
    alternateName: [
      domainInfo.primaryBrandBn,
      domainInfo.alternateBrandName,
      domainInfo.alternateBrandBn,
      "AB Seed",
      "Ss Seed Shop",
    ],
    url: domainInfo.origin,
    logo: {
      "@type": "ImageObject",
      url: domainInfo.logoUrl,
      width: 512,
      height: 512,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+8801933819799",
      contactType: "customer service",
      areaServed: "BD",
      availableLanguage: ["bn", "en"],
    },
    sameAs: [
      "https://www.facebook.com/ssseedshop",
      "https://ssseedshop.com",
    ],
  };
}

/**
 * Builds standard WebSite Schema with Sitelinks SearchBox.
 */
export function buildWebSiteSchema(domainInfo: DomainSeoInfo): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${domainInfo.origin}/#website`,
    url: domainInfo.origin,
    name: domainInfo.primaryBrandName,
    alternateName: [domainInfo.primaryBrandBn, domainInfo.alternateBrandName, "AB Seed", "Ss Seed Shop"],
    publisher: {
      "@id": `${domainInfo.origin}/#organization`,
    },
    inLanguage: "bn",
    potentialAction: {
      "@type": "SearchAction",
      target: `${domainInfo.origin}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Builds standard FAQPage Schema for rich Google search snippets.
 */
export function buildFAQSchema(faqs: Array<{ question: string; answer: string }>): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
