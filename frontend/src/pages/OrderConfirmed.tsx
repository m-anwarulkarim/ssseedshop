import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, User, Download, BookOpen, Loader2, Copy, ExternalLink } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { openInvoiceWindow } from "@/lib/invoiceTemplate";
import { firePendingCatalogPurchase } from "@/lib/metaPurchase";
import { toast } from "sonner";




interface OrderItem {
  name: string;
  image: string | null;
  quantity: number;
  price: number;
  oldPrice: number | null;
}

interface OrderDetails {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  oldTotal: number;
  deliveryCharge: number;
  grandTotal: number;
}

function loadOrderDetails(): OrderDetails | null {
  try {
    const raw = sessionStorage.getItem("last-order-details");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function downloadInvoice(orderId: string | undefined, order: OrderDetails | null) {
  let invoiceOrder: any = null;

  if (orderId) {
    const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${url}/orders/get_single.php?id=${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) {
          // Map items to order_items format for the invoice generator
          invoiceOrder = {
            ...data,
            order_items: (data.items || []).map((i: any) => ({
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
    } catch {}
  }

  // Fallback to locally stored order details if the DB row isn't reachable
  if (!invoiceOrder && order) {
    invoiceOrder = {
      order_id: orderId,
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address,
      created_at: new Date().toISOString(),
      delivery_charge: order.deliveryCharge,
      discount: 0,
      advance: 0,
      total_amount: order.grandTotal,
      order_items: order.items.map((it) => ({
        product_name: it.name,
        product_image: it.image,
        quantity: it.quantity,
        unit_price: it.price,
        products: { regular_price: it.oldPrice ?? it.price },
      })),
    };
  }

  if (!invoiceOrder) {
    toast.error("ইনভয়েস তৈরি করা যায়নি");
    return;
  }

  const ok = openInvoiceWindow([invoiceOrder]);
  if (!ok) toast.error("পপ-আপ ব্লকড — ব্রাউজারে পপ-আপ অনুমতি দিন");
}



export default function OrderConfirmed() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = useMemo(() => loadOrderDetails(), []);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Fire the Meta Purchase event only when the confirmation page is reached.
  useEffect(() => {
    firePendingCatalogPurchase(orderId);
  }, [orderId]);


  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <SEOHead title="অর্ডার সফল হয়েছে" description="আপনার অর্ডার সফলভাবে গৃহীত হয়েছে — Ss Seed Shop" />
      <div className="max-w-md w-full bg-card rounded-2xl border border-border p-6 text-center space-y-5">
        <div className="flex justify-center">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground">ধন্যবাদ!</h1>

        <p className="text-muted-foreground leading-relaxed text-sm">
          আপনার অর্ডার কনফার্ম করা হয়েছে। একজন প্রতিনিধি আপনাকে শীঘ্রই কল করবেন।
        </p>

        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">অর্ডার আইডি</p>
          <p className="text-2xl font-display font-bold text-primary mt-1">{orderId}</p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={async () => {
                setLoadingInvoice(true);
                try {
                  await downloadInvoice(orderId, order);
                } finally {
                  setLoadingInvoice(false);
                }
              }}
              disabled={loadingInvoice}
              variant="secondary"
              className="w-full rounded-xl text-primary font-semibold text-xs sm:text-sm"
            >
              {loadingInvoice ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />} ডাউনলোড ইনভয়েস
            </Button>

            <Button
              onClick={() => {
                const url = `${window.location.origin}/invoice/${orderId}`;
                navigator.clipboard.writeText(url);
                toast.success("ইনভয়েস লিংক কপি হয়েছে!");
              }}
              variant="outline"
              className="w-full rounded-xl text-foreground font-semibold text-xs sm:text-sm border-primary/30"
            >
              <Copy className="w-4 h-4 mr-1.5 text-primary" /> লিংক কপি করুন
            </Button>
          </div>

          <Button
            onClick={() => navigate(`/invoice/${orderId}`)}
            variant="default"
            className="w-full rounded-xl text-primary-foreground font-semibold"
          >
            <ExternalLink className="w-4 h-4 mr-2" /> ইনভয়েস পেজ দেখুন
          </Button>

          <Button
            onClick={() => navigate("/cultivation-guide")}
            variant="ghost"
            className="w-full rounded-xl text-muted-foreground font-medium text-xs"
          >
            <BookOpen className="w-4 h-4 mr-2 text-primary" /> চাষাবাদ নির্দেশনা দেখুন
          </Button>
        </div>

        {/* Hotline Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-muted-foreground leading-relaxed">
          ২৪ ঘণ্টার মধ্যে কল করা না হলে আমাদের হটলাইন নম্বরে কল করুন:
          <a href="tel:01805080556" className="block text-primary font-bold text-base mt-1">
            01805080556
          </a>
          আমাদের উপর আস্থা রেখে অর্ডার করার জন্য অসংখ্য ধন্যবাদ!
        </div>

        

        <div className="space-y-3 pt-2">
          <Button onClick={() => navigate("/")} variant="outline" className="w-full rounded-xl">
            <Home className="w-4 h-4 mr-2" /> হোমে ফিরুন
          </Button>
          <Button onClick={() => navigate("/profile")} variant="outline" className="w-full rounded-xl">
            <User className="w-4 h-4 mr-2" /> প্রোফাইল দেখুন
          </Button>
        </div>
      </div>
    </div>
  );
}
