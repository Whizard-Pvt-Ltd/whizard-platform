import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { formatDistanceToNow, sub } from 'date-fns';

@Component({
  selector: 'whizard-notifications',
  imports: [
    MatIconButton,
    MatIcon,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    MatButton,
    MatDivider,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
  ],
  template: `
    <button matIconButton cdkOverlayOrigin (click)="toggle()" #trigger="cdkOverlayOrigin"
            style="color: #E8F0FA">
      <mat-icon svgIcon="heroicons_outline:bell" />
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayHasBackdrop]="true"
      [cdkConnectedOverlayBackdropClass]="'cdk-overlay-transparent-backdrop'"
      (detach)="toggle(false)"
      (backdropClick)="toggle(false)"
    >
      <div class="flex flex-col overflow-y-auto rounded-lg shadow-lg"
           style="max-height: 480px; width: 320px; background: #1E293B; border: 1px solid #484E5D;">

        <div class="flex items-center p-4 pb-0 pl-6">
          <div class="text-lg font-semibold" style="color: #E8F0FA">Notifications</div>
          <div class="flex-auto"></div>
          <button matIconButton [matMenuTriggerFor]="notificationsMenu" style="color: #7F94AE">
            <mat-icon svgIcon="heroicons_outline:ellipsis-vertical" />
          </button>
          <mat-menu #notificationsMenu="matMenu">
            <button mat-menu-item>
              <mat-icon svgIcon="heroicons_outline:check" />
              Mark all as read
            </button>
            <button mat-menu-item>
              <mat-icon svgIcon="heroicons_outline:cog-6-tooth" />
              Notification settings
            </button>
          </mat-menu>
        </div>

        <div class="mt-3 flex items-center gap-x-2 px-6">
          @for (f of filters; track f.value) {
            <button
              mat-button
              class="text-sm"
              [style.background]="currentFilter().value === f.value ? '#314DDF' : 'transparent'"
              [style.color]="currentFilter().value === f.value ? '#E8F0FA' : '#7F94AE'"
              style="border-radius: 6px; padding: 4px 10px; min-width: 0"
              (click)="currentFilter.set(f)"
            >
              {{ f.label }}
            </button>
          }
        </div>

        <mat-divider class="mt-3" style="border-color: #484E5D" />

        <div class="flex flex-col">
          @for (notification of notifications; track notification.id; let last = $last) {
            <div class="flex gap-x-2 py-3 pr-3 pl-6">
              <div class="flex-auto">
                @if (notification.title) {
                  <div class="font-semibold text-sm" style="color: #E8F0FA">{{ notification.title }}</div>
                }
                <div class="text-sm line-clamp-2" style="color: #7F94AE">{{ notification.description }}</div>
                <div class="mt-1 text-xs" style="color: #8AB4F8">{{ timeAgo(notification.time) }}</div>
              </div>
              <button matIconButton [matMenuTriggerFor]="notificationActions" style="color: #7F94AE">
                <mat-icon svgIcon="heroicons_outline:ellipsis-vertical" />
              </button>
              <mat-menu #notificationActions="matMenu">
                <button mat-menu-item>
                  <mat-icon svgIcon="heroicons_outline:check" />
                  Mark as read
                </button>
                <button mat-menu-item>
                  <mat-icon svgIcon="heroicons_outline:trash" />
                  Delete
                </button>
              </mat-menu>
            </div>
            @if (!last) {
              <mat-divider style="border-color: #484E5D" />
            }
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class NotificationsComponent {
  protected open = signal(false);
  protected filters = [
    { value: 'all', label: 'All' },
    { value: 'system', label: 'System' },
    { value: 'archive', label: 'Archive' },
  ];
  protected currentFilter = signal<{ value: string; label: string }>({ value: 'all', label: 'All' });

  protected notifications = [
    {
      id: '1',
      title: 'Daily challenges',
      description: 'Your submission has been accepted',
      time: sub(new Date(), { minutes: 25 }),
    },
    {
      id: '2',
      title: null,
      description: 'Leo Gill added you to "Top Secret Project" group and assigned you as a "Project Manager"',
      time: sub(new Date(), { minutes: 50 }),
    },
    {
      id: '3',
      title: 'Mailbox',
      description: 'You have 15 unread mails across 3 mailboxes',
      time: sub(new Date(), { hours: 3 }),
    },
  ];

  toggle(force: boolean | null = null) {
    this.open.update((value) => (force === null ? !value : force));
  }

  timeAgo(time: Date): string {
    return formatDistanceToNow(time, { addSuffix: true });
  }
}
