import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { CURRENT_VERSION, RELEASES } from "@/data/releases";

const STORAGE_KEY = "whats_new_popup_state";
const MAX_VIEWS = 2;

interface PopupState {
  version: string;
  views: number;
}

function readState(): PopupState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { version: "", views: 0 };
}

export function WhatsNewPopup() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const release = RELEASES[0];

  useEffect(() => {
    const state = readState();
    // New version → reset counter
    if (state.version !== CURRENT_VERSION) {
      const fresh: PopupState = { version: CURRENT_VERSION, views: 1 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      setOpen(true);
      return;
    }
    // Same version, still under view limit
    if (state.views < MAX_VIEWS) {
      const updated: PopupState = { version: CURRENT_VERSION, views: state.views + 1 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setOpen(true);
    }
  }, []);

  const handleViewAll = () => {
    setOpen(false);
    navigate("/admin/help-support");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <DialogHeader className="space-y-0.5">
                <DialogTitle className="text-base font-bold text-white">
                  {t("নতুন আপডেট এসেছে!", "New update available!")}
                </DialogTitle>
                <DialogDescription className="text-emerald-50/90 text-xs">
                  {t("সর্বশেষ পরিবর্তনগুলো দেখে নিন", "Check out the latest changes")}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15 border-0 font-mono">
              v{release.version}
            </Badge>
            <span className="text-[11px] text-muted-foreground">{release.date}</span>
          </div>

          <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {release.changes.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t(c.bn, c.en)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-5 py-3 border-t flex gap-2 justify-end bg-muted/30">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            {t("পরে দেখব", "Later")}
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleViewAll}
          >
            {t("বিস্তারিত দেখুন", "View details")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
