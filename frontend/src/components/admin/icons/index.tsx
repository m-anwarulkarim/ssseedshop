import * as Pop from "./pop";
import * as Lucide from "lucide-react";
import {
  SquaresFour, Package as PhPackage, Users as PhUsers, ShoppingCart as PhShoppingCart,
  Plus as PhPlus, MagnifyingGlass, ClipboardText, Trash as PhTrash, Globe as PhGlobe,
  Gear, Palette as PhPalette, Translate, Eye as PhEye, CaretDown, CursorClick,
  Headphones as PhHeadphones, UserGear, UsersThree, Code as PhCode, FileImage as PhFileImage,
  Pulse, ShareNetwork, ListNumbers, BookOpen as PhBookOpen, CalendarBlank,
  ArrowsDownUp, BellRinging, ArrowsLeftRight, Keyboard as PhKeyboard, SignOut, Truck as PhTruck,
} from "@phosphor-icons/react";
import { useIconPack } from "@/contexts/IconPackContext";
import { ComponentType } from "react";

type IconProps = { className?: string };

const phosphorMap: Record<string, ComponentType<any>> = {
  LayoutDashboard: SquaresFour,
  Package: PhPackage,
  Users: PhUsers,
  ShoppingCart: PhShoppingCart,
  Plus: PhPlus,
  Search: MagnifyingGlass,
  ClipboardList: ClipboardText,
  Trash2: PhTrash,
  Globe: PhGlobe,
  Settings: Gear,
  Palette: PhPalette,
  Languages: Translate,
  Eye: PhEye,
  ChevronDown: CaretDown,
  MousePointer2: CursorClick,
  Headphones: PhHeadphones,
  UserCog: UserGear,
  UsersRound: UsersThree,
  Code: PhCode,
  FileImage: PhFileImage,
  Activity: Pulse,
  Share2: ShareNetwork,
  ListOrdered: ListNumbers,
  BookOpen: PhBookOpen,
  CalendarClock: CalendarBlank,
  ArrowUpDown: ArrowsDownUp,
  BellRing: BellRinging,
  ChevronsLeftRight: ArrowsLeftRight,
  Keyboard: PhKeyboard,
  LogOut: SignOut,
  Truck: PhTruck,
};

const ICON_NAMES = [
  "LayoutDashboard","Package","Users","ShoppingCart","Plus","Search",
  "ClipboardList","Trash2","Globe","Settings","Palette","Languages","Eye",
  "ChevronDown","MousePointer2","Headphones","UserCog","UsersRound","Code",
  "FileImage","Activity","Share2","ListOrdered","BookOpen","CalendarClock",
  "ArrowUpDown","BellRing","ChevronsLeftRight","Keyboard","LogOut","Truck",
] as const;

function makeIcon(name: string) {
  const Wrapped = (props: IconProps) => {
    const { pack } = useIconPack();
    if (pack === "pop") {
      const C = (Pop as any)[name];
      if (C) return <C {...props} />;
    }
    if (pack === "outline") {
      const C = (Lucide as any)[name];
      if (C) return <C {...props} />;
    }
    const Ph = phosphorMap[name];
    if (Ph) {
      let weight: "bold" | "fill" | "duotone" = "duotone";
      let extraClass = "";
      if (pack === "bold") weight = "bold";
      else if (pack === "fill") weight = "fill";
      else if (pack === "duotone") weight = "duotone";
      else if (pack === "vibrant") { weight = "duotone"; extraClass = `icon-vibrant icon-vibrant-${name}`; }
      const cls = [props.className, extraClass].filter(Boolean).join(" ");
      return <Ph className={cls} weight={weight} />;
    }
    const F = (Pop as any)[name] || (Lucide as any)[name];
    return F ? <F {...props} /> : null;
  };
  Wrapped.displayName = `Icon(${name})`;
  return Wrapped;
}

const exported: Record<string, ComponentType<IconProps>> = {};
ICON_NAMES.forEach(n => { exported[n] = makeIcon(n); });

export const LayoutDashboard = exported.LayoutDashboard;
export const Package = exported.Package;
export const Users = exported.Users;
export const ShoppingCart = exported.ShoppingCart;
export const Plus = exported.Plus;
export const Search = exported.Search;
export const ClipboardList = exported.ClipboardList;
export const Trash2 = exported.Trash2;
export const Globe = exported.Globe;
export const Settings = exported.Settings;
export const Palette = exported.Palette;
export const Languages = exported.Languages;
export const Eye = exported.Eye;
export const ChevronDown = exported.ChevronDown;
export const MousePointer2 = exported.MousePointer2;
export const Headphones = exported.Headphones;
export const UserCog = exported.UserCog;
export const UsersRound = exported.UsersRound;
export const Code = exported.Code;
export const FileImage = exported.FileImage;
export const Activity = exported.Activity;
export const Share2 = exported.Share2;
export const ListOrdered = exported.ListOrdered;
export const BookOpen = exported.BookOpen;
export const CalendarClock = exported.CalendarClock;
export const ArrowUpDown = exported.ArrowUpDown;
export const BellRing = exported.BellRing;
export const ChevronsLeftRight = exported.ChevronsLeftRight;
export const Keyboard = exported.Keyboard;
export const LogOut = exported.LogOut;
export const Truck = exported.Truck;
