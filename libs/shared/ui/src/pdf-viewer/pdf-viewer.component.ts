import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface PdfViewerDialogData {
  url: string;
  fileName?: string;
}

@Component({
  selector: 'whizard-pdf-viewer',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="pdf-viewer-container">
      <div class="pdf-viewer-header">
        <span class="pdf-title">{{ data.fileName ?? 'Document' }}</span>
        <div class="pdf-actions">
          <a [href]="data.url" target="_blank" download mat-icon-button class="action-btn" title="Download">
            <mat-icon svgIcon="lucideIcons:download" class="size-5" />
          </a>
          <button mat-icon-button class="action-btn" (click)="dialogRef.close()" title="Close">
            <mat-icon svgIcon="heroicons_outline:x-mark" class="size-5" />
          </button>
        </div>
      </div>
      <iframe
        [src]="safeUrl"
        class="pdf-iframe"
        frameborder="0"
        title="PDF Viewer">
      </iframe>
    </div>
  `,
  styles: [`
    .pdf-viewer-container {
      display: flex; flex-direction: column;
      width: 100%; height: 100%;
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
  readonly dialogRef = inject(MatDialogRef<PdfViewerComponent>);
  readonly data: PdfViewerDialogData = inject(MAT_DIALOG_DATA);
  readonly safeUrl: SafeResourceUrl;

  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.url);
  }
}
