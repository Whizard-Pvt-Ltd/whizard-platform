import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import type {
  InternshipListItem,
  InternshipDetail,
  InternshipFormValue,
  City,
  IndustryRole,
  CompanyListItem,
  CoordinatorUser,
} from '../models/manage-internship.models';
import { environment } from '../../../../environments/environment';
import { AuthContextService } from '../../../core/services/auth-context.service';

interface ApiEnvelope<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class ManageInternshipApiService {
  private readonly http = inject(HttpClient);
  private readonly authCtx = inject(AuthContextService);
  private readonly base = `${environment.bffApiUrl}/internships`;

  private companyHeaders(): { headers?: HttpHeaders } {
    const type = this.authCtx.tenantType();
    const tenantId =
      type === 'COMPANY'
        ? this.authCtx.tenantId()                     // company user → use their own tenant
        : (type === 'ADMIN' || type === 'SYSTEM')
          ? this.authCtx.selectedCompanyTenantId()    // admin/system → use selected company
          : null;
    if (!tenantId) return {};
    return { headers: new HttpHeaders({ 'X-Company-Tenant-Id': tenantId }) };
  }

  listInternships(search?: string, status?: string): Observable<InternshipDetail[]> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    if (status) params['status'] = status;
    return this.http
      .get<ApiEnvelope<InternshipDetail[]>>(this.base, { params, ...this.companyHeaders() })
      .pipe(map(r => r.data));
  }

  getInternshipById(id: string): Observable<InternshipDetail> {
    return this.http
      .get<ApiEnvelope<InternshipDetail>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  createInternship(form: InternshipFormValue): Observable<InternshipDetail> {
    return this.http
      .post<ApiEnvelope<InternshipDetail>>(this.base, form, this.companyHeaders())
      .pipe(map(r => r.data));
  }

  updateInternship(id: string, form: InternshipFormValue): Observable<InternshipDetail> {
    return this.http
      .put<ApiEnvelope<InternshipDetail>>(`${this.base}/${id}`, form)
      .pipe(map(r => r.data));
  }

  publishInternship(id: string): Observable<InternshipDetail> {
    return this.http
      .post<ApiEnvelope<InternshipDetail>>(`${this.base}/${id}/publish`, {})
      .pipe(map(r => r.data));
  }

  archiveInternship(id: string): Observable<InternshipDetail> {
    return this.http
      .post<ApiEnvelope<InternshipDetail>>(`${this.base}/${id}/archive`, {})
      .pipe(map(r => r.data));
  }

  listCities(): Observable<City[]> {
    return this.http
      .get<ApiEnvelope<City[]>>(`${environment.bffApiUrl}/companies/cities`)
      .pipe(map(r => r.data));
  }

  listIndustryRoles(): Observable<IndustryRole[]> {
    return this.http
      .get<ApiEnvelope<IndustryRole[]>>(`${environment.bffApiUrl}/wrcf/roles`)
      .pipe(map(r => r.data));
  }

  listCompaniesForSelector(): Observable<CompanyListItem[]> {
    return this.http
      .get<ApiEnvelope<CompanyListItem[]>>(`${environment.bffApiUrl}/companies`)
      .pipe(map(r => r.data));
  }

  listCoordinators(companyTenantId: string): Observable<CoordinatorUser[]> {
    return this.http
      .get<ApiEnvelope<CoordinatorUser[]>>(`${this.base}/coordinators`, {
        params: { companyTenantId },
      })
      .pipe(map(r => r.data));
  }

  uploadFile(file: File): Observable<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .post<ApiEnvelope<{ url: string; key: string }>>(`${this.base}/files/upload`, formData)
      .pipe(map(r => r.data));
  }
}
