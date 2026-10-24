import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { icons, Plus, Pencil, Trash2, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

const COLOR_OPTIONS = [
  { key: "gray", cls: "bg-gray-100 text-gray-600" },
  { key: "red", cls: "bg-red-100 text-red-600" },
  { key: "orange", cls: "bg-orange-100 text-orange-600" },
  { key: "yellow", cls: "bg-yellow-100 text-yellow-700" },
  { key: "green", cls: "bg-green-100 text-green-600" },
  { key: "blue", cls: "bg-blue-100 text-blue-600" },
  { key: "purple", cls: "bg-purple-100 text-purple-600" },
  { key: "pink", cls: "bg-pink-100 text-pink-600" },
  { key: "amber", cls: "bg-amber-100 text-amber-600" },
  { key: "emerald", cls: "bg-emerald-100 text-emerald-600" },
];

const POPULAR_ICONS = [
  "Award", "Star", "Heart", "ThumbsUp", "Sparkles", "BadgeCheck", "BadgePercent",
  "RefreshCw", "Zap", "Flame", "Trophy", "Crown", "Gift", "ShieldCheck", "Leaf",
  "Sprout", "Sun", "Cloud", "Droplet", "TrendingUp", "Rocket", "Tag", "Bookmark",
  "CheckCircle", "AlertCircle", "Gem", "Medal",
];

interface TagRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const C = (icons as any)[name];
  if (!C) return null;
  return <C className={className} />;
}

function BadgePreview({ name, icon, color }: { name: string; icon: string; color: string }) {
  const rawColor = color || "gray";
  const isHex = rawColor.startsWith("#") || rawColor.startsWith("rgb") || rawColor.startsWith("hsl");
  const cls = !isHex ? (COLOR_OPTIONS.find((c) => c.key === color)?.cls || COLOR_OPTIONS[0].cls) : "";
  const style = isHex ? { backgroundColor: rawColor, color: '#fff' } : undefined;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium px-2 py-1 text-[11px] ${cls}`} style={style}>
      {icon && <LucideIcon name={icon} className="w-3 h-3" />}
      {name || "Preview"}
    </span>
  );
}

import { API_BASE } from "@/lib/apiConfig";

export default function TagList() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TagRow | null>(null);
  const [form, setForm] = useState({ name: "", icon: "Award", color: "emerald" });

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/tags/get.php`);
      const data = await res.json();
      return (data || []) as TagRow[];
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", icon: "Award", color: "emerald" });
    setDialogOpen(true);
  };

  const openEdit = (row: TagRow) => {
    setEditing(row);
    setForm({
      name: row.name || "",
      icon: row.icon || "Award",
      color: row.color || "emerald",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error(t("ব্যাজের নাম দিন", "Please enter a badge name"));
      return;
    }
    const payload = {
      name: form.name.trim(),
      icon: form.icon || null,
      color: form.color || null,
    };
    try {
      if (editing) {
        const res = await fetch(`${API_BASE}/tags/update.php`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...payload })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        toast.success(t("ব্যাজ আপডেট হয়েছে", "Badge updated"));
      } else {
        const res = await fetch(`${API_BASE}/tags/create.php`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        toast.success(t("নতুন ব্যাজ যোগ হয়েছে", "Badge created"));
      }
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-tags"] });
      qc.invalidateQueries({ queryKey: ["all-tags"] });
      qc.invalidateQueries({ queryKey: ["all-tags-admin"] });
    } catch (e: any) {
      toast.error(e.message || "Error");
    }
  };

  const remove = async (row: TagRow) => {
    if (!confirm(t(`"${row.name}" ব্যাজটি মুছবেন?`, `Delete badge "${row.name}"?`))) return;
    try {
      const res = await fetch(`${API_BASE}/tags/delete.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(t("মুছে ফেলা হয়েছে", "Deleted"));
      qc.invalidateQueries({ queryKey: ["admin-tags"] });
      qc.invalidateQueries({ queryKey: ["all-tags"] });
    } catch (e: any) {
      toast.error(e.message || "Error");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            {t("প্রোডাক্ট ব্যাজ", "Product Badges")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("প্রোডাক্ট কার্ডে দেখানো ব্যাজ (যেমন: ১২ মাস, সেরা পণ্য, পরীক্ষিত) এখান থেকে তৈরি ও পরিবর্তন করুন।",
              "Create and manage badges (e.g., 12 Months, Best Product, Tested) shown on product cards.")}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> {t("নতুন ব্যাজ", "New Badge")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          <p className="text-sm text-slate-500">{t("লোড হচ্ছে...", "Loading...")}</p>
        ) : tags.length === 0 ? (
          <p className="text-sm text-slate-500">{t("কোনো ব্যাজ নেই", "No badges yet")}</p>
        ) : (
          tags.map((tg) => (
            <div key={tg.id} className="border border-slate-200 rounded-xl p-3 bg-white flex items-start justify-between gap-3">
              <div className="min-w-0">
                <BadgePreview name={tg.name} icon={tg.icon || ""} color={tg.color || "gray"} />
                <p className="text-[11px] text-slate-400 mt-1">
                  {tg.icon || "—"} · {tg.color || "—"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(tg)} className="h-8 w-8 p-0">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(tg)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t("ব্যাজ এডিট", "Edit Badge") : t("নতুন ব্যাজ", "New Badge")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t("প্রিভিউ", "Preview")}</Label>
              <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <BadgePreview name={form.name || t("ব্যাজ", "Badge")} icon={form.icon} color={form.color} />
              </div>
            </div>

            <div>
              <Label>{t("নাম", "Name")}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("যেমন: সেরা পণ্য", "e.g., Best Product")} />
            </div>


            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("কালার (নাম বা Hex)", "Color (Name or Hex)")}</Label>
                <div className="flex gap-2">
                  <div className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden border border-slate-200">
                    <input 
                      type="color" 
                      value={form.color?.startsWith('#') ? form.color : '#4f46e5'} 
                      onChange={(e) => setForm({ ...form, color: e.target.value })} 
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <Input 
                    value={form.color} 
                    onChange={(e) => setForm({ ...form, color: e.target.value })} 
                    placeholder="red, #ff5733, etc." 
                  />
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.key })}
                      className={`w-5 h-5 rounded-full border border-black/10 ${c.cls.split(' ')[0]} ${form.color === c.key ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                      title={c.key}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>{t("আইকন", "Icon")}</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Award" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-500">{t("পপুলার আইকন", "Popular icons")}</Label>
              <div className="mt-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {POPULAR_ICONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, icon: n })}
                    className={`p-2 rounded-md border transition-colors ${form.icon === n ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}
                    title={n}
                  >
                    <LucideIcon name={n} className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {t("অন্য যেকোনো Lucide আইকনের নাম উপরে লিখেও দিতে পারেন।", "You can also type any Lucide icon name above.")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("বাতিল", "Cancel")}</Button>
            <Button onClick={save}>{t("সংরক্ষণ", "Save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
