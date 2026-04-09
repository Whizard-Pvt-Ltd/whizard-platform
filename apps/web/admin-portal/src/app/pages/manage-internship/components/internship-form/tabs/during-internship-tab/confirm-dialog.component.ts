import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'whizard-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="p-6 bg-whizard-bg-card rounded-xl min-w-[400px]">
      <h3 class="text-lg font-semibold text-whizard-text-primary mb-3">{{ data.title }}</h3>
      <p class="text-sm text-whizard-text-secondary mb-6">{{ data.message }}</p>
      <div class="flex justify-end gap-3">
        <button mat-flat-button
          class="!bg-whizard-border !text-whizard-text-primary !rounded-lg !h-10 !px-4"
          (click)="dialogRef.close(false)">
          Cancel
        </button>
        <button mat-flat-button
          class="!bg-whizard-action !text-whizard-text-primary !rounded-lg !h-10 !px-4"
          (click)="dialogRef.close(true)">
          Confirm
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data: { title: string; message: string } = inject(MAT_DIALOG_DATA);
}
