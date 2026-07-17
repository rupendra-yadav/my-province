// context/ThemeContext.tsx
// Wrap the app root with <ThemeProvider>. Every screen/component pulls styling
// via useTheme() instead of importing constants/theme.ts directly — this is
// what makes dark mode and future re-theming a one-file change.

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { Appearance, useColorScheme as useSystemColorScheme } from 'react-native';
import {
  lightColors,
  darkColors,
  spacing,
  radius,
  typography,
  shadow,
  gradients,
  motion,
  ThemeColors,
} from '../constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadow: typeof shadow;
  gradients: typeof gradients;
  motion: typeof motion;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const resolvedScheme = mode === 'system' ? systemScheme ?? 'light' : mode;
  const isDark = resolvedScheme === 'dark';

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const current = prev === 'system' ? (systemScheme ?? 'light') : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      spacing,
      radius,
      typography,
      shadow,
      gradients,
      motion,
      isDark,
      mode,
      setMode,
      toggleMode,
    }),
    [isDark, mode, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
