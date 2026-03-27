import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { WrcfDashboardStats } from '../models/wrcf-dashboard.models';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class WrcfDashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.bffApiUrl}/wrcf`;

  getDashboardStats(industryId: string): Observable<WrcfDashboardStats> {
    return this.http
      .get<ApiEnvelope<WrcfDashboardStats>>(`${this.base}/industries/${industryId}/dashboard-stats`)
      .pipe(map(r => r.data));
  }
}
