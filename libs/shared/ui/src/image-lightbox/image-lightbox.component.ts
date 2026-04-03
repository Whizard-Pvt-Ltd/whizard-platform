import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'whizard-image-lightbox',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="lightbox-overlay" (click)="closed.emit()">
      <button mat-icon-button class="close-btn" (click)="closed.emit()" title="Close">
        <mat-icon svgIcon="heroicons_outline:x-mark" class="size-6" />
      </button>
      <img
        [src]="url()"
        [alt]="alt()"
        class="lightbox-img"
        (click)="$event.stopPropagation()" />
      @if (alt()) {
        <p class="lightbox-caption" (click)="$event.stopPropagation()">{{ alt() }}</p>
      }
    </div>
  `,
  styles: [`
    .lightbox-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.9);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column;
      padding: 24px;
    }
    .close-btn {
      position: absolute; top: 16px; right: 16px;
      color: rgba(255,255,255,0.8);
    }
    .close-btn:hover { color: #fff; }
    .lightbox-img {
      max-width: 100%; max-height: 85vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
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
  readonly url = input.required<string>();
  readonly alt = input<string>('');
  readonly closed = output<void>();
}
