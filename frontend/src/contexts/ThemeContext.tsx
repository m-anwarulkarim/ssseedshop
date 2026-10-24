import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

export type ThemeMode = "light" | "dark" | "ocean" | "sunset" | "doodle" | "midnight" | "silver" | "rose" | "sky" | "leaf";
export type TextureOption = "none" | "bamboo" | "tropical" | "golden" | "shadow" | "wood";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  publicTheme: ThemeMode;
  setPublicTheme: (t: ThemeMode) => void;
  texture: TextureOption;
  setTexture: (t: TextureOption) => void;
  textureEnabled: boolean;
  setTextureEnabled: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "admin_theme";
const PUBLIC_THEME_KEY = "public_theme";
const TEXTURE_KEY = "public_texture";
const TEXTURE_ENABLED_KEY = "public_texture_enabled";

const themeClasses: Record<ThemeMode, string> = {
  light: "theme-light",
  dark: "dark",
  ocean: "theme-ocean",
  sunset: "theme-sunset",
  doodle: "theme-doodle",
  midnight: "theme-midnight",
  silver: "theme-silver",
  rose: "theme-rose",
  sky: "theme-sky",
  leaf: "theme-leaf",
};

const textureClasses: Record<TextureOption, string> = {
  none: "",
  bamboo: "texture-bamboo",
  tropical: "texture-tropical",
  golden: "texture-golden",
  shadow: "texture-shadow",
  wood: "texture-wood",
};

const ALL_THEME_CLASSES = Object.values(themeClasses).filter(Boolean);
const ALL_TEXTURE_CLASSES = Object.values(textureClasses).filter(Boolean);

function clearAllClasses() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  ALL_THEME_CLASSES.forEach(c => root.classList.remove(c));
  ALL_TEXTURE_CLASSES.forEach(c => root.classList.remove(c));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof localStorage === "undefined") return "leaf";
    try {
      const MIGRATION_KEY = "admin_theme_default_v2";
      if (!localStorage.getItem(MIGRATION_KEY)) {
        localStorage.setItem(THEME_KEY, "leaf");
        localStorage.setItem(MIGRATION_KEY, "1");
        return "leaf";
      }
    } catch {}
    return (localStorage.getItem(THEME_KEY) as ThemeMode) || "leaf";
  });

  const [publicTheme] = useState<ThemeMode>("leaf");

  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  // Clean up any legacy public theme/texture keys from storage
  useEffect(() => {
    try {
      localStorage.removeItem(TEXTURE_KEY);
      localStorage.removeItem(TEXTURE_ENABLED_KEY);
      localStorage.removeItem(PUBLIC_THEME_KEY);
    } catch {}
  }, []);

  const applyTheme = useCallback(() => {
    if (typeof document === "undefined") return;
    clearAllClasses();
    const active = isAdmin ? theme : "leaf";
    const tc = themeClasses[active];
    if (tc) document.documentElement.classList.add(tc);
  }, [theme, isAdmin]);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  };

  const setPublicTheme = () => {};
  const setTexture = () => {};
  const setTextureEnabled = () => {};

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        publicTheme,
        setPublicTheme,
        texture: "none",
        setTexture,
        textureEnabled: false,
        setTextureEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "light",
      setTheme: () => {},
      publicTheme: "light",
      setPublicTheme: () => {},
      texture: "none",
      setTexture: () => {},
      textureEnabled: false,
      setTextureEnabled: () => {},
    };
  }
  return ctx;
}

