// src/constants/theme.js

export const COLORS = {
  // Brand Primary & Secondary
  primary: "#0A3D62",       // Deep UFOP Navy
  primaryDark: "#072A45",
  primaryLight: "#1E5F8A",
  accent: "#2563EB",        // Electric Action Blue
  accentLight: "#EFF6FF",

  // Surface & Layout
  background: "#F8FAFC",    // Cool slate background
  surface: "#FFFFFF",       // Card white
  surfaceAlt: "#F1F5F9",    // Input background

  // Text Contrast Tokens (High Legibility)
  textPrimary: "#0F172A",   // Almost black for high readability
  textSecondary: "#475569", // Dark slate for subtext (no faint grey)
  textMuted: "#64748B",     // Medium slate
  textInverse: "#FFFFFF",

  // Status & Badges
  success: "#10B981",       // Vibrant Emerald
  successLight: "#D1FAE5",
  warning: "#F59E0B",       // Amber
  warningLight: "#FEF3C7",
  danger: "#EF4444",        // Crimson
  dangerLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",

  // Borders & Dividers
  border: "#E2E8F0",
  borderFocused: "#2563EB",

  // Overlay
  overlay: "rgba(15, 23, 42, 0.5)",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  h3: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
  },
};
