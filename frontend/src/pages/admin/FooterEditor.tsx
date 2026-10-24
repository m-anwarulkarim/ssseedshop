import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { NAVBAR_ICON_NAMES, NAVBAR_ICONS, DEFAULT_NAVBAR_ITEMS } from "@/lib/navbarIcons";

type Link = { label: string; href: string };
type NavItem = { label: string; href: string; icon: string };

const FOOTER_SECTIONS: { key: string; title: string }[] = [
  { key: "footer_quick_links", title: "Quick Links" },
  { key: "footer_categories", title: "ক্যাটাগরি (Categories)" },
];

function LinkEditor({
  title,
  items,
  setItems,
}: {
  title: string;
  items: Link[];
  setItems: (l: Link[]) => void;
}) {
  const update = (i: number, patch: Partial<Link>) => {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const add = () => setItems([...items, { label: "", href: "/" }]);

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <Button size="sm" variant="outline" onClick={add}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground">No items. Click Add to create one.</p>
        )}
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              placeholder="Label (e.g. হোম)"
              value={it.label}
              onChange={(e) => update(i, { label: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="URL (e.g. /categories)"
              value={it.href}
              onChange={(e) => update(i, { href: e.target.value })}
              className="flex-1"
            />
            <Button size="icon" variant="ghost" onClick={() => remove(i)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavbarEditor({
  items,
  setItems,
}: {
  items: NavItem[];
  setItems: (l: NavItem[]) => void;
}) {
  const update = (i: number, patch: Partial<NavItem>) => {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const add = () => setItems([...items, { label: "", href: "/", icon: "Home" }]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">নেভবার মেনু (Navbar Menu)</h2>
        <Button size="sm" variant="outline" onClick={add}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        সাইটের হ্যামবার্গার মেনুতে যেসব আইটেম দেখাবে।
      </p>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground">No items.</p>
        )}
        {items.map((it, i) => {
          const Icon = NAVBAR_ICONS[it.icon] || NAVBAR_ICONS.Home;
          return (
            <div key={i} className="flex gap-2 items-center">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <Input
                placeholder="Label"
                value={it.label}
                onChange={(e) => update(i, { label: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="URL"
                value={it.href}
                onChange={(e) => update(i, { href: e.target.value })}
                className="flex-1"
              />
              <select
                value={it.icon}
                onChange={(e) => update(i, { icon: e.target.value })}
                className="h-9 px-2 rounded-md border bg-background text-xs"
              >
                {NAVBAR_ICON_NAMES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FooterEditor() {
  const [data, setData] = useState<Record<string, Link[]>>({
    footer_quick_links: [],
    footer_categories: [],
  });
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAVBAR_ITEMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const keys = [...FOOTER_SECTIONS.map((s) => s.key), "navbar_menu_items"];
      const { data: rows } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", keys);
      const nextFooter: Record<string, Link[]> = { footer_quick_links: [], footer_categories: [] };
      let nextNav: NavItem[] | null = null;
      (rows || []).forEach((r: any) => {
        try {
          const arr = JSON.parse(r.value);
          if (r.key === "navbar_menu_items") {
            if (Array.isArray(arr)) nextNav = arr;
          } else if (Array.isArray(arr)) {
            nextFooter[r.key] = arr;
          }
        } catch {}
      });
      setData(nextFooter);
      if (nextNav && nextNav.length) setNavItems(nextNav);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payloads = [
        ...FOOTER_SECTIONS.map((s) => ({ key: s.key, value: JSON.stringify(data[s.key] || []) })),
        { key: "navbar_menu_items", value: JSON.stringify(navItems || []) },
      ];
      for (const p of payloads) {
        const { error } = await supabase
          .from("app_settings")
          .upsert(p, { onConflict: "key" });
        if (error) throw error;
      }
      toast.success("সেটিংস সেভ হয়েছে");
    } catch (err: any) {
      toast.error(`সেভ ব্যর্থ: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Navbar & Footer Editor</h1>
          <p className="text-xs text-muted-foreground">
            নেভবার মেনু এবং ফুটারের Quick Links / Categories কাস্টমাইজ করুন।
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          Save
        </Button>
      </div>

      <NavbarEditor items={navItems} setItems={setNavItems} />

      {FOOTER_SECTIONS.map((s) => (
        <LinkEditor
          key={s.key}
          title={s.title}
          items={data[s.key] || []}
          setItems={(items) => setData((prev) => ({ ...prev, [s.key]: items }))}
        />
      ))}
    </div>
  );
}
