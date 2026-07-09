/** Mismo shape que `PublicTheme` en transversal (specs 002/005/008) — proyección pública consumida vía `GET /api/theme/:slug`. */
export interface ThemeTokens {
  colorPrimary: string;
  colorPrimaryTint: string;
  colorSecondary: string;
  colorSecondaryTint: string;
  colorTextStrong: string;
  colorTextMuted: string;
  colorSurface: string;
  colorBorder: string;
}

export interface ThemeAssets {
  logoUrl: string;
  faviconUrl: string;
  coBrandBankLogoUrl: string;
  coBrandGroupLogoUrl?: string;
  ogImageUrl?: string;
  footerSealUrl?: string; // Sello Vigilado (Superintendencia Financiera) — izquierda del footer
  footerInsurerUrl?: string; // Aseguradora del programa (p. ej. Seguros Alfa) — derecha del footer
}

export interface ThemeLegal {
  footerDisclaimer: string;
  termsUrl?: string;
  privacyUrl?: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontUrlWoff2?: string;
}

export interface PublicTheme {
  slug: string;
  displayName: string;
  version: number;
  tokens: ThemeTokens;
  assets: ThemeAssets;
  legal: ThemeLegal;
  typography: ThemeTypography;
}

/** Tema neutro de fallback si falla el fetch de `GET /api/theme/:slug` (edge case de spec, mismo shape que el default de transversal). */
export const NEUTRAL_THEME: PublicTheme = {
  slug: '__default__',
  displayName: 'Plataforma',
  version: 1,
  tokens: {
    colorPrimary: '#1F2937',
    colorPrimaryTint: '#E5E7EB',
    colorSecondary: '#4B5563',
    colorSecondaryTint: '#F3F4F6',
    colorTextStrong: '#111827',
    colorTextMuted: '#6B7280',
    colorSurface: '#FFFFFF',
    colorBorder: '#D1D5DB',
  },
  assets: {
    logoUrl: '',
    faviconUrl: '',
    coBrandBankLogoUrl: '',
  },
  legal: {
    footerDisclaimer: 'Vigilado por la Superintendencia Financiera de Colombia.',
  },
  typography: {
    fontFamily: 'Poppins',
  },
};
