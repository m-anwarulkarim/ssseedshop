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

  const [publicTheme, setPublicThemeState] = useState<ThemeMode>(() => {
    if (typeof localStorage === "undefined") return "leaf";
    return (localStorage.getItem(PUBLIC_THEME_KEY) as ThemeMode) || "leaf";
  });

  const [texture, setTextureState] = useState<TextureOption>(() => {
    if (typeof localStorage === "undefined") return "none";
    return (localStorage.getItem(TEXTURE_KEY) as TextureOption) || "none";
  });

  const [textureEnabled, setTextureEnabledState] = useState<boolean>(() => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(TEXTURE_ENABLED_KEY) === "1";
  });

  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const applyTheme = useCallback(() => {
    if (typeof document === "undefined") return;
    clearAllClasses();
    const active = isAdmin ? theme : publicTheme;
    const tc = themeClasses[active];
    if (tc) document.documentElement.classList.add(tc);
    if (!isAdmin && textureEnabled && texture !== "none") {
      const txc = textureClasses[texture];
      if (txc) document.documentElement.classList.add(txc);
    }
  }, [theme, publicTheme, isAdmin, texture, textureEnabled]);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  };

  const setPublicTheme = (t: ThemeMode) => {
    setPublicThemeState(t);
    localStorage.setItem(PUBLIC_THEME_KEY, t);
  };

  const setTexture = (t: TextureOption) => {
    setTextureState(t);
    localStorage.setItem(TEXTURE_KEY, t);
  };

  const setTextureEnabled = (v: boolean) => {
    setTextureEnabledState(v);
    localStorage.setItem(TEXTURE_ENABLED_KEY, v ? "1" : "0");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        publicTheme,
        setPublicTheme,
        texture,
        setTexture,
        textureEnabled,
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

