"use client";

import { createContext, useContext } from "react";
import { useTheme as useNextTheme } from "@/hooks/useTheme";

type ThemeProviderState = ReturnType<typeof useNextTheme>;

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useNextTheme();
  return (
    <ThemeProviderContext.Provider value={theme}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
