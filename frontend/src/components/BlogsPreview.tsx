import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sprout, Bug, AlertTriangle, Bell, TrendingUp, Home, Leaf, Droplets } from "lucide-react";

const ICONS = [Sprout, Bug, AlertTriangle, Bell, TrendingUp, Home, Leaf, Droplets];

export default function BlogsPreview() {
  const { data: blogs } = useQuery({
    queryKey: ["blogs-preview"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${apiUrl}/blogs/get.php?published=1`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data.slice(0, 2) : [];
    },
  });

  if (!blogs?.length) return null;

  return (
    <section className="w-full bg-gradient-to-b from-emerald-50/40 to-background py-6 md:py-8">
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-3 md:mb-4">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <Sprout className="w-3 h-3" />
              কৃষি সেবা
            </span>
            <h2 className="mt-1.5 font-display font-bold text-lg md:text-2xl text-foreground">
              জ্ঞানভিত্তিক কৃষি নির্দেশনা
            </h2>
          </div>
          <Link
            to="/services"
            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-emerald-700 hover:text-emerald-800 whitespace-nowrap"
          >
            আরও দেখুন
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {blogs.map((b: any, idx: number) => {
            const Icon = ICONS[idx % ICONS.length];
            return (
              <article
                key={b.id}
                className="group relative flex flex-col bg-white rounded-2xl border border-emerald-100/80 shadow-[0_2px_10px_-4px_rgba(16,185,129,0.15)] hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.35)] hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-200 p-4 md:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                    {b.category || "কৃষি গাইড"}
                  </span>
                  <Icon className="w-5 h-5 text-emerald-600/80 shrink-0" />
                </div>
                <h3 className="mt-2.5 font-display font-bold text-base md:text-lg text-foreground leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                  <Link to={`/services/${b.slug}`} className="after:absolute after:inset-0">
                    {b.title}
                  </Link>
                </h3>
                {b.excerpt && (
                  <p className="mt-1.5 text-[12.5px] text-muted-foreground leading-relaxed line-clamp-2">
                    {b.excerpt}
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-emerald-100/70 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium">
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
      </div>
    </section>
  );
}
