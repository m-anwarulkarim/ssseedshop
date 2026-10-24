import { Link, useLocation } from "react-router-dom";
import { Mail, MapPin, Phone, Facebook, Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

import { Separator } from "@/components/ui/separator";
import logoAsset from "@/assets/ssseedshop-logo.png";
import { DevelopedByHaqPlus } from "@/components/DevelopedByHaqPlus";

type FooterLink = { label: string; href: string };

const defaultQuickLinks: FooterLink[] = [
  { label: "হোম", href: "/" },
  { label: "ক্যাটাগরি", href: "/categories" },
  { label: "কৃষি সেবা", href: "/services" },
  { label: "চাষাবাদ নির্দেশিকা", href: "/cultivation-guide" },
  { label: "ডেলিভারি চার্জ", href: "/delivery-charge" },
  { label: "সাহায্য", href: "/help" },
  { label: "প্রাইভেসি পলিসি", href: "/privacy-policy" },
  { label: "শর্তাবলী", href: "/terms-conditions" },
  { label: "রিটার্ন পলিসি", href: "/return-policy" },
  { label: "পুদিনা পাতার বীজ", href: "/lp/mint-leaf-seeds" },
];

const defaultCategories: FooterLink[] = [
  { label: "সবজির বীজ", href: "/categories" },
  { label: "ফুলের বীজ", href: "/categories" },
  { label: "ফলের বীজ", href: "/categories" },
  { label: "ঔষধি বীজ", href: "/categories" },
];

function parseLinks(raw: string | null | undefined, fallback: FooterLink[]): FooterLink[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => x && typeof x.label === "string" && typeof x.href === "string")) {
      return parsed;
    }
  } catch {}
  return fallback;
}

const socials = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/ssseedshop",
    label: "Facebook",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/ssseedshop",
    label: "Instagram",
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.12Z" />
      </svg>
    ),
    href: "https://www.tiktok.com/@ssseedshop",
    label: "TikTok",
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    href: "https://wa.me/8801805080556",
    label: "WhatsApp",
  },
];

export default function Footer({ showDevelopedBy }: { showDevelopedBy?: boolean } = {}) {
  const { lang, t } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const shouldShowDevelopedBy = showDevelopedBy !== undefined ? showDevelopedBy : !isHome;

  const { data: settings } = useQuery({
    queryKey: ["footer-settings"],
    queryFn: async () => {
      try {
        const url = import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";
        const res = await fetch(`${url}/settings/get.php?keys=footer_quick_links,footer_categories`);
        if (!res.ok) return {};
        const data = await res.json();
        const map: Record<string, string> = {};
        (data || []).forEach((r: any) => { if (r?.key) map[r.key] = r.value; });
        return map;
      } catch {
        return {};
      }
    },
    staleTime: 5 * 60 * 1000,
  });
  const quickLinks = parseLinks(settings?.footer_quick_links, defaultQuickLinks);
  const categories = parseLinks(settings?.footer_categories, defaultCategories);

  return (
    <footer className="bg-[hsl(220,15%,13%)] text-white/80">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-5 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 flex flex-col items-start gap-2.5">
            <div className="flex items-center gap-2.5">
              <img
                src={logoAsset}
                alt="Ss Seed Shop"
                className="w-12 h-12 rounded-full bg-white object-contain p-0.5"
                loading="lazy"
              />
              <div>
                <div className="font-display text-base font-bold text-white leading-tight">
                  Ss Seed Shop
                </div>
                <div className="text-xs text-white/55 leading-tight">
                  {t("নির্ভরযোগ্য বীজের ঠিকানা", "Trusted source of seeds")}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/65">
              {t(
                "Ss Seed Shop — সবজি, ফুল, ফল ও ঔষধি বীজের নির্ভরযোগ্য অনলাইন প্ল্যাটফর্ম। সারা বাংলাদেশে দ্রুত হোম ডেলিভারি।",
                "Ss Seed Shop — your trusted online platform for vegetable, flower, fruit and medicinal seeds. Fast home delivery across Bangladesh."
              )}
            </p>

            <div className="flex items-center gap-2 mt-1">
              {socials.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-3">
            <h4 className="text-sm font-semibold text-white mb-2 uppercase tracking-wide">
              {t("যোগাযোগ", "Contact")}
            </h4>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Poran Mondol tak, Boro Dewra, Tongi</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="tel:01805080556" className="hover:text-white">
                  01805080556
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href="mailto:info@ssseedshop.com"
                  className="hover:text-white break-all"
                >
                  info@ssseedshop.com
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <FooterLinks title={t("দ্রুত লিঙ্ক", "Quick Links")} items={quickLinks} />
          </div>
          <div className="md:col-span-3">
            <FooterLinks title={t("ক্যাটাগরি", "Categories")} items={categories} />
          </div>

        </div>

        <Separator className="my-4 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 pt-1">
          <p>© {new Date().getFullYear()} Ss Seed Shop. {t("সর্বস্বত্ব সংরক্ষিত।", "All rights reserved.")}</p>
          {shouldShowDevelopedBy && (
            <div className="flex items-center gap-3">
              <DevelopedByHaqPlus theme="dark" />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-2 uppercase tracking-wide">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              to={item.href}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
