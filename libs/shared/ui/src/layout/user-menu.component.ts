import { Component, computed, inject } from '@angular/core';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { ThemingService } from '@whizard/theme';
import { LAYOUT_AUTH_SERVICE } from './auth.token';

type Scheme = 'light' | 'dark' | 'system';

@Component({
  selector: 'whizard-user-menu',
  imports: [
    MatDivider,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatPseudoCheckbox,
    MatMenuTrigger,
    RouterLink,
  ],
  template: `
    <button
      class="flex w-full cursor-pointer items-center gap-x-3 rounded-xl p-2 text-left transition-colors duration-120"
      style="color: #E8F0FA"
      [style.background]="'transparent'"
      (mouseenter)="hovered = true"
      (mouseleave)="hovered = false"
      [style.background]="hovered ? '#1E293B' : 'transparent'"
      [matMenuTriggerFor]="userMenu"
    >
      <div
        class="size-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold"
        style="background: #314DDF; color: #E8F0FA"
      >
        {{ initials() }}
      </div>
      <div class="flex min-w-0 flex-auto flex-col select-none">
        <div class="truncate text-sm font-medium" style="color: #E8F0FA">
          {{ displayName() }}
        </div>
        <div class="truncate text-xs" style="color: #7F94AE">
          {{ email() }}
        </div>
      </div>
      <mat-icon
        class="size-4 shrink-0"
        svgIcon="heroicons_outline:ellipsis-vertical"
        style="color: #7F94AE"
      />
    </button>

    <mat-menu
      class="min-w-56"
      xPosition="after"
      yPosition="above"
      #userMenu="matMenu"
    >
      <div
        class="px-4 py-3 flex items-center gap-x-3"
        style="border-bottom: 1px solid #484E5D"
      >
        <div
          class="size-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold"
          style="background: #314DDF; color: #E8F0FA"
        >
          {{ initials() }}
        </div>
        <div class="flex flex-col min-w-0">
          <div class="truncate text-sm font-medium" style="color: #E8F0FA">
            {{ displayName() }}
          </div>
          <div class="truncate text-xs" style="color: #7F94AE">
            {{ email() }}
          </div>
        </div>
      </div>
      <button mat-menu-item routerLink="/profile">
        <mat-icon svgIcon="heroicons_outline:user" />
        Profile
      </button>
      <mat-divider />
      <!-- <button mat-menu-item [matMenuTriggerFor]="appearanceMenu">
        <mat-icon svgIcon="lucideIcons:sun-moon" />
        Appearance
      </button> -->
      <mat-divider />
      <button mat-menu-item (click)="signOut()">
        <mat-icon svgIcon="lucideIcons:log-out" />
        Sign out
      </button>
    </mat-menu>

    <mat-menu #appearanceMenu="matMenu">
      @for (item of schemes; track item.value) {
        <button mat-menu-item (click)="updateScheme(item.value)">
          <mat-pseudo-checkbox
            appearance="minimal"
            class="mr-2"
            [state]="scheme() === item.value ? 'checked' : 'unchecked'"
          />
          <span>{{ item.label }}</span>
        </button>
      }
    </mat-menu>
  `,
})
export class UserMenuComponent {
  private authService = inject(LAYOUT_AUTH_SERVICE);
  private theming = inject(ThemingService);

  protected hovered = false;
  protected scheme = computed(() => this.theming.scheme() as Scheme);
  protected schemes: { label: string; value: Scheme }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  protected displayName = computed(() => {
    const user = this.authService.currentUser();
    return user?.displayName ?? user?.email ?? 'User';
  });

  protected email = computed(() => this.authService.currentUser()?.email ?? '');

  protected initials = computed(() => {
    const name = this.displayName();
    return name ? name[0].toUpperCase() : 'U';
  });

  updateScheme(scheme: Scheme) {
    this.theming.scheme.set(scheme);
  }

  async signOut() {
    await this.authService.signOut();
  }
}
