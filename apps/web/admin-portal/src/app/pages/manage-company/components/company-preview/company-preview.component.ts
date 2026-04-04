import { TitleCasePipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { CompanyDetail, Club, UserContact, CompanyMediaItem, CompanyClubItem } from '../../models/manage-company.models';

@Component({
  selector: 'whizard-company-preview',
  standalone: true,
  // host: { class: 'flex-1 min-h-0 flex flex-col' },
  imports: [TitleCasePipe, MatButtonModule, MatIconModule],
  templateUrl: './company-preview.component.html',
  styleUrl: './company-preview.component.css',
})
export class CompanyPreviewComponent {
  readonly company = input.required<CompanyDetail>();
  readonly clubs = input<Club[]>([]);
  readonly users = input<UserContact[]>([]);

  readonly backClicked = output<void>();

  protected descriptionExpanded = signal(false);

  protected get logo(): CompanyMediaItem | undefined {
    return this.company().mediaItems.find(m => m.mediaRole === 'logo');
  }

  protected get brochures(): CompanyMediaItem[] {
    return this.company().mediaItems.filter(m => m.mediaRole === 'brochure');
  }

  protected get promoVideos(): CompanyMediaItem[] {
    return this.company().mediaItems.filter(m => m.mediaRole === 'promotional_video');
  }

  protected get gallery(): CompanyMediaItem[] {
    return this.company().mediaItems.filter(m => m.mediaRole === 'gallery');
  }

  protected get testimonials(): CompanyMediaItem[] {
    return this.company().mediaItems.filter(m => m.mediaRole === 'testimonial');
  }

  protected get parentClub(): Club | undefined {
    const item = this.company().clubs.find((c: CompanyClubItem) => c.isParent);
    return item ? this.clubs().find(c => c.id === item.clubId) : undefined;
  }

  protected get associatedClub(): Club | undefined {
    const item = this.company().clubs.find((c: CompanyClubItem) => !c.isParent);
    return item ? this.clubs().find(c => c.id === item.clubId) : undefined;
  }

  protected get hrCoordinators(): UserContact[] {
    return this.company().contacts
      .filter(c => c.role === 'HR_COORDINATOR')
      .map(c => this.users().find(u => u.id === c.userId))
      .filter((u): u is UserContact => !!u);
  }

  protected getContactsForRole(role: string): UserContact[] {
    return this.company().contacts
      .filter(c => c.role === role)
      .map(c => this.users().find(u => u.id === c.userId))
      .filter((u): u is UserContact => !!u);
  }

  protected getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
