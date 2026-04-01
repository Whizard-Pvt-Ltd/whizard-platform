import { TonalPalette } from '../palette';

export type Scheme = 'light' | 'dark' | 'system';
// export type Scheme = 'dark';
export type Colors = {
  primary: string;
  error: string;
};
export type ThemeConfig = Colors & Record<'scheme', Scheme>;

export type Theme = {
  primary: TonalPalette;
  error: TonalPalette;
};
