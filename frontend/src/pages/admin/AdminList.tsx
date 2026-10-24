import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus, Star, Shield, UserCog, Trash2, ChevronDown, Loader2, Pencil,
  LayoutDashboard, Eye, BarChart3, TrendingUp, Megaphone,
  Package, ListOrdered, BookOpen, Gift, MessageSquare,
  ShoppingCart, Search, ClipboardList, CalendarClock,
  Users, UsersRound, Globe, Code, FileImage,
  Settings, Palette, Languages, MousePointer2, User,
  Headphones, AlertTriangle, ArrowUpDown, Warehouse, Smartphone,
  BellRing, UploadCloud,
} from "lucide-react";
import { compressAvatarImage } from "@/lib/imageCompressor";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
  is_super_admin?: boolean;
  permissions: string[];
  user_metadata: Record<string, any>;
}

const SUPER_ADMIN_EMAIL = "admin@ssseedshop.com";

const isSuperAdminUser = (admin?: AdminUser | { email?: string; is_super_admin?: boolean } | null) => {
  if (!admin) return false;
  return admin.email === "admin@ssseedshop.com" || admin.email === SUPER_ADMIN_EMAIL || admin.is_super_admin === true;
};

const menuStructure = [
  {
    key: "dashboard",
    label: "ড্যাশবোর্ড",
    icon: LayoutDashboard,
    children: [
      { key: "overview", label: "ওভারভিউ", icon: Eye },
    ],
  },
  {
    key: "support",
    label: "কাস্টমার সাপোর্ট",
    icon: Headphones,
    children: [],
  },
  {
    key: "products",
    label: "পণ্য",
    icon: Package,
    children: [
      { key: "product-list", label: "পণ্য তালিকা", icon: ListOrdered },
      { key: "categories", label: "ক্যাটাগরি", icon: BookOpen },
    ],
  },
  {
    key: "orders",
    label: "অর্ডার",
    icon: ShoppingCart,
    children: [
      { key: "orders-create", label: "নতুন তৈরি", icon: Plus },
      { key: "orders-search", label: "সার্চ", icon: Search },
      { key: "orders-web", label: "ওয়েব অর্ডার", icon: ClipboardList },
      { key: "orders-pre", label: "প্রি-অর্ডার", icon: CalendarClock },
      { key: "orders-list", label: "অর্ডার তালিকা", icon: ClipboardList },
      { key: "orders-deleted", label: "মুছে ফেলা", icon: Trash2 },
    ],
  },
  {
    key: "users",
    label: "ইউজার",
    icon: Users,
    children: [
      { key: "users-admins", label: "অ্যাডমিন", icon: UserCog },
      { key: "users-customers", label: "কাস্টমার", icon: UsersRound },
    ],
  },
  {
    key: "website",
    label: "ওয়েবসাইট",
    icon: Globe,
    children: [
      { key: "website-api", label: "API", icon: Code },
      { key: "website-media", label: "মিডিয়া", icon: FileImage },
      { key: "settings-import-export", label: "ইমপোর্ট/এক্সপোর্ট", icon: ArrowUpDown },
      { key: "website-meta-go", label: "Meta Go", icon: Globe },
    ],
  },
  {
    key: "settings",
    label: "সেটিংস",
    icon: Settings,
    children: [
      { key: "settings-theme", label: "থিম", icon: Palette },
      { key: "settings-language", label: "ভাষা", icon: Languages },
      { key: "settings-cursor", label: "কার্সর ইফেক্ট", icon: MousePointer2 },
      { key: "settings-menu", label: "মেনু কন্ট্রোল", icon: Settings },
      { key: "settings-shortcuts", label: "কীবোর্ড শর্টকাট", icon: Settings },
      { key: "settings-order-control", label: "অর্ডার কন্ট্রোল", icon: Settings },
    ],
  },
  {
    key: "notifications",
    label: "নোটিফিকেশন",
    icon: BellRing,
    children: [
      { key: "notifications-orders", label: "অর্ডার স্ট্যাটাস", icon: ShoppingCart },
      { key: "notifications-sms", label: "SMS লগ", icon: Smartphone },
      { key: "notifications-push", label: "পুশ ব্রডকাস্ট", icon: BellRing },
    ],
  },
];
export default function AdminList() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editIdCard, setEditIdCard] = useState("");
  const [editJoinDate, setEditJoinDate] = useState("");
  const [editRole, setEditRole] = useState("moderator");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newIdCard, setNewIdCard] = useState("");
  const [newJoinDate, setNewJoinDate] = useState("");
  const newRole = "moderator";
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  const handleUploadAdminPhoto = async (file: File, isEdit: boolean) => {
    if (!file) return;
    setPhotoUploading(true);
    try {
      const compressed = await compressAvatarImage(file);
      const formData = new FormData();
      formData.append("file", compressed, compressed.name || "admin_avatar.webp");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${apiUrl}/media/upload.php`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data?.status === "success" && data?.url) {
        if (isEdit) {
          setEditPhotoUrl(data.url);
        } else {
          setNewPhotoUrl(data.url);
        }
        toast.success(t("ছবি WebP ফরম্যাটে অপ্টিমাইজ ও আপলোড হয়েছে", "Photo optimized as WebP and uploaded"));
      } else {
        toast.error(data?.message || t("ছবি আপলোড ব্যর্থ হয়েছে", "Photo upload failed"));
      }
    } catch {
      toast.error(t("ছবি আপলোড ব্যর্থ হয়েছে", "Photo upload failed"));
    } finally {
      setPhotoUploading(false);
    }
  };

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admin-list"],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${apiUrl}/admin/manage.php?action=list`);
      if (!res.ok) throw new Error("Failed to fetch admins");
      const result = await res.json();
      if (Array.isArray(result)) return result as AdminUser[];
      return [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${apiUrl}/admin/manage.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          email: newEmail,
          password: newPassword,
          name: newName,
          photo_url: newPhotoUrl,
          id_card: newIdCard,
          join_date: newJoinDate,
          role: newRole,
          permissions: selectedPermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "অ্যাডমিন তৈরি ব্যর্থ হয়েছে");
      return data;
    },
    onSuccess: () => {
      toast.success("নতুন অ্যাডমিন তৈরি হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-list"] });
      setCreateOpen(false);
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewPhotoUrl(""); setNewIdCard(""); setNewJoinDate(""); setSelectedPermissions([]);
    },
    onError: (e: any) => toast.error(e.message || "ত্রুটি হয়েছে"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${apiUrl}/admin/manage.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "অ্যাডমিন মুছতে ব্যর্থ হয়েছে");
      return data;
    },
    onSuccess: () => {
      toast.success("অ্যাডমিন মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-list"] });
    },
    onError: (e: any) => toast.error(e.message || "ত্রুটি হয়েছে"),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingAdmin) return;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8005";
      const res = await fetch(`${apiUrl}/admin/manage.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          user_id: editingAdmin.id,
          name: editName,
          photo_url: editPhotoUrl,
          id_card: editIdCard,
          join_date: editJoinDate,
          role: editRole,
          permissions: editPermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "অ্যাডমিন আপডেট ব্যর্থ হয়েছে");
      return data;
    },
    onSuccess: () => {
      toast.success("অ্যাডমিন আপডেট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-list"] });
      setEditOpen(false);
      setEditingAdmin(null);
    },
    onError: (e: any) => toast.error(e.message || "ত্রুটি হয়েছে"),
  });

  const openEditDialog = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditName(admin.user_metadata?.full_name || "");
    setEditPhotoUrl(admin.user_metadata?.avatar_url || "");
    setEditIdCard(admin.user_metadata?.id_card || "");
    setEditJoinDate(admin.user_metadata?.join_date || "");
    setEditRole(admin.role);
    setEditPermissions(admin.permissions || []);
    setEditOpen(true);
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const toggleMenuGroup = (menu: typeof menuStructure[0]) => {
    const childKeys = menu.children.map((c) => c.key);
    const allSelected = childKeys.every((k) => selectedPermissions.includes(k));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !childKeys.includes(p)));
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...childKeys])]);
    }
  };

  const toggleEditPermission = (key: string) => {
    setEditPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const toggleEditMenuGroup = (menu: typeof menuStructure[0]) => {
    const childKeys = menu.children.map((c) => c.key);
    const allSelected = childKeys.every((k) => editPermissions.includes(k));
    if (allSelected) {
      setEditPermissions((prev) => prev.filter((p) => !childKeys.includes(p)));
    } else {
      setEditPermissions((prev) => [...new Set([...prev, ...childKeys])]);
    }
  };

  const getRoleBadge = (role: string, email: string, adminObj?: any) => {
    const isSuperAdmin = isSuperAdminUser(adminObj || { email });
    if (isSuperAdmin) {
      return (
        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0 gap-1">
          <Star className="w-3 h-3 fill-white" /> Super Admin
        </Badge>
      );
    }
    if (role === "admin") {
      return <Badge variant="destructive" className="gap-1"><Shield className="w-3 h-3" /> Admin</Badge>;
    }
    return <Badge variant="secondary" className="gap-1"><UserCog className="w-3 h-3" /> Moderator</Badge>;
  };

  const sortedAdmins = [...admins]
    .filter((a) => {
      const email = (a.email || "").toLowerCase().trim();
      const id = (a.id || "").toLowerCase().trim();
      return email !== "hngarden@gmail.com" && id !== "admin_super_002";
    })
    .sort((a, b) => {
    const aIsSuper = isSuperAdminUser(a);
    const bIsSuper = isSuperAdminUser(b);
    if (aIsSuper && !bIsSuper) return -1;
    if (!aIsSuper && bIsSuper) return 1;
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (b.role === "admin" && a.role !== "admin") return 1;
    return 0;
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t("নতুন মডারেটর", "New Moderator")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("নতুন মডারেটর তৈরি করুন", "Create New Moderator")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("নাম", "Name")}</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Admin Name" />
                </div>
                <div className="space-y-2">
                  <Label>{t("ছবি URL", "Photo URL")}</Label>
                  <div className="flex gap-2 items-center">
                    <Input value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadAdminPhoto(f, false);
                        e.target.value = "";
                      }} disabled={photoUploading} />
                      <Button type="button" variant="outline" size="sm" className="gap-1.5 h-9 shrink-0" disabled={photoUploading} asChild>
                        <span>
                          {photoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          {t("আপলোড", "Upload")}
                        </span>
                      </Button>
                    </label>
                  </div>
                  {newPhotoUrl && (
                    <div className="flex items-center gap-2 mt-1">
                      <img src={newPhotoUrl} alt="Preview" className="w-7 h-7 rounded-full object-cover border" />
                      <span className="text-[11px] text-muted-foreground">{t("প্রিভিউ (WebP)", "Preview (WebP)")}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("আইডি কার্ড নম্বর", "ID Card Number")}</Label>
                  <Input value={newIdCard} onChange={(e) => setNewIdCard(e.target.value)} placeholder="e.g. AB-001" />
                </div>
                <div className="space-y-2">
                  <Label>{t("যোগদানের তারিখ", "Join Date")}</Label>
                  <Input type="date" value={newJoinDate} onChange={(e) => setNewJoinDate(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="admin@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                </div>
              </div>


              <div className="space-y-2">
                <Label className="text-base font-semibold">{t("মেনু পারমিশন", "Menu Permissions")}</Label>
                <div className="border rounded-lg divide-y">
                  {menuStructure.map((menu) => {
                    const childKeys = menu.children.map((c) => c.key);
                    const allSelected = childKeys.every((k) => selectedPermissions.includes(k));
                    const someSelected = childKeys.some((k) => selectedPermissions.includes(k));
                    const MenuIcon = menu.icon;

                    return (
                      <Collapsible key={menu.key}>
                        <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50">
                          <Checkbox
                            checked={allSelected}
                            // @ts-ignore
                            indeterminate={someSelected && !allSelected}
                            onCheckedChange={() => toggleMenuGroup(menu)}
                          />
                          <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-sm font-medium">
                            <MenuIcon className="w-4 h-4 text-muted-foreground" />
                            {menu.label}
                            <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                          <div className="pl-10 pr-3 pb-2 space-y-1.5">
                            {menu.children.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <label key={child.key} className="flex items-center gap-2 py-1 cursor-pointer hover:text-primary text-sm">
                                  <Checkbox
                                    checked={selectedPermissions.includes(child.key)}
                                    onCheckedChange={() => togglePermission(child.key)}
                                  />
                                  <ChildIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                  {child.label}
                                </label>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={() => createMutation.mutate()}
                disabled={!newEmail || !newPassword || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {t("মডারেটর তৈরি করুন", "Create Moderator")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>{t("ছবি", "Photo")}</TableHead>
                <TableHead>{t("নাম / ইমেইল", "Name / Email")}</TableHead>
                <TableHead>{t("রোল", "Role")}</TableHead>
                <TableHead>{t("পারমিশন", "Permissions")}</TableHead>
                <TableHead>{t("যোগদান", "Joined")}</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAdmins.map((admin, i) => {
                const isSuperAdmin = isSuperAdminUser(admin);
                return (
                  <TableRow key={admin.id} className={isSuperAdmin ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                          {admin.user_metadata?.avatar_url ? (
                            <img src={admin.user_metadata.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        {isSuperAdmin && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500 absolute -top-1 -right-1" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {admin.user_metadata?.full_name || admin.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                        {admin.user_metadata?.id_card && (
                          <p className="text-[10px] text-primary font-mono">ID: {admin.user_metadata.id_card}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 font-mono">{admin.id?.slice(0, 8) || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(admin.role, admin.email, admin)}</TableCell>
                    <TableCell>
                      {isSuperAdmin ? (
                        <span className="text-xs text-amber-600 font-medium">{t("সকল অ্যাক্সেস", "Full Access")}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {admin.permissions?.length || 0} {t("মেনু", "menus")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {admin.user_metadata?.join_date
                        ? format(new Date(admin.user_metadata.join_date), "dd MMM yyyy")
                        : format(new Date(admin.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => openEditDialog(admin)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedAdmins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t("কোনো অ্যাডমিন পাওয়া যায়নি", "No admins found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Admin Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("অ্যাডমিন সম্পাদনা", "Edit Admin")}</DialogTitle>
          </DialogHeader>
          {editingAdmin && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("নাম", "Name")}</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Admin Name" />
                </div>
                <div className="space-y-2">
                  <Label>{t("ছবি URL", "Photo URL")}</Label>
                  <div className="flex gap-2 items-center">
                    <Input value={editPhotoUrl} onChange={(e) => setEditPhotoUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadAdminPhoto(f, true);
                        e.target.value = "";
                      }} disabled={photoUploading} />
                      <Button type="button" variant="outline" size="sm" className="gap-1.5 h-9 shrink-0" disabled={photoUploading} asChild>
                        <span>
                          {photoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          {t("আপলোড", "Upload")}
                        </span>
                      </Button>
                    </label>
                  </div>
                  {editPhotoUrl && (
                    <div className="flex items-center gap-2 mt-1">
                      <img src={editPhotoUrl} alt="Preview" className="w-7 h-7 rounded-full object-cover border" />
                      <span className="text-[11px] text-muted-foreground">{t("প্রিভিউ (WebP)", "Preview (WebP)")}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("আইডি কার্ড নম্বর", "ID Card Number")}</Label>
                  <Input value={editIdCard} onChange={(e) => setEditIdCard(e.target.value)} placeholder="e.g. AB-001" />
                </div>
                <div className="space-y-2">
                  <Label>{t("যোগদানের তারিখ", "Join Date")}</Label>
                  <Input type="date" value={editJoinDate} onChange={(e) => setEditJoinDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editingAdmin.email} disabled className="bg-muted" />
              </div>

              {!isSuperAdminUser(editingAdmin) && (
                <div className="space-y-2">
                  <Label>{t("রোল", "Role")}</Label>
                  <Select value={editRole} onValueChange={setEditRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!isSuperAdminUser(editingAdmin) && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">{t("মেনু পারমিশন", "Menu Permissions")}</Label>
                  <div className="border rounded-lg divide-y">
                    {menuStructure.map((menu) => {
                      const childKeys = menu.children.map((c) => c.key);
                      const allSelected = childKeys.every((k) => editPermissions.includes(k));
                      const someSelected = childKeys.some((k) => editPermissions.includes(k));
                      const MenuIcon = menu.icon;

                      return (
                        <Collapsible key={menu.key}>
                          <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50">
                            <Checkbox
                              checked={allSelected}
                              // @ts-ignore
                              indeterminate={someSelected && !allSelected}
                              onCheckedChange={() => toggleEditMenuGroup(menu)}
                            />
                            <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-sm font-medium">
                              <MenuIcon className="w-4 h-4 text-muted-foreground" />
                              {menu.label}
                              <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                            </CollapsibleTrigger>
                          </div>
                          <CollapsibleContent>
                            <div className="pl-10 pr-3 pb-2 space-y-1.5">
                              {menu.children.map((child) => {
                                const ChildIcon = child.icon;
                                return (
                                  <label key={child.key} className="flex items-center gap-2 py-1 cursor-pointer hover:text-primary text-sm">
                                    <Checkbox
                                      checked={editPermissions.includes(child.key)}
                                      onCheckedChange={() => toggleEditPermission(child.key)}
                                    />
                                    <ChildIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                    {child.label}
                                  </label>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {t("সেভ করুন", "Save")}
                </Button>

                {!isSuperAdminUser(editingAdmin) && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm("এই অ্যাডমিন মুছে ফেলবেন? এটি ফেরত আনা যাবে না।")) {
                        deleteMutation.mutate(editingAdmin.id);
                        setEditOpen(false);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t("মুছুন", "Delete")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
