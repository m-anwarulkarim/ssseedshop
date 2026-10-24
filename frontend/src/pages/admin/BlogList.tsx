import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, BookOpen, X, FolderOpen, ExternalLink, EyeOff, Eye } from "lucide-react";
import { MediaPickerDialog } from "@/components/admin/MediaPickerDialog";
import RichTextEditor from "@/components/admin/RichTextEditor";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8005";

interface BlogFormData {
  title: string;
  slug: string;
  cover_image: string;
  excerpt: string;
  content: string;
  category: string;
  is_published: boolean;
  position: number;
}

const emptyForm: BlogFormData = {
  title: "", slug: "", cover_image: "", excerpt: "", content: "", category: "", is_published: true, position: 0,
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\u0980-\u09FF\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

export default function BlogList() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormData>(emptyForm);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  const { data: blogs, isLoading } = useQuery({
    queryKey: ["blogs-admin"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE}/blogs/get.php`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Error fetching blogs:", err);
        return [];
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: BlogFormData & { id?: string }) => {
      const payload = {
        id: data.id,
        title: data.title,
        slug: data.slug || slugify(data.title),
        cover_image: data.cover_image || null,
        excerpt: data.excerpt || null,
        content: data.content,
        category: data.category?.trim() || null,
        is_published: data.is_published,
        position: data.position,
      };

      const res = await fetch(`${API_BASE}/blogs/save.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!result.success && result.status !== "success") {
        throw new Error(result.error || "ব্লগ সেভ করতে ব্যর্থ হয়েছে");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["blogs-public"] });
      toast.success(editingId ? "ব্লগ আপডেট হয়েছে" : "ব্লগ তৈরি হয়েছে");
      closeDialog();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/blogs/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!result.success && result.status !== "success") {
        throw new Error(result.error || "ব্লগ ডিলিট করতে ব্যর্থ হয়েছে");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["blogs-public"] });
      toast.success("মুছে ফেলা হয়েছে");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (b: any) => {
    setEditingId(b.id);
    setForm({
      title: b.title, slug: b.slug, cover_image: b.cover_image || "",
      excerpt: b.excerpt || "", content: b.content || "",
      category: b.category || "",
      is_published: b.is_published, position: b.position || 0,
    });
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditingId(null); setForm(emptyForm); };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("ব্লগের শিরোনাম দিন"); return; }
    if (!form.content.trim()) { toast.error("ব্লগের কনটেন্ট দিন"); return; }
    saveMutation.mutate({ ...form, id: editingId || undefined });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> ব্লগ ম্যানেজমেন্ট
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            /services পেজে এই ব্লগগুলো দেখানো হবে
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> নতুন ব্লগ
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !blogs?.length ? (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>এখনো কোনো ব্লগ নেই</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((b: any) => (
            <div key={b.id} className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all">
              <div className="aspect-[16/10] bg-muted overflow-hidden">
                {b.cover_image ? (
                  <img src={b.cover_image} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{b.position || 0}</span>
                  {b.is_published ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600"><Eye className="w-3 h-3" /> প্রকাশিত</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground"><EyeOff className="w-3 h-3" /> খসড়া</span>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-foreground line-clamp-2">{b.title}</h3>
                {b.excerpt && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{b.excerpt}</p>}
                <div className="flex items-center gap-1 mt-3">
                  <a
                    href={`/services/${b.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="পেজ দেখুন"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ব্লগ মুছে ফেলবেন?</AlertDialogTitle>
                        <AlertDialogDescription>"{b.title}" মুছে ফেলা হবে।</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(b.id)}>মুছে ফেলুন</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "ব্লগ সম্পাদনা" : "নতুন ব্লগ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>শিরোনাম *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })}
                placeholder="ব্লগের শিরোনাম"
              />
            </div>
            <div>
              <Label>স্লাগ (URL)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                placeholder="auto-generated"
              />
              <p className="text-[10px] text-muted-foreground mt-1">URL: /services/{form.slug || "your-slug"}</p>
            </div>
            <div>
              <Label>ক্যাটাগরি লেবেল (pill)</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="যেমন: ফসল পরিচর্যা, পোকা দমন, ছাদ বাগান"
              />
              <p className="text-[10px] text-muted-foreground mt-1">কার্ডের উপরে ছোট ট্যাগ হিসেবে দেখাবে</p>
            </div>
            <div>
              <Label>সংক্ষিপ্ত বিবরণ (excerpt)</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="তালিকায় দেখানোর জন্য ছোট সারাংশ"
                rows={2}
              />
            </div>
            <div>
              <Label>কভার ছবি</Label>
              <div className="mt-2 flex items-center gap-3">
                {form.cover_image ? (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={form.cover_image} alt="cover" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm({ ...form, cover_image: "" })} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setImagePickerOpen(true)}
                    className="flex flex-col items-center justify-center w-32 h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <FolderOpen className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">নির্বাচন</span>
                  </button>
                )}
              </div>
              <MediaPickerDialog
                open={imagePickerOpen}
                onOpenChange={setImagePickerOpen}
                onSelect={(url) => setForm({ ...form, cover_image: url })}
              />
            </div>
            <div>
              <Label>কনটেন্ট *</Label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="ব্লগের পূর্ণ লেখা..."
                className="mt-1"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                লেখা সিলেক্ট করে বোল্ড, কালার, হাইলাইট বা শিরোনাম প্রয়োগ করুন
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>পজিশন</Label>
                <Input
                  type="number"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                  <Label className="!mt-0">{form.is_published ? "প্রকাশিত" : "খসড়া"}</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>বাতিল</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? "আপডেট" : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
