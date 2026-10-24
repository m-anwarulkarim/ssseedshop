import { useQuery } from "@tanstack/react-query";
import { icons } from "lucide-react";

const colorMap: Record<string, string> = {
  gray: "bg-gray-100 text-gray-600",
  red: "bg-red-100 text-red-600",
  orange: "bg-orange-100 text-orange-600",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-600",
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  pink: "bg-pink-100 text-pink-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
};

export interface TagDef {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export function useAllTags() {
  return useQuery({
    queryKey: ["all-tags"],
    queryFn: async () => {
      const url = import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";
      const res = await fetch(`${url}/tags/get.php`);
      if (!res.ok) return [];
      const data = await res.json();
      return (Array.isArray(data) ? data : []) as TagDef[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

function LucideIcon({ name, className }: { name: string; className?: string }) {
  if (!name || typeof icons === "undefined" || !icons) return null;
  const C = (icons as any)[name];
  if (!C) return null;
  return <C className={className} />;
}

interface Props {
  tagNames?: string[] | null;
  size?: "sm" | "md";
  className?: string;
}

export default function ProductBadges({ tagNames, size = "sm", className = "" }: Props) {
  const { data: allTags = [] } = useAllTags();

  let list: string[] = [];
  if (Array.isArray(tagNames)) {
    list = tagNames;
  } else if (typeof tagNames === "string") {
    list = (tagNames as string).split(/[|,]/).map((s) => s.trim()).filter(Boolean);
  }

  const map = new Map(allTags.map((t) => [t.name, t]));
  const activeList = allTags.length > 0 ? list.filter((n) => map.has(n)) : list;

  if (activeList.length === 0) return null;

  const px = size === "md" ? "px-2 py-1 text-[11px]" : "px-1.5 py-0.5 text-[10px]";
  const ic = size === "md" ? "w-3 h-3" : "w-2.5 h-2.5";

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {activeList.map((n) => {
        const t = map.get(n);
        const rawColor = t?.color || "gray";
        const isHex = rawColor.startsWith("#") || rawColor.startsWith("rgb") || rawColor.startsWith("hsl");
        const colorCls = !isHex ? (colorMap[rawColor] || colorMap.gray) : "";
        const style = isHex ? { backgroundColor: rawColor, color: '#fff' } : undefined;

        return (
          <span
            key={n}
            className={`inline-flex items-center gap-0.5 rounded-full font-medium ${px} ${colorCls}`}
            style={style}
          >
            {t?.icon && <LucideIcon name={t.icon} className={ic} />}
            {n}
          </span>
        );
      })}
    </div>
  );
}
