import { Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PdfViewerComponent } from '@whizard/shared-ui';
import type { CollegeDetail, Club, UserContact, CollegeMediaItem, CollegeContact } from '../../models/manage-college.models';

@Component({
  selector: 'whizard-college-detail-panel',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, PdfViewerComponent],
  templateUrl: './college-detail-panel.component.html',
  styleUrl: './college-detail-panel.component.css',
})
export class CollegeDetailPanelComponent {
  readonly college = input<CollegeDetail | null>(null);
  readonly clubs = input<Club[]>([]);
  readonly users = input<UserContact[]>([]);

  readonly editClicked = output<void>();
  readonly previewPdf = output<string>();

  protected aboutExpanded = signal(false);
  protected activePdfUrl = signal<string | null>(null);
  protected activePdfName = signal<string>('Document');

  protected get brochures(): CollegeMediaItem[] {
    return this.college()?.mediaItems.filter(m => m.mediaRole === 'brochure') ?? [];
  }

  protected get videos(): CollegeMediaItem[] {
    return this.college()?.mediaItems.filter(m => m.mediaRole === 'video') ?? [];
  }

  protected get gallery(): CollegeMediaItem[] {
    return this.college()?.mediaItems.filter(m => m.mediaRole === 'gallery') ?? [];
  }

  protected get collegeClubs(): Club[] {
    const college = this.college();
    if (!college) return [];
    const ids = new Set(college.clubIds);
    return this.clubs().filter(c => ids.has(c.id));
  }

  protected getContactByRole(role: string): CollegeContact | undefined {
    return this.college()?.contacts.find(c => c.role === role);
  }

  protected get nonVcContacts(): CollegeContact[] {
    return this.college()?.contacts.filter(c => c.role !== 'VICE_CHANCELLOR') ?? [];
  }

  protected openPdf(url: string, name: string): void {
    this.activePdfUrl.set(url);
    this.activePdfName.set(name);
    this.previewPdf.emit(url);
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
