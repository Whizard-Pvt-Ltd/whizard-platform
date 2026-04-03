import { Component, input, output, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'whizard-video-player',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="video-overlay" (click)="closed.emit()">
      <div class="video-container" (click)="$event.stopPropagation()">
        <div class="video-header">
          <span class="video-title">{{ title() }}</span>
          <button mat-icon-button class="action-btn" (click)="closed.emit()" title="Close">
            <mat-icon svgIcon="heroicons_outline:x-mark" class="size-5" />
          </button>
        </div>
        <video
          #videoEl
          class="video-el"
          controls
          autoplay
          [src]="url()">
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  `,
  styles: [`
    .video-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
    }
    .video-container {
      background: var(--wrcf-bg-card, #1E293B);
      border: 1px solid var(--wrcf-border, #484E5D);
      border-radius: 12px;
      width: 100%; max-width: 900px;
      display: flex; flex-direction: column;
      overflow: hidden;
    }
    .video-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--wrcf-border, #484E5D);
      background: var(--wrcf-bg-secondary, #0F253F);
    }
    .video-title {
      font-family: 'Poppins', sans-serif;
      font-size: 15px;
      color: var(--wrcf-text-primary, #E8F0FA);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .action-btn { color: var(--wrcf-text-secondary, #7F94AE); }
    .video-el {
      width: 100%;
      max-height: 75vh;
      background: #000;
      display: block;
    }
  `],
})
export class VideoPlayerComponent implements AfterViewInit {
  readonly url = input.required<string>();
  readonly title = input<string>('Video');
  readonly closed = output<void>();

  private readonly videoEl = viewChild<ElementRef<HTMLVideoElement>>('videoEl');

  ngAfterViewInit(): void {
    this.videoEl()?.nativeElement.play().catch(() => {});
  }
}
