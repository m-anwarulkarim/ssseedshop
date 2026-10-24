import { useState } from "react";
import { useLanguage, LangMode } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const languages: { value: LangMode; label: string; native: string; flag: string }[] = [
  { value: "bn", label: "Bengali", native: "বাংলা", flag: "" },
  { value: "en", label: "English", native: "English", flag: "" },
];

export default function LanguageSettings() {
  const { lang, setLang, t } = useLanguage();
  const [showWarning, setShowWarning] = useState(false);

  const handleSelect = (value: LangMode) => {
    if (value === lang) return;
    if (value === "bn") {
      setShowWarning(true);
    } else {
      setLang(value);
    }
  };

  const activeIndex = languages.findIndex((l) => l.value === lang);

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Languages className="w-4 h-4" />
            {t("ভাষা নির্বাচন করুন", "Select Language")}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t(
              "এই ভাষা শুধুমাত্র অ্যাডমিন প্যানেলে প্রযোজ্য হবে। কাস্টমার পেজ সবসময় বাংলায় থাকবে।",
              "This language only applies to the admin panel. Customer pages always remain in Bengali."
            )}
          </p>
        </CardHeader>
        <CardContent>
          <div
            role="tablist"
            aria-label={t("ভাষা", "Language")}
            className="relative grid grid-cols-2 gap-1 rounded-full border border-border bg-muted/50 p-1"
          >
            {/* Sliding active indicator */}
            <div
              aria-hidden
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-background shadow-sm border border-border transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${activeIndex * 100}%)`, left: 4 }}
            />
            {languages.map((l) => {
              const isActive = lang === l.value;
              return (
                <button
                  key={l.value}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelect(l.value)}
                  className={cn(
                    "relative z-10 flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-sm font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-base leading-none">{l.flag}</span>
                  <span>{l.native}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">· {l.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              This website is built in English. Switching to Bengali may cause some parts of the admin panel to not work properly. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setLang("bn")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              OK, Switch to Bengali
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
