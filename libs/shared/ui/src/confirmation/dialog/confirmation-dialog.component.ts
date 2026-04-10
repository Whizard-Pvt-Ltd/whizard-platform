import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { WhizardConfirmationConfig } from '../confirmation.types.js';

@Component({
  selector: 'whizard-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  templateUrl: './confirmation-dialog.component.html',
  styles: [`
    .whizard-confirmation-dialog-panel .mat-mdc-dialog-surface {
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 16px !important;
      padding: 0 !important;
      overflow: hidden;
    }
    .whizard-confirmation-dialog-panel .mat-mdc-dialog-container {
      --mdc-dialog-container-color: transparent;
      padding: 0 !important;
    }

    .whizard-confirmation {
      display: flex;
      flex-direction: column;
      width: 499px;
      max-width: 100%;
      background: rgba(30, 41, 59, 0.94);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      box-shadow: 0 8px 36px 0 rgba(0, 0, 0, 0.16);
      font-family: 'Red Hat Display', system-ui, sans-serif;
      overflow: hidden;
    }

    .whizard-confirmation__header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 24px 0;
      position: relative;
    }

    .whizard-confirmation__icon {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      background: rgba(0, 132, 255, 0.1);
      color: #0084ff;
    }
    .whizard-confirmation__icon mat-icon {
      width: 24px;
      height: 24px;
      font-size: 24px;
      line-height: 24px;
    }
    .whizard-confirmation__icon[data-color="primary"],
    .whizard-confirmation__icon[data-color="info"] {
      background: rgba(0, 132, 255, 0.1);
      color: #0084ff;
    }
    .whizard-confirmation__icon[data-color="accent"] {
      background: rgba(49, 77, 223, 0.12);
      color: #314ddf;
    }
    .whizard-confirmation__icon[data-color="success"] {
      background: rgba(1, 225, 123, 0.1);
      color: #01e17b;
    }
    .whizard-confirmation__icon[data-color="warning"] {
      background: rgba(253, 205, 15, 0.12);
      color: #fdcd0f;
    }
    .whizard-confirmation__icon[data-color="error"],
    .whizard-confirmation__icon[data-color="warn"] {
      background: rgba(240, 67, 73, 0.1);
      color: #f04349;
    }
    .whizard-confirmation__icon[data-color="basic"] {
      background: rgba(127, 148, 174, 0.12);
      color: #7f94ae;
    }

    .whizard-confirmation__title {
      margin: 0;
      flex: 1 1 auto;
      min-width: 0;
      font-family: 'Red Hat Display', system-ui, sans-serif;
      font-size: 19px;
      font-weight: 700;
      line-height: 24px;
      color: #e8f0fa;
    }

    .whizard-confirmation__close {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: #7f94ae;
      border-radius: 8px;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .whizard-confirmation__close:hover {
      background: rgba(127, 148, 174, 0.12);
      color: #e8f0fa;
    }
    .whizard-confirmation__close mat-icon {
      width: 20px;
      height: 20px;
      font-size: 20px;
    }

    .whizard-confirmation__body {
      padding: 10px 24px 20px 76px;
    }
    .whizard-confirmation__message {
      margin: 0;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #7f94ae;
      white-space: pre-wrap;
    }

    .whizard-confirmation__actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      height: 60px;
      padding: 15px;
      background: rgba(15, 23, 42, 0.6);
      border-top: 1px solid rgba(72, 78, 93, 0.6);
    }

    .whizard-confirmation__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 42px;
      min-width: 100px;
      padding: 0 16px;
      border-radius: 8px;
      font-family: 'Red Hat Display', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 600;
      line-height: 24px;
      cursor: pointer;
      transition: background 120ms ease, border-color 120ms ease, filter 120ms ease;
      white-space: nowrap;
    }

    .whizard-confirmation__btn--cancel {
      background: transparent;
      color: #ffffff;
      border: 1px solid #484e5d;
    }
    .whizard-confirmation__btn--cancel:hover {
      background: rgba(72, 78, 93, 0.25);
      border-color: #7f94ae;
    }

    .whizard-confirmation__btn--confirm {
      border: none;
      color: #ffffff;
      background: #314ddf;
    }
    .whizard-confirmation__btn--confirm:hover {
      filter: brightness(1.08);
    }
    .whizard-confirmation__btn--confirm[data-color="primary"],
    .whizard-confirmation__btn--confirm[data-color="info"] {
      background: #314ddf;
    }
    .whizard-confirmation__btn--confirm[data-color="accent"] {
      background: #00bfff;
      color: #0f172a;
    }
    .whizard-confirmation__btn--confirm[data-color="success"] {
      background: #28a745;
    }
    .whizard-confirmation__btn--confirm[data-color="warning"] {
      background: #ffa500;
    }
    .whizard-confirmation__btn--confirm[data-color="error"],
    .whizard-confirmation__btn--confirm[data-color="warn"] {
      background: #f04349;
    }

    @media (max-width: 560px) {
      .whizard-confirmation { width: 100%; }
      .whizard-confirmation__body { padding-left: 24px; }
    }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class ConfirmationDialogComponent {
  readonly data: WhizardConfirmationConfig = inject(MAT_DIALOG_DATA);
  readonly matDialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
}
