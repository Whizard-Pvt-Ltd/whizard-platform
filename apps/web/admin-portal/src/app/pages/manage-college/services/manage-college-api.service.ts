import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import type {
  CollegeListItem, CollegeDetail, MediaAsset,
  Club, DegreeProgram, City, UserContact, CollegeFormValue, CollegeContact, CollegeMediaItem,
} from '../models/manage-college.models';
import { environment } from '../../../../environments/environment';

interface ApiEnvelope<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class ManageCollegeApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.bffApiUrl}/colleges`;

  listColleges(search?: string, status?: number): Observable<{ items: CollegeListItem[]; total: number }> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    if (status !== undefined) params['status'] = String(status);
    return this.http
      .get<ApiEnvelope<{ items: CollegeListItem[]; total: number }>>(this.base, { params })
      .pipe(map(r => r.data));
  }

  getCollegeById(id: string): Observable<CollegeDetail> {
    return this.http
      .get<ApiEnvelope<CollegeDetail>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  createCollege(form: CollegeFormValue): Observable<CollegeDetail> {
    return this.http
      .post<ApiEnvelope<CollegeDetail>>(this.base, form)
      .pipe(map(r => r.data));
  }

  updateCollege(id: string, payload: Partial<CollegeFormValue> & { mediaItems?: CollegeMediaItem[]; contacts?: CollegeContact[] }): Observable<CollegeDetail> {
    return this.http
      .put<ApiEnvelope<CollegeDetail>>(`${this.base}/${id}`, payload)
      .pipe(map(r => r.data));
  }

  publishCollege(id: string): Observable<CollegeDetail> {
    return this.http
      .post<ApiEnvelope<CollegeDetail>>(`${this.base}/${id}/publish`, {})
      .pipe(map(r => r.data));
  }

  uploadMediaAsset(file: File, assetType: 'image' | 'video' | 'pdf'): Observable<MediaAsset> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.http.post<ApiEnvelope<MediaAsset>>(`${this.base}/media-assets/upload`, {
          file: { filename: file.name, mimetype: file.type, data: base64 },
          assetType,
        }).pipe(map(r => r.data)).subscribe(observer);
      };
      reader.readAsDataURL(file);
    });
  }

  listMediaAssets(type?: string): Observable<MediaAsset[]> {
    const params: Record<string, string> = {};
    if (type) params['type'] = type;
    return this.http
      .get<ApiEnvelope<MediaAsset[]>>(`${this.base}/media-assets`, { params })
      .pipe(map(r => r.data));
  }

  listClubs(): Observable<Club[]> {
    return this.http
      .get<ApiEnvelope<Club[]>>(`${this.base}/clubs`)
      .pipe(map(r => r.data));
  }

  listDegreePrograms(): Observable<DegreeProgram[]> {
    return this.http
      .get<ApiEnvelope<DegreeProgram[]>>(`${this.base}/degree-programs`)
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
}
