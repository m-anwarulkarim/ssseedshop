import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Keyboard, Plus, Trash2, Command, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getShortcuts,
  saveShortcuts,
  normalizeKeyCombo,
  formatKeyCombo,
  isNavZYEnabled,
  setNavZYEnabled,
  ADMIN_MENU_TARGETS,
  type KeyboardShortcutEntry,
} from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";

export default function KeyboardShortcuts() {
  const { t } = useLanguage();
  const [navZY, setNavZY] = useState(isNavZYEnabled);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcutEntry[]>(getShortcuts);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string>("");
  const [recordedLabel, setRecordedLabel] = useState<string>("");
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const recordRef = useRef<HTMLDivElement>(null);

  // Sync from storage events
  useEffect(() => {
    const handler = () => setShortcuts(getShortcuts());
    window.addEventListener("admin-shortcuts-changed", handler);
    return () => window.removeEventListener("admin-shortcuts-changed", handler);
  }, []);

  // Keyboard recording
  useEffect(() => {
    if (!isRecording) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const combo = normalizeKeyCombo(e);
      // Skip if only modifier keys
      if (!combo || combo === "ctrl" || combo === "alt" || combo === "shift" || combo === "ctrl+shift" || combo === "ctrl+alt" || combo === "alt+shift" || combo === "ctrl+alt+shift") return;
      setRecordedKeys(combo);
      setRecordedLabel(formatKeyCombo(combo));
      setIsRecording(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRecording]);

  const startRecording = () => {
    setRecordedKeys("");
    setRecordedLabel("");
    setIsRecording(true);
  };

  const addShortcut = () => {
    if (!recordedKeys || !selectedTarget) {
      toast.error(t("কী কম্বো এবং টার্গেট উভয়ই নির্বাচন করুন", "Please select both a key combo and a target"));
      return;
    }

    // Check for duplicate key combo
    const existing = shortcuts.find((s) => s.keys === recordedKeys);
    if (existing) {
      toast.error(t("এই কী কম্বো ইতিমধ্যে ব্যবহৃত হচ্ছে", "This key combo is already in use"));
      return;
    }

    const target = ADMIN_MENU_TARGETS.find((m) => m.url === selectedTarget);
    if (!target) return;

    const newEntry: KeyboardShortcutEntry = {
      id: crypto.randomUUID(),
      keys: recordedKeys,
      label: recordedLabel,
      targetUrl: selectedTarget,
      targetLabel: target.label,
    };

    const updated = [...shortcuts, newEntry];
    setShortcuts(updated);
    saveShortcuts(updated);
    setRecordedKeys("");
    setRecordedLabel("");
    setSelectedTarget("");
    toast.success(t("শর্টকাট যোগ হয়েছে", "Shortcut added"));
  };

  const removeShortcut = (id: string) => {
    const updated = shortcuts.filter((s) => s.id !== id);
    setShortcuts(updated);
    saveShortcuts(updated);
    toast.success(t("শর্টকাট মুছে ফেলা হয়েছে", "Shortcut removed"));
  };

  // Group targets by group name
  const groupedTargets = ADMIN_MENU_TARGETS.reduce<Record<string, typeof ADMIN_MENU_TARGETS>>((acc, item) => {
    const group = item.group || "General";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Ctrl+Z / Ctrl+Y Navigation Toggle */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Undo2 className="w-4 h-4 text-muted-foreground" />
                <Redo2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("Ctrl+Z / Ctrl+Y নেভিগেশন", "Ctrl+Z / Ctrl+Y Navigation")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "Ctrl+Z = আগের পেজ, Ctrl+Y = পরের পেজ (ব্রাউজার Back/Forward এর মতো)",
                    "Ctrl+Z = previous page, Ctrl+Y = next page (like browser Back/Forward)"
                  )}
                </p>
              </div>
            </div>
            <Switch
              checked={navZY}
              onCheckedChange={(checked) => {
                setNavZY(checked);
                setNavZYEnabled(checked);
                toast.success(
                  checked
                    ? t("Ctrl+Z/Y নেভিগেশন চালু হয়েছে", "Ctrl+Z/Y navigation enabled")
                    : t("Ctrl+Z/Y নেভিগেশন বন্ধ হয়েছে", "Ctrl+Z/Y navigation disabled")
                );
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Create new shortcut */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t("নতুন শর্টকাট তৈরি করুন", "Create New Shortcut")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key combo recorder */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t("কী কম্বো", "Key Combo")}
            </label>
            <div
              ref={recordRef}
              onClick={startRecording}
              className={cn(
                "h-11 px-4 rounded-lg border-2 flex items-center gap-2 cursor-pointer transition-all select-none",
                isRecording
                  ? "border-primary bg-primary/5 animate-pulse"
                  : recordedKeys
                    ? "border-primary/50 bg-card"
                    : "border-dashed border-border bg-muted/30 hover:border-muted-foreground/40"
              )}
            >
              <Keyboard className="w-4 h-4 text-muted-foreground shrink-0" />
              {isRecording ? (
                <span className="text-sm text-primary font-medium">
                  {t("কী চাপুন...", "Press keys...")}
                </span>
              ) : recordedLabel ? (
                <div className="flex items-center gap-1.5">
                  {recordedLabel.split(" + ").map((k, i) => (
                    <Badge key={i} variant="secondary" className="font-mono text-xs px-2 py-0.5">
                      {k}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t("ক্লিক করে কী কম্বো রেকর্ড করুন", "Click to record key combo")}
                </span>
              )}
            </div>
          </div>

          {/* Target selector */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t("টার্গেট পেজ", "Target Page")}
            </label>
            <Select value={selectedTarget} onValueChange={setSelectedTarget}>
              <SelectTrigger>
                <SelectValue placeholder={t("পেজ নির্বাচন করুন", "Select a page")} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Object.entries(groupedTargets).map(([group, items]) => (
                  <div key={group}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group}
                    </div>
                    {items.map((item) => (
                      <SelectItem key={item.url} value={item.url}>
                        {t(item.labelBn, item.label)}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={addShortcut}
            disabled={!recordedKeys || !selectedTarget}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("শর্টকাট যোগ করুন", "Add Shortcut")}
          </Button>
        </CardContent>
      </Card>

      {/* Existing shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Command className="w-4 h-4" />
            {t("সংরক্ষিত শর্টকাট", "Saved Shortcuts")}
            {shortcuts.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{shortcuts.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shortcuts.length === 0 ? (
            <div className="text-center py-8">
              <Keyboard className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {t("কোনো শর্টকাট তৈরি করা হয়নি", "No shortcuts created yet")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("উপরে থেকে নতুন শর্টকাট তৈরি করুন", "Create a new shortcut above")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {shortcuts.map((sc) => {
                const target = ADMIN_MENU_TARGETS.find((m) => m.url === sc.targetUrl);
                return (
                  <div
                    key={sc.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 shrink-0">
                      {sc.label.split(" + ").map((k, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-xs px-2 py-0.5 border-primary/30 bg-primary/5">
                          {k}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-muted-foreground text-xs">→</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {target ? t(target.labelBn, target.label) : sc.targetLabel}
                      </p>
                      {target?.group && (
                        <p className="text-[10px] text-muted-foreground">{target.group}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => removeShortcut(sc.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            {t(
              "শর্টকাট শুধুমাত্র অ্যাডমিন প্যানেলে কাজ করবে। ইনপুট ফিল্ডে টাইপ করার সময় শর্টকাট নিষ্ক্রিয় থাকবে। সব ডেটা আপনার ব্রাউজারে সংরক্ষিত।",
              "Shortcuts only work within the admin panel. They are disabled while typing in input fields. All data is saved in your browser."
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
