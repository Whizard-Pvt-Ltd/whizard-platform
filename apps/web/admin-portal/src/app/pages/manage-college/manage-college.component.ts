import { Component, inject, signal, OnInit, computed, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import type {
  CollegeListItem, CollegeDetail, Club, DegreeProgram, City, UserContact,
  MediaAsset, CollegeFormValue, PageMode,
} from './models/manage-college.models';
import { NavDrawerComponent } from '../../shared/nav-drawer/nav-drawer.component';
import { CollegeDetailPanelComponent } from './components/college-detail-panel/college-detail-panel.component';
import { CollegeFormComponent } from './components/college-form/college-form.component';
import { CollegeListPanelComponent } from './components/college-list-panel/college-list-panel.component';
import { CollegePreviewComponent } from './components/college-preview/college-preview.component';
import { MediaLibraryPanelComponent } from './components/media-library-panel/media-library-panel.component';
import { ManageCollegeApiService } from './services/manage-college-api.service';

const FILTER_CHIPS = [
  'Club', 'Project', 'Job', 'Internship', 'Mentor',
  'College', 'Company', 'Event', 'Student Profile', 'All Filters',
] as const;

@Component({
  selector: 'whizard-manage-college',
  standalone: true,
  imports: [
    MatIconModule,
    NavDrawerComponent,
    CollegeListPanelComponent,
    CollegeDetailPanelComponent,
    CollegeFormComponent,
    MediaLibraryPanelComponent,
    CollegePreviewComponent,
  ],
  templateUrl: './manage-college.component.html',
  styleUrl: './manage-college.component.css',
})
export class ManageCollegeComponent implements OnInit {
  private readonly api = inject(ManageCollegeApiService);

  protected mode = signal<PageMode>('list');
  protected colleges = signal<CollegeListItem[]>([]);
  protected selectedCollege = signal<CollegeDetail | null>(null);
  protected clubs = signal<Club[]>([]);
  protected programs = signal<DegreeProgram[]>([]);
  protected cities = signal<City[]>([]);
  protected users = signal<UserContact[]>([]);
  protected mediaAssets = signal<MediaAsset[]>([]);
  protected loading = signal(false);
  protected mediaLoading = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected drawerOpen = signal(false);

  // Top bar: filter chips
  protected readonly filterChips = FILTER_CHIPS;
  protected activeChip = signal<string>('College');

  // Reference to the form for header button actions
  private readonly formRef = viewChild(CollegeFormComponent);
  protected formIsValid = computed(() => this.formRef()?.isValid ?? false);

  protected get selectedCollegeId(): string | null {
    return this.selectedCollege()?.id ?? null;
  }

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      collegesResult: this.api.listColleges(),
      clubs: this.api.listClubs(),
      programs: this.api.listDegreePrograms(),
      cities: this.api.listCities(),
      users: this.api.listUsersForContacts(),
      mediaAssets: this.api.listMediaAssets(),
    }).subscribe({
      next: ({ collegesResult, clubs, programs, cities, users, mediaAssets }) => {
        this.colleges.set(collegesResult.items);
        this.clubs.set(clubs);
        this.programs.set(programs);
        this.cities.set(cities);
        this.users.set(users);
        this.mediaAssets.set(mediaAssets);
        this.loading.set(false);

        if (collegesResult.items.length > 0) {
          this.loadCollegeDetail(collegesResult.items[0].id);
        }
      },
      error: () => {
        this.loading.set(false);
        this.showError('Failed to load data.');
      },
    });
  }

  protected onCollegeSelected(id: string): void {
    this.loadCollegeDetail(id);
  }

  private loadCollegeDetail(id: string): void {
    this.api.getCollegeById(id).subscribe({
      next: college => {
        this.selectedCollege.set(college);
        this.mode.set('list');
      },
      error: () => this.showError('Failed to load college details.'),
    });
  }

  protected onAddClicked(): void {
    this.selectedCollege.set(null);
    this.mode.set('create');
  }

  protected onEditClicked(): void {
    if (this.selectedCollege()) {
      this.mode.set('edit');
    }
  }

  protected onFormCancelled(): void {
    this.mode.set('list');
  }

  protected onSaved(formValue: CollegeFormValue): void {
    const existing = this.selectedCollege();
    if (existing) {
      this.api.updateCollege(existing.id, formValue).subscribe({
        next: updated => {
          this.selectedCollege.set(updated);
          this.colleges.update(list =>
            list.map(c => c.id === updated.id ? updated : c),
          );
          this.mode.set('list');
        },
        error: () => this.showError('Failed to save college.'),
      });
    } else {
      this.api.createCollege(formValue).subscribe({
        next: created => {
          this.selectedCollege.set(created);
          this.colleges.update(list => [created, ...list]);
          this.mode.set('list');
        },
        error: () => this.showError('Failed to create college.'),
      });
    }
  }

  protected onPublished(formValue: CollegeFormValue): void {
    const existing = this.selectedCollege();

    const doPublish = (id: string) => {
      this.api.publishCollege(id).subscribe({
        next: published => {
          this.selectedCollege.set(published);
          this.colleges.update(list =>
            list.map(c => c.id === published.id ? published : c),
          );
          this.mode.set('list');
        },
        error: () => this.showError('Failed to publish college.'),
      });
    };

    if (existing) {
      this.api.updateCollege(existing.id, formValue).subscribe({
        next: updated => {
          this.selectedCollege.set(updated);
          doPublish(updated.id);
        },
        error: () => this.showError('Failed to save before publish.'),
      });
    } else {
      this.api.createCollege(formValue).subscribe({
        next: created => {
          this.selectedCollege.set(created);
          this.colleges.update(list => [created, ...list]);
          doPublish(created.id);
        },
        error: () => this.showError('Failed to create before publish.'),
      });
    }
  }

  protected onMediaUploadRequested(event: { file: File; type: string }): void {
    const assetType = event.type as 'image' | 'video' | 'pdf';
    this.api.uploadMediaAsset(event.file, assetType).subscribe({
      next: asset => {
        this.mediaAssets.update(list => [asset, ...list]);
      },
      error: () => this.showError('Failed to upload media asset.'),
    });
  }

  protected onMediaAssetSelected(_asset: MediaAsset): void {
    // Media asset selected from library — can be used to attach to form in future
  }

  protected onPreviewClicked(): void {
    this.mode.set('preview');
  }

  protected onBackFromPreview(): void {
    const prev = this.selectedCollege();
    this.mode.set(prev ? 'edit' : 'create');
  }

  protected onHeaderSave(): void {
    this.formRef()?.doSave();
  }

  protected onHeaderPublish(): void {
    this.formRef()?.doPublish();
  }

  protected setActiveChip(chip: string): void {
    this.activeChip.set(chip);
  }

  private showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 4000);
  }
}
