import { Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PageActionsService } from '@whizard/shared-ui';
import { forkJoin } from 'rxjs';
import type {
  CompanyListItem, CompanyDetail, Club, Industry, City, UserContact,
  MediaAsset, CompanyFormValue, PageMode,
} from './models/manage-company.models';
import { CompanyDetailPanelComponent } from './components/company-detail-panel/company-detail-panel.component';
import { CompanyFormComponent } from './components/company-form/company-form.component';
import { CompanyListPanelComponent } from './components/company-list-panel/company-list-panel.component';
import { CompanyPreviewComponent } from './components/company-preview/company-preview.component';
import { MediaLibraryPanelComponent } from './components/media-library-panel/media-library-panel.component';
import { ManageCompanyApiService } from './services/manage-company-api.service';

@Component({
  selector: 'whizard-manage-company',
  standalone: true,
  host: { class: 'flex-1 min-h-0 flex flex-col overflow-hidden' },
  imports: [
    FormsModule,
    MatIconModule,
    CompanyListPanelComponent,
    CompanyDetailPanelComponent,
    CompanyFormComponent,
    MediaLibraryPanelComponent,
    CompanyPreviewComponent,
  ],
  templateUrl: './manage-company.component.html',
  styleUrl: './manage-company.component.css',
})
export class ManageCompanyComponent implements OnInit, OnDestroy {
  private readonly api = inject(ManageCompanyApiService);
  private readonly pageActions = inject(PageActionsService);

  protected mode = signal<PageMode>('list');
  protected companies = signal<CompanyListItem[]>([]);
  protected selectedCompany = signal<CompanyDetail | null>(null);
  protected clubs = signal<Club[]>([]);
  protected industries = signal<Industry[]>([]);
  protected cities = signal<City[]>([]);
  protected users = signal<UserContact[]>([]);
  protected mediaAssets = signal<MediaAsset[]>([]);
  protected loading = signal(false);
  protected mediaLoading = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected get selectedCompanyId(): string | null {
    return this.selectedCompany()?.id ?? null;
  }

  constructor() {
    effect(() => {
      const m = this.mode();
      if (m === 'list') {
        const hasSelected = !!this.selectedCompany();
        this.pageActions.set([
          ...(hasSelected ? [{ label: 'Edit', icon: 'heroicons_outline:pencil-square', variant: 'outline' as const, action: () => this.onEditClicked() }] : []),
          { label: 'Add', icon: 'heroicons_outline:plus', variant: 'primary', action: () => this.onAddClicked() },
        ]);
      } else if (m === 'edit' || m === 'create') {
        this.pageActions.set([
          { label: 'Back', icon: 'heroicons_outline:arrow-left', variant: 'outline', action: () => this.onFormCancelled() },
          { label: 'Preview', variant: 'secondary', action: () => this.onPreviewClicked() },
        ]);
      } else if (m === 'preview') {
        this.pageActions.set([
          { label: 'Back', icon: 'heroicons_outline:arrow-left', variant: 'outline', action: () => this.onBackFromPreview() },
        ]);
      }
    });
  }

  ngOnDestroy(): void {
    this.pageActions.clear();
  }

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      companies: this.api.listCompanies(),
      clubs: this.api.listClubs(),
      industries: this.api.listIndustries(),
      cities: this.api.listCities(),
      users: this.api.listUsersForContacts(),
    }).subscribe({
      next: ({ companies, clubs, industries, cities, users }) => {
        this.companies.set(companies);
        this.clubs.set(clubs);
        this.industries.set(industries);
        this.cities.set(cities);
        this.users.set(users);
        this.loading.set(false);

        if (companies.length > 0) {
          this.loadCompanyDetail(companies[0].id);
        }
      },
      error: () => {
        this.loading.set(false);
        this.showError('Failed to load data.');
      },
    });
  }

  protected onCompanySelected(id: string): void {
    this.loadCompanyDetail(id);
  }

  private loadCompanyDetail(id: string): void {
    this.api.getCompanyById(id).subscribe({
      next: company => {
        this.selectedCompany.set(company);
        this.mode.set('list');
      },
      error: () => this.showError('Failed to load company details.'),
    });
  }

  protected onAddClicked(): void {
    this.selectedCompany.set(null);
    this.mode.set('create');
  }

  protected onEditClicked(): void {
    if (this.selectedCompany()) {
      this.mode.set('edit');
    }
  }

  protected onFormCancelled(): void {
    this.mode.set('list');
  }

  protected onSaved(formValue: CompanyFormValue): void {
    const existing = this.selectedCompany();
    if (existing) {
      this.api.updateCompany(existing.id, formValue).subscribe({
        next: updated => {
          this.selectedCompany.set(updated);
          this.companies.update(list =>
            list.map(c => c.id === updated.id ? updated : c),
          );
          this.mode.set('list');
        },
        error: () => this.showError('Failed to save company.'),
      });
    } else {
      this.api.createCompany(formValue).subscribe({
        next: created => {
          this.selectedCompany.set(created);
          this.companies.update(list => [created, ...list]);
          this.mode.set('list');
        },
        error: () => this.showError('Failed to create company.'),
      });
    }
  }

  protected onPublished(formValue: CompanyFormValue): void {
    const existing = this.selectedCompany();

    const doPublish = (id: string) => {
      this.api.publishCompany(id).subscribe({
        next: published => {
          this.selectedCompany.set(published);
          this.companies.update(list =>
            list.map(c => c.id === published.id ? published : c),
          );
          this.mode.set('list');
        },
        error: () => this.showError('Failed to publish company.'),
      });
    };

    if (existing) {
      this.api.updateCompany(existing.id, formValue).subscribe({
        next: updated => {
          this.selectedCompany.set(updated);
          doPublish(updated.id);
        },
        error: () => this.showError('Failed to save before publish.'),
      });
    } else {
      this.api.createCompany(formValue).subscribe({
        next: created => {
          this.selectedCompany.set(created);
          this.companies.update(list => [created, ...list]);
          doPublish(created.id);
        },
        error: () => this.showError('Failed to create before publish.'),
      });
    }
  }

  protected onMediaUploadRequested(file: File): void {
    this.mediaLoading.set(true);
    this.api.uploadMediaAsset(file).subscribe({
      next: asset => {
        this.mediaAssets.update(list => [asset, ...list]);
        this.mediaLoading.set(false);
      },
      error: () => {
        this.mediaLoading.set(false);
        this.showError('Failed to upload media asset.');
      },
    });
  }

  protected onMediaAssetSelected(_asset: MediaAsset): void {
    // Asset selected from library — attaching is handled inside the form
  }

  protected onPreviewClicked(): void {
    if (this.selectedCompany()) {
      this.mode.set('preview');
    }
  }

  protected onBackFromPreview(): void {
    const prev = this.selectedCompany();
    this.mode.set(prev ? 'list' : 'create');
  }

  private showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 4000);
  }
}
