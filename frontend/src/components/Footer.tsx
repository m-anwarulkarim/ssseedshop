import { API_URL } from "@/config/env";
import { Link, useLocation } from "react-router-dom";
import {
  Mail,
  MapPin,
  Facebook,
  Instagram,
  ShieldCheck,
  Truck,
  Headphones,
  RotateCcw,
  PhoneCall,
  ChevronRight,
  CreditCard,
  Banknote,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import logoAsset from "@/assets/ssseedshop-logo.png";
import { DevelopedByHaqPlus } from "@/components/DevelopedByHaqPlus";

type FooterLink = { label: string; href: string };

const defaultQuickLinks: FooterLink[] = [
  { label: "হোম", href: "/" },
  { label: "সকল ক্যাটাগরি", href: "/categories" },
  { label: "সকল পণ্য", href: "/products" },
  { label: "ডেলিভারি চার্জ ও তথ্য", href: "/delivery-charge" },
  { label: "অর্ডার ট্র্যাক করুন", href: "/order-search" },
  { label: "সাহায্য ও সাপোর্ট", href: "/help" },
  { label: "প্রাইভেসি পলিসি", href: "/privacy-policy" },
  { label: "শর্তাবলী", href: "/terms-conditions" },
  { label: "রিটার্ন ও রিফান্ড পলিসি", href: "/return-policy" },
];

const defaultCategories: FooterLink[] = [
  { label: "শাক ও সবজির বীজ", href: "/categories" },
  { label: "হাইব্রিড টমেটো ও শসা বীজ", href: "/categories" },
  { label: "দেশি-বিদেশি মরিচ ও বেগুন", href: "/categories" },
  { label: "বিদেশি ও দেশি ফুলের বীজ", href: "/categories" },
  { label: "বারোমাসি লাউ ও কুমড়া বীজ", href: "/categories" },
  { label: "মিষ্টি রসালো তরমুজের বীজ", href: "/categories" },
  { label: "সুগন্ধি ও ঔষধি গাছের বীজ", href: "/categories" },
];

function parseLinks(raw: string | null | undefined, fallback: FooterLink[]): FooterLink[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every((x) => x && typeof x.label === "string" && typeof x.href === "string")
    ) {
      // Filter out cultivation-guide if present
      return parsed.filter((item) => !item.href.includes("cultivation-guide"));
    }
  } catch {}
  return fallback;
}

const socials = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/ssseedshop",
    label: "Facebook",
    color: "hover:bg-[#1877F2] hover:text-white",
    bg: "bg-[#1877F2]/10 text-[#1877F2]",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/ssseedshop",
    label: "Instagram",
    color: "hover:bg-[#E4405F] hover:text-white",
    bg: "bg-[#E4405F]/10 text-[#E4405F]",
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.12Z" />
      </svg>
    ),
    href: "https://www.tiktok.com/@ssseedshop",
    label: "TikTok",
    color: "hover:bg-white hover:text-black",
    bg: "bg-white/10 text-white",
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    href: "https://wa.me/8801933819799",
    label: "WhatsApp",
    color: "hover:bg-[#25D366] hover:text-white",
    bg: "bg-[#25D366]/10 text-[#25D366]",
  },
];

export default function Footer({ showDevelopedBy }: { showDevelopedBy?: boolean } = {}) {
  const { lang, t } = useLanguage();
  const location = useLocation();
  const shouldShowDevelopedBy = showDevelopedBy !== undefined ? showDevelopedBy : true;

  const { data: settings } = useQuery({
    queryKey: ["footer-settings"],
    queryFn: async () => {
      try {
        const url = API_URL;
        const res = await fetch(`${url}/settings/get.php?keys=footer_quick_links,footer_categories`);
        if (!res.ok) return {};
        const data = await res.json();
        const map: Record<string, string> = {};
        (data || []).forEach((r: any) => {
          if (r?.key) map[r.key] = r.value;
        });
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
    <footer className="bg-[#0b131a] text-slate-300 border-t border-slate-800/80">
      {/* 1. TOP TRUST BADGES SECTION */}
      <div className="border-b border-slate-800/80 bg-[#080e14]/70">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="flex items-start gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shadow-sm">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {lang === "en" ? "100% Genuine Seeds" : "১০০% আসল ও খাঁটি বীজ"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {lang === "en"
                    ? "Germination tested & high yield varieties"
                    : "৮০%+ অঙ্কুরোদগম ও উচ্চ ফলনশীল জাত"}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all shadow-sm">
                <Truck className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  {lang === "en" ? "Fast Home Delivery" : "ক্যাশ অন ডেলিভারি"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {lang === "en"
                    ? "Delivery across Bangladesh right to your door"
                    : "পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ"}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all shadow-sm">
                <RotateCcw className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                  {lang === "en" ? "Easy Return Policy" : "সহজ রিটার্ন সুবিধা"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {lang === "en"
                    ? "Safe replacement if damaged or missing"
                    : "কোনো সমস্যা হলে দ্রুত পরিবর্তন বা রিটার্ন"}
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all shadow-sm">
                <Headphones className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                  {lang === "en" ? "Dedicated Support" : "সার্বক্ষণিক কাস্টমার কেয়ার"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {lang === "en"
                    ? "Available 9am to 10pm every day via call/chat"
                    : "কল বা হোয়াটসঅ্যাপে সার্বক্ষণিক সহায়তা"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-24 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Info & Mission (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logoAsset}
                alt="Ss Seed Shop"
                className="w-12 h-12 rounded-full bg-white object-contain p-1 ring-2 ring-emerald-500/40 group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <div>
                <div className="font-extrabold text-lg text-white leading-tight flex items-center gap-1.5">
                  <span>Ss Seed Shop</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    অরিজিনাল
                  </span>
                </div>
                <div className="text-xs text-emerald-400/90 font-medium leading-tight mt-0.5">
                  {lang === "en" ? "Trusted Seed Brand in Bangladesh" : "সেরা বীজের বিশ্বস্ত ঠিকানা"}
                </div>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-slate-400 pr-2">
              {lang === "en"
                ? "Ss Seed Shop is your trusted online destination for authentic vegetable, flower, fruit and rare hybrid seeds. Guaranteed germination and doorstep delivery across Bangladesh."
                : "Ss Seed Shop — সবজি, ফুল, ফল ও উন্নত জাতের হাইব্রিড বীজের নির্ভরযোগ্য অনলাইন শপ। সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি ও শতভাগ অঙ্কুরোদগমের নিশ্চয়তা।"}
            </p>

            {/* Social Media Links */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2.5">
                {lang === "en" ? "Follow Us on Social Media:" : "আমাদের সাথে যুক্ত থাকুন:"}
              </div>
              <div className="flex items-center gap-2">
                {socials.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} border border-slate-700/50 flex items-center justify-center transition-all active:scale-95 shadow-sm`}
                      title={item.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hotline & Contact Highlight Box (3.5 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-emerald-500 inline-block"></span>
              <span>{lang === "en" ? "Customer Support" : "হটলাইন ও সাপোর্ট"}</span>
            </h4>

            <div className="rounded-2xl p-4 bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  {lang === "en" ? "Helpline Active Now" : "সরাসরি হটলাইন কল"}
                </span>
              </div>

              {/* Big Click-to-Call Button */}
              <a
                href="tel:01933819799"
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-teal-600/10 border border-emerald-500/30 hover:border-emerald-500 hover:from-emerald-600/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  <PhoneCall className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {lang === "en" ? "Call for help" : "যেকোনো প্রয়োজনে কল করুন"}
                  </div>
                  <div className="text-base font-extrabold text-white tracking-wide">
                    01933819799
                  </div>
                </div>
              </a>

              {/* WhatsApp Chat Button */}
              <a
                href="https://wa.me/8801933819799"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 p-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-emerald-400 text-xs font-bold transition-all active:scale-95"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
                <span>{lang === "en" ? "Chat on WhatsApp" : "হোয়াটসঅ্যাপে চ্যাট করুন"}</span>
              </a>

              {/* Address & Email */}
              <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">পরান মণ্ডল টেক, বড় দেওড়া, টঙ্গী, গাজীপুর</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a
                    href="mailto:ssseedshop220@gmail.com"
                    className="hover:text-white transition-colors"
                  >
                    ssseedshop220@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Page Links Only (Clean, Balanced 4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-emerald-500 inline-block"></span>
              <span>{lang === "en" ? "Important Pages" : "প্রয়োজনীয় পেইজসমূহ"}</span>
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: lang === "en" ? "Home" : "হোম", href: "/" },
                { label: lang === "en" ? "Delivery Charge" : "ডেলিভারি চার্জ", href: "/delivery-charge" },
                { label: lang === "en" ? "All Products" : "সকল পণ্য", href: "/products" },
                { label: lang === "en" ? "Help & Support" : "সাহায্য ও সাপোর্ট", href: "/help" },
                { label: lang === "en" ? "Categories" : "সকল ক্যাটাগরি", href: "/categories" },
                { label: lang === "en" ? "Privacy Policy" : "প্রাইভেসি পলিসি", href: "/privacy-policy" },
                { label: lang === "en" ? "Track Order" : "অর্ডার ট্র্যাক", href: "/order-search" },
                { label: lang === "en" ? "Return Policy" : "রিটার্ন পলিসি", href: "/return-policy" },
                { label: lang === "en" ? "Terms & Conditions" : "শর্তাবলী", href: "/terms-conditions" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-slate-400 hover:text-emerald-400 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 text-sm group whitespace-nowrap"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 3. PAYMENT PARTNERS & BADGES STRIP */}
        <div className="mt-12 pt-8 border-t border-slate-800/80">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Payment Method Badges */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {lang === "en" ? "Accepted Payment Methods:" : "নিরাপদ পেমেন্ট পার্টনারসমূহ:"}
              </span>
              <div className="flex items-center flex-wrap gap-2">
                {/* Cash on Delivery */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-bold shadow-sm">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </span>
                {/* bKash Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#E2136E]/15 border border-[#E2136E]/30 text-white text-xs font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#E2136E]"></span>
                  <span>bKash (বিকাশ)</span>
                </span>
                {/* Nagad Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F7941D]/15 border border-[#F7941D]/30 text-white text-xs font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#F7941D]"></span>
                  <span>Nagad (নগদ)</span>
                </span>
                {/* Rocket Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#8C3494]/15 border border-[#8C3494]/30 text-white text-xs font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#8C3494]"></span>
                  <span>Rocket (রকেট)</span>
                </span>
                {/* Cards */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium shadow-sm">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Visa / Master</span>
                </span>
              </div>
            </div>

            {/* Delivery Partner Note */}
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>
                {lang === "en"
                  ? "Delivering nationwide with trusted couriers"
                  : "দেশজুড়ে নির্ভরযোগ্য কুরিয়ারে দ্রুত ডেলিভারি"}
              </span>
            </div>
          </div>
        </div>

        {/* 4. COPYRIGHT & DEVELOPED BY */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
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
