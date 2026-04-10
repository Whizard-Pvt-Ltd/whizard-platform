import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogResult, WhizardConfirmationConfig } from './confirmation.types.js';
import { ConfirmationDialogComponent } from './dialog/confirmation-dialog.component.js';

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  private readonly matDialog = inject(MatDialog);

  private readonly defaultConfig: WhizardConfirmationConfig = {
    title: 'Confirm action',
    message: 'Are you sure you want to confirm this action?',
    icon: {
      show: true,
      name: 'lucideIcons:triangle-alert',
      color: 'warning',
    },
    actions: {
      confirm: {
        show: true,
        label: 'Confirm',
        color: 'error',
      },
      cancel: {
        show: true,
        label: 'Cancel',
      },
    },
    dismissible: false,
  };

  open(
    config: WhizardConfirmationConfig = {},
  ): MatDialogRef<ConfirmationDialogComponent, ConfirmationDialogResult> {
    const merged: WhizardConfirmationConfig = {
      ...this.defaultConfig,
      ...config,
      icon: { ...this.defaultConfig.icon, ...config.icon },
      actions: {
        confirm: {
          ...this.defaultConfig.actions?.confirm,
          ...config.actions?.confirm,
        },
        cancel: {
          ...this.defaultConfig.actions?.cancel,
          ...config.actions?.cancel,
        },
      },
    };

    return this.matDialog.open<ConfirmationDialogComponent, WhizardConfirmationConfig, ConfirmationDialogResult>(
      ConfirmationDialogComponent,
      {
        autoFocus: false,
        disableClose: !merged.dismissible,
        data: merged,
        panelClass: 'whizard-confirmation-dialog-panel',
      },
    );
  }
}
