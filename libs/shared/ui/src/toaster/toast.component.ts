import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Toast, ToastVariant } from './toaster.types.js';

const ICON_BY_VARIANT: Record<ToastVariant, string> = {
  success: 'lucideIcons:circle-check',
  error: 'lucideIcons:circle-alert',
  warning: 'lucideIcons:triangle-alert',
  info: 'lucideIcons:info',
};

@Component({
  selector: 'whizard-toast',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="whizard-toast" [attr.data-variant]="toast.variant" role="status">
      <div class="whizard-toast__icon">
        <mat-icon [svgIcon]="iconName" />
      </div>
      <div class="whizard-toast__message">{{ toast.message }}</div>
      @if (toast.dismissible) {
        <button
          type="button"
          class="whizard-toast__close"
          (click)="dismiss.emit(toast.id)"
          aria-label="Dismiss notification">
          <mat-icon svgIcon="lucideIcons:x" />
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      pointer-events: auto;
      animation: whizard-toast-in 180ms ease-out both;
    }

    .whizard-toast {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 400px;
      max-width: 100%;
      height: 50px;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid var(--toast-border, #f04349);
      background: var(--toast-bg, #ffcfcf);
      box-shadow: 0 16px 20px -8px rgba(3, 5, 18, 0.1);
      font-family: 'Red Hat Display', system-ui, sans-serif;
      color: #28292a;
      overflow: hidden;
    }
    .whizard-toast[data-variant="success"] {
      --toast-bg: #cfffd0;
      --toast-border: #01e17b;
    }
    .whizard-toast[data-variant="error"] {
      --toast-bg: #ffcfcf;
      --toast-border: #f04349;
    }
    .whizard-toast[data-variant="warning"] {
      --toast-bg: #feffcf;
      --toast-border: #fdcd0f;
    }
    .whizard-toast[data-variant="info"] {
      --toast-bg: #cfdcff;
      --toast-border: #4b85f5;
    }

    .whizard-toast__icon {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: var(--toast-border);
      color: #ffffff;
    }
    .whizard-toast__icon mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
      line-height: 16px;
      color: #ffffff;
    }

    .whizard-toast__message {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 14px;
      font-weight: 600;
      line-height: 22px;
      color: #28292a;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .whizard-toast__close {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--toast-border);
      cursor: pointer;
      border-radius: 4px;
      transition: opacity 120ms ease;
    }
    .whizard-toast__close:hover { opacity: 0.75; }
    .whizard-toast__close mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
      line-height: 16px;
    }

    @keyframes whizard-toast-in {
      from { transform: translateX(16px); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class ToastComponent {
  @Input({ required: true }) toast!: Toast;
  @Output() readonly dismiss = new EventEmitter<number>();

  get iconName(): string {
    return ICON_BY_VARIANT[this.toast.variant];
  }
}
