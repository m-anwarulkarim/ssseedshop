import { API_URL } from "@/config/env";
import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import logoAsset from "@/assets/ssseedshop-logo.png";
import { toast } from "sonner";

type FooterLink = { label: string; href: string };

const defaultCustomerServiceLinks: FooterLink[] = [
  { label: "যোগাযোগ করুন", href: "/help" },
  { label: "অর্ডার ট্র্যাক", href: "/order-search" },
  { label: "রিটার্ন ও এক্সচেঞ্জ", href: "/return-policy" },
  { label: "ডেলিভারি তথ্য", href: "/delivery-charge" },
  { label: "শর্তাবলী", href: "/terms-conditions" },
  { label: "প্রাইভেসি পলিসি", href: "/privacy-policy" },
];

const defaultUsefulLinks: FooterLink[] = [
  { label: "সকল পণ্য", href: "/products" },
  { label: "কম্বো ও ক্যাটাগরি", href: "/categories" },
  { label: "আমার প্রোফাইল", href: "/profile" },
  { label: "আমাদের সম্পর্কে", href: "/help" },
  { label: "বাগান পরামর্শ ও গাইড", href: "/categories" },
  { label: "সাধারণ জিজ্ঞাসা", href: "/help" },
];

function parseLinks(raw: string | null | undefined, fallback: FooterLink[]): FooterLink[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every((x) => x && typeof x.label === "string" && typeof x.href === "string")
    ) {
      return parsed.filter((item) => !item.href.includes("cultivation-guide"));
    }
  } catch {}
  return fallback;
}

// ─── Custom SVG Icons ───
function GooglePlayIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M3.6 1.8 13.5 12 3.6 22.2C3.2 21.7 3 21 3 20.1V3.9c0-.9.2-1.6.6-2.1z" fill="#4285F4" />
      <path d="M16.8 8.7 13.5 12l3.3 3.3 3.9-2.2c1.3-.7 1.3-2 0-2.8l-3.9-1.6z" fill="#34A853" />
      <path d="M13.5 12 3.6 22.2c.5.5 1.3.6 2.2.1l11-6.3L13.5 12z" fill="#FBBC05" />
      <path d="M13.5 12 16.8 8.7 5.8 2.4c-.9-.5-1.7-.4-2.2.1L13.5 12z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.94 1.07.08 2.13-.46 2.79-1.28z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XTwitterIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function Footer({ showDevelopedBy }: { showDevelopedBy?: boolean } = {}) {
  const { lang, t } = useLanguage();
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

  const customerServiceLinks = parseLinks(settings?.footer_quick_links, defaultCustomerServiceLinks);
  const usefulLinks = parseLinks(settings?.footer_categories, defaultUsefulLinks);

  const handleAppClick = () => {
    toast.info(lang === "bn" ? "অ্যাপ খুব শীঘ্রই আসছে!" : "Mobile app is coming soon!");
  };

  return (
    <footer className="bg-white text-slate-700 border-t border-slate-200">
      {/* ─── 1. MAIN FOUR COLUMNS CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-slate-200">
          
          {/* COLUMN 1: Brand Info & Contact */}
          <div className="lg:pr-8 flex flex-col justify-between">
            <div>
              {/* Brand Logo & Name */}
              <Link to="/" className="inline-flex items-center gap-3 mb-3 group">
                <img
                  src={logoAsset}
                  alt="Ss Seed Shop"
                  className="w-12 h-12 object-contain rounded-md drop-shadow-sm group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
                <div>
                  <div className="font-extrabold text-xl text-orange-600 tracking-tight leading-none group-hover:text-orange-700 transition-colors uppercase">
                    SS SEED SHOP
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">
                    {lang === "bn" ? "সেরা বীজের বিশ্বস্ত ঠিকানা" : "PREMIUM SEEDS STORE"}
                  </div>
                </div>
              </Link>

              {/* Tagline / Bio */}
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                {lang === "bn"
                  ? "Ss Seed Shop একটি বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম যা প্রতিটি বাগানী ও কৃষকের কাছে আসল, মানসম্মত ও উচ্চ অঙ্কুরোদগমের বীজ পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।"
                  : "Ss Seed Shop is an e-commerce platform dedicated to providing authentic, safe, and reliable seeds and gardening supplies to every home."}
              </p>
            </div>

            {/* Contact Details with Orange Icons */}
            <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <a
                    href="tel:01933819799"
                    className="font-bold text-sm text-slate-900 hover:text-orange-600 transition-colors block leading-tight"
                  >
                    01933819799
                  </a>
                  <span className="text-[11px] text-slate-400 font-medium">9:00 AM – 11:00 PM</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <a
                  href="mailto:ssseedshop220@gmail.com"
                  className="text-slate-700 hover:text-orange-600 font-medium transition-colors"
                >
                  ssseedshop220@gmail.com
                </a>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-slate-600 leading-snug">
                  {lang === "bn"
                    ? "পরান মণ্ডল টেক, বড় দেওড়া, টঙ্গী, গাজীপুর-১৭১১, বাংলাদেশ"
                    : "House-23, Road-12, Tongi, Gazipur-1711, Bangladesh"}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Customer Service */}
          <div className="lg:px-8">
            <div className="mb-5">
              <h3 className="font-extrabold text-base md:text-lg text-slate-900 pb-1.5 border-b-2 border-slate-900 inline-block tracking-tight">
                {lang === "bn" ? "Customer Service" : "Customer Service"}
              </h3>
            </div>
            <ul className="space-y-3 text-xs">
              {customerServiceLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="flex items-center gap-2 text-slate-700 hover:text-orange-600 hover:translate-x-1 transition-all group font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-900 group-hover:text-orange-600 stroke-[2.5] shrink-0" />
                    <span>
                      {lang === "en"
                        ? item.label === "যোগাযোগ করুন" ? "Contact Us"
                          : item.label === "অর্ডার ট্র্যাক" ? "Track Order"
                          : item.label === "রিটার্ন ও এক্সচেঞ্জ" ? "Return & Exchange"
                          : item.label === "ডেলিভারি তথ্য" ? "Shipping Information"
                          : item.label === "শর্তাবলী" ? "Terms & Conditions"
                          : item.label === "প্রাইভেসি পলিসি" ? "Privacy Policy"
                          : item.label
                        : item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: Useful Links */}
          <div className="lg:px-8">
            <div className="mb-5">
              <h3 className="font-extrabold text-base md:text-lg text-slate-900 pb-1.5 border-b-2 border-slate-900 inline-block tracking-tight">
                {lang === "bn" ? "Useful Links" : "Useful Links"}
              </h3>
            </div>
            <ul className="space-y-3 text-xs">
              {usefulLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="flex items-center gap-2 text-slate-700 hover:text-orange-600 hover:translate-x-1 transition-all group font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-900 group-hover:text-orange-600 stroke-[2.5] shrink-0" />
                    <span>
                      {lang === "en"
                        ? item.label === "সকল পণ্য" ? "All Products"
                          : item.label === "কম্বো ও ক্যাটাগরি" ? "Combos Products"
                          : item.label === "আমার প্রোফাইল" ? "My Account"
                          : item.label === "আমাদের সম্পর্কে" ? "About Us"
                          : item.label === "বাগান পরামর্শ ও গাইড" ? "Blogs"
                          : item.label === "সাধারণ জিজ্ঞাসা" ? "FAQs"
                          : item.label
                        : item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: Follow Us & Download App */}
          <div className="lg:pl-8">
            <h3 className="font-extrabold text-base md:text-lg text-slate-900 tracking-tight">
              {lang === "bn" ? "Follow Us" : "Follow Us"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-3.5">
              {lang === "bn" ? "Stay connected with us" : "Stay connected with us"}
            </p>

            {/* Social Media Circular Buttons */}
            <div className="flex items-center gap-2.5 mb-6">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/ssseedshop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook"
                className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-sm"
              >
                <FacebookIcon className="w-4 h-4 fill-white" />
              </a>

              {/* X / Twitter */}
              <a
                href="https://twitter.com/ssseedshop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                title="X"
                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-sm"
              >
                <XTwitterIcon className="w-3.5 h-3.5 fill-white" />
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@ssseedshop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                title="YouTube"
                className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-sm"
              >
                <YouTubeIcon className="w-4 h-4 fill-white" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/ssseedshop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-sm"
              >
                <InstagramIcon className="w-4 h-4 fill-white" />
              </a>
            </div>

            {/* DOWNLOAD OUR APP Box */}
            <div className="border border-orange-200 bg-orange-50/30 rounded-xl p-4 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-3 text-left">
                {lang === "bn" ? "DOWNLOAD OUR APP" : "DOWNLOAD OUR APP"}
              </div>
              <div className="flex flex-col gap-2.5">
                {/* Google Play Button */}
                <button
                  type="button"
                  onClick={handleAppClick}
                  className="flex items-center gap-2.5 bg-black hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg transition-transform hover:scale-[1.02] active:scale-95 shadow-sm w-full cursor-pointer"
                >
                  <GooglePlayIcon className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <div className="text-[8px] uppercase leading-none text-slate-300 font-medium">GET IT ON</div>
                    <div className="text-xs font-bold leading-tight text-white tracking-wide">Google Play</div>
                  </div>
                </button>

                {/* App Store Button */}
                <button
                  type="button"
                  onClick={handleAppClick}
                  className="flex items-center gap-2.5 bg-black hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg transition-transform hover:scale-[1.02] active:scale-95 shadow-sm w-full cursor-pointer"
                >
                  <AppleIcon className="w-5 h-5 shrink-0 fill-white" />
                  <div className="text-left">
                    <div className="text-[8px] uppercase leading-none text-slate-300 font-medium">Download on the</div>
                    <div className="text-xs font-bold leading-tight text-white tracking-wide">App Store</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── 2. MIDDLE STRIP: WE ACCEPT & OUR DELIVERY PARTNERS ─── */}
      <div className="border-t border-b border-slate-200 bg-slate-50/50 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* We Accept */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-bold text-slate-900 shrink-0">
              {lang === "bn" ? "We Accept" : "We Accept"}
            </span>
            <div className="flex items-center flex-wrap gap-2 justify-center">
              {/* bKash */}
              <div className="h-7 px-2.5 bg-white border border-slate-200 rounded flex items-center gap-1.5 shadow-sm">
                <svg className="w-3.5 h-3.5" viewBox="0 0 32 32" fill="none">
                  <path d="M18.8 3L4 16.5l8.5 2.2L18.8 3z" fill="#E2136E"/>
                  <path d="M12.5 18.7L28 17.5 18.8 3 12.5 18.7z" fill="#E2136E" fillOpacity="0.8"/>
                  <path d="M12.5 18.7l2.8 10.3 3.5-11.5-6.3 1.2z" fill="#E2136E"/>
                </svg>
                <span className="text-[11px] font-extrabold text-[#E2136E]">bKash</span>
              </div>

              {/* Nagad */}
              <div className="h-7 px-2.5 bg-white border border-slate-200 rounded flex items-center gap-1.5 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F7941D]"></span>
                <span className="text-[11px] font-bold text-[#F7941D]">নগদ</span>
              </div>

              {/* Rocket */}
              <div className="h-7 px-2.5 bg-white border border-slate-200 rounded flex items-center gap-1.5 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C3494]"></span>
                <span className="text-[11px] font-bold text-[#8C3494]">রকেট</span>
              </div>

              {/* VISA */}
              <div className="h-7 px-2.5 bg-white border border-slate-200 rounded flex items-center shadow-sm">
                <span className="text-xs font-black tracking-wider italic text-[#1A1F71]">VISA</span>
              </div>

              {/* Mastercard */}
              <div className="h-7 px-2 bg-white border border-slate-200 rounded flex items-center gap-1 shadow-sm">
                <div className="flex -space-x-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90"></div>
                </div>
                <span className="text-[10px] font-bold text-slate-700">mastercard</span>
              </div>

              {/* AMEX */}
              <div className="h-7 px-2 bg-[#006FCF] border border-[#006FCF] rounded flex items-center shadow-sm">
                <span className="text-[10px] font-extrabold text-white tracking-tighter">AMEX</span>
              </div>
            </div>
          </div>

          {/* Our Delivery Partners */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-bold text-slate-900 shrink-0">
              {lang === "bn" ? "Our Delivery Partners" : "Our Delivery Partners"}
            </span>
            <div className="flex items-center flex-wrap gap-2 justify-center">
              {/* Pathao */}
              <div className="h-7 px-2.5 bg-white border border-slate-200 rounded flex items-center gap-1.5 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E83B3B]"></span>
                <span className="text-[11px] font-bold text-[#E83B3B]">pathao</span>
              </div>

              {/* Steadfast */}
              <div className="h-7 px-2.5 bg-white border border-slate-200 rounded flex items-center gap-1.5 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
                <span className="text-[11px] font-bold text-[#D97706]">Steadfast</span>
              </div>

              {/* REDX */}
              <div className="h-7 px-2.5 bg-white border border-slate-200 rounded flex items-center gap-1 shadow-sm">
                <span className="text-[11px] font-black text-[#E11D48] tracking-wider">REDX</span>
              </div>

              {/* iEX / Express */}
              <div className="h-7 px-2.5 bg-white border border-slate-200 rounded flex items-center gap-1 shadow-sm">
                <span className="text-[11px] font-black text-[#2563EB]">i</span>
                <span className="text-[11px] font-black text-[#DC2626]">EX</span>
                <span className="text-[8px] font-medium text-slate-400">EXPRESS</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── 3. BOTTOM ORANGE BAR: COPYRIGHT & DESIGN CREDITS ─── */}
      <div className="bg-[#f06e15] text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium">
          <div>
            © {new Date().getFullYear()} Ss Seed Shop. {t("সর্বস্বত্ব সংরক্ষিত।", "All rights reserved.")}
          </div>
          <div>
            {shouldShowDevelopedBy && (
              <a
                href="https://wa.me/8801560007230?text=Hello%20HaqPlus%20IT!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-white/95 hover:text-white transition-opacity font-medium"
              >
                <span>Design & Developed by</span>
                <span className="font-extrabold underline decoration-white/70 underline-offset-2">HaqPlus IT</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
