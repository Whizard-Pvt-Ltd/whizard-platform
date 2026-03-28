import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'whizard-publish-draft-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="flex items-center justify-between px-6 py-5 bg-[#314DDF]">
      <span class="text-xl font-medium text-[#E8F0FA]">Publish Draft</span>
      <button mat-icon-button mat-dialog-close class="text-[#E8F0FA]">
        <mat-icon class="size-5" svgIcon="heroicons_outline:x-mark" />
      </button>
    </div>
    <mat-dialog-content class="px-6! py-8!">
      <p class="text-base text-[#7F94AE] text-center">Publish draft coming soon.</p>
    </mat-dialog-content>
  `,
})
export class PublishDraftDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PublishDraftDialogComponent>);
}
