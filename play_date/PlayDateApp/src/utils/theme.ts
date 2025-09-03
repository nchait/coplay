import { Theme } from '../types';

// Color palette inspired by minimalistic design (Tinder, Calm, Duolingo)
const colors = {
  // Primary colors
  primary: '#FF6B6B',      // Warm coral/pink for primary actions
  primaryLight: '#FF8E8E',
  primaryDark: '#E55555',
  
  // Secondary colors
  secondary: '#4ECDC4',    // Calm teal for secondary actions
  secondaryLight: '#7EDDD6',
  secondaryDark: '#3BA99C',
  
  // Neutral colors
  background: '#FFFFFF',   // Clean white background
  surface: '#F8F9FA',      // Light gray for cards/surfaces
  surfaceDark: '#E9ECEF',
  
  // Text colors
  text: '#2C3E50',         // Dark blue-gray for primary text
  textSecondary: '#6C757D', // Medium gray for secondary text
  textLight: '#ADB5BD',    // Light gray for disabled/placeholder text
  
  // Border and divider colors
  border: '#DEE2E6',       // Light border color
  borderLight: '#F1F3F4',
  
  // Status colors
  success: '#28A745',      // Green for success states
  error: '#DC3545',        // Red for error states
  warning: '#FFC107',      // Yellow for warning states
  info: '#17A2B8',         // Blue for info states
  
  // Game-specific colors
  gameBackground: '#F0F2F5',
  gameAccent: '#8B5CF6',   // Purple for game elements
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
};

// Spacing system (8px base unit)
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography system
const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: colors.text,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: colors.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: colors.textLight,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

// Border radius system
const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

// Shadow system
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Main theme object
export const theme: Theme = {
  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    textSecondary: colors.textSecondary,
    border: colors.border,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
  },
  spacing,
  typography,
};

// Extended theme with additional properties
export const extendedTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    ...colors,
  },
  borderRadius,
  shadows,
};

// Common component styles
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...shadows.sm,
  },
  buttonText: {
    ...typography.button,
    color: colors.background,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputFocused: {
    borderColor: colors.primary,
    ...shadows.sm,
  },
};

export default theme;
