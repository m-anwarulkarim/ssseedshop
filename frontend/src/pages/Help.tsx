import { useMemo } from "react";
import { MessageCircle, Phone, Facebook, Mail, HelpCircle, Instagram, Music2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import SEOHead from "@/components/SEOHead";
import {
  detectDomainInfo,
  buildDynamicKeywords,
  buildBreadcrumbSchema,
  buildFAQSchema,
} from "@/lib/seoDomain";

const helpSections = [
  {
    icon: Phone,
    title: "ফোনে যোগাযোগ",
    description: "সকাল ৯টা থেকে রাত ১১টা পর্যন্ত সরাসরি কল করুন।",
    action: "01933819799",
    href: "tel:01933819799",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "যেকোনো প্রশ্ন বা সমস্যায় WhatsApp-এ মেসেজ দিন।",
    action: "WhatsApp করুন",
    href: "https://wa.me/8801933819799?text=Assalamu%20Alaikum",
  },
  {
    icon: Facebook,
    title: "Facebook Page",
    description: "আমাদের ফেসবুক পেজে ইনবক্স করুন।",
    action: "Ss Seed Shop",
    href: "https://www.facebook.com/ssseedshop",
  },
  {
    icon: Instagram,
    title: "Instagram",
    description: "আমাদের ইনস্টাগ্রাম পেজে ফলো ও মেসেজ করুন।",
    action: "@ssseedshop",
    href: "https://www.instagram.com/ssseedshop",
  },
  {
    icon: Music2,
    title: "TikTok",
    description: "টিকটকে আমাদের ভিডিও দেখুন।",
    action: "@ssseedshop",
    href: "https://www.tiktok.com/@ssseedshop",
  },
  {
    icon: Mail,
    title: "Email",
    description: "বিস্তারিত তথ্য বা ব্যবসায়িক যোগাযোগের জন্য ইমেইল করুন।",
    action: "ssseedshop220@gmail.com",
    href: "mailto:ssseedshop220@gmail.com",
  },
];

const faqItems = [
  { q: "অর্ডার কিভাবে করবো?", a: "আমাদের ওয়েবসাইট থেকে আপনার পছন্দের বীজ সিলেক্ট করে সরাসরি 'অর্ডার করুন' বাটনে ক্লিক করে নাম, মোবাইল নম্বর ও ঠিকানা দিলেই অর্ডার নিশ্চিত হয়ে যাবে।" },
  { q: "ডেলিভারি কত দিনে হয়?", a: "সাধারণত ঢাকা সিটির ভেতরে ১-২ দিন এবং ঢাকার বাইরে জেলা ও উপজেলায় ২-৪ দিনের মধ্যে ডেলিভারি সম্পন্ন হয়।" },
  { q: "পণ্য ফেরত দেওয়া যায়?", a: "হ্যাঁ, বীজে কোনো সমস্যা থাকলে ডেলিভারির সময় কুরিয়ারের উপস্থিতিতে যাচাই করে রিটার্ন বা পরিবর্তন করতে পারবেন।" },
  { q: "পেমেন্ট কিভাবে করবো?", a: "ক্যাশ অন ডেলিভারি — হাতে পণ্য বুঝে পেয়ে মূল্য পরিশোধ করবেন।" },
  { q: "বীজের অঙ্কুরোদগম না হলে কী করবেন?", a: "আমাদের প্রতিটি বীজ মানসম্মত এবং অঙ্কুরোদগমের হার ন্যূনতম ৮০%। চাষাবাদ নির্দেশিকা অনুযায়ী বপন করলে চমৎকার ফলাফল পাবেন।" },
];

export default function Help() {
  const domainInfo = useMemo(() => detectDomainInfo(), []);
  const helpCanonical = `${domainInfo.origin}/help`;

  const helpKeywords = useMemo(() => {
    return buildDynamicKeywords({
      customKeywords: [
        "বীজ অর্ডার করার নিয়ম",
        "সিড শপ হেল্পলাইন",
        "কাস্টমার সাপোর্ট",
        "বীজ ডেলিভারি সময়",
        "রিটার্ন ও রিফান্ড সাহায্য",
        "online seed shop helpline bd",
      ],
    });
  }, []);

  const helpJsonLd = useMemo(() => {
    const breadcrumb = buildBreadcrumbSchema([
      { name: "হোম", url: domainInfo.origin },
      { name: "সাহায্য ও সাপোর্ট", url: helpCanonical },
    ]);

    const faqSchema = buildFAQSchema(
      faqItems.map((item) => ({
        question: item.q,
        answer: item.a,
      }))
    );

    return [breadcrumb, faqSchema];
  }, [domainInfo, helpCanonical]);

  const helpTitle = `সাহায্য কেন্দ্র ও সাধারণ জিজ্ঞাসা (FAQ) | Ss Seed Shop`;
  const helpDesc = `বীজ অর্ডার, দ্রুত ডেলিভারি, ক্যাশ অন ডেলিভারি ও রিটার্ন সংক্রান্ত সকল প্রশ্নের উত্তর জানুন। সার্বক্ষণিক কাস্টমার কেয়ার — SS Seed (Ss Seed Shop)।`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={helpTitle}
        description={helpDesc}
        keywords={helpKeywords}
        url={helpCanonical}
        jsonLd={helpJsonLd}
      />
      <Navbar />
      <SideCart />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 sm:py-16 text-center">
          <div className="section-container">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              সাহায্য ও <span className="text-secondary">সাপোর্ট</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              অর্ডার, ডেলিভারি বা যেকোনো সমস্যায় আমাদের সাথে যোগাযোগ করুন। আমরা দ্রুত সাহায্য করার চেষ্টা করি।
            </p>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="pb-12">
          <div className="section-container">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {helpSections.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.href.startsWith("tel:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group block rounded-2xl border border-border bg-card p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    {item.description}
                  </p>
                  <span className="text-sm font-semibold text-primary">{item.action}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-16">
          <div className="section-container">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">
              সচরাচর জিজ্ঞাসা
            </h2>
            <div className="max-w-2xl mx-auto space-y-3">
              {faqItems.map((faq, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-semibold text-foreground text-sm mb-1">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
