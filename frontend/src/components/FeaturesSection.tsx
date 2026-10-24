import { ShieldCheck, BadgeDollarSign, Globe, Wrench, Truck, Headset } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: ShieldCheck,
      title: t("১০০% আসল বীজ", "100% Authentic Seeds"),
      desc: t(
        "মাঠ পর্যায়ে পরীক্ষিত, উচ্চ অংকুরোদগম হারের নিশ্চয়তা।",
        "Field tested with guaranteed high germination rate."
      ),
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      icon: BadgeDollarSign,
      title: t("ন্যায্য মূল্য", "Fair Pricing"),
      desc: t(
        "সেরা মানের বীজ সাশ্রয়ী মূল্যে আপনার দোরগোড়ায়।",
        "Premium quality seeds at affordable prices delivered to your door."
      ),
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      icon: Globe,
      title: t("রেয়ার কালেকশন", "Rare Collection"),
      desc: t(
        "দেশি-বিদেশি বিরল বীজের বিশাল সংগ্রহ।",
        "Huge collection of rare local and imported seeds."
      ),
      bg: "bg-sky-50",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
    },
    {
      icon: Wrench,
      title: t("আধুনিক সরঞ্জাম", "Modern Tools"),
      desc: t(
        "চাষাবাদের ইনোভেটিভ টুলস ও সমাধান।",
        "Innovative tools and solutions for farming."
      ),
      bg: "bg-violet-50",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      icon: Truck,
      title: t("দ্রুত ডেলিভারি", "Fast Delivery"),
      desc: t(
        "সারা বাংলাদেশে দ্রুত ও নিরাপদ ডেলিভারি।",
        "Fast and safe delivery all over Bangladesh."
      ),
      bg: "bg-rose-50",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
    {
      icon: Headset,
      title: t("কৃষি পরামর্শ", "Agri Consultation"),
      desc: t(
        "অভিজ্ঞ কৃষিবিদদের কাছ থেকে যেকোনো সময় পরামর্শ।",
        "Get advice from expert agriculturists anytime."
      ),
      bg: "bg-teal-50",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
    },
  ];

  return (
    <section className="py-8 md:py-14 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="section-container px-3 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-6 md:mb-10">
          <h2 className="font-extrabold text-foreground text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight">
            {t("কেন Ss Seed Shop আপনার প্রথম পছন্দ?", "Why Ss Seed Shop is Your First Choice?")}
          </h2>
          <p className="mt-2 md:mt-3 text-[12px] sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            {t(
              "আমাদের মূল লক্ষ্য শুধু বীজ বিক্রি করা নয়, বরং প্রতিটি কৃষকের অক্লান্ত পরিশ্রমের সঠিক মূল্য নিশ্চিত করে তাদের মুখে স্থায়ী হাসি ফোটানো।",
              "Our goal isn't just to sell seeds — it's to ensure every farmer's hard work is fairly rewarded with a lasting smile."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group ${f.bg} rounded-2xl p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className={`${f.iconBg} ${f.iconColor} w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.2} />
                </div>
                <h3 className="font-bold text-foreground text-[14px] sm:text-[15px] md:text-base leading-tight mb-1.5">
                  {f.title}
                </h3>
                <p className="text-[12px] sm:text-[12.5px] md:text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
