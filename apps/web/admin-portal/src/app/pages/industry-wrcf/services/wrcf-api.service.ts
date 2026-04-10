import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import type {
  IndustrySector, Industry, FunctionalGroup, PrimaryWorkObject, SecondaryWorkObject,
  Capability, ProficiencyLevel, DomainType, ImpactLevelValue, StrategicImportance,
  CapabilityInstance
} from '../models/wrcf.models';
import { environment } from '../../../../environments/environment';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface WrcfDashboardStats {
  functionalGroups: number;
  primaryWorkObjects: number;
  secondaryWorkObjects: number;
  capabilityInstances: number;
  skills: number;
  tasks: number;
  departments: number;
  roles: number;
}

@Injectable({ providedIn: 'root' })
export class WrcfApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.bffApiUrl}/wrcf`;

  listSectors(): Observable<IndustrySector[]> {
    return this.http.get<ApiEnvelope<IndustrySector[]>>(`${this.base}/sectors`).pipe(map(r => r.data));
  }

  listIndustries(sectorId: string): Observable<Industry[]> {
    return this.http.get<ApiEnvelope<Industry[]>>(`${this.base}/sectors/${sectorId}/industries`).pipe(map(r => r.data));
  }

  getDashboardStats(industryId: string): Observable<WrcfDashboardStats> {
    return this.http.get<ApiEnvelope<WrcfDashboardStats>>(`${this.base}/industries/${industryId}/dashboard-stats`).pipe(map(r => r.data));
  }

  listFGs(industryId: string): Observable<FunctionalGroup[]> {
    return this.http.get<ApiEnvelope<FunctionalGroup[]>>(`${this.base}/industries/${industryId}/functional-groups`).pipe(map(r => r.data));
  }

  createFG(data: { industryId: string; name: string; description?: string; domainType: DomainType }): Observable<FunctionalGroup> {
    return this.http.post<ApiEnvelope<FunctionalGroup>>(`${this.base}/functional-groups`, data).pipe(map(r => r.data));
  }

  updateFG(id: string, data: { name?: string; description?: string; domainType?: DomainType }): Observable<FunctionalGroup> {
    return this.http.patch<ApiEnvelope<FunctionalGroup>>(`${this.base}/functional-groups/${id}`, data).pipe(map(r => r.data));
  }

  deleteFG(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/functional-groups/${id}`);
  }

  checkFGDeletable(id: string): Observable<{ canDelete: boolean; reason?: string }> {
    return this.http.get<ApiEnvelope<{ canDelete: boolean; reason?: string }>>(`${this.base}/functional-groups/${id}/can-delete`).pipe(map(r => r.data));
  }

  listPWOs(fgId: string): Observable<PrimaryWorkObject[]> {
    return this.http.get<ApiEnvelope<PrimaryWorkObject[]>>(`${this.base}/functional-groups/${fgId}/pwos`).pipe(map(r => r.data));
  }

  createPWO(data: { functionalGroupId: string; name: string; description?: string; strategicImportance: StrategicImportance; revenueImpact: ImpactLevelValue; downtimeSensitivity: ImpactLevelValue }): Observable<PrimaryWorkObject> {
    return this.http.post<ApiEnvelope<PrimaryWorkObject>>(`${this.base}/pwos`, {
      ...data,
      revenueImpact: data.revenueImpact.label,
      downtimeSensitivity: data.downtimeSensitivity.label
    }).pipe(map(r => r.data));
  }

  updatePWO(id: string, data: { name?: string; description?: string; strategicImportance?: StrategicImportance; revenueImpact?: ImpactLevelValue; downtimeSensitivity?: ImpactLevelValue }): Observable<PrimaryWorkObject> {
    return this.http.patch<ApiEnvelope<PrimaryWorkObject>>(`${this.base}/pwos/${id}`, {
      ...data,
      revenueImpact: data.revenueImpact?.label,
      downtimeSensitivity: data.downtimeSensitivity?.label
    }).pipe(map(r => r.data));
  }

  deletePWO(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/pwos/${id}`);
  }

  checkPWODeletable(id: string): Observable<{ canDelete: boolean; reason?: string }> {
    return this.http.get<ApiEnvelope<{ canDelete: boolean; reason?: string }>>(`${this.base}/pwos/${id}/can-delete`).pipe(map(r => r.data));
  }

  listSWOs(pwoId: string): Observable<SecondaryWorkObject[]> {
    return this.http.get<ApiEnvelope<SecondaryWorkObject[]>>(`${this.base}/pwos/${pwoId}/swos`).pipe(map(r => r.data));
  }

  createSWO(data: { pwoId: string; name: string; description?: string; operationalComplexity: ImpactLevelValue; assetCriticality: ImpactLevelValue; failureFrequency: ImpactLevelValue }): Observable<SecondaryWorkObject> {
    return this.http.post<ApiEnvelope<SecondaryWorkObject>>(`${this.base}/swos`, {
      ...data,
      operationalComplexity: data.operationalComplexity.label,
      assetCriticality: data.assetCriticality.label,
      failureFrequency: data.failureFrequency.label
    }).pipe(map(r => r.data));
  }

  updateSWO(id: string, data: { name?: string; description?: string; operationalComplexity?: ImpactLevelValue; assetCriticality?: ImpactLevelValue; failureFrequency?: ImpactLevelValue }): Observable<SecondaryWorkObject> {
    return this.http.patch<ApiEnvelope<SecondaryWorkObject>>(`${this.base}/swos/${id}`, {
      ...data,
      operationalComplexity: data.operationalComplexity?.label,
      assetCriticality: data.assetCriticality?.label,
      failureFrequency: data.failureFrequency?.label
    }).pipe(map(r => r.data));
  }

  deleteSWO(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/swos/${id}`);
  }

  checkSWODeletable(id: string): Observable<{ canDelete: boolean; reason?: string }> {
    return this.http.get<ApiEnvelope<{ canDelete: boolean; reason?: string }>>(`${this.base}/swos/${id}/can-delete`).pipe(map(r => r.data));
  }

  listCapabilities(): Observable<Capability[]> {
    return this.http.get<ApiEnvelope<Capability[]>>(`${this.base}/capabilities`).pipe(map(r => r.data));
  }

  listProficiencies(): Observable<ProficiencyLevel[]> {
    return this.http.get<ApiEnvelope<{ id: string; level: string; label: string; description?: string }[]>>(`${this.base}/proficiencies`).pipe(
      map(r => r.data.map(p => ({ id: p.id, name: p.label, code: p.level, level: p.level, description: p.description })))
    );
  }

  listCIs(industryId?: string, fgId?: string): Observable<CapabilityInstance[]> {
    const params: string[] = [];
    if (industryId) params.push(`industryId=${industryId}`);
    if (fgId) params.push(`fgId=${fgId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.http.get<ApiEnvelope<CapabilityInstance[]>>(`${this.base}/capability-instances${qs}`).pipe(map(r => r.data));
  }

  createCI(data: { functionalGroupId: string; pwoId: string; swoId: string; capabilityId: string; proficiencyId: string }): Observable<void> {
    return this.http.post<void>(`${this.base}/capability-instances`, data);
  }

  deleteCI(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/capability-instances/${id}`);
  }
}
