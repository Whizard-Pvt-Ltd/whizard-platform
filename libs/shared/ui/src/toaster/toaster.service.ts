import { Injectable, Signal, signal } from '@angular/core';
import { Toast, ToastOptions, ToastVariant } from './toaster.types.js';

const DEFAULT_DURATION = 4000;

@Injectable({ providedIn: 'root' })
export class ToasterService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts: Signal<readonly Toast[]> = this._toasts.asReadonly();

  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(message: string, variant: ToastVariant, options: ToastOptions = {}): number {
    const id = this.nextId++;
    const toast: Toast = {
      id,
      variant,
      message,
      dismissible: options.dismissible ?? true,
    };
    this._toasts.update((list) => [...list, toast]);

    const duration = options.duration ?? DEFAULT_DURATION;
    if (duration > 0) {
      const handle = setTimeout(() => this.dismiss(id), duration);
      this.timers.set(id, handle);
    }

    return id;
  }

  showSuccess(message: string, options?: ToastOptions): number {
    return this.show(message, 'success', options);
  }

  showError(message: string, options?: ToastOptions): number {
    return this.show(message, 'error', options);
  }

  showWarning(message: string, options?: ToastOptions): number {
    return this.show(message, 'warning', options);
  }

  showInfo(message: string, options?: ToastOptions): number {
    return this.show(message, 'info', options);
  }

  dismiss(id: number): void {
    const handle = this.timers.get(id);
    if (handle) {
      clearTimeout(handle);
      this.timers.delete(id);
    }
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this.timers.forEach((handle) => clearTimeout(handle));
    this.timers.clear();
    this._toasts.set([]);
  }
}
