// constants/theme.ts
// Design tokens for Mera Parisar — "Nivas" (Quiet Premium) direction.
// Restraint over decoration: ink instead of a loud brand color, hairline
// borders instead of shadows, one muted accent used sparingly.
// Import via useTheme() from context/ThemeContext — never hardcode colors in screens.

export const palette = {
  // Ink — primary is near-black, not a "brand color". Buttons, emphasis, headings.
  ink900: '#15141A',
  ink800: '#211F28',
  ink700: '#302D38',
  ink500: '#54505F',

  // Stone — warm neutrals, not clinical gray
  stone50: '#FAF8F5',
  stone100: '#F2EFEA',
  stone200: '#E7E2DA',
  stone300: '#D7D0C4',
  stone400: '#B3AA9B',
  stone500: '#8C8375',
  stone600: '#6B6459',

  // Bronze — the one accent, used sparingly (active states, key highlights only)
  bronze300: '#D8C3A0',
  bronze400: '#B3925E',
  bronze500: '#96774A',
  bronze600: '#785D38',

  // Status — muted, not saturated
  green500: '#5C7A5E',
  green100: '#E6EBE3',
  red500: '#A8564D',
  red100: '#F2E4E1',
  amber500: '#A0813F',
  amber100: '#EFE7D3',

  white: '#FFFFFF',
  black: '#000000',
};

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryMuted: string;
  onPrimary: string;
  accent: string;
  accentMuted: string;
  text: string;
  textMuted: string;
  textInverted: string;
  border: string;
  borderStrong: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  warning: string;
  warningBg: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  background: palette.stone50,
  surface: palette.white,
  surfaceElevated: palette.white,
  primary: palette.ink900,
  primaryMuted: palette.stone100,
  onPrimary: palette.stone50,
  accent: palette.bronze500,
  accentMuted: '#F1E7D6',
  text: palette.ink900,
  textMuted: palette.stone600,
  textInverted: palette.stone50,
  border: palette.stone200,
  borderStrong: palette.stone300,
  success: palette.green500,
  successBg: palette.green100,
  danger: palette.red500,
  dangerBg: palette.red100,
  warning: palette.amber500,
  warningBg: palette.amber100,
  overlay: 'rgba(21, 20, 26, 0.55)',
};

export const darkColors: ThemeColors = {
  background: palette.ink900,
  surface: palette.ink800,
  surfaceElevated: palette.ink700,
  primary: palette.stone50,
  primaryMuted: palette.ink700,
  onPrimary: palette.ink900,
  accent: palette.bronze400,
  accentMuted: '#3A311F',
  text: palette.stone50,
  textMuted: palette.stone400,
  textInverted: palette.ink900,
  border: '#332F3B',
  borderStrong: '#413C49',
  success: '#7FA082',
  successBg: '#25301F',
  danger: '#C17B72',
  dangerBg: '#3A2420',
  warning: '#C4A466',
  warningBg: '#332B18',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Refined, consistent — no pill-shaped buttons in this direction.
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999, // reserved for avatars/dots only, not buttons
};

// Weight capped at 600 — no heavy 700 displays. Wider tracking on headings
// for a quieter, more confident read.
export const typography = {
  display: { fontSize: 30, fontWeight: '600' as const, lineHeight: 38, letterSpacing: 0.2 },
  h1: { fontSize: 24, fontWeight: '600' as const, lineHeight: 31, letterSpacing: 0.2 },
  h2: { fontSize: 18, fontWeight: '600' as const, lineHeight: 25, letterSpacing: 0.1 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 17, letterSpacing: 0.3 },
  tiny: { fontSize: 10, fontWeight: '500' as const, lineHeight: 14, letterSpacing: 0.3 },
};

// Depth comes from hairline borders, not shadows. Shadows reserved for
// sheets/modals only, and kept barely-there even then.
export const shadow = (level: 'sm' | 'md' | 'lg' = 'sm', color = palette.ink900) => {
  const levels = {
    sm: { elevation: 1, offset: 1, opacity: 0.03, radius: 3 },
    md: { elevation: 3, offset: 2, opacity: 0.05, radius: 8 },
    lg: { elevation: 6, offset: 4, opacity: 0.08, radius: 16 },
  }[level];
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: levels.offset },
    shadowOpacity: levels.opacity,
    shadowRadius: levels.radius,
    elevation: levels.elevation,
  };
};

// Kept for compatibility with any screen importing gradients — but the
// Nivas direction avoids gradient hero sections; prefer flat ink instead.
export const gradients = {
  primary: [palette.ink800, palette.ink900] as const,
  warm: [palette.bronze400, palette.bronze600] as const,
  dusk: [palette.ink800, palette.ink900] as const,
};

// Motion timing — calm and consistent across the app
export const motion = {
  fast: 150,
  base: 260,
  slow: 400,
};
