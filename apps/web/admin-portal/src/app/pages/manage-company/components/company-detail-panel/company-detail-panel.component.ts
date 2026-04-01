import { TitleCasePipe } from '@angular/common';
import { Component, input, output, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type {
  CompanyDetail, Club, UserContact, CompanyMediaItem, CompanyClubItem,
} from '../../models/manage-company.models';

@Component({
  selector: 'whizard-company-detail-panel',
  standalone: true,
  imports: [TitleCasePipe, MatButtonModule, MatIconModule],
  templateUrl: './company-detail-panel.component.html',
  styleUrl: './company-detail-panel.component.css',
})
export class CompanyDetailPanelComponent {
  readonly company = input<CompanyDetail | null>(null);
  readonly clubs = input<Club[]>([]);
  readonly users = input<UserContact[]>([]);

  readonly editClicked = output<void>();
  readonly previewClicked = output<void>();

  protected descriptionExpanded = signal(false);

  protected get logo(): CompanyMediaItem | undefined {
    return this.company()?.mediaItems.find(m => m.mediaRole === 'logo');
  }

  protected get brochures(): CompanyMediaItem[] {
    return this.company()?.mediaItems.filter(m => m.mediaRole === 'brochure') ?? [];
  }

  protected get promoVideos(): CompanyMediaItem[] {
    return this.company()?.mediaItems.filter(m => m.mediaRole === 'promotional_video') ?? [];
  }

  protected get gallery(): CompanyMediaItem[] {
    return this.company()?.mediaItems.filter(m => m.mediaRole === 'gallery') ?? [];
  }

  protected get testimonials(): CompanyMediaItem[] {
    return this.company()?.mediaItems.filter(m => m.mediaRole === 'testimonial') ?? [];
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

  protected toggleDescription(): void {
    this.descriptionExpanded.update(v => !v);
  }

  protected getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
