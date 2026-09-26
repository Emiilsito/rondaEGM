"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY, type ThemeId } from "@/lib/themes";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("club");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    const next: ThemeId =
      saved === "arena" || saved === "candy" || saved === "club"
        ? saved
        : "club";
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    if (!saved) localStorage.setItem(THEME_STORAGE_KEY, "club");
    setReady(true);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
    document.documentElement.dataset.theme = id;
    localStorage.setItem(THEME_STORAGE_KEY, id);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, ready }),
    [theme, setTheme, ready],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
