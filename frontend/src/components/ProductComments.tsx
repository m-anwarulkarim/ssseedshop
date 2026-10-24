import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, MessageCircle, Star, Send } from "lucide-react";
import { toast } from "sonner";

interface Props {
  productId: string;
}

interface Comment {
  id: string;
  name: string;
  comment: string;
  rating: number | null;
  created_at: string;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "এইমাত্র";
  if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ঘণ্টা আগে`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} দিন আগে`;
  return new Date(iso).toLocaleDateString("bn-BD");
}

function getCustomerSession(): { phone: string; name?: string } | null {
  try {
    const raw = localStorage.getItem("customer-session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function ProductComments({ productId }: Props) {
  const qc = useQueryClient();
  const session = getCustomerSession();
  const [name, setName] = useState(session?.name || "");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["product-comments", productId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from("product_comments" as any)
        .select("id, name, comment, rating, created_at")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as any;
    },
    enabled: !!productId,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalName = (name || session?.name || session?.phone || "").trim();
    if (finalName.length < 1) {
      toast.error("আপনার নাম লিখুন");
      return;
    }
    const c = comment.trim();
    if (c.length < 1) {
      toast.error("মন্তব্য লিখুন");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("product_comments" as any).insert({
      product_id: productId,
      name: finalName.slice(0, 60),
      comment: c.slice(0, 1000),
      rating,
    });
    setSubmitting(false);
    if (error) {
      toast.error("কমেন্ট পাঠানো যায়নি");
      return;
    }
    toast.success("ধন্যবাদ! আপনার মন্তব্য যোগ হয়েছে");
    setComment("");
    setRating(5);
    qc.invalidateQueries({ queryKey: ["product-comments", productId] });
  }

  const ratedComments = comments.filter((c) => c.rating);
  const avg = ratedComments.length
    ? (ratedComments.reduce((s, c) => s + (c.rating || 0), 0) / ratedComments.length).toFixed(1)
    : null;

  return (
    <section className="mt-6 bg-white rounded-2xl border border-border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          কাস্টমার রিভিউ
          <span className="text-sm text-muted-foreground font-normal">
            ({comments.length})
          </span>
        </h2>
        {avg && (
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {avg}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 mb-5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-xs text-muted-foreground mr-1">রেটিং:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} className="p-0.5">
              <Star className={`w-5 h-5 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            </button>
          ))}
        </div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="আপনার নাম"
          maxLength={60}
          className="bg-white h-9"
        />
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="পণ্য সম্পর্কে আপনার অভিজ্ঞতা লিখুন..."
          maxLength={1000}
          rows={3}
          className="bg-white resize-none"
        />
        <Button type="submit" disabled={submitting} className="w-full h-10 rounded-xl">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1.5" />}
          রিভিউ পোস্ট করুন
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">
          এখনো কোনো রিভিউ নেই।
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border border-border rounded-xl p-3 bg-white">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold leading-tight">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{timeAgo(c.created_at)}</div>
                  </div>
                </div>
                {c.rating && (
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-3.5 h-3.5 ${n <= c.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-foreground/85 whitespace-pre-wrap pl-10">{c.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
