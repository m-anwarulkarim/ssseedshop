import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme, ThemeMode } from "@/contexts/ThemeContext";
import { useIconPack, IconPack } from "@/contexts/IconPackContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Pop from "@/components/admin/icons/pop";
import { LayoutDashboard as LucideLayoutDashboard, ShoppingCart as LucideShoppingCart, Users as LucideUsers, Settings as LucideSettings } from "lucide-react";
import { SquaresFour, ShoppingCart as PhCart, Users as PhUsers, Gear } from "@phosphor-icons/react";

type ThemeItem = { value: ThemeMode; label: string; labelEn: string; colors: string[] };

const lightThemes: ThemeItem[] = [
  { value: "light", label: "লাইট", labelEn: "Light", colors: ["bg-white", "bg-green-700", "bg-amber-500"] },
  { value: "sky", label: "স্কাই", labelEn: "Sky", colors: ["bg-sky-50", "bg-sky-500", "bg-indigo-500"] },
  { value: "leaf", label: "লিফ", labelEn: "Leaf", colors: ["bg-green-50", "bg-green-700", "bg-lime-600"] },
];

const mixedThemes: ThemeItem[] = [
  { value: "ocean", label: "ওশান", labelEn: "Ocean", colors: ["bg-blue-50", "bg-blue-600", "bg-purple-500"] },
  { value: "sunset", label: "সানসেট", labelEn: "Sunset", colors: ["bg-orange-50", "bg-pink-600", "bg-orange-500"] },
  { value: "doodle", label: "ডুডল", labelEn: "Doodle", colors: ["bg-amber-50", "bg-amber-600", "bg-orange-600"] },
  { value: "rose", label: "রোজ", labelEn: "Rose", colors: ["bg-pink-50", "bg-pink-500", "bg-orange-400"] },
];

const darkThemes: ThemeItem[] = [
  { value: "dark", label: "ডার্ক", labelEn: "Dark", colors: ["bg-slate-800", "bg-green-500", "bg-amber-500"] },
  { value: "midnight", label: "মিডনাইট", labelEn: "Midnight", colors: ["bg-slate-900", "bg-blue-500", "bg-purple-500"] },
  { value: "silver", label: "সিলভার", labelEn: "Silver", colors: ["bg-gray-900", "bg-gray-600", "bg-gray-300"] },
];

type IconPackOption = {
  value: IconPack;
  label: string;
  labelEn: string;
  preview: React.ReactNode;
};

const iconClass = "w-5 h-5 text-primary";

const iconPacks: IconPackOption[] = [
  {
    value: "pop",
    label: "পপ",
    labelEn: "Pop",
    preview: (
      <>
        <Pop.LayoutDashboard className={iconClass} />
        <Pop.ShoppingCart className={iconClass} />
        <Pop.Users className={iconClass} />
        <Pop.Settings className={iconClass} />
      </>
    ),
  },
  {
    value: "outline",
    label: "আউটলাইন",
    labelEn: "Outline",
    preview: (
      <>
        <LucideLayoutDashboard className={iconClass} />
        <LucideShoppingCart className={iconClass} />
        <LucideUsers className={iconClass} />
        <LucideSettings className={iconClass} />
      </>
    ),
  },
  {
    value: "bold",
    label: "বোল্ড",
    labelEn: "Bold",
    preview: (
      <>
        <SquaresFour className={iconClass} weight="bold" />
        <PhCart className={iconClass} weight="bold" />
        <PhUsers className={iconClass} weight="bold" />
        <Gear className={iconClass} weight="bold" />
      </>
    ),
  },
  {
    value: "duotone",
    label: "ডুওটোন",
    labelEn: "Duotone",
    preview: (
      <>
        <SquaresFour className={iconClass} weight="duotone" />
        <PhCart className={iconClass} weight="duotone" />
        <PhUsers className={iconClass} weight="duotone" />
        <Gear className={iconClass} weight="duotone" />
      </>
    ),
  },
  {
    value: "fill",
    label: "ফিল",
    labelEn: "Fill",
    preview: (
      <>
        <SquaresFour className={iconClass} weight="fill" />
        <PhCart className={iconClass} weight="fill" />
        <PhUsers className={iconClass} weight="fill" />
        <Gear className={iconClass} weight="fill" />
      </>
    ),
  },
  {
    value: "vibrant",
    label: "ভাইব্রেন্ট",
    labelEn: "Vibrant",
    preview: (
      <>
        <SquaresFour className="w-5 h-5 icon-vibrant icon-vibrant-LayoutDashboard" weight="duotone" />
        <PhCart className="w-5 h-5 icon-vibrant icon-vibrant-ShoppingCart" weight="duotone" />
        <PhUsers className="w-5 h-5 icon-vibrant icon-vibrant-Users" weight="duotone" />
        <Gear className="w-5 h-5 icon-vibrant icon-vibrant-Settings" weight="duotone" />
      </>
    ),
  },
];

export default function ThemeSettings() {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { pack, setPack } = useIconPack();

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4" />
            {t("থিম নির্বাচন করুন", "Select Theme")}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t("এই থিম শুধুমাত্র অ্যাডমিন প্যানেলে প্রযোজ্য হবে।", "This theme only applies to the admin panel.")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            { title: t("লাইট থিম", "Light Themes"), items: lightThemes },
            { title: t("মিক্সড থিম", "Mixed Themes"), items: mixedThemes },
            { title: t("ডার্ক থিম", "Dark Themes"), items: darkThemes },
          ]).map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                {group.title}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {group.items.map((th) => (
                  <button
                    key={th.value}
                    onClick={() => setTheme(th.value)}
                    className={cn(
                      "relative rounded-xl border-2 p-3 text-center transition-all hover:scale-105",
                      theme === th.value
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    {theme === th.value && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="flex gap-1 justify-center mb-2">
                      {th.colors.map((c, i) => (
                        <div key={i} className={cn("w-4 h-4 rounded-full border border-border/50", c)} />
                      ))}
                    </div>
                    <p className="text-xs font-medium">{t(th.label, th.labelEn)}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Pop.Palette className="w-4 h-4" />
            {t("আইকন স্টাইল", "Icon Style")}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t("সাইডবার ও মেনুর আইকনের ডিজাইন বেছে নিন।", "Pick the icon design for sidebar and menus.")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {iconPacks.map((ip) => (
              <button
                key={ip.value}
                onClick={() => setPack(ip.value)}
                className={cn(
                  "relative rounded-xl border-2 p-3 text-center transition-all hover:scale-105",
                  pack === ip.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                {pack === ip.value && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div className="flex gap-1.5 justify-center items-center mb-2 h-6">
                  {ip.preview}
                </div>
                <p className="text-xs font-medium">{t(ip.label, ip.labelEn)}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
