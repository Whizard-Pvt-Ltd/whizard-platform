import { isPlatformBrowser } from '@angular/common';
import {
  Component, forwardRef, input, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, inject, PLATFORM_ID,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Quill from 'quill';

@Component({
  selector: 'whizard-quill-editor',
  standalone: true,
  template: `
    <div
      #editorContainer
      class="quill-editor-container"
      [class.readonly]="readonly()"
      [attr.aria-label]="placeholder()">
    </div>
  `,
  styles: [`
    :host { display: block; }

    .quill-editor-container {
      background: var(--wrcf-bg-card, #1E293B);
      border: 1px solid var(--wrcf-border, #484E5D);
      border-radius: 8px;
      color: var(--wrcf-text-primary, #E8F0FA);
      min-height: 160px;
      font-family: 'Poppins', sans-serif;
      font-size: 15px;
    }

    .quill-editor-container :global(.ql-toolbar) {
      border: none;
      border-bottom: 1px solid var(--wrcf-border, #484E5D);
      background: var(--wrcf-bg-secondary, #0F253F);
      border-radius: 8px 8px 0 0;
      padding: 8px 12px;
    }

    .quill-editor-container :global(.ql-container) {
      border: none;
      font-family: 'Poppins', sans-serif;
      font-size: 15px;
      color: var(--wrcf-text-primary, #E8F0FA);
    }

    .quill-editor-container :global(.ql-editor) {
      min-height: 120px;
      padding: 12px 16px;
      color: var(--wrcf-text-primary, #E8F0FA);
    }

    .quill-editor-container :global(.ql-editor.ql-blank::before) {
      color: var(--wrcf-text-secondary, #7F94AE);
      font-style: normal;
    }

    .quill-editor-container :global(.ql-stroke) { stroke: var(--wrcf-text-secondary, #7F94AE); }
    .quill-editor-container :global(.ql-fill)   { fill:   var(--wrcf-text-secondary, #7F94AE); }
    .quill-editor-container :global(.ql-picker)  { color:  var(--wrcf-text-secondary, #7F94AE); }

    .quill-editor-container.readonly :global(.ql-toolbar) { display: none; }
    .quill-editor-container.readonly :global(.ql-container) { border-radius: 8px; }
  `],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => QuillEditorComponent), multi: true }
  ],
})
export class QuillEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  readonly placeholder = input<string>('Enter text…');
  readonly readonly = input<boolean>(false);

  @ViewChild('editorContainer') private containerRef!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);
  private quill: Quill | null = null;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private pendingValue = '';

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.quill = new Quill(this.containerRef.nativeElement, {
      theme: 'snow',
      readOnly: this.readonly(),
      placeholder: this.placeholder(),
      modules: {
        toolbar: this.readonly() ? false : [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean'],
        ],
      },
    });

    if (this.pendingValue) {
      this.quill.clipboard.dangerouslyPasteHTML(this.pendingValue);
    }

    this.quill.on('text-change', () => {
      const html = this.containerRef.nativeElement.querySelector('.ql-editor')?.innerHTML ?? '';
      this.onChange(html === '<p><br></p>' ? '' : html);
      this.onTouched();
    });
  }

  ngOnDestroy(): void {
    this.quill = null;
  }

  writeValue(value: string | null): void {
    const html = value ?? '';
    if (this.quill) {
      this.quill.clipboard.dangerouslyPasteHTML(html);
    } else {
      this.pendingValue = html;
    }
  }

  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {
    this.quill?.enable(!isDisabled);
  }
}
