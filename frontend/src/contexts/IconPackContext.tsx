import { createContext, useContext, ReactNode, useState, useEffect } from "react";

export type IconPack = "pop" | "outline" | "bold" | "duotone" | "fill" | "vibrant";

interface IconPackContextType {
  pack: IconPack;
  setPack: (p: IconPack) => void;
}

const IconPackContext = createContext<IconPackContextType | undefined>(undefined);

const KEY = "admin_icon_pack";

export function IconPackProvider({ children }: { children: ReactNode }) {
  const [pack, setPackState] = useState<IconPack>(() => {
    if (typeof localStorage === "undefined") return "outline";
    try {
      const MIGRATION_KEY = "admin_icon_pack_default_v2";
      if (!localStorage.getItem(MIGRATION_KEY)) {
        localStorage.setItem(KEY, "outline");
        localStorage.setItem(MIGRATION_KEY, "1");
        return "outline";
      }
    } catch {}
    return (localStorage.getItem(KEY) as IconPack) || "outline";
  });

  const setPack = (p: IconPack) => {
    setPackState(p);
    try { localStorage.setItem(KEY, p); } catch {}
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setPackState(e.newValue as IconPack);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <IconPackContext.Provider value={{ pack, setPack }}>
      {children}
    </IconPackContext.Provider>
  );
}

export function useIconPack(): IconPackContextType {
  const ctx = useContext(IconPackContext);
  if (!ctx) return { pack: "pop", setPack: () => {} };
  return ctx;
}
