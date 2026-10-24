import { Home, LayoutGrid, ClipboardList, Sprout, UserRoundCog, HelpCircle, ShoppingCart, Tag, Star, Gift, Phone, Info, Mail, Heart, Package, BookOpen, type LucideIcon } from "lucide-react";

export const NAVBAR_ICONS: Record<string, LucideIcon> = {
  Home,
  LayoutGrid,
  ClipboardList,
  Sprout,
  UserRoundCog,
  HelpCircle,
  ShoppingCart,
  Tag,
  Star,
  Gift,
  Phone,
  Info,
  Mail,
  Heart,
  Package,
  BookOpen,
};

export const NAVBAR_ICON_NAMES = Object.keys(NAVBAR_ICONS);

export const DEFAULT_NAVBAR_ITEMS = [
  { label: "হোম", href: "/", icon: "Home" },
  { label: "সকল পণ্য", href: "/products", icon: "ClipboardList" },
  { label: "ক্যাটাগরি", href: "/categories", icon: "LayoutGrid" },
  { label: "একাউন্ট", href: "/profile", icon: "UserRoundCog" },
  { label: "সাহায্য", href: "/help", icon: "HelpCircle" },
];
