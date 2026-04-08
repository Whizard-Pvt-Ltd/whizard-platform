import { Component, Input, Output, EventEmitter, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { CIPendingEntry, CapabilityInstance, IndustrySector, Industry, FunctionalGroup } from '../../models/wrcf.models';
import { WrcfApiService } from '../../services/wrcf-api.service';

interface PwoGroup {
  pwoId: string;
  pwoName: string;
  items: (CapabilityInstance | CIPendingEntry & { _pending: true })[];
}

@Component({
  selector: 'whizard-manage-ci-mappings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './manage-ci-mappings.component.html',
  styleUrl: './manage-ci-mappings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageCIMappingsComponent implements OnInit {
  private readonly apiService = inject(WrcfApiService);
  private readonly router = inject(Router);

  @Input() cache: CIPendingEntry[] = [];
  @Input() sectors: IndustrySector[] = [];
  @Input() initialSectorId = '';
  @Input() initialIndustryId = '';
  @Input() initialFgId = '';
  @Output() closed = new EventEmitter<void>();
  @Output() pendingRemoved = new EventEmitter<string>();
  @Output() saved = new EventEmitter<CIPendingEntry[]>();
  @Output() savedDeleted = new EventEmitter<string>();

  protected selectedSectorId = signal('');
  protected selectedIndustryId = signal('');
  protected selectedFgId = signal('');

  protected industries = signal<Industry[]>([]);
  protected fgList = signal<FunctionalGroup[]>([]);
  protected savedCIs = signal<CapabilityInstance[]>([]);
  protected expandedPwoIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    if (this.initialSectorId) {
      this.selectedSectorId.set(this.initialSectorId);
      this.apiService.listIndustries(this.initialSectorId).subscribe({
        next: industries => this.industries.set(industries),
        error: () => this.industries.set([])
      });
    }
    if (this.initialIndustryId) {
      this.selectedIndustryId.set(this.initialIndustryId);
      this.apiService.listFGs(this.initialIndustryId).subscribe({
        next: fgs => this.fgList.set(fgs),
        error: () => this.fgList.set([])
      });
    }
    if (this.initialFgId) {
      this.selectedFgId.set(this.initialFgId);
    }
    this.loadSavedCIs();
  }

  protected onSectorChange(sectorId: string): void {
    this.selectedSectorId.set(sectorId);
    this.selectedIndustryId.set('');
    this.selectedFgId.set('');
    this.industries.set([]);
    this.fgList.set([]);
    this.savedCIs.set([]);
    if (sectorId) {
      this.apiService.listIndustries(sectorId).subscribe({
        next: industries => this.industries.set(industries),
        error: () => this.industries.set([])
      });
    }
    this.loadSavedCIs();
  }

  protected onIndustryChange(industryId: string): void {
    this.selectedIndustryId.set(industryId);
    this.selectedFgId.set('');
    this.fgList.set([]);
    this.savedCIs.set([]);
    if (industryId) {
      this.apiService.listFGs(industryId).subscribe({
        next: fgs => this.fgList.set(fgs),
        error: () => this.fgList.set([])
      });
    }
    this.loadSavedCIs();
  }

  protected onFgChange(fgId: string): void {
    this.selectedFgId.set(fgId);
    this.savedCIs.set([]);
    this.expandedPwoIds.set(new Set());
    this.loadSavedCIs();
  }

  private loadSavedCIs(): void {
    this.apiService.listCIs(this.selectedIndustryId() || undefined, this.selectedFgId() || undefined).subscribe({
      next: cis => {
        this.savedCIs.set(cis);
        this.autoExpandAll();
      },
      error: () => this.savedCIs.set([])
    });
  }

  private autoExpandAll(): void {
    const pwoIds = new Set<string>();
    for (const ci of this.savedCIs()) { if (ci.pwoId) pwoIds.add(ci.pwoId); }
    for (const entry of this.cache) { if (entry.pwoId) pwoIds.add(entry.pwoId); }
    this.expandedPwoIds.set(pwoIds);
  }

  protected get pwoGroups(): PwoGroup[] {
    const groups = new Map<string, PwoGroup>();

    for (const ci of this.savedCIs()) {
      const key = ci.pwoId ?? '';
      if (!groups.has(key)) {
        groups.set(key, { pwoId: key, pwoName: ci.pwoName ?? '', items: [] });
      }
      groups.get(key)!.items.push(ci);
    }

    for (const entry of this.cache) {
      const key = entry.pwoId ?? '';
      if (!groups.has(key)) {
        groups.set(key, { pwoId: key, pwoName: entry.pwoName ?? '', items: [] });
      }
      groups.get(key)!.items.push({ ...entry, _pending: true as const });
    }

    return Array.from(groups.values());
  }

  protected togglePwo(pwoId: string): void {
    this.expandedPwoIds.update(set => {
      const next = new Set(set);
      if (next.has(pwoId)) next.delete(pwoId);
      else next.add(pwoId);
      return next;
    });
  }

  protected isPwoExpanded(pwoId: string): boolean {
    return this.expandedPwoIds().has(pwoId);
  }

  protected isPending(item: CapabilityInstance | (CIPendingEntry & { _pending: true })): item is CIPendingEntry & { _pending: true } {
    return '_pending' in item;
  }

  protected getItemLabel(item: CapabilityInstance | (CIPendingEntry & { _pending: true })): string {
    return `${item.swoName} + ${item.capabilityName} (${item.capabilityCode}) — L${item.proficiencyLevel} ${item.proficiencyLabel}`;
  }

  protected onDeleteSaved(id: string): void {
    this.savedDeleted.emit(id);
    this.savedCIs.update(cis => cis.filter(ci => ci.id !== id));
  }

  protected onDeletePending(localId: string): void {
    this.pendingRemoved.emit(localId);
  }

  protected onSave(): void {
    this.saved.emit(this.cache);
  }

  protected onSkillPlusClick(ci: CapabilityInstance): void {
    this.router.navigate(['/wrcf-skills'], {
      queryParams: {
        capabilityInstanceId: ci.id,
        industryId: this.selectedIndustryId(),
        fgId: ci.functionalGroupId,
        pwoId: ci.pwoId,
        swoId: ci.swoId,
        capabilityId: ci.capabilityId,
        proficiencyId: ci.proficiencyId
      }
    });
    this.closed.emit();
  }
}
