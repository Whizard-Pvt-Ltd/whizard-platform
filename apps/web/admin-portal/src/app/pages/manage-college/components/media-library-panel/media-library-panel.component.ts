import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MediaUploaderComponent } from '@whizard/shared-ui';
import type { UploadedFile } from '@whizard/shared-ui';
import type { MediaAsset } from '../../models/manage-college.models';

type AssetFilter = 'all' | 'image' | 'video' | 'pdf';

@Component({
  selector: 'whizard-media-library-panel',
  standalone: true,
  host: { class: 'flex-1 min-h-0 flex flex-col' },
  imports: [FormsModule, MatFormFieldModule, MatIconModule, MatSelectModule, MediaUploaderComponent],
  templateUrl: './media-library-panel.component.html',
  styleUrl: './media-library-panel.component.css',
})
export class MediaLibraryPanelComponent {
  readonly assets = input<MediaAsset[]>([]);
  readonly loading = input<boolean>(false);

  readonly assetSelected = output<MediaAsset>();
  readonly uploadRequested = output<{ file: File; type: string }>();

  protected searchQuery = signal('');
  protected typeFilter = signal<AssetFilter>('all');

  protected filteredAssets = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const type = this.typeFilter();
    return this.assets().filter(a => {
      const matchesType = type === 'all' || a.type === type;
      const matchesSearch = !q || a.name.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  });

  protected isImage(asset: MediaAsset): boolean {
    return asset.type === 'image' || asset.mimeType.startsWith('image/');
  }

  protected isVideo(asset: MediaAsset): boolean {
    return asset.type === 'video' || asset.mimeType.startsWith('video/');
  }

  protected isPdf(asset: MediaAsset): boolean {
    return asset.type === 'pdf' || asset.mimeType === 'application/pdf';
  }

  protected onAssetClick(asset: MediaAsset): void {
    this.assetSelected.emit(asset);
  }

  protected onFilesSelected(files: UploadedFile[]): void {
    for (const f of files) {
      const type = f.file.type.startsWith('image/')
        ? 'image'
        : f.file.type.startsWith('video/')
          ? 'video'
          : 'pdf';
      this.uploadRequested.emit({ file: f.file, type });
    }
  }

  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  protected onTypeFilterChange(value: AssetFilter): void {
    this.typeFilter.set(value);
  }
}
