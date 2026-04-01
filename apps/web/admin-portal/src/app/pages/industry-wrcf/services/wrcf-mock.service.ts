import { Injectable } from '@angular/core';
import { CRITICALITY_LEVELS, COMPLEXITY_LEVELS, FREQUENCY_LEVELS } from '../models/wrcf-impact-levels';
import {
  IndustrySector, Industry, FunctionalGroup, PrimaryWorkObject,
  SecondaryWorkObject, Capability, ProficiencyLevel, DeleteResult
} from '../models/wrcf.models';

@Injectable({ providedIn: 'root' })
export class WrcfMockService {
  private sectors: IndustrySector[] = [
    { id: 's1', name: 'Manufacturing' },
    { id: 's2', name: 'Energy & Utilities' },
  ];

  private industries: Industry[] = [
    { id: 'i1', name: 'Thermal Power Plant', sectorId: 's1' },
    { id: 'i2', name: 'Steel Manufacturing', sectorId: 's1' },
    { id: 'i3', name: 'Wind Energy', sectorId: 's2' },
  ];

  private fgs: FunctionalGroup[] = [
    { id: 'fg1', name: 'Production / Generation', industryId: 'i1', domainType: 'Operations' },
    { id: 'fg2', name: 'Quality Assurance & Control', industryId: 'i1', domainType: 'Quality' },
    { id: 'fg3', name: 'CHP', industryId: 'i1', description: 'Coal Handling Plant', domainType: 'Operations' },
    { id: 'fg4', name: 'Operations & Plant Management', industryId: 'i1', domainType: 'Operations' },
    { id: 'fg5', name: 'Maintenance (Mechanical & Electrical)', industryId: 'i1', domainType: 'Maintenance' },
  ];

  private pwos: PrimaryWorkObject[] = [
    { id: 'pwo1', name: 'Stacking & Reclaiming Systems', functionalGroupId: 'fg3', strategicImportance: 4, revenueImpact: CRITICALITY_LEVELS[2], downtimeSensitivity: CRITICALITY_LEVELS[2] },
    { id: 'pwo2', name: 'Coal Receiving System', functionalGroupId: 'fg3', strategicImportance: 3, revenueImpact: CRITICALITY_LEVELS[1], downtimeSensitivity: CRITICALITY_LEVELS[1] },
    { id: 'pwo3', name: 'Coal Crushing & Screening System', functionalGroupId: 'fg3', strategicImportance: 3, revenueImpact: CRITICALITY_LEVELS[1], downtimeSensitivity: CRITICALITY_LEVELS[1] },
    { id: 'pwo4', name: 'Conveyor Belt Network Management', functionalGroupId: 'fg3', strategicImportance: 4, revenueImpact: CRITICALITY_LEVELS[2], downtimeSensitivity: CRITICALITY_LEVELS[2] },
    { id: 'pwo5', name: 'Monitoring & Exception Detection', functionalGroupId: 'fg3', strategicImportance: 2, revenueImpact: CRITICALITY_LEVELS[0], downtimeSensitivity: CRITICALITY_LEVELS[0] },
    { id: 'pwo6', name: 'Stacker Reclaimer Operations', functionalGroupId: 'fg3', strategicImportance: 5, revenueImpact: CRITICALITY_LEVELS[2], downtimeSensitivity: CRITICALITY_LEVELS[2] },
    { id: 'pwo7', name: 'Coal Storage Yard Management', functionalGroupId: 'fg3', strategicImportance: 3, revenueImpact: CRITICALITY_LEVELS[1], downtimeSensitivity: CRITICALITY_LEVELS[0] },
  ];

  private swos: SecondaryWorkObject[] = [
    { id: 'swo1', name: 'Vibrating Screen Maintenance', pwoId: 'pwo1', operationalComplexity: COMPLEXITY_LEVELS[2], assetCriticality: CRITICALITY_LEVELS[2], failureFrequency: FREQUENCY_LEVELS[1] },
    { id: 'swo2', name: 'Dust Suppression System', pwoId: 'pwo1', description: 'Automated dust control system', operationalComplexity: COMPLEXITY_LEVELS[1], assetCriticality: CRITICALITY_LEVELS[2], failureFrequency: FREQUENCY_LEVELS[0] },
    { id: 'swo3', name: 'Transfer Point Optimization', pwoId: 'pwo1', operationalComplexity: COMPLEXITY_LEVELS[0], assetCriticality: CRITICALITY_LEVELS[1], failureFrequency: FREQUENCY_LEVELS[0] },
    { id: 'swo4', name: 'Coal Sampling & Quality Analysis', pwoId: 'pwo1', operationalComplexity: COMPLEXITY_LEVELS[1], assetCriticality: CRITICALITY_LEVELS[2], failureFrequency: FREQUENCY_LEVELS[1] },
    { id: 'swo5', name: 'Water Sprinkler System Calibration', pwoId: 'pwo1', operationalComplexity: COMPLEXITY_LEVELS[0], assetCriticality: CRITICALITY_LEVELS[0], failureFrequency: FREQUENCY_LEVELS[0] },
  ];

  private readonly capabilities: Capability[] = [
    { id: 'cap01', name: 'Fundamental Principles', code: 'Cap 01' },
    { id: 'cap02', name: 'Work Object Familiarization', code: 'Cap02' },
    { id: 'cap03', name: 'Process Familiarization', code: 'Cap03' },
    { id: 'cap04', name: 'Operation Execution', code: 'Cap04' },
    { id: 'cap05', name: 'Monitoring & Exception Detection', code: 'Cap05' },
    { id: 'cap06', name: 'Fault / Error Recognition', code: 'Cap06' },
    { id: 'cap07', name: 'First Response & Resolution', code: 'Cap07' },
  ];

  private readonly proficiencyLevels: ProficiencyLevel[] = [
    { id: 'pl1', name: 'Plant Awareness', code: 'L1', level: 'L1' },
    { id: 'pl2', name: 'Assisted Execution', code: 'L2', level: 'L2' },
    { id: 'pl3a', name: 'Conditional Independence – Supervised', code: 'L3A', level: 'L3A' },
    { id: 'pl3b', name: 'Conditional Independence – Scoped', code: 'L3B', level: 'L3B' },
    { id: 'pl4', name: 'Full Independence', code: 'L4', level: 'L4' },
  ];

  getSectors(): IndustrySector[] { return [...this.sectors]; }

  getIndustries(sectorId: string | null): Industry[] {
    if (!sectorId) return [];
    return this.industries.filter(i => i.sectorId === sectorId);
  }

  getFGs(industryId: string | null): FunctionalGroup[] {
    if (!industryId) return [];
    return this.fgs.filter(fg => fg.industryId === industryId);
  }

  getPWOs(fgId: string): PrimaryWorkObject[] {
    return this.pwos.filter(p => p.functionalGroupId === fgId);
  }

  getSWOs(pwoId: string): SecondaryWorkObject[] {
    return this.swos.filter(s => s.pwoId === pwoId);
  }

  getCapabilities(): Capability[] { return this.capabilities; }

  getProficiencyLevels(): ProficiencyLevel[] { return this.proficiencyLevels; }

  createFG(data: Omit<FunctionalGroup, 'id'>): FunctionalGroup {
    const entity: FunctionalGroup = { ...data, id: `fg_${Date.now()}` };
    this.fgs.push(entity);
    return entity;
  }

  createPWO(data: Omit<PrimaryWorkObject, 'id'>): PrimaryWorkObject {
    const entity: PrimaryWorkObject = { ...data, id: `pwo_${Date.now()}` };
    this.pwos.push(entity);
    return entity;
  }

  createSWO(data: Omit<SecondaryWorkObject, 'id'>): SecondaryWorkObject {
    const entity: SecondaryWorkObject = { ...data, id: `swo_${Date.now()}` };
    this.swos.push(entity);
    return entity;
  }

  updateFG(id: string, data: Partial<FunctionalGroup>): void {
    const idx = this.fgs.findIndex(f => f.id === id);
    if (idx !== -1) this.fgs[idx] = { ...this.fgs[idx], ...data };
  }

  updatePWO(id: string, data: Partial<PrimaryWorkObject>): void {
    const idx = this.pwos.findIndex(p => p.id === id);
    if (idx !== -1) this.pwos[idx] = { ...this.pwos[idx], ...data };
  }

  updateSWO(id: string, data: Partial<SecondaryWorkObject>): void {
    const idx = this.swos.findIndex(s => s.id === id);
    if (idx !== -1) this.swos[idx] = { ...this.swos[idx], ...data };
  }

  deleteFG(id: string): DeleteResult {
    if (this.pwos.some(p => p.functionalGroupId === id)) {
      return { success: false, reason: 'Cannot delete: Primary Work Objects exist under this Functional Group.' };
    }
    this.fgs = this.fgs.filter(f => f.id !== id);
    return { success: true };
  }

  deletePWO(id: string): DeleteResult {
    if (this.swos.some(s => s.pwoId === id)) {
      return { success: false, reason: 'Cannot delete: Secondary Work Objects exist under this Primary Work Object.' };
    }
    this.pwos = this.pwos.filter(p => p.id !== id);
    return { success: true };
  }

  deleteSWO(id: string): DeleteResult {
    this.swos = this.swos.filter(s => s.id !== id);
    return { success: true };
  }
}
