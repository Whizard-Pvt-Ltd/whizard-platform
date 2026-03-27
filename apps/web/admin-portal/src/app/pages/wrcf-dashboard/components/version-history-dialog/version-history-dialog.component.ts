import { Component, output } from '@angular/core';

@Component({
  selector: 'whizard-version-history-dialog',
  standalone: true,
  template: `
    <div class="dialog-backdrop" (click)="closed.emit()"></div>
    <div class="dialog">
      <div class="dialog-header">
        <span class="dialog-title">Version History</span>
        <button class="close-btn" (click)="closed.emit()">✕</button>
      </div>
      <div class="dialog-body">
        <p class="coming-soon">Version history coming soon.</p>
      </div>
    </div>
  `,
  styles: [`
    .dialog-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100;
    }
    .dialog {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #1E293B; border: 1px solid #484E5D; border-radius: 14px;
      width: 480px; z-index: 101; overflow: hidden;
    }
    .dialog-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; background: #314DDF;
    }
    .dialog-title { font-family: Poppins, sans-serif; font-size: 18px; font-weight: 500; color: #E8F0FA; }
    .close-btn {
      background: none; border: none; color: #E8F0FA; font-size: 18px; cursor: pointer; line-height: 1;
    }
    .dialog-body { padding: 32px 24px; }
    .coming-soon { font-family: Poppins, sans-serif; font-size: 15px; color: #7F94AE; text-align: center; }
  `]
})
export class VersionHistoryDialogComponent {
  readonly closed = output<void>();
}
