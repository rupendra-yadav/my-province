// constants/theme.ts
// Design tokens for Mera Parisar. Single source of truth for all visual styling.
// Import via useTheme() from context/ThemeContext — don't hardcode colors in screens.

export const palette = {
  // Primary — deep indigo, feels trustworthy/official (committee-friendly)
  indigo50: '#EEF1FF',
  indigo100: '#DDE3FF',
  indigo300: '#9BA8F2',
  indigo500: '#4C5FD5',
  indigo600: '#3D4DB8',
  indigo700: '#2F3D94',
  indigo900: '#1C2359',

  // Accent — warm amber/terracotta, evokes home & community (courtyard warmth)
  amber50: '#FFF7E8',
  amber100: '#FFEBC2',
  amber400: '#F5A623',
  amber500: '#E8930F',
  amber600: '#C97A08',

  // Status
  green500: '#2E9E5B',
  green100: '#DFF5E7',
  red500: '#E0554A',
  red100: '#FCE4E2',
  yellow500: '#DDA71B',
  yellow100: '#FCF2D8',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F7F8FB',
  gray100: '#EEF0F6',
  gray200: '#E1E4ED',
  gray300: '#C7CCDA',
  gray400: '#9AA1B5',
  gray500: '#6B7284',
  gray600: '#4B5163',
  gray800: '#282C39',
  gray900: '#15171F',
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
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  warning: string;
  warningBg: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,
  primary: palette.indigo600,
  primaryMuted: palette.indigo50,
  onPrimary: palette.white,
  accent: palette.amber500,
  accentMuted: palette.amber50,
  text: palette.gray900,
  textMuted: palette.gray500,
  textInverted: palette.white,
  border: palette.gray200,
  success: palette.green500,
  successBg: palette.green100,
  danger: palette.red500,
  dangerBg: palette.red100,
  warning: palette.yellow500,
  warningBg: palette.yellow100,
  overlay: 'rgba(21, 23, 31, 0.5)',
};

export const darkColors: ThemeColors = {
  background: palette.gray900,
  surface: palette.gray800,
  surfaceElevated: '#31364A',
  primary: palette.indigo300,
  primaryMuted: '#232A4D',
  onPrimary: palette.indigo900,
  accent: palette.amber400,
  accentMuted: '#3A2F14',
  text: palette.gray50,
  textMuted: palette.gray400,
  textInverted: palette.gray900,
  border: '#383D50',
  success: '#4CC985',
  successBg: '#173A29',
  danger: '#F27C72',
  dangerBg: '#3B1E1C',
  warning: '#F0C24B',
  warningBg: '#3A2F14',
  overlay: 'rgba(0, 0, 0, 0.6)',
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

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h1: { fontSize: 26, fontWeight: '700' as const, lineHeight: 33 },
  h2: { fontSize: 20, fontWeight: '600' as const, lineHeight: 27 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 23 },
  bodyMedium: { fontSize: 16, fontWeight: '600' as const, lineHeight: 23 },
  caption: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  tiny: { fontSize: 11, fontWeight: '500' as const, lineHeight: 15 },
};

// elevation helper — pass a color for tinted shadows if needed
export const shadow = (level: 'sm' | 'md' | 'lg' = 'md', color = palette.gray900) => {
  const levels = {
    sm: { elevation: 2, offset: 1, opacity: 0.06, radius: 4 },
    md: { elevation: 6, offset: 3, opacity: 0.1, radius: 10 },
    lg: { elevation: 12, offset: 6, opacity: 0.14, radius: 20 },
  }[level];
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: levels.offset },
    shadowOpacity: levels.opacity,
    shadowRadius: levels.radius,
    elevation: levels.elevation,
  };
};

export const gradients = {
  primary: [palette.indigo500, palette.indigo700] as const,
  warm: [palette.amber400, palette.amber600] as const,
  dusk: [palette.indigo700, palette.gray900] as const,
};


export const Colors = {
  light: {
    ...lightColors,
    tint: lightColors.primary,
  },
  dark: {
    ...darkColors,
    tint: darkColors.primary,
  },
};