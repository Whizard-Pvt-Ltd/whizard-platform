import { Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { ThemingService } from '@whizard/theme';

type Scheme = 'light' | 'dark' | 'system';

@Component({
  selector: 'whizard-scheme-switcher',
  imports: [MatIcon, MatIconButton, MatMenu, MatMenuItem, MatPseudoCheckbox, MatMenuTrigger],
  template: `
    <button matIconButton [matMenuTriggerFor]="schemeMenu" style="color: #E8F0FA">
      <mat-icon svgIcon="lucideIcons:sun-moon" />
    </button>
    <mat-menu #schemeMenu>
      @for (item of schemes; track item.value) {
        <button mat-menu-item (click)="updateScheme(item.value)">
          <mat-pseudo-checkbox appearance="minimal" [state]="scheme() === item.value ? 'checked' : 'unchecked'" />
          <span class="ml-1">{{ item.label }}</span>
        </button>
      }
    </mat-menu>
  `,
})
export class SchemeSwitcherComponent {
  private theming = inject(ThemingService);

  protected scheme = computed(() => this.theming.scheme() as Scheme);
  protected schemes: { label: string; value: Scheme }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  updateScheme(scheme: Scheme) {
    this.theming.scheme.set(scheme);
  }
}
