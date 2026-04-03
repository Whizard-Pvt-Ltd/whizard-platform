import { TitleCasePipe } from '@angular/common';
import { Component, input, output, signal, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfViewerComponent, VideoPlayerComponent, ImageLightboxComponent } from '@whizard/shared-ui';
import type {
  CompanyDetail, Club, UserContact, CompanyMediaItem, CompanyClubItem,
} from '../../models/manage-company.models';

@Component({
  selector: 'whizard-company-detail-panel',
  standalone: true,
  imports: [TitleCasePipe, MatButtonModule, MatIconModule, PdfViewerComponent, VideoPlayerComponent, ImageLightboxComponent],
  templateUrl: './company-detail-panel.component.html',
  styleUrl: './company-detail-panel.component.css',
})
export class CompanyDetailPanelComponent {
  readonly company = input<CompanyDetail | null>(null);
  readonly clubs = input<Club[]>([]);
  readonly users = input<UserContact[]>([]);

  readonly editClicked = output<void>();
  readonly previewClicked = output<void>();

  private readonly sanitizer = inject(DomSanitizer);

  protected descriptionExpanded = signal(false);
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

  protected get logo(): CompanyMediaItem | undefined {
    const real = this.company()?.mediaItems.find(m => m.mediaRole === 'logo');
    if (real) return real;
    return {
      mediaAssetId: 'mock-logo', mediaRole: 'logo', sortOrder: 0,
      asset: { id: 'mock-logo', url: CompanyDetailPanelComponent.MOCK_IMAGES[7], thumbnailUrl: CompanyDetailPanelComponent.MOCK_IMAGES[7], name: 'logo', key: 'mock', type: 'image', mimeType: 'image/png', sizeBytes: 0 },
    };
  }

  protected get brochures(): CompanyMediaItem[] {
    const real = this.company()?.mediaItems.filter(m => m.mediaRole === 'brochure') ?? [];
    if (real.length > 0) return real;
    return [{
      mediaAssetId: 'mock-brochure-1', mediaRole: 'brochure', sortOrder: 0,
      asset: { id: 'mock-brochure-1', url: 'assets/pdfs/Whizard-SRS.pdf', thumbnailUrl: null, name: 'Whizard-SRS.pdf', key: 'mock', type: 'pdf', mimeType: 'application/pdf', sizeBytes: 0 },
    }];
  }

  protected get promoVideos(): CompanyMediaItem[] {
    const real = this.company()?.mediaItems.filter(m => m.mediaRole === 'promotional_video') ?? [];
    if (real.length > 0) return real;
    return [1, 2, 3].map(i => ({
      mediaAssetId: `mock-vid-${i}`, mediaRole: 'promotional_video', sortOrder: i,
      asset: { id: `mock-vid-${i}`, url: 'assets/videos/turtlelow.mp4', thumbnailUrl: null, name: `Promo Video ${i}`, key: 'mock', type: 'video', mimeType: 'video/mp4', sizeBytes: 0 },
    }));
  }

  protected get gallery(): CompanyMediaItem[] {
    const real = this.company()?.mediaItems.filter(m => m.mediaRole === 'gallery') ?? [];
    if (real.length > 0) return real;
    return CompanyDetailPanelComponent.MOCK_IMAGES.slice(0, 6).map((url, i) => ({
      mediaAssetId: `mock-gallery-${i}`, mediaRole: 'gallery', sortOrder: i,
      asset: { id: `mock-gallery-${i}`, url, thumbnailUrl: url, name: `Gallery Image ${i + 1}`, key: 'mock', type: 'image', mimeType: 'image/png', sizeBytes: 0 },
    }));
  }

  protected get testimonials(): CompanyMediaItem[] {
    const real = this.company()?.mediaItems.filter(m => m.mediaRole === 'testimonial') ?? [];
    if (real.length > 0) return real;
    return [1, 2].map(i => ({
      mediaAssetId: `mock-test-${i}`, mediaRole: 'testimonial', sortOrder: i,
      asset: { id: `mock-test-${i}`, url: 'assets/videos/turtlelow.mp4', thumbnailUrl: null, name: `Employee Story ${i}`, key: 'mock', type: 'video', mimeType: 'video/mp4', sizeBytes: 0 },
    }));
  }

  protected get parentClub(): Club | undefined {
    const parentItem = this.company()?.clubs.find((c: CompanyClubItem) => c.isParent);
    if (!parentItem) return undefined;
    return this.clubs().find(c => c.id === parentItem.clubId);
  }

  protected get associatedClub(): Club | undefined {
    const assocItem = this.company()?.clubs.find((c: CompanyClubItem) => !c.isParent);
    if (!assocItem) return undefined;
    return this.clubs().find(c => c.id === assocItem.clubId);
  }

  protected get hrCoordinators(): UserContact[] {
    const hrContacts = this.company()?.contacts.filter(c => c.role === 'HR_COORDINATOR') ?? [];
    return hrContacts
      .map(c => this.users().find(u => u.id === c.userId))
      .filter((u): u is UserContact => !!u);
  }

  protected getContactUser(userId: string): UserContact | undefined {
    return this.users().find(u => u.id === userId);
  }

  protected getContactsForRole(role: string): UserContact[] {
    const contacts = this.company()?.contacts.filter(c => c.role === role) ?? [];
    return contacts
      .map(c => {
        const user = this.users().find(u => u.id === c.userId);
        return user;
      })
      .filter((u): u is UserContact => !!u);
  }

  protected readonly currentYear = new Date().getFullYear();

  protected safeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  protected openPdf(url: string, name: string): void {
    this.activePdfUrl.set(url);
    this.activePdfName.set(name);
  }
  protected closePdf(): void { this.activePdfUrl.set(null); }

  protected openVideo(url: string, title: string): void {
    this.activeVideoUrl.set(url);
    this.activeVideoTitle.set(title);
  }
  protected closeVideo(): void { this.activeVideoUrl.set(null); }

  protected openImage(url: string, alt: string): void {
    this.activeImageUrl.set(url);
    this.activeImageAlt.set(alt);
  }
  protected closeImage(): void { this.activeImageUrl.set(null); }

  protected toggleDescription(): void {
    this.descriptionExpanded.update(v => !v);
  }

  protected getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
