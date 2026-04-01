import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import type { WrcfDashboardStats } from '../models/wrcf-dashboard.models';
import { environment } from '../../../../environments/environment';

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
