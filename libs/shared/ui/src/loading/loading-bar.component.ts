import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from './loading.service.js';

@Component({
  selector: 'whizard-loading-bar',
  standalone: true,
  imports: [MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading.show$()) {
      <mat-progress-bar
        class="whizard-loading-bar__bar"
        [mode]="loading.mode$()"
        [value]="loading.progress$()"
      />
    }
  `,
  styles: [
    `
      whizard-loading-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
        pointer-events: none;
        display: block;
      }

      whizard-loading-bar .whizard-loading-bar__bar {
        height: 3px;
      }

      whizard-loading-bar .whizard-loading-bar__bar .mdc-linear-progress__buffer-bar {
        background-color: transparent;
      }

      whizard-loading-bar
        .whizard-loading-bar__bar
        .mdc-linear-progress__bar-inner {
        border-color: #00bfff;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class LoadingBarComponent {
  readonly loading = inject(LoadingService);
}
