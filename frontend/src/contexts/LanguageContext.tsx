import { createContext, useContext, ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";

export type LangMode = "bn" | "en";

interface LanguageContextType {
  lang: LangMode;
  setLang: (l: LangMode) => void;
  t: <T>(bn: T, en: T) => T;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_KEY = "admin_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [storedLang, setStoredLang] = useState<LangMode>(() => {
    if (typeof localStorage === "undefined") return "bn";
    return (localStorage.getItem(LANG_KEY) as LangMode) || "bn";
  });

  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  // Both admin and customer pages now honor the stored language preference
  const activeLang: LangMode = storedLang;


  const setLang = (l: LangMode) => {
    setStoredLang(l);
    localStorage.setItem(LANG_KEY, l);
  };

  const t = <T,>(bn: T, en: T): T => (activeLang === "en" ? en : bn);

  return (
    <LanguageContext.Provider value={{ lang: activeLang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
