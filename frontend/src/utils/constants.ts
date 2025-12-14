export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const SCREENS = {
  LAUNCH: 'launch',
  SCANNER: 'scanner',
  URL_REVEAL: 'url_reveal',
  ANALYSIS: 'analysis',
  VERDICT: 'verdict',
} as const;

export type Screen = typeof SCREENS[keyof typeof SCREENS];

