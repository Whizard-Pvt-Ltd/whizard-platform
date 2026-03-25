import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { Department, IndustryRole } from '../models/wrcf-roles.models';

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
    return this.http.get<ApiEnvelope<IndustryRole[]>>(`${this.base}/industry-roles?departmentId=${departmentId}`).pipe(map(r => r.data));
  }

  createRole(data: Omit<IndustryRole, 'id'> & { industryId: string }): Observable<IndustryRole> {
    return this.http.post<ApiEnvelope<IndustryRole>>(`${this.base}/industry-roles`, data).pipe(map(r => r.data));
  }

  updateRole(id: string, data: Partial<Omit<IndustryRole, 'id' | 'departmentId'>>): Observable<IndustryRole> {
    return this.http.patch<ApiEnvelope<IndustryRole>>(`${this.base}/industry-roles/${id}`, data).pipe(map(r => r.data));
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/industry-roles/${id}`);
  }

  saveRoleCIMappings(roleId: string, ciIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.base}/role-ci-mappings`, { roleId, ciIds });
  }

  deleteRoleCIMapping(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/role-ci-mappings/${id}`);
  }
}
