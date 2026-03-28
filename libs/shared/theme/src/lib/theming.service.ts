  import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  computed,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Colors, Scheme, Theme } from './models/theming';
import { TonalPalette } from './palette';
import { THEME_CONFIG } from './provider';

@Injectable({ providedIn: 'root' })
export class ThemingService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeConfig = inject(THEME_CONFIG);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly storageKey = 'whizard-admin-scheme';
  private readonly rootEl = this.document.documentElement;
  private readonly themeStyleEl = this.document.createElement('style');
  private readonly mediaQuery = this.isBrowser
    ? globalThis.matchMedia('(prefers-color-scheme: dark)')
    : null;

  colors = signal<Colors>({
    primary: this.themeConfig.primary,
    error: this.themeConfig.error,
  });

  scheme = signal<Scheme>(this.getInitialScheme());

  theme = computed<Theme>(() => this.generateTheme(this.colors()));

  isDark = computed(
    () =>
      this.scheme() === 'dark' ||
      (this.scheme() === 'system' && (this.mediaQuery?.matches ?? false))
  );

  isLight = computed(() => !this.isDark());

  constructor() {
    this.document.head.appendChild(this.themeStyleEl);
    this.themeStyleEl.classList.add('theme-colors');

    // Generate theme colors immediately
    this.generateTheme(this.colors());

    effect(() => {
      if (!this.isBrowser) {
        return;
      }

      const scheme = this.scheme();
      const isDark = this.isDark();

      this.rootEl.classList.toggle('scheme-dark', isDark);
      this.rootEl.classList.toggle('scheme-light', !isDark);
      this.rootEl.style.colorScheme = isDark ? 'dark' : 'light';

      globalThis.localStorage.setItem(this.storageKey, scheme);
    });

    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', () => {
        if (this.scheme() === 'system') {
          const prefersDark = this.mediaQuery?.matches ?? false;
          this.rootEl.classList.toggle('scheme-dark', prefersDark);
          this.rootEl.classList.toggle('scheme-light', !prefersDark);
          this.rootEl.style.colorScheme = prefersDark ? 'dark' : 'light';
        }
      });
    }
  }

  updateScheme(scheme: Scheme): void {
    this.scheme.set(scheme);
  }

  private getInitialScheme(): Scheme {
    if (!this.isBrowser) {
      return this.themeConfig.scheme;
    }

    const stored = globalThis.localStorage.getItem(this.storageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }

    return this.themeConfig.scheme;
  }

  private generateTheme(config: Colors): Theme {
    const primary = new TonalPalette({ color: config.primary });
    const error = new TonalPalette({ color: config.error });

    this.themeStyleEl.textContent = `:root {
      /* Primary */
      --theme-color-primary-50: ${primary.hue(50)};
      --theme-color-primary-100: ${primary.hue(100)};
      --theme-color-primary-200: ${primary.hue(200)};
      --theme-color-primary-300: ${primary.hue(300)};
      --theme-color-primary-400: ${primary.hue(400)};
      --theme-color-primary-500: ${primary.hue(500)};
      --theme-color-primary-600: ${primary.hue(600)};
      --theme-color-primary-700: ${primary.hue(700)};
      --theme-color-primary-800: ${primary.hue(800)};
      --theme-color-primary-900: ${primary.hue(900)};
      --theme-color-primary-950: ${primary.hue(950)};

      /* Error */
      --theme-color-error-50: ${error.hue(50)};
      --theme-color-error-100: ${error.hue(100)};
      --theme-color-error-200: ${error.hue(200)};
      --theme-color-error-300: ${error.hue(300)};
      --theme-color-error-400: ${error.hue(400)};
      --theme-color-error-500: ${error.hue(500)};
      --theme-color-error-600: ${error.hue(600)};
      --theme-color-error-700: ${error.hue(700)};
      --theme-color-error-800: ${error.hue(800)};
      --theme-color-error-900: ${error.hue(900)};
      --theme-color-error-950: ${error.hue(950)};
    `;

    return { primary, error };
  }
}
