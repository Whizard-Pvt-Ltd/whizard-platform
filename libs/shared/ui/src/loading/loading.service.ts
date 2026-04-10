import { Injectable, Signal, signal } from '@angular/core';

export type LoadingMode = 'determinate' | 'indeterminate';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _show = signal<boolean>(false);
  private readonly _mode = signal<LoadingMode>('indeterminate');
  private readonly _progress = signal<number>(0);
  private readonly _auto = signal<boolean>(true);
  private readonly urlMap = new Map<string, boolean>();

  readonly show$: Signal<boolean> = this._show.asReadonly();
  readonly mode$: Signal<LoadingMode> = this._mode.asReadonly();
  readonly progress$: Signal<number> = this._progress.asReadonly();
  readonly auto$: Signal<boolean> = this._auto.asReadonly();

  show(): void {
    this._show.set(true);
  }

  hide(): void {
    this._show.set(false);
  }

  setAutoMode(value: boolean): void {
    this._auto.set(value);
  }

  setMode(value: LoadingMode): void {
    this._mode.set(value);
  }

  setProgress(value: number): void {
    if (value < 0 || value > 100) {
      console.error('Progress value must be between 0 and 100!');
      return;
    }
    this._progress.set(value);
  }

  _setLoadingStatus(status: boolean, url: string): void {
    if (!url) {
      console.error('The request URL must be provided!');
      return;
    }

    if (status) {
      this.urlMap.set(url, true);
      this._show.set(true);
    } else if (this.urlMap.has(url)) {
      this.urlMap.delete(url);
    }

    if (this.urlMap.size === 0) {
      this._show.set(false);
    }
  }
}
