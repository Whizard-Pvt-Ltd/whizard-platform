import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { LAYOUT_AUTH_SERVICE } from './auth.token';
import { NotificationsComponent } from './notifications.component';
import { PageActionsService } from './page-actions.service';
import { SchemeSwitcherComponent } from './scheme-switcher.component';
import { AdminSidebarComponent } from './sidebar.component';

@Component({
  selector: 'whizard-admin-layout',
  imports: [
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
    RouterOutlet,
    RouterLink,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    AdminSidebarComponent,
    SchemeSwitcherComponent,
    NotificationsComponent,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container>
      <mat-sidenav
        class="w-80 border-r border-neutral-200 scheme-dark dark:border-neutral-800 dark:bg-primary-950"
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        [disableClose]="!isMobile()"
        fixedInViewport
        #sidenav="matSidenav"
      >
        <whizard-admin-sidebar />
      </mat-sidenav>

      <mat-sidenav-content
        class="flex flex-col overflow-hidden dark:border-neutral-800 dark:bg-primary-950"
        style="height: 100vh;"
      >
        <!-- Top bar — always visible -->
        <div
          class="flex items-center h-16 px-4 shrink-0 gap-x-3"
          style=" border-bottom: 1px solid #484E5D"
        >
          <!-- Hamburger — mobile only -->
          <button
            matIconButton
            (click)="sidenav.toggle()"
            style="color: #E8F0FA"
          >
            <mat-icon svgIcon="lucideIcons:panel-left" class="size-6" />
          </button>

          <!-- Page title -->
          <span
            class="flex-auto text-lg font-semibold truncate select-none"
            style="color: #E8F0FA; font-family: Poppins, sans-serif;"
            >{{ pageTitle() }}</span
          >

          <!-- Page action buttons (registered by each page) -->
          @if (pageActions.actions().length > 0) {
            <div class="flex items-center gap-x-2 shrink-0">
              @for (action of pageActions.actions(); track action.label) {
                <button
                  type="button"
                  matButton="filled"
                  [disabled]="action.disabled ?? false"
                  (click)="action.action()"
                  class="flex items-center gap-1 h-9 px-4 rounded-md text-lg font-medium transition-colors shrink-0 disabled:cursor-not-allowed"
                  [class]="
                    action.variant === 'primary'
                      ? 'bg-[#263FCC] text-[#E8F0FA] hover:bg-[#263FCC]'
                      : action.variant === 'secondary'
                        ? 'bg-[#263FCC] text-[#0F172A] hover:bg-[#00a8e0]'
                        : 'border border-[#484E5D] text-[#7F94AE] hover:text-[#E8F0FA]'
                  "
                >
                  @if (action.icon) {
                    <mat-icon [svgIcon]="action.icon" class="size-6" />
                  }
                  {{ action.label }}
                </button>
              }
            </div>
          }

          <!-- Right actions -->
          <div class="flex items-center gap-x-1 shrink-0">
            <whizard-notifications />
            <whizard-scheme-switcher />

            <!-- Circular avatar -->
            <button
              class="size-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ml-1 cursor-pointer"
              style="background: #314DDF; color: #E8F0FA; border: none;"
              [matMenuTriggerFor]="topbarUserMenu"
            >
              {{ initials() }}
            </button>
          </div>
        </div>

        <!-- Page content — scrollable container for routed components -->
        <div class="flex-1 min-h-0 flex flex-col overflow-y-auto">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <mat-menu #topbarUserMenu="matMenu">
      <button mat-menu-item routerLink="/profile">
        <mat-icon svgIcon="heroicons_outline:user" />
        Profile
      </button>
      <mat-divider />
      <button mat-menu-item (click)="signOut()">
        <mat-icon svgIcon="lucideIcons:log-out" />
        Sign out
      </button>
    </mat-menu>
  `,
})
export class AdminLayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private authService = inject(LAYOUT_AUTH_SERVICE);
  protected readonly pageActions = inject(PageActionsService);

  protected isMobile = toSignal(
    this.breakpointObserver
      .observe('(max-width: 1023px)')
      .pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  protected pageTitle = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.currentRouteTitle()),
    ),
    { initialValue: this.currentRouteTitle() },
  );

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.pageActions.clear());
  }

  protected initials = computed(() => {
    const user = this.authService.currentUser();
    const name = user?.displayName ?? user?.email ?? 'U';
    return name.charAt(0).toUpperCase();
  });

  async signOut(): Promise<void> {
    await this.authService.signOut();
  }

  private currentRouteTitle(): string {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return typeof route.title === 'string' ? route.title : 'Whizard Admin';
  }
}
