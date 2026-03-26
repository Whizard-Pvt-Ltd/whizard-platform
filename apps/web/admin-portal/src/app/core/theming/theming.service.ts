import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Scheme, ThemeConfig } from './models/theming';
import { THEME_CONFIG } from './provider';

@Injectable({ providedIn: 'root' })
export class ThemingService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeConfig = inject<ThemeConfig>(THEME_CONFIG);
  private readonly storageKey = 'whizard-admin-scheme';
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly rootElement = this.document.documentElement;
  private readonly themeStyleElement = this.document.createElement('style');
  private readonly mediaQuery = this.isBrowser
    ? globalThis.matchMedia('(prefers-color-scheme: dark)')
    : null;

  readonly scheme = signal<Scheme>(this.getInitialScheme());
  readonly isDark = computed(() => {
    if (this.scheme() === 'dark') {
      return true;
    }

    if (this.scheme() === 'light') {
      return false;
    }

    return this.mediaQuery?.matches ?? false;
  });

  constructor() {
    this.document.head.appendChild(this.themeStyleElement);
    this.themeStyleElement.classList.add('whizard-theme-colors');
    this.syncColors();

    effect(() => {
      const scheme = this.scheme();
      const isDark = this.isDark();

      this.rootElement.classList.toggle('scheme-dark', isDark);
      this.rootElement.classList.toggle('scheme-light', !isDark);
      this.rootElement.style.colorScheme = isDark ? 'dark' : 'light';

      if (this.isBrowser) {
        globalThis.localStorage.setItem(this.storageKey, scheme);
      }
    });

    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', () => {
        if (this.scheme() === 'system') {
          this.rootElement.classList.toggle('scheme-dark', this.mediaQuery?.matches ?? false);
          this.rootElement.classList.toggle('scheme-light', !(this.mediaQuery?.matches ?? false));
          this.rootElement.style.colorScheme = (this.mediaQuery?.matches ?? false) ? 'dark' : 'light';
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

    const storedScheme = globalThis.localStorage.getItem(this.storageKey);
    if (storedScheme === 'light' || storedScheme === 'dark' || storedScheme === 'system') {
      return storedScheme;
    }

    return this.themeConfig.scheme;
  }

  private syncColors(): void {
    this.themeStyleElement.textContent = `:root {
      --theme-color-primary-base: ${this.themeConfig.primary};
      --theme-color-error-base: ${this.themeConfig.error};
    }`;
  }
}
