import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ImageLightboxDialogData {
  url: string;
  alt?: string;
}

@Component({
  selector: 'whizard-image-lightbox',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="lightbox-container">
      <button mat-icon-button class="close-btn" (click)="dialogRef.close()" title="Close">
        <mat-icon svgIcon="heroicons_outline:x-mark" class="size-6" />
      </button>
      <img
        [src]="data.url"
        [alt]="data.alt ?? ''"
        class="lightbox-img" />
      @if (data.alt) {
        <p class="lightbox-caption">{{ data.alt }}</p>
      }
    </div>
  `,
  styles: [`
    .lightbox-container {
      display: flex; align-items: center; justify-content: center;
      flex-direction: column;
      position: relative;
      padding: 16px;
    }
    .close-btn {
      position: absolute; top: 0; right: 0;
      color: rgba(255,255,255,0.8);
    }
    .close-btn:hover { color: #fff; }
    .lightbox-img {
      max-width: 100%; max-height: 85vh;
      object-fit: contain;
      border-radius: 8px;
    }
    .lightbox-caption {
      margin-top: 12px;
      font-family: 'Poppins', sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.6);
      text-align: center;
    }
  `],
})
export class ImageLightboxComponent {
  readonly dialogRef = inject(MatDialogRef<ImageLightboxComponent>);
  readonly data: ImageLightboxDialogData = inject(MAT_DIALOG_DATA);
}
