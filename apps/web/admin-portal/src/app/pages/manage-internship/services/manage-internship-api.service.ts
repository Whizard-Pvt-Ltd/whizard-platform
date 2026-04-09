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
  FunctionalGroup,
  PwoItem,
  CapabilityInstanceItem,
  SkillItem,
  TaskItem,
  InternshipPlanItem,
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
      .get<ApiEnvelope<City[]>>(`${environment.bffApiUrl}/companies/cities`, this.companyHeaders())
      .pipe(map(r => r.data));
  }

  listIndustryRoles(): Observable<IndustryRole[]> {
    return this.http
      .get<ApiEnvelope<IndustryRole[]>>(`${this.base}/roles`, this.companyHeaders())
      .pipe(map(r => r.data));
  }

  listCompaniesForSelector(): Observable<CompanyListItem[]> {
    return this.http
      .get<ApiEnvelope<CompanyListItem[]>>(`${environment.bffApiUrl}/companies`)
      .pipe(map(r => r.data));
  }

  listCoordinators(): Observable<CoordinatorUser[]> {
    return this.http
      .get<ApiEnvelope<CoordinatorUser[]>>(`${this.base}/coordinators`, this.companyHeaders())
      .pipe(map(r => r.data));
  }

  listFunctionalGroups(roleId?: string): Observable<FunctionalGroup[]> {
    const opts: Record<string, string> = {};
    if (roleId) opts['roleId'] = roleId;
    return this.http
      .get<ApiEnvelope<FunctionalGroup[]>>(`${this.base}/functional-groups`, { params: opts, ...this.companyHeaders() })
      .pipe(map(r => r.data));
  }

  listPwos(functionalGroupId: string, roleId?: string): Observable<PwoItem[]> {
    const params: Record<string, string> = { functionalGroupId };
    if (roleId) params['roleId'] = roleId;
    return this.http
      .get<ApiEnvelope<PwoItem[]>>(`${this.base}/pwos`, { params, ...this.companyHeaders() })
      .pipe(map(r => r.data));
  }

  listCapabilityInstances(pwoId: string): Observable<CapabilityInstanceItem[]> {
    return this.http
      .get<ApiEnvelope<CapabilityInstanceItem[]>>(`${this.base}/capability-instances`, { params: { pwoId }, ...this.companyHeaders() })
      .pipe(map(r => r.data));
  }

  listSkills(capabilityInstanceId: string): Observable<SkillItem[]> {
    return this.http
      .get<ApiEnvelope<SkillItem[]>>(`${this.base}/skills`, { params: { capabilityInstanceId }, ...this.companyHeaders() })
      .pipe(map(r => r.data));
  }

  listTasks(skillIds: string[]): Observable<TaskItem[]> {
    return this.http
      .get<ApiEnvelope<TaskItem[]>>(`${this.base}/tasks`, { params: { skillIds: skillIds.join(',') }, ...this.companyHeaders() })
      .pipe(map(r => r.data));
  }

  getPlans(internshipId: string): Observable<InternshipPlanItem[]> {
    return this.http
      .get<ApiEnvelope<InternshipPlanItem[]>>(`${this.base}/${internshipId}/plans`, this.companyHeaders())
      .pipe(map(r => r.data));
  }

  savePlans(internshipId: string, plans: Array<{
    pwoId: string;
    capabilityInstanceId: string;
    mentorUserId: string;
    noOfWeeks: number;
    schedules?: Array<{ taskId: string; weekNumber: number; orderIndex: number; evidence: string }>;
  }>): Observable<{ saved: boolean }> {
    return this.http
      .post<ApiEnvelope<{ saved: boolean }>>(`${this.base}/${internshipId}/plans`, { plans }, this.companyHeaders())
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
