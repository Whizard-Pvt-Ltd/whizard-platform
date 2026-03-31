import { Component, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface UploadedFile {
  file: File;
  preview: string | null;
  error: string | null;
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'whizard-media-uploader',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div
      class="upload-area"
      [class.dragging]="dragging()"
      [class.has-error]="errorMessage()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave()"
      (drop)="onDrop($event)"
      (click)="fileInput.click()">

      <input
        #fileInput
        type="file"
        [accept]="accept()"
        [multiple]="multiple()"
        class="hidden"
        (change)="onFileChange($event)" />

      <mat-icon [svgIcon]="iconName()" class="upload-icon" />
      <p class="upload-label">{{ label() }}</p>
      <p class="upload-hint">Drag & drop or click to browse · Max 2MB each</p>

      @if (errorMessage()) {
        <p class="upload-error">{{ errorMessage() }}</p>
      }
    </div>
  `,
  styles: [`
    .upload-area {
      border: 2px dashed var(--wrcf-border, #484E5D);
      border-radius: 10px;
      padding: 24px 16px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
      background: var(--wrcf-bg-secondary, #0F253F);
      text-align: center;
    }
    .upload-area:hover, .upload-area.dragging {
      border-color: var(--wrcf-accent, #00BFFF);
      background: rgba(0, 191, 255, 0.05);
    }
    .upload-area.has-error { border-color: #ef4444; }
    .upload-icon { font-size: 32px; width: 32px; height: 32px; color: var(--wrcf-text-secondary, #7F94AE); }
    .upload-label { font-family: 'Poppins', sans-serif; font-size: 13px; color: var(--wrcf-text-secondary, #7F94AE); margin: 0; }
    .upload-hint  { font-family: 'Poppins', sans-serif; font-size: 11px; color: var(--wrcf-text-secondary, #7F94AE); opacity: 0.7; margin: 0; }
    .upload-error { font-family: 'Poppins', sans-serif; font-size: 12px; color: #ef4444; margin: 0; }
    .hidden { display: none; }
  `],
})
export class MediaUploaderComponent {
  readonly accept = input<string>('image/*,video/*,.pdf');
  readonly multiple = input<boolean>(true);
  readonly label = input<string>('Upload files');
  readonly iconType = input<'image' | 'video' | 'pdf' | 'any'>('any');
  readonly filesSelected = output<UploadedFile[]>();

  protected dragging = signal(false);
  protected errorMessage = signal<string | null>(null);

  protected iconName(): string {
    const map: Record<string, string> = {
      image: 'lucideIcons:image',
      video: 'lucideIcons:video',
      pdf: 'lucideIcons:file-text',
      any: 'lucideIcons:upload',
    };
    return map[this.iconType()] ?? 'lucideIcons:upload';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(): void {
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.processFiles(files);
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.processFiles(files);
    input.value = '';
  }

  private processFiles(files: File[]): void {
    this.errorMessage.set(null);
    const results: UploadedFile[] = [];

    for (const file of files) {
      if (file.size > MAX_SIZE_BYTES) {
        this.errorMessage.set(`"${file.name}" exceeds 2MB limit`);
        return;
      }

      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null;

      results.push({ file, preview, error: null });
    }

    if (results.length > 0) {
      this.filesSelected.emit(results);
    }
  }
}
