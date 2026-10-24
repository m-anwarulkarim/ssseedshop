import { MessageCircle, Phone, Facebook, Mail, HelpCircle, Instagram, Music2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import SEOHead from "@/components/SEOHead";

const helpSections = [
  {
    icon: Phone,
    title: "ফোনে যোগাযোগ",
    description: "সকাল ৯টা থেকে রাত ১১টা পর্যন্ত সরাসরি কল করুন।",
    action: "01805080556",
    href: "tel:01805080556",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "যেকোনো প্রশ্ন বা সমস্যায় WhatsApp-এ মেসেজ দিন।",
    action: "WhatsApp করুন",
    href: "https://wa.me/8801805080556?text=Assalamu%20Alaikum",
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
    action: "info@ssseedshop.com",
    href: "mailto:info@ssseedshop.com",
  },
];

const faqItems = [
  { q: "অর্ডার কিভাবে করবো?", a: "আমাদের ওয়েবসাইট থেকে পণ্য সিলেক্ট করে অর্ডার দিন, অথবা ফোনে কল করুন।" },
  { q: "ডেলিভারি কত দিনে হয়?", a: "সাধারণত ঢাকায় ১-২ দিন এবং ঢাকার বাইরে ২-৪ দিনের মধ্যে ডেলিভারি হয়।" },
  { q: "পণ্য ফেরত দেওয়া যায়?", a: "পণ্যে সমস্যা থাকলে ডেলিভারির সময় কুরিয়ারের কাছে ফেরত দিতে পারবেন।" },
  { q: "পেমেন্ট কিভাবে করবো?", a: "ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন।" },
];

export default function Help() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="সাহায্য ও সাপোর্ট — Ss Seed Shop"
        description="Ss Seed Shop এর সাহায্য কেন্দ্র — অর্ডার, ডেলিভারি বা যেকোনো সমস্যায় আমরা আছি আপনার পাশে।"
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
