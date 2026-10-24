import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Truck, Gift, Clock, MapPin, PartyPopper } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Tier = { label: string; sub: string; charge: string; isFree: boolean };
type TimeItem = { label: string; value: string };
type DCData = {
  title: string;
  subtitle: string;
  listTitle: string;
  listSubtitle: string;
  tiers: Tier[];
  timeTitle: string;
  timeItems: TimeItem[];
  footerNote: string;
};

const DEFAULTS: DCData = {
  title: "ডেলিভারি চার্জ",
  subtitle: "অর্ডার মূল্য অনুযায়ী ডেলিভারি চার্জ",
  listTitle: "ডেলিভারি চার্জ তালিকা",
  listSubtitle: "সারা বাংলাদেশে হোম ডেলিভারি",
  tiers: [
    { label: "অর্ডার ৳৬০০ বা তার বেশি", sub: "কোনো ডেলিভারি চার্জ লাগবে না 🎉", charge: "ফ্রি", isFree: true },
    { label: "অর্ডার ৳৪০০ – ৳৫৯৯", sub: "সাশ্রয়ী চার্জ", charge: "৳৫০", isFree: false },
    { label: "অর্ডার ৳২০০ – ৳৩৯৯", sub: "নিয়মিত চার্জ", charge: "৳৭০", isFree: false },
    { label: "অর্ডার ৳২০০ এর কম", sub: "ছোট অর্ডারের চার্জ", charge: "৳১২০", isFree: false },
  ],
  timeTitle: "ডেলিভারি পেতে আনুমানিক সময়",
  timeItems: [
    { label: "ঢাকার ভিতরে", value: "১ – ২ দিন" },
    { label: "ঢাকার বাইরে", value: "২ – ৩ দিন" },
  ],
  footerNote: "৳৬০০+ অর্ডার করলেই ডেলিভারি সম্পূর্ণ ফ্রি!",
};

export default function DeliveryCharge() {
  const { data } = useQuery({
    queryKey: ["delivery-charge-page"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "delivery_charge_page")
        .maybeSingle();
      if (!data?.value) return DEFAULTS;
      try {
        return { ...DEFAULTS, ...JSON.parse(data.value) } as DCData;
      } catch {
        return DEFAULTS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const d = data || DEFAULTS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="flex items-center gap-2 text-[20px] font-extrabold text-emerald-950">
            <Truck className="w-6 h-6 text-emerald-700" />
            {d.title}
          </h1>
          <p className="text-[12.5px] text-gray-600 mt-1">{d.subtitle}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
          {/* List header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50/60 border-b border-emerald-100">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Truck className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-emerald-900">{d.listTitle}</p>
              <p className="text-[11.5px] text-gray-500">{d.listSubtitle}</p>
            </div>
          </div>

          {/* Tiers */}
          <ul className="divide-y divide-emerald-50">
            {d.tiers.map((t, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  {t.isFree ? (
                    <Gift className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Truck className="w-4 h-4 text-emerald-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold text-emerald-950 leading-snug">{t.label}</p>
                  <p className="text-[11.5px] text-gray-500 leading-snug">{t.sub}</p>
                </div>
                <span
                  className={`shrink-0 text-[12.5px] font-extrabold px-3 py-1.5 rounded-full ${
                    t.isFree
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {t.charge}
                </span>
              </li>
            ))}
          </ul>

          {/* Time */}
          <div className="border-t border-emerald-100 px-4 py-3 bg-white">
            <p className="flex items-center gap-2 text-[13.5px] font-bold text-emerald-800 mb-2">
              <Clock className="w-4 h-4" />
              {d.timeTitle}
            </p>
            <ul className="space-y-1.5">
              {d.timeItems.map((it, i) => (
                <li key={i} className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-1.5 text-gray-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {it.label}
                  </span>
                  <span className="font-bold text-emerald-900">{it.value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer note */}
          <div className="border-t border-emerald-100 px-4 py-3 bg-emerald-50/50">
            <p className="flex items-center justify-center gap-2 text-[12.5px] font-bold text-emerald-800 text-center">
              <PartyPopper className="w-4 h-4" />
              {d.footerNote}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
