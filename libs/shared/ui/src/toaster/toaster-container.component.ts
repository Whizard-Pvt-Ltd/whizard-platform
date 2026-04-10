import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { ToastComponent } from './toast.component.js';
import { ToasterService } from './toaster.service.js';

@Component({
  selector: 'whizard-toaster-container',
  standalone: true,
  imports: [ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="whizard-toaster-container" aria-live="polite" aria-atomic="false">
      @for (toast of toasterService.toasts(); track toast.id) {
        <whizard-toast
          [toast]="toast"
          (dismiss)="toasterService.dismiss($event)" />
      }
    </div>
  `,
  styles: [`
    .whizard-toaster-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
      max-width: calc(100vw - 48px);
    }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class ToasterContainerComponent {
  readonly toasterService = inject(ToasterService);
}
