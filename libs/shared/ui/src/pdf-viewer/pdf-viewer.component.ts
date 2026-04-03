import { Component, input, output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'whizard-pdf-viewer',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="pdf-viewer-overlay" (click)="closed.emit()">
      <div class="pdf-viewer-container" (click)="$event.stopPropagation()">
        <div class="pdf-viewer-header">
          <span class="pdf-title">{{ fileName() }}</span>
          <div class="pdf-actions">
            <a [href]="url()" target="_blank" download mat-icon-button class="action-btn" title="Download">
              <mat-icon svgIcon="lucideIcons:download" class="size-5" />
            </a>
            <button mat-icon-button class="action-btn" (click)="closed.emit()" title="Close">
              <mat-icon svgIcon="heroicons_outline:x-mark" class="size-5" />
            </button>
          </div>
        </div>
        <iframe
          [src]="safeUrl()"
          class="pdf-iframe"
          frameborder="0"
          title="PDF Viewer">
        </iframe>
      </div>
    </div>
  `,
  styles: [`
    .pdf-viewer-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
    }
    .pdf-viewer-container {
      background: var(--wrcf-bg-card, #1E293B);
      border: 1px solid var(--wrcf-border, #484E5D);
      border-radius: 12px;
      width: 100%; max-width: 900px;
      height: 80vh;
      display: flex; flex-direction: column;
      overflow: hidden;
    }
    .pdf-viewer-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--wrcf-border, #484E5D);
      background: var(--wrcf-bg-secondary, #0F253F);
    }
    .pdf-title {
      font-family: 'Poppins', sans-serif;
      font-size: 15px;
      color: var(--wrcf-text-primary, #E8F0FA);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .pdf-actions { display: flex; gap: 4px; }
    .action-btn { color: var(--wrcf-text-secondary, #7F94AE); }
    .action-btn:hover { color: var(--wrcf-text-primary, #E8F0FA); }
    .pdf-iframe { flex: 1; width: 100%; border: none; }
  `],
})
export class PdfViewerComponent {
  readonly url = input.required<string>();
  readonly fileName = input<string>('Document');
  readonly closed = output<void>();

  private readonly sanitizer = inject(DomSanitizer);

  safeUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.url());
  }
}
