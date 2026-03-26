export type Scheme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  scheme: Scheme;
  primary: string;
  error: string;
}
