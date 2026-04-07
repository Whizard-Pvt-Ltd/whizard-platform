import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

type TenantType = 'ADMIN' | 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';

interface MeDto {
  userAccountId: string;
  tenantType: TenantType;
  tenantId: string;
  email: string;
}

interface ApiEnvelope<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class AuthContextService {
  private readonly http = inject(HttpClient);

  readonly tenantType = signal<TenantType>('SYSTEM');
  readonly tenantId   = signal<string>('');
  readonly userId     = signal<string>('');
  readonly isLoaded   = signal(false);
  readonly selectedCompanyTenantId = signal<string | null>(null);

  load(): Observable<void> {
    return this.http
      .get<ApiEnvelope<MeDto>>(`${environment.bffApiUrl}/api/me`)
      .pipe(
        tap(r => {
          this.tenantType.set(r.data.tenantType ?? 'SYSTEM');
          this.tenantId.set(r.data.tenantId ?? '');
          this.userId.set(r.data.userAccountId ?? '');
          this.isLoaded.set(true);
        }),
        map(() => undefined),
      );
  }
}
