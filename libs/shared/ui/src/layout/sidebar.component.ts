import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ScrollbarDirective } from '../directives/scrollbar/scrollbar.directive';
import { NavigationComponent } from './navigation.component';
import { NAVIGATION_ITEMS } from './navigation.types';
import { NotificationsComponent } from './notifications.component';
import { UserMenuComponent } from './user-menu.component';

@Component({
  selector: 'whizard-admin-sidebar',
  imports: [
    NavigationComponent,
    NotificationsComponent,
    UserMenuComponent,
    MatButtonModule,
    MatIconModule,
    ScrollbarDirective,
  ],
  host: {
    class: 'flex w-full flex-auto flex-col',
    style: 'background: #0F253F; border-right: 1px solid #484E5D;',
  },
  template: `
    <!-- Header -->
    <div
      class="flex items-center gap-x-2.5 h-16 px-5 shrink-0"
      style="border-bottom: 1px solid #484E5D"
    >
      <div class="flex items-center gap-x-2.5 flex-auto">
        <div
          class="size-8 rounded-md flex items-center justify-center text-sm font-bold shrink-0"
          style="background: #314DDF; color: #E8F0FA"
        >
          W
        </div>
        <div class="flex flex-col select-none">
          <div
            class="text-sm font-semibold leading-none tracking-wide"
            style="color: #E8F0FA"
          >
            Whizard
          </div>
          <div class="text-xs leading-tight" style="color: #7F94AE">Admin</div>
        </div>
      </div>

      <div class="flex items-center h-16 px-4 shrink-0 lg:hidden">
        <button matIconButton style="color: #E8F0FA">
          <mat-icon svgIcon="heroicons_outline:bars-3" />
        </button>

        <whizard-notifications />
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex-auto py-4" whizardScrollbar>
      <whizard-navigation [items]="navigationItems" />

      <!-- User -->
      <div class="p-2 shrink-0" style="border-top: 1px solid #484E5D">
        <whizard-user-menu />
      </div>
    </div>
  `,
})
export class AdminSidebarComponent {
  protected navigationItems = inject(NAVIGATION_ITEMS);
}
