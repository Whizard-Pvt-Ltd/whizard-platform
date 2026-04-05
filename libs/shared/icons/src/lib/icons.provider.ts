import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { HEROICONS_MINI } from './icon-sets/heroicons-mini';
import { HEROICONS_OUTLINE } from './icon-sets/heroicons-outline';
import { HEROICONS_SOLID } from './icon-sets/heroicons-solid';
import { LUCIDEICONS } from './icon-sets/lucide';

/**
 * Registers all bundled icon sets with Angular Material's MatIconRegistry.
 *
 * Icons are inlined as SVG sprites — no HTTP requests, no asset configuration needed.
 *
 * Namespaces registered:
 *   heroicons_outline  →  24×24 stroke icons
 *   heroicons_solid    →  24×24 fill icons
 *   heroicons_mini     →  20×20 fill icons
 *
 * Usage in templates:
 *   <mat-icon svgIcon="heroicons_outline:home"></mat-icon>
 *   <mat-icon svgIcon="heroicons_solid:check"></mat-icon>
 *   <mat-icon svgIcon="heroicons_mini:x-mark"></mat-icon>
 */
export const provideIcons = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    provideAppInitializer(() => {
      const matIconRegistry = inject(MatIconRegistry);
      const domSanitizer = inject(DomSanitizer);

      const trust = (svg: string) => domSanitizer.bypassSecurityTrustHtml(svg);

      // Hero icons
      matIconRegistry.addSvgIconSetLiteralInNamespace(
        'heroicons_outline',
        trust(HEROICONS_OUTLINE),
      );
      matIconRegistry.addSvgIconSetLiteralInNamespace(
        'heroicons_solid',
        trust(HEROICONS_SOLID),
      );
      matIconRegistry.addSvgIconSetLiteralInNamespace(
        'heroicons_mini',
        trust(HEROICONS_MINI),
      );

      // Lucide icons
      matIconRegistry.addSvgIconSetLiteralInNamespace(
        'lucideIcons',
        trust(LUCIDEICONS),
        { viewBox: '0 0 24 24' },
      );
    }),
  ]);
