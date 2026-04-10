import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { PendingCIMapping } from '../../models/wrcf-roles.models';

interface PwoGroup {
  pwoName: string;
  items: Array<PendingCIMapping & { index: number }>;
}

@Component({
  selector: 'whizard-ci-mappings-dialog',
  standalone: true,
  imports: [],
  templateUrl: './ci-mappings-dialog.component.html',
  styleUrl: './ci-mappings-dialog.component.css'
})
export class CIMappingsDialogComponent {
  @Input() mappings: PendingCIMapping[] = [];
  @Input() savedMappings: PendingCIMapping[] = [];
  @Input() industryName = '';
  @Input() departmentName = '';
  @Input() roleName = '';
  @Output() remove = new EventEmitter<number>();
  @Output() save = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  private expandedPwos = new Set<string>();
  private expandedSavedPwos = new Set<string>();

  protected get hasSaveableChanges(): boolean {
    return this.mappings.length > 0;
  }

  protected get pwoGroups(): PwoGroup[] {
    const groups = new Map<string, PwoGroup>();
    this.mappings.forEach((m, i) => {
      if (!groups.has(m.pwoName)) {
        groups.set(m.pwoName, { pwoName: m.pwoName, items: [] });
        this.expandedPwos.add(m.pwoName);
      }
      groups.get(m.pwoName)!.items.push({ ...m, index: i });
    });
    return Array.from(groups.values());
  }

  protected get savedPwoGroups(): PwoGroup[] {
    const groups = new Map<string, PwoGroup>();
    this.savedMappings.forEach((m, i) => {
      if (!groups.has(m.pwoName)) {
        groups.set(m.pwoName, { pwoName: m.pwoName, items: [] });
        this.expandedSavedPwos.add(m.pwoName);
      }
      groups.get(m.pwoName)!.items.push({ ...m, index: i });
    });
    return Array.from(groups.values());
  }

  protected isPwoExpanded(pwoName: string): boolean {
    return this.expandedPwos.has(pwoName);
  }

  protected togglePwo(pwoName: string): void {
    if (this.expandedPwos.has(pwoName)) this.expandedPwos.delete(pwoName);
    else this.expandedPwos.add(pwoName);
  }

  protected isSavedPwoExpanded(pwoName: string): boolean {
    return this.expandedSavedPwos.has(pwoName);
  }

  protected toggleSavedPwo(pwoName: string): void {
    if (this.expandedSavedPwos.has(pwoName)) this.expandedSavedPwos.delete(pwoName);
    else this.expandedSavedPwos.add(pwoName);
  }
}
