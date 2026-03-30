import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'whizard-version-history-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="flex items-center justify-between px-6 py-5 bg-wrcf-action">
      <span class="text-xl font-medium text-wrcf-text-primary">Version History</span>
      <button mat-icon-button mat-dialog-close class="text-wrcf-text-primary">
        <mat-icon class="size-5" svgIcon="heroicons_outline:x-mark" />
      </button>
    </div>
    <mat-dialog-content class="px-6! py-8!">
      <p class="text-base text-wrcf-text-secondary text-center">Version history coming soon.</p>
    </mat-dialog-content>
  `,
})
export class VersionHistoryDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VersionHistoryDialogComponent>);
}
