import {
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer
} from '@angular/core';
import { ThemeConfig } from './models/theming';
import { ThemingService } from './theming.service';

export const THEME_CONFIG = new InjectionToken<ThemeConfig>('THEME_CONFIG');

export function provideTheming(config: ThemeConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: THEME_CONFIG,
      useValue: config
    },
    provideAppInitializer(() => {
      inject(ThemingService);
    })
  ]);
}
