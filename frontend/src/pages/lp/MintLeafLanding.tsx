import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SideCart from "@/components/SideCart";
import FeaturesSection from "@/components/FeaturesSection";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Check, Star, Leaf, ShieldCheck, Truck, ArrowRight, Trophy, Flame, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import mintHeroImg from "@/assets/mint-hero.png";
import mintShowcaseImg from "@/assets/mint-showcase.png";
import { DevelopedByHaqPlus } from "@/components/DevelopedByHaqPlus";
import LandingOrderForm from "@/components/lp/LandingOrderForm";
import ProductBadges from "@/components/ProductBadges";
import { trackInitiateCheckout, trackAddToCart, trackViewContent } from "@/components/TrackingScripts";
import { resolveImageUrl, PLACEHOLDER_IMAGE } from "@/lib/imageFallback";


export default function MintLeafLanding() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const productSku = "VAG-1534";

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-mint-landing", productSku],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_public")
        .select("*")
        .eq("sku", productSku)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const cartItem = items.find((i) => i?.sku === productSku || (product && i?.id === product.id));
  const qty = cartItem?.quantity || 0;

  useEffect(() => {
    if (product) {
      const price = Number(product.offer_price || product.regular_price || 0);
      trackViewContent({ id: product.id, sku: product.sku, name: product.name }, price);
    }
  }, [product?.id]);

  const handleAddToCart = () => {
    if (!product) return;
    const price = Number(product.offer_price || product.regular_price || 0);
    addItem({
      id: product.id,
      name: product.name,
      price: product.offer_price || product.regular_price,
      oldPrice: product.offer_price ? product.regular_price : null,
      image: resolveImageUrl(product.product_image),
      shortDescription: product.short_description,
      sku: product.sku,
      maxStock: product.available_stock,
    });
    trackAddToCart({ id: product.id, sku: product.sku }, price);
    toast.success(t("কার্টে যোগ হয়েছে", "Added to cart"));
  };

  const handleOrderNow = () => {
    if (product) {
      const price = Number(product.offer_price || product.regular_price || 0);
      trackInitiateCheckout(price, 1);
    }
    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };


  const handleIncrement = () => {
    if (product) updateQuantity(product.id, qty + 1);
  };

  const handleDecrement = () => {
    if (!product) return;
    if (qty <= 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, qty - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const price = product.offer_price || product.regular_price;
  const oldPrice = product.offer_price ? product.regular_price : null;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-0">
      <SEOHead
        title={product.name}
        description={product.short_description || ""}
      />
      
      <SideCart />

      {/* Hero Section - Home Page Style Cloned */}
      <section className="py-8 md:py-16">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6">
          <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100/60 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-emerald-900/20 p-6 md:p-12 rounded-3xl border border-emerald-200/60 dark:border-emerald-800/40 shadow-xl shadow-emerald-500/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 text-center md:text-left order-2 md:order-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] font-bold shadow-md shadow-amber-500/40 uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {t("#১ সেরা বিক্রিত", "#1 Best Seller")}
                </div>
                
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-foreground leading-[1.1] tracking-tight">
                  {product.name}
                </h1>
                
                <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
                  {product.short_description}
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center md:justify-start gap-2.5">
                    <span className="text-3xl font-bold text-primary">৳{price}</span>
                    {oldPrice && <span className="text-lg text-muted-foreground line-through italic">৳{oldPrice}</span>}
                    {oldPrice && oldPrice > price && (
                      <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                        -{Math.round(((oldPrice - price) / oldPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {qty > 0 ? (
                      <div className="flex items-stretch w-full sm:w-48 h-12 rounded-xl overflow-hidden bg-primary shadow-lg shadow-primary/30 ring-1 ring-primary/40 transition-all">
                        <button
                          onClick={handleDecrement}
                          className="w-12 flex items-center justify-center text-primary-foreground/95 hover:bg-black/15 active:bg-black/25 transition-colors text-2xl"
                        >
                          −
                        </button>
                        <div className="flex-1 flex items-center justify-center text-primary-foreground text-lg font-bold">
                          {qty}
                        </div>
                        <button
                          onClick={handleIncrement}
                          className="w-12 flex items-center justify-center text-primary-foreground/95 hover:bg-black/15 active:bg-black/25 transition-colors text-xl"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <Button 
                        onClick={handleAddToCart}
                        size="lg"
                        className="w-full sm:w-auto h-12 px-8 font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" strokeWidth={2.5} />
                        {t("কার্টে যোগ করুন", "Add to Cart")}
                      </Button>
                    )}
                    
                    <Button 
                      onClick={handleOrderNow}
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto h-12 px-8 font-bold rounded-xl border-primary text-primary hover:bg-primary/5 shadow-sm"
                    >
                      <Zap className="w-5 h-5 mr-2 fill-primary" />
                      {t("এখনই অর্ডার করুন", "Order Now")}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <div className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {t("স্টকে আছে", "In Stock")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      {t("ক্যাশ অন ডেলিভারি", "COD Available")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2 relative aspect-square max-w-sm lg:max-w-md mx-auto w-full group">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full scale-90 group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="relative h-full w-full rounded-3xl overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-700 ease-out">
                  <img 
                    src={mintHeroImg} 



                    alt={product.name} 
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 scale-110">
                    <ProductBadges tagNames={product.tags} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar - Matches Home Style */}
      <div className="bg-emerald-900 text-white/90 py-4 border-y border-white/10">
        <div className="max-w-screen-2xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-center gap-2.5">
            <Leaf className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider">{t("১০০% অর্গানিক", "100% Organic")}</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 border-l border-white/10">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider">{t("উচ্চ অংকুরোদগম", "High Germination")}</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 border-l border-white/10">
            <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider">{t("দ্রুত ডেলিভারি", "Fast Delivery")}</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 border-l border-white/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider">{t("নিরাপদ পেমেন্ট", "Secure Payment")}</span>
          </div>
        </div>
      </div>

      {/* Info Sections - Clean Home Style */}
      <section className="flex-1 py-10 md:py-16 px-4">
        <div className="max-w-screen-xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-bold">{t("পণ্যের বৈশিষ্ট্য", "Product Features")}</h3>
              </div>
              <ul className="grid grid-cols-1 gap-3">
                {[
                  t("উন্নত মানের হাইব্রিড বীজ", "High quality hybrid seeds"),
                  t("বারোমাসি চাষের উপযোগী", "Suitable for year-round cultivation"),
                  t("দ্রুত বর্ধনশীল ও উচ্চ ফলনশীল", "Fast growing and high yield"),
                  t("ঘন সবুজ ও সুগন্ধি পাতা", "Deep green and fragrant leaves"),
                  t("অঙ্কুরোদগম ক্ষমতা অনেক বেশি", "Very high germination rate"),
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground leading-snug">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                  <Leaf className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">{t("প্রযুক্তিগত তথ্য", "Technical Details")}</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: t("বীজ সংখ্যা", "Seed Count"), value: "~৩৫০ টি" },
                  { label: t("বিশুদ্ধতা", "Purity"), value: "৯৫%" },
                  { label: t("অংকুরোদগম হার", "Germination"), value: "≥ ৯০%" },
                  { label: t("পরিপক্ক সময়", "Maturity"), value: "৪৫-৬০ দিন" },
                ].map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{spec.label}</span>
                    <span className="text-sm font-bold text-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-background p-6 md:p-10 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
            <h3 className="text-xl md:text-2xl font-display font-black text-center mb-6">{t("বিস্তারিত বর্ণনা", "Full Description")}</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center italic">
              {product.full_description}
            </p>
          </div>

          {/* Dual Image Showcase Section - Forced 1 Line */}
          <div className="grid grid-cols-2 gap-3 md:gap-8">
            <div className="relative aspect-[4/3] rounded-2xl md:rounded-[2rem] overflow-hidden border-2 md:border-4 border-white dark:border-slate-800 shadow-xl group">
              <img 
                src={mintHeroImg} 


                alt={t("হাইব্রিড পুদিনা বীজ প্যাকেট", "Hybrid Mint Seed Packet")} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4">
                <div className="bg-black/60 backdrop-blur-md text-white text-[8px] md:text-xs font-bold px-2 md:py-1.5 rounded-full border border-white/20">
                  {t("প্রিমিয়াম প্যাকেজিং", "Premium Packaging")}
                </div>
              </div>
            </div>
            
            <div className="relative aspect-[4/3] rounded-2xl md:rounded-[2rem] overflow-hidden border-2 md:border-4 border-white dark:border-slate-800 shadow-xl group">
              <img 
                src={mintShowcaseImg} 


                alt={t("সতেজ পুদিনা পাতা", "Fresh Mint Leaves")} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4">
                <div className="bg-emerald-600/80 backdrop-blur-md text-white text-[8px] md:text-xs font-bold px-2 md:py-1.5 rounded-full border border-emerald-400/30">
                  {t("সতেজ ও সুগন্ধি ফলন", "Fresh & Fragrant Harvest")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inline Order Form */}
      <LandingOrderForm
        product={{
          id: product.id,
          name: product.name,
          price: price,
          oldPrice: oldPrice,
          image: mintHeroImg,
          sku: product.sku,
          maxStock: product.available_stock,
        }}
      />


      {/* Floating Checkout CTA - Cloned Home Order Style */}
      <section className="py-12 px-4 bg-emerald-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <img src={PLACEHOLDER_IMAGE} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-2xl md:text-4xl font-display font-black leading-tight">
            {t("সতেজ ও সুগন্ধি পুদিনা পাতার জন্য আজই অর্ডার করুন!", "Order today for fresh and fragrant mint leaves!")}
          </h2>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">৳{price}</span>
              {oldPrice && <span className="text-xl text-white/50 line-through">৳{oldPrice}</span>}
            </div>
            <Button 
              onClick={handleOrderNow}
              size="lg"
              className="h-14 px-12 text-lg font-bold rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/30"
            >
              <Zap className="w-6 h-6 mr-2 fill-white" />
              {t("অর্ডার কনফার্ম করুন", "Confirm Order")}
            </Button>
            <p className="text-xs text-white/60 font-medium flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              {t("সারা বাংলাদেশে দ্রুত ডেলিভারি", "Fast delivery all over Bangladesh")}
            </p>
          </div>
        </div>
      </section>

      <FeaturesSection />

      <footer className="border-t border-emerald-950/20 pt-4 pb-20 md:pb-6 text-center text-xs text-neutral-400 bg-neutral-950 flex flex-col items-center justify-center gap-2">
        <p>© {new Date().getFullYear()} Ss Seed Shop. {t("সর্বস্বত্ব সংরক্ষিত।", "All rights reserved.")}</p>
        <DevelopedByHaqPlus siteName="Ss Seed Shop" theme="dark" />
      </footer>

      {/* Sticky Bottom Order Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] p-3 md:p-4 bg-background/80 backdrop-blur-lg border-t border-emerald-100 dark:border-emerald-900/30 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] transition-transform duration-300">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-black text-primary">৳{price}</span>
              {oldPrice && (
                <span className="text-sm md:text-base text-muted-foreground line-through opacity-70">
                  ৳{oldPrice}
                </span>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-tighter md:tracking-normal">
              <ShieldCheck className="w-3 h-3" />
              {t("১০০% পেমেন্ট সুরক্ষা", "100% Payment Secure")}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-none justify-end">
            <Button 
              onClick={handleOrderNow}
              size="lg"
              className="w-full md:w-auto h-12 md:h-14 px-6 md:px-10 text-base md:text-lg font-black rounded-xl md:rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/25"
            >
              <Zap className="w-5 h-5 mr-2 fill-white animate-pulse" />
              {t("এখনই অর্ডার করুন", "Order Now")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}