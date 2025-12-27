import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Bewaardvoorjou brand colors (from web app)
const brandColors = {
  orange: '#FF6B35',
  orangeDark: '#E55A2B',
  orangeLight: '#FF8A5C',
  warm: {
    50: '#FFF8F5',
    100: '#FFE8DD',
    200: '#FFD1BB',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.orange,
    primaryContainer: brandColors.warm[100],
    secondary: '#4A90E2',
    secondaryContainer: '#E3F2FD',
    tertiary: '#7C3AED',
    tertiaryContainer: '#EDE9FE',
    surface: '#FFFFFF',
    surfaceVariant: brandColors.warm[50],
    background: brandColors.slate[50],
    error: '#DC2626',
    errorContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: brandColors.orangeDark,
    onSecondary: '#FFFFFF',
    onSurface: brandColors.slate[900],
    onSurfaceVariant: brandColors.slate[600],
    onBackground: brandColors.slate[900],
    outline: brandColors.slate[300],
    outlineVariant: brandColors.slate[200],
  },
  roundness: 12,
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brandColors.orangeLight,
    primaryContainer: brandColors.orangeDark,
    secondary: '#64B5F6',
    secondaryContainer: '#1565C0',
    tertiary: '#9F7AEA',
    tertiaryContainer: '#5B21B6',
    surface: brandColors.slate[800],
    surfaceVariant: brandColors.slate[700],
    background: brandColors.slate[900],
    error: '#EF4444',
    errorContainer: '#7F1D1D',
    onPrimary: brandColors.slate[900],
    onPrimaryContainer: '#FFFFFF',
    onSecondary: brandColors.slate[900],
    onSurface: brandColors.slate[50],
    onSurfaceVariant: brandColors.slate[300],
    onBackground: brandColors.slate[50],
    outline: brandColors.slate[600],
    outlineVariant: brandColors.slate[700],
  },
  roundness: 12,
};

// Platform-specific values
export const platformSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const platformFontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

// Additional semantic colors
export const semanticColors = {
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
};

// Platform-specific shadows (iOS uses shadowOffset, Android uses elevation)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Common component styles
export const commonStyles = {
  card: {
    borderRadius: 12,
    padding: platformSpacing.md,
    ...shadows.md,
  },
  button: {
    borderRadius: 8,
    paddingVertical: platformSpacing.sm,
    paddingHorizontal: platformSpacing.md,
  },
  input: {
    borderRadius: 8,
    paddingVertical: platformSpacing.sm,
    paddingHorizontal: platformSpacing.md,
    borderWidth: 1,
  },
};
