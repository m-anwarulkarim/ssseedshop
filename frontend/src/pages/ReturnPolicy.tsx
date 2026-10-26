import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import { detectDomainInfo, buildDynamicKeywords, buildBreadcrumbSchema } from "@/lib/seoDomain";

const HEADING_COLOR = "#0f3d14";
const BODY_COLOR = "#212121";

interface Section {
  title: string;
  items?: string[];
  paragraph?: string;
}

const sections: Section[] = [
  {
    title: "রিটার্ন কখন গ্রহণযোগ্য",
    items: [
      "প্রোডাক্ট ডেলিভারির সময় প্যাকেট ক্ষতিগ্রস্ত / সিল ভাঙা থাকলে",
      "ভুল প্রোডাক্ট ডেলিভারি হলে",
      "প্যাকেজিং ত্রুটিপূর্ণ বা প্রোডাক্ট নষ্ট থাকলে",
    ],
  },
  {
    title: "রিটার্ন গ্রহণযোগ্য নয়",
    items: [
      "প্যাকেট খোলার পর ব্যবহৃত বীজ",
      "সঠিক প্রোডাক্ট পেয়েও পছন্দ না হলে",
      "চারা গজানো / ফলন সংক্রান্ত অভিযোগ (এটি আবহাওয়া, মাটি ও যত্নের উপর নির্ভরশীল)",
      "ডেলিভারির ২৪ ঘণ্টা পরে অভিযোগ",
    ],
  },
  {
    title: "ডেলিভারি প্রত্যাখ্যান করলে",
    paragraph:
      "প্রোডাক্ট সঠিক ও সব কিছু ঠিকঠাক থাকার পরও যদি ক্রেতা ডেলিভারি গ্রহণ না করেন, তাহলে ১২০ টাকা ডেলিভারি ফি পরিশোধ করতে আপনি বাধ্য থাকবেন।",
  },
  {
    title: "রিফান্ড প্রক্রিয়া",
    paragraph:
      "রিটার্ন অনুমোদিত হলে প্রোডাক্ট ফেরত পাওয়ার ৩-৭ কর্মদিবসের মধ্যে রিফান্ড / রিপ্লেসমেন্ট প্রসেস করা হবে। রিফান্ড একই মাধ্যমে ফেরত দেওয়া হবে যেভাবে পেমেন্ট হয়েছিল।",
  },
];

export default function ReturnPolicy() {
  const { t } = useLanguage();
  const domainInfo = useMemo(() => detectDomainInfo(), []);
  const returnCanonical = `${domainInfo.origin}/return-policy`;

  const returnKeywords = useMemo(() => {
    return buildDynamicKeywords({
      customKeywords: [
        "রিটার্ন পলিসি",
        "রিফান্ড পলিসি",
        "বীজ ফেরত দেওয়ার নিয়ম",
        "পণ্য পরিবর্তন",
        "return policy bangladesh",
      ],
    });
  }, []);

  const returnJsonLd = useMemo(() => {
    return [
      buildBreadcrumbSchema([
        { name: "হোম", url: domainInfo.origin },
        { name: "রিটার্ন পলিসি", url: returnCanonical },
      ]),
    ];
  }, [domainInfo, returnCanonical]);

  const returnTitle = `রিটার্ন ও রিফান্ড পলিসি — সহজ শর্তে পণ্য ফেরত | Ss Seed Shop`;
  const returnDesc = `SS Seed (Ss Seed Shop)-এর গ্রাহকবান্ধব রিটার্ন ও রিফান্ড নীতিমালা। নষ্ট বা ভুল পণ্যে সহজ রিপ্লেসমেন্ট সুবিধা।`;

  return (
    <>
      <SEOHead
        title={returnTitle}
        description={returnDesc}
        keywords={returnKeywords}
        url={returnCanonical}
        jsonLd={returnJsonLd}
      />
      <Navbar />
      <SideCart />
      <main className="min-h-screen bg-white py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("হোমে ফিরে যান", "Back to Home")}
          </Link>

          {/* Title block */}
          <header className="mb-8">
            <h1
              className="font-bold text-3xl md:text-4xl leading-tight"
              style={{ color: BODY_COLOR }}
            >
              {t("রিটার্ন পলিসি", "Return Policy")}
            </h1>
            <p
              className="font-bold text-lg md:text-xl mt-2"
              style={{ color: BODY_COLOR }}
            >
              {t(
                "আপনার সন্তুষ্টি আমাদের অগ্রাধিকার",
                "Your satisfaction is our priority"
              )}
            </p>
          </header>

          <div className="space-y-6">
            {sections.map((sec) => (
              <section key={sec.title}>
                <h2
                  className="font-bold text-lg md:text-xl mb-2"
                  style={{ color: HEADING_COLOR }}
                >
                  {sec.title}
                </h2>
                {sec.items && (
                  <ul className="list-disc pl-6 space-y-1">
                    {sec.items.map((item) => (
                      <li
                        key={item}
                        className="text-base leading-relaxed"
                        style={{ color: BODY_COLOR }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {sec.paragraph && (
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: BODY_COLOR }}
                  >
                    {sec.paragraph}
                  </p>
                )}
              </section>
            ))}
          </div>

          <p
            className="mt-10 text-base"
            style={{ color: "#555555" }}
          >
            Ss Seed Shop —{" "}
            <span className="font-bold">
              {t("সেরা মানের বীজ, সেরা ফলন", "Best seeds, best harvest")}
            </span>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
