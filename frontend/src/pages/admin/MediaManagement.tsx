import { API_URL } from "@/config/env";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE = API_URL;
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileImage, Image, Video, FileText, Search, Trash2,
  ExternalLink, Loader2, FolderOpen, Upload, Copy, Check,
  Users, MessageSquare, ShoppingBag, LayoutGrid, Lock, X,
  ArrowUpDown, CalendarIcon, Download, UploadCloud,
} from "lucide-react";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { compressImageToWebP, generateWebPFileName } from "@/lib/imageCompressor";

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
  metadata: { size: number; mimetype: string };
  bucket: string;
  fullPath: string;
  url: string;
  category: "product" | "profile" | "chat" | "category";
}

type FolderTab = "all" | "product" | "profile" | "chat" | "category";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const FOLDER_CONFIG: { key: FolderTab; icon: any; labelBn: string; labelEn: string; color: string }[] = [
  { key: "all", icon: FolderOpen, labelBn: "সব ফাইল", labelEn: "All Files", color: "text-foreground" },
  { key: "product", icon: ShoppingBag, labelBn: "প্রোডাক্ট ছবি", labelEn: "Product Photos", color: "text-blue-500" },
  { key: "profile", icon: Users, labelBn: "প্রোফাইল ছবি", labelEn: "Profile Photos", color: "text-emerald-500" },
  { key: "chat", icon: MessageSquare, labelBn: "চ্যাট ফাইল", labelEn: "Chat Files", color: "text-purple-500" },
  { key: "category", icon: LayoutGrid, labelBn: "ক্যাটাগরি ছবি", labelEn: "Category Photos", color: "text-orange-500" },
];

export default function MediaManagement() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<FolderTab>("all");
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Selection & delete state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"single" | "bulk" | null>(null);
  const [singleDeleteFile, setSingleDeleteFile] = useState<StorageFile | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteVerifying, setDeleteVerifying] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const fileMap = new Map<string, StorageFile>();

      // 1. Fetch from PHP media/list.php
      try {
        const res = await fetch(`${API_BASE}/media/list.php?admin=1&_t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const listData = await res.json();
          if (Array.isArray(listData)) {
            listData.forEach((item: any) => {
              fileMap.set(item.url, {
                name: item.name,
                id: item.name,
                created_at: item.created_at || new Date().toISOString(),
                metadata: {
                  size: item.size || 0,
                  mimetype: item.mimetype || "image/webp",
                },
                bucket: "uploads",
                fullPath: item.name,
                url: item.url,
                category: "product",
              });
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch PHP media list", err);
      }

      // 2. Fetch image URLs from DB products table
      try {
        const pRes = await fetch(`${API_BASE}/products/get.php`);
        if (pRes.ok) {
          const pData = await pRes.json();
          const products = Array.isArray(pData) ? pData : (pData?.data || []);
          products.forEach((p: any) => {
            const urls: string[] = [];
            if (p.product_image) urls.push(p.product_image);
            if (p.image_gallery) {
              if (Array.isArray(p.image_gallery)) {
                urls.push(...p.image_gallery);
              } else if (typeof p.image_gallery === "string") {
                try {
                  const parsed = JSON.parse(p.image_gallery);
                  if (Array.isArray(parsed)) urls.push(...parsed);
                  else urls.push(...p.image_gallery.split(/[,|]/).filter(Boolean));
                } catch {
                  urls.push(...p.image_gallery.split(/[,|]/).filter(Boolean));
                }
              }
            }
            urls.forEach((u: string, idx: number) => {
              const cleanUrl = u.trim();
              if (!cleanUrl || fileMap.has(cleanUrl)) return;

              const rawName = cleanUrl.split("/").pop() || ("product-" + p.id + "-" + idx);
              const fileName = decodeURIComponent(rawName.split("?")[0]);
              fileMap.set(cleanUrl, {
                name: fileName,
                id: "db-p-" + p.id + "-" + idx,
                created_at: p.created_at || new Date().toISOString(),
                metadata: { size: 0, mimetype: "image/webp" },
                bucket: "products",
                fullPath: fileName,
                url: cleanUrl,
                category: "product",
              });
            });
          });
        }
      } catch (err) {
        console.warn("Failed to fetch products for media", err);
      }

      // 3. Fetch image URLs from DB categories table
      try {
        const catRes = await fetch(`${API_BASE}/categories/get.php`);
        if (catRes.ok) {
          const catData = await catRes.json();
          const categories = Array.isArray(catData) ? catData : (catData?.data || []);
          categories.forEach((c: any) => {
            if (!c.image) return;
            const cleanUrl = c.image.trim();
            if (!cleanUrl || fileMap.has(cleanUrl)) return;

            const rawName = cleanUrl.split("/").pop() || ("category-" + c.id);
            const fileName = decodeURIComponent(rawName.split("?")[0]);
            fileMap.set(cleanUrl, {
              name: fileName,
              id: "db-c-" + c.id,
              created_at: c.created_at || new Date().toISOString(),
              metadata: { size: 0, mimetype: "image/webp" },
              bucket: "categories",
              fullPath: fileName,
              url: cleanUrl,
              category: "category",
            });
          });
        }
      } catch (err) {
        console.warn("Failed to fetch categories for media", err);
      }

      setFiles(Array.from(fileMap.values()));
    } catch (err) {
      console.error("Error fetching media files:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Unique key for a file
  const fileKey = (f: StorageFile) => (f.bucket + "::" + f.name + "::" + f.url);

  const toggleSelect = (f: StorageFile) => {
    const key = fileKey(f);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    const allKeys = filteredFiles.map(fileKey);
    setSelected(new Set(allKeys));
  };

  const deselectAll = () => setSelected(new Set());

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  // Verify password and delete
  const verifyAndDelete = async () => {
    if (!deletePassword) return;
    setDeleteVerifying(true);

    try {
      const adminSessionStr = localStorage.getItem("admin_session");
      const adminSession = adminSessionStr ? JSON.parse(adminSessionStr) : null;
      const adminEmail = adminSession?.email || "ssseedshop220@gmail.com";

      // Verify admin password against auth/login.php
      const authRes = await fetch(`${API_BASE}/auth/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: deletePassword }),
      });
      const authData = await authRes.json();

      if (!authRes.ok || authData?.status !== "success") {
        toast.error(t("ভুল পাসওয়ার্ড!", "Wrong password!"));
        setDeleteVerifying(false);
        return;
      }

      if (deleteTarget === "single" && singleDeleteFile) {
        await fetch(`${API_BASE}/media/delete.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: singleDeleteFile.name }),
        });

        setFiles((prev) => prev.filter((f) => fileKey(f) !== fileKey(singleDeleteFile)));
        toast.success(t("ফাইল মুছে ফেলা হয়েছে", "File deleted"));
      } else if (deleteTarget === "bulk") {
        const targets = files.filter((f) => selected.has(fileKey(f)));
        for (const target of targets) {
          await fetch(`${API_BASE}/media/delete.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: target.name }),
          });
        }

        setFiles((prev) => prev.filter((f) => !selected.has(fileKey(f))));
        toast.success(t(targets.length + " টি ফাইল মুছে ফেলা হয়েছে", "Deleted " + targets.length + " files"));
        exitSelectMode();
      }
    } catch (err) {
      toast.error(t("ডিলিট ব্যর্থ হয়েছে", "Delete failed"));
    }

    setDeleteTarget(null);
    setSingleDeleteFile(null);
    setDeletePassword("");
    setDeleteVerifying(false);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(url);
    toast.success(t("URL কপি করা হয়েছে", "URL copied"));
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const filteredFiles = files
    .filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchesFolder = activeFolder === "all" || f.category === activeFolder;

      let matchesDate = true;
      if (dateFrom && f.created_at) {
        matchesDate = matchesDate && isAfter(new Date(f.created_at), startOfDay(dateFrom));
      }
      if (dateTo && f.created_at) {
        matchesDate = matchesDate && isBefore(new Date(f.created_at), endOfDay(dateTo));
      }

      return matchesSearch && matchesFolder && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "size-asc": return a.metadata.size - b.metadata.size;
        case "size-desc": return b.metadata.size - a.metadata.size;
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "date-asc": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "date-desc":
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const counts = {
    all: files.length,
    product: files.filter((f) => f.category === "product").length,
    profile: files.filter((f) => f.category === "profile").length,
    chat: files.filter((f) => f.category === "chat").length,
    category: files.filter((f) => f.category === "category").length,
  };

  const deleteDialogOpen = deleteTarget !== null;
  const deleteCount = deleteTarget === "bulk" ? selected.size : 1;
  const deleteFileName = deleteTarget === "single" ? singleDeleteFile?.name : null;

  const handleDownloadAll = async () => {
    const targetFiles = activeFolder === "all" ? files : files.filter(f => f.category === activeFolder);
    if (!targetFiles.length) { toast.info(t("কোনো ফাইল নেই", "No files")); return; }
    setDownloading(true);
    toast.info(t(targetFiles.length + " টি ফাইল ডাউনলোড করা হচ্ছে...", "Downloading " + targetFiles.length + " files..."));

    let count = 0;
    for (const f of targetFiles) {
      try {
        const res = await fetch(f.url);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = f.name;
        a.click();
        URL.revokeObjectURL(a.href);
        count++;
        await new Promise(r => setTimeout(r, 200));
      } catch { /* skip failed */ }
    }
    setDownloading(false);
    toast.success(t(count + " টি ফাইল ডাউনলোড সম্পন্ন হয়েছে", count + " files downloaded"));
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    let count = 0;
    for (const file of Array.from(fileList)) {
      try {
        let fileToUpload = file;
        if (file.type.startsWith("image/")) {
          fileToUpload = await compressImageToWebP(file);
        }
        const formData = new FormData();
        formData.append("file", fileToUpload, fileToUpload.name || file.name);

        const res = await fetch(`${API_BASE}/media/upload.php`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data?.status === "success") {
          count++;
        } else {
          console.error("Upload failed: " + file.name, data);
        }
      } catch (err) {
        console.error("Upload error: " + file.name, err);
      }
    }
    setUploading(false);
    if (count > 0) {
      toast.success(t(count + " টি ফাইল আপলোড হয়েছে", "Uploaded " + count + " files"));
      fetchFiles();
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Header with Download All & Upload All */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {!selectMode ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectMode(true)}>
                {t("সিলেক্ট", "Select")}
              </Button>
              <label>
                <Button size="sm" variant="default" className="gap-2 cursor-pointer" disabled={uploading} asChild>
                  <span>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {t("ফাইল আপলোড", "Upload File")}
                  </span>
                </Button>
                <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleBulkUpload} disabled={uploading} />
              </label>
              <Button size="sm" variant="outline" className="gap-2" onClick={handleDownloadAll} disabled={downloading || files.length === 0}>
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {t("সব ডাউনলোড", "Download All")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {t("সব সিলেক্ট", "Select All")} ({filteredFiles.length})
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                {t("আনসিলেক্ট", "Deselect All")}
              </Button>
              {selected.size > 0 && (
                <Button variant="destructive" size="sm" className="gap-2" onClick={() => setDeleteTarget("bulk")}>
                  <Trash2 className="w-4 h-4" />
                  {t("ডিলিট (" + selected.size + ")", "Delete (" + selected.size + ")")}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={exitSelectMode}>
                <X className="w-4 h-4 mr-1" />
                {t("বন্ধ করুন", "Cancel")}
              </Button>
            </>
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          {t("মোট " + counts.all + " টি মিডিয়া ফাইল", "Total " + counts.all + " media files")}
        </span>
      </div>

      {/* Folder Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {FOLDER_CONFIG.map((folder) => {
          const Icon = folder.icon;
          const isActive = activeFolder === folder.key;
          const count = counts[folder.key];

          return (
            <Card
              key={folder.key}
              className={"cursor-pointer transition-all border " + (
                isActive ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/50"
              )}
              onClick={() => setActiveFolder(folder.key)}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={"w-5 h-5 shrink-0 " + folder.color} />
                  <div className="truncate">
                    <p className="text-xs font-medium truncate">{t(folder.labelBn, folder.labelEn)}</p>
                    <p className="text-[10px] text-muted-foreground">{count} items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Controls: Search, Sort, Date Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("ফাইল খুঁজুন...", "Search files...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            <SelectValue placeholder={t("সাজান", "Sort")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc" className="text-xs">{t("নতুন প্রথম", "Newest first")}</SelectItem>
            <SelectItem value="date-asc" className="text-xs">{t("পুরাতন প্রথম", "Oldest first")}</SelectItem>
            <SelectItem value="name-asc" className="text-xs">{t("নাম (A-Z)", "Name (A-Z)")}</SelectItem>
            <SelectItem value="name-desc" className="text-xs">{t("নাম (Z-A)", "Name (Z-A)")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 text-xs justify-start font-normal", !dateFrom && "text-muted-foreground")}>
              <CalendarIcon className="w-3.5 h-3.5 mr-1" />
              {dateFrom ? format(dateFrom, "dd/MM/yyyy") : t("থেকে", "From")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 text-xs justify-start font-normal", !dateTo && "text-muted-foreground")}>
              <CalendarIcon className="w-3.5 h-3.5 mr-1" />
              {dateTo ? format(dateTo, "dd/MM/yyyy") : t("পর্যন্ত", "To")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>

        {/* Clear date filter */}
        {(dateFrom || dateTo) && (
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }} title={t("ফিল্টার মুছুন", "Clear filter")}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* File Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileImage className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? t("কোনো ফাইল পাওয়া যায়নি", "No files found") : t("এখনো কোনো ফাইল নেই", "No files yet")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredFiles.map((file) => {
            const isImage = file.metadata.mimetype?.startsWith("image/") ||
              /\.(jpg|jpeg|png|webp|gif|svg|avif)($|\?)/i.test(file.url) ||
              file.url.startsWith("http");
            const isVideo = file.metadata.mimetype?.startsWith("video/") || /\.(mp4|webm|ogg)($|\?)/i.test(file.url);
            const folderInfo = FOLDER_CONFIG.find((f) => f.key === file.category);
            const key = fileKey(file);
            const isSelected = selected.has(key);

            return (
              <Card
                key={key}
                className={"overflow-hidden transition-shadow group relative " + (
                  isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-md"
                )}
                onClick={selectMode ? () => toggleSelect(file) : undefined}
              >
                {/* Checkbox in select mode */}
                {selectMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(file)}
                      className="h-5 w-5 bg-background/80 backdrop-blur-sm border-2"
                    />
                  </div>
                )}

                <div className="aspect-square bg-muted/50 flex items-center justify-center overflow-hidden relative">
                  {isImage ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }} />
                  ) : isVideo ? (
                    <Video className="w-10 h-10 text-muted-foreground" />
                  ) : (
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  )}

                  {!selectMode && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleCopyUrl(file.url)}>
                        {copySuccess === file.url ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => {
                        setSingleDeleteFile(file);
                        setDeleteTarget("single");
                      }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}

                  {selectMode && isSelected && (
                    <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                  )}
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-medium text-foreground truncate" title={file.name}>{file.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{file.metadata.size ? formatBytes(file.metadata.size) : "Media"}</span>
                    <Badge variant="outline" className={"text-[9px] h-4 " + (folderInfo?.color || "")}>
                      {t(folderInfo?.labelBn || file.bucket, folderInfo?.labelEn || file.bucket)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete with Password Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        if (!open) { setDeleteTarget(null); setSingleDeleteFile(null); setDeletePassword(""); }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-destructive" />
              {t("ডিলিট করতে অ্যাডমিন পাসওয়ার্ড দিন", "Enter password to delete")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {deleteTarget === "single" && deleteFileName ? (
                  <p>
                    <span className="font-medium text-foreground">{deleteFileName}</span>
                    {" "}
                    {t("ফাইলটি স্থায়ীভাবে মুছে ফেলা হবে।", "This file will be permanently deleted.")}
                  </p>
                ) : (
                  <p className="text-destructive font-medium">
                    {deleteCount + " টি ফাইল স্থায়ীভাবে মুছে ফেলা হবে!"}
                  </p>
                )}
                <Input
                  type="password"
                  placeholder={t("এডমিন পাসওয়ার্ড", "Admin password")}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && deletePassword && verifyAndDelete()}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteVerifying}>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!deletePassword || deleteVerifying}
              onClick={verifyAndDelete}
              className="gap-2"
            >
              {deleteVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {deleteTarget === "bulk"
                ? t("ডিলিট (" + deleteCount + ")", "Delete (" + deleteCount + ")")
                : t("ডিলিট করুন", "Delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
