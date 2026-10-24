import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import SEOHead from "@/components/SEOHead";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
import DOMPurify from "dompurify";
import { handleImageError } from "@/lib/imageFallback";

export default function BlogDetail() {
  const { slug } = useParams();
  const isHtmlContent = (s?: string | null) => !!s && /<\/?(p|div|h[1-6]|ul|ol|li|b|strong|i|em|u|span|a|br)\b/i.test(s);


  const { data: blog, isLoading, error } = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${apiUrl}/blogs/get.php?slug=${encodeURIComponent(slug!)}`);
      if (!res.ok) throw new Error("Blog not found");
      return await res.json();
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={blog ? `${blog.title} — Ss Seed Shop` : "ব্লগ — Ss Seed Shop"}
        description={blog?.excerpt || "Ss Seed Shop ব্লগ"}
        image={blog?.cover_image}
      />
      <Navbar />
      <SideCart />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            সব ব্লগ
          </Link>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
            </div>
          ) : !blog || error ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>ব্লগ পাওয়া যায়নি</p>
            </div>
          ) : (
            <article>
              <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground leading-tight">
                {blog.title}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(blog.created_at).toLocaleDateString("bn-BD", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {blog.cover_image && (
                <img
                  src={blog.cover_image}
                  alt={blog.title}
                  className="mt-5 w-full rounded-2xl border border-border object-cover max-h-[420px]"
                  onError={handleImageError}
                />
              )}
              {blog.excerpt && (
                <p className="mt-5 text-base md:text-lg text-muted-foreground italic border-l-4 border-primary/40 pl-4">
                  {blog.excerpt}
                </p>
              )}
              {isHtmlContent(blog.content) ? (
                <div
                  className="blog-content mt-6 text-[15px] md:text-base text-foreground leading-relaxed max-w-none"
                  style={{ wordBreak: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content || "") }}
                />
              ) : (
                <div
                  className="mt-6 text-[15px] md:text-base text-foreground whitespace-pre-wrap leading-relaxed max-w-none"
                  style={{ wordBreak: "break-word" }}
                >
                  {blog.content}
                </div>
              )}

            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
