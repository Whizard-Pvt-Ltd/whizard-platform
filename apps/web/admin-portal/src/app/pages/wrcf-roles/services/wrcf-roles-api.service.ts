import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import type { Department, IndustryRole } from '../models/wrcf-roles.models';
import { environment } from '../../../../environments/environment';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class WrcfRolesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.bffApiUrl}/wrcf`;

  listDepartments(industryId: string): Observable<Department[]> {
    return this.http.get<ApiEnvelope<Department[]>>(`${this.base}/departments?industryId=${industryId}`).pipe(map(r => r.data));
  }

  createDepartment(data: Omit<Department, 'id'>): Observable<Department> {
    return this.http.post<ApiEnvelope<Department>>(`${this.base}/departments`, data).pipe(map(r => r.data));
  }

  updateDepartment(id: string, data: Partial<Omit<Department, 'id' | 'industryId'>>): Observable<Department> {
    return this.http.patch<ApiEnvelope<Department>>(`${this.base}/departments/${id}`, data).pipe(map(r => r.data));
  }

  deleteDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/departments/${id}`);
  }

  listRoles(departmentId: string): Observable<IndustryRole[]> {
    return this.http.get<ApiEnvelope<IndustryRole[]>>(`${this.base}/roles?departmentId=${departmentId}`).pipe(map(r => r.data));
  }

  createRole(data: Omit<IndustryRole, 'id'>): Observable<IndustryRole> {
    return this.http.post<ApiEnvelope<IndustryRole>>(`${this.base}/roles`, data).pipe(map(r => r.data));
  }

  updateRole(id: string, data: Partial<Omit<IndustryRole, 'id' | 'departmentId'>>): Observable<IndustryRole> {
    return this.http.patch<ApiEnvelope<IndustryRole>>(`${this.base}/roles/${id}`, data).pipe(map(r => r.data));
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/roles/${id}`);
  }

  listRoleCIMappings(roleId: string): Observable<{ id: string; capabilityInstanceId: string }[]> {
    return this.http.get<ApiEnvelope<{ id: string; capabilityInstanceId: string }[]>>(
      `${this.base}/role-capability-instances?roleId=${roleId}`
    ).pipe(map(r => r.data));
  }

  saveRoleCIMappings(roleId: string, capabilityInstanceIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.base}/role-capability-instances`, { roleId, capabilityInstanceIds });
  }

  deleteRoleCIMapping(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/role-capability-instances/${id}`);
  }
}
