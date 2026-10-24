import { API_URL } from "@/config/env";
import { useState, useCallback } from "react";
import { Truck, PlayCircle, Search, Phone, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DeliveryChargeTable from "@/components/DeliveryChargeTable";
import { supabase } from "@/integrations/supabase/client";

type PopupType = "delivery" | "video" | "search" | null;

export default function ActionButtonsRow() {
  const { t } = useLanguage();
  const [openPopup, setOpenPopup] = useState<PopupType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setHasSearched(true);
    try {
      const url = API_URL;
      const res = await fetch(`${url}/products/get.php`);
      let allProducts = await res.json();
      allProducts = allProducts.filter((p: any) => !p.is_hidden);
      
      const lowerQ = q.toLowerCase();
      const filtered = allProducts.filter((p: any) => 
        (p.name && p.name.toLowerCase().includes(lowerQ)) || 
        (p.sku && p.sku.toLowerCase().includes(lowerQ))
      );
      setSearchResults(filtered.slice(0, 12));
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  }, [searchQuery]);

  const closePopup = () => {
    setOpenPopup(null);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2 py-3 px-3">
        <button
          onClick={() => setOpenPopup("delivery")}
          className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span>{t("ডেলিভারি!", "Delivery!")}</span>
        </button>
        <button
          onClick={() => setOpenPopup("video")}
          className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <PlayCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{t("ভিডিও", "Tutorial")}</span>
        </button>
        <button
          onClick={() => setOpenPopup("search")}
          className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span>{t("খুঁজুন", "Search")}</span>
        </button>
      </div>

      {/* Delivery Charge Popup */}
      <Dialog open={openPopup === "delivery"} onOpenChange={(o) => !o && closePopup()}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-primary text-base">
              <Truck className="w-5 h-5" />
              {t("ডেলিভারি চার্জ", "Delivery Charges")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("অর্ডার মূল্য অনুযায়ী ডেলিভারি চার্জ", "Delivery charges based on order value")}
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-4">
            <DeliveryChargeTable />
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Tutorial Popup */}
      <Dialog open={openPopup === "video"} onOpenChange={(o) => !o && closePopup()}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary text-base">
              <PlayCircle className="w-5 h-5" />
              {t("ভিডিও টিউটোরিয়াল", "Video Tutorial")}
            </DialogTitle>
            <DialogDescription className="sr-only">Video tutorial info</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground leading-relaxed">
            <p>
              {t(
                "আমরা এখনো ভিডিও টিউটোরিয়াল যোগ করিনি। আপনি নিজে অর্ডার করার চেষ্টা করুন — খুবই সহজ!",
                "We haven't added video tutorials yet. Try ordering yourself — it's very easy!"
              )}
            </p>
            <p>
              {t(
                "খুব বেশি অসুবিধা হলে নিচের নম্বরে কল করুন, অথবা আপনি অর্ডার করলে আমরাই আপনাকে কল করবো।",
                "If you face too much difficulty, call the number below, or if you place an order, we'll call you."
              )}
            </p>
            <a
              href="tel:01933819799"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              01933819799
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Popup */}
      <Dialog open={openPopup === "search"} onOpenChange={(o) => !o && closePopup()}>
        <DialogContent className="max-w-md mx-auto rounded-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary text-base">
              <Search className="w-5 h-5" />
              {t("পণ্য খুঁজুন", "Search Products")}
            </DialogTitle>
            <DialogDescription className="sr-only">Search products</DialogDescription>
          </DialogHeader>

          {/* Search Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("এখানে খুঁজুন..", "Search here..")}
                className="w-full rounded-full border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setSearchResults([]); setHasSearched(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!searchQuery.trim() || searching}
              className="px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {searching ? t("খুঁজছি...", "Searching...") : t("খুঁজুন", "Search")}
            </button>
          </form>

          {/* Results */}
          <div className="flex-1 overflow-y-auto -mx-2 px-2 mt-2">
            {searching && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {!searching && hasSearched && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p>{t("কোনো পণ্য পাওয়া যায়নি", "No products found")}</p>
                <p className="text-xs mt-1">{t("অন্য শব্দে চেষ্টা করুন", "Try different keywords")}</p>
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {searchResults.map((p: any) => (
                  <a
                    key={p.id}
                    href={`/product/${p.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      closePopup();
                      window.location.href = `/product/${p.id}`;
                    }}
                    className="flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {p.product_image && (
                      <img
                        src={p.product_image}
                        alt={p.name}
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="p-2">
                      <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {p.offer_price ? (
                          <>
                            <span className="text-xs font-bold text-primary">৳{p.offer_price}</span>
                            <span className="text-[10px] line-through text-muted-foreground">৳{p.regular_price}</span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-primary">৳{p.regular_price}</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
