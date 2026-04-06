import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Quill from 'quill';

@Component({
  selector: 'whizard-quill-editor',
  standalone: true,
  template: `
    <div
      class="qe-wrapper"
      [class.qe-readonly]="readonly()"
      [class.qe-view]="view()"
      [class.qe-toolbar-visible]="showToolbar()"
    >
      <!-- Eye toggle button (hidden in readonly / view mode) -->
      @if (!readonly() && !view()) {
        <button
          type="button"
          class="qe-toggle"
          (click)="toggleToolbar()"
          [title]="showToolbar() ? 'Hide toolbar' : 'Show toolbar'"
        >
          @if (showToolbar()) {
            <!-- eye-off -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
                       a18.45 18.45 0 0 1 5.06-5.94
                       M9.9 4.24A9.12 9.12 0 0 1 12 4
                       c7 0 11 8 11 8
                       a18.5 18.5 0 0 1-2.16 3.19
                       m-6.72-1.07a3 3 0 1 1-4.24-4.24"
              />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          } @else {
            <!-- eye -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        </button>
      }

      <!-- Quill mounts here -->
      <div #editorContainer [attr.aria-label]="placeholder()"></div>
    </div>
  `,
  styles: [
    `
      /* ── Host ──────────────────────────────────────────────────── */
      whizard-quill-editor {
        display: block;
      }

      /* ── Outer wrapper ─────────────────────────────────────────── */
      .qe-wrapper {
        position: relative;
        background: light-dark(var(--color-white), var(--color-primary-900));
        border: 1px solid var(--wrcf-border, #484e5d);
        border-radius: 8px;
        color: var(--wrcf-text-primary, #e8f0fa);
        font-family: 'Poppins', sans-serif;
        font-size: 15px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: border-color 0.15s;
      }
      .qe-wrapper:focus-within {
        border-color: var(--wrcf-accent, #00bfff);
        box-shadow: 0 0 0 2px
          color-mix(in srgb, var(--wrcf-accent, #00bfff) 25%, transparent);
      }

      /* ── Eye toggle button ─────────────────────────────────────── */
      .qe-toggle {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: 1px solid var(--wrcf-border, #484e5d);
        border-radius: 6px;
        background: var(--wrcf-bg-secondary, #0f253f);
        color: var(--wrcf-text-secondary, #7f94ae);
        cursor: pointer;
        transition:
          color 0.15s,
          border-color 0.15s,
          background 0.15s;
      }
      .qe-toggle:hover,
      .qe-toolbar-visible .qe-toggle {
        color: var(--wrcf-accent, #00bfff);
        border-color: var(--wrcf-accent, #00bfff);
        background: color-mix(
          in srgb,
          var(--wrcf-accent, #00bfff) 10%,
          var(--wrcf-bg-secondary, #0f253f)
        );
      }

      /* ── Quill toolbar ─────────────────────────────────────────── */
      .qe-wrapper .ql-toolbar.ql-snow {
        display: none; /* hidden by default (bubble-like) */
        border: none;
        border-bottom: 1px solid var(--wrcf-border, #484e5d);
        border-radius: 0;
        background: var(--wrcf-bg-secondary, #0f253f);
        padding: 0;
      }
      .qe-toolbar-visible .ql-toolbar.ql-snow {
        display: block;
      }
      .qe-wrapper .ql-toolbar.ql-snow .ql-formats {
        margin: 8px 8px;
      }

      /* ── Quill container ───────────────────────────────────────── */
      .qe-wrapper .ql-container.ql-snow {
        border: none;
        flex: 1;
        min-height: 160px;
        overflow: auto;
        font-family: 'Poppins', sans-serif;
        font-size: 15px;
        color: var(--wrcf-text-primary, #e8f0fa);
        background: transparent;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }

      /* ── Editor area ───────────────────────────────────────────── */
      .qe-wrapper .ql-editor {
        min-height: 120px;
        padding: 12px 16px;
        padding-right: 40px; /* clear the eye button */
        color: var(--wrcf-text-primary, #e8f0fa);
        background: transparent;
        line-height: 1.6;
        text-align: justify;
        text-justify: inter-word;
        hyphens: auto;
        word-break: normal;
        white-space: normal;
      }
      .qe-toolbar-visible .ql-editor {
        padding-right: 16px; /* toolbar visible → button no longer overlaps */
      }
      .qe-wrapper .ql-editor.ql-blank::before {
        color: var(--wrcf-text-secondary, #7f94ae);
        font-style: normal;
        left: 16px;
      }

      /* ── Toolbar icon colours ──────────────────────────────────── */
      .qe-wrapper .ql-stroke,
      .qe-wrapper .ql-stroke-mitter {
        stroke: var(--wrcf-text-secondary, #7f94ae);
      }
      .qe-wrapper .ql-fill {
        fill: var(--wrcf-text-secondary, #7f94ae);
      }
      .qe-wrapper .ql-picker {
        color: var(--wrcf-text-secondary, #7f94ae);
      }

      /* Hover / active state → accent */
      .qe-wrapper .ql-toolbar button:hover,
      .qe-wrapper .ql-toolbar button:focus,
      .qe-wrapper .ql-toolbar button.ql-active,
      .qe-wrapper .ql-picker-label:hover,
      .qe-wrapper .ql-picker-label.ql-active,
      .qe-wrapper .ql-picker-item:hover,
      .qe-wrapper .ql-picker-item.ql-selected {
        color: var(--wrcf-accent, #00bfff) !important;
      }
      .qe-wrapper .ql-toolbar button:hover .ql-stroke,
      .qe-wrapper .ql-toolbar button.ql-active .ql-stroke {
        stroke: var(--wrcf-accent, #00bfff) !important;
      }
      .qe-wrapper .ql-toolbar button:hover .ql-fill,
      .qe-wrapper .ql-toolbar button.ql-active .ql-fill {
        fill: var(--wrcf-accent, #00bfff) !important;
      }

      /* ── Picker dropdown ───────────────────────────────────────── */
      .qe-wrapper .ql-picker.ql-expanded .ql-picker-label {
        border-color: var(--wrcf-border, #484e5d);
      }
      .qe-wrapper .ql-picker.ql-expanded .ql-picker-options {
        z-index: 10 !important;
        background: var(--wrcf-bg-card, #1e293b);
        border-color: var(--wrcf-border, #484e5d);
      }
      .qe-wrapper .ql-picker-item {
        color: var(--wrcf-text-primary, #e8f0fa);
      }

      /* ── Link tooltip ──────────────────────────────────────────── */
      .qe-wrapper .ql-tooltip {
        background: var(--wrcf-bg-card, #1e293b);
        border: 1px solid var(--wrcf-border, #484e5d);
        border-radius: 6px;
        color: var(--wrcf-text-secondary, #7f94ae);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        padding: 4px 12px;
        white-space: nowrap;
      }
      .qe-wrapper .ql-tooltip::before {
        color: var(--wrcf-text-secondary, #7f94ae);
      }
      .qe-wrapper .ql-tooltip .ql-action,
      .qe-wrapper .ql-tooltip .ql-remove {
        color: var(--wrcf-accent, #00bfff);
        border-color: var(--wrcf-border, #484e5d);
      }
      .qe-wrapper .ql-tooltip .ql-action::after {
        border-right-color: var(--wrcf-border, #484e5d) !important;
      }
      .qe-wrapper .ql-tooltip input {
        background: var(--wrcf-bg-secondary, #0f253f) !important;
        border: 1px solid var(--wrcf-border, #484e5d) !important;
        border-radius: 4px;
        color: var(--wrcf-text-primary, #e8f0fa) !important;
        outline: none;
      }
      .qe-wrapper .ql-tooltip input:focus {
        border-color: var(--wrcf-accent, #00bfff) !important;
      }

      /* ── Readonly mode ─────────────────────────────────────────── */
      .qe-readonly .ql-toolbar {
        display: none !important;
      }
      .qe-readonly .ql-container {
        border-radius: 8px;
      }
      .qe-readonly .ql-editor {
        padding-right: 16px;
        cursor: default;
      }

      /* ── View mode (prose renderer — no chrome at all) ─────────── */
      .qe-view {
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        min-height: unset;
      }
      .qe-view:focus-within {
        border: none !important;
        box-shadow: none !important;
      }
      .qe-view .ql-toolbar {
        display: none !important;
      }
      .qe-view .ql-container.ql-snow {
        border: none !important;
        background: transparent !important;
        min-height: unset;
        border-radius: 0;
      }
      .qe-view .ql-editor {
        padding: 0 !important;
        min-height: unset !important;
        cursor: default;
        color: inherit !important;
        background: transparent !important;
        line-height: 1.6;
        text-align: justify;
        text-justify: inter-word;
        hyphens: auto;
      }
      .qe-view .ql-editor.ql-blank::before {
        display: none;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuillEditorComponent),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class QuillEditorComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy
{
  readonly placeholder = input<string>('Enter text…');
  readonly readonly = input<boolean>(false);
  /** When true the toolbar is shown on mount; false (default) = bubble-like hidden toolbar */
  readonly toolbar = input<boolean>(false);
  /** View mode: renders saved HTML with no border, no background, not editable */
  readonly view = input<boolean>(false);

  @ViewChild('editorContainer')
  private containerRef!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);
  private quill: Quill | null = null;

  showToolbar = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private pendingValue = '';

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Initialise toolbar visibility from input
    this.showToolbar.set(this.toolbar());

    this.quill = new Quill(this.containerRef.nativeElement, {
      theme: 'snow',
      readOnly: this.readonly() || this.view(),
      placeholder: this.placeholder(),
      modules: {
        toolbar:
          this.readonly() || this.view()
            ? false
            : [
                ['bold', 'italic', 'underline'],
                ['blockquote', 'code-block'],
                [{ header: 1 }, { header: 2 }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ script: 'sub' }, { script: 'super' }],
                [{ indent: '-1' }, { indent: '+1' }],
                ['link'],
                ['clean'],
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

  toggleToolbar(): void {
    this.showToolbar.update((v) => !v);
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

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    if (!this.view()) this.quill?.enable(!isDisabled);
  }
}
