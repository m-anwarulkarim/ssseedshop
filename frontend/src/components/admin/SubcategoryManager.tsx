import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ChevronDown, ChevronRight, FolderTree } from "lucide-react";

import { API_BASE } from "@/lib/apiConfig";

interface Subcategory {
  id: string;
  category_name: string;
  name: string;
  position: number;
}

interface Props {
  categories: Array<{ id: string; name: string }>;
}

export function SubcategoryManager({ categories }: Props) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newName, setNewName] = useState<Record<string, string>>({});

  const { data: subs = [], isLoading } = useQuery({
    queryKey: ["all-subcategories-admin"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/categories/subcategories.php`);
      if (!res.ok) return [];
      const data = await res.json();
      return (Array.isArray(data) ? data : []) as Subcategory[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async ({ category_name, names }: { category_name: string; names: string[] }) => {
      const rows = names.map((name) => ({ category_name, name, position: 0 }));
      const res = await fetch(`${API_BASE}/categories/subcategories.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });
      if (!res.ok) throw new Error("Failed to add subcategories");
      return names.length;
    },
    onSuccess: (count, vars) => {
      queryClient.invalidateQueries({ queryKey: ["all-subcategories-admin"] });
      setNewName((s) => ({ ...s, [vars.category_name]: "" }));
      toast.success(
        count && count > 1
          ? t(`${count}টি সাব-ক্যাটাগরি যোগ হয়েছে`, `${count} sub-categories added`)
          : t("সাব-ক্যাটাগরি যোগ হয়েছে", "Sub-category added")
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submitAdd = (categoryName: string) => {
    const raw = newName[categoryName] || "";
    const names = Array.from(
      new Set(
        raw
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );
    if (names.length) addMutation.mutate({ category_name: categoryName, names });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/categories/subcategories.php?action=delete&id=${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete subcategory");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-subcategories-admin"] });
      toast.success(t("মুছে ফেলা হয়েছে", "Deleted"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!categories.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <FolderTree className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">{t("সাব-ক্যাটাগরি ম্যানেজমেন্ট", "Sub-categories")}</h3>
      </div>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => {
            const items = subs.filter((s) => s.category_name === cat.name);
            const isOpen = expanded[cat.name] ?? false;
            return (
              <div key={cat.id} className="rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setExpanded((s) => ({ ...s, [cat.name]: !isOpen }))}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <span className="text-sm font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">({items.length})</span>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((sub) => (
                        <span
                          key={sub.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {sub.name}
                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(sub.id)}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {items.length === 0 && (
                        <span className="text-xs text-muted-foreground">{t("এখনো কোনো সাব-ক্যাটাগরি নেই", "No sub-categories yet")}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newName[cat.name] || ""}
                        onChange={(e) => setNewName((s) => ({ ...s, [cat.name]: e.target.value }))}
                        placeholder={t("নাম (একাধিক হলে কমা দিয়ে আলাদা করুন)", "Name (comma-separate for multiple)")}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            submitAdd(cat.name);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => submitAdd(cat.name)}
                        disabled={addMutation.isPending}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
