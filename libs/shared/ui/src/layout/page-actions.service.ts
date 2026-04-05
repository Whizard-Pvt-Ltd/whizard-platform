import { Injectable, signal } from '@angular/core';

export interface PageAction {
  label: string;
  icon?: string;
  variant: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  action: () => void;
}

@Injectable({ providedIn: 'root' })
export class PageActionsService {
  readonly actions = signal<PageAction[]>([]);

  set(actions: PageAction[]): void {
    this.actions.set(actions);
  }

  clear(): void {
    this.actions.set([]);
  }
}
