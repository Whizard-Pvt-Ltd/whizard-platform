import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface SignedUrlProvider {
  getSignedUrl(key: string): Observable<string>;
}

export const SIGNED_URL_PROVIDER = new InjectionToken<SignedUrlProvider>('SIGNED_URL_PROVIDER');
