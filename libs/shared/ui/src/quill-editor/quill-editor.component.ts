import { isPlatformBrowser } from '@angular/common';
import {
  Component, forwardRef, input, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, inject, PLATFORM_ID, ViewEncapsulation,
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
    whizard-quill-editor {
      display: block;
    }

    .quill-editor-container {
      background: var(--wrcf-bg-primary, #0F172A);
      border: 1px solid var(--wrcf-border, #484E5D);
      border-radius: 8px;
      color: var(--wrcf-text-primary, #E8F0FA);
      min-height: 160px;
      font-family: 'Poppins', sans-serif;
      font-size: 15px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .quill-editor-container .ql-toolbar.ql-snow {
      border: none;
      border-bottom: 1px solid var(--wrcf-border, #484E5D);
      background: var(--wrcf-bg-secondary, #0F253F);
      padding: 8px 12px;
    }

    .quill-editor-container .ql-container.ql-snow {
      border: none;
      flex: 1;
      font-family: 'Poppins', sans-serif;
      font-size: 15px;
      color: var(--wrcf-text-primary, #E8F0FA);
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .quill-editor-container .ql-editor {
      min-height: 120px;
      padding: 12px 16px;
      color: var(--wrcf-text-primary, #E8F0FA);
    }

    .quill-editor-container .ql-editor.ql-blank::before {
      color: var(--wrcf-text-secondary, #7F94AE);
      font-style: normal;
      left: 16px;
    }

    .quill-editor-container .ql-stroke { stroke: var(--wrcf-text-secondary, #7F94AE); }
    .quill-editor-container .ql-fill   { fill:   var(--wrcf-text-secondary, #7F94AE); }
    .quill-editor-container .ql-picker  { color:  var(--wrcf-text-secondary, #7F94AE); }

    .quill-editor-container.readonly .ql-toolbar { display: none; }
    .quill-editor-container.readonly .ql-container { border-radius: 8px; }
  `],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => QuillEditorComponent), multi: true }
  ],
  encapsulation: ViewEncapsulation.None,
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

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.quill = new Quill(this.containerRef.nativeElement, {
      theme: 'snow',
      readOnly: this.readonly(),
      placeholder: this.placeholder(),
      modules: {
        toolbar: this.readonly() ? false : [
          ['bold', 'italic'],
          ['blockquote', 'code-block'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ indent: '-1' }, { indent: '+1' }],
        ],
      },
    });

    if (this.pendingValue) {
      this.quill.root.innerHTML = this.pendingValue;
    }

    this.quill.on('text-change', () => {
      const html = this.quill?.root.innerHTML ?? '';
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
      if (this.quill.root.innerHTML !== html) {
        this.quill.root.innerHTML = html;
      }
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
