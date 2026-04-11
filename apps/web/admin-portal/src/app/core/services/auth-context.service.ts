import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import type { TenantOption } from '@whizard/shared-ui';
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
  readonly selectedTenantId = signal<string | null>(null);
  readonly tenantOptions = signal<TenantOption[]>([]);
  readonly isAdmin = computed(() => this.tenantType() === 'SYSTEM');

  setSelectedTenantId(id: string | null): void {
    this.selectedTenantId.set(id);
  }

  reset(): void {
    this.tenantType.set('SYSTEM');
    this.tenantId.set('');
    this.userId.set('');
    this.isLoaded.set(false);
    this.selectedTenantId.set(null);
    this.tenantOptions.set([]);
  }

  load(): Observable<void> {
    return this.http
      .get<ApiEnvelope<MeDto>>(`${environment.bffApiUrl}/api/me`)
      .pipe(
        tap(r => {
          this.tenantType.set(r.data.tenantType ?? 'SYSTEM');
          this.tenantId.set(r.data.tenantId ?? '');
          this.userId.set(r.data.userAccountId ?? '');
          this.isLoaded.set(true);
          if ((r.data.tenantType ?? 'SYSTEM') === 'SYSTEM') {
            this.loadTenants();
          }
        }),
        map(() => undefined),
      );
  }

  private loadTenants(): void {
    this.http
      .get<ApiEnvelope<TenantOption[]>>(`${environment.bffApiUrl}/wrcf/admin/tenants`)
      .subscribe({ next: r => this.tenantOptions.set(r.data ?? []) });
  }
}
