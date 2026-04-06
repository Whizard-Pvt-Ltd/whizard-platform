import { Component, input, output, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfViewerComponent, VideoPlayerComponent, ImageLightboxComponent, ScrollbarDirective } from '@whizard/shared-ui';
import type { CollegeDetail, Club, UserContact, CollegeMediaItem, CollegeContact } from '../../models/manage-college.models';

@Component({
  selector: 'whizard-college-detail-panel',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    PdfViewerComponent,
    VideoPlayerComponent,
    ImageLightboxComponent,
    ScrollbarDirective,
  ],
  templateUrl: './college-detail-panel.component.html',
  styleUrl: './college-detail-panel.component.css',
})
export class CollegeDetailPanelComponent {
  readonly college = input<CollegeDetail | null>(null);
  readonly clubs = input<Club[]>([]);
  readonly users = input<UserContact[]>([]);
  readonly editClicked = output<void>();

  readonly previewPdf = output<string>();

  private readonly sanitizer = inject(DomSanitizer);

  protected aboutExpanded = signal(false);
  protected activePdfUrl = signal<string | null>(null);
  protected activePdfName = signal<string>('Document');
  protected activeVideoUrl = signal<string | null>(null);
  protected activeVideoTitle = signal<string>('Video');
  protected activeImageUrl = signal<string | null>(null);
  protected activeImageAlt = signal<string>('');

  private static readonly MOCK_IMAGES = [
    'assets/images/Screenshot-2026-04-01-at-9.47.42-AM.png',
    'assets/images/Screenshot-2026-04-01-at-9.47.59-AM.png',
    'assets/images/Screenshot-2026-04-01-at-9.48.12-AM.png',
    'assets/images/Screenshot-2026-04-01-at-9.48.23-AM.png',
    'assets/images/Screenshot-2026-04-01-at-10.23.51-AM.png',
    'assets/images/Screenshot-2026-04-01-at-10.24.01-AM.png',
    'assets/images/Screenshot-2026-04-01-at-10.24.12-AM.png',
    'assets/images/Screenshot-2026-04-01-at-10.24.23-AM.png',
    'assets/images/Screenshot-2026-04-01-at-10.24.32-AM.png',
  ];

  protected get brochures(): CollegeMediaItem[] {
    const real =
      this.college()?.mediaItems.filter((m) => m.mediaRole === 'brochure') ??
      [];
    if (real.length > 0) return real;
    return [
      {
        mediaAssetId: 'mock-brochure-1',
        mediaRole: 'brochure',
        sortOrder: 0,
        asset: {
          id: 'mock-brochure-1',
          url: 'assets/pdfs/Whizard-SRS.pdf',
          thumbnailUrl: null,
          name: 'Whizard-SRS.pdf',
          key: 'mock',
          type: 'pdf',
          mimeType: 'application/pdf',
          sizeBytes: 0,
        },
      },
    ];
  }

  protected get videos(): CollegeMediaItem[] {
    const real =
      this.college()?.mediaItems.filter((m) => m.mediaRole === 'video') ?? [];
    if (real.length > 0) return real;
    return [1, 2, 3].map((i) => ({
      mediaAssetId: `mock-vid-${i}`,
      mediaRole: 'video',
      sortOrder: i,
      asset: {
        id: `mock-vid-${i}`,
        url: 'assets/videos/turtlelow.mp4',
        thumbnailUrl: null,
        name: `Promo Video ${i}`,
        key: 'mock',
        type: 'video',
        mimeType: 'video/mp4',
        sizeBytes: 0,
      },
    }));
  }

  protected get gallery(): CollegeMediaItem[] {
    const real =
      this.college()?.mediaItems.filter((m) => m.mediaRole === 'gallery') ?? [];
    if (real.length > 0) return real;
    return CollegeDetailPanelComponent.MOCK_IMAGES.slice(3, 9).map(
      (url, i) => ({
        mediaAssetId: `mock-gallery-${i}`,
        mediaRole: 'gallery',
        sortOrder: i,
        asset: {
          id: `mock-gallery-${i}`,
          url,
          thumbnailUrl: url,
          name: `Campus Image ${i + 1}`,
          key: 'mock',
          type: 'image',
          mimeType: 'image/png',
          sizeBytes: 0,
        },
      }),
    );
  }

  protected get collegeClubs(): Club[] {
    const college = this.college();
    if (!college) return [];
    const ids = new Set(college.clubIds);
    return this.clubs().filter((c) => ids.has(c.id));
  }

  protected getContactByRole(role: string): CollegeContact | undefined {
    return this.college()?.contacts.find((c) => c.role === role);
  }

  protected get nonVcContacts(): CollegeContact[] {
    return (
      this.college()?.contacts.filter((c) => c.role !== 'VICE_CHANCELLOR') ?? []
    );
  }

  protected safeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  protected openPdf(url: string, name: string): void {
    this.activePdfUrl.set(url);
    this.activePdfName.set(name);
    this.previewPdf.emit(url);
  }

  protected closePdf(): void {
    this.activePdfUrl.set(null);
  }

  protected openVideo(url: string, title: string): void {
    this.activeVideoUrl.set(url);
    this.activeVideoTitle.set(title);
  }
  protected closeVideo(): void {
    this.activeVideoUrl.set(null);
  }

  protected openImage(url: string, alt: string): void {
    this.activeImageUrl.set(url);
    this.activeImageAlt.set(alt);
  }
  protected closeImage(): void {
    this.activeImageUrl.set(null);
  }

  protected toggleAbout(): void {
    this.aboutExpanded.update((v) => !v);
  }

  protected getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
