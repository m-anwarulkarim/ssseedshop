import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import { detectDomainInfo, buildDynamicKeywords, buildBreadcrumbSchema } from "@/lib/seoDomain";

interface Section {
  number: string;
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    number: "০১",
    title: "বীজের মান ও Germination",
    content: (
      <div className="space-y-3">
        <p>
          আমরা বিভিন্ন দেশ ও অঞ্চল থেকে উন্নত মানের বীজ সংগ্রহ করি এবং প্রতিটি বীজ যাচাই-বাছাই ও
          Germination Test করার পরই বিক্রির জন্য প্রস্তুত করি।
        </p>
        <p>আমরা সর্বোচ্চ চেষ্টা করি 90%+ Germination সম্পন্ন উন্নতমানের বীজ সরবরাহ করার।</p>
      </div>
    ),
  },
  {
    number: "০২",
    title: "চাষ ও পরিচর্যা সংক্রান্ত শর্ত",
    content: (
      <div className="space-y-3">
        <p>
          বীজ রোপণের পর সঠিক পরিচর্যা, মাটি, পানি, আবহাওয়া ও পরিবেশের উপর ফলন নির্ভর করে।
        </p>
        <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-400 p-3 rounded-r-md">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            দায়ভার: যদি ক্রেতা সঠিকভাবে পরিচর্যা বা রোপণ করতে ব্যর্থ হন, তাহলে তার দায়ভার সম্পূর্ণ ক্রেতার নিজস্ব হবে।
          </p>
        </div>
      </div>
    ),
  },
  {
    number: "০৩",
    title: "Germination Guarantee",
    content: (
      <div className="space-y-3">
        <p>
          আমাদের দেওয়া নির্দেশনা অনুযায়ী বীজ রোপণ করার পরও যদি কোনো বীজ অঙ্কুরিত (germinate) না হয়,
          তাহলে যথাযথ প্রমাণ প্রদান সাপেক্ষে আমরা একই বীজ পুনরায় পাঠিয়ে দেব।
        </p>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-400 p-3 rounded-r-md">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">
            বিশেষ সুবিধা: এই ক্ষেত্রে পুনরায় পাঠানো বীজের জন্য অতিরিক্ত প্রোডাক্ট মূল্য নেওয়া হবে না।
          </p>
        </div>
      </div>
    ),
  },
  {
    number: "০৪",
    title: "প্রমাণ (Proof) প্রদান বাধ্যতামূলক",
    content: (
      <div className="space-y-3">
        <p>Germination সমস্যা সংক্রান্ত দাবি করার জন্য নিচের প্রমাণ দিতে হবে:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>বীজের প্যাকেট হাতে পাওয়ার ভিডিও</li>
          <li>বীজ রোপণের সময় প্যাকেট কেটে রোপণ করার ভিডিও</li>
          <li>রোপণের প্রক্রিয়ার স্পষ্ট ভিডিও/ছবি</li>
        </ul>
        <div className="bg-destructive/10 border-l-4 border-destructive p-3 rounded-r-md">
          <p className="font-medium text-destructive-foreground">
            লক্ষ্য করুন: উপরের প্রমাণ ছাড়া কোনো অভিযোগ গ্রহণযোগ্য নাও হতে পারে।
          </p>
        </div>
      </div>
    ),
  },
  {
    number: "০৫",
    title: "ডেলিভারি",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">ডেলিভারি সময়</p>
        <ul className="space-y-1">
          <li className="flex items-center gap-2">
            <span className="text-emerald-500">✔</span>
            <span>শহর এলাকায়: ১–২ দিন</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-500">✔</span>
            <span>গ্রামের এলাকায়: ২–৩ দিন (লোকেশন অনুযায়ী)</span>
          </li>
        </ul>
        <p className="font-semibold text-foreground mt-2">⚠️ গুরুত্বপূর্ণ তথ্য</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>কুরিয়ার সংক্রান্ত কোনো সমস্যার কারণে ডেলিভারি সময় পরিবর্তিত হতে পারে</li>
          <li>সঠিক নাম, মোবাইল নাম্বার ও ঠিকানা প্রদান করা বাধ্যতামূলক</li>
          <li>অর্ডার কনফার্ম হওয়ার পর দ্রুত প্যাকিং ও শিপিং করা হয়</li>
        </ul>
        <div className="bg-secondary/50 border rounded-lg p-4 mt-2">
          <p className="font-semibold text-foreground mb-1">📦 প্যাকেজিং</p>
          <p>
            আমাদের সকল বীজ নিরাপদ ও ভালোভাবে প্যাকিং করে পাঠানো হয়, যাতে পণ্য নিরাপদ অবস্থায় আপনার কাছে পৌঁছে।
          </p>
        </div>
      </div>
    ),
  },
  {
    number: "০৬",
    title: "নীতিমালা পরিবর্তন",
    content: (
      <p>
        যেকোনো সময় প্রয়োজন অনুযায়ী Terms & Conditions পরিবর্তন বা আপডেট করার অধিকার আমরা সংরক্ষণ করি।
      </p>
    ),
  },
];

export default function TermsConditions() {
  const { t } = useLanguage();
  const domainInfo = useMemo(() => detectDomainInfo(), []);
  const termsCanonical = `${domainInfo.origin}/terms-conditions`;

  const termsKeywords = useMemo(() => {
    return buildDynamicKeywords({
      customKeywords: [
        "ব্যবহারের শর্তাবলী",
        "শর্তাবলী",
        "নীতিমালা",
        "বীজ ক্রয়ের শর্ত",
        "terms and conditions bangladesh",
      ],
    });
  }, []);

  const termsJsonLd = useMemo(() => {
    return [
      buildBreadcrumbSchema([
        { name: "হোম", url: domainInfo.origin },
        { name: "ব্যবহারের শর্তাবলী", url: termsCanonical },
      ]),
    ];
  }, [domainInfo, termsCanonical]);

  const termsTitle = `ব্যবহারের শর্তাবলী ও নীতিমালা | Ss Seed Shop`;
  const termsDesc = `SS Seed (Ss Seed Shop)-এ বীজ ও কৃষি পণ্য ক্রয়ের সাধারণ নীতিমালা ও শর্তাবলী বিস্তারিত জানুন।`;

  return (
    <>
      <SEOHead
        title={termsTitle}
        description={termsDesc}
        keywords={termsKeywords}
        url={termsCanonical}
        jsonLd={termsJsonLd}
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
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {t("শর্তাবলী", "Terms & Conditions")}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {t("শেষ আপডেট: ২০২৬", "Last updated: 2026")}
            </p>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
              {t(
                "আমাদের ওয়েবসাইট থেকে বীজ অর্ডার করার আগে নিচের শর্তসমূহ অনুগ্রহ করে ভালোভাবে পড়ুন।",
                "Please read the following terms carefully before ordering seeds from our website."
              )}
            </p>

            <div className="space-y-6">
              {sections.map((sec) => (
                <section
                  key={sec.number}
                  className="border-b last:border-b-0 pb-5 last:pb-0 border-border/60"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">
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
