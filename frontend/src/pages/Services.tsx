import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import SEOHead from "@/components/SEOHead";
import {
  Loader2, BookOpen, ArrowRight, Sprout, Bug, AlertTriangle, Bell,
  TrendingUp, Home, Leaf, Droplets, Sun, Flower2,
} from "lucide-react";

const ICONS = [Sprout, Bug, AlertTriangle, Bell, TrendingUp, Home, Leaf, Droplets, Sun, Flower2];

export default function Services() {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ["blogs-public"],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${apiUrl}/blogs/get.php?published=1`);
      if (!res.ok) return [];
      return await res.json();
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="কৃষি সেবা — Ss Seed Shop"
        description="ফসলের যত্ন, পোকামাকড় দমন, রোগবালাই সমাধান, অধিক ফলন ও ছাদ বাগান — কৃষির প্রয়োজনীয় জ্ঞানভিত্তিক নির্দেশনা।"
      />
      <Navbar />
      <SideCart />

      {/* Hero */}
      <section className="relative w-full bg-gradient-to-b from-emerald-50/70 via-background to-background overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, hsl(var(--primary)) 1px, transparent 1px), radial-gradient(circle at 70% 60%, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "40px 40px, 60px 60px",
          }}
        />
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 md:pt-16 md:pb-12 text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <Sprout className="w-3.5 h-3.5" />
            কৃষি সেবা
          </span>
          <h1 className="mt-4 font-display font-bold text-3xl md:text-5xl lg:text-6xl leading-tight text-foreground tracking-tight">
            কৃষির প্রয়োজনীয়{" "}
            <span className="text-emerald-700">জ্ঞানভিত্তিক নির্দেশনা</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-sm md:text-base text-muted-foreground leading-relaxed">
            ফসলের যত্ন, পোকামাকড় দমন, রোগবালাই সমাধান, অধিক ফলন পাওয়ার কৌশল এবং
            ছাদ বাগান — সব গুরুত্বপূর্ণ কৃষি তথ্য এখানে সহজভাবে সাজানো হয়েছে,
            যাতে কৃষক ও বাগানপ্রেমীরা সঠিক নির্দেশনা পেতে পারেন।
          </p>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
            </div>
          ) : !blogs?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>এখনো কোনো কৃষি সেবা যুক্ত হয়নি</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {blogs.map((b: any, idx: number) => {
                const Icon = ICONS[idx % ICONS.length];
                return (
                  <article
                    key={b.id}
                    className="group relative flex flex-col bg-white rounded-2xl border border-emerald-100/80 shadow-[0_2px_10px_-4px_rgba(16,185,129,0.15)] hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.35)] hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                        {b.category || "কৃষি গাইড"}
                      </span>
                      <Icon className="w-5 h-5 text-emerald-600/80 shrink-0" />
                    </div>
                    <h2 className="mt-3 font-display font-bold text-lg md:text-xl text-foreground leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      <Link to={`/services/${b.slug}`} className="after:absolute after:inset-0">
                        {b.title}
                      </Link>
                    </h2>
                    {b.excerpt && (
                      <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                        {b.excerpt}
                      </p>
                    )}
                    <div className="mt-5 pt-4 border-t border-emerald-100/70 flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">
                        বিস্তারিত গাইড
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 group-hover:gap-1.5 transition-all">
                        পড়ুন
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
