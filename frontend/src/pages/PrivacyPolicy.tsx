import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";

interface Section {
  number: string;
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    number: "০১",
    title: "আমরা কী তথ্য সংগ্রহ করি",
    content: (
      <p>
        অর্ডার সম্পন্ন করার সময় আমরা আপনার নাম, মোবাইল নম্বর, ডেলিভারি
        ঠিকানা এবং প্রোডাক্ট পছন্দ সংগ্রহ করি। এই তথ্য শুধুমাত্র অর্ডার
        প্রসেসিং, ডেলিভারি ও কাস্টমার সাপোর্টের জন্য ব্যবহৃত হয়।
      </p>
    ),
  },
  {
    number: "০২",
    title: "তথ্যের ব্যবহার",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>অর্ডার কনফার্মেশন ও ডেলিভারি আপডেট পাঠানো</li>
        <li>কাস্টমার সাপোর্ট প্রদান</li>
        <li>নতুন প্রোডাক্ট ও অফার সম্পর্কে অবহিত করা (আপনার সম্মতিতে)</li>
      </ul>
    ),
  },
  {
    number: "০৩",
    title: "তথ্য সুরক্ষা",
    content: (
      <p>
        আপনার ব্যক্তিগত তথ্য আমাদের সুরক্ষিত সার্ভারে সংরক্ষিত থাকে। কোনো
        তৃতীয় পক্ষের সাথে আপনার অনুমতি ছাড়া তথ্য শেয়ার করা হয় না,
        শুধুমাত্র কুরিয়ার সার্ভিস (যেমন Steadfast) ব্যতীত — তাদের কাছে শুধু
        ডেলিভারির প্রয়োজনীয় তথ্য (নাম, ঠিকানা, ফোন) পাঠানো হয়।
      </p>
    ),
  },
  {
    number: "০৪",
    title: "কুকিজ",
    content: (
      <p>
        ওয়েবসাইটের অভিজ্ঞতা উন্নত করতে এবং কার্ট সংরক্ষণের জন্য আমরা কুকিজ
        ব্যবহার করি।
      </p>
    ),
  },
  {
    number: "০৫",
    title: "যোগাযোগ",
    content: (
      <div className="space-y-2">
        <p>প্রাইভেসি সংক্রান্ত যেকোনো প্রশ্নের জন্য যোগাযোগ করুন:</p>
        <p>
          ইমেইল:{" "}
          <a
            href="mailto:ssseedshop220@gmail.com"
            className="text-primary hover:underline"
          >
            ssseedshop220@gmail.com
          </a>
        </p>
      </div>
    ),
  },
];

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead
        title={t("প্রাইভেসি পলিসি — Ss Seed Shop", "Privacy Policy — Ss Seed Shop")}
        description={t(
          "Ss Seed Shop-এ আপনার ব্যক্তিগত তথ্য কীভাবে সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখা হয় তা জানুন।",
          "Learn how Ss Seed Shop collects, uses, and protects your personal information."
        )}
      />
      <Navbar />
      <SideCart />
      <main className="min-h-screen bg-background py-6 md:py-10">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("হোমে ফিরে যান", "Back to Home")}
          </Link>

          <div className="bg-card border rounded-2xl p-5 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {t("প্রাইভেসি পলিসি", "Privacy Policy")}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {t("সর্বশেষ আপডেট: ২১ জুলাই ২০২৬", "Last updated: 21 July 2026")}
            </p>

            <div className="space-y-6">
              {sections.map((sec) => (
                <section
                  key={sec.number}
                  className="border-b last:border-b-0 pb-5 last:pb-0 border-border/60"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {sec.number}
                    </span>
                    <h2 className="text-base md:text-lg font-semibold text-foreground">
                      {sec.title}
                    </h2>
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground leading-relaxed pl-0 md:pl-[3.25rem]">
                    {sec.content}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 pt-5 border-t border-border/60 text-center">
              <p className="text-sm font-medium text-foreground">
                Ss Seed Shop — {t("সেরা মানের বীজ, সেরা ফলন", "Best seeds, best harvest")}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
