import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import type {
  CompanyListItem, CompanyDetail, MediaAsset,
  Industry, Club, City, UserContact, CompanyFormValue, CompanyContact, CompanyMediaItem,
} from '../models/manage-company.models';
import { environment } from '../../../../environments/environment';

interface ApiEnvelope<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class ManageCompanyApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.bffApiUrl}/companies`;

  listCompanies(search?: string): Observable<CompanyListItem[]> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    return this.http
      .get<ApiEnvelope<CompanyListItem[]>>(this.base, { params })
      .pipe(map(r => r.data));
  }

  getCompanyById(id: string): Observable<CompanyDetail> {
    return this.http
      .get<ApiEnvelope<CompanyDetail>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  createCompany(form: CompanyFormValue): Observable<CompanyDetail> {
    const payload = this.toApiPayload(form);
    return this.http
      .post<ApiEnvelope<CompanyDetail>>(this.base, payload)
      .pipe(map(r => r.data));
  }

  updateCompany(id: string, form: CompanyFormValue): Observable<CompanyDetail> {
    const payload = this.toApiPayload(form);
    return this.http
      .put<ApiEnvelope<CompanyDetail>>(`${this.base}/${id}`, payload)
      .pipe(map(r => r.data));
  }

  publishCompany(id: string): Observable<CompanyDetail> {
    return this.http
      .post<ApiEnvelope<CompanyDetail>>(`${this.base}/${id}/publish`, {})
      .pipe(map(r => r.data));
  }

  uploadMediaAsset(file: File): Observable<MediaAsset> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .post<ApiEnvelope<MediaAsset>>(`${this.base}/media-assets/upload`, formData)
      .pipe(map(r => r.data));
  }

  listClubs(): Observable<Club[]> {
    return this.http
      .get<ApiEnvelope<Club[]>>(`${this.base}/clubs`)
      .pipe(map(r => r.data));
  }

  listIndustries(): Observable<Industry[]> {
    return this.http
      .get<ApiEnvelope<Industry[]>>(`${this.base}/industries`)
      .pipe(map(r => r.data));
  }

  listCities(): Observable<City[]> {
    return this.http
      .get<ApiEnvelope<City[]>>(`${this.base}/cities`)
      .pipe(map(r => r.data));
  }

  listUsersForContacts(): Observable<UserContact[]> {
    return this.http
      .get<ApiEnvelope<UserContact[]>>(`${this.base}/users`)
      .pipe(map(r => r.data));
  }

  private toApiPayload(form: CompanyFormValue): Record<string, unknown> {
    const clubs: { clubId: string; isParent: boolean }[] = [];
    if (form.parentClubId) clubs.push({ clubId: form.parentClubId, isParent: true });
    if (form.associatedClubId) clubs.push({ clubId: form.associatedClubId, isParent: false });

    return {
      name: form.name,
      industryId: form.industryId,
      cityId: form.cityId,
      companyType: form.companyType,
      establishedYear: form.establishedYear,
      description: form.description,
      whatWeOffer: form.whatWeOffer,
      awardsRecognition: form.awardsRecognition,
      keyProductsServices: form.keyProductsServices,
      recruitmentHighlights: form.recruitmentHighlights,
      placementStats: form.placementStats,
      inquiryEmail: form.inquiryEmail,
      clubs,
      contacts: form.contacts,
      mediaItems: form.mediaItems,
    };
  }
}
