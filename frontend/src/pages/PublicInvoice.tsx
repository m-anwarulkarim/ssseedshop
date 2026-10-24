import { API_URL } from "@/config/env";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { buildInvoiceHtml, openInvoiceWindow } from "@/lib/invoiceTemplate";
import { Button } from "@/components/ui/button";
import { Printer, Copy, Share2, ArrowLeft, Loader2, CheckCircle2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

export default function PublicInvoice() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);

      const cleanId = orderId.trim();

      // Try matching by order_id string (case-insensitive) first
      const url = API_URL;
      let data = null;
      try {
        const res = await fetch(`${url}/orders/get_single.php?id=${encodeURIComponent(cleanId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json && !json.error) {
            data = {
              ...json,
              order_items: (json.items || []).map((i: any) => ({
                ...i,
                products: {
                  regular_price: i.unit_price,
                  short_description: i.product_name,
                  product_image: i.product_image
                }
              }))
            };
          }
        }
      } catch (err) {
        console.error("Failed to load invoice order:", err);
      }

      if (data) {
        setOrder(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }

    fetchOrder();
  }, [orderId]);

  const invoiceUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invoiceUrl);
    setCopied(true);
    toast.success("ইনভয়েস লিংক কপি করা হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Ss Seed Shop - ইনভয়েস/অর্ডার চালান: ${order?.order_id || orderId}\nলিংক: ${invoiceUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handlePrint = () => {
    if (!order) return;
    openInvoiceWindow([order]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
        <SEOHead title="ইনভয়েস লোড হচ্ছে..." description="Ss Seed Shop অর্ডার ইনভয়েস" />
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground font-medium">ইনভয়েস তৈরি করা হচ্ছে...</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4 text-center">
        <SEOHead title="ইনভয়েস পাওয়া যায়নি" description="Ss Seed Shop অর্ডার ইনভয়েস" />
        <div className="bg-card p-8 rounded-2xl border border-border max-w-md w-full shadow-sm space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-foreground">ইনভয়েস খুঁজে পাওয়া যায়নি</h2>
          <p className="text-sm text-muted-foreground">
            আপনার প্রদানকৃত ইনভয়েস আইডিটি সঠিক নয় অথবা অর্ডারের তথ্য মুছে ফেলা হয়েছে।
          </p>
          <Button asChild className="w-full rounded-xl">
            <Link to="/">
              <ShoppingBag className="w-4 h-4 mr-2" /> প্রধান পাতায় যান
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const rawHtml = buildInvoiceHtml([order]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-12">
      <SEOHead title={`ইনভয়েস — ${order.order_id}`} description={`Ss Seed Shop অর্ডার চালান ${order.order_id}`} />

      {/* Top Action Bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-lg">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-1" /> হোম
              </Link>
            </Button>
            <span className="font-bold text-sm text-foreground">
              চালান নং: <span className="font-mono text-primary">{order.order_id}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleCopyLink} variant="outline" size="sm" className="rounded-lg text-xs">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? "কপি হয়েছে" : "লিংক কপি"}
            </Button>

            <Button onClick={handleShareWhatsApp} variant="outline" size="sm" className="rounded-lg text-xs border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30">
              <Share2 className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
            </Button>

            <Button onClick={handlePrint} size="sm" className="rounded-lg text-xs font-semibold">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> ডাউনলোড / প্রিন্ট
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Container */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-6">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <iframe
            title={`Invoice ${order.order_id}`}
            srcDoc={rawHtml}
            sandbox="allow-same-origin allow-modals allow-popups"
            className="w-full min-h-[900px] border-0"
            style={{ height: "100%", minHeight: "1050px" }}
          />
        </div>
      </div>
    </div>
  );
}
