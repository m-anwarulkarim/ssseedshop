import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { compressImageToWebP } from "@/lib/imageCompressor";
import { Button } from "@/components/ui/button";

import { API_BASE } from "@/lib/apiConfig";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { toast } from "sonner";
import { ArrowLeft, Upload, X, Loader2, Check, FolderOpen, Copy, EyeOff, Eye, Plus, Trash2 } from "lucide-react";
import { MediaPickerDialog } from "@/components/admin/MediaPickerDialog";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Switch } from "@/components/ui/switch";
import { handleImageError, resolveImageUrl } from "@/lib/imageFallback";

const productSchema = z.object({
  name: z.string().min(1, "পণ্যের নাম আবশ্যক"),
  sku: z.string().optional(),
  slug: z.string().optional(),
  categories: z.array(z.string()).default([]),
  subcategory: z.string().optional(),
  short_description: z.string().optional(),
  regular_price: z.coerce.number().min(0, "মূল্য ০ বা তার বেশি হতে হবে"),
  offer_price: z.coerce.number().optional().nullable(),
  buying_price: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().int().min(0, "স্টক ০ বা তার বেশি হতে হবে"),
  full_description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export interface PackageTier {
  id: string;
  name: string;
  quantity: number;
  regular_price: number;
  offer_price: number;
  delivery_charge: number;
  is_free_delivery: boolean;
  badge?: string;
}

interface Variation {
  id?: string;
  name: string;
  buying_price: number | null;
  selling_price: number;
  offer_price: number | null;
  image: string | null;
  note: string | null;
  stock: number;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const isEdit = !!id;
  const backUrl = `/admin/products${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageGallery, setImageGallery] = useState<string[]>([]);
  
  const [mainImagePickerOpen, setMainImagePickerOpen] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [variationPickerIdx, setVariationPickerIdx] = useState<number | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newSubName, setNewSubName] = useState("");

  const [variations, setVariations] = useState<Variation[]>([]);

  // Bagan Bari Style Landing & Package Tiers
  const [highlightFeatures, setHighlightFeatures] = useState("");
  const [packageTiers, setPackageTiers] = useState<PackageTier[]>([]);
  const [trustCard1Title, setTrustCard1Title] = useState("");
  const [trustCard1Text, setTrustCard1Text] = useState("");
  const [trustCard2Title, setTrustCard2Title] = useState("");
  const [trustCard2Text, setTrustCard2Text] = useState("");

  const { data: availableTags = [] } = useQuery({
    queryKey: ["all-tags-admin"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/tags/get.php`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: availableCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/categories/get.php`);
      let data = await res.json();
      data = data.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return data;
    },
  });

  const { data: availableSubcategories = [] } = useQuery({
    queryKey: ["all-subcategories-admin"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/categories/subcategories.php`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      slug: "",
      categories: [],
      subcategory: "",
      short_description: "",
      regular_price: 0,
      offer_price: null,
      buying_price: null,
      stock: 0,
      full_description: "",
    },
  });

  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/get_single.php?id=${id}&admin=1&_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      if (data && !data.error) {
      // Safely parse categories and ensure product's main data.category is primary (first)
      let rawCats: string[] = [];
      const dbCategories = (data as any).categories;
      if (Array.isArray(dbCategories)) {
        rawCats = dbCategories.filter((c): c is string => typeof c === "string" && Boolean(c.trim()));
      } else if (typeof dbCategories === "string" && dbCategories.trim()) {
        try {
          const parsed = JSON.parse(dbCategories);
          if (Array.isArray(parsed)) {
            rawCats = parsed.filter((c): c is string => typeof c === "string" && Boolean(c.trim()));
          } else {
            rawCats = [dbCategories.trim()];
          }
        } catch {
          rawCats = [dbCategories.trim()];
        }
      }

      const primaryCategory = data.category ? String(data.category).trim() : "";
      let finalCategories: string[] = [];
      if (primaryCategory) {
        finalCategories = [primaryCategory, ...rawCats.filter((c) => c !== primaryCategory)];
      } else {
        finalCategories = rawCats;
      }

      form.reset({
        name: data.name,
        sku: data.sku,
        slug: data.slug || "",
        categories: finalCategories,
        subcategory: (data as any).subcategory || "",
        short_description: data.short_description || "",
        regular_price: data.regular_price,
        offer_price: data.offer_price,
        buying_price: data.buying_price,
        stock: data.stock ?? 0,
        full_description: data.full_description || "",
      });
      setProductImage(data.product_image);
      setImageGallery(data.image_gallery || []);
      setIsHidden((data as any).is_hidden || false);
      setSelectedTags(((data as any).tags as string[]) || []);

      // Load variations
      setVariations(data.variations || []);

      // Load landing features & package tiers
      let loadedTiers: any[] = [];
      if (Array.isArray(data.package_tiers)) {
        loadedTiers = data.package_tiers;
      } else if (typeof data.package_tiers === "string" && (data.package_tiers as string).trim()) {
        try {
          const parsed = JSON.parse(data.package_tiers as string);
          if (Array.isArray(parsed)) loadedTiers = parsed;
        } catch {}
      }
      const normalizedLoadedTiers = loadedTiers.map((t: any, i: number) => ({
        id: t.id || `tier-${Date.now()}-${i + 1}`,
        name: t.name || `${t.quantity || i + 1} প্যাকেট`,
        quantity: Math.max(1, Number(t.quantity) || 1),
        regular_price: Number(t.regular_price) || 0,
        offer_price: Number(t.offer_price) || 0,
        delivery_charge: t.is_free_delivery ? 0 : (Number(t.delivery_charge) || 0),
        is_free_delivery: Boolean(t.is_free_delivery),
        badge: t.badge || "",
      }));
      setPackageTiers(normalizedLoadedTiers);
      setHighlightFeatures(data.highlight_features || "");
      setTrustCard1Title(data.trust_card_1_title || "");
      setTrustCard1Text(data.trust_card_1_text || "");
      setTrustCard2Title(data.trust_card_2_title || "");
      setTrustCard2Text(data.trust_card_2_text || "");
    }
    } catch (err) {
      toast.error("পণ্য লোড করতে সমস্যা হয়েছে");
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const compressed = await compressImageToWebP(file);
      const formData = new FormData();
      formData.append("file", compressed, compressed.name || file.name);

      const res = await fetch(`${API_BASE}/media/upload.php`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data?.status === "success" && data?.url) {
        return data.url;
      }
      toast.error(data?.message || "ছবি আপলোড করতে সমস্যা হয়েছে");
      return null;
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("ছবি আপলোড করতে সমস্যা হয়েছে");
      return null;
    }
  };

  const handleMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageLoading(true);
    const url = await uploadImage(file);
    if (url) setProductImage(resolveImageUrl(url));
    setImageLoading(false);
  };

  const handleGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setImageLoading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) urls.push(resolveImageUrl(url));
    }
    setImageGallery((prev) => [...prev, ...urls]);
    setImageLoading(false);
  };

  const removeGalleryImage = (index: number) => {
    setImageGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: ProductFormValues) => {
    // Validate offer price
    if (values.offer_price && values.offer_price > values.regular_price) {
      toast.error("অফার মূল্য রেগুলার মূল্যের চেয়ে বেশি হতে পারে না");
      return;
    }

    // Auto-remove offer price if same as regular
    let finalOfferPrice = values.offer_price || null;
    if (finalOfferPrice && finalOfferPrice === values.regular_price) {
      finalOfferPrice = null;
    }

    setLoading(true);

    const finalSku = values.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`;
    const slugValue = values.slug?.trim() || values.name.trim().toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-").replace(/^-+|-+$/g, "") || `prod-${Date.now().toString().slice(-6)}`;

    const sanitizedPackageTiers = packageTiers.map((tier, idx) => ({
      id: tier.id || `tier-${Date.now()}-${idx + 1}`,
      name: tier.name ? String(tier.name).trim() : `${tier.quantity || idx + 1} প্যাকেট`,
      quantity: Math.max(1, Number(tier.quantity) || 1),
      regular_price: Number(tier.regular_price) || 0,
      offer_price: Number(tier.offer_price) || 0,
      delivery_charge: tier.is_free_delivery ? 0 : (Number(tier.delivery_charge) || 0),
      is_free_delivery: Boolean(tier.is_free_delivery),
      badge: tier.badge ? String(tier.badge).trim() : "",
    }));

    const productData = {
      name: values.name,
      sku: finalSku,
      slug: slugValue,
      category: (values.categories && values.categories[0]) || null,
      categories: values.categories || [],
      subcategory: values.subcategory || null,
      tag: null,
      short_description: values.short_description || null,
      regular_price: values.regular_price,
      offer_price: finalOfferPrice,
      buying_price: values.buying_price || null,
      stock: values.stock ?? 0,
      full_description: values.full_description || null,
      product_image: productImage,
      image_gallery: imageGallery.length > 0 ? imageGallery : null,
      is_hidden: isHidden,
      tags: selectedTags,
      variations: variations, // Send variations to PHP API
      package_tiers: sanitizedPackageTiers,
      highlight_features: highlightFeatures.trim() || null,
      trust_card_1_title: trustCard1Title.trim() || null,
      trust_card_1_text: trustCard1Text.trim() || null,
      trust_card_2_title: trustCard2Title.trim() || null,
      trust_card_2_text: trustCard2Text.trim() || null,
    };

    let error;
    let productId = id;

    try {
      if (isEdit) {
        const res = await fetch(`${API_BASE}/products/save.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id!, ...productData })
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || "Update failed");
      } else {
        const res = await fetch(`${API_BASE}/products/save.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData)
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || "Create failed");
        productId = json.data?.id;
      }
    } catch (e: any) {
      error = e;
    }

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Refresh every product list/detail immediately after stock or variation changes.
    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) => {
        const key = String(queryKey[0] ?? "");
        return key.includes("product") || key === "shop-products";
      },
    });

    toast.success(isEdit ? "পণ্য আপডেট হয়েছে" : "পণ্য তৈরি হয়েছে");
    navigate(backUrl);
  };

  const handleDuplicate = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/products/get_single.php?id=${id}&admin=1&_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (!data || data.error) throw new Error(data.error || "Not found");

      const { id: _id, created_at, updated_at, slug, sku, ...rest } = data;
      const newSku = (sku || "SKU") + "-copy-" + Date.now().toString(36).slice(-4);
      
      const createRes = await fetch(`${API_BASE}/products/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, sku: newSku, slug: null, name: data.name + " (কপি)" })
      });
      const createData = await createRes.json();
      if (!createRes.ok || createData.error) throw new Error(createData.error || "Duplicate failed");

      queryClient.invalidateQueries({ queryKey: ["admin-products-php"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products-count-php"] });
      toast.success("পণ্য ডুপ্লিকেট হয়েছে!");
      navigate(`/admin/products/edit/${createData.data.id}`);
    } catch (err: any) {
      toast.error(err.message || "পণ্য ডুপ্লিকেট করতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(backUrl)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          {isEdit && (
            <>
              <div className="flex items-center gap-2">
                {isHidden ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-primary" />}
                <Switch checked={isHidden} onCheckedChange={setIsHidden} />
                <span className="text-xs text-muted-foreground">{isHidden ? t("লুকানো", "Hidden") : t("দৃশ্যমান", "Visible")}</span>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-1.5" />
                {t("ডুপ্লিকেট", "Duplicate")}
              </Button>
            </>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("মৌলিক তথ্য", "Basic Info")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                   <FormLabel>{t("পণ্যের নাম", "Product Name")} *</FormLabel>
                  <FormControl><Input placeholder={t("পণ্যের নাম লিখুন", "Enter product name")} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU ({t("ঐচ্ছিক", "Optional")})</FormLabel>
                  <FormControl><Input placeholder={t("যেমন: SEED-01 (ফাঁকা রাখলে অটো তৈরি হবে)", "e.g. SEED-01 (auto-generated if empty)")} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("স্লাগ (URL)", "Slug (URL)")}</FormLabel>
                  <FormControl><Input placeholder={t("যেমন: watermelon-seed-hybrid (ফাঁকা রাখলে অটো তৈরি হবে)", "e.g. watermelon-seed-hybrid (auto-generated if empty)")} {...field} /></FormControl>
                  <p className="text-xs text-muted-foreground mt-1">{t("প্রোডাক্ট URL-এ ব্যবহৃত হবে: /product/your-slug", "Used in product URL: /product/your-slug")}</p>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="categories" render={({ field }) => {
                const value: string[] = field.value || [];
                const toggle = (name: string) => {
                  if (value.includes(name)) {
                    field.onChange(value.filter((v) => v !== name));
                  } else {
                    field.onChange([...value, name]);
                  }
                };
                return (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("ক্যাটাগরি (একাধিক বাছাই করা যাবে)", "Categories (multi-select)")}</FormLabel>
                    <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg min-h-[48px]">
                      {availableCategories.map((cat) => {
                        const isSelected = value.includes(cat.name);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggle(cat.name)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              isSelected
                                ? "bg-secondary text-secondary-foreground border-secondary"
                                : "bg-muted text-muted-foreground border-border hover:border-secondary/50"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            {cat.name}
                          </button>
                        );
                      })}
                      {availableCategories.length === 0 && (
                        <span className="text-xs text-muted-foreground">{t("কোনো ক্যাটাগরি পাওয়া যায়নি।", "No categories found.")}</span>
                      )}
                    </div>
                    {value.length > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {t("প্রাথমিক ক্যাটাগরি", "Primary category")}: <span className="font-semibold">{value[0]}</span>
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }} />
              <FormField control={form.control} name="subcategory" render={({ field }) => {
                const selectedCats: string[] = form.watch("categories") || [];
                const currentCategory = selectedCats[0] || "";
                const subs = availableSubcategories.filter((s: any) => s.category_name === currentCategory);
                const addNewSubs = async () => {
                  const raw = newSubName.trim();
                  if (!raw || !currentCategory) return;
                  const names: string[] = Array.from(new Set(raw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)));
                  if (!names.length) return;
                  const rows = names.map((name) => ({ category_name: currentCategory, name, position: 0 }));
                  const res = await fetch(`${API_BASE}/categories/subcategories.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(rows)
                  });
                  if (!res.ok) { toast.error("সাব-ক্যাটাগরি যোগ করতে সমস্যা হয়েছে"); return; }
                  toast.success(t(`${names.length}টি যোগ হয়েছে`, `${names.length} added`));
                  setNewSubName("");
                  queryClient.invalidateQueries({ queryKey: ["all-subcategories-admin"] });
                  if (names.length) {
                    const cur = (field.value || "").split(",").map((s: string) => s.trim()).filter(Boolean);
                    field.onChange(Array.from(new Set([...cur, ...names])).join(", "));
                  }
                };
                const selectedSubs: string[] = (field.value || "").split(",").map((s: string) => s.trim()).filter(Boolean);
                const toggleSub = (name: string) => {
                  const exists = selectedSubs.includes(name);
                  const next = exists ? selectedSubs.filter((s) => s !== name) : [...selectedSubs, name];
                  field.onChange(next.join(", "));
                };
                return (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("সাব-ক্যাটাগরি (একাধিক বাছাই করা যাবে)", "Sub-categories (multi-select)")}</FormLabel>
                    <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg min-h-[48px]">
                      {!currentCategory ? (
                        <span className="text-xs text-muted-foreground">{t("আগে ক্যাটাগরি বাছাই করুন", "Pick a category first")}</span>
                      ) : subs.length === 0 ? (
                        <span className="text-xs text-muted-foreground">{t("এই ক্যাটাগরিতে কোনো সাব-ক্যাটাগরি নেই", "No sub-categories for this category")}</span>
                      ) : subs.map((sub: any) => {
                        const isSelected = selectedSubs.includes(sub.name);
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => toggleSub(sub.name)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>

                    {currentCategory && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          placeholder={t("নতুন সাব-ক্যাটাগরি (একাধিক হলে কমা দিয়ে)", "New sub-category (comma-separate for multiple)")}
                          className="h-8 text-sm"
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNewSubs(); } }}
                        />
                        <Button type="button" size="sm" onClick={addNewSubs}>
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }} />
              <FormField control={form.control} name="short_description" render={({ field }) => (
                <FormItem className="md:col-span-2">
                   <FormLabel>{t("সংক্ষিপ্ত বিবরণ", "Short Description")}</FormLabel>
                  <FormControl><Textarea placeholder={t("পণ্যের সংক্ষিপ্ত বিবরণ", "Short product description")} rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Badges / Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("ব্যাজ", "Badges")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tg: any) => {
                  const isSel = selectedTags.includes(tg.name);
                  return (
                    <button
                      key={tg.id}
                      type="button"
                      onClick={() =>
                        setSelectedTags((prev) =>
                          isSel ? prev.filter((x) => x !== tg.name) : [...prev, tg.name]
                        )
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSel
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {isSel && <Check className="w-3 h-3" />}
                      {tg.name}
                    </button>
                  );
                })}
                {availableTags.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    {t("কোনো ব্যাজ পাওয়া যায়নি", "No badges available")}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("ছবি", "Images")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>{t("প্রোডাক্ট ইমেজ", "Product Image")} *</Label>
                <div className="mt-2 flex items-center gap-4">
                  {productImage ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border bg-muted/20">
                      <img
                        src={resolveImageUrl(productImage)}
                        alt="Product"
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                      <button
                        type="button"
                        onClick={() => setProductImage(null)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMainImagePickerOpen(true)}
                      className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                    >
                      <FolderOpen className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">{t("ছবি নির্বাচন", "Select Image")}</span>
                    </button>
                  )}
                </div>
                <MediaPickerDialog
                  open={mainImagePickerOpen}
                  onOpenChange={setMainImagePickerOpen}
                  onSelect={(url) => setProductImage(resolveImageUrl(url))}
                />
              </div>

              <div>
                <Label>{t("ইমেজ গ্যালারি (ঐচ্ছিক)", "Image Gallery (Optional)")}</Label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {imageGallery.map((url, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted/20">
                      <img
                        src={resolveImageUrl(url)}
                        alt={`Gallery ${i}`}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setGalleryPickerOpen(true)}
                    className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <FolderOpen className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">{t("যোগ করুন", "Add")}</span>
                  </button>
                </div>
                <MediaPickerDialog
                  open={galleryPickerOpen}
                  onOpenChange={setGalleryPickerOpen}
                  multiple
                  onSelect={(url) => setImageGallery((prev) => [...prev, resolveImageUrl(url)])}
                  onSelectMultiple={(urls) => setImageGallery((prev) => [...prev, ...urls.map(resolveImageUrl)])}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("মূল্য", "Pricing")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <FormField control={form.control} name="regular_price" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("নিয়মিত মূল্য", "Regular Price")} *</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="০" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="offer_price" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("অফার মূল্য", "Offer Price")}</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="ঐচ্ছিক" {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="buying_price" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ক্রয় মূল্য", "Buying Price")}</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="ঐচ্ছিক" {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="stock" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("স্টক", "Stock")} *</FormLabel>
                  <FormControl><Input type="number" step="1" min="0" placeholder="০" {...field} value={field.value ?? 0} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Variations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{t("ভ্যারিয়েশন", "Variations")}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVariations(prev => [...prev, { name: "", buying_price: null, selling_price: 0, offer_price: null, image: null, note: null, stock: 0 }])}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t("যোগ করুন", "Add")}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {t(
                  "ভ্যারিয়েশনের জন্য আলাদা ইনভয়েস রাখা হয় না। সব ভ্যারিয়েশন বেস প্রোডাক্টের ইনভয়েস ব্যবহার করবে।",
                  "Variations do not keep separate invoices. All variations use the base product invoice."
                )}
              </p>
              {variations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t("কোনো ভ্যারিয়েশন নেই। প্রয়োজনে যোগ করুন।", "No variations. Add if needed.")}</p>
              )}
              {variations.map((v, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs">{t("নাম", "Name")}</Label>
                      <Input
                        placeholder={t("যেমন: ৫০০ গ্রাম", "e.g. 500g")}
                        value={v.name}
                        onChange={(e) => {
                          const updated = [...variations];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setVariations(updated);
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">{t("ক্রয় মূল্য", "Buy")}</Label>
                      <Input
                        type="number"
                        placeholder="ঐচ্ছিক"
                        value={v.buying_price ?? ""}
                        onChange={(e) => {
                          const updated = [...variations];
                          updated[idx] = { ...updated[idx], buying_price: e.target.value ? Number(e.target.value) : null };
                          setVariations(updated);
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">{t("বিক্রয় মূল্য", "Sell")}</Label>
                      <Input
                        type="number"
                        placeholder="০"
                        value={v.selling_price}
                        onChange={(e) => {
                          const updated = [...variations];
                          updated[idx] = { ...updated[idx], selling_price: Number(e.target.value) || 0 };
                          setVariations(updated);
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">{t("অফার মূল্য", "Offer")}</Label>
                      <Input
                        type="number"
                        placeholder="ঐচ্ছিক"
                        value={v.offer_price ?? ""}
                        onChange={(e) => {
                          const updated = [...variations];
                          updated[idx] = { ...updated[idx], offer_price: e.target.value ? Number(e.target.value) : null };
                          setVariations(updated);
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">{t("স্টক", "Stock")}</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="০"
                        value={v.stock}
                        onChange={(e) => {
                          const updated = [...variations];
                          updated[idx] = { ...updated[idx], stock: Math.max(0, Number(e.target.value) || 0) };
                          setVariations(updated);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:bg-destructive/10"
                      onClick={() => setVariations(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs">{t("নোট/ট্যাগ", "Note/Tag")}</Label>
                      <Input
                        placeholder={t("যেমন: বিশেষ ছাড়, good deal", "e.g. Special offer")}
                        value={v.note ?? ""}
                        onChange={(e) => {
                          const updated = [...variations];
                          updated[idx] = { ...updated[idx], note: e.target.value || null };
                          setVariations(updated);
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs">{t("ছবি", "Image")}</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {v.image && (
                          <img src={v.image} alt="" className="w-9 h-9 rounded-md object-cover border border-border" onError={handleImageError} />
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 text-xs"
                          onClick={() => setVariationPickerIdx(idx)}
                        >
                          <FolderOpen className="w-3.5 h-3.5 mr-1" />
                          {v.image ? t("পরিবর্তন", "Change") : t("সিলেক্ট", "Select")}
                        </Button>
                        {v.image && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              const updated = [...variations];
                              updated[idx] = { ...updated[idx], image: null };
                              setVariations(updated);
                            }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <MediaPickerDialog
            open={variationPickerIdx !== null}
            onOpenChange={(open) => { if (!open) setVariationPickerIdx(null); }}
            onSelect={(url) => {
              if (variationPickerIdx !== null) {
                const updated = [...variations];
                updated[variationPickerIdx] = { ...updated[variationPickerIdx], image: url };
                setVariations(updated);
              }
              setVariationPickerIdx(null);
            }}
          />

          {/* Package Tiers & Special Offers */}
          <Card className="border-amber-500/30 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground font-bold">
                    <span>🌱</span>
                    <span>{t("প্যাকেজ অফার ও বান্ডেল টিয়ার সেটিংস", "Package Offers & Bundle Tiers")}</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      "এখানে প্যাকেজ (১ প্যাকেট, ২ প্যাকেট, ৫ প্যাকেট), অফার মূল্য, ফ্রি ডেলিভারি ও কাস্টমার ট্রাস্ট কার্ড নিয়ন্ত্রণ করুন।",
                      "Manage package tiers (1 pack, 2 pack, 5 pack), offer price, free delivery, and trust assurance cards."
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
                    onClick={() => {
                      const reg = Number(form.getValues("regular_price")) || 0;
                      const off = Number(form.getValues("offer_price")) || reg;
                      if (reg <= 0 && off <= 0) {
                        toast.error("অনুগ্রহ করে আগে উপরে পণ্যের নিয়মিত বা অফার মূল্য লিখুন");
                        return;
                      }
                      const basePrice = off > 0 ? off : reg;
                      const baseRegular = reg > 0 ? reg : off;

                      const generated: PackageTier[] = [
                        {
                          id: "tier-" + Date.now() + "-1",
                          name: "১ প্যাকেট",
                          quantity: 1,
                          regular_price: baseRegular,
                          offer_price: basePrice,
                          delivery_charge: 50,
                          is_free_delivery: false,
                          badge: "",
                        },
                        {
                          id: "tier-" + Date.now() + "-2",
                          name: "২ প্যাকেট",
                          quantity: 2,
                          regular_price: baseRegular * 2,
                          offer_price: Math.round(basePrice * 1.8),
                          delivery_charge: 0,
                          is_free_delivery: true,
                          badge: "জনপ্রিয়",
                        },
                        {
                          id: "tier-" + Date.now() + "-5",
                          name: "৫ প্যাকেট",
                          quantity: 5,
                          regular_price: baseRegular * 5,
                          offer_price: Math.round(basePrice * 4.0),
                          delivery_charge: 0,
                          is_free_delivery: true,
                          badge: "মেগা সেভার",
                        },
                      ];
                      setPackageTiers(generated);
                      toast.success("৩টি প্যাকেজ অফার তৈরি হয়েছে!");
                    }}
                  >
                    ⚡ {t("অটো ৩টি প্যাকেজ তৈরি করুন", "Auto 3 Tiers")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const nextNum = packageTiers.length === 0 ? 1 : packageTiers.length === 1 ? 2 : packageTiers.length === 2 ? 5 : packageTiers.length + 1;
                      const reg = Number(form.getValues("regular_price")) || 0;
                      const off = Number(form.getValues("offer_price")) || reg;
                      setPackageTiers((prev) => [
                        ...prev,
                        {
                          id: "tier-" + Date.now(),
                          name: `${nextNum} প্যাকেট`,
                          quantity: nextNum,
                          regular_price: reg * nextNum,
                          offer_price: off * nextNum,
                          delivery_charge: nextNum >= 2 ? 0 : 50,
                          is_free_delivery: nextNum >= 2,
                          badge: nextNum === 2 ? "জনপ্রিয়" : "",
                        },
                      ]);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {t("প্যাকেজ যোগ", "Add Tier")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {/* Highlight Subtitle / Bullet Features */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  {t("হাইলাইট বুলেট / স্পেশাল ফিচার লাইন (টাইটেলের নিচে শো করবে)", "Highlight Subtitle / Bullet Bar")}
                </Label>
                <Input
                  placeholder={t(
                    "যেমন: শিমের সেরা একটি জাত, ১০ গ্রাম প্যাকেট (২৫-২৭ পিচ) বীজ ( উচ্চফলনশীল আগাম জাত, মাত্র ৪০ দিনে ফলন ) খাটো গাছ",
                    "e.g. Premium seed, 10g packet, harvest in 40 days, high yield"
                  )}
                  value={highlightFeatures}
                  onChange={(e) => setHighlightFeatures(e.target.value)}
                  className="text-sm font-medium"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t(
                    "ফাঁকা রাখলে সাধারণ প্রোডাক্ট ডেসক্রিপশন অনুযায়ী স্বাভাবিকভাবে দেখাবে।",
                    "Leave blank to fallback to short description."
                  )}
                </p>
              </div>

              {/* Package Tiers List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">
                    {t("প্যাকেজ ও বান্ডেল অফারসমূহ (Package Tiers)", "Package Tiers")} ({packageTiers.length})
                  </Label>
                </div>

                {packageTiers.length === 0 ? (
                  <div className="text-center py-6 px-4 border border-dashed rounded-xl bg-muted/20">
                    <p className="text-xs text-muted-foreground mb-3">
                      {t(
                        "এখনো কোনো কাস্টম প্যাকেজ যোগ করা হয়নি। আপনি চাইলে 'অটো ৩টি প্যাকেজ তৈরি করুন' বাটনে ক্লিক করতে পারেন অথবা নিজে যোগ করতে পারেন। (কাস্টম প্যাকেজ না থাকলে পণ্যের মূল দাম থেকে স্বয়ংক্রিয়ভাবে ১, ২ ও ৫ প্যাকেট তৈরি হবে)",
                        "No custom package tiers yet. Click 'Auto 3 Tiers' or add manually. If empty, default 1, 2, 5 packs will be calculated automatically."
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {packageTiers.map((tier, idx) => (
                      <div
                        key={tier.id || idx}
                        className="relative rounded-xl border border-border bg-card p-3 shadow-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            প্যাকেজ #{idx + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => setPackageTiers((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[11px]">{t("প্যাকেজের নাম", "Name")}</Label>
                            <Input
                              value={tier.name}
                              placeholder="১ প্যাকেট"
                              className="h-8 text-xs"
                              onChange={(e) => {
                                const next = [...packageTiers];
                                next[idx] = { ...next[idx], name: e.target.value };
                                setPackageTiers(next);
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-[11px]">{t("বীজ/প্যাকেটের সংখ্যা", "Quantity")}</Label>
                            <Input
                              type="number"
                              min={1}
                              value={tier.quantity}
                              className="h-8 text-xs"
                              onChange={(e) => {
                                const next = [...packageTiers];
                                next[idx] = { ...next[idx], quantity: Math.max(1, Number(e.target.value) || 1) };
                                setPackageTiers(next);
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[11px]">{t("রেগুলার মূল্য (৳)", "Regular")}</Label>
                            <Input
                              type="number"
                              min={0}
                              value={tier.regular_price}
                              className="h-8 text-xs"
                              onChange={(e) => {
                                const next = [...packageTiers];
                                next[idx] = { ...next[idx], regular_price: Number(e.target.value) || 0 };
                                setPackageTiers(next);
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-[11px] font-bold text-primary">{t("অফার মূল্য (৳)", "Offer")}</Label>
                            <Input
                              type="number"
                              min={0}
                              value={tier.offer_price}
                              className="h-8 text-xs font-bold text-primary"
                              onChange={(e) => {
                                const next = [...packageTiers];
                                next[idx] = { ...next[idx], offer_price: Number(e.target.value) || 0 };
                                setPackageTiers(next);
                              }}
                            />
                          </div>
                        </div>

                        <div className="pt-1 border-t border-border/60 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={tier.is_free_delivery}
                                className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                                onChange={(e) => {
                                  const next = [...packageTiers];
                                  next[idx] = {
                                    ...next[idx],
                                    is_free_delivery: e.target.checked,
                                    delivery_charge: e.target.checked ? 0 : 50,
                                  };
                                  setPackageTiers(next);
                                }}
                              />
                              <span className="text-emerald-600 font-bold">ফ্রি ডেলিভারি</span>
                            </label>

                            {!tier.is_free_delivery && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">চার্জ: ৳</span>
                                <Input
                                  type="number"
                                  min={0}
                                  value={tier.delivery_charge}
                                  className="h-7 w-16 text-xs text-right"
                                  onChange={(e) => {
                                    const next = [...packageTiers];
                                    next[idx] = { ...next[idx], delivery_charge: Number(e.target.value) || 0 };
                                    setPackageTiers(next);
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <Label className="text-[10px] text-muted-foreground">{t("ব্যাজ (যেমন: জনপ্রিয় / মেগা সেভার)", "Badge (Optional)")}</Label>
                            <Input
                              value={tier.badge || ""}
                              placeholder="যেমন: জনপ্রিয়"
                              className="h-7 text-xs"
                              onChange={(e) => {
                                const next = [...packageTiers];
                                next[idx] = { ...next[idx], badge: e.target.value };
                                setPackageTiers(next);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trust Cards Customization */}
              <div className="pt-3 border-t border-border space-y-4">
                <Label className="text-xs font-bold text-foreground">
                  {t("কাস্টমার ট্রাস্ট ও প্রতিশ্রুতি কার্ড কাস্টমাইজেশন (Trust Assurance Cards)", "Trust Cards")}
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Green Card */}
                  <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <Label className="text-xs font-bold text-emerald-950">
                        {t("কার্ড ১ (সবুজ কার্ড - নিশ্চিন্তে অর্ডার)", "Card 1 (Green)")}
                      </Label>
                    </div>
                    <Input
                      placeholder="ডিফল্ট: নিশ্চিন্তে অর্ডার করুন"
                      value={trustCard1Title}
                      onChange={(e) => setTrustCard1Title(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                    <Textarea
                      placeholder="ডিফল্ট: অর্ডার দেওয়ার পর আমাদের প্রতিনিধি আপনাকে কল করে বিস্তারিত আলোচনা করবেন এবং তারপরই অর্ডারটি কনফার্ম করা হবে। কোনো প্রশ্ন বা জিজ্ঞাসা থাকলে তখনই জেনে নিতে পারবেন।"
                      value={trustCard1Text}
                      onChange={(e) => setTrustCard1Text(e.target.value)}
                      rows={3}
                      className="text-xs bg-white"
                    />
                  </div>

                  {/* Card 2: Amber Card */}
                  <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <Label className="text-xs font-bold text-amber-950">
                        {t("কার্ড ২ (অ্যাম্বার কার্ড - আমাদের প্রতিশ্রুতি)", "Card 2 (Amber)")}
                      </Label>
                    </div>
                    <Input
                      placeholder="ডিফল্ট: 🤝 আমাদের প্রতিশ্রুতি"
                      value={trustCard2Title}
                      onChange={(e) => setTrustCard2Title(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                    <Textarea
                      placeholder="ডিফল্ট: আমরা বাংলাদেশের সবচেয়ে কম দামে সেরা বীজ দিচ্ছি — আমাদের লক্ষ্য কম লাভে বেশি বিক্রি। তাই অনুরোধ থাকবে, আন্তরিকতার সাথে পার্সেলটি রিসিভ করবেন। ইনশাআল্লাহ আমরা কথা দিচ্ছি, আপনাকে সেরা মানের পণ্যটিই পৌঁছে দেব।"
                      value={trustCard2Text}
                      onChange={(e) => setTrustCard2Text(e.target.value)}
                      rows={3}
                      className="text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("বিস্তারিত বিবরণ (ঐচ্ছিক)", "Full Description (Optional)")}</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField control={form.control} name="full_description" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder={t("পণ্যের বিস্তারিত বিবরণ লিখুন...", "Write detailed product description...")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(backUrl)}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? t("আপডেট করুন", "Update") : t("পণ্য তৈরি করুন", "Create Product")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}