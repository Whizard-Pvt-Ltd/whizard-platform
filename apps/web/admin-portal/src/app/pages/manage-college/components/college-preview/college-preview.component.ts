import { Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PdfViewerComponent } from '@whizard/shared-ui';
import type { CollegeDetail, Club, CollegeMediaItem } from '../../models/manage-college.models';

@Component({
  selector: 'whizard-college-preview',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, PdfViewerComponent],
  templateUrl: './college-preview.component.html',
  styleUrl: './college-preview.component.css',
})
export class CollegePreviewComponent {
  readonly college = input.required<CollegeDetail>();
  readonly clubs = input<Club[]>([]);

  readonly backClicked = output<void>();

  protected aboutExpanded = signal(false);
  protected activePdfUrl = signal<string | null>(null);
  protected activePdfName = signal<string>('Document');

  protected get brochures(): CollegeMediaItem[] {
    return this.college().mediaItems.filter(m => m.mediaRole === 'brochure');
  }

  protected get videos(): CollegeMediaItem[] {
    return this.college().mediaItems.filter(m => m.mediaRole === 'video');
  }

  protected get gallery(): CollegeMediaItem[] {
    return this.college().mediaItems.filter(m => m.mediaRole === 'gallery');
  }

  protected get collegeClubs(): Club[] {
    const ids = new Set(this.college().clubIds);
    return this.clubs().filter(c => ids.has(c.id));
  }

  protected openPdf(url: string, name: string): void {
    this.activePdfUrl.set(url);
    this.activePdfName.set(name);
  }

  protected closePdf(): void {
    this.activePdfUrl.set(null);
  }

  protected toggleAbout(): void {
    this.aboutExpanded.update(v => !v);
  }

  protected getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
