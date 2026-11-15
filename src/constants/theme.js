// src/constants/theme.js
// Official UFOP Institutional Palette (Manual de Identidade Visual UFOP - https://ufop.br/)

export const COLORS = {
  // Brand Primary & Secondary — Official UFOP Burgundy (Vinho/Grená) & Gold (Ouro)
  primary: "#8C1D40",       // Vinho / Grená Institucional UFOP
  primaryDark: "#590D22",   // Vinho Escuro UFOP
  primaryLight: "#A6264C",  // Vinho Claro UFOP
  accent: "#C59B27",        // Ouro / Dourado Institucional UFOP
  accentLight: "#FDF8EB",   // Fundo Dourado Suave UFOP
  ufopGold: "#D4AF37",      // Ouro Brilhante UFOP
  ufopSlate: "#2D2926",     // Chumbo Institucional UFOP

  // Surface & Layout
  background: "#FAF8F6",    // Warm UFOP Parchment / Off-white
  surface: "#FFFFFF",       // Card white
  surfaceAlt: "#F4EFEA",    // Warm stone input/pill background

  // Text Contrast Tokens (High Legibility)
  textPrimary: "#1E1B18",   // Deep institutional charcoal
  textSecondary: "#574E47", // Warm dark slate for subtext
  textMuted: "#786E65",     // Medium warm grey
  textInverse: "#FFFFFF",

  // Status & Badges
  success: "#10B981",       // Vibrant Emerald
  successLight: "#D1FAE5",
  warning: "#D97706",       // Gold Amber
  warningLight: "#FEF3C7",
  danger: "#DC2626",        // Crimson
  dangerLight: "#FEE2E2",
  info: "#8C1D40",          // UFOP Burgundy Info
  infoLight: "#FCE7F3",

  // Borders & Dividers
  border: "#E6DFD7",
  borderFocused: "#8C1D40",

  // Overlay
  overlay: "rgba(30, 27, 24, 0.58)",
};

export const UFOP_LINKS = {
  portal: "https://ufop.br/",
  minhaUfop: "https://minha.ufop.br/",
  icea: "https://icea.ufop.br/",
  ichs: "https://ichs.ufop.br/",
  escolademinas: "https://em.ufop.br/",
  ru: "https://ufop.br/cardapio-do-ru",
  sketchfab3dPage: "https://sketchfab.com/3d-models/universidade-federal-de-ouro-preto-ufop-cb546bc4ac754440bdd75e9ec39cae6f",
  sketchfab3dEmbed: "https://sketchfab.com/models/cb546bc4ac754440bdd75e9ec39cae6f/embed?autostart=1&ui_theme=dark&dnt=1",
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
    shadowColor: "#2D161D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#2D161D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#2D161D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
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
