import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string | null;
  url?: string;
  type?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SITE_NAME = "Ss Seed Shop";
const DEFAULT_DESC = "Ss Seed Shop — বাংলাদেশের বিশ্বস্ত অনলাইন সিড শপ। ফুল, ফল, সবজি ও হাইব্রিড বীজ কিনুন। সারাদেশে হোম ডেলিভারি।";
const DEFAULT_IMAGE = "";
const JSON_LD_ID = "seo-json-ld";
const SITE_URL = "https://ssseedshop.com";

function setMeta(property: string, content: string, isName = false) {
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

export default function SEOHead({ title, description, image, url, type = "website", jsonLd }: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME || title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const desc = description || DEFAULT_DESC;
    const img = image || "";
    const pageUrl = url || window.location.href;

    document.title = fullTitle;
    setMeta("description", desc, true);
    setMeta("og:title", fullTitle);
    setMeta("og:description", desc);
    if (img) setMeta("og:image", img);
    setMeta("og:url", pageUrl);
    setMeta("og:type", type);
    setMeta("og:site_name", SITE_NAME);
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", fullTitle, true);
    setMeta("twitter:description", desc, true);
    if (img) setMeta("twitter:image", img, true);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", pageUrl);

    const ldItems = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
    document.querySelectorAll(`script.${JSON_LD_ID}`).forEach((el) => el.remove());
    ldItems.forEach((item) => {
      const script = document.createElement("script");
      script.className = JSON_LD_ID;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
    });

    return () => {
      document.title = "Ss Seed Shop — দেশী ও বিদেশী ফুল, ফল ও সবজি বীজের বিশ্বস্ত অনলাইন শপ";
      setMeta("description", DEFAULT_DESC, true);
      setMeta("og:title", "Ss Seed Shop — দেশী ও বিদেশী ফুল, ফল ও সবজি বীজের বিশ্বস্ত অনলাইন শপ");
      setMeta("og:description", DEFAULT_DESC);
      setMeta("twitter:title", "Ss Seed Shop — দেশী ও বিদেশী ফুল, ফল ও সবজি বীজের বিশ্বস্ত অনলাইন শপ", true);
      setMeta("twitter:description", DEFAULT_DESC, true);
      document.querySelectorAll(`script.${JSON_LD_ID}`).forEach((el) => el.remove());
    };
  }, [title, description, image, url, type, jsonLd]);

  return null;
}
